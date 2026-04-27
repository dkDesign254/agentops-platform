/**
 * NexusOps — useDashboardMetrics
 *
 * Derives aggregate metric counts from the workflows table:
 * total, completed, failed, pending, running, and governance coverage %.
 * Also returns quick stats: AI calls this week, reports pending, avg duration.
 *
 * @returns {{ metrics, quickStats, loading, error }}
 *
 * @example
 * const { metrics } = useDashboardMetrics();
 * // metrics.total, metrics.completed, metrics.coveragePercent
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface DashboardMetrics {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  running: number;
  coveragePercent: number;
}

export interface QuickStatsData {
  aiCallsThisWeek: number;
  reportsPendingApproval: number;
  avgDurationMins: number | null;
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics;
  quickStats: QuickStatsData;
  loading: boolean;
  error: string | null;
}

const DEFAULT_METRICS: DashboardMetrics = { total: 0, completed: 0, failed: 0, pending: 0, running: 0, coveragePercent: 0 };
const DEFAULT_QUICK: QuickStatsData = { aiCallsThisWeek: 0, reportsPendingApproval: 0, avgDurationMins: null };

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS);
  const [quickStats, setQuickStats] = useState<QuickStatsData>(DEFAULT_QUICK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [wfRes, aiRes, rptRes] = await Promise.all([
        supabase.from("workflows").select("status, duration_mins, log_count"),
        supabase.from("ai_interaction_logs").select("created_at").gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
        supabase.from("final_reports").select("approved").eq("approved", false),
      ]);

      if (wfRes.error) throw wfRes.error;
      const wfs = wfRes.data ?? [];
      const total = wfs.length;
      const completed = wfs.filter((w) => w.status === "Completed").length;
      const failed = wfs.filter((w) => w.status === "Failed").length;
      const pending = wfs.filter((w) => w.status === "Pending").length;
      const running = wfs.filter((w) => w.status === "Running").length;

      // Coverage = workflows with log_count >= 7 (full 7-event trace)
      const covered = wfs.filter((w) => (w.log_count ?? 0) >= 7).length;
      const coveragePercent = total > 0 ? (covered / total) * 100 : 0;

      const durations = wfs.map((w) => w.duration_mins).filter((d): d is number => d != null);
      const avgDurationMins = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

      setMetrics({ total, completed, failed, pending, running, coveragePercent });
      setQuickStats({
        aiCallsThisWeek: (aiRes.data ?? []).length,
        reportsPendingApproval: (rptRes.data ?? []).length,
        avgDurationMins,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { metrics, quickStats, loading, error };
}
