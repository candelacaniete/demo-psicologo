import { getSupabaseAdmin } from "@/src/lib/supabase/server";
import { loadFlowTemplate, interpolateTemplate } from "@/src/lib/flows/loadFlow";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import type {
  BotEngineResult,
  Conversation,
  FlowStep,
  FlowTemplate,
  Lead,
  LeadStatus,
  QualificationRule,
  StandardMessage,
} from "@/src/types/funnel";

function evaluateRule(
  rule: QualificationRule,
  collectedData: Record<string, unknown>,
): boolean {
  const raw = collectedData[rule.field];

  if (rule.operator === "exists") {
    return raw !== undefined && raw !== null && String(raw).length > 0;
  }

  if (raw === undefined || raw === null) {
    return false;
  }

  if (rule.operator === "in" && Array.isArray(rule.value)) {
    return rule.value.map(String).includes(String(raw));
  }

  if (rule.operator === "eq") {
    return String(raw) === String(rule.value);
  }

  if (rule.operator === "neq") {
    return String(raw) !== String(rule.value);
  }

  const numericRaw = Number(raw);
  const numericValue = Number(rule.value);

  if (Number.isNaN(numericRaw) || Number.isNaN(numericValue)) {
    return false;
  }

  if (rule.operator === "gte") {
    return numericRaw >= numericValue;
  }

  if (rule.operator === "lte") {
    return numericRaw <= numericValue;
  }

  return false;
}

function applyQualificationRules(
  rules: QualificationRule[] | undefined,
  collectedData: Record<string, unknown>,
  currentStatus: LeadStatus,
): { status: LeadStatus; isQualified: boolean } {
  if (!rules || rules.length === 0) {
    return {
      status: currentStatus,
      isQualified: currentStatus === "QUALIFIED_HOT",
    };
  }

  let status = currentStatus;

  for (const rule of rules) {
    const matched = evaluateRule(rule, collectedData);
    if (matched && rule.onMatchStatus) {
      status = rule.onMatchStatus;
    }
    if (!matched && rule.onFailStatus) {
      status = rule.onFailStatus;
    }
  }

  return {
    status,
    isQualified: status === "QUALIFIED_HOT",
  };
}

function extractAnswer(step: FlowStep, incoming: StandardMessage): string {
  if (step.inputType === "buttons") {
    return incoming.buttonId ?? incoming.text;
  }
  if (step.inputType === "list") {
    return incoming.listId ?? incoming.text;
  }
  return incoming.text;
}

function resolveNextStep(step: FlowStep, answer: string): string | null {
  if (step.end || step.nextStep === null) {
    return null;
  }
  if (step.nextStepMap && step.nextStepMap[answer]) {
    return step.nextStepMap[answer];
  }
  return step.nextStep ?? null;
}

export class BotEngine {
  static async processIncoming(
    incoming: StandardMessage,
  ): Promise<BotEngineResult | null> {
    const supabase = getSupabaseAdmin();
    const phone = incoming.from.replace(/[^\d]/g, "");

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (leadError) {
      throw new Error(`Failed to fetch lead: ${leadError.message}`);
    }

    if (!lead) {
      return null;
    }

    const typedLead = lead as Lead;

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("lead_id", typedLead.id)
      .maybeSingle();

    if (conversationError) {
      throw new Error(
        `Failed to fetch conversation: ${conversationError.message}`,
      );
    }

    if (!conversation) {
      throw new Error(`Conversation not found for lead ${typedLead.id}`);
    }

    const typedConversation = conversation as Conversation;
    const flow = loadFlowTemplate(typedLead.niche);
    const currentStep = flow.steps.find(
      (step) => step.id === typedConversation.current_step,
    );

    if (!currentStep) {
      throw new Error(
        `Unknown step ${typedConversation.current_step} for niche ${typedLead.niche}`,
      );
    }

    await supabase.from("messages").insert({
      lead_id: typedLead.id,
      sender: "user",
      content: incoming.text || incoming.buttonId || incoming.listId || "",
      raw_payload: incoming.raw,
    });

    if (currentStep.end || currentStep.inputType === "none") {
      return this.buildResult(
        typedLead,
        typedConversation,
        currentStep,
        typedConversation.collected_data,
        typedLead.status,
        typedConversation.is_qualified,
      );
    }

    const answer = extractAnswer(currentStep, incoming);
    const collectedData: Record<string, unknown> = {
      ...typedConversation.collected_data,
      nombre: typedConversation.collected_data.nombre ?? typedLead.name,
    };

    if (currentStep.saveAs) {
      const numericFields = [
        "presupuesto_usd",
        "metros_cuadrados",
        "abono_mensual_usd",
        "cantidad_noches",
      ];
      collectedData[currentStep.saveAs] = numericFields.includes(
        currentStep.saveAs,
      )
        ? Number(answer)
        : answer;
    }

    const qualification = applyQualificationRules(
      currentStep.qualificationRules,
      collectedData,
      typedLead.status === "NEW" ? "IN_QUALIFICATION" : typedLead.status,
    );

    const nextStepId = resolveNextStep(currentStep, answer);
    const nextStep =
      nextStepId !== null
        ? flow.steps.find((step) => step.id === nextStepId)
        : currentStep;

    if (!nextStep) {
      throw new Error(`Next step not found: ${nextStepId}`);
    }

    const { error: updateConversationError } = await supabase
      .from("conversations")
      .update({
        current_step: nextStep.id,
        collected_data: collectedData,
        is_qualified: qualification.isQualified,
      })
      .eq("id", typedConversation.id);

    if (updateConversationError) {
      throw new Error(
        `Failed to update conversation: ${updateConversationError.message}`,
      );
    }

    const finalStatus =
      nextStep.end && qualification.status === "IN_QUALIFICATION"
        ? qualification.isQualified
          ? "QUALIFIED_HOT"
          : "DISCARDED"
        : qualification.status;

    const { error: updateLeadError } = await supabase
      .from("leads")
      .update({ status: finalStatus })
      .eq("id", typedLead.id);

    if (updateLeadError) {
      throw new Error(`Failed to update lead: ${updateLeadError.message}`);
    }

    const replyText = interpolateTemplate(nextStep.botMessage, collectedData);

    await supabase.from("messages").insert({
      lead_id: typedLead.id,
      sender: "bot",
      content: replyText,
      raw_payload: {
        step: nextStep.id,
        niche: typedLead.niche,
      },
    });

    await this.dispatchReply(typedLead.phone, nextStep, replyText);

    return this.buildResult(
      typedLead,
      {
        ...typedConversation,
        current_step: nextStep.id,
        collected_data: collectedData,
        is_qualified: qualification.isQualified,
      },
      nextStep,
      collectedData,
      finalStatus,
      qualification.isQualified,
    );
  }

  static async sendWelcome(
    lead: Lead,
    conversation: Conversation,
  ): Promise<void> {
    const flow = loadFlowTemplate(lead.niche);
    const welcome = flow.steps.find((step) => step.id === flow.welcomeStepId);

    if (!welcome) {
      throw new Error(`Welcome step missing for niche ${lead.niche}`);
    }

    const collectedData: Record<string, unknown> = {
      ...conversation.collected_data,
      nombre: lead.name,
    };

    const replyText = interpolateTemplate(welcome.botMessage, collectedData);
    const supabase = getSupabaseAdmin();

    await supabase.from("messages").insert({
      lead_id: lead.id,
      sender: "bot",
      content: replyText,
      raw_payload: { step: welcome.id, niche: lead.niche },
    });

    await this.dispatchReply(lead.phone, welcome, replyText);
  }

  private static async dispatchReply(
    phone: string,
    step: FlowStep,
    replyText: string,
  ): Promise<void> {
    if (step.inputType === "buttons" && step.options?.length) {
      await YCloudAdapter.sendButtons(phone, replyText, step.options);
      return;
    }

    if (step.inputType === "list" && step.listSections?.length) {
      await YCloudAdapter.sendList(
        phone,
        replyText,
        step.listButtonText ?? "Ver opciones",
        step.listSections,
      );
      return;
    }

    await YCloudAdapter.sendText(phone, replyText);
  }

  private static buildResult(
    lead: Lead,
    conversation: Conversation,
    step: FlowStep,
    collectedData: Record<string, unknown>,
    status: LeadStatus,
    isQualified: boolean,
  ): BotEngineResult {
    return {
      replyText: interpolateTemplate(step.botMessage, collectedData),
      replyButtons:
        step.inputType === "buttons" ? step.options : undefined,
      replyList:
        step.inputType === "list" && step.listSections
          ? {
              buttonText: step.listButtonText ?? "Ver opciones",
              sections: step.listSections,
            }
          : undefined,
      leadId: lead.id,
      currentStep: conversation.current_step,
      status,
      isQualified,
    };
  }

  static getFlow(niche: Lead["niche"]): FlowTemplate {
    return loadFlowTemplate(niche);
  }
}
