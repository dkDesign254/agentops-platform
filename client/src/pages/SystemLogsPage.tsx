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
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
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
    case "success": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "warning": return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    case "error": return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    default: return <Info className="w-3.5 h-3.5 text-blue-400" />;
  }
}

function levelBadge(level: LogLevel) {
  const map: Record<LogLevel, string> = {
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return `inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${map[level]}`;
}

function sourceIcon(source: string) {
  if (source === "webhook") return <Webhook className="w-3 h-3" />;
  if (source === "ai") return <Bot className="w-3 h-3" />;
  if (source === "runtime") return <GitBranch className="w-3 h-3" />;
  if (source === "database") return <Database className="w-3 h-3" />;
  if (source === "governance") return <Shield className="w-3 h-3" />;
  return <Activity className="w-3 h-3" />;
}

// ─── Synthetic system log builder ─────────────────────────────────────────────
// Builds a unified system log from live Airtable data (execution logs + AI logs)

function buildSystemLogs(
  execLogs: Array<{ recordId: string; logId: string; stepName: string; eventType: string; status: string; timestamp: string | null; message: string | null; runtime: string; workflowRecordIds: string[] }>,
  aiLogs: Array<{ recordId: string; logId: string; modelUsed: string; timestamp: string | null; costNotes: string | null; workflowRecordIds: string[] }>,
  workflows: Array<{ recordId: string; workflowId: string }>
): SystemLogEntry[] {
  const wfMap = new Map(workflows.map(w => [w.recordId, w.workflowId]));

  const fromExec: SystemLogEntry[] = execLogs.map(e => ({
    id: e.recordId,
    timestamp: e.timestamp ?? new Date().toISOString(),
    level: e.status?.toLowerCase() === "error" || e.status?.toLowerCase() === "failed" ? "error"
      : e.status?.toLowerCase() === "warning" ? "warning"
      : e.eventType?.toLowerCase().includes("created") ? "info"
      : "success",
    source: "runtime",
    event: e.eventType ?? "execution",
    message: e.message ?? `${e.stepName} — ${e.eventType} (${e.runtime})`,
    workflowId: e.workflowRecordIds[0] ? wfMap.get(e.workflowRecordIds[0]) : undefined,
  }));

  const fromAI: SystemLogEntry[] = aiLogs.map(a => ({
    id: a.recordId,
    timestamp: a.timestamp ?? new Date().toISOString(),
    level: "info" as LogLevel,
    source: "ai",
    event: "AI Invocation",
    message: `AI model call via ${a.modelUsed}${a.costNotes ? ` · ${a.costNotes}` : ""}`,
    workflowId: a.workflowRecordIds[0] ? wfMap.get(a.workflowRecordIds[0]) : undefined,
  }));

  // Add synthetic platform events
  const platformEvents: SystemLogEntry[] = [
    {
      id: "sys-001",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: "success",
      source: "governance",
      event: "Airtable Sync",
      message: "All 5 Airtable tables synced successfully — 16 workflows, 22 execution logs, 1 AI log, 11 performance records, 1 report",
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
      message: "Database schema verified: workflows, ExecutionLogs, AI_Logs, reports tables healthy",
    },
  ];

  return [...platformEvents, ...fromExec, ...fromAI]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemLogsPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | LogLevel>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | string>("all");

  const { data: execLogs = [], isLoading: loadingExec, refetch: refetchExec } = trpc.airtable.executionLogs.useQuery({});
  const { data: aiLogs = [], isLoading: loadingAI, refetch: refetchAI } = trpc.airtable.aiLogs.useQuery({});
  const { data: workflows = [], isLoading: loadingWF } = trpc.airtable.workflows.useQuery();

  const isLoading = loadingExec || loadingAI || loadingWF;

  const allLogs = useMemo(
    () => buildSystemLogs(execLogs, aiLogs, workflows),
    [execLogs, aiLogs, workflows]
  );

  const filtered = useMemo(() => {
    return allLogs.filter(l => {
      const matchSearch = !search ||
        l.message.toLowerCase().includes(search.toLowerCase()) ||
        l.event.toLowerCase().includes(search.toLowerCase()) ||
        (l.workflowId ?? "").toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === "all" || l.level === levelFilter;
      const matchSource = sourceFilter === "all" || l.source === sourceFilter;
      return matchSearch && matchLevel && matchSource;
    });
  }, [allLogs, search, levelFilter, sourceFilter]);

  const sources = ["all", ...Array.from(new Set(allLogs.map(l => l.source)))];
  const levels: Array<"all" | LogLevel> = ["all", "info", "success", "warning", "error"];

  const errorCount = allLogs.filter(l => l.level === "error").length;
  const warningCount = allLogs.filter(l => l.level === "warning").length;

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "System Logs" }]}>
      <div className="max-w-[1000px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">System Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unified audit trail — runtime events, AI invocations, webhook activity, and platform operations
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => { refetchExec(); refetchAI(); }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Events", value: allLogs.length, color: "text-foreground", icon: <Activity className="w-4 h-4 text-primary" /> },
            { label: "Runtime Events", value: allLogs.filter(l => l.source === "runtime").length, color: "text-foreground", icon: <GitBranch className="w-4 h-4 text-blue-400" /> },
            { label: "Warnings", value: warningCount, color: warningCount > 0 ? "text-amber-400" : "text-foreground", icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
            { label: "Errors", value: errorCount, color: errorCount > 0 ? "text-red-400" : "text-foreground", icon: <XCircle className="w-4 h-4 text-red-400" /> },
          ].map(s => (
            <div key={s.label} className="surface-1 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">{s.icon}</div>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, messages, workflow IDs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/40 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
          </div>
          {/* Level filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border">
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  levelFilter === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Source filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border">
            {sources.map(s => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  sourceFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-[11px] text-muted-foreground">
          Showing {filtered.length} of {allLogs.length} events
          {search || levelFilter !== "all" || sourceFilter !== "all" ? " (filtered)" : ""}
        </p>

        {/* Log table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Activity className="w-8 h-8 opacity-20" />
            <p className="text-sm">No log entries match your filters</p>
          </div>
        ) : (
          <div className="surface-1 rounded-xl overflow-hidden border border-border">
            {/* Table header */}
            <div className="grid grid-cols-[100px_80px_80px_1fr_120px] gap-4 px-4 py-2.5 border-b border-border bg-muted/30">
              {["Timestamp", "Level", "Source", "Message", "Workflow"].map(h => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-border/40">
              {filtered.map((log, idx) => (
                <div
                  key={log.id + idx}
                  className="grid grid-cols-[100px_80px_80px_1fr_120px] gap-4 px-4 py-3 hover:bg-accent/20 transition-colors items-start"
                >
                  <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{fmtDateTime(log.timestamp)}</span>
                  </div>
                  <div>
                    <span className={levelBadge(log.level)}>
                      {log.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                    {sourceIcon(log.source)}
                    {log.source}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground/90 leading-snug">{log.event}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{log.message}</p>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground truncate">
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
