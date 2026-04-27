/**
 * NexusOps — useExecutionLogs
 *
 * Fetches execution log records for a given workflow ID, or all logs
 * when no workflowId is provided. Sorted by timestamp ASC so the
 * full execution trace reads chronologically.
 *
 * @param workflowId - Optional UUID of the parent workflow
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data: logs } = useExecutionLogs(workflow.id);
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type LogRow = Database["public"]["Tables"]["execution_logs"]["Row"];

export interface UseExecutionLogsReturn {
  data: LogRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExecutionLogs(workflowId?: string): UseExecutionLogsReturn {
  const [data, setData] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("execution_logs").select("*").order("timestamp", { ascending: true });
      if (workflowId) query = query.eq("workflow_id", workflowId);
      const { data: rows, error: err } = await query.limit(500);
      if (err) throw err;
      setData(rows ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load execution logs");
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
