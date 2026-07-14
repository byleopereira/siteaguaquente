/**
 * No GitHub Pages o site vive num subcaminho (/siteaguaquente). O Next só
 * prefixa o basePath nos assets do _next — referências em /public precisam
 * do prefixo manual. NEXT_PUBLIC_BASE_PATH é inlinado no build.
 */
export const withBase = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
