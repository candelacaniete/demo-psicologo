import type { NicheConfig, NicheType } from "@/src/types/funnel";

export const DEFAULT_NICHE: NicheType = "inmobiliaria";

export const NICHE_CONFIGS: Record<NicheType, NicheConfig> = {
  inmobiliaria: {
    id: "inmobiliaria",
    title: "Encontrá tu próxima propiedad sin vueltas",
    subtitle:
      "Dejanos tus datos y un asesor te escribe por WhatsApp en minutos para entender qué estás buscando.",
    heroImage:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "bg-emerald-700",
    primaryColorHover: "hover:bg-emerald-800",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-800",
    fields: {
      nameLabel: "Nombre completo",
      phoneLabel: "WhatsApp",
      interestLabel: "¿Qué estás buscando?",
      interestPlaceholder: "Ej: Departamento 2 ambientes en Palermo",
      ctaLabel: "Quiero que me contacten",
    },
    flowTemplatePath: "@/src/templates/inmobiliaria.flow.json",
  },
  arquitectos: {
    id: "arquitectos",
    title: "Diseñamos espacios que se viven bien",
    subtitle:
      "Contanos tu proyecto y te guiamos por WhatsApp para ver si encaja con nuestro estudio.",
    heroImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "bg-stone-800",
    primaryColorHover: "hover:bg-stone-900",
    accentBg: "bg-stone-100",
    accentText: "text-stone-800",
    fields: {
      nameLabel: "Nombre",
      phoneLabel: "WhatsApp",
      interestLabel: "Contanos tu proyecto",
      interestPlaceholder: "Ej: Remodelación de casa de 180 m²",
      ctaLabel: "Empezar conversación",
    },
    flowTemplatePath: "@/src/templates/arquitectos.flow.json",
  },
  abogados: {
    id: "abogados",
    title: "Asesoría legal clara, sin rodeos",
    subtitle:
      "Dejá tus datos y un abogado te escribe por WhatsApp para entender tu caso y la urgencia.",
    heroImage:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "bg-slate-800",
    primaryColorHover: "hover:bg-slate-900",
    accentBg: "bg-slate-100",
    accentText: "text-slate-800",
    fields: {
      nameLabel: "Nombre completo",
      phoneLabel: "WhatsApp",
      interestLabel: "Resumen del caso",
      interestPlaceholder: "Ej: Contrato societario / divorcio / demanda",
      ctaLabel: "Hablar con el estudio",
    },
    flowTemplatePath: "@/src/templates/abogados.flow.json",
  },
  hospedajes: {
    id: "hospedajes",
    title: "Reservá una estadía con atención real",
    subtitle:
      "Contanos fechas y huéspedes: te respondemos por WhatsApp con disponibilidad y propuesta.",
    heroImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "bg-teal-700",
    primaryColorHover: "hover:bg-teal-800",
    accentBg: "bg-teal-50",
    accentText: "text-teal-900",
    fields: {
      nameLabel: "Nombre",
      phoneLabel: "WhatsApp",
      interestLabel: "¿Qué tipo de estadía buscás?",
      interestPlaceholder: "Ej: Fin de semana romántico / viaje corporativo",
      ctaLabel: "Consultar disponibilidad",
    },
    flowTemplatePath: "@/src/templates/hospedajes.flow.json",
  },
};

export const NICHE_LIST = Object.values(NICHE_CONFIGS);

export function resolveNiche(value: string | string[] | undefined): NicheType {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && raw in NICHE_CONFIGS) {
    return raw as NicheType;
  }
  return DEFAULT_NICHE;
}

export function isNicheType(value: string): value is NicheType {
  return value in NICHE_CONFIGS;
}
