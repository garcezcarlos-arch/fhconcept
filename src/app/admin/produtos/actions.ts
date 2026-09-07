"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugificar } from "@/lib/slug";

export type EstadoForm = { erro?: string };

type Variante = {
  nome: string;
  preco: string;
  peso_g: string;
  sku: string;
  qtd: string;
  custo: string;
};

export async function criarProduto(
  _anterior: EstadoForm,
  dados: FormData,
): Promise<EstadoForm> {
  const supabase = await createClient();

  const nome = String(dados.get("nome") ?? "").trim();
  const categoryId = String(dados.get("category_id") ?? "");
  const marca = String(dados.get("marca") ?? "").trim();
  const descricaoCurta = String(dados.get("descricao_curta") ?? "").trim();
  const descricao = String(dados.get("descricao") ?? "").trim();
  const modoUso = String(dados.get("modo_uso") ?? "").trim();
  const anvisa = String(dados.get("registro_anvisa") ?? "").trim();
  const ncm = String(dados.get("ncm") ?? "").trim();
  const origem = String(dados.get("origem") ?? "") || null;
  const notaId = String(dados.get("nota_entrada_id") ?? "");

  const variantes: Variante[] = JSON.parse(String(dados.get("variantes") ?? "[]"));
  const fotos: { url: string; alt: string }[] = JSON.parse(
    String(dados.get("fotos") ?? "[]"),
  );
  const atributos = dados.getAll("atributos").map(String).filter(Boolean);

  if (!nome) return { erro: "Informe o nome do produto." };
  if (!categoryId) return { erro: "Escolha a categoria." };
  if (!variantes.length) return { erro: "Informe ao menos um tamanho e preco." };

  for (const v of variantes) {
    if (!v.nome.trim()) return { erro: "Cada tamanho precisa de um nome (ex: 300ml)." };
    if (!v.preco.trim()) return { erro: `Informe o preco de ${v.nome}.` };
    if (!v.peso_g.trim()) return { erro: `Informe o peso de ${v.nome} — o frete depende dele.` };
  }

  // vendedor do usuario logado
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("profiles")
    .select("vendor_id")
    .eq("id", user!.id)
    .single();

  if (!perfil?.vendor_id) {
    return { erro: "Seu usuario nao esta vinculado a um vendedor." };
  }

  // marca: reaproveita ou cria
  let brandId: string | null = null;
  if (marca) {
    const { data: existente } = await supabase
      .from("brands")
      .select("id")
      .ilike("nome", marca)
      .maybeSingle();

    if (existente) {
      brandId = existente.id;
    } else {
      const { data: nova, error } = await supabase
        .from("brands")
        .insert({ nome: marca, slug: slugificar(marca) })
        .select("id")
        .single();
      if (error) return { erro: `Nao foi possivel salvar a marca: ${error.message}` };
      brandId = nova.id;
    }
  }

  // slug unico
  let slug = slugificar(nome);
  const { data: colide } = await supabase
    .from("products")
    .select("slug")
    .like("slug", `${slug}%`);
  if (colide?.some((p) => p.slug === slug)) {
    slug = `${slug}-${colide.length + 1}`;
  }

  const { data: produto, error: erroProduto } = await supabase
    .from("products")
    .insert({
      vendor_id: perfil.vendor_id,
      brand_id: brandId,
      category_id: categoryId,
      nome,
      slug,
      descricao_curta: descricaoCurta || null,
      descricao: descricao || null,
      modo_uso: modoUso || null,
      registro_anvisa: anvisa || null,
      ncm: ncm || null,
      origem,
      status: "rascunho",
    })
    .select("id")
    .single();

  if (erroProduto) return { erro: erroProduto.message };

  const { data: criadas, error: erroVar } = await supabase
    .from("product_variants")
    .insert(
      variantes.map((v, i) => ({
        product_id: produto.id,
        sku: v.sku.trim(),
        nome: v.nome.trim(),
        preco: Number(v.preco.replace(",", ".")),
        peso_g: Math.round(Number(v.peso_g.replace(",", "."))),
        ordem: i,
      })),
    )
    .select("id");

  if (erroVar) {
    await supabase.from("products").delete().eq("id", produto.id);
    if (erroVar.code === "23505") return { erro: "Ja existe produto com esse codigo (SKU)." };
    return { erro: erroVar.message };
  }

  if (atributos.length) {
    await supabase.from("product_attributes").insert(
      atributos.map((option_id) => ({ product_id: produto.id, option_id })),
    );
  }

  if (fotos.length) {
    await supabase.from("product_media").insert(
      fotos.map((f, i) => ({
        product_id: produto.id,
        url: f.url,
        alt: f.alt || nome,
        ordem: i,
      })),
    );
  }

  // vinculo com a nota de entrada — e o que destrava a publicacao
  if (notaId) {
    const itens = criadas
      .map((v, i) => ({
        nota_entrada_id: notaId,
        variant_id: v.id,
        quantidade: Number((variantes[i].qtd || "0").replace(",", ".")),
        custo_unitario: Number((variantes[i].custo || "0").replace(",", ".")),
      }))
      .filter((it) => it.quantidade > 0);

    if (itens.length) {
      await supabase.from("nota_entrada_itens").insert(itens);
    }
  }

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}
