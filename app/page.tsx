import CatalogHeader from "@/components/catalog/CatalogHeader";
import CatalogFooter from "@/components/catalog/CatalogFooter";
import NicheGrid from "@/components/catalog/NicheGrid";

export default function Home() {
  return (
    <div className="bg-papel-grid min-h-screen">
      <CatalogHeader />

      <main>
        <section className="mx-auto max-w-content px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-16">
          <p className="mb-4 font-vt323 text-sm text-neon md:text-base">
            &gt; boot: demos_vivas
          </p>
          <h1 className="max-w-3xl font-fredoka text-4xl leading-[1.08] tracking-tight text-tinta text-balance sm:text-5xl md:text-6xl">
            Demos en vivo, no promesas en PDF.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-tinta/75 md:text-lg">
            Catálogo de demos web hechas por Katem para profesionales de la salud
            y el bienestar. Elegí tu especialidad y mirá cómo se vería tu propia
            web.
          </p>
        </section>

        <NicheGrid />
      </main>

      <CatalogFooter />
    </div>
  );
}
