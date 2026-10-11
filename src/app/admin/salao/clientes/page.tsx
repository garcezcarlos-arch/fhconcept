import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { diaSP, rotuloDia, telefoneBr , semTabela } from "@/lib/salao";

export const dynamic = "force-dynamic";

const POR_PAGINA = 50;
const inteiro = (n: number) => n.toLocaleString("pt-BR");

const FILTROS = [
  { id: "", nome: "Todas" },
  { id: "sumidas", nome: "Sumidas", nota: "5 ou mais visitas e mais de 60 dias sem vir" },
  { id: "ausentes", nome: "Mais de 90 dias", nota: "última visita há mais de 90 dias" },
  { id: "aniversario", nome: "Aniversariantes do mês" },
  { id: "semvisita", nome: "Sem visita", nota: "nenhuma visita registrada" },
] as const;

export default async function Clientes({ searchParams }: { searchParams: Promise<{ q?: string; f?: string; p?: string }> }) {
  await paginaAdmin();
  const sp = await searchParams;
  const busca = (sp.q ?? "").trim().slice(0, 60);
  const filtro = FILTROS.find((x) => x.id === sp.f) ?? FILTROS[0];
  const pagina = Math.max(1, Math.floor(Number(sp.p)) || 1);

  const db = createAdminClient();
  let q = db.from("salao_clientes").select("gendo_codigo, nome, telefone, nasc_dia, nasc_mes, visitas, ultima_visita", { count: "exact" });

  if (busca) {
    const digitos = busca.replace(/\D/g, "");
    // % _ , ( ) e \ tem significado no filtro; viram espaco
    q = digitos.length >= 4 ? q.ilike("telefone", `%${digitos}%`) : q.ilike("nome", `%${busca.replace(/[%_,()\\]/g, " ").trim()}%`);
  }
  if (filtro.id === "sumidas") q = q.gte("visitas", 5).lt("ultima_visita", diaSP(-60)).order("visitas", { ascending: false });
  else if (filtro.id === "ausentes") q = q.lt("ultima_visita", diaSP(-90)).order("ultima_visita", { ascending: false });
  else if (filtro.id === "aniversario") q = q.eq("nasc_mes", Number(diaSP().slice(5, 7))).order("nasc_dia");
  else if (filtro.id === "semvisita") q = q.is("ultima_visita", null);
  q = q.order("nome").range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

  const { data: clientes, count, error } = await q;

  const link = (mudar: { f?: string; p?: number }) => {
    const u = new URLSearchParams();
    if (busca) u.set("q", busca);
    const f = mudar.f ?? filtro.id;
    if (f) u.set("f", f);
    if (mudar.p && mudar.p > 1) u.set("p", String(mudar.p));
    const s = u.toString();
    return `/admin/salao/clientes${s ? `?${s}` : ""}`;
  };

  if (error && error.code !== "PGRST103") {
    return (
      <>
        <h1 className="font-serif text-3xl">Clientes</h1>
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          {semTabela(error) ? <>Falta criar as tabelas: rode <code>supabase/migrations/20261012_salao_cadastros.sql</code> no SQL Editor do Supabase.</> : <>Não foi possível carregar: {error.message}</>}
        </p>
      </>
    );
  }

  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-serif text-3xl">Clientes</h1>
          <p className="mt-2 text-sm text-texto2">Cadastro importado do Gendo. Para atualizar, importe os arquivos de novo.</p>
        </div>
        <Link href="/admin/salao/importar" className="inline-flex min-h-11 items-center border border-linha bg-branco px-5 text-sm hover:border-carvao">Importar do Gendo</Link>
      </div>

      <form action="/admin/salao/clientes" className="mt-7 flex max-w-xl gap-2">
        {filtro.id && <input type="hidden" name="f" value={filtro.id} />}
        <label className="sr-only" htmlFor="q">Buscar por nome ou telefone</label>
        <input id="q" name="q" defaultValue={busca} placeholder="Buscar por nome ou telefone" className="min-h-11 w-full border border-linha bg-white px-3 text-sm outline-none focus:border-nude" />
        <button className="min-h-11 shrink-0 bg-carvao px-5 text-sm text-creme hover:bg-nude-esc">Buscar</button>
      </form>

      <nav aria-label="Filtros" className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-b border-linha text-sm">
        {FILTROS.map((f) => (
          <Link key={f.id} href={link({ f: f.id, p: 1 })} aria-current={f.id === filtro.id ? "true" : undefined} className={`-mb-px flex min-h-11 items-center border-b-2 ${f.id === filtro.id ? "border-nude text-carvao" : "border-transparent text-texto2 hover:text-carvao"}`}>
            {f.nome}
          </Link>
        ))}
      </nav>

      <p className="mt-4 text-sm text-texto2">
        {inteiro(total)} {total === 1 ? "cliente" : "clientes"}
        {"nota" in filtro && <> com {filtro.nota}</>}
        {busca && <> para “{busca}”</>}
      </p>

      {!clientes?.length ? (
        <p className="mt-8 text-sm text-texto2">{total === 0 && !busca && !filtro.id ? "Nenhuma cliente no portal ainda. Importe os arquivos do Gendo para começar." : "Nenhuma cliente nesse recorte."}</p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-linha bg-branco">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-linha text-left text-texto2">
              <tr>
                <th className="px-4 py-2.5 font-normal">Nome</th>
                <th className="px-3 py-2.5 font-normal">Telefone</th>
                <th className="px-3 py-2.5 font-normal">Aniversário</th>
                <th className="px-3 py-2.5 text-right font-normal">Visitas</th>
                <th className="px-4 py-2.5 text-right font-normal">Última visita</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.gendo_codigo} className="border-b border-linha/60 last:border-b-0">
                  <td className="px-4 py-2.5">{c.nome}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {c.telefone ? <a href={`https://wa.me/${c.telefone}`} target="_blank" rel="noopener" className="text-nude-esc hover:underline">{telefoneBr(c.telefone)}</a> : <span className="text-texto2">sem telefone</span>}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-texto2">{c.nasc_dia && c.nasc_mes ? `${String(c.nasc_dia).padStart(2, "0")}/${String(c.nasc_mes).padStart(2, "0")}` : ""}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{inteiro(c.visitas)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-texto2">{c.ultima_visita ? rotuloDia(c.ultima_visita) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paginas > 1 && (
        <nav aria-label="Páginas" className="mt-5 flex items-center gap-5 text-sm">
          {pagina > 1 ? <Link href={link({ p: pagina - 1 })} className="inline-flex min-h-10 items-center border-b border-nude text-nude-esc">Anterior</Link> : <span className="text-texto2/60">Anterior</span>}
          <span className="text-texto2">Página {pagina} de {paginas}</span>
          {pagina < paginas ? <Link href={link({ p: pagina + 1 })} className="inline-flex min-h-10 items-center border-b border-nude text-nude-esc">Próxima</Link> : <span className="text-texto2/60">Próxima</span>}
        </nav>
      )}
    </>
  );
}
