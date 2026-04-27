/**
 * NexusOps — Airtable → Supabase Sync Service
 *
 * Pulls all 5 Airtable tables and upserts them into the Supabase
 * `workflows`, `execution_logs`, `ai_interaction_logs`,
 * `performance_data`, and `final_reports` tables.
 *
 * Idempotent: uses `airtable_record_id` as the conflict key so
 * running the sync multiple times never creates duplicates.
 *
 * Safe: each table syncs independently — a failure in one table
 * does not abort the others. Errors are logged and returned in the
 * sync summary so the server stays up.
 *
 * Env vars required:
 *   AIRTABLE_API_KEY
 *   AIRTABLE_BASE_ID   (defaults to app4DDa3zvaGspOhz)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import {
  getWorkflows,
  getExecutionLogs,
  getAILogs,
  getPerformanceData,
  getFinalReports,
} from "../airtable";
import { getSupabaseAdmin, isSupabaseAdminAvailable } from "../src/lib/supabase-admin";
import { ENV } from "../_core/env";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SyncTableResult {
  table: string;
  synced: number;
  skipped: number;
  error: string | null;
}

export interface SyncResult {
  ok: boolean;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  tables: SyncTableResult[];
  totalSynced: number;
  error: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parses an Airtable datetime string into an ISO string, or null. */
function toIso(val: string | null | undefined): string | null {
  if (!val) return null;
  try {
    return new Date(val).toISOString();
  } catch {
    return null;
  }
}

/** Derives duration_mins from two ISO datetime strings, or null. */
function deriveDuration(
  requested: string | null,
  completed: string | null
): number | null {
  if (!requested || !completed) return null;
  try {
    const ms = new Date(completed).getTime() - new Date(requested).getTime();
    if (ms <= 0) return null;
    return parseFloat((ms / 60_000).toFixed(1));
  } catch {
    return null;
  }
}

// ─── Sync workflows ───────────────────────────────────────────────────────────

async function syncWorkflows(): Promise<{
  result: SyncTableResult;
  /** Map from Airtable record ID → Supabase UUID (for FK resolution in child tables) */
  idMap: Map<string, string>;
}> {
  const idMap = new Map<string, string>();
  const result: SyncTableResult = { table: "workflows", synced: 0, skipped: 0, error: null };

  try {
    const records = await getWorkflows();
    if (records.length === 0) {
      return { result, idMap };
    }

    const db = getSupabaseAdmin();

    for (const r of records) {
      const row = {
        workflow_id:   r.workflowId || r.recordId,
        workflow_name: r.name,
        requested_by:  r.requestedBy || null,
        runtime_used:  r.runtime || null,
        status:        r.status || "Pending",
        report_period: r.reportPeriod || null,
        date_requested: toIso(r.dateRequested),
        date_completed: toIso(r.dateCompleted),
        duration_mins: deriveDuration(r.dateRequested, r.dateCompleted),
        notes:         r.notes || null,
        airtable_record_id: r.recordId,
      };

      const { data, error } = await db
        .from("workflows")
        .upsert(row, { onConflict: "airtable_record_id", ignoreDuplicates: false })
        .select("id")
        .single();

      if (error) {
        console.warn(`[Sync] workflows upsert failed for ${r.recordId}:`, error.message);
        result.skipped++;
      } else {
        if (data?.id) idMap.set(r.recordId, data.id);
        result.synced++;
      }
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : String(err);
    console.error("[Sync] workflows table error:", result.error);
  }

  return { result, idMap };
}

// ─── Sync execution logs ──────────────────────────────────────────────────────

async function syncExecutionLogs(workflowIdMap: Map<string, string>): Promise<SyncTableResult> {
  const result: SyncTableResult = { table: "execution_logs", synced: 0, skipped: 0, error: null };

  try {
    const records = await getExecutionLogs();
    if (records.length === 0) return result;

    const db = getSupabaseAdmin();

    for (const r of records) {
      // Resolve Airtable workflow record ID → Supabase UUID
      const airtableWfId = r.workflowRecordIds?.[0];
      const supabaseWfId = airtableWfId ? workflowIdMap.get(airtableWfId) : undefined;

      if (!supabaseWfId) {
        // Workflow not yet synced or not found — skip but don't error
        result.skipped++;
        continue;
      }

      const row = {
        log_id:        r.logId || null,
        workflow_id:   supabaseWfId,
        runtime:       r.runtime || null,
        step_name:     r.stepName || null,
        event_type:    r.eventType || null,
        status:        r.status || null,
        timestamp:     toIso(r.timestamp),
        message:       r.message || null,
        airtable_record_id: r.recordId,
      };

      const { error } = await db
        .from("execution_logs")
        .upsert(row, { onConflict: "airtable_record_id", ignoreDuplicates: false });

      if (error) {
        console.warn(`[Sync] execution_logs upsert failed for ${r.recordId}:`, error.message);
        result.skipped++;
      } else {
        result.synced++;
      }
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : String(err);
    console.error("[Sync] execution_logs table error:", result.error);
  }

  return result;
}

// ─── Sync AI interaction logs ─────────────────────────────────────────────────

async function syncAILogs(workflowIdMap: Map<string, string>): Promise<SyncTableResult> {
  const result: SyncTableResult = { table: "ai_interaction_logs", synced: 0, skipped: 0, error: null };

  try {
    const records = await getAILogs();
    if (records.length === 0) return result;

    const db = getSupabaseAdmin();

    for (const r of records) {
      const airtableWfId = r.workflowRecordIds?.[0];
      const supabaseWfId = airtableWfId ? workflowIdMap.get(airtableWfId) : undefined;

      if (!supabaseWfId) {
        result.skipped++;
        continue;
      }

      const row = {
        log_display_id: r.logId || null,
        workflow_id:    supabaseWfId,
        prompt_text:    r.promptText || null,
        response_text:  r.responseText || null,
        model_used:     r.modelUsed || null,
        timestamp:      toIso(r.timestamp),
        cost_notes:     r.costNotes || null,
        airtable_record_id: r.recordId,
      };

      const { error } = await db
        .from("ai_interaction_logs")
        .upsert(row, { onConflict: "airtable_record_id", ignoreDuplicates: false });

      if (error) {
        console.warn(`[Sync] ai_interaction_logs upsert failed for ${r.recordId}:`, error.message);
        result.skipped++;
      } else {
        result.synced++;
      }
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : String(err);
    console.error("[Sync] ai_interaction_logs table error:", result.error);
  }

  return result;
}

// ─── Sync performance data ────────────────────────────────────────────────────

async function syncPerformanceData(workflowIdMap: Map<string, string>): Promise<SyncTableResult> {
  const result: SyncTableResult = { table: "performance_data", synced: 0, skipped: 0, error: null };

  try {
    const records = await getPerformanceData();
    if (records.length === 0) return result;

    const db = getSupabaseAdmin();

    for (const r of records) {
      const airtableWfId = r.workflowRecordIds?.[0];
      const supabaseWfId = airtableWfId ? workflowIdMap.get(airtableWfId) : undefined;

      const row = {
        campaign_name:    r.campaignName,
        workflow_id:      supabaseWfId ?? null,
        impressions:      r.impressions ?? null,
        clicks:           r.clicks ?? null,
        conversions:      r.conversions ?? null,
        spend:            r.spend ?? null,
        ctr:              r.ctrPct != null ? r.ctrPct / 100 : null, // Airtable stores as %, Supabase stores as decimal
        roas:             r.roas ?? null,
        reporting_period: r.reportingPeriod || null,
        airtable_record_id: r.recordId,
      };

      const { error } = await db
        .from("performance_data")
        .upsert(row, { onConflict: "airtable_record_id", ignoreDuplicates: false });

      if (error) {
        console.warn(`[Sync] performance_data upsert failed for ${r.recordId}:`, error.message);
        result.skipped++;
      } else {
        result.synced++;
      }
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : String(err);
    console.error("[Sync] performance_data table error:", result.error);
  }

  return result;
}

// ─── Sync final reports ───────────────────────────────────────────────────────

async function syncFinalReports(workflowIdMap: Map<string, string>): Promise<SyncTableResult> {
  const result: SyncTableResult = { table: "final_reports", synced: 0, skipped: 0, error: null };

  try {
    const records = await getFinalReports();
    if (records.length === 0) return result;

    const db = getSupabaseAdmin();

    for (const r of records) {
      const airtableWfId = r.workflowRecordIds?.[0];
      const supabaseWfId = airtableWfId ? workflowIdMap.get(airtableWfId) : undefined;

      if (!supabaseWfId) {
        result.skipped++;
        continue;
      }

      const row = {
        report_display_id:   r.reportId || null,
        workflow_id:         supabaseWfId,
        executive_summary:   r.executiveSummary || null,
        key_insights:        r.keyInsights || null,
        risks_or_anomalies:  r.risksOrAnomalies || null,
        recommendation:      r.recommendation || null,
        approved:            r.approved ?? false,
        report_timestamp:    toIso(r.reportTimestamp),
        airtable_record_id:  r.recordId,
      };

      const { error } = await db
        .from("final_reports")
        .upsert(row, { onConflict: "airtable_record_id", ignoreDuplicates: false });

      if (error) {
        console.warn(`[Sync] final_reports upsert failed for ${r.recordId}:`, error.message);
        result.skipped++;
      } else {
        result.synced++;
      }
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : String(err);
    console.error("[Sync] final_reports table error:", result.error);
  }

  return result;
}

// ─── Update log_count on workflows ───────────────────────────────────────────

async function updateLogCounts(workflowIds: string[]): Promise<void> {
  if (workflowIds.length === 0) return;
  const db = getSupabaseAdmin();

  for (const id of workflowIds) {
    try {
      const { count } = await db
        .from("execution_logs")
        .select("*", { count: "exact", head: true })
        .eq("workflow_id", id);

      if (count != null) {
        await db
          .from("workflows")
          .update({ log_count: count })
          .eq("id", id);
      }
    } catch {
      // Non-fatal — log counts are derived, not critical
    }
  }
}

// ─── Main sync entry point ────────────────────────────────────────────────────

/**
 * Runs a full Airtable → Supabase sync.
 *
 * Returns a SyncResult with per-table statistics.
 * Never throws — all errors are captured in the result.
 *
 * @param logToDb - If true, writes a row to sync_log in Supabase (default true)
 */
export async function runAirtableSync(logToDb = true): Promise<SyncResult> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  // Guard: Airtable must be configured
  if (!ENV.airtableApiKey) {
    const msg = "AIRTABLE_API_KEY is not set — skipping Airtable sync.";
    console.warn("[Sync]", msg);
    return {
      ok: false,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      tables: [],
      totalSynced: 0,
      error: msg,
    };
  }

  // Guard: Supabase admin must be configured
  if (!isSupabaseAdminAvailable()) {
    const msg = "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set — skipping sync.";
    console.warn("[Sync]", msg);
    return {
      ok: false,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      tables: [],
      totalSynced: 0,
      error: msg,
    };
  }

  console.log("[Sync] Starting Airtable → Supabase sync…");

  let syncLogId: string | null = null;

  // Create a running sync_log entry
  if (logToDb) {
    try {
      const db = getSupabaseAdmin();
      const { data } = await db
        .from("sync_log")
        .insert({ source: "airtable", status: "running" })
        .select("id")
        .single();
      syncLogId = data?.id ?? null;
    } catch {
      // Non-fatal — continue without sync log
    }
  }

  // ── Sync in dependency order ──────────────────────────────────────────────
  const tables: SyncTableResult[] = [];

  // 1. Workflows first — needed to build the FK map
  const { result: wfResult, idMap } = await syncWorkflows();
  tables.push(wfResult);

  // 2. Child tables — all depend on the workflow FK map
  const [execResult, aiResult, perfResult, rptResult] = await Promise.all([
    syncExecutionLogs(idMap),
    syncAILogs(idMap),
    syncPerformanceData(idMap),
    syncFinalReports(idMap),
  ]);
  tables.push(execResult, aiResult, perfResult, rptResult);

  // 3. Update derived log_count on workflows
  if (idMap.size > 0) {
    await updateLogCounts([...idMap.values()]);
  }

  const completedAt = new Date().toISOString();
  const durationMs = Date.now() - startMs;
  const totalSynced = tables.reduce((n, t) => n + t.synced, 0);
  const hasErrors = tables.some((t) => t.error !== null);

  const syncResult: SyncResult = {
    ok: !hasErrors,
    startedAt,
    completedAt,
    durationMs,
    tables,
    totalSynced,
    error: hasErrors
      ? tables
          .filter((t) => t.error)
          .map((t) => `${t.table}: ${t.error}`)
          .join("; ")
      : null,
  };

  // Update sync_log
  if (logToDb && syncLogId) {
    try {
      const db = getSupabaseAdmin();
      await db
        .from("sync_log")
        .update({
          completed_at:     completedAt,
          status:           hasErrors ? "partial" : "success",
          workflows_synced: wfResult.synced,
          exec_logs_synced: execResult.synced,
          ai_logs_synced:   aiResult.synced,
          perf_data_synced: perfResult.synced,
          reports_synced:   rptResult.synced,
          error:            syncResult.error,
          details:          { tables: tables as unknown },
        })
        .eq("id", syncLogId);
    } catch {
      // Non-fatal
    }
  }

  console.log(
    `[Sync] Completed in ${durationMs}ms — ${totalSynced} records synced across ${tables.length} tables.`,
    hasErrors ? `Partial errors: ${syncResult.error}` : "No errors."
  );

  return syncResult;
}

/**
 * Returns the most recent sync_log entry, or null if none exists.
 * Used by the dashboard to display "Last synced X minutes ago".
 */
export async function getLastSyncStatus(): Promise<{
  status: string;
  completedAt: string | null;
  totalSynced: number;
} | null> {
  if (!isSupabaseAdminAvailable()) return null;

  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("sync_log")
      .select("status, completed_at, workflows_synced, exec_logs_synced, ai_logs_synced, perf_data_synced, reports_synced")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    const total =
      (data.workflows_synced ?? 0) +
      (data.exec_logs_synced ?? 0) +
      (data.ai_logs_synced ?? 0) +
      (data.perf_data_synced ?? 0) +
      (data.reports_synced ?? 0);

    return {
      status: data.status,
      completedAt: data.completed_at ?? null,
      totalSynced: total,
    };
  } catch {
    return null;
  }
}
