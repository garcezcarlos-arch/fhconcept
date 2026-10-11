"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { exigirAdmin } from "@/lib/admin-auth";
import { PROFISSIONAIS, mesAtual, rotuloMes } from "@/lib/salao";

function voltar(aviso: string): never {
  revalidatePath("/admin/salao");
  revalidatePath("/admin");
  redirect(`/admin/salao?aviso=${encodeURIComponent(aviso)}`);
}

// campo vazio = null; qualquer coisa que nao seja inteiro >= 0 = NaN
function inteiro(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

// aceita "1.234,56", "1234,56" e "1234.56"
function dinheiro(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim().replace(/^R\$\s*/i, "");
  if (!s) return 0;
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

export async function salvarMes(dados: FormData) {
  await exigirAdmin();

  const mes = String(dados.get("mes") ?? "").trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) voltar("Escolha o mês.");
  if (mes > mesAtual()) voltar("Esse mês ainda não começou.");

  const agendamentos = inteiro(dados.get("agendamentos"));
  const cancelados = inteiro(dados.get("cancelados")) ?? 0;
  const faltas = inteiro(dados.get("faltas"));
  const comandas = inteiro(dados.get("comandas_fechadas")) ?? 0;
  const bruto = dinheiro(dados.get("valor_bruto"));
  const descontos = dinheiro(dados.get("descontos"));

  if (agendamentos === null) voltar("Informe o total de agendamentos.");
  if ([agendamentos, cancelados, faltas ?? 0, comandas].some(Number.isNaN)) voltar("Agendamentos, cancelados, faltas e comandas devem ser números inteiros.");
  if ([bruto, descontos].some(Number.isNaN)) voltar("Valores em reais: use o formato 1.234,56.");
  if (cancelados > agendamentos) voltar("Os cancelados não podem passar do total de agendamentos.");
  if (descontos > bruto) voltar("Os descontos não podem passar do valor bruto.");

  const porProfissional: Record<string, number> = {};
  for (const p of [...PROFISSIONAIS, "Outras"]) {
    const n = inteiro(dados.get(`prof_${p}`));
    if (Number.isNaN(n)) voltar(`Agendamentos de ${p}: use um número inteiro.`);
    if (n) porProfissional[p] = n;
  }
  const soma = Object.values(porProfissional).reduce((s, n) => s + n, 0);
  if (soma > 0 && soma !== agendamentos) voltar(`A soma por profissional (${soma}) é diferente do total de agendamentos (${agendamentos}).`);

  const db = createAdminClient();
  const { error } = await db.from("salao_mensal").upsert(
    {
      mes: `${mes}-01`,
      agendamentos,
      cancelados,
      faltas,
      por_profissional: porProfissional,
      comandas_fechadas: comandas,
      valor_bruto: bruto,
      descontos,
      origem: "manual",
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "mes" },
  );
  voltar(error ? `Não foi possível salvar: ${error.message}` : `Números de ${rotuloMes(`${mes}-01`, true)} salvos.`);
}
