"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { exigirAdmin } from "@/lib/admin-auth";
import { PROFISSIONAIS } from "@/lib/salao";

// O navegador le o CSV e manda so os campos que o portal guarda. Aqui nada do
// que chega e confiavel: cada linha e conferida de novo antes de gravar.

export type Resposta = { ok: true; gravados: number } | { ok: false; erro: string };
export type Recalculo = { ok: true; meses: number; clientes: number; retrato: boolean } | { ok: false; erro: string };

const LOTE = 600;
const MAX_AGENDA = 6000;

type Reg = Record<string, unknown>;
const reg = (v: unknown): v is Reg => typeof v === "object" && v !== null && !Array.isArray(v);
const int = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : null);
const num = (v: unknown, min = -1e7, max = 1e7) => (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? Math.round(v * 100) / 100 : null);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const dia = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) ? v : null);
const hora = (v: unknown) => (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null);
const fone = (v: unknown) => (typeof v === "string" && /^\d{12,15}$/.test(v) ? v : null);

async function entrada(linhas: unknown, max: number): Promise<{ erro: string } | { lista: Reg[] }> {
  try {
    await exigirAdmin();
  } catch {
    return { erro: "Só administradoras podem importar. Entre de novo no portal." };
  }
  if (!Array.isArray(linhas) || linhas.length === 0) return { erro: "Nenhuma linha recebida." };
  if (linhas.length > max) return { erro: `Lote grande demais (${linhas.length} linhas).` };
  if (!linhas.every(reg)) return { erro: "Formato inesperado." };
  return { lista: linhas };
}

const falha = (mensagem: string): Resposta => ({ ok: false, erro: mensagem });

/** origem "clientes": arquivo de clientes, substitui o cadastro. origem "agenda":
    clientes vistas no arquivo da agenda; entram so se ainda nao existirem. */
export async function importarClientes(linhas: unknown, origem: "clientes" | "agenda"): Promise<Resposta> {
  const e = await entrada(linhas, LOTE);
  if ("erro" in e) return falha(e.erro);
  if (origem !== "clientes" && origem !== "agenda") return falha("Origem inválida.");

  const agora = new Date().toISOString();
  const validas = [];
  for (const l of e.lista) {
    const codigo = int(l.codigo, 1, 2_000_000_000);
    const nome = str(l.nome, 120);
    if (codigo === null || !nome) continue;
    validas.push({
      gendo_codigo: codigo,
      nome,
      telefone: fone(l.telefone),
      nasc_dia: int(l.nascDia, 1, 31),
      nasc_mes: int(l.nascMes, 1, 12),
      nasc_ano: int(l.nascAno, 1900, 2100),
      visitas: int(l.visitas, 0, 100_000) ?? 0,
      ultima_visita: dia(l.ultimaVisita),
      origem,
      atualizado_em: agora,
    });
  }
  if (!validas.length) return falha("Nenhuma cliente válida no lote.");

  const db = createAdminClient();
  const { error, count } = await db.from("salao_clientes").upsert(validas, { onConflict: "gendo_codigo", ignoreDuplicates: origem === "agenda", count: "exact" });
  return error ? falha(error.message) : { ok: true, gravados: count ?? validas.length };
}

/** Troca a agenda do periodo [de, ate] pelo conteudo do arquivo, tudo ou nada. */
export async function importarAgenda(de: unknown, ate: unknown, linhas: unknown): Promise<Resposta> {
  const e = await entrada(linhas, MAX_AGENDA);
  if ("erro" in e) return falha(e.erro);
  const inicio = dia(de);
  const fim = dia(ate);
  if (!inicio || !fim || fim < inicio) return falha("Período da agenda inválido.");

  const validas = [];
  for (const l of e.lista) {
    const data = dia(l.data);
    const status = str(l.status, 40);
    if (!data || !status || data < inicio || data > fim) continue;
    validas.push({ cliente: int(l.cliente, 1, 2_000_000_000), data, inicio: hora(l.inicio), fim: hora(l.fim), status, categoria: str(l.categoria, 80), servico: str(l.servico, 160), profissional: str(l.profissional, 80) });
  }
  if (!validas.length) return falha("Nenhum agendamento válido no arquivo.");

  const db = createAdminClient();
  const { data, error } = await db.rpc("fn_salao_importar_agenda", { p_de: inicio, p_ate: fim, p_linhas: validas });
  return error ? falha(error.message) : { ok: true, gravados: data ?? validas.length };
}

export async function importarComandas(linhas: unknown): Promise<Resposta> {
  const e = await entrada(linhas, LOTE);
  if ("erro" in e) return falha(e.erro);
  const agora = new Date().toISOString();
  const validas = [];
  for (const l of e.lista) {
    const numero = int(l.numero, 1, 2_000_000_000);
    const data = dia(l.data);
    const status = str(l.status, 40);
    if (numero === null || !data || !status) continue;
    validas.push({ numero, data, valor: num(l.valor) ?? 0, desconto: num(l.desconto) ?? 0, saldo: num(l.saldo) ?? 0, status, pagamento: str(l.pagamento, 1200) || null, servicos: str(l.servicos, 1200) || null, atualizado_em: agora });
  }
  if (!validas.length) return falha("Nenhuma comanda válida no lote.");
  const { error } = await createAdminClient().from("salao_comandas").upsert(validas, { onConflict: "numero" });
  return error ? falha(error.message) : { ok: true, gravados: validas.length };
}

export async function importarServicos(linhas: unknown): Promise<Resposta> {
  const e = await entrada(linhas, LOTE);
  if ("erro" in e) return falha(e.erro);
  const agora = new Date().toISOString();
  const validas = [];
  for (const l of e.lista) {
    const codigo = int(l.codigo, 1, 2_000_000_000);
    const nome = str(l.nome, 160);
    if (codigo === null || !nome) continue;
    validas.push({ gendo_codigo: codigo, nome, categoria: str(l.categoria, 80) || null, preco: num(l.preco, 0) ?? 0, comissao: num(l.comissao, 0), duracao_min: int(l.duracaoMin, 0, 1440), atualizado_em: agora });
  }
  if (!validas.length) return falha("Nenhum serviço válido no lote.");
  const { error } = await createAdminClient().from("salao_servicos").upsert(validas, { onConflict: "gendo_codigo" });
  return error ? falha(error.message) : { ok: true, gravados: validas.length };
}

export async function importarProdutos(linhas: unknown): Promise<Resposta> {
  const e = await entrada(linhas, LOTE);
  if ("erro" in e) return falha(e.erro);
  const agora = new Date().toISOString();
  const validas = [];
  for (const l of e.lista) {
    const codigo = int(l.codigo, 1, 2_000_000_000);
    const nome = str(l.nome, 160);
    if (codigo === null || !nome) continue;
    validas.push({ gendo_codigo: codigo, nome, categoria: str(l.categoria, 80) || null, preco: num(l.preco, 0) ?? 0, custo: num(l.custo, 0), quantidade: int(l.quantidade, -100_000, 1_000_000), comissao: num(l.comissao, 0), atualizado_em: agora });
  }
  if (!validas.length) return falha("Nenhum produto válido no lote.");
  const { error } = await createAdminClient().from("salao_produtos").upsert(validas, { onConflict: "gendo_codigo" });
  return error ? falha(error.message) : { ok: true, gravados: validas.length };
}

/** Refaz visitas das clientes, numeros por mes e (com a base completa) o retrato de hoje. */
export async function recalcular(): Promise<Recalculo> {
  try {
    await exigirAdmin();
  } catch {
    return { ok: false, erro: "Só administradoras podem importar." };
  }
  const { data, error } = await createAdminClient().rpc("fn_salao_recalcular", { p_ativas: [...PROFISSIONAIS] });
  if (error) return { ok: false, erro: error.message };
  for (const rota of ["/admin", "/admin/salao", "/admin/salao/clientes", "/admin/salao/servicos", "/admin/salao/produtos", "/admin/salao/importar"]) revalidatePath(rota);
  const r = (data ?? {}) as { meses?: number; clientes?: number; retrato?: boolean };
  return { ok: true, meses: r.meses ?? 0, clientes: r.clientes ?? 0, retrato: r.retrato ?? false };
}
