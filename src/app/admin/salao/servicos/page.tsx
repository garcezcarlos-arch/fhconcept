import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { duracaoBr , semTabela } from "@/lib/salao";
import { reais } from "@/lib/preco";

export const dynamic = "force-dynamic";

const chave = (nome: string) => nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export default async function Servicos() {
  await paginaAdmin();
  const { data, error } = await createAdminClient().from("salao_servicos").select("gendo_codigo, nome, categoria, preco, duracao_min").order("categoria").order("nome");

  if (error) {
    return (
      <>
        <h1 className="font-serif text-3xl">Serviços do salão</h1>
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          {semTabela(error) ? <>Falta criar as tabelas: rode <code>supabase/migrations/20261012_salao_cadastros.sql</code> no SQL Editor do Supabase.</> : <>Não foi possível carregar: {error.message}</>}
        </p>
      </>
    );
  }

  const servicos = data ?? [];
  const vezes = new Map<string, number>();
  for (const s of servicos) vezes.set(chave(s.nome), (vezes.get(chave(s.nome)) ?? 0) + 1);
  const repetidos = servicos.filter((s) => (vezes.get(chave(s.nome)) ?? 0) > 1).length;
  const categorias = [...new Set(servicos.map((s) => s.categoria ?? "Sem categoria"))];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-serif text-3xl">Serviços do salão</h1>
          <p className="mt-2 max-w-xl text-sm text-texto2">
            Lista do Gendo, com duração e preço. {servicos.length > 0 && <>São {servicos.length} serviços em {categorias.length} categorias{repetidos > 0 && <>, {repetidos} deles com nome repetido</>}.</>}
          </p>
        </div>
        <Link href="/admin/salao/importar" className="inline-flex min-h-11 items-center border border-linha bg-branco px-5 text-sm hover:border-carvao">Importar do Gendo</Link>
      </div>

      {servicos.length === 0 ? (
        <p className="mt-10 text-sm text-texto2">Nenhum serviço no portal ainda. Importe o arquivo de serviços do Gendo.</p>
      ) : (
        categorias.map((cat) => (
          <section key={cat} className="mt-10">
            <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">{cat}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <tbody>
                  {servicos.filter((s) => (s.categoria ?? "Sem categoria") === cat).map((s) => (
                    <tr key={s.gendo_codigo} className="border-b border-linha">
                      <td className="py-2.5 pr-4">
                        {s.nome}
                        {(vezes.get(chave(s.nome)) ?? 0) > 1 && <span className="ml-2 text-xs text-texto2">nome repetido</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-texto2">{duracaoBr(s.duracao_min)}</td>
                      <td className="w-28 whitespace-nowrap py-2.5 pl-3 text-right tabular-nums">{reais(Number(s.preco))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </>
  );
}
