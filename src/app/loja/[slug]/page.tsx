import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Comprar from "./comprar";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { SITE } from "@/lib/site";

export const revalidate = 60;


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("nome, descricao_curta, descricao, status, brands(nome), product_media(url, ordem)")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Produto nao encontrado" };

  const marca = data.brands?.nome ? `${data.brands.nome} · ` : "";
  const desc =
    data.descricao_curta ??
    data.descricao?.slice(0, 155) ??
    `${data.nome} na loja da FH Concept, em Garuva.`;
  const foto = [...data.product_media].sort((a, b) => a.ordem - b.ordem)[0];

  return {
    title: data.nome,
    description: `${marca}${desc}`,
    alternates: { canonical: `/loja/${slug}` },
    robots: data.status === "ativo" ? undefined : { index: false, follow: false },
    openGraph: {
      type: "website",
      title: data.nome,
      description: desc,
      images: foto ? [foto.url] : undefined,
    },
  };
}

export default async function Produto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("products")
    .select(
      "id, nome, slug, descricao, descricao_curta, modo_uso, ingredientes, status, brands(nome), categories(nome, slug, categories!parent_id(nome, slug)), product_variants(id, nome, preco, preco_promocional, ativo, ordem), product_media(url, alt, ordem), product_attributes(attribute_options(nome, attributes(nome)))",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!p) notFound();

  const fotos = [...p.product_media].sort((a, b) => a.ordem - b.ordem);
  const tamanhos = p.product_variants
    .filter((v) => v.ativo)
    .sort((a, b) => a.ordem - b.ordem);

  // agrupa atributos por nome do grupo: "Necessidade: hidratacao, anti-frizz"
  const pai = Array.isArray(p.categories?.categories)
    ? p.categories.categories[0]
    : p.categories?.categories;

  const grupos = new Map<string, string[]>();
  for (const pa of p.product_attributes) {
    const g = pa.attribute_options?.attributes?.nome;
    const v = pa.attribute_options?.nome;
    if (!g || !v) continue;
    grupos.set(g, [...(grupos.get(g) ?? []), v]);
  }

  return (
    <main className="pb-16">
      {p.status === "ativo" && (
        <DadosEstruturados
          dados={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.nome,
            description: p.descricao_curta ?? p.descricao ?? p.nome,
            image: fotos.map((f) => f.url),
            brand: p.brands?.nome
              ? { "@type": "Brand", name: p.brands.nome }
              : undefined,
            category: p.categories?.nome,
            offers: tamanhos.map((t) => ({
              "@type": "Offer",
              name: t.nome,
              price: (t.preco_promocional ?? t.preco).toFixed(2),
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
              url: `${SITE.url}/loja/${p.slug}`,
              seller: { "@type": "Organization", name: SITE.nome },
            })),
          }}
        />
      )}
      <nav className="px-5 py-4 text-sm text-carvao/50 md:px-10">
        <Link href="/loja" className="hover:text-nude">Loja</Link>
        {pai?.nome && (
          <>
            {" · "}
            <Link href={`/loja?c=${pai.slug}`} className="hover:text-nude">
              {pai.nome}
            </Link>
          </>
        )}
      </nav>

      <div className="md:grid md:grid-cols-2 md:gap-12 md:px-10">
        {/* foto sangra na borda no celular — o unico elemento ousado da pagina */}
        <div className="md:sticky md:top-8 md:self-start">
          {fotos.length ? (
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto md:block md:space-y-2">
              {fotos.map((f) => (
                <img
                  key={f.url}
                  src={f.url}
                  alt={f.alt || p.nome}
                  className="aspect-[4/5] w-[88vw] shrink-0 snap-center object-cover md:w-full"
                />
              ))}
            </div>
          ) : (
            <div className="grid aspect-[4/5] place-items-center bg-white text-xs text-carvao/30">
              sem foto
            </div>
          )}
        </div>

        <div className="px-5 pt-8 md:px-0 md:pt-0">
          {p.status !== "ativo" && (
            <p className="mb-4 inline-block bg-carvao px-2 py-0.5 text-xs text-creme">
              rascunho — visível só para você
            </p>
          )}

          {p.brands?.nome && (
            <p className="text-sm text-carvao/50">{p.brands.nome}</p>
          )}
          <h1 className="mt-1 font-serif text-3xl leading-tight">{p.nome}</h1>

          {p.descricao_curta && (
            <p className="mt-3 text-carvao/70">{p.descricao_curta}</p>
          )}

          <Comprar produto={p.nome} tamanhos={tamanhos} />

          {/* informacao exposta, nao escondida em acordeao:
              em beleza a informacao e o argumento de venda */}
          {grupos.size > 0 && (
            <dl className="mt-10 space-y-2 border-t border-linha pt-6 text-sm">
              {[...grupos].map(([grupo, valores]) => (
                <div key={grupo} className="flex gap-3">
                  <dt className="w-40 shrink-0 text-carvao/50">{grupo}</dt>
                  <dd>{valores.join(", ")}</dd>
                </div>
              ))}
            </dl>
          )}

          {p.descricao && (
            <div className="mt-10 border-t border-linha pt-6">
              <h2 className="font-serif text-lg">Sobre o produto</h2>
              <p className="mt-3 whitespace-pre-line text-carvao/80">{p.descricao}</p>
            </div>
          )}

          {p.modo_uso && (
            <div className="mt-10 border-t border-linha pt-6">
              <h2 className="font-serif text-lg">Como usar</h2>
              <p className="mt-3 whitespace-pre-line text-carvao/80">{p.modo_uso}</p>
            </div>
          )}

          {p.ingredientes && (
            <div className="mt-10 border-t border-linha pt-6">
              <h2 className="font-serif text-lg">Composição</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-carvao/70">
                {p.ingredientes}
              </p>
            </div>
          )}

          <p className="mt-10 border-t border-linha pt-6 text-sm text-carvao/60">
            Retirada no salão em Garuva ou envio para outras cidades.
          </p>
        </div>
      </div>
    </main>
  );
}
