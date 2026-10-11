import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { AgendaView, PERIODOS } from "@/components/admin/agenda-view";
import { raioX, type LinhaAgenda } from "@/lib/agenda";
import { PROFISSIONAIS, diaSP, semTabela } from "@/lib/salao";

export const dynamic = "force-dynamic";

const LOTE = 1000; // limite de linhas por consulta
const COLUNAS = "cliente_codigo, data, hora_inicio, hora_fim, status, categoria, servico, profissional";

/** AAAA-MM-DD deslocado em `dias`. Meio-dia em UTC: nao depende de fuso. */
function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default async function Agenda({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  await paginaAdmin();
  const sp = await searchParams;
  const dias = PERIODOS.find((p) => p.dias === Number(sp.dias))?.dias ?? 365;
  const db = createAdminClient();

  // o periodo termina no ultimo dia importado (e nao hoje): assim uma importacao
  // antiga nao deixa semanas vazias no fim, puxando as medias para baixo
  const ultimo = await db.from("salao_agendamentos").select("data").lte("data", diaSP()).order("data", { ascending: false }).limit(1);
  if (ultimo.error) return <Erro erro={ultimo.error} />;
  const ate = ultimo.data[0]?.data ?? null;
  if (!ate) return <AgendaView r={null} dias={dias} importadoAte={null} />;
  const de = somarDias(ate, -(dias - 1));

  const linhas: LinhaAgenda[] = [];
  for (let i = 0; i < 50; i++) {
    const { data, error } = await db.from("salao_agendamentos").select(COLUNAS).gte("data", de).lte("data", ate).order("id").range(i * LOTE, (i + 1) * LOTE - 1);
    if (error) {
      if (error.code === "PGRST103") break; // pagina alem do fim
      return <Erro erro={error} />;
    }
    linhas.push(...data);
    if (data.length < LOTE) break;
  }

  return <AgendaView r={raioX(linhas, de, ate, PROFISSIONAIS)} dias={dias} importadoAte={ate} />;
}

function Erro({ erro }: { erro: { code?: string; message: string } }) {
  return (
    <>
      <h1 className="font-serif text-3xl">Raio-x da agenda</h1>
      <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
        {semTabela(erro) ? <>Falta criar as tabelas: rode <code>supabase/migrations/20261012_salao_cadastros.sql</code> no SQL Editor do Supabase.</> : <>Não foi possível carregar: {erro.message}</>}
      </p>
    </>
  );
}
