import type { Metadata } from "next";
import ConversionLanding from "@/components/landing/ConversionLanding";
import { LANDING_CONTENT } from "@/src/config/landingContent";
import {
  defaultClientIdForNiche,
  getTenantById,
  resolveClientId,
} from "@/src/config/tenants";

export const metadata: Metadata = {
  title: LANDING_CONTENT.inmobiliaria.brand,
  description: LANDING_CONTENT.inmobiliaria.subhead,
};

type PageProps = {
  searchParams: { client_id?: string | string[] };
};

export default async function InmobiliariaPage({ searchParams }: PageProps) {
  const clientId =
    resolveClientId(searchParams.client_id) ??
    defaultClientIdForNiche("inmobiliaria");
  const tenant = await getTenantById(clientId);

  return (
    <ConversionLanding
      niche="inmobiliaria"
      clientId={clientId}
      tenantName={tenant?.name}
    />
  );
}
