/* Espelho da maquina de estados do banco (fn_orders_transicao).
   'pago' e 'estornado' nao aparecem aqui: so entram pelo fluxo de pagamento. */

export type StatusPedido =
  | "aguardando_pagamento" | "pago" | "em_separacao" | "enviado"
  | "pronto_retirada" | "concluido" | "cancelado" | "estornado";

export const NOME_STATUS: Record<StatusPedido, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_separacao: "Em separação",
  pronto_retirada: "Pronto p/ retirada",
  enviado: "Enviado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  estornado: "Estornado",
};

export const PROXIMOS_MANUAIS: Record<StatusPedido, StatusPedido[]> = {
  aguardando_pagamento: ["cancelado"],
  pago: ["em_separacao", "pronto_retirada", "enviado"],
  em_separacao: ["pronto_retirada", "enviado"],
  pronto_retirada: ["concluido"],
  enviado: ["concluido"],
  concluido: [],
  cancelado: [],
  estornado: [],
};

export const PODE_ESTORNAR: StatusPedido[] = ["pago", "em_separacao", "pronto_retirada", "enviado", "concluido"];
