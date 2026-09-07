"use server";

import { createClient } from "@/lib/supabase/server";

export type Sugestao = {
  slug: string;
  nome: string;
  marca: string | null;
  preco: number | null;
  foto: string | null;
  acertos: number;
  porque: string[];
};

export async function recomendar(opcoes: string[]): Promise<Sugestao[]> {
  if (!opcoes.length) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("product_attributes")
    .select(
      "option_id, attribute_options(nome), products(slug, nome, brands(nome), product_variants(preco, ativo), product_media(url, ordem))",
    )
    .in("option_id", opcoes);

  const mapa = new Map<string, Sugestao>();

  for (const linha of data ?? []) {
    const p = linha.products;
    if (!p) continue;

    const atual = mapa.get(p.slug);
    const motivo = linha.attribute_options?.nome;

    if (atual) {
      atual.acertos += 1;
      if (motivo) atual.porque.push(motivo);
      continue;
    }

    const precos = p.product_variants.filter((v) => v.ativo).map((v) => v.preco);
    const foto = [...p.product_media].sort((a, b) => a.ordem - b.ordem)[0];

    mapa.set(p.slug, {
      slug: p.slug,
      nome: p.nome,
      marca: p.brands?.nome ?? null,
      preco: precos.length ? Math.min(...precos) : null,
      foto: foto?.url ?? null,
      acertos: 1,
      porque: motivo ? [motivo] : [],
    });
  }

  return [...mapa.values()].sort((a, b) => b.acertos - a.acertos).slice(0, 4);
}
