/**
 * NexusOps — GovernanceHealth
 *
 * Displays:
 * - A horizontal progress bar showing % of workflows with complete
 *   7-event governance traces vs partial/missing.
 * - A mini timeline of the last 10 executions as coloured dots.
 * - Last execution timestamp and runtime badge.
 *
 * Clicking a dot navigates to that workflow's audit trace.
 */
import { useLocation } from "wouter";

export interface ExecutionDot {
  workflowId: string;
  status: "completed" | "failed" | "running" | "pending";
  timestamp: string;
}

export interface GovernanceHealthProps {
  coveragePercent: number;
  recentExecutions: ExecutionDot[];
  lastExecutedAt?: string;
  lastRuntime?: string;
}

const DOT_COLORS: Record<string, string> = {
  completed: "var(--color-status-completed)",
  failed: "var(--color-status-failed)",
  running: "var(--color-status-running)",
  pending: "var(--color-status-pending)",
};

export function GovernanceHealth({ coveragePercent, recentExecutions, lastExecutedAt, lastRuntime }: GovernanceHealthProps): JSX.Element {
  const [, setLocation] = useLocation();
  const clampedPct = Math.min(100, Math.max(0, coveragePercent));

  return (
    <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9375rem" }}>
          Governance coverage
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {lastRuntime && (
            <span style={{ fontSize: "0.6875rem", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)", background: lastRuntime === "Make" ? "rgba(255,107,53,0.12)" : "rgba(234,78,157,0.12)", color: lastRuntime === "Make" ? "var(--color-runtime-make)" : "var(--color-runtime-n8n)", fontFamily: "var(--font-body)", border: `1px solid ${lastRuntime === "Make" ? "rgba(255,107,53,0.25)" : "rgba(234,78,157,0.25)"}` }}>
              {lastRuntime}
            </span>
          )}
          {lastExecutedAt && (
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)" }}>
              Last: {lastExecutedAt}
            </span>
          )}
        </div>
      </div>

      {/* Health bar */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
            {clampedPct.toFixed(0)}% complete traces
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)" }}>
            {(100 - clampedPct).toFixed(0)}% partial / missing
          </span>
        </div>
        <div style={{ height: 8, borderRadius: "var(--radius-full)", background: "var(--color-bg-elevated)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "var(--radius-full)", width: `${clampedPct}%`, background: clampedPct > 80 ? "var(--color-status-completed)" : clampedPct > 50 ? "var(--color-status-running)" : "var(--color-status-failed)", transition: "width 1s var(--transition-slow)" }} />
        </div>
      </div>

      {/* Mini timeline */}
      {recentExecutions.length > 0 && (
        <div>
          <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)", marginBottom: "var(--space-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Last {recentExecutions.length} executions
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {recentExecutions.map((dot) => (
              <button key={dot.workflowId} onClick={() => setLocation(`/audit?workflow=${dot.workflowId}`)}
                title={`${dot.workflowId} · ${dot.status} · ${dot.timestamp}`}
                style={{ width: 12, height: 12, borderRadius: "50%", background: DOT_COLORS[dot.status] ?? "var(--color-status-pending)", border: "none", cursor: "pointer", padding: 0, transition: "transform var(--transition-fast)" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
