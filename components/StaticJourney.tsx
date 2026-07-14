import FinaleContent from "./FinaleContent";
import { BENEFICIOS, COLORS } from "@/lib/seq";

/**
 * Fallback do caminho da água (mobile / sem WebGL / reduced motion):
 * os benefícios viram seções estáticas bem tipografadas, costuradas por uma
 * linha que esquenta — azul frio no topo, brasa embaixo. A mesma história,
 * sem 3D.
 */
export function StaticJourney() {
  return (
    <section aria-label="Benefícios" className="relative bg-branco">
      <div className="mx-auto max-w-3xl px-6 py-28 md:py-36">
        <p className="text-center font-display text-[clamp(1.9rem,5.5vw,3rem)] font-light leading-[1.15] tracking-display text-tinta">
          Daqui até o seu banho,
          <br />
          tem um caminho.
        </p>

        <div className="relative mt-20 md:mt-28">
          {/* a linha que esquenta */}
          <div
            aria-hidden
            className="absolute bottom-4 left-[3px] top-4 w-px md:left-1/2"
            style={{
              background: `linear-gradient(to bottom, ${COLORS.frio}, ${COLORS.morno} 55%, ${COLORS.brasa})`,
            }}
          />
          <ol className="space-y-24 md:space-y-32">
            {BENEFICIOS.map((b, i) => (
              <li
                key={b.titulo}
                className={`relative pl-10 md:w-1/2 md:pl-0 ${
                  i % 2 === 0
                    ? "md:pr-14 md:text-right"
                    : "md:ml-auto md:pl-14"
                }`}
              >
                <span className="font-mono text-xs text-tinta-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-3xl font-light tracking-display text-tinta md:text-4xl">
                  {b.titulo}
                </h3>
                <p className="mt-3 text-base font-light text-tinta-2">
                  {b.apoio}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-28 text-center font-display text-[clamp(1.9rem,5.5vw,3rem)] font-light tracking-display text-tinta">
          Aqui ela já está quente.
        </p>
        <p className="mt-4 text-center font-mono text-sm tracking-[0.35em] text-tinta-2">
          60 °C · CHEGANDO
        </p>
      </div>
    </section>
  );
}

/** Ato 7 como seção normal de página (fallbacks). */
export function FinaleSection() {
  return (
    <section aria-label="Solicite um orçamento" className="relative h-[92vh]">
      <FinaleContent />
    </section>
  );
}
