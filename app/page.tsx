import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import { LANDING_CONTENT } from "@/src/config/landingContent";
import type { NicheType } from "@/src/types/funnel";

const HUB_LANDINGS: Array<{
  niche: NicheType;
  href: string;
  accent: string;
  image: string;
}> = [
  {
    niche: "inmobiliaria",
    href: "/inmobiliaria",
    accent: "from-emerald-900/85 to-emerald-900/20",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    niche: "arquitectos",
    href: "/arquitectos",
    accent: "from-stone-900/85 to-stone-900/20",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    niche: "abogados",
    href: "/abogados",
    accent: "from-slate-900/85 to-slate-900/20",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    niche: "hospedajes",
    href: "/hospedajes",
    accent: "from-teal-900/85 to-teal-900/20",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#f7f3ee,_#ebe4da_45%,_#e2d8cc)] font-jakarta text-zinc-900">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(232,168,188,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(174,203,218,0.35), transparent 35%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-14 md:px-8 md:pb-16 md:pt-20">
            <p className="font-fraunces text-3xl tracking-tight md:text-4xl">
              katem<span className="text-[#E8A8BC]">.</span>store
            </p>
            <h1 className="mt-5 max-w-3xl font-fraunces text-4xl leading-[1.05] tracking-tight text-balance md:text-6xl">
              Landings de conversión por nicho
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-700 md:text-lg">
              Formularios de 2 pasos, calificación al instante y continuidad por
              WhatsApp. Elegí un vertical y probá el embudo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/inmobiliaria"
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Ver inmobiliaria
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-zinc-400/70 bg-white/60 px-5 py-2.5 text-sm font-semibold text-zinc-800 backdrop-blur hover:bg-white"
              >
                Abrir admin
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {HUB_LANDINGS.map((item) => {
              const content = LANDING_CONTENT[item.niche];
              return (
                <Link
                  key={item.niche}
                  href={item.href}
                  className="group relative min-h-[280px] overflow-hidden rounded-[1.5rem] shadow-[0_20px_50px_rgba(36,22,33,0.12)] transition duration-300 hover:-translate-y-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${item.accent}`}
                  />
                  <div className="relative flex h-full flex-col justify-end p-6 text-white md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                      {content.badge}
                    </p>
                    <h2 className="mt-2 font-fraunces text-3xl tracking-tight">
                      {content.brand}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85">
                      {content.headline}
                    </p>
                    <span className="mt-5 inline-flex w-fit rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur transition group-hover:bg-white/25">
                      Abrir landing →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-zinc-600">
            Demo clínica:{" "}
            <Link href="/psicologos" className="underline-offset-2 hover:underline">
              /psicologos
            </Link>
            {" · "}
            Legacy funnel:{" "}
            <Link href="/funnel" className="underline-offset-2 hover:underline">
              /funnel
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
