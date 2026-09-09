import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import { BotEngine } from "@/src/lib/engine/stateMachine";
import { isNicheType } from "@/src/config/niches";
import type { CaptureLeadPayload, Lead, Conversation } from "@/src/types/funnel";

function normalizePhone(phone: string, countryCode = "54"): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith(countryCode)) {
    return digits;
  }
  if (digits.startsWith("0")) {
    return `${countryCode}${digits.replace(/^0+/, "")}`;
  }
  return `${countryCode}${digits}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CaptureLeadPayload>;
    const name = body.name?.trim();
    const phoneRaw = body.phone?.trim();
    const niche = body.niche;
    const initialInterest = body.initialInterest?.trim() ?? "";
    const countryCode = body.countryCode?.trim() || "54";

    if (!name || !phoneRaw || !niche) {
      return NextResponse.json(
        { error: "name, phone and niche are required" },
        { status: 400 },
      );
    }

    if (!isNicheType(niche)) {
      return NextResponse.json({ error: "Invalid niche" }, { status: 400 });
    }

    const phone = normalizePhone(phoneRaw, countryCode);
    const supabase = getSupabaseAdmin();

    const { data: upsertedLead, error: leadError } = await supabase
      .from("leads")
      .upsert(
        {
          name,
          phone,
          niche,
          status: "NEW",
          source: "landing",
          initial_interest: initialInterest || null,
        },
        { onConflict: "phone" },
      )
      .select("*")
      .single();

    if (leadError || !upsertedLead) {
      return NextResponse.json(
        { error: leadError?.message ?? "Failed to upsert lead" },
        { status: 500 },
      );
    }

    const lead = upsertedLead as Lead;

    const { error: deleteConversationError } = await supabase
      .from("conversations")
      .delete()
      .eq("lead_id", lead.id);

    if (deleteConversationError) {
      return NextResponse.json(
        { error: deleteConversationError.message },
        { status: 500 },
      );
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        lead_id: lead.id,
        current_step: "welcome",
        collected_data: {
          nombre: name,
          initial_interest: initialInterest,
        },
        is_qualified: false,
      })
      .select("*")
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        {
          error:
            conversationError?.message ?? "Failed to create conversation",
        },
        { status: 500 },
      );
    }

    await supabase
      .from("leads")
      .update({ status: "IN_QUALIFICATION" })
      .eq("id", lead.id);

    try {
      await BotEngine.sendWelcome(lead, conversation as Conversation);
    } catch (whatsappError) {
      console.error("WhatsApp welcome failed", whatsappError);
      return NextResponse.json(
        {
          ok: true,
          warning:
            "Lead saved but WhatsApp welcome could not be sent. Check YCLOUD_API_KEY.",
          lead,
          conversation,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        lead: { ...lead, status: "IN_QUALIFICATION" },
        conversation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/leads/capture", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
