import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Settings,
  Shield,
  Sparkles,
  Terminal,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

function fmtDateTime(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmtTime(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function copyText(text: string, label = "Copied") {
  navigator.clipboard.writeText(text).catch(() => {});
  toast.success(label);
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "";
  const cfg: Record<string, { cls: string; dot: string }> = {
    completed: {
      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    running: {
      cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      dot: "bg-blue-400",
    },
    failed: {
      cls: "bg-red-500/10 text-red-400 border-red-500/20",
      dot: "bg-red-400",
    },
    pending: {
      cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    success: {
      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    error: {
      cls: "bg-red-500/10 text-red-400 border-red-500/20",
      dot: "bg-red-400",
    },
  };

  const c = cfg[s] ?? {
    cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dot: "bg-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${c.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function RuntimeBadge({ runtime }: { runtime: string }) {
  const r = runtime?.toLowerCase() ?? "";

  if (r === "make") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
        <Zap className="w-3 h-3" />
        Make
      </span>
    );
  }

  if (r === "n8n") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Zap className="w-3 h-3" />
        n8n
      </span>
    );
  }

  return <span className="text-xs text-muted-foreground">{runtime}</span>;
}

function KpiTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const toneMap = {
    default: "text-foreground",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
    info: "text-blue-400",
  };

  return (
    <div className="surface-elevated rounded-2xl p-4 card-hover">
      <p className={`text-2xl font-semibold tracking-tight ${toneMap[tone]}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function ExecutionTimeline({ recordId }: { recordId: string }) {
  const { data: logs, isLoading } = trpc.airtable.executionLogs.useQuery(
    { workflowRecordId: recordId },
    { refetchInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="skeleton h-4 rounded w-1/3" />
              <div className="skeleton h-3 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="surface-elevated rounded-2xl flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <Activity className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">No execution logs found</p>
        <p className="text-xs opacity-60">
          Logs appear here once the workflow executes steps via Make or n8n.
        </p>
      </div>
    );
  }

  const errors = logs.filter((l) =>
    ["error", "failed", "failure"].includes(l.status?.toLowerCase() ?? "")
  );

  return (
    <div className="space-y-5">
      {errors.length > 0 && (
        <div className="surface-elevated rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-sm font-semibold text-red-400">
              {errors.length} Error{errors.length > 1 ? "s" : ""} Detected
            </p>
          </div>

          <div className="space-y-2">
            {errors.map((e) => (
              <div key={e.recordId} className="flex items-start gap-2">
                <span className="code-inline mt-0.5">{e.stepName}</span>
                <span className="text-xs text-red-300/80 leading-relaxed">
                  {e.message ?? "No error message"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="surface-elevated rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Execution Timeline</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Full ordered trace of workflow runtime activity
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground">{logs.length} events</span>
        </div>

        <div className="relative pt-2">
          <div className="absolute left-[18px] top-6 bottom-6 w-px bg-border" />
          <div className="space-y-0">
            {logs.map((log, idx) => {
              const isError = ["error", "failed", "failure"].includes(
                log.status?.toLowerCase() ?? ""
              );
              const isSuccess = ["success", "completed"].includes(
                log.status?.toLowerCase() ?? ""
              );

              return (
                <div
                  key={log.recordId}
                  className="relative flex gap-4 pb-5 last:pb-0 animate-in"
                  style={{ animationDelay: `${idx * 25}ms` }}
                >
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      isError
                        ? "bg-red-500/10 border-red-500/30"
                        : isSuccess
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-muted border-border"
                    }`}
                  >
                    {isError ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pb-5 last:pb-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {log.stepName}
                        </span>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
                          {log.eventType}
                        </span>
                        <StatusBadge status={log.status} />
                      </div>

                      <span className="text-[11px] text-muted-foreground whitespace-nowrap font-mono shrink-0">
                        {fmtTime(log.timestamp)}
                      </span>
                    </div>

                    {log.message && (
                      <div
                        className={`mt-2 p-3 rounded-2xl text-xs font-mono leading-relaxed border ${
                          isError
                            ? "bg-red-500/5 border-red-500/15 text-red-300"
                            : "bg-muted/30 border-border/50 text-muted-foreground"
                        }`}
                      >
                        {log.message}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-muted-foreground/50 font-mono">
                        {log.logId}
                      </span>
                      {log.runtime && (
                        <span className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          {log.runtime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AITrace({ recordId }: { recordId: string }) {
  const { data: logs, isLoading } = trpc.airtable.aiLogs.useQuery(
    { workflowRecordId: recordId },
    { refetchInterval: 30000 }
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="surface-elevated rounded-2xl flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <Bot className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">No AI interactions found</p>
        <p className="text-xs opacity-60">
          AI prompt and response pairs appear here after report generation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {logs.map((log, idx) => {
        const isOpen = expanded[log.recordId] ?? false;

        return (
          <div
            key={log.recordId}
            className="surface-elevated rounded-2xl overflow-hidden animate-in"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-accent/20 transition-colors text-left"
              onClick={() => setExpanded((e) => ({ ...e, [log.recordId]: !isOpen }))}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-primary/10 ring-1 ring-primary/10">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{log.logId}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="code-inline">{log.modelUsed}</span>
                    {log.costNotes && (
                      <span className="text-[11px] text-amber-400/80">{log.costNotes}</span>
                    )}
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {fmtDateTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-border">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Prompt
                    </span>
                    <button
                      onClick={() => copyText(log.promptText, "Prompt copied")}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="code-block text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {log.promptText || "—"}
                  </pre>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Response
                    </span>
                    <button
                      onClick={() => copyText(log.responseText, "Response copied")}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="code-block text-[11px] whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {log.responseText || "—"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PerformanceTab({ recordId }: { recordId: string }) {
  const { data, isLoading } = trpc.airtable.performanceData.useQuery(
    { workflowRecordId: recordId },
    { refetchInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="surface-elevated rounded-2xl flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <TrendingUp className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">No performance data linked</p>
        <p className="text-xs opacity-60">
          Campaign metrics appear here when linked in Airtable.
        </p>
      </div>
    );
  }

  const totals = data.reduce(
    (acc, d) => ({
      impressions: acc.impressions + d.impressions,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
      spend: acc.spend + d.spend,
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
  );

  const ctr =
    totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-5 pt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Total Impressions" value={totals.impressions.toLocaleString()} tone="info" />
        <KpiTile label="Total Clicks" value={totals.clicks.toLocaleString()} />
        <KpiTile label="Click-Through Rate" value={`${ctr}%`} tone="success" />
        <KpiTile label="Total Spend" value={`$${totals.spend.toLocaleString()}`} tone="warning" />
      </div>

      <div className="surface-elevated rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Campaign Breakdown</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Performance data linked to this workflow
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{data.length} campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/15">
                {[
                  "Campaign Name",
                  "Reporting Period",
                  "Impressions",
                  "Clicks",
                  "Click-Through Rate",
                  "Conversions",
                  "Spend (USD)",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((d, i) => {
                const rowCtr =
                  d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : "0.00";

                return (
                  <tr
                    key={d.recordId}
                    className={`border-b border-border/40 last:border-0 ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{d.campaignName}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {d.reportingPeriod ?? "—"}
                    </td>
                    <td className="px-4 py-3">{d.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3">{d.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{rowCtr}%</td>
                    <td className="px-4 py-3">{d.conversions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-amber-400">${d.spend.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportTab({ recordId }: { recordId: string }) {
  const { data: reports, isLoading, refetch } = trpc.airtable.finalReports.useQuery(
    { workflowRecordId: recordId },
    { refetchInterval: 30000 }
  );

  const approveReport = trpc.airtable.approveReport.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Report approved");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="surface-elevated rounded-2xl flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <FileText className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">No final report generated yet</p>
        <p className="text-xs opacity-60">
          The AI report appears here after workflow completion.
        </p>
      </div>
    );
  }

  const report = reports[0];

  const sections = [
    {
      label: "Executive Summary",
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      content: report.executiveSummary,
      border: "border-primary/20",
      bg: "bg-primary/5",
    },
    {
      label: "Key Insights",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      content: report.keyInsights,
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
    },
    {
      label: "Risks & Anomalies",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      content: report.risksOrAnomalies,
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
    },
    {
      label: "Recommendations",
      icon: <Shield className="w-4 h-4 text-blue-400" />,
      content: report.recommendation,
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
    },
  ];

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `report-${report.reportId}.json`;
    a.click();
  };

  return (
    <div className="space-y-5 pt-2">
      <div className="surface-elevated rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="code-inline">{report.reportId}</span>
              {report.approved ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-3 h-3" />
                  Pending Approval
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {fmtDateTime(report.reportTimestamp)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 bg-transparent rounded-xl"
              onClick={exportJSON}
            >
              <ExternalLink className="w-3 h-3" />
              Export JSON
            </Button>

            {!report.approved && (
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90"
                onClick={() => approveReport.mutate({ recordId: report.recordId })}
                disabled={approveReport.isPending}
              >
                {approveReport.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                Approve Report
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((sec, i) => (
          <div
            key={sec.label}
            className={`surface-elevated rounded-2xl border ${sec.border} ${sec.bg} p-5 animate-in`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-2 mb-3">
              {sec.icon}
              <h3 className="text-sm font-semibold text-foreground">{sec.label}</h3>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {sec.content || (
                <span className="text-muted-foreground italic">No content available</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditTrail({
  workflow,
}: {
  workflow: {
    workflowId: string;
    name: string;
    runtime: string;
    status: string;
    requestedBy: string;
    dateRequested: string | null;
    dateCompleted: string | null;
    reportPeriod: string | null;
    notes: string | null;
  };
}) {
  const events = [
    {
      time: workflow.dateRequested,
      label: "Workflow Created",
      desc: `Requested by ${workflow.requestedBy}`,
      icon: <Activity className="w-3.5 h-3.5 text-blue-400" />,
      cls: "border-blue-500/30 bg-blue-500/8",
    },
    {
      time: workflow.dateRequested,
      label: "Runtime Routed",
      desc: `Dispatched to ${workflow.runtime}`,
      icon: <Zap className="w-3.5 h-3.5 text-violet-400" />,
      cls: "border-violet-500/30 bg-violet-500/8",
    },
    {
      time: workflow.dateRequested,
      label: "Execution Started",
      desc: "Workflow execution began on external runtime",
      icon: <Terminal className="w-3.5 h-3.5 text-amber-400" />,
      cls: "border-amber-500/30 bg-amber-500/8",
    },
    ...(workflow.dateCompleted
      ? [
          {
            time: workflow.dateCompleted,
            label: "Execution Completed",
            desc: "All steps logged centrally",
            icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
            cls: "border-emerald-500/30 bg-emerald-500/8",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5 pt-2">
      <div className="surface-elevated rounded-2xl p-5">
        <p className="text-sm font-semibold mb-5 flex items-center gap-2 text-foreground">
          <Shield className="w-4 h-4 text-primary" />
          Full Audit Trail
        </p>

        <div className="relative">
          <div className="absolute left-[18px] top-4 bottom-4 w-px bg-border" />
          <div className="space-y-4">
            {events.map((ev, i) => (
              <div
                key={i}
                className="flex gap-4 animate-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${ev.cls}`}
                >
                  {ev.icon}
                </div>

                <div className="flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{ev.label}</p>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {fmtDateTime(ev.time)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-elevated rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4 text-foreground">Workflow Metadata</p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {[
            { label: "Workflow ID", value: workflow.workflowId },
            { label: "Workflow Type", value: workflow.name },
            { label: "Runtime", value: workflow.runtime },
            { label: "Status", value: workflow.status },
            { label: "Requested By", value: workflow.requestedBy },
            { label: "Report Period", value: workflow.reportPeriod ?? "—" },
            { label: "Date Requested", value: fmtDateTime(workflow.dateRequested) },
            { label: "Date Completed", value: fmtDateTime(workflow.dateCompleted) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.16em] mb-1">
                {item.label}
              </p>
              <p className="text-xs font-medium font-mono text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        {workflow.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.16em] mb-1">
              Notes
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">{workflow.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AIExplainPanel({
  workflow,
  onClose,
}: {
  workflow: {
    workflowId: string;
    name: string;
    runtime: string;
    status: string;
    requestedBy: string;
    dateRequested: string | null;
    reportPeriod: string | null;
    notes: string | null;
  };
  onClose: () => void;
}) {
  const [context, setContext] = useState<"overview" | "errors" | "performance">(
    "overview"
  );
  const explain = trpc.intelligence.explainWorkflow.useMutation();

  const handleExplain = () => {
    explain.mutate({
      workflowId: workflow.workflowId,
      workflowName: workflow.name,
      runtime: workflow.runtime,
      status: workflow.status,
      context,
    });
  };

  return (
    <div className="surface-elevated rounded-2xl border border-primary/20 p-5 animate-in glow-primary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Governance Explain</p>
            <p className="text-xs text-muted-foreground">
              AI-powered workflow analysis
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["overview", "errors", "performance"] as const).map((ctx) => (
          <button
            key={ctx}
            onClick={() => setContext(ctx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
              context === ctx
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {ctx}
          </button>
        ))}
      </div>

      {explain.data ? (
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {typeof explain.data.explanation === "string"
              ? explain.data.explanation
              : JSON.stringify(explain.data.explanation)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-3 font-mono">
            Context: {explain.data.context}
          </p>
        </div>
      ) : (
        <div className="bg-muted/20 rounded-2xl p-4 border border-border/40 text-center">
          <p className="text-xs text-muted-foreground mb-3">
            Select a context and click Explain to get an AI-powered governance
            analysis of this workflow.
          </p>
          <button
            onClick={handleExplain}
            disabled={explain.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {explain.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {explain.isPending ? "Analysing…" : "Explain Workflow"}
          </button>
        </div>
      )}

      {explain.data && (
        <button
          onClick={() => {
            explain.reset();
          }}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Run again
        </button>
      )}
    </div>
  );
}

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("timeline");
  const [showExplain, setShowExplain] = useState(false);

  const { data: workflow, isLoading } = trpc.airtable.workflowById.useQuery(
    { recordId: id ?? "" },
    { enabled: !!id, refetchInterval: 30000 }
  );

  if (isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Loading…" }]}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="skeleton h-10 rounded w-1/3" />
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!workflow) {
    return (
      <DashboardLayout
        breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Not Found" }]}
      >
        <div className="surface-elevated rounded-2xl flex flex-col items-center gap-4 py-24 text-muted-foreground">
          <AlertTriangle className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">Workflow not found</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: workflow.workflowId }]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="surface-elevated rounded-3xl p-6 md:p-7 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(16,185,129,0.06),transparent_22%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="space-y-4">
              <button
                onClick={() => setLocation("/")}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-heading text-2xl md:text-3xl">{workflow.workflowId}</h1>
                  <StatusBadge status={workflow.status} />
                  <RuntimeBadge runtime={workflow.runtime} />
                </div>

                <p className="text-sm text-foreground/85">{workflow.name}</p>
                <p className="text-xs text-muted-foreground">
                  Requested by{" "}
                  <span className="text-foreground font-medium">
                    {workflow.requestedBy}
                  </span>
                  {workflow.reportPeriod && (
                    <>
                      {" "}
                      · <span className="font-mono">{workflow.reportPeriod}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiTile label="Status" value={workflow.status} tone={
                  workflow.status.toLowerCase() === "completed"
                    ? "success"
                    : workflow.status.toLowerCase() === "failed"
                    ? "danger"
                    : workflow.status.toLowerCase() === "running"
                    ? "info"
                    : "warning"
                } />
                <KpiTile label="Runtime" value={workflow.runtime.toUpperCase()} />
                <KpiTile label="Requested" value={fmtDateTime(workflow.dateRequested)} />
                <KpiTile label="Completed" value={fmtDateTime(workflow.dateCompleted)} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className={`h-9 text-xs gap-1.5 shrink-0 rounded-xl transition-all ${
                  showExplain
                    ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                    : "bg-transparent"
                }`}
                onClick={() => setShowExplain(!showExplain)}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {showExplain ? "Hide AI Explain" : "AI Explain"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5 bg-transparent shrink-0 rounded-xl"
                onClick={() => setLocation(`/workflows/${id}/config`)}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </div>
          </div>
        </div>

        {showExplain && workflow && (
          <AIExplainPanel workflow={workflow} onClose={() => setShowExplain(false)} />
        )}

        <div className="surface-elevated rounded-2xl p-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/30 border border-border h-10 rounded-xl flex flex-wrap">
              <TabsTrigger value="timeline" className="text-xs h-8 gap-1.5 rounded-lg">
                <Activity className="w-3.5 h-3.5" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs h-8 gap-1.5 rounded-lg">
                <Bot className="w-3.5 h-3.5" />
                AI Trace
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="text-xs h-8 gap-1.5 rounded-lg"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="report" className="text-xs h-8 gap-1.5 rounded-lg">
                <FileText className="w-3.5 h-3.5" />
                Final Report
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs h-8 gap-1.5 rounded-lg">
                <Shield className="w-3.5 h-3.5" />
                Audit Trail
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-5">
              <ExecutionTimeline recordId={id ?? ""} />
            </TabsContent>

            <TabsContent value="ai" className="mt-5">
              <AITrace recordId={id ?? ""} />
            </TabsContent>

            <TabsContent value="performance" className="mt-5">
              <PerformanceTab recordId={id ?? ""} />
            </TabsContent>

            <TabsContent value="report" className="mt-5">
              <ReportTab recordId={id ?? ""} />
            </TabsContent>

            <TabsContent value="audit" className="mt-5">
              <AuditTrail workflow={workflow} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
