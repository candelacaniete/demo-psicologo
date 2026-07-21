import { Clock, MapPin, Monitor, Sparkles } from "lucide-react";
import { SITE } from "@/lib/constants";

const items = [
  {
    icon: MapPin,
    title: "Presencial en Miami",
    description:
      "Consultorio en Brickell, con un ambiente tranquilo y privado para tu sesión.",
  },
  {
    icon: Monitor,
    title: "Online desde donde estés",
    description:
      "Sesiones por videollamada segura, con la misma calidad de atención que en persona.",
  },
  {
    icon: Clock,
    title: "Sesiones de 50 minutos",
    description:
      "Tiempo suficiente para entrar en tema, trabajar con profundidad y cerrar con claridad.",
  },
  {
    icon: Sparkles,
    title: "Tu primera consulta",
    description:
      "Nos conocemos, hablamos de lo que te trae y definimos juntos cómo seguir. Sin presión ni compromiso largo.",
  },
];

export default function Modalidad() {
  return (
    <section id="modalidad" className="border-t border-borde bg-fondo py-20 md:py-28">
      <div className="mx-auto max-w-content px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-salvia-dark">
            Modalidad y logística
          </p>
          <h2 className="font-display text-3xl tracking-tight text-texto md:text-4xl">
            ¿Cómo empiezo?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-texto/75 md:text-lg">
            Elegí la modalidad que mejor se adapte a tu vida. Yo me encargo de
            que el proceso sea simple desde el primer mensaje.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracota/15 text-terracota-dark">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-xl text-texto">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-texto/75 md:text-base">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl rounded-soft border border-borde bg-fondo-suave px-5 py-4 text-sm leading-relaxed text-texto/75 md:text-base">
          <span className="font-medium text-texto">Próximo paso:</span> elegí
          un horario abajo o escribime por WhatsApp. Te confirmo disponibilidad
          y te envío los detalles de la sesión ({SITE.sessionMinutes} min ·{" "}
          {SITE.city} u online).
        </p>
      </div>
    </section>
  );
}
