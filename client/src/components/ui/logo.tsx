/**
 * NexusOps — Logo component
 *
 * Renders the NexusOps brand mark + wordmark as an inline SVG.
 * The mark is a stylised hexagonal node where three diagonal lines
 * intersect at a centre point, evoking a network nexus.
 *
 * Sizes:
 *   sm  — 24px mark height
 *   md  — 32px mark height (default)
 *   lg  — 48px mark height
 *
 * @example
 * <Logo size="md" />
 * <Logo size="sm" className="opacity-80" />
 */

export interface LogoProps {
  /** Visual size of the logo mark */
  size?: "sm" | "md" | "lg";
  /** Additional class names for the wrapper element */
  className?: string;
}

const sizes = {
  sm: { mark: 24, gap: 8, wordmark: 14, tagSize: 9 },
  md: { mark: 32, gap: 10, wordmark: 18, tagSize: 11 },
  lg: { mark: 48, gap: 14, wordmark: 26, tagSize: 14 },
} as const;

/**
 * Logo
 *
 * NexusOps brand mark + wordmark. Renders at three discrete sizes.
 * Uses CSS custom properties from the NexusOps design system.
 *
 * @param props.size    - "sm" | "md" | "lg" (default "md")
 * @param props.className - optional extra class names
 */
export function Logo({ size = "md", className = "" }: LogoProps): JSX.Element {
  const { mark, gap, wordmark } = sizes[size];
  const cx = mark / 2;
  const cy = mark / 2;
  const r = mark * 0.42; // hexagon circumradius

  // Six hexagon vertices
  const hex = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  const hexPath = hex
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ") + " Z";

  // Three diagonal axes through centre (network nexus lines)
  const axes = [
    [hex[0], hex[3]], // top-right ↔ bottom-left
    [hex[1], hex[4]], // right ↔ left
    [hex[2], hex[5]], // bottom-right ↔ top-left
  ];

  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ gap }}
      role="img"
      aria-label="NexusOps logo"
    >
      {/* Hexagonal mark */}
      <svg
        width={mark}
        height={mark}
        viewBox={`0 0 ${mark} ${mark}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer hexagon fill */}
        <path
          d={hexPath}
          fill="rgba(14,164,114,0.12)"
          stroke="var(--color-brand)"
          strokeWidth={mark * 0.04}
          strokeLinejoin="round"
        />

        {/* Three diagonal nexus lines */}
        {axes.map(([a, b], i) => (
          <line
            key={i}
            x1={a.x.toFixed(2)}
            y1={a.y.toFixed(2)}
            x2={b.x.toFixed(2)}
            y2={b.y.toFixed(2)}
            stroke="var(--color-brand)"
            strokeWidth={mark * 0.05}
            strokeLinecap="round"
            opacity="0.7"
          />
        ))}

        {/* Centre node */}
        <circle
          cx={cx}
          cy={cy}
          r={mark * 0.09}
          fill="var(--color-brand)"
        />

        {/* Corner nodes */}
        {hex.map((p, i) => (
          <circle
            key={i}
            cx={p.x.toFixed(2)}
            cy={p.y.toFixed(2)}
            r={mark * 0.055}
            fill="var(--color-brand)"
            opacity="0.6"
          />
        ))}
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: wordmark,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
          Nexus
        </span>
        <span style={{ fontWeight: 400, color: "var(--color-brand)" }}>
          Ops
        </span>
      </span>
    </div>
  );
}
