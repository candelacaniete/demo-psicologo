export default function CatalogFooter() {
  return (
    <footer className="border-t border-[color-mix(in_srgb,var(--grid)_45%,transparent)]">
      <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-vt323 text-sm text-tinta/55 md:text-base">
          {"// katem · demos con alma_"}
        </p>
        <nav
          aria-label="Enlaces Katem"
          className="flex flex-wrap gap-x-5 gap-y-2 font-vt323 text-sm text-tinta/70 md:text-base"
        >
          <a
            href="https://www.instagram.com/katembsas"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-neon"
          >
            instagram
          </a>
          <a
            href="https://katem.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-neon"
          >
            katem.com.ar
          </a>
        </nav>
      </div>
    </footer>
  );
}
