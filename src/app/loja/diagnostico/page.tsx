import { createClient } from "@/lib/supabase/server";
import Diagnostico from "./form";

export default async function Pagina() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("attributes")
    .select("codigo, nome, attribute_options(id, nome, ordem)")
    .in("codigo", ["tipo_cabelo", "quimica", "necessidade", "tipo_pele"])
    .order("ordem");

  const perguntas = [
    { codigo: "tipo_cabelo", titulo: "Como é o seu cabelo?", multi: false },
    { codigo: "quimica", titulo: "Tem química — coloração, mecha ou alisamento?", multi: false },
    { codigo: "necessidade", titulo: "O que ele mais precisa agora?", multi: true },
    { codigo: "tipo_pele", titulo: "E a sua pele, como é?", multi: false },
  ]
    .map((q) => {
      const a = data?.find((x) => x.codigo === q.codigo);
      if (!a) return null;
      return {
        ...q,
        opcoes: [...a.attribute_options].sort((x, y) => x.ordem - y.ordem),
      };
    })
    .filter((q) => q !== null);

  return <Diagnostico perguntas={perguntas} />;
}
