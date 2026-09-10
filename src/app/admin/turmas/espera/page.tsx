import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { nomeFormato } from "@/lib/formacoes";

export const dynamic = "force-dynamic";

export default async function Espera() {
  const db = createAdminClient();
  const { data: lista } = await db.from("inscricoes").select("*").eq("status", "lista_espera").order("created_at", { ascending: false });

  return (
    <>
      <Link href="/admin/turmas" className="text-xs text-carvao/50 hover:text-nude">← Turmas</Link>
      <h1 className="mt-2 font-serif text-2xl">Lista de espera</h1>
      <p className="mt-2 text-sm text-carvao/60">Quem pediu para ser avisada da próxima data. Ao abrir uma turma, avise por WhatsApp — o link já abre a conversa.</p>
      {!lista?.length ? <p className="mt-12 text-sm text-carvao/60">Ninguém na lista.</p> : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-linha text-left text-carvao/60"><tr><th className="pb-2 font-normal">Nome</th><th className="pb-2 font-normal">WhatsApp</th><th className="pb-2 font-normal">Interesse</th><th className="pb-2 font-normal">Cidade</th><th className="pb-2 font-normal">Quando</th></tr></thead>
          <tbody>
            {lista.map((i) => (
              <tr key={i.id} className="border-b border-linha/60">
                <td className="py-3">{i.nome}<span className="block text-xs text-carvao/50">{i.experiencia}</span></td>
                <td className="py-3"><a href={`https://wa.me/55${i.telefone}?text=${encodeURIComponent(`Oi ${i.nome.split(" ")[0]}! Abriu a próxima turma de ${nomeFormato(i.formato)} no FH Concept. Quer garantir vaga?`)}`} target="_blank" rel="noopener" className="text-nude">{i.telefone}</a></td>
                <td className="py-3">{nomeFormato(i.formato)}</td>
                <td className="py-3 text-carvao/70">{i.cidade ?? "—"}</td>
                <td className="py-3 text-xs text-carvao/50">{new Date(i.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
