import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome, papel")
    .eq("id", user.id)
    .single();

  if (!perfil || !["admin", "vendedor", "operacao"].includes(perfil.papel)) {
    redirect("/");
  }

  return (
    <div className="min-h-dvh bg-creme text-carvao md:grid md:grid-cols-[13rem_1fr]">
      <aside className="border-b border-linha md:border-b-0 md:border-r px-5 py-6">
        <img src="/fh-concept.svg" alt="FH Concept" className="h-7 w-auto" />
        <nav className="mt-8 flex gap-4 text-sm md:flex-col md:gap-1">
          <Link href="/admin/produtos" className="py-1 hover:text-nude">Produtos</Link>
          <Link href="/admin/pedidos" className="py-1 hover:text-nude">Pedidos</Link>
          <Link href="/admin/estoque" className="py-1 hover:text-nude">Estoque</Link>
          <Link href="/admin/notas" className="py-1 hover:text-nude">Notas de entrada</Link>
          <Link href="/admin/turmas" className="py-1 hover:text-nude">Turmas</Link>
        </nav>
        <p className="mt-8 text-xs text-carvao/50 md:mt-12">{perfil.nome}</p>
      </aside>
      <main className="px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
