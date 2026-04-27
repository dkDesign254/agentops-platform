/**
 * NexusOps — StatsStrip
 *
 * Dark background band with three large headline statistics
 * reinforcing the governance value proposition.
 */

const STATS = [
  { value: "100%", label: "Execution steps logged" },
  { value: "Zero", label: "Silent failures that go undetected" },
  { value: "7", label: "Standard governance event types per workflow" },
];

export function StatsStrip(): JSX.Element {
  return (
    <section style={{ background: "var(--color-bg-elevated)", borderTop: "1px solid var(--color-border-subtle)", borderBottom: "1px solid var(--color-border-subtle)", padding: "var(--space-16) var(--space-6)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-8)", textAlign: "center" }}>
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800, color: "var(--color-brand)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "var(--space-2)" }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", maxWidth: 180, margin: "0 auto" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
