"use client";

/**
 * O resto da página, depois do plano-sequência. Curto e quieto.
 * Fundo branco, muito respiro, fade de 200ms na entrada — nada mais anima.
 * Copy exato de 02_COPY_AGUAQUENTE.md.
 */

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/asset";
import { EMPRESA, whatsappUrl } from "@/lib/seq";

/* ---------- reveal: fade curto (200ms) na entrada ---------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`aq-fade-in ${className}`}>
      {children}
    </div>
  );
}

/* ---------- 1 · O que fazemos ---------- */
const SERVICOS = [
  {
    nome: "Aquecimento de água",
    texto:
      "Gás, solar ou elétrico. Passagem, acumulação ou conjugado. Com retorno em todos os pontos.",
  },
  {
    nome: "Piscinas",
    texto:
      "Construção e aquecimento no mesmo projeto. Solar pra economia, gás pra temperatura na hora.",
  },
  {
    nome: "Redes de gás",
    texto:
      "Ramal e prumada, inclusive por método não destrutivo. Sem transformar o condomínio em obra.",
  },
  {
    nome: "Pressurização e bombas",
    texto:
      "Bomba, recalque e quadro de automação. Pressão que chega no último andar.",
  },
  {
    nome: "Manutenção e PMOC",
    texto:
      "Preventiva com laudo assinado. Acima de 60.000 BTU/h, o PMOC é lei — não escolha.",
  },
];

function OQueFazemos() {
  return (
    <section id="o-que-fazemos" className="bg-branco px-6 py-28 md:py-36">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.15] tracking-display text-tinta">
            Água quente é um sistema,
            <br />
            não um aparelho.
          </h2>
        </Reveal>
        <div className="mt-16">
          {SERVICOS.map((s) => (
            <Reveal key={s.nome}>
              <div className="grid gap-2 border-t border-tinta/10 py-8 md:grid-cols-[16rem_1fr] md:gap-8">
                <h3 className="font-display text-lg font-medium text-tinta">
                  {s.nome}
                </h3>
                <p className="text-base font-light leading-relaxed text-tinta-2">
                  {s.texto}
                </p>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-tinta/10" />
        </div>
      </div>
    </section>
  );
}

/* ---------- 2 · Faixa de fatos ---------- */
const FATOS = [
  ["30+ anos", "de mercado"],
  ["SP · litoral · interior", "área de atuação"],
  ["Gás · solar · elétrico", "as três fontes"],
  ["Projeto → manutenção", "escopo completo"],
];

function FaixaDeFatos() {
  return (
    <section className="bg-nevoa px-6 py-16">
      <Reveal>
        <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-tinta/10 sm:grid-cols-2 sm:divide-y-0 md:grid-cols-4 md:divide-x">
          {FATOS.map(([dado, rotulo]) => (
            <div key={dado} className="px-6 py-6 text-center">
              <p className="font-mono text-lg text-tinta">{dado}</p>
              <p className="mt-1 font-mono text-xs tracking-wider text-tinta-2">
                {rotulo}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- 3 · Para quem ---------- */
const PUBLICOS = [
  {
    nome: "Residência",
    texto:
      "Da casa com um aquecedor à residência de alto padrão com piscina, sauna e retorno em todos os pontos.",
  },
  {
    nome: "Condomínio",
    texto:
      "Prumada de gás, pressurização, individualização de medição e PMOC assinado.",
  },
  {
    nome: "Arquiteto e construtora",
    texto:
      "Entramos na fase de projeto. Dimensionamento, memorial e ART — antes da parede subir.",
  },
  {
    nome: "Hotel, indústria e clínica",
    texto:
      "Alta demanda simultânea, bateria de gás, automação e manutenção com prioridade.",
  },
];

function ParaQuem() {
  return (
    <section className="bg-branco px-6 py-28 md:py-36">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.15] tracking-display text-tinta">
            Mesma exigência técnica,
            <br />
            escalas diferentes.
          </h2>
        </Reveal>
        <div className="mt-16">
          {PUBLICOS.map((p) => (
            <Reveal key={p.nome}>
              <div className="grid gap-2 border-t border-tinta/10 py-8 md:grid-cols-[16rem_1fr] md:gap-8">
                <h3 className="font-display text-lg font-medium text-tinta">
                  {p.nome}
                </h3>
                <p className="text-base font-light leading-relaxed text-tinta-2">
                  {p.texto}
                </p>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-tinta/10" />
        </div>
      </div>
    </section>
  );
}

/* ---------- 4 · FAQ ---------- */
const FAQS = [
  {
    q: "Quanto tempo leva a instalação?",
    a: "Aquecedor a gás: 1 a 2 dias. Sistema solar completo: 3 a 5 dias. Piscina com aquecimento depende do porte — na visita técnica a gente te dá a data.",
  },
  {
    q: "Solar compensa mesmo em São Paulo?",
    a: "Compensa. O retorno médio fica entre 2 e 4 anos e depois a operação é praticamente de graça. Em dia nublado o sistema de apoio cobre — por isso ele já entra no projeto desde o começo.",
  },
  {
    q: "Vocês emitem ART?",
    a: "Sim. Todo projeto de gás e todo sistema com responsabilidade estrutural sai com ART assinada por engenheiro.",
  },
  {
    q: "Dá pra instalar rede de gás sem quebrar tudo?",
    a: "Na maioria dos casos, sim. Trabalhamos com método não destrutivo para ramal e prumada.",
  },
  {
    q: "Vocês atendem fora de São Paulo?",
    a: "Capital, litoral e interior. Fora disso, pergunte — dependendo do porte, vamos.",
  },
  {
    q: "Qual a garantia?",
    a: "12 meses documentados no serviço executado, além da garantia do fabricante do equipamento.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="bg-branco px-6 pb-28 md:pb-36">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light tracking-display text-tinta">
            Perguntas frequentes
          </h2>
        </Reveal>
        <div className="mt-10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q}>
                <div className="border-t border-tinta/10">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-base font-medium text-tinta md:text-lg">
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className={`font-mono text-lg text-tinta-2 transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-200 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 pr-10 text-base font-light leading-relaxed text-tinta-2">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
          <div className="border-t border-tinta/10" />
        </div>
      </div>
    </section>
  );
}

/* ---------- 5 · Orçamento ---------- */
const TIPOS = [
  "aquecimento de água",
  "piscina",
  "rede de gás",
  "pressurização",
  "manutenção/PMOC",
  "não sei ainda",
];

function Orcamento() {
  const [nome, setNome] = useState("");
  const [zap, setZap] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "erro">("idle");

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!zap.trim()) {
      setStatus("erro");
      return;
    }
    const msg = `Olá! Vim pelo site. Preciso de: ${tipo}. Detalhes: ${
      desc.trim() || "—"
    }. Meu nome: ${nome.trim() || "—"}.`;
    window.open(whatsappUrl(msg), "_blank", "noopener,noreferrer");
    setStatus("ok");
  }

  const inputCls =
    "w-full rounded-aq border border-tinta/15 bg-branco px-4 py-3 text-base font-light text-tinta placeholder:text-tinta-2/60 focus:border-frio focus:outline-none";

  return (
    <section id="orcamento" className="bg-nevoa px-6 py-28 md:py-36">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] font-light leading-[1.15] tracking-display text-tinta">
            Diga o que você precisa.
            <br />A gente responde com prazo e preço.
          </h2>
          <p className="mt-4 text-base font-light text-tinta-2">
            Se já tiver projeto ou planta, melhor. Se não tiver, a visita
            técnica resolve.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <form onSubmit={enviar} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="aq-nome"
                className="mb-2 block font-mono text-xs tracking-wider text-tinta-2"
              >
                NOME OU EMPRESA *
              </label>
              <input
                id="aq-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputCls}
                autoComplete="name"
              />
            </div>
            <div>
              <label
                htmlFor="aq-zap"
                className="mb-2 block font-mono text-xs tracking-wider text-tinta-2"
              >
                WHATSAPP *
              </label>
              <input
                id="aq-zap"
                value={zap}
                onChange={(e) => {
                  setZap(e.target.value);
                  if (status === "erro") setStatus("idle");
                }}
                className={inputCls}
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 9…"
              />
            </div>
            <div>
              <label
                htmlFor="aq-tipo"
                className="mb-2 block font-mono text-xs tracking-wider text-tinta-2"
              >
                O QUE VOCÊ PRECISA?
              </label>
              <select
                id="aq-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={inputCls}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="aq-desc"
                className="mb-2 block font-mono text-xs tracking-wider text-tinta-2"
              >
                DESCRIÇÃO (OPCIONAL)
              </label>
              <textarea
                id="aq-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col items-start gap-4 pt-2">
              <button
                type="submit"
                className="rounded-aq bg-brasa px-9 py-4 text-base font-medium text-branco transition-[filter] duration-200 hover:brightness-110"
              >
                Enviar pelo WhatsApp
              </button>
              {status === "ok" && (
                <p className="text-sm font-light text-tinta" role="status">
                  Pronto — abrimos o WhatsApp pra você.
                </p>
              )}
              {status === "erro" && (
                <p className="text-sm font-light text-brasa" role="alert">
                  Faltou o WhatsApp. Sem ele não conseguimos te responder.
                </p>
              )}
              <a
                href={whatsappUrl("Olá! Vim pelo site. Quero um orçamento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-tinta-2 transition-colors duration-200 hover:text-tinta"
              >
                {EMPRESA.telefoneDisplay}
              </a>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 6 · Rodapé ---------- */
function Rodape() {
  return (
    <footer className="bg-branco px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBase("/img/logo-escura.png")}
              alt="Água Quente Soluções"
              className="h-12 w-auto"
            />
            <p className="mt-4 text-sm font-light text-tinta-2">
              {EMPRESA.tagline}
            </p>
            <address className="mt-6 text-sm font-light not-italic leading-relaxed text-tinta-2">
              {EMPRESA.endereco}
              <br />
              {EMPRESA.cidade}
              <br />
              {EMPRESA.telefoneDisplay} · {EMPRESA.horario}
              <br />
              <a
                href={`mailto:${EMPRESA.email}`}
                className="transition-colors hover:text-tinta"
              >
                {EMPRESA.email}
              </a>
            </address>
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <nav aria-label="Links do rodapé">
              <ul className="space-y-3 text-sm font-light text-tinta-2">
                <li>
                  <a href="#o-que-fazemos" className="transition-colors hover:text-tinta">
                    O que fazemos
                  </a>
                </li>
                <li>
                  <a href="#o-que-fazemos" className="transition-colors hover:text-tinta">
                    Piscinas
                  </a>
                </li>
                <li>
                  <a href="#o-que-fazemos" className="transition-colors hover:text-tinta">
                    Manutenção e PMOC
                  </a>
                </li>
                <li>
                  <a href="#orcamento" className="transition-colors hover:text-tinta">
                    Orçamento
                  </a>
                </li>
                <li>
                  <a
                    href={EMPRESA.lojaOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-tinta"
                  >
                    Loja online
                  </a>
                </li>
              </ul>
            </nav>
            <nav aria-label="Redes sociais">
              <ul className="space-y-3 text-sm font-light text-tinta-2">
                <li>
                  <a
                    href={EMPRESA.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-tinta"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href={EMPRESA.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-tinta"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href={EMPRESA.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-tinta"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="mt-16 space-y-2 border-t border-tinta/10 pt-6">
          <p className="font-mono text-[11px] text-tinta-2/70">
            {EMPRESA.assistencia}
          </p>
          <p className="font-mono text-[11px] text-tinta-2/70">
            © {new Date().getFullYear()} {EMPRESA.nome} · {EMPRESA.descritor} ·
            CNPJ {EMPRESA.cnpj} · Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function QuietSections() {
  return (
    <>
      <OQueFazemos />
      <FaixaDeFatos />
      <ParaQuem />
      <Faq />
      <Orcamento />
      <Rodape />
    </>
  );
}
