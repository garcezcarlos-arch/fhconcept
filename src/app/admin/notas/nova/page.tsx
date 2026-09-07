"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarNota, type EstadoForm } from "../actions";

const campo =
  "w-full border border-linha bg-white px-3 py-2 text-sm outline-none focus:border-nude";

export default function NovaNota() {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(
    criarNota,
    {},
  );

  return (
    <>
      <h1 className="font-serif text-2xl">Lancar nota de entrada</h1>
      <p className="mt-2 max-w-lg text-sm text-carvao/60">
        Cadastre o cabecalho da nota. Os itens sao vinculados depois, no cadastro
        de cada produto.
      </p>

      <form action={acao} className="mt-8 max-w-lg">
        <label className="mb-1 block text-sm" htmlFor="fornecedor">Fornecedor</label>
        <input id="fornecedor" name="fornecedor" className={campo} required />

        <label className="mb-1 mt-4 block text-sm" htmlFor="cnpj">
          CNPJ do fornecedor <span className="text-carvao/50">(opcional)</span>
        </label>
        <input id="cnpj" name="cnpj" className={campo} />

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm" htmlFor="numero">Numero</label>
            <input id="numero" name="numero" className={campo} required />
          </div>
          <div>
            <label className="mb-1 block text-sm" htmlFor="serie">Serie</label>
            <input id="serie" name="serie" className={campo} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm" htmlFor="data_emissao">Emissao</label>
            <input id="data_emissao" name="data_emissao" type="date" className={campo} required />
          </div>
          <div>
            <label className="mb-1 block text-sm" htmlFor="valor_total">Valor total</label>
            <input id="valor_total" name="valor_total" inputMode="decimal" placeholder="0,00" className={campo} />
          </div>
        </div>

        <label className="mb-1 mt-4 block text-sm" htmlFor="chave_nfe">
          Chave da NF-e <span className="text-carvao/50">(44 digitos, opcional)</span>
        </label>
        <input id="chave_nfe" name="chave_nfe" className={campo} />

        {estado.erro && <p className="mt-4 text-sm text-red-700">{estado.erro}</p>}

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={enviando}
            className="bg-carvao px-5 py-2.5 text-sm text-porcelana disabled:opacity-40"
          >
            {enviando ? "Salvando" : "Salvar nota"}
          </button>
          <Link href="/admin/notas" className="text-sm text-carvao/60 hover:text-nude">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
