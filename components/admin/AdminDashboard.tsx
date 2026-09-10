"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/src/lib/supabase/client";
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

export default function AdminDashboard() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: queryError } = await supabase
        .from("leads")
        .select(
          "*, conversations(current_step, is_qualified, updated_at, collected_data)",
        )
        .order("created_at", { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      const rows = ((data ?? []) as LeadWithConversation[]).map(flattenLead);
      setLeads(rows);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los leads",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();

    let channel: ReturnType<
      ReturnType<typeof getSupabaseBrowser>["channel"]
    > | null = null;

    try {
      const supabase = getSupabaseBrowser();
      channel = supabase
        .channel("admin-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "leads" },
          () => {
            void loadLeads();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "conversations" },
          () => {
            void loadLeads();
          },
        )
        .subscribe((status) => {
          setLive(status === "SUBSCRIBED");
        });
    } catch (realtimeError) {
      setError(
        realtimeError instanceof Error
          ? realtimeError.message
          : "Realtime no disponible",
      );
    }

    return () => {
      if (channel) {
        const supabase = getSupabaseBrowser();
        void supabase.removeChannel(channel);
      }
    };
  }, [loadLeads]);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Leads calificados (formulario)
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
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
              {live ? "Realtime on" : "Realtime off"}
            </span>
            <a
              href="/funnel"
              className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Ver landing
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
              Todavía no hay leads. Probá `/funnel`.
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
