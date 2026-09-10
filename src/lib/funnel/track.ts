export type FunnelEventName =
  | "landing_view"
  | "form_step1_complete"
  | "form_submitted"
  | "whatsapp_click"
  | "qualified_hot"
  | "qualified_warm"
  | "qualified_cold";

export async function trackFunnelEvent(payload: {
  event: FunnelEventName;
  niche: string;
  tenantId?: string;
  leadId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/funnel/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Tracking must never block UX.
  }
}
