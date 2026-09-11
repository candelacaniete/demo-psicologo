import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import { isNicheType } from "@/src/config/niches";
import {
  defaultClientIdForNiche,
  getTenantById,
} from "@/src/config/tenants";
import { normalizePhone } from "@/src/lib/phone";
import {
  buildHandshakeMessage,
  buildWhatsAppDeepLink,
} from "@/src/lib/whatsapp/deepLink";
import {
  formatQualificationSummary,
  qualifyFromForm,
} from "@/src/lib/qualification/formQualify";
import type { CaptureLeadPayload, Lead } from "@/src/types/funnel";

/**
 * Plan B only: save + qualify lead, return wa.me deep link.
 * Never sends WhatsApp templates (avoids Meta display-name / marketing blocks).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CaptureLeadPayload>;
    const name = body.name?.trim();
    const phoneRaw = body.phone?.trim();
    const niche = body.niche;
    const initialInterest = body.initialInterest?.trim() ?? "";
    const countryCode = body.countryCode?.trim() || "54";
    const qualificationAnswers = body.qualificationAnswers ?? {};
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

    const qualification = qualifyFromForm(niche, qualificationAnswers);
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
          status: qualification.status,
          source: "landing_form",
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

    const collectedData = {
      nombre: name,
      initial_interest: initialInterest,
      tenant_id: tenant.id,
      handshake_mode: "user_initiated",
      qualification_score: qualification.score,
      qualification_reasons: qualification.reasons,
      ...qualification.collectedData,
    };

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        lead_id: lead.id,
        current_step: "form_qualified",
        collected_data: collectedData,
        is_qualified: qualification.isQualified,
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

    const summary = formatQualificationSummary(collectedData);
    const handshakeMessage = buildHandshakeMessage({
      leadName: name,
      empresa: tenant.name,
      niche,
      initialInterest,
      qualificationSummary: summary,
    });

    const whatsappDeepLink = buildWhatsAppDeepLink(
      tenant.whatsapp_from || process.env.YCLOUD_WHATSAPP_FROM || "",
      handshakeMessage,
    );

    await supabase.from("messages").insert({
      lead_id: lead.id,
      sender: "bot",
      content: `Consulta calificada (${qualification.status}). Esperando primer mensaje del cliente por WhatsApp.`,
      raw_payload: {
        type: "form_qualification",
        tenant_id: tenant.id,
        score: qualification.score,
        status: qualification.status,
        reasons: qualification.reasons,
        collectedData: qualification.collectedData,
        whatsappDeepLink,
        handshakeMode: "user_initiated",
        handshakeMessage,
        templateSent: false,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        handshakeMode: "user_initiated",
        whatsappDeepLink,
        handshakeMessage,
        templateSent: false,
        qualification: {
          score: qualification.score,
          status: qualification.status,
          isQualified: qualification.isQualified,
          reasons: qualification.reasons,
        },
        lead: { ...lead, status: qualification.status },
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
