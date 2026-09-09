import Image from "next/image";
import { SITE } from "@/lib/constants";

export default function SobreMi() {
  return (
    <section id="sobre-mi" className="border-t border-borde bg-fondo py-20 md:py-28">
      <div className="mx-auto grid max-w-content items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-softer md:mx-0 md:max-w-md">
          <Image
            src="/images/camila-sobre.jpg"
            alt="Retrato de la Dra. Camila Ríos en su consultorio"
            fill
            sizes="(max-width: 768px) 90vw, 40vw"
            className="object-cover object-center"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-salvia-dark">
            Sobre mí
          </p>
          <h2 className="font-display text-3xl tracking-tight text-texto md:text-4xl">
            Hola, soy Camila
          </h2>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-texto/80 md:text-lg">
            <p>
              Soy psicóloga clínica y acompaño a personas y parejas que buscan
              entenderse mejor, bajar la ansiedad y recuperar un sentido de
              calma en lo cotidiano. Trabajo en {SITE.city}, de forma presencial
              y online, en {SITE.languages}.
            </p>
            <p>
              Mi enfoque es cercano y práctico: te ayudo a poner en palabras lo
              que duele, sin juicios, y a encontrar herramientas que sí puedas
              usar fuera de la sesión. Creo en una terapia que se siente humana,
              clara y respetuosa de tu ritmo.
            </p>
          </div>

          <ul className="mt-8 space-y-2 border-t border-borde pt-6 text-sm text-texto/75 md:text-base">
            <li>
              <span className="font-medium text-texto">Formación:</span>{" "}
              Doctorado en Psicología Clínica · Universidad de Miami
            </li>
            <li>
              <span className="font-medium text-texto">Licencia:</span> Florida{" "}
              {SITE.license}
            </li>
            <li>
              <span className="font-medium text-texto">Experiencia:</span>{" "}
              {SITE.experience} acompañando adultos y parejas
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
