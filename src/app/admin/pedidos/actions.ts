"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { confirmarPagamento } from "@/lib/pedidos";

async function exigirStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("nao autenticado");
  const { data: perfil } = await supabase.from("profiles").select("papel").eq("id", user.id).single();
  if (!perfil || !["admin", "vendedor", "operacao"].includes(perfil.papel)) throw new Error("sem permissao");
  return supabase;
}

export async function mudarStatus(dados: FormData) {
  const supabase = await exigirStaff();
  const id = String(dados.get("id"));
  const status = String(dados.get("status")) as "aguardando_pagamento" | "pago" | "em_separacao" | "enviado" | "pronto_retirada" | "concluido" | "cancelado" | "estornado";
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/pedidos");
}

export async function confirmarPagamentoManual(dados: FormData) {
  await exigirStaff();
  await confirmarPagamento(String(dados.get("id")));
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/estoque");
}
