import Image from "next/image";
import Link from "next/link";
import { Figura, Faixa } from "@/components/ui";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { SITE } from "@/lib/site";
import { linkWhatsapp } from "@/lib/preco";
import { TODOS_SERVICOS } from "@/lib/servicos";
import { HISTORIA } from "@/lib/historia";
import { EQUIPE } from "@/lib/equipe";
import { ServicosResumo } from "@/components/servicos-resumo";

export const metadata = {
  title: "Salão e formações em Garuva, SC",
  description:
    "Coloração, mechas e correção de cor em Garuva, a 30 minutos de Joinville. E formações técnicas para cabeleireiras — mais de 2.900 alunas em 10 anos.",
  alternates: { canonical: "/" },
};

const FORMACOES = [
  { nome: "Curso em turma", preco: "R$ 350 a R$ 650", texto: "Colorimetria, mechas e loiros dentro de um salão em operação, com modelo real e turma pequena." },
  { nome: "Shadow Day", preco: "R$ 1.100", texto: "Um dia acompanhando os atendimentos de perto, do diagnóstico à entrega." },
  { nome: "Atendimento assistido", preco: "R$ 900 a R$ 1.200", texto: "Você atende sua própria cliente com a Fernanda ao lado, corrigindo o que for preciso na hora." },
  { nome: "Mentoria técnica", preco: "R$ 1.200 a R$ 1.700", texto: "Acompanhamento individual para resolver o que trava a sua técnica hoje." },
];

export default function Home() {
  return (
    <div className="min-h-dvh bg-creme text-carvao">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@type": "HairSalon",
          name: SITE.nome,
          alternateName: "Fernanda Hosang Concept",
          description: SITE.descricao,
          url: SITE.url,
          telephone: SITE.telefone,
          foundingDate: "2014-06-18",
          priceRange: "$$",
          image: `${SITE.url}/fh-concept.svg`,
          sameAs: [SITE.instagram, "https://instagram.com/juaraujocachos", "https://instagram.com/lauraelisa.beauty"],
          address: {
            "@type": "PostalAddress",
            streetAddress: SITE.rua,
            addressLocality: SITE.cidade,
            addressRegion: SITE.uf,
            postalCode: SITE.cep,
            addressCountry: SITE.pais,
          },
          geo: { "@type": "GeoCoordinates", latitude: SITE.lat, longitude: SITE.lng },
          areaServed: ["Garuva", "Joinville", "Araquari", "Itapoá", "Guaratuba", "Curitiba", "Balneário Camboriú"],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "08:30",
              closes: "18:30",
            },
          ],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Serviços",
            itemListElement: TODOS_SERVICOS.map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s.nome, description: s.descricao },
            })),
          },
        }}
      />

      <Cabecalho />

      <main className="mx-auto max-w-6xl px-5 md:px-10">
        <section className="border-b border-linha py-12 md:grid md:grid-cols-2 md:items-center md:gap-16 md:py-24">
            <div>
              <span className="block h-px w-12 bg-champanhe" />
              <h1 className="mt-6 font-serif text-4xl leading-[1.1] md:text-[46px]">
                Sua beleza,<br /> nossa especialidade.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-carvao/80">
                Um conceito de beleza que une técnica, visagismo e atendimento
                personalizado para valorizar sua identidade.
              </p>
              <p className="mt-4 max-w-lg leading-relaxed text-carvao/65">
                Especialistas em transformações de cor, mechas, cortes e tratamentos
                capilares com tecnologia e protocolos exclusivos.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a href={linkWhatsapp("Oi! Vim pelo site e queria agendar.")} target="_blank" rel="noopener" className="flex min-h-13 items-center bg-carvao px-7 text-sm text-creme">Agende sua experiência</a>
                <Link href="/loja/diagnostico" className="inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">Descobrir o que usar no seu cabelo</Link>
              </div>
            </div>

            {/* tres fotos: a principal ocupa a coluna larga, as outras duas dividem a estreita em partes iguais */}
            <div className="mt-12 grid grid-cols-[1.7fr_1fr] grid-rows-2 gap-3 md:mt-0">
              <figure className="relative row-span-2 aspect-[3/4.4] overflow-hidden bg-areia">
                <Image src="/galeria/salao-finalizacao-letreiro.jpg" alt="Finalização de um corte médio com mechas, em frente ao letreiro do salão" fill sizes="(max-width: 768px) 62vw, 30vw" priority className="object-cover object-[50%_12%]" />
              </figure>
              <figure className="relative min-h-0 overflow-hidden bg-areia">
                <Image src="/galeria/cor-loiro-iluminado-costas.jpg" alt="Loiro iluminado longo visto de costas, com meio preso" fill sizes="(max-width: 768px) 38vw, 18vw" className="object-cover object-[50%_30%]" />
              </figure>
              <figure className="relative min-h-0 overflow-hidden bg-areia">
                <Image src="/galeria/cor-loiro-mel-ondas-longas.jpg" alt="Loiro mel em cabelo longo com ondas" fill sizes="(max-width: 768px) 38vw, 18vw" className="object-cover object-[50%_46%]" />
              </figure>
            </div>
          </section>

        <Faixa itens={[["2014", "abertura em Garuva"], ["2.900", "alunas formadas"], ["15", "anos de profissão"], ["+4", "cidades atendidas"]]} />

        <ServicosResumo />

        <section className="border-y border-linha py-16 md:grid md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <p className="text-sm text-carvao/45">A casa</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Nossa história</h2>
          </div>
          <div className="mt-6 md:mt-0">
            <div className="space-y-5 leading-relaxed text-carvao/70">
              {HISTORIA.slice(0, 2).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Link href="/equipe#historia" className="mt-6 inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">
              Ler a história completa
            </Link>
          </div>
        </section>

        <section id="equipe" className="scroll-mt-20 py-16 md:py-24">
          <p className="text-sm text-carvao/45">Quem atende</p>
          <div className="flex items-baseline justify-between gap-6"><h2 className="mt-2 font-serif text-3xl md:text-4xl">Equipe</h2><Link href="/equipe" className="text-sm text-nude">Conhecer a equipe</Link></div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {EQUIPE.map((p) => (
              <div key={p.nome}>
                <Figura src={p.foto} alt={p.alt} posicao={p.posicao} proporcao="aspect-[4/3] md:aspect-[3/4]" sizes="(max-width: 768px) 100vw, 31vw" />
                <h3 className="mt-5 font-serif text-xl">{p.nome}</h3>
                <p className="mt-1 text-sm text-nude">{p.papel}</p>
                <p className="mt-3 text-carvao/65">{p.resumo}</p>
                <a href={p.insta} target="_blank" rel="noopener" className="mt-3 inline-block text-sm text-carvao/45 hover:text-nude">Instagram</a>
              </div>
            ))}
          </div>
        </section>

        <section id="formacoes" className="scroll-mt-20 bg-carvao px-6 py-16 text-creme md:px-12 md:py-20">
          <p className="text-sm text-creme/50">Para profissionais</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
            2.900 cabeleireiras formadas em 10 anos
          </h2>
          <p className="mt-5 max-w-xl text-creme/70">
            As formações acontecem dentro do salão em operação, com modelo real e
            turma pequena. Quem ensina é quem atende todos os dias.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {FORMACOES.map((f) => (
              <div key={f.nome} className="border-t border-creme/15 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-xl">{f.nome}</h3>
                  <span className="shrink-0 text-sm text-champanhe">{f.preco}</span>
                </div>
                <p className="mt-2 text-sm text-creme/60">{f.texto}</p>
              </div>
            ))}
          </div>

          <a href={linkWhatsapp("Oi! Quero saber sobre as formações.")} target="_blank" rel="noopener" className="mt-12 inline-flex min-h-13 items-center bg-creme px-7 text-sm text-carvao">Entrar na lista da próxima turma</a>
        </section>

        <section id="contato" className="scroll-mt-20 py-16 md:grid md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <p className="text-sm text-carvao/45">Onde estamos</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Como chegar</h2>
            <p className="mt-6 leading-relaxed text-carvao/70">
              {SITE.rua}<br />
              {SITE.bairro} · {SITE.cidade}/{SITE.uf}<br />
              Terça a sábado, 8h30–12h e 13h30–18h30
            </p>
            <a href={linkWhatsapp("Oi! Vim pelo site e queria agendar.")} target="_blank" rel="noopener" className="mt-8 inline-flex min-h-13 items-center bg-carvao px-7 text-sm text-creme">Agendar pelo WhatsApp</a>
          </div>
          <div className="mt-10 space-y-5 text-carvao/65 md:mt-0">
            <p>Recebemos clientes de Joinville, Araquari, Itapoá, Guaratuba, Curitiba, Balneário Camboriú e outras cidades da região, que escolhem nosso espaço pelo cuidado e atendimento personalizado.</p>
            <p>Atendemos com hora marcada. Para correções de cor, reservamos um tempo maior para cada atendimento. Envie uma foto atual do seu cabelo antes do agendamento para avaliarmos suas necessidades e planejarmos seu horário.</p>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}
