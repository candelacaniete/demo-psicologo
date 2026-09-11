import type { Metadata } from "next";
import ConversionLanding from "@/components/landing/ConversionLanding";
import { LANDING_CONTENT } from "@/src/config/landingContent";
import {
  defaultClientIdForNiche,
  getTenantById,
  resolveClientId,
} from "@/src/config/tenants";

export const metadata: Metadata = {
  title: LANDING_CONTENT.arquitectos.brand,
  description: LANDING_CONTENT.arquitectos.subhead,
};

type PageProps = {
  searchParams: { client_id?: string | string[] };
};

export default async function ArquitectosPage({ searchParams }: PageProps) {
  const clientId =
    resolveClientId(searchParams.client_id) ??
    defaultClientIdForNiche("arquitectos");
  const tenant = await getTenantById(clientId);

  return (
    <ConversionLanding
      niche="arquitectos"
      clientId={clientId}
      tenantName={tenant?.name}
    />
  );
}
