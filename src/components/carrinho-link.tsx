"use client";

import Link from "next/link";
import { useCarrinho } from "@/lib/carrinho";

export function CarrinhoLink() {
  const { quantidade, pronto } = useCarrinho();
  return (
    <Link href="/loja/carrinho" className="inline-flex min-h-11 items-center gap-2 text-sm text-carvao/70 hover:text-nude">
      Carrinho
      {pronto && quantidade > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-carvao px-1.5 text-[11px] text-creme">{quantidade}</span>
      )}
    </Link>
  );
}
