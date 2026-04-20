import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function WorkflowNew() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [runtime, setRuntime] = useState<"make" | "n8n">("make");
  const [requestedBy, setRequestedBy] = useState(user?.name ?? "");
  const [agentType, setAgentType] = useState("marketing");
  const [autonomy, setAutonomy] = useState("semi");

  const createMutation = trpc.workflows.create.useMutation({
    onSuccess: () => {
      toast.success("Agent deployed successfully.");
      setLocation("/");
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      runtime,
      requestedBy: requestedBy || "System",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <button onClick={() => setLocation("/")} className="text-xs text-muted-foreground flex gap-1 items-center">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <h1 className="text-2xl font-semibold mt-2">Create Agent</h1>
          <p className="text-muted-foreground text-sm">Deploy an autonomous workflow agent</p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex gap-2 text-xs">
          {["Type", "Runtime", "Control", "Deploy"].map((s, i) => (
            <div key={i} className={`px-3 py-1 rounded ${step === i+1 ? "bg-primary text-white" : "bg-muted"}`}>
              {s}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <Label>Agent Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {["marketing","sales","finance","hr"].map(t => (
                <button key={t} onClick={() => setAgentType(t)} className={`p-4 border rounded-lg ${agentType===t?"border-primary":"border-border"}`}>
                  {t}
                </button>
              ))}
            </div>
            <Button onClick={()=>setStep(2)}>Next</Button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <Label>Runtime</Label>
            <div className="flex gap-3">
              <button onClick={()=>setRuntime("make")} className={`p-4 border rounded ${runtime==="make"?"border-primary":""}`}>
                Make
              </button>
              <button onClick={()=>setRuntime("n8n")} className={`p-4 border rounded ${runtime==="n8n"?"border-primary":""}`}>
                n8n
              </button>
            </div>
            <Button onClick={()=>setStep(3)}>Next</Button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <Label>Autonomy Level</Label>
            <div className="flex gap-3">
              {["assisted","semi","full"].map(a => (
                <button key={a} onClick={()=>setAutonomy(a)} className={`p-4 border rounded ${autonomy===a?"border-primary":""}`}>
                  {a}
                </button>
              ))}
            </div>
            <Button onClick={()=>setStep(4)}>Next</Button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-6 border rounded-xl">
              <p className="text-sm">Agent Summary</p>
              <p className="text-xs text-muted-foreground mt-2">
                {agentType} agent running on {runtime} with {autonomy} autonomy
              </p>
            </div>

            <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? <Loader2 className="animate-spin"/> : <Zap className="w-4 h-4"/>}
              Deploy Agent
            </Button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
