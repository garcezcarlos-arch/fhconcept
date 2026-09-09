import Link from "next/link";

const LINKS = [
  { href: "/#servicos", texto: "Serviços" },
  { href: "/#equipe", texto: "Equipe" },
  { href: "/#formacoes", texto: "Formações" },
  { href: "/loja", texto: "Loja" },
  { href: "/#contato", texto: "Contato" },
];

export function Cabecalho() {
  return (
    <header className="border-b border-linha">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5 md:px-10">
        <Link href="/" aria-label="FH Concept"><img src="/fh-concept.svg" alt="FH Concept" className="h-10 w-auto md:h-11" /></Link>
        <nav className="hidden gap-7 text-sm md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-carvao/60 hover:text-nude">{l.texto}</Link>
          ))}
        </nav>
        <Link href="/loja" className="text-sm text-carvao/60 hover:text-nude md:hidden">Loja</Link>
      </div>
    </header>
  );
}
