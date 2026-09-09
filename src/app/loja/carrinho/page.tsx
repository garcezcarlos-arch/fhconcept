"use client";

import Link from "next/link";
import Image from "next/image";
import { useCarrinho } from "@/lib/carrinho";
import { reais } from "@/lib/preco";

export default function Carrinho() {
  const { itens, alterar, remover, total, pronto } = useCarrinho();

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-nude">Loja</p>
      <h1 className="mt-3 font-serif text-3xl md:text-4xl">Carrinho</h1>

      {!pronto ? null : itens.length === 0 ? (
        <div className="mt-10 max-w-md">
          <p className="text-texto2">Seu carrinho está vazio.</p>
          <Link href="/loja" className="mt-5 inline-flex min-h-13 items-center bg-carvao px-7 text-sm text-creme">Ver produtos</Link>
        </div>
      ) : (
        <div className="mt-10 md:grid md:grid-cols-[1fr_20rem] md:gap-12">
          <ul className="divide-y divide-linha border-t border-linha">
            {itens.map((x) => (
              <li key={x.variant_id} className="flex gap-4 py-5">
                <Link href={`/loja/${x.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden bg-areia">
                  {x.foto && <Image src={x.foto} alt={x.produto} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link href={`/loja/${x.slug}`} className="font-serif text-lg leading-snug hover:text-nude">{x.produto}</Link>
                  <p className="text-sm text-texto2">{x.variante}</p>
                  <div className="mt-auto flex items-center justify-between gap-4 pt-3">
                    <div className="flex border border-linha">
                      <button type="button" aria-label="Menos" onClick={() => alterar(x.variant_id, x.quantidade - 1)} className="h-10 w-10">−</button>
                      <span className="flex min-w-8 items-center justify-center text-sm">{x.quantidade}</span>
                      <button type="button" aria-label="Mais" onClick={() => alterar(x.variant_id, x.quantidade + 1)} className="h-10 w-10">+</button>
                    </div>
                    <span className="font-serif text-lg">{reais(x.preco * x.quantidade)}</span>
                  </div>
                  <button type="button" onClick={() => remover(x.variant_id)} className="mt-2 self-start text-xs text-carvao/50 hover:text-nude">Remover</button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="mt-10 border border-linha p-6 md:mt-0 md:self-start">
            <div className="flex justify-between text-sm"><span className="text-texto2">Subtotal</span><span>{reais(total)}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span className="text-texto2">Frete</span><span className="text-texto2">calculado no próximo passo</span></div>
            <div className="mt-4 flex justify-between border-t border-linha pt-4 font-serif text-xl"><span>Total</span><span>{reais(total)}</span></div>
            <Link href="/loja/checkout" className="mt-6 flex min-h-13 items-center justify-center bg-carvao text-sm text-creme hover:bg-nude-esc">Finalizar compra</Link>
            <Link href="/loja" className="mt-3 block text-center text-sm text-carvao/60 hover:text-nude">Continuar comprando</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
