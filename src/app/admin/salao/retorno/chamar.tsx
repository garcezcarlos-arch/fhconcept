"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarContato } from "./actions";
import type { Lista } from "@/lib/retorno";

/* Abre a conversa no WhatsApp com a mensagem pronta e anota a chamada.
   Quem envia a mensagem e a pessoa, dentro do WhatsApp. */
export function ChamarWhatsapp({ codigo, lista, href, rotulo, discreto = false }: { codigo: number; lista: Lista; href: string; rotulo: string; discreto?: boolean }) {
  const router = useRouter();
  const [anotando, iniciar] = useTransition();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-busy={anotando}
      onClick={() => iniciar(async () => { await registrarContato(codigo, lista); router.refresh(); })}
      className={discreto ? "inline-flex min-h-10 items-center whitespace-nowrap border-b border-nude text-sm text-nude-esc" : "inline-flex min-h-10 items-center whitespace-nowrap bg-carvao px-4 text-sm text-creme hover:bg-nude-esc"}
    >
      {rotulo}
    </a>
  );
}
