import { redirect } from "next/navigation";
import { perfilAtual } from "@/lib/admin-auth";
import { MenuAdmin } from "@/components/admin/menu";
import { GENDO } from "@/lib/salao";

export const metadata = { title: "Operações", robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/entrar");
  if (!["admin", "vendedor", "operacao"].includes(perfil.papel)) redirect("/");

  return (
    <div className="min-h-dvh bg-creme text-carvao md:grid md:grid-cols-[14rem_1fr]">
      <MenuAdmin nome={perfil.nome} papel={perfil.papel} agendaGendo={GENDO.agenda} />
      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
