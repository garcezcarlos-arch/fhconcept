import Image from "next/image";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { linkWhatsapp } from "@/lib/preco";

export const metadata = {
  title: "Equipe",
  description:
    "Quem atende no FH Concept em Garuva: colorimetria e correção de cor, cachos e tratamentos, estética facial e sobrancelhas.",
  alternates: { canonical: "/equipe" },
};

type Pessoa = { nome: string; papel: string; texto: string; foto: string; alt: string };

const EQUIPE: Pessoa[] = [
  {
    nome: "Fernanda Hosang",
    papel: "Colorimetria, mechas e correção de cor",
    texto: "Abriu o salão em 2014 e é Educadora Técnica Nátylla. Formou mais de 2.900 alunas em oito anos. É quem conduz a Transformação de Cor Premium, do diagnóstico do fio ao tom final.",
    foto: "/galeria/equipe-atendimento-bob.jpg",
    alt: "Fernanda Hosang finalizando a cor de uma cliente no salão",
  },
  {
    nome: "Juliana Araújo",
    papel: "Cachos e tratamentos",
    texto: "Cuida de definição de cachos, cronograma capilar e recuperação de fios danificados. Atende quem chega com o cabelo cansado de processo químico.",
    foto: "/galeria/equipe-atendimento-parede.jpg",
    alt: "Juliana Araújo atendendo uma cliente no salão",
  },
  {
    nome: "Laura Elisa",
    papel: "Estética facial e sobrancelhas",
    texto: "Design de sobrancelha, limpeza de pele e protocolos faciais. O olhar e a pele, na mesma visita em que se resolve o cabelo.",
    foto: "/galeria/equipe-jaleco-natylla.jpg",
    alt: "Laura Elisa no salão",
  },
];

export default function Equipe() {
  return (
    <div>
      <Cabecalho />

      <main>
        <section className="px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm text-texto2">Equipe</p>
            <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              Três profissionais, cada uma no que faz melhor
            </h1>
            <p className="mt-5 max-w-xl text-texto2">
              O salão começou como Studio Fernanda Hosang. Virou Concept quando outras profissionais entraram e o nome de uma pessoa só deixou de contar a história certa.
            </p>

            <div className="mt-14 grid gap-12 md:grid-cols-3">
              {EQUIPE.map((p) => (
                <article key={p.nome}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-areia md:aspect-[3/4]">
                    <Image src={p.foto} alt={p.alt} fill sizes="(max-width: 768px) 100vw, 31vw" className="object-cover" />
                  </div>
                  <h2 className="mt-6 font-serif text-2xl">{p.nome}</h2>
                  <p className="mt-1 text-sm text-nude">{p.papel}</p>
                  <p className="mt-3 text-texto2">{p.texto}</p>
                </article>
              ))}
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
