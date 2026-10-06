import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { aplicarPagamentoMP, estornarPedido } from "@/lib/pedidos";
import { mpConfigurado, pagamentosDaReferencia, type PagamentoMP } from "@/lib/payments/mercadopago";

/* Roda 1x por dia (vercel.json). Para cada pedido do Mercado Pago ainda
   "aguardando pagamento" ha mais de 15 min:
   - se o MP tem pagamento aprovado/estornado que o webhook perdeu, aplica;
   - se passou da validade (72h) sem nada aprovado, cancela o pedido. */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VALIDADE_HORAS = 72;
const PRIORIDADE: Record<PagamentoMP["status"], number> = {
  charged_back: 5, refunded: 4, approved: 3, authorized: 2, in_process: 2, in_mediation: 2, pending: 1, rejected: 0, cancelled: 0,
};

export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!mpConfigurado()) return NextResponse.json({ ok: true, pulado: "mercado pago nao configurado" });

  const db = createAdminClient();
  const quinzeMin = new Date(Date.now() - 15 * 60_000).toISOString();
  const { data: pedidos, error } = await db
    .from("orders")
    .select("id, created_at, payments!inner(gateway)")
    .eq("status", "aguardando_pagamento")
    .eq("payments.gateway", "mercadopago")
    .lt("created_at", quinzeMin)
    .limit(200);
  if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });

  const relatorio: Record<string, string> = {};
  for (const p of pedidos ?? []) {
    try {
      const pgs = await pagamentosDaReferencia(p.id);
      const melhor = pgs.sort((a, b) => PRIORIDADE[b.status] - PRIORIDADE[a.status])[0];

      if (melhor && PRIORIDADE[melhor.status] >= 3) {
        relatorio[p.id] = await aplicarPagamentoMP(melhor);
        continue;
      }
      const vencido = Date.now() - new Date(p.created_at).getTime() > VALIDADE_HORAS * 3600_000;
      const emAndamento = melhor && PRIORIDADE[melhor.status] === 2;
      relatorio[p.id] = vencido && !emAndamento ? await estornarPedido(p.id, "recusado") : "aguardando";
    } catch (e) {
      relatorio[p.id] = "erro: " + (e instanceof Error ? e.message : String(e));
    }
  }

  return NextResponse.json({ ok: true, verificados: pedidos?.length ?? 0, relatorio });
}
