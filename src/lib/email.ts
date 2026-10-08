import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";
import { reais } from "@/lib/preco";

/* E-mails transacionais pelo Resend (API HTTP, sem SDK).
   Sem RESEND_API_KEY nada e enviado e nada quebra: as funcoes so registram no log.
   Envio nunca derruba o fluxo de pedido/pagamento — erros viram console.error. */

const API = "https://api.resend.com/emails";

export function emailConfigurado() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_REMETENTE);
}

async function enviar(para: string | string[], assunto: string, html: string, idempotencia: string) {
  if (!emailConfigurado()) {
    console.info(`[email desligado] ${assunto} -> ${para}`);
    return;
  }
  const r = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      // o Resend ignora reenvio com a mesma chave por 24h: webhook repetido nao duplica e-mail
      "Idempotency-Key": idempotencia,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_REMETENTE, // ex: "FH Concept <loja@fhconcept.com.br>"
      to: para,
      subject: assunto,
      html,
      ...(process.env.EMAIL_LOJA ? { reply_to: process.env.EMAIL_LOJA } : {}),
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

/* ---------- dados do pedido ---------- */

async function carregarPedido(orderId: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, numero, status, subtotal, frete_total, total, observacoes, customers(nome, telefone, email), addresses(logradouro, numero, complemento, bairro, cidade, uf, cep), order_items(produto_nome, variante_nome, quantidade, total_linha), order_shipments(tipo, transportadora), payments(metodo, gateway, parcelas)")
    .eq("id", orderId)
    .maybeSingle();
  return data;
}
type Pedido = NonNullable<Awaited<ReturnType<typeof carregarPedido>>>;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function metodo(p: Pedido) {
  const pg = p.payments[0];
  if (!pg) return "";
  const nome = pg.metodo === "pix" ? "Pix" : pg.metodo === "cartao_credito" ? `Cartão${pg.parcelas > 1 ? ` em ${pg.parcelas}x` : ""}` : "Boleto";
  return pg.gateway === "manual" ? `${nome} (combinado pelo WhatsApp)` : nome;
}

function entrega(p: Pedido) {
  const e = p.order_shipments[0];
  if (!e || e.tipo === "retirada_salao") return `Retirada no salão — ${SITE.rua}, ${SITE.bairro}, ${SITE.cidade}. Terça a sábado, 8h30–12h e 13h30–18h30.`;
  const a = p.addresses;
  const end = a ? `${a.logradouro}, ${a.numero}${a.complemento ? ` — ${a.complemento}` : ""}, ${a.bairro}, ${a.cidade}/${a.uf}` : "";
  return `Envio${e.transportadora ? ` por ${e.transportadora}` : " pelos Correios"} para ${end}`;
}

/* Layout unico, na paleta da loja. Tabelas e estilo inline: e o que os clientes de e-mail aceitam. */
function layout(titulo: string, intro: string, p: Pedido, rodape: string) {
  const linhas = p.order_items.map((i) => `
    <tr><td style="padding:8px 0;border-bottom:1px solid #E3DDD5;color:#2B2724">${i.quantidade}× ${esc(i.produto_nome)}${i.variante_nome ? ` · ${esc(i.variante_nome)}` : ""}</td>
    <td style="padding:8px 0;border-bottom:1px solid #E3DDD5;text-align:right;white-space:nowrap">${reais(i.total_linha)}</td></tr>`).join("");
  const frete = p.order_shipments[0]?.tipo === "retirada_salao" ? "retirada" : p.frete_total > 0 ? reais(p.frete_total) : "a confirmar";
  const url = `${SITE.url}/loja/pedido/${p.id}`;

  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F3E1D9;font-family:Arial,Helvetica,sans-serif;color:#2B2724">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3E1D9;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBF9F6;border-radius:16px">
<tr><td style="padding:28px 28px 8px">
  <p style="margin:0;font-size:12px;letter-spacing:3px;color:#A1523A">FH CONCEPT · PEDIDO #${p.numero}</p>
  <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-weight:normal;font-size:28px;line-height:1.2;color:#1F1C19">${esc(titulo)}</h1>
  <p style="margin:12px 0 0;font-size:15px;line-height:1.5">${intro}</p>
</td></tr>
<tr><td style="padding:16px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
  ${linhas}
  <tr><td style="padding:8px 0;color:#6A635C">Frete</td><td style="padding:8px 0;text-align:right;color:#6A635C">${frete}</td></tr>
  <tr><td style="padding:12px 0 0;font-family:Georgia,serif;font-size:20px">Total</td><td style="padding:12px 0 0;text-align:right;font-family:Georgia,serif;font-size:20px">${reais(p.total)}</td></tr>
</table></td></tr>
<tr><td style="padding:8px 28px;font-size:14px;line-height:1.5">
  <p style="margin:0"><b>Entrega:</b> ${esc(entrega(p))}</p>
  <p style="margin:6px 0 0"><b>Pagamento:</b> ${esc(metodo(p))}</p>
</td></tr>
<tr><td style="padding:20px 28px 28px">
  <a href="${url}" style="display:inline-block;background:#A1523A;color:#FBF9F6;text-decoration:none;padding:13px 24px;border-radius:999px;font-size:14px">Ver o pedido</a>
  <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#6A635C">${rodape}</p>
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:#6A635C">${esc(SITE.nomeLongo)} · ${esc(SITE.rua)}, ${esc(SITE.cidade)}/${esc(SITE.uf)}</p>
</td></tr></table></body></html>`;
}

const whats = `Dúvidas? Responda este e-mail ou chame no WhatsApp ${SITE.telefone}.`;

/* ---------- eventos ---------- */

/* Pedido criado: avisa a loja (sempre) e a cliente (se deixou e-mail). */
export async function avisarPedidoRecebido(orderId: string) {
  try {
    const p = await carregarPedido(orderId);
    if (!p) return;
    const nome = p.customers?.nome?.split(" ")[0] ?? "";
    const manual = p.payments[0]?.gateway === "manual";

    if (p.customers?.email) {
      await enviar(p.customers.email, `Recebemos seu pedido #${p.numero}`,
        layout(`Oi, ${nome}! Recebemos seu pedido`,
          manual ? "Falta só o pagamento: a Fernanda te chama no WhatsApp com os dados." : "Assim que o pagamento for confirmado, você recebe outro e-mail.",
          p, whats),
        `recebido-${p.id}`);
    }
    if (process.env.EMAIL_LOJA) {
      await enviar(process.env.EMAIL_LOJA, `Novo pedido #${p.numero} — ${reais(p.total)} (aguardando pagamento)`,
        layout(`Novo pedido de ${p.customers?.nome ?? "cliente"}`,
          `WhatsApp: ${esc(p.customers?.telefone ?? "")}${manual ? " · <b>pagamento a combinar pelo WhatsApp</b>" : ""}${p.observacoes ? `<br>Recado: <i>${esc(p.observacoes)}</i>` : ""}`,
          p, "Aviso automático da loja."),
        `loja-recebido-${p.id}`);
    }
  } catch (e) {
    console.error("email pedido recebido", orderId, e);
  }
}

/* Pagamento confirmado (webhook, reconciliacao ou botao do admin). */
export async function avisarPedidoPago(orderId: string) {
  try {
    const p = await carregarPedido(orderId);
    if (!p) return;
    const nome = p.customers?.nome?.split(" ")[0] ?? "";
    const retirada = p.order_shipments[0]?.tipo === "retirada_salao";

    if (p.customers?.email) {
      await enviar(p.customers.email, `Pagamento confirmado — pedido #${p.numero}`,
        layout(`Pagamento confirmado, ${nome}!`,
          retirada ? "Vamos separar seus produtos. Avisamos pelo WhatsApp quando estiver pronto para retirar." : "Vamos separar e postar seus produtos. O código de rastreio chega pelo WhatsApp.",
          p, whats),
        `pago-${p.id}`);
    }
    if (process.env.EMAIL_LOJA) {
      await enviar(process.env.EMAIL_LOJA, `PAGO: pedido #${p.numero} — ${reais(p.total)}`,
        layout(`Pedido #${p.numero} pago — separar`,
          `${esc(p.customers?.nome ?? "")} · WhatsApp ${esc(p.customers?.telefone ?? "")}`,
          p, "Aviso automático da loja."),
        `loja-pago-${p.id}`);
    }
  } catch (e) {
    console.error("email pedido pago", orderId, e);
  }
}
