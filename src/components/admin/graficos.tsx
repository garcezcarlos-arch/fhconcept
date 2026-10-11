import type { ReactNode } from "react";

/* Pecas de indicador do painel. Sem biblioteca de grafico: HTML e CSS.
   - numeros em sans (Inter), nunca na serifa dos titulos
   - barras de uma serie so usam uma cor so (nude-esc, 4,6:1 sobre o fundo)
   - todo valor do grafico tambem existe em tabela na pagina do salao */

const inteiro = (n: number) => n.toLocaleString("pt-BR");

/** Um numero com rotulo; `nota` explica a comparacao ou a data do dado. */
export function Indicador({ rotulo, valor, nota }: { rotulo: string; valor: ReactNode; nota?: ReactNode }) {
  return (
    <div className="border border-linha bg-branco px-5 py-4">
      <p className="text-sm text-texto2">{rotulo}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-carvao">{valor}</p>
      {nota && <p className="mt-2 text-xs leading-snug text-texto2">{nota}</p>}
    </div>
  );
}

/** Topo do eixo em numero redondo, com no maximo quatro intervalos. */
function eixo(max: number) {
  if (max <= 0) return { topo: 4, passo: 1 };
  const bruto = max / 4;
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const m = bruto / pot;
  const passo = Math.max(1, (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * pot);
  return { topo: Math.ceil(max / passo) * passo, passo };
}

export type Coluna = { rotulo: string; valor: number; ano?: string };

/** Colunas de uma serie ao longo do tempo. O rotulo direto vai so no maior valor
    e no ultimo; os demais aparecem ao passar o mouse ou focar pelo teclado.
    Com poucas colunas (dias da semana), `todosRotulos` escreve o valor em todas. */
export function Colunas({ titulo, unidade, dados, formatar = inteiro, todosRotulos = false, nota }: { titulo: string; unidade: string; dados: Coluna[]; formatar?: (n: number) => string; todosRotulos?: boolean; nota?: ReactNode }) {
  const max = Math.max(0, ...dados.map((d) => d.valor));
  const { topo, passo } = eixo(max);
  const marcas = Array.from({ length: Math.round(topo / passo) + 1 }, (_, i) => i * passo);
  const iMax = dados.findIndex((d) => d.valor === max);
  const iFim = dados.length - 1;

  return (
    <figure className="border border-linha bg-branco px-5 pb-4 pt-4">
      <figcaption className="text-sm text-carvao">{titulo}</figcaption>

      <div role="list" aria-label={titulo} className="relative mt-7 flex h-40 pl-9">
        {/* grade: linhas finas e continuas, com o valor a esquerda */}
        {marcas.map((m) => (
          <div key={m} aria-hidden className="pointer-events-none absolute inset-x-0 h-0" style={{ bottom: `${(m / topo) * 100}%` }}>
            <span className="absolute right-[calc(100%-1.75rem)] top-0 -translate-y-1/2 whitespace-nowrap text-right text-[11px] tabular-nums text-texto2">{formatar(m)}</span>
            <span className={`absolute left-9 right-0 top-0 h-px ${m === 0 ? "bg-carvao/30" : "bg-linha"}`} />
          </div>
        ))}

        {dados.map((d, i) => (
          <div key={d.rotulo + (d.ano ?? "")} role="listitem" tabIndex={0} aria-label={`${d.rotulo}${d.ano ? ` de ${d.ano}` : ""}: ${formatar(d.valor)} ${unidade}`} className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none">
            <div className={`relative w-full px-px ${todosRotulos ? "max-w-12" : "max-w-6"}`} style={{ height: `${(d.valor / topo) * 100}%` }}>
              <div className="h-full rounded-t-[4px] bg-nude-esc transition-colors group-hover:bg-carvao group-focus-visible:bg-carvao" />
              {(todosRotulos ? d.valor > 0 : i === iMax || i === iFim) && (
                <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[11px] tabular-nums text-texto group-hover:invisible group-focus-visible:invisible">{formatar(d.valor)}</span>
              )}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap bg-carvao px-2 py-1 text-xs text-creme group-hover:block group-focus-visible:block">
                <b className="font-semibold">{formatar(d.valor)}</b> <span className="text-creme/70">{d.rotulo}{d.ano ? `/${d.ano.slice(2)}` : ""}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* eixo do tempo: mes em todas, ano so quando muda */}
      <div aria-hidden className="mt-2 flex pl-9">
        {dados.map((d, i) => (
          <div key={d.rotulo + (d.ano ?? "")} className="min-w-0 flex-1 text-center text-[11px] leading-tight text-texto2">
            {d.rotulo}
            <span className="block text-texto2/70">{d.ano && (i === 0 || dados[i - 1].ano !== d.ano) ? d.ano : " "}</span>
          </div>
        ))}
      </div>
      {nota && <p className="mt-3 text-xs leading-snug text-texto2">{nota}</p>}
    </figure>
  );
}

/** Barras horizontais para comparar categorias sem ordem natural: uma cor so,
    nome a esquerda e valor na ponta. */
export function Barras({ titulo, dados, nomeLargo = false, nota, formatar = inteiro }: { titulo: string; dados: { nome: string; valor: number; nota?: string }[]; nomeLargo?: boolean; nota?: ReactNode; formatar?: (n: number) => string }) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  // valor em dinheiro ocupa mais texto na ponta: a barra encolhe para ele caber no celular
  const escala = formatar === inteiro ? 78 : 42;
  return (
    <figure className="border border-linha bg-branco px-5 py-4">
      <figcaption className="text-sm text-carvao">{titulo}</figcaption>
      <dl className="mt-5 space-y-3">
        {dados.map((d) => (
          // nome comprido: no celular o nome vai em cima da barra, sem cortar
          <div key={d.nome} className={`grid items-center text-sm ${nomeLargo ? "grid-cols-1 gap-1 sm:grid-cols-[15rem_1fr] sm:gap-3" : "grid-cols-[7rem_1fr] gap-3"}`}>
            <dt className={`text-texto2 ${nomeLargo ? "sm:truncate" : "truncate"}`} title={nomeLargo ? d.nome : undefined}>{d.nome}</dt>
            <dd className="flex items-center gap-2">
              <span className="h-3 rounded-r-[4px] bg-nude-esc" style={{ width: `${(Math.max(0, d.valor) / max) * escala}%`, minWidth: d.valor > 0 ? 2 : 0 }} />
              <span className="whitespace-nowrap tabular-nums text-carvao">{formatar(d.valor)}{d.nota && <span className="text-texto2"> ({d.nota})</span>}</span>
            </dd>
          </div>
        ))}
      </dl>
      {nota && <p className="mt-4 text-xs leading-snug text-texto2">{nota}</p>}
    </figure>
  );
}
