import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { RetornoView, type AbaRetorno, type LinhaRetorno } from "@/components/admin/retorno-view";
import { LISTAS, listaDe, type ConfigLista } from "@/lib/retorno";
import { diaSP, rotuloMes, semTabela } from "@/lib/salao";
import { alternarNaoChamar, marcarResultado, salvarMensagem } from "./actions";

export const dynamic = "force-dynamic";

const POR_PAGINA = 50;
const diasAtras = (dias: number) => new Date(Date.now() - dias * 864e5).toISOString();
const COLUNAS = "gendo_codigo, nome, telefone, visitas, ultima_visita, nasc_dia, contato_id, ultimo_contato, ultimo_resultado";

export default async function Contato({ searchParams }: { searchParams: Promise<{ lista?: string; aba?: string; p?: string; aviso?: string }> }) {
  await paginaAdmin();
  const sp = await searchParams;
  const lista = listaDe(sp.lista);
  const aba: AbaRetorno = sp.aba === "chamadas" || sp.aba === "nao" ? sp.aba : "";
  const pagina = Math.max(1, Math.floor(Number(sp.p)) || 1);
  const ha30dias = diasAtras(30);
  const db = createAdminClient();

  // "a chamar" = com telefone, sem "nao chamar" e sem contato dentro da janela da lista.
  // Na de aniversariantes a propria view so traz contato deste ano, entao basta nao ter contato.
  const corte = (l: ConfigLista) => (l.janelaDias === null ? null : diasAtras(l.janelaDias));
  const aChamar = (l: ConfigLista) => {
    const q = db.from(l.view).select("*", { count: "exact", head: true }).eq("nao_contatar", false).not("telefone", "is", null);
    const c = corte(l);
    return c ? q.or(`ultimo_contato.is.null,ultimo_contato.lt.${c}`) : q.is("ultimo_contato", null);
  };
  // os numeros de mensagens vem do registro, nao da lista: quem voltou ao salao sai da lista e continua contando
  const contatos = () => db.from("salao_contatos").select("id", { count: "exact", head: true }).eq("motivo", lista.id).gte("feito_em", ha30dias);

  const c = corte(lista);
  let q = db.from(lista.view).select(COLUNAS, { count: "exact" });
  if (aba === "") {
    q = q.eq("nao_contatar", false).not("telefone", "is", null);
    q = c ? q.or(`ultimo_contato.is.null,ultimo_contato.lt.${c}`) : q.is("ultimo_contato", null);
    if (lista.id === "retorno") q = q.order("visitas", { ascending: false });
    else if (lista.id === "uma_visita") q = q.order("ultima_visita", { ascending: false });
    else q = q.order("nasc_dia");
  } else if (aba === "chamadas") {
    q = q.eq("nao_contatar", false);
    q = (c ? q.gte("ultimo_contato", c) : q.not("ultimo_contato", "is", null)).order("ultimo_contato", { ascending: false });
  } else {
    q = q.eq("nao_contatar", true);
  }
  q = q.order("nome").range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

  const [linhas, nChamadas, nAgendaram, nSemTelefone, config, ...porLista] = await Promise.all([
    q,
    contatos(),
    contatos().eq("resultado", "agendou"),
    db.from(lista.view).select("*", { count: "exact", head: true }).eq("nao_contatar", false).is("telefone", null),
    db.from("salao_config").select("valor").eq("chave", lista.chave).maybeSingle(),
    ...LISTAS.map((l) => aChamar(l)),
  ]);

  const erro = (linhas.error && linhas.error.code !== "PGRST103" ? linhas.error : null) ?? config.error;
  if (erro) {
    // 42703 = coluna que a migration nova acrescenta; PGRST205/42P01 = view que ela cria
    const faltaBanco = semTabela(erro) || erro.code === "42703";
    return (
      <>
        <h1 className="font-serif text-3xl">Contato com clientes</h1>
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          {faltaBanco ? <>Falta atualizar o banco: rode <code>supabase/migrations/20261014_salao_listas.sql</code> no SQL Editor do Supabase e recarregue esta página.</> : <>Não foi possível carregar: {erro.message}</>}
        </p>
      </>
    );
  }

  const dados: LinhaRetorno[] = (linhas.data ?? []).flatMap((l) =>
    l.gendo_codigo == null ? [] : [{ codigo: l.gendo_codigo, nome: l.nome ?? "", telefone: l.telefone, visitas: l.visitas ?? 0, ultimaVisita: l.ultima_visita, nascDia: l.nasc_dia, contatoId: l.contato_id, ultimoContato: l.ultimo_contato, ultimoResultado: l.ultimo_resultado }],
  );
  const total = linhas.count ?? dados.length;
  const hoje = diaSP();
  const totais = porLista.map((r) => (r.error ? null : (r.count ?? 0)));

  return (
    <RetornoView
      lista={lista}
      totais={totais}
      mes={rotuloMes(`${hoje.slice(0, 7)}-01`, true).split(" ")[0]}
      aba={aba}
      linhas={dados}
      total={total}
      pagina={pagina}
      paginas={Math.max(1, Math.ceil(total / POR_PAGINA))}
      contagem={{ aChamar: totais[LISTAS.indexOf(lista)] ?? 0, chamadas: nChamadas.count ?? 0, agendaram: nAgendaram.count ?? 0, semTelefone: nSemTelefone.count ?? 0 }}
      mensagem={config.data?.valor || lista.padrao}
      hoje={hoje}
      aviso={sp.aviso}
      acoes={{ marcarResultado, alternarNaoChamar, salvarMensagem }}
    />
  );
}
