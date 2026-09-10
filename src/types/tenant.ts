import type {
  LeadStatus,
  NicheType,
  YCloudButton,
  YCloudListSection,
} from "@/src/types/funnel";

export interface TenantRecord {
  id: string;
  name: string;
  niche: NicheType;
  ycloud_api_key: string;
  whatsapp_from: string;
  custom_system_prompt: string | null;
  primary_color?: string | null;
  hero_image?: string | null;
  /** e.g. inmobiliaria.katem.store */
  subdomain?: string | null;
  /** e.g. www.cliente.com */
  custom_domain?: string | null;
}

export interface RunAgentParams {
  leadId: string;
  tenantId: string;
  tenantApiKey: string;
  whatsappFrom: string;
  niche: NicheType;
  customSystemPrompt?: string;
  userMessageContent: string;
  leadPhone: string;
}

export interface AgentToolContext {
  leadId: string;
  tenantId: string;
  leadPhone: string;
  tenantApiKey: string;
  whatsappFrom: string;
}

export interface SaveCollectedDataInput {
  data: Record<string, string | number | boolean | null>;
}

export interface QualifyLeadInput {
  status: Extract<LeadStatus, "QUALIFIED_HOT" | "DISCARDED">;
  reason: string;
}

export interface SendWhatsAppInteractiveInput {
  bodyText: string;
  mode: "buttons" | "list";
  buttons?: YCloudButton[];
  listButtonText?: string;
  listSections?: YCloudListSection[];
}

export interface AgentRunResult {
  leadId: string;
  tenantId: string;
  assistantText: string;
  toolInvocations: Array<{
    toolName: string;
    input: unknown;
    output: unknown;
  }>;
}
