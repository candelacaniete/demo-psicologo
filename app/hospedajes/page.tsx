import type { Metadata } from "next";
import ConversionLanding from "@/components/landing/ConversionLanding";
import { LANDING_CONTENT } from "@/src/config/landingContent";
import {
  defaultClientIdForNiche,
  getTenantById,
  resolveClientId,
} from "@/src/config/tenants";

export const metadata: Metadata = {
  title: LANDING_CONTENT.hospedajes.brand,
  description: LANDING_CONTENT.hospedajes.subhead,
};

type PageProps = {
  searchParams: { client_id?: string | string[] };
};

export default async function HospedajesPage({ searchParams }: PageProps) {
  const clientId =
    resolveClientId(searchParams.client_id) ??
    defaultClientIdForNiche("hospedajes");
  const tenant = await getTenantById(clientId);

  return (
    <ConversionLanding
      niche="hospedajes"
      clientId={clientId}
      tenantName={tenant?.name}
    />
  );
}
