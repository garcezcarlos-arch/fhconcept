import Image from "next/image";
import Link from "next/link";
import { CATEGORIAS, PREMIUM, mensagemAgendar } from "@/lib/servicos";
import { linkWhatsapp } from "@/lib/preco";

/* Servicos na home: o carro-chefe em destaque e, abaixo, as categorias com um
   servico por linha. O texto abre no toque (details nativo, sem JavaScript) e
   so um fica aberto por vez. */
export function ServicosResumo() {
  return (
    <section id="servicos" className="scroll-mt-20 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <p className="text-sm text-carvao/45">O que fazemos</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">Serviços</h2>
        </div>
        <Link href="/servicos" className="inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">
          Ver atendimentos e duração
        </Link>
      </div>

      <div className="mt-10 bg-areia md:grid md:grid-cols-[0.85fr_1.15fr]">
        <figure className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[440px]">
          <Image src={PREMIUM.foto} alt={PREMIUM.alt} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        </figure>
        <div className="flex flex-col justify-center px-6 py-9 md:px-14 md:py-12">
          <p className="text-sm text-nude-esc">Carro-chefe da casa</p>
          <h3 className="mt-2 font-serif text-[28px] leading-tight md:text-4xl">{PREMIUM.nome}</h3>
          {PREMIUM.texto.map((p) => (
            <p key={p} className="mt-5 max-w-[56ch] leading-relaxed text-carvao/70">{p}</p>
          ))}
          <p className="mt-5 text-sm text-carvao/55">{PREMIUM.duracao}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <a href={linkWhatsapp("Oi! Quero saber sobre a Transformação de Cor Premium.")} target="_blank" rel="noopener" className="inline-flex min-h-13 items-center bg-carvao px-7 text-sm text-creme transition-colors hover:bg-nude-esc">
              Falar sobre a transformação
            </a>
            <Link href={`/servicos#${PREMIUM.slug}`} className="inline-flex min-h-11 items-center border-b border-nude text-sm text-nude-esc">
              O que está incluído
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-14 md:mt-20">
        {CATEGORIAS.map((c) => (
          <div key={c.slug} className="border-t border-carvao/25 pb-10 pt-7 md:grid md:grid-cols-[0.85fr_1.15fr] md:pb-14 md:pt-9">
            <div className="md:pr-10">
              <h3 className="font-serif text-2xl md:text-[28px]">
                <Link href={`/servicos#${c.slug}`} className="hover:text-nude-esc">{c.nome}</Link>
              </h3>
              <p className="mt-1.5 text-sm text-carvao/50">Com {c.quem}</p>
            </div>

            <div className="mt-5 border-t border-linha md:mt-0">
              {c.servicos.map((s) => (
                <details key={s.slug} name="servicos-home" className="group border-b border-linha">
                  <summary className="flex min-h-15 cursor-pointer list-none items-center justify-between gap-6 py-3 outline-offset-4 hover:text-nude-esc [&::-webkit-details-marker]:hidden">
                    <span className="font-serif text-lg leading-snug md:text-xl">{s.nome}</span>
                    <span aria-hidden className="relative block h-3.5 w-3.5 shrink-0">
                      <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                      <span className="absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none" />
                    </span>
                  </summary>
                  <div className="pb-7 pr-6 md:pr-12">
                    {s.texto.map((p, i) => (
                      <p key={p} className={`leading-relaxed text-carvao/70 ${i > 0 ? "mt-3" : ""}`}>{p}</p>
                    ))}
                    <a href={linkWhatsapp(mensagemAgendar(s.nome))} target="_blank" rel="noopener" className="mt-4 inline-flex min-h-11 items-center border-b border-nude text-sm text-nude-esc">
                      Agendar pelo WhatsApp
                    </a>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
