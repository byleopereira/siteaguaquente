# Água Quente Soluções — Landing Page

Landing cinematográfica de plano-sequência único: o visitante entra pelo display
do aquecedor, viaja com a água dentro do cano de vidro, vê a água esquentar
(azul → dourado → brasa) e sai no chuveiro, terminando num pedido de orçamento
pelo WhatsApp. Construída a partir dos briefings em `documentos_base/`.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
```

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (só os tokens do design system "Branco e Brasa")
- GSAP + ScrollTrigger — um único trigger com scrub; `p` (0→1) dirige tudo
- Lenis — smooth scroll
- react-three-fiber + drei + postprocessing — Atos 3–6 (cano 3D)
- Zero backend — o formulário abre o WhatsApp com mensagem pré-preenchida

## Arquitetura do plano-sequência

- `components/Sequence.tsx` — wrapper de 700vh com container sticky.
  Um ScrollTrigger escreve `seq.p`; todos os atos leem dele.
  A travessia do vidro é um `clip-path: inset()` que cresce do retângulo do
  display (medido pixel a pixel — `scripts/medir-display.mjs`) até a viewport.
- `components/three/Scene3D.tsx` — Atos 3–6. Zero shader de fluido:
  cano = TubeGeometry, água = segundo tubo com textura rolando
  (canvas procedural, seamless), bolhas = InstancedMesh, calor = cor/bloom.
- `components/FinaleContent.tsx` — Ato 7 (foto Higgsfield + vapor vivo).
- `components/sections/QuietSections.tsx` — o resto da página, copy exato
  de `documentos_base/02_COPY_AGUAQUENTE.md`.

## Modos / fallbacks

| Modo    | Quando                        | O que roda                                          |
|---------|-------------------------------|-----------------------------------------------------|
| full    | desktop com WebGL             | plano-sequência completo (700vh)                    |
| lite    | mobile <768px ou sem WebGL    | Atos 0–2 em CSS (300vh) + seções tipográficas       |
| static  | prefers-reduced-motion        | página normal, nada pinado, nada anima              |

Para depurar: `?modo=full`, `?modo=lite` ou `?modo=static` na URL.

## Imagens

- `public/img/aquecedor.png` — foto fornecida pelo cliente (fundo transparente)
- `public/img/chuveiro.webp` — Higgsfield (nano banana 2) + upscale 2K, 53 KB
- `public/img/vapor.webp` — vapor sobre preto, composto com `mix-blend: screen`
- `public/img/smoke.png` — sprite de vapor do 3D (512px, additive blending)

## Logo

Original do cliente em `/logo` (versão clara, para fundo escuro).
`scripts/preparar-logo.mjs` gera as duas variantes usadas no site:
`logo-clara.png` (finale) e `logo-escura.png` (rodapé, texto recolorido
para `--tinta` preservando o Q azul).

## Pendências para o cliente

- **CNPJ do rodapé** usa o do site atual (`12.345.678/0001-99`), que tem
  dígitos sequenciais — quase certamente placeholder. Confirmar o CNPJ real.
- A linha "Assistência técnica autorizada Rinnai · Cumulus · Do Metal ·
  Chama" (do site atual) foi adicionada ao rodapé — validar com o cliente,
  já que o briefing pedia aprovação antes de citar marcas.
