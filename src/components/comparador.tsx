"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = { antes: string; depois: string; alt: string; proporcao?: string };

/* Antes/depois com alca arrastavel — o .comp do site original */
export function Comparador({ antes, depois, alt, proporcao = "aspect-[4/3]" }: Props) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  function mover(x: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  }

  return (
    <div
      ref={ref}
      className={`relative ${proporcao} cursor-ew-resize select-none overflow-hidden bg-areia touch-none`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mover(e.clientX); }}
      onPointerMove={(e) => { if (e.buttons) mover(e.clientX); }}
      role="slider"
      aria-label="Comparar antes e depois"
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
      }}
    >
      <Image src={antes} alt={`${alt} — antes`} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
      <Image src={depois} alt={`${alt} — depois`} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />

      <span className="absolute bottom-4 left-4 bg-creme/92 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-carvao">Antes</span>
      <span className="absolute bottom-4 right-4 bg-creme/92 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-carvao">Depois</span>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-creme" style={{ left: `${pos}%` }} />
      <div className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-creme text-sm text-carvao shadow-[0_2px_14px_rgba(0,0,0,.22)]" style={{ left: `${pos}%` }}>
        ⟷
      </div>
    </div>
  );
}
