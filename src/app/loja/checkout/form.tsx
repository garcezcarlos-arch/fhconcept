"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCarrinho } from "@/lib/carrinho";
import { reais } from "@/lib/preco";
import { finalizarPedido, type EstadoCheckout } from "./actions";

const campo = "mt-1 w-full border border-linha bg-white px-3 py-3 text-sm outline-none focus:border-carvao";
const rotulo = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-texto2";

export default function CheckoutForm() {
  const { itens, total, pronto } = useCarrinho();
  const [entrega, setEntrega] = useState<"retirada_salao" | "correios">("retirada_salao");
  const [pagamento, setPagamento] = useState<"pix" | "cartao_credito">("pix");
  const [estado, acao, pendente] = useActionState<EstadoCheckout, FormData>(finalizarPedido, {});

  if (!pronto) return null;
  if (itens.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-texto2">Seu carrinho está vazio.</p>
        <Link href="/loja" className="mt-5 inline-flex min-h-13 items-center bg-carvao px-7 text-sm text-creme">Ver produtos</Link>
      </div>
    );
  }

  return (
    <form action={acao} className="mt-10 md:grid md:grid-cols-[1fr_20rem] md:gap-12">
      <input type="hidden" name="itens" value={JSON.stringify(itens.map((x) => ({ variant_id: x.variant_id, quantidade: x.quantidade })))} />

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
              <span><b className="block text-sm font-medium">Receber em casa</b><span className="text-sm text-texto2">Correios. O frete é calculado pelo CEP e confirmado no WhatsApp.</span></span>
            </label>
          </div>

          {entrega === "correios" && (
            <div className="mt-4 grid gap-4 md:grid-cols-6">
              <label className="md:col-span-2"><span className={rotulo}>CEP</span><input name="cep" required={entrega === "correios"} inputMode="numeric" placeholder="00000-000" className={campo} autoComplete="postal-code" /></label>
              <label className="md:col-span-4"><span className={rotulo}>Rua</span><input name="logradouro" required={entrega === "correios"} className={campo} autoComplete="address-line1" /></label>
              <label className="md:col-span-1"><span className={rotulo}>Número</span><input name="numero" required={entrega === "correios"} className={campo} /></label>
              <label className="md:col-span-2"><span className={rotulo}>Complemento</span><input name="complemento" className={campo} /></label>
              <label className="md:col-span-3"><span className={rotulo}>Bairro</span><input name="bairro" required={entrega === "correios"} className={campo} /></label>
              <label className="md:col-span-4"><span className={rotulo}>Cidade</span><input name="cidade" required={entrega === "correios"} className={campo} autoComplete="address-level2" /></label>
              <label className="md:col-span-2"><span className={rotulo}>UF</span><input name="uf" required={entrega === "correios"} maxLength={2} placeholder="SC" className={campo} autoComplete="address-level1" /></label>
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
        <div className="mt-4 flex justify-between border-t border-linha pt-4 font-serif text-xl"><span>Total</span><span>{reais(total)}</span></div>
        {entrega === "correios" && <p className="mt-2 text-xs text-texto2">+ frete, confirmado no WhatsApp antes do envio</p>}

        {estado.erro && <p className="mt-4 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{estado.erro}</p>}

        <button type="submit" disabled={pendente} className="mt-6 flex min-h-13 w-full items-center justify-center bg-carvao text-sm text-creme hover:bg-nude-esc disabled:opacity-60">
          {pendente ? "Registrando pedido…" : "Confirmar pedido"}
        </button>
        <p className="mt-3 text-center text-xs text-texto2">Você será direcionada para o pagamento em seguida.</p>
      </aside>
    </form>
  );
}
