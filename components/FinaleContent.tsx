import Image from "next/image";
import { withBase } from "@/lib/asset";
import { EMPRESA, WHATSAPP_CTA } from "@/lib/seq";

/**
 * Ato 7 — o chuveiro. Foto real + camada de vapor que continua se movendo
 * depois que a página para. Usado dentro do plano-sequência (desktop) e
 * como seção normal nos fallbacks.
 */
export default function FinaleContent({ priority = false }: { priority?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-grafite">
      <Image
        src={withBase("/img/chuveiro.webp")}
        alt="Chuveiro moderno despejando água quente com vapor em banheiro minimalista"
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />

      {/* vapor vivo por cima da foto */}
      <div
        aria-hidden
        className="aq-steam-a pointer-events-none absolute inset-[-10%] mix-blend-screen opacity-50"
        style={{
          backgroundImage: `url(${withBase("/img/vapor.webp")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        aria-hidden
        className="aq-steam-b pointer-events-none absolute inset-[-14%] mix-blend-screen opacity-30"
        style={{
          backgroundImage: `url(${withBase("/img/vapor.webp")})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />

      {/* leve escurecida para legibilidade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(11,13,14,0.55) 0%, rgba(11,13,14,0.15) 45%, rgba(11,13,14,0.05) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-[12vh] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBase("/img/logo-clara.png")}
          alt=""
          aria-hidden
          className="mb-8 h-14 w-auto opacity-90 md:h-16"
        />
        <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-light leading-[1.05] tracking-display text-branco">
          O conforto começa
          <br />
          antes da primeira gota.
        </h2>
        <p className="mt-6 max-w-xl px-6 text-base font-light text-branco/70 md:text-lg">
          Projeto, instalação e manutenção para transformar o seu banho — e a
          sua casa inteira.
        </p>
        <div className="mt-10 flex flex-col items-center gap-5">
          <a
            href={WHATSAPP_CTA}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-aq bg-brasa px-10 py-4 text-base font-medium text-branco transition-[filter] duration-200 hover:brightness-110"
          >
            Solicite um orçamento
          </a>
          <a
            href={WHATSAPP_CTA}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-branco/60 transition-colors duration-200 hover:text-branco"
          >
            {EMPRESA.telefoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
