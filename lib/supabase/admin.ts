import { createClient } from "@supabase/supabase-js";

// Admin client bypasses RLS and should only be used in secure server contexts (API routes/Server Actions)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
