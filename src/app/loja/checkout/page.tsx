import CheckoutForm from "./form";

export const metadata = { title: "Finalizar compra", robots: { index: false } };

export default function Checkout() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-nude">Loja</p>
      <h1 className="mt-3 font-serif text-3xl md:text-4xl">Finalizar compra</h1>
      <CheckoutForm />
    </main>
  );
}
