/**
 * Converte as imagens geradas (scratchpad) para WebP otimizado em public/img.
 * Uso: node scripts/otimizar-imagens.mjs <pasta-com-as-fontes>
 */
import sharp from "sharp";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("informe a pasta de origem");
  process.exit(1);
}

const out = "public/img";

const jobs = [
  // finale — foto principal, máx 2048 de largura
  {
    in: "chuveiro-2k.png",
    out: "chuveiro.webp",
    resize: { width: 2048 },
    quality: 78,
  },
  // camada de vapor (blend screen — não precisa de alpha)
  {
    in: "vapor.png",
    out: "vapor.webp",
    resize: { width: 1376 },
    quality: 70,
  },
];

for (const j of jobs) {
  const from = path.join(src, j.in);
  const to = path.join(out, j.out);
  const img = sharp(from);
  if (j.resize) img.resize(j.resize);
  await img.webp({ quality: j.quality }).toFile(to);
  const meta = await sharp(to).metadata();
  const kb = Math.round((await sharp(to).toBuffer()).length / 1024);
  console.log(`${j.out}: ${meta.width}x${meta.height} · ${kb} KB`);
}

// textura de vapor para o 3D: 512px, PNG (TextureLoader)
await sharp(path.join(src, "smoke.png"))
  .resize({ width: 512 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(out, "smoke.png"));
console.log("smoke.png: 512px ok");
