import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { aplicarPagamentoMP } from "@/lib/pedidos";
import { assinaturaValida, buscarPagamento, mpConfigurado } from "@/lib/payments/mercadopago";
import type { Json } from "@/lib/supabase/types";

/* Fluxo: registra o evento -> confere a assinatura -> busca o pagamento na API
   (nunca confia no corpo da notificacao) -> aplica no banco.
   Responde 200 ao que ja foi tratado e 500 ao que falhou, para o MP reenviar. */
export async function POST(req: Request) {
  if (!mpConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });

  const url = new URL(req.url);
  let corpo: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try { corpo = await req.json(); } catch {}

  const tipo = corpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const idQuery = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const id = idQuery ?? (corpo.data?.id != null ? String(corpo.data.id) : null);

  const db = createAdminClient();
  const assinatura = assinaturaValida(req, idQuery ?? id);

  const { data: evento } = await db.from("payment_events").insert({
    gateway: "mercadopago",
    tipo,
    recurso_id: id,
    assinatura_ok: assinatura,
    payload: { corpo, query: Object.fromEntries(url.searchParams) } as unknown as Json,
  }).select("id").single();

  const registrar = (resultado: string, erro?: string) =>
    evento ? db.from("payment_events").update({ resultado, erro: erro ?? null }).eq("id", evento.id) : null;

  if (assinatura === false) {
    await registrar("assinatura_invalida");
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (tipo !== "payment" || !id) {
    await registrar("ignorado");
    return NextResponse.json({ ok: true, ignorado: true });
  }

  try {
    const pg = await buscarPagamento(id);
    const resultado = await aplicarPagamentoMP(pg);
    await registrar(resultado);
    return NextResponse.json({ ok: true, resultado });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await registrar("erro", msg);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
