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
import {
  formatQualificationSummary,
  qualifyFromForm,
} from "@/src/lib/qualification/formQualify";
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

    // Plan A default: business-initiated template (works for Marketing or Utility).
    // Plan B fallback: user_initiated wa.me if template fails / is skipped.
    const configuredMode =
      process.env.WHATSAPP_HANDSHAKE_MODE || "template";
    const preferTemplate = configuredMode === "template";

    const collectedData = {
      nombre: name,
      initial_interest: initialInterest,
      tenant_id: tenant.id,
      handshake_mode: preferTemplate ? "template" : "user_initiated",
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
      status: qualification.status,
    });

    const whatsappDeepLink = buildWhatsAppDeepLink(
      tenant.whatsapp_from || process.env.YCLOUD_WHATSAPP_FROM || "",
      handshakeMessage,
    );

    let templateSent = false;
    let templateSkipped = false;
    let templateError: string | null = null;
    const templateName =
      process.env.YCLOUD_WELCOME_TEMPLATE_NAME || "followuplead";
    const templateLanguage =
      process.env.YCLOUD_WELCOME_TEMPLATE_LANG || "es";
    const templateCategory =
      process.env.YCLOUD_WELCOME_TEMPLATE_CATEGORY || "MARKETING";

    // Marketing templates consume daily/quality limits — skip cold leads.
    if (preferTemplate && qualification.status === "DISCARDED") {
      templateSkipped = true;
    } else if (preferTemplate) {
      try {
        const adapter = new YCloudAdapter(
          tenant.ycloud_api_key,
          tenant.whatsapp_from,
        );
        await adapter.sendTemplate(phone, templateName, templateLanguage, [
          { name: "nombres", text: name },
          { name: "empresa", text: tenant.name },
        ]);
        templateSent = true;
      } catch (error) {
        templateError =
          error instanceof Error ? error.message : "Template send failed";
        console.error("Template welcome failed; falling back to wa.me", error);
      }
    }

    const effectiveHandshake = templateSent ? "template" : "user_initiated";

    if (effectiveHandshake !== collectedData.handshake_mode) {
      await supabase
        .from("conversations")
        .update({
          collected_data: {
            ...collectedData,
            handshake_mode: effectiveHandshake,
            template_error: templateError,
            template_skipped: templateSkipped,
          },
        })
        .eq("id", conversation.id);
    }

    await supabase.from("messages").insert({
      lead_id: lead.id,
      sender: "bot",
      content: templateSent
        ? `Lead calificado. Score ${qualification.score} → ${qualification.status}. Template ${templateName} (${templateCategory}) enviado.`
        : `Lead calificado. Score ${qualification.score} → ${qualification.status}. Continuidad por wa.me${templateError ? ` (template falló)` : templateSkipped ? ` (template omitido)` : ""}.`,
      raw_payload: {
        type: "form_qualification",
        tenant_id: tenant.id,
        score: qualification.score,
        status: qualification.status,
        reasons: qualification.reasons,
        collectedData: qualification.collectedData,
        whatsappDeepLink,
        handshakeMode: effectiveHandshake,
        templateSent,
        templateSkipped,
        templateError,
        templateName,
        templateCategory,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        handshakeMode: effectiveHandshake,
        whatsappDeepLink,
        handshakeMessage,
        templateSent,
        templateSkipped,
        templateError,
        templateName,
        templateCategory,
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
