import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { SITE } from "@/lib/site";

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
    <div className="min-h-dvh bg-creme text-carvao">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@type": "HairSalon",
          name: SITE.nome,
          description: SITE.descricao,
          url: SITE.url,
          telephone: SITE.telefone,
          foundingDate: SITE.fundacao,
          priceRange: "$$",
          image: `${SITE.url}/fh-concept.svg`,
          sameAs: [SITE.instagram],
          address: {
            "@type": "PostalAddress",
            streetAddress: SITE.rua,
            addressLocality: SITE.cidade,
            addressRegion: SITE.uf,
            postalCode: SITE.cep,
            addressCountry: SITE.pais,
          },
          geo: { "@type": "GeoCoordinates", latitude: SITE.lat, longitude: SITE.lng },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "08:30",
              closes: "18:30",
            },
          ],
        }}
      />
      {staff && (
        <p className="bg-carvao px-5 py-2 text-center text-xs text-creme">
          Você está vendo a loja como administradora. Rascunhos aparecem aqui,
          mas não para o público.
        </p>
      )}

      <header className="border-b border-linha"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-10">
        <Link href="/loja" aria-label="FH Concept">
          <img src="/fh-concept.svg" alt="FH Concept" className="h-10 w-auto md:h-11" />
        </Link>
        <Link href="/" className="text-sm text-carvao/60 hover:text-nude">
          o salão
        </Link>
      </div></header>

      {children}

      <footer className="mt-24 border-t border-linha px-5 py-10 text-sm text-carvao/60 md:px-10">
        <p>Rua Rui Barbosa, 679 — Sala 02 · Centro · Garuva/SC</p>
        <p className="mt-1">Terça a sábado, 8h30–12h e 13h30–18h30</p>
        <p className="mt-4 text-carvao/40">Fernanda Hosang Concept · desde 2014</p>
      </footer>
    </div>
  );
}
