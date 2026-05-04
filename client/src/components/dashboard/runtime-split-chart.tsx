/**
 * NexusOps — RuntimeSplitChart
 *
 * Donut chart showing Make vs n8n execution split over the last 30 days.
 * Uses Recharts PieChart with innerRadius to create the donut shape.
 *
 * @param workflows - Array of workflow rows
 */
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WorkflowEntry {
  runtime_used: string | null;
  date_requested: string | null;
}

export interface RuntimeSplitChartProps {
  workflows: WorkflowEntry[];
}

const COLORS: Record<string, string> = {
  make: "#ff6b35",
  n8n: "#ea4e9d",
  other: "#4d5265",
};

const RUNTIME_LABELS: Record<string, string> = {
  make: "Make",
  n8n: "n8n",
  other: "Other",
};

const tooltipStyle: React.CSSProperties = {
  background: "#161a23",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "8px 12px",
  fontFamily: "Syne, sans-serif",
  fontSize: "0.75rem",
  color: "#e6e8f0",
};

/**
 * Renders a donut chart of runtime distribution over the last 30 days.
 */
export function RuntimeSplitChart({ workflows }: RuntimeSplitChartProps): JSX.Element {
  // Filter to last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const counts: Record<string, number> = { make: 0, n8n: 0, other: 0 };
  for (const wf of workflows) {
    if (wf.date_requested && new Date(wf.date_requested) < cutoff) continue;
    const rt = (wf.runtime_used ?? "").toLowerCase();
    if (rt === "make") counts.make++;
    else if (rt === "n8n") counts.n8n++;
    else counts.other++;
  }

  const total = counts.make + counts.n8n + counts.other;
  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: RUNTIME_LABELS[key] ?? key, value, key }));

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <p style={{ margin: "0 0 2px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>
        Runtime Split
      </p>
      <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
        Last 30 days
      </p>

      {total === 0 ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)", fontSize: "0.8125rem" }}>
          No workflow data yet
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={2}
                  stroke="#161a23"
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key] ?? "#4d5265"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre label */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-text-primary)" }}>
                {total}
              </p>
              <p style={{ margin: 0, fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                total
              </p>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", marginTop: "0.5rem" }}>
            {data.map((entry) => (
              <div key={entry.key} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[entry.key] ?? "#4d5265", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-display)" }}>
                  {entry.name} ({Math.round((entry.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
