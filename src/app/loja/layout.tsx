import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let staff = false;
  if (user) {
    const { data } = await supabase
      .from("profiles").select("papel").eq("id", user.id).single();
    staff = ["admin", "vendedor", "operacao"].includes(data?.papel ?? "");
  }

  return (
    <div className="min-h-dvh bg-porcelana text-carvao">
      {staff && (
        <p className="bg-carvao px-5 py-2 text-center text-xs text-porcelana">
          Você está vendo a loja como administradora. Rascunhos aparecem aqui,
          mas não para o público.
        </p>
      )}

      <header className="flex items-baseline justify-between border-b border-linha px-5 py-5 md:px-10">
        <Link href="/loja" aria-label="FH Concept">
          <img src="/fh-concept.svg" alt="FH Concept" className="h-8 w-auto md:h-9" />
        </Link>
        <Link href="/" className="text-sm text-carvao/60 hover:text-nude">
          o salão
        </Link>
      </header>

      {children}

      <footer className="mt-24 border-t border-linha px-5 py-10 text-sm text-carvao/60 md:px-10">
        <p>Rua Rui Barbosa, 679 — Sala 02 · Centro · Garuva/SC</p>
        <p className="mt-1">Terça a sábado, 8h30–12h e 13h30–18h30</p>
        <p className="mt-4 text-carvao/40">Fernanda Hosang Concept · desde 2014</p>
      </footer>
    </div>
  );
}
