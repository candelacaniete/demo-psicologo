import { KatemLogo } from "@/components/catalog/KatemLogo";

export default function CatalogHeader() {
  return (
    <header className="relative z-10 border-b border-[color-mix(in_srgb,var(--grid)_45%,transparent)]">
      <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-6 sm:flex-row sm:items-end sm:justify-between md:px-8 md:py-8">
        <div>
          <a href="/" aria-label="Katem — inicio">
            <KatemLogo />
          </a>
        </div>
        <p className="font-vt323 text-base leading-none text-tinta/70 status-cursor md:text-lg">
          &gt; status: catálogo de demos online
        </p>
      </div>
    </header>
  );
}
