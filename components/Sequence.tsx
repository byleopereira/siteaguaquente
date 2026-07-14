"use client";

/**
 * O plano-sequência. Um único ScrollTrigger com scrub, um wrapper de 700vh
 * (300vh no modo lite) e uma variável só: `p`. Todos os atos leem dela.
 *
 * A travessia do vidro (Ato 2) não é corte nem crossfade — é uma máscara:
 * a camada escura (canvas 3D por trás) fica recortada com clip-path
 * exatamente sobre o display do aquecedor e cresce até virar a viewport.
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FinaleContent from "./FinaleContent";
import { withBase } from "@/lib/asset";
import { WHATSAPP_CTA, clamp01, easeInOut, lerp, seq, span } from "@/lib/seq";

const Scene3D = dynamic(() => import("./three/Scene3D"), { ssr: false });

/** Posição do display na foto do aquecedor (frações da imagem quadrada).
 *  Medido pixel a pixel em scripts/medir-display.mjs. */
const DISP = { cx: 0.5076, cy: 0.7193, w: 0.063, h: 0.0415 };

/** Altura da imagem do aquecedor (mesma fórmula no CSS e no JS). */
const imgSize = (vw: number, vh: number) => Math.min(vh * 0.42, vw * 0.8);
const FIG_CY = 0.52; // centro vertical da figura, em vh
const FIG_CSS = "min(42vh, 80vw)";

type Mode = "full" | "lite";

const TIMINGS = {
  full: {
    a1: [0, 0.12] as const,
    a2: [0.12, 0.28] as const,
    drift: [0.02, 0.22] as const,
    fullClip: [0.2, 0.275] as const,
    heroFade: [0.24, 0.28] as const,
    sysIn: [0.3, 0.32] as const,
    sysOut: [0.4, 0.425] as const,
    height: "700vh",
  },
  lite: {
    a1: [0, 0.38] as const,
    a2: [0.38, 0.82] as const,
    drift: [0.05, 0.7] as const,
    fullClip: [0.66, 0.8] as const,
    heroFade: [0.74, 0.8] as const,
    sysIn: [0.84, 0.9] as const,
    sysOut: [2, 3] as const, // nunca sai — fecha o ato no escuro
    height: "300vh",
  },
};

export default function Sequence({ mode }: { mode: Mode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const glowSpecRef = useRef<HTMLDivElement>(null);
  const dispGlowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const layerBRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const hudNumRef = useRef<HTMLSpanElement>(null);
  const sysRef = useRef<HTMLParagraphElement>(null);
  const act4Ref = useRef<HTMLDivElement>(null);
  const act6Ref = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);

  const geo = useRef({ vw: 0, vh: 0, d0x: 0, d0y: 0, dw: 0, dh: 0 });
  const lastP = useRef(0);

  const computeGeo = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const img = imgSize(vw, vh);
    const cx = vw / 2;
    const cy = vh * FIG_CY;
    const g = geo.current;
    g.vw = vw;
    g.vh = vh;
    g.d0x = cx + (DISP.cx - 0.5) * img;
    g.d0y = cy + (DISP.cy - 0.5) * img;
    g.dw = DISP.w * img;
    g.dh = DISP.h * img;
    if (scaleRef.current) {
      scaleRef.current.style.transformOrigin = `${g.d0x}px ${g.d0y}px`;
    }
    if (dispGlowRef.current) {
      const s = dispGlowRef.current.style;
      s.left = `${g.d0x - g.dw / 2}px`;
      s.top = `${g.d0y - g.dh / 2}px`;
      s.width = `${g.dw}px`;
      s.height = `${g.dh}px`;
    }
  }, []);

  const update = useCallback(
    (p: number) => {
      seq.p = p;
      lastP.current = p;
      const T = TIMINGS[mode];
      const g = geo.current;
      const full = mode === "full";

      /* escala da "câmera" */
      const zoom1 = easeInOut(span(p, T.a1[0], T.a1[1]));
      const zoom2 = easeInOut(span(p, T.a2[0], T.a2[1]));
      const s =
        p <= T.a1[1]
          ? lerp(1, 1.4, zoom1)
          : 1.4 * Math.pow(14 / 1.4, zoom2);

      /* deriva do centro do display até o centro da viewport */
      const drift = easeInOut(span(p, T.drift[0], T.drift[1]));
      const tx = (g.vw / 2 - g.d0x) * drift;
      const ty = (g.vh / 2 - g.d0y) * drift;
      const cx = g.d0x + tx;
      const cy = g.d0y + ty;

      if (translateRef.current)
        translateRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (scaleRef.current)
        scaleRef.current.style.transform = `scale(${s})`;

      /* a máscara: retângulo do display -> viewport inteira */
      const hw = (g.dw / 2) * s;
      const hh = (g.dh / 2) * s;
      const w = easeInOut(span(p, T.fullClip[0], T.fullClip[1]));
      const left = Math.max(0, lerp(cx - hw, 0, w));
      const right = Math.max(0, lerp(g.vw - cx - hw, 0, w));
      const top = Math.max(0, lerp(cy - hh, 0, w));
      const bottom = Math.max(0, lerp(g.vh - cy - hh, 0, w));
      const radius = lerp(Math.min(2 * s, 24), 0, w);
      if (layerBRef.current) {
        layerBRef.current.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
      }

      /* hero some depois que a máscara cobre tudo */
      if (heroLayerRef.current) {
        const fade = 1 - span(p, T.heroFade[0], T.heroFade[1]);
        heroLayerRef.current.style.opacity = String(fade);
        heroLayerRef.current.style.visibility =
          fade <= 0.001 ? "hidden" : "visible";
      }

      /* headline sai com fade + translate-up */
      if (headlineRef.current) {
        const k = span(p, 0.015, full ? 0.09 : 0.2);
        headlineRef.current.style.opacity = String(1 - k);
        headlineRef.current.style.transform = `translateY(${-40 * k}px)`;
      }
      if (ctaRowRef.current) {
        const k = span(p, 0.01, full ? 0.07 : 0.16);
        ctaRowRef.current.style.opacity = String(1 - k);
        ctaRowRef.current.style.pointerEvents = k > 0.6 ? "none" : "auto";
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(1 - span(p, 0.005, 0.05));
      }

      /* o display liga */
      if (dispGlowRef.current) {
        const on =
          span(p, 0.004, full ? 0.05 : 0.12) *
          (1 - span(p, T.fullClip[0] * 0.92, T.fullClip[0]));
        dispGlowRef.current.style.opacity = String(on);
      }

      /* HUD de temperatura — o scroll é o relógio */
      if (hudRef.current && hudNumRef.current) {
        const temp =
          p <= T.a1[1]
            ? lerp(32, 42, span(p, T.a1[0], T.a1[1]))
            : lerp(42, 50, span(p, T.a2[0], T.a2[1]));
        hudNumRef.current.textContent = `${Math.round(temp)}°`;
        const vis =
          span(p, 0.012, full ? 0.05 : 0.1) *
          (1 - span(p, full ? 0.29 : 0.84, full ? 0.33 : 0.9));
        const st = hudRef.current.style;
        st.opacity = String(vis);
        st.left = `${cx}px`;
        st.top = `${cy}px`;
        st.fontSize = `${Math.min(Math.max(14, hh * 0.85), 110)}px`;
      }

      /* linha de sistema (Ato 3) */
      if (sysRef.current) {
        sysRef.current.style.opacity = String(
          0.3 * span(p, T.sysIn[0], T.sysIn[1]) * (1 - span(p, T.sysOut[0], T.sysOut[1]))
        );
      }

      if (full) {
        /* frase do Ato 4 */
        if (act4Ref.current) {
          act4Ref.current.style.opacity = String(
            span(p, 0.405, 0.44) * (1 - span(p, 0.465, 0.5))
          );
        }
        /* frase do Ato 6 */
        if (act6Ref.current) {
          act6Ref.current.style.opacity = String(
            span(p, 0.72, 0.755) * (1 - span(p, 0.8, 0.835))
          );
        }
        /* estouro de branco + finale */
        if (flashRef.current) {
          flashRef.current.style.opacity = String(
            easeInOut(span(p, 0.82, 0.865)) * (1 - span(p, 0.878, 0.93))
          );
        }
        if (finaleRef.current) {
          const k = span(p, 0.862, 0.9);
          finaleRef.current.style.opacity = String(k);
          finaleRef.current.style.pointerEvents = k > 0.7 ? "auto" : "none";
        }
        /* pré-aquece o canvas 3D bem antes da travessia */
        if (p > 0.04 && !armedRef.current) {
          armedRef.current = true;
          setArmed(true);
        }
      }
    },
    [mode]
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    computeGeo();
    update(0);

    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: mode === "full" ? 1 : 0.5,
      onUpdate: (self) => update(self.progress),
    });

    const onResize = () => {
      computeGeo();
      update(lastP.current);
    };
    window.addEventListener("resize", onResize);

    /* tilt 3D no mouse — máximo 2 graus, com spring suave */
    let qx: ((v: number) => void) | null = null;
    let qy: ((v: number) => void) | null = null;
    let setGlow: ((x: number, y: number) => void) | null = null;
    if (mode === "full" && tiltRef.current) {
      const toX = gsap.quickTo(tiltRef.current, "rotationX", {
        duration: 0.6,
        ease: "power2.out",
      });
      const toY = gsap.quickTo(tiltRef.current, "rotationY", {
        duration: 0.6,
        ease: "power2.out",
      });
      qx = toX;
      qy = toY;
      setGlow = (x, y) => {
        glowSpecRef.current?.style.setProperty("--gx", `${x}%`);
        glowSpecRef.current?.style.setProperty("--gy", `${y}%`);
      };
    }
    const onMouse = (e: MouseEvent) => {
      if (!qx || !qy) return;
      if (seq.p > 0.03) {
        qx(0);
        qy(0);
        return;
      }
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      qx(-ny * 2);
      qy(nx * 2);
      setGlow?.(
        (e.clientX / window.innerWidth) * 100,
        (e.clientY / window.innerHeight) * 100
      );
    };
    window.addEventListener("mousemove", onMouse);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [computeGeo, update, mode]);

  return (
    <div
      ref={wrapRef}
      style={{ height: TIMINGS[mode].height }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ---------- Camada A: o hero branco (Atos 0–2) ---------- */}
        <div ref={heroLayerRef} className="absolute inset-0 z-10 bg-branco">
          <div ref={translateRef} className="absolute inset-0 will-change-transform">
            <div ref={scaleRef} className="absolute inset-0 will-change-transform">
              {/* figura do aquecedor */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${FIG_CY * 100}vh`,
                  height: FIG_CSS,
                  width: FIG_CSS,
                  perspective: "1200px",
                }}
              >
                <div ref={tiltRef} className="relative h-full w-full">
                  <Image
                    src={withBase("/img/aquecedor.webp")}
                    alt="Aquecedor de água a gás de passagem instalado pela Água Quente Soluções"
                    fill
                    priority
                    sizes="45vh"
                    className="object-contain"
                  />
                  {/* glow especular seguindo o cursor */}
                  <div
                    ref={glowSpecRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 mix-blend-overlay"
                    style={{
                      background:
                        "radial-gradient(circle 220px at var(--gx,50%) var(--gy,40%), rgba(255,255,255,0.55), transparent 70%)",
                    }}
                  />
                </div>
                {/* sombra de contato */}
                <div
                  aria-hidden
                  className="absolute left-[12%] top-[99%] h-[5%] w-[76%] rounded-[50%] bg-tinta/10"
                  style={{ filter: "blur(14px)" }}
                />
              </div>

              {/* glow do display quando ele liga (Ato 1) */}
              <div
                ref={dispGlowRef}
                aria-hidden
                className="absolute rounded-aq opacity-0"
                style={{
                  background: "rgba(46,125,224,0.18)",
                  boxShadow:
                    "0 0 24px 4px rgba(46,125,224,0.45), 0 0 80px 16px rgba(46,125,224,0.18)",
                }}
              />
            </div>
          </div>

          {/* texto do hero — generoso, muito respiro */}
          <div
            ref={headlineRef}
            className="absolute inset-x-0 top-[8vh] text-center"
          >
            <h1 className="font-display text-[clamp(2.4rem,4.8vw,4.6rem)] font-light leading-[1.08] tracking-display text-tinta">
              Água quente.
              <br />
              <span className="font-medium">
                No momento em que você precisa.
              </span>
            </h1>
          </div>

          <div
            ref={ctaRowRef}
            className="absolute inset-x-0 top-[74vh] flex flex-col items-center gap-4 text-center md:top-[77vh] md:gap-5"
          >
            <p className="max-w-xl px-6 text-sm font-light text-tinta-2 md:text-base">
              Projeto, instalação e manutenção de sistemas de aquecimento. São
              Paulo, há mais de 30 anos.
            </p>
            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-aq bg-brasa px-9 py-4 text-base font-medium text-branco transition-[filter] duration-200 hover:brightness-110"
            >
              Solicite um orçamento
            </a>
          </div>

          <div
            ref={hintRef}
            className="absolute inset-x-0 bottom-[3.5vh] flex flex-col items-center gap-2"
          >
            <span className="font-mono text-[11px] lowercase tracking-[0.25em] text-tinta-2">
              role
            </span>
            <span className="aq-scroll-line" aria-hidden />
          </div>
        </div>

        {/* ---------- Camada B: o display / o mundo 3D ---------- */}
        <div
          ref={layerBRef}
          className="pointer-events-none absolute inset-0 z-20 bg-grafite"
          style={{ clipPath: "inset(47% 47% 47% 47%)" }}
          aria-hidden
        >
          {armed && mode === "full" && (
            <div className="absolute inset-0">
              <Scene3D />
            </div>
          )}

          {/* HUD de temperatura — único glassmorphism permitido */}
          <div
            ref={hudRef}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-baseline gap-3 rounded-aq border border-branco/10 bg-branco/5 px-[0.5em] py-[0.18em] opacity-0 backdrop-blur-sm"
          >
            <span
              ref={hudNumRef}
              className="font-mono leading-none text-[#cfe4ff]"
              style={{ textShadow: "0 0 18px rgba(46,125,224,0.65)" }}
            >
              32°
            </span>
            <span className="font-mono text-[0.22em] tracking-[0.3em] text-branco opacity-40">
              AQUECENDO
            </span>
          </div>

          {/* linha de sistema, Ato 3 */}
          <p
            ref={sysRef}
            className="absolute inset-x-0 bottom-[10vh] px-4 text-center font-mono text-[10px] tracking-[0.22em] text-branco opacity-0 md:text-xs md:tracking-[0.35em]"
          >
            SISTEMA ATIVO · 50 °C · PRESSÃO OK
          </p>
        </div>

        {mode === "full" && (
          <>
            {/* ---------- Frases dos Atos 4 e 6 ---------- */}
            <div
              ref={act4Ref}
              className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center opacity-0"
              aria-hidden
            >
              <p className="px-6 text-center font-display text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1.1] tracking-display text-branco">
                Daqui até o seu banho,
                <br />
                tem um caminho.
              </p>
            </div>
            <div
              ref={act6Ref}
              className="pointer-events-none absolute inset-0 z-[25] flex flex-col items-center justify-center gap-6 opacity-0"
              aria-hidden
            >
              <p className="px-6 text-center font-display text-[clamp(2.2rem,5vw,4.5rem)] font-light tracking-display text-branco">
                Aqui ela já está quente.
              </p>
              <p className="font-mono text-sm tracking-[0.35em] text-branco/60">
                60 °C · CHEGANDO
              </p>
            </div>

            {/* ---------- Camada D: o chuveiro (Ato 7) ---------- */}
            <div
              ref={finaleRef}
              className="absolute inset-0 z-30 opacity-0"
              style={{ pointerEvents: "none" }}
            >
              <FinaleContent />
            </div>

            {/* ---------- Estouro de branco ---------- */}
            <div
              ref={flashRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-40 bg-branco opacity-0"
            />
          </>
        )}
      </div>
    </div>
  );
}
