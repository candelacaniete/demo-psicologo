import ConversionLanding from "@/components/landing/ConversionLanding";
import { resolveNiche } from "@/src/config/niches";
import {
  defaultClientIdForNiche,
  getTenantById,
  resolveClientId,
} from "@/src/config/tenants";
import type { NicheType } from "@/src/types/funnel";
import { redirect } from "next/navigation";

const NICHE_PATH: Record<NicheType, string> = {
  inmobiliaria: "/inmobiliaria",
  arquitectos: "/arquitectos",
  abogados: "/abogados",
  hospedajes: "/hospedajes",
};

type FunnelPageProps = {
  searchParams: {
    nicho?: string | string[];
    client_id?: string | string[];
  };
};

/** Compatibility alias → prefer /inmobiliaria|/arquitectos|/abogados|/hospedajes */
export default async function FunnelPage({ searchParams }: FunnelPageProps) {
  const nicheFromQuery = resolveNiche(searchParams.nicho);
  const clientIdFromQuery = resolveClientId(searchParams.client_id);

  const tenant = clientIdFromQuery
    ? await getTenantById(clientIdFromQuery)
    : null;

  const niche = tenant?.niche ?? nicheFromQuery;
  const clientId = tenant?.id ?? defaultClientIdForNiche(niche);
  const resolvedTenant = tenant ?? (await getTenantById(clientId));

  if (!clientIdFromQuery && !searchParams.nicho) {
    redirect(NICHE_PATH[niche]);
  }

  return (
    <ConversionLanding
      niche={niche}
      clientId={clientId}
      tenantName={resolvedTenant?.name}
    />
  );
}
