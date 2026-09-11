/** Digits only, no plus. */
export function phoneDigits(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Normalize for storage. AR mobiles → 549… (country + mobile 9 + area + number).
 */
export function normalizePhone(phone: string, countryCode = "54"): string {
  let digits = phoneDigits(phone);

  if (countryCode === "54") {
    if (digits.startsWith("549")) return digits;
    if (digits.startsWith("54") && !digits.startsWith("549")) {
      return `549${digits.slice(2)}`;
    }
    if (digits.startsWith("9")) return `54${digits}`;
    if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
    return `549${digits}`;
  }

  if (digits.startsWith(countryCode)) return digits;
  if (digits.startsWith("0")) {
    return `${countryCode}${digits.replace(/^0+/, "")}`;
  }
  return `${countryCode}${digits}`;
}

/**
 * Variants to match WhatsApp `from` vs form-stored phone (AR 549 vs 54, etc.).
 */
export function phoneLookupVariants(phone: string): string[] {
  const d = phoneDigits(phone);
  if (!d) return [];

  const variants = new Set<string>([d]);

  // AR: with / without mobile "9" after country code
  if (d.startsWith("549") && d.length >= 12) {
    variants.add(`54${d.slice(3)}`);
  }
  if (d.startsWith("54") && !d.startsWith("549") && d.length >= 11) {
    variants.add(`549${d.slice(2)}`);
  }

  // Normalized AR form
  variants.add(normalizePhone(d, "54"));

  return Array.from(variants);
}

/** Loose match: same national number ignoring AR mobile 9. */
export function phonesLooselyEqual(a: string, b: string): boolean {
  const va = phoneLookupVariants(a);
  const vb = new Set(phoneLookupVariants(b));
  return va.some((v) => vb.has(v));
}
