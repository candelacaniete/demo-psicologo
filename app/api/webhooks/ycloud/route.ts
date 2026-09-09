import { NextResponse } from "next/server";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import { runAIAgent } from "@/src/lib/engine/agentEngine";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import {
  getTenantById,
  getTenantByWhatsAppFrom,
} from "@/src/config/tenants";
import type { Lead } from "@/src/types/funnel";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ycloud-webhook",
    mode: "multi-tenant-ai-agent",
    message: "Webhook endpoint ready",
  });
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
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const userMessageContent =
      incoming.text ||
      incoming.buttonId ||
      incoming.listId ||
      "";

    const supabase = getSupabaseAdmin();
    const phone = incoming.from.replace(/[^\d]/g, "");

    let tenant =
      incoming.to != null
        ? await getTenantByWhatsAppFrom(incoming.to)
        : null;

    let leadQuery = supabase.from("leads").select("*").eq("phone", phone);

    if (tenant) {
      leadQuery = leadQuery.eq("tenant_id", tenant.id);
    }

    const { data: lead, error: leadError } = await leadQuery
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (leadError) {
      throw new Error(leadError.message);
    }

    if (!lead) {
      return NextResponse.json(
        { ok: true, ignored: true, reason: "lead_not_found" },
        { status: 200 },
      );
    }

    const typedLead = lead as Lead;

    if (!tenant) {
      tenant = await getTenantById(typedLead.tenant_id);
    }

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: `Tenant not found for lead ${typedLead.id}` },
        { status: 200 },
      );
    }

    await supabase.from("messages").insert({
      lead_id: typedLead.id,
      sender: "user",
      content: userMessageContent,
      raw_payload: incoming.raw,
    });

    if (typedLead.status === "NEW") {
      await supabase
        .from("leads")
        .update({ status: "IN_QUALIFICATION" })
        .eq("id", typedLead.id)
        .eq("tenant_id", tenant.id);
    }

    const result = await runAIAgent({
      leadId: typedLead.id,
      tenantId: tenant.id,
      tenantApiKey: tenant.ycloud_api_key,
      whatsappFrom: tenant.whatsapp_from,
      niche: typedLead.niche,
      customSystemPrompt: tenant.custom_system_prompt ?? undefined,
      userMessageContent,
      leadPhone: typedLead.phone,
    });

    return NextResponse.json(
      {
        ok: true,
        handled: true,
        tenantId: tenant.id,
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
