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
  destaque: boolean;
  categories: { slug: string } | null;
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-rose-forte">
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
          <div className="grid h-full place-items-center text-xs text-carvao/40">sem foto</div>
        )}
        {p.status !== "ativo" ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-carvao/90 px-2.5 py-1 text-xs text-creme">rascunho</span>
        ) : p.destaque ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-terracota px-2.5 py-1 text-xs text-creme">favorito da equipe</span>
        ) : null}
      </div>

      <div className="mt-3">
        {p.brands?.nome && <p className="text-xs text-carvao/55">{p.brands.nome}</p>}
        <p className={`mt-0.5 leading-snug text-carvao ${grande ? "font-serif text-xl" : "text-[15px] font-medium"}`}>{p.nome}</p>
        {grande && p.descricao_curta && <p className="mt-1.5 max-w-sm text-sm text-carvao/65">{p.descricao_curta}</p>}
        {menor !== null && (
          <p className="mt-1.5 text-sm font-semibold text-terracota">
            {precos.length > 1 ? `a partir de ${reais(menor)}` : reais(menor)}
          </p>
        )}
      </div>
    </Link>
  );
}

const pilula = (ativa: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm transition-colors ${
    ativa ? "bg-carvao text-creme" : "bg-rose text-carvao hover:bg-rose-forte"
  }`;

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
      "id, nome, slug, status, descricao_curta, destaque, categories(slug), brands(nome), product_variants(preco, ativo), product_media(url, alt, ordem)",
    )
    .order("destaque", { ascending: false })
    .order("nome");

  if (ids) consulta = consulta.in("category_id", ids);

  const { data } = await consulta;
  const produtos = (data ?? []) as unknown as Card[];

  const atual = raizes?.find((r) => r.slug === c);
  const temCatalogo = !c && produtos.length >= 6;
  const destaques = temCatalogo ? produtos.slice(0, 2) : [];
  // na vitrine geral, kits ganham secao propria em vez de entrar na grade
  const kits = !c ? produtos.filter((p) => p.categories?.slug === "kits").slice(0, 3) : [];
  const resto = (temCatalogo ? produtos.slice(2) : produtos).filter((p) => !kits.includes(p));


  return (
    <main>
      {!c && (
        <section className="bg-rose">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-12 pt-3 md:grid-cols-[1.1fr_1fr] md:gap-14 md:px-10 md:pb-16 md:pt-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl md:order-2 md:aspect-[4/5]">
              <Image src="/galeria/cor-loiro-mel.jpg" alt="Loiro mel feito no salão FH Concept" fill priority sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
            </div>
            <div>
              <h1 className="font-serif text-[34px] leading-[1.12] text-carvao md:text-5xl">
                O que usamos no salão, <i>agora na sua casa</i>
              </h1>
              <p className="mt-4 max-w-md text-carvao/75">
                Seleção da Fernanda para manter a cor e o tratamento entre um
                atendimento e outro. Retirada em Garuva ou envio.
              </p>
              <a href="#produtos" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-terracota px-6 text-sm font-medium text-creme hover:bg-terracota-esc">
                Ver produtos
              </a>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <nav id="produtos" aria-label="Categorias" className="-mx-5 flex scroll-mt-4 gap-2 overflow-x-auto px-5 py-6 md:mx-0 md:px-0">
          <Link href="/loja" className={pilula(!c)}>Tudo</Link>
          {raizes?.map((cat) => (
            <Link key={cat.id} href={`/loja?c=${cat.slug}`} className={pilula(c === cat.slug)}>{cat.nome}</Link>
          ))}
        </nav>

        {atual && <h1 className="mb-2 mt-2 font-serif text-3xl">{atual.nome}</h1>}

        {destaques.length > 0 && (
          <section className="mt-2">
            <h2 className="font-serif text-2xl text-carvao">Favoritos da equipe</h2>
            <div className="mt-5 grid max-w-4xl gap-6 md:grid-cols-2 md:gap-10">
              {destaques.map((p) => <Produto key={p.id} p={p} grande />)}
            </div>
          </section>
        )}

        <Link
          href="/loja/diagnostico"
          className="group mt-14 flex flex-col gap-5 rounded-3xl bg-carvao px-6 py-8 text-creme md:flex-row md:items-center md:justify-between md:px-10 md:py-10"
        >
          <div>
            <p className="font-serif text-[27px] leading-tight md:text-3xl">Não sabe qual usar no seu cabelo?</p>
            <p className="mt-2 max-w-md text-sm text-creme/75">Quatro perguntas e a Fernanda monta a rotina certa para o seu fio.</p>
          </div>
          <span className="inline-flex min-h-12 shrink-0 items-center self-start rounded-full bg-rose px-6 text-sm font-medium text-carvao group-hover:bg-rose-forte md:self-auto">
            Fazer o diagnóstico
          </span>
        </Link>

        {resto.length === 0 && destaques.length === 0 ? (
          <p className="py-20 text-sm text-carvao/60">Ainda não há produtos nesta categoria.</p>
        ) : (
          <section className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {resto.map((p) => <Produto key={p.id} p={p} />)}
          </section>
        )}

        {kits.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl text-carvao">Kits por objetivo</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {kits.map((k) => {
                const foto = [...k.product_media].sort((a, b) => a.ordem - b.ordem)[0];
                const preco = Math.min(...k.product_variants.filter((v) => v.ativo).map((v) => v.preco));
                return (
                  <Link key={k.id} href={`/loja/${k.slug}`} className="flex items-center gap-4 rounded-2xl bg-areia p-3 hover:bg-rose">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-rose-forte">
                      {foto && <Image src={foto.url} alt={foto.alt || k.nome} fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-carvao">{k.nome}</p>
                      {k.descricao_curta && <p className="truncate text-[13px] text-carvao/65">{k.descricao_curta}</p>}
                    </div>
                    {Number.isFinite(preco) && <span className="text-sm font-semibold text-terracota">{reais(preco)}</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
