/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  /* Export estático para GitHub Pages */
  output: "export",
  basePath,
  /* garante o inline no bundle do cliente (withBase em lib/asset.ts) */
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    /* Pages não tem otimizador de imagem em runtime */
    unoptimized: true,
  },
};

export default nextConfig;
