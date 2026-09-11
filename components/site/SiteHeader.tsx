import Link from "next/link";
import type { NicheType } from "@/src/types/funnel";

const NAV_LANDINGS: Array<{ href: string; label: string; niche: NicheType }> = [
  { href: "/inmobiliaria", label: "Inmobiliaria", niche: "inmobiliaria" },
  { href: "/arquitectos", label: "Arquitectos", niche: "arquitectos" },
  { href: "/abogados", label: "Abogados", niche: "abogados" },
  { href: "/hospedajes", label: "Hospedajes", niche: "hospedajes" },
];

type SiteHeaderProps = {
  activeNiche?: NicheType;
  tone?: "light" | "dark";
};

export default function SiteHeader({
  activeNiche,
  tone = "light",
}: SiteHeaderProps) {
  const light = tone === "light";

  return (
    <header
      className={[
        "sticky top-0 z-40 border-b backdrop-blur",
        light
          ? "border-zinc-200/80 bg-white/85"
          : "border-white/10 bg-zinc-950/80",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
        <Link
          href="/"
          className={[
            "font-fraunces text-lg tracking-tight",
            light ? "text-zinc-900" : "text-white",
          ].join(" ")}
        >
          katem<span className="text-[#E8A8BC]">.</span>store
        </Link>

        <nav
          aria-label="Landings"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LANDINGS.map((item) => {
            const active = item.niche === activeNiche;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-3 py-1.5 text-sm transition",
                  active
                    ? light
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-900"
                    : light
                      ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 md:hidden">
            {NAV_LANDINGS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-2 py-1 text-[11px]",
                  item.niche === activeNiche
                    ? light
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-900"
                    : light
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-white/10 text-zinc-300",
                ].join(" ")}
              >
                {item.label.slice(0, 3)}
              </Link>
            ))}
          </div>
          <Link
            href="/admin"
            className={[
              "rounded-full px-3 py-1.5 text-sm font-medium",
              light
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "bg-white text-zinc-900 hover:bg-zinc-100",
            ].join(" ")}
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
