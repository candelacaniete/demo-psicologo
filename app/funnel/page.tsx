import FunnelLanding from "@/components/funnel/FunnelLanding";
import { NICHE_CONFIGS, resolveNiche } from "@/src/config/niches";

type FunnelPageProps = {
  searchParams: { nicho?: string | string[] };
};

export default function FunnelPage({ searchParams }: FunnelPageProps) {
  const niche = resolveNiche(searchParams.nicho);
  const config = NICHE_CONFIGS[niche];

  return <FunnelLanding niche={niche} config={config} />;
}
