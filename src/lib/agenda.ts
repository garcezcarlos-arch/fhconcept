// Raio-x da agenda: contas em cima dos agendamentos importados do Gendo.
// Funcoes puras, sem banco: a pagina busca as linhas e passa para ca.
// Daqui so saem contagens e medias; nenhum dado de cliente.

export type LinhaAgenda = {
  cliente_codigo: number | null;
  data: string; // AAAA-MM-DD
  hora_inicio: string | null; // HH:MM:SS
  hora_fim: string | null;
  status: string;
  categoria: string | null;
  servico: string | null; // um ou mais servicos separados por virgula
  profissional: string | null;
};

export const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
export const DIAS_LONGOS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

export type ServicoRaioX = { nome: string; vezes: number; duracaoTipica: number | null; quem: string | null };
export type ProfissionalRaioX = { nome: string; atendimentos: number; minutos: number; clientes: number; cancelados: number };
export type Ocupacao = {
  horas: number[]; // linhas: hora cheia de inicio (13 = das 13h as 14h)
  dias: number[]; // colunas: indice em DIAS
  celulas: number[][]; // [linha][coluna] = atendimentos acontecendo ao mesmo tempo, em media
  max: number;
  pico: { dia: number; hora: number; valor: number } | null;
};

export type RaioX = {
  de: string;
  ate: string;
  semanas: number;
  marcados: number; // tudo o que entrou na agenda no periodo
  atendimentos: number; // marcados menos cancelados e faltas
  cancelados: number;
  faltas: number;
  clientes: number;
  recorrentes: number; // clientes com 2 ou mais atendimentos no periodo
  minutos: number;
  duracaoMedia: number | null;
  servicos: ServicoRaioX[];
  categorias: { nome: string; valor: number }[];
  mediaPorDia: number[]; // 7 posicoes, segunda primeiro: atendimentos por dia daquele tipo
  ocupacao: Ocupacao;
  profissionais: ProfissionalRaioX[];
  frequencia: { nome: string; valor: number }[];
};

const FORA = new Set(["Cancelado", "Cliente Ausente"]);
const DIA_MS = 864e5;

const minutos = (h: string | null) => {
  const m = h ? /^(\d{1,2}):(\d{2})/.exec(h) : null;
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const meioDia = (data: string) => Date.parse(`${data}T12:00:00Z`);
/** 0 = segunda ... 6 = domingo. Meio-dia em UTC: nao depende de fuso. */
const diaDaSemana = (data: string) => (new Date(meioDia(data)).getUTCDay() + 6) % 7;
const primeiroNome = (nome: string | null) => (nome ?? "").trim().split(/\s+/)[0] ?? "";
const mediana = (v: number[]) => {
  if (!v.length) return null;
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : Math.round((o[m - 1] + o[m]) / 2);
};
const maisComum = (c: Map<string, number>) => [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))[0]?.[0] ?? null;

/** "A,  B + C, " -> ["A", "B + C"]: a virgula separa servicos; o "+" faz parte do nome. */
export function servicosDe(texto: string | null) {
  return (texto ?? "").split(",").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/**
 * Resume as linhas da agenda entre `de` e `ate` (inclusive).
 * `ativas`: primeiros nomes das profissionais de hoje; as demais somam em "Outras".
 */
export function raioX(linhas: LinhaAgenda[], de: string, ate: string, ativas: readonly string[]): RaioX {
  const noPeriodo = linhas.filter((l) => l.data >= de && l.data <= ate);
  const totalDias = Math.max(1, Math.round((meioDia(ate) - meioDia(de)) / DIA_MS) + 1);

  // quantas segundas, tercas... existem no periodo (para as medias)
  const diasNoPeriodo = Array<number>(7).fill(0);
  for (let i = 0; i < totalDias; i++) diasNoPeriodo[(diaDaSemana(de) + i) % 7]++;

  const servicos = new Map<string, { vezes: number; duracoes: number[]; quem: Map<string, number> }>();
  const categorias = new Map<string, number>();
  const porCliente = new Map<number, number>();
  const porDia = Array<number>(7).fill(0);
  const grade = Array.from({ length: 24 }, () => Array<number>(7).fill(0)); // [hora][dia] em horas ocupadas
  const profs = new Map<string, { atendimentos: number; minutos: number; clientes: Set<number>; cancelados: number }>();
  const prof = (nome: string) => {
    let p = profs.get(nome);
    if (!p) profs.set(nome, (p = { atendimentos: 0, minutos: 0, clientes: new Set(), cancelados: 0 }));
    return p;
  };

  let atendimentos = 0, cancelados = 0, faltas = 0, minutosTotal = 0, comDuracao = 0;

  for (const l of noPeriodo) {
    const pn = primeiroNome(l.profissional);
    const nomeProf = ativas.includes(pn) ? pn : "Outras";

    if (FORA.has(l.status)) {
      if (l.status === "Cancelado") cancelados++;
      else faltas++;
      prof(nomeProf).cancelados++;
      continue;
    }

    atendimentos++;
    const dia = diaDaSemana(l.data);
    porDia[dia]++;
    if (l.cliente_codigo != null) porCliente.set(l.cliente_codigo, (porCliente.get(l.cliente_codigo) ?? 0) + 1);
    if (l.categoria) categorias.set(l.categoria.trim(), (categorias.get(l.categoria.trim()) ?? 0) + 1);

    const ini = minutos(l.hora_inicio);
    const fim = minutos(l.hora_fim);
    const dur = ini != null && fim != null && fim > ini && fim - ini <= 12 * 60 ? fim - ini : null;

    const p = prof(nomeProf);
    p.atendimentos++;
    if (l.cliente_codigo != null) p.clientes.add(l.cliente_codigo);

    if (dur != null && ini != null && fim != null) {
      minutosTotal += dur;
      comDuracao++;
      p.minutos += dur;
      for (let h = Math.floor(ini / 60); h * 60 < fim && h < 24; h++) {
        grade[h][dia] += (Math.min(fim, (h + 1) * 60) - Math.max(ini, h * 60)) / 60;
      }
    }

    const nomes = servicosDe(l.servico);
    for (const nome of nomes) {
      let s = servicos.get(nome);
      if (!s) servicos.set(nome, (s = { vezes: 0, duracoes: [], quem: new Map() }));
      s.vezes++;
      if (pn) s.quem.set(pn, (s.quem.get(pn) ?? 0) + 1);
      // a duracao e do agendamento inteiro: so vale para o servico quando ele veio sozinho
      if (nomes.length === 1 && dur != null) s.duracoes.push(dur);
    }
  }

  // ocupacao: media de atendimentos simultaneos em cada hora de cada dia da semana
  const media = grade.map((linha) => linha.map((v, d) => (diasNoPeriodo[d] ? v / diasNoPeriodo[d] : 0)));
  const horasComGente = media.map((linha, h) => (Math.max(...linha) >= 0.05 ? h : -1)).filter((h) => h >= 0);
  const horas = horasComGente.length ? Array.from({ length: horasComGente.at(-1)! - horasComGente[0] + 1 }, (_, i) => horasComGente[0] + i) : [];
  const dias = [0, 1, 2, 3, 4, 5, 6].filter((d) => porDia[d] > 0);
  const celulas = horas.map((h) => dias.map((d) => media[h][d]));
  let pico: Ocupacao["pico"] = null;
  for (let i = 0; i < horas.length; i++) {
    for (let j = 0; j < dias.length; j++) {
      if (!pico || celulas[i][j] > pico.valor) pico = { dia: dias[j], hora: horas[i], valor: celulas[i][j] };
    }
  }

  const visitas = [...porCliente.values()];
  const faixa = (min: number, max: number) => visitas.filter((n) => n >= min && n <= max).length;
  const ordemProf = [...ativas.filter((a) => profs.has(a)), ...(profs.has("Outras") ? ["Outras"] : [])];

  return {
    de,
    ate,
    semanas: totalDias / 7,
    marcados: noPeriodo.length,
    atendimentos,
    cancelados,
    faltas,
    clientes: porCliente.size,
    recorrentes: visitas.filter((n) => n >= 2).length,
    minutos: minutosTotal,
    duracaoMedia: comDuracao ? Math.round(minutosTotal / comDuracao) : null,
    servicos: [...servicos.entries()]
      .map(([nome, s]) => ({ nome, vezes: s.vezes, duracaoTipica: mediana(s.duracoes), quem: maisComum(s.quem) }))
      .sort((a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome, "pt-BR")),
    categorias: [...categorias.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor),
    mediaPorDia: porDia.map((n, d) => (diasNoPeriodo[d] ? n / diasNoPeriodo[d] : 0)),
    ocupacao: { horas, dias, celulas, max: pico?.valor ?? 0, pico },
    profissionais: ordemProf.map((nome) => {
      const p = profs.get(nome)!;
      return { nome, atendimentos: p.atendimentos, minutos: p.minutos, clientes: p.clientes.size, cancelados: p.cancelados };
    }),
    frequencia: [
      { nome: "1 vez", valor: faixa(1, 1) },
      { nome: "2 a 3 vezes", valor: faixa(2, 3) },
      { nome: "4 a 6 vezes", valor: faixa(4, 6) },
      { nome: "7 ou mais", valor: faixa(7, Infinity) },
    ],
  };
}
