import Image from "next/image";
import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { SITE } from "@/lib/site";
import { linkWhatsapp } from "@/lib/preco";

export const metadata = {
  title: "Serviços",
  description:
    "Cor, mechas, correção de cor, cachos, tratamentos, estética facial e sobrancelhas em Garuva/SC. Orçamento fecha depois do diagnóstico.",
  alternates: { canonical: "/servicos" },
};

const PREMIUM = [
  "Consultoria, diagnóstico capilar e análise do histórico químico",
  "Visagismo e planejamento personalizado da nova cor",
  "Teste de mecha e avaliação da saúde dos fios",
  "Correção de cor e neutralização de tons indesejados",
  "Mechas, iluminação, coloração e tonalização",
  "Tratamentos de proteção e recuperação da fibra",
  "Corte de transformação, quando necessário",
  "Finalização profissional",
  "Orientação e plano de manutenção por escrito",
];

const LINHAS = [
  {
    nome: "Cor, mechas e iluminação",
    quem: "Fernanda Hosang",
    texto:
      "A linha mais procurada da casa. Clarear cabelo é química, não sorte: começa com diagnóstico de histórico, passa por teste de mecha e termina com um plano de manutenção que você leva para casa.",
    itens: [
      ["Mechas e iluminação personalizada", "3 a 6 h"],
      ["Morena iluminada", "3 a 5 h"],
      ["Descoloração global", "4 a 6 h"],
      ["Coloração e tonalização", "1 a 2 h"],
      ["Matização e manutenção de tom", "1 h"],
    ],
    cta: "Falar sobre cor",
  },
  {
    nome: "Correção de cor e colorimetria",
    quem: "Fernanda Hosang",
    texto:
      "Loiro que amarelou, mechas manchadas, cor que saiu diferente do combinado, cabelo com histórico de progressiva ou henna. É o serviço que mais chega aqui vindo de outras cidades — e o que mais exige diagnóstico antes de qualquer promessa.",
    itens: [
      ["Diagnóstico e teste de mecha", "Sempre primeiro"],
      ["Correção de tom e neutralização", "A definir"],
      ["Reconstrução acompanhando o processo", "Incluída"],
    ],
    cta: "Mandar foto do meu cabelo",
  },
  {
    nome: "Visagismo e consultoria de imagem",
    quem: "Fernanda Hosang",
    texto:
      "Antes de decidir cor e corte, entender o rosto, o estilo e a rotina. Visagismo é o que faz a diferença entre um cabelo bonito e um cabelo que combina com você — e é o que evita arrependimento depois de quatro horas de cadeira.",
    itens: [
      ["Consultoria de imagem e visagismo", "Sob consulta"],
      ["Planejamento de cor e corte", "Incluído na transformação"],
    ],
  },
  {
    nome: "Cachos, cortes e tratamentos",
    quem: "Juliana Araújo",
    texto:
      "Cabelo cacheado precisa de corte pensado para a curva do fio, não do corte que se faz em cabelo liso. E de tratamento que devolva massa ao fio sem pesar na definição.",
    itens: [
      ["Corte especializado em cabelo cacheado", "1 a 2 h"],
      ["Tratamento capilar com mapeamento personalizado", "1 a 2 h"],
      ["Finalização e definição", "1 h"],
      ["Penteados", "1 a 2 h"],
    ],
  },
  {
    nome: "Tratamentos capilares",
    quem: "Fernanda e Juliana",
    texto:
      "O que sustenta a cor. Reconstrução, hidratação e nutrição no ritmo que o seu cabelo pede — com mapeamento escrito, para você saber o que fazer entre uma visita e outra.",
    itens: [
      ["Mapeamento capilar personalizado", "Consulta"],
      ["Reconstrução profunda", "1 a 2 h"],
      ["Hidratação e nutrição", "1 h"],
      ["Escova e finalização", "40 min a 1 h"],
    ],
  },
  {
    nome: "Cortes e alisamento",
    quem: "Fernanda e Juliana",
    texto:
      "Corte feminino pensado para o formato do rosto, a textura do fio e a rotina que você tem em casa de manhã. E realinhamento para quem quer reduzir volume sem abrir mão da saúde do fio.",
    itens: [
      ["Corte feminino", "1 h"],
      ["Corte especializado em cabelos cacheados", "1 a 2 h"],
      ["Alisamento e realinhamento dos fios", "2 a 4 h"],
    ],
  },
  {
    nome: "Estética facial e sobrancelhas",
    quem: "Laura Elisa",
    texto:
      "A vertical de maior recorrência da casa, e a que melhor combina com o dia de cabelo: enquanto a cor age, a pele é cuidada. Um dia, dois resultados.",
    itens: [
      ["Limpeza de pele profunda", "1 a 1,5 h"],
      ["Microagulhamento", "1 h"],
      ["Tratamentos faciais", "1 h"],
      ["Design de sobrancelhas", "30 min"],
      ["Brow lamination", "1 h"],
    ],
  },
  {
    nome: "Penteados e maquiagem",
    quem: "Fernanda Hosang",
    texto: "Para festa, formatura, madrinha e noiva. Com teste prévio quando o dia é importante.",
    itens: [
      ["Penteado", "1 a 2 h"],
      ["Maquiagem social", "1 h"],
      ["Noiva: teste + dia", "Sob consulta"],
    ],
  },
];

const FOTOS: [string, string][] = [
  ["/galeria/cor-loiro-balayage.jpg", "Balayage loiro com ondas longas"],
  ["/galeria/cor-platinado-liso-costas.jpg", "Platinado liso visto de costas"],
  ["/galeria/cor-morena-volume.jpg", "Morena iluminada com volume"],
  ["/galeria/cachos-longos.jpg", "Cachos longos definidos"],
  ["/galeria/cor-acobreado-costas.jpg", "Acobreado visto de costas"],
  ["/galeria/cor-acaju-chanel.jpg", "Acaju em corte chanel"],
  ["/galeria/rosto-maquiagem-perfil.jpg", "Maquiagem social vista de perfil"],
  ["/galeria/rosto-maquiagem-social.jpg", "Maquiagem social com ondas"],
];

export default function Servicos() {
  return (
    <div className="min-h-dvh bg-creme text-texto">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Serviços do FH Concept",
          itemListElement: LINHAS.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: l.nome,
              description: l.texto,
              provider: { "@type": "HairSalon", name: SITE.nome, url: SITE.url },
              areaServed: ["Garuva", "Joinville", "Itapoá", "Guaratuba"],
            },
          })),
        }}
      />

      <Cabecalho />

      <main>
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
          <span className="block h-px w-12 bg-champanhe" />
          <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.15] md:text-5xl">
            Cada linha tem uma especialista, e um jeito de ser feita
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-texto2">
            Os valores variam com o comprimento e com o histórico químico do seu
            cabelo. Por isso todo orçamento fecha depois do diagnóstico — e antes
            de qualquer produto entrar.
          </p>
        </section>

        {/* carro-chefe */}
        <section className="bg-carvao px-5 py-16 text-creme md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl md:grid md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-sm text-creme/50">Carro-chefe da casa</p>
              <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
                Transformação de Cor Premium
              </h2>
              <p className="mt-5 text-creme/70">
                Não é uma coloração. É um projeto: entra diagnóstico, planejamento
                de imagem, execução e plano de manutenção. A proposta é unir
                técnica, saúde capilar e visagismo — e entregar um resultado que
                continua bonito depois que você sai daqui.
              </p>
              <p className="mt-5 text-sm text-champanhe">
                De 3 a 6 horas, conforme o histórico do seu cabelo
              </p>
              <a href={linkWhatsapp("Oi! Quero saber sobre a Transformação de Cor Premium.")} target="_blank" rel="noopener" className="mt-8 inline-flex min-h-13 items-center bg-creme px-7 text-sm text-carvao">Falar sobre a transformação</a>
            </div>

            <ul className="mt-10 space-y-3 md:mt-0">
              {PREMIUM.map((item) => (
                <li key={item} className="flex gap-3 border-b border-creme/12 pb-3 text-sm text-creme/75">
                  <span className="text-champanhe">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* linhas */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
          <div className="space-y-20 md:space-y-28">
            {LINHAS.map((l, i) => (
              <article key={l.nome} className="border-t border-linha pt-10 md:grid md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-14">
                  <figure className={`relative aspect-[3/4] overflow-hidden bg-areia md:aspect-[4/5] ${i % 2 === 1 ? "md:order-2" : ""}`}>
                    <Image src={FOTOS[i][0]} alt={FOTOS[i][1]} fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
                  </figure>

                  <div className="mt-8 md:mt-0">
                    <h2 className="font-serif text-2xl leading-snug md:text-3xl">{l.nome}</h2>
                    <p className="mt-1 text-sm text-nude">Com {l.quem}</p>
                    <p className="mt-4 text-texto2">{l.texto}</p>

                    <dl className="mt-7 border-t border-linha">
                      {l.itens.map(([nome, dur]) => (
                        <div key={nome} className="flex items-baseline justify-between gap-6 border-b border-linha py-3 text-sm">
                          <dt>{nome}</dt>
                          <dd className="shrink-0 text-texto2">{dur}</dd>
                        </div>
                      ))}
                    </dl>

                    {l.cta && (
                      <a href={linkWhatsapp(`Oi! ${l.cta} — vim pelo site.`)} target="_blank" rel="noopener" className="mt-6 inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">{l.cta}</a>
                    )}
                  </div>
                </article>
            ))}
          </div>
        </section>

        <section className="bg-areia px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl md:flex md:items-end md:justify-between md:gap-10">
            <div>
              <p className="text-sm text-texto2">Não sabe por onde começar</p>
              <h2 className="mt-2 max-w-xl font-serif text-3xl leading-tight">
                Manda uma foto do seu cabelo
              </h2>
              <p className="mt-4 max-w-lg text-texto2">
                Para correção de cor a avaliação vem antes do orçamento. Uma foto
                com luz natural já ajuda a dimensionar o atendimento.
              </p>
            </div>
            <a href={linkWhatsapp("Oi! Queria uma avaliação do meu cabelo.")} target="_blank" rel="noopener" className="mt-8 inline-flex min-h-13 shrink-0 items-center bg-carvao px-7 text-sm text-creme md:mt-0">Falar no WhatsApp</a>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}
