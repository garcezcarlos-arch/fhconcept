"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useCarrinho } from "@/lib/carrinho";
import { reais } from "@/lib/preco";
import { cotarFreteCheckout, finalizarPedido, type EstadoCheckout, type ResultadoCotacao } from "./actions";

const campo = "mt-1 w-full border border-linha bg-white px-3 py-3 text-sm outline-none focus:border-carvao";
const rotulo = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-texto2";

export default function CheckoutForm() {
  const { itens, total, pronto } = useCarrinho();
  const [entrega, setEntrega] = useState<"retirada_salao" | "correios">("retirada_salao");
  const [pagamento, setPagamento] = useState<"pix" | "cartao_credito">("pix");
  const [estado, acao, pendente] = useActionState<EstadoCheckout, FormData>(finalizarPedido, {});
  const [cotacao, setCotacao] = useState<ResultadoCotacao | null>(null);
  const [cepCotado, setCepCotado] = useState("");
  const [servico, setServico] = useState<number | null>(null);
  const [cotando, iniciarCotacao] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  const itensJson = JSON.stringify(itens.map((x) => ({ variant_id: x.variant_id, quantidade: x.quantidade })));
  // carrinho mudou depois da cotacao? a cotacao deixa de valer
  const chaveCotacao = `${cepCotado}|${itensJson}`;
  const [chaveValida, setChaveValida] = useState("");
  const cotacaoValida = cotacao && chaveValida === chaveCotacao ? cotacao : null;

  function cotar(cepDigitado: string) {
    const cep = cepDigitado.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepCotado(cep);
    iniciarCotacao(async () => {
      const r = await cotarFreteCheckout(cep, itensJson);
      setCotacao(r);
      setChaveValida(`${cep}|${itensJson}`);
      setServico(r.opcoes[0]?.id ?? null);
      // preenche o endereco so nos campos vazios
      const f = form.current;
      if (r.endereco && f) {
        for (const k of ["logradouro", "bairro", "cidade", "uf"] as const) {
          const campo = f.elements.namedItem(k) as HTMLInputElement | null;
          if (campo && !campo.value && r.endereco[k]) campo.value = r.endereco[k];
        }
      }
    });
  }

  const opcaoEscolhida = cotacaoValida?.opcoes.find((o) => o.id === servico) ?? null;
  const frete = entrega === "correios" && opcaoEscolhida ? opcaoEscolhida.preco : 0;
  const freteManual = entrega === "correios" && cotacaoValida?.modo === "manual";
  const faltaFrete = entrega === "correios" && !freteManual && !opcaoEscolhida;

  if (!pronto) return null;
  if (itens.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-texto2">Seu carrinho está vazio.</p>
        <Link href="/loja" className="mt-5 inline-flex min-h-13 items-center rounded-full bg-terracota px-7 text-sm text-creme hover:bg-terracota-esc">Ver produtos</Link>
      </div>
    );
  }

  return (
    <form ref={form} action={acao} className="mt-10 md:grid md:grid-cols-[1fr_20rem] md:gap-12">
      <input type="hidden" name="itens" value={itensJson} />
      {opcaoEscolhida && entrega === "correios" && <input type="hidden" name="servico_frete" value={opcaoEscolhida.id} />}

      <div className="space-y-10">
        <fieldset>
          <legend className="font-serif text-xl">Seus dados</legend>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2"><span className={rotulo}>Nome completo</span><input name="nome" required className={campo} autoComplete="name" /></label>
            <label><span className={rotulo}>WhatsApp</span><input name="telefone" required inputMode="tel" placeholder="(47) 9 9999-9999" className={campo} autoComplete="tel" /></label>
            <label><span className={rotulo}>E-mail</span><input name="email" type="email" className={campo} autoComplete="email" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-serif text-xl">Entrega</legend>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className={`flex cursor-pointer gap-3 border p-4 ${entrega === "retirada_salao" ? "border-carvao" : "border-linha"}`}>
              <input type="radio" name="entrega" value="retirada_salao" checked={entrega === "retirada_salao"} onChange={() => setEntrega("retirada_salao")} className="mt-1" />
              <span><b className="block text-sm font-medium">Retirar no salão</b><span className="text-sm text-texto2">Rua Rui Barbosa, 679 — Centro, Garuva. Sem custo.</span></span>
            </label>
            <label className={`flex cursor-pointer gap-3 border p-4 ${entrega === "correios" ? "border-carvao" : "border-linha"}`}>
              <input type="radio" name="entrega" value="correios" checked={entrega === "correios"} onChange={() => setEntrega("correios")} className="mt-1" />
              <span><b className="block text-sm font-medium">Receber em casa</b><span className="text-sm text-texto2">Correios. Informe o CEP para ver prazo e valor.</span></span>
            </label>
          </div>

          {entrega === "correios" && (
            <div className="mt-4 grid gap-4 md:grid-cols-6">
              <label className="md:col-span-2"><span className={rotulo}>CEP</span><input name="cep" required={entrega === "correios"} inputMode="numeric" placeholder="00000-000" className={campo} autoComplete="postal-code"
                onChange={(e) => { if (e.target.value.replace(/\D/g, "").length === 8) cotar(e.target.value); }}
                onBlur={(e) => cotar(e.target.value)} /></label>
              <label className="md:col-span-4"><span className={rotulo}>Rua</span><input name="logradouro" required={entrega === "correios"} className={campo} autoComplete="address-line1" /></label>
              <label className="md:col-span-1"><span className={rotulo}>Número</span><input name="numero" required={entrega === "correios"} className={campo} /></label>
              <label className="md:col-span-2"><span className={rotulo}>Complemento</span><input name="complemento" className={campo} /></label>
              <label className="md:col-span-3"><span className={rotulo}>Bairro</span><input name="bairro" required={entrega === "correios"} className={campo} /></label>
              <label className="md:col-span-4"><span className={rotulo}>Cidade</span><input name="cidade" required={entrega === "correios"} className={campo} autoComplete="address-level2" /></label>
              <label className="md:col-span-2"><span className={rotulo}>UF</span><input name="uf" required={entrega === "correios"} maxLength={2} placeholder="SC" className={campo} autoComplete="address-level1" /></label>
            </div>
          )}

          {entrega === "correios" && (
            <div className="mt-5" aria-live="polite">
              {cotando && <p className="text-sm text-texto2">Calculando frete…</p>}
              {!cotando && !cotacaoValida && <p className="text-sm text-texto2">Digite o CEP para calcular o frete.</p>}
              {!cotando && cotacaoValida?.erro && <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{cotacaoValida.erro}</p>}
              {!cotando && freteManual && <p className="text-sm text-texto2">O valor do frete é confirmado pelo WhatsApp antes do envio.</p>}
              {!cotando && cotacaoValida && cotacaoValida.opcoes.length > 0 && (
                <div className="grid gap-2">
                  {cotacaoValida.opcoes.map((o) => (
                    <label key={o.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 ${servico === o.id ? "border-terracota bg-rose" : "border-linha"}`}>
                      <input type="radio" name="opcao_frete_ui" checked={servico === o.id} onChange={() => setServico(o.id)} />
                      <span className="flex-1 text-sm"><b className="font-medium">{o.nome}</b>{o.transportadora && <span className="text-texto2"> · {o.transportadora}</span>}<span className="block text-texto2">até {o.prazoDias} {o.prazoDias === 1 ? "dia útil" : "dias úteis"}</span></span>
                      <span className="text-sm font-semibold text-terracota">{reais(o.preco)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="font-serif text-xl">Pagamento</legend>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className={`flex cursor-pointer gap-3 border p-4 ${pagamento === "pix" ? "border-carvao" : "border-linha"}`}>
              <input type="radio" name="pagamento" value="pix" checked={pagamento === "pix"} onChange={() => setPagamento("pix")} className="mt-1" />
              <span><b className="block text-sm font-medium">Pix</b><span className="text-sm text-texto2">Aprovação na hora.</span></span>
            </label>
            <label className={`flex cursor-pointer gap-3 border p-4 ${pagamento === "cartao_credito" ? "border-carvao" : "border-linha"}`}>
              <input type="radio" name="pagamento" value="cartao_credito" checked={pagamento === "cartao_credito"} onChange={() => setPagamento("cartao_credito")} className="mt-1" />
              <span><b className="block text-sm font-medium">Cartão de crédito</b><span className="text-sm text-texto2">Parcelamento pelo Mercado Pago.</span></span>
            </label>
          </div>
        </fieldset>

        <label><span className={rotulo}>Observações</span><textarea name="observacoes" rows={3} className={campo} placeholder="Algum recado para o salão?" /></label>
      </div>

      <aside className="mt-10 border border-linha p-6 md:mt-0 md:self-start">
        <ul className="divide-y divide-linha text-sm">
          {itens.map((x) => (
            <li key={x.variant_id} className="flex justify-between gap-4 py-2">
              <span className="text-texto2">{x.quantidade}× {x.produto}{x.variante ? ` · ${x.variante}` : ""}</span>
              <span className="shrink-0">{reais(x.preco * x.quantidade)}</span>
            </li>
          ))}
        </ul>
        {entrega === "correios" && (
          <div className="mt-4 flex justify-between border-t border-linha pt-4 text-sm">
            <span className="text-texto2">Frete{opcaoEscolhida ? ` · ${opcaoEscolhida.nome}` : ""}</span>
            <span>{opcaoEscolhida ? reais(frete) : freteManual ? "a confirmar" : "—"}</span>
          </div>
        )}
        <div className="mt-4 flex justify-between border-t border-linha pt-4 font-serif text-xl"><span>Total</span><span>{reais(total + frete)}</span></div>
        {freteManual && <p className="mt-2 text-xs text-texto2">+ frete, confirmado no WhatsApp antes do envio</p>}

        {estado.erro && <p className="mt-4 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{estado.erro}</p>}

        <button type="submit" disabled={pendente || cotando || faltaFrete} className="mt-6 flex min-h-13 w-full items-center justify-center rounded-full bg-terracota text-sm text-creme hover:bg-terracota-esc disabled:opacity-60">
          {pendente ? "Registrando pedido…" : faltaFrete ? "Calcule o frete" : "Confirmar pedido"}
        </button>
        <p className="mt-3 text-center text-xs text-texto2">Você será direcionada para o pagamento em seguida.</p>
      </aside>
    </form>
  );
}
