import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ROTULO: Record<string, string> = {
  rascunho: "Rascunho",
  revisao: "Em revisao",
  ativo: "No ar",
  pausado: "Pausado",
  arquivado: "Arquivado",
};

export default async function Produtos() {
  const supabase = await createClient();

  const { data: produtos, error } = await supabase
    .from("products")
    .select("id, nome, status, registro_anvisa, categories(nome), brands(nome)")
    .order("nome");

  if (error) {
    return (
      <p className="text-sm text-red-700">
        Nao foi possivel carregar os produtos: {error.message}
      </p>
    );
  }

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="bg-carvao px-4 py-2 text-sm text-creme"
        >
          Cadastrar produto
        </Link>
      </div>

      {!produtos?.length ? (
        <div className="mt-16 max-w-md">
          <p className="text-sm">Nenhum produto cadastrado ainda.</p>
          <p className="mt-2 text-sm text-carvao/60">
            Comece pelos itens que ja tem nota de entrada e registro na Anvisa.
            Os demais podem ficar como rascunho ate a documentacao chegar.
          </p>
        </div>
      ) : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-linha text-left text-carvao/60">
            <tr>
              <th className="pb-2 font-normal">Produto</th>
              <th className="pb-2 font-normal">Categoria</th>
              <th className="pb-2 font-normal">Anvisa</th>
              <th className="pb-2 font-normal">Situacao</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-b border-linha/60">
                <td className="py-3">
                  <Link href={`/admin/produtos/${p.id}`} className="hover:text-nude">
                    {p.nome}
                  </Link>
                  <span className="block text-xs text-carvao/50">
                    {p.brands?.nome ?? "sem marca"}
                  </span>
                </td>
                <td className="py-3 text-carvao/70">{p.categories?.nome}</td>
                <td className="py-3 text-carvao/70">
                  {p.registro_anvisa ?? "-"}
                </td>
                <td className="py-3">
                  <span
                    className={
                      p.status === "ativo" ? "text-nude" : "text-carvao/60"
                    }
                  >
                    {ROTULO[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
