"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SiteHeader from "@/components/site/SiteHeader";
import type { LeadStatus, NicheType } from "@/src/types/funnel";
import { NICHE_CONFIGS } from "@/src/config/niches";
import { LANDING_CONTENT } from "@/src/config/landingContent";
import { NICHE_QUALIFICATION } from "@/src/lib/qualification/formQualify";
import { defaultClientIdForNiche } from "@/src/config/tenants";
import { trackFunnelEvent } from "@/src/lib/funnel/track";

const COUNTRY_CODES = [
  { code: "54", label: "AR +54" },
  { code: "1", label: "US +1" },
  { code: "52", label: "MX +52" },
  { code: "57", label: "CO +57" },
  { code: "56", label: "CL +56" },
];

type ConversionLandingProps = {
  niche: NicheType;
  clientId?: string;
  tenantName?: string;
};

export default function ConversionLanding({
  niche,
  clientId,
  tenantName,
}: ConversionLandingProps) {
  const content = LANDING_CONTENT[niche];
  const nicheConfig = NICHE_CONFIGS[niche];
  const qualifyFields = NICHE_QUALIFICATION[niche].fields;
  const resolvedClientId = clientId || defaultClientIdForNiche(niche);
  const theme = content.theme;

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("54");
  const [initialInterest, setInitialInterest] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappDeepLink, setWhatsappDeepLink] = useState<string | null>(null);
  const [templateSent, setTemplateSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultStatus, setResultStatus] = useState<LeadStatus | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    void trackFunnelEvent({
      event: "landing_view",
      niche,
      tenantId: resolvedClientId,
    });
  }, [niche, resolvedClientId]);

  const resultCopy = useMemo(() => {
    if (resultStatus === "QUALIFIED_HOT") return content.resultHot;
    if (resultStatus === "DISCARDED") return content.resultCold;
    return content.resultWarm;
  }, [resultStatus, content]);

  function setAnswer(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function goStep2(event: FormEvent) {
    event.preventDefault();
    for (const field of qualifyFields) {
      if (field.required && !(answers[field.id] ?? "").trim()) {
        setError("Completá todas las preguntas para continuar.");
        return;
      }
    }
    setError(null);
    setStep(2);
    void trackFunnelEvent({
      event: "form_step1_complete",
      niche,
      tenantId: resolvedClientId,
      meta: { answers },
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
          clientId: resolvedClientId,
          qualificationAnswers: answers,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        whatsappDeepLink?: string;
        templateSent?: boolean;
        handshakeMode?: string;
        qualification?: { status: LeadStatus; score: number };
        lead?: { id: string };
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo enviar");
      }

      const status = payload.qualification?.status ?? "IN_QUALIFICATION";
      setResultStatus(status);
      setTemplateSent(Boolean(payload.templateSent));
      setSubmitted(true);
      setWhatsappDeepLink(payload.whatsappDeepLink ?? null);

      void trackFunnelEvent({
        event: "form_submitted",
        niche,
        tenantId: resolvedClientId,
        leadId: payload.lead?.id,
        meta: {
          status,
          score: payload.qualification?.score,
          handshakeMode: payload.handshakeMode,
          templateSent: Boolean(payload.templateSent),
        },
      });

      if (status === "QUALIFIED_HOT") {
        void trackFunnelEvent({
          event: "qualified_hot",
          niche,
          tenantId: resolvedClientId,
          leadId: payload.lead?.id,
        });
      } else if (status === "DISCARDED") {
        void trackFunnelEvent({
          event: "qualified_cold",
          niche,
          tenantId: resolvedClientId,
          leadId: payload.lead?.id,
        });
      } else {
        void trackFunnelEvent({
          event: "qualified_warm",
          niche,
          tenantId: resolvedClientId,
          leadId: payload.lead?.id,
        });
      }

      if (payload.templateSent) {
        void trackFunnelEvent({
          event: "whatsapp_click",
          niche,
          tenantId: resolvedClientId,
          leadId: payload.lead?.id,
          meta: { source: "template_outbound" },
        });
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Error al enviar el formulario",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`min-h-screen font-jakarta ${theme.bg} ${theme.text}`}>
      <SiteHeader activeNiche={niche} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={nicheConfig.heroImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: theme.heroOverlay }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 text-white md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-8 md:pb-20 md:pt-20">
          <div>
            <p className="font-fraunces text-2xl md:text-3xl">{content.brand}</p>
            <p className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              {content.badge}
            </p>
            <h1 className="mt-5 max-w-xl font-fraunces text-4xl leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]">
              {content.headline}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              {content.subhead}
            </p>
            <p className="mt-6 text-sm text-white/75">{content.trustLine}</p>
            <a
              href="#formulario"
              className={`mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white ${theme.accent} ${theme.accentHover}`}
            >
              {content.stickyCta}
            </a>
          </div>

          <div
            id="formulario"
            className={`scroll-mt-24 rounded-2xl ${theme.surface} p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] md:p-7 ${theme.text}`}
          >
            {submitted ? (
              <div className="space-y-4">
                <p className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${theme.accentSoft}`}>
                  {resultStatus ?? "ENVIADO"}
                </p>
                <h2 className="font-fraunces text-2xl tracking-tight">
                  {templateSent
                    ? "Te escribimos por WhatsApp"
                    : "Recibimos tu consulta"}
                </h2>
                <p className={`text-sm leading-relaxed ${theme.muted}`}>
                  {templateSent
                    ? `${resultCopy} Revisá tus mensajes: ya te llegó el primer contacto.`
                    : resultCopy}
                </p>
                {whatsappDeepLink ? (
                  <a
                    href={whatsappDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      void trackFunnelEvent({
                        event: "whatsapp_click",
                        niche,
                        tenantId: resolvedClientId,
                      })
                    }
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#1ebe57]"
                  >
                    {templateSent
                      ? "Abrir WhatsApp"
                      : "Continuar por WhatsApp"}
                  </a>
                ) : null}
                {templateSent ? (
                  <p className={`text-center text-xs ${theme.muted}`}>
                    Si no ves el mensaje, abrí WhatsApp o revisá spam/filtros.
                  </p>
                ) : null}
                <button
                  type="button"
                  className={`text-sm ${theme.muted} underline-offset-2 hover:underline`}
                  onClick={() => {
                    setSubmitted(false);
                    setTemplateSent(false);
                    setWhatsappDeepLink(null);
                    setStep(1);
                    setAnswers({});
                    setName("");
                    setPhone("");
                    setInitialInterest("");
                    setResultStatus(null);
                  }}
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <>
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${theme.muted}`}>
                  {content.formEyebrow}
                </p>
                <h2 className="mt-2 font-fraunces text-2xl tracking-tight">
                  {content.formTitle}
                </h2>
                <div className="mt-4 flex gap-2 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-1 ${
                      step === 1 ? theme.accentSoft : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {content.step1Title}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 ${
                      step === 2 ? theme.accentSoft : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {content.step2Title}
                  </span>
                </div>

                {step === 1 ? (
                  <form className="mt-5 space-y-3.5" onSubmit={goStep2}>
                    {qualifyFields.map((field) => (
                      <label key={field.id} className="block text-sm font-medium">
                        {field.label}
                        {field.type === "select" ? (
                          <select
                            required={field.required}
                            value={answers[field.id] ?? ""}
                            onChange={(e) => setAnswer(field.id, e.target.value)}
                            className={`mt-1.5 w-full rounded-xl border ${theme.border} bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:bg-white`}
                          >
                            <option value="" disabled>
                              Elegí una opción
                            </option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            required={field.required}
                            value={answers[field.id] ?? ""}
                            onChange={(e) => setAnswer(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className={`mt-1.5 w-full rounded-xl border ${theme.border} bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:bg-white`}
                          />
                        )}
                      </label>
                    ))}
                    <button
                      type="submit"
                      className={`w-full rounded-full px-4 py-3 text-sm font-semibold text-white ${theme.accent} ${theme.accentHover}`}
                    >
                      Continuar
                    </button>
                    <p className={`text-center text-xs ${theme.muted}`}>
                      {content.trustLine}
                    </p>
                  </form>
                ) : (
                  <form className="mt-5 space-y-3.5" onSubmit={onSubmit}>
                    <label className="block text-sm font-medium">
                      {nicheConfig.fields.nameLabel}
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`mt-1.5 w-full rounded-xl border ${theme.border} bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:bg-white`}
                        placeholder="Tu nombre"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      {nicheConfig.fields.phoneLabel}
                      <div className="mt-1.5 flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className={`rounded-xl border ${theme.border} bg-zinc-50 px-3 py-2.5 text-sm`}
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
                          onChange={(e) => setPhone(e.target.value)}
                          className={`w-full rounded-xl border ${theme.border} bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:bg-white`}
                          placeholder="11 2345 6789"
                          inputMode="tel"
                        />
                      </div>
                    </label>
                    <label className="block text-sm font-medium">
                      Detalle extra{" "}
                      <span className={`font-normal ${theme.muted}`}>
                        (opcional)
                      </span>
                      <textarea
                        value={initialInterest}
                        onChange={(e) => setInitialInterest(e.target.value)}
                        className={`mt-1.5 min-h-[72px] w-full rounded-xl border ${theme.border} bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:bg-white`}
                        placeholder={nicheConfig.fields.interestPlaceholder}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className={`rounded-full border ${theme.border} px-4 py-3 text-sm font-medium`}
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 ${theme.accent} ${theme.accentHover}`}
                      >
                        {isSubmitting ? "Enviando..." : nicheConfig.fields.ctaLabel}
                      </button>
                    </div>
                    <p className={`text-center text-xs ${theme.muted}`}>
                      {content.trustLine}
                    </p>
                  </form>
                )}

                {error ? (
                  <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}
                {tenantName ? (
                  <p className={`mt-3 text-center text-[11px] ${theme.muted}`}>
                    Demo tenant: {tenantName}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Urgency */}
      <div className="border-y border-black/5 bg-white/70">
        <p className="mx-auto max-w-6xl px-5 py-3 text-center text-sm md:px-8">
          {content.urgency}
        </p>
      </div>

      {/* How */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <h2 className="font-fraunces text-3xl tracking-tight md:text-4xl">
          {content.howTitle}
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {content.howSteps.map((stepItem, index) => (
            <div key={stepItem.title}>
              <p className={`text-sm font-semibold ${theme.muted}`}>
                0{index + 1}
              </p>
              <h3 className="mt-2 font-fraunces text-xl">{stepItem.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${theme.muted}`}>
                {stepItem.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social */}
      <section className={`border-y ${theme.border} bg-white/60`}>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="font-fraunces text-3xl tracking-tight md:text-4xl">
            {content.socialTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {content.stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border ${theme.border} ${theme.surface} p-5`}
              >
                <p className="font-fraunces text-3xl">{stat.value}</p>
                <p className={`mt-1 text-sm ${theme.muted}`}>{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {content.testimonials.map((item) => (
              <blockquote key={item.author} className="border-l-2 border-current/20 pl-4">
                <p className="text-base leading-relaxed">“{item.quote}”</p>
                <footer className={`mt-3 text-sm ${theme.muted}`}>
                  — {item.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Specialize + price */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
        <div>
          <h2 className="font-fraunces text-3xl tracking-tight">
            {content.specializeTitle}
          </h2>
          <p className={`mt-4 text-base leading-relaxed ${theme.muted}`}>
            {content.specializeText}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {content.specializeTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-1 text-xs font-medium ${theme.accentSoft}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-6`}>
          <h3 className="font-fraunces text-2xl">{content.priceTitle}</h3>
          <p className={`mt-3 text-sm leading-relaxed ${theme.muted}`}>
            {content.priceText}
          </p>
          <a
            href="#formulario"
            className={`mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white ${theme.accent} ${theme.accentHover}`}
          >
            {content.stickyCta}
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-24 md:px-8">
        <h2 className="text-center font-fraunces text-3xl tracking-tight">
          {content.faqTitle}
        </h2>
        <div className={`mt-8 divide-y border-y ${theme.border}`}>
          {content.faqs.map((faq, index) => {
            const open = openFaq === index;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  onClick={() => setOpenFaq(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="font-fraunces text-lg">{faq.q}</span>
                  <span className={theme.muted}>{open ? "−" : "+"}</span>
                </button>
                {open ? (
                  <p className={`pb-4 text-sm leading-relaxed ${theme.muted}`}>
                    {faq.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Sticky mobile CTA */}
      {!submitted ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-3 backdrop-blur md:hidden">
          <a
            href="#formulario"
            className={`flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white ${theme.accent}`}
          >
            {content.stickyCta}
          </a>
        </div>
      ) : null}
    </div>
  );
}
