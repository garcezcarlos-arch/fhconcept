"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";
import { nomeFormato } from "@/lib/formacoes";

export type EstadoInscricao = { erro?: string };
const soDigitos = (s: string) => s.replace(/\D/g, "");

export async function reservarVaga(_: EstadoInscricao, dados: FormData): Promise<EstadoInscricao> {
  const turmaId = String(dados.get("turma_id") ?? "");
  const nome = String(dados.get("nome") ?? "").trim();
  const telefone = soDigitos(String(dados.get("telefone") ?? ""));
  const email = String(dados.get("email") ?? "").trim() || null;
  const cidade = String(dados.get("cidade") ?? "").trim() || null;
  const experiencia = String(dados.get("experiencia") ?? "").trim() || null;
  const observacoes = String(dados.get("observacoes") ?? "").trim() || null;
  const metodo = String(dados.get("pagamento") ?? "pix") as "pix" | "cartao_credito";

  if (!nome || telefone.length < 10) return { erro: "Preencha nome e WhatsApp." };

  const db = createAdminClient();
  const { data: t } = await db.from("turmas_vagas").select("*").eq("id", turmaId).maybeSingle();
  if (!t || !t.id || t.status !== "aberta") return { erro: "Esta turma não está mais aberta." };
  if ((t.restantes ?? 0) <= 0) return { erro: "As vagas acabaram enquanto você preenchia. Entre na lista de espera." };

  const valor = Number(t.sinal ?? t.preco ?? 0);
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  const { data: ins, error } = await db.from("inscricoes").insert({
    turma_id: t.id, formato: t.formato!, nome, telefone, email, cidade, experiencia, observacoes,
    status: "aguardando_pagamento", valor, metodo, gateway: token ? "mercadopago" : "manual",
  }).select("id").single();
  if (error || !ins) return { erro: "Não foi possível registrar a reserva: " + (error?.message ?? "") };

  // esgotou com esta reserva? marca a turma
  if ((t.restantes ?? 0) - 1 <= 0) await db.from("turmas").update({ status: "esgotada" }).eq("id", t.id);

  if (token) {
    const base = SITE.url;
    const corpo = {
      items: [{ id: `turma-${t.id}`, title: `${nomeFormato(t.formato!)} — ${t.nome}`, quantity: 1, unit_price: Number(valor.toFixed(2)), currency_id: "BRL" }],
      payer: { name: nome, email: email ?? undefined, phone: { area_code: telefone.slice(2, 4), number: telefone.slice(4) } },
      external_reference: `inscricao:${ins.id}`,
      notification_url: `${base}/api/mercadopago/webhook`,
      back_urls: {
        success: `${base}/formacoes/inscricao/confirmacao/${ins.id}?retorno=sucesso`,
        pending: `${base}/formacoes/inscricao/confirmacao/${ins.id}?retorno=pendente`,
        failure: `${base}/formacoes/inscricao/confirmacao/${ins.id}?retorno=falha`,
      },
      auto_return: "approved",
      statement_descriptor: "FH CONCEPT CURSO",
      payment_methods: metodo === "pix"
        ? { excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }] }
        : { excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }], installments: 12 },
    };
    let initPoint: string | null = null;
    try {
      const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(corpo),
      });
      const j = await r.json();
      initPoint = j?.init_point ?? null;
      if (j?.id) await db.from("inscricoes").update({ preference_id: String(j.id) }).eq("id", ins.id);
    } catch {}
    if (initPoint) redirect(initPoint);
  }

  redirect(`/formacoes/inscricao/confirmacao/${ins.id}`);
}
