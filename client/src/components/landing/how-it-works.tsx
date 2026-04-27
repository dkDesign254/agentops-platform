/**
 * NexusOps — HowItWorks
 *
 * Three-step horizontal timeline showing the governance workflow.
 * Includes a mock terminal with scrolling event log animation.
 */
import { Plug, Eye, ClipboardCheck } from "lucide-react";

const STEPS = [
  {
    icon: <Plug size={20} />,
    number: "01",
    title: "Connect your runtime",
    description: "Point Make, n8n, or your custom agent at the NexusOps webhook. One endpoint, any runtime.",
    accent: "var(--color-runtime-make)",
  },
  {
    icon: <Eye size={20} />,
    number: "02",
    title: "Execute with full tracing",
    description: "Every step logs itself: data fetched, AI called, response received, report written. Governance happens automatically.",
    accent: "var(--color-brand)",
  },
  {
    icon: <ClipboardCheck size={20} />,
    number: "03",
    title: "Audit, review, approve",
    description: "Open the dashboard. Read the full trace. Approve AI-generated outputs. Export audit logs for compliance.",
    accent: "#3b82f6",
  },
];

const LOG_LINES = [
  { time: "10:42:01", event: "intake",       status: "success", msg: "Trigger received from Make.com" },
  { time: "10:42:01", event: "routing",      status: "success", msg: "Dispatched to campaign analysis step" },
  { time: "10:42:02", event: "execution",    status: "success", msg: "Performance data fetched from Airtable" },
  { time: "10:42:03", event: "ai_call",      status: "success", msg: "Prompt sent → claude-sonnet-4-6 (1,204 tokens)" },
  { time: "10:42:05", event: "ai_response",  status: "success", msg: "Response received (842 tokens, $0.004)" },
  { time: "10:42:06", event: "report",       status: "success", msg: "Draft report written to Airtable" },
  { time: "10:42:07", event: "completion",   status: "success", msg: "Workflow completed — 7/7 events logged" },
];

const STATUS_COLOR: Record<string, string> = {
  success: "var(--color-status-completed)",
  failed: "var(--color-status-failed)",
  pending: "var(--color-status-pending)",
};

export function HowItWorks(): JSX.Element {
  return (
    <section id="how-it-works" style={{ padding: "var(--space-20) var(--space-6)", background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border-subtle)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--color-brand)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-body)", marginBottom: "var(--space-3)" }}>
            Three steps
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            How NexusOps governs your workflows
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-12)" }}>
          {STEPS.map((step, i) => (
            <div key={step.number} style={{ position: "relative" }}>
              {/* Connector line (not on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block" style={{ position: "absolute", top: 28, left: "calc(100% - var(--space-3))", width: "calc(var(--space-6) + var(--space-3))", height: 1, background: "var(--color-border-default)", zIndex: 0 }} />
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${step.accent} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${step.accent} 30%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color: step.accent, flexShrink: 0 }}>
                    {step.icon}
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", color: "var(--color-text-tertiary)", letterSpacing: "0.1em" }}>STEP {step.number}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal mock */}
        <div style={{ background: "var(--color-bg-base)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {/* Terminal title bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "0.75rem var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f5f" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffb347" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3dffa0" }} />
            <span style={{ marginLeft: "var(--space-3)", fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)" }}>nexusops — governance trace WF-2026-001</span>
          </div>
          {/* Scrolling log */}
          <div style={{ padding: "var(--space-4)", height: 200, overflow: "hidden", position: "relative" }}>
            <div style={{ animation: "scroll-log 7s linear infinite" }}>
              {[...LOG_LINES, ...LOG_LINES].map((line, i) => (
                <div key={i} style={{ display: "flex", gap: "var(--space-4)", marginBottom: "0.35rem", fontFamily: "var(--font-body)", fontSize: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}>{line.time}</span>
                  <span style={{ color: STATUS_COLOR[line.status], flexShrink: 0, width: 90 }}>{line.event}</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>{line.msg}</span>
                </div>
              ))}
            </div>
            {/* Fade out top */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40, background: "linear-gradient(to bottom, var(--color-bg-base), transparent)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
