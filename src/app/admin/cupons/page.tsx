import { createAdminClient } from "@/lib/supabase/admin";
import { reais } from "@/lib/preco";
import { criarCupom, alternarCupom } from "./actions";

export const dynamic = "force-dynamic";

const campo = "mt-1 min-h-11 w-full border border-linha bg-white px-3 text-sm outline-none focus:border-carvao";
const rotulo = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-carvao/60";

function descreve(tipo: string, valor: number) {
  const t = tipo.toLowerCase();
  if (["percentual", "percent", "%", "porcentagem", "pct"].includes(t)) return `${valor}% nos produtos`;
  if (["frete_gratis", "frete", "frete gratis", "frete_gratuito"].includes(t)) return "frete grátis";
  return `${reais(valor)} nos produtos`;
}

function situacao(c: { ativo: boolean; inicio: string | null; fim: string | null; usos: number; usos_max: number | null }) {
  const agora = Date.now();
  if (!c.ativo) return { texto: "Pausado", cor: "text-carvao/50" };
  if (c.fim && new Date(c.fim).getTime() < agora) return { texto: "Expirado", cor: "text-carvao/50" };
  if (c.usos_max !== null && c.usos >= c.usos_max) return { texto: "Esgotado", cor: "text-carvao/50" };
  if (c.inicio && new Date(c.inicio).getTime() > agora) return { texto: "Agendado", cor: "text-nude" };
  return { texto: "Valendo", cor: "text-terracota" };
}

const data = (s: string | null) => (s ? new Date(s).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : null);

export default async function Cupons({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { aviso } = await searchParams;
  const db = createAdminClient();
  const { data: cupons, error } = await db
    .from("coupons")
    .select("id, codigo, tipo, valor, minimo_pedido, usos, usos_max, ativo, inicio, fim")
    .order("ativo", { ascending: false })
    .order("codigo");

  if (error) return <p className="text-sm text-red-700">Erro: {error.message}</p>;

  return (
    <>
      <h1 className="font-serif text-2xl">Cupons</h1>
      <p className="mt-1 text-sm text-carvao/60">O uso só conta quando o pedido é pago. Cupom pausado para de valer na hora.</p>

      {aviso && <p className="mt-6 border border-linha bg-areia px-4 py-3 text-sm">{aviso}</p>}

      <form action={criarCupom} className="mt-8 grid gap-4 border border-linha p-5 md:grid-cols-6">
        <p className="font-serif text-lg md:col-span-6">Novo cupom</p>
        <label className="md:col-span-2"><span className={rotulo}>Código</span>
          <input name="codigo" required placeholder="BEMVINDA10" className={`${campo} uppercase`} autoComplete="off" /></label>
        <label className="md:col-span-2"><span className={rotulo}>Tipo</span>
          <select name="tipo" className={campo} defaultValue="percentual">
            <option value="percentual">% de desconto nos produtos</option>
            <option value="valor">R$ de desconto nos produtos</option>
            <option value="frete_gratis">Frete grátis</option>
          </select></label>
        <label className="md:col-span-2"><span className={rotulo}>Valor (% ou R$)</span>
          <input name="valor" inputMode="decimal" placeholder="10" className={campo} /></label>
        <label className="md:col-span-2"><span className={rotulo}>Pedido mínimo (R$)</span>
          <input name="minimo_pedido" inputMode="decimal" placeholder="0" className={campo} /></label>
        <label className="md:col-span-2"><span className={rotulo}>Limite de usos</span>
          <input name="usos_max" inputMode="numeric" placeholder="sem limite" className={campo} /></label>
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <label><span className={rotulo}>Começa em</span><input name="inicio" type="date" className={campo} /></label>
          <label><span className={rotulo}>Termina em</span><input name="fim" type="date" className={campo} /></label>
        </div>
        <div className="md:col-span-6">
          <button className="min-h-11 bg-carvao px-6 text-sm text-creme">Criar cupom</button>
        </div>
      </form>

      {!cupons?.length ? (
        <p className="mt-10 text-sm text-carvao/60">Nenhum cupom ainda.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-carvao text-left text-[11px] uppercase tracking-[0.14em] text-carvao/60">
                <th className="py-2 pr-4 font-semibold">Código</th>
                <th className="py-2 pr-4 font-semibold">Desconto</th>
                <th className="py-2 pr-4 font-semibold">Regras</th>
                <th className="py-2 pr-4 font-semibold">Usos</th>
                <th className="py-2 pr-4 font-semibold">Situação</th>
                <th className="py-2 font-semibold"><span className="sr-only">Ação</span></th>
              </tr>
            </thead>
            <tbody>
              {cupons.map((c) => {
                const s = situacao(c);
                const regras = [
                  c.minimo_pedido > 0 ? `mínimo ${reais(c.minimo_pedido)}` : null,
                  c.inicio ? `de ${data(c.inicio)}` : null,
                  c.fim ? `até ${data(c.fim)}` : null,
                ].filter(Boolean).join(" · ");
                return (
                  <tr key={c.id} className="border-b border-linha">
                    <td className="py-3 pr-4 font-medium">{c.codigo}</td>
                    <td className="py-3 pr-4">{descreve(c.tipo, c.valor)}</td>
                    <td className="py-3 pr-4 text-carvao/60">{regras || "—"}</td>
                    <td className="py-3 pr-4">{c.usos}{c.usos_max !== null ? ` / ${c.usos_max}` : ""}</td>
                    <td className={`py-3 pr-4 ${s.cor}`}>{s.texto}</td>
                    <td className="py-3 text-right">
                      <form action={alternarCupom}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="ativo" value={String(c.ativo)} />
                        <button className="min-h-10 border border-carvao px-3 text-xs">{c.ativo ? "Pausar" : "Reativar"}</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
