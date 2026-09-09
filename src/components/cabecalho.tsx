"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/servicos", texto: "Serviços" },
  { href: "/equipe", texto: "Equipe" },
  { href: "/formacoes", texto: "Formações" },
  { href: "/loja", texto: "Loja" },
  { href: "/contato", texto: "Contato" },
];

export function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const rota = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-linha bg-creme/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 md:px-10">
        <Link href="/" aria-label="FH Concept" className="py-4" onClick={() => setAberto(false)}>
          <img src="/fh-concept.svg" alt="FH Concept" className="h-9 w-auto md:h-11" />
        </Link>

        <nav className="hidden gap-7 text-sm md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={rota === l.href ? "text-nude" : "text-carvao/60 hover:text-nude"}>
              {l.texto}
            </Link>
          ))}
        </nav>

        <button type="button" onClick={() => setAberto(!aberto)} aria-expanded={aberto} aria-label={aberto ? "Fechar menu" : "Abrir menu"} className="-mr-3 flex h-12 w-12 flex-col items-center justify-center gap-[5px] md:hidden">
          <span className={`block h-px w-[22px] bg-carvao transition-transform ${aberto ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block h-px w-[22px] bg-carvao transition-opacity ${aberto ? "opacity-0" : ""}`} />
          <span className={`block h-px w-[22px] bg-carvao transition-transform ${aberto ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-linha bg-creme md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setAberto(false)} className="flex min-h-14 items-center border-b border-linha px-5 text-[15px] text-carvao/80">
              {l.texto}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
