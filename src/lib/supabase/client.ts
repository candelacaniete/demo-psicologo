import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  // Guard: service_role / secret keys must never ship to the browser.
  if (
    key.includes("service_role") ||
    key.startsWith("sb_secret_") ||
    key.toLowerCase().includes("service role")
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY has a secret/service_role key. Use the anon/public (or publishable) key instead.",
    );
  }

  // Legacy JWT anon keys decode to role "anon"; service_role JWTs also get blocked by Supabase in browser.
  try {
    const payloadPart = key.split(".")[1];
    if (payloadPart) {
      const json = JSON.parse(
        atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
      ) as { role?: string };
      if (json.role === "service_role") {
        throw new Error(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY is the service_role secret. Paste the anon/public key from Supabase → Settings → API.",
        );
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("service_role")) {
      throw error;
    }
  }

  if (!browserClient) {
    browserClient = createClient(url, key);
  }

  return browserClient;
}
