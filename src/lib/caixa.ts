// Caixa e comandas: contas em cima das comandas importadas do Gendo.
// Funcoes puras, sem banco. A comanda guardada no portal nao tem dado de cliente.

export type LinhaComanda = {
  numero: number;
  data: string; // AAAA-MM-DD
  valor: number; // bruto; negativo = estorno
  desconto: number;
  status: string; // Fechada | Aberta
  pagamento: string | null; // "R$ 100,00 Dinheiro em 26/05", uma linha por parcela, ou "--"
  servicos: string | null; // "Escova em 06/10, Matização em 06/10"
};

export type MesCaixa = { mes: string; fechadas: number; bruto: number; descontos: number; liquido: number; ticket: number | null };

export type ResumoCaixa = {
  de: string;
  ate: string;
  fechadas: number;
  comVenda: number; // fechadas com valor acima de zero (sem estornos)
  bruto: number;
  descontos: number;
  liquido: number;
  ticketMedio: number | null;
  ticketMediano: number | null;
  meses: MesCaixa[];
  formas: { nome: string; valor: number }[];
  semForma: number; // liquido das comandas fechadas sem forma de pagamento registrada
  itens: { nome: string; vezes: number }[];
  ultimaFechada: string | null; // data da ultima comanda fechada (de toda a base)
  abertas: { total: number; valor: number; maisAntiga: string | null; porMes: { mes: string; quantidade: number; valor: number }[] };
};

const centavos = (n: number) => Math.round(n * 100) / 100;

/** "1.234,56" -> 1234.56 */
const dinheiro = (s: string) => Number(s.replace(/\./g, "").replace(",", ".")) || 0;

const FORMAS: [RegExp, string][] = [
  [/pix/i, "Pix"],
  [/cr[eé]dito/i, "Crédito"],
  [/d[eé]bito/i, "Débito"],
  [/dinheiro/i, "Dinheiro"],
  [/boleto/i, "Boleto"],
  [/transfer/i, "Transferência"],
];

/** Uma entrada por parcela: "R$ 129,00 Cartão de Crédito - 1/2 em 11/10 - Venc: 11/10/25 R$ 129,00 ...". */
export function pagamentosDe(texto: string | null): { forma: string; valor: number }[] {
  const saida: { forma: string; valor: number }[] = [];
  for (const m of (texto ?? "").replace(/\s+/g, " ").matchAll(/R\$\s*(-?[\d.]+,\d{2})\s+(.+?)\s+em\s+\d{1,2}\/\d{1,2}/g)) {
    const bruto = m[2].replace(/\s+-\s+\d+\/\d+$/, "").trim();
    saida.push({ forma: FORMAS.find(([re]) => re.test(bruto))?.[1] ?? bruto, valor: dinheiro(m[1]) });
  }
  return saida;
}

/** "Escova em 06/10, Matização em 06/10" -> ["Escova", "Matização"] */
export function itensDe(texto: string | null) {
  return (texto ?? "").split(",").map((s) => s.replace(/\s+em\s+\d{1,2}\/\d{1,2}\s*$/, "").replace(/\s+/g, " ").trim()).filter(Boolean);
}

/** Resume as comandas fechadas entre `de` e `ate` (inclusive) e todas as que estao em aberto. */
export function resumoCaixa(linhas: LinhaComanda[], de: string, ate: string): ResumoCaixa {
  const fechadas = linhas.filter((l) => l.status === "Fechada");
  const noPeriodo = fechadas.filter((l) => l.data >= de && l.data <= ate);

  const meses = new Map<string, { fechadas: number; comVenda: number; bruto: number; descontos: number }>();
  const formas = new Map<string, number>();
  const itens = new Map<string, number>();
  const tickets: number[] = [];
  let bruto = 0, descontos = 0, semForma = 0;

  for (const l of noPeriodo) {
    const valor = Number(l.valor) || 0;
    const desc = Number(l.desconto) || 0;
    bruto += valor;
    descontos += desc;
    const chave = `${l.data.slice(0, 7)}-01`;
    let m = meses.get(chave);
    if (!m) meses.set(chave, (m = { fechadas: 0, comVenda: 0, bruto: 0, descontos: 0 }));
    m.fechadas++;
    m.bruto += valor;
    m.descontos += desc;
    if (valor > 0) {
      m.comVenda++;
      tickets.push(valor - desc);
    }
    const pagos = pagamentosDe(l.pagamento);
    if (pagos.length === 0) semForma += valor - desc;
    for (const p of pagos) formas.set(p.forma, (formas.get(p.forma) ?? 0) + p.valor);
    for (const nome of itensDe(l.servicos)) itens.set(nome, (itens.get(nome) ?? 0) + 1);
  }

  const liquido = bruto - descontos;
  const ordenados = [...tickets].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);

  const abertas = linhas.filter((l) => l.status !== "Fechada");
  const abertasPorMes = new Map<string, { quantidade: number; valor: number }>();
  for (const l of abertas) {
    const chave = `${l.data.slice(0, 7)}-01`;
    const a = abertasPorMes.get(chave) ?? { quantidade: 0, valor: 0 };
    a.quantidade++;
    a.valor += Number(l.valor) || 0;
    abertasPorMes.set(chave, a);
  }

  return {
    de,
    ate,
    fechadas: noPeriodo.length,
    comVenda: tickets.length,
    bruto: centavos(bruto),
    descontos: centavos(descontos),
    liquido: centavos(liquido),
    ticketMedio: tickets.length ? centavos(liquido / tickets.length) : null,
    ticketMediano: ordenados.length ? centavos(ordenados.length % 2 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2) : null,
    meses: [...meses.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([mes, m]) => ({
      mes,
      fechadas: m.fechadas,
      bruto: centavos(m.bruto),
      descontos: centavos(m.descontos),
      liquido: centavos(m.bruto - m.descontos),
      ticket: m.comVenda ? centavos((m.bruto - m.descontos) / m.comVenda) : null,
    })),
    formas: [...formas.entries()].map(([nome, valor]) => ({ nome, valor: centavos(valor) })).sort((a, b) => b.valor - a.valor),
    semForma: centavos(semForma),
    itens: [...itens.entries()].map(([nome, vezes]) => ({ nome, vezes })).sort((a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome, "pt-BR")),
    ultimaFechada: fechadas.reduce<string | null>((u, l) => (!u || l.data > u ? l.data : u), null),
    abertas: {
      total: abertas.length,
      valor: centavos(abertas.reduce((s, l) => s + (Number(l.valor) || 0), 0)),
      maisAntiga: abertas.reduce<string | null>((u, l) => (!u || l.data < u ? l.data : u), null),
      porMes: [...abertasPorMes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([mes, a]) => ({ mes, quantidade: a.quantidade, valor: centavos(a.valor) })),
    },
  };
}
