import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Bots separados por funcao: treino, indexacao de busca e leitura em tempo real.
// Liberamos todos — para um salao local, visibilidade vale mais que reserva de
// conteudo. Bloquear ClaudeBot nao bloquearia Claude-SearchBot: cada um precisa
// da propria diretiva, por isso a lista e explicita.
const AGENTES = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
  "Amazonbot", "Bingbot", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/entrar"] },
      ...AGENTES.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/admin/", "/entrar"],
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
