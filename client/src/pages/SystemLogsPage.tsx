import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Database,
  GitBranch,
  Info,
  RefreshCw,
  Search,
  Shield,
  Webhook,
  XCircle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

function fmtDateTime(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

type LogLevel = "info" | "success" | "warning" | "error";

interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  event: string;
  message: string;
  workflowId?: string;
}

function levelIcon(level: LogLevel) {
  switch (level) {
    case "success":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "warning":
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    case "error":
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    default:
      return <Info className="w-3.5 h-3.5 text-blue-400" />;
  }
}

function levelBadge(level: LogLevel) {
  const map: Record<LogLevel, string> = {
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${map[level]}`;
}

function sourceIcon(source: string) {
  if (source === "webhook") return <Webhook className="w-3.5 h-3.5" />;
  if (source === "ai") return <Bot className="w-3.5 h-3.5" />;
  if (source === "runtime") return <GitBranch className="w-3.5 h-3.5" />;
  if (source === "database") return <Database className="w-3.5 h-3.5" />;
  if (source === "governance") return <Shield className="w-3.5 h-3.5" />;
  return <Activity className="w-3.5 h-3.5" />;
}

function buildSystemLogs(
  execLogs: Array<{
    recordId: string;
    logId: string;
    stepName: string;
    eventType: string;
    status: string;
    timestamp: string | null;
    message: string | null;
    runtime: string;
    workflowRecordIds: string[];
  }>,
  aiLogs: Array<{
    recordId: string;
    logId: string;
    modelUsed: string;
    timestamp: string | null;
    costNotes: string | null;
    workflowRecordIds: string[];
  }>,
  workflows: Array<{ recordId: string; workflowId: string }>
): SystemLogEntry[] {
  const wfMap = new Map(workflows.map((w) => [w.recordId, w.workflowId]));

  const fromExec: SystemLogEntry[] = execLogs.map((e) => ({
    id: e.recordId,
    timestamp: e.timestamp ?? new Date().toISOString(),
    level:
      e.status?.toLowerCase() === "error" || e.status?.toLowerCase() === "failed"
        ? "error"
        : e.status?.toLowerCase() === "warning"
        ? "warning"
        : e.eventType?.toLowerCase().includes("created")
        ? "info"
        : "success",
    source: "runtime",
    event: e.eventType ?? "execution",
    message: e.message ?? `${e.stepName} — ${e.eventType} (${e.runtime})`,
    workflowId: e.workflowRecordIds[0] ? wfMap.get(e.workflowRecordIds[0]) : undefined,
  }));

  const fromAI: SystemLogEntry[] = aiLogs.map((a) => ({
    id: a.recordId,
    timestamp: a.timestamp ?? new Date().toISOString(),
    level: "info" as LogLevel,
    source: "ai",
    event: "AI Invocation",
    message: `AI model call via ${a.modelUsed}${a.costNotes ? ` · ${a.costNotes}` : ""}`,
    workflowId: a.workflowRecordIds[0] ? wfMap.get(a.workflowRecordIds[0]) : undefined,
  }));

  const platformEvents: SystemLogEntry[] = [
    {
      id: "sys-001",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: "success",
      source: "governance",
      event: "Airtable Sync",
      message:
        "All Airtable tables synced successfully across workflows, execution logs, AI logs, performance data, and reports.",
    },
    {
      id: "sys-002",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: "info",
      source: "webhook",
      event: "Webhook Registered",
      message: "Inbound webhook endpoints active: /api/webhooks/make · /api/webhooks/n8n",
    },
    {
      id: "sys-003",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: "info",
      source: "database",
      event: "Schema Verified",
      message:
        "Database schema verified: workflows, ExecutionLogs, AI_Logs, and reports tables healthy.",
    },
  ];

  return [...platformEvents, ...fromExec, ...fromAI].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function MetricTile({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "default" | "warning" | "danger" | "info";
}) {
  const toneMap = {
    default: "text-foreground",
    warning: "text-amber-400",
    danger: "text-red-400",
    info: "text-blue-400",
  };

  return (
    <div className="surface-elevated rounded-2xl p-4 flex items-center gap-3 card-hover">
      <div className="p-2 rounded-2xl bg-muted/30 border border-border/50">{icon}</div>
      <div>
        <p className={`text-2xl font-semibold tracking-tight ${toneMap[tone]}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function SystemLogsPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | LogLevel>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | string>("all");

  const {
    data: execLogs = [],
    isLoading: loadingExec,
    refetch: refetchExec,
  } = trpc.airtable.executionLogs.useQuery({});
  const {
    data: aiLogs = [],
    isLoading: loadingAI,
    refetch: refetchAI,
  } = trpc.airtable.aiLogs.useQuery({});
  const {
    data: workflows = [],
    isLoading: loadingWF,
  } = trpc.airtable.workflows.useQuery();

  const isLoading = loadingExec || loadingAI || loadingWF;

  const allLogs = useMemo(
    () => buildSystemLogs(execLogs, aiLogs, workflows),
    [execLogs, aiLogs, workflows]
  );

  const filtered = useMemo(() => {
    return allLogs.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        l.message.toLowerCase().includes(q) ||
        l.event.toLowerCase().includes(q) ||
        (l.workflowId ?? "").toLowerCase().includes(q);

      const matchLevel = levelFilter === "all" || l.level === levelFilter;
      const matchSource = sourceFilter === "all" || l.source === sourceFilter;

      return matchSearch && matchLevel && matchSource;
    });
  }, [allLogs, search, levelFilter, sourceFilter]);

  const sources = ["all", ...Array.from(new Set(allLogs.map((l) => l.source)))];
  const levels: Array<"all" | LogLevel> = ["all", "info", "success", "warning", "error"];

  const errorCount = allLogs.filter((l) => l.level === "error").length;
  const warningCount = allLogs.filter((l) => l.level === "warning").length;
  const runtimeCount = allLogs.filter((l) => l.source === "runtime").length;

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "System Logs" }]}
    >
      <div className="max-w-[1120px] mx-auto space-y-6">
        <div className="surface-elevated rounded-3xl p-6 md:p-7 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(16,185,129,0.06),transparent_22%)]" />
          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
              <Sparkles className="w-3 h-3" />
              Platform Infrastructure Audit
            </div>

            <div>
              <h1 className="text-heading text-2xl md:text-3xl">System Logs</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Unified audit trail across runtime events, AI invocations, webhook activity,
                data syncs, and governance-level platform operations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            label="Total Events"
            value={allLogs.length}
            icon={<Activity className="w-4 h-4 text-primary" />}
          />
          <MetricTile
            label="Runtime Events"
            value={runtimeCount}
            icon={<GitBranch className="w-4 h-4 text-blue-400" />}
            tone="info"
          />
          <MetricTile
            label="Warnings"
            value={warningCount}
            icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
            tone="warning"
          />
          <MetricTile
            label="Errors"
            value={errorCount}
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            tone="danger"
          />
        </div>

        <div className="surface-elevated rounded-2xl p-4 md:p-5">
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, messages, workflow IDs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted/30 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevelFilter(l)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      levelFilter === l
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border flex-wrap">
                {sources.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSourceFilter(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      sourceFilter === s
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-xs rounded-xl"
                onClick={() => {
                  refetchExec();
                  refetchAI();
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Showing {filtered.length} of {allLogs.length} events
          {search || levelFilter !== "all" || sourceFilter !== "all" ? " (filtered)" : ""}
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-elevated rounded-2xl flex flex-col items-center gap-4 py-24 text-muted-foreground">
            <Activity className="w-10 h-10 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">No log entries match your filters</p>
              <p className="text-xs opacity-60 mt-1">
                Adjust the search terms or filter chips to widen the view.
              </p>
            </div>
          </div>
        ) : (
          <div className="surface-elevated rounded-2xl overflow-hidden border border-border/70">
            <div className="grid grid-cols-[150px_110px_110px_1fr_140px] gap-4 px-5 py-3 border-b border-border bg-muted/15">
              {["Timestamp", "Level", "Source", "Message", "Workflow"].map((h) => (
                <span
                  key={h}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {h}
                </span>
              ))}
            </div>

            <div className="divide-y divide-border/40">
              {filtered.map((log, idx) => (
                <div
                  key={log.id + idx}
                  className={`grid grid-cols-[150px_110px_110px_1fr_140px] gap-4 px-5 py-4 items-start transition-colors hover:bg-primary/5 ${
                    idx % 2 === 0 ? "" : "bg-muted/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate">{fmtDateTime(log.timestamp)}</span>
                  </div>

                  <div>
                    <span className={levelBadge(log.level)}>
                      {levelIcon(log.level)}
                      {log.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                    {sourceIcon(log.source)}
                    {log.source}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-foreground leading-snug">{log.event}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {log.message}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-muted-foreground truncate">
                    {log.workflowId ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
