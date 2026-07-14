/**
 * Mede o painel escuro do aquecedor: procura, linha a linha, runs contíguos
 * de pixels quase-pretos com largura significativa (>= 60px) na região
 * central — isso isola o painel retangular e ignora válvulas e sombras.
 */
import sharp from "sharp";

const { data, info } = await sharp("imagens/image_hero.png")
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H, channels: C } = info;
const rows = [];

for (let y = Math.floor(H * 0.5); y < H * 0.92; y++) {
  let run = 0, best = 0, bestStart = -1, runStart = -1;
  for (let x = Math.floor(W * 0.35); x < W * 0.65; x++) {
    const i = (y * W + x) * C;
    const a = C === 4 ? data[i + 3] : 255;
    const lum = data[i] + data[i + 1] + data[i + 2];
    if (a > 200 && lum < 160) {
      if (run === 0) runStart = x;
      run++;
      if (run > best) {
        best = run;
        bestStart = runStart;
      }
    } else {
      run = 0;
    }
  }
  if (best >= 60) rows.push({ y, x0: bestStart, x1: bestStart + best });
}

if (!rows.length) {
  console.log("nenhum painel encontrado");
  process.exit(1);
}

// agrupa o bloco vertical contíguo mais alto
let blocks = [];
let cur = [rows[0]];
for (let i = 1; i < rows.length; i++) {
  if (rows[i].y - rows[i - 1].y <= 3) cur.push(rows[i]);
  else {
    blocks.push(cur);
    cur = [rows[i]];
  }
}
blocks.push(cur);
blocks.sort((a, b) => b.length - a.length);
const panel = blocks[0];

const minY = panel[0].y, maxY = panel[panel.length - 1].y;
const minX = Math.min(...panel.map((r) => r.x0));
const maxX = Math.max(...panel.map((r) => r.x1));

console.log(JSON.stringify({
  pixels: { minX, maxX, minY, maxY },
  frac: {
    cx: +(((minX + maxX) / 2) / W).toFixed(4),
    cy: +(((minY + maxY) / 2) / H).toFixed(4),
    w: +((maxX - minX) / W).toFixed(4),
    h: +((maxY - minY) / H).toFixed(4),
  },
}, null, 2));
