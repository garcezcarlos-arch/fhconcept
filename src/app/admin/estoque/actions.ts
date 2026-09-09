"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function ajustarEstoque(dados: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("nao autenticado");

  const variantId = String(dados.get("variant_id"));
  const delta = Number(String(dados.get("delta") ?? "0").replace(",", "."));
  const observacao = String(dados.get("observacao") ?? "").trim() || "ajuste manual";
  if (!variantId || !Number.isFinite(delta) || delta === 0) return;

  const db = createAdminClient();
  let { data: local } = await db.from("stock_locations").select("id").eq("vendavel", true).limit(1).maybeSingle();
  if (!local) {
    const { data: novo } = await db.from("stock_locations").insert({ nome: "Salão", vendavel: true }).select("id").single();
    local = novo;
  }
  if (!local) return;

  await db.from("inventory_movements").insert({ location_id: local.id, variant_id: variantId, tipo: "ajuste", quantidade: delta, observacao, created_by: user.id });
  const { data: inv } = await db.from("inventory").select("quantidade").eq("location_id", local.id).eq("variant_id", variantId).maybeSingle();
  if (inv) await db.from("inventory").update({ quantidade: inv.quantidade + delta }).eq("location_id", local.id).eq("variant_id", variantId);
  else await db.from("inventory").insert({ location_id: local.id, variant_id: variantId, quantidade: delta });

  revalidatePath("/admin/estoque");
}
