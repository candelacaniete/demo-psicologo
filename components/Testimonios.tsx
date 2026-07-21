const testimonios = [
  {
    label: "Paciente en terapia individual",
    quote:
      "Por fin sentí que podía hablar en español sin traducir lo que me pasa. Las sesiones me ayudaron a bajar la ansiedad y a tomar decisiones con más calma.",
  },
  {
    label: "Paciente en terapia de pareja",
    quote:
      "Llegamos con mucha tensión y poco a poco aprendimos a escucharnos. Hoy discutimos menos y nos entendemos mejor. El espacio se siente seguro para los dos.",
  },
  {
    label: "M.R. · terapia por ansiedad",
    quote:
      "Me ayudó a poner límites en el trabajo y a dormir mejor. No es magia: es acompañamiento claro, práctico y con mucho respeto por mi ritmo.",
  },
];

export default function Testimonios() {
  return (
    <section
      id="testimonios"
      className="border-t border-borde bg-fondo-suave py-20 md:py-28"
    >
      <div className="mx-auto max-w-content px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-salvia-dark">
            Testimonios
          </p>
          <h2 className="font-display text-3xl tracking-tight text-texto md:text-4xl">
            Lo que cuentan quienes ya empezaron
          </h2>
          <p className="mt-4 text-base leading-relaxed text-texto/75">
            Testimonios anónimos, compartidos con permiso. Cada proceso es único.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonios.map((item) => (
            <blockquote
              key={item.label}
              className="border-l-2 border-salvia/50 pl-5"
            >
              <p className="text-base leading-relaxed text-texto/80 md:text-lg">
                “{item.quote}”
              </p>
              <footer className="mt-4 text-sm font-medium text-texto/60">
                — {item.label}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
