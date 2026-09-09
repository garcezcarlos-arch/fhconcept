import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function dataBR(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function reais(v: number | null) {
  if (v === null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function Notas() {
  const supabase = await createClient();

  const { data: notas, error } = await supabase
    .from("nota_entrada")
    .select("id, numero, serie, data_emissao, valor_total, suppliers(nome), nota_entrada_itens(id)")
    .order("data_emissao", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-700">Nao foi possivel carregar: {error.message}</p>;
  }

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl">Notas de entrada</h1>
        <Link href="/admin/notas/nova" className="bg-carvao px-4 py-2 text-sm text-creme">
          Lancar nota
        </Link>
      </div>

      {!notas?.length ? (
        <div className="mt-16 max-w-md">
          <p className="text-sm">Nenhuma nota lancada.</p>
          <p className="mt-2 text-sm text-carvao/60">
            A nota de entrada e o que autoriza um produto a ir ao ar. Lance aqui
            as notas de compra e depois vincule os itens no cadastro de cada produto.
          </p>
        </div>
      ) : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-linha text-left text-carvao/60">
            <tr>
              <th className="pb-2 font-normal">Fornecedor</th>
              <th className="pb-2 font-normal">Nota</th>
              <th className="pb-2 font-normal">Emissao</th>
              <th className="pb-2 font-normal">Valor</th>
              <th className="pb-2 font-normal">Itens</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((n) => (
              <tr key={n.id} className="border-b border-linha/60">
                <td className="py-3">{n.suppliers?.nome}</td>
                <td className="py-3 text-carvao/70">
                  {n.numero}
                  {n.serie ? `/${n.serie}` : ""}
                </td>
                <td className="py-3 text-carvao/70">{dataBR(n.data_emissao)}</td>
                <td className="py-3 text-carvao/70">{reais(n.valor_total)}</td>
                <td className="py-3">
                  {n.nota_entrada_itens.length === 0 ? (
                    <span className="text-carvao/50">nenhum vinculado</span>
                  ) : (
                    n.nota_entrada_itens.length
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
