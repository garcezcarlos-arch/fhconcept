"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";

export type EstadoCheckout = { erro?: string };

type ItemEnviado = { variant_id: string; quantidade: number };

const soDigitos = (s: string) => s.replace(/\D/g, "");

export async function finalizarPedido(_: EstadoCheckout, dados: FormData): Promise<EstadoCheckout> {
  const nome = String(dados.get("nome") ?? "").trim();
  const telefone = soDigitos(String(dados.get("telefone") ?? ""));
  const email = String(dados.get("email") ?? "").trim() || null;
  const entrega = String(dados.get("entrega") ?? "retirada_salao") as "retirada_salao" | "correios";
  const pagamento = String(dados.get("pagamento") ?? "pix") as "pix" | "cartao_credito";
  const observacoes = String(dados.get("observacoes") ?? "").trim() || null;

  let itens: ItemEnviado[] = [];
  try { itens = JSON.parse(String(dados.get("itens") ?? "[]")); } catch {}
  itens = itens.filter((x) => x.variant_id && x.quantidade > 0);

  if (!nome || telefone.length < 10) return { erro: "Preencha nome e WhatsApp." };
  if (itens.length === 0) return { erro: "Seu carrinho está vazio." };

  const db = createAdminClient();

  // precos vem do banco, nunca do cliente
  const { data: variantes, error: eVar } = await db
    .from("product_variants")
    .select("id, nome, sku, preco, preco_promocional, ativo, products(id, nome, status, vendor_id)")
    .in("id", itens.map((x) => x.variant_id));
  if (eVar || !variantes?.length) return { erro: "Não foi possível conferir os produtos. Tente de novo." };

  const linhas = itens.map((x) => {
    const v = variantes.find((y) => y.id === x.variant_id);
    if (!v || !v.ativo || !v.products) return null;
    const preco = v.preco_promocional ?? v.preco;
    return { v, quantidade: x.quantidade, preco, total: preco * x.quantidade };
  }).filter((x): x is NonNullable<typeof x> => x !== null);
  if (linhas.length === 0) return { erro: "Os produtos do carrinho não estão mais disponíveis." };

  const subtotal = linhas.reduce((s, l) => s + l.total, 0);

  // cliente: reaproveita pelo telefone
  let customerId: string;
  const { data: existente } = await db.from("customers").select("id").eq("telefone", telefone).maybeSingle();
  if (existente) {
    customerId = existente.id;
    await db.from("customers").update({ nome, ...(email ? { email } : {}) }).eq("id", customerId);
  } else {
    const { data: novo, error } = await db.from("customers").insert({ nome, telefone, email }).select("id").single();
    if (error || !novo) return { erro: "Não foi possível registrar seus dados." };
    customerId = novo.id;
  }

  // endereco, so para envio
  let addressId: string | null = null;
  if (entrega === "correios") {
    const cep = soDigitos(String(dados.get("cep") ?? ""));
    const end = {
      customer_id: customerId,
      cep,
      logradouro: String(dados.get("logradouro") ?? "").trim(),
      numero: String(dados.get("numero") ?? "").trim(),
      complemento: String(dados.get("complemento") ?? "").trim() || null,
      bairro: String(dados.get("bairro") ?? "").trim(),
      cidade: String(dados.get("cidade") ?? "").trim(),
      uf: String(dados.get("uf") ?? "").trim().toUpperCase().slice(0, 2),
      padrao: true,
    };
    if (cep.length !== 8 || !end.logradouro || !end.numero || !end.bairro || !end.cidade || end.uf.length !== 2) {
      return { erro: "Preencha o endereço completo para envio." };
    }
    const { data: addr, error } = await db.from("addresses").insert(end).select("id").single();
    if (error || !addr) return { erro: "Não foi possível registrar o endereço." };
    addressId = addr.id;
  }

  // pedido
  const { data: pedido, error: ePed } = await db
    .from("orders")
    .insert({ customer_id: customerId, address_id: addressId, subtotal, frete_total: 0, desconto_total: 0, total: subtotal, status: "aguardando_pagamento", observacoes })
    .select("id, numero")
    .single();
  if (ePed || !pedido) return { erro: "Não foi possível criar o pedido: " + (ePed?.message ?? "") };

  await db.from("order_items").insert(
    linhas.map((l) => ({
      order_id: pedido.id,
      variant_id: l.v.id,
      vendor_id: l.v.products!.vendor_id,
      sku: l.v.sku,
      produto_nome: l.v.products!.nome,
      variante_nome: l.v.nome,
      quantidade: l.quantidade,
      preco_unitario: l.preco,
      total_linha: l.total,
    })),
  );

  const vendorIds = [...new Set(linhas.map((l) => l.v.products!.vendor_id))];
  await db.from("order_shipments").insert(
    vendorIds.map((vendor_id) => ({ order_id: pedido.id, vendor_id, tipo: entrega, valor_frete: 0, status: "pendente" })),
  );

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const gateway = token ? "mercadopago" : "manual";

  const { data: pag } = await db
    .from("payments")
    .insert({ order_id: pedido.id, gateway, metodo: pagamento, valor: subtotal, status: "pendente" })
    .select("id")
    .single();

  // com Mercado Pago configurado, cria a preferencia e redireciona
  if (token) {
    const base = SITE.url;
    const corpo = {
      items: linhas.map((l) => ({
        id: l.v.sku,
        title: l.v.nome ? `${l.v.products!.nome} — ${l.v.nome}` : l.v.products!.nome,
        quantity: l.quantidade,
        unit_price: Number(l.preco.toFixed(2)),
        currency_id: "BRL",
      })),
      payer: { name: nome, email: email ?? undefined, phone: { area_code: telefone.slice(2, 4), number: telefone.slice(4) } },
      external_reference: pedido.id,
      notification_url: `${base}/api/mercadopago/webhook`,
      back_urls: {
        success: `${base}/loja/pedido/${pedido.id}?retorno=sucesso`,
        pending: `${base}/loja/pedido/${pedido.id}?retorno=pendente`,
        failure: `${base}/loja/pedido/${pedido.id}?retorno=falha`,
      },
      auto_return: "approved",
      statement_descriptor: "FH CONCEPT",
      payment_methods: pagamento === "pix"
        ? { excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }] }
        : { excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }], installments: 6 },
    };

    let initPoint: string | null = null;
    try {
      const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const j = await r.json();
      initPoint = j?.init_point ?? null;
      if (pag && j?.id) await db.from("payments").update({ raw: { preference_id: j.id } }).eq("id", pag.id);
    } catch {}

    if (initPoint) redirect(initPoint);
  }

  redirect(`/loja/pedido/${pedido.id}`);
}
