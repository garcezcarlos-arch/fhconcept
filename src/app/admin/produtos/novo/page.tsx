import { createClient } from "@/lib/supabase/server";
import FormProduto from "./form";

export default async function NovoProduto() {
  const supabase = await createClient();

  const [{ data: categorias }, { data: atributos }, { data: notas }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, nome, parent_id, ordem")
        .eq("ativo", true)
        .order("ordem"),
      supabase
        .from("attributes")
        .select("id, nome, ordem, attribute_options(id, nome, ordem)")
        .order("ordem"),
      supabase
        .from("nota_entrada")
        .select("id, numero, data_emissao, suppliers(nome)")
        .order("data_emissao", { ascending: false })
        .limit(50),
    ]);

  // so as folhas da arvore entram no seletor, com o pai no rotulo
  const raizes = new Map((categorias ?? []).filter(c => !c.parent_id).map(c => [c.id, c.nome]));
  const folhas = (categorias ?? [])
    .filter((c) => c.parent_id)
    .map((c) => ({ id: c.id, rotulo: `${raizes.get(c.parent_id!) ?? ""} › ${c.nome}` }));

  return (
    <FormProduto
      categorias={folhas}
      atributos={atributos ?? []}
      notas={(notas ?? []).map((n) => ({
        id: n.id,
        rotulo: `${n.suppliers?.nome} — nota ${n.numero}`,
      }))}
    />
  );
}
