import Image from "next/image";
import { SITE, whatsappUrl } from "@/lib/constants";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[linear-gradient(165deg,#faf7f2_0%,#f3eee6_48%,#e8efe9_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(124,152,133,0.14),transparent_50%),radial-gradient(ellipse_at_85%_70%,rgba(201,139,110,0.12),transparent_45%)]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-content items-end gap-10 px-5 pb-14 pt-28 md:grid-cols-2 md:items-center md:gap-12 md:px-8 md:pb-20 md:pt-32">
        <div className="order-2 md:order-1">
          <p className="mb-3 font-display text-4xl font-medium leading-[1.1] tracking-tight text-texto sm:text-5xl lg:text-[3.5rem]">
            {SITE.name}
          </p>
          <p className="mb-6 text-sm text-texto/70 md:text-base">
            {SITE.specialty}
          </p>

          <h1 className="font-display text-2xl leading-snug tracking-tight text-texto text-balance sm:text-3xl lg:text-[2rem]">
            Un espacio para vos, en español
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-texto/75 md:text-lg">
            Terapia con calidez y claridad, para cuando necesitás sentir que te
            escuchan de verdad.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#agendar"
              className="inline-flex items-center justify-center rounded-full bg-terracota px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-terracota-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
            >
              Agendar consulta
            </a>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-borde bg-white/60 px-7 py-3.5 text-base font-medium text-texto transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia"
            >
              Escribir por WhatsApp
            </a>
          </div>

          <p className="mt-6 text-sm text-texto/65">
            Atención en español e inglés · Licencia en Florida
          </p>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-softer md:ml-auto md:max-w-none">
            <Image
              src="/images/camila-hero.jpg"
              alt="Dra. Camila Ríos, psicóloga clínica en Miami"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2b2621]/25 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
