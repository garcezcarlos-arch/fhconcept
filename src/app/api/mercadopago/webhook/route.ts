import { NextResponse } from "next/server";
import { confirmarPagamento } from "@/lib/pedidos";

export async function POST(req: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ ok: false }, { status: 503 });

  const url = new URL(req.url);
  let corpo: { type?: string; action?: string; data?: { id?: string } } = {};
  try { corpo = await req.json(); } catch {}

  const tipo = corpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
  if (tipo !== "payment" || !id) return NextResponse.json({ ok: true, ignorado: true });

  const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return NextResponse.json({ ok: false }, { status: 200 });
  const pg = await r.json();

  if (pg.status === "approved" && pg.external_reference) {
    await confirmarPagamento(String(pg.external_reference), { gateway_payment_id: String(pg.id), raw: pg });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
