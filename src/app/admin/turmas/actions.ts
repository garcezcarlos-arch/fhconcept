"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmarInscricao } from "@/lib/inscricoes";

export type EstadoTurma = { erro?: string };

async function exigirStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("nao autenticado");
  const { data: perfil } = await supabase.from("profiles").select("papel").eq("id", user.id).single();
  if (!perfil || !["admin", "vendedor", "operacao"].includes(perfil.papel)) throw new Error("sem permissao");
  return supabase;
}

function lerTurma(dados: FormData) {
  const n = (k: string) => Number(String(dados.get(k) ?? "").replace(",", "."));
  const sinal = String(dados.get("sinal") ?? "").trim();
  return {
    formato: String(dados.get("formato") ?? "turma"),
    nome: String(dados.get("nome") ?? "").trim(),
    descricao: String(dados.get("descricao") ?? "").trim() || null,
    data_inicio: String(dados.get("data_inicio") ?? ""),
    data_fim: String(dados.get("data_fim") ?? "") || null,
    horario: String(dados.get("horario") ?? "").trim() || null,
    vagas: Math.max(1, Math.round(n("vagas") || 8)),
    preco: n("preco"),
    sinal: sinal ? Number(sinal.replace(",", ".")) : null,
    status: String(dados.get("status") ?? "rascunho"),
  };
}

export async function salvarTurma(_: EstadoTurma, dados: FormData): Promise<EstadoTurma> {
  const supabase = await exigirStaff();
  const id = String(dados.get("id") ?? "");
  const t = lerTurma(dados);
  if (!t.nome || !t.data_inicio || !Number.isFinite(t.preco)) return { erro: "Nome, data de início e preço são obrigatórios." };

  if (id) {
    const { error } = await supabase.from("turmas").update(t).eq("id", id);
    if (error) return { erro: error.message };
  } else {
    const { error } = await supabase.from("turmas").insert(t);
    if (error) return { erro: error.message };
  }
  revalidatePath("/admin/turmas"); revalidatePath("/formacoes");
  redirect("/admin/turmas");
}

export async function mudarStatusInscricao(dados: FormData) {
  await exigirStaff();
  const db = createAdminClient();
  const id = String(dados.get("id")); const status = String(dados.get("status"));
  if (status === "confirmada") await confirmarInscricao(id);
  else await db.from("inscricoes").update({ status }).eq("id", id);
  revalidatePath("/admin/turmas"); revalidatePath("/formacoes");
}
