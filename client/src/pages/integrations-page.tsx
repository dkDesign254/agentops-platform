/**
 * NexusOps — IntegrationsPage
 *
 * Displays the Integration Registry from Airtable. Integrations are grouped
 * by category and filterable by status (All / Live / Beta / Coming Soon).
 * Each card shows name, category badge, description, status, capability icons,
 * and a connect or notify-me button.
 *
 * Route: /integrations (protected — requires auth)
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { useIntegrations } from "@/hooks/use-integrations";
import { useT } from "@/contexts/LocaleContext";
import { Webhook, Lock, Zap, ExternalLink } from "lucide-react";
import type { Integration } from "@/lib/airtable";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Live:          { bg: "rgba(61,255,160,0.1)",  text: "#3dffa0",  border: "rgba(61,255,160,0.25)" },
  Beta:          { bg: "rgba(255,179,71,0.1)",  text: "#ffb347",  border: "rgba(255,179,71,0.25)" },
  "Coming Soon": { bg: "rgba(77,82,101,0.2)",   text: "#4d5265",  border: "rgba(77,82,101,0.3)" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Automation Platforms": "#ff6b35",
  "Agent Builders":       "#ea4e9d",
  "LLM Frameworks":       "#0ea472",
  "Notifications":        "#a78bfa",
  "Data Sources":         "#38bdf8",
};

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? "#4d5265";
}

// ─── Integration card ─────────────────────────────────────────────────────────

interface IntegrationCardProps {
  integration: Integration;
}

function IntegrationCard({ integration: it }: IntegrationCardProps): JSX.Element {
  const [notified, setNotified] = useState(false);
  const sc = STATUS_COLORS[it.status] ?? STATUS_COLORS["Coming Soon"];
  const isLive = it.status === "Live" || it.status === "Beta";
  const catColor = categoryColor(it.category);

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 12,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        opacity: it.status === "Coming Soon" ? 0.7 : 1,
        transition: "border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isLive ? catColor + "60" : "var(--color-border-default)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-subtle)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${catColor}20`,
            border: `1px solid ${catColor}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: catColor,
          }}
        >
          {it.name.charAt(0).toUpperCase()}
        </div>

        {/* Status badge */}
        <span
          style={{
            background: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`,
            borderRadius: "99px",
            padding: "0.2rem 0.55rem",
            fontSize: "0.6875rem",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {it.status}
        </span>
      </div>

      {/* Name + category */}
      <div>
        <p style={{ margin: "0 0 0.2rem", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>
          {it.name}
        </p>
        <span
          style={{
            fontSize: "0.6875rem",
            fontFamily: "var(--font-display)",
            color: catColor,
            background: `${catColor}15`,
            borderRadius: "99px",
            padding: "0.15rem 0.5rem",
          }}
        >
          {it.category}
        </span>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, flex: 1 }}>
        {it.description || "Connect your workflows to NexusOps governance."}
      </p>

      {/* Capability icons */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {it.webhookSupported && (
          <span title="Webhook supported" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
            <Webhook size={12} /> Webhook
          </span>
        )}
        {it.oauthSupported && (
          <span title="OAuth supported" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
            <Lock size={12} /> OAuth
          </span>
        )}
        {it.autoBuildSupported && (
          <span title="Auto-build supported" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
            <Zap size={12} /> Auto-build
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
        {isLive ? (
          <button
            style={{
              flex: 1,
              padding: "0.5rem",
              background: "var(--color-brand)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            onClick={() => alert(`Integration wizard for ${it.name} coming soon!`)}
          >
            Connect
          </button>
        ) : (
          <button
            onClick={() => setNotified(true)}
            style={{
              flex: 1,
              padding: "0.5rem",
              background: notified ? "rgba(14,164,114,0.1)" : "none",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
              color: notified ? "var(--color-brand)" : "var(--color-text-secondary)",
              fontFamily: "var(--font-display)",
              fontSize: "0.8125rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {notified ? "✓ Notified" : "Notify me"}
          </button>
        )}

        {it.docsUrl && (
          <a
            href={it.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View docs"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-tertiary)",
              textDecoration: "none",
              flexShrink: 0,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-border-default)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; e.currentTarget.style.color = "var(--color-text-tertiary)"; }}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

type StatusFilter = "All" | "Live" | "Beta" | "Coming Soon";
const FILTERS: StatusFilter[] = ["All", "Live", "Beta", "Coming Soon"];

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Integrations page — lists all integrations from Airtable, filterable by status.
 */
export default function IntegrationsPage(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [, setLocation] = useLocation();
  const T = useT();
  const { integrations, loading, error } = useIntegrations();

  const filtered = filter === "All" ? integrations : integrations.filter((i) => i.status === filter);

  // Group by category
  const grouped: Record<string, Integration[]> = {};
  for (const it of filtered) {
    if (!grouped[it.category]) grouped[it.category] = [];
    grouped[it.category].push(it);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <div className="hidden md:flex">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title={T("nav.integrations")} />

        <main style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            {/* Hero */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h1 style={{ margin: "0 0 0.25rem", fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                Connect your runtime
              </h1>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Link Make, n8n, LangChain, or any webhook-based tool to bring all your AI workflows under NexusOps governance.
              </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "0.375rem", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "0.4rem 0.875rem",
                      borderRadius: "var(--radius-md)",
                      border: active ? "1px solid var(--color-brand)" : "1px solid var(--color-border-subtle)",
                      background: active ? "rgba(14,164,114,0.1)" : "none",
                      color: active ? "var(--color-brand)" : "var(--color-text-secondary)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8125rem",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {f}
                    {f !== "All" && (
                      <span style={{ marginLeft: "0.35rem", color: "var(--color-text-tertiary)" }}>
                        ({integrations.filter((i) => i.status === f).length})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "1rem", background: "rgba(255,95,95,0.1)", border: "1px solid rgba(255,95,95,0.25)", borderRadius: 8, marginBottom: "var(--space-4)", color: "#ff5f5f", fontSize: "0.8125rem", fontFamily: "var(--font-display)" }}>
                {error} — make sure VITE_AIRTABLE_TOKEN is set.
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 240,
                      borderRadius: 12,
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border-subtle)",
                      animation: "skeleton-pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && filtered.length === 0 && !error && (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-tertiary)", fontFamily: "var(--font-display)" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔌</p>
                <p style={{ margin: 0, fontSize: "0.9375rem" }}>No integrations found for "{filter}"</p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem" }}>
                  Make sure VITE_AIRTABLE_TOKEN is configured and the Integration Registry table has records.
                </p>
              </div>
            )}

            {/* Grid by category */}
            {!loading && Object.entries(grouped).map(([category, items]) => (
              <div key={category} style={{ marginBottom: "var(--space-8)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "var(--space-4)" }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: categoryColor(category),
                      flexShrink: 0,
                    }}
                  />
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-text-primary)", letterSpacing: "0.01em" }}>
                    {category}
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                    {items.length}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
                  {items.map((it) => (
                    <IntegrationCard key={it.recordId} integration={it} />
                  ))}
                </div>
              </div>
            ))}

            {/* Fallback: no Airtable data — show static cards */}
            {!loading && integrations.length === 0 && !error && (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <p style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-display)", fontSize: "0.875rem" }}>
                  Add integrations to the Integration Registry in Airtable to see them here.
                </p>
                <p style={{ color: "var(--color-text-tertiary)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  Make sure VITE_AIRTABLE_TOKEN is set and the token has read access to base app4DDa3zvaGspOhz.
                </p>
              </div>
            )}

            {/* Connected integrations (placeholder) */}
            <div
              style={{
                marginTop: "var(--space-8)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <p style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>
                Connected integrations
              </p>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                Your connected integrations will appear here once you connect a runtime above.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
