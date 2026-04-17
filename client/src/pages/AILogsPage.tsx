import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bot,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Cpu,
  MessageSquare,
  Sparkles,
  DollarSign,
  Clock,
} from "lucide-react";

interface AILogCardProps {
  log: {
    recordId: string;
    logId: string;
    workflowRecordIds: string[];
    promptText: string;
    responseText: string;
    modelUsed: string;
    timestamp: string | null;
    costNotes: string | null;
  };
}

function AILogCard({ log }: AILogCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-card/50 border-border/60 hover:border-border transition-colors">
      <CardContent className="p-0">
        {/* Header row */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-3.5 cursor-pointer select-none"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <code className="text-[11px] font-mono text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded">
                  {log.logId}
                </code>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Cpu className="h-3 w-3" />
                  {log.modelUsed}
                </span>
                {log.costNotes && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted/50 text-muted-foreground border border-border">
                    <DollarSign className="h-3 w-3" />
                    {log.costNotes}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[500px]">
                {log.promptText.slice(0, 120)}{log.promptText.length > 120 ? "…" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {log.timestamp && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                <Clock className="h-3 w-3" />
                {log.timestamp}
              </span>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Expanded trace */}
        {expanded && (
          <div className="border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Prompt */}
            <div className="p-5 border-r border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Prompt</span>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4">
                <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                  {log.promptText || "—"}
                </pre>
              </div>
            </div>
            {/* Response */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Response</span>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-4">
                <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                  {log.responseText || "—"}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AILogsPage() {
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: logs = [], isLoading, refetch } = trpc.airtable.aiLogs.useQuery({});

  const uniqueModels = useMemo(() => Array.from(new Set(logs.map((l) => l.modelUsed))), [logs]);

  const filtered = useMemo(() => {
    let result = [...logs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.logId.toLowerCase().includes(q) ||
          l.promptText.toLowerCase().includes(q) ||
          l.responseText.toLowerCase().includes(q) ||
          l.modelUsed.toLowerCase().includes(q)
      );
    }
    if (modelFilter !== "all") result = result.filter((l) => l.modelUsed === modelFilter);
    result.sort((a, b) => {
      const ta = a.timestamp ?? "";
      const tb = b.timestamp ?? "";
      return sortDir === "desc" ? tb.localeCompare(ta) : ta.localeCompare(tb);
    });
    return result;
  }, [logs, search, modelFilter, sortDir]);

  const stats = useMemo(() => {
    const total = logs.length;
    const models = Array.from(new Set(logs.map((l) => l.modelUsed)));
    const withCost = logs.filter((l) => l.costNotes).length;
    return { total, models: models.length, withCost };
  }, [logs]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-5 w-5 text-purple-400" />
              <h1 className="text-xl font-semibold tracking-tight">AI Interaction Logs</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Full audit trail of every AI prompt and response — complete traceability
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 h-8 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total AI Calls", value: stats.total, icon: Bot, color: "text-purple-400" },
            { label: "Models Used", value: stats.models, icon: Cpu, color: "text-blue-400" },
            { label: "With Cost Notes", value: stats.withCost, icon: DollarSign, color: "text-amber-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-card/50 border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
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
                  placeholder="Search prompts, responses, model names…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm bg-background/50"
                />
              </div>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="h-8 w-[180px] text-xs">
                  <Cpu className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {uniqueModels.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
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

        {/* Governance notice */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
          <Sparkles className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-purple-300">AI Governance Audit Trail</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every AI interaction is logged immutably. Click any entry to expand the full prompt and response for compliance review.
            </p>
          </div>
        </div>

        {/* Log list */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {logs.length} interactions
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="bg-card/50 border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bot className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No AI interactions found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {search || modelFilter !== "all"
                    ? "Try adjusting your filters"
                    : "AI interactions will appear here once workflows run"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((log) => <AILogCard key={log.recordId} log={log} />)
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
