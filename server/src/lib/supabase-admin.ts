/**
 * NexusOps — Supabase admin client (server-side only)
 *
 * Uses the service role key which bypasses RLS.
 * NEVER import this file from the client bundle.
 * NEVER expose the service role key to the browser.
 *
 * Used for server-side operations that require elevated privileges,
 * such as reading data across all users or triggering admin actions.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "[NexusOps] Missing server-side Supabase environment variables. " +
      "Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in the server environment."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
