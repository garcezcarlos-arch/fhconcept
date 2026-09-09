import Image from "next/image";
import type { ReactNode } from "react";

/* Rotulo pequeno em caixa alta, acima de titulos — o .eyebrow do site original */
export function Eyebrow({ children, claro = false }: { children: ReactNode; claro?: boolean }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${claro ? "text-champanhe" : "text-nude"}`}>
      {children}
    </p>
  );
}

/* Titulo de secao em serifa, com largura maxima de leitura */
export function Titulo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`mt-4 max-w-[19ch] font-serif text-3xl leading-[1.12] md:text-4xl ${className}`}>
      {children}
    </h2>
  );
}

/* Texto de apoio abaixo do titulo */
export function Lede({ children, claro = false, className = "" }: { children: ReactNode; claro?: boolean; className?: string }) {
  return (
    <p className={`mt-5 max-w-[58ch] leading-relaxed ${claro ? "text-creme/65" : "text-texto2"} ${className}`}>
      {children}
    </p>
  );
}

type BotaoProps = { href: string; children: ReactNode; variante?: "primario" | "secundario" | "claro"; externo?: boolean };

/* Botao com altura de toque de 52px — .btn-p, .btn-s e .btn-l do original */
export function Botao({ href, children, variante = "primario", externo = true }: BotaoProps) {
  const base = "inline-flex min-h-13 items-center justify-center px-7 text-sm tracking-[0.02em] transition-colors";
  const estilo = {
    primario: "bg-carvao text-creme hover:bg-nude-esc",
    secundario: "border border-linha text-texto hover:border-carvao hover:bg-carvao hover:text-creme",
    claro: "bg-creme text-carvao hover:bg-nude hover:text-creme",
  }[variante];
  const extra = externo ? { target: "_blank", rel: "noopener" } : {};
  return (
    <a href={href} {...extra} className={`${base} ${estilo}`}>
      {children}
    </a>
  );
}

/* Link discreto com sublinhado nude e alvo de toque de 44px */
export function LinkNude({ href, children, externo = true }: { href: string; children: ReactNode; externo?: boolean }) {
  const extra = externo ? { target: "_blank", rel: "noopener" } : {};
  return (
    <a href={href} {...extra} className="inline-flex min-h-11 items-center border-b border-nude text-sm text-nude">
      {children}
    </a>
  );
}

type FiguraProps = { src: string; alt: string; proporcao?: string; sizes?: string; prioridade?: boolean; className?: string };

/* Foto com fundo areia enquanto carrega e leve escala no hover */
export function Figura({ src, alt, proporcao = "aspect-[3/4]", sizes = "(max-width: 768px) 100vw, 50vw", prioridade = false, className = "" }: FiguraProps) {
  return (
    <figure className={`group relative overflow-hidden bg-areia ${proporcao} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={prioridade} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
    </figure>
  );
}

/* Faixa de numeros — .faixa do original: quatro colunas centradas com divisor */
export function Faixa({ itens }: { itens: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 border-y border-linha md:grid-cols-4">
      {itens.map(([numero, rotulo], i) => (
        <div key={rotulo} className={`px-3 py-8 text-center ${i % 2 === 1 ? "border-l border-linha" : ""} ${i >= 2 ? "border-t border-linha md:border-t-0" : ""} ${i >= 1 ? "md:border-l" : ""}`}>
          <b className="block font-serif text-3xl font-normal leading-none md:text-4xl">{numero}</b>
          <span className="mt-3 block text-[10.5px] font-medium uppercase tracking-[0.18em] text-texto2">{rotulo}</span>
        </div>
      ))}
    </div>
  );
}
