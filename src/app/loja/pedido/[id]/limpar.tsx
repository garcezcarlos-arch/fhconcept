"use client";

import { useEffect, useRef } from "react";
import { useCarrinho } from "@/lib/carrinho";

/* Ao chegar na confirmacao, esvazia o carrinho uma unica vez */
export default function LimparCarrinho() {
  const { limpar, pronto } = useCarrinho();
  const feito = useRef(false);
  useEffect(() => {
    if (pronto && !feito.current) {
      feito.current = true;
      limpar();
    }
  }, [pronto, limpar]);
  return null;
}
