/**
 * NexusOps — Supabase client (browser)
 *
 * Initialises the Supabase client using environment variables only.
 * The anon key is safe for the browser — it enforces Row Level Security.
 * Sensitive operations use the service role key on the server only.
 *
 * Required env vars (in root .env):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * Copy .env.example → .env and fill in your project values.
 * The .env file is gitignored and must never be committed.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Warn at runtime if env vars are missing — allows the build to succeed in CI
// without real credentials. Auth features will not work until values are set.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[NexusOps] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
      "Copy .env.example to .env in the project root and fill in your project values. " +
      "Auth and data features will not work until these are set."
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
