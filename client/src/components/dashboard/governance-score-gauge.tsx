/**
 * NexusOps — GovernanceScoreGauge
 *
 * Animated SVG circular gauge displaying the Governance Health Score (0–100).
 *
 * Score formula:
 *   (workflowsWithLogs / max(completedWorkflows,1)) * 40   // audit completeness
 * + (workflowsWithAiLogs / max(totalWorkflows,1)) * 30     // AI traceability
 * + (approvedReports / max(totalReports,1)) * 20           // report accountability
 * + ((totalWorkflows - failedWorkflows) / max(totalWorkflows,1)) * 10  // reliability
 *
 * Multiplied by 100 and clamped to [0, 100].
 *
 * Colour:
 *   80–100 → #3dffa0 (strong)
 *   50–79  → #ffb347 (attention)
 *   0–49   → #ff5f5f (critical)
 */
import { useEffect, useRef, useState } from "react";

export interface GovernanceScoreGaugeProps {
  totalWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  totalReports: number;
  approvedReports: number;
  /** Workflows that have at least one execution log record. */
  workflowsWithLogs: number;
  /** Workflows that have at least one AI interaction log record. */
  workflowsWithAiLogs: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 80; // r=80

function computeScore(props: GovernanceScoreGaugeProps): number {
  const {
    totalWorkflows,
    completedWorkflows,
    failedWorkflows,
    totalReports,
    approvedReports,
    workflowsWithLogs,
    workflowsWithAiLogs,
  } = props;

  const auditCompleteness = completedWorkflows > 0 ? workflowsWithLogs / completedWorkflows : 0;
  const aiTraceability = totalWorkflows > 0 ? workflowsWithAiLogs / totalWorkflows : 0;
  const reportApproval = totalReports > 0 ? approvedReports / totalReports : 1; // default 100% if no reports
  const reliability = totalWorkflows > 0 ? (totalWorkflows - failedWorkflows) / totalWorkflows : 1;

  const raw = auditCompleteness * 40 + aiTraceability * 30 + reportApproval * 20 + reliability * 10;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function scoreColor(score: number): string {
  if (score >= 80) return "#3dffa0";
  if (score >= 50) return "#ffb347";
  return "#ff5f5f";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong governance";
  if (score >= 50) return "Needs attention";
  return "Critical gaps";
}

interface SubBarProps {
  label: string;
  weight: string;
  ratio: number;
  color: string;
}

function SubBar({ label, weight, ratio, color }: SubBarProps): JSX.Element {
  const pct = Math.round(ratio * 100);
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-display)" }}>
          {label} <span style={{ color: "var(--color-text-tertiary)" }}>({weight})</span>
        </span>
        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-display)" }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 4,
            background: color,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Animated circular gauge showing governance health score with four sub-bars.
 */
export function GovernanceScoreGauge(props: GovernanceScoreGaugeProps): JSX.Element {
  const targetScore = computeScore(props);
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * targetScore));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    }

    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetScore]);

  const color = scoreColor(displayScore);
  const dashOffset = CIRCUMFERENCE * (1 - displayScore / 100);

  const {
    totalWorkflows,
    completedWorkflows,
    failedWorkflows,
    totalReports,
    approvedReports,
    workflowsWithLogs,
    workflowsWithAiLogs,
  } = props;

  const auditRatio = completedWorkflows > 0 ? workflowsWithLogs / completedWorkflows : 0;
  const aiRatio = totalWorkflows > 0 ? workflowsWithAiLogs / totalWorkflows : 0;
  const reportRatio = totalReports > 0 ? approvedReports / totalReports : 1;
  const reliabilityRatio = totalWorkflows > 0 ? (totalWorkflows - failedWorkflows) / totalWorkflows : 1;

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <p style={{ margin: "0 0 1rem", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>
        Governance Health Score
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        {/* SVG Gauge */}
        <div style={{ flexShrink: 0 }}>
          <svg width="180" height="180" viewBox="0 0 200 200" aria-label={`Governance score: ${targetScore} out of 100`}>
            {/* Background track */}
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="16"
            />
            {/* Score arc */}
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke={color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
              style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.3s ease" }}
            />
            {/* Score number */}
            <text
              x="100" y="96"
              textAnchor="middle"
              fill={color}
              fontSize="32"
              fontWeight="700"
              fontFamily="Syne, sans-serif"
            >
              {displayScore}
            </text>
            <text
              x="100" y="116"
              textAnchor="middle"
              fill="#4d5265"
              fontSize="12"
              fontFamily="Syne, sans-serif"
            >
              / 100
            </text>
            <text
              x="100" y="134"
              textAnchor="middle"
              fill={color}
              fontSize="10"
              fontWeight="600"
              fontFamily="Syne, sans-serif"
            >
              {scoreLabel(displayScore)}
            </text>
          </svg>
        </div>

        {/* Sub-bars */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <SubBar label="Audit completeness" weight="40%" ratio={auditRatio} color="var(--color-brand)" />
          <SubBar label="AI traceability" weight="30%" ratio={aiRatio} color="#3dffa0" />
          <SubBar label="Report approval" weight="20%" ratio={reportRatio} color="#ffb347" />
          <SubBar label="Reliability" weight="10%" ratio={reliabilityRatio} color="#ea4e9d" />
        </div>
      </div>
    </div>
  );
}
