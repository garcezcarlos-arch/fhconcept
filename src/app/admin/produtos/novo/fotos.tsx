"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export type Foto = { url: string; alt: string; caminho: string };

export default function Fotos({
  fotos,
  onChange,
}: {
  fotos: Foto[];
  onChange: (f: Foto[]) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function subir(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const novas: Foto[] = [];

    for (const arquivo of Array.from(arquivos)) {
      if (arquivo.size > 5_000_000) {
        setErro(`${arquivo.name} passa de 5 MB. Reduza antes de enviar.`);
        continue;
      }

      const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const caminho = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("produtos")
        .upload(caminho, arquivo, { cacheControl: "31536000" });

      if (error) {
        setErro(error.message);
        continue;
      }

      const { data } = supabase.storage.from("produtos").getPublicUrl(caminho);
      novas.push({ url: data.publicUrl, alt: "", caminho });
    }

    onChange([...fotos, ...novas]);
    setEnviando(false);
  }

  async function remover(i: number) {
    const supabase = createClient();
    await supabase.storage.from("produtos").remove([fotos[i].caminho]);
    onChange(fotos.filter((_, j) => j !== i));
  }

  return (
    <div>
      <p className="mb-1 text-sm">Fotos</p>
      <p className="mb-3 text-sm text-carvao/60">
        A primeira e a que aparece na vitrine. Ate 5 MB cada.
      </p>

      {fotos.length > 0 && (
        <div className="mb-4 space-y-3">
          {fotos.map((f, i) => (
            <div key={f.caminho} className="flex items-start gap-3">
              <Image
                src={f.url}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 shrink-0 border border-linha object-cover"
              />
              <input
                value={f.alt}
                onChange={(e) =>
                  onChange(fotos.map((g, j) => (j === i ? { ...g, alt: e.target.value } : g)))
                }
                placeholder="Descreva a foto para quem nao enxerga"
                className="w-full border border-linha bg-white px-3 py-2 text-sm outline-none focus:border-nude"
              />
              <button
                type="button"
                onClick={() => remover(i)}
                className="shrink-0 py-2 text-sm text-carvao/50 hover:text-red-700"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={enviando}
        onChange={(e) => subir(e.target.files)}
        className="block text-sm file:mr-3 file:border file:border-linha file:bg-white file:px-3 file:py-1.5 file:text-sm"
      />

      {enviando && <p className="mt-2 text-sm text-carvao/60">Enviando…</p>}
      {erro && <p className="mt-2 text-sm text-red-700">{erro}</p>}
    </div>
  );
}
