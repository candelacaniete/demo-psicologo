import { HeartHandshake, Users, Wind } from "lucide-react";

const especialidades = [
  {
    icon: HeartHandshake,
    title: "Terapia individual",
    description:
      "Un espacio solo para vos, donde podés hablar de lo que te pesa y salir con más claridad sobre lo que necesitás.",
  },
  {
    icon: Users,
    title: "Terapia de pareja",
    description:
      "Para mejorar la comunicación, reconstruir confianza y volver a sentirse un equipo, sin perder la individualidad de cada uno.",
  },
  {
    icon: Wind,
    title: "Ansiedad y manejo del estrés",
    description:
      "Herramientas concretas para calmar la mente, bajar la tensión del cuerpo y recuperar control sobre tus días.",
  },
];

export default function Especialidades() {
  return (
    <section
      id="especialidades"
      className="border-t border-borde bg-fondo-suave py-20 md:py-28"
    >
      <div className="mx-auto max-w-content px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-salvia-dark">
            Especialidades
          </p>
          <h2 className="font-display text-3xl tracking-tight text-texto md:text-4xl">
            Cómo puedo acompañarte
          </h2>
          <p className="mt-4 text-base leading-relaxed text-texto/75 md:text-lg">
            Trabajo con lo que estás viviendo hoy, con lenguaje claro y un ritmo
            que respete tu proceso.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {especialidades.map((item) => (
            <article
              key={item.title}
              className="rounded-softer border border-borde bg-fondo p-7 md:p-8"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-salvia/15 text-salvia-dark">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl text-texto">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-texto/75 md:text-base">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
