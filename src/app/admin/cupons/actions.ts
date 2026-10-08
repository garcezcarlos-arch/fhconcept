"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function exigirStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("nao autenticado");
  const { data: perfil } = await supabase.from("profiles").select("papel").eq("id", user.id).single();
  if (!perfil || !["admin", "vendedor"].includes(perfil.papel)) throw new Error("sem permissao");
}

function voltar(aviso?: string): never {
  revalidatePath("/admin/cupons");
  redirect(aviso ? `/admin/cupons?aviso=${encodeURIComponent(aviso)}` : "/admin/cupons");
}

const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", ".").trim() || "0");
// data do formulario (AAAA-MM-DD) -> inicio do dia / fim do dia no horario de Brasilia
const dia = (v: FormDataEntryValue | null, fim: boolean) => {
  const s = String(v ?? "").trim();
  return s ? `${s}T${fim ? "23:59:59" : "00:00:00"}-03:00` : null;
};

export async function criarCupom(dados: FormData) {
  await exigirStaff();
  const codigo = String(dados.get("codigo") ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const tipo = String(dados.get("tipo") ?? "percentual");
  const valor = num(dados.get("valor"));
  const usosMax = String(dados.get("usos_max") ?? "").trim();

  if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) voltar("Código: de 3 a 30 letras ou números, sem espaço.");
  if (!["percentual", "valor", "frete_gratis"].includes(tipo)) voltar("Tipo de cupom inválido.");
  if (tipo === "percentual" && (valor <= 0 || valor > 100)) voltar("Percentual entre 1 e 100.");
  if (tipo === "valor" && valor <= 0) voltar("Informe o valor do desconto em reais.");

  const db = createAdminClient();
  const { data: existe } = await db.from("coupons").select("id").ilike("codigo", codigo.replace(/[_%\\]/g, (m) => `\\${m}`)).limit(1);
  if (existe?.length) voltar(`Já existe um cupom ${codigo}.`);

  const { error } = await db.from("coupons").insert({
    codigo,
    tipo,
    valor: tipo === "frete_gratis" ? 0 : valor,
    minimo_pedido: num(dados.get("minimo_pedido")),
    usos_max: usosMax ? Math.max(1, Math.round(Number(usosMax))) : null,
    inicio: dia(dados.get("inicio"), false),
    fim: dia(dados.get("fim"), true),
    ativo: true,
  });
  voltar(error ? `Não foi possível criar: ${error.message}` : `Cupom ${codigo} criado.`);
}

export async function alternarCupom(dados: FormData) {
  await exigirStaff();
  const id = String(dados.get("id"));
  const ativo = String(dados.get("ativo")) === "true";
  const db = createAdminClient();
  const { error } = await db.from("coupons").update({ ativo: !ativo }).eq("id", id);
  voltar(error ? `Erro: ${error.message}` : undefined);
}
