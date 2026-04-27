/**
 * NexusOps — Supabase admin client (server-side only)
 *
 * Uses the service role key which bypasses RLS.
 * NEVER import this file from the client bundle.
 * NEVER expose the service role key to the browser.
 *
 * Lazy-initialised: getSupabaseAdmin() throws at call-time if env vars
 * are missing, rather than crashing the entire server on startup.
 * This allows the server to start without Supabase configured (Airtable-only mode).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase admin client (service role).
 * Throws a clear error if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[NexusOps] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Set these in the Render environment variables (or root .env) to enable " +
        "server-side Supabase access (sync, auth bridge, report approval)."
    );
  }

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

/**
 * Returns true if Supabase admin is properly configured.
 * Use this to guard optional Supabase-dependent paths without throwing.
 */
export function isSupabaseAdminAvailable(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
