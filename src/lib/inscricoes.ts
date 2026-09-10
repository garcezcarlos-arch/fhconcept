import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/* Confirma a inscricao (pagamento aprovado). Idempotente. */
export async function confirmarInscricao(id: string, gatewayPaymentId?: string) {
  const db = createAdminClient();
  const { data: i } = await db.from("inscricoes").select("id, status").eq("id", id).maybeSingle();
  if (!i) return { ok: false };
  if (i.status === "confirmada") return { ok: true };
  await db.from("inscricoes").update({
    status: "confirmada", pago_em: new Date().toISOString(), ...(gatewayPaymentId ? { gateway_payment_id: gatewayPaymentId } : {}),
  }).eq("id", id);
  return { ok: true };
}
