import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Perfil = { nome: string; papel: string };

/** Perfil de quem esta logada no painel, ou null. */
export async function perfilAtual(): Promise<Perfil | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("nome, papel").eq("id", user.id).single();
  return data ? { nome: data.nome ?? "", papel: data.papel } : null;
}

/** Os numeros do salao (agenda, comandas, clientes) sao so para administradoras. */
export async function exigirAdmin() {
  const perfil = await perfilAtual();
  if (!perfil) throw new Error("nao autenticado");
  if (perfil.papel !== "admin") throw new Error("sem permissao");
  return perfil;
}
