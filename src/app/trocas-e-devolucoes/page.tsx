import { PaginaLegal, Secao } from "@/components/pagina-legal";
import { LEGAL, preencher } from "@/lib/legal";
import { linkWhatsapp } from "@/lib/preco";

export const metadata = {
  title: "Trocas e devoluções",
  description: "Como devolver ou trocar um produto comprado na loja FH Concept: arrependimento em 7 dias e produto com defeito.",
  alternates: { canonical: "/trocas-e-devolucoes" },
  robots: LEGAL.revisado ? undefined : { index: false },
};

export default function Trocas() {
  const whats = linkWhatsapp("Oi! Quero falar sobre troca ou devolução do meu pedido #");
  return (
    <PaginaLegal atual="/trocas-e-devolucoes" titulo="Trocas e devoluções"
      resumo="Comprou e se arrependeu, ou o produto chegou com problema? Aqui está o que fazer. Na dúvida, fale com a gente no WhatsApp antes de enviar qualquer coisa.">

      <Secao titulo="Desistência da compra (7 dias)">
        <p>Pelo Código de Defesa do Consumidor (art. 49), toda compra feita pelo site pode ser cancelada em até <b>7 dias corridos</b> a partir do recebimento do produto — ou da retirada no salão —, sem precisar explicar o motivo.</p>
        <ul>
          <li>Avise pelo <a href={whats} target="_blank" rel="noopener">WhatsApp {LEGAL.whatsapp}</a>{LEGAL.email ? <> ou pelo e-mail {LEGAL.email}</> : null} com o número do pedido.</li>
          <li>Devolva o produto sem uso, na embalagem original e, sempre que possível, ainda lacrado. Por ser cosmético, pedimos esse cuidado para que nenhum produto aberto volte à venda.</li>
          <li>Você pode entregar no salão ou enviar pelos Correios. Quando a desistência é dentro do prazo, o frete de devolução é por nossa conta: mandamos o código de postagem.</li>
          <li>Devolvemos o valor integral, incluindo o frete pago na compra.</li>
        </ul>
      </Secao>

      <Secao titulo="Produto com defeito ou diferente do pedido">
        <p>Se o produto chegar danificado, vencido, vazando, diferente do que você comprou ou apresentar problema de qualidade, você tem <b>até 30 dias</b> a partir do recebimento para nos avisar (CDC, art. 26).</p>
        <ul>
          <li>Mande uma foto do produto e da embalagem pelo WhatsApp junto com o número do pedido.</li>
          <li>Você escolhe: troca por outro igual, troca por outro produto (pagando ou recebendo a diferença) ou devolução do dinheiro.</li>
          <li>Nesses casos, todo o frete é por nossa conta.</li>
        </ul>
        <p>Se o produto chegar com a embalagem de transporte visivelmente avariada, você pode recusar o recebimento e nos avisar em seguida.</p>
      </Secao>

      <Secao titulo="Reação ou adaptação ao produto">
        <p>Se você tiver qualquer reação ao usar um produto, pare o uso e procure orientação médica. Fale com a gente: avaliamos cada caso com atenção, junto com o fabricante quando for preciso.</p>
      </Secao>

      <Secao titulo="Como e quando o dinheiro volta">
        <ul>
          <li><b>Pix:</b> devolvemos por Pix, na mesma conta que pagou, em até 5 dias úteis depois de recebermos o produto.</li>
          <li><b>Cartão de crédito:</b> pedimos o estorno ao Mercado Pago no mesmo dia. O valor aparece na fatura em uma ou duas faturas, conforme o banco emissor.</li>
        </ul>
      </Secao>

      <Secao titulo="Quem atende">
        <p>{preencher(LEGAL.razaoSocial)} ({LEGAL.nomeFantasia}) · CNPJ {LEGAL.cnpj} · {LEGAL.endereco}. Atendimento de terça a sábado, das 8h30 às 18h30.</p>
      </Secao>
    </PaginaLegal>
  );
}
