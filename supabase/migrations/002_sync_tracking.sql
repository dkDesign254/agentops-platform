-- =============================================================
-- NexusOps — Migration 002: Airtable Sync Tracking
-- Adds airtable_record_id to every synced table for idempotent
-- upserts, and a sync_log table to track sync runs.
-- =============================================================

-- Add airtable_record_id to each synced table (UNIQUE for ON CONFLICT upserts)
ALTER TABLE public.workflows
  ADD COLUMN IF NOT EXISTS airtable_record_id TEXT UNIQUE;

ALTER TABLE public.execution_logs
  ADD COLUMN IF NOT EXISTS airtable_record_id TEXT UNIQUE;

ALTER TABLE public.ai_interaction_logs
  ADD COLUMN IF NOT EXISTS airtable_record_id TEXT UNIQUE;

ALTER TABLE public.performance_data
  ADD COLUMN IF NOT EXISTS airtable_record_id TEXT UNIQUE;

ALTER TABLE public.final_reports
  ADD COLUMN IF NOT EXISTS airtable_record_id TEXT UNIQUE;

-- Sync log: one row per sync run
CREATE TABLE IF NOT EXISTS public.sync_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source          TEXT NOT NULL DEFAULT 'airtable',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'running', -- running | success | partial | failed
  workflows_synced      INTEGER DEFAULT 0,
  exec_logs_synced      INTEGER DEFAULT 0,
  ai_logs_synced        INTEGER DEFAULT 0,
  perf_data_synced      INTEGER DEFAULT 0,
  reports_synced        INTEGER DEFAULT 0,
  error           TEXT,
  details         JSONB
);

ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read sync logs; only service role can write (via server)
CREATE POLICY "sync_log_read" ON public.sync_log
  FOR SELECT USING (auth.role() = 'authenticated');
