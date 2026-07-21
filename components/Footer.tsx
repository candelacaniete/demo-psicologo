import { Mail, MapPin, MessageCircle } from "lucide-react";
import { SITE, whatsappUrl } from "@/lib/constants";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-borde bg-texto text-[#faf7f2]">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-2xl md:text-3xl">{SITE.name}</p>
            <p className="mt-2 text-sm text-[#faf7f2]/70 md:text-base">
              {SITE.shortSpecialty} · {SITE.city}
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#faf7f2]/75 md:text-base">
              Un espacio profesional y cercano para tu bienestar emocional.
              Atención en español e inglés, presencial y online.
            </p>
          </div>

          <div className="space-y-4 text-sm md:text-base">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[#faf7f2]/85 transition-colors hover:text-white"
            >
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              WhatsApp · {SITE.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-3 text-[#faf7f2]/85 transition-colors hover:text-white"
            >
              <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
              {SITE.email}
            </a>
            <p className="flex items-start gap-3 text-[#faf7f2]/85">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Consultorio · {SITE.address}
                <br />
                También atención online
              </span>
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[#faf7f2]/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[#faf7f2]/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8 text-xs leading-relaxed text-[#faf7f2]/55 md:text-sm">
          <p>
            Confidencialidad: la información compartida en terapia está
            protegida por la ética profesional y la ley. Esta es una web demo
            ficticia creada con fines ilustrativos.
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} {SITE.name}. Licencia en Florida{" "}
            {SITE.license}.
          </p>
        </div>
      </div>
    </footer>
  );
}
