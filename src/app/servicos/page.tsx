import Image from "next/image";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { NavServicos } from "@/components/nav-servicos";
import { FotoCategoria } from "@/components/foto-categoria";
import { Comparador } from "@/components/comparador";
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
  { slug: PREMIUM.slug, nome: "Premium" },
  ...CATEGORIAS.map((c) => ({ slug: c.slug, nome: c.menu ?? c.nome })),
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
              areaServed: ["Garuva", "Joinville", "Araquari", "Itapoá", "Guaratuba", "Curitiba", "Balneário Camboriú"],
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

                <FotoCategoria
                  padrao={{ foto: c.foto, alt: c.alt }}
                  slugs={c.servicos.map((s) => s.slug)}
                  fotos={Object.fromEntries(c.servicos.filter((s) => s.foto).map((s) => [s.slug, { foto: s.foto!, alt: s.alt ?? s.nome, posicao: s.posicao }]))}
                  pares={Object.fromEntries(c.servicos.filter((s) => s.comparar).map((s) => [s.slug, s.comparar!]))}
                  className={`relative mt-8 aspect-square overflow-hidden bg-areia md:sticky md:top-40 md:row-span-2 md:row-start-1 md:mt-0 md:aspect-[4/5] md:self-start ${invertido ? "md:col-start-2" : "md:col-start-1"}`}
                />

                <div className={`mt-8 md:mt-12 ${invertido ? "md:col-start-1" : "md:col-start-2"}`}>
                  {c.servicos.map((s, j) => (
                    <article key={s.slug} id={s.slug} className="scroll-mt-36 border-t border-carvao/20 py-9 last:pb-0 md:py-11">
                      {/* no celular a foto do primeiro servico ja esta no topo da categoria */}
                      {s.foto && j > 0 && (
                        <figure className="relative mb-7 aspect-square overflow-hidden bg-areia md:hidden">
                          <Image src={s.foto} alt={s.alt ?? s.nome} fill sizes="100vw" className={`object-cover ${s.posicao ?? "object-top"}`} />
                        </figure>
                      )}
                      {/* servico com o mesmo nome da categoria: o titulo da categoria ja basta */}
                      {s.ritual && <p className="mb-2 text-sm text-nude-esc">Exclusivo FH Concept</p>}
                      {s.nome !== c.nome && <h3 className="mb-4 font-serif text-2xl leading-snug md:text-[28px]">{s.nome}</h3>}
                      {s.ritual && (
                        <>
                          <p className="mb-5 max-w-[36ch] font-serif text-xl leading-snug text-texto md:text-[22px]">{s.ritual.chamada}</p>
                          <ul className="mb-6 flex flex-wrap gap-2 text-xs text-texto2">
                            {s.ritual.selos.map((selo) => <li key={selo} className="border border-linha bg-branco px-3 py-1.5">{selo}</li>)}
                          </ul>
                        </>
                      )}
                      {s.texto.map((p, k) => (
                        <p key={p} className={`max-w-[62ch] leading-relaxed text-texto2 ${k > 0 ? "mt-4" : ""}`}>{p}</p>
                      ))}

                      {s.ritual && (
                        <details className="group mt-6 border-y border-linha">
                          <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-6 text-sm text-nude-esc [&::-webkit-details-marker]:hidden">
                            <span>Conhecer o ritual por inteiro</span>
                            <span aria-hidden className="relative block h-3.5 w-3.5 shrink-0">
                              <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                              <span className="absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none" />
                            </span>
                          </summary>
                          <div className="pb-8">
                            {s.ritual.secoes.map((sec) => (
                              <div key={sec.titulo ?? sec.texto[0]} className="mt-6 first:mt-2">
                                {sec.titulo && <h4 className="mb-3 font-serif text-xl leading-snug">{sec.titulo}</h4>}
                                {sec.texto.map((p, k) => (
                                  <p key={p} className={`max-w-[62ch] leading-relaxed text-texto2 ${k > 0 ? "mt-4" : ""}`}>{p}</p>
                                ))}
                              </div>
                            ))}
                            <p className="mt-8 max-w-[40ch] border-l border-champanhe pl-5 font-serif text-xl leading-snug text-texto">{s.ritual.fecho[0]}</p>
                            {s.ritual.fecho.slice(1).map((f) => <p key={f} className="mt-4 text-sm text-texto2">{f}</p>)}
                          </div>
                        </details>
                      )}

                      {s.comparar && (
                        // no computador o antes e depois fica na foto ao lado
                        <figure className="mt-7 max-w-md md:hidden">
                          <Comparador antes={s.comparar.antes} depois={s.comparar.depois} alt={s.comparar.alt} proporcao="aspect-[4/5]" />
                          <figcaption className="mt-2 text-xs text-texto2">Arraste para comparar o antes e o depois.</figcaption>
                        </figure>
                      )}

                      {s.itens && (
                        <dl className="mt-7 border-t border-linha">
                          {s.itens.map(([nome, dur, nota]) => (
                            <div key={nome} className="flex items-baseline justify-between gap-6 border-b border-linha py-3 text-sm">
                              <dt>
                                {nome}
                                {nota && <span className="mt-1 block max-w-[52ch] text-[13px] leading-relaxed text-texto2">{nota}</span>}
                              </dt>
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
