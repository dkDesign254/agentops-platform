/**
 * NexusOps — useAILogs
 *
 * Fetches AI interaction log records. Optionally filtered by workflow ID.
 * Returns prompts and responses sorted by timestamp DESC (most recent first).
 *
 * @param workflowId - Optional UUID of the parent workflow
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data: aiLogs } = useAILogs();
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type AILogRow = Database["public"]["Tables"]["ai_interaction_logs"]["Row"];

export interface UseAILogsReturn {
  data: AILogRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAILogs(workflowId?: string): UseAILogsReturn {
  const [data, setData] = useState<AILogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("ai_interaction_logs").select("*").order("timestamp", { ascending: false });
      if (workflowId) query = query.eq("workflow_id", workflowId);
      const { data: rows, error: err } = await query.limit(200);
      if (err) throw err;
      setData(rows ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load AI logs");
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
