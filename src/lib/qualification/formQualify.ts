import type { LeadStatus, NicheType } from "@/src/types/funnel";

export type QualifyFieldType = "select" | "text";

export interface QualifyFieldOption {
  value: string;
  label: string;
  /** Contribution to score when selected */
  score: number;
}

export interface QualifyField {
  id: string;
  label: string;
  type: QualifyFieldType;
  required?: boolean;
  placeholder?: string;
  options?: QualifyFieldOption[];
}

export interface NicheQualificationConfig {
  fields: QualifyField[];
  /** Minimum score to mark QUALIFIED_HOT */
  hotThreshold: number;
  /** Below this → DISCARDED */
  discardBelow: number;
}

export const NICHE_QUALIFICATION: Record<NicheType, NicheQualificationConfig> = {
  inmobiliaria: {
    hotThreshold: 70,
    discardBelow: 30,
    fields: [
      {
        id: "operacion",
        label: "¿Qué querés hacer?",
        type: "select",
        required: true,
        options: [
          { value: "comprar", label: "Comprar", score: 30 },
          { value: "alquilar", label: "Alquilar", score: 15 },
        ],
      },
      {
        id: "presupuesto_usd",
        label: "Presupuesto aproximado (USD)",
        type: "select",
        required: true,
        options: [
          { value: "30000", label: "Hasta 30.000", score: 5 },
          { value: "50000", label: "50.000", score: 25 },
          { value: "100000", label: "100.000", score: 35 },
          { value: "200000", label: "200.000+", score: 40 },
        ],
      },
      {
        id: "zona",
        label: "Zona / barrio preferido",
        type: "text",
        required: true,
        placeholder: "Ej: Palermo, Córdoba capital…",
      },
      {
        id: "tipo_propiedad",
        label: "Tipo de propiedad",
        type: "select",
        required: true,
        options: [
          { value: "depto", label: "Departamento", score: 15 },
          { value: "casa", label: "Casa", score: 15 },
          { value: "ph", label: "PH / duplex", score: 12 },
          { value: "otro", label: "Otro", score: 5 },
        ],
      },
      {
        id: "urgencia",
        label: "¿Para cuándo?",
        type: "select",
        required: true,
        options: [
          { value: "30d", label: "En los próximos 30 días", score: 20 },
          { value: "90d", label: "En 1–3 meses", score: 12 },
          { value: "explorando", label: "Solo estoy explorando", score: 0 },
        ],
      },
    ],
  },
  arquitectos: {
    hotThreshold: 65,
    discardBelow: 25,
    fields: [
      {
        id: "tipo_proyecto",
        label: "Tipo de proyecto",
        type: "select",
        required: true,
        options: [
          { value: "obra_nueva", label: "Obra nueva", score: 25 },
          { value: "remodelacion", label: "Remodelación", score: 20 },
        ],
      },
      {
        id: "metros_cuadrados",
        label: "Metros cuadrados aproximados",
        type: "select",
        required: true,
        options: [
          { value: "60", label: "Hasta 60 m²", score: 5 },
          { value: "100", label: "100 m²", score: 25 },
          { value: "180", label: "180 m²", score: 35 },
          { value: "300", label: "300 m²+", score: 40 },
        ],
      },
      {
        id: "terreno_propio",
        label: "¿Tenés terreno / propiedad?",
        type: "select",
        required: true,
        options: [
          { value: "si", label: "Sí", score: 25 },
          { value: "no", label: "Todavía no", score: 5 },
        ],
      },
      {
        id: "ubicacion",
        label: "Ubicación del proyecto",
        type: "text",
        required: true,
        placeholder: "Ciudad / barrio",
      },
      {
        id: "presupuesto_obra",
        label: "Presupuesto estimado de obra",
        type: "select",
        required: true,
        options: [
          { value: "bajo", label: "Todavía no definido", score: 0 },
          { value: "medio", label: "Definido / en rango", score: 20 },
          { value: "alto", label: "Alto / flexible", score: 30 },
        ],
      },
    ],
  },
  abogados: {
    hotThreshold: 60,
    discardBelow: 20,
    fields: [
      {
        id: "area_legal",
        label: "Área legal",
        type: "select",
        required: true,
        options: [
          { value: "corporativo", label: "Corporativo", score: 25 },
          { value: "civil", label: "Civil / familia", score: 20 },
          { value: "laboral", label: "Laboral", score: 22 },
          { value: "otro", label: "Otro", score: 5 },
        ],
      },
      {
        id: "urgencia",
        label: "Urgencia",
        type: "select",
        required: true,
        options: [
          { value: "alta", label: "Alta (esta semana)", score: 30 },
          { value: "media", label: "Media", score: 15 },
          { value: "baja", label: "Baja / consulta", score: 5 },
        ],
      },
      {
        id: "abono_mensual_usd",
        label: "Capacidad de abono mensual (USD)",
        type: "select",
        required: true,
        options: [
          { value: "200", label: "Hasta 200", score: 5 },
          { value: "500", label: "500", score: 25 },
          { value: "1000", label: "1.000+", score: 35 },
        ],
      },
      {
        id: "resumen_caso",
        label: "Resumen breve del caso",
        type: "text",
        required: true,
        placeholder: "Contanos en 1–2 oraciones",
      },
    ],
  },
  hospedajes: {
    hotThreshold: 55,
    discardBelow: 20,
    fields: [
      {
        id: "tipo_viaje",
        label: "Tipo de viaje",
        type: "select",
        required: true,
        options: [
          { value: "placer", label: "Placer", score: 15 },
          { value: "corporativo", label: "Corporativo", score: 20 },
        ],
      },
      {
        id: "cantidad_noches",
        label: "Cantidad de noches",
        type: "select",
        required: true,
        options: [
          { value: "1", label: "1 noche", score: 5 },
          { value: "2", label: "2 noches", score: 20 },
          { value: "3", label: "3 noches", score: 25 },
          { value: "7", label: "7+ noches", score: 30 },
        ],
      },
      {
        id: "cantidad_huespedes",
        label: "Huéspedes",
        type: "select",
        required: true,
        options: [
          { value: "1", label: "1", score: 8 },
          { value: "2", label: "2", score: 15 },
          { value: "4", label: "3–4", score: 20 },
          { value: "5", label: "5+", score: 18 },
        ],
      },
      {
        id: "fechas",
        label: "Fechas tentativas",
        type: "text",
        required: true,
        placeholder: "Ej: 12 al 15 de octubre",
      },
    ],
  },
};

/** Text fields get a flat score if non-empty */
const TEXT_FIELD_SCORE = 15;

export interface QualificationResult {
  score: number;
  status: LeadStatus;
  isQualified: boolean;
  reasons: string[];
  collectedData: Record<string, string | number>;
}

export function qualifyFromForm(
  niche: NicheType,
  answers: Record<string, string>,
): QualificationResult {
  const config = NICHE_QUALIFICATION[niche];
  let score = 0;
  const reasons: string[] = [];
  const collectedData: Record<string, string | number> = {};

  for (const field of config.fields) {
    const raw = (answers[field.id] ?? "").trim();
    if (!raw) continue;

    if (field.type === "select" && field.options) {
      const option = field.options.find((item) => item.value === raw);
      if (option) {
        score += option.score;
        collectedData[field.id] = ["presupuesto_usd", "metros_cuadrados", "abono_mensual_usd", "cantidad_noches", "cantidad_huespedes"].includes(
          field.id,
        )
          ? Number(option.value)
          : option.value;
        if (option.score > 0) {
          reasons.push(`${field.label}: ${option.label} (+${option.score})`);
        } else {
          reasons.push(`${field.label}: ${option.label}`);
        }
      }
    } else {
      score += TEXT_FIELD_SCORE;
      collectedData[field.id] = raw;
      reasons.push(`${field.label}: ${raw} (+${TEXT_FIELD_SCORE})`);
    }
  }

  // Hard rules aligned with earlier flow criteria
  if (niche === "inmobiliaria") {
    const budget = Number(collectedData.presupuesto_usd ?? 0);
    if (budget >= 50000 && collectedData.zona && collectedData.tipo_propiedad) {
      score = Math.max(score, config.hotThreshold);
      reasons.push("Regla: presupuesto ≥ 50k + zona + tipo");
    }
  }
  if (niche === "arquitectos") {
    const m2 = Number(collectedData.metros_cuadrados ?? 0);
    if (m2 >= 100 && collectedData.terreno_propio === "si") {
      score = Math.max(score, config.hotThreshold);
      reasons.push("Regla: ≥100 m² + terreno propio");
    }
  }
  if (niche === "abogados") {
    const area = String(collectedData.area_legal ?? "");
    const pay = Number(collectedData.abono_mensual_usd ?? 0);
    if (
      ["corporativo", "civil", "laboral"].includes(area) &&
      pay >= 500 &&
      collectedData.urgencia === "alta"
    ) {
      score = Math.max(score, config.hotThreshold);
      reasons.push("Regla: área atendida + abono ≥500 + urgencia alta");
    }
  }
  if (niche === "hospedajes") {
    const nights = Number(collectedData.cantidad_noches ?? 0);
    if (nights >= 2 && collectedData.fechas && collectedData.cantidad_huespedes) {
      score = Math.max(score, config.hotThreshold);
      reasons.push("Regla: ≥2 noches + fechas + huéspedes");
    }
  }

  let status: LeadStatus = "IN_QUALIFICATION";
  if (score >= config.hotThreshold) status = "QUALIFIED_HOT";
  else if (score < config.discardBelow) status = "DISCARDED";

  return {
    score,
    status,
    isQualified: status === "QUALIFIED_HOT",
    reasons,
    collectedData,
  };
}

export function formatQualificationSummary(
  collectedData: Record<string, unknown>,
): string {
  return Object.entries(collectedData)
    .filter(([key]) => !["nombre", "tenant_id", "handshake_mode", "qualification_score", "qualification_reasons", "initial_interest"].includes(key))
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}
