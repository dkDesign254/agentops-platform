import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Runtime = "make" | "n8n";
type AgentType = "marketing" | "sales" | "finance" | "hr";
type Autonomy = "assisted" | "semi" | "full";

const STEPS = ["Type", "Runtime", "Control", "Deploy"];

const AGENT_TYPES: {
  value: AgentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    value: "marketing",
    label: "Marketing Agent",
    description: "Campaign workflows, reporting, content approvals, analytics, and distribution.",
    icon: <TrendingUp className="w-4 h-4" />,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: "sales",
    label: "Sales Agent",
    description: "Lead qualification, follow-up routing, opportunity tracking, and pipeline actions.",
    icon: <Users className="w-4 h-4" />,
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    value: "finance",
    label: "Finance Agent",
    description: "Reconciliation, approvals, summaries, exception flags, and financial traceability.",
    icon: <Wallet className="w-4 h-4" />,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    value: "hr",
    label: "HR Agent",
    description: "Onboarding flows, internal requests, compliance reminders, and people operations.",
    icon: <Bot className="w-4 h-4" />,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

const AUTONOMY_OPTIONS: {
  value: Autonomy;
  label: string;
  description: string;
  accent: string;
}[] = [
  {
    value: "assisted",
    label: "Assisted",
    description: "Human-led with automation support and strong approval gates.",
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    value: "semi",
    label: "Semi-Autonomous",
    description: "Executes routine operations independently with governance checkpoints.",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: "full",
    label: "Fully Autonomous",
    description: "Operates independently with minimal intervention and exception escalation only.",
    accent: "text-red-400 bg-red-500/10 border-red-500/20",
  },
];

function StepChip({
  label,
  index,
  currentStep,
}: {
  label: string;
  index: number;
  currentStep: number;
}) {
  const active = currentStep === index + 1;
  const complete = currentStep > index + 1;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
        active
          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
          : complete
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-muted/20 text-muted-foreground border-border/60"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
          active
            ? "bg-white/15"
            : complete
            ? "bg-emerald-500/15"
            : "bg-muted/40"
        }`}
      >
        {complete ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
      </span>
      {label}
    </div>
  );
}

export default function WorkflowNew() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [runtime, setRuntime] = useState<Runtime>("make");
  const [requestedBy] = useState(user?.name ?? "");
  const [agentType, setAgentType] = useState<AgentType>("marketing");
  const [autonomy, setAutonomy] = useState<Autonomy>("semi");

  const createMutation = trpc.workflows.create.useMutation({
    onSuccess: () => {
      toast.success("Agent deployed successfully.");
      setLocation("/");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to deploy agent.");
    },
  });

  const selectedAgent = useMemo(
    () => AGENT_TYPES.find((a) => a.value === agentType),
    [agentType]
  );

  const selectedAutonomy = useMemo(
    () => AUTONOMY_OPTIONS.find((a) => a.value === autonomy),
    [autonomy]
  );

  const handleCreate = () => {
    createMutation.mutate({
      runtime,
      requestedBy: requestedBy || "System",
    });
  };

  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "New Workflow" }]}
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
                Back to dashboard
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
                  <Sparkles className="w-3 h-3" />
                  Premium Agent Deployment Wizard
                </div>

                <h1 className="text-heading text-2xl md:text-3xl">Create Agent</h1>

                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Define the kind of operational agent you want to deploy, choose the
                  orchestration runtime, set autonomy boundaries, and launch it into your
                  governance environment.
                </p>

                <p className="text-xs text-muted-foreground">
                  Requested by <span className="text-foreground font-medium">{requestedBy || "System"}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {STEPS.map((s, i) => (
                <StepChip key={s} label={s} index={i} currentStep={step} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            {step === 1 && (
              <div className="surface-elevated rounded-2xl p-5">
                <div className="mb-4">
                  <Label className="text-sm font-semibold text-foreground">Agent Type</Label>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Choose the business function this agent will primarily govern.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AGENT_TYPES.map((t) => {
                    const selected = agentType === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setAgentType(t.value)}
                        className={`p-4 rounded-2xl border text-left transition-all card-hover ${
                          selected
                            ? "border-primary/30 bg-primary/10"
                            : "border-border/70 bg-background/30 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 rounded-xl border ${t.accent}`}>{t.icon}</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{t.label}</p>
                          </div>
                          {selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-5">
                  <Button
                    onClick={nextStep}
                    className="h-9 text-xs gap-1.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="surface-elevated rounded-2xl p-5">
                <div className="mb-4">
                  <Label className="text-sm font-semibold text-foreground">Runtime</Label>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Select the automation engine that will execute the workflow.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["make", "n8n"] as Runtime[]).map((rt) => {
                    const selected = runtime === rt;
                    const isMake = rt === "make";
                    return (
                      <button
                        key={rt}
                        onClick={() => setRuntime(rt)}
                        className={`p-4 rounded-2xl border text-left transition-all card-hover ${
                          selected
                            ? isMake
                              ? "border-violet-500/40 bg-violet-500/10"
                              : "border-orange-500/40 bg-orange-500/10"
                            : "border-border/70 bg-background/30 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`p-2 rounded-xl border ${
                              isMake
                                ? "text-violet-400 bg-violet-500/10 border-violet-500/20"
                                : "text-orange-400 bg-orange-500/10 border-orange-500/20"
                            }`}
                          >
                            <Zap className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {isMake ? "Make" : "n8n"}
                            </p>
                          </div>
                          {selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isMake
                            ? "Fast no-code orchestration ideal for structured business automations."
                            : "Flexible node-based engine suited for deeper custom workflow control."}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-5">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-9 text-xs rounded-xl bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="h-9 text-xs gap-1.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="surface-elevated rounded-2xl p-5">
                <div className="mb-4">
                  <Label className="text-sm font-semibold text-foreground">
                    Autonomy Level
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Set how independently the agent can act before governance intervention.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {AUTONOMY_OPTIONS.map((a) => {
                    const selected = autonomy === a.value;
                    return (
                      <button
                        key={a.value}
                        onClick={() => setAutonomy(a.value)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          selected
                            ? "border-primary/30 bg-primary/10"
                            : "border-border/70 bg-background/30 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`p-2 rounded-xl border ${a.accent}`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{a.label}</p>
                          {selected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {a.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-5">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-9 text-xs rounded-xl bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="h-9 text-xs gap-1.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="surface-elevated rounded-2xl p-5">
                <div className="mb-4">
                  <Label className="text-sm font-semibold text-foreground">
                    Deployment Summary
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Review the final profile before launching the agent.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                      Agent Type
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedAgent?.label ?? agentType}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                      Runtime
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {runtime === "make" ? "Make.com" : "n8n"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                      Autonomy
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedAutonomy?.label ?? autonomy}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                      Requested By
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {requestedBy || "System"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    This will deploy a{" "}
                    <span className="font-semibold text-foreground">
                      {agentType}
                    </span>{" "}
                    agent running on{" "}
                    <span className="font-semibold text-foreground">{runtime}</span>{" "}
                    with{" "}
                    <span className="font-semibold text-foreground">{autonomy}</span>{" "}
                    autonomy under the current governance framework.
                  </p>
                </div>

                <div className="flex justify-between mt-5">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-9 text-xs rounded-xl bg-transparent"
                  >
                    Back
                  </Button>

                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="h-10 min-w-[160px] text-xs gap-2 rounded-xl bg-[var(--primary)] text-white hover:opacity-90"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deploying…
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Deploy Agent
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="surface-elevated rounded-2xl p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Live Preview
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Current deployment profile based on your selections.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                    Agent
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedAgent?.label ?? "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                    Runtime
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {runtime === "make" ? "Make.com" : "n8n"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                    Autonomy
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedAutonomy?.label ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-2xl p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Governance Notes
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  These are the control expectations implied by your setup.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  {
                    label: "Execution trace will be recorded",
                    active: true,
                  },
                  {
                    label:
                      autonomy !== "full"
                        ? "Human intervention remains available"
                        : "Intervention limited to exception handling",
                    active: true,
                  },
                  {
                    label:
                      runtime === "make"
                        ? "Optimised for structured automations"
                        : "Optimised for flexible workflow logic",
                    active: true,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <p className="text-xs text-foreground/85 leading-relaxed">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
