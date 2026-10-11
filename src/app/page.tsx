import Image from "next/image";
import Link from "next/link";
import { Figura, Faixa } from "@/components/ui";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { SITE } from "@/lib/site";
import { linkWhatsapp } from "@/lib/preco";

export const metadata = {
  title: "Salão e formações em Garuva, SC",
  description:
    "Coloração, mechas e correção de cor em Garuva, a 30 minutos de Joinville. E formações técnicas para cabeleireiras — 2.900 alunas em oito anos.",
  alternates: { canonical: "/" },
};

const SERVICOS = [
  {
    nome: "Transformação de Cor Premium",
    texto:
      "Uma experiência completa de coloração, com diagnóstico capilar e planejamento personalizado para criar ou corrigir a cor, valorizando sua beleza e seu estilo. O serviço inclui tratamentos antes e após a química, além de orientações de manutenção para preservar o tom, o brilho e a saúde dos fios.",
  },
  {
    nome: "Coloração e mechas personalizadas",
    texto:
      "Loiros, morenas iluminadas e balayage criados para valorizar sua beleza e seu estilo. Cada resultado começa com uma avaliação dos fios e do histórico de químicas, para definir os tons e as técnicas mais adequados ao seu cabelo.",
  },
  {
    nome: "Correção de cor",
    texto:
      "Um trabalho especializado para corrigir manchas, suavizar tons indesejados e devolver harmonia à cor. Após avaliar os fios e o histórico de químicas, planejamos cada etapa da transformação, respeitando os limites do cabelo e o resultado que você deseja alcançar.",
  },
  {
    nome: "Ruivos personalizados",
    texto:
      "Dos acobreados naturais aos vermelhos intensos, criamos o ruivo que valoriza sua beleza e expressa sua personalidade. O serviço inclui planejamento da cor e orientações de manutenção para preservar a intensidade, o brilho e a beleza do tom.",
  },
  {
    nome: "Ondulados, cacheados e crespos",
    texto:
      "Cuidado especializado para valorizar a textura e a beleza natural dos seus fios. Cortes personalizados, tratamentos e finalização que realçam a definição e o movimento, com orientações para facilitar os cuidados em casa.",
  },
  {
    nome: "Pele",
    texto:
      "Limpeza de pele, tratamentos faciais e microagulhamento com protocolos personalizados para as necessidades da sua pele. Um cuidado dedicado a valorizar sua beleza natural e melhorar a textura, a luminosidade e a aparência da pele.",
  },
  {
    nome: "Sobrancelhas",
    texto:
      "Design personalizado, henna, tintura e reconstrução de sobrancelhas para valorizar o formato, a definição e a harmonia com o seu rosto. Cada serviço é escolhido de acordo com suas necessidades, realçando o olhar e preservando a naturalidade da sua expressão.",
  },
  {
    nome: "Produção completa — maquiagem e penteado",
    texto:
      "Maquiagem personalizada e penteados dos clássicos aos mais despojados, em harmonia com seu estilo, sua personalidade e a ocasião. Trabalhamos com produtos e técnicas de pele blindada para uma maquiagem à prova d’água, com duração de até 24 horas e acabamento impecável. Uma produção completa, com atenção a cada detalhe para valorizar sua beleza.",
  },
  {
    nome: "Alisamentos",
    texto:
      "Protocolos exclusivos e personalizados para cada tipo de cabelo, suas condições e o resultado desejado — do alisamento ao realinhamento mais leve dos fios, com controle de frizz e preservação do movimento natural.\n\nCada procedimento começa com avaliação capilar e teste de mecha, considerando o histórico de químicas e as necessidades dos fios. O cuidado se completa com orientações de manutenção para preservar o alinhamento, o brilho e a beleza do resultado.",
  },
];

const EQUIPE = [
  {
    nome: "Fernanda Hosang",
    papel: "Colorimetria, mechas e correção de cor",
    texto: "Cabeleireira em Garuva desde 2014 e educadora técnica. Formou 2.900 alunas em oito anos.",
    insta: "https://instagram.com/fernandahosangconcept",
    foto: "/galeria/equipe-atendimento-bob.jpg",
  },
  {
    nome: "Juliana Araújo",
    papel: "Cachos e tratamentos",
    texto: "Corte e definição para ondas, cachos e crespos, e reconstrução de fios comprometidos.",
    insta: "https://instagram.com/juaraujocachos",
    foto: "/galeria/equipe-atendimento-parede.jpg",
  },
  {
    nome: "Laura Elisa",
    papel: "Estética facial e sobrancelhas",
    texto: "Limpeza de pele, tratamentos faciais e design de sobrancelhas.",
    insta: "https://instagram.com/lauraelisa.beauty",
    foto: "/galeria/equipe-jaleco-natylla.jpg",
  },
];

const FORMACOES = [
  { nome: "Curso em turma", preco: "R$ 700 a R$ 2.200", texto: "Colorimetria, mechas e loiros dentro de um salão em operação, com modelo real e turma pequena." },
  { nome: "Shadow Day", preco: "R$ 950", texto: "Um dia acompanhando os atendimentos de perto, do diagnóstico à entrega." },
  { nome: "Atendimento assistido", preco: "R$ 900 a R$ 1.200", texto: "Você atende sua própria cliente com a Fernanda ao lado, corrigindo o que for preciso na hora." },
  { nome: "Mentoria técnica", preco: "R$ 1.200", texto: "Acompanhamento individual para resolver o que trava a sua técnica hoje." },
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
          areaServed: ["Garuva", "Joinville", "Itapoá", "Guaratuba"],
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
            itemListElement: SERVICOS.map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s.nome, description: s.texto },
            })),
          },
        }}
      />

      <Cabecalho />

      <main className="mx-auto max-w-6xl px-5 md:px-10">
        <section className="border-b border-linha py-12 md:grid md:grid-cols-2 md:items-center md:gap-16 md:py-24">
            <div>
              <span className="block h-px w-12 bg-champanhe" />
              <h1 className="mt-6 max-w-[12ch] font-serif text-4xl leading-[1.08] md:text-6xl">
                Cor que sai como foi combinado
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-carvao/70">
                Salão técnico em Garuva, a trinta minutos de Joinville. Especializado
                em mechas, loiros e correção de cor — o caso que costuma chegar aqui
                vindo de outro lugar.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a href={linkWhatsapp("Oi! Vim pelo site e queria agendar.")} target="_blank" rel="noopener" className="flex min-h-13 items-center bg-carvao px-7 text-sm text-creme">Agendar pelo WhatsApp</a>
                <Link href="/loja/diagnostico" className="inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">Descobrir o que usar no seu cabelo</Link>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-[1.5fr_1fr] gap-3 md:mt-0">
              <figure className="relative row-span-2 aspect-[3/4.1] overflow-hidden bg-areia">
                <Image src="/galeria/cor-loiro-balayage.jpg" alt="Balayage loiro com ondas longas" fill sizes="(max-width: 768px) 60vw, 30vw" priority className="object-cover" />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden bg-areia">
                <Image src="/galeria/cor-acobreado-costas.jpg" alt="Acobreado visto de costas" fill sizes="(max-width: 768px) 40vw, 20vw" className="object-cover" />
              </figure>
              <div className="flex flex-col justify-center bg-areia p-5">
                <b className="font-serif text-[29px] font-normal leading-none">2.900</b>
                <span className="mt-2 text-[10.5px] font-medium uppercase leading-relaxed tracking-[0.16em] text-carvao/55">
                  alunas formadas<br />em oito anos
                </span>
              </div>
            </div>
          </section>

        <Faixa itens={[["2014", "abertura em Garuva"], ["2.900", "alunas formadas"], ["15", "anos de formação"], ["+4", "cidades atendidas"]]} />

        <section id="servicos" className="scroll-mt-20 py-16 md:py-24">
          <p className="text-sm text-carvao/45">O que fazemos</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">Serviços</h2>
          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {SERVICOS.map((s, i) => (
              <div key={s.nome} className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}>
                <h3 className="font-serif text-xl leading-snug">{s.nome}</h3>
                {s.texto.split("\n\n").map((p) => (
                  <p key={p} className="mt-2 text-carvao/65">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-linha py-16 md:grid md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <p className="text-sm text-carvao/45">A casa</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">De Studio a Concept</h2>
          </div>
          <div className="mt-6 space-y-5 text-carvao/70 md:mt-0">
            <p>
              No começo era o Studio Fernanda Hosang: uma estrutura menor, com
              todos os atendimentos feitos por uma pessoa só. Quando o negócio
              cresceu e novas profissionais entraram, o nome deixou de contar a
              história certa.
            </p>
            <p>
              O FH Concept nasceu dessa virada. Não é só nome nem metro quadrado:
              é um conceito de atendimento em que diferentes especialidades
              trabalham alinhadas ao mesmo padrão.
            </p>
          </div>
        </section>

        <section id="equipe" className="scroll-mt-20 py-16 md:py-24">
          <p className="text-sm text-carvao/45">Quem atende</p>
          <div className="flex items-baseline justify-between gap-6"><h2 className="mt-2 font-serif text-3xl md:text-4xl">Equipe</h2><Link href="/equipe" className="text-sm text-nude">Conhecer a equipe</Link></div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {EQUIPE.map((p) => (
              <div key={p.nome}>
                <Figura src={p.foto} alt={p.nome} proporcao="aspect-[4/3] md:aspect-[3/4]" sizes="(max-width: 768px) 100vw, 31vw" />
                <h3 className="mt-5 font-serif text-xl">{p.nome}</h3>
                <p className="mt-1 text-sm text-nude">{p.papel}</p>
                <p className="mt-3 text-carvao/65">{p.texto}</p>
                <a href={p.insta} target="_blank" rel="noopener" className="mt-3 inline-block text-sm text-carvao/45 hover:text-nude">Instagram</a>
              </div>
            ))}
          </div>
        </section>

        <section id="formacoes" className="scroll-mt-20 bg-carvao px-6 py-16 text-creme md:px-12 md:py-20">
          <p className="text-sm text-creme/50">Para profissionais</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
            2.900 cabeleireiras formadas em oito anos
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
            <p>
              A maior parte das clientes vem de Joinville, a trinta minutos.
              Também atendemos Itapoá, Guaratuba e outras cidades da região.
            </p>
            <p>
              Atendimento com hora marcada. Para correção de cor, o horário é
              reservado com mais tempo — vale mandar uma foto do cabelo antes
              para dimensionarmos o atendimento.
            </p>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}
