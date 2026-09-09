import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { Eyebrow, Figura, Faixa, Botao, LinkNude } from "@/components/ui";
import { SITE } from "@/lib/site";
import { linkWhatsapp } from "@/lib/preco";

export const metadata = {
  title: "Formações para cabeleireiras",
  description:
    "Cursos de colorimetria, mechas e correção de cor dentro de um salão em operação, em Garuva/SC. Seis formatos, de R$ 700 a R$ 2.200. 2.900 alunas formadas em oito anos.",
  alternates: { canonical: "/formacoes" },
};

type Formato = {
  numero: string;
  tipo: string;
  nome: string;
  texto: string;
  preco: string;
  ficha: [string, string][];
  cta: string;
  id: string;
};

const FORMATOS: Formato[] = [
  {
    numero: "01", tipo: "Turma", id: "turma",
    nome: "Curso prático em turma",
    texto: "Grupo reduzido, prática em modelo real e conteúdo adaptado ao nível da turma. É o formato principal, e o que mais transforma a agenda de quem faz.",
    preco: "R$ 700 a R$ 2.200 por pessoa",
    ficha: [["Duração", "1 a 3 dias"], ["Turma", "Até 8 alunas"], ["Prática", "Modelo real"], ["Inclui", "Certificado e suporte"]],
    cta: "Entrar na lista da próxima turma",
  },
  {
    numero: "02", tipo: "Individual", id: "individual",
    nome: "Curso particular individual",
    texto: "Conteúdo desenhado só para você, no seu ritmo e a partir das suas dificuldades reais. Para quem quer avançar rápido em um ponto específico.",
    preco: "Sob consulta",
    ficha: [["Duração", "Combinada"], ["Turma", "Individual"], ["Conteúdo", "Sob medida"]],
    cta: "Quero me inscrever",
  },
  {
    numero: "03", tipo: "Imersão", id: "shadow-day",
    nome: "Shadow Day",
    texto: "Um dia inteiro acompanhando atendimentos reais: diagnóstico, planejamento, execução, finalização e orientação à cliente. Ao final, uma hora de mentoria sobre o que você viu.",
    preco: "R$ 950 o dia",
    ficha: [["Duração", "1 dia completo"], ["Formato", "Acompanhamento"], ["Extra", "1 h de mentoria ao final"]],
    cta: "Quero me inscrever",
  },
  {
    numero: "04", tipo: "Prática", id: "assistido",
    nome: "Atendimento assistido",
    texto: "Aqui quem executa é você. O procedimento é feito em modelo ou cliente, com supervisão e orientação da Fernanda do começo ao fim. É o formato que mais tira o medo.",
    preco: "R$ 900 a R$ 1.200 o dia",
    ficha: [["Duração", "1 dia"], ["Formato", "Você executa"], ["Supervisão", "Integral"]],
    cta: "Quero me inscrever",
  },
  {
    numero: "05", tipo: "Consultoria", id: "mentoria",
    nome: "Mentoria técnica presencial",
    texto: "Sem modelo e sem tesoura: análise de casos reais, diagnóstico, planejamento e tomada de decisão. Para a profissional que já executa bem e precisa acertar o julgamento técnico.",
    preco: "R$ 1.200 o dia",
    ficha: [["Duração", "1 dia"], ["Formato", "Análise de casos"], ["Foco", "Suas dificuldades"]],
    cta: "Quero me inscrever",
  },
  {
    numero: "06", tipo: "Sob medida", id: "pacote",
    nome: "Pacotes personalizados",
    texto: "Combinação de formatos — curso prático, atendimento assistido, imersão e mentoria — estruturada conforme o seu nível técnico e o resultado que você quer alcançar.",
    preco: "Sob consulta",
    ficha: [["Duração", "1 ou mais dias"], ["Formato", "Combinado"], ["Para", "Quem quer plano completo"]],
    cta: "Montar meu pacote",
  },
];

const EMENTA: [string, string][] = [
  ["Diagnóstico de histórico químico", "Como descobrir o que já foi feito naquele cabelo antes de propor qualquer coisa — e o que fazer quando a cliente não lembra."],
  ["Fundo de clareamento", "Por que todo cabelo passa por vermelho, laranja e amarelo, e como prever onde o seu vai parar."],
  ["Neutralização de pigmento", "A lógica da roda de cores aplicada de verdade: o que neutraliza o quê, em que proporção e por quanto tempo."],
  ["Técnicas de mecha e iluminação", "Balayage, esfumado, luzes, morena iluminada. Quando cada uma resolve e quando cada uma cria problema."],
  ["Descoloração com segurança", "Volume de oxidante, tempo de pausa, teste de mecha, reconstrução no processo. O que fazer quando o cabelo pede parada."],
  ["Matização e tom final", "Como combinar o tom com a cliente antes de começar, e como entregar exatamente aquilo."],
  ["Correção de cor", "Loiro amarelado, mecha manchada, henna, progressiva. Os casos que mais dão medo, destrinchados."],
  ["Precificação do serviço", "Como calcular hora, produto e desgaste — e como apresentar o valor sem pedir desculpa por ele."],
];

const FAQ: [string, string][] = [
  ["Preciso de experiência para fazer o curso?", "Você precisa já atender, mesmo que pouco. O conteúdo é técnico e assume que você conhece o básico de aplicação. Se está começando agora, converse antes: dá para começar por um formato mais curto e evoluir depois."],
  ["Levo modelo ou vocês providenciam?", "Isso é combinado com a turma antes. Sempre há prática em modelo real; a organização de quem traz é definida na confirmação da vaga."],
  ["Tem certificado?", "Sim, certificado de conclusão emitido ao final da formação."],
  ["E depois do curso, tenho com quem tirar dúvida?", "Tem. As alunas entram em um grupo de ex-alunas, que é onde boa parte do aprendizado real continua acontecendo — com caso de cliente, foto de resultado e dúvida de última hora."],
  ["Venho de outra cidade. Como faço?", "Boa parte das turmas tem gente de fora. Indicamos hospedagem próxima e organizamos os horários pensando em quem chega na véspera. Garuva fica a 30 minutos de Joinville e cerca de 1h30 de Curitiba."],
  ["Dá para parcelar?", "Dá. As condições de pagamento de cada formato são enviadas junto com a data da turma — entre na lista ou chame no WhatsApp."],
  ["Vocês fazem treinamento para marcas?", "Sim. A Fernanda ministra treinamentos e workshops em parceria com marcas profissionais. Para propostas comerciais, o contato é pelo WhatsApp."],
];

export default function Formacoes() {
  return (
    <div className="min-h-dvh bg-creme text-texto">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "FH Concept — Formações",
          parentOrganization: { "@type": "HairSalon", name: SITE.nome, url: SITE.url },
          url: `${SITE.url}/formacoes`,
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Formações",
            itemListElement: FORMATOS.map((f) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Course", name: f.nome, description: f.texto, provider: { "@type": "Organization", name: SITE.nome } },
            })),
          },
        }}
      />

      <Cabecalho />

      <main>
        {/* abertura escura — .edu do original */}
        <section className="bg-carvao px-5 py-16 text-creme md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16">
            <div>
              <Eyebrow claro>Fernanda Hosang · Educação</Eyebrow>
              <h1 className="mt-5 max-w-[15ch] font-serif text-4xl leading-[1.06] md:text-6xl">
                Aprenda com quem atende cliente todo dia
              </h1>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-creme/65">
                Descoloração dá medo por um motivo: errar custa a cliente. Aqui a aula acontece dentro de um salão em operação, com modelo real e turma pequena — e você sai sabendo cobrar pelo que aprendeu.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Botao href={linkWhatsapp("Oi! Quero entrar na lista da próxima turma.")} variante="claro">Entrar na lista da próxima turma</Botao>
                <a href="#formatos" className="inline-flex min-h-11 items-center border-b border-champanhe text-sm text-champanhe">Ver os seis formatos</a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-[1fr_1.4fr] gap-3 md:mt-0">
              <Figura src="/galeria/formacoes-equipe-natylla.jpg" alt="Fernanda com a equipe de educadores Nátylla" proporcao="aspect-square" sizes="(max-width: 768px) 40vw, 18vw" className="self-end" />
              <Figura src="/galeria/formacoes-palco-n26.jpg" alt="Fernanda no palco da convenção N26 da Nátylla" proporcao="aspect-[3/4]" sizes="(max-width: 768px) 60vw, 26vw" prioridade />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <Faixa itens={[["+2.900", "profissionais formadas"], ["150", "turmas ministradas"], ["8", "anos como educadora"], ["Até 8", "alunas por turma"]]} />
        </div>

        {/* seis formatos */}
        <section id="formatos" className="scroll-mt-20 px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>Menu de formações</Eyebrow>
            <h2 className="mt-4 max-w-[22ch] font-serif text-3xl leading-[1.12] md:text-4xl">
              Seis formatos, do primeiro contato à mentoria individual
            </h2>
            <p className="mt-5 max-w-[58ch] text-texto2">
              Não existe curso único que sirva para quem está começando e para quem já tem agenda cheia. Escolha pelo ponto em que você está hoje — e, se preferir, montamos um pacote combinando formatos.
            </p>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FORMATOS.map((f) => (
                <article key={f.id} id={f.id} className="flex scroll-mt-24 flex-col border border-linha p-6 md:p-7">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-nude">Formato {f.numero} · {f.tipo}</p>
                  <h3 className="mt-3 font-serif text-2xl leading-snug">{f.nome}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-texto2">{f.texto}</p>
                  <p className="mt-5 font-serif text-xl text-nude-esc">{f.preco}</p>
                  <dl className="mt-4 border-t border-linha">
                    {f.ficha.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-linha py-2.5 text-[13px]">
                        <dt className="text-texto2">{k}</dt>
                        <dd className="text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5">
                    <LinkNude href={linkWhatsapp(`Oi! Quero saber sobre: ${f.nome}.`)}>{f.cta}</LinkNude>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ementa */}
        <section className="bg-areia px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>O que você aprende</Eyebrow>
            <h2 className="mt-4 max-w-[19ch] font-serif text-3xl leading-[1.12] md:text-4xl">Ementa da formação em cor</h2>
            <p className="mt-5 max-w-[58ch] text-texto2">
              O conteúdo é adaptado à turma e ao momento do mercado, mas estes são os eixos que sustentam todas as formações.
            </p>
            <div className="mt-10 grid gap-x-14 md:grid-cols-2">
              {EMENTA.map(([t, d]) => (
                <div key={t} className="border-t border-linha py-4">
                  <h4 className="font-sans text-[15px] font-semibold">{t}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-texto2">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* por que aqui */}
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl md:grid md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16">
            <Figura src="/galeria/equipe-atendimento-parede.jpg" alt="Atendimento no salão FH Concept" proporcao="aspect-[3/4] md:aspect-[4/5]" sizes="(max-width: 768px) 100vw, 42vw" />
            <div className="mt-10 md:mt-0">
              <Eyebrow>Por que aqui</Eyebrow>
              <h2 className="mt-4 max-w-[19ch] font-serif text-3xl leading-[1.12] md:text-4xl">Escola dentro de um salão que funciona</h2>
              <div className="mt-6 space-y-4 text-texto2">
                <p>A maioria das formações acontece em sala alugada, com modelo contratado, longe da realidade da cadeira. Aqui a aula é no salão, no meio da operação — com cliente de verdade entrando, agenda apertada e imprevisto acontecendo. É onde a técnica encontra o dia a dia.</p>
                <p>Em oito anos foram cerca de 150 turmas e mais de 2.900 profissionais formadas, em workshops demonstrativos, cursos práticos, imersões e treinamentos em parceria com marcas profissionais.</p>
              </div>
            </div>
          </div>
        </section>

        {/* faq */}
        <section className="px-5 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Dúvidas frequentes</Eyebrow>
            <div className="mt-8 border-t border-linha">
              {FAQ.map(([p, r]) => (
                <details key={p} className="group border-b border-linha">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-serif text-lg [&::-webkit-details-marker]:hidden">
                    {p}
                    <span className="shrink-0 text-xl text-nude group-open:hidden">+</span>
                    <span className="hidden shrink-0 text-xl text-nude group-open:inline">–</span>
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-texto2">{r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* inscrição */}
        <section className="bg-carvao px-5 py-16 text-creme md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl md:flex md:items-end md:justify-between md:gap-10">
            <div>
              <Eyebrow claro>Inscrição</Eyebrow>
              <h2 className="mt-4 max-w-xl font-serif text-3xl leading-tight md:text-4xl">Reserve sua vaga na próxima turma</h2>
              <p className="mt-4 max-w-lg text-creme/65">
                Diga o formato que te interessa e a Fernanda confirma vaga, data, valor e condição de pagamento.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <Botao href={linkWhatsapp("Oi! Quero reservar vaga numa formação.")} variante="claro">Falar sobre a turma</Botao>
            </div>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}
