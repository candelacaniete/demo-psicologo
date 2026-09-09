"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/src/lib/supabase/client";
import type {
  Lead,
  LeadStatus,
  LeadWithConversation,
  NicheType,
} from "@/src/types/funnel";

type LeadRow = Lead & {
  current_step: string;
  is_qualified: boolean;
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

  return {
    ...row,
    current_step: conversation?.current_step ?? "—",
    is_qualified: conversation?.is_qualified ?? false,
  };
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: queryError } = await supabase
        .from("leads")
        .select("*, conversations(current_step, is_qualified, updated_at)")
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

    let channel: ReturnType<ReturnType<typeof getSupabaseBrowser>["channel"]> | null =
      null;

    try {
      const supabase = getSupabaseBrowser();
      channel = supabase
        .channel("admin-dashboard")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "leads" },
          () => {
            void loadLeads();
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "leads" },
          () => {
            void loadLeads();
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "conversations" },
          () => {
            void loadLeads();
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "conversations" },
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
    const conversion = total === 0 ? 0 : Math.round((hot / total) * 100);

    const byNiche = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.niche] = (acc[lead.niche] ?? 0) + 1;
      return acc;
    }, {});

    return { total, hot, conversion, byNiche };
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
              Funnel Dashboard
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
            <p className="text-sm text-zinc-400">Leads hot</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              {metrics.hot}
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Conversion rate</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.conversion}%</p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Distribución por nicho</p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-300">
              {(Object.keys(metrics.byNiche) as NicheType[]).length === 0 ? (
                <li>—</li>
              ) : (
                (Object.entries(metrics.byNiche) as Array<[NicheType, number]>).map(
                  ([niche, count]) => (
                    <li key={niche} className="flex justify-between capitalize">
                      <span>{niche}</span>
                      <span className="text-zinc-400">{count}</span>
                    </li>
                  ),
                )
              )}
            </ul>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="text-lg font-semibold">Leads en vivo</h2>
            <p className="text-sm text-zinc-400">
              Escucha INSERT/UPDATE en `leads` y `conversations`.
            </p>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-sm text-zinc-400">Cargando leads...</p>
          ) : error ? (
            <p className="px-5 py-8 text-sm text-rose-300">{error}</p>
          ) : leads.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-400">
              Todavía no hay leads. Probá la landing en `/funnel`.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-950/60 text-zinc-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nombre</th>
                    <th className="px-5 py-3 font-medium">Tenant</th>
                    <th className="px-5 py-3 font-medium">Teléfono</th>
                    <th className="px-5 py-3 font-medium">Nicho</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 font-medium">Último paso</th>
                    <th className="px-5 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-t border-zinc-800/80 text-zinc-200"
                    >
                      <td className="px-5 py-3 font-medium text-white">
                        {lead.name}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-zinc-400">
                        {lead.tenant_id}
                      </td>
                      <td className="px-5 py-3">{lead.phone}</td>
                      <td className="px-5 py-3 capitalize">{lead.niche}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lead.status]}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">{lead.current_step}</td>
                      <td className="px-5 py-3 text-zinc-400">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
