import Link from "next/link";
import type { ReactNode } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { Eyebrow } from "@/components/ui";
import { LEGAL } from "@/lib/legal";

const PAGINAS = [
  { href: "/trocas-e-devolucoes", texto: "Trocas e devoluções" },
  { href: "/privacidade", texto: "Privacidade" },
  { href: "/termos", texto: "Termos de uso" },
];

/* Moldura comum das paginas legais: leitura confortavel, indice lateral no computador. */
export function PaginaLegal({ titulo, resumo, atual, children }: { titulo: string; resumo: string; atual: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-creme text-texto">
      <Cabecalho />
      <main className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl md:grid md:grid-cols-[14rem_1fr] md:gap-16">
          <nav aria-label="Políticas" className="mb-10 flex flex-wrap gap-2 md:sticky md:top-28 md:mb-0 md:flex-col md:self-start">
            {PAGINAS.map((p) => (
              <Link key={p.href} href={p.href}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${p.href === atual ? "bg-carvao text-creme" : "bg-rose text-carvao hover:bg-rose-forte"}`}>
                {p.texto}
              </Link>
            ))}
          </nav>

          <article className="max-w-[68ch]">
            <Eyebrow>Políticas da loja</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl leading-[1.1] md:text-5xl">{titulo}</h1>
            <p className="mt-5 text-lg leading-relaxed text-texto2">{resumo}</p>
            <p className="mt-3 text-xs text-texto2">Atualizado em {LEGAL.atualizadoEm}</p>

            <div className="legal mt-10 space-y-8 leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-carvao [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:border-b [&_a]:border-terracota [&_a]:text-terracota">
              {children}
            </div>
          </article>
        </div>
      </main>
      <Rodape />
    </div>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return <section><h2>{titulo}</h2>{children}</section>;
}
