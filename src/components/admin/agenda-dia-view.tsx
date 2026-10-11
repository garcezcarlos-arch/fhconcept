import Link from "next/link";
import { DIAS, DIAS_LONGOS } from "@/lib/agenda";
import { linkWhatsappCliente, primeiroNome } from "@/lib/retorno";
import { GENDO, duracaoBr, rotuloDia } from "@/lib/salao";

export type HorarioDia = {
  id: number;
  inicio: string | null; // HH:MM
  fim: string | null;
  minutos: number | null;
  status: string;
  servico: string;
  cliente: string | null;
  telefone: string | null;
};
export type DiaDaSemana = { data: string; marcados: number };

const FORA = new Set(["Cancelado", "Cliente Ausente"]);
const ROTULO: Record<string, string> = {
  "Novo Agendamento": "A confirmar",
  Confirmado: "Confirmado",
  "Cliente Chegou": "Chegou",
  "Fechado e Faturado": "Atendido",
  Cancelado: "Cancelado",
  "Cliente Ausente": "Faltou",
};

const diaDaSemana = (data: string) => (new Date(`${data}T12:00:00Z`).getUTCDay() + 6) % 7;
const horaCurta = (h: string) => (h.endsWith(":00") ? `${Number(h.slice(0, 2))}h` : `${Number(h.slice(0, 2))}h${h.slice(3, 5)}`);

/** Texto pronto para confirmar o horario; quem envia e a pessoa, no WhatsApp. */
function mensagemConfirmar(nome: string | null, data: string, inicio: string, hoje: string, amanha: string) {
  const quando = data === hoje ? "hoje" : data === amanha ? "amanhã" : `${DIAS_LONGOS[diaDaSemana(data)]}, dia ${data.slice(8, 10)}/${data.slice(5, 7)}`;
  const p = primeiroNome(nome);
  return `Oi${p ? `, ${p}` : ""}! Aqui é da FH Concept. Passando para confirmar o seu horário de ${quando}, às ${horaCurta(inicio)}. Posso confirmar?`;
}

export function AgendaDiaView({ dia, hoje, amanha, semana, colunas, atualizada, proximo, vazia }: {
  dia: string;
  hoje: string;
  amanha: string;
  semana: DiaDaSemana[];
  /** uma coluna por profissional, na ordem da equipe */
  colunas: { nome: string; horarios: HorarioDia[] }[];
  /** quando a agenda foi importada pela ultima vez (ISO), se o portal souber */
  atualizada: string | null;
  /** proximo dia com horario marcado, quando o dia aberto esta vazio */
  proximo: string | null;
  /** nenhuma agenda importada ainda */
  vazia: boolean;
}) {
  const link = (d: string) => (d === hoje ? "/admin/salao/dia" : `/admin/salao/dia?d=${d}`);
  const somar = (d: string, n: number) => {
    const x = new Date(`${d}T12:00:00Z`);
    x.setUTCDate(x.getUTCDate() + n);
    return x.toISOString().slice(0, 10);
  };
  const todos = colunas.flatMap((c) => c.horarios);
  const validos = todos.filter((h) => !FORA.has(h.status));
  const minutos = validos.reduce((s, h) => s + (h.minutos ?? 0), 0);
  const quando = atualizada ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(atualizada)) : null;
  const titulo = `${DIAS_LONGOS[diaDaSemana(dia)]}, ${rotuloDia(dia)}${dia === hoje ? " (hoje)" : dia === amanha ? " (amanhã)" : ""}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-serif text-3xl">Agenda</h1>
          <p className="mt-2 max-w-xl text-sm text-texto2">
            Cópia de leitura da agenda do Gendo. Para marcar, remarcar ou cancelar, use o Gendo.
            {quando && <> Atualizada em {quando.replace(",", " às")}.</>}
          </p>
        </div>
        <a href={GENDO.agenda} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center bg-carvao px-5 text-sm text-creme hover:bg-nude-esc">Abrir agenda no Gendo</a>
      </div>

      {vazia ? (
        <p className="mt-8 max-w-xl text-sm text-texto2">
          A agenda ainda não foi importada.{" "}
          <Link href="/admin/salao/importar" className="border-b border-nude text-nude-esc">Importar do Gendo</Link>
        </p>
      ) : (
        <>
          {/* a semana: cada dia e um botao, com quantos horarios tem */}
          <nav aria-label="Semana" className="mt-7 flex items-stretch gap-2">
            <Link href={link(somar(semana[0].data, -7))} aria-label="Semana anterior" className="flex w-10 shrink-0 items-center justify-center border border-linha bg-branco text-texto2 hover:border-carvao hover:text-carvao">‹</Link>
            <div className="grid min-w-0 flex-1 grid-cols-7 gap-1 sm:gap-2">
              {semana.map((d) => {
                const atual = d.data === dia;
                return (
                  <Link key={d.data} href={link(d.data)} aria-current={atual ? "date" : undefined} className={`flex min-h-16 flex-col items-center justify-center border px-1 py-2 text-center transition-colors ${atual ? "border-carvao bg-branco" : "border-linha bg-branco/60 hover:border-carvao/40"}`}>
                    <span className={`text-xs ${atual ? "text-carvao" : "text-texto2"}`}>{DIAS[diaDaSemana(d.data)]}</span>
                    <span className="text-lg font-semibold leading-tight tracking-tight text-carvao">{Number(d.data.slice(8, 10))}</span>
                    <span className="text-[11px] tabular-nums text-texto2">{d.marcados > 0 ? d.marcados : "–"}</span>
                    {d.data === hoje && <span className="sr-only">hoje</span>}
                  </Link>
                );
              })}
            </div>
            <Link href={link(somar(semana[0].data, 7))} aria-label="Semana seguinte" className="flex w-10 shrink-0 items-center justify-center border border-linha bg-branco text-texto2 hover:border-carvao hover:text-carvao">›</Link>
          </nav>
          <p className="mt-2 text-xs text-texto2">O número abaixo do dia é a quantidade de horários marcados.{dia !== hoje && <> <Link href="/admin/salao/dia" className="border-b border-nude text-nude-esc">Voltar para hoje</Link></>}</p>

          <section className="mt-9">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-carvao/20 pb-3">
              <h2 className="font-serif text-xl first-letter:uppercase">{titulo}</h2>
              {validos.length > 0 && <p className="text-sm text-texto2">{validos.length} {validos.length === 1 ? "horário" : "horários"}{minutos > 0 && <>, {duracaoBr(minutos)} de agenda</>}</p>}
            </div>

            {todos.length === 0 ? (
              <p className="mt-6 text-sm text-texto2">
                Nenhum horário marcado neste dia.
                {proximo && <> O próximo dia com horário é <Link href={link(proximo)} className="border-b border-nude text-nude-esc">{DIAS_LONGOS[diaDaSemana(proximo)]}, {rotuloDia(proximo)}</Link>.</>}
              </p>
            ) : (
              <div className={`mt-5 grid grid-cols-1 gap-4 ${colunas.length >= 3 ? "lg:grid-cols-3" : colunas.length === 2 ? "lg:grid-cols-2" : ""}`}>
                {colunas.map((c) => (
                  <div key={c.nome} className="min-w-0">
                    <h3 className="font-sans text-sm text-texto2">{c.nome} · {c.horarios.filter((h) => !FORA.has(h.status)).length}</h3>
                    <ul className="mt-2 space-y-2">
                      {c.horarios.map((h) => {
                        const fora = FORA.has(h.status);
                        const confirmar = !fora && h.inicio && h.telefone && dia >= hoje && h.status !== "Fechado e Faturado";
                        return (
                          <li key={h.id} className={`border border-linha bg-branco px-4 py-3 ${fora ? "opacity-60" : ""}`}>
                            <div className="flex items-baseline justify-between gap-3">
                              <p className={`tabular-nums text-carvao ${fora ? "line-through" : ""}`}>{h.inicio ?? "sem hora"}{h.fim ? `–${h.fim}` : ""}</p>
                              <p className="shrink-0 text-xs text-texto2">{ROTULO[h.status] ?? h.status}</p>
                            </div>
                            <p className="mt-1 truncate">{h.cliente ?? "Cliente sem cadastro no portal"}</p>
                            {h.servico && <p className="mt-0.5 text-sm leading-snug text-texto2">{h.servico}</p>}
                            {confirmar && (
                              <a href={linkWhatsappCliente(h.telefone!, mensagemConfirmar(h.cliente, dia, h.inicio!, hoje, amanha))} target="_blank" rel="noopener" className="mt-2 inline-flex min-h-10 items-center border-b border-nude text-sm text-nude-esc">
                                Confirmar pelo WhatsApp
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
