import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";

/* Tudo que fala com o Melhor Envio fica aqui. Sem MELHORENVIO_TOKEN a loja
   segue no modo antigo: frete "a confirmar no WhatsApp". */

const BASE = process.env.MELHORENVIO_SANDBOX === "1"
  ? "https://sandbox.melhorenvio.com.br"
  : "https://melhorenvio.com.br";

// Correios PAC = 1, SEDEX = 2 (Listar servicos na API). Pode trocar pela env.
const SERVICOS = process.env.MELHORENVIO_SERVICOS ?? "1,2";

// Caixa minima aceita pelos Correios, usada quando a variante nao tem medidas
const MEDIDA_PADRAO = { largura: 11, altura: 4, comprimento: 16 };

export function freteConfigurado() {
  return Boolean(process.env.MELHORENVIO_TOKEN);
}

export type OpcaoFrete = {
  id: number;            // id do servico no Melhor Envio
  nome: string;          // PAC, SEDEX
  transportadora: string;
  preco: number;
  prazoDias: number;
};

export type ItemFrete = { variant_id: string; quantidade: number };

const soDigitos = (s: string) => s.replace(/\D/g, "");

/* Cota o frete do carrinho para um CEP. Peso, medidas e valor vem do banco,
   nunca do navegador. Retorna as opcoes validas, da mais barata para a mais cara. */
export async function cotarFrete(cepDestino: string, itens: ItemFrete[], servicos = SERVICOS): Promise<OpcaoFrete[]> {
  const token = process.env.MELHORENVIO_TOKEN;
  if (!token) throw new Error("MELHORENVIO_TOKEN ausente");

  const cep = soDigitos(cepDestino);
  if (cep.length !== 8) throw new Error("CEP inválido");
  const validos = itens.filter((x) => x.variant_id && x.quantidade > 0);
  if (!validos.length) throw new Error("carrinho vazio");

  const db = createAdminClient();
  const { data: variantes, error } = await db
    .from("product_variants")
    .select("id, peso_g, largura_cm, altura_cm, profundidade_cm, preco, preco_promocional")
    .in("id", validos.map((x) => x.variant_id));
  if (error || !variantes?.length) throw new Error("produtos não encontrados");

  const products = validos.map((x) => {
    const v = variantes.find((y) => y.id === x.variant_id);
    if (!v) return null;
    return {
      id: v.id,
      width: v.largura_cm ?? MEDIDA_PADRAO.largura,
      height: v.altura_cm ?? MEDIDA_PADRAO.altura,
      length: v.profundidade_cm ?? MEDIDA_PADRAO.comprimento,
      weight: Math.max(v.peso_g, 50) / 1000, // kg
      insurance_value: Number((v.preco_promocional ?? v.preco).toFixed(2)),
      quantity: x.quantidade,
    };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  const r = await fetch(`${BASE}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      // o Melhor Envio exige nome do app + e-mail de contato tecnico
      "User-Agent": `FH Concept Loja (${process.env.MELHORENVIO_CONTATO ?? SITE.url})`,
    },
    body: JSON.stringify({
      from: { postal_code: soDigitos(process.env.MELHORENVIO_CEP_ORIGEM ?? SITE.cep) },
      to: { postal_code: cep },
      products,
      options: { receipt: false, own_hand: false },
      services: servicos,
    }),
    cache: "no-store",
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`Melhor Envio ${r.status}: ${JSON.stringify(j)?.slice(0, 200)}`);

  type Resp = { id: number; name: string; price?: string; custom_price?: string; delivery_time?: number; custom_delivery_time?: number; error?: string; company?: { name?: string } };
  const lista: Resp[] = Array.isArray(j) ? j : [j];

  return lista
    .filter((o) => !o.error && (o.custom_price ?? o.price))
    .map((o) => ({
      id: o.id,
      nome: o.name,
      transportadora: o.company?.name ?? "",
      preco: Number(o.custom_price ?? o.price),
      prazoDias: Number(o.custom_delivery_time ?? o.delivery_time ?? 0),
    }))
    .filter((o) => Number.isFinite(o.preco) && o.preco > 0)
    .sort((a, b) => a.preco - b.preco);
}

/* Endereco pelo CEP (ViaCEP, publico e gratuito). Nao bloqueia: se falhar,
   a cliente preenche a mao. */
export async function buscarEndereco(cepDestino: string) {
  const cep = soDigitos(cepDestino);
  if (cep.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { next: { revalidate: 86400 } });
    const j = await r.json();
    if (!r.ok || j?.erro) return null;
    return { logradouro: j.logradouro ?? "", bairro: j.bairro ?? "", cidade: j.localidade ?? "", uf: j.uf ?? "" };
  } catch {
    return null;
  }
}
