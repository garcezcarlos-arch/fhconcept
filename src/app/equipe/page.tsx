import Image from "next/image";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { linkWhatsapp } from "@/lib/preco";
import { HISTORIA } from "@/lib/historia";
import { EQUIPE } from "@/lib/equipe";

export const metadata = {
  title: "Equipe",
  description:
    "Quem atende no FH Concept em Garuva: Fernanda Hosang (transformação de cor e visagismo), Juliana Araújo (ondulados, cacheados e crespos) e Laura Elisa (estética facial e sobrancelhas).",
  alternates: { canonical: "/equipe" },
};

export default function Equipe() {
  return (
    <div>
      <Cabecalho />

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 md:px-10 md:pb-14 md:pt-24">
          <span className="block h-px w-12 bg-champanhe" />
          <h1 className="mt-6 max-w-2xl font-serif text-4xl leading-[1.15] md:text-5xl">
            Três profissionais, cada uma no que faz melhor
          </h1>
          <nav aria-label="Equipe" className="mt-8 flex flex-wrap gap-x-7 gap-y-1 text-sm">
            {EQUIPE.map((p) => (
              <a key={p.slug} href={`#${p.slug}`} className="inline-flex min-h-11 items-center border-b border-nude text-nude-esc">{p.nome}</a>
            ))}
          </nav>
        </section>

        {/* uma profissional por faixa: retrato de um lado, texto do outro, alternando */}
        {EQUIPE.map((p, i) => {
          const invertido = i % 2 === 1;
          return (
            <section key={p.slug} id={p.slug} className={`scroll-mt-20 ${invertido ? "bg-branco" : "bg-creme"}`}>
              <div className={`mx-auto max-w-6xl px-5 py-14 md:grid md:gap-x-16 md:px-10 md:py-24 ${invertido ? "md:grid-cols-[1.15fr_0.85fr]" : "md:grid-cols-[0.85fr_1.15fr]"}`}>
                <figure className={`relative aspect-[4/5] overflow-hidden bg-areia md:sticky md:top-28 md:row-start-1 md:self-start ${invertido ? "md:col-start-2" : "md:col-start-1"}`}>
                  <Image src={p.foto} alt={p.alt} fill sizes="(max-width: 768px) 100vw, 40vw" className={`object-cover ${p.posicao}`} />
                </figure>

                <article className={`mt-8 md:row-start-1 md:mt-0 ${invertido ? "md:col-start-1" : "md:col-start-2"}`}>
                  <h2 className="font-serif text-4xl leading-tight md:text-[52px]">{p.nome}</h2>
                  <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-nude-esc">{p.titulo}</p>

                  <p className="mt-8 font-serif text-xl leading-relaxed text-texto md:text-[22px] md:leading-[1.55]">{p.texto[0]}</p>
                  {p.texto.length > 1 && (
                    <div className="mt-8 space-y-6 border-t border-linha pt-8 leading-relaxed text-texto2">
                      {p.texto.slice(1).map((t) => (
                        <p key={t} className="max-w-[62ch]">{t}</p>
                      ))}
                    </div>
                  )}
                  {p.fecho && <p className="mt-8 max-w-[40ch] border-l border-champanhe pl-5 font-serif text-xl leading-snug text-texto">{p.fecho}</p>}

                  <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm">
                    <a href={linkWhatsapp(`Oi! Queria agendar um horário com a ${p.primeiroNome}.`)} target="_blank" rel="noopener" className="inline-flex min-h-13 items-center bg-carvao px-7 text-creme transition-colors hover:bg-nude-esc">
                      Agendar com a {p.primeiroNome}
                    </a>
                    <a href={p.insta} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center border-b border-nude text-nude-esc">Instagram</a>
                  </div>
                </article>
              </div>
            </section>
          );
        })}

        <section id="historia" className="scroll-mt-20 bg-branco px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl md:grid md:grid-cols-[0.85fr_1.15fr] md:gap-x-16">
            <div className="md:sticky md:top-28 md:self-start">
              <span className="block h-px w-12 bg-champanhe" />
              <h2 className="mt-6 font-serif text-4xl leading-tight md:text-[52px]">Nossa história</h2>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="font-serif text-xl leading-relaxed text-texto md:text-2xl md:leading-[1.5]">{HISTORIA[0]}</p>
              <div className="mt-8 space-y-6 border-t border-linha pt-8 leading-relaxed text-texto2">
                {HISTORIA.slice(1).map((p) => (
                  <p key={p} className="max-w-[62ch]">{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-areia px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl md:flex md:items-end md:justify-between md:gap-10">
            <div>
              <p className="text-sm text-texto2">Agendamento</p>
              <h2 className="mt-2 max-w-xl font-serif text-3xl leading-tight">
                A agenda é uma só, pelo WhatsApp do salão
              </h2>
              <p className="mt-4 max-w-lg text-texto2">
                A recepção encaixa você com a profissional certa para o que você precisa. Não é preciso procurar cada uma separadamente.
              </p>
            </div>
            <a href={linkWhatsapp("Oi! Queria agendar um horário.")} target="_blank" rel="noopener" className="mt-8 inline-flex min-h-13 shrink-0 items-center bg-carvao px-7 text-sm text-creme md:mt-0">Falar no WhatsApp</a>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}
