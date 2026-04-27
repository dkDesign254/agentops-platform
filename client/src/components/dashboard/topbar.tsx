/**
 * NexusOps — TopBar
 *
 * Dashboard top navigation bar. Shows logo (small), page title,
 * notification bell (badge from stalled/failed workflows), and
 * user avatar + dropdown (Profile · Settings · Sign out).
 */
import { Logo } from "@/components/ui/logo";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export interface TopBarProps {
  title?: string;
  failedCount?: number;
}

export function TopBar({ title = "Dashboard", failedCount = 0 }: TopBarProps): JSX.Element {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "User";

  async function handleSignOut(): Promise<void> {
    setDropdownOpen(false);
    await signOut();
    setLocation("/");
  }

  return (
    <header style={{ height: 60, background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", padding: "0 var(--space-6)", gap: "var(--space-4)", flexShrink: 0 }}>
      {/* Page title */}
      <p style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--color-text-primary)" }}>
        {title}
      </p>

      {/* Notification bell */}
      <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: "0.3rem", borderRadius: "var(--radius-sm)" }}>
        <Bell size={18} />
        {failedCount > 0 && (
          <span style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, borderRadius: "50%", background: "var(--color-status-failed)", fontSize: "0.6rem", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-body)" }}>
            {failedCount > 9 ? "9+" : failedCount}
          </span>
        )}
      </button>

      {/* User dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", background: "none", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", padding: "0.35rem 0.6rem 0.35rem 0.4rem", cursor: "pointer", color: "var(--color-text-primary)" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(14,164,114,0.15)", border: "1px solid rgba(14,164,114,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "var(--color-brand)", fontFamily: "var(--font-display)" }}>
            {initials}
          </div>
          <span style={{ fontSize: "0.8125rem", fontFamily: "var(--font-display)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName}
          </span>
          <ChevronDown size={14} style={{ color: "var(--color-text-tertiary)", transition: "transform var(--transition-fast)", transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
        </button>

        {dropdownOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", minWidth: 180, zIndex: 50, overflow: "hidden" }}>
            {[
              { icon: <User size={14} />, label: "Profile", action: () => setLocation("/settings") },
              { icon: <Settings size={14} />, label: "Settings", action: () => setLocation("/settings") },
            ].map((item) => (
              <button key={item.label} onClick={() => { setDropdownOpen(false); item.action(); }}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", width: "100%", padding: "0.6rem var(--space-4)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontFamily: "var(--font-display)", fontSize: "0.875rem", transition: "all var(--transition-fast)", textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                {item.icon}{item.label}
              </button>
            ))}
            <div style={{ borderTop: "1px solid var(--color-border-subtle)" }} />
            <button onClick={handleSignOut}
              style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", width: "100%", padding: "0.6rem var(--space-4)", background: "none", border: "none", cursor: "pointer", color: "var(--color-status-failed)", fontFamily: "var(--font-display)", fontSize: "0.875rem", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
              <LogOut size={14} />Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
