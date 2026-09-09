import NicheCard from "@/components/catalog/NicheCard";

const niches = [
  {
    title: "Psicólogos",
    description:
      "Web cálida y clínica para agendar consulta sin fricción. Pensada para terapeutas latinos en USA.",
    href: "/psicologos",
    active: true,
  },
  {
    title: "Psiquiatras",
    description:
      "Presencia digital clara para consulta, seguimiento y confianza profesional.",
    active: false,
  },
  {
    title: "Clínicas",
    description:
      "Sitio para centros de salud y bienestar que necesitan verse sólidos y humanos.",
    active: false,
  },
];

export default function NicheGrid() {
  return (
    <section aria-labelledby="nichos-heading" className="mx-auto max-w-content px-5 pb-16 md:px-8 md:pb-24">
      <h2 id="nichos-heading" className="sr-only">
        Demos por especialidad
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {niches.map((niche) => (
          <NicheCard key={niche.title} {...niche} />
        ))}
      </div>
    </section>
  );
}
