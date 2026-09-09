// Dado estruturado em JSON-LD. E isto que os motores de resposta leem de fato —
// llms.txt e majoritariamente ignorado, o HTML e o que conta.
export function DadosEstruturados({ dados }: { dados: object }) {
  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }} />;
}
