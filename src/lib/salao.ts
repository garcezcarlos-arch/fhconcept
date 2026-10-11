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

/** Dia de hoje em Sao Paulo (AAAA-MM-DD), deslocado em `dias` (negativo = passado). */
export function diaSP(dias = 0) {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const d = new Date(`${hoje}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** "5547999990000" -> "(47) 99999-0000"; fora do padrao brasileiro volta com "+". */
export function telefoneBr(t: string | null) {
  if (!t) return "";
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(t);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : `+${t}`;
}

/** 90 -> "1 h 30"; 45 -> "45 min" */
export function duracaoBr(min: number | null) {
  if (min == null) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`) : `${m} min`;
}

/** Erro do banco que significa "a migration ainda nao rodou". */
export function semTabela(erro: { code?: string } | null | undefined) {
  return erro?.code === "42P01" || erro?.code === "PGRST205";
}
