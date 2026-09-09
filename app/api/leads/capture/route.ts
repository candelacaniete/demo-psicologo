import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import { isNicheType } from "@/src/config/niches";
import {
  defaultClientIdForNiche,
  getTenantById,
} from "@/src/config/tenants";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import type { CaptureLeadPayload, Lead } from "@/src/types/funnel";

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

function welcomeCopy(name: string, niche: string): string {
  return `Hola ${name} 👋 Gracias por escribirnos (${niche}). Soy el asistente virtual: contame un poco más de lo que necesitás y te ayudo a orientar la consulta.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CaptureLeadPayload>;
    const name = body.name?.trim();
    const phoneRaw = body.phone?.trim();
    const niche = body.niche;
    const initialInterest = body.initialInterest?.trim() ?? "";
    const countryCode = body.countryCode?.trim() || "54";
    const clientId =
      body.clientId?.trim() ||
      body.tenantId?.trim() ||
      (niche && isNicheType(niche) ? defaultClientIdForNiche(niche) : null);

    if (!name || !phoneRaw || !niche || !clientId) {
      return NextResponse.json(
        { error: "name, phone, niche and clientId are required" },
        { status: 400 },
      );
    }

    if (!isNicheType(niche)) {
      return NextResponse.json({ error: "Invalid niche" }, { status: 400 });
    }

    const tenant = await getTenantById(clientId);
    if (!tenant) {
      return NextResponse.json(
        { error: `Unknown client_id/tenant: ${clientId}` },
        { status: 404 },
      );
    }

    if (tenant.niche !== niche) {
      return NextResponse.json(
        {
          error: `Niche mismatch: tenant ${tenant.id} belongs to ${tenant.niche}`,
        },
        { status: 400 },
      );
    }

    const phone = normalizePhone(phoneRaw, countryCode);
    const supabase = getSupabaseAdmin();

    const { data: upsertedLead, error: leadError } = await supabase
      .from("leads")
      .upsert(
        {
          tenant_id: tenant.id,
          name,
          phone,
          niche,
          status: "NEW",
          source: "landing",
          initial_interest: initialInterest || null,
        },
        { onConflict: "tenant_id,phone" },
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

    await supabase.from("conversations").delete().eq("lead_id", lead.id);

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        lead_id: lead.id,
        current_step: "ai_agent",
        collected_data: {
          nombre: name,
          initial_interest: initialInterest,
          tenant_id: tenant.id,
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

    const welcomeText = welcomeCopy(name, niche);

    try {
      if (!tenant.ycloud_api_key || !tenant.whatsapp_from) {
        throw new Error(
          "Tenant missing YCloud credentials. Set YCLOUD_API_KEY and YCLOUD_WHATSAPP_FROM in Vercel, or UPDATE tenants in Supabase.",
        );
      }

      const adapter = new YCloudAdapter(
        tenant.ycloud_api_key,
        tenant.whatsapp_from.startsWith("+")
          ? tenant.whatsapp_from
          : `+${tenant.whatsapp_from.replace(/[^\d]/g, "")}`,
      );
      await adapter.sendText(phone, welcomeText);
      await supabase.from("messages").insert({
        lead_id: lead.id,
        sender: "bot",
        content: welcomeText,
        raw_payload: {
          type: "welcome",
          tenant_id: tenant.id,
        },
      });
    } catch (whatsappError) {
      const detail =
        whatsappError instanceof Error
          ? whatsappError.message
          : "Unknown WhatsApp error";
      console.error("WhatsApp welcome failed", whatsappError);
      return NextResponse.json(
        {
          ok: true,
          warning:
            "Lead saved but WhatsApp welcome could not be sent. Check tenant YCloud credentials.",
          whatsappError: detail,
          debug: {
            tenantId: tenant.id,
            hasApiKey: Boolean(tenant.ycloud_api_key),
            whatsappFrom: tenant.whatsapp_from
              ? `${tenant.whatsapp_from.slice(0, 4)}…`
              : null,
            toPhone: phone,
          },
          lead,
          conversation,
          tenantId: tenant.id,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        lead: { ...lead, status: "IN_QUALIFICATION" },
        conversation,
        tenantId: tenant.id,
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
