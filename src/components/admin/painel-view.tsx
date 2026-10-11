import Link from "next/link";
import { Indicador, Colunas } from "@/components/admin/graficos";
import { reais } from "@/lib/preco";
import { rotuloMes, rotuloDia, type MesSalao, type RetratoSalao } from "@/lib/salao";

export type Pendencia = { quantidade: number; texto: string; href: string; acao: string; externo?: boolean };

export type DadosPainel = {
  hoje: string;
  pendencias: Pendencia[];
  /** null = perfil sem acesso aos numeros do salao; "sem-tabela" = migration ainda nao rodou */
  salao: null | "sem-tabela" | { meses: MesSalao[]; retrato: RetratoSalao | null };
  loja: { pedidosPagos: number; faturamento: number; produtosAtivos: number };
  formacoes: { turmasAbertas: number; vagasOcupadas: number; vagasTotal: number; listaEspera: number };
};

const inteiro = (n: number) => n.toLocaleString("pt-BR");

/** "22 a mais que em ago/26" */
export function comparar(atual: number, anterior: number, mesAnterior: string) {
  const d = atual - anterior;
  if (d === 0) return `igual a ${rotuloMes(mesAnterior)}`;
  return `${inteiro(Math.abs(d))} a ${d > 0 ? "mais" : "menos"} que em ${rotuloMes(mesAnterior)}`;
}

export function colunasDe(meses: MesSalao[], campo: "agendamentos" | "comandasFechadas") {
  return meses.map((m) => ({ rotulo: rotuloMes(m.mes).slice(0, 3), ano: m.mes.slice(0, 4), valor: m[campo] }));
}

function Secao({ titulo, nota, link, children }: { titulo: string; nota?: string; link?: { href: string; texto: string }; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-carvao/20 pb-3">
        <h2 className="font-serif text-xl">{titulo}</h2>
        <div className="flex flex-wrap items-baseline gap-x-5 text-sm">
          {nota && <span className="text-texto2">{nota}</span>}
          {link && <Link href={link.href} className="border-b border-nude text-nude-esc">{link.texto}</Link>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function PainelView({ dados }: { dados: DadosPainel }) {
  const { salao, loja, formacoes, pendencias } = dados;
  const meses = salao && salao !== "sem-tabela" ? salao.meses : [];
  const ultimo = meses.at(-1);
  const anterior = meses.at(-2);
  const retrato = salao && salao !== "sem-tabela" ? salao.retrato : null;

  return (
    <>
      <p className="text-sm text-texto2">{dados.hoje}</p>
      <h1 className="mt-1 font-serif text-3xl">Painel</h1>

      <section className="mt-8">
        <h2 className="font-serif text-xl">Para resolver</h2>
        {pendencias.length === 0 ? (
          <p className="mt-3 border border-linha bg-branco px-5 py-4 text-sm text-texto2">Nada pendente na loja, nas turmas e no salão.</p>
        ) : (
          <ul className="mt-3 border border-linha bg-branco">
            {pendencias.map((p) => (
              <li key={p.texto} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-linha px-5 py-3 text-sm last:border-b-0">
                <span><b className="mr-2 inline-block min-w-6 font-semibold tabular-nums">{inteiro(p.quantidade)}</b>{p.texto}</span>
                {p.externo ? (
                  <a href={p.href} target="_blank" rel="noopener" className="inline-flex min-h-9 items-center border-b border-nude text-nude-esc">{p.acao}</a>
                ) : (
                  <Link href={p.href} className="inline-flex min-h-9 items-center border-b border-nude text-nude-esc">{p.acao}</Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {salao === "sem-tabela" && (
        <Secao titulo="Salão">
          <p className="border border-linha bg-areia px-5 py-4 text-sm">Os números do salão aparecem aqui depois de rodar <code>supabase/migrations/20261011_salao_indicadores.sql</code> no SQL Editor do Supabase.</p>
        </Secao>
      )}

      {salao && salao !== "sem-tabela" && (
        <Secao titulo="Salão" nota={ultimo ? `Gendo, até ${rotuloMes(ultimo.mes, true)}` : undefined} link={{ href: "/admin/salao", texto: "Ver indicadores" }}>
          {!ultimo ? (
            <p className="text-sm text-texto2">Nenhum mês lançado ainda.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Indicador rotulo={`Agendamentos em ${rotuloMes(ultimo.mes)}`} valor={inteiro(ultimo.agendamentos)} nota={anterior ? comparar(ultimo.agendamentos, anterior.agendamentos, anterior.mes) : undefined} />
                <Indicador rotulo="Cancelamentos" valor={ultimo.agendamentos ? `${Math.round((ultimo.cancelados / ultimo.agendamentos) * 100)}%` : "0%"} nota={`${inteiro(ultimo.cancelados)} de ${inteiro(ultimo.agendamentos)} agendamentos`} />
                <Indicador rotulo="Comandas fechadas" valor={inteiro(ultimo.comandasFechadas)} nota={`para ${inteiro(ultimo.agendamentos - ultimo.cancelados)} atendimentos na agenda`} />
                {retrato && <Indicador rotulo="Clientes com visita em 90 dias" valor={inteiro(retrato.clientes90d)} nota={`de ${inteiro(retrato.clientesTotal)} cadastradas, em ${rotuloDia(retrato.data)}`} />}
              </div>
              <div className="mt-3">
                <Colunas titulo="Agendamentos por mês" unidade="agendamentos" dados={colunasDe(meses, "agendamentos")} />
              </div>
            </>
          )}
        </Secao>
      )}

      <Secao titulo="Loja" nota="últimos 30 dias" link={{ href: "/admin/pedidos", texto: "Ver pedidos" }}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Indicador rotulo="Pedidos pagos" valor={inteiro(loja.pedidosPagos)} />
          <Indicador rotulo="Faturamento" valor={reais(loja.faturamento)} />
          <Indicador rotulo="Valor médio por pedido" valor={loja.pedidosPagos ? reais(loja.faturamento / loja.pedidosPagos) : "—"} />
          <Indicador rotulo="Produtos publicados" valor={inteiro(loja.produtosAtivos)} nota={loja.produtosAtivos === 0 ? "a vitrine está vazia" : undefined} />
        </div>
      </Secao>

      <Secao titulo="Formações" link={{ href: "/admin/turmas", texto: "Ver turmas" }}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Indicador rotulo="Turmas abertas" valor={inteiro(formacoes.turmasAbertas)} />
          <Indicador rotulo="Vagas ocupadas" valor={formacoes.vagasTotal ? `${inteiro(formacoes.vagasOcupadas)} de ${inteiro(formacoes.vagasTotal)}` : "—"} />
          <Indicador rotulo="Lista de espera" valor={inteiro(formacoes.listaEspera)} />
        </div>
      </Secao>
    </>
  );
}
