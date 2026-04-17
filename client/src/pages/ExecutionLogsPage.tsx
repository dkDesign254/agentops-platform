import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Filter,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";

function StatusIcon({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "success") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
  if (s === "failed" || s === "error") return <XCircle className="h-3.5 w-3.5 text-red-400" />;
  return <Clock className="h-3.5 w-3.5 text-amber-400" />;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const variants: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${variants[s] ?? "bg-muted/50 text-muted-foreground border-border"}`}
    >
      <StatusIcon status={status} />
      {status}
    </span>
  );
}

function RuntimeBadge({ runtime }: { runtime: string }) {
  const r = runtime.toLowerCase();
  if (r === "make")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
        <Zap className="h-3 w-3" />
        Make
      </span>
    );
  if (r === "n8n")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Zap className="h-3 w-3" />
        n8n
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted/50 text-muted-foreground border border-border">
      {runtime}
    </span>
  );
}

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    "Workflow Created": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Step Completed": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Step Failed": "bg-red-500/10 text-red-400 border-red-500/20",
    "AI Triggered": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Report Generated": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${colors[type] ?? "bg-muted/50 text-muted-foreground border-border"}`}
    >
      {type}
    </span>
  );
}

export default function ExecutionLogsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [runtimeFilter, setRuntimeFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: logs = [], isLoading, refetch } = trpc.airtable.executionLogs.useQuery({});

  const filtered = useMemo(() => {
    let result = [...logs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.stepName.toLowerCase().includes(q) ||
          l.eventType.toLowerCase().includes(q) ||
          l.logId.toLowerCase().includes(q) ||
          (l.message ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((l) => l.status.toLowerCase() === statusFilter);
    if (runtimeFilter !== "all") result = result.filter((l) => l.runtime.toLowerCase() === runtimeFilter);
    if (eventFilter !== "all") result = result.filter((l) => l.eventType === eventFilter);
    result.sort((a, b) => {
      const ta = a.timestamp ?? "";
      const tb = b.timestamp ?? "";
      return sortDir === "desc" ? tb.localeCompare(ta) : ta.localeCompare(tb);
    });
    return result;
  }, [logs, search, statusFilter, runtimeFilter, eventFilter, sortDir]);

  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter((l) => l.status.toLowerCase() === "success").length;
    const failed = logs.filter((l) => ["failed", "error"].includes(l.status.toLowerCase())).length;
    const rate = total > 0 ? Math.round((success / total) * 100) : 0;
    return { total, success, failed, rate };
  }, [logs]);

  const uniqueEventTypes = useMemo(() => Array.from(new Set(logs.map((l) => l.eventType))), [logs]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">Execution Logs</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Central log of every workflow step across all runtimes
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 h-8 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Logs", value: stats.total, color: "text-foreground" },
            { label: "Successful", value: stats.success, color: "text-emerald-400" },
            { label: "Failed", value: stats.failed, color: "text-red-400" },
            { label: "Success Rate", value: `${stats.rate}%`, color: stats.rate >= 80 ? "text-emerald-400" : stats.rate >= 50 ? "text-amber-400" : "text-red-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-card/50 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-card/50 border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search steps, events, messages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm bg-background/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
              <Select value={runtimeFilter} onValueChange={setRuntimeFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Runtime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Runtimes</SelectItem>
                  <SelectItem value="make">Make</SelectItem>
                  <SelectItem value="n8n">n8n</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEventTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                className="h-8 text-xs gap-1"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortDir === "desc" ? "Newest first" : "Oldest first"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Log Table */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
              </CardTitle>
              <CardDescription className="text-xs">
                {logs.length} total logs · sourced from Airtable
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {isLoading ? (
              <div className="flex flex-col gap-2 px-5 pb-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No execution logs found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {search || statusFilter !== "all" || runtimeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Logs will appear here once workflows execute"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5">Log ID</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Step</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Event</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Runtime</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Timestamp</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Message</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log, idx) => (
                      <tr
                        key={log.recordId}
                        className={`border-b border-border/40 hover:bg-muted/20 transition-colors group ${idx % 2 === 0 ? "" : "bg-muted/5"}`}
                      >
                        <td className="px-5 py-3">
                          <code className="text-[11px] font-mono text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded">
                            {log.logId}
                          </code>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs font-medium text-foreground">{log.stepName}</span>
                        </td>
                        <td className="px-3 py-3">
                          <EventTypeBadge type={log.eventType} />
                        </td>
                        <td className="px-3 py-3">
                          <RuntimeBadge runtime={log.runtime} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.timestamp ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 max-w-[240px]">
                          <span className="text-xs text-muted-foreground truncate block">
                            {log.message ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {log.workflowRecordIds[0] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setLocation(`/workflows/${log.workflowRecordIds[0]}`)}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
