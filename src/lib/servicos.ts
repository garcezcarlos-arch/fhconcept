// Fonte unica dos servicos do salao. A home e a pagina /servicos leem daqui,
// entao um texto novo da Fernanda entra em um lugar so.
//
// - texto: um item por paragrafo, como ela escreveu
// - itens: atendimentos e duracao; fica de fora quando ainda nao foi informado
// - foto / comparar: opcionais por servico; em /servicos substituem a foto da categoria enquanto o servico esta na tela

export type Servico = {
  slug: string;
  nome: string;
  texto: string[];
  /** atendimento, tempo e, se precisar, uma linha de explicacao */
  itens?: [string, string, string?][];
  /** servico-experiencia com texto longo: chamada, selos, secoes e fecho (so em /servicos) */
  ritual?: { chamada: string; selos: string[]; secoes: { titulo?: string; texto: string[] }[]; fecho: string[] };
  /** foto do proprio servico; sem ela vale a foto da categoria */
  foto?: string;
  alt?: string;
  posicao?: string;
  /** antes e depois: com alca para arrastar ou, para fotos deitadas, uma em cima da outra */
  comparar?: { antes: string; depois: string; alt: string; empilhado?: boolean };
};

export type Categoria = {
  slug: string;
  nome: string;
  /** nome curto para a barra de categorias, quando o nome inteiro nao cabe */
  menu?: string;
  quem: string;
  foto: string;
  alt: string;
  servicos: Servico[];
};

export const PREMIUM = {
  slug: "transformacao-de-cor-premium",
  nome: "Transformação de Cor Premium",
  texto: [
    "Uma experiência completa de coloração, com diagnóstico capilar e planejamento personalizado para criar ou corrigir a cor, valorizando sua beleza e seu estilo. O serviço inclui tratamentos antes e após a química, além de orientações de manutenção para preservar o tom, o brilho e a saúde dos fios.",
  ],
  duracao: "De 3 a 6 horas, conforme o histórico do seu cabelo",
  inclui: [
    "Consultoria, diagnóstico capilar e análise do histórico químico",
    "Visagismo e planejamento personalizado da nova cor",
    "Teste de mecha e avaliação da saúde dos fios",
    "Correção de cor e neutralização de tons indesejados",
    "Mechas, iluminação, coloração e tonalização",
    "Tratamentos de proteção e recuperação da fibra",
    "Corte de transformação, quando necessário",
    "Finalização profissional",
    "Orientação e plano de manutenção por escrito",
  ],
  foto: "/galeria/cor-mechas-caramelo-costas.jpg",
  alt: "Mechas caramelo em cabelo castanho, vistas de costas",
};

export const CATEGORIAS: Categoria[] = [
  {
    slug: "cor",
    nome: "Cor",
    quem: "Fernanda Hosang",
    foto: "/galeria/cor-mechas-loiras-salao.jpg",
    alt: "Mechas loiras em cabelo longo e ondulado, em frente à parede do salão",
    servicos: [
      {
        slug: "coloracao-e-mechas",
        nome: "Coloração e mechas personalizadas",
        texto: [
          "Loiros, morenas iluminadas e balayage criados para valorizar sua beleza e seu estilo. Cada resultado começa com uma avaliação dos fios e do histórico de químicas, para definir os tons e as técnicas mais adequados ao seu cabelo.",
        ],
        itens: [
          ["Mechas criativas", "4 a 6 h"],
          ["Mechas pontuais", "3 a 4 h"],
          ["Mechas ombré hair", "3 a 5 h"],
          ["Mechas moreno iluminado", "3 a 5 h"],
          ["Correção de cor", "3 a 7 h"],
          ["Manutenção de cor", "1 a 2 h"],
        ],
      },
      {
        slug: "correcao-de-cor",
        nome: "Correção de cor",
        comparar: { antes: "/galeria/cor-correcao-antes.jpg", depois: "/galeria/cor-correcao-depois.jpg", alt: "Correção de cor: de mechas alaranjadas a um loiro iluminado" },
        texto: [
          "Um trabalho especializado para corrigir manchas, suavizar tons indesejados e devolver harmonia à cor. Após avaliar os fios e o histórico de químicas, planejamos cada etapa da transformação, respeitando os limites do cabelo e o resultado que você deseja alcançar.",
        ],
        itens: [
          ["Diagnóstico e teste de mecha", "1 h"],
          ["Correção de cor e neutralização de tons indesejados", "4 a 7 h"],
          ["Tratamento de reconstrução acompanhando todas as etapas", "Incluído"],
        ],
      },
      {
        slug: "ruivos",
        nome: "Ruivos personalizados",
        foto: "/galeria/cor-ruivo-ondas.jpg",
        alt: "Ruivo acobreado em cabelo longo com ondas",
        texto: [
          "Dos acobreados naturais aos vermelhos intensos, criamos o ruivo que valoriza sua beleza e expressa sua personalidade. O serviço inclui planejamento da cor e orientações de manutenção para preservar a intensidade, o brilho e a beleza do tom.",
        ],
        itens: [["Limpeza de cor + pré-pigmentação e coloração", "3 a 5 h"]],
      },
      {
        slug: "camuflagem-de-fios-brancos",
        nome: "Camuflagem de fios brancos",
        texto: [
          "Valorize a cor natural do seu cabelo com uma cobertura estratégica, direcionada somente aos fios brancos e preservando os fios naturalmente pigmentados. Planejamos os tons e a aplicação conforme a distribuição dos brancos e o resultado desejado, para um acabamento discreto e harmonioso, que mantém a cor natural e a identidade do seu cabelo.",
        ],
        itens: [["Camuflagem de fios brancos", "1 h"]],
      },
    ],
  },
  {
    slug: "corte",
    nome: "Corte",
    quem: "Fernanda Hosang",
    foto: "/galeria/corte-camadas-loiro.jpg",
    alt: "Corte em camadas longas em cabelo loiro iluminado",
    servicos: [
      {
        slug: "corte-feminino",
        nome: "Corte",
        texto: [
          "Um corte que conecta sua personalidade à imagem que você deseja transmitir, com formas, comprimentos e volumes que valorizam sua expressão. Cada escolha considera seu estilo e sua rotina, com finalização e orientações para os cuidados em casa.",
        ],
        itens: [["Corte feminino", "1 h"]],
      },
      {
        slug: "visagismo",
        nome: "Visagismo",
        texto: [
          "Por meio do visagismo, analisamos seus traços, as proporções do rosto e as características dos fios para definir formas, comprimentos e volumes que valorizem sua expressão. O olhar considera também seu estilo, sua rotina e seus desejos.",
        ],
        itens: [["Consultoria de imagem e visagismo", "Sob consulta"]],
      },
    ],
  },
  {
    slug: "cachos",
    nome: "Ondulados, cacheados e crespos",
    menu: "Cacheados e crespos",
    quem: "Juliana Araujo",
    foto: "/galeria/cachos-longos-definidos.jpg",
    alt: "Cachos longos e definidos em cabelo castanho, em frente à parede do salão",
    servicos: [
      {
        slug: "ondulados-cacheados-e-crespos",
        nome: "Ondulados, cacheados e crespos",
        texto: [
          "Cuidado especializado para valorizar a textura e a beleza natural dos seus fios. Cortes personalizados, soltura de cachos, tratamentos e finalização que realçam a definição e o movimento, com orientações para facilitar os cuidados em casa.",
        ],
        itens: [
          ["Corte especializado em cabelo cacheado", "1 h"],
          ["Tratamento capilar com mapeamento personalizado", "30 min"],
          ["Finalização e definição", "1 h"],
          ["Soltura de cachos", "Sob avaliação"],
        ],
      },
    ],
  },
  {
    slug: "tratamentos",
    nome: "Tratamentos",
    quem: "Fernanda Hosang e Juliana Araujo",
    foto: "/galeria/tratamento-loiro-ondas-costas.jpg",
    alt: "Cabelo loiro longo com ondas e brilho, visto de costas",
    servicos: [
      {
        slug: "tratamentos-capilares",
        nome: "Tratamentos capilares personalizados",
        texto: [
          "Mapeamento capilar personalizado para identificar as necessidades dos fios e definir um protocolo exclusivo. Combinamos produtos profissionais, ozonioterapia, fototerapia e equipamentos de tecnologia avançada para tratar os fios de fora para dentro, com cuidados direcionados à superfície e à estrutura da fibra capilar, valorizando a resistência, a maciez e o brilho.",
        ],
        itens: [
          ["Mapeamento capilar", "20 min"],
          ["Ritual Infusion (reconstrução profunda)", "1 h 30"],
          ["Ritual Élixir (nutrição)", "1 h"],
          ["Ritual Lumière (hidratação)", "1 h"],
          ["Ritual FH Signature", "1 h 30", "Um ritual exclusivo que combina diagnóstico capilar personalizado, cosméticos de alta performance, tecnologias avançadas e uma experiência sensorial sofisticada, incluso ozonioterapia e fototerapia."],
          ["Escova e finalização", "30 min"],
        ],
      },
      {
        slug: "fh-signature-ritual",
        nome: "FH Signature Ritual",
        texto: [
          "Mais do que um tratamento, um convite para desacelerar, despertar os sentidos e vivenciar uma experiência única de cuidado e conexão consigo mesma.",
          "O FH Signature Ritual é um protocolo exclusivo desenvolvido por Fernanda Hosang, que combina conhecimento técnico, tecnologias avançadas, cosméticos de alta performance e experiências sensoriais cuidadosamente pensadas para transformar o cuidado capilar em um momento de puro bem-estar.",
        ],
        ritual: {
          chamada: "Uma experiência sensorial exclusiva de beleza, tecnologia e bem-estar.",
          selos: ["Ozonioterapia", "Fototerapia", "Massagem capilar", "Tratamento personalizado"],
          secoes: [
            {
              texto: [
                "A experiência começa com um mapeamento capilar individualizado, permitindo compreender as necessidades específicas dos fios e desenvolver um protocolo personalizado, respeitando a estrutura, o histórico e as particularidades de cada cabelo.",
                "A partir dessa avaliação, integramos tratamentos profissionais, ozonioterapia e fototerapia, associados a ativos selecionados para proporcionar cuidados direcionados à fibra capilar.",
              ],
            },
            {
              titulo: "Um ritual que desperta os sentidos",
              texto: [
                "O grande diferencial está na experiência que acompanha cada etapa do tratamento.",
                "O toque das mãos, os movimentos suaves e ritmados da massagem capilar, a sensação de relaxamento e o cuidado dedicado transformam o atendimento em uma verdadeira pausa na rotina.",
                "A massagem no couro cabeludo proporciona uma agradável sensação de conforto, ajuda a aliviar tensões e convida o corpo e a mente a desacelerar.",
                "Texturas envolventes, fragrâncias delicadas, sensações de aconchego e um ambiente cuidadosamente preparado complementam essa jornada sensorial, criando uma atmosfera de tranquilidade, acolhimento e exclusividade.",
                "Enquanto os cabelos recebem cuidados personalizados para melhorar sua resistência, maciez, hidratação e luminosidade, você desfruta de um momento dedicado inteiramente ao seu bem-estar.",
                "Cada toque, cada sensação e cada detalhe fazem parte de uma experiência pensada para você.",
              ],
            },
            {
              titulo: "Muito além da beleza dos fios",
              texto: [
                "O FH Signature Ritual representa uma nova forma de vivenciar o cuidado capilar, onde ciência, tecnologia e sensorialidade se encontram.",
                "Não se trata apenas de melhorar a aparência dos cabelos, mas de proporcionar uma experiência que desperta sensações, valoriza o autocuidado e transforma um atendimento em um momento especial.",
                "Porque o verdadeiro luxo está nos detalhes, no tempo dedicado a você e na maneira como cada cuidado faz você se sentir.",
              ],
            },
          ],
          fecho: ["Uma experiência para os cabelos. Um ritual para os sentidos. Um momento inteiramente seu.", "Fernanda Hosang Concept — A exclusividade de cuidar. O privilégio de sentir."],
        },
        itens: [["FH Signature Ritual", "1 h 30"]],
      },
    ],
  },
  {
    slug: "alisamentos-e-realinhamento",
    nome: "Alisamentos",
    quem: "Fernanda Hosang",
    foto: "/galeria/cor-platinado-liso-costas.jpg",
    alt: "Cabelo loiro longo e liso, visto de costas",
    servicos: [
      {
        slug: "alisamentos",
        nome: "Alisamentos",
        texto: [
          "Protocolos exclusivos e personalizados para cada tipo de cabelo, suas condições e o resultado desejado — do alisamento ao realinhamento mais leve dos fios, com controle de frizz e preservação do movimento natural.",
          "Cada procedimento começa com avaliação capilar e teste de mecha, considerando o histórico de químicas e as necessidades dos fios. O cuidado se completa com orientações de manutenção para preservar o alinhamento, o brilho e a beleza do resultado.",
        ],
        itens: [["Alisamento e realinhamento dos fios", "2 a 4 h"]],
      },
    ],
  },
  {
    slug: "pele-e-sobrancelhas",
    nome: "Pele e sobrancelhas",
    quem: "Laura Elisa",
    foto: "/galeria/rosto-maquiagem-perfil.jpg",
    alt: "Rosto de perfil com pele iluminada e sobrancelhas definidas",
    servicos: [
      {
        slug: "cuidados-faciais",
        nome: "Cuidados faciais",
        comparar: { antes: "/galeria/pele-limpeza-antes.jpg", depois: "/galeria/pele-limpeza-depois.jpg", alt: "Limpeza de pele: a pele antes e depois do atendimento", empilhado: true },
        texto: [
          "Limpeza de pele, dermaplaning, tratamentos faciais e microagulhamento, com protocolos definidos a partir de uma avaliação individual. Um cuidado direcionado às necessidades da sua pele para melhorar a textura, realçar a luminosidade e valorizar sua beleza natural.",
        ],
        itens: [
          ["Limpeza de pele profunda", "1 a 1,5 h"],
          ["Microagulhamento", "1 h"],
          ["Tratamentos faciais", "1 h"],
        ],
      },
      {
        slug: "sobrancelhas",
        nome: "Sobrancelhas",
        texto: [
          "Design personalizado, henna, tintura e reconstrução de sobrancelhas para valorizar o formato, a definição e a harmonia com o seu rosto. Cada serviço é escolhido de acordo com suas necessidades, realçando o olhar e preservando a naturalidade da sua expressão.",
        ],
        itens: [
          ["Design de sobrancelhas", "30 min"],
          ["Brow lamination", "1 h"],
        ],
      },
    ],
  },
  {
    slug: "maquiagem-e-penteado",
    nome: "Maquiagem e penteado",
    menu: "Maquiagem",
    quem: "Fernanda Hosang",
    foto: "/galeria/maquiagem-social-ondas.jpg",
    alt: "Maquiagem social em tons rosados com cabelo em ondas",
    servicos: [
      {
        slug: "producao-completa",
        nome: "Produção completa — maquiagem e penteado",
        texto: [
          "Maquiagem personalizada e penteados dos clássicos aos mais despojados, em harmonia com seu estilo, sua personalidade e a ocasião. Trabalhamos com produtos e técnicas de pele blindada para uma maquiagem à prova d’água, com duração de até 24 horas e acabamento impecável. Uma produção completa, com atenção a cada detalhe para valorizar sua beleza.",
        ],
        itens: [
          ["Penteado", "1 a 2 h"],
          ["Maquiagem social", "1 h"],
          ["Noiva: teste + dia", "Sob consulta"],
        ],
      },
    ],
  },
];

/** Todos os servicos em lista plana, com o carro-chefe primeiro (dados estruturados). */
export const TODOS_SERVICOS: { nome: string; descricao: string }[] = [
  { nome: PREMIUM.nome, descricao: PREMIUM.texto.join(" ") },
  ...CATEGORIAS.flatMap((c) => c.servicos.map((s) => ({ nome: s.nome, descricao: s.texto.join(" ") }))),
];

export function mensagemAgendar(nome: string) {
  return `Oi! Vim pelo site e queria agendar: ${nome}.`;
}
