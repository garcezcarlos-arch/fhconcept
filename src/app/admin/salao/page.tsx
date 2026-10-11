import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { perfilAtual } from "@/lib/admin-auth";
import { SalaoView } from "@/components/admin/salao-view";
import { mesDeLinha, retratoDeLinha } from "@/lib/salao";
import { salvarMes } from "./actions";

export const dynamic = "force-dynamic";

export default async function Salao({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { aviso } = await searchParams;
  const perfil = await perfilAtual();
  if (perfil?.papel !== "admin") redirect("/admin");

  const db = createAdminClient();
  const [mensal, retratos] = await Promise.all([
    db.from("salao_mensal").select("*").order("mes", { ascending: false }).limit(12),
    db.from("salao_retrato").select("*").order("data", { ascending: false }).limit(1),
  ]);

  if (mensal.error) {
    return (
      <>
        <h1 className="font-serif text-3xl">Salão</h1>
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          Falta criar as tabelas: rode <code>supabase/migrations/20261011_salao_indicadores.sql</code> no SQL Editor do Supabase e recarregue esta página.
        </p>
      </>
    );
  }

  return (
    <SalaoView
      meses={mensal.data.map(mesDeLinha).reverse()}
      retrato={retratos.data?.[0] ? retratoDeLinha(retratos.data[0]) : null}
      aviso={aviso}
      salvarMes={salvarMes}
    />
  );
}
