import { notFound } from "next/navigation";
import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { Eyebrow } from "@/components/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { reais, linkWhatsapp } from "@/lib/preco";
import { nomeFormato, periodo } from "@/lib/formacoes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sua reserva", robots: { index: false } };

export default async function Confirmacao({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ retorno?: string }> }) {
  const { id } = await params;
  const { retorno } = await searchParams;
  const db = createAdminClient();
  const { data: i } = await db.from("inscricoes").select("*, turmas(nome, data_inicio, data_fim, horario)").eq("id", id).maybeSingle();
  if (!i) notFound();

  const confirmada = i.status === "confirmada" || retorno === "sucesso";
  const pendente = i.status === "aguardando_pagamento" && !confirmada;
  const manual = i.gateway === "manual";
  const metodo = i.metodo === "pix" ? "Pix" : "cartão";
  const msg = `Oi! Reservei vaga em "${i.turmas?.nome ?? nomeFormato(i.formato)}" pelo site (${reais(i.valor)}) e quero pagar por ${metodo}.`;

  return (
    <div className="min-h-dvh bg-creme text-texto">
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-10 md:py-16">
        <Eyebrow>Formações</Eyebrow>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl">{confirmada ? "Vaga confirmada" : i.status === "lista_espera" ? "Você está na lista" : "Reserva registrada"}</h1>

        {pendente && manual && (
          <div className="mt-6 border border-linha bg-areia p-5">
            <p className="text-sm">Falta só o pagamento por <b>{metodo}</b>. Toque no botão — a mensagem já vai com o nome da turma, e a Fernanda te passa a chave Pix na hora. A vaga fica reservada por 24 horas.</p>
            <a href={linkWhatsapp(msg)} target="_blank" rel="noopener" className="mt-4 inline-flex min-h-13 items-center bg-carvao px-7 text-sm text-creme">Pagar pelo WhatsApp</a>
          </div>
        )}
        {pendente && !manual && (
          <p className="mt-6 text-texto2">Assim que o Mercado Pago confirmar, sua vaga fica garantida e a Fernanda entra em contato. Se o pagamento não concluiu, <a href={linkWhatsapp(msg)} target="_blank" rel="noopener" className="border-b border-nude text-nude">fale com o salão</a>.</p>
        )}
        {confirmada && <p className="mt-6 text-texto2">A Fernanda vai te chamar no WhatsApp com as orientações da turma: o que levar, horário de chegada e como funciona a modelo.</p>}

        <section className="mt-10 border-t border-carvao text-sm">
          <div className="flex justify-between gap-4 border-b border-linha py-3"><span className="text-texto2">Formação</span><span className="text-right">{nomeFormato(i.formato)}</span></div>
          {i.turmas && <div className="flex justify-between gap-4 border-b border-linha py-3"><span className="text-texto2">Turma</span><span className="text-right">{i.turmas.nome} · {periodo(i.turmas.data_inicio, i.turmas.data_fim)}{i.turmas.horario ? ` · ${i.turmas.horario}` : ""}</span></div>}
          <div className="flex justify-between gap-4 border-b border-linha py-3"><span className="text-texto2">Nome</span><span>{i.nome}</span></div>
          {i.valor > 0 && <div className="flex justify-between py-4 font-serif text-xl"><span>Valor</span><span>{reais(i.valor)}</span></div>}
        </section>

        <Link href="/formacoes" className="mt-10 inline-block text-sm text-carvao/60 hover:text-nude">Voltar para formações</Link>
      </main>
      <Rodape />
    </div>
  );
}
