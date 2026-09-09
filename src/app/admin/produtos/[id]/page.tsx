import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditarForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("products")
    .select("id, nome, slug, status, destaque, descricao_curta, descricao, modo_uso, brands(nome), categories(nome), product_variants(id, nome, sku, preco, preco_promocional, ativo, ordem)")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const variantes = [...p.product_variants].sort((a, b) => a.ordem - b.ordem);

  return (
    <>
      <Link href="/admin/produtos" className="text-xs text-carvao/50 hover:text-nude">← Produtos</Link>
      <h1 className="mt-2 font-serif text-2xl">{p.nome}</h1>
      <p className="mt-1 text-sm text-carvao/60">{p.brands?.nome ?? "sem marca"} · {p.categories?.nome}</p>
      <div className="mt-8">
        <EditarForm produto={p} variantes={variantes} />
      </div>
    </>
  );
}
