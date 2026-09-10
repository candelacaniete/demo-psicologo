import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";

type EventBody = {
  event?: string;
  niche?: string;
  tenantId?: string;
  leadId?: string;
  meta?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EventBody;
    if (!body.event || !body.niche) {
      return NextResponse.json(
        { error: "event and niche are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("funnel_events").insert({
      event_name: body.event,
      niche: body.niche,
      tenant_id: body.tenantId ?? null,
      lead_id: body.leadId ?? null,
      meta: body.meta ?? {},
    });

    if (error) {
      // Table may not exist yet; keep API resilient.
      console.error("funnel_events insert", error.message);
      return NextResponse.json(
        { ok: false, warning: error.message },
        { status: 202 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/funnel/events", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected tracking error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("funnel_events")
      .select("event_name, niche, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ ok: false, events: [], warning: error.message });
    }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const key = String((row as { event_name: string }).event_name);
      counts[key] = (counts[key] ?? 0) + 1;
    }

    return NextResponse.json({ ok: true, events: data ?? [], counts });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      events: [],
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
}
