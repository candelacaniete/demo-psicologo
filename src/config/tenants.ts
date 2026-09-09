import type { NicheType } from "@/src/types/funnel";
import type { TenantRecord } from "@/src/types/tenant";
import { getSupabaseAdmin } from "@/src/lib/supabase/server";

/**
 * Seed tenants for local/demo multi-tenant routing.
 * Production should store secrets encrypted in Supabase `tenants`.
 */
export const DEMO_TENANTS: Record<string, TenantRecord> = {
  sec_inmobiliaria_123: {
    id: "sec_inmobiliaria_123",
    name: "Inmobiliaria Demo Sur",
    niche: "inmobiliaria",
    ycloud_api_key: process.env.YCLOUD_API_KEY ?? "",
    whatsapp_from: process.env.YCLOUD_WHATSAPP_FROM ?? "",
    custom_system_prompt:
      "Representás a Inmobiliaria Demo Sur. Sé cercana y concreta con zonas de CABA/GBA.",
    primary_color: "bg-emerald-700",
    hero_image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
  },
  sec_arquitectos_123: {
    id: "sec_arquitectos_123",
    name: "Estudio Norte Arquitectura",
    niche: "arquitectos",
    ycloud_api_key: process.env.YCLOUD_API_KEY ?? "",
    whatsapp_from: process.env.YCLOUD_WHATSAPP_FROM ?? "",
    custom_system_prompt:
      "Representás a Estudio Norte. Priorizá claridad técnica sin jerga innecesaria.",
    primary_color: "bg-stone-800",
    hero_image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  },
  sec_abogados_123: {
    id: "sec_abogados_123",
    name: "Estudio Legal Atlas",
    niche: "abogados",
    ycloud_api_key: process.env.YCLOUD_API_KEY ?? "",
    whatsapp_from: process.env.YCLOUD_WHATSAPP_FROM ?? "",
    custom_system_prompt:
      "Representás a Estudio Legal Atlas. Sé empática, precisa y nunca des asesoramiento definitivo por chat.",
    primary_color: "bg-slate-800",
    hero_image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80",
  },
  sec_hospedajes_123: {
    id: "sec_hospedajes_123",
    name: "Boutique Stay Patagonia",
    niche: "hospedajes",
    ycloud_api_key: process.env.YCLOUD_API_KEY ?? "",
    whatsapp_from: process.env.YCLOUD_WHATSAPP_FROM ?? "",
    custom_system_prompt:
      "Representás a Boutique Stay Patagonia. Transmití calidez y confirmá fechas con claridad.",
    primary_color: "bg-teal-700",
    hero_image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
  },
};

export function resolveClientId(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw.trim() : null;
}

export async function getTenantById(
  tenantId: string,
): Promise<TenantRecord | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .maybeSingle();

    if (!error && data) {
      return data as TenantRecord;
    }
  } catch {
    // Fall back to demo seed when DB/table is not ready.
  }

  return DEMO_TENANTS[tenantId] ?? null;
}

export async function getTenantByWhatsAppFrom(
  whatsappFrom: string,
): Promise<TenantRecord | null> {
  const normalized = whatsappFrom.replace(/[^\d]/g, "");

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("whatsapp_from", normalized)
      .maybeSingle();

    if (!error && data) {
      return data as TenantRecord;
    }
  } catch {
    // Fall back to demo seed.
  }

  const fromSeed = Object.values(DEMO_TENANTS).find(
    (tenant) => tenant.whatsapp_from.replace(/[^\d]/g, "") === normalized,
  );
  return fromSeed ?? null;
}

export function defaultClientIdForNiche(niche: NicheType): string {
  const match = Object.values(DEMO_TENANTS).find(
    (tenant) => tenant.niche === niche,
  );
  return match?.id ?? "sec_inmobiliaria_123";
}
