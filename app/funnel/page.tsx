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
  const config = {
    ...NICHE_CONFIGS[niche],
    ...(tenant?.hero_image ? { heroImage: tenant.hero_image } : {}),
    ...(tenant?.primary_color
      ? { primaryColor: tenant.primary_color, primaryColorHover: tenant.primary_color }
      : {}),
    ...(tenant?.name
      ? {
          title: `${NICHE_CONFIGS[niche].title}`,
          subtitle: `${NICHE_CONFIGS[niche].subtitle} · ${tenant.name}`,
        }
      : {}),
  };

  return <FunnelLanding niche={niche} config={config} clientId={clientId} />;
}
