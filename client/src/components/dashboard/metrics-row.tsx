/**
 * NexusOps — MetricsRow
 *
 * Four summary stat cards shown at the top of the dashboard.
 * Each card animates its number counting up on mount.
 * Colour-coded by status: Completed=green, Failed=red, Pending=muted, Total=accent.
 */
import { useEffect, useRef } from "react";

export interface MetricsRowProps {
  total: number;
  completed: number;
  failed: number;
  pending: number;
}

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
  bg: string;
}

function StatCard({ label, value, accent, bg }: StatCardProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const duration = 800;
    const start = performance.now();
    const update = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(eased * value));
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [value]);

  return (
    <div style={{ background: bg, border: `1px solid ${accent}25`, borderRadius: "var(--radius-lg)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: accent, letterSpacing: "-0.03em", lineHeight: 1 }}>
        <span ref={ref}>0</span>
      </p>
    </div>
  );
}

export function MetricsRow({ total, completed, failed, pending }: MetricsRowProps): JSX.Element {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total workflows" value={total} accent="var(--color-text-primary)" bg="var(--color-bg-elevated)" />
      <StatCard label="Completed" value={completed} accent="var(--color-status-completed)" bg="rgba(61,255,160,0.05)" />
      <StatCard label="Failed" value={failed} accent="var(--color-status-failed)" bg="rgba(255,95,95,0.05)" />
      <StatCard label="Pending" value={pending} accent="var(--color-text-secondary)" bg="var(--color-bg-surface)" />
    </div>
  );
}
