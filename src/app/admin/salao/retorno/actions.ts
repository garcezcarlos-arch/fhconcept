"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { exigirAdmin } from "@/lib/admin-auth";
import { CHAVE_MENSAGEM, MAX_MENSAGEM, RESULTADOS } from "@/lib/retorno";

const ROTA = "/admin/salao/retorno";

function voltar(aba: string, aviso?: string): never {
  revalidatePath(ROTA);
  revalidatePath("/admin");
  const u = new URLSearchParams();
  if (aba) u.set("aba", aba);
  if (aviso) u.set("aviso", aviso);
  const s = u.toString();
  redirect(s ? `${ROTA}?${s}` : ROTA);
}

const aba = (dados: FormData) => {
  const a = String(dados.get("aba") ?? "");
  return ["chamadas", "nao"].includes(a) ? a : "";
};
const codigo = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n <= 2_000_000_000 ? n : null;
};

/** Chamado pelo botao do WhatsApp: anota que a cliente foi chamada agora. */
export async function registrarContato(clienteCodigo: unknown): Promise<{ ok: boolean }> {
  let perfil;
  try {
    perfil = await exigirAdmin();
  } catch {
    return { ok: false };
  }
  const cod = codigo(clienteCodigo);
  if (cod === null) return { ok: false };

  const db = createAdminClient();
  // clique dobrado: um contato por cliente a cada 10 minutos
  const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recente } = await db.from("salao_contatos").select("id").eq("cliente_codigo", cod).eq("motivo", "retorno").gte("feito_em", desde).limit(1);
  if (!recente?.length) {
    const { error } = await db.from("salao_contatos").insert({ cliente_codigo: cod, motivo: "retorno", resultado: "chamada", feito_por: perfil.nome || null });
    if (error) return { ok: false };
  }
  revalidatePath(ROTA);
  revalidatePath("/admin");
  return { ok: true };
}

export async function marcarResultado(dados: FormData) {
  await exigirAdmin();
  const id = codigo(dados.get("contato"));
  const resultado = String(dados.get("resultado") ?? "");
  if (id === null || !(resultado in RESULTADOS)) voltar(aba(dados), "Escolha o resultado.");
  const { error } = await createAdminClient().from("salao_contatos").update({ resultado }).eq("id", id);
  voltar(aba(dados), error ? `Não foi possível salvar: ${error.message}` : undefined);
}

/** Liga ou desliga o "nao chamar" da cliente. */
export async function alternarNaoChamar(dados: FormData) {
  await exigirAdmin();
  const cod = codigo(dados.get("cliente"));
  const valor = String(dados.get("valor")) === "true";
  if (cod === null) voltar(aba(dados), "Cliente inválida.");
  const { error } = await createAdminClient().from("salao_clientes").update({ nao_contatar: valor }).eq("gendo_codigo", cod);
  voltar(aba(dados), error ? `Não foi possível salvar: ${error.message}` : valor ? "Cliente marcada para não receber mensagens." : "Cliente voltou para a lista.");
}

export async function salvarMensagem(dados: FormData) {
  await exigirAdmin();
  const texto = String(dados.get("mensagem") ?? "").replace(/\r\n/g, "\n").trim();
  if (texto.length < 10) voltar(aba(dados), "A mensagem está curta demais.");
  if (texto.length > MAX_MENSAGEM) voltar(aba(dados), `A mensagem passa de ${MAX_MENSAGEM} caracteres.`);
  const { error } = await createAdminClient().from("salao_config").upsert({ chave: CHAVE_MENSAGEM, valor: texto, atualizado_em: new Date().toISOString() }, { onConflict: "chave" });
  voltar(aba(dados), error ? `Não foi possível salvar: ${error.message}` : "Mensagem salva.");
}
