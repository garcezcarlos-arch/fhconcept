import { createAdminClient } from "@/lib/supabase/admin";
import { reais } from "@/lib/preco";
import { mudarStatus, confirmarPagamentoManual, estornar } from "./actions";
import { NOME_STATUS, PROXIMOS_MANUAIS, PODE_ESTORNAR, type StatusPedido } from "@/lib/status-pedido";

export const dynamic = "force-dynamic";

const STATUS = Object.entries(NOME_STATUS) as [StatusPedido, string][];
const NOME = NOME_STATUS;

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ s?: string; aviso?: string }> }) {
  const { s, aviso } = await searchParams;
  const db = createAdminClient();

  let q = db
    .from("orders")
    .select("id, numero, status, total, created_at, observacoes, customers(nome, telefone), order_items(produto_nome, variante_nome, quantidade), order_shipments(tipo, valor_frete, transportadora), payments(metodo, status, gateway)")
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

      {aviso && <p className="mt-6 border border-linha bg-areia px-4 py-3 text-sm">{aviso}</p>}

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
                    {entrega === "retirada_salao" ? "Retirada no salão" : p.order_shipments[0]?.valor_frete ? `Envio ${p.order_shipments[0].transportadora ?? ""} · frete ${reais(p.order_shipments[0].valor_frete)}` : "Envio pelos Correios · frete a combinar"} · {pag?.metodo === "pix" ? "Pix" : pag?.metodo === "cartao_credito" ? "Cartão" : "Boleto"} · {pag?.gateway === "manual" ? "pagamento manual" : "Mercado Pago"}
                    {pag?.status && pag.status !== "pendente" && pag.status !== "aprovado" && <> · pagamento {pag.status}</>}
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

                  {PROXIMOS_MANUAIS[p.status].length > 0 && (
                    <form action={mudarStatus} className="mt-3 flex gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="atual" value={p.status} />
                      <select name="status" defaultValue={p.status} className="min-h-10 flex-1 border border-linha bg-white px-2 text-xs">
                        <option value={p.status}>{NOME[p.status]}</option>
                        {PROXIMOS_MANUAIS[p.status].map((k) => <option key={k} value={k}>{NOME[k]}</option>)}
                      </select>
                      <button className="min-h-10 border border-carvao px-3 text-xs">Salvar</button>
                    </form>
                  )}

                  {PODE_ESTORNAR.includes(p.status) && (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer text-carvao/60 hover:text-nude">Estornar</summary>
                      <form action={estornar} className="mt-2">
                        <input type="hidden" name="id" value={p.id} />
                        <p className="text-carvao/70">
                          {pag?.gateway === "mercadopago" ? "Devolve o valor integral pelo Mercado Pago." : "Registra o estorno; a devolução do valor é feita por fora."}
                          {["pago", "em_separacao", "pronto_retirada"].includes(p.status) ? " Os itens voltam ao estoque." : " Os itens já saíram e não voltam ao estoque."}
                        </p>
                        <button className="mt-2 min-h-10 w-full border border-nude px-3 text-nude">Confirmar estorno de {reais(p.total)}</button>
                      </form>
                    </details>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
