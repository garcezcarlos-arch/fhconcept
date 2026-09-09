import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { reais, linkWhatsapp } from "@/lib/preco";
import { SITE } from "@/lib/site";
import LimparCarrinho from "./limpar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seu pedido", robots: { index: false } };

const STATUS: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pagamento confirmado",
  em_separacao: "Em separação",
  enviado: "Enviado",
  pronto_retirada: "Pronto para retirada",
  concluido: "Concluído",
  cancelado: "Cancelado",
  estornado: "Estornado",
};

export default async function Pedido({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ retorno?: string }> }) {
  const { id } = await params;
  const { retorno } = await searchParams;
  const db = createAdminClient();

  const { data: p } = await db
    .from("orders")
    .select("id, numero, status, subtotal, total, observacoes, created_at, customers(nome, telefone), order_items(produto_nome, variante_nome, quantidade, total_linha), order_shipments(tipo, valor_frete), payments(metodo, status, gateway)")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const entrega = p.order_shipments[0]?.tipo;
  const pag = p.payments[0];
  const pendente = p.status === "aguardando_pagamento";
  const manual = pag?.gateway === "manual";
  const metodo = pag?.metodo === "pix" ? "Pix" : pag?.metodo === "cartao_credito" ? "cartão" : "boleto";

  const msg = `Oi! Fiz o pedido #${p.numero} no site (${reais(p.total)}) e quero pagar por ${metodo}.`;

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:px-10 md:py-16">
      <LimparCarrinho />
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-nude">Pedido #{p.numero}</p>
      <h1 className="mt-3 font-serif text-3xl md:text-4xl">
        {p.status === "pago" || retorno === "sucesso" ? "Pagamento confirmado" : pendente ? "Pedido registrado" : STATUS[p.status]}
      </h1>

      {pendente && manual && (
        <div className="mt-6 border border-linha bg-areia p-5">
          <p className="text-sm">Falta só o pagamento por <b>{metodo}</b>. Toque no botão abaixo — a mensagem já vai pronta com o número do pedido, e a Fernanda te passa a chave Pix ou os dados na hora.</p>
          <a href={linkWhatsapp(msg)} target="_blank" rel="noopener" className="mt-4 inline-flex min-h-13 items-center bg-carvao px-7 text-sm text-creme">Pagar pelo WhatsApp</a>
        </div>
      )}
      {pendente && !manual && retorno !== "sucesso" && (
        <p className="mt-6 text-texto2">Assim que o Mercado Pago confirmar, o pedido muda para pago aqui e no WhatsApp da Fernanda. Se você não concluiu o pagamento, pode <a href={linkWhatsapp(msg)} target="_blank" rel="noopener" className="border-b border-nude text-nude">falar com o salão</a>.</p>
      )}

      <section className="mt-10 border-t border-carvao">
        {p.order_items.map((it, i) => (
          <div key={i} className="flex justify-between gap-4 border-b border-linha py-3 text-sm">
            <span>{it.quantidade}× {it.produto_nome}{it.variante_nome ? ` · ${it.variante_nome}` : ""}</span>
            <span className="shrink-0">{reais(it.total_linha)}</span>
          </div>
        ))}
        <div className="flex justify-between border-b border-linha py-3 text-sm text-texto2"><span>Frete</span><span>{entrega === "retirada_salao" ? "retirada no salão" : "a confirmar no WhatsApp"}</span></div>
        <div className="flex justify-between py-4 font-serif text-xl"><span>Total</span><span>{reais(p.total)}</span></div>
      </section>

      <section className="mt-8 grid gap-6 text-sm md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-texto2">Entrega</p>
          <p className="mt-2">{entrega === "retirada_salao" ? `Retirada no salão — ${SITE.rua}, ${SITE.bairro}, ${SITE.cidade}. Terça a sábado, 8h30–12h e 13h30–18h30.` : "Envio pelos Correios. O frete é confirmado pelo WhatsApp antes de postar."}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-texto2">Situação</p>
          <p className="mt-2">{STATUS[p.status]}</p>
        </div>
      </section>

      <Link href="/loja" className="mt-10 inline-block text-sm text-carvao/60 hover:text-nude">Voltar para a loja</Link>
    </main>
  );
}
