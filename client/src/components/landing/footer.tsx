/**
 * NexusOps — Footer
 *
 * Four-column footer with logo, platform links, ecosystem links,
 * company links. Bottom bar with copyright and attribution.
 */
import { Logo } from "@/components/ui/logo";
import { Github, Twitter } from "lucide-react";

const COLS = [
  {
    heading: "Platform",
    links: ["Dashboard", "Execution Logs", "AI Interactions", "Reports", "Campaign Data"],
  },
  {
    heading: "Ecosystem",
    links: ["NexusOps Core", "Connectors", "API", "Compliance Export"],
  },
  {
    heading: "Company",
    links: ["About", "Docs", "Blog", "Privacy Policy", "Terms of Service"],
  },
];

function FooterLink({ children }: { children: string }): JSX.Element {
  return (
    <a href="#" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: "0.6rem", transition: "color var(--transition-fast)" }}
      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--color-text-primary)")}
      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--color-text-secondary)")}>
      {children}
    </a>
  );
}

export function Footer(): JSX.Element {
  return (
    <footer style={{ borderTop: "1px solid var(--color-border-subtle)", background: "var(--color-bg-base)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-16) var(--space-6) var(--space-8)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(3, 1fr)", gap: "var(--space-10)" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div>
            <Logo size="sm" />
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginTop: "var(--space-4)", lineHeight: 1.6, maxWidth: 220 }}>
              Where AI governance begins.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
              {[{ icon: <Github size={16} />, label: "GitHub" }, { icon: <Twitter size={16} />, label: "X / Twitter" }].map((s) => (
                <a key={s.label} href="#" aria-label={s.label}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-default)", color: "var(--color-text-secondary)", textDecoration: "none", transition: "all var(--transition-fast)" }}
                  onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = "var(--color-text-primary)"; el.style.borderColor = "var(--color-border-strong)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = "var(--color-text-secondary)"; el.style.borderColor = "var(--color-border-default)"; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.heading}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "var(--space-4)", fontFamily: "var(--font-display)" }}>
                {col.heading}
              </p>
              {col.links.map((link) => <FooterLink key={link}>{link}</FooterLink>)}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--color-border-subtle)", padding: "var(--space-5) var(--space-6)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)" }}>
            © 2026 NexusOps. Built to govern AI responsibly.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)" }}>
            Made by Dustine Kibagendi
          </p>
        </div>
      </div>
    </footer>
  );
}
