"use client";

/**
 * Orquestra o modo da experiência e o smooth scroll.
 *
 * - full   → desktop com WebGL: plano-sequência completo (700vh)
 * - lite   → mobile (<768px) ou GPU fraca: Atos 0–2 em CSS puro (300vh)
 *            + benefícios tipográficos + finale como seções
 * - static → prefers-reduced-motion: nada é pinado, nada anima
 *
 * SSR renderiza o modo full no repouso (p = 0) — que é exatamente o poster
 * estático do Ato 0. Nunca tela branca vazia.
 */

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Sequence from "./Sequence";
import { FinaleSection, StaticJourney } from "./StaticJourney";
import StaticHero from "./StaticHero";

type Mode = "full" | "lite" | "static";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export default function Experience() {
  const [mode, setMode] = useState<Mode>("full");

  useEffect(() => {
    /* override manual p/ depuração: ?modo=full|lite|static */
    const forced = new URLSearchParams(window.location.search).get("modo");
    if (forced === "full" || forced === "lite" || forced === "static") {
      setMode(forced);
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setMode("static");
      return;
    }
    const mobile = window.innerWidth < 768;
    if (mobile || !hasWebGL()) {
      setMode("lite");
      return;
    }
    setMode("full");
  }, []);

  /* Lenis — smooth scroll amarrado ao ticker do GSAP */
  useEffect(() => {
    if (mode === "static") return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.11 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [mode]);

  if (mode === "static") {
    return (
      <>
        <StaticHero />
        <StaticJourney />
        <FinaleSection />
      </>
    );
  }

  return (
    <>
      <Sequence key={mode} mode={mode} />
      {mode === "lite" && (
        <>
          <StaticJourney />
          <FinaleSection />
        </>
      )}
    </>
  );
}
