// Numeros do salao que vem do Gendo. O Gendo nao tem API: entram por
// lancamento no painel (e, depois, por arquivo CSV exportado de la).

export const GENDO = {
  agenda: "https://vema754.adm.gendo.app/administrator/front/#/agenda/calendario",
  agendamentoOnline: "https://vema754.gendo.app/",
};

/** Profissionais ativas; quem ja saiu entra somada em "Outras". */
export const PROFISSIONAIS = ["Fernanda", "Juliana", "Laura"] as const;

export type MesSalao = {
  mes: string; // AAAA-MM-01
  agendamentos: number;
  cancelados: number;
  faltas: number | null;
  porProfissional: Record<string, number>;
  comandasFechadas: number;
  valorBruto: number;
  descontos: number;
  origem: string;
};

export type RetratoSalao = {
  data: string; // AAAA-MM-DD
  clientesTotal: number;
  clientes90d: number;
  clientesMais90d: number;
  clientesSemVisita: number;
  clientesSumidas: number;
  comandasAbertas: number;
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-09-01" -> "set/26" (ou "setembro de 2026"). Sem Date: nao depende de fuso. */
export function rotuloMes(mes: string, longo = false) {
  const [ano, m] = mes.split("-");
  const i = Number(m) - 1;
  return longo ? `${MESES_LONGOS[i]} de ${ano}` : `${MESES[i]}/${ano.slice(2)}`;
}

/** "2026-10-11" -> "11/10/2026" */
export function rotuloDia(data: string) {
  const [ano, m, d] = data.split("-");
  return `${d}/${m}/${ano}`;
}

export function porProfissional(valor: unknown): Record<string, number> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {};
  const saida: Record<string, number> = {};
  for (const [nome, n] of Object.entries(valor as Record<string, unknown>)) {
    const q = Number(n);
    if (Number.isFinite(q) && q > 0) saida[nome] = q;
  }
  return saida;
}

type LinhaMensal = { mes: string; agendamentos: number; cancelados: number; faltas: number | null; por_profissional: unknown; comandas_fechadas: number; valor_bruto: number; descontos: number; origem: string };
type LinhaRetrato = { data: string; clientes_total: number; clientes_90d: number; clientes_mais_90d: number; clientes_sem_visita: number; clientes_sumidas: number; comandas_abertas: number };

export function mesDeLinha(l: LinhaMensal): MesSalao {
  return {
    mes: l.mes,
    agendamentos: l.agendamentos,
    cancelados: l.cancelados,
    faltas: l.faltas,
    porProfissional: porProfissional(l.por_profissional),
    comandasFechadas: l.comandas_fechadas,
    valorBruto: Number(l.valor_bruto),
    descontos: Number(l.descontos),
    origem: l.origem,
  };
}

export function retratoDeLinha(l: LinhaRetrato): RetratoSalao {
  return {
    data: l.data,
    clientesTotal: l.clientes_total,
    clientes90d: l.clientes_90d,
    clientesMais90d: l.clientes_mais_90d,
    clientesSemVisita: l.clientes_sem_visita,
    clientesSumidas: l.clientes_sumidas,
    comandasAbertas: l.comandas_abertas,
  };
}

/** Mes corrente em Sao Paulo, como "AAAA-MM". */
export function mesAtual() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${p.find((x) => x.type === "year")!.value}-${p.find((x) => x.type === "month")!.value}`;
}

/** Quantos meses inteiros separam "AAAA-MM" de outro "AAAA-MM". */
export function mesesEntre(de: string, ate: string) {
  const [a1, m1] = de.split("-").map(Number);
  const [a2, m2] = ate.split("-").map(Number);
  return (a2 - a1) * 12 + (m2 - m1);
}
