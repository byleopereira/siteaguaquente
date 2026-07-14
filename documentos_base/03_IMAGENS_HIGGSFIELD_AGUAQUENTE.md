# IMAGENS — MCP HIGGSFIELD (ÁGUA QUENTE v2)
> Para o Claude Code executar. Gere na ordem. Salve em `/public/img/`. Converta para WebP.
> Padrão: **fotografia de produto Apple/Dyson.** Fundo branco, luz de estúdio, zero drama.
> **Mostre A1 pro Leo antes de codar qualquer coisa.**

---

## GRUPO A — O AQUECEDOR (a imagem mais crítica do projeto)

### A1 — `aquecedor.png` ⭐ SEM ELA A HERO NÃO EXISTE
```
Modern tankless gas water heater, front view, perfectly straight-on and centered,
matte white and brushed metal casing, minimal industrial design, a small dark
rectangular digital display panel on the front (display is OFF, dark, no numbers),
premium product photography, soft even studio lighting, subtle specular highlights,
isolated on 100% transparent background, no shadow, no environment, no text,
no logo, ultra sharp, 2048x2048
```
**Requisitos duros:**
- PNG, **fundo 100% transparente** (não branco — transparente).
- **Frontal perfeito.** Sem perspectiva, sem ângulo. Se sair torto, regenere.
- **O display tem que estar APAGADO e ser um retângulo bem definido.** Vamos usar esse retângulo como máscara de transição. Se o display estiver aceso, borrado ou mal delimitado, **regenere**.
- Sem marca, sem logo, sem texto na carcaça.

> **Se em 3 tentativas não sair um display limpo e retangular:** gere o aquecedor sem display nenhum e **desenhe o display em CSS por cima** (uma div escura com border-radius 2px). Fica até melhor, e é 100% controlável. **Me avise se for por esse caminho.**

### A2 — `aquecedor-shadow.png` (sombra de contato, opcional)
```
Soft diffuse contact shadow ellipse, very light grey on 100% transparent
background, extremely soft edges, top-down, no object, 2048x512
```
> Se ficar mais fácil, faça em CSS (`box-shadow` bem difusa). Prefira CSS.

---

## GRUPO B — TEXTURAS PARA O 3D (Atos 3–6)

### B1 — `smoke.png` (sprite de vapor)
```
Single soft wisp of white smoke on 100% transparent background, very diffuse,
feathered edges, no hard shapes, grayscale, 1024x1024
```

### B2 — `flow.png` (textura que rola dentro do cano — dá o "fluxo")
```
Seamless tileable texture of soft horizontal light streaks and elongated highlights,
white on black, subtle, abstract, no visible pattern repetition, 1024x256
```
> Essa textura vai rolar no eixo X (`map.offset.x += delta`). **Tem que ser seamless.** Se emendar visivelmente, regenere.

### B3 — `bubble.png` (opcional — se as bolhas de geometria ficarem duras)
```
Single small transparent air bubble with thin bright rim light, on 100% transparent
background, macro, clean, 256x256
```

### B4 — `hdri-studio.hdr` — **NÃO gere no Higgsfield.**
> Baixe um HDRI neutro de estúdio (Poly Haven, `studio_small_08` ou similar). É o que dá o brilho certo no vidro do cano. Higgsfield não faz HDRI.

---

## GRUPO C — O CHUVEIRO (Ato 7 — o final)

### C1 — `chuveiro.jpg` ⭐
```
Premium minimalist bathroom, matte white and warm stone, a modern rain shower head
pouring hot water straight down, thick warm steam filling the air, single soft light
source, clean architectural photography, luxury, no people, no text, no clutter,
photorealistic, cinematic, 16:9
```
> Gere **3 variações** e me mostre. É o último frame da experiência — tem que ser o melhor.

### C2 — `chuveiro-vapor.png` (camada de vapor sobre a C1)
```
Isolated white steam and water vapor, rising softly, diffuse and translucent,
on 100% transparent background, no background elements, high resolution, 2048x2048
```

---

## GRUPO D — FALLBACK MOBILE (sequência de scrub)

`mob-01.jpg` … `mob-12.jpg` — **9:16**, contando a mesma história:

| Frame | Conteúdo |
|---|---|
| 01–02 | Aquecedor no branco, display apagado → aceso |
| 03–04 | Zoom no display, temperatura subindo |
| 05–06 | Escuro, partículas azuis, glow frio |
| 07–08 | O cano de vidro azul, água correndo |
| 09–10 | O cano dourado/quente, mais vapor |
| 11 | O cano subindo até o chuveiro |
| 12 | O chuveiro, água caindo, vapor |

**Consistência de cor entre os frames importa mais que detalhe.** Se der, gere como vídeo curto no Higgsfield e extraia os 12 frames — sai mais coerente que frame a frame.

---

## REGRAS FINAIS

1. **Gere A1 primeiro. Mostre pro Leo. Não passe daí sem aprovação.**
2. Fundo transparente onde está escrito transparente. **Se vier com fundo, regenere — não recorte na unha.**
3. Nada de pessoa. Nada de logo. Nada de texto dentro da imagem.
4. Otimize tudo: **WebP, ≤ 250 KB, largura máx 2048px.** Texturas do 3D: ≤ 512px onde der.
5. Se o Higgsfield falhar em alguma peça, **avise.** Não substitua por placeholder cinza em silêncio.
