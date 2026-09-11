import { NextRequest, NextResponse } from "next/server";
import { DEMO_TENANTS } from "@/src/config/tenants";
import type { NicheType } from "@/src/types/funnel";

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "katem.store")
  .toLowerCase()
  .replace(/^www\./, "");

const NICHE_PATH: Record<NicheType, string> = {
  inmobiliaria: "/inmobiliaria",
  arquitectos: "/arquitectos",
  abogados: "/abogados",
  hospedajes: "/hospedajes",
};

function resolveTenantIdFromHost(hostname: string): string | null {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";

  const byCustom = Object.values(DEMO_TENANTS).find(
    (tenant) => tenant.custom_domain?.toLowerCase() === host,
  );
  if (byCustom) return byCustom.id;

  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = host.replace(`.${ROOT_DOMAIN}`, "");
    if (["www", "app", "api", "admin"].includes(subdomain)) return null;
    const bySub = Object.values(DEMO_TENANTS).find(
      (tenant) => tenant.subdomain === subdomain,
    );
    return bySub?.id ?? null;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/psicologos") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") || "";
  const tenantId = resolveTenantIdFromHost(host);

  if (!tenantId) {
    return NextResponse.next();
  }

  const tenant = DEMO_TENANTS[tenantId];
  if (!tenant) {
    return NextResponse.next();
  }

  const nichePath = NICHE_PATH[tenant.niche];

  // Custom/subdomain → serve niche conversion landing.
  if (
    pathname === "/" ||
    pathname === "/funnel" ||
    pathname === nichePath
  ) {
    const url = request.nextUrl.clone();
    url.pathname = nichePath;
    url.searchParams.set("client_id", tenantId);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
