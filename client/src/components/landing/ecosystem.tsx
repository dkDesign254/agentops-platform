/**
 * NexusOps — Ecosystem section
 *
 * 2x2 grid of ecosystem product tiles. Each tile has a distinct
 * accent colour. Compliance Export is marked "Coming soon".
 */

interface EcoTileProps {
  title: string;
  description: string;
  accent: string;
  badge?: string;
}

function EcoTile({ title, description, accent, badge }: EcoTileProps): JSX.Element {
  return (
    <div style={{ background: "var(--color-bg-elevated)", border: `1px solid ${accent}25`, borderRadius: "var(--radius-lg)", padding: "var(--space-6)", position: "relative", overflow: "hidden" }}>
      {/* Accent glow top-left */}
      <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: `${accent}10`, filter: "blur(20px)", pointerEvents: "none" }} />
      {badge && (
        <span style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)", fontSize: "0.625rem", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)", background: `${accent}15`, border: `1px solid ${accent}30`, color: accent, fontFamily: "var(--font-body)" }}>
          {badge}
        </span>
      )}
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, marginBottom: "var(--space-4)", boxShadow: `0 0 12px ${accent}60` }} />
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        {description}
      </p>
    </div>
  );
}

const TILES: EcoTileProps[] = [
  {
    title: "NexusOps Core",
    description: "The governance dashboard. Monitor, audit, and approve AI-driven workflows in real-time.",
    accent: "var(--color-brand)",
  },
  {
    title: "NexusOps Connectors",
    description: "Pre-built modules for Make and n8n that write governance events automatically. Drop in, no code required.",
    accent: "#3b82f6",
  },
  {
    title: "NexusOps API",
    description: "Programmatic access to your governance data. Build your own integrations, reports, and alerts on top of the audit layer.",
    accent: "#a78bfa",
  },
  {
    title: "NexusOps Compliance Export",
    description: "One-click export of audit trails in formats required by ISO 27001, SOC 2, and GDPR compliance reviews.",
    accent: "#f59e0b",
    badge: "Coming soon",
  },
];

export function Ecosystem(): JSX.Element {
  return (
    <section id="ecosystem" style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-20) var(--space-6)" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-brand)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-body)", marginBottom: "var(--space-3)" }}>
          Ecosystem
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: "var(--space-3)" }}>
          The NexusOps ecosystem
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", maxWidth: 480, margin: "0 auto" }}>
          A complete governance stack — not just a dashboard.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-5)" }}>
        {TILES.map((tile) => (
          <EcoTile key={tile.title} {...tile} />
        ))}
      </div>

      <p style={{ textAlign: "center", marginTop: "var(--space-8)", fontSize: "0.8125rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)" }}>
        Built on open standards. Works alongside any AI stack.
      </p>
    </section>
  );
}
