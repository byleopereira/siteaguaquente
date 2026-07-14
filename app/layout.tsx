import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Água Quente Soluções — Aquecimento, piscinas e redes de gás | São Paulo",
  description:
    "Há 30 anos em aquecimento de água a gás, solar e elétrico, construção e aquecimento de piscinas, redes de gás e PMOC. São Paulo, litoral e interior.",
  keywords: [
    "aquecimento de piscina são paulo",
    "aquecedor a gás instalação",
    "aquecimento solar residencial",
    "prumada de gás condomínio",
    "PMOC condomínio",
    "pressurização predial",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${interTight.variable} ${jetBrains.variable}`}>
      <body className="font-display">{children}</body>
    </html>
  );
}
