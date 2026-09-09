import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import { buildSystemPrompt } from "@/src/config/prompts";
import { createAgentTools } from "@/src/lib/engine/tools";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import type { Message } from "@/src/types/funnel";
import type { AgentRunResult, RunAgentParams } from "@/src/types/tenant";

function getModel() {
  const modelId = process.env.OPENAI_MODEL || "gpt-4o-mini";
  return openai(modelId);
}

export async function runAIAgent(
  params: RunAgentParams,
): Promise<AgentRunResult> {
  const {
    leadId,
    tenantId,
    tenantApiKey,
    whatsappFrom,
    niche,
    customSystemPrompt,
    userMessageContent,
    leadPhone,
  } = params;

  const supabase = getSupabaseAdmin();

  const { data: history, error: historyError } = await supabase
    .from("messages")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(15);

  if (historyError) {
    throw new Error(`Failed to load messages: ${historyError.message}`);
  }

  const chronological = ([...(history ?? [])] as Message[]).reverse();

  const modelMessages = chronological
    .filter((message) => !message.content.startsWith("[tool:"))
    .map((message) => ({
      role: message.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: message.content,
    }));

  if (
    modelMessages.length === 0 ||
    modelMessages[modelMessages.length - 1]?.content !== userMessageContent
  ) {
    modelMessages.push({
      role: "user",
      content: userMessageContent,
    });
  }

  const systemPrompt = buildSystemPrompt(niche, customSystemPrompt);
  const tools = createAgentTools({
    leadId,
    tenantId,
    leadPhone,
    tenantApiKey,
    whatsappFrom,
  });

  const result = await generateText({
    model: getModel(),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(6),
    temperature: 0.4,
  });

  const toolInvocations = (result.steps ?? []).flatMap((step) =>
    (step.toolResults ?? []).map((toolResult) => ({
      toolName: toolResult.toolName,
      input: "input" in toolResult ? toolResult.input : undefined,
      output: "output" in toolResult ? toolResult.output : undefined,
    })),
  );

  const assistantText =
    result.text.trim() ||
    "Gracias por la info. En un momento te sigo orientando.";

  const interactiveAlreadySent = toolInvocations.some(
    (invocation) => invocation.toolName === "sendWhatsAppInteractive",
  );

  await supabase.from("messages").insert({
    lead_id: leadId,
    sender: "bot",
    content: assistantText,
    raw_payload: {
      tenant_id: tenantId,
      niche,
      toolInvocations,
      finishReason: result.finishReason,
    },
  });

  if (!interactiveAlreadySent) {
    const adapter = new YCloudAdapter(tenantApiKey, whatsappFrom);
    await adapter.sendText(leadPhone, assistantText);
  }

  return {
    leadId,
    tenantId,
    assistantText,
    toolInvocations,
  };
}
