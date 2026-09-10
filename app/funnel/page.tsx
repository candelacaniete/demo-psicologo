import FunnelLanding from "@/components/funnel/FunnelLanding";
import { NICHE_CONFIGS, resolveNiche } from "@/src/config/niches";
import {
  defaultClientIdForNiche,
  getTenantById,
  resolveClientId,
} from "@/src/config/tenants";

type FunnelPageProps = {
  searchParams: {
    nicho?: string | string[];
    client_id?: string | string[];
  };
};

export default async function FunnelPage({ searchParams }: FunnelPageProps) {
  const nicheFromQuery = resolveNiche(searchParams.nicho);
  const clientIdFromQuery = resolveClientId(searchParams.client_id);

  const tenant = clientIdFromQuery
    ? await getTenantById(clientIdFromQuery)
    : null;

  const niche = tenant?.niche ?? nicheFromQuery;
  const clientId = tenant?.id ?? defaultClientIdForNiche(niche);
  const resolvedTenant = tenant ?? (await getTenantById(clientId));
  const config = {
    ...NICHE_CONFIGS[niche],
    ...(resolvedTenant?.hero_image
      ? { heroImage: resolvedTenant.hero_image }
      : {}),
    ...(resolvedTenant?.primary_color
      ? {
          primaryColor: resolvedTenant.primary_color,
          primaryColorHover: resolvedTenant.primary_color,
        }
      : {}),
    ...(resolvedTenant?.name
      ? {
          title: `${NICHE_CONFIGS[niche].title}`,
          subtitle: `${NICHE_CONFIGS[niche].subtitle} · ${resolvedTenant.name}`,
        }
      : {}),
  };

  return (
    <FunnelLanding
      niche={niche}
      config={config}
      clientId={clientId}
      tenantName={resolvedTenant?.name}
    />
  );
}
