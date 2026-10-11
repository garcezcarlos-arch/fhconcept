import Image from "next/image";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { NavServicos } from "@/components/nav-servicos";
import { SITE } from "@/lib/site";
import { linkWhatsapp } from "@/lib/preco";
import { CATEGORIAS, PREMIUM, TODOS_SERVICOS, mensagemAgendar } from "@/lib/servicos";

export const metadata = {
  title: "Serviços",
  description:
    "Cor, mechas, correção de cor, corte e visagismo, cachos, tratamentos, cuidados faciais, sobrancelhas, maquiagem e penteado em Garuva/SC. Orçamento fecha depois do diagnóstico.",
  alternates: { canonical: "/servicos" },
};

const NAV = [
  { slug: PREMIUM.slug, nome: "Transformação Premium" },
  ...CATEGORIAS.map((c) => ({ slug: c.slug, nome: c.nome })),
];

export default function Servicos() {
  return (
    <div className="min-h-dvh bg-creme text-texto">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Serviços do FH Concept",
          itemListElement: TODOS_SERVICOS.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.nome,
              description: s.descricao,
              provider: { "@type": "HairSalon", name: SITE.nome, url: SITE.url },
              areaServed: ["Garuva", "Joinville", "Itapoá", "Guaratuba"],
            },
          })),
        }}
      />

      <Cabecalho />

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:px-10 md:pb-16 md:pt-24">
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

        <NavServicos itens={NAV} agendar={linkWhatsapp("Oi! Vim pelo site e queria agendar.")} />

        {/* carro-chefe */}
        <section id={PREMIUM.slug} className="scroll-mt-32 bg-carvao text-creme">
          <div className="mx-auto max-w-6xl px-5 py-16 md:grid md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
            <div>
              <p className="text-sm text-creme/50">Carro-chefe da casa</p>
              <h2 className="mt-2 font-serif text-3xl leading-tight md:text-[42px]">{PREMIUM.nome}</h2>
              {PREMIUM.texto.map((p) => (
                <p key={p} className="mt-5 leading-relaxed text-creme/70">{p}</p>
              ))}
              <p className="mt-5 text-sm text-champanhe">{PREMIUM.duracao}</p>
              <a href={linkWhatsapp("Oi! Quero saber sobre a Transformação de Cor Premium.")} target="_blank" rel="noopener" className="mt-8 inline-flex min-h-13 items-center bg-creme px-7 text-sm text-carvao transition-colors hover:bg-nude hover:text-creme">
                Falar sobre a transformação
              </a>
            </div>

            <div className="mt-12 md:mt-0">
              <p className="text-sm text-creme/50">O que está incluído</p>
              <ul className="mt-4 border-t border-creme/12">
                {PREMIUM.inclui.map((item) => (
                  <li key={item} className="border-b border-creme/12 py-3 text-sm text-creme/75">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* categorias: foto de um lado, servicos do outro, alternando */}
        {CATEGORIAS.map((c, i) => {
          const invertido = i % 2 === 1;
          return (
            <section key={c.slug} id={c.slug} className={`scroll-mt-32 ${invertido ? "bg-branco" : "bg-creme"}`}>
              <div className={`mx-auto max-w-6xl px-5 py-14 md:grid md:gap-x-16 md:px-10 md:py-24 ${invertido ? "md:grid-cols-[1.15fr_0.85fr]" : "md:grid-cols-[0.85fr_1.15fr]"}`}>
                <header className={invertido ? "md:col-start-1" : "md:col-start-2"}>
                  <h2 className="font-serif text-4xl leading-tight md:text-[52px]">{c.nome}</h2>
                  <p className="mt-2 text-sm text-nude-esc">Com {c.quem}</p>
                </header>

                <figure className={`relative mt-8 aspect-square overflow-hidden bg-areia md:sticky md:top-40 md:row-span-2 md:row-start-1 md:mt-0 md:aspect-[4/5] md:self-start ${invertido ? "md:col-start-2" : "md:col-start-1"}`}>
                  <Image src={c.foto} alt={c.alt} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-top" />
                </figure>

                <div className={`mt-8 md:mt-12 ${invertido ? "md:col-start-1" : "md:col-start-2"}`}>
                  {c.servicos.map((s) => (
                    <article key={s.slug} id={s.slug} className="scroll-mt-36 border-t border-carvao/20 py-9 last:pb-0 md:py-11">
                      <h3 className="font-serif text-2xl leading-snug md:text-[28px]">{s.nome}</h3>
                      {s.texto.map((p) => (
                        <p key={p} className="mt-4 max-w-[62ch] leading-relaxed text-texto2">{p}</p>
                      ))}

                      {s.itens && (
                        <dl className="mt-7 border-t border-linha">
                          {s.itens.map(([nome, dur]) => (
                            <div key={nome} className="flex items-baseline justify-between gap-6 border-b border-linha py-3 text-sm">
                              <dt>{nome}</dt>
                              <dd className="shrink-0 text-texto2">{dur}</dd>
                            </div>
                          ))}
                        </dl>
                      )}

                      <a href={linkWhatsapp(mensagemAgendar(s.nome))} target="_blank" rel="noopener" className="mt-6 inline-flex min-h-11 items-center border-b border-nude text-sm text-nude-esc">
                        Agendar pelo WhatsApp
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className="bg-areia">
          <div className="mx-auto max-w-6xl px-5 py-16 md:flex md:items-end md:justify-between md:gap-10 md:px-10 md:py-20">
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
