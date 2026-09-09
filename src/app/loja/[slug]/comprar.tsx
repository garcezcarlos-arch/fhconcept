"use client";

import { useState } from "react";
import Link from "next/link";
import { reais, linkWhatsapp } from "@/lib/preco";
import { useCarrinho } from "@/lib/carrinho";

type Tamanho = {
  id: string;
  nome: string;
  sku: string;
  preco: number;
  preco_promocional: number | null;
};

export default function Comprar({
  produto,
  slug,
  vendorId,
  foto,
  tamanhos,
}: {
  produto: string;
  slug: string;
  vendorId: string;
  foto: string | null;
  tamanhos: Tamanho[];
}) {
  const [i, setI] = useState(0);
  const [qtd, setQtd] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { adicionar } = useCarrinho();
  const t = tamanhos[i];

  if (!t) return null;

  const preco = t.preco_promocional ?? t.preco;
  const rotulo = tamanhos.length > 1 ? `${produto} — ${t.nome}` : produto;

  function porNoCarrinho() {
    adicionar({ variant_id: t.id, vendor_id: vendorId, slug, produto, variante: t.nome, sku: t.sku, preco, foto }, qtd);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2500);
  }

  return (
    <div className="mt-8">
      {tamanhos.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {tamanhos.map((x, j) => (
            <button key={x.id} type="button" onClick={() => setI(j)} className={`min-h-11 border px-4 text-sm ${j === i ? "border-carvao bg-carvao text-creme" : "border-linha bg-white"}`}>
              {x.nome}
            </button>
          ))}
        </div>
      )}

      <p className="font-serif text-3xl">
        {reais(preco)}
        {t.preco_promocional && (
          <span className="ml-3 align-middle text-base text-carvao/40 line-through">{reais(t.preco)}</span>
        )}
      </p>
      <p className="mt-1 text-sm text-carvao/60">Pix, cartão ou na retirada no salão</p>

      <div className="mt-5 flex items-stretch gap-3">
        <div className="flex border border-linha">
          <button type="button" aria-label="Menos" onClick={() => setQtd(Math.max(1, qtd - 1))} className="min-h-13 w-11 text-lg">−</button>
          <span className="flex min-w-10 items-center justify-center text-sm">{qtd}</span>
          <button type="button" aria-label="Mais" onClick={() => setQtd(qtd + 1)} className="min-h-13 w-11 text-lg">+</button>
        </div>
        <button type="button" onClick={porNoCarrinho} className="flex min-h-13 flex-1 items-center justify-center bg-carvao px-6 text-sm text-creme transition-colors hover:bg-nude-esc">
          {adicionado ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
      </div>

      {adicionado && (
        <Link href="/loja/carrinho" className="mt-3 inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">Ver carrinho e finalizar</Link>
      )}

      <a href={linkWhatsapp(`Oi! Tenho uma dúvida sobre: ${rotulo} — ${reais(preco)}`)} target="_blank" rel="noopener" className="mt-4 block text-sm text-carvao/50 hover:text-nude">Tirar dúvida pelo WhatsApp</a>
    </div>
  );
}
