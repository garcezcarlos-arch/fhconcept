import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { Eyebrow, Botao, Figura } from "@/components/ui";
import { SITE } from "@/lib/site";
import { linkWhatsapp } from "@/lib/preco";

export const metadata = {
  title: "Contato e como chegar",
  description:
    "FH Concept fica na Rua Rui Barbosa, 679, Centro de Garuva/SC — a 30 minutos de Joinville. Terça a sábado, com hora marcada pelo WhatsApp.",
  alternates: { canonical: "/contato" },
};

const ROTAS: [string, string][] = [
  ["Joinville", "30 min pela BR-101"],
  ["Itapoá", "40 min"],
  ["Guaratuba", "50 min"],
  ["Curitiba", "1h30 pela BR-376"],
];

const endereco = encodeURIComponent(`${SITE.rua}, ${SITE.bairro}, ${SITE.cidade} - ${SITE.uf}`);
const mapa = `https://www.google.com/maps?q=${endereco}&z=16&output=embed`;
const rota = `https://www.google.com/maps/dir/?api=1&destination=${SITE.lat},${SITE.lng}`;

export default function Contato() {
  return (
    <div className="min-h-dvh bg-creme text-texto">
      <Cabecalho />

      <main>
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl md:grid md:grid-cols-2 md:gap-16">
            <div>
              <Eyebrow>Onde estamos</Eyebrow>
              <h1 className="mt-4 max-w-[15ch] font-serif text-4xl leading-[1.08] md:text-5xl">
                No centro de Garuva, a trinta minutos de Joinville
              </h1>

              <dl className="mt-10 border-t border-carvao">
                <div className="flex justify-between gap-6 border-b border-linha py-4 text-[15px]">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-texto2 pt-1">Endereço</dt>
                  <dd className="text-right">{SITE.rua}<br />{SITE.bairro} · {SITE.cidade}/{SITE.uf} · {SITE.cep}</dd>
                </div>
                <div className="flex justify-between gap-6 border-b border-linha py-4 text-[15px]">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-texto2 pt-1">Horário</dt>
                  <dd className="text-right">Terça a sábado<br />8h30–12h · 13h30–18h30</dd>
                </div>
                <div className="flex justify-between gap-6 border-b border-linha py-4 text-[15px]">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-texto2 pt-1">WhatsApp</dt>
                  <dd className="text-right"><a href={linkWhatsapp("Oi! Vim pelo site.")} target="_blank" rel="noopener" className="hover:text-nude">(47) 99642-6656</a></dd>
                </div>
                <div className="flex justify-between gap-6 border-b border-linha py-4 text-[15px]">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-texto2 pt-1">Instagram</dt>
                  <dd className="text-right"><a href={SITE.instagram} target="_blank" rel="noopener" className="hover:text-nude">@fernandahosangconcept</a></dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-4">
                <Botao href={linkWhatsapp("Oi! Vim pelo site e queria agendar.")}>Agendar pelo WhatsApp</Botao>
                <Botao href={rota} variante="secundario">Traçar rota</Botao>
              </div>

              <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-texto2">
                Atendimento com hora marcada. Para correção de cor, o horário é reservado com mais tempo — vale mandar uma foto do cabelo antes para dimensionarmos o atendimento.
              </p>
            </div>

            <div className="mt-12 md:mt-0">
              <div className="aspect-[4/3] overflow-hidden bg-areia">
                <iframe
                  src={mapa}
                  title="Mapa: FH Concept em Garuva"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0 grayscale-[.35]"
                />
              </div>
              <div className="mt-6 border-t border-carvao">
                {ROTAS.map(([cidade, tempo]) => (
                  <div key={cidade} className="flex items-baseline justify-between gap-4 border-b border-linha py-3">
                    <span className="font-serif text-lg">{cidade}</span>
                    <span className="text-sm text-texto2">{tempo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-areia px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl md:grid md:grid-cols-[1fr_1fr] md:items-center md:gap-16">
            <div>
              <Eyebrow>O espaço</Eyebrow>
              <h2 className="mt-4 max-w-[19ch] font-serif text-3xl leading-[1.12] md:text-4xl">Um salão, três especialidades</h2>
              <p className="mt-5 max-w-[52ch] text-texto2">
                Cor, cachos e estética facial no mesmo endereço. Dá para resolver o cabelo e a pele na mesma visita — a recepção encaixa os horários.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 md:mt-0">
              <Figura src="/galeria/loja-linha-produtos.jpg" alt="Bancada com a linha de produtos do salão" proporcao="aspect-[3/4]" sizes="(max-width: 768px) 50vw, 24vw" />
              <Figura src="/galeria/equipe-atendimento-bob.jpg" alt="Atendimento no salão" proporcao="aspect-[3/4]" sizes="(max-width: 768px) 50vw, 24vw" className="mt-8" />
            </div>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}
