"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ItemCarrinho = {
  variant_id: string;
  vendor_id: string;
  slug: string;
  produto: string;
  variante: string;
  sku: string;
  preco: number;
  foto: string | null;
  quantidade: number;
};

type Ctx = {
  itens: ItemCarrinho[];
  adicionar: (item: Omit<ItemCarrinho, "quantidade">, qtd?: number) => void;
  alterar: (variant_id: string, quantidade: number) => void;
  remover: (variant_id: string) => void;
  limpar: () => void;
  total: number;
  quantidade: number;
  pronto: boolean;
};

const CHAVE = "fh-carrinho";
const CarrinhoContext = createContext<Ctx | null>(null);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {}
    setPronto(true);
  }, []);

  useEffect(() => {
    if (pronto) localStorage.setItem(CHAVE, JSON.stringify(itens));
  }, [itens, pronto]);

  const valor = useMemo<Ctx>(() => ({
    itens,
    pronto,
    adicionar: (item, qtd = 1) =>
      setItens((atual) => {
        const i = atual.findIndex((x) => x.variant_id === item.variant_id);
        if (i >= 0) {
          const copia = [...atual];
          copia[i] = { ...copia[i], quantidade: copia[i].quantidade + qtd };
          return copia;
        }
        return [...atual, { ...item, quantidade: qtd }];
      }),
    alterar: (variant_id, quantidade) =>
      setItens((atual) =>
        quantidade <= 0
          ? atual.filter((x) => x.variant_id !== variant_id)
          : atual.map((x) => (x.variant_id === variant_id ? { ...x, quantidade } : x)),
      ),
    remover: (variant_id) => setItens((atual) => atual.filter((x) => x.variant_id !== variant_id)),
    limpar: () => setItens([]),
    total: itens.reduce((s, x) => s + x.preco * x.quantidade, 0),
    quantidade: itens.reduce((s, x) => s + x.quantidade, 0),
  }), [itens, pronto]);

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error("useCarrinho fora do CarrinhoProvider");
  return ctx;
}
