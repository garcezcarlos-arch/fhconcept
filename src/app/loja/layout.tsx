import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { SITE } from "@/lib/site";
import { CarrinhoProvider } from "@/lib/carrinho";
import { CarrinhoLink } from "@/components/carrinho-link";

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
    <CarrinhoProvider>
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

      <p className="bg-terracota px-5 py-2.5 text-center text-[13px] text-creme">
        Retirada grátis no salão, em Garuva · Pix ou cartão em até 6x
      </p>

      <header className="bg-rose"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
        <Link href="/loja" aria-label="FH Concept">
          <img src="/fh-concept.svg" alt="FH Concept" className="h-10 w-auto md:h-11" />
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-carvao/70 hover:text-terracota">o salão</Link>
          <CarrinhoLink />
        </nav>
      </div></header>

      {children}

      <footer className="mt-24 bg-rose">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 text-sm md:grid-cols-4 md:px-10">
          <div><p className="font-medium text-carvao">Retirada no salão</p><p className="mt-1 text-carvao/70">Centro de Garuva, sem frete</p></div>
          <div><p className="font-medium text-carvao">Envio pelos Correios</p><p className="mt-1 text-carvao/70">frete confirmado antes de postar</p></div>
          <div><p className="font-medium text-carvao">Pix ou cartão</p><p className="mt-1 text-carvao/70">em até 6x</p></div>
          <div><p className="font-medium text-carvao">Dúvida? WhatsApp</p><p className="mt-1 text-carvao/70">quem responde é da equipe</p></div>
        </div>
        <div className="border-t border-carvao/10 px-5 py-6 text-xs text-carvao/60 md:px-10">
          <div className="mx-auto max-w-6xl">
            <p>Rua Rui Barbosa, 679 — Sala 02 · Centro · Garuva/SC · Terça a sábado, 8h30–12h e 13h30–18h30</p>
            <p className="mt-1">Fernanda Hosang Concept · desde 2014 · CNPJ 19.417.911/0001-47</p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/trocas-e-devolucoes" className="hover:text-terracota">Trocas e devoluções</Link>
              <Link href="/privacidade" className="hover:text-terracota">Privacidade</Link>
              <Link href="/termos" className="hover:text-terracota">Termos de compra</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
    </CarrinhoProvider>
  );
}
