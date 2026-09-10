"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type EstadoLista = { erro?: string; ok?: boolean };
const soDigitos = (s: string) => s.replace(/\D/g, "");

export async function entrarNaLista(_: EstadoLista, dados: FormData): Promise<EstadoLista> {
  const nome = String(dados.get("nome") ?? "").trim();
  const telefone = soDigitos(String(dados.get("telefone") ?? ""));
  const formato = String(dados.get("formato") ?? "turma");
  const cidade = String(dados.get("cidade") ?? "").trim() || null;
  const experiencia = String(dados.get("experiencia") ?? "").trim() || null;
  if (!nome || telefone.length < 10) return { erro: "Preencha nome e WhatsApp." };

  const db = createAdminClient();
  const { error } = await db.from("inscricoes").insert({ formato, nome, telefone, cidade, experiencia, status: "lista_espera", valor: 0, gateway: "manual" });
  if (error) return { erro: "Não foi possível registrar. Tente de novo." };
  return { ok: true };
}
