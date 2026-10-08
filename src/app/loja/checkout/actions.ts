"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { avisarPedidoRecebido } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";
import { criarPreferencia, mpConfigurado } from "@/lib/payments/mercadopago";
import { buscarEndereco, cotarFrete, freteConfigurado, type OpcaoFrete } from "@/lib/frete/melhorenvio";

export type EstadoCheckout = { erro?: string };

export type ResultadoCotacao = {
  modo: "cotado" | "manual";       // manual = sem Melhor Envio: frete combinado no WhatsApp
  opcoes: OpcaoFrete[];
  endereco: { logradouro: string; bairro: string; cidade: string; uf: string } | null;
  erro?: string;
};

/* Chamada pelo formulario quando a cliente digita o CEP. */
export async function cotarFreteCheckout(cep: string, itensJson: string): Promise<ResultadoCotacao> {
  let itens: ItemEnviado[] = [];
  try { itens = JSON.parse(itensJson); } catch {}
  const endereco = await buscarEndereco(cep);
  if (!freteConfigurado()) return { modo: "manual", opcoes: [], endereco };
  try {
    const opcoes = await cotarFrete(cep, itens);
    if (!opcoes.length) return { modo: "cotado", opcoes, endereco, erro: "Nenhuma opção de envio para esse CEP. Escolha retirada ou fale com o salão." };
    return { modo: "cotado", opcoes, endereco };
  } catch (e) {
    console.error("cotacao de frete", e);
    return { modo: "cotado", opcoes: [], endereco, erro: "Não foi possível calcular o frete agora. Tente de novo em instantes." };
  }
}

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

  // frete: recalculado aqui no servidor com o servico escolhido (nunca o valor do navegador)
  let frete = 0;
  let servicoFrete: OpcaoFrete | null = null;
  if (entrega === "correios" && freteConfigurado()) {
    const servicoId = String(dados.get("servico_frete") ?? "");
    if (!servicoId) return { erro: "Escolha uma opção de frete." };
    try {
      const opcoes = await cotarFrete(String(dados.get("cep") ?? ""), itens, servicoId);
      const opcao = opcoes.find((o) => String(o.id) === servicoId);
      if (!opcao) return { erro: "Essa opção de frete não está mais disponível. Calcule de novo." };
      servicoFrete = opcao;
      frete = Math.round(opcao.preco * 100) / 100;
    } catch {
      return { erro: "Não foi possível confirmar o frete agora. Tente de novo em instantes." };
    }
  }
  const total = Math.round((subtotal + frete) * 100) / 100;

  // pedido
  const { data: pedido, error: ePed } = await db
    .from("orders")
    .insert({ customer_id: customerId, address_id: addressId, subtotal, frete_total: frete, desconto_total: 0, total, status: "aguardando_pagamento", observacoes })
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
    // vendedor unico hoje: o frete inteiro fica na primeira remessa
    vendorIds.map((vendor_id, i) => ({
      order_id: pedido.id, vendor_id, tipo: entrega, status: "pendente",
      valor_frete: i === 0 ? frete : 0,
      transportadora: servicoFrete ? [servicoFrete.transportadora, servicoFrete.nome].filter(Boolean).join(" ") : null,
    })),
  );

  // e-mail de pedido recebido (cliente e loja) depois da resposta: nao atrasa o redirecionamento
  after(() => avisarPedidoRecebido(pedido.id));

  const usaMP = mpConfigurado();

  const { data: pag } = await db
    .from("payments")
    .insert({ order_id: pedido.id, gateway: usaMP ? "mercadopago" : "manual", metodo: pagamento, valor: total, status: "pendente" })
    .select("id")
    .single();

  // com Mercado Pago configurado, cria a preferencia e redireciona
  if (usaMP && pag) {
    let urlPagamento: string | null = null;
    try {
      const pref = await criarPreferencia({
        referencia: pedido.id,
        itens: linhas.map((l) => ({
          id: l.v.sku,
          title: l.v.nome ? `${l.v.products!.nome} — ${l.v.nome}` : l.v.products!.nome,
          quantity: l.quantidade,
          unit_price: l.preco,
        })).concat(frete > 0 && servicoFrete ? [{
          id: `frete-${servicoFrete.id}`,
          title: `Frete ${servicoFrete.nome} (${servicoFrete.prazoDias} dias úteis)`,
          quantity: 1,
          unit_price: frete,
        }] : []),
        pagador: { nome, email, telefone: telefone.length > 11 ? telefone.replace(/^55/, "") : telefone },
        metodo: pagamento,
        urlBase: SITE.url,
        retorno: `/loja/pedido/${pedido.id}`,
      });
      urlPagamento = pref.url;
      await db.from("payments").update({ raw: { preference_id: pref.preferenceId } }).eq("id", pag.id);
    } catch (e) {
      console.error("preferencia mercado pago", e);
      // gateway fora: o pedido segue, e a pagina oferece pagar pelo WhatsApp
      await db.from("payments").update({ gateway: "manual" }).eq("id", pag.id);
    }
    if (urlPagamento) redirect(urlPagamento);
  }

  redirect(`/loja/pedido/${pedido.id}`);
}
