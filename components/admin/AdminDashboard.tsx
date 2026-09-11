"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatQualificationSummary } from "@/src/lib/qualification/formQualify";
import type {
  Lead,
  LeadStatus,
  LeadWithConversation,
} from "@/src/types/funnel";

type LeadRow = Lead & {
  current_step: string;
  is_qualified: boolean;
  collected_data: Record<string, unknown>;
  score: number | null;
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-zinc-100 text-zinc-700",
  IN_QUALIFICATION: "bg-amber-100 text-amber-800",
  QUALIFIED_HOT: "bg-emerald-100 text-emerald-800",
  DISCARDED: "bg-rose-100 text-rose-800",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function flattenLead(row: LeadWithConversation): LeadRow {
  const conversation = Array.isArray(row.conversations)
    ? row.conversations[0]
    : row.conversations;
  const collected = (conversation?.collected_data ?? {}) as Record<
    string,
    unknown
  >;
  const scoreRaw = collected.qualification_score;

  return {
    ...row,
    current_step: conversation?.current_step ?? "—",
    is_qualified: conversation?.is_qualified ?? false,
    collected_data: collected,
    score: typeof scoreRaw === "number" ? scoreRaw : null,
  };
}

type FunnelCounts = Record<string, number>;

export default function AdminDashboard() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [funnelCounts, setFunnelCounts] = useState<FunnelCounts>({});
  const [funnelWarning, setFunnelWarning] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/leads", { cache: "no-store" });
      const payload = (await response.json()) as {
        ok?: boolean;
        leads?: LeadWithConversation[];
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudieron cargar los leads");
      }

      setLeads((payload.leads ?? []).map(flattenLead));
      setError(null);
      setLive(true);
    } catch (loadError) {
      setLive(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los leads",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFunnelEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/funnel/events", { cache: "no-store" });
      const payload = (await response.json()) as {
        counts?: FunnelCounts;
        warning?: string;
        error?: string;
      };
      setFunnelCounts(payload.counts ?? {});
      setFunnelWarning(payload.warning ?? payload.error ?? null);
    } catch {
      setFunnelWarning("No se pudieron cargar eventos del embudo");
    }
  }, []);

  useEffect(() => {
    void loadLeads();
    void loadFunnelEvents();

    const interval = window.setInterval(() => {
      void loadLeads();
      void loadFunnelEvents();
    }, 8000);

    return () => window.clearInterval(interval);
  }, [loadLeads, loadFunnelEvents]);

  const metrics = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((lead) => lead.status === "QUALIFIED_HOT").length;
    const discarded = leads.filter((lead) => lead.status === "DISCARDED").length;
    const conversion = total === 0 ? 0 : Math.round((hot / total) * 100);

    const byNiche = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.niche] = (acc[lead.niche] ?? 0) + 1;
      return acc;
    }, {});

    return { total, hot, discarded, conversion, byNiche };
  }, [leads]);

  const funnelMetrics = [
    { key: "landing_view", label: "Views" },
    { key: "form_step1_complete", label: "Paso 1" },
    { key: "form_submitted", label: "Enviados" },
    { key: "whatsapp_click", label: "WA clicks" },
    { key: "qualified_hot", label: "HOT events" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Leads + embudo
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full px-3 py-1",
                live
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-zinc-800 text-zinc-400",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  live ? "bg-emerald-400" : "bg-zinc-500",
                ].join(" ")}
              />
              {live ? "Polling on" : "Polling off"}
            </span>
            <a
              href="/"
              className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Hub
            </a>
            <a
              href="/inmobiliaria"
              className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Landings
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Total leads</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.total}</p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">HOT</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              {metrics.hot}
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Descartados</p>
            <p className="mt-2 text-3xl font-semibold text-rose-300">
              {metrics.discarded}
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Conversion HOT</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.conversion}%</p>
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Embudo (eventos)</h2>
              <p className="text-sm text-zinc-400">
                Views → paso 1 → envío → WhatsApp. Requiere{" "}
                <code className="text-zinc-300">migration_funnel_events.sql</code>
              </p>
            </div>
            {funnelWarning ? (
              <p className="max-w-md text-xs text-amber-300/90">{funnelWarning}</p>
            ) : null}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {funnelMetrics.map((item) => (
              <article
                key={item.key}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {funnelCounts[item.key] ?? 0}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="text-lg font-semibold">Inbox de calificación</h2>
            <p className="text-sm text-zinc-400">
              Score y datos vienen del formulario. WhatsApp es la continuidad.
            </p>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-sm text-zinc-400">Cargando leads...</p>
          ) : error ? (
            <p className="px-5 py-8 text-sm text-rose-300">{error}</p>
          ) : leads.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-400">
              Todavía no hay leads. Probá `/inmobiliaria`.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-950/60 text-zinc-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nombre</th>
                    <th className="px-5 py-3 font-medium">Teléfono</th>
                    <th className="px-5 py-3 font-medium">Nicho</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 font-medium">Resumen</th>
                    <th className="px-5 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const summary = formatQualificationSummary(
                      lead.collected_data,
                    );
                    const open = expandedId === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        className="border-t border-zinc-800/80 text-zinc-200 align-top"
                      >
                        <td className="px-5 py-3 font-medium text-white">
                          {lead.name}
                          <div className="mt-1 font-mono text-[11px] text-zinc-500">
                            {lead.tenant_id}
                          </div>
                        </td>
                        <td className="px-5 py-3">{lead.phone}</td>
                        <td className="px-5 py-3 capitalize">{lead.niche}</td>
                        <td className="px-5 py-3 font-semibold">
                          {lead.score ?? "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lead.status]}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="max-w-xs px-5 py-3 text-zinc-400">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(open ? null : lead.id)
                            }
                            className="text-left text-xs leading-relaxed hover:text-zinc-200"
                          >
                            {open
                              ? summary || "Sin datos"
                              : (summary || "Sin datos").slice(0, 80) +
                                ((summary?.length ?? 0) > 80 ? "…" : "")}
                          </button>
                          {open &&
                          Array.isArray(
                            lead.collected_data.qualification_reasons,
                          ) ? (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-zinc-500">
                              {(
                                lead.collected_data
                                  .qualification_reasons as string[]
                              ).map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          ) : null}
                        </td>
                        <td className="px-5 py-3 text-zinc-400">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
