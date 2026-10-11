"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Foto = { foto: string; alt: string; posicao?: string };

/* Foto da categoria em /servicos. No computador ela fica presa ao lado da lista
   e troca para a foto do servico que esta na tela, quando ele tem uma propria;
   sem foto propria, volta a da categoria. No celular fica parada no topo (as
   fotos dos demais servicos aparecem junto de cada um). */
export function FotoCategoria({ padrao, slugs, fotos, className }: { padrao: Foto; slugs: string[]; fotos: Record<string, Foto>; className: string }) {
  const [ativo, setAtivo] = useState(slugs[0] ?? "");

  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      let atual = slugs[0] ?? "";
      if (window.matchMedia("(min-width: 768px)").matches) {
        const linha = window.innerHeight * 0.45;
        for (const s of slugs) {
          const el = document.getElementById(s);
          if (el && el.getBoundingClientRect().top <= linha) atual = s;
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

  // a da categoria primeiro, depois uma por servico que tem foto propria
  const camadas: (Foto & { chave: string })[] = [{ chave: "", ...padrao }, ...slugs.filter((s) => fotos[s]).map((s) => ({ chave: s, ...fotos[s] }))];
  const visivel = fotos[ativo] ? ativo : "";

  return (
    <figure className={className}>
      {camadas.map((c) => (
        <Image
          key={c.chave}
          src={c.foto}
          alt={c.chave === visivel ? c.alt : ""}
          aria-hidden={c.chave === visivel ? undefined : true}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className={`object-cover transition-opacity duration-500 ${c.posicao ?? "object-top"} ${c.chave === visivel ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </figure>
  );
}
