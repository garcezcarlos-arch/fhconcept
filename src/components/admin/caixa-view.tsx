import Link from "next/link";
import { Indicador, Colunas, Barras } from "@/components/admin/graficos";
import { reais } from "@/lib/preco";
import type { ResumoCaixa } from "@/lib/caixa";
import { rotuloDia, rotuloMes } from "@/lib/salao";
import { PERIODOS } from "@/components/admin/agenda-view";

const inteiro = (n: number) => n.toLocaleString("pt-BR");
const pct = (parte: number, todo: number) => (todo > 0 ? `${Math.round((parte / todo) * 100)}%` : "0%");
/** 15300 -> "15,3 mil": cabe no eixo e no rotulo da coluna */
const mil = (n: number) => (Math.abs(n) >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : inteiro(Math.round(n)));

export function CaixaView({ r, dias, semComanda }: {
  r: ResumoCaixa | null;
  dias: number;
  /** atendimentos na agenda depois da ultima comanda fechada (null = nao foi possivel contar) */
  semComanda: number | null;
}) {
  const link = (d: number) => (d === 365 ? "/admin/salao/caixa" : `/admin/salao/caixa?dias=${d}`);
  const topo = r?.itens.slice(0, 10) ?? [];
  const pagos = r ? r.formas.reduce((s, f) => s + f.valor, 0) : 0;

  return (
    <>
      <h1 className="font-serif text-3xl">Caixa e comandas</h1>
      <p className="mt-2 max-w-2xl text-sm text-texto2">
        O que passou pelas comandas do Gendo: quanto entrou, por qual forma de pagamento e o que ficou em aberto.
        {r && <> Período de {rotuloDia(r.de)} a {rotuloDia(r.ate)}, data da última comanda importada.</>}
      </p>

      <nav aria-label="Período" className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-linha text-sm">
        {PERIODOS.map((p) => (
          <Link key={p.dias} href={link(p.dias)} aria-current={p.dias === dias ? "true" : undefined} className={`-mb-px flex min-h-11 items-center border-b-2 ${p.dias === dias ? "border-nude text-carvao" : "border-transparent text-texto2 hover:text-carvao"}`}>
            {p.nome}
          </Link>
        ))}
      </nav>

      {!r ? (
        <p className="mt-8 max-w-xl text-sm text-texto2">
          As comandas ainda não foram importadas.{" "}
          <Link href="/admin/salao/importar" className="border-b border-nude text-nude-esc">Importar do Gendo</Link>
        </p>
      ) : (
        <>
          {r.ultimaFechada && semComanda !== null && semComanda > 0 && (
            <p className="mt-6 max-w-3xl border border-linha bg-areia px-4 py-3 text-sm leading-relaxed">
              A última comanda fechada é de {rotuloDia(r.ultimaFechada)}. Depois dela a agenda registra {inteiro(semComanda)} {semComanda === 1 ? "atendimento" : "atendimentos"} sem comanda fechada, então o faturamento desse período não aparece aqui.
            </p>
          )}

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador rotulo="Faturamento registrado" valor={reais(r.liquido)} nota={`${reais(r.bruto)} em comandas, menos ${reais(r.descontos)} de desconto`} />
            <Indicador rotulo="Comandas fechadas" valor={inteiro(r.fechadas)} nota={r.fechadas !== r.comVenda ? `${inteiro(r.fechadas - r.comVenda)} sem valor ou de estorno` : undefined} />
            <Indicador rotulo="Valor médio por comanda" valor={r.ticketMedio === null ? "–" : reais(r.ticketMedio)} nota={r.ticketMediano === null ? undefined : `metade das comandas fica abaixo de ${reais(r.ticketMediano)}`} />
            <Indicador rotulo="Descontos" valor={reais(r.descontos)} nota={`${pct(r.descontos, r.bruto)} do valor das comandas`} />
          </div>

          {r.meses.length > 0 && (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <Colunas
                titulo="Faturamento registrado por mês, em reais"
                unidade="reais"
                formatar={mil}
                dados={r.meses.map((m) => ({ rotulo: rotuloMes(m.mes).slice(0, 3), ano: m.mes.slice(0, 4), valor: Math.max(0, Math.round(m.liquido)) }))}
              />
              <Barras
                titulo="Por forma de pagamento"
                formatar={reais}
                dados={[...r.formas, ...(r.semForma > 0 ? [{ nome: "Sem registro", valor: r.semForma }] : [])].map((f) => ({ nome: f.nome, valor: f.valor, nota: pct(f.valor, pagos + Math.max(0, r.semForma)) }))}
                nota={r.semForma > 0 ? "“Sem registro” são comandas fechadas sem forma de pagamento lançada no Gendo." : undefined}
              />
            </div>
          )}

          {topo.length > 0 && (
            <div className="mt-3">
              <Barras
                titulo={`O que mais aparece nas comandas fechadas (${topo.length} de ${r.itens.length})`}
                nomeLargo
                dados={topo.map((i) => ({ nome: i.nome, valor: i.vezes }))}
                nota="Em número de vezes. A comanda guarda um valor só para tudo o que foi feito, então não dá para saber quanto cada serviço faturou."
              />
            </div>
          )}

          <section className="mt-12">
            <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">Comandas em aberto</h2>
            {r.abertas.total === 0 ? (
              <p className="mt-4 text-sm text-texto2">Nenhuma comanda em aberto.</p>
            ) : (
              <>
                <p className="mt-3 max-w-2xl text-sm text-texto2">
                  {inteiro(r.abertas.total)} {r.abertas.total === 1 ? "comanda" : "comandas"} em aberto no Gendo, somando {reais(r.abertas.valor)}
                  {r.abertas.maisAntiga && <>; a mais antiga é de {rotuloDia(r.abertas.maisAntiga)}</>}. Fechar ou cancelar cada uma no Gendo acerta estes números na importação seguinte.
                </p>
                <div className="mt-4 overflow-x-auto border border-linha bg-branco">
                  <table className="w-full min-w-[360px] text-sm tabular-nums">
                    <thead className="border-b border-linha text-left text-texto2">
                      <tr>
                        <th className="px-4 py-2.5 font-normal">Mês da comanda</th>
                        <th className="px-3 py-2.5 text-right font-normal">Em aberto</th>
                        <th className="px-4 py-2.5 text-right font-normal">Valor lançado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.abertas.porMes.map((m) => (
                        <tr key={m.mes} className="border-b border-linha/60 last:border-b-0">
                          <td className="px-4 py-2.5">{rotuloMes(m.mes, true)}</td>
                          <td className="px-3 py-2.5 text-right">{inteiro(m.quantidade)}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right text-texto2">{reais(m.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {r.meses.length > 0 && (
            <section className="mt-12">
              <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">Mês a mês</h2>
              <div className="mt-4 overflow-x-auto border border-linha bg-branco">
                <table className="w-full min-w-[640px] text-sm tabular-nums">
                  <thead className="border-b border-linha text-left text-texto2">
                    <tr>
                      <th className="px-4 py-2.5 font-normal">Mês</th>
                      <th className="px-3 py-2.5 text-right font-normal">Fechadas</th>
                      <th className="px-3 py-2.5 text-right font-normal">Valor das comandas</th>
                      <th className="px-3 py-2.5 text-right font-normal">Descontos</th>
                      <th className="px-3 py-2.5 text-right font-normal">Faturamento</th>
                      <th className="px-4 py-2.5 text-right font-normal">Valor médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...r.meses].reverse().map((m) => (
                      <tr key={m.mes} className="border-b border-linha/60 last:border-b-0">
                        <td className="whitespace-nowrap px-4 py-2.5">{rotuloMes(m.mes)}</td>
                        <td className="px-3 py-2.5 text-right">{inteiro(m.fechadas)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-texto2">{reais(m.bruto)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-texto2">{reais(m.descontos)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right">{reais(m.liquido)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-texto2">{m.ticket === null ? "–" : reais(m.ticket)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
