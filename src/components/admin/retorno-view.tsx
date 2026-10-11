import Link from "next/link";
import { Indicador } from "@/components/admin/graficos";
import { ChamarWhatsapp } from "@/app/admin/salao/retorno/chamar";
import { MAX_MENSAGEM, RESULTADOS, haQuanto, linkWhatsappCliente, montarMensagem } from "@/lib/retorno";
import { rotuloDia } from "@/lib/salao";

export type LinhaRetorno = { codigo: number; nome: string; telefone: string | null; visitas: number; ultimaVisita: string | null; contatoId: number | null; ultimoContato: string | null; ultimoResultado: string | null };
export type AbaRetorno = "" | "chamadas" | "nao";

type Acao = (dados: FormData) => Promise<void>;

const inteiro = (n: number) => n.toLocaleString("pt-BR");
const ABAS: { id: AbaRetorno; nome: string }[] = [
  { id: "", nome: "A chamar" },
  { id: "chamadas", nome: "Chamadas nos últimos 30 dias" },
  { id: "nao", nome: "Não chamar" },
];

export function RetornoView({ aba, linhas, total, pagina, paginas, contagem, mensagem, hoje, aviso, acoes }: {
  aba: AbaRetorno;
  linhas: LinhaRetorno[];
  total: number;
  pagina: number;
  paginas: number;
  contagem: { aChamar: number; chamadas: number; agendaram: number; semTelefone: number };
  mensagem: string;
  hoje: string;
  aviso?: string;
  acoes: { marcarResultado: Acao; alternarNaoChamar: Acao; salvarMensagem: Acao };
}) {
  const link = (a: AbaRetorno, p = 1) => {
    const u = new URLSearchParams();
    if (a) u.set("aba", a);
    if (p > 1) u.set("p", String(p));
    const s = u.toString();
    return `/admin/salao/retorno${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <h1 className="font-serif text-3xl">Retorno de clientes</h1>
      <p className="mt-2 max-w-2xl text-sm text-texto2">
        Clientes com 5 ou mais visitas que não vêm há mais de 60 dias, das mais fiéis para as menos. O botão abre a conversa no WhatsApp com a mensagem pronta; quem envia é você. A cliente que voltar sai da lista na importação seguinte.
      </p>

      {aviso && <p className="mt-6 border border-linha bg-areia px-4 py-3 text-sm">{aviso}</p>}

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Indicador rotulo="A chamar" valor={inteiro(contagem.aChamar)} nota={contagem.semTelefone > 0 ? `${inteiro(contagem.semTelefone)} sem telefone ficam de fora` : undefined} />
        <Indicador rotulo="Chamadas em 30 dias" valor={inteiro(contagem.chamadas)} />
        <Indicador rotulo="Agendaram em 30 dias" valor={inteiro(contagem.agendaram)} nota={contagem.chamadas > 0 ? `${Math.round((contagem.agendaram / contagem.chamadas) * 100)}% das chamadas` : undefined} />
      </div>

      <details className="mt-3 border border-linha bg-branco">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm [&::-webkit-details-marker]:hidden">
          <span>Mensagem que vai pronta para o WhatsApp</span>
          <span className="shrink-0 whitespace-nowrap border-b border-nude text-nude-esc">Ver e editar</span>
        </summary>
        <div className="border-t border-linha px-5 py-5 md:grid md:grid-cols-2 md:gap-8">
          <form action={acoes.salvarMensagem}>
            <input type="hidden" name="aba" value={aba} />
            <label htmlFor="mensagem" className="text-sm">Texto</label>
            <textarea id="mensagem" name="mensagem" defaultValue={mensagem} maxLength={MAX_MENSAGEM} rows={6} className="mt-1 w-full border border-linha bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-nude" />
            <p className="mt-1 text-xs text-texto2">Escreva {"{nome}"} onde entra o primeiro nome da cliente. Até {MAX_MENSAGEM} caracteres.</p>
            <button className="mt-3 min-h-10 bg-carvao px-5 text-sm text-creme hover:bg-nude-esc">Salvar mensagem</button>
          </form>
          <div className="mt-6 md:mt-0">
            <p className="text-sm">Como chega para uma cliente chamada Mariana</p>
            <p className="mt-1 whitespace-pre-line border border-linha bg-creme px-4 py-3 text-sm leading-relaxed">{montarMensagem(mensagem, "Mariana")}</p>
          </div>
        </div>
      </details>

      <nav aria-label="Listas" className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-b border-linha text-sm">
        {ABAS.map((a) => (
          <Link key={a.id} href={link(a.id)} aria-current={a.id === aba ? "true" : undefined} className={`-mb-px flex min-h-11 items-center border-b-2 ${a.id === aba ? "border-nude text-carvao" : "border-transparent text-texto2 hover:text-carvao"}`}>
            {a.nome}
          </Link>
        ))}
      </nav>

      {linhas.length === 0 ? (
        <p className="mt-8 text-sm text-texto2">
          {aba === "" ? "Ninguém para chamar agora." : aba === "chamadas" ? "Nenhuma cliente chamada nos últimos 30 dias." : "Nenhuma cliente marcada para não receber mensagens."}
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-texto2">{inteiro(total)} {total === 1 ? "cliente" : "clientes"}</p>
          <ul className="mt-3 border border-linha bg-branco">
            {linhas.map((l) => (
              <li key={l.codigo} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-linha/60 px-4 py-3 last:border-b-0 md:px-5">
                <div className="min-w-0">
                  <p className="truncate">{l.nome}</p>
                  <p className="mt-0.5 text-xs text-texto2">
                    {inteiro(l.visitas)} visitas, a última {l.ultimaVisita ? `em ${rotuloDia(l.ultimaVisita)} (${haQuanto(l.ultimaVisita, hoje)})` : "sem data"}
                    {l.ultimoContato && <>. Chamada {haQuanto(l.ultimoContato, hoje)}{l.ultimoResultado && l.ultimoResultado !== "chamada" ? `: ${RESULTADOS[l.ultimoResultado]?.toLowerCase() ?? l.ultimoResultado}` : ""}</>}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {aba === "chamadas" && l.contatoId && (
                    <form action={acoes.marcarResultado} className="flex items-center gap-2">
                      <input type="hidden" name="aba" value={aba} />
                      <input type="hidden" name="contato" value={l.contatoId} />
                      <label className="sr-only" htmlFor={`r${l.codigo}`}>Resultado da chamada de {l.nome}</label>
                      <select id={`r${l.codigo}`} name="resultado" defaultValue={l.ultimoResultado ?? "chamada"} className="min-h-10 border border-linha bg-white px-2 text-sm">
                        {Object.entries(RESULTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button className="min-h-10 border border-carvao px-3 text-sm">Salvar</button>
                    </form>
                  )}

                  {aba !== "nao" && l.telefone && (
                    <ChamarWhatsapp codigo={l.codigo} href={linkWhatsappCliente(l.telefone, montarMensagem(mensagem, l.nome))} rotulo={aba === "chamadas" ? "Chamar de novo" : "Abrir WhatsApp"} discreto={aba === "chamadas"} />
                  )}

                  <form action={acoes.alternarNaoChamar}>
                    <input type="hidden" name="aba" value={aba} />
                    <input type="hidden" name="cliente" value={l.codigo} />
                    <input type="hidden" name="valor" value={aba === "nao" ? "false" : "true"} />
                    <button className="min-h-10 text-xs text-texto2 underline-offset-4 hover:text-carvao hover:underline">{aba === "nao" ? "Voltar para a lista" : "Não chamar mais"}</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {paginas > 1 && (
        <nav aria-label="Páginas" className="mt-5 flex items-center gap-5 text-sm">
          {pagina > 1 ? <Link href={link(aba, pagina - 1)} className="inline-flex min-h-10 items-center border-b border-nude text-nude-esc">Anterior</Link> : <span className="text-texto2/60">Anterior</span>}
          <span className="text-texto2">Página {pagina} de {paginas}</span>
          {pagina < paginas ? <Link href={link(aba, pagina + 1)} className="inline-flex min-h-10 items-center border-b border-nude text-nude-esc">Próxima</Link> : <span className="text-texto2/60">Próxima</span>}
        </nav>
      )}
    </>
  );
}
