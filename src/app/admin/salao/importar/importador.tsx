"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { lerArquivoGendo, NOME_TIPO, type ArquivoLido, type TipoArquivo } from "@/lib/gendo-csv";
import { importarAgenda, importarClientes, importarComandas, importarProdutos, importarServicos, recalcular, type Resposta } from "./actions";

type Item = { arquivo: string; lido: ArquivoLido } | { arquivo: string; lido: null; motivo: string };
type Passo = { texto: string; estado: "fazendo" | "ok" | "erro" };

const LOTE = 400;
const ORDEM: TipoArquivo[] = ["clientes", "agenda", "comandas", "servicos", "produtos"];
const brData = (d: string) => d.split("-").reverse().join("/");
const inteiro = (n: number) => n.toLocaleString("pt-BR");

function detalhe(l: ArquivoLido) {
  if (l.tipo === "agenda") return `${brData(l.de)} a ${brData(l.ate)}, com ${inteiro(l.clientes.length)} clientes diferentes`;
  if (l.tipo === "comandas") return `${inteiro(l.linhas.filter((c) => c.status === "Fechada").length)} fechadas e ${inteiro(l.linhas.filter((c) => c.status === "Aberta").length)} em aberto`;
  if (l.tipo === "clientes") return `${inteiro(l.linhas.filter((c) => c.telefone).length)} com telefone`;
  return "";
}

/** Envia em lotes e para no primeiro erro. */
async function emLotes<T>(linhas: T[], enviar: (lote: T[]) => Promise<Resposta>) {
  let gravados = 0;
  for (let i = 0; i < linhas.length; i += LOTE) {
    const r = await enviar(linhas.slice(i, i + LOTE));
    if (!r.ok) return r;
    gravados += r.gravados;
  }
  return { ok: true as const, gravados };
}

export function Importador() {
  const router = useRouter();
  const [itens, setItens] = useState<Item[]>([]);
  const [passos, setPassos] = useState<Passo[]>([]);
  const [fase, setFase] = useState<"escolher" | "enviando" | "feito" | "erro">("escolher");

  async function escolher(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    const novos: Item[] = [];
    for (const f of Array.from(arquivos)) {
      if (f.size > 20 * 1024 * 1024) { novos.push({ arquivo: f.name, lido: null, motivo: "arquivo maior que 20 MB" }); continue; }
      try {
        const lido = lerArquivoGendo(new Uint8Array(await f.arrayBuffer()));
        if (!lido) novos.push({ arquivo: f.name, lido: null, motivo: "não parece uma exportação do Gendo" });
        else if (!lido.linhas.length) novos.push({ arquivo: f.name, lido: null, motivo: "sem nenhuma linha de dados" });
        else novos.push({ arquivo: f.name, lido });
      } catch {
        novos.push({ arquivo: f.name, lido: null, motivo: "não foi possível ler o arquivo" });
      }
    }
    // um arquivo por tipo: se vierem dois do mesmo tipo, fica o que tem mais linhas
    const porTipo = new Map<TipoArquivo, Item & { lido: ArquivoLido }>();
    const recusados: Item[] = [];
    for (const it of novos) {
      if (!it.lido) { recusados.push(it); continue; }
      const atual = porTipo.get(it.lido.tipo);
      if (!atual) porTipo.set(it.lido.tipo, it as Item & { lido: ArquivoLido });
      else if (it.lido.linhas.length > atual.lido.linhas.length) { recusados.push({ arquivo: atual.arquivo, lido: null, motivo: `repetido: outro arquivo de ${NOME_TIPO[it.lido.tipo].toLowerCase()} tem mais linhas` }); porTipo.set(it.lido.tipo, it as Item & { lido: ArquivoLido }); }
      else recusados.push({ arquivo: it.arquivo, lido: null, motivo: `repetido: outro arquivo de ${NOME_TIPO[it.lido.tipo].toLowerCase()} já foi escolhido` });
    }
    setItens([...ORDEM.flatMap((t) => (porTipo.has(t) ? [porTipo.get(t)!] : [])), ...recusados]);
    setPassos([]);
    setFase("escolher");
  }

  const prontos = itens.flatMap((i) => (i.lido ? [i.lido] : []));

  async function importar() {
    setFase("enviando");
    const feitos: Passo[] = [];
    const anotar = (texto: string, estado: Passo["estado"]) => {
      if (feitos.at(-1)?.estado === "fazendo") feitos.pop();
      feitos.push({ texto, estado });
      setPassos([...feitos]);
    };
    const falhou = (oQue: string, erro: string) => { anotar(`${oQue}: ${erro}`, "erro"); setFase("erro"); };

    for (const l of prontos) {
      const nome = NOME_TIPO[l.tipo];
      anotar(`Enviando ${nome.toLowerCase()}`, "fazendo");
      let r: Resposta;
      if (l.tipo === "clientes") r = await emLotes(l.linhas, (lote) => importarClientes(lote, "clientes"));
      else if (l.tipo === "comandas") r = await emLotes(l.linhas, importarComandas);
      else if (l.tipo === "servicos") r = await emLotes(l.linhas, importarServicos);
      else if (l.tipo === "produtos") r = await emLotes(l.linhas, importarProdutos);
      else {
        if (JSON.stringify(l.linhas).length > 900_000) return falhou(nome, "o período é grande demais para um envio só. Exporte a agenda em períodos menores, por exemplo um ano por arquivo.");
        r = await importarAgenda(l.de, l.ate, l.linhas);
        if (r.ok) {
          anotar(`${nome}: ${inteiro(r.gravados)} agendamentos de ${brData(l.de)} a ${brData(l.ate)}`, "ok");
          anotar("Cadastrando clientes que só aparecem na agenda", "fazendo");
          const novas = await emLotes(l.clientes, (lote) => importarClientes(lote, "agenda"));
          if (!novas.ok) return falhou("Clientes da agenda", novas.erro);
          anotar(`Clientes da agenda: ${inteiro(l.clientes.length)} conferidas`, "ok");
          continue;
        }
      }
      if (!r.ok) return falhou(nome, r.erro);
      anotar(`${nome}: ${inteiro(r.gravados)} registros`, "ok");
    }

    anotar("Recalculando os números do salão", "fazendo");
    const fim = await recalcular();
    if (!fim.ok) return falhou("Recálculo", fim.erro);
    anotar(`Números refeitos: ${inteiro(fim.meses)} meses e ${inteiro(fim.clientes)} clientes no portal${fim.retrato ? ", com o retrato da base atualizado" : ""}`, "ok");
    setFase("feito");
    router.refresh();
  }

  return (
    <div className="mt-8">
      <label className="block border border-dashed border-carvao/30 bg-branco px-5 py-8 text-center text-sm hover:border-carvao">
        <span className="block text-carvao">Escolher os arquivos CSV exportados do Gendo</span>
        <span className="mt-1 block text-texto2">Pode escolher os cinco de uma vez. Eles são lidos neste computador.</span>
        <input type="file" accept=".csv,text/csv" multiple disabled={fase === "enviando"} onChange={(e) => { void escolher(e.target.files); e.target.value = ""; }} className="mt-4 text-sm file:mr-3 file:min-h-10 file:border-0 file:bg-carvao file:px-4 file:text-sm file:text-creme" />
      </label>

      {itens.length > 0 && (
        <div className="mt-6 overflow-x-auto border border-linha bg-branco">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-linha text-left text-texto2">
              <tr><th className="px-4 py-2.5 font-normal">Arquivo</th><th className="px-3 py-2.5 font-normal">Conteúdo</th><th className="px-3 py-2.5 text-right font-normal">Registros</th><th className="px-4 py-2.5 font-normal">Detalhe</th></tr>
            </thead>
            <tbody>
              {itens.map((it) => (
                <tr key={it.arquivo} className="border-b border-linha/60 last:border-b-0">
                  <td className="px-4 py-2.5">{it.arquivo}</td>
                  {it.lido ? (
                    <>
                      <td className="px-3 py-2.5">{NOME_TIPO[it.lido.tipo]}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{inteiro(it.lido.linhas.length)}</td>
                      <td className="px-4 py-2.5 text-texto2">{detalhe(it.lido)}{it.lido.ignoradas > 0 && ` (${it.lido.ignoradas === 1 ? "1 linha incompleta fica" : `${inteiro(it.lido.ignoradas)} linhas incompletas ficam`} de fora)`}</td>
                    </>
                  ) : (
                    <td colSpan={3} className="px-3 py-2.5 text-texto2">Não entra: {it.motivo}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {prontos.length > 0 && fase !== "feito" && (
        <button type="button" onClick={() => void importar()} disabled={fase === "enviando"} className="mt-5 min-h-11 bg-carvao px-6 text-sm text-creme hover:bg-nude-esc disabled:opacity-50">
          {fase === "enviando" ? "Importando" : fase === "erro" ? "Tentar de novo" : `Importar ${prontos.length === 1 ? "1 arquivo" : `${prontos.length} arquivos`}`}
        </button>
      )}

      {passos.length > 0 && (
        <ul aria-live="polite" className="mt-6 border border-linha bg-branco text-sm">
          {passos.map((p) => (
            <li key={p.texto} className="flex gap-3 border-b border-linha/60 px-4 py-2.5 last:border-b-0">
              <span className="w-14 shrink-0 text-texto2">{p.estado === "ok" ? "Feito" : p.estado === "erro" ? "Erro" : "Agora"}</span>
              <span className={p.estado === "erro" ? "text-red-700" : ""}>{p.texto}</span>
            </li>
          ))}
        </ul>
      )}

      {fase === "feito" && (
        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/admin/salao/clientes" className="border-b border-nude text-nude-esc">Ver clientes</Link>
          <Link href="/admin/salao" className="border-b border-nude text-nude-esc">Ver indicadores</Link>
          <Link href="/admin" className="border-b border-nude text-nude-esc">Voltar ao Painel</Link>
        </p>
      )}
    </div>
  );
}
