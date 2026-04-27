/**
 * NexusOps — HeroDiagram
 *
 * Animated SVG / CSS diagram illustrating the governance architecture:
 *   Runtime (Make / n8n / agent) → NexusOps Governance Layer → Audit Store
 *
 * Pure CSS animations — no canvas, no JS animation library.
 */
import type { CSSProperties } from "react";

const NODE: CSSProperties = {
  borderRadius: "var(--radius-md)",
  padding: "0.55rem 0.9rem",
  fontSize: "0.75rem",
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  whiteSpace: "nowrap",
};

function Node({ label, accent, delay = 0, icon }: { label: string; accent: string; delay?: number; icon: string }): JSX.Element {
  return (
    <div style={{ ...NODE, background: `${accent}14`, border: `1px solid ${accent}40`, color: accent, animation: `fadeInUp 0.5s ease ${delay}s both` }}>
      <span>{icon}</span>{label}
    </div>
  );
}

export function HeroDiagram(): JSX.Element {
  const events = ["intake", "routing", "ai_call", "report", "completion"];
  return (
    <div style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
      <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "var(--space-5)", fontFamily: "var(--font-body)" }}>
        Governance architecture
      </p>

      {/* Runtimes row */}
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
        <Node label="Make.com" accent="var(--color-runtime-make)" delay={0.1} icon="⚙️" />
        <Node label="n8n" accent="var(--color-runtime-n8n)" delay={0.2} icon="🔀" />
        <Node label="Custom agent" accent="#a78bfa" delay={0.3} icon="🤖" />
      </div>

      <div style={{ textAlign: "center", animation: "fadeInUp 0.4s ease 0.45s both", color: "var(--color-brand)", fontSize: "1.4rem", margin: "var(--space-2) 0" }}>↓</div>

      {/* Governance layer */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ ...NODE, background: "rgba(14,164,114,0.1)", border: "1px solid var(--color-brand)", color: "var(--color-brand)", padding: "0.7rem 1.4rem", fontSize: "0.8125rem", fontWeight: 700, animation: "fadeInUp 0.5s ease 0.6s both", boxShadow: "var(--shadow-brand)" }}>
          ⬡ NexusOps Governance Layer
        </div>
      </div>

      {/* Event type badges */}
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", flexWrap: "wrap", margin: "var(--space-3) 0", animation: "fadeInUp 0.5s ease 0.8s both" }}>
        {events.map((evt, i) => (
          <span key={evt} style={{ fontSize: "0.6rem", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)", background: "rgba(14,164,114,0.08)", border: "1px solid rgba(14,164,114,0.2)", color: "var(--color-brand)", fontFamily: "var(--font-body)", animation: `pulse-dot 2.5s ease ${i * 0.35}s infinite` }}>
            {evt}
          </span>
        ))}
      </div>

      <div style={{ textAlign: "center", animation: "fadeInUp 0.4s ease 0.9s both", color: "var(--color-brand)", fontSize: "1.4rem", margin: "var(--space-2) 0" }}>↓</div>

      {/* Audit stores */}
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
        <Node label="Supabase audit store" accent="#3b82f6" delay={1.0} icon="🗄️" />
        <Node label="Airtable" accent="#f59e0b" delay={1.1} icon="📊" />
      </div>

      <p style={{ textAlign: "center", fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: "var(--space-4)", fontFamily: "var(--font-body)", animation: "fadeInUp 0.5s ease 1.3s both" }}>
        Every step logged · Every prompt traced · Every failure caught
      </p>
    </div>
  );
}
