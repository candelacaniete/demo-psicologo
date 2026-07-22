import Link from "next/link";

type NicheCardProps = {
  title: string;
  description: string;
  href?: string;
  active?: boolean;
};

export default function NicheCard({
  title,
  description,
  href,
  active = false,
}: NicheCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-fredoka text-2xl text-tinta md:text-[1.75rem]">{title}</h2>
        <span
          className={[
            "shrink-0 font-vt323 text-sm md:text-base",
            active ? "text-neon" : "text-tinta/40",
          ].join(" ")}
        >
          {active ? "ver demo →" : "próximamente"}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-tinta/70 md:text-base">
        {description}
      </p>
      {active ? (
        <span className="mt-6 inline-flex font-vt323 text-sm text-tinta/55 transition-colors group-hover:text-neon">
          abrir_demo.exe
        </span>
      ) : (
        <span className="mt-6 inline-flex font-vt323 text-sm text-tinta/30">
          locked_
        </span>
      )}
    </>
  );

  const baseClass = [
    "edge-torn group block bg-papel/80 p-6 backdrop-blur-[1px] md:p-7",
    active
      ? "glow-neon scanline cursor-pointer hover:bg-rosa-suave/40"
      : "cursor-not-allowed opacity-45",
  ].join(" ");

  if (active && href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClass} aria-disabled="true">
      {content}
    </div>
  );
}
