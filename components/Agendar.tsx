import { MessageCircle } from "lucide-react";
import BookingCalendar from "@/components/BookingCalendar";
import { whatsappUrl } from "@/lib/constants";

export default function Agendar() {
  return (
    <section
      id="agendar"
      className="border-t border-borde bg-[linear-gradient(180deg,#f3eee6_0%,#faf7f2_100%)] py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-content items-start gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-salvia-dark">
            Agendar cita
          </p>
          <h2 className="font-display text-3xl tracking-tight text-texto md:text-4xl">
            Reservemos tu espacio
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-texto/75 md:text-lg">
            Elegí un día y un horario que te sirva. Te confirmo por WhatsApp en
            menos de un día hábil.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-texto/75 md:text-base">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-salvia" />
              Primera consulta: nos conocemos y definimos objetivos juntos.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-salvia" />
              Podés elegir presencial en Miami u online.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-salvia" />
              Si preferís, escribime directo y te ayudo a encontrar horario.
            </li>
          </ul>

          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-salvia-dark underline-offset-4 hover:underline"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Preferís escribir primero? Abrí WhatsApp
          </a>
        </div>

        <BookingCalendar />
      </div>
    </section>
  );
}
