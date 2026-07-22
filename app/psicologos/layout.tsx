import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dra. Camila Ríos | Psicóloga clínica en Miami",
  description:
    "Terapia individual, de pareja y ansiedad en español e inglés. Atención presencial en Miami, FL y online. Licencia en Florida.",
  openGraph: {
    title: "Dra. Camila Ríos | Psicóloga clínica en Miami",
    description:
      "Un espacio cálido y profesional para tu bienestar emocional. Agenda tu consulta en español.",
    locale: "es_US",
    type: "website",
  },
};

export default function PsicologosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="theme-psicologos min-h-screen bg-fondo font-work-sans text-texto antialiased [--font-display:var(--font-fraunces)] [--font-sans:var(--font-work-sans)]"
    >
      {children}
    </div>
  );
}
