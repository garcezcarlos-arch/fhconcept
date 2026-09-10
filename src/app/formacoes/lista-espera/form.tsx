"use client";

import { useActionState } from "react";
import { FORMATOS } from "@/lib/formacoes";
import { entrarNaLista, type EstadoLista } from "./actions";

const campo = "mt-1 w-full border border-linha bg-white px-3 py-3 text-sm outline-none focus:border-carvao";
const rotulo = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-texto2";

export default function ListaForm() {
  const [estado, acao, pendente] = useActionState<EstadoLista, FormData>(entrarNaLista, {});
  if (estado.ok) {
    return <p className="mt-10 max-w-lg border border-linha bg-areia p-5 text-sm">Pronto. Você está na lista — a Fernanda avisa pelo WhatsApp quando a próxima data abrir.</p>;
  }
  return (
    <form action={acao} className="mt-10 max-w-lg space-y-4">
      <label><span className={rotulo}>Formação de interesse</span>
        <select name="formato" required className={campo} defaultValue="turma">
          {FORMATOS.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </label>
      <label><span className={rotulo}>Nome</span><input name="nome" required className={campo} autoComplete="name" /></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label><span className={rotulo}>WhatsApp</span><input name="telefone" required inputMode="tel" className={campo} autoComplete="tel" /></label>
        <label><span className={rotulo}>Cidade</span><input name="cidade" className={campo} /></label>
      </div>
      <label><span className={rotulo}>Tempo de profissão</span>
        <select name="experiencia" className={campo} defaultValue="">
          <option value="">selecione</option>
          <option>Começando agora</option><option>Até 2 anos</option><option>2 a 5 anos</option><option>Mais de 5 anos</option>
        </select>
      </label>
      {estado.erro && <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{estado.erro}</p>}
      <button disabled={pendente} className="flex min-h-13 w-full items-center justify-center bg-carvao text-sm text-creme hover:bg-nude-esc disabled:opacity-60">{pendente ? "Enviando…" : "Entrar na lista"}</button>
    </form>
  );
}
