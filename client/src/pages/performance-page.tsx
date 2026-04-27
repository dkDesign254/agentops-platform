/**
 * NexusOps - PerformancePage
 * Route: /performance (protected)
 */
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { usePerformanceData } from "@/hooks/use-performance-data";

export default function PerformancePage(): JSX.Element {
  const { data, loading } = usePerformanceData();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <div className="hidden md:flex"><Sidebar /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar title="Campaign Data" />
        <main style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            {loading
              ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius-lg)" }} />)}</div>
              : data.length === 0
              ? <div style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--color-text-tertiary)", fontFamily: "var(--font-display)" }}>No performance data yet.</div>
              : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
                  {data.map((row) => (
                    <div key={row.id} style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>{row.campaign_name}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                        {[
                          { label: "Impressions", value: row.impressions?.toLocaleString() ?? "n/a" },
                          { label: "Clicks", value: row.clicks?.toLocaleString() ?? "n/a" },
                          { label: "CTR", value: row.ctr != null ? (row.ctr * 100).toFixed(2) + "%" : "n/a" },
                          { label: "ROAS", value: row.roas != null ? row.roas.toFixed(2) + "x" : "n/a" },
                        ].map((m) => (
                          <div key={m.label}>
                            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)" }}>{m.label}</p>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text-primary)", fontSize: "1.125rem" }}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                      {row.reporting_period && <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)", marginTop: "var(--space-3)" }}>{row.reporting_period}</p>}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </main>
      </div>
    </div>
  );
}
