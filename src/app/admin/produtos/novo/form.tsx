"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { criarProduto, type EstadoForm } from "../actions";
import { sugerirSku } from "@/lib/slug";

const campo =
  "w-full border border-linha bg-white px-3 py-2 text-sm outline-none focus:border-nude";
const rotulo = "mb-1 block text-sm";

type Tamanho = { nome: string; preco: string; peso_g: string; sku: string; qtd: string; custo: string };
const vazio = (): Tamanho => ({ nome: "", preco: "", peso_g: "", sku: "", qtd: "", custo: "" });

export default function FormProduto({
  categorias,
  atributos,
  notas,
}: {
  categorias: { id: string; rotulo: string }[];
  atributos: { id: string; nome: string; attribute_options: { id: string; nome: string }[] }[];
  notas: { id: string; rotulo: string }[];
}) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(criarProduto, {});
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([vazio()]);
  const [comNota, setComNota] = useState(false);

  function alterar(i: number, chave: keyof Tamanho, valor: string) {
    setTamanhos((ts) => ts.map((t, j) => (j === i ? { ...t, [chave]: valor } : t)));
  }

  // preenche o SKU sugerido quando o campo ainda esta vazio
  function aoSairDoTamanho(i: number) {
    setTamanhos((ts) =>
      ts.map((t, j) =>
        j === i && !t.sku && nome && t.nome
          ? { ...t, sku: sugerirSku(marca, nome, t.nome) }
          : t,
      ),
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl">Cadastrar produto</h1>
      <p className="mt-2 max-w-xl text-sm text-carvao/60">
        O produto e salvo como rascunho. Ele so vai ao ar depois de ter nota de
        entrada vinculada e registro na Anvisa.
      </p>

      <form action={acao} className="mt-8 max-w-2xl">
        <input type="hidden" name="variantes" value={JSON.stringify(tamanhos)} />
        <input type="hidden" name="fotos" value="[]" />

        <label className={rotulo} htmlFor="nome">Nome do produto</label>
        <input id="nome" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} className={campo} required />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className={rotulo} htmlFor="marca">Marca</label>
            <input id="marca" name="marca" value={marca} onChange={(e) => setMarca(e.target.value)} className={campo} />
          </div>
          <div>
            <label className={rotulo} htmlFor="category_id">Categoria</label>
            <select id="category_id" name="category_id" className={campo} required defaultValue="">
              <option value="" disabled>Escolha</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.rotulo}</option>
              ))}
            </select>
          </div>
        </div>

        <label className={`${rotulo} mt-4`} htmlFor="descricao_curta">
          Resumo <span className="text-carvao/50">(uma linha, aparece na vitrine)</span>
        </label>
        <input id="descricao_curta" name="descricao_curta" className={campo} />

        <label className={`${rotulo} mt-4`} htmlFor="descricao">Descricao</label>
        <textarea id="descricao" name="descricao" rows={4} className={campo} />

        <label className={`${rotulo} mt-4`} htmlFor="modo_uso">Modo de uso</label>
        <textarea id="modo_uso" name="modo_uso" rows={3} className={campo} />

        {/* tamanhos — sem titulo de secao quando ha so um */}
        <div className="mt-8 border-t border-linha pt-6">
          {tamanhos.map((t, i) => (
            <div key={i} className={i > 0 ? "mt-6 border-t border-linha/60 pt-6" : ""}>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={rotulo}>Tamanho <span className="text-carvao/50">ex: 300ml</span></label>
                  <input
                    value={t.nome}
                    onChange={(e) => alterar(i, "nome", e.target.value)}
                    onBlur={() => aoSairDoTamanho(i)}
                    
                    className={campo}
                  />
                </div>
                <div>
                  <label className={rotulo}>Preco</label>
                  <input
                    value={t.preco}
                    onChange={(e) => alterar(i, "preco", e.target.value)}
                    inputMode="decimal"
                    
                    className={campo}
                  />
                </div>
                <div>
                  <label className={rotulo}>Peso (g)</label>
                  <input
                    value={t.peso_g}
                    onChange={(e) => alterar(i, "peso_g", e.target.value)}
                    inputMode="numeric"
                    
                    className={campo}
                  />
                </div>
                <div>
                  <label className={rotulo}>Codigo</label>
                  <input
                    value={t.sku}
                    onChange={(e) => alterar(i, "sku", e.target.value)}
                    className={campo}
                  />
                </div>
              </div>

              {comNota && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  <div>
                    <label className={rotulo}>Qtd na nota</label>
                    <input value={t.qtd} onChange={(e) => alterar(i, "qtd", e.target.value)} inputMode="decimal" className={campo} />
                  </div>
                  <div>
                    <label className={rotulo}>Custo unit.</label>
                    <input value={t.custo} onChange={(e) => alterar(i, "custo", e.target.value)} inputMode="decimal" className={campo} />
                  </div>
                </div>
              )}

              {tamanhos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTamanhos((ts) => ts.filter((_, j) => j !== i))}
                  className="mt-3 text-sm text-carvao/50 hover:text-red-700"
                >
                  Remover este tamanho
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setTamanhos((ts) => [...ts, vazio()])}
            className="mt-4 text-sm text-nude hover:underline"
          >
            Adicionar outro tamanho
          </button>
        </div>

        {/* atributos */}
        <div className="mt-8 border-t border-linha pt-6">
          {atributos.map((a) => (
            <fieldset key={a.id} className="mb-5">
              <legend className="mb-2 text-sm">{a.nome}</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {a.attribute_options.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm text-carvao/80">
                    <input type="checkbox" name="atributos" value={o.id} className="accent-nude" />
                    {o.nome}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {/* conformidade */}
        <div className="mt-8 border-t border-linha pt-6">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={rotulo} htmlFor="registro_anvisa">Registro Anvisa</label>
              <input id="registro_anvisa" name="registro_anvisa" className={campo} />
            </div>
            <div>
              <label className={rotulo} htmlFor="ncm">NCM</label>
              <input id="ncm" name="ncm" className={campo} />
            </div>
            <div>
              <label className={rotulo} htmlFor="origem">Origem</label>
              <select id="origem" name="origem" className={campo} defaultValue="">
                <option value="">—</option>
                <option value="nacional">Nacional</option>
                <option value="importado_direto">Importado direto</option>
                <option value="importado_terceiros">Importado de terceiros</option>
              </select>
            </div>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={comNota} onChange={(e) => setComNota(e.target.checked)} className="accent-nude" />
            Vincular a uma nota de entrada agora
          </label>

          {comNota && (
            <select name="nota_entrada_id" className={`${campo} mt-3`} defaultValue="">
              <option value="" disabled>Escolha a nota</option>
              {notas.map((n) => (
                <option key={n.id} value={n.id}>{n.rotulo}</option>
              ))}
            </select>
          )}
        </div>

        {estado.erro && <p className="mt-6 text-sm text-red-700">{estado.erro}</p>}

        <div className="mt-8 flex items-center gap-4">
          <button type="submit" disabled={enviando} className="bg-carvao px-5 py-2.5 text-sm text-porcelana disabled:opacity-40">
            {enviando ? "Salvando" : "Salvar rascunho"}
          </button>
          <Link href="/admin/produtos" className="text-sm text-carvao/60 hover:text-nude">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
