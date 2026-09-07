import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { reais } from "@/lib/preco";

export const revalidate = 60;

type Card = {
  id: string;
  nome: string;
  slug: string;
  status: string;
  descricao_curta: string | null;
  brands: { nome: string } | null;
  product_variants: { preco: number; ativo: boolean }[];
  product_media: { url: string; alt: string; ordem: number }[];
};

function Produto({ p, grande = false }: { p: Card; grande?: boolean }) {
  const foto = [...p.product_media].sort((a, b) => a.ordem - b.ordem)[0];
  const precos = p.product_variants.filter((v) => v.ativo).map((v) => v.preco);
  const menor = precos.length ? Math.min(...precos) : null;

  return (
    <Link href={`/loja/${p.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        {foto ? (
          <Image
            src={foto.url}
            alt={foto.alt || p.nome}
            fill
            sizes={grande ? "(max-width: 768px) 100vw, 45vw" : "(max-width: 768px) 50vw, 23vw"}
            priority={grande}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-linha/40 text-xs text-carvao/30">
            sem foto
          </div>
        )}
        {p.status !== "ativo" && (
          <span className="absolute left-3 top-3 bg-carvao/90 px-2 py-0.5 text-xs text-porcelana">
            rascunho
          </span>
        )}
      </div>

      <div className="mt-4">
        {p.brands?.nome && (
          <p className="text-xs tracking-wide text-carvao/45">{p.brands.nome}</p>
        )}
        <p className={`mt-0.5 leading-snug ${grande ? "font-serif text-xl" : "text-sm"}`}>
          {p.nome}
        </p>
        {grande && p.descricao_curta && (
          <p className="mt-1.5 max-w-sm text-sm text-carvao/60">{p.descricao_curta}</p>
        )}
        {menor !== null && (
          <p className="mt-2 text-sm text-nude">
            {precos.length > 1 ? `a partir de ${reais(menor)}` : reais(menor)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function Loja({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const supabase = await createClient();

  const { data: raizes } = await supabase
    .from("categories")
    .select("id, nome, slug, ordem")
    .eq("ativo", true)
    .is("parent_id", null)
    .order("ordem");

  // filtro por arvore: pega a raiz pelo slug e busca os filhos dela
  let ids: string[] | null = null;
  if (c) {
    const raiz = raizes?.find((r) => r.slug === c);
    if (raiz) {
      const { data: filhas } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", raiz.id);
      ids = [raiz.id, ...(filhas ?? []).map((f) => f.id)];
    } else {
      ids = [];
    }
  }

  let consulta = supabase
    .from("products")
    .select(
      "id, nome, slug, status, descricao_curta, brands(nome), product_variants(preco, ativo), product_media(url, alt, ordem)",
    )
    .order("destaque", { ascending: false })
    .order("nome");

  if (ids) consulta = consulta.in("category_id", ids);

  const { data } = await consulta;
  const produtos = (data ?? []) as unknown as Card[];

  const atual = raizes?.find((r) => r.slug === c);
  const temCatalogo = !c && produtos.length >= 6;
  const destaques = temCatalogo ? produtos.slice(0, 2) : [];
  const resto = temCatalogo ? produtos.slice(2) : produtos;

  return (
    <main className="mx-auto max-w-6xl px-5 md:px-10">
      {/* abertura editorial: uma frase, uma regra de ouro, nada de banner */}
      {!c && (
        <section className="border-b border-linha py-14 md:py-20">
          <span className="block h-px w-12 bg-champanhe" />
          <h1 className="mt-6 max-w-2xl font-serif text-4xl leading-[1.15] md:text-5xl">
            O que usamos no salão, agora na sua casa
          </h1>
          <p className="mt-5 max-w-md text-carvao/60">
            Seleção da Fernanda para manter a cor e o tratamento entre um
            atendimento e outro. Retirada em Garuva ou envio.
          </p>
        </section>
      )}

      <nav className="-mx-5 flex gap-7 overflow-x-auto px-5 py-6 md:mx-0 md:px-0">
        <Link
          href="/loja"
          className={`shrink-0 border-b-2 pb-1.5 text-sm ${
            !c ? "border-nude" : "border-transparent text-carvao/55 hover:text-nude"
          }`}
        >
          Tudo
        </Link>
        {raizes?.map((cat) => (
          <Link
            key={cat.id}
            href={`/loja?c=${cat.slug}`}
            className={`shrink-0 border-b-2 pb-1.5 text-sm ${
              c === cat.slug ? "border-nude" : "border-transparent text-carvao/55 hover:text-nude"
            }`}
          >
            {cat.nome}
          </Link>
        ))}
      </nav>

      {atual && (
        <h1 className="mb-2 mt-4 font-serif text-3xl">{atual.nome}</h1>
      )}

      {destaques.length > 0 && (
        <section className="mt-6 grid max-w-4xl gap-8 md:grid-cols-2 md:gap-10">
          {destaques.map((p) => (
            <Produto key={p.id} p={p} grande />
          ))}
        </section>
      )}

      <Link
        href="/loja/diagnostico"
        className="group mt-16 flex items-center justify-between gap-6 bg-carvao px-6 py-10 text-porcelana md:px-10"
      >
        <div>
          <p className="font-serif text-2xl leading-tight md:text-3xl">
            Não sabe qual usar no seu cabelo?
          </p>
          <p className="mt-2 max-w-md text-sm text-porcelana/60">
            Quatro perguntas e a Fernanda monta a rotina certa para o seu fio.
          </p>
        </div>
        <span className="shrink-0 border-b border-champanhe pb-0.5 text-sm text-champanhe">
          Responder
        </span>
      </Link>

      {resto.length === 0 && destaques.length === 0 ? (
        <p className="py-20 text-sm text-carvao/60">
          Ainda não há produtos nesta categoria.
        </p>
      ) : (
        <section className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {resto.map((p) => (
            <Produto key={p.id} p={p} />
          ))}
        </section>
      )}

      <section className="mt-24 grid gap-8 border-t border-linha py-12 text-sm md:grid-cols-3">
        <div>
          <p className="font-serif text-lg">Retirada no salão</p>
          <p className="mt-1.5 text-carvao/60">
            Rua Rui Barbosa, 679 — Centro, Garuva. Sem frete.
          </p>
        </div>
        <div>
          <p className="font-serif text-lg">Indicação de quem faz</p>
          <p className="mt-1.5 text-carvao/60">
            Produto que a equipe usa no atendimento, não catálogo de revenda.
          </p>
        </div>
        <div>
          <p className="font-serif text-lg">Dúvida antes de comprar</p>
          <p className="mt-1.5 text-carvao/60">
            Chame no WhatsApp. Quem responde entende de cabelo.
          </p>
        </div>
      </section>
    </main>
  );
}
