import { Indicador, Colunas, Barras } from "@/components/admin/graficos";
import { colunasDe } from "@/components/admin/painel-view";
import { reais } from "@/lib/preco";
import { GENDO, PROFISSIONAIS, rotuloMes, rotuloDia, type MesSalao, type RetratoSalao } from "@/lib/salao";

const inteiro = (n: number) => n.toLocaleString("pt-BR");
const campo = "min-h-10 w-full border border-linha bg-white px-3 text-sm outline-none focus:border-nude";

export function SalaoView({ meses, retrato, aviso, salvarMes }: { meses: MesSalao[]; retrato: RetratoSalao | null; aviso?: string; salvarMes: (dados: FormData) => Promise<void> }) {
  const ultimo = meses.at(-1);
  const totalAgend = meses.reduce((s, m) => s + m.agendamentos, 0);
  const totalBruto = meses.reduce((s, m) => s + m.valorBruto, 0);
  const totalDesc = meses.reduce((s, m) => s + m.descontos, 0);
  const totalComandas = meses.reduce((s, m) => s + m.comandasFechadas, 0);

  // soma por profissional no periodo, na ordem fixa da equipe e "Outras" por ultimo
  const soma: Record<string, number> = {};
  for (const m of meses) for (const [nome, n] of Object.entries(m.porProfissional)) soma[nome] = (soma[nome] ?? 0) + n;
  const ordem = [...PROFISSIONAIS.filter((p) => soma[p]), ...Object.keys(soma).filter((n) => !PROFISSIONAIS.includes(n as never)).sort()];
  const nomes = ordem.length ? ordem : [...PROFISSIONAIS];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-serif text-3xl">Salão</h1>
          <p className="mt-2 max-w-xl text-sm text-texto2">
            Números da agenda e das comandas do Gendo, mês a mês. Eles são refeitos a cada importação dos arquivos do Gendo; o formulário no fim da página serve para corrigir um mês à mão.
            {ultimo && <> Último mês lançado: {rotuloMes(ultimo.mes, true)}.</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={GENDO.agenda} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center bg-carvao px-5 text-creme hover:bg-nude-esc">Abrir agenda no Gendo</a>
          <a href={GENDO.agendamentoOnline} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center border border-linha bg-branco px-5 hover:border-carvao">Link de agendamento</a>
          <a href="/admin/salao/importar" className="inline-flex min-h-11 items-center border border-linha bg-branco px-5 hover:border-carvao">Importar do Gendo</a>
        </div>
      </div>

      {aviso && <p className="mt-6 border border-linha bg-areia px-4 py-3 text-sm">{aviso}</p>}

      {meses.length === 0 ? (
        <p className="mt-10 text-sm text-texto2">Nenhum mês lançado ainda. Use o formulário abaixo para lançar o primeiro.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador rotulo={`Agendamentos em ${meses.length} meses`} valor={inteiro(totalAgend)} nota={`média de ${inteiro(Math.round(totalAgend / meses.length))} por mês`} />
            <Indicador rotulo="Comandas fechadas" valor={inteiro(totalComandas)} nota={retrato ? `${inteiro(retrato.comandasAbertas)} em aberto em ${rotuloDia(retrato.data)}` : undefined} />
            <Indicador rotulo="Faturamento registrado" valor={reais(totalBruto - totalDesc)} nota="só o que passou por comanda fechada" />
            {retrato && <Indicador rotulo="Clientes sumidas" valor={inteiro(retrato.clientesSumidas)} nota="5 ou mais visitas e 2 meses sem vir" />}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <Colunas titulo="Agendamentos por mês" unidade="agendamentos" dados={colunasDe(meses, "agendamentos")} />
            <Colunas titulo="Comandas fechadas por mês" unidade="comandas" dados={colunasDe(meses, "comandasFechadas")} />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <Barras titulo={`Agendamentos por profissional, ${rotuloMes(meses[0].mes)} a ${rotuloMes(meses.at(-1)!.mes)}`} dados={nomes.map((n) => ({ nome: n, valor: soma[n] ?? 0, nota: totalAgend ? `${Math.round(((soma[n] ?? 0) / totalAgend) * 100)}%` : undefined }))} />
            {retrato && (
              <Barras
                titulo={`Base de clientes em ${rotuloDia(retrato.data)}: ${inteiro(retrato.clientesTotal)} cadastradas`}
                dados={[
                  { nome: "Até 90 dias", valor: retrato.clientes90d },
                  { nome: "Mais de 90 dias", valor: retrato.clientesMais90d },
                  { nome: "Sem visita", valor: retrato.clientesSemVisita },
                ]}
              />
            )}
          </div>

          <section className="mt-12">
            <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">Mês a mês</h2>
            <div className="mt-4 overflow-x-auto border border-linha bg-branco">
              <table className="w-full min-w-[720px] text-sm tabular-nums">
                <thead className="border-b border-linha text-left text-texto2">
                  <tr>
                    <th className="px-4 py-2.5 font-normal">Mês</th>
                    <th className="px-3 py-2.5 text-right font-normal">Agend.</th>
                    <th className="px-3 py-2.5 text-right font-normal">Cancel.</th>
                    {nomes.map((n) => <th key={n} className="px-3 py-2.5 text-right font-normal">{n}</th>)}
                    <th className="px-3 py-2.5 text-right font-normal">Comandas</th>
                    <th className="px-3 py-2.5 text-right font-normal">Bruto</th>
                    <th className="px-3 py-2.5 text-right font-normal">Descontos</th>
                    <th className="px-4 py-2.5 text-right font-normal">Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {[...meses].reverse().map((m) => (
                    <tr key={m.mes} className="border-b border-linha/60 last:border-b-0">
                      <td className="whitespace-nowrap px-4 py-2.5">{rotuloMes(m.mes)}</td>
                      <td className="px-3 py-2.5 text-right">{inteiro(m.agendamentos)}</td>
                      <td className="px-3 py-2.5 text-right text-texto2">{inteiro(m.cancelados)}</td>
                      {nomes.map((n) => <td key={n} className="px-3 py-2.5 text-right text-texto2">{m.porProfissional[n] ? inteiro(m.porProfissional[n]) : "–"}</td>)}
                      <td className="px-3 py-2.5 text-right">{inteiro(m.comandasFechadas)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-texto2">{reais(m.valorBruto)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-texto2">{reais(m.descontos)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">{reais(m.valorBruto - m.descontos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="mt-12">
        <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">Lançar ou corrigir um mês</h2>
        <p className="mt-3 max-w-xl text-sm text-texto2">
          Os números saem do Gendo: Agenda › Listagem (filtrando o mês) e Financeiro › Comandas. Lançar um mês que já existe substitui os números dele.
        </p>
        <form action={salvarMes} className="mt-5 grid max-w-3xl gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
          <label className="text-sm sm:col-span-2 md:col-span-1">Mês
            <input type="month" name="mes" required className={`mt-1 ${campo}`} />
          </label>
          <label className="text-sm">Agendamentos (total)
            <input type="number" name="agendamentos" min={0} required className={`mt-1 ${campo}`} />
          </label>
          <label className="text-sm">Cancelados
            <input type="number" name="cancelados" min={0} defaultValue={0} className={`mt-1 ${campo}`} />
          </label>
          <label className="text-sm">Faltas
            <input type="number" name="faltas" min={0} placeholder="se souber" className={`mt-1 ${campo}`} />
          </label>
          {[...PROFISSIONAIS, "Outras"].map((p) => (
            <label key={p} className="text-sm">{p}
              <input type="number" name={`prof_${p}`} min={0} placeholder="agendamentos" className={`mt-1 ${campo}`} />
            </label>
          ))}
          <label className="text-sm">Comandas fechadas
            <input type="number" name="comandas_fechadas" min={0} defaultValue={0} className={`mt-1 ${campo}`} />
          </label>
          <label className="text-sm">Valor bruto (R$)
            <input name="valor_bruto" inputMode="decimal" placeholder="0,00" className={`mt-1 ${campo}`} />
          </label>
          <label className="text-sm">Descontos (R$)
            <input name="descontos" inputMode="decimal" placeholder="0,00" className={`mt-1 ${campo}`} />
          </label>
          <div className="flex items-end">
            <button className="min-h-10 w-full bg-carvao px-5 text-sm text-creme hover:bg-nude-esc">Salvar mês</button>
          </div>
        </form>
      </section>
    </>
  );
}
