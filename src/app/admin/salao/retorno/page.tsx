import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { RetornoView, type AbaRetorno, type LinhaRetorno } from "@/components/admin/retorno-view";
import { CHAVE_MENSAGEM, MENSAGEM_PADRAO } from "@/lib/retorno";
import { diaSP, semTabela } from "@/lib/salao";
import { alternarNaoChamar, marcarResultado, salvarMensagem } from "./actions";

export const dynamic = "force-dynamic";

const POR_PAGINA = 50;
const ha30dias = () => new Date(Date.now() - 30 * 864e5).toISOString();

export default async function Retorno({ searchParams }: { searchParams: Promise<{ aba?: string; p?: string; aviso?: string }> }) {
  await paginaAdmin();
  const sp = await searchParams;
  const aba: AbaRetorno = sp.aba === "chamadas" || sp.aba === "nao" ? sp.aba : "";
  const pagina = Math.max(1, Math.floor(Number(sp.p)) || 1);
  const corte = ha30dias();
  const db = createAdminClient();

  // a chamar: com telefone, sem "nao chamar" e sem contato nos ultimos 30 dias
  const base = () => db.from("salao_retorno").select("*", { count: "exact", head: true });
  // os numeros de chamadas vem do registro, nao da lista: quem voltou ao salao sai da lista e continua contando
  const contatos = () => db.from("salao_contatos").select("id", { count: "exact", head: true }).eq("motivo", "retorno");
  const aChamar = () => base().eq("nao_contatar", false).not("telefone", "is", null).or(`ultimo_contato.is.null,ultimo_contato.lt.${corte}`);

  let lista = db.from("salao_retorno").select("gendo_codigo, nome, telefone, visitas, ultima_visita, contato_id, ultimo_contato, ultimo_resultado", { count: "exact" });
  if (aba === "") lista = lista.eq("nao_contatar", false).not("telefone", "is", null).or(`ultimo_contato.is.null,ultimo_contato.lt.${corte}`).order("visitas", { ascending: false });
  else if (aba === "chamadas") lista = lista.eq("nao_contatar", false).gte("ultimo_contato", corte).order("ultimo_contato", { ascending: false });
  else lista = lista.eq("nao_contatar", true);
  lista = lista.order("nome").range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

  const [linhas, nAChamar, nChamadas, nAgendaram, nSemTelefone, config] = await Promise.all([
    lista,
    aChamar(),
    contatos().gte("feito_em", corte),
    contatos().gte("feito_em", corte).eq("resultado", "agendou"),
    base().eq("nao_contatar", false).is("telefone", null),
    db.from("salao_config").select("valor").eq("chave", CHAVE_MENSAGEM).maybeSingle(),
  ]);

  const erro = (linhas.error && linhas.error.code !== "PGRST103" ? linhas.error : null) ?? nAChamar.error ?? config.error;
  if (erro) {
    return (
      <>
        <h1 className="font-serif text-3xl">Retorno de clientes</h1>
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          {semTabela(erro) ? <>Falta criar as tabelas: rode <code>supabase/migrations/20261013_salao_retorno.sql</code> no SQL Editor do Supabase.</> : <>Não foi possível carregar: {erro.message}</>}
        </p>
      </>
    );
  }

  const dados: LinhaRetorno[] = (linhas.data ?? []).flatMap((l) =>
    l.gendo_codigo == null ? [] : [{ codigo: l.gendo_codigo, nome: l.nome ?? "", telefone: l.telefone, visitas: l.visitas ?? 0, ultimaVisita: l.ultima_visita, contatoId: l.contato_id, ultimoContato: l.ultimo_contato, ultimoResultado: l.ultimo_resultado }],
  );
  const total = linhas.count ?? dados.length;

  return (
    <RetornoView
      aba={aba}
      linhas={dados}
      total={total}
      pagina={pagina}
      paginas={Math.max(1, Math.ceil(total / POR_PAGINA))}
      contagem={{ aChamar: nAChamar.count ?? 0, chamadas: nChamadas.count ?? 0, agendaram: nAgendaram.count ?? 0, semTelefone: nSemTelefone.count ?? 0 }}
      mensagem={config.data?.valor || MENSAGEM_PADRAO}
      hoje={diaSP()}
      aviso={sp.aviso}
      acoes={{ marcarResultado, alternarNaoChamar, salvarMensagem }}
    />
  );
}
