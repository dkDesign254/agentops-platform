import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type UserRole = "admin" | "analyst" | "viewer" | "user" | undefined;

function getRoleLabel(role: UserRole) {
  if (role === "admin") return "Admin";
  if (role === "analyst") return "Analyst";
  return "Viewer";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RuntimeBadge({ runtime }: { runtime?: string }) {
  const value = runtime?.toLowerCase() ?? "";

  if (value === "make") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-400">
        <Zap className="h-3 w-3" />
        Make
      </span>
    );
  }

  if (value === "n8n") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-400">
        <Zap className="h-3 w-3" />
        n8n
      </span>
    );
  }

  return <span className="text-xs text-muted-foreground">{runtime ?? "—"}</span>;
}

function StatusBadge({ status }: { status?: string }) {
  const value = status?.toLowerCase() ?? "";

  const style =
    value === "completed"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : value === "running"
      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
      : value === "failed" || value === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-400"
      : value === "pending"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
      : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status ?? "Unknown"}
    </span>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon,
  onClick,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="surface-elevated card-hover rounded-2xl p-5 text-left transition hover:bg-accent/10"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
    </button>
  );
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="surface-elevated card-hover rounded-2xl p-5 text-left transition hover:bg-accent/10"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </button>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");

  const role = (user?.role as UserRole) ?? "viewer";
  const canBuild = role === "admin" || role === "analyst";

  const { data: stats, isLoading: statsLoading } = trpc.airtable.dashboardStats.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const {
    data: workflows = [],
    isLoading: workflowsLoading,
    refetch,
    isFetching,
  } = trpc.airtable.workflows.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const filteredWorkflows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workflows;

    return workflows.filter((workflow) => {
      return (
        workflow.workflowId.toLowerCase().includes(query) ||
        workflow.name.toLowerCase().includes(query) ||
        workflow.requestedBy.toLowerCase().includes(query) ||
        (workflow.reportPeriod ?? "").toLowerCase().includes(query)
      );
    });
  }, [workflows, search]);

  const refresh = async () => {
    await utils.airtable.dashboardStats.invalidate();
    await utils.airtable.workflows.invalidate();
    await refetch();
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Workspace" }]}> 
      <div className="mx-auto max-w-[1440px] space-y-6">
        <section className="surface-elevated relative overflow-hidden rounded-3xl p-6 md:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_30%),radial-gradient(circle_at_left,rgba(16,185,129,0.07),transparent_24%)]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                Agent Operations Command
              </div>

              <div>
                <h1 className="text-heading text-3xl md:text-4xl">
                  Run and understand company workflows from one place.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Monitor AI-powered workflows, inspect logs, review performance, and apply governance without making the product feel harder than the work itself.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-[11px] font-medium text-foreground">
                  <Shield className="h-3 w-3 text-primary" />
                  {getRoleLabel(role)} access
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Workspace live
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isFetching}
                className="h-9 rounded-xl bg-transparent text-xs"
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              {canBuild && (
                <Button
                  size="sm"
                  onClick={() => setLocation("/workflows/new")}
                  className="h-9 rounded-xl bg-[var(--primary)] text-xs text-white hover:opacity-90"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Workflow
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="surface-elevated rounded-2xl border border-blue-500/15 bg-blue-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Quick Start</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Start with the action you need. Every card below opens the right workspace area directly.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <button
                  onClick={() => setLocation("/workflows/new")}
                  className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-left transition hover:bg-primary/15"
                >
                  <p className="mb-1 text-xs font-semibold text-foreground">1. Create workflow</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">Configure a Make or n8n automation.</p>
                </button>

                <button
                  onClick={() => setLocation("/logs")}
                  className="rounded-2xl border border-border/70 bg-background/30 p-4 text-left transition hover:bg-accent/20"
                >
                  <p className="mb-1 text-xs font-semibold text-foreground">2. Check runs</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">Review execution status and failures.</p>
                </button>

                <button
                  onClick={() => setLocation("/help")}
                  className="rounded-2xl border border-border/70 bg-background/30 p-4 text-left transition hover:bg-accent/20"
                >
                  <p className="mb-1 text-xs font-semibold text-foreground">3. Ask AI Help</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">Let the app guide the next step.</p>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeleton h-32 rounded-2xl" />)
          ) : (
            <>
              <KpiCard title="Active Agents" value={stats?.running ?? 0} description="Currently executing" icon={<Bot className="h-4 w-4" />} onClick={() => setLocation("/logs")} />
              <KpiCard title="Completed" value={stats?.completed ?? 0} description="Successful runs" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setLocation("/reports")} />
              <KpiCard title="Pending" value={stats?.pending ?? 0} description="Awaiting execution" icon={<Clock className="h-4 w-4" />} onClick={() => setLocation("/logs")} />
              <KpiCard title="Errors" value={stats?.failed ?? 0} description="Need investigation" icon={<AlertTriangle className="h-4 w-4" />} onClick={() => setLocation("/logs")} />
            </>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ActionCard title="Workflow setup" description="Create and configure a new workflow for Make or n8n." icon={<Workflow className="h-4 w-4" />} onClick={() => setLocation("/workflows/new")} />
            <ActionCard title="Workflow runs" description="Trace execution events, failures, and runtime status." icon={<Activity className="h-4 w-4" />} onClick={() => setLocation("/logs")} />
            <ActionCard title="AI activity" description="Inspect prompts, responses, and model output." icon={<Bot className="h-4 w-4" />} onClick={() => setLocation("/ai-logs")} />
            <ActionCard title="Reports" description="Read summaries, anomalies, and recommendations." icon={<FileText className="h-4 w-4" />} onClick={() => setLocation("/reports")} />
          </div>

          <div className="surface-elevated rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Platform guidance</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Best next actions for new users</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => setLocation("/home")} className="w-full rounded-2xl border border-border/70 bg-background/30 p-4 text-left transition hover:bg-accent/20">
                <p className="text-xs font-semibold text-foreground">Return to homepage</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Use the softer product overview if the dashboard feels too dense.</p>
              </button>
              <button onClick={() => setLocation("/help")} className="w-full rounded-2xl border border-border/70 bg-background/30 p-4 text-left transition hover:bg-accent/20">
                <p className="text-xs font-semibold text-foreground">Use AI Help</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Ask for help and let the platform route you.</p>
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Workflow Registry</h2>
              <p className="mt-1 text-xs text-muted-foreground">Live operational records sourced from Airtable</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground" onClick={() => setLocation("/reports")}>Reports</Button>
          </div>

          <div className="surface-elevated rounded-2xl p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search workflows, IDs, requesters…"
                className="h-9 rounded-xl border-border/60 bg-muted/30 pl-9 text-xs"
              />
            </div>
          </div>

          <div className="surface-elevated overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/15">
                    {["Workflow ID", "Name", "Runtime", "Status", "Requested By", "Requested"].map((label) => (
                      <th key={label} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workflowsLoading ? (
                    Array.from({ length: 6 }).map((_, row) => (
                      <tr key={row} className="border-b border-border/40">
                        {Array.from({ length: 6 }).map((__, col) => (
                          <td key={col} className="px-4 py-4"><div className="skeleton h-4 rounded-xl" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredWorkflows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-14 text-center text-sm text-muted-foreground">
                        <Eye className="mx-auto mb-2 h-7 w-7 opacity-30" />
                        No workflows found.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkflows.map((workflow, index) => (
                      <tr
                        key={workflow.recordId}
                        onClick={() => setLocation(`/workflows/${workflow.recordId}`)}
                        className={`cursor-pointer border-b border-border/40 transition hover:bg-primary/5 ${index % 2 === 0 ? "bg-card/60" : "bg-background/20"}`}
                      >
                        <td className="px-4 py-4"><span className="code-inline">{workflow.workflowId}</span></td>
                        <td className="px-4 py-4 text-xs font-medium text-foreground">{workflow.name}</td>
                        <td className="px-4 py-4"><RuntimeBadge runtime={workflow.runtime} /></td>
                        <td className="px-4 py-4"><StatusBadge status={workflow.status} /></td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">{workflow.requestedBy}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">{formatDate(workflow.dateRequested)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {role === "viewer" && (
          <section className="surface-elevated rounded-2xl border border-blue-500/15 bg-blue-500/5 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-blue-400" />
              <p className="text-sm font-semibold text-foreground">Read-only mode</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Viewer accounts can inspect dashboards, workflow outcomes, reports, and trends, but cannot create or administer workflows.
            </p>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
