import type { Metadata } from "next";
import Script from "next/script";
import {
  Fredoka,
  Plus_Jakarta_Sans,
  VT323,
  Fraunces,
  Work_Sans,
} from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Katem — Landings de conversión",
    template: "%s · Katem",
  },
  description:
    "Landings de conversión multi-nicho: formulario de 2 pasos, calificación al instante y continuidad por WhatsApp.",
  openGraph: {
    title: "Katem — Landings de conversión",
    description:
      "Inmobiliaria, arquitectos, abogados y hospedajes. Embudo medible con admin en tiempo real.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${plusJakarta.variable} ${vt323.variable} ${fraunces.variable} ${workSans.variable}`}
    >
      <body className="min-h-screen bg-papel font-jakarta text-tinta antialiased">
        {children}
        <Script
          src="https://generador-de-bots.vercel.app/api/widget/d1b73ce9-52c7-4197-8245-9f6c9dad73be"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
