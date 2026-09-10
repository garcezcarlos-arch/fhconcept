export type Formato = {
  id: string;
  numero: string;
  tipo: string;
  nome: string;
  texto: string;
  preco: string;
  ficha: [string, string][];
  cta: string;
};

export const FORMATOS: Formato[] = [
  { id: "turma", numero: "01", tipo: "Turma", nome: "Curso prático em turma",
    texto: "Grupo reduzido, prática em modelo real e conteúdo adaptado ao nível da turma. É o formato principal, e o que mais transforma a agenda de quem faz.",
    preco: "R$ 700 a R$ 2.200 por pessoa",
    ficha: [["Duração", "1 a 3 dias"], ["Turma", "Até 8 alunas"], ["Prática", "Modelo real"], ["Inclui", "Certificado e suporte"]],
    cta: "Entrar na lista da próxima turma" },
  { id: "individual", numero: "02", tipo: "Individual", nome: "Curso particular individual",
    texto: "Conteúdo desenhado só para você, no seu ritmo e a partir das suas dificuldades reais. Para quem quer avançar rápido em um ponto específico.",
    preco: "Sob consulta",
    ficha: [["Duração", "Combinada"], ["Turma", "Individual"], ["Conteúdo", "Sob medida"]],
    cta: "Quero me inscrever" },
  { id: "shadow-day", numero: "03", tipo: "Imersão", nome: "Shadow Day",
    texto: "Um dia inteiro acompanhando atendimentos reais: diagnóstico, planejamento, execução, finalização e orientação à cliente. Ao final, uma hora de mentoria sobre o que você viu.",
    preco: "R$ 950 o dia",
    ficha: [["Duração", "1 dia completo"], ["Formato", "Acompanhamento"], ["Extra", "1 h de mentoria ao final"]],
    cta: "Quero me inscrever" },
  { id: "assistido", numero: "04", tipo: "Prática", nome: "Atendimento assistido",
    texto: "Aqui quem executa é você. O procedimento é feito em modelo ou cliente, com supervisão e orientação da Fernanda do começo ao fim. É o formato que mais tira o medo.",
    preco: "R$ 900 a R$ 1.200 o dia",
    ficha: [["Duração", "1 dia"], ["Formato", "Você executa"], ["Supervisão", "Integral"]],
    cta: "Quero me inscrever" },
  { id: "mentoria", numero: "05", tipo: "Consultoria", nome: "Mentoria técnica presencial",
    texto: "Sem modelo e sem tesoura: análise de casos reais, diagnóstico, planejamento e tomada de decisão. Para a profissional que já executa bem e precisa acertar o julgamento técnico.",
    preco: "R$ 1.200 o dia",
    ficha: [["Duração", "1 dia"], ["Formato", "Análise de casos"], ["Foco", "Suas dificuldades"]],
    cta: "Quero me inscrever" },
  { id: "pacote", numero: "06", tipo: "Sob medida", nome: "Pacotes personalizados",
    texto: "Combinação de formatos — curso prático, atendimento assistido, imersão e mentoria — estruturada conforme o seu nível técnico e o resultado que você quer alcançar.",
    preco: "Sob consulta",
    ficha: [["Duração", "1 ou mais dias"], ["Formato", "Combinado"], ["Para", "Quem quer plano completo"]],
    cta: "Montar meu pacote" },
];

export const nomeFormato = (id: string) => FORMATOS.find((f) => f.id === id)?.nome ?? id;

export function dataCurta(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
export function periodo(ini: string, fim: string | null) {
  if (!fim || fim === ini) return dataCurta(ini);
  return `${dataCurta(ini)} a ${dataCurta(fim)}`;
}
