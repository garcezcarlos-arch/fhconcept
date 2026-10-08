import { PaginaLegal, Secao } from "@/components/pagina-legal";
import { LEGAL, preencher } from "@/lib/legal";

export const metadata = {
  title: "Política de privacidade",
  description: "Quais dados a FH Concept coleta no site e na loja, para quê, com quem compartilha e como você exerce seus direitos pela LGPD.",
  alternates: { canonical: "/privacidade" },
  robots: LEGAL.revisado ? undefined : { index: false },
};

export default function Privacidade() {
  return (
    <PaginaLegal atual="/privacidade" titulo="Política de privacidade"
      resumo="Pedimos só os dados necessários para vender, entregar e atender bem. Não vendemos seus dados e não usamos ferramentas de rastreamento de publicidade no site.">

      <Secao titulo="Quem cuida dos seus dados">
        <p>O controlador dos dados é {preencher(LEGAL.razaoSocial)} ({LEGAL.nomeFantasia}), CNPJ {LEGAL.cnpj}, {LEGAL.endereco}. A pessoa responsável pelo tratamento de dados (encarregada) é {preencher(LEGAL.encarregado)}, no e-mail {preencher(LEGAL.email)}.</p>
      </Secao>

      <Secao titulo="O que coletamos e para quê">
        <ul>
          <li><b>Na compra:</b> nome, WhatsApp, e-mail (opcional) e, para envio, endereço. Usamos para registrar o pedido, receber o pagamento, entregar, emitir nota fiscal e falar com você sobre a compra. Base legal: execução do contrato e cumprimento de obrigação legal (LGPD, art. 7º, II e V).</li>
          <li><b>Na inscrição em formações:</b> nome, WhatsApp, e-mail, cidade e tempo de profissão. Usamos para reservar a vaga, organizar a turma e falar com você sobre o curso.</li>
          <li><b>No diagnóstico capilar da loja:</b> as respostas servem só para sugerir produtos na hora e não são guardadas.</li>
          <li><b>No carrinho:</b> os itens ficam guardados no seu próprio navegador até você finalizar ou limpar. Não usamos cookies de publicidade nem de rastreamento.</li>
        </ul>
        <p>Não coletamos dados de cartão: o pagamento é feito no ambiente do Mercado Pago, e o número do cartão nunca passa pelo nosso site.</p>
      </Secao>

      <Secao titulo="Com quem compartilhamos">
        <p>Só com os serviços necessários para a loja funcionar, cada um apenas com o que precisa:</p>
        <ul>
          <li><b>Mercado Pago</b>: processar o pagamento.</li>
          <li><b>Melhor Envio e Correios</b>: calcular o frete e entregar (nome, endereço e telefone).</li>
          <li><b>Supabase</b> (banco de dados) e <b>Vercel</b> (hospedagem do site): guardar e exibir os dados com segurança.</li>
          <li><b>Resend</b>: enviar os e-mails do pedido.</li>
          <li><b>Contabilidade</b>: emissão de notas e obrigações fiscais.</li>
        </ul>
        <p>Alguns desses serviços guardam dados em servidores fora do Brasil, com as garantias previstas no art. 33 da LGPD.</p>
      </Secao>

      <Secao titulo="Por quanto tempo guardamos">
        <p>Os dados de compras ficam guardados pelo prazo exigido pela legislação fiscal e de defesa do consumidor. Dados de contato que não são mais necessários são apagados quando você pedir ou quando deixarem de ter finalidade.</p>
      </Secao>

      <Secao titulo="Seus direitos">
        <p>Pela LGPD (art. 18) você pode, a qualquer momento e sem custo: confirmar se temos dados seus, ver quais são, corrigir, pedir que sejam apagados ou anonimizados (exceto o que a lei nos obriga a guardar), saber com quem foram compartilhados e retirar um consentimento dado.</p>
        <p>Para isso, escreva para {preencher(LEGAL.email)} ou chame no WhatsApp {LEGAL.whatsapp}. Respondemos em até 15 dias.</p>
      </Secao>

      <Secao titulo="Segurança">
        <p>O site usa conexão criptografada (HTTPS), o acesso ao painel da loja exige login e só a equipe autorizada vê os pedidos.</p>
      </Secao>
    </PaginaLegal>
  );
}
