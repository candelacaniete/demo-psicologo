import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import type { LeadWithConversation } from "@/src/types/funnel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select(
        "*, conversations(current_step, is_qualified, updated_at, collected_data)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, leads: [] },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      leads: (data ?? []) as LeadWithConversation[],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        leads: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los leads",
      },
      { status: 500 },
    );
  }
}
