"use client";

import { useState } from "react";
import Link from "next/link";
import { reais, linkWhatsapp } from "@/lib/preco";
import { recomendar, type Sugestao } from "./actions";

type Pergunta = {
  codigo: string;
  titulo: string;
  multi: boolean;
  opcoes: { id: string; nome: string }[];
};

export default function Diagnostico({ perguntas }: { perguntas: Pergunta[] }) {
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string[]>>({});
  const [sugestoes, setSugestoes] = useState<Sugestao[] | null>(null);
  const [carregando, setCarregando] = useState(false);

  const q = perguntas[passo];
  const escolhidas = respostas[q?.codigo] ?? [];

  function marcar(id: string) {
    const novas = q.multi
      ? escolhidas.includes(id)
        ? escolhidas.filter((x) => x !== id)
        : [...escolhidas, id]
      : [id];

    const atualizado = { ...respostas, [q.codigo]: novas };
    setRespostas(atualizado);

    if (!q.multi) avancar(atualizado);
  }

  async function avancar(estado = respostas) {
    if (passo < perguntas.length - 1) {
      setPasso(passo + 1);
      return;
    }
    setCarregando(true);
    setSugestoes(await recomendar(Object.values(estado).flat()));
    setCarregando(false);
  }

  if (sugestoes) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <span className="block h-px w-12 bg-champanhe" />
        <h1 className="mt-6 font-serif text-4xl leading-tight">
          O que a Fernanda indicaria
        </h1>

        {sugestoes.length === 0 ? (
          <>
            <p className="mt-5 text-carvao/70">
              Ainda não temos no catálogo um produto que combine com o que você
              descreveu. Mande uma mensagem — a Fernanda responde pessoalmente.
            </p>
            
            <a
              href={linkWhatsapp("Oi! Fiz o diagnóstico no site e queria uma indicação.")}
              target="_blank"
              rel="noopener"
              className="mt-8 inline-flex min-h-13 items-center bg-carvao px-6 text-sm text-porcelana"
            >
              Falar no WhatsApp
            </a>
          </>
        ) : (
          <>
            <p className="mt-5 text-carvao/70">
              Escolhidos a partir do que você respondeu.
            </p>

            <div className="mt-12 space-y-12">
              {sugestoes.map((s) => (
                <Link key={s.slug} href={`/loja/${s.slug}`} className="flex gap-5">
                  {s.foto ? (
                    <img
                      src={s.foto}
                      alt={s.nome}
                      className="h-32 w-28 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="h-32 w-28 shrink-0 bg-linha/40" />
                  )}
                  <div>
                    {s.marca && <p className="text-xs text-carvao/45">{s.marca}</p>}
                    <p className="font-serif text-xl leading-tight">{s.nome}</p>
                    {s.preco !== null && (
                      <p className="mt-1 text-sm text-nude">{reais(s.preco)}</p>
                    )}
                    <p className="mt-2 text-sm text-carvao/60">
                      Indicado por: {s.porque.join(", ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            
            <a
              href={linkWhatsapp(
                `Oi! Fiz o diagnóstico e me indicaram: ${sugestoes.map((s) => s.nome).join(", ")}`,
              )}
              target="_blank"
              rel="noopener"
              className="mt-14 flex min-h-13 w-full items-center justify-center bg-carvao px-6 text-sm text-porcelana"
            >
              Levar tudo pelo WhatsApp
            </a>
          </>
        )}

        <Link href="/loja" className="mt-8 block text-sm text-carvao/55 hover:text-nude">
          Voltar para a loja
        </Link>
      </main>
    );
  }

  if (!q) return null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-10">
      <p className="text-sm text-carvao/45">
        {passo + 1} de {perguntas.length}
      </p>

      <h1 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
        {q.titulo}
      </h1>

      <div className="mt-10 space-y-3">
        {q.opcoes.map((o) => {
          const ativa = escolhidas.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => marcar(o.id)}
              className={`flex min-h-13 w-full items-center border px-5 text-left ${
                ativa
                  ? "border-carvao bg-carvao text-porcelana"
                  : "border-linha bg-white hover:border-nude"
              }`}
            >
              {o.nome}
            </button>
          );
        })}
      </div>

      {q.multi && (
        <button
          onClick={() => avancar()}
          disabled={!escolhidas.length || carregando}
          className="mt-8 min-h-13 bg-carvao px-8 text-sm text-porcelana disabled:opacity-40"
        >
          {carregando ? "Buscando" : "Continuar"}
        </button>
      )}

      {passo > 0 && (
        <button
          onClick={() => setPasso(passo - 1)}
          className="mt-6 block text-sm text-carvao/55 hover:text-nude"
        >
          Voltar
        </button>
      )}
    </main>
  );
}
