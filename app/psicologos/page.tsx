import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SobreMi from "@/components/SobreMi";
import Especialidades from "@/components/Especialidades";
import Modalidad from "@/components/Modalidad";
import Agendar from "@/components/Agendar";
import FAQ from "@/components/FAQ";
import Testimonios from "@/components/Testimonios";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function PsicologosDemoPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SobreMi />
        <Especialidades />
        <Modalidad />
        <Agendar />
        <FAQ />
        <Testimonios />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
