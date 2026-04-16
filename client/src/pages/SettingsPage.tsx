import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  Bot,
  Check,
  ChevronRight,
  Crown,
  Database,
  GitBranch,
  Globe,
  Lock,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

// ─── Plan tiers ───────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "free forever",
    description: "For individuals exploring AI workflow governance.",
    icon: <Zap className="w-4 h-4" />,
    color: "text-muted-foreground",
    borderColor: "border-border",
    bgColor: "",
    features: [
      "Up to 5 workflows / month",
      "1 runtime (Make or n8n)",
      "Basic execution logging",
      "7-day log retention",
      "Community support",
    ],
    cta: "Current plan",
    ctaVariant: "outline" as const,
    current: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For automation engineers and marketing teams.",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-primary",
    borderColor: "border-primary/40",
    bgColor: "bg-primary/3",
    badge: "Most popular",
    features: [
      "Unlimited workflows",
      "Both runtimes (Make + n8n)",
      "Full AI interaction logging",
      "90-day log retention",
      "Report approval workflow",
      "PDF/JSON export",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    ctaVariant: "default" as const,
    current: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual contract",
    description: "For organisations with compliance and scale requirements.",
    icon: <Crown className="w-4 h-4" />,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/3",
    features: [
      "Everything in Pro",
      "SSO / SAML authentication",
      "Role-based access control",
      "Unlimited log retention",
      "SLA guarantees",
      "Dedicated onboarding",
      "Custom integrations",
      "Audit compliance reports",
    ],
    cta: "Contact sales",
    ctaVariant: "outline" as const,
    current: false,
  },
];

// ─── Role reference ───────────────────────────────────────────────────────────

const ROLES = [
  {
    role: "Admin",
    icon: <Shield className="w-4 h-4 text-primary" />,
    description: "Full platform access — manage workflows, approve reports, configure runtimes, and view all logs.",
    permissions: ["Create & delete workflows", "Approve / reject reports", "Configure webhook endpoints", "View all AI logs", "Manage team members"],
  },
  {
    role: "Analyst",
    icon: <Activity className="w-4 h-4 text-blue-400" />,
    description: "Read-only governance access — monitor workflows, view logs, and download reports.",
    permissions: ["View all workflows", "View execution logs", "View AI interaction logs", "Download reports (JSON)", "View performance data"],
  },
  {
    role: "Viewer",
    icon: <Globe className="w-4 h-4 text-muted-foreground" />,
    description: "Dashboard-only access — see high-level metrics and workflow status without drill-down.",
    permissions: ["View dashboard stats", "View workflow list", "View report summaries"],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: stats } = trpc.airtable.dashboardStats.useQuery();

  const usageItems = [
    { label: "Total Workflows", value: stats?.total ?? 0, max: 5, icon: <GitBranch className="w-3.5 h-3.5 text-primary" />, unit: "/ 5 on Starter" },
    { label: "AI Interactions Logged", value: 1, max: 10, icon: <Bot className="w-3.5 h-3.5 text-violet-400" />, unit: "/ 10 on Starter" },
    { label: "Execution Log Entries", value: 22, max: 100, icon: <Database className="w-3.5 h-3.5 text-blue-400" />, unit: "/ 100 on Starter" },
    { label: "Reports Generated", value: 1, max: 3, icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />, unit: "/ 3 on Starter" },
  ];

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Settings & Billing" }]}>
      <div className="max-w-[960px] mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight">Settings & Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your plan, monitor usage, and configure role-based access for your team.
          </p>
        </div>

        {/* Usage metrics */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Current Usage</h2>
            <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground font-medium">Starter plan</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {usageItems.map(item => {
              const pct = Math.min(100, Math.round((item.value / item.max) * 100));
              const isHigh = pct >= 80;
              return (
                <div key={item.label} className="surface-1 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-md bg-muted">{item.icon}</div>
                    <span className={`text-xs font-mono font-semibold ${isHigh ? "text-amber-400" : "text-foreground"}`}>
                      {item.value}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.unit}</p>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isHigh ? "bg-amber-400" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Plan tiers */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Plan & Pricing</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all ${plan.borderColor} ${plan.bgColor} ${plan.current ? "ring-1 ring-primary/20" : ""}`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md bg-muted ${plan.color}`}>{plan.icon}</div>
                  <span className={`text-sm font-bold ${plan.color}`}>{plan.name}</span>
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{plan.period}</span>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{plan.description}</p>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-foreground/80">
                      <Check className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.ctaVariant}
                  size="sm"
                  className="w-full text-xs"
                  disabled={plan.current}
                  onClick={() => {
                    if (!plan.current) {
                      window.alert("Billing integration coming soon. Contact sales@agentops.io for early access.");
                    }
                  }}
                >
                  {plan.current ? (
                    <><Check className="w-3 h-3 mr-1.5" /> {plan.cta}</>
                  ) : (
                    <>{plan.cta} <ChevronRight className="w-3 h-3 ml-1" /></>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Role-based access */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Role-Based Access Control</h2>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-medium border border-amber-500/20">
              Enterprise
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROLES.map(r => (
              <div key={r.role} className="surface-1 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted">{r.icon}</div>
                  <span className="text-sm font-semibold">{r.role}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{r.description}</p>
                <ul className="space-y-1">
                  {r.permissions.map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                      <Lock className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Role assignment and SSO configuration are available on the Enterprise plan. Contact your account manager to enable.
          </p>
        </section>

      </div>
    </DashboardLayout>
  );
}
