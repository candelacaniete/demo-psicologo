import { SITE, whatsappUrl } from "@/lib/constants";

const links = [
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#especialidades", label: "Especialidades" },
  { href: "#modalidad", label: "Modalidad" },
  { href: "#agendar", label: "Agendar" },
  { href: "#preguntas", label: "Preguntas" },
];

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-5 md:px-8">
        <a
          href="#inicio"
          className="font-display text-lg font-medium tracking-tight text-texto md:text-xl"
        >
          {SITE.name}
        </a>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 text-sm text-texto/80 lg:flex"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-texto"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-salvia px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-salvia-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia"
        >
          Agendar consulta
        </a>
      </div>
    </header>
  );
}
