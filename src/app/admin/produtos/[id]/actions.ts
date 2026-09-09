"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoEdicao = { erro?: string; ok?: string };

export async function salvarProduto(_: EstadoEdicao, dados: FormData): Promise<EstadoEdicao> {
  const supabase = await createClient();
  const id = String(dados.get("id"));

  const { error } = await supabase.from("products").update({
    nome: String(dados.get("nome") ?? "").trim(),
    descricao_curta: String(dados.get("descricao_curta") ?? "").trim() || null,
    descricao: String(dados.get("descricao") ?? "").trim() || null,
    modo_uso: String(dados.get("modo_uso") ?? "").trim() || null,
    destaque: dados.get("destaque") === "on",
  }).eq("id", id);
  if (error) return { erro: error.message };

  const variantes: { id: string; preco: string; preco_promocional: string; ativo: boolean }[] = JSON.parse(String(dados.get("variantes") ?? "[]"));
  for (const v of variantes) {
    const preco = Number(v.preco.replace(",", "."));
    const promo = v.preco_promocional.trim() ? Number(v.preco_promocional.replace(",", ".")) : null;
    if (!Number.isFinite(preco)) return { erro: "Preço inválido." };
    const { error: ev } = await supabase.from("product_variants").update({ preco, preco_promocional: promo, ativo: v.ativo }).eq("id", v.id);
    if (ev) return { erro: ev.message };
  }

  revalidatePath("/admin/produtos"); revalidatePath("/loja");
  return { ok: "Salvo." };
}

export async function mudarStatusProduto(_: EstadoEdicao, dados: FormData): Promise<EstadoEdicao> {
  const supabase = await createClient();
  const id = String(dados.get("id"));
  const status = String(dados.get("status")) as "rascunho" | "revisao" | "ativo" | "pausado" | "arquivado";

  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) {
    const msg = /nfe|nf-e|nota/i.test(error.message)
      ? "Não dá para publicar ainda: a emissão de NF-e não está configurada para o salão. Isso é uma regra do banco (vendors.emite_nfe). Quando a contadora confirmar, o campo é liberado e a publicação passa."
      : error.message;
    return { erro: msg };
  }
  revalidatePath("/admin/produtos"); revalidatePath("/loja"); revalidatePath(`/admin/produtos/${id}`);
  return { ok: status === "ativo" ? "Produto no ar." : "Situação atualizada." };
}
