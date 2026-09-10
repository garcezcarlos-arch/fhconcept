import { notFound } from "next/navigation";
import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { Eyebrow } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { reais } from "@/lib/preco";
import { nomeFormato, periodo } from "@/lib/formacoes";
import InscricaoForm from "./form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reservar vaga", robots: { index: false } };

export default async function Inscricao({ params }: { params: Promise<{ turma: string }> }) {
  const { turma: id } = await params;
  const supabase = await createClient();
  const { data: t } = await supabase.from("turmas_vagas").select("*").eq("id", id).maybeSingle();
  if (!t || !t.id) notFound();

  const esgotada = t.status !== "aberta" || (t.restantes ?? 0) <= 0;
  const valor = t.sinal ?? t.preco ?? 0;

  return (
    <div className="min-h-dvh bg-creme text-texto">
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
        <Link href="/formacoes#turmas" className="text-xs text-texto2 hover:text-nude">← Turmas</Link>
        <Eyebrow>Reserva de vaga</Eyebrow>
        <h1 className="mt-3 max-w-[22ch] font-serif text-3xl leading-[1.1] md:text-4xl">{t.nome}</h1>
        <p className="mt-2 text-texto2">{nomeFormato(t.formato!)} · {periodo(t.data_inicio!, t.data_fim)}{t.horario ? ` · ${t.horario}` : ""}</p>

        {esgotada ? (
          <div className="mt-10 max-w-lg">
            <p className="text-texto2">Esta turma está esgotada.</p>
            <Link href="/formacoes/lista-espera" className="mt-4 inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">Entrar na lista de espera</Link>
          </div>
        ) : (
          <InscricaoForm turmaId={t.id} formato={t.formato!} valor={valor} precoCheio={t.preco ?? 0} sinal={t.sinal} restantes={t.restantes ?? 0} />
        )}
      </main>
      <Rodape />
    </div>
  );
}
