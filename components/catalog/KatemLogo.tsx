export function KatemLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-fredoka text-3xl font-medium tracking-tight text-tinta md:text-4xl ${className}`}
    >
      kat
      <span className="text-rosa">e</span>
      m
    </span>
  );
}
