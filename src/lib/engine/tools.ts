import { tool } from "ai";
import { z } from "zod";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import type { AgentToolContext } from "@/src/types/tenant";

const buttonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(20),
});

const listSectionSchema = z.object({
  title: z.string().min(1).max(24),
  rows: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1).max(24),
        description: z.string().max(72).optional(),
      }),
    )
    .min(1),
});

export function createAgentTools(ctx: AgentToolContext) {
  const adapter = new YCloudAdapter(ctx.tenantApiKey, ctx.whatsappFrom);

  return {
    saveCollectedData: tool({
      description:
        "Guarda o actualiza datos clave extraídos del lead en conversations.collected_data (presupuesto, zona, m², fechas, etc.).",
      inputSchema: z.object({
        data: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
          .describe("Pares clave/valor a mergear en collected_data"),
      }),
      execute: async ({ data }) => {
        const supabase = getSupabaseAdmin();
        const { data: conversation, error } = await supabase
          .from("conversations")
          .select("id, collected_data")
          .eq("lead_id", ctx.leadId)
          .maybeSingle();

        if (error || !conversation) {
          return {
            ok: false,
            error: error?.message ?? "Conversation not found",
          };
        }

        const merged = {
          ...(conversation.collected_data as Record<string, unknown>),
          ...data,
        };

        const { error: updateError } = await supabase
          .from("conversations")
          .update({ collected_data: merged })
          .eq("id", conversation.id);

        if (updateError) {
          return { ok: false, error: updateError.message };
        }

        await supabase.from("messages").insert({
          lead_id: ctx.leadId,
          sender: "bot",
          content: `[tool:saveCollectedData] ${JSON.stringify(data)}`,
          raw_payload: {
            tool: "saveCollectedData",
            tenant_id: ctx.tenantId,
            data,
          },
        });

        return { ok: true, collected_data: merged };
      },
    }),

    qualifyLead: tool({
      description:
        "Cambia el estado del lead a QUALIFIED_HOT o DISCARDED según los criterios del nicho.",
      inputSchema: z.object({
        status: z.enum(["QUALIFIED_HOT", "DISCARDED"]),
        reason: z
          .string()
          .min(3)
          .describe("Motivo corto de la calificación"),
      }),
      execute: async ({ status, reason }) => {
        const supabase = getSupabaseAdmin();
        const isQualified = status === "QUALIFIED_HOT";

        const { error: leadError } = await supabase
          .from("leads")
          .update({ status })
          .eq("id", ctx.leadId)
          .eq("tenant_id", ctx.tenantId);

        if (leadError) {
          return { ok: false, error: leadError.message };
        }

        const { error: conversationError } = await supabase
          .from("conversations")
          .update({ is_qualified: isQualified })
          .eq("lead_id", ctx.leadId);

        if (conversationError) {
          return { ok: false, error: conversationError.message };
        }

        await supabase.from("messages").insert({
          lead_id: ctx.leadId,
          sender: "bot",
          content: `[tool:qualifyLead] ${status} — ${reason}`,
          raw_payload: {
            tool: "qualifyLead",
            tenant_id: ctx.tenantId,
            status,
            reason,
          },
        });

        return { ok: true, status, reason, isQualified };
      },
    }),

    sendWhatsAppInteractive: tool({
      description:
        "Envía botones o una lista interactiva por WhatsApp (YCloud) para acelerar la decisión del usuario.",
      inputSchema: z.object({
        bodyText: z.string().min(1),
        mode: z.enum(["buttons", "list"]),
        buttons: z.array(buttonSchema).max(3).optional(),
        listButtonText: z.string().max(20).optional(),
        listSections: z.array(listSectionSchema).optional(),
      }),
      execute: async ({
        bodyText,
        mode,
        buttons,
        listButtonText,
        listSections,
      }) => {
        if (mode === "buttons") {
          if (!buttons?.length) {
            return { ok: false, error: "buttons are required for mode=buttons" };
          }
          const result = await adapter.sendButtons(
            ctx.leadPhone,
            bodyText,
            buttons,
          );
          await supabaseInsertInteractive(ctx, bodyText, {
            mode,
            buttons,
            result,
          });
          return { ok: true, mode, delivered: true };
        }

        if (!listSections?.length) {
          return {
            ok: false,
            error: "listSections are required for mode=list",
          };
        }

        const result = await adapter.sendList(
          ctx.leadPhone,
          bodyText,
          listButtonText ?? "Ver opciones",
          listSections,
        );
        await supabaseInsertInteractive(ctx, bodyText, {
          mode,
          listButtonText,
          listSections,
          result,
        });
        return { ok: true, mode, delivered: true };
      },
    }),
  };
}

async function supabaseInsertInteractive(
  ctx: AgentToolContext,
  bodyText: string,
  payload: Record<string, unknown>,
) {
  const supabase = getSupabaseAdmin();
  await supabase.from("messages").insert({
    lead_id: ctx.leadId,
    sender: "bot",
    content: bodyText,
    raw_payload: {
      tool: "sendWhatsAppInteractive",
      tenant_id: ctx.tenantId,
      ...payload,
    },
  });
}
