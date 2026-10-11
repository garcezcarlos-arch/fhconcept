"use client";

import { useEffect, useRef, useState } from "react";

type Item = { slug: string; nome: string };

/* Barra de categorias da pagina /servicos: fica presa abaixo do cabecalho e
   marca a categoria que esta na tela. Sem JavaScript continua sendo uma lista
   de ancoras. As alturas em `top` acompanham o cabecalho (69px / 77px). */
export function NavServicos({ itens, agendar }: { itens: Item[]; agendar: string }) {
  const [ativo, setAtivo] = useState("");
  const trilho = useRef<HTMLDivElement>(null);

  // ativa a ultima secao cujo topo ja passou de 40% da tela; no topo da pagina, nenhuma
  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const linha = window.innerHeight * 0.4;
      let atual = "";
      for (const i of itens) {
        const el = document.getElementById(i.slug);
        if (el && el.getBoundingClientRect().top <= linha) atual = i.slug;
      }
      setAtivo(atual);
    };
    const agendarMedida = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    agendarMedida();
    window.addEventListener("scroll", agendarMedida, { passive: true });
    window.addEventListener("resize", agendarMedida);
    return () => {
      window.removeEventListener("scroll", agendarMedida);
      window.removeEventListener("resize", agendarMedida);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, [itens]);

  // no celular a barra rola de lado: mantem a categoria ativa visivel
  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    const link = ativo ? t.querySelector<HTMLElement>(`[data-slug="${ativo}"]`) : null;
    if (!link) {
      t.scrollTo({ left: 0, behavior: "auto" });
      return;
    }
    const alvo = link.offsetLeft - (t.clientWidth - link.offsetWidth) / 2;
    t.scrollTo({ left: Math.max(0, alvo), behavior: "auto" });
  }, [ativo]);

  return (
    <nav aria-label="Categorias de serviços" className="sticky top-[69px] z-40 border-b border-linha bg-creme/95 backdrop-blur md:top-[77px]">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 md:px-10">
        <div ref={trilho} className="-mx-5 flex flex-1 gap-6 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {itens.map((i) => (
            <a
              key={i.slug}
              href={`#${i.slug}`}
              data-slug={i.slug}
              aria-current={ativo === i.slug ? "true" : undefined}
              className={`flex min-h-13 shrink-0 items-center whitespace-nowrap border-b-2 text-sm transition-colors ${ativo === i.slug ? "border-nude text-carvao" : "border-transparent text-texto2 hover:text-carvao"}`}
            >
              {i.nome}
            </a>
          ))}
        </div>
        <a href={agendar} target="_blank" rel="noopener" className="hidden min-h-10 shrink-0 items-center bg-carvao px-5 text-sm text-creme transition-colors hover:bg-nude-esc lg:inline-flex">
          Agendar pelo WhatsApp
        </a>
      </div>
    </nav>
  );
}
