/**
 * NexusOps - SettingsPage
 * Route: /settings (protected)
 */
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage(): JSX.Element {
  const { user } = useAuth();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <div className="hidden md:flex"><Sidebar /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar title="Settings" />
        <main style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-5)" }}>Profile</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)", marginBottom: "var(--space-1)" }}>Email</p>
                  <p style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>{user?.email ?? "n/a"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)", marginBottom: "var(--space-1)" }}>User ID</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{user?.id ?? "n/a"}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
