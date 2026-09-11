export type LeadStatus =
  | "NEW"
  | "IN_QUALIFICATION"
  | "QUALIFIED_HOT"
  | "DISCARDED";

export type NicheType =
  | "inmobiliaria"
  | "arquitectos"
  | "abogados"
  | "hospedajes";

export type MessageSender = "user" | "bot";

export interface Lead {
  id: string;
  created_at: string;
  tenant_id: string;
  name: string;
  phone: string;
  niche: NicheType;
  status: LeadStatus;
  source: string;
  initial_interest: string | null;
}

export interface Conversation {
  id: string;
  lead_id: string;
  current_step: string;
  collected_data: Record<string, unknown>;
  is_qualified: boolean;
  updated_at: string;
}

export interface Message {
  id: string;
  lead_id: string;
  sender: MessageSender;
  content: string;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadWithConversation extends Lead {
  conversations: Conversation | Conversation[] | null;
}

export interface NicheFormFields {
  nameLabel: string;
  phoneLabel: string;
  interestLabel: string;
  interestPlaceholder: string;
  ctaLabel: string;
}

export interface NicheConfig {
  id: NicheType;
  title: string;
  subtitle: string;
  heroImage: string;
  primaryColor: string;
  primaryColorHover: string;
  accentBg: string;
  accentText: string;
  fields: NicheFormFields;
  flowTemplatePath: string;
}

export interface CaptureLeadPayload {
  name: string;
  phone: string;
  niche: NicheType;
  initialInterest: string;
  countryCode?: string;
  clientId?: string;
  tenantId?: string;
  /** Respuestas de calificación del formulario por nicho */
  qualificationAnswers?: Record<string, string>;
}

export interface StandardMessage {
  from: string;
  to?: string;
  text: string;
  type: "text" | "interactive_button" | "interactive_list" | "unknown";
  buttonId?: string;
  listId?: string;
  timestamp: string;
  raw: Record<string, unknown>;
}

export interface YCloudButton {
  id: string;
  title: string;
}

export interface YCloudListSection {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export type FlowInputType =
  | "text"
  | "buttons"
  | "list"
  | "number"
  | "none";

export type QualificationOperator =
  | "gte"
  | "lte"
  | "eq"
  | "neq"
  | "in"
  | "exists";

export interface QualificationRule {
  field: string;
  operator: QualificationOperator;
  value: string | number | boolean | Array<string | number>;
  onMatchStatus?: LeadStatus;
  onFailStatus?: LeadStatus;
}

export interface FlowStep {
  id: string;
  botMessage: string;
  inputType: FlowInputType;
  saveAs?: string;
  options?: YCloudButton[];
  listSections?: YCloudListSection[];
  listButtonText?: string;
  nextStep?: string | null;
  nextStepMap?: Record<string, string>;
  qualificationRules?: QualificationRule[];
  end?: boolean;
}

export interface FlowTemplate {
  niche: NicheType;
  name: string;
  welcomeStepId: string;
  steps: FlowStep[];
}

export interface BotEngineResult {
  replyText: string;
  replyButtons?: YCloudButton[];
  replyList?: {
    buttonText: string;
    sections: YCloudListSection[];
  };
  leadId: string;
  currentStep: string;
  status: LeadStatus;
  isQualified: boolean;
}
