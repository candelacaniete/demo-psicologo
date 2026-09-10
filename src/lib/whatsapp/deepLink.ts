export function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function toE164(phone: string): string {
  const digits = digitsOnly(phone);
  return digits ? `+${digits}` : "";
}

/**
 * Plan B: user-initiated WhatsApp handshake.
 * Opens wa.me so the lead writes first and unlocks the 24h session window.
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
}): string {
  const interest = params.initialInterest?.trim();
  const base = `Hola, soy ${params.leadName}. Completé el formulario de ${params.empresa} (${params.niche}) y quiero continuar por acá.`;
  return interest ? `${base} Consulta: ${interest}` : base;
}
