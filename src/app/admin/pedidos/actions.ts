"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmarPagamento, estornarPedido } from "@/lib/pedidos";
import { estornarPagamento } from "@/lib/payments/mercadopago";
import { PROXIMOS_MANUAIS, PODE_ESTORNAR, type StatusPedido } from "@/lib/status-pedido";

async function exigirPapel(papeis: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("nao autenticado");
  const { data: perfil } = await supabase.from("profiles").select("papel").eq("id", user.id).single();
  if (!perfil || !papeis.includes(perfil.papel)) throw new Error("sem permissao");
  return supabase;
}
const exigirStaff = () => exigirPapel(["admin", "vendedor", "operacao"]);

function voltar(aviso?: string): never {
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/estoque");
  redirect(aviso ? `/admin/pedidos?aviso=${encodeURIComponent(aviso)}` : "/admin/pedidos");
}

export async function mudarStatus(dados: FormData) {
  const supabase = await exigirStaff();
  const id = String(dados.get("id"));
  const atual = String(dados.get("atual")) as StatusPedido;
  const status = String(dados.get("status")) as StatusPedido;
  if (status === atual) voltar();
  if (!PROXIMOS_MANUAIS[atual]?.includes(status)) voltar("Mudança de situação não permitida.");

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  voltar(error ? `Não foi possível mudar: ${error.message}` : undefined);
}

export async function confirmarPagamentoManual(dados: FormData) {
  await exigirStaff();
  await confirmarPagamento(String(dados.get("id")));
  voltar();
}

/* Estorno: so admin. Mercado Pago -> devolve o dinheiro pela API e o banco
   acompanha na hora (o webhook depois so confirma). Manual -> so registra;
   o dinheiro a Fernanda devolve por fora. */
export async function estornar(dados: FormData) {
  await exigirPapel(["admin"]);
  const id = String(dados.get("id"));
  const db = createAdminClient();

  const { data: p } = await db.from("orders").select("status, payments(gateway, gateway_payment_id)").eq("id", id).single();
  if (!p || !PODE_ESTORNAR.includes(p.status as StatusPedido)) voltar("Esse pedido não pode ser estornado.");

  const pag = p.payments[0];
  // redirect() lanca excecao: checagens que voltam ficam fora do try
  if (pag?.gateway === "mercadopago" && !pag.gateway_payment_id) {
    voltar("Pagamento sem ID do Mercado Pago — estorne pelo painel do MP.");
  }
  try {
    if (pag?.gateway === "mercadopago") {
      const r = await estornarPagamento(pag.gateway_payment_id!);
      await estornarPedido(id, "estornado", { refund: r });
    } else {
      await estornarPedido(id, "estornado", { manual: true });
    }
  } catch (e) {
    voltar(`Estorno falhou: ${e instanceof Error ? e.message : String(e)}`);
  }
  voltar(pag?.gateway === "mercadopago" ? "Estorno feito no Mercado Pago." : "Estorno registrado. Devolva o valor à cliente por fora.");
}
