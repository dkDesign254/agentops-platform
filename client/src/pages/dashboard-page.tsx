/**
 * NexusOps — DashboardPage
 *
 * Governance command centre. The first page a signed-in user sees.
 * Assembles the sidebar, topbar, and all dashboard widgets into a
 * coherent governance overview.
 *
 * Route: /dashboard (protected — requires auth session)
 */
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { MetricsRow } from "@/components/dashboard/metrics-row";
import { GovernanceHealth } from "@/components/dashboard/governance-health";
import { RecentWorkflows } from "@/components/dashboard/recent-workflows";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { useWorkflows } from "@/hooks/use-workflows";
import type { WorkflowRow } from "@/components/dashboard/recent-workflows";
import type { ExecutionDot } from "@/components/dashboard/governance-health";

export default function DashboardPage(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { metrics, quickStats, loading: metricsLoading } = useDashboardMetrics();
  const { data: workflows, loading: wfLoading } = useWorkflows();

  // Map last 10 workflows to execution dots for the governance health timeline
  const recentDots: ExecutionDot[] = workflows.slice(0, 10).map((wf) => ({
    workflowId: wf.workflow_id,
    status: (wf.status?.toLowerCase() ?? "pending") as ExecutionDot["status"],
    timestamp: wf.date_requested ?? wf.created_at ?? "",
  }));

  // Most recent workflow for runtime badge
  const lastWf = workflows[0];

  // Map workflows to table rows
  const tableRows: WorkflowRow[] = workflows.slice(0, 10).map((wf) => ({
    id: wf.id,
    workflowId: wf.workflow_id,
    workflowName: wf.workflow_name,
    runtime: wf.runtime_used,
    status: wf.status ?? "Pending",
    reportPeriod: wf.report_period,
    durationMins: wf.duration_mins,
  }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      {/* Sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Dashboard" failedCount={metrics.failed} />

        <main style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

            {/* Welcome */}
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
                Governance command centre
              </h1>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Real-time overview of every AI workflow running under NexusOps governance.
              </p>
            </div>

            {/* Metrics row */}
            {!metricsLoading && (
              <MetricsRow
                total={metrics.total}
                completed={metrics.completed}
                failed={metrics.failed}
                pending={metrics.pending}
              />
            )}
            {metricsLoading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)" }} />
                ))}
              </div>
            )}

            {/* Governance health */}
            <GovernanceHealth
              coveragePercent={metrics.coveragePercent}
              recentExecutions={recentDots}
              lastExecutedAt={lastWf?.date_requested ? new Date(lastWf.date_requested).toLocaleString() : undefined}
              lastRuntime={lastWf?.runtime_used ?? undefined}
            />

            {/* Recent workflows table */}
            <RecentWorkflows workflows={tableRows} loading={wfLoading} />

            {/* Quick stats */}
            <QuickStats
              aiCallsThisWeek={quickStats.aiCallsThisWeek}
              reportsPendingApproval={quickStats.reportsPendingApproval}
              avgDurationMins={quickStats.avgDurationMins}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
