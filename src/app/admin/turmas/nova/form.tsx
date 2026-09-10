"use client";

import { useActionState } from "react";
import { FORMATOS } from "@/lib/formacoes";
import { salvarTurma, type EstadoTurma } from "../actions";

const campo = "mt-1 w-full border border-linha bg-white px-3 py-2.5 text-sm outline-none focus:border-carvao";
const rotulo = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-carvao/60";

export type TurmaForm = { id?: string; formato: string; nome: string; descricao: string | null; data_inicio: string; data_fim: string | null; horario: string | null; vagas: number; preco: number; sinal: number | null; status: string };

export default function TurmaForm({ t }: { t?: TurmaForm }) {
  const [estado, acao, pendente] = useActionState<EstadoTurma, FormData>(salvarTurma, {});
  return (
    <form action={acao} className="max-w-2xl space-y-5">
      {t?.id && <input type="hidden" name="id" value={t.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <label><span className={rotulo}>Formação</span>
          <select name="formato" defaultValue={t?.formato ?? "turma"} className={campo}>{FORMATOS.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}</select>
        </label>
        <label><span className={rotulo}>Situação</span>
          <select name="status" defaultValue={t?.status ?? "rascunho"} className={campo}>
            <option value="rascunho">Rascunho (não aparece no site)</option>
            <option value="aberta">Aberta (aceita reservas)</option>
            <option value="esgotada">Esgotada</option>
            <option value="encerrada">Encerrada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </label>
      </div>
      <label><span className={rotulo}>Nome da turma</span><input name="nome" required defaultValue={t?.nome ?? ""} placeholder="ex.: Colorimetria e loiros — outubro" className={campo} /></label>
      <label><span className={rotulo}>Descrição (opcional)</span><textarea name="descricao" rows={3} defaultValue={t?.descricao ?? ""} className={campo} /></label>
      <div className="grid gap-4 md:grid-cols-3">
        <label><span className={rotulo}>Início</span><input name="data_inicio" type="date" required defaultValue={t?.data_inicio ?? ""} className={campo} /></label>
        <label><span className={rotulo}>Fim (se mais de um dia)</span><input name="data_fim" type="date" defaultValue={t?.data_fim ?? ""} className={campo} /></label>
        <label><span className={rotulo}>Horário</span><input name="horario" defaultValue={t?.horario ?? ""} placeholder="9h às 18h" className={campo} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label><span className={rotulo}>Vagas</span><input name="vagas" inputMode="numeric" defaultValue={t?.vagas ?? 8} className={campo} /></label>
        <label><span className={rotulo}>Preço (R$)</span><input name="preco" required inputMode="decimal" defaultValue={t?.preco ?? ""} className={campo} /></label>
        <label><span className={rotulo}>Sinal para reservar (R$, opcional)</span><input name="sinal" inputMode="decimal" defaultValue={t?.sinal ?? ""} placeholder="vazio = valor cheio" className={campo} /></label>
      </div>
      {estado.erro && <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{estado.erro}</p>}
      <button disabled={pendente} className="min-h-11 bg-carvao px-6 text-sm text-creme disabled:opacity-60">{pendente ? "Salvando…" : t?.id ? "Salvar turma" : "Criar turma"}</button>
    </form>
  );
}
