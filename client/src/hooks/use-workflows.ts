/**
 * NexusOps — useWorkflows
 *
 * Fetches all governance workflow records from Supabase in real-time.
 * Subscribes to INSERT and UPDATE events via Supabase Realtime.
 * Returns results sorted by date_requested DESC.
 *
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data: workflows, loading } = useWorkflows();
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type WorkflowRow = Database["public"]["Tables"]["workflows"]["Row"];

export interface UseWorkflowsReturn {
  data: WorkflowRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWorkflows(): UseWorkflowsReturn {
  const [data, setData] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data: rows, error: err } = await supabase
        .from("workflows")
        .select("*")
        .order("date_requested", { ascending: false })
        .limit(100);
      if (err) throw err;
      setData(rows ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();

    // Real-time subscription for INSERT and UPDATE
    const channel = supabase
      .channel("workflows-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "workflows" }, () => fetch())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "workflows" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
