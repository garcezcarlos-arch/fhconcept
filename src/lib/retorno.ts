// Retorno de clientes sumidas: texto da mensagem e pequenos formatadores.
// Sem imports de servidor: o botao do WhatsApp (cliente) tambem usa.

export const CHAVE_MENSAGEM = "mensagem_retorno";
export const MAX_MENSAGEM = 600;

/** Texto inicial; a Fernanda pode trocar pelo painel. {nome} vira o primeiro nome. */
export const MENSAGEM_PADRAO =
  "Oi, {nome}! Aqui é da FH Concept. Faz um tempo que você não vem nos ver e sentimos sua falta. Quer que eu veja um horário para você nesta semana?";

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
