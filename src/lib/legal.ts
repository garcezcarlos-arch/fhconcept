import { SITE } from "@/lib/site";

/* Dados das paginas legais (trocas, privacidade, termos).
   Enquanto `revisado` for false as paginas ficam fora do Google (noindex)
   e os campos null aparecem como [a preencher]. Depois da revisao da
   Fernanda/contadora, preencha e troque `revisado` para true. */
export const LEGAL = {
  revisado: false,
  atualizadoEm: "8 de outubro de 2026",
  razaoSocial: null as string | null,        // nome empresarial como esta no CNPJ
  nomeFantasia: "Fernanda Hosang Concept",
  cnpj: "19.417.911/0001-47",
  endereco: `${SITE.rua}, ${SITE.bairro}, ${SITE.cidade}/${SITE.uf}, CEP ${SITE.cep}`,
  whatsapp: "(47) 99642-6656",
  email: null as string | null,              // e-mail de atendimento e de privacidade
  encarregado: null as string | null,        // pessoa responsavel pelos dados (LGPD); pode ser a propria Fernanda
};

export const preencher = (v: string | null) => v ?? "[a preencher]";
