import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="min-h-screen bg-fondo font-sans text-texto antialiased">
        {children}
      </body>
    </html>
  );
}
