import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { AgendaDiaView, type HorarioDia } from "@/components/admin/agenda-dia-view";
import { PROFISSIONAIS, diaSP, semTabela } from "@/lib/salao";

export const dynamic = "force-dynamic";

function somar(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
const hhmm = (h: string | null) => (h ? h.slice(0, 5) : null);
const minutos = (h: string | null) => (h ? Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5)) : null);
const FORA = ["Cancelado", "Cliente Ausente"];

export default async function AgendaDia({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  await paginaAdmin();
  const sp = await searchParams;
  const hoje = diaSP();
  const dia = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) && !Number.isNaN(Date.parse(`${sp.d}T12:00:00Z`)) ? sp.d : hoje;
  const segunda = somar(dia, -((new Date(`${dia}T12:00:00Z`).getUTCDay() + 6) % 7));
  const domingo = somar(segunda, 6);
  const db = createAdminClient();

  const [semana, algum, proximo, config] = await Promise.all([
    db.from("salao_agendamentos").select("id, cliente_codigo, data, hora_inicio, hora_fim, status, servico, profissional").gte("data", segunda).lte("data", domingo).order("hora_inicio").limit(1000),
    db.from("salao_agendamentos").select("id", { count: "exact", head: true }),
    db.from("salao_agendamentos").select("data").gt("data", dia).not("status", "in", '("Cancelado","Cliente Ausente")').order("data").limit(1),
    db.from("salao_config").select("valor").eq("chave", "agenda_importada_em").maybeSingle(),
  ]);

  if (semana.error) {
    return (
      <>
        <h1 className="font-serif text-3xl">Agenda</h1>
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          {semTabela(semana.error) ? <>Falta criar as tabelas: rode <code>supabase/migrations/20261012_salao_cadastros.sql</code> no SQL Editor do Supabase.</> : <>Não foi possível carregar: {semana.error.message}</>}
        </p>
      </>
    );
  }

  const doDia = semana.data.filter((l) => l.data === dia);
  const codigos = [...new Set(doDia.map((l) => l.cliente_codigo).filter((c): c is number => c != null))];
  const clientes = codigos.length ? await db.from("salao_clientes").select("gendo_codigo, nome, telefone").in("gendo_codigo", codigos) : { data: [] };
  const porCodigo = new Map((clientes.data ?? []).map((c) => [c.gendo_codigo, c]));

  // uma coluna por profissional: as da equipe na ordem fixa, depois as demais por nome
  const grupos = new Map<string, HorarioDia[]>();
  for (const l of doDia) {
    const nome = (l.profissional ?? "").trim().split(/\s+/)[0] || "Sem profissional";
    const c = l.cliente_codigo != null ? porCodigo.get(l.cliente_codigo) : undefined;
    const ini = minutos(l.hora_inicio);
    const fim = minutos(l.hora_fim);
    const h: HorarioDia = { id: l.id, inicio: hhmm(l.hora_inicio), fim: hhmm(l.hora_fim), minutos: ini != null && fim != null && fim > ini ? fim - ini : null, status: l.status, servico: l.servico ?? "", cliente: c?.nome ?? null, telefone: c?.telefone ?? null };
    grupos.set(nome, [...(grupos.get(nome) ?? []), h]);
  }
  const ordem = [...PROFISSIONAIS.filter((p) => grupos.has(p)), ...[...grupos.keys()].filter((n) => !PROFISSIONAIS.includes(n as never)).sort()];

  return (
    <AgendaDiaView
      dia={dia}
      hoje={hoje}
      amanha={somar(hoje, 1)}
      semana={Array.from({ length: 7 }, (_, i) => {
        const data = somar(segunda, i);
        return { data, marcados: semana.data.filter((l) => l.data === data && !FORA.includes(l.status)).length };
      })}
      colunas={ordem.map((nome) => ({ nome, horarios: grupos.get(nome)! }))}
      atualizada={config.data?.valor ?? null}
      proximo={proximo.data?.[0]?.data ?? null}
      vazia={(algum.count ?? 0) === 0}
    />
  );
}
