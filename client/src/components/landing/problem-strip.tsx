/**
 * NexusOps — ProblemStrip
 *
 * Dark full-width band listing three punchy pain points, with a
 * resolution statement on the right. Establishes urgency before
 * the features grid.
 */
import { XCircle, CheckCircle2 } from "lucide-react";

const PROBLEMS = [
  "AI agents make decisions with no audit trail",
  "Workflows fail silently — no one knows until it's too late",
  "Prompt history is lost the moment the session ends",
];

export function ProblemStrip(): JSX.Element {
  return (
    <section style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border-subtle)", borderBottom: "1px solid var(--color-border-subtle)", padding: "var(--space-12) var(--space-6)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: "var(--space-8)", alignItems: "center" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Problems */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {PROBLEMS.map((problem) => (
            <div key={problem} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <XCircle style={{ color: "var(--color-status-failed)", flexShrink: 0, marginTop: 2 }} size={18} />
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.5, fontFamily: "var(--font-display)" }}>
                {problem}
              </p>
            </div>
          ))}
        </div>

        {/* Resolution */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-6)", background: "rgba(14,164,114,0.06)", border: "1px solid rgba(14,164,114,0.2)", borderRadius: "var(--radius-lg)" }}>
          <CheckCircle2 style={{ color: "var(--color-brand)", flexShrink: 0 }} size={32} />
          <div>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)", marginBottom: "0.25rem" }}>
              NexusOps changes that.
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-display)" }}>
              Complete governance coverage. Zero blind spots.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
