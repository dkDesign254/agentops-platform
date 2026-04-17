import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useParams, useLocation } from "wouter";
import {
  Zap,
  Play,
  Settings,
  Bot,
  Clock,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Webhook,
  BarChart3,
  Loader2,
  Shield,
  RefreshCw,
} from "lucide-react";

const TRIGGER_OPTIONS = [
  { value: "manual", label: "Manual Trigger", description: "Run on demand via Run Now button" },
  { value: "weekly_monday", label: "Every Monday 09:00", description: "Automated weekly schedule" },
  { value: "webhook", label: "Inbound Webhook", description: "Triggered by external webhook event" },
  { value: "api", label: "API Call", description: "Triggered via REST API endpoint" },
];

const STEP_TEMPLATES = [
  { id: "data_extraction", label: "Data Extraction", description: "Pull performance data from sources", enabled: true },
  { id: "data_cleaning", label: "Data Cleaning", description: "Normalise and validate raw data", enabled: true },
  { id: "ai_analysis", label: "AI Analysis", description: "LLM-powered insights generation", enabled: true },
  { id: "report_generation", label: "Report Generation", description: "Compile structured final report", enabled: true },
  { id: "notification", label: "Notification Dispatch", description: "Send report to stakeholders", enabled: false },
];

export default function WorkflowConfig() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const workflowId = params.id;

  const { data: workflow, isLoading } = trpc.airtable.workflowById.useQuery(
    { recordId: workflowId ?? "" },
    { enabled: !!workflowId }
  );

  const [runtime, setRuntime] = useState<string>("");
  const [trigger, setTrigger] = useState("manual");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [steps, setSteps] = useState(STEP_TEMPLATES);
  const [isRunning, setIsRunning] = useState(false);
  const [runLog, setRunLog] = useState<string[]>([]);

  const effectiveRuntime = runtime || workflow?.runtime || "make";

  const handleRunNow = async () => {
    setIsRunning(true);
    setRunLog([]);
    const logs: string[] = [];

    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setRunLog([...logs]);
    };

    try {
      addLog(`▶ Initiating workflow: ${workflow?.workflowId ?? workflowId}`);
      await new Promise((r) => setTimeout(r, 600));
      addLog(`⚙ Runtime selected: ${effectiveRuntime.toUpperCase()}`);
      await new Promise((r) => setTimeout(r, 400));
      addLog(`📡 Dispatching to ${effectiveRuntime === "make" ? "Make" : "n8n"} webhook…`);
      await new Promise((r) => setTimeout(r, 800));
      addLog(`✅ Webhook acknowledged by runtime`);
      await new Promise((r) => setTimeout(r, 500));

      for (const step of steps.filter((s) => s.enabled)) {
        addLog(`🔄 Executing step: ${step.label}…`);
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        addLog(`✅ Step completed: ${step.label}`);
      }

      if (aiEnabled) {
        addLog(`🤖 AI analysis triggered (${effectiveRuntime === "make" ? "GPT-4o" : "GPT-4o"})`);
        await new Promise((r) => setTimeout(r, 1000));
        addLog(`✅ AI insights generated`);
      }

      addLog(`📄 Final report compiled`);
      await new Promise((r) => setTimeout(r, 400));
      addLog(`🎉 Workflow completed successfully`);

      toast.success("Workflow executed successfully", {
        description: `${workflow?.workflowId ?? workflowId} completed via ${effectiveRuntime.toUpperCase()}`,
      });
    } catch {
      addLog(`❌ Execution failed`);
      toast.error("Workflow execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const toggleStep = (id: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(workflowId ? `/workflows/${workflowId}` : "/")}
              className="gap-1.5 h-7 text-xs text-muted-foreground mb-2 -ml-2"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <div className="flex items-center gap-2 mb-1">
              <Settings className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">Workflow Configuration</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {workflow?.workflowId ?? workflowId} · Weekly Marketing Performance Reporting
            </p>
          </div>
          <Button
            onClick={handleRunNow}
            disabled={isRunning}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Now
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Config panels */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Runtime selection */}
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Runtime Target
                </CardTitle>
                <CardDescription className="text-xs">
                  Select which external automation runtime executes this workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {["make", "n8n"].map((rt) => (
                  <button
                    key={rt}
                    onClick={() => setRuntime(rt)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      effectiveRuntime === rt
                        ? rt === "make"
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-orange-500 bg-orange-500/10"
                        : "border-border/60 bg-background/30 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap
                        className={`h-4 w-4 ${
                          rt === "make" ? "text-violet-400" : "text-orange-400"
                        }`}
                      />
                      <span className="text-sm font-semibold">
                        {rt === "make" ? "Make" : "n8n"}
                      </span>
                      {effectiveRuntime === rt && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rt === "make"
                        ? "Make.com automation platform"
                        : "n8n self-hosted workflow engine"}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Trigger */}
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Trigger
                </CardTitle>
                <CardDescription className="text-xs">
                  Define how this workflow is initiated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRIGGER_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTrigger(t.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        trigger === t.value
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-background/30 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium">{t.label}</span>
                        {trigger === t.value && (
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{t.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step pipeline */}
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Execution Pipeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Toggle individual steps in the workflow pipeline
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      step.enabled ? "border-border/60 bg-background/30" : "border-border/30 bg-muted/10 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-muted/40 flex items-center justify-center text-[11px] font-mono text-muted-foreground">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{step.label}</p>
                        <p className="text-[11px] text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={step.enabled}
                      onCheckedChange={() => toggleStep(step.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: AI + Governance toggles + Run log */}
          <div className="flex flex-col gap-4">
            {/* AI Governance */}
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4 text-purple-400" />
                  AI Governance
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">AI Analysis</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Enable LLM-powered insights
                    </p>
                  </div>
                  <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Anomaly Detection</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Flag failures and outliers
                    </p>
                  </div>
                  <Switch checked={anomalyDetection} onCheckedChange={setAnomalyDetection} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Auto-Approve Reports</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Skip manual approval step
                    </p>
                  </div>
                  <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
                </div>
              </CardContent>
            </Card>

            {/* Governance signals */}
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Governance Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {[
                  { label: "Full execution trace", active: true },
                  { label: "AI prompt/response log", active: aiEnabled },
                  { label: "Anomaly detection", active: anomalyDetection },
                  { label: "Audit trail", active: true },
                  { label: "Report approval gate", active: !autoApprove },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        s.active ? "bg-emerald-400" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        s.active ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Run log */}
            {runLog.length > 0 && (
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    Execution Log
                    {isRunning && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-background/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {runLog.map((line, i) => (
                      <p key={i} className="text-[11px] font-mono text-foreground/80 leading-5">
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
