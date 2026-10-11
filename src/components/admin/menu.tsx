"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Item = { href: string; texto: string; externo?: boolean };
type Grupo = { titulo?: string; itens: Item[]; soAdmin?: boolean };

/* Menu do portal, por area do negocio. No celular vira uma barra com botao. */
export function MenuAdmin({ nome, papel, agendaGendo }: { nome: string; papel: string; agendaGendo: string }) {
  const rota = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  const grupos: Grupo[] = [
    { itens: [{ href: "/admin", texto: "Painel" }] },
    {
      titulo: "Salão",
      soAdmin: true,
      itens: [
        { href: "/admin/salao", texto: "Indicadores" },
        { href: "/admin/salao/clientes", texto: "Clientes" },
        { href: "/admin/salao/servicos", texto: "Serviços" },
        { href: "/admin/salao/produtos", texto: "Estoque do salão" },
        { href: "/admin/salao/importar", texto: "Importar do Gendo" },
        { href: agendaGendo, texto: "Agenda no Gendo", externo: true },
      ],
    },
    {
      titulo: "Loja",
      itens: [
        { href: "/admin/pedidos", texto: "Pedidos" },
        { href: "/admin/produtos", texto: "Produtos" },
        { href: "/admin/estoque", texto: "Estoque" },
        { href: "/admin/notas", texto: "Notas de entrada" },
        { href: "/admin/cupons", texto: "Cupons" },
      ],
    },
    {
      titulo: "Formações",
      itens: [
        { href: "/admin/turmas", texto: "Turmas" },
        { href: "/admin/turmas/espera", texto: "Lista de espera" },
      ],
    },
  ];

  // o item mais especifico vence: /admin/turmas/espera nao acende "Turmas"
  const internos = grupos.flatMap((g) => g.itens).filter((i) => !i.externo).map((i) => i.href);
  const ativo = internos
    .filter((h) => (h === "/admin" ? rota === "/admin" : rota === h || rota.startsWith(h + "/")))
    .sort((a, b) => b.length - a.length)[0];

  async function sair() {
    await createClient().auth.signOut();
    router.push("/entrar");
    router.refresh();
  }

  return (
    <aside className="border-b border-linha bg-branco md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:block md:py-6">
        <Link href="/admin" onClick={() => setAberto(false)} className="block">
          <img src="/fh-concept.svg" alt="FH Concept" className="h-7 w-auto" />
          <span className="mt-2 hidden text-xs text-texto2 md:block">Operações</span>
        </Link>
        <button type="button" onClick={() => setAberto(!aberto)} aria-expanded={aberto} aria-controls="menu-admin" className="min-h-11 border border-linha px-4 text-sm md:hidden">
          {aberto ? "Fechar" : "Menu"}
        </button>
      </div>

      <nav id="menu-admin" aria-label="Portal" className={`${aberto ? "block" : "hidden"} border-t border-linha px-5 pb-5 pt-3 text-sm md:block md:flex-1 md:border-t-0 md:pt-0`}>
        {grupos.filter((g) => !g.soAdmin || papel === "admin").map((g, i) => (
          <div key={g.titulo ?? i} className={i > 0 ? "mt-5" : ""}>
            {g.titulo && <p className="mb-1 text-xs text-texto2">{g.titulo}</p>}
            {g.itens.map((item) =>
              item.externo ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener" className="-mx-2 flex min-h-10 items-center px-2 text-carvao/75 hover:bg-areia hover:text-carvao md:min-h-9">
                  <span className="whitespace-nowrap">{item.texto}</span>
                  <svg aria-hidden viewBox="0 0 12 12" className="ml-1.5 h-3 w-3 shrink-0 text-texto2" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4.5 2H2v8h8V7.5M7 2h3v3M10 2 5.5 6.5" /></svg>
                  <span className="sr-only"> (abre em outra aba)</span>
                </a>
              ) : (
                <Link key={item.href} href={item.href} onClick={() => setAberto(false)} aria-current={ativo === item.href ? "page" : undefined} className={`-mx-2 flex min-h-10 items-center border-l-2 px-2 md:min-h-9 ${ativo === item.href ? "border-nude bg-areia text-carvao" : "border-transparent text-carvao/75 hover:bg-areia hover:text-carvao"}`}>
                  {item.texto}
                </Link>
              ),
            )}
          </div>
        ))}

        <div className="mt-6 border-t border-linha pt-4 text-xs text-texto2 md:mt-8">
          <p className="text-carvao">{nome}</p>
          <div className="mt-2 flex gap-5">
            <Link href="/" className="inline-flex min-h-9 items-center hover:text-nude-esc">Ver o site</Link>
            <button type="button" onClick={sair} className="inline-flex min-h-9 items-center hover:text-nude-esc">Sair</button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
