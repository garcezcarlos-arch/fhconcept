import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { Eyebrow } from "@/components/ui";
import ListaForm from "./form";

export const metadata = { title: "Lista de espera — formações", robots: { index: false } };

export default function ListaEspera() {
  return (
    <div className="min-h-dvh bg-creme text-texto">
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-10 md:py-16">
        <Eyebrow>Formações</Eyebrow>
        <h1 className="mt-3 max-w-[18ch] font-serif text-3xl leading-[1.1] md:text-4xl">Receba a próxima data antes de todo mundo</h1>
        <p className="mt-4 max-w-[52ch] text-texto2">As turmas são pequenas e costumam fechar rápido. Quem está na lista recebe a data pelo WhatsApp antes de ela ir para o Instagram.</p>
        <ListaForm />
      </main>
      <Rodape />
    </div>
  );
}
