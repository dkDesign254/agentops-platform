/**
 * NexusOps — Sidebar
 *
 * Collapsible navigation sidebar for the authenticated dashboard.
 * Organised into four sections: Monitor, Audit, Output, Settings.
 * Active route highlighted with brand accent + left border.
 */
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";
import { LayoutDashboard, Workflow, ScrollText, Bot, FileText, BarChart3, Settings, Users, Plug, Key, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: "Monitor",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
      { label: "Workflows", href: "/workflows", icon: <Workflow size={16} /> },
    ],
  },
  {
    title: "Audit",
    items: [
      { label: "Execution Logs", href: "/audit", icon: <ScrollText size={16} /> },
      { label: "AI Interactions", href: "/ai-interactions", icon: <Bot size={16} /> },
    ],
  },
  {
    title: "Output",
    items: [
      { label: "Final Reports", href: "/reports", icon: <FileText size={16} /> },
      { label: "Campaign Data", href: "/performance", icon: <BarChart3 size={16} /> },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Team", href: "/settings", icon: <Users size={16} /> },
      { label: "Integrations", href: "/settings", icon: <Plug size={16} /> },
      { label: "API Keys", href: "/settings", icon: <Key size={16} /> },
    ],
  },
];

export interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps): JSX.Element {
  const [location, setLocation] = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const isCollapsed = onCollapse ? collapsed : internalCollapsed;
  const toggle = () => {
    if (onCollapse) onCollapse(!collapsed);
    else setInternalCollapsed(!internalCollapsed);
  };

  return (
    <aside style={{
      width: isCollapsed ? 60 : 220,
      minHeight: "100vh",
      background: "var(--color-bg-surface)",
      borderRight: "1px solid var(--color-border-subtle)",
      display: "flex",
      flexDirection: "column",
      transition: "width var(--transition-base)",
      flexShrink: 0,
      position: "relative",
    }}>
      {/* Logo area */}
      <div style={{ padding: "var(--space-5) var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between" }}>
        {!isCollapsed && <Logo size="sm" />}
        {isCollapsed && (
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--color-brand)", fontSize: "1rem" }}>⬡</span>
          </div>
        )}
        <button onClick={toggle} style={{ background: "none", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-sm)", padding: "0.2rem", color: "var(--color-text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center" }}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: "var(--space-4) var(--space-3)", overflowY: "auto" }}>
        {NAV.map((section) => (
          <div key={section.title} style={{ marginBottom: "var(--space-5)" }}>
            {!isCollapsed && (
              <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-tertiary)", padding: "0 var(--space-2)", marginBottom: "var(--space-2)", fontFamily: "var(--font-display)" }}>
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <button key={item.label + item.href} onClick={() => setLocation(item.href)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    width: "100%",
                    padding: isCollapsed ? "0.55rem" : "0.5rem var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    cursor: "pointer",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    background: isActive ? "rgba(14,164,114,0.1)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--color-brand)" : "2px solid transparent",
                    color: isActive ? "var(--color-brand)" : "var(--color-text-secondary)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                    transition: "all var(--transition-fast)",
                    marginBottom: 2,
                  }}>
                  {item.icon}
                  {!isCollapsed && item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
