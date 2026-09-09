import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // so produtos publicados entram — rascunho nunca vaza para o sitemap
  const { data: produtos } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "ativo")
    .eq("publico", "consumidor");

  const { data: categorias } = await supabase
    .from("categories")
    .select("slug")
    .is("parent_id", null)
    .eq("ativo", true);

  return [
    { url: SITE.url, priority: 1 },
    { url: `${SITE.url}/loja`, priority: 0.9 },
    { url: `${SITE.url}/loja/diagnostico`, priority: 0.8 },
    ...(categorias ?? []).map((c) => ({
      url: `${SITE.url}/loja?c=${c.slug}`,
      priority: 0.7,
    })),
    ...(produtos ?? []).map((p) => ({
      url: `${SITE.url}/loja/${p.slug}`,
      lastModified: new Date(p.updated_at),
      priority: 0.8,
    })),
  ];
}
