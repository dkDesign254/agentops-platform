/**
 * NexusOps — WorkflowsPage
 * Route: /workflows (protected)
 */
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { RecentWorkflows } from "@/components/dashboard/recent-workflows";
import { useWorkflows } from "@/hooks/use-workflows";
import { useT } from "@/contexts/LocaleContext";
import type { WorkflowRow } from "@/components/dashboard/recent-workflows";

export default function WorkflowsPage(): JSX.Element {
  const { data, loading } = useWorkflows();
  const [search, setSearch] = useState("");
  const T = useT();
  const q = search.toLowerCase();
  const filtered = data.filter((wf) =>
    (wf.workflow_name ?? "").toLowerCase().includes(q) ||
    (wf.workflow_id ?? "").toLowerCase().includes(q)
  );
  const rows: WorkflowRow[] = filtered.map((wf) => ({
    id: wf.id,
    workflowId: wf.workflow_id ?? wf.id,
    workflowName: wf.workflow_name ?? "—",
    runtime: wf.runtime_used,
    status: wf.status ?? "Pending",
    reportPeriod: wf.report_period,
    durationMins: wf.duration_mins,
  }));
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <div className="hidden md:flex"><Sidebar /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar title="Workflows" />
        <main style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={T("search.workflows")}
              style={{ padding: "0.6rem var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", fontFamily: "var(--font-display)", fontSize: "0.875rem", maxWidth: 360 }} />
            <RecentWorkflows workflows={rows} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}
