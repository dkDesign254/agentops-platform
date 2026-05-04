/**
 * NexusOps — ExecutionTimelineChart
 *
 * Line chart showing workflow executions over the last 14 days.
 * Two lines: Completed (brand green) and Failed (red).
 * Uses Recharts ResponsiveContainer + LineChart.
 *
 * @param workflows - Array of workflow rows from useWorkflows()
 */
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface WorkflowEntry {
  date_requested: string | null;
  status: string | null;
}

export interface ExecutionTimelineChartProps {
  workflows: WorkflowEntry[];
}

/** Returns "MMM DD" label for a Date. */
function formatDay(date: Date): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`;
}

/** Builds last-N-days data array from workflow records. */
function buildTimelineData(workflows: WorkflowEntry[], days = 14) {
  const buckets: Record<string, { label: string; completed: number; failed: number }> = {};

  // Initialise all days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { label: formatDay(d), completed: 0, failed: 0 };
  }

  // Bucket workflows
  for (const wf of workflows) {
    if (!wf.date_requested) continue;
    const key = wf.date_requested.slice(0, 10);
    if (!buckets[key]) continue;
    const s = (wf.status ?? "").toLowerCase();
    if (s === "completed") buckets[key].completed++;
    else if (s === "failed") buckets[key].failed++;
  }

  return Object.values(buckets);
}

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
 * Renders a line chart of completed vs failed workflows over the last 14 days.
 */
export function ExecutionTimelineChart({ workflows }: ExecutionTimelineChartProps): JSX.Element {
  const data = buildTimelineData(workflows);
  const maxVal = Math.max(...data.map((d) => d.completed + d.failed));

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
        Execution Timeline
      </p>
      <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
        Last 14 days — completed vs failed
      </p>

      {maxVal === 0 ? (
        <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)", fontSize: "0.8125rem" }}>
          No workflow data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#4d5265", fontSize: 10, fontFamily: "Syne, sans-serif" }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 5)}
            />
            <YAxis
              tick={{ fill: "#4d5265", fontSize: 10, fontFamily: "Syne, sans-serif" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "#8a8fa0", marginBottom: 4 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "0.75rem", fontFamily: "Syne, sans-serif", paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#3dffa0"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3dffa0" }}
            />
            <Line
              type="monotone"
              dataKey="failed"
              name="Failed"
              stroke="#ff5f5f"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#ff5f5f" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
