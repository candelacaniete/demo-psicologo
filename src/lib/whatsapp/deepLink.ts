export function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function toE164(phone: string): string {
  const digits = digitsOnly(phone);
  return digits ? `+${digits}` : "";
}

/**
 * Fallback: user opens WhatsApp first (wa.me) if template outbound fails.
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
    `Hola, soy ${params.leadName}. Completé el formulario de ${params.empresa} y quiero continuar por acá.`,
  ];
  if (interest) parts.push(`Consulta: ${interest}`);
  if (params.qualificationSummary) {
    parts.push(`Datos: ${params.qualificationSummary}`);
  }
  return parts.join("\n");
}
