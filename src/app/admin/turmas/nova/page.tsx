import Link from "next/link";
import TurmaForm from "./form";

export default function NovaTurma() {
  return (
    <>
      <Link href="/admin/turmas" className="text-xs text-carvao/50 hover:text-nude">← Turmas</Link>
      <h1 className="mt-2 font-serif text-2xl">Nova turma</h1>
      <div className="mt-8"><TurmaForm /></div>
    </>
  );
}
