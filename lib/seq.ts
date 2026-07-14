/**
 * Estado compartilhado do plano-sequência.
 * Um único ScrollTrigger escreve `p` (0 → 1); todos os atos leem daqui.
 * Objeto mutável de propósito: o loop 3D lê a cada frame sem re-render.
 */
export const seq = { p: 0 };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Mapeia p do intervalo [a, b] para [0, 1], com clamp. */
export const span = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* Tokens (espelham o Tailwind — o 3D precisa deles como valores) */
export const COLORS = {
  branco: "#ffffff",
  nevoa: "#f5f7f8",
  grafite: "#0b0d0e",
  tinta: "#14181a",
  tinta2: "#6b767b",
  frio: "#2e7de0",
  morno: "#f0b429",
  brasa: "#ff6b2c",
} as const;

/* Dados reais da empresa (briefing + site atual aguaquentesolucoes.com.br) */
export const EMPRESA = {
  nome: "Água Quente Soluções",
  tagline: "Tudo para aquecer, construir e transformar.",
  telefoneDisplay: "(11) 5531-8503",
  whatsappBase: "https://wa.me/551155318503",
  email: "contato@aguaquentesolucoes.com.br",
  endereco: "Av. dos Bandeirantes, 2653A — Moema",
  cidade: "São Paulo/SP — CEP 04553-012",
  horario: "8h às 18h, seg a sex",
  lojaOnline: "https://lojaonline.aguaquentesolucoes.com.br",
  instagram: "https://www.instagram.com/aguaquentesolucoes",
  facebook: "https://www.facebook.com/aquecedoresaguaquente/",
  linkedin: "https://br.linkedin.com/company/aguaquente",
  /* ⚠️ CNPJ do site atual — dígitos sequenciais, provável placeholder */
  cnpj: "12.345.678/0001-99",
  assistencia: "Assistência técnica autorizada Rinnai · Cumulus · Do Metal · Chama",
  descritor:
    "Construção de piscinas e aquecedores · São Paulo · Litoral · Interior",
} as const;

export function whatsappUrl(mensagem: string) {
  return `${EMPRESA.whatsappBase}?text=${encodeURIComponent(mensagem)}`;
}

export const WHATSAPP_CTA = whatsappUrl(
  "Olá! Vim pelo site. Quero solicitar um orçamento."
);

/* Benefícios presos ao cano (copy §5) */
export const BENEFICIOS = [
  {
    titulo: "Água quente na hora.",
    apoio: "Sem esperar o boiler. Sem água fria correndo pro ralo.",
  },
  {
    titulo: "O gás que você não gasta.",
    apoio:
      "Sistema dimensionado pelo uso real da casa — não pelo que sobrou no estoque.",
  },
  {
    titulo: "Sol, gás ou eletricidade.",
    apoio:
      "As três fontes. A gente escolhe a certa depois de ver o seu projeto.",
  },
  {
    titulo: "Pressão que chega em cima.",
    apoio: "Bomba, recalque e automação. Pro último andar parar de reclamar.",
  },
  {
    titulo: "Assinado por engenheiro.",
    apoio: "ART, laudo e garantia documentada. Em toda entrega.",
  },
  {
    titulo: "E continua funcionando.",
    apoio:
      "Contrato de manutenção preventiva. O sistema não te surpreende no inverno.",
  },
] as const;
