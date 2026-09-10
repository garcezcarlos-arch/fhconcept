"use client";

import { useActionState, useState } from "react";
import { reais } from "@/lib/preco";
import { reservarVaga, type EstadoInscricao } from "./actions";

const campo = "mt-1 w-full border border-linha bg-white px-3 py-3 text-sm outline-none focus:border-carvao";
const rotulo = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-texto2";

type Props = { turmaId: string; formato: string; valor: number; precoCheio: number; sinal: number | null; restantes: number };

export default function InscricaoForm({ turmaId, formato, valor, precoCheio, sinal, restantes }: Props) {
  const [pagamento, setPagamento] = useState<"pix" | "cartao_credito">("pix");
  const [estado, acao, pendente] = useActionState<EstadoInscricao, FormData>(reservarVaga, {});

  return (
    <form action={acao} className="mt-10 md:grid md:grid-cols-[1fr_20rem] md:gap-12">
      <input type="hidden" name="turma_id" value={turmaId} />
      <input type="hidden" name="formato" value={formato} />

      <div className="space-y-8">
        <fieldset>
          <legend className="font-serif text-xl">Seus dados</legend>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2"><span className={rotulo}>Nome completo</span><input name="nome" required className={campo} autoComplete="name" /></label>
            <label><span className={rotulo}>WhatsApp</span><input name="telefone" required inputMode="tel" placeholder="(47) 9 9999-9999" className={campo} autoComplete="tel" /></label>
            <label><span className={rotulo}>E-mail</span><input name="email" type="email" className={campo} autoComplete="email" /></label>
            <label><span className={rotulo}>Cidade</span><input name="cidade" className={campo} autoComplete="address-level2" /></label>
            <label><span className={rotulo}>Tempo de profissão</span>
              <select name="experiencia" className={campo} defaultValue="">
                <option value="">selecione</option>
                <option>Começando agora</option>
                <option>Até 2 anos</option>
                <option>2 a 5 anos</option>
                <option>Mais de 5 anos</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-serif text-xl">Pagamento</legend>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className={`flex cursor-pointer gap-3 border p-4 ${pagamento === "pix" ? "border-carvao" : "border-linha"}`}>
              <input type="radio" name="pagamento" value="pix" checked={pagamento === "pix"} onChange={() => setPagamento("pix")} className="mt-1" />
              <span><b className="block text-sm font-medium">Pix</b><span className="text-sm text-texto2">Reserva confirmada na hora.</span></span>
            </label>
            <label className={`flex cursor-pointer gap-3 border p-4 ${pagamento === "cartao_credito" ? "border-carvao" : "border-linha"}`}>
              <input type="radio" name="pagamento" value="cartao_credito" checked={pagamento === "cartao_credito"} onChange={() => setPagamento("cartao_credito")} className="mt-1" />
              <span><b className="block text-sm font-medium">Cartão de crédito</b><span className="text-sm text-texto2">Parcelamento pelo Mercado Pago.</span></span>
            </label>
          </div>
        </fieldset>

        <label><span className={rotulo}>Alguma dúvida ou observação?</span><textarea name="observacoes" rows={3} className={campo} /></label>
      </div>

      <aside className="mt-10 border border-linha p-6 md:mt-0 md:self-start">
        {sinal != null && sinal < precoCheio ? (
          <>
            <div className="flex justify-between text-sm"><span className="text-texto2">Valor do curso</span><span>{reais(precoCheio)}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span className="text-texto2">Reserva agora</span><span>{reais(sinal)}</span></div>
            <p className="mt-2 text-xs text-texto2">O restante é combinado com a Fernanda antes da turma.</p>
          </>
        ) : (
          <div className="flex justify-between text-sm"><span className="text-texto2">Valor</span><span>{reais(valor)}</span></div>
        )}
        <div className="mt-4 flex justify-between border-t border-linha pt-4 font-serif text-xl"><span>A pagar</span><span>{reais(valor)}</span></div>
        <p className="mt-2 text-xs text-texto2">{restantes} {restantes === 1 ? "vaga restante" : "vagas restantes"}</p>

        {estado.erro && <p className="mt-4 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{estado.erro}</p>}

        <button type="submit" disabled={pendente} className="mt-6 flex min-h-13 w-full items-center justify-center bg-carvao text-sm text-creme hover:bg-nude-esc disabled:opacity-60">
          {pendente ? "Reservando…" : "Reservar minha vaga"}
        </button>
      </aside>
    </form>
  );
}
