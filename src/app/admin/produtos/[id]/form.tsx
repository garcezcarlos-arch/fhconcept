"use client";

import { useActionState, useState } from "react";
import { salvarProduto, mudarStatusProduto, type EstadoEdicao } from "./actions";

type Variante = { id: string; nome: string; sku: string; preco: number; preco_promocional: number | null; ativo: boolean };
type Produto = { id: string; nome: string; status: string; destaque: boolean; descricao_curta: string | null; descricao: string | null; modo_uso: string | null; slug: string };

const campo = "mt-1 w-full border border-linha bg-white px-3 py-2.5 text-sm outline-none focus:border-carvao";
const rotulo = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-carvao/60";

export default function EditarForm({ produto, variantes: iniciais }: { produto: Produto; variantes: Variante[] }) {
  const [variantes, setVariantes] = useState(iniciais.map((v) => ({ id: v.id, nome: v.nome, sku: v.sku, preco: String(v.preco), preco_promocional: v.preco_promocional == null ? "" : String(v.preco_promocional), ativo: v.ativo })));
  const [estado, salvar, salvando] = useActionState<EstadoEdicao, FormData>(salvarProduto, {});
  const [estadoStatus, mudarStatus, mudando] = useActionState<EstadoEdicao, FormData>(mudarStatusProduto, {});

  function set(i: number, patch: Partial<(typeof variantes)[number]>) {
    setVariantes((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  }

  return (
    <div className="md:grid md:grid-cols-[1fr_18rem] md:gap-10">
      <form action={salvar} className="space-y-5">
        <input type="hidden" name="id" value={produto.id} />
        <input type="hidden" name="variantes" value={JSON.stringify(variantes)} />

        <label><span className={rotulo}>Nome</span><input name="nome" defaultValue={produto.nome} required className={campo} /></label>
        <label><span className={rotulo}>Descrição curta (aparece na vitrine e no Google)</span><input name="descricao_curta" defaultValue={produto.descricao_curta ?? ""} maxLength={160} className={campo} /></label>
        <label><span className={rotulo}>Descrição</span><textarea name="descricao" defaultValue={produto.descricao ?? ""} rows={6} className={campo} /></label>
        <label><span className={rotulo}>Modo de uso</span><textarea name="modo_uso" defaultValue={produto.modo_uso ?? ""} rows={3} className={campo} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="destaque" defaultChecked={produto.destaque} /> Destacar na vitrine</label>

        <fieldset className="border-t border-linha pt-5">
          <legend className={rotulo}>Variações e preços</legend>
          <div className="mt-3 space-y-3">
            {variantes.map((v, i) => (
              <div key={v.id} className="grid grid-cols-[1fr_7rem_7rem_4rem] items-end gap-3 text-sm">
                <div><span className="block">{v.nome || "único"}</span><span className="text-xs text-carvao/50">{v.sku}</span></div>
                <label><span className={rotulo}>Preço</span><input value={v.preco} onChange={(e) => set(i, { preco: e.target.value })} inputMode="decimal" className={campo} /></label>
                <label><span className={rotulo}>Promo</span><input value={v.preco_promocional} onChange={(e) => set(i, { preco_promocional: e.target.value })} inputMode="decimal" placeholder="—" className={campo} /></label>
                <label className="flex items-center gap-1 pb-2.5 text-xs"><input type="checkbox" checked={v.ativo} onChange={(e) => set(i, { ativo: e.target.checked })} /> ativa</label>
              </div>
            ))}
          </div>
        </fieldset>

        {estado.erro && <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{estado.erro}</p>}
        {estado.ok && <p className="text-sm text-nude">{estado.ok}</p>}
        <button disabled={salvando} className="min-h-11 bg-carvao px-6 text-sm text-creme disabled:opacity-60">{salvando ? "Salvando…" : "Salvar alterações"}</button>
      </form>

      <aside className="mt-10 border border-linha p-5 md:mt-0 md:self-start">
        <p className={rotulo}>Situação</p>
        <p className="mt-1 font-serif text-xl">{{ rascunho: "Rascunho", revisao: "Em revisão", ativo: "No ar", pausado: "Pausado", arquivado: "Arquivado" }[produto.status]}</p>

        <form action={mudarStatus} className="mt-4 space-y-2">
          <input type="hidden" name="id" value={produto.id} />
          {produto.status !== "ativo" && (
            <button name="status" value="ativo" disabled={mudando} className="min-h-11 w-full bg-carvao text-sm text-creme disabled:opacity-60">Publicar na loja</button>
          )}
          {produto.status === "ativo" && (
            <button name="status" value="pausado" disabled={mudando} className="min-h-11 w-full border border-carvao text-sm">Pausar</button>
          )}
          {produto.status !== "arquivado" && (
            <button name="status" value="arquivado" disabled={mudando} className="min-h-10 w-full text-xs text-carvao/50 hover:text-red-700">Arquivar</button>
          )}
        </form>
        {estadoStatus.erro && <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">{estadoStatus.erro}</p>}
        {estadoStatus.ok && <p className="mt-3 text-sm text-nude">{estadoStatus.ok}</p>}

        {produto.status === "ativo" && (
          <a href={`/loja/${produto.slug}`} target="_blank" rel="noopener" className="mt-4 block text-xs text-carvao/60 hover:text-nude">Ver na loja ↗</a>
        )}
      </aside>
    </div>
  );
}
