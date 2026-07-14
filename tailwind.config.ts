import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      branco: "#FFFFFF",
      nevoa: "#F5F7F8",
      grafite: "#0B0D0E",
      tinta: "#14181A",
      "tinta-2": "#6B767B",
      frio: "#2E7DE0",
      morno: "#F0B429",
      brasa: "#FF6B2C",
    },
    fontFamily: {
      display: ["var(--font-inter-tight)", "sans-serif"],
      mono: ["var(--font-jetbrains)", "monospace"],
    },
    extend: {
      letterSpacing: {
        display: "-0.03em",
      },
      boxShadow: {
        contato: "0 30px 60px -20px rgba(11, 13, 14, 0.06)",
      },
      borderRadius: {
        aq: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
