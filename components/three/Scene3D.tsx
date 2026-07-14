"use client";

/**
 * Atos 3–6 do plano-sequência.
 * Regras do briefing: nenhum shader de fluido. A água é geometria com material:
 * - cano  = TubeGeometry + MeshPhysicalMaterial (transmission = vidro)
 * - água  = segundo TubeGeometry, emissivo, com textura rolando (map.offset)
 * - fluxo = textura procedural gerada em canvas (seamless por construção)
 * - calor = cor/emissive/bloom interpolados por `p` — o scroll é o relógio
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { withBase } from "@/lib/asset";
import { BENEFICIOS, COLORS, clamp01, easeInOut, lerp, seq, span } from "@/lib/seq";

const UP = new THREE.Vector3(0, 1, 0);

const CURVE = new THREE.CatmullRomCurve3(
  [
    [0, 0, 0],
    [2.2, 0.35, -1.4],
    [4.4, -0.5, -2.6],
    [6.6, 0.4, -4.4],
    [8.6, -0.3, -6.6],
    [10.2, 0.5, -8.8],
    [11.8, 0.1, -11.2],
    [13.0, 1.2, -13.0],
    [13.8, 3.0, -14.0],
    [14.2, 5.4, -14.6],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.5
);

const TUBE_RADIUS = 0.6;
const WATER_RADIUS = 0.5;

/* A água corre no fundo do cano (cano parcialmente cheio): mesma curva,
   deslocada para baixo. Raio quase igual ao do vidro = rio largo, e a
   câmera viaja no eixo vendo o túnel fechar em cima. */
const WATER_CURVE = new THREE.CatmullRomCurve3(
  CURVE.points.map((v) => v.clone().setY(v.y - 0.42)),
  false,
  "catmullrom",
  0.5
);
const BUBBLE_COUNT = 140;
const PARTICLE_COUNT = 800;
const SMOKE_COUNT = 16;
const BENEFIT_TS = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8];

/** Textura de fluxo: riscos horizontais suaves, seamless por construção. */
function makeFlowTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#8da4b5";
  ctx.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 64; i++) {
    const y = Math.random() * 128;
    const len = 50 + Math.random() * 190;
    const x = Math.random() * 512;
    const claro = Math.random() > 0.35;
    const a = claro ? 0.35 + Math.random() * 0.5 : 0.15 + Math.random() * 0.2;
    const cor = claro ? "255,255,255" : "20,30,40";
    const h = 1 + Math.random() * 3;
    // desenha três vezes (x, x±512) para emendar sem costura
    for (const ox of [0, -512, 512]) {
      const g = ctx.createLinearGradient(x + ox, 0, x + ox + len, 0);
      g.addColorStop(0, `rgba(${cor},0)`);
      g.addColorStop(0.5, `rgba(${cor},${a})`);
      g.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x + ox, y, len, h);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(26, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function PipeWorld() {
  const { camera, scene } = useThree();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __scene?: THREE.Scene }).__scene = scene;
    }
  }, [scene]);

  const flowTex = useMemo(() => makeFlowTexture(), []);
  const smokeTex = useMemo(() => {
    const t = new THREE.TextureLoader().load(withBase("/img/smoke.png"));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const frames = useMemo(() => CURVE.computeFrenetFrames(220, false), []);

  /* linha do Ato 4 — um tubo fininho emissivo (linewidth de Line não
     funciona em ANGLE/Windows; o Bloom transforma isso num traço de luz).
     Ela nasce no caminho da água: a linha É a água. */
  const lineGeom = useMemo(() => {
    const g = new THREE.TubeGeometry(WATER_CURVE, 400, 0.03, 6, false);
    g.setDrawRange(0, 0);
    return g;
  }, []);
  const lineMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#9cc4ff",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  /* partículas do Ato 3 */
  const particleGeom = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = -3 + Math.random() * 19;
      pos[i * 3 + 1] = -3.5 + Math.random() * 7;
      pos[i * 3 + 2] = 4 - Math.random() * 21;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const particleMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: COLORS.frio,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  /* vapor — sprites discretos (material clonado por sprite p/ rotação própria) */
  const smokeSeeds = useMemo(
    () =>
      Array.from({ length: SMOKE_COUNT }, () => ({
        t: Math.random(),
        ang: Math.random() * Math.PI * 2,
        r: 1.6 + Math.random() * 2.4,
        scale: 3 + Math.random() * 3.5,
        spin: (Math.random() - 0.5) * 0.12,
        baseOp: 0.75 + Math.random() * 0.5,
      })),
    []
  );
  const smokeMats = useMemo(
    () =>
      smokeSeeds.map(
        () =>
          new THREE.SpriteMaterial({
            map: smokeTex,
            color: "#9db4c4",
            transparent: true,
            opacity: 0.07,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
      ),
    [smokeSeeds, smokeTex]
  );

  /* cano de vidro + água */
  const tubeGeom = useMemo(
    () => new THREE.TubeGeometry(CURVE, 220, TUBE_RADIUS, 24, false),
    []
  );
  /* Vidro: por dentro do cano, transmission de verdade fica cinza-opaco e
     custa uma passada extra de render. Uma casca glossy translúcida dá a
     leitura de vidro (reflexos do Environment) a 60fps. */
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        transparent: true,
        opacity: 0.42,
        roughness: 0.06,
        metalness: 0.1,
        color: "#a8c8de",
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        envMapIntensity: 2.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );
  const waterGeom = useMemo(
    () => new THREE.TubeGeometry(WATER_CURVE, 220, WATER_RADIUS, 16, false),
    []
  );
  /* água: unlit e brilhante — a cor é multiplicada acima de 1 pro Bloom pegar */
  const waterMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: flowTex,
        color: new THREE.Color(COLORS.frio),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    [flowTex]
  );

  /* o vidro e a água só existem a partir do Ato 4 — antes, só partículas */
  const tubeRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const duchaRef = useRef<THREE.Group>(null);

  /* bolhas */
  const bubbleRef = useRef<THREE.InstancedMesh>(null);
  const bubbleSeeds = useMemo(
    () =>
      Array.from({ length: BUBBLE_COUNT }, () => ({
        t0: Math.random(),
        ang: Math.random() * Math.PI * 2,
        r: 0.04 + Math.random() * 0.12,
        speed: 0.008 + Math.random() * 0.014,
        size: 0.5 + Math.random() * 0.9,
      })),
    []
  );
  const bubbleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#dfeeff",
        emissive: "#bcd8ff",
        emissiveIntensity: 0.5,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  /* luzes */
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const coldRef = useRef<THREE.DirectionalLight>(null);
  const warmRef = useRef<THREE.DirectionalLight>(null);
  const travelRef = useRef<THREE.PointLight>(null);

  /* benefícios presos ao cano */
  const benefitAnchors = useMemo(
    () =>
      BENEFIT_TS.map((t, i) => {
        const pos = CURVE.getPointAt(t).clone();
        const fi = Math.min(
          frames.binormals.length - 1,
          Math.floor(t * frames.binormals.length)
        );
        const side = i % 2 === 0 ? 1 : -1;
        // na subida final o cano fica íngreme — texto mais centrado
        const lateral = i >= 4 ? 0.55 : 0.95;
        pos.addScaledVector(frames.binormals[fi], side * lateral);
        pos.addScaledVector(UP, i >= 4 ? 0.5 : 0.3);
        return pos;
      }),
    [frames]
  );
  const benefitRefs = useRef<(HTMLDivElement | null)[]>([]);

  const bloomRef = useRef<any>(null);

  /* vetores temporários (sem GC no loop) */
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      p3pos: new THREE.Vector3(-2.0, 0.55, 3.4),
      p3look: new THREE.Vector3(4.5, -0.3, -4),
      entryPos: new THREE.Vector3(),
      entryLook: new THREE.Vector3(),
      obj: new THREE.Object3D(),
      colFrio: new THREE.Color(COLORS.frio),
      colMorno: new THREE.Color(COLORS.morno),
      colBrasa: new THREE.Color(COLORS.brasa),
      colWater: new THREE.Color(),
      colTravel: new THREE.Color(),
      white: new THREE.Color("#ffffff"),
    }),
    []
  );

  useEffect(() => {
    const e0 = CURVE.getPointAt(0);
    const tan0 = CURVE.getTangentAt(0);
    tmp.entryPos.copy(e0).addScaledVector(tan0, -1.1).addScaledVector(UP, 0.3);
    tmp.entryLook.copy(e0).addScaledVector(tan0, 2).addScaledVector(UP, 0.1);
  }, [tmp]);

  useFrame((state, delta) => {
    const p = seq.p;
    const time = state.clock.elapsedTime;
    const heat = easeInOut(span(p, 0.55, 0.8));

    /* ------- câmera ------- */
    if (p < 0.4) {
      // Ato 3: quase parada, deriva mínima
      tmp.pos
        .copy(tmp.p3pos)
        .addScaledVector(UP, Math.sin(time * 0.25) * 0.06);
      tmp.pos.x += Math.sin(time * 0.18) * 0.08;
      camera.position.copy(tmp.pos);
      camera.lookAt(tmp.p3look);
    } else if (p < 0.48) {
      // Ato 4: aproxima da entrada do cano
      const k = easeInOut(span(p, 0.4, 0.48));
      tmp.pos.lerpVectors(tmp.p3pos, tmp.entryPos, k);
      tmp.look.lerpVectors(tmp.p3look, tmp.entryLook, k);
      camera.position.copy(tmp.pos);
      camera.lookAt(tmp.look);
    } else {
      // Atos 5–7: viaja no eixo do cano; o rio de água brilha logo abaixo.
      const t = span(p, 0.48, 0.86) * 0.94;
      CURVE.getPointAt(t, tmp.pos).addScaledVector(UP, 0.2);
      CURVE.getPointAt(Math.min(t + 0.05, 1), tmp.look).addScaledVector(UP, 0.12);
      camera.position.copy(tmp.pos);
      camera.lookAt(tmp.look);
    }

    /* ------- vidro/água entram junto com a luz, na boca do cano ------- */
    const worldOn = p > 0.465;
    if (tubeRef.current) tubeRef.current.visible = worldOn;
    if (waterRef.current) waterRef.current.visible = worldOn;
    if (bubbleRef.current) bubbleRef.current.visible = p > 0.48;
    if (duchaRef.current) duchaRef.current.visible = worldOn;

    /* ------- linha do Ato 4 ------- */
    const lineT = easeInOut(span(p, 0.4, 0.48));
    const idxCount = lineGeom.index ? lineGeom.index.count : 0;
    lineGeom.setDrawRange(0, Math.floor((idxCount * lineT) / 3) * 3);
    lineMat.opacity =
      span(p, 0.4, 0.43) * (1 - span(p, 0.5, 0.56)) * 0.95;

    /* ------- água ------- */
    const waterOn = span(p, 0.46, 0.54);
    if (heat < 0.5) {
      tmp.colWater.lerpColors(tmp.colFrio, tmp.colMorno, heat * 2);
    } else {
      tmp.colWater.lerpColors(tmp.colMorno, tmp.colBrasa, (heat - 0.5) * 2);
    }
    // o corpo segue quase branco no centro; o que aquece é o glow
    // a água nunca fica laranja de fato: o corpo clareia, o glow esquenta
    waterMat.color
      .copy(tmp.colWater)
      .lerp(tmp.white, 0.18 + heat * 0.3)
      .multiplyScalar(1.05 + heat * 0.6);
    waterMat.opacity = waterOn;
    flowTex.offset.x -= delta * (0.55 + heat * 1.6);

    /* ------- bolhas: mais rápidas e menores com o calor ------- */
    if (bubbleRef.current) {
      const n = frames.binormals.length;
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        const b = bubbleSeeds[i];
        const ti =
          (b.t0 + time * b.speed * (0.55 + heat * 1.5)) % 1;
        WATER_CURVE.getPointAt(ti, tmp.obj.position);
        const fi = Math.min(n - 1, Math.floor(ti * n));
        // bolhas patinam na superfície do rio, não no miolo
        tmp.obj.position
          .addScaledVector(UP, WATER_RADIUS - 0.03 + b.r * 0.5)
          .addScaledVector(frames.binormals[fi], Math.cos(b.ang) * 0.3);
        // some suavemente quando passa perto demais da câmera
        const dCam = tmp.obj.position.distanceTo(camera.position);
        const near = Math.min(1, Math.max(0, (dCam - 0.35) / 0.8));
        const s = 0.014 * b.size * (1 - heat * 0.35) * near;
        tmp.obj.scale.setScalar(s);
        tmp.obj.updateMatrix();
        bubbleRef.current.setMatrixAt(i, tmp.obj.matrix);
      }
      bubbleRef.current.instanceMatrix.needsUpdate = true;
      bubbleMat.opacity = waterOn * 0.55;
    }

    /* ------- partículas: somem antes da câmera entrar no cano ------- */
    particleMat.opacity = 0.55 * (1 - span(p, 0.47, 0.53));

    /* ------- vapor ------- */
    smokeMats.forEach((m, i) => {
      const seed = smokeSeeds[i];
      m.opacity = (0.05 + heat * 0.08) * seed.baseOp;
      m.rotation = time * seed.spin;
    });

    /* ------- luzes: de fria pra quente ------- */
    const lightsOn = span(p, 0.44, 0.54);
    if (ambientRef.current)
      ambientRef.current.intensity = 0.05 + lightsOn * 0.18;
    if (coldRef.current)
      coldRef.current.intensity = lightsOn * 1.1 * (1 - heat);
    if (warmRef.current) warmRef.current.intensity = lightsOn * 1.6 * heat;
    if (travelRef.current) {
      travelRef.current.position.copy(camera.position);
      travelRef.current.position.y += 0.3;
      tmp.colTravel.lerpColors(tmp.colFrio, tmp.colBrasa, heat);
      travelRef.current.color.copy(tmp.colTravel);
      travelRef.current.intensity = lightsOn * (3.4 + heat * 2.6);
    }

    /* ------- benefícios: aparecem quando a câmera chega perto ------- */
    /* pico de opacidade quando a âncora está ~0.055 à frente da câmera —
       o texto vive à frente, nunca na lateral extrema da tela */
    const camT = p >= 0.48 ? span(p, 0.48, 0.86) * 0.94 : -1;
    benefitRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = BENEFIT_TS[i] - camT;
      const op =
        camT < 0 ? 0 : clamp01(1 - Math.abs(d - 0.055) / 0.055);
      el.style.opacity = String(op);
      el.style.transform = `translateY(${(1 - op) * 14}px)`;
    });

    /* ------- bloom: sobe com o calor, estoura na saída ------- */
    if (bloomRef.current) {
      bloomRef.current.intensity =
        0.35 + heat * 0.95 + easeInOut(span(p, 0.82, 0.87)) * 6;
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={[COLORS.grafite, 0.058]} />
      <ambientLight ref={ambientRef} intensity={0.05} />
      <directionalLight
        ref={coldRef}
        position={[-4, 6, 4]}
        color="#8db8ee"
        intensity={0}
      />
      <directionalLight
        ref={warmRef}
        position={[8, 5, -8]}
        color="#ff9a5c"
        intensity={0}
      />
      <pointLight ref={travelRef} intensity={0} distance={7} decay={1.8} />

      {/* partículas azuis, quase paradas */}
      <points geometry={particleGeom} material={particleMat} />

      {/* a linha — protagonista do Ato 4 */}
      <mesh geometry={lineGeom} material={lineMat} frustumCulled={false} />

      {/* cano de vidro */}
      <mesh ref={tubeRef} geometry={tubeGeom} material={glassMat} visible={false} />

      {/* água emissiva dentro do cano */}
      <mesh ref={waterRef} geometry={waterGeom} material={waterMat} visible={false} />

      {/* bolhas */}
      <instancedMesh
        ref={bubbleRef}
        args={[undefined, undefined, BUBBLE_COUNT]}
        material={bubbleMat}
        visible={false}
      >
        <sphereGeometry args={[1, 10, 10]} />
      </instancedMesh>

      {/* vapor */}
      {smokeSeeds.map((s, i) => {
        const pos = CURVE.getPointAt(s.t).clone();
        const fi = Math.min(
          frames.binormals.length - 1,
          Math.floor(s.t * frames.binormals.length)
        );
        pos
          .addScaledVector(frames.binormals[fi], Math.cos(s.ang) * s.r)
          .addScaledVector(UP, Math.sin(s.ang) * s.r * 0.6);
        return (
          <sprite
            key={i}
            position={pos}
            scale={[s.scale, s.scale, 1]}
            material={smokeMats[i]}
          />
        );
      })}

      {/* a ducha no fim do caminho */}
      <group
        ref={duchaRef}
        visible={false}
        position={CURVE.getPointAt(1).toArray() as [number, number, number]}
      >
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.1, 12]} />
          <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.62, 0.08, 32]} />
          <meshStandardMaterial color="#d4d8db" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* benefícios — texto preso ao cano, sem card, sem caixa */}
      {benefitAnchors.map((pos, i) => (
        <Html
          key={i}
          position={pos.toArray()}
          center
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => {
              benefitRefs.current[i] = el;
            }}
            style={{ opacity: 0, width: "min(30rem, 36vw)" }}
            className="select-none text-center"
          >
            <p className="font-display text-3xl font-light tracking-display text-branco md:text-5xl">
              {BENEFICIOS[i].titulo}
            </p>
            <p className="mt-3 text-sm font-light text-branco/60 md:text-base">
              {BENEFICIOS[i].apoio}
            </p>
          </div>
        </Html>
      ))}

      {/* brilho certo no vidro, sem HDRI externo */}
      <Environment resolution={64} frames={1}>
        {/* longa softbox no "céu" — desenha o brilho do teto de vidro */}
        <Lightformer
          intensity={2.2}
          position={[7, 9, -7]}
          rotation={[Math.PI / 2, 0, Math.PI / 4]}
          scale={[34, 3, 1]}
          color="#cfe2f4"
        />
        <Lightformer
          intensity={1.1}
          position={[0, 4, -6]}
          scale={[9, 2, 1]}
          color="#dfe9f2"
        />
        <Lightformer
          intensity={0.7}
          position={[-5, -2, 3]}
          scale={[6, 1.5, 1]}
          color="#9fc3ee"
        />
        <Lightformer
          intensity={0.6}
          position={[6, 2, 5]}
          scale={[4, 1, 1]}
          color="#ffd9b8"
        />
      </Environment>

      <EffectComposer multisampling={0}>
        <Bloom
          ref={bloomRef}
          intensity={0.35}
          luminanceThreshold={0.22}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 58, near: 0.05, far: 80, position: [-2, 0.55, 3.4] }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <color attach="background" args={[COLORS.grafite]} />
      <PipeWorld />
    </Canvas>
  );
}
