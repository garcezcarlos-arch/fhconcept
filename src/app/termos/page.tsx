import Link from "next/link";
import { PaginaLegal, Secao } from "@/components/pagina-legal";
import { LEGAL, preencher } from "@/lib/legal";

export const metadata = {
  title: "Termos de uso e de compra",
  description: "Condições de compra na loja online da FH Concept: preços, pagamento, entrega, retirada no salão e atendimento.",
  alternates: { canonical: "/termos" },
  robots: LEGAL.revisado ? undefined : { index: false },
};

export default function Termos() {
  return (
    <PaginaLegal atual="/termos" titulo="Termos de uso e de compra"
      resumo="As regras da loja em linguagem direta. Ao fazer um pedido, você concorda com estas condições.">

      <Secao titulo="Quem vende">
        <p>A loja é operada por {preencher(LEGAL.razaoSocial)} ({LEGAL.nomeFantasia}), CNPJ {LEGAL.cnpj}, {LEGAL.endereco}. Contato: WhatsApp {LEGAL.whatsapp}{LEGAL.email ? <>, e-mail {LEGAL.email}</> : null}.</p>
      </Secao>

      <Secao titulo="Produtos e preços">
        <ul>
          <li>Vendemos produtos de cabelo, estética facial, perfumaria e corpo, todos com registro ou notificação na Anvisa e nota fiscal de entrada.</li>
          <li>Produtos de uso exclusivamente profissional (como coloração e descolorante) não são vendidos ao público pela loja.</li>
          <li>Os preços estão em reais e podem mudar sem aviso, mas o valor do seu pedido é o que aparecia no momento da compra.</li>
          <li>As fotos são ilustrativas; embalagens podem variar conforme o lote do fabricante.</li>
          <li>Se, por erro, um produto ficar sem estoque depois do pagamento, avisamos e devolvemos o valor integral ou oferecemos outro, à sua escolha.</li>
        </ul>
      </Secao>

      <Secao titulo="Pagamento">
        <ul>
          <li>Aceitamos Pix e cartão de crédito (em até 6x) pelo Mercado Pago.</li>
          <li>O pedido só é separado depois da confirmação do pagamento. Pedidos não pagos em até 72 horas são cancelados automaticamente.</li>
          <li>A nota fiscal é emitida em nome de quem fez o pedido.</li>
        </ul>
      </Secao>

      <Secao titulo="Entrega e retirada">
        <ul>
          <li><b>Retirada no salão:</b> sem custo. Avisamos pelo WhatsApp quando o pedido estiver pronto. Retire de terça a sábado, das 8h30 às 12h e das 13h30 às 18h30, com documento ou o número do pedido.</li>
          <li><b>Envio:</b> pelos Correios, com valor e prazo calculados no checkout pelo CEP. O prazo começa a contar a partir da confirmação do pagamento e da postagem, e o código de rastreio é enviado pelo WhatsApp.</li>
          <li>Confira o endereço antes de finalizar. Se a entrega voltar por endereço incorreto ou ausência, combinamos um novo envio, com novo frete.</li>
        </ul>
      </Secao>

      <Secao titulo="Trocas, devoluções e privacidade">
        <p>As regras de desistência e de produto com defeito estão em <Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>. O uso dos seus dados está explicado na <Link href="/privacidade">Política de privacidade</Link>.</p>
      </Secao>

      <Secao titulo="Uso do site">
        <p>Textos, fotos e marca da FH Concept são de uso exclusivo do salão. As indicações de produtos e o diagnóstico capilar são orientações gerais e não substituem a avaliação de uma profissional no atendimento.</p>
      </Secao>

      <Secao titulo="Dúvidas e foro">
        <p>Fale primeiro com a gente: resolvemos quase tudo no WhatsApp. Estes termos seguem a legislação brasileira, em especial o Código de Defesa do Consumidor, e você pode recorrer ao foro do seu domicílio.</p>
      </Secao>
    </PaginaLegal>
  );
}
