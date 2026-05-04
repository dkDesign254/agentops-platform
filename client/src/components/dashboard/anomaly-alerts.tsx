/**
 * NexusOps — AnomalyAlerts
 *
 * Detects and surfaces governance anomalies:
 * - Workflows stuck in "Running" for > 30 minutes (stalled)
 * - Completed workflows with log_count = 0 (missing trace)
 *
 * Each alert shows severity, description, and a navigate action.
 * Shows a "All clear" state when no anomalies are detected.
 */
import { AlertTriangle, CheckCircle, Clock, FileSearch } from "lucide-react";

interface WorkflowEntry {
  id: string;
  workflow_name: string | null;
  workflow_id: string | null;
  status: string | null;
  date_requested: string | null;
  log_count: number | null;
}

export interface AnomalyAlertsProps {
  workflows: WorkflowEntry[];
  onNavigate: (path: string) => void;
}

type Severity = "Critical" | "Warning" | "Info";

interface Anomaly {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  action: string;
  path: string;
  icon: JSX.Element;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: "#ff5f5f",
  Warning: "#ffb347",
  Info: "#3dffa0",
};

const THIRTY_MIN_MS = 30 * 60 * 1000;

function detectAnomalies(workflows: WorkflowEntry[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const now = Date.now();

  for (const wf of workflows) {
    const name = wf.workflow_name ?? wf.workflow_id ?? wf.id;
    const s = (wf.status ?? "").toLowerCase();

    // Stalled running workflows
    if (s === "running" && wf.date_requested) {
      const elapsed = now - new Date(wf.date_requested).getTime();
      if (elapsed > THIRTY_MIN_MS) {
        const mins = Math.round(elapsed / 60000);
        anomalies.push({
          id: `stalled-${wf.id}`,
          severity: "Critical",
          title: "Workflow stalled",
          description: `"${name}" has been running for ${mins} minutes without completing.`,
          action: "Investigate",
          path: "/workflows",
          icon: <Clock size={15} />,
        });
      }
    }

    // Missing trace
    if (s === "completed" && (wf.log_count ?? 0) === 0) {
      anomalies.push({
        id: `notrace-${wf.id}`,
        severity: "Warning",
        title: "Missing execution trace",
        description: `"${name}" completed with no execution logs. Audit trail is incomplete.`,
        action: "View logs",
        path: "/audit",
        icon: <FileSearch size={15} />,
      });
    }
  }

  return anomalies;
}

/**
 * Displays detected governance anomalies or a green "All clear" state.
 */
export function AnomalyAlerts({ workflows, onNavigate }: AnomalyAlertsProps): JSX.Element {
  const anomalies = detectAnomalies(workflows);

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>
          Anomaly Detection
        </p>
        {anomalies.length > 0 && (
          <span
            style={{
              background: "rgba(255,95,95,0.12)",
              color: "#ff5f5f",
              border: "1px solid rgba(255,95,95,0.25)",
              borderRadius: "99px",
              padding: "0.2rem 0.6rem",
              fontSize: "0.6875rem",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
            }}
          >
            {anomalies.length} alert{anomalies.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {anomalies.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.75rem",
            background: "rgba(61,255,160,0.06)",
            border: "1px solid rgba(61,255,160,0.15)",
            borderRadius: 8,
          }}
        >
          <CheckCircle size={18} style={{ color: "#3dffa0", flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.8125rem", color: "#3dffa0" }}>
              All clear
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
              No governance anomalies detected.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {anomalies.map((a) => {
            const color = SEVERITY_COLORS[a.severity];
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  background: `${color}0d`,
                  border: `1px solid ${color}30`,
                  borderRadius: 8,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <span style={{ color, flexShrink: 0, marginTop: 1 }}>
                  {a.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        fontFamily: "var(--font-display)",
                        color,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {a.severity}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
                      {a.title}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                    {a.description}
                  </p>
                  <button
                    onClick={() => onNavigate(a.path)}
                    style={{
                      background: "none",
                      border: `1px solid ${color}50`,
                      borderRadius: "var(--radius-sm)",
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.6875rem",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      color,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${color}15`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                  >
                    {a.action} →
                  </button>
                </div>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <AlertTriangle size={13} style={{ color: `${color}80`, flexShrink: 0 }} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
