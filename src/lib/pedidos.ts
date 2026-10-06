import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmarInscricao } from "@/lib/inscricoes";
import { traduzirStatus, type PagamentoMP } from "@/lib/payments/mercadopago";
import type { Json } from "@/lib/supabase/types";

/* Pago + baixa de estoque, numa transacao so no banco (fn_confirmar_pagamento).
   Idempotente e seguro contra webhooks simultaneos. */
export async function confirmarPagamento(orderId: string, extra?: { gateway_payment_id?: string; parcelas?: number; raw?: unknown }) {
  const db = createAdminClient();
  const { data, error } = await db.rpc("fn_confirmar_pagamento", {
    p_order_id: orderId,
    p_gateway_payment_id: extra?.gateway_payment_id,
    p_parcelas: extra?.parcelas,
    p_raw: extra?.raw as Json | undefined,
  });
  if (error) throw new Error(`confirmar pagamento ${orderId}: ${error.message}`);
  return data;
}

/* Estorno, chargeback ou recusa. Devolve ao estoque o que ainda esta no salao. */
export async function estornarPedido(orderId: string, status: "estornado" | "chargeback" | "recusado" = "estornado", raw?: unknown) {
  const db = createAdminClient();
  const { data, error } = await db.rpc("fn_estornar_pedido", {
    p_order_id: orderId,
    p_status_pagamento: status,
    p_raw: raw as Json | undefined,
  });
  if (error) throw new Error(`estornar pedido ${orderId}: ${error.message}`);
  return data;
}

/* Ponto unico onde um pagamento do Mercado Pago vira estado no nosso banco.
   Usado pelo webhook e pela reconciliacao diaria. */
export async function aplicarPagamentoMP(pg: PagamentoMP): Promise<string> {
  const ref = pg.external_reference ? String(pg.external_reference) : "";
  if (!ref) return "sem_referencia";

  if (ref.startsWith("inscricao:")) {
    if (pg.status !== "approved") return "inscricao_" + pg.status;
    await confirmarInscricao(ref.slice("inscricao:".length), String(pg.id));
    return "inscricao_confirmada";
  }

  const status = traduzirStatus(pg.status);
  switch (status) {
    case "aprovado":
      return confirmarPagamento(ref, { gateway_payment_id: String(pg.id), parcelas: pg.installments, raw: pg });
    case "estornado":
    case "chargeback":
      return estornarPedido(ref, status, pg);
    case "recusado":
      // cartao recusado: a cliente pode tentar de novo no mesmo link. O detalhe
      // fica no payment_events; o pedido segue aguardando ate a validade.
      return "recusado_" + (pg.status_detail ?? pg.status);
    default:
      return "pendente";
  }
}
