import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { reais } from "@/lib/preco";
import { nomeFormato, periodo } from "@/lib/formacoes";

export const dynamic = "force-dynamic";
const ROTULO: Record<string, string> = { rascunho: "Rascunho", aberta: "Aberta", esgotada: "Esgotada", encerrada: "Encerrada", cancelada: "Cancelada" };

export default async function Turmas() {
  const db = createAdminClient();
  const { data: turmas } = await db.from("turmas_vagas").select("*").order("data_inicio", { ascending: false });
  const { count: espera } = await db.from("inscricoes").select("id", { count: "exact", head: true }).eq("status", "lista_espera");

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-serif text-2xl">Turmas</h1>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/admin/turmas/espera" className="text-carvao/60 hover:text-nude">Lista de espera ({espera ?? 0})</Link>
          <Link href="/admin/turmas/nova" className="bg-carvao px-4 py-2 text-creme">Nova turma</Link>
        </div>
      </div>

      {!turmas?.length ? (
        <div className="mt-16 max-w-md text-sm">
          <p>Nenhuma turma cadastrada.</p>
          <p className="mt-2 text-carvao/60">Crie a primeira com data, vagas e preço. Enquanto estiver em rascunho ela não aparece no site; ao marcar como aberta, entra na agenda de /formacoes com o botão de reserva.</p>
        </div>
      ) : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-linha text-left text-carvao/60">
            <tr><th className="pb-2 font-normal">Data</th><th className="pb-2 font-normal">Turma</th><th className="pb-2 font-normal">Preço</th><th className="pb-2 font-normal">Vagas</th><th className="pb-2 font-normal">Situação</th></tr>
          </thead>
          <tbody>
            {turmas.map((t) => (
              <tr key={t.id} className="border-b border-linha/60">
                <td className="py-3 whitespace-nowrap">{periodo(t.data_inicio!, t.data_fim)}</td>
                <td className="py-3"><Link href={`/admin/turmas/${t.id}`} className="hover:text-nude">{t.nome}</Link><span className="block text-xs text-carvao/50">{nomeFormato(t.formato!)}</span></td>
                <td className="py-3">{reais(t.preco ?? 0)}{t.sinal != null && <span className="block text-xs text-carvao/50">sinal {reais(t.sinal)}</span>}</td>
                <td className="py-3">{(t.vagas ?? 0) - (t.restantes ?? 0)} / {t.vagas}</td>
                <td className="py-3"><span className={t.status === "aberta" ? "text-nude" : "text-carvao/60"}>{ROTULO[t.status ?? ""] ?? t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
