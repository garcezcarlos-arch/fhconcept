import Link from "next/link";
import { Indicador, Colunas, Barras } from "@/components/admin/graficos";
import { DIAS, DIAS_LONGOS, type RaioX } from "@/lib/agenda";
import { duracaoBr, rotuloDia } from "@/lib/salao";

export const PERIODOS = [
  { dias: 90, nome: "3 meses" },
  { dias: 180, nome: "6 meses" },
  { dias: 365, nome: "12 meses" },
];

const inteiro = (n: number) => n.toLocaleString("pt-BR");
const decimal = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct = (parte: number, todo: number) => (todo > 0 ? `${Math.round((parte / todo) * 100)}%` : "0%");
const horas = (min: number) => inteiro(Math.round(min / 60));

/** Dia da semana x hora: quanto mais escuro, mais atendimentos ao mesmo tempo.
    E uma tabela de verdade (o numero esta em toda celula), a cor so reforca. */
function Ocupacao({ r }: { r: RaioX }) {
  const { horas: linhas, dias, celulas, max, pico } = r.ocupacao;
  if (!linhas.length || !pico) return null;
  return (
    <figure className="border border-linha bg-branco px-5 py-4">
      <figcaption className="text-sm text-carvao">Quando o salão enche: atendimentos acontecendo ao mesmo tempo, em média</figcaption>
      <p className="mt-1 max-w-3xl text-xs leading-snug text-texto2">
        1,0 quer dizer uma profissional ocupada a hora inteira, em um dia comum. O mais cheio é {DIAS_LONGOS[pico.dia]} às {pico.hora}h, com {decimal(pico.valor)}. Células claras são horários com espaço na agenda.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[300px] table-fixed border-separate border-spacing-0.5 text-center text-xs tabular-nums">
          <thead>
            <tr>
              <th className="w-9 font-normal"><span className="sr-only">Hora</span></th>
              {dias.map((d) => <th key={d} scope="col" className="pb-1 font-normal text-texto2"><abbr title={DIAS_LONGOS[d]} className="no-underline">{DIAS[d]}</abbr></th>)}
            </tr>
          </thead>
          <tbody>
            {linhas.map((h, i) => (
              <tr key={h}>
                <th scope="row" className="pr-1 text-right font-normal text-texto2">{h}h</th>
                {celulas[i].map((v, j) => (
                  // nude-esc com transparencia ate 0,8: o texto carvao segue legivel na celula mais escura
                  <td key={dias[j]} className="h-8 text-carvao" style={{ backgroundColor: v >= 0.05 ? `rgba(142,107,79,${(0.06 + (v / max) * 0.74).toFixed(2)})` : "rgba(31,28,25,0.03)" }}>
                    {v >= 0.05 ? decimal(v) : <span className="text-texto2/50">–</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function AgendaView({ r, dias, importadoAte }: { r: RaioX | null; dias: number; importadoAte: string | null }) {
  const link = (d: number) => (d === 365 ? "/admin/salao/agenda" : `/admin/salao/agenda?dias=${d}`);
  const top = r?.servicos.slice(0, 10) ?? [];
  const diaCheio = r ? r.mediaPorDia.indexOf(Math.max(...r.mediaPorDia)) : 0;
  const abertos = r ? r.mediaPorDia.map((v, d) => ({ v, d })).filter((x) => x.v > 0) : [];
  const diaVazio = abertos.length ? abertos.reduce((a, b) => (b.v < a.v ? b : a)).d : 0;

  return (
    <>
      <h1 className="font-serif text-3xl">Raio-x da agenda</h1>
      <p className="mt-2 max-w-2xl text-sm text-texto2">
        O que os agendamentos do Gendo mostram: o que mais se pede, quando o salão enche e quem atende.
        {r && <> Período de {rotuloDia(r.de)} a {rotuloDia(r.ate)}, último dia importado.</>} Cancelados e faltas ficam fora das contas de atendimento.
      </p>

      <nav aria-label="Período" className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-linha text-sm">
        {PERIODOS.map((p) => (
          <Link key={p.dias} href={link(p.dias)} aria-current={p.dias === dias ? "true" : undefined} className={`-mb-px flex min-h-11 items-center border-b-2 ${p.dias === dias ? "border-nude text-carvao" : "border-transparent text-texto2 hover:text-carvao"}`}>
            {p.nome}
          </Link>
        ))}
      </nav>

      {!r || r.marcados === 0 ? (
        <p className="mt-8 max-w-xl text-sm text-texto2">
          {importadoAte ? "Nenhum agendamento neste período." : "A agenda ainda não foi importada."}{" "}
          <Link href="/admin/salao/importar" className="border-b border-nude text-nude-esc">Importar do Gendo</Link>
        </p>
      ) : (
        <>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador rotulo="Atendimentos" valor={inteiro(r.atendimentos)} nota={`média de ${inteiro(Math.round(r.atendimentos / r.semanas))} por semana`} />
            <Indicador rotulo="Clientes atendidas" valor={inteiro(r.clientes)} nota={`${inteiro(r.recorrentes)} vieram mais de uma vez (${pct(r.recorrentes, r.clientes)})`} />
            <Indicador rotulo="Cancelamentos" valor={`${inteiro(r.cancelados)} (${pct(r.cancelados, r.marcados)})`} nota={`${inteiro(r.faltas)} ${r.faltas === 1 ? "falta marcada" : "faltas marcadas"}; a falta só conta quando alguém registra no Gendo`} />
            <Indicador rotulo="Horas de agenda" valor={`${horas(r.minutos)} h`} nota={r.duracaoMedia ? `duração média de ${duracaoBr(r.duracaoMedia)} por atendimento` : undefined} />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <Barras
              titulo={`Serviços mais pedidos (${top.length} de ${r.servicos.length})`}
              nomeLargo
              dados={top.map((s) => ({ nome: s.nome, valor: s.vezes, nota: pct(s.vezes, r.atendimentos) }))}
              nota="Entre parênteses, a parte dos atendimentos em que o serviço aparece. Um atendimento pode ter mais de um serviço."
            />
            <div className="grid content-start gap-3">
              <Barras titulo="Atendimentos por categoria do Gendo" dados={r.categorias.map((c) => ({ nome: c.nome, valor: c.valor, nota: pct(c.valor, r.atendimentos) }))} />
              <Barras
                titulo="Quantas vezes cada cliente veio no período"
                dados={r.frequencia.map((f) => ({ nome: f.nome, valor: f.valor, nota: pct(f.valor, r.clientes) }))}
                nota="Em número de clientes."
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
            <Colunas
              titulo="Atendimentos em um dia comum, por dia da semana"
              unidade="atendimentos por dia"
              todosRotulos
              formatar={decimal}
              dados={r.mediaPorDia.map((v, d) => ({ rotulo: DIAS[d], valor: Math.round(v * 10) / 10 }))}
              nota={abertos.length > 1 ? `O dia mais cheio é ${DIAS_LONGOS[diaCheio]}; o mais calmo, ${DIAS_LONGOS[diaVazio]}.` : undefined}
            />
            <Ocupacao r={r} />
          </div>

          <section className="mt-12">
            <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">Por profissional</h2>
            <div className="mt-4 overflow-x-auto border border-linha bg-branco">
              <table className="w-full min-w-[640px] text-sm tabular-nums">
                <thead className="border-b border-linha text-left text-texto2">
                  <tr>
                    <th className="px-4 py-2.5 font-normal">Profissional</th>
                    <th className="px-3 py-2.5 text-right font-normal">Atendimentos</th>
                    <th className="px-3 py-2.5 text-right font-normal">Parte do total</th>
                    <th className="px-3 py-2.5 text-right font-normal">Horas de agenda</th>
                    <th className="px-3 py-2.5 text-right font-normal">Clientes</th>
                    <th className="px-4 py-2.5 text-right font-normal">Cancelados e faltas</th>
                  </tr>
                </thead>
                <tbody>
                  {r.profissionais.map((p) => (
                    <tr key={p.nome} className="border-b border-linha/60 last:border-b-0">
                      <td className="px-4 py-2.5">{p.nome}</td>
                      <td className="px-3 py-2.5 text-right">{inteiro(p.atendimentos)}</td>
                      <td className="px-3 py-2.5 text-right text-texto2">{pct(p.atendimentos, r.atendimentos)}</td>
                      <td className="px-3 py-2.5 text-right">{horas(p.minutos)} h</td>
                      <td className="px-3 py-2.5 text-right text-texto2">{inteiro(p.clientes)}</td>
                      <td className="px-4 py-2.5 text-right text-texto2">{inteiro(p.cancelados)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {r.profissionais.some((p) => p.nome === "Outras") && <p className="mt-2 text-xs text-texto2">“Outras” soma as profissionais que não estão mais na equipe.</p>}
          </section>

          <section className="mt-12">
            <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">Todos os serviços do período</h2>
            <details className="mt-4 border border-linha bg-branco">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm [&::-webkit-details-marker]:hidden">
                <span>{inteiro(r.servicos.length)} serviços diferentes na agenda</span>
                <span className="shrink-0 whitespace-nowrap border-b border-nude text-nude-esc">Ver a lista</span>
              </summary>
              <div className="overflow-x-auto border-t border-linha">
                <table className="w-full min-w-[640px] text-sm tabular-nums">
                  <thead className="border-b border-linha text-left text-texto2">
                    <tr>
                      <th className="px-4 py-2.5 font-normal">Serviço</th>
                      <th className="px-3 py-2.5 text-right font-normal">Vezes</th>
                      <th className="px-3 py-2.5 text-right font-normal">Dos atendimentos</th>
                      <th className="px-3 py-2.5 text-right font-normal">Duração típica</th>
                      <th className="px-4 py-2.5 font-normal">Quem mais faz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.servicos.map((s) => (
                      <tr key={s.nome} className="border-b border-linha/60 last:border-b-0">
                        <td className="px-4 py-2.5">{s.nome}</td>
                        <td className="px-3 py-2.5 text-right">{inteiro(s.vezes)}</td>
                        <td className="px-3 py-2.5 text-right text-texto2">{pct(s.vezes, r.atendimentos)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-texto2">{s.duracaoTipica ? duracaoBr(s.duracaoTipica) : "–"}</td>
                        <td className="px-4 py-2.5 text-texto2">{s.quem ?? "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
            <p className="mt-2 max-w-2xl text-xs text-texto2">A duração típica vem dos atendimentos em que o serviço foi marcado sozinho. Nomes parecidos aparecem separados porque estão cadastrados assim no Gendo.</p>
          </section>
        </>
      )}
    </>
  );
}
