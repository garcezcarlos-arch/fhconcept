import { createAdminClient } from "@/lib/supabase/admin";
import { paginaAdmin } from "@/lib/admin-auth";
import { rotuloDia } from "@/lib/salao";
import { Importador } from "./importador";

export const dynamic = "force-dynamic";

const inteiro = (n: number) => n.toLocaleString("pt-BR");

export default async function Importar() {
  await paginaAdmin();
  const db = createAdminClient();
  const conta = (tabela: "salao_clientes" | "salao_agendamentos" | "salao_comandas" | "salao_servicos" | "salao_produtos") => db.from(tabela).select("*", { count: "exact", head: true });
  const [clientes, agenda, comandas, servicos, produtos, primeira, ultima] = await Promise.all([
    conta("salao_clientes"), conta("salao_agendamentos"), conta("salao_comandas"), conta("salao_servicos"), conta("salao_produtos"),
    db.from("salao_agendamentos").select("data").order("data", { ascending: true }).limit(1),
    db.from("salao_agendamentos").select("data").order("data", { ascending: false }).limit(1),
  ]);

  const semTabelas = [clientes, agenda, comandas, servicos, produtos].some((r) => r.error);
  const periodo = primeira.data?.[0] && ultima.data?.[0] ? `, de ${rotuloDia(primeira.data[0].data)} a ${rotuloDia(ultima.data[0].data)}` : "";

  return (
    <>
      <h1 className="font-serif text-3xl">Importar do Gendo</h1>
      <p className="mt-2 max-w-2xl text-sm text-texto2">
        No Gendo, abra cada listagem e use o botão Salvar em CSV: Clientes › Listagem, Agenda › Listagem (situação Todos), Financeiro › Comandas, Serviços › Listagem e Produtos › Listagem. Depois escolha os arquivos aqui.
      </p>

      {semTabelas ? (
        <p className="mt-6 max-w-xl border border-linha bg-areia px-5 py-4 text-sm">
          Falta criar as tabelas: rode <code>supabase/migrations/20261012_salao_cadastros.sql</code> no SQL Editor do Supabase e recarregue esta página.
        </p>
      ) : (
        <>
          <Importador />

          <section className="mt-12 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">O que já está no portal</h2>
              <dl className="mt-3 text-sm">
                {[
                  ["Clientes", inteiro(clientes.count ?? 0)],
                  ["Agendamentos", `${inteiro(agenda.count ?? 0)}${periodo}`],
                  ["Comandas", inteiro(comandas.count ?? 0)],
                  ["Serviços", inteiro(servicos.count ?? 0)],
                  ["Produtos", inteiro(produtos.count ?? 0)],
                ].map(([nome, valor]) => (
                  <div key={nome} className="flex justify-between gap-6 border-b border-linha py-2.5">
                    <dt className="text-texto2">{nome}</dt>
                    <dd className="text-right tabular-nums">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h2 className="border-b border-carvao/20 pb-3 font-serif text-xl">Como a importação funciona</h2>
              <ul className="mt-3 space-y-3 text-sm text-texto2">
                <li>De cada cliente entram nome, telefone, aniversário, número de visitas e última visita. CPF, endereço, e-mail, comentários e observações não saem do arquivo.</li>
                <li>Importar de novo atualiza o que já existe, sem duplicar. Na agenda, o período do arquivo substitui o que havia nesse período, por isso exporte sempre com todas as profissionais e todas as situações.</li>
                <li>A listagem de clientes do Gendo exporta só as linhas carregadas na tela. Role até o fim da lista antes de salvar o CSV.</li>
                <li>Ao terminar, o portal refaz os números mês a mês. O mês corrente só entra depois de fechado.</li>
              </ul>
            </div>
          </section>
        </>
      )}
    </>
  );
}
