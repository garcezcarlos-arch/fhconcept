import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { reais } from "@/lib/preco";
import TurmaForm from "../nova/form";
import { mudarStatusInscricao } from "../actions";

export const dynamic = "force-dynamic";
const ROT: Record<string, string> = { aguardando_pagamento: "Aguardando pagamento", confirmada: "Confirmada", cancelada: "Cancelada", lista_espera: "Lista de espera" };

export default async function Turma({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  const { data: t } = await db.from("turmas").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();
  const { data: inscritas } = await db.from("inscricoes").select("*").eq("turma_id", id).order("created_at");

  return (
    <>
      <Link href="/admin/turmas" className="text-xs text-carvao/50 hover:text-nude">← Turmas</Link>
      <h1 className="mt-2 font-serif text-2xl">{t.nome}</h1>

      <div className="mt-8 md:grid md:grid-cols-[1fr_1fr] md:gap-12">
        <TurmaForm t={t} />

        <section className="mt-12 md:mt-0">
          <h2 className="font-serif text-lg">Inscritas ({inscritas?.length ?? 0})</h2>
          {!inscritas?.length ? <p className="mt-3 text-sm text-carvao/60">Ninguém ainda.</p> : (
            <ul className="mt-4 divide-y divide-linha border-t border-linha text-sm">
              {inscritas.map((i) => (
                <li key={i.id} className="py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span>{i.nome} <a href={`https://wa.me/55${i.telefone}`} target="_blank" rel="noopener" className="text-nude">{i.telefone}</a></span>
                    <span className="text-xs text-carvao/60">{reais(i.valor)} · {i.metodo === "pix" ? "Pix" : i.metodo === "cartao_credito" ? "Cartão" : "—"} · {i.gateway === "manual" ? "manual" : "Mercado Pago"}</span>
                  </div>
                  <p className="text-xs text-carvao/50">{[i.cidade, i.experiencia].filter(Boolean).join(" · ")}{i.observacoes ? ` · "${i.observacoes}"` : ""}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`text-xs ${i.status === "confirmada" ? "text-nude" : "text-carvao/60"}`}>{ROT[i.status]}</span>
                    {i.status === "aguardando_pagamento" && (
                      <form action={mudarStatusInscricao}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="status" value="confirmada" /><button className="border border-carvao px-3 py-1 text-xs">Confirmar pagamento</button></form>
                    )}
                    {i.status !== "cancelada" && (
                      <form action={mudarStatusInscricao}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="status" value="cancelada" /><button className="px-2 py-1 text-xs text-carvao/50 hover:text-red-700">Cancelar</button></form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
