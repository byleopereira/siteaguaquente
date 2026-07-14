/**
 * Prepara as duas variantes da logo a partir do arquivo em /logo:
 * - logo-clara.png  → original (texto claro), para fundos escuros (finale)
 * - logo-escura.png → texto recolorido para --tinta, para o rodapé branco
 * O "Q" azul é preservado nas duas.
 */
import sharp from "sharp";

const SRC =
  "logo/Agua-Quente-Solucoes_em_Aquecedores-Lareiras-Piscianas-Boiler_Energia-solar-1024x451.png";

const TINTA = { r: 20, g: 24, b: 26 };

const base = sharp(SRC).trim();
await base
  .clone()
  .png({ compressionLevel: 9 })
  .toFile("public/img/logo-clara.png");

const { data, info } = await sharp(SRC)
  .trim()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += info.channels) {
  const a = info.channels === 4 ? data[i + 3] : 255;
  if (a === 0) continue;
  const r = data[i],
    b = data[i + 2];
  const azul = b - r > 30; // o Q azul fica como está
  if (!azul) {
    data[i] = TINTA.r;
    data[i + 1] = TINTA.g;
    data[i + 2] = TINTA.b;
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: info.channels },
})
  .png({ compressionLevel: 9 })
  .toFile("public/img/logo-escura.png");

console.log("logo-clara.png e logo-escura.png geradas em public/img");
