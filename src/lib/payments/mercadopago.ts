import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/* Tudo que fala com o Mercado Pago fica aqui. Trocar de gateway = trocar este arquivo. */

const API = "https://api.mercadopago.com";

export function mpConfigurado() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function token() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente");
  return t;
}

async function mp<T>(caminho: string, init?: RequestInit & { idempotencia?: string }): Promise<T> {
  const r = await fetch(`${API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.idempotencia ? { "X-Idempotency-Key": init.idempotencia } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const corpo = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${JSON.stringify(corpo)?.slice(0, 300)}`);
  return corpo as T;
}

/* ---------- tipos minimos do que usamos ---------- */

export type PagamentoMP = {
  id: number;
  status: "pending" | "approved" | "authorized" | "in_process" | "in_mediation" | "rejected" | "cancelled" | "refunded" | "charged_back";
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount: number;
  installments?: number;
  payment_type_id?: string;
  date_approved?: string | null;
};

export type StatusInterno = "aprovado" | "pendente" | "recusado" | "estornado" | "chargeback";

export function traduzirStatus(s: PagamentoMP["status"]): StatusInterno {
  switch (s) {
    case "approved": return "aprovado";
    case "refunded": return "estornado";
    case "charged_back": return "chargeback";
    case "rejected":
    case "cancelled": return "recusado";
    default: return "pendente"; // pending, in_process, authorized, in_mediation
  }
}

/* ---------- checkout ---------- */

export type ItemPreferencia = { id: string; title: string; quantity: number; unit_price: number };

export async function criarPreferencia(p: {
  referencia: string;
  itens: ItemPreferencia[];
  pagador: { nome: string; email?: string | null; telefone: string };
  metodo: "pix" | "cartao_credito" | "boleto";
  urlBase: string;
  retorno: string;              // caminho de volta, ex: /loja/pedido/<id>
  validadeHoras?: number;
}) {
  const expira = new Date(Date.now() + (p.validadeHoras ?? 48) * 3600_000).toISOString();
  const corpo = {
    items: p.itens.map((i) => ({ ...i, unit_price: Number(i.unit_price.toFixed(2)), currency_id: "BRL" })),
    payer: {
      name: p.pagador.nome,
      email: p.pagador.email ?? undefined,
      phone: { area_code: p.pagador.telefone.slice(0, 2), number: p.pagador.telefone.slice(2) },
    },
    external_reference: p.referencia,
    notification_url: `${p.urlBase}/api/mercadopago/webhook`,
    back_urls: {
      success: `${p.urlBase}${p.retorno}?retorno=sucesso`,
      pending: `${p.urlBase}${p.retorno}?retorno=pendente`,
      failure: `${p.urlBase}${p.retorno}?retorno=falha`,
    },
    auto_return: "approved",
    statement_descriptor: "FH CONCEPT",
    expires: true,
    expiration_date_to: expira,
    date_of_expiration: expira, // Pix e boleto
    payment_methods: p.metodo === "pix"
      ? { excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }] }
      : { excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }], installments: 6 },
  };
  const j = await mp<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(corpo),
    idempotencia: `pref-${p.referencia}`,
  });
  return { preferenceId: j.id, url: j.init_point };
}

/* ---------- consulta ---------- */

export function buscarPagamento(id: string) {
  return mp<PagamentoMP>(`/v1/payments/${encodeURIComponent(id)}`);
}

/* Todos os pagamentos de um pedido (para reconciliacao). */
export async function pagamentosDaReferencia(referencia: string) {
  const q = new URLSearchParams({ external_reference: referencia, sort: "date_created", criteria: "desc" });
  const j = await mp<{ results: PagamentoMP[] }>(`/v1/payments/search?${q}`);
  return j.results ?? [];
}

/* ---------- estorno ---------- */

export function estornarPagamento(id: string) {
  return mp<{ id: number; status: string }>(`/v1/payments/${encodeURIComponent(id)}/refunds`, {
    method: "POST",
    body: "{}",
    idempotencia: `refund-${id}`,
  });
}

/* ---------- assinatura do webhook ----------
   Manifesto oficial: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
   Partes ausentes sao omitidas. HMAC-SHA256 em hex com a "assinatura secreta"
   do painel (Webhooks > Configurar notificacoes).
   Retorna null quando o segredo nao esta configurado. */
export function assinaturaValida(req: Request, dataId: string | null): boolean | null {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!segredo) return null;

  const header = req.headers.get("x-signature");
  if (!header) return false;
  const partes = Object.fromEntries(
    header.split(",").map((p) => p.split("=").map((s) => s.trim()) as [string, string]),
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const requestId = req.headers.get("x-request-id");
  let manifesto = "";
  if (dataId) manifesto += `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};`;
  if (requestId) manifesto += `request-id:${requestId};`;
  manifesto += `ts:${ts};`;

  const esperado = createHmac("sha256", segredo).update(manifesto).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
