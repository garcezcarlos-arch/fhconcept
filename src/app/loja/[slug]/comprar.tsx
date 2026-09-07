"use client";

import { useState } from "react";
import { reais, linkWhatsapp } from "@/lib/preco";

type Tamanho = {
  id: string;
  nome: string;
  preco: number;
  preco_promocional: number | null;
};

export default function Comprar({
  produto,
  tamanhos,
}: {
  produto: string;
  tamanhos: Tamanho[];
}) {
  const [i, setI] = useState(0);
  const t = tamanhos[i];

  if (!t) return null;

  const preco = t.preco_promocional ?? t.preco;
  const rotulo = tamanhos.length > 1 ? `${produto} — ${t.nome}` : produto;

  return (
    <div className="mt-8">
      {tamanhos.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {tamanhos.map((x, j) => (
            <button
              key={x.id}
              onClick={() => setI(j)}
              className={`min-h-11 border px-4 text-sm ${
                j === i ? "border-carvao bg-carvao text-porcelana" : "border-linha bg-white"
              }`}
            >
              {x.nome}
            </button>
          ))}
        </div>
      )}

      <p className="font-serif text-3xl">
        {reais(preco)}
        {t.preco_promocional && (
          <span className="ml-3 align-middle text-base text-carvao/40 line-through">
            {reais(t.preco)}
          </span>
        )}
      </p>
      <p className="mt-1 text-sm text-carvao/60">Pix, cartão ou na retirada</p>

      

      <a
        href={linkWhatsapp(`Oi! Quero comprar: ${rotulo} — ${reais(preco)}`)}
        target="_blank"
        rel="noopener"
        className="mt-5 flex min-h-13 w-full items-center justify-center bg-carvao px-6 text-sm text-porcelana"
      >
        Comprar pelo WhatsApp
      </a>
    </div>
  );
}
