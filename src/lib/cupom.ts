import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ResultadoCupom = { valido: boolean; codigo: string | null; tipo: string | null; desconto: number; motivo: string | null };

/* Regras no banco (fn_cupom_calcular): ativo, validade, limite de usos, pedido minimo.
   O uso so e contado quando o pedido e pago (fn_confirmar_pagamento). */
export async function calcularCupom(codigo: string, subtotal: number, frete: number): Promise<ResultadoCupom> {
  const limpo = codigo.trim();
  if (!limpo) return { valido: false, codigo: null, tipo: null, desconto: 0, motivo: "Digite o código do cupom." };
  const db = createAdminClient();
  const { data, error } = await db.rpc("fn_cupom_calcular", { p_codigo: limpo, p_subtotal: subtotal, p_frete: frete });
  if (error || !data?.[0]) {
    console.error("cupom", error);
    return { valido: false, codigo: null, tipo: null, desconto: 0, motivo: "Não foi possível conferir o cupom agora." };
  }
  const r = data[0];
  return { ...r, desconto: Number(r.desconto) || 0 };
}
