import { createAdminClient } from "@/lib/supabase/admin";
import { ajustarEstoque } from "./actions";

export const dynamic = "force-dynamic";

export default async function Estoque() {
  const db = createAdminClient();

  const { data: variantes } = await db
    .from("product_variants")
    .select("id, nome, sku, ativo, products(nome, status), inventory(quantidade, minimo, reservado)")
    .order("sku");

  const linhas = (variantes ?? []).map((v) => {
    const inv = v.inventory?.[0];
    return { id: v.id, produto: v.products?.nome ?? "", variante: v.nome, sku: v.sku, ativo: v.ativo, status: v.products?.status, qtd: inv?.quantidade ?? 0, minimo: inv?.minimo ?? 0 };
  }).sort((a, b) => a.produto.localeCompare(b.produto));

  return (
    <>
      <h1 className="font-serif text-2xl">Estoque</h1>
      <p className="mt-2 text-sm text-carvao/60">Saldo por variação. Vendas pelo site baixam sozinhas quando o pagamento confirma; notas de entrada somam. Use o ajuste para acertos de contagem.</p>

      {linhas.length === 0 ? (
        <p className="mt-12 text-sm text-carvao/60">Nenhuma variação cadastrada.</p>
      ) : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-linha text-left text-carvao/60">
            <tr><th className="pb-2 font-normal">Produto</th><th className="pb-2 font-normal">SKU</th><th className="pb-2 text-right font-normal">Saldo</th><th className="pb-2 font-normal">Ajustar</th></tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.id} className="border-b border-linha/60">
                <td className="py-3">
                  {l.produto}{l.variante ? <span className="text-carvao/60"> · {l.variante}</span> : null}
                  {l.status !== "ativo" && <span className="ml-2 text-xs text-carvao/40">({l.status})</span>}
                </td>
                <td className="py-3 text-carvao/60">{l.sku}</td>
                <td className={`py-3 text-right font-serif text-lg ${l.qtd <= l.minimo ? "text-red-700" : ""}`}>{l.qtd}</td>
                <td className="py-3">
                  <form action={ajustarEstoque} className="flex gap-2">
                    <input type="hidden" name="variant_id" value={l.id} />
                    <input name="delta" placeholder="+5 ou -2" className="w-24 border border-linha bg-white px-2 py-1.5 text-xs" />
                    <input name="observacao" placeholder="motivo" className="w-36 border border-linha bg-white px-2 py-1.5 text-xs" />
                    <button className="border border-carvao px-3 text-xs">ok</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
