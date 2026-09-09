import type { NicheType } from "@/src/types/funnel";

const AGENT_TOOL_INSTRUCTIONS = `
Analiza el historial de conversación. Tu objetivo es calificar al lead según los criterios de tu nicho.
- Ejecuta \`saveCollectedData\` cada vez que el usuario mencione un dato relevante (presupuesto, m², zona, área legal, fechas, etc.).
- Ejecuta \`qualifyLead\` con 'QUALIFIED_HOT' tan pronto como se cumplan los criterios mínimos de calificación, o 'DISCARDED' si no los cumple.
- Si deseas dar opciones estructuradas para agilizar la respuesta del usuario, ejecuta \`sendWhatsAppInteractive\` pasándole los botones o la lista.
- Responde de forma breve, amable y conversacional en español.
`.trim();

const NICHE_CRITERIA: Record<NicheType, string> = {
  inmobiliaria: `
Criterios de calificación (Inmobiliaria):
- QUALIFIED_HOT si el presupuesto es >= $50,000 USD y especificó zona/tipo de propiedad.
- DISCARDED si el presupuesto es claramente menor a $50,000 USD o no hay intención real de operación.
Datos clave a recolectar: operacion (comprar/alquilar), presupuesto_usd, zona, tipo_propiedad.
`.trim(),
  arquitectos: `
Criterios de calificación (Arquitectos):
- QUALIFIED_HOT si los metros cuadrados son >= 100 m² y cuenta con terreno o proyecto definido.
- DISCARDED si el proyecto es demasiado chico (< 100 m²) o está indefinido sin horizonte.
Datos clave a recolectar: tipo_proyecto, metros_cuadrados, terreno_propio, ubicacion.
`.trim(),
  abogados: `
Criterios de calificación (Abogados):
- QUALIFIED_HOT si el caso corresponde a áreas atendidas (laboral/civil/corporativo) y requiere atención urgente/paga.
- DISCARDED si el área no se atiende o no hay capacidad/disposición de abono.
Datos clave a recolectar: area_legal, urgencia, abono_mensual_usd, resumen_caso.
`.trim(),
  hospedajes: `
Criterios de calificación (Hospedajes):
- QUALIFIED_HOT si define fechas de estadía, cantidad de huéspedes y hay señal de disponibilidad/interés confirmado.
- DISCARDED si no hay fechas, huéspedes o el pedido es imposible de cubrir.
Datos clave a recolectar: tipo_viaje, fechas, cantidad_noches, cantidad_huespedes.
`.trim(),
};

const NICHE_ROLE: Record<NicheType, string> = {
  inmobiliaria:
    "Sos un asesor inmobiliario virtual que califica leads por WhatsApp para una inmobiliaria.",
  arquitectos:
    "Sos un coordinador comercial de un estudio de arquitectura que califica proyectos por WhatsApp.",
  abogados:
    "Sos un asistente de recepción de un estudio jurídico que califica consultas por WhatsApp.",
  hospedajes:
    "Sos un anfitrión virtual de un hospedaje boutique que califica reservas por WhatsApp.",
};

export function buildSystemPrompt(
  niche: NicheType,
  customSystemPrompt?: string,
): string {
  const sections = [
    NICHE_ROLE[niche],
    AGENT_TOOL_INSTRUCTIONS,
    NICHE_CRITERIA[niche],
  ];

  if (customSystemPrompt?.trim()) {
    sections.push(`Instrucciones propias del tenant:\n${customSystemPrompt.trim()}`);
  }

  return sections.join("\n\n");
}

export const PROMPT_TOOL_INSTRUCTIONS = AGENT_TOOL_INSTRUCTIONS;
