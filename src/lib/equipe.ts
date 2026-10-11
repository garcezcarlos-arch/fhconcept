// Equipe: fonte unica para a home e para /equipe.
// Titulo e texto de cada uma foram escritos pela Fernanda (11/10/2026) e entram na integra.

export type Pessoa = {
  slug: string;
  nome: string;
  primeiroNome: string;
  /** linha logo abaixo do nome, como a Fernanda escreveu */
  titulo: string;
  /** versao curta do titulo, para o cartao da home */
  papel: string;
  /** uma frase do proprio texto, para o cartao da home */
  resumo: string;
  texto: string[];
  /** frase de fechamento, quando o texto termina com uma */
  fecho?: string;
  foto: string;
  alt: string;
  posicao: string;
  insta: string;
};

export const EQUIPE: Pessoa[] = [
  {
    slug: "fernanda",
    nome: "Fernanda Hosang",
    primeiroNome: "Fernanda",
    titulo: "Fundadora do Fernanda Hosang Concept, especialista em transformação de cor, visagista e educadora técnica",
    papel: "Transformação de cor, visagismo e educação técnica",
    resumo: "Une conhecimento técnico, sensibilidade e olhar artístico para criar transformações de cor que valorizam a identidade de cada cliente.",
    texto: [
      "Fernanda une conhecimento técnico, sensibilidade e olhar artístico para criar transformações de cor que valorizam a identidade de cada cliente. Suas especialidades incluem colorimetria, correção de cor e mechas personalizadas — dos loiros e morenas iluminadas às mechas pontuais e criativas, que destacam contornos, criam contrastes e expressam personalidade.",
      "Seu olhar como visagista considera os traços, o estilo, a rotina e os desejos de cada pessoa. Da iluminação sutil à mudança completa de cor, cada resultado é planejado com escuta, diagnóstico capilar, precisão técnica e cuidado com a saúde dos fios.",
    ],
    foto: "/galeria/equipe-fernanda.jpg",
    alt: "Fernanda Hosang",
    posicao: "object-[50%_18%]",
    insta: "https://instagram.com/fernandahosangconcept",
  },
  {
    slug: "juliana",
    nome: "Juliana Araújo",
    primeiroNome: "Juliana",
    titulo: "Especialista em cabelos ondulados, cacheados e crespos, cortes e tratamentos capilares",
    papel: "Ondulados, cacheados e crespos, cortes e tratamentos",
    resumo: "Dedica seu trabalho a valorizar a textura natural dos cabelos, unindo técnica e cuidado personalizado para realçar a definição, o movimento e a beleza de cada fio.",
    texto: [
      "Há 6 anos na área da beleza, Juliana dedica seu trabalho a valorizar a textura natural dos cabelos, unindo técnica e cuidado personalizado para realçar a definição, o movimento e a beleza de cada fio.",
      "Suas especialidades incluem cortes para ondulados, cacheados e crespos, soltura de cachos, finalizações e tratamentos voltados à recuperação de fios danificados. A partir das necessidades de cada cabelo, personaliza os cuidados e o cronograma capilar, com atenção especial aos fios sensibilizados por processos químicos.",
      "Seu atendimento também inclui orientações para facilitar os cuidados em casa e manter os resultados no dia a dia.",
      "Para Juliana, valorizar os cachos é valorizar a identidade. Seu propósito é ajudar cada cliente a conhecer o próprio cabelo, reconhecer sua beleza e sentir confiança para usá-lo com liberdade.",
    ],
    foto: "/galeria/equipe-juliana.jpg",
    alt: "Juliana Araújo no salão",
    posicao: "object-[50%_22%]",
    insta: "https://instagram.com/juaraujocachos",
  },
  {
    slug: "laura",
    nome: "Laura Elisa",
    primeiroNome: "Laura",
    titulo: "Estética facial e design de sobrancelhas",
    papel: "Estética facial e design de sobrancelhas",
    resumo: "Design de sobrancelhas, limpeza de pele e protocolos faciais personalizados, desenvolvidos com técnica, precisão e atenção aos detalhes.",
    texto: [
      "Laura Elisa oferece serviços especializados em estética facial e design de sobrancelhas, com foco na valorização da beleza natural e no cuidado personalizado. Cada atendimento é realizado de forma individualizada, considerando as características, a personalidade e as necessidades específicas de cada cliente.",
      "Seu trabalho inclui design de sobrancelhas, limpeza de pele e protocolos faciais personalizados, desenvolvidos com técnica, precisão e atenção aos detalhes. O objetivo é proporcionar resultados harmoniosos e naturais, respeitando a identidade de cada pessoa.",
      "Com um atendimento acolhedor e profissional, Laura Elisa promove uma experiência que integra bem-estar, autoestima e confiança.",
    ],
    fecho: "Cuidado personalizado para realçar sua beleza com elegância e naturalidade.",
    foto: "/galeria/equipe-laura.jpg",
    alt: "Laura Elisa no salão",
    posicao: "object-[50%_18%]",
    insta: "https://instagram.com/lauraelisa.beauty",
  },
];
