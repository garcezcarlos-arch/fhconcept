"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Comparador } from "@/components/comparador";

type Foto = { foto: string; alt: string; posicao?: string };
type Par = { antes: string; depois: string; alt: string };

/* Foto da categoria em /servicos. No computador ela fica presa ao lado da lista
   e troca conforme o servico que esta na tela: a foto propria dele, ou o antes
   e depois com alca; sem nenhum dos dois, volta a foto da categoria. No celular
   fica parada no topo (o que e de cada servico aparece junto dele). */
export function FotoCategoria({ padrao, slugs, fotos, pares, className }: { padrao: Foto; slugs: string[]; fotos: Record<string, Foto>; pares: Record<string, Par>; className: string }) {
  const [ativo, setAtivo] = useState(slugs[0] ?? "");
  const figura = useRef<HTMLElement>(null);

  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      let atual = slugs[0] ?? "";
      const caixa = figura.current?.getBoundingClientRect();
      if (caixa && window.matchMedia("(min-width: 768px)").matches) {
        // vale o servico que ocupa mais altura ao lado da foto: assim a imagem
        // acompanha o texto que a pessoa esta lendo, e nao o servico anterior
        let maior = 0;
        for (const s of slugs) {
          const r = document.getElementById(s)?.getBoundingClientRect();
          if (!r) continue;
          const altura = Math.min(r.bottom, caixa.bottom) - Math.max(r.top, caixa.top);
          if (altura > maior) {
            maior = altura;
            atual = s;
          }
        }
      }
      setAtivo(atual);
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    agendar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, [slugs]);

  const visivel = fotos[ativo] || pares[ativo] ? ativo : "";
  const camada = (chave: string) => `absolute inset-0 transition-opacity duration-500 ${chave === visivel ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`;

  return (
    <figure ref={figura} className={className}>
      {/* a da categoria primeiro, depois uma camada por servico que tem imagem propria */}
      {[{ chave: "", ...padrao }, ...slugs.filter((s) => fotos[s]).map((s) => ({ chave: s, ...fotos[s] }))].map((c) => (
        <div key={c.chave} className={camada(c.chave)} aria-hidden={c.chave === visivel ? undefined : true}>
          <Image src={c.foto} alt={c.chave === visivel ? c.alt : ""} fill sizes="(max-width: 768px) 100vw, 40vw" className={`object-cover ${c.posicao ?? "object-top"}`} />
        </div>
      ))}
      {slugs.filter((s) => pares[s]).map((s) => (
        // so no computador: no celular o comparador aparece dentro do proprio servico
        <div key={`par-${s}`} className={`hidden md:block ${camada(s)}`} inert={s !== visivel}>
          <Comparador antes={pares[s].antes} depois={pares[s].depois} alt={pares[s].alt} proporcao="h-full" />
        </div>
      ))}
    </figure>
  );
}
