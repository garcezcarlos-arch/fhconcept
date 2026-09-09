import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/* Marca o pagamento como aprovado, o pedido como pago e baixa o estoque.
   Idempotente: se o pedido ja estiver pago, nao repete a baixa. */
export async function confirmarPagamento(orderId: string, extra?: { gateway_payment_id?: string; raw?: unknown }) {
  const db = createAdminClient();

  const { data: pedido } = await db.from("orders").select("id, status").eq("id", orderId).single();
  if (!pedido) return { ok: false, motivo: "pedido nao encontrado" };
  if (pedido.status !== "aguardando_pagamento") return { ok: true, motivo: "ja processado" };

  await db.from("payments")
    .update({ status: "aprovado", pago_em: new Date().toISOString(), ...(extra?.gateway_payment_id ? { gateway_payment_id: extra.gateway_payment_id } : {}), ...(extra?.raw !== undefined ? { raw: extra.raw as never } : {}) })
    .eq("order_id", orderId);

  await db.from("orders").update({ status: "pago" }).eq("id", orderId);

  // baixa de estoque no primeiro local vendavel
  const { data: local } = await db.from("stock_locations").select("id").eq("vendavel", true).limit(1).maybeSingle();
  if (!local) return { ok: true, motivo: "sem local de estoque" };

  const { data: itens } = await db.from("order_items").select("variant_id, quantidade").eq("order_id", orderId);
  for (const it of itens ?? []) {
    await db.from("inventory_movements").insert({
      location_id: local.id, variant_id: it.variant_id, tipo: "venda", quantidade: -it.quantidade, order_id: orderId, observacao: "venda pelo site",
    });
    const { data: inv } = await db.from("inventory").select("quantidade").eq("location_id", local.id).eq("variant_id", it.variant_id).maybeSingle();
    if (inv) {
      await db.from("inventory").update({ quantidade: inv.quantidade - it.quantidade }).eq("location_id", local.id).eq("variant_id", it.variant_id);
    } else {
      await db.from("inventory").insert({ location_id: local.id, variant_id: it.variant_id, quantidade: -it.quantidade });
    }
  }
  return { ok: true };
}
