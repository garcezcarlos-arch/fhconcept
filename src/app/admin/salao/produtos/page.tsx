import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { semTabela } from "@/lib/salao";
import { reais } from "@/lib/preco";

export const dynamic = "force-dynamic";

const inteiro = (n: number) => n.toLocaleString("pt-BR");

export default async function ProdutosSalao({ searchParams }: { searchParams: Promise<{ q?: string; c?: string; s?: string }> }) {
  await paginaAdmin();
  const sp = await searchParams;
  const busca = (sp.q ?? "").trim().slice(0, 60);
  const categoria = (sp.c ?? "").slice(0, 80);
  const saldo = sp.s === "com" || sp.s === "sem" ? sp.s : "";

  const db = createAdminClient();
  const todos = await db.from("salao_produtos").select("categoria, quantidade");
  let q = db.from("salao_produtos").select("gendo_codigo, nome, categoria, preco, custo, quantidade").order("nome").limit(1000);
  if (busca) q = q.ilike("nome", `%${busca.replace(/[%_,()\\]/g, " ").trim()}%`);
  if (categoria) q = q.eq("categoria", categoria);
  if (saldo === "com") q = q.gt("quantidade", 0);
  if (saldo === "sem") q = q.lte("quantidade", 0);
  const { data, error } = await q;

  if (error || todos.error) {
    return (
      <>
        <h1 className="font-serif text-3xl">Estoque do salão</h1>
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          {semTabela((error ?? todos.error)!) ? <>Falta criar as tabelas: rode <code>supabase/migrations/20261012_salao_cadastros.sql</code> no SQL Editor do Supabase.</> : <>Não foi possível carregar: {(error ?? todos.error)!.message}</>}
        </p>
      </>
    );
  }

  const base = todos.data ?? [];
  const categorias = [...new Set(base.map((p) => p.categoria).filter((c): c is string => Boolean(c)))].sort();
  const comSaldo = base.filter((p) => (p.quantidade ?? 0) > 0).length;
  const negativos = base.filter((p) => (p.quantidade ?? 0) < 0).length;
  const produtos = data ?? [];
  const campo = "min-h-11 border border-linha bg-white px-3 text-sm outline-none focus:border-nude";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-serif text-3xl">Estoque do salão</h1>
          <p className="mt-2 max-w-xl text-sm text-texto2">
            Produtos cadastrados no Gendo, com o saldo do dia da importação. É uma lista separada do catálogo da loja online.
            {base.length > 0 && <> São {inteiro(base.length)} produtos, {inteiro(comSaldo)} com saldo{negativos > 0 && <> e {inteiro(negativos)} com saldo negativo</>}.</>}
          </p>
        </div>
        <Link href="/admin/salao/importar" className="inline-flex min-h-11 items-center border border-linha bg-branco px-5 text-sm hover:border-carvao">Importar do Gendo</Link>
      </div>

      {base.length === 0 ? (
        <p className="mt-10 text-sm text-texto2">Nenhum produto no portal ainda. Importe o arquivo de produtos do Gendo.</p>
      ) : (
        <>
          <form action="/admin/salao/produtos" className="mt-7 flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="q">Buscar produto</label>
            <input id="q" name="q" defaultValue={busca} placeholder="Buscar produto" className={`${campo} w-full sm:w-64`} />
            <label className="sr-only" htmlFor="c">Categoria</label>
            <select id="c" name="c" defaultValue={categoria} className={campo}>
              <option value="">Todas as categorias</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="sr-only" htmlFor="s">Saldo</label>
            <select id="s" name="s" defaultValue={saldo} className={campo}>
              <option value="">Qualquer saldo</option>
              <option value="com">Com saldo</option>
              <option value="sem">Zerado ou negativo</option>
            </select>
            <button className="min-h-11 bg-carvao px-5 text-sm text-creme hover:bg-nude-esc">Filtrar</button>
          </form>

          <p className="mt-4 text-sm text-texto2">{inteiro(produtos.length)} {produtos.length === 1 ? "produto" : "produtos"} na lista</p>

          <div className="mt-3 overflow-x-auto border border-linha bg-branco">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-linha text-left text-texto2">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Produto</th>
                  <th className="px-3 py-2.5 font-normal">Categoria</th>
                  <th className="px-3 py-2.5 text-right font-normal">Preço</th>
                  <th className="px-3 py-2.5 text-right font-normal">Custo</th>
                  <th className="px-4 py-2.5 text-right font-normal">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.gendo_codigo} className="border-b border-linha/60 last:border-b-0">
                    <td className="px-4 py-2.5">{p.nome}</td>
                    <td className="px-3 py-2.5 text-texto2">{p.categoria}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{reais(Number(p.preco))}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-texto2">{p.custo == null ? "" : reais(Number(p.custo))}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {p.quantidade == null ? "" : inteiro(p.quantidade)}
                      {(p.quantidade ?? 0) < 0 && <span className="ml-2 text-xs text-texto2">conferir</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
