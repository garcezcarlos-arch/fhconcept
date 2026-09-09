"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function FormularioEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setCarregando(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha nao conferem.");
      return;
    }
    router.push(params.get("redirect") ?? "/admin/produtos");
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-creme text-carvao grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-serif text-3xl tracking-tight">FH Concept</p>
        <p className="mt-1 mb-8 text-sm text-carvao/60">Painel da loja</p>

        <label className="block text-sm mb-1" htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-linha bg-white px-3 py-2 text-sm outline-none focus:border-nude"
        />

        <label className="block text-sm mb-1 mt-4" htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="w-full border border-linha bg-white px-3 py-2 text-sm outline-none focus:border-nude"
        />

        {erro && <p className="mt-4 text-sm text-red-700">{erro}</p>}

        <button
          onClick={entrar}
          disabled={carregando || !email || !senha}
          className="mt-6 w-full bg-carvao px-4 py-2.5 text-sm text-creme disabled:opacity-40"
        >
          {carregando ? "Entrando" : "Entrar"}
        </button>
      </div>
    </main>
  );
}

export default function Entrar() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-creme text-carvao grid place-items-center px-6">
          <p className="text-sm text-carvao/50">Carregando…</p>
        </main>
      }
    >
      <FormularioEntrar />
    </Suspense>
  );
}
