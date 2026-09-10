import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import { isNicheType } from "@/src/config/niches";
import {
  defaultClientIdForNiche,
  getTenantById,
} from "@/src/config/tenants";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import {
  buildHandshakeMessage,
  buildWhatsAppDeepLink,
} from "@/src/lib/whatsapp/deepLink";
import type { CaptureLeadPayload, Lead } from "@/src/types/funnel";

function normalizePhone(phone: string, countryCode = "54"): string {
  let digits = phone.replace(/[^\d]/g, "");

  if (countryCode === "54") {
    if (digits.startsWith("549")) return digits;
    if (digits.startsWith("54") && !digits.startsWith("549")) {
      return `549${digits.slice(2)}`;
    }
    if (digits.startsWith("9")) return `54${digits}`;
    if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
    return `549${digits}`;
  }

  if (digits.startsWith(countryCode)) return digits;
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
        current_step: "awaiting_user_whatsapp",
        collected_data: {
          nombre: name,
          initial_interest: initialInterest,
          tenant_id: tenant.id,
          handshake_mode: "user_initiated",
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

    const handshakeMessage = buildHandshakeMessage({
      leadName: name,
      empresa: tenant.name,
      niche,
      initialInterest,
    });

    const whatsappDeepLink = buildWhatsAppDeepLink(
      tenant.whatsapp_from || process.env.YCLOUD_WHATSAPP_FROM || "",
      handshakeMessage,
    );

    await supabase.from("messages").insert({
      lead_id: lead.id,
      sender: "bot",
      content:
        "Lead capturado. Esperando que abra WhatsApp (handshake user-initiated).",
      raw_payload: {
        type: "handshake_pending",
        tenant_id: tenant.id,
        whatsappDeepLink,
      },
    });

    // Optional Plan A: try template only if explicitly enabled and approved.
    const handshakeMode =
      process.env.WHATSAPP_HANDSHAKE_MODE || "user_initiated";
    let templateSent = false;
    let templateError: string | null = null;

    if (handshakeMode === "template") {
      try {
        const adapter = new YCloudAdapter(
          tenant.ycloud_api_key,
          tenant.whatsapp_from,
        );
        const templateName =
          process.env.YCLOUD_WELCOME_TEMPLATE_NAME || "followuplead";
        const templateLanguage =
          process.env.YCLOUD_WELCOME_TEMPLATE_LANG || "es";
        await adapter.sendTemplate(phone, templateName, templateLanguage, [
          { name: "nombres", text: name },
          { name: "empresa", text: tenant.name },
        ]);
        templateSent = true;
      } catch (error) {
        templateError =
          error instanceof Error ? error.message : "Template send failed";
        console.error("Optional template welcome failed", error);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        handshakeMode: templateSent ? "template" : "user_initiated",
        whatsappDeepLink,
        handshakeMessage,
        templateSent,
        templateError,
        lead: { ...lead, status: "IN_QUALIFICATION" },
        conversation,
        tenantId: tenant.id,
        tenantName: tenant.name,
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
