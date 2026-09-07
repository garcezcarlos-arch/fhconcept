export function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function sugerirSku(marca: string, produto: string, tamanho: string) {
  const p = (t: string, n: number) =>
    slugificar(t).replace(/-/g, "").toUpperCase().slice(0, n);
  return [p(marca, 3), p(produto, 6), p(tamanho, 4)].filter(Boolean).join("-");
}
