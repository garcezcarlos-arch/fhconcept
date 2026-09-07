"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro?: string };

export async function criarNota(
  _anterior: EstadoForm,
  dados: FormData,
): Promise<EstadoForm> {
  const supabase = await createClient();

  const fornecedor = String(dados.get("fornecedor") ?? "").trim();
  const cnpj = String(dados.get("cnpj") ?? "").trim();
  const numero = String(dados.get("numero") ?? "").trim();
  const serie = String(dados.get("serie") ?? "").trim();
  const data = String(dados.get("data_emissao") ?? "").trim();
  const valor = String(dados.get("valor_total") ?? "").trim();
  const chave = String(dados.get("chave_nfe") ?? "").replace(/\D/g, "");

  if (!fornecedor) return { erro: "Informe o fornecedor." };
  if (!numero) return { erro: "Informe o numero da nota." };
  if (!data) return { erro: "Informe a data de emissao." };
  if (chave && chave.length !== 44) {
    return { erro: "A chave da NF-e tem 44 digitos. Deixe em branco se nao tiver." };
  }

  // fornecedor: reaproveita se ja existir, cria se for novo
  const { data: existente } = await supabase
    .from("suppliers")
    .select("id")
    .ilike("nome", fornecedor)
    .maybeSingle();

  let supplierId = existente?.id;

  if (!supplierId) {
    const { data: novo, error } = await supabase
      .from("suppliers")
      .insert({ nome: fornecedor, cnpj: cnpj || null })
      .select("id")
      .single();
    if (error) return { erro: `Nao foi possivel salvar o fornecedor: ${error.message}` };
    supplierId = novo.id;
  }

  const { error } = await supabase.from("nota_entrada").insert({
    supplier_id: supplierId,
    numero,
    serie: serie || null,
    data_emissao: data,
    valor_total: valor ? Number(valor.replace(",", ".")) : null,
    chave_nfe: chave || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { erro: "Essa nota ja foi lancada para este fornecedor." };
    }
    return { erro: error.message };
  }

  revalidatePath("/admin/notas");
  redirect("/admin/notas");
}
