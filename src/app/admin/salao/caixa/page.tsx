import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { CaixaView } from "@/components/admin/caixa-view";
import { PERIODOS } from "@/components/admin/agenda-view";
import { resumoCaixa, type LinhaComanda } from "@/lib/caixa";
import { diaSP, semTabela } from "@/lib/salao";

export const dynamic = "force-dynamic";

const LOTE = 1000; // limite de linhas por consulta

function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default async function Caixa({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  await paginaAdmin();
  const sp = await searchParams;
  const dias = PERIODOS.find((p) => p.dias === Number(sp.dias))?.dias ?? 365;
  const db = createAdminClient();
  const hoje = diaSP();

  // todas as comandas: sao poucas centenas, e as em aberto contam fora do periodo
  const linhas: LinhaComanda[] = [];
  for (let i = 0; i < 50; i++) {
    const { data, error } = await db.from("salao_comandas").select("numero, data, valor, desconto, status, pagamento, servicos").order("numero").range(i * LOTE, (i + 1) * LOTE - 1);
    if (error) {
      if (error.code === "PGRST103") break; // pagina alem do fim
      return (
        <>
          <h1 className="font-serif text-3xl">Caixa e comandas</h1>
          <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
            {semTabela(error) ? <>Falta criar as tabelas: rode <code>supabase/migrations/20261012_salao_cadastros.sql</code> no SQL Editor do Supabase.</> : <>Não foi possível carregar: {error.message}</>}
          </p>
        </>
      );
    }
    linhas.push(...data);
    if (data.length < LOTE) break;
  }
  if (linhas.length === 0) return <CaixaView r={null} dias={dias} semComanda={null} />;

  // o periodo termina na ultima comanda importada (ate hoje), como no raio-x da agenda
  const ate = linhas.reduce((u, l) => (l.data <= hoje && l.data > u ? l.data : u), "0000-00-00");
  const fim = ate === "0000-00-00" ? hoje : ate;
  const r = resumoCaixa(linhas, somarDias(fim, -(dias - 1)), fim);

  // atendimentos na agenda depois da ultima comanda fechada: e o que ficou sem registro de caixa
  let semComanda: number | null = null;
  if (r.ultimaFechada) {
    const q = await db.from("salao_agendamentos").select("id", { count: "exact", head: true }).gt("data", r.ultimaFechada).lte("data", hoje).not("status", "in", '("Cancelado","Cliente Ausente")');
    semComanda = q.error ? null : (q.count ?? 0);
  }

  return <CaixaView r={r} dias={dias} semComanda={semComanda} />;
}
