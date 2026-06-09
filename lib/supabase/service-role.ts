import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Server-only client that bypasses RLS. Use only in Route Handlers / Server Actions
 * until Supabase Auth + per-user policies replace this pattern.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no puede ser la clave publishable (sb_publishable_…). En Supabase: Project Settings → API → copia la clave «service_role» (secreta de servidor), no la «anon» ni la publishable del cliente."
    );
  }
  if (anon && key === anon) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no puede ser la misma que NEXT_PUBLIC_SUPABASE_ANON_KEY. Usa la clave service_role del panel (secreta, solo servidor)."
    );
  }
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
