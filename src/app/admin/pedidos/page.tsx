import { createAdminClient } from "@/lib/supabase/admin";
import { reais } from "@/lib/preco";
import { mudarStatus, confirmarPagamentoManual } from "./actions";

export const dynamic = "force-dynamic";

const STATUS: [string, string][] = [
  ["aguardando_pagamento", "Aguardando pagamento"],
  ["pago", "Pago"],
  ["em_separacao", "Em separação"],
  ["pronto_retirada", "Pronto p/ retirada"],
  ["enviado", "Enviado"],
  ["concluido", "Concluído"],
  ["cancelado", "Cancelado"],
  ["estornado", "Estornado"],
];
const NOME = Object.fromEntries(STATUS);

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  const db = createAdminClient();

  let q = db
    .from("orders")
    .select("id, numero, status, total, created_at, observacoes, customers(nome, telefone), order_items(produto_nome, variante_nome, quantidade), order_shipments(tipo), payments(metodo, status, gateway)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (s) q = q.eq("status", s as never);
  const { data: pedidos, error } = await q;

  if (error) return <p className="text-sm text-red-700">Erro: {error.message}</p>;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-serif text-2xl">Pedidos</h1>
        <nav className="flex flex-wrap gap-3 text-xs">
          <a href="/admin/pedidos" className={!s ? "text-nude" : "text-carvao/60 hover:text-nude"}>Todos</a>
          {STATUS.slice(0, 5).map(([k, v]) => (
            <a key={k} href={`/admin/pedidos?s=${k}`} className={s === k ? "text-nude" : "text-carvao/60 hover:text-nude"}>{v}</a>
          ))}
        </nav>
      </div>

      {!pedidos?.length ? (
        <p className="mt-12 text-sm text-carvao/60">Nenhum pedido{s ? " nessa situação" : " ainda"}.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {pedidos.map((p) => {
            const pag = p.payments[0];
            const entrega = p.order_shipments[0]?.tipo;
            return (
              <article key={p.id} className="border border-linha p-5 md:grid md:grid-cols-[1fr_16rem] md:gap-8">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-serif text-xl">#{p.numero}</span>
                    <span className="text-sm">{p.customers?.nome}</span>
                    <a href={`https://wa.me/55${p.customers?.telefone ?? ""}`} target="_blank" rel="noopener" className="text-sm text-nude">{p.customers?.telefone}</a>
                    <span className="text-xs text-carvao/50">{new Date(p.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <ul className="mt-3 text-sm text-carvao/70">
                    {p.order_items.map((it, i) => (
                      <li key={i}>{it.quantidade}× {it.produto_nome}{it.variante_nome ? ` · ${it.variante_nome}` : ""}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-carvao/60">
                    {entrega === "retirada_salao" ? "Retirada no salão" : "Envio pelos Correios"} · {pag?.metodo === "pix" ? "Pix" : pag?.metodo === "cartao_credito" ? "Cartão" : "Boleto"} · {pag?.gateway === "manual" ? "pagamento manual" : "Mercado Pago"}
                    {p.observacoes && <> · <i>{p.observacoes}</i></>}
                  </p>
                </div>

                <div className="mt-4 md:mt-0">
                  <p className="font-serif text-xl">{reais(p.total)}</p>
                  <p className="mt-1 text-xs text-nude">{NOME[p.status]}</p>

                  {p.status === "aguardando_pagamento" && (
                    <form action={confirmarPagamentoManual} className="mt-3">
                      <input type="hidden" name="id" value={p.id} />
                      <button className="min-h-10 w-full bg-carvao px-3 text-xs text-creme">Confirmar pagamento recebido</button>
                    </form>
                  )}

                  <form action={mudarStatus} className="mt-3 flex gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <select name="status" defaultValue={p.status} className="min-h-10 flex-1 border border-linha bg-white px-2 text-xs">
                      {STATUS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button className="min-h-10 border border-carvao px-3 text-xs">Salvar</button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
