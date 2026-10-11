import { createAdminClient } from "@/lib/supabase/admin";
import { perfilAtual } from "@/lib/admin-auth";
import { PainelView, type DadosPainel, type Pendencia } from "@/components/admin/painel-view";
import { mesAtual, mesDeLinha, mesesEntre, retratoDeLinha, rotuloDia } from "@/lib/salao";

export const dynamic = "force-dynamic";

const PAGOS = ["pago", "em_separacao", "enviado", "pronto_retirada", "concluido"] as const;
const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios);
const diasAtras = (dias: number) => new Date(Date.now() - dias * 864e5).toISOString();

export default async function Painel() {
  const perfil = await perfilAtual();
  const admin = perfil?.papel === "admin";
  const db = createAdminClient();
  const ha30dias = diasAtras(30);

  const [aguardando, aSeparar, pagos, produtos, variantes, turmas, espera, inscricoes, mensal, retratos] = await Promise.all([
    db.from("orders").select("id", { count: "exact", head: true }).eq("status", "aguardando_pagamento"),
    db.from("orders").select("id", { count: "exact", head: true }).eq("status", "pago"),
    db.from("orders").select("total").in("status", [...PAGOS]).gte("created_at", ha30dias),
    db.from("products").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    db.from("product_variants").select("id, ativo, products(status), inventory(quantidade, minimo)"),
    db.from("turmas_vagas").select("vagas, restantes, status").in("status", ["aberta", "esgotada"]),
    db.from("inscricoes").select("id", { count: "exact", head: true }).eq("status", "lista_espera"),
    db.from("inscricoes").select("id", { count: "exact", head: true }).eq("status", "aguardando_pagamento"),
    admin ? db.from("salao_mensal").select("*").order("mes", { ascending: false }).limit(12) : null,
    admin ? db.from("salao_retrato").select("*").order("data", { ascending: false }).limit(1) : null,
  ]);

  const estoqueBaixo = (variantes.data ?? []).filter((v) => {
    const inv = v.inventory?.[0];
    return v.ativo && v.products?.status === "ativo" && (inv?.quantidade ?? 0) <= (inv?.minimo ?? 0);
  }).length;

  const pendencias: Pendencia[] = [];
  const somar = (quantidade: number | null | undefined, texto: [string, string], href: string, acao: string) => {
    if (quantidade && quantidade > 0) pendencias.push({ quantidade, texto: plural(quantidade, ...texto), href, acao });
  };
  somar(aSeparar.count, ["pedido pago para separar", "pedidos pagos para separar"], "/admin/pedidos?s=pago", "Abrir pedidos");
  somar(aguardando.count, ["pedido aguardando pagamento", "pedidos aguardando pagamento"], "/admin/pedidos?s=aguardando_pagamento", "Abrir pedidos");
  somar(estoqueBaixo, ["variação publicada no estoque mínimo ou abaixo", "variações publicadas no estoque mínimo ou abaixo"], "/admin/estoque", "Abrir estoque");
  somar(inscricoes.count, ["inscrição aguardando pagamento", "inscrições aguardando pagamento"], "/admin/turmas", "Abrir turmas");
  somar(espera.count, ["pessoa na lista de espera das formações", "pessoas na lista de espera das formações"], "/admin/turmas/espera", "Abrir lista");

  let salao: DadosPainel["salao"] = null;
  if (admin) {
    if (!mensal || mensal.error) {
      salao = "sem-tabela";
    } else {
      const meses = mensal.data.map(mesDeLinha).reverse();
      const retrato = retratos?.data?.[0] ? retratoDeLinha(retratos.data[0]) : null;
      salao = { meses, retrato };

      // meses seguidos, do mais recente para tras, com agenda e nenhuma comanda fechada
      let semComanda = 0;
      for (const m of [...meses].reverse()) {
        if (m.agendamentos > 0 && m.comandasFechadas === 0) semComanda++;
        else break;
      }
      somar(semComanda, ["mês com agenda e nenhuma comanda fechada no Gendo", "meses seguidos com agenda e nenhuma comanda fechada no Gendo"], "/admin/salao", "Ver indicadores");
      if (retrato) somar(retrato.comandasAbertas, [`comanda em aberto no Gendo em ${rotuloDia(retrato.data)}`, `comandas em aberto no Gendo em ${rotuloDia(retrato.data)}`], "/admin/salao", "Ver indicadores");

      // o ultimo mes fechado e o anterior ao corrente; acima disso falta lancar
      const ultimo = meses.at(-1);
      if (ultimo) somar(mesesEntre(ultimo.mes.slice(0, 7), mesAtual()) - 1, ["mês fechado sem lançar no painel do salão", "meses fechados sem lançar no painel do salão"], "/admin/salao", "Lançar");
    }
  }

  const totais = (pagos.data ?? []).map((p) => Number(p.total));
  const abertas = turmas.data ?? [];

  const dados: DadosPainel = {
    hoje: new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" }),
    pendencias,
    salao,
    loja: { pedidosPagos: totais.length, faturamento: totais.reduce((s, t) => s + t, 0), produtosAtivos: produtos.count ?? 0 },
    formacoes: {
      turmasAbertas: abertas.filter((t) => t.status === "aberta").length,
      vagasOcupadas: abertas.reduce((s, t) => s + ((t.vagas ?? 0) - (t.restantes ?? 0)), 0),
      vagasTotal: abertas.reduce((s, t) => s + (t.vagas ?? 0), 0),
      listaEspera: espera.count ?? 0,
    },
  };

  return <PainelView dados={dados} />;
}
