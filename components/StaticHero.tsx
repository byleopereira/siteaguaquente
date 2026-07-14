import Image from "next/image";
import { withBase } from "@/lib/asset";
import { WHATSAPP_CTA } from "@/lib/seq";

/** Hero estático — usado com prefers-reduced-motion. Nada anima. */
export default function StaticHero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-10 bg-branco px-6 py-24 text-center">
      <h1 className="font-display text-[clamp(2.4rem,4.8vw,4.6rem)] font-light leading-[1.08] tracking-display text-tinta">
        Água quente.
        <br />
        <span className="font-medium">No momento em que você precisa.</span>
      </h1>
      <div
        className="relative"
        style={{ height: "min(42vh, 80vw)", width: "min(42vh, 80vw)" }}
      >
        <Image
          src={withBase("/img/aquecedor.webp")}
          alt="Aquecedor de água a gás de passagem instalado pela Água Quente Soluções"
          fill
          priority
          sizes="42vh"
          className="object-contain"
        />
      </div>
      <p className="max-w-xl text-sm font-light text-tinta-2 md:text-base">
        Projeto, instalação e manutenção de sistemas de aquecimento. São Paulo,
        há mais de 30 anos.
      </p>
      <a
        href={WHATSAPP_CTA}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-aq bg-brasa px-9 py-4 text-base font-medium text-branco transition-[filter] duration-200 hover:brightness-110"
      >
        Solicite um orçamento
      </a>
    </section>
  );
}
