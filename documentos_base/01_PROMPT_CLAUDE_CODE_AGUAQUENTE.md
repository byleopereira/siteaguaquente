# PROMPT MESTRE — LANDING ÁGUA QUENTE SOLUÇÕES (v2)
> Cole este arquivo inteiro no Claude Code como briefing inicial. Leia ANTES dos outros dois.
> Irmãos: `02_COPY_AGUAQUENTE.md` · `03_IMAGENS_HIGGSFIELD_AGUAQUENTE.md`

---

## ⚠️ LEIA ISTO PRIMEIRO — A VERSÃO ANTERIOR FALHOU

Uma tentativa anterior pediu **água procedural em shader** (superfície do mar, mergulho, turbilhão). Deu errado — simulação de fluido é das coisas mais difíceis de WebGL e o resultado ficou amador.

**Esta versão remove todo fluido livre.** Aqui a água está sempre **dentro de um cano de vidro** — ou seja, é **geometria com material**, não simulação. Isso é executável com confiança.

**Regras não negociáveis:**
1. **Nenhum shader de simulação de fluido.** Nenhum. Se der vontade de escrever um, pare e me chame.
2. **Se um efeito não sair excelente, remova.** Uma página branca, limpa e vazia é infinitamente melhor que um efeito meia-boca.
3. **Nada pode parecer vídeo.** Tudo em tempo real, tudo dirigido pelo scroll.

---

## 0. O QUE VOCÊ VAI CONSTRUIR

Uma landing page **cinematográfica, minimalista, fundo branco**, no espírito de Apple / Dyson / Nothing — aplicada a aquecimento de água.

Cliente: **Água Quente Soluções**, São Paulo, 30+ anos. Projeta, instala e mantém sistemas de aquecimento (gás, solar, elétrico), constrói e aquece piscinas, faz redes de gás e pressurização.

**A página é um único plano-sequência.** O visitante entra pelo display do aquecedor, viaja com a água dentro do cano, vê a água esquentar, e sai no chuveiro. Nada de "seções". Nada de card. Nada de caixa.

**Job:** provocar um "uau" de 30 segundos e terminar num pedido de orçamento pelo WhatsApp.

**REGRA DURA:** a Água Quente **não tem relação nenhuma com a Exaustoor.** Zero menção.

---

## 1. STACK

- **Next.js 14+ (App Router) + TypeScript**
- **Tailwind CSS** (só os tokens abaixo; nenhuma cor default do Tailwind na UI)
- **GSAP + ScrollTrigger** — o scrub mestre
- **Lenis** — smooth scroll (obrigatório)
- **react-three-fiber + drei + @react-three/postprocessing** — só do Ato 3 em diante
- **Framer Motion** — só micro-animações de texto
- Zero backend. Formulário abre WhatsApp com mensagem pré-preenchida.

---

## 2. DESIGN SYSTEM — "Branco e Brasa"

O site é branco. A cor só existe **dentro do cano**, e ela conta a história: azul frio → dourado → brasa.

### Tokens
```
--branco     #FFFFFF   /* fundo, 80% da página */
--nevoa      #F5F7F8   /* superfícies quase-brancas, sombra de contato */
--grafite    #0B0D0E   /* interior do display (Atos 3–6) */
--tinta      #14181A   /* texto sobre branco */
--tinta-2    #6B767B   /* texto secundário */
--frio       #2E7DE0   /* a água fria, glow azul */
--morno      #F0B429   /* meio do caminho */
--brasa      #FF6B2C   /* água quente. CTA primário. */
```
**Regra da brasa:** no branco, só no CTA. Dentro do cano, ela é o clímax. Máximo **2 aparições por tela** fora do cano.

### Tipografia
- **Display:** `Inter Tight` — pesos 300 e 500. **Tamanhos grandes** (clamp 48px → 96px). *Sentence case.* Tracking -0.03em.
- **Corpo:** `Inter Tight` 400, cor `--tinta-2`.
- **Mono:** `JetBrains Mono` — só temperatura e números.

### Regras
- Espaço em branco é o material principal. Se estiver apertado, aumente o respiro.
- **Uma** sombra: difusa, larga, opacidade 0.06. Nada de card flutuante.
- Cantos: 2px. Glassmorphism: **só no HUD de temperatura**, em nenhum outro lugar.
- Fora do plano-sequência, nada anima além de fade curto (200ms).

---

## 3. O PLANO-SEQUÊNCIA (o coração — leia com cuidado)

### Arquitetura
Um **único ScrollTrigger** com `scrub: 1` e `pin` do container por **~700vh**.
Uma variável só: `p` (0 → 1). Todos os atos leem dela. Nada de triggers concorrentes.

| Atos | `p` | Técnica |
|---|---|---|
| 0–2 · hero → zoom → atravessa o vidro | 0.00 → 0.28 | **DOM + CSS puro.** Sem three.js. |
| 3–6 · dentro do display → cano → aquecimento | 0.28 → 0.86 | **three.js / r3f.** |
| 7 · chuveiro + CTA | 0.86 → 1.00 | **Foto real + camada de vapor.** |

---

### ATO 0 — HERO (`p = 0`, repouso)
- Fundo `--branco`. 100vh.
- No centro: **a foto do aquecedor** (PNG fundo transparente, ver arquivo 03). ~45% da altura.
- Sombra de contato suave embaixo.
- **Tilt 3D no mouse:** `rotateX/rotateY`, **máximo 2°**, com spring suave. Passou de 2°, vira brinquedo.
- **Glow especular seguindo o cursor:** gradiente radial branco, opacidade baixa, `mix-blend-mode: overlay` sobre a imagem. Só isso.
- **O display do aquecedor está APAGADO.** Retângulo escuro, sem número.

Texto (generoso, muito respiro):
> **Água quente.**
> **No momento em que você precisa.**

CTA: `Solicite um orçamento`
Indicador: `role` — mono, minúsculo, com uma linha vertical de 24px pulsando devagar.

---

### ATO 1 — O DISPLAY LIGA (`p = 0.00 → 0.12`)
- O display **acende**: glow `--frio`, fade de 300ms.
- Número em `JetBrains Mono` sobe **com o scroll**: `32° → 42°`.
  Interpolação linear direta de `p`. **Sem timer, sem `setInterval`. O scroll é o relógio.**
- A "câmera" (aqui = `transform: scale()` no container da imagem) começa a se aproximar. **Muito devagar.** `scale: 1 → 1.4`.
- A headline sai com fade + translate-up de 40px.

---

### ATO 2 — ATRAVESSAR O VIDRO (`p = 0.12 → 0.28`)
**Este é o truque mais importante da página. Faça exatamente assim:**

- `scale` continua: `1.4 → 8`. O display cresce até dominar a tela.
- Temperatura: `42° → 50°`.
- **A transição não é corte nem crossfade. É uma máscara:**
  1. O retângulo do display é um `clip-path` (ou div com `border-radius: 2px`).
  2. Esse retângulo **cresce até virar a viewport inteira**.
  3. **Por trás dele já está o `<canvas>` do three.js, montado e renderizando.**
  4. Quando o retângulo cobre 100% da tela, a imagem do aquecedor sai do fluxo.
- Resultado: o usuário sente que atravessou o vidro. **Não houve corte porque, tecnicamente, não houve.**

⚠️ **Monte o canvas 3D em `p ≈ 0.05`** (invisível, atrás da máscara) para não ter hitch de compilação de shader na hora da travessia. Pré-aqueça.

---

### ATO 3 — DENTRO (`p = 0.28 → 0.40`)
Agora é three.js. Fundo `--grafite`.

- **Partículas azuis:** `Points` com ~800 pontos, tamanhos variados, additive blending. Movimento lento, quase parado.
- **Vapor:** 15–20 sprites de fumaça (textura PNG), rotação lenta, opacidade 0.05–0.12, escala grande. Discreto.
- **Glow volumétrico:** **NÃO** faça volumetric lighting de verdade. Use `Bloom` do `@react-three/postprocessing` com intensidade baixa. Muito mais barato, resultado igual.
- Ao fundo, a temperatura continua em mono, opacidade 0.15, como se estivesse sendo processada.

Sensação: energia, calor, precisão. **Escuro e elegante — não sci-fi.**

---

### ATO 4 — A LINHA (`p = 0.40 → 0.48`)
- Uma **linha azul** nasce no centro. Fina. Cresce. Começa a se mover.
- É a água. É a protagonista do resto da página.
- **Como fazer:** ela é a própria `CatmullRomCurve3` do cano, desenhada progressivamente (`drawRange` numa `Line`).
- A câmera começa a segui-la.

---

### ATO 5 — O CANO (`p = 0.48 → 0.70`)
**É aqui que você investe. E é geometria, não fluido.**

- **O cano:** `TubeGeometry` sobre a `CatmullRomCurve3` do Ato 4. 8 a 12 pontos de controle, curvas suaves, subida leve no final.
  - Material: `MeshPhysicalMaterial` → `transmission: 1`, `roughness: 0.05`, `thickness: 0.5`, `ior: 1.45`.
    **Isso é vidro. Pronto.**
  - **Minimalista**, não realista. Nada de flange, rosca, solda.
- **A água dentro:** um **segundo `TubeGeometry`**, mesma curva, raio menor. Material emissivo com a cor do momento.
  - O "fluxo" é uma **textura rolando** (`map.offset.x += delta`). É isso. Não é simulação.
- **Bolhas:** `InstancedMesh` com ~150 esferinhas, andando ao longo da curva com offsets aleatórios. Barato e convincente.
- **A câmera viaja pela curva:**
  - posição = `curve.getPointAt(t)`
  - alvo = `curve.getPointAt(t + 0.01)`
  - `t` vem direto de `p`. Duas linhas de código. É assim que se faz.

**Os benefícios aparecem PRESOS AO CANO** — não em card, não em caixa:
- `<Html>` do drei (ou `Text` 3D) ancorado em pontos da curva.
- O texto aparece quando a câmera se aproxima e some quando passa.
- Fonte grande, branca, peso 300. **Sem fundo, sem borda, sem ícone.**
- Textos exatos: `02_COPY_AGUAQUENTE.md` §5.

---

### ATO 6 — A ÁGUA ESQUENTA (`p = 0.55 → 0.80`, sobreposto ao Ato 5)
- A cor emissiva da água interpola: `--frio` → `--morno` → `--brasa`.
- **A água nunca fica laranja de fato.** O que aquece é o **glow**: sobe `emissiveIntensity` e a intensidade do `Bloom`, e desloca o hue de leve. O corpo da água segue quase branco no centro.
- O vapor **aumenta**. As bolhas ficam mais rápidas e menores.
- A luz do cenário troca de fria pra quente.

---

### ATO 7 — O CHUVEIRO (`p = 0.86 → 1.00`)
- A câmera **sobe**, seguindo o cano.
- O cano termina exatamente numa **ducha**.
- **Aqui saímos do 3D.** A transição acontece num **estouro de branco** (Bloom no máximo + overlay branco a 100%) — ninguém enxerga o corte.
- Do outro lado: **foto real** de banheiro premium (Higgsfield), água caindo do chuveiro, **muito vapor**.
- **Zero pessoas.** Vendemos sensação, não gente.

**CTA final**, grande, sobre o vapor:
> **O conforto começa**
> **antes da primeira gota.**

Subtexto e botão: `02_COPY_AGUAQUENTE.md` §7.
O vapor continua se movendo, muito leve, depois que a página para.

---

## 4. FALLBACKS (obrigatórios, não opcionais)

- **`prefers-reduced-motion`:** sem plano-sequência. Hero estático + seções de texto em página normal. Nada quebra.
- **Mobile (< 768px):** **NÃO roda o cano 3D.** Roda os Atos 0–2 (CSS puro, funcionam lindo no celular), e do Ato 3 em diante vira **scrub de sequência de imagens** (12 frames em `<canvas>`, ver arquivo 03) OU seções estáticas bem tipografadas. Pin de 300vh, não 700vh.
- **Sem WebGL / GPU fraca:** detecte e caia no caminho do mobile, sem erro no console.
- **Antes de carregar:** poster estático do Ato 0. Nunca tela branca vazia.

---

## 5. PERFORMANCE (requisito, não enfeite)

- **60 FPS.** Se não bater, corte partículas antes de cortar geometria.
- Bundle da experiência: **< 300 KB gzip.**
- `dpr={[1, 1.5]}` no Canvas — não renderize em 3× num retina.
- Lazy load do three.js (`dynamic import`, `ssr: false`).
- Texturas comprimidas, ≤ 512px onde der.
- Lighthouse mobile > 90.

---

## 6. RESTO DA PÁGINA (depois do plano-sequência)

Curto e quieto. Fundo branco, muito respiro, fade de 200ms na entrada:

1. **O que fazemos** — 5 linhas (Aquecimento · Piscinas · Redes de gás · Pressurização · Manutenção e PMOC). Sem card. Linha de 1px separando.
2. **Faixa de fatos** — mono.
3. **Para quem** — 4 públicos, texto seco.
4. **FAQ** — accordion, 6 perguntas.
5. **Orçamento** — formulário curto → WhatsApp.
6. **Rodapé.**

Copy exato em `02_COPY_AGUAQUENTE.md`. **Use como está. Não reescreva sem me perguntar.**

---

## 7. IMAGENS — MCP DO HIGGSFIELD

MCP do **Higgsfield** conectado. Gere as imagens **antes** de codar. Salve em `/public/img/`.
Prompts em `03_IMAGENS_HIGGSFIELD_AGUAQUENTE.md`.

**A imagem mais crítica é a do aquecedor** (PNG, fundo transparente, frontal, display escuro). Sem ela a Hero não existe. **Me mostre antes de codar.**

---

## 8. DADOS REAIS DA EMPRESA

- **WhatsApp:** (11) 5531-8503 → `https://wa.me/551155318503`
- **Endereço:** Av. dos Bandeirantes, 2653A — Moema, São Paulo/SP — CEP 04553-012
- **Horário:** 8h às 18h, seg a sex
- **Atuação:** São Paulo capital, litoral e interior
- **Tagline oficial:** *Tudo para aquecer, construir e transformar.*
- **Loja online:** `lojaonline.aguaquentesolucoes.com.br` — link discreto no rodapé.

⚠️ O CNPJ no site atual é placeholder falso. Mantenha placeholder e me avise.
⚠️ A Água Quente **instala e projeta** — não fabrica aquecedor. Nenhum copy pode sugerir que o equipamento é dela.

---

## 9. CHECKLIST ANTES DE ME ENTREGAR

- [ ] 60 FPS no plano-sequência (grave um vídeo do scroll pra eu ver)
- [ ] A travessia do vidro (Ato 2) é **imperceptível** — sem flash, sem hitch, sem corte visível
- [ ] Nenhum shader de fluido no projeto
- [ ] `prefers-reduced-motion` testado
- [ ] Mobile 375px: fallback funcionando
- [ ] Sem WebGL: cai no fallback, console limpo
- [ ] Foco de teclado visível em todo botão e link
- [ ] Lighthouse mobile > 90
- [ ] Nenhuma cor fora dos tokens
- [ ] Zero menção à Exaustoor · Zero lorem ipsum · Zero pessoa nas fotos

---

## 10. COMO TRABALHAR

**Não escreva a página inteira de uma vez.** Entregue em 4 etapas, e me mostre cada uma:

1. **Etapa 1 — Hero + Atos 0–2** (CSS puro, sem three.js). Se a travessia do vidro não ficar perfeita aqui, nada mais importa. **Pare e me mostre.**
2. **Etapa 2 — Imagens do Higgsfield.** Me mostre pra aprovar.
3. **Etapa 3 — Atos 3–6** (o cano). Me mostre.
4. **Etapa 4 — Ato 7 + resto da página.**

Antes da Etapa 1, me devolva o **plano de execução por escrito**: quantos triggers, como amarra o `p`, como monta a máscara do display, e onde entra o canvas.

**Se algum efeito não estiver saindo excelente, me avise em vez de improvisar.** Prefiro cortar o efeito a receber ele meia-boca.
