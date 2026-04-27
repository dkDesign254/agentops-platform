/**
 * NexusOps — usePerformanceData
 *
 * Fetches campaign performance records from Supabase.
 * Optionally filtered by reporting period string.
 *
 * @param period - Optional reporting period to filter by (e.g. "Q2 2026")
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data: campaigns } = usePerformanceData("Q2 2026");
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type PerfRow = Database["public"]["Tables"]["performance_data"]["Row"];

export interface UsePerformanceDataReturn {
  data: PerfRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePerformanceData(period?: string): UsePerformanceDataReturn {
  const [data, setData] = useState<PerfRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("performance_data").select("*").order("created_at", { ascending: false });
      if (period) query = query.eq("reporting_period", period);
      const { data: rows, error: err } = await query.limit(200);
      if (err) throw err;
      setData(rows ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
