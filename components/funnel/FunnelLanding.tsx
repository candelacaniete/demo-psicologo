"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NicheConfig, NicheType } from "@/src/types/funnel";
import { NICHE_LIST } from "@/src/config/niches";

const COUNTRY_CODES = [
  { code: "54", label: "AR +54" },
  { code: "1", label: "US +1" },
  { code: "52", label: "MX +52" },
  { code: "57", label: "CO +57" },
  { code: "56", label: "CL +56" },
];

type FunnelLandingProps = {
  niche: NicheType;
  config: NicheConfig;
  clientId: string;
  tenantName?: string;
};

export default function FunnelLanding({
  niche,
  config,
  clientId,
  tenantName,
}: FunnelLandingProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("54");
  const [initialInterest, setInitialInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whatsappDeepLink, setWhatsappDeepLink] = useState<string | null>(null);

  const theme = useMemo(
    () => ({
      button: `${config.primaryColor} ${config.primaryColorHover}`,
      chip: `${config.accentBg} ${config.accentText}`,
    }),
    [config],
  );

  function onSelectNiche(next: NicheType) {
    router.push(`/funnel?nicho=${next}`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setError(null);
    setWhatsappDeepLink(null);

    try {
      const response = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          niche,
          initialInterest,
          countryCode,
          clientId,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        ok?: boolean;
        whatsappDeepLink?: string;
        tenantName?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo guardar el lead");
      }

      setFeedback(
        "Datos guardados. Para activar el asistente, abrí WhatsApp y enviá el mensaje precargado.",
      );
      setWhatsappDeepLink(payload.whatsappDeepLink ?? null);
      setName("");
      setPhone("");
      setInitialInterest("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Error inesperado al enviar el formulario",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-[#f7f4ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Funnel multi-tenant
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight">
              {tenantName || "Katem Demo Lab"}
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              client_id: {clientId}
            </p>
          </div>
          <nav aria-label="Nichos" className="flex flex-wrap gap-2">
            {NICHE_LIST.map((item) => {
              const active = item.id === niche;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNiche(item.id)}
                  className={[
                    "rounded-full px-3.5 py-1.5 text-sm capitalize transition-colors",
                    active
                      ? `${config.primaryColor} text-white`
                      : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  {item.id}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2 lg:items-center lg:py-16">
        <section>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${theme.chip}`}
          >
            {niche}
          </span>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-600 md:text-lg">
            {config.subtitle}
          </p>

          <div
            className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-200"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(24,24,27,0.15), rgba(24,24,27,0.45)), url(${config.heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            role="img"
            aria-label={`Imagen hero para ${niche}`}
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_20px_50px_rgba(24,24,27,0.06)] md:p-8">
          {whatsappDeepLink ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Un paso más: abrí WhatsApp
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600">
                Para poder responderte automáticamente (sin plantillas de Meta),
                tenés que iniciar la conversación. Tocá el botón, enviá el
                mensaje precargado y el asistente continúa solo.
              </p>
              <a
                href={whatsappDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
              >
                Continuar por WhatsApp
              </a>
              {feedback ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {feedback}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setWhatsappDeepLink(null)}
                className="text-sm text-zinc-500 underline-offset-2 hover:underline"
              >
                Cargar otro lead
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold tracking-tight">
                Dejá tus datos
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Después te pedimos abrir WhatsApp un segundo para activar el
                asistente.
              </p>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <label className="block text-sm font-medium text-zinc-700">
                  {config.fields.nameLabel}
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
                    placeholder="Tu nombre"
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-700">
                  {config.fields.phoneLabel}
                  <div className="mt-1.5 flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
                      aria-label="Código de país"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
                      placeholder="11 2345 6789"
                      inputMode="tel"
                    />
                  </div>
                </label>

                <label className="block text-sm font-medium text-zinc-700">
                  {config.fields.interestLabel}
                  <textarea
                    required
                    value={initialInterest}
                    onChange={(event) => setInitialInterest(event.target.value)}
                    className="mt-1.5 min-h-[96px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
                    placeholder={config.fields.interestPlaceholder}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.button}`}
                >
                  {isSubmitting ? "Enviando..." : config.fields.ctaLabel}
                </button>
              </form>

              {error ? (
                <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
