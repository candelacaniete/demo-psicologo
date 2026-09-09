import type { FlowTemplate, NicheType } from "@/src/types/funnel";
import inmobiliariaFlow from "@/src/templates/inmobiliaria.flow.json";
import arquitectosFlow from "@/src/templates/arquitectos.flow.json";
import abogadosFlow from "@/src/templates/abogados.flow.json";
import hospedajesFlow from "@/src/templates/hospedajes.flow.json";

const FLOW_MAP: Record<NicheType, FlowTemplate> = {
  inmobiliaria: inmobiliariaFlow as FlowTemplate,
  arquitectos: arquitectosFlow as FlowTemplate,
  abogados: abogadosFlow as FlowTemplate,
  hospedajes: hospedajesFlow as FlowTemplate,
};

export function loadFlowTemplate(niche: NicheType): FlowTemplate {
  const flow = FLOW_MAP[niche];
  if (!flow) {
    throw new Error(`No flow template found for niche: ${niche}`);
  }
  return flow;
}

export function getWelcomeMessage(
  niche: NicheType,
  collectedData: Record<string, unknown>,
): string {
  const flow = loadFlowTemplate(niche);
  const welcome = flow.steps.find((step) => step.id === flow.welcomeStepId);
  if (!welcome) {
    return "Hola, gracias por escribirnos.";
  }
  return interpolateTemplate(welcome.botMessage, collectedData);
}

export function interpolateTemplate(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{collected_data\.(\w+)\}\}/g, (_match, key: string) => {
    const value = data[key];
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  });
}
