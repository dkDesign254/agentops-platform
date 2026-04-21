import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  Key,
  Loader2,
  Send,
  Terminal,
  Webhook,
  XCircle,
  Zap,
  Activity,
  Shield,
  Sparkles,
  ChevronRight,
  Clock,
  BarChart3,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SimResult = {
  ok: boolean;
  status: number;
  body: unknown;
  runtime: string;
  timestamp: string;
};

function RuntimeBadge({ runtime }: { runtime: string }) {
  const isMake = runtime === "make";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
        isMake
          ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
          : "bg-orange-500/10 text-orange-400 border-orange-500/20"
      }`}
    >
      <Zap className="w-3 h-3" />
      {isMake ? "Make" : "n8n"}
    </span>
  );
}

function StatTile({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: "default" | "success" | "danger" | "info";
}) {
  const toneMap = {
    default: "text-foreground",
    success: "text-emerald-400",
    danger: "text-red-400",
    info: "text-blue-400",
  };

  return (
    <div className="surface-elevated rounded-2xl p-4 card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-2xl bg-muted/30 border border-border/50">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold tracking-tight ${toneMap[tone]}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function WebhookSimulator() {
  const { data: workflows } = trpc.workflows.list.useQuery();

  const [runtime, setRuntime] = useState<"make" | "n8n">("make");
  const [workflowId, setWorkflowId] = useState("");
  const [step, setStep] = useState("Data Collection");
  const [eventType, setEventType] = useState("execution");
  const [status, setStatus] = useState<"success" | "failure">("success");
  const [message, setMessage] = useState(
    "Step completed successfully by external runtime."
  );
  const [makeApiKey, setMakeApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimResult[]>([]);

  const successCount = useMemo(
    () => results.filter((r) => r.ok).length,
    [results]
  );
  const failedCount = useMemo(
    () => results.filter((r) => !r.ok).length,
    [results]
  );

  const latestResult = results[0];

  const handleSend = async () => {
    if (!workflowId.trim()) {
      toast.error("Please select or enter a Workflow ID.");
      return;
    }

    setLoading(true);
    const endpoint = `/api/webhooks/${runtime}`;
    const payload = {
      workflowId: workflowId.trim(),
      step,
      eventType,
      status,
      message,
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (runtime === "make" && makeApiKey.trim()) {
        headers["x-make-apikey"] = makeApiKey.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      const result: SimResult = {
        ok: res.ok,
        status: res.status,
        body,
        runtime,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResults((prev) => [result, ...prev]);

      if (res.ok) {
        toast.success(`Webhook delivered to ${runtime.toUpperCase()} endpoint. Logged.`);
      } else {
        toast.error(`Webhook failed: HTTP ${res.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      toast.error(`Request failed: ${msg}`);

      setResults((prev) => [
        {
          ok: false,
          status: 0,
          body: { error: msg },
          runtime,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Webhook Simulator" }]}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="surface-elevated rounded-3xl p-6 md:p-7 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(16,185,129,0.06),transparent_22%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
                <Sparkles className="w-3 h-3" />
                Runtime Testing Console
              </div>

              <div>
                <h1 className="text-heading text-2xl md:text-3xl">Webhook Simulator</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  Test inbound webhook delivery from Make and n8n runtimes into the
                  central governance layer, verify payload behaviour, and inspect runtime
                  responses in real time.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                <Shield className="w-3.5 h-3.5" />
                <span>Operator-grade runtime validation</span>
                <span className="opacity-40">•</span>
                <span>Direct endpoint simulation</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <RuntimeBadge runtime={runtime} />
              <span className="text-[11px] text-muted-foreground font-mono">
                POST /api/webhooks/{runtime}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Events Sent"
            value={results.length}
            icon={<Webhook className="w-4 h-4 text-primary" />}
          />
          <StatTile
            label="Successful"
            value={successCount}
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            tone="success"
          />
          <StatTile
            label="Failed"
            value={failedCount}
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            tone="danger"
          />
          <StatTile
            label="Latest Status"
            value={latestResult ? `HTTP ${latestResult.status}` : "—"}
            icon={<BarChart3 className="w-4 h-4 text-blue-400" />}
            tone="info"
          />
        </div>

        <div className="grid xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 space-y-5">
            <div className="surface-elevated rounded-2xl p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-primary" />
                  Compose Event
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Build a runtime event payload and dispatch it to the selected inbound endpoint.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                {(["make", "n8n"] as const).map((rt) => {
                  const isSelected = runtime === rt;
                  const isMake = rt === "make";

                  return (
                    <button
                      key={rt}
                      onClick={() => setRuntime(rt)}
                      className={`rounded-2xl border p-4 text-left transition-all card-hover ${
                        isSelected
                          ? isMake
                            ? "border-violet-500/40 bg-violet-500/10"
                            : "border-orange-500/40 bg-orange-500/10"
                          : "border-border/70 bg-background/30 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                            isMake
                              ? "text-violet-400 bg-violet-500/10 border-violet-500/20"
                              : "text-orange-400 bg-orange-500/10 border-orange-500/20"
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {isMake ? "Make" : "n8n"} Inbound Endpoint
                          </p>
                        </div>

                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>

                      <code className="text-xs font-mono text-muted-foreground break-all">
                        POST /api/webhooks/{rt}
                      </code>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Workflow ID
                  </Label>

                  {workflows && workflows.length > 0 ? (
                    <Select value={workflowId} onValueChange={setWorkflowId}>
                      <SelectTrigger className="bg-input border-border text-sm rounded-xl">
                        <SelectValue placeholder="Select a workflow..." />
                      </SelectTrigger>
                      <SelectContent>
                        {workflows.map((wf) => (
                          <SelectItem key={wf.id} value={wf.id}>
                            <span className="font-mono text-xs">{wf.id}</span>
                            <span className="ml-2 text-muted-foreground text-xs">
                              ({wf.runtime})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter workflow ID manually"
                      value={workflowId}
                      onChange={(e) => setWorkflowId(e.target.value)}
                      className="bg-input border-border text-sm font-mono rounded-xl"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Step Name
                  </Label>
                  <Input
                    value={step}
                    onChange={(e) => setStep(e.target.value)}
                    className="bg-input border-border text-sm rounded-xl"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Event Type
                    </Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="bg-input border-border text-sm rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "execution",
                          "webhook_received",
                          "routing",
                          "ai_call",
                          "report",
                          "error",
                          "completion",
                        ].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </Label>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as "success" | "failure")}
                    >
                      <SelectTrigger className="bg-input border-border text-sm rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failure">Failure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Message
                  </Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-input border-border text-sm resize-none rounded-xl"
                    rows={4}
                  />
                </div>

                {runtime === "make" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Make API Key{" "}
                      <span className="text-muted-foreground/60 normal-case tracking-normal font-normal">
                        (optional)
                      </span>
                    </Label>

                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="x-make-apikey header value"
                        value={makeApiKey}
                        onChange={(e) => setMakeApiKey(e.target.value)}
                        className="bg-input border-border text-sm pl-9 rounded-xl"
                        autoComplete="off"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Sent as{" "}
                      <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
                        x-make-apikey
                      </code>{" "}
                      header on the request.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full gap-2 h-10 rounded-xl bg-[var(--primary)] text-white hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Webhook Event
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="surface-elevated rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Expected Payload Schema</h3>
              </div>

              <p className="text-[11px] text-muted-foreground mb-3">
                Runtime payload format accepted by the central webhook endpoints.
              </p>

              <pre className="code-block text-[11px] leading-relaxed whitespace-pre-wrap">
{`POST /api/webhooks/make  (or /api/webhooks/n8n)
Content-Type: application/json

{
  "workflowId": "string (required)",
  "step":       "string — step name",
  "eventType":  "execution | webhook_received | routing | ai_call | report | error | completion",
  "status":     "success | failure",
  "message":    "string — descriptive log message"
}`}
              </pre>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-5">
            <div className="surface-elevated rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Response Log</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {results.length} event{results.length !== 1 ? "s" : ""} sent
                  </p>
                </div>

                {latestResult && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                    <Clock className="w-3 h-3" />
                    {latestResult.timestamp}
                  </div>
                )}
              </div>

              {results.length === 0 ? (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-10 flex flex-col items-center gap-3 text-center">
                  <Webhook className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No simulated events yet
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Send a webhook event to inspect runtime responses here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
                  {results.map((r, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl border overflow-hidden ${
                        r.ok
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-red-500/20 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          {r.ok ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-foreground">
                              HTTP {r.status}
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                            <RuntimeBadge runtime={r.runtime} />
                          </div>
                        </div>

                        <span className="text-[11px] text-muted-foreground font-mono">
                          {r.timestamp}
                        </span>
                      </div>

                      <div className="px-4 py-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
                            Response Body
                          </span>
                        </div>

                        <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-words bg-background/40 border border-border/50 rounded-2xl p-3">
                          {JSON.stringify(r.body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="surface-elevated rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Validation Notes</p>
              </div>

              <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Use this console to test how external runtimes register execution activity
                  inside the platform.
                </p>
                <p>
                  Make requests can optionally include an{" "}
                  <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
                    x-make-apikey
                  </code>{" "}
                  header for protected endpoint scenarios.
                </p>
                <p>
                  Failed simulations are still logged in the response console so you can validate
                  error handling as well as successful delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
