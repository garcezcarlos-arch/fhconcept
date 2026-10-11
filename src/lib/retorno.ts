// Contato com clientes (sumidas, uma visita, aniversariantes): listas, textos e pequenos formatadores.
// Sem imports de servidor: o botao do WhatsApp (cliente) tambem usa.

export const MAX_MENSAGEM = 600;

/** As listas de contato do salao. `param` e o valor de ?lista= na URL ("" = a primeira). */
export type Lista = "retorno" | "uma_visita" | "aniversario";

export type ConfigLista = {
  id: Lista;
  param: string;
  nome: string;
  view: "salao_retorno" | "salao_uma_visita" | "salao_aniversariantes";
  /** chave do texto em salao_config */
  chave: string;
  /** texto inicial; a Fernanda pode trocar pelo painel. {nome} vira o primeiro nome */
  padrao: string;
  descricao: string;
  /** dias sem aparecer de novo em "a chamar" depois de um contato; null = a view ja limita (aniversario: uma vez por ano) */
  janelaDias: number | null;
  abas: [string, string];
  vazio: [string, string];
};

export const LISTAS: ConfigLista[] = [
  {
    id: "retorno",
    param: "",
    nome: "Sumidas",
    view: "salao_retorno",
    chave: "mensagem_retorno",
    padrao: "Oi, {nome}! Aqui é da FH Concept. Faz um tempo que você não vem nos ver e sentimos sua falta. Quer que eu veja um horário para você nesta semana?",
    descricao: "Clientes com 5 ou mais visitas que não vêm há mais de 60 dias, das mais fiéis para as menos.",
    janelaDias: 30,
    abas: ["A chamar", "Chamadas nos últimos 30 dias"],
    vazio: ["Ninguém para chamar agora.", "Nenhuma cliente chamada nos últimos 30 dias."],
  },
  {
    id: "uma_visita",
    param: "uma-visita",
    nome: "Vieram uma vez",
    view: "salao_uma_visita",
    chave: "mensagem_uma_visita",
    padrao: "Oi, {nome}! Aqui é da FH Concept. Foi um prazer receber você no salão. Queria saber como ficou o resultado depois da sua visita. Quando quiser voltar, é só me chamar que eu vejo um horário para você.",
    descricao: "Clientes com uma visita só, feita há mais de 45 dias e há menos de um ano, da mais recente para a mais antiga.",
    janelaDias: 90,
    abas: ["A chamar", "Chamadas nos últimos 90 dias"],
    vazio: ["Ninguém para chamar agora.", "Nenhuma cliente chamada nos últimos 90 dias."],
  },
  {
    id: "aniversario",
    param: "aniversario",
    nome: "Aniversariantes",
    view: "salao_aniversariantes",
    chave: "mensagem_aniversario",
    padrao: "Oi, {nome}! Aqui é da FH Concept. Passando para desejar um feliz aniversário! Que o seu novo ano seja lindo. Um abraço de toda a equipe.",
    descricao: "Clientes que fazem aniversário neste mês, em ordem de dia. Só entra quem tem a data de nascimento no cadastro.",
    janelaDias: null,
    abas: ["A parabenizar", "Já parabenizadas neste ano"],
    vazio: ["Ninguém para parabenizar agora.", "Nenhuma cliente parabenizada neste ano."],
  },
];

export const listaDe = (param: string | undefined) => LISTAS.find((l) => l.param === (param ?? "")) ?? LISTAS[0];
export const listaPorId = (id: unknown) => LISTAS.find((l) => l.id === id) ?? null;

export const RESULTADOS: Record<string, string> = {
  chamada: "Chamada, sem resposta ainda",
  respondeu: "Respondeu",
  agendou: "Agendou",
  sem_interesse: "Sem interesse agora",
};

/** "MARIA DA SILVA" -> "Maria"; nome vazio ou so com simbolos -> "" */
export function primeiroNome(nome: string | null) {
  const p = (nome ?? "").trim().split(/\s+/)[0]?.replace(/[^\p{L}'-]/gu, "") ?? "";
  return p ? p[0].toLocaleUpperCase("pt-BR") + p.slice(1).toLocaleLowerCase("pt-BR") : "";
}

/** Troca {nome}; sem nome, tira tambem a virgula e o espaco que sobrariam ("Oi, !" -> "Oi!"). */
export function montarMensagem(modelo: string, nome: string | null) {
  const p = primeiroNome(nome);
  return (p ? modelo.replaceAll("{nome}", p) : modelo.replace(/,?\s*\{nome\}/g, "")).trim();
}

export function linkWhatsappCliente(telefone: string, mensagem: string) {
  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

/** Dias entre uma data AAAA-MM-DD e hoje (AAAA-MM-DD), em texto curto. */
export function haQuanto(data: string | null, hoje: string) {
  if (!data) return "";
  const dias = Math.round((Date.parse(`${hoje}T12:00:00Z`) - Date.parse(`${data.slice(0, 10)}T12:00:00Z`)) / 864e5);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 60) return `há ${dias} dias`;
  const meses = Math.round(dias / 30);
  return meses < 24 ? `há ${meses} meses` : `há ${Math.round(dias / 365)} anos`;
}
