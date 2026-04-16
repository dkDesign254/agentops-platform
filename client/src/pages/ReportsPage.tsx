import DashboardLayout from "@/components/DashboardLayout";
import { SectionHeader } from "@/components/AgentOpsUI";
import { trpc } from "@/lib/trpc";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportCard({ report }: { report: {
  id: number;
  workflowId: string;
  summary: string;
  insights: string;
  risks: string;
  recommendation: string;
  createdAt: Date;
}}) {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/20 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Weekly Marketing Performance Report
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <code
                className="text-xs font-mono text-primary/70 hover:text-primary cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/workflows/${report.workflowId}`);
                }}
              >
                {report.workflowId}
              </code>
              <span className="text-xs text-muted-foreground">
                {formatDate(report.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Summary preview */}
          <div className="px-5 py-4 border-b border-border bg-blue-500/5">
            <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2">
              Executive Summary
            </p>
            <div className="text-sm text-foreground/80 leading-relaxed">
              <Streamdown>{report.summary}</Streamdown>
            </div>
          </div>

          {/* Grid: insights + risks */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="px-5 py-4 bg-emerald-500/5">
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">
                Key Insights
              </p>
              <div className="text-sm text-foreground/80 leading-relaxed">
                <Streamdown>{report.insights}</Streamdown>
              </div>
            </div>
            <div className="px-5 py-4 bg-red-500/5">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
                Identified Risks
              </p>
              <div className="text-sm text-foreground/80 leading-relaxed">
                <Streamdown>{report.risks}</Streamdown>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="px-5 py-4 border-t border-border bg-amber-500/5">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
              Recommendations
            </p>
            <div className="text-sm text-foreground/80 leading-relaxed">
              <Streamdown>{report.recommendation}</Streamdown>
            </div>
          </div>

          {/* Footer action */}
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <button
              onClick={() => setLocation(`/workflows/${report.workflowId}`)}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View full audit trail
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { data: reports, isLoading } = trpc.logs.allReports.useQuery();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated Weekly Marketing Performance Reports — structured with summary, insights, risks, and recommendations
          </p>
        </div>

        <SectionHeader
          title={`${reports?.length ?? 0} Report${reports?.length !== 1 ? "s" : ""}`}
          description="Click any report to expand the full structured output"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-accent text-muted-foreground">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No reports yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Execute a workflow to generate your first AI-powered marketing report.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
