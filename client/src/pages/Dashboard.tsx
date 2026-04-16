import DashboardLayout from "@/components/DashboardLayout";
import {
  EmptyState,
  RuntimeBadge,
  SectionHeader,
  StatsCard,
  StatusBadge,
} from "@/components/AgentOpsUI";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useLocation } from "wouter";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: workflows, isLoading, refetch } = trpc.workflows.list.useQuery();
  const { data: stats } = trpc.logs.dashboardStats.useQuery();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Governance Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Runtime-independent supervision of AI-driven marketing workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setLocation("/workflows/new")}
              className="gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              New Workflow
            </Button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Workflows"
            value={stats?.total ?? 0}
            icon={<Activity className="w-4 h-4" />}
          />
          <StatsCard
            label="Completed"
            value={stats?.completed ?? 0}
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
          <StatsCard
            label="Running"
            value={stats?.running ?? 0}
            icon={<Loader2 className="w-4 h-4" />}
          />
          <StatsCard
            label="Failed"
            value={stats?.failed ?? 0}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        </div>

        {/* Workflow table */}
        <div>
          <SectionHeader
            title="All Workflows"
            description="Weekly Marketing Performance Reporting executions"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/workflows/new")}
                className="gap-2 bg-transparent text-xs"
              >
                <Plus className="w-3 h-3" />
                Create
              </Button>
            }
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !workflows || workflows.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-8 h-8" />}
              title="No workflows yet"
              description="Create your first Weekly Marketing Performance Reporting workflow to get started."
              action={
                <Button
                  size="sm"
                  onClick={() => setLocation("/workflows/new")}
                  className="gap-2 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Workflow
                </Button>
              }
            />
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Workflow ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Runtime
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((wf, idx) => (
                    <tr
                      key={wf.id}
                      onClick={() => setLocation(`/workflows/${wf.id}`)}
                      className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-accent/40 ${
                        idx % 2 === 0 ? "bg-card" : "bg-background"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {wf.id}
                        </code>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-foreground text-xs">
                          {wf.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <RuntimeBadge runtime={wf.runtime} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={wf.status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {wf.requestedBy}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(wf.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {wf.completedAt ? (
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {formatDate(wf.completedAt)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
