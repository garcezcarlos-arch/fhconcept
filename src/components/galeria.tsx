import Image from "next/image";

type Item = { src: string; alt: string; span: string };

const ITENS: Item[] = [
  { src: "/galeria/cor-loiro-balayage.jpg", alt: "Balayage loiro com ondas longas", span: "row-span-2" },
  { src: "/galeria/cor-acaju-chanel.jpg", alt: "Acaju em corte chanel", span: "row-span-1" },
  { src: "/galeria/cor-platinado-liso-costas.jpg", alt: "Platinado liso visto de costas", span: "row-span-2" },
  { src: "/galeria/cor-acobreado-costas.jpg", alt: "Acobreado visto de costas", span: "row-span-2" },
  { src: "/galeria/cor-morena-volume.jpg", alt: "Morena iluminada com volume", span: "row-span-2" },
  { src: "/galeria/cachos-longos.jpg", alt: "Cachos longos definidos", span: "row-span-2" },
  { src: "/galeria/cor-loiro-mel.jpg", alt: "Loiro mel com ondas", span: "row-span-1" },
  { src: "/galeria/rosto-maquiagem-perfil.jpg", alt: "Maquiagem social vista de perfil", span: "row-span-1" },
  { src: "/galeria/rosto-maquiagem-social.jpg", alt: "Maquiagem social com ondas", span: "row-span-2" },
];

function Fig({ item }: { item: Item }) {
  return (
    <figure className={`group relative overflow-hidden bg-areia ${item.span}`}>
      <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 50vw, 24vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
    </figure>
  );
}

export function Galeria() {
  return (
    <section className="px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-nude">Trabalhos</p>
        <h2 className="mt-4 max-w-[19ch] font-serif text-3xl leading-tight md:text-4xl">
          O tom sai como foi combinado
        </h2>

        <div className="mt-12 grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[210px] md:grid-cols-4">
          <Fig item={ITENS[0]} />
          <div className="flex flex-col justify-center bg-areia p-5 md:p-6">
            <b className="font-serif text-[29px] font-normal leading-none">2.900</b>
            <span className="mt-2 text-[10.5px] font-medium uppercase leading-relaxed tracking-[0.16em] text-texto2">
              alunas formadas
              <br />
              em oito anos
            </span>
          </div>
          <Fig item={ITENS[1]} />
          <Fig item={ITENS[2]} />
          <Fig item={ITENS[3]} />
          <Fig item={ITENS[4]} />
          <Fig item={ITENS[5]} />
          <Fig item={ITENS[6]} />
          <Fig item={ITENS[7]} />
          <Fig item={ITENS[8]} />
        </div>
      </div>
    </section>
  );
}
