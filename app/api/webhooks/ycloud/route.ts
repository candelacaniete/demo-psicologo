import { NextResponse } from "next/server";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import { runAIAgent } from "@/src/lib/engine/agentEngine";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import {
  getTenantById,
  getTenantByWhatsAppFrom,
} from "@/src/config/tenants";
import { phoneDigits, phoneLookupVariants } from "@/src/lib/phone";
import type { Lead } from "@/src/types/funnel";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ycloud-webhook",
    mode: "user_initiated_openai_agent",
    message: "Webhook endpoint ready",
  });
}

async function findLeadByPhone(
  phoneFromWhatsApp: string,
  tenantId: string | null,
): Promise<Lead | null> {
  const supabase = getSupabaseAdmin();
  const variants = phoneLookupVariants(phoneFromWhatsApp);

  if (variants.length === 0) return null;

  let query = supabase
    .from("leads")
    .select("*")
    .in("phone", variants)
    .order("created_at", { ascending: false })
    .limit(5);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  if (data && data.length > 0) {
    return data[0] as Lead;
  }

  // Fallback: recent leads for tenant, match by national suffix (last 8–10 digits)
  const suffix =
    phoneDigits(phoneFromWhatsApp).slice(-10) ||
    phoneDigits(phoneFromWhatsApp).slice(-8);

  if (!suffix || suffix.length < 8) return null;

  let recentQuery = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);

  if (tenantId) {
    recentQuery = recentQuery.eq("tenant_id", tenantId);
  }

  const { data: recent, error: recentError } = await recentQuery;
  if (recentError) {
    throw new Error(recentError.message);
  }

  const match = (recent ?? []).find((row) => {
    const stored = phoneDigits((row as Lead).phone);
    return stored.endsWith(suffix) || suffix.endsWith(stored.slice(-8));
  });

  return (match as Lead | undefined) ?? null;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const incoming = YCloudAdapter.parseWebhook(body);

    if (
      !incoming ||
      incoming.type === "unknown" ||
      (!incoming.text && !incoming.buttonId && !incoming.listId)
    ) {
      console.info("[ycloud webhook] ignored payload", {
        hasIncoming: Boolean(incoming),
        type: incoming?.type,
      });
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const userMessageContent =
      incoming.text ||
      incoming.buttonId ||
      incoming.listId ||
      "";

    const phoneFrom = phoneDigits(incoming.from);
    const phoneTo = incoming.to ? phoneDigits(incoming.to) : null;

    console.info("[ycloud webhook] inbound", {
      from: phoneFrom,
      to: phoneTo,
      type: incoming.type,
      preview: userMessageContent.slice(0, 80),
    });

    let tenant =
      incoming.to != null
        ? await getTenantByWhatsAppFrom(incoming.to)
        : null;

    const lead = await findLeadByPhone(phoneFrom, tenant?.id ?? null);

    if (!lead) {
      console.warn("[ycloud webhook] lead_not_found", {
        from: phoneFrom,
        to: phoneTo,
        variants: phoneLookupVariants(phoneFrom),
        tenantId: tenant?.id ?? null,
      });
      return NextResponse.json(
        {
          ok: true,
          ignored: true,
          reason: "lead_not_found",
          from: phoneFrom,
        },
        { status: 200 },
      );
    }

    if (!tenant) {
      tenant = await getTenantById(lead.tenant_id);
    }

    if (!tenant) {
      console.error("[ycloud webhook] tenant_not_found", {
        leadId: lead.id,
        tenantId: lead.tenant_id,
      });
      return NextResponse.json(
        { ok: false, error: `Tenant not found for lead ${lead.id}` },
        { status: 200 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Keep stored phone aligned with WhatsApp `from` so future replies land.
    if (phoneDigits(lead.phone) !== phoneFrom) {
      console.info("[ycloud webhook] syncing lead phone", {
        leadId: lead.id,
        was: lead.phone,
        now: phoneFrom,
      });
      await supabase
        .from("leads")
        .update({ phone: phoneFrom })
        .eq("id", lead.id);
      lead.phone = phoneFrom;
    }

    await supabase.from("messages").insert({
      lead_id: lead.id,
      sender: "user",
      content: userMessageContent,
      raw_payload: incoming.raw,
    });

    if (lead.status === "NEW") {
      await supabase
        .from("leads")
        .update({ status: "IN_QUALIFICATION" })
        .eq("id", lead.id)
        .eq("tenant_id", tenant.id);
    }

    const result = await runAIAgent({
      leadId: lead.id,
      tenantId: tenant.id,
      tenantApiKey: tenant.ycloud_api_key,
      whatsappFrom: tenant.whatsapp_from,
      niche: lead.niche,
      customSystemPrompt: tenant.custom_system_prompt ?? undefined,
      userMessageContent,
      // Always reply to the WhatsApp sender number from the webhook.
      leadPhone: phoneFrom,
    });

    console.info("[ycloud webhook] agent_ok", {
      leadId: lead.id,
      tenantId: tenant.id,
      replyPreview: result.assistantText.slice(0, 80),
    });

    return NextResponse.json(
      {
        ok: true,
        handled: true,
        tenantId: tenant.id,
        leadId: lead.id,
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/webhooks/ycloud", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unexpected webhook error",
      },
      { status: 200 },
    );
  }
}
