"use client";

import { useEffect } from "react";
import { useCarrinho } from "@/lib/carrinho";

/* Ao chegar na confirmacao, esvazia o carrinho */
export default function LimparCarrinho() {
  const { limpar, pronto } = useCarrinho();
  useEffect(() => { if (pronto) limpar(); }, [pronto, limpar]);
  return null;
}
