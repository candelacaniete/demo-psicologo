export function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function toE164(phone: string): string {
  const digits = digitsOnly(phone);
  return digits ? `+${digits}` : "";
}

/**
 * Plan B (default): client opens WhatsApp with a prefilled message.
 * That first outbound from the user unlocks the 24h session window for the AI agent.
 */
export function buildWhatsAppDeepLink(
  businessPhone: string,
  prefilledMessage: string,
): string {
  const phone = digitsOnly(businessPhone);
  const text = encodeURIComponent(prefilledMessage);
  return `https://wa.me/${phone}?text=${text}`;
}

export function buildHandshakeMessage(params: {
  leadName: string;
  empresa: string;
  niche: string;
  initialInterest?: string;
  qualificationSummary?: string;
}): string {
  const interest = params.initialInterest?.trim();
  const parts = [
    `Hola, soy ${params.leadName}.`,
    `Completé el formulario de ${params.empresa} y quiero seguir por acá.`,
  ];
  if (params.qualificationSummary) {
    parts.push(`Mis datos: ${params.qualificationSummary}`);
  }
  if (interest) {
    parts.push(`Detalle: ${interest}`);
  }
  parts.push("¿Me pueden ayudar?");
  return parts.join("\n");
}
