import DashboardLayout from "@/components/DashboardLayout";
import {
  EventTypeBadge,
  LogStatusIcon,
  RuntimeBadge,
  SectionHeader,
  StatusBadge,
} from "@/components/AgentOpsUI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Terminal,
  XCircle,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { Streamdown } from "streamdown";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function WorkflowDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const workflowId = params.id;

  const { data: workflow, isLoading: wfLoading } = trpc.workflows.getById.useQuery({
    id: workflowId,
  });
  const { data: execLogs, isLoading: logsLoading } = trpc.logs.executionLogs.useQuery({
    workflowId,
  });
  const { data: aiLogs, isLoading: aiLoading } = trpc.logs.aiLogs.useQuery({
    workflowId,
  });
  const { data: report, isLoading: reportLoading } = trpc.workflows.getReport.useQuery({
    workflowId,
  });

  if (wfLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!workflow) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <XCircle className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Workflow not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const failedLogs = execLogs?.filter((l) => l.status === "failure") ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back + header */}
        <div>
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                {workflow.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {workflow.id}
                </code>
                <StatusBadge status={workflow.status} />
                <RuntimeBadge runtime={workflow.runtime} />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Requested By",
              value: workflow.requestedBy,
              icon: <Activity className="w-3.5 h-3.5" />,
            },
            {
              label: "Created",
              value: formatDate(workflow.createdAt),
              icon: <Clock className="w-3.5 h-3.5" />,
            },
            {
              label: "Completed",
              value: workflow.completedAt ? formatDate(workflow.completedAt) : "—",
              icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            },
            {
              label: "Errors",
              value: failedLogs.length === 0 ? "None" : `${failedLogs.length} error(s)`,
              icon: <XCircle className="w-3.5 h-3.5" />,
              error: failedLogs.length > 0,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-4 ${
                item.error
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-border bg-card"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs mb-1.5 ${
                  item.error ? "text-red-400" : "text-muted-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </div>
              <p
                className={`text-sm font-medium ${
                  item.error ? "text-red-400" : "text-foreground"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="execution">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="execution" className="gap-2 text-xs">
              <Terminal className="w-3.5 h-3.5" />
              Execution Logs
              {execLogs && (
                <span className="ml-1 bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {execLogs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 text-xs">
              <Bot className="w-3.5 h-3.5" />
              AI Logs
              {aiLogs && (
                <span className="ml-1 bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {aiLogs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Report
            </TabsTrigger>
          </TabsList>

          {/* ── Execution Logs ── */}
          <TabsContent value="execution" className="mt-4">
            <SectionHeader
              title="Execution Logs"
              description="Central audit trail of every workflow step"
            />
            {logsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !execLogs || execLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No execution logs found.
              </p>
            ) : (
              <div className="space-y-1">
                {execLogs.map((log, idx) => (
                  <div
                    key={log.id}
                    className={`relative flex gap-4 p-4 rounded-xl border transition-colors ${
                      log.status === "failure"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-border bg-card hover:bg-accent/20"
                    }`}
                  >
                    {/* Timeline connector */}
                    {idx < execLogs.length - 1 && (
                      <div className="absolute left-[23px] top-[52px] bottom-[-5px] w-px bg-border z-0" />
                    )}
                    <div className="shrink-0 z-10">
                      <LogStatusIcon status={log.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {log.step}
                          </span>
                          <EventTypeBadge eventType={log.eventType} />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {formatShortDate(log.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1.5 leading-relaxed ${
                          log.status === "failure"
                            ? "text-red-300"
                            : "text-muted-foreground"
                        }`}
                      >
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── AI Logs ── */}
          <TabsContent value="ai" className="mt-4">
            <SectionHeader
              title="AI Interaction Logs"
              description="Full audit of every LLM prompt and response"
            />
            {aiLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !aiLogs || aiLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No AI interactions logged for this workflow.
              </p>
            ) : (
              <div className="space-y-4">
                {aiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span className="text-xs font-medium text-foreground">
                          AI Interaction
                        </span>
                        <code className="text-xs bg-fuchsia-500/10 text-fuchsia-400 px-1.5 py-0.5 rounded">
                          {log.model}
                        </code>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>

                    {/* Prompt */}
                    <div className="p-4 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Prompt
                      </p>
                      <pre className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed font-mono bg-muted/30 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {log.prompt}
                      </pre>
                    </div>

                    {/* Response */}
                    <div className="p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Response
                      </p>
                      <div className="text-xs text-foreground/80 bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto">
                        <Streamdown>{log.response}</Streamdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Report ── */}
          <TabsContent value="report" className="mt-4">
            <SectionHeader
              title="AI-Generated Marketing Report"
              description="Structured performance analysis produced by the LLM"
            />
            {reportLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !report ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No report generated for this workflow.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Report meta */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" />
                  Generated on {formatDate(report.createdAt)}
                </div>

                {/* Four sections */}
                {[
                  {
                    key: "summary",
                    label: "Executive Summary",
                    content: report.summary,
                    color: "border-blue-500/20 bg-blue-500/5",
                    dot: "bg-blue-400",
                  },
                  {
                    key: "insights",
                    label: "Key Insights",
                    content: report.insights,
                    color: "border-emerald-500/20 bg-emerald-500/5",
                    dot: "bg-emerald-400",
                  },
                  {
                    key: "risks",
                    label: "Identified Risks",
                    content: report.risks,
                    color: "border-red-500/20 bg-red-500/5",
                    dot: "bg-red-400",
                  },
                  {
                    key: "recommendation",
                    label: "Recommendations",
                    content: report.recommendation,
                    color: "border-amber-500/20 bg-amber-500/5",
                    dot: "bg-amber-400",
                  },
                ].map((section) => (
                  <div
                    key={section.key}
                    className={`rounded-xl border p-5 ${section.color}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${section.dot}`} />
                      <h3 className="text-sm font-semibold text-foreground">
                        {section.label}
                      </h3>
                    </div>
                    <div className="text-sm text-foreground/80 leading-relaxed">
                      <Streamdown>{section.content}</Streamdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
