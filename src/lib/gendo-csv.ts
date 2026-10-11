// Leitura dos arquivos "Salvar em CSV" do Gendo. Tudo aqui roda no navegador:
// o arquivo e lido no computador de quem importa e so os campos abaixo seguem
// para o servidor. CPF, endereco, e-mail, comentarios e observacoes ficam de fora.
//
// Formato visto nas exportacoes de 11/10/2026: separador ";", campos entre aspas,
// ISO-8859-1 (clientes, agenda, servicos, produtos) ou UTF-8 com BOM (comandas).

export type TipoArquivo = "clientes" | "agenda" | "comandas" | "servicos" | "produtos";

export type ClienteCsv = { codigo: number; nome: string; telefone: string | null; nascDia: number | null; nascMes: number | null; nascAno: number | null; visitas: number; ultimaVisita: string | null };
export type AgendamentoCsv = { cliente: number | null; data: string; inicio: string | null; fim: string | null; status: string; categoria: string; servico: string; profissional: string };
export type ComandaCsv = { numero: number; data: string; valor: number; desconto: number; saldo: number; status: string; pagamento: string; servicos: string };
export type ServicoCsv = { codigo: number; nome: string; categoria: string; preco: number; comissao: number | null; duracaoMin: number | null };
export type ProdutoCsv = { codigo: number; nome: string; categoria: string; preco: number; custo: number | null; quantidade: number | null; comissao: number | null };

export type ArquivoLido =
  | { tipo: "clientes"; linhas: ClienteCsv[]; ignoradas: number }
  | { tipo: "agenda"; linhas: AgendamentoCsv[]; clientes: ClienteCsv[]; de: string; ate: string; ignoradas: number }
  | { tipo: "comandas"; linhas: ComandaCsv[]; ignoradas: number }
  | { tipo: "servicos"; linhas: ServicoCsv[]; ignoradas: number }
  | { tipo: "produtos"; linhas: ProdutoCsv[]; ignoradas: number };

/** Bytes -> texto. UTF-8 quando tem BOM ou quando decodifica sem erro; senao Windows-1252. */
export function decodificar(bytes: Uint8Array): string {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return new TextDecoder("utf-8").decode(bytes.subarray(3));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

/** CSV com ";" e aspas duplas; aceita quebra de linha e ";" dentro de aspas. */
export function lerCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; } else aspas = false;
      } else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ";") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); campo = "";
      if (linha.length > 1 || linha[0] !== "") linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo !== "" || linha.length > 0) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

// ---------- conversores de campo ----------

const limpar = (v: string | undefined) => (v ?? "").trim();

/** "1.234,56" -> 1234.56 ; vazio ou invalido -> null */
export function dinheiro(v: string | undefined): number | null {
  const s = limpar(v);
  if (!s) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function inteiro(v: string | undefined): number | null {
  const s = limpar(v);
  return /^-?\d+$/.test(s) ? Number(s) : null;
}

const valida = (ano: number, mes: number, dia: number) => {
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
};
const iso = (ano: number, mes: number, dia: number) => `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

/** "31/12/2025" -> "2025-12-31" */
export function dataBr(v: string | undefined): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(limpar(v));
  if (!m) return null;
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return ano >= 2000 && ano <= 2100 && valida(ano, mes, dia) ? iso(ano, mes, dia) : null;
}

/** "2026-09-30" (ou vazio / "0000-00-00") -> data ISO ou null */
export function dataIso(v: string | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(limpar(v));
  if (!m) return null;
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return ano >= 2000 && ano <= 2100 && valida(ano, mes, dia) ? iso(ano, mes, dia) : null;
}

/** Nascimento do Gendo: "15/03/1988", "15/03/-0001" (sem ano) ou "--/--/----". */
export function nascimento(v: string | undefined): { dia: number | null; mes: number | null; ano: number | null } {
  const m = /^(\d{2})\/(\d{2})\/(-?\d{4})$/.exec(limpar(v));
  if (!m) return { dia: null, mes: null, ano: null };
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || !valida(2000, mes, dia)) return { dia: null, mes: null, ano: null }; // 2000 e bissexto: aceita 29/02
  const anoOk = ano >= 1900 && ano <= new Date().getFullYear() && valida(ano, mes, dia);
  return { dia, mes, ano: anoOk ? ano : null };
}

/** So digitos, com DDI. 10 ou 11 digitos ganham o DDI (55 por padrao). */
export function telefone(v: string | undefined, ddi = "55"): string | null {
  const d = limpar(v).replace(/\D/g, "");
  const p = limpar(ddi).replace(/\D/g, "") || "55";
  if (d.length === 10 || d.length === 11) return p + d;
  if (d.length >= 12 && d.length <= 15) return d;
  return null;
}

/** "1h30min", "45min", "2h" -> minutos */
export function duracao(v: string | undefined): number | null {
  const m = /^(?:(\d+)h)?(?:(\d+)min)?$/.exec(limpar(v).toLowerCase().replace(/\s/g, ""));
  if (!m || (!m[1] && !m[2])) return null;
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
}

const hora = (v: string | undefined) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(limpar(v)) ? limpar(v) : null);
const texto = (v: string | undefined, max: number) => limpar(v).replace(/\s+/g, " ").slice(0, max);

// ---------- identificacao e conversao por arquivo ----------

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function indice(cabecalho: string[]) {
  const mapa = new Map<string, number>();
  cabecalho.forEach((nome, i) => { const k = semAcento(nome); if (!mapa.has(k)) mapa.set(k, i); }); // 1a ocorrencia vence ("Faturado" repete)
  return (nome: string) => mapa.get(semAcento(nome)) ?? -1;
}

const tem = (col: (n: string) => number, ...nomes: string[]) => nomes.every((n) => col(n) >= 0);

/** Le um arquivo exportado do Gendo. Devolve null quando o cabecalho nao e de nenhum dos cinco tipos. */
export function lerArquivoGendo(bytes: Uint8Array): ArquivoLido | null {
  const tabela = lerCsv(decodificar(bytes));
  if (tabela.length < 1) return null;
  const col = indice(tabela[0]);
  const dados = tabela.slice(1);
  const v = (l: string[], nome: string) => l[col(nome)];
  let ignoradas = 0;

  if (tem(col, "Código", "Nome", "DDI", "Telefone", "Data de Nascimento", "Visitas", "Ultima Visita")) {
    const linhas: ClienteCsv[] = [];
    for (const l of dados) {
      const codigo = inteiro(v(l, "Código"));
      const nome = texto(v(l, "Nome"), 120);
      if (codigo === null || codigo <= 0 || !nome) { ignoradas++; continue; }
      const n = nascimento(v(l, "Data de Nascimento"));
      linhas.push({ codigo, nome, telefone: telefone(v(l, "Telefone"), v(l, "DDI")), nascDia: n.dia, nascMes: n.mes, nascAno: n.ano, visitas: Math.max(0, inteiro(v(l, "Visitas")) ?? 0), ultimaVisita: dataIso(v(l, "Ultima Visita")) });
    }
    return { tipo: "clientes", linhas, ignoradas };
  }

  if (tem(col, "Cód. Paciente", "Paciente", "Responsável", "Data", "Hora Início", "Status", "Tipo de Atendimento")) {
    const linhas: AgendamentoCsv[] = [];
    const clientes = new Map<number, ClienteCsv>();
    for (const l of dados) {
      const data = dataBr(v(l, "Data"));
      const status = texto(v(l, "Status"), 40);
      if (!data || !status) { ignoradas++; continue; }
      const cliente = inteiro(v(l, "Cód. Paciente"));
      linhas.push({ cliente: cliente && cliente > 0 ? cliente : null, data, inicio: hora(v(l, "Hora Início")), fim: hora(v(l, "Hora Fim")), status, categoria: texto(v(l, "Categoria"), 80), servico: texto(v(l, "Tipo de Atendimento"), 160), profissional: texto(v(l, "Responsável"), 80) });
      const nome = texto(v(l, "Paciente"), 120);
      if (cliente && cliente > 0 && nome && !clientes.has(cliente)) {
        clientes.set(cliente, { codigo: cliente, nome, telefone: telefone(v(l, "Telefone")), nascDia: null, nascMes: null, nascAno: null, visitas: 0, ultimaVisita: null });
      }
    }
    const datas = linhas.map((x) => x.data).sort();
    return { tipo: "agenda", linhas, clientes: [...clientes.values()], de: datas[0] ?? "", ate: datas.at(-1) ?? "", ignoradas };
  }

  if (tem(col, "Numero", "Data", "Valor", "Desconto", "Saldo", "Status", "Servicos")) {
    const linhas: ComandaCsv[] = [];
    for (const l of dados) {
      const numero = inteiro(v(l, "Numero"));
      const data = dataBr(v(l, "Data"));
      const status = texto(v(l, "Status"), 40);
      if (numero === null || numero <= 0 || !data || !status) { ignoradas++; continue; }
      linhas.push({ numero, data, valor: dinheiro(v(l, "Valor")) ?? 0, desconto: dinheiro(v(l, "Desconto")) ?? 0, saldo: dinheiro(v(l, "Saldo")) ?? 0, status, pagamento: texto(v(l, "Pagamento"), 1200), servicos: texto(v(l, "Servicos"), 1200) });
    }
    return { tipo: "comandas", linhas, ignoradas };
  }

  if (tem(col, "Código", "Nome", "Categoria", "Preço", "Custo", "Quantidade", "Comissão", "Tempo")) {
    // servicos e produtos saem com o mesmo cabecalho; so servico tem tempo
    const servico = dados.some((l) => limpar(v(l, "Tempo")) !== "");
    if (servico) {
      const linhas: ServicoCsv[] = [];
      for (const l of dados) {
        const codigo = inteiro(v(l, "Código"));
        const nome = texto(v(l, "Nome"), 160);
        if (codigo === null || codigo <= 0 || !nome) { ignoradas++; continue; }
        linhas.push({ codigo, nome, categoria: texto(v(l, "Categoria"), 80), preco: dinheiro(v(l, "Preço")) ?? 0, comissao: dinheiro(v(l, "Comissão")), duracaoMin: duracao(v(l, "Tempo")) });
      }
      return { tipo: "servicos", linhas, ignoradas };
    }
    const linhas: ProdutoCsv[] = [];
    for (const l of dados) {
      const codigo = inteiro(v(l, "Código"));
      const nome = texto(v(l, "Nome"), 160);
      if (codigo === null || codigo <= 0 || !nome) { ignoradas++; continue; }
      linhas.push({ codigo, nome, categoria: texto(v(l, "Categoria"), 80), preco: dinheiro(v(l, "Preço")) ?? 0, custo: dinheiro(v(l, "Custo")), quantidade: inteiro(v(l, "Quantidade")), comissao: dinheiro(v(l, "Comissão")) });
    }
    return { tipo: "produtos", linhas, ignoradas };
  }

  return null;
}

export const NOME_TIPO: Record<TipoArquivo, string> = {
  clientes: "Clientes",
  agenda: "Agenda",
  comandas: "Comandas",
  servicos: "Serviços",
  produtos: "Produtos",
};
