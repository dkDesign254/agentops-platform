/**
 * NexusOps — Sync Router (tRPC)
 *
 * Exposes server-side sync operations to authenticated clients.
 *
 * Endpoints:
 *   sync.runAirtableSync  — Triggers a full Airtable → Supabase sync (admin only)
 *   sync.status           — Returns the last sync_log entry (any authenticated user)
 *   sync.seedIfEmpty      — Seeds sample data if Supabase has no records (admin only)
 */

import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { runAirtableSync, getLastSyncStatus } from "../sync/airtable-sync";
import { seedIfEmpty } from "../sync/seed-data";

export const syncRouter = router({
  /**
   * Trigger a full Airtable → Supabase sync.
   * Admin only — this is a potentially long-running operation.
   */
  runAirtableSync: adminProcedure.mutation(async () => {
    return runAirtableSync(true);
  }),

  /**
   * Get the status of the most recent Airtable sync.
   * Returns null if no sync has ever run.
   */
  status: protectedProcedure.query(async () => {
    return getLastSyncStatus();
  }),

  /**
   * Insert sample governance data if the Supabase workflows table is empty.
   * Admin only — intended for initial setup only.
   */
  seedIfEmpty: adminProcedure.mutation(async () => {
    return seedIfEmpty();
  }),
});
