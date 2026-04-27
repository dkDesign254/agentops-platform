/**
 * NexusOps — QuickStats
 *
 * Three summary tiles below the workflows table:
 * - AI calls this week
 * - Reports pending approval
 * - Average execution duration
 */

export interface QuickStatsProps {
  aiCallsThisWeek: number;
  reportsPendingApproval: number;
  avgDurationMins: number | null;
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: string }): JSX.Element {
  return (
    <div style={{ background: "var(--color-bg-surface)", border: `1px solid ${accent}20`, borderRadius: "var(--radius-lg)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: accent, letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

export function QuickStats({ aiCallsThisWeek, reportsPendingApproval, avgDurationMins }: QuickStatsProps): JSX.Element {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatTile label="AI calls this week" value={String(aiCallsThisWeek)} accent="#a78bfa" />
      <StatTile label="Reports pending approval" value={String(reportsPendingApproval)} accent="var(--color-status-running)" />
      <StatTile label="Avg execution duration" value={avgDurationMins != null ? `${avgDurationMins.toFixed(1)}m` : "—"} accent="var(--color-brand)" />
    </div>
  );
}
