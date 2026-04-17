import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDashboardStats, getWorkflows, getExecutionLogs, getAILogs } from "../airtable";

export const intelligenceRouter = router({
  /**
   * LLM-generated governance insights for the dashboard.
   * Summarises current workflow state, anomalies, and recommendations.
   */
  dashboardInsights: publicProcedure.query(async () => {
    const [stats, workflows, execLogs] = await Promise.all([
      getDashboardStats(),
      getWorkflows(),
      getExecutionLogs(),
    ]);

    const failedLogs = execLogs.filter((l) =>
      ["failed", "error"].includes(l.status.toLowerCase())
    );
    const pendingWorkflows = workflows.filter(
      (w) => w.status.toLowerCase() === "pending"
    );
    const successRate =
      stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    const prompt = `You are an AI governance analyst for an enterprise AgentOps platform.
Analyse the following workflow execution data and produce exactly 3 concise governance insights.

DATA:
- Total workflows: ${stats.total}
- Completed: ${stats.completed}
- Pending: ${stats.pending}
- Failed: ${stats.failed}
- Success rate: ${successRate}%
- Make runtime: ${stats.make} workflows
- n8n runtime: ${stats.n8n} workflows
- Failed execution steps: ${failedLogs.length}
- Pending workflows awaiting execution: ${pendingWorkflows.length}

INSTRUCTIONS:
Return a JSON object with this exact structure:
{
  "insights": [
    { "type": "success|warning|info", "title": "short title", "message": "one sentence insight" },
    { "type": "success|warning|info", "title": "short title", "message": "one sentence insight" },
    { "type": "success|warning|info", "title": "short title", "message": "one sentence insight" }
  ],
  "overallHealth": "good|warning|critical",
  "summary": "one sentence overall system health summary"
}`;

    try {
      const response = await invokeLLM({
        messages: [
            { role: "system" as const, content: "You are an enterprise AI governance analyst. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "governance_insights",
            strict: true,
            schema: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["success", "warning", "info"] },
                      title: { type: "string" },
                      message: { type: "string" },
                    },
                    required: ["type", "title", "message"],
                    additionalProperties: false,
                  },
                },
                overallHealth: { type: "string", enum: ["good", "warning", "critical"] },
                summary: { type: "string" },
              },
              required: ["insights", "overallHealth", "summary"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new Error("Empty LLM response");
      return JSON.parse(content) as {
        insights: Array<{ type: string; title: string; message: string }>;
        overallHealth: string;
        summary: string;
      };
    } catch (err) {
      // Fallback if LLM fails
      return {
        insights: [
          {
            type: successRate >= 80 ? "success" : successRate >= 50 ? "warning" : "info",
            title: "Workflow Success Rate",
            message: `${successRate}% of workflows completed successfully. Governance coverage is active.`,
          },
          {
            type: stats.pending > 10 ? "warning" : "info",
            title: "Pending Workflows",
            message: `${stats.pending} workflows pending execution — awaiting runtime confirmation from Make or n8n.`,
          },
          {
            type: "info",
            title: "Runtime Distribution",
            message: `Make handles ${stats.make} workflows, n8n handles ${stats.n8n}. Distribution is ${Math.abs(stats.make - stats.n8n) <= 2 ? "balanced" : "uneven"}.`,
          },
        ],
        overallHealth: successRate >= 80 ? "good" : successRate >= 50 ? "warning" : "critical",
        summary: `Platform governing ${stats.total} workflows across Make and n8n with ${successRate}% success rate.`,
      };
    }
  }),

  /**
   * AI Explain: given a workflow ID and optional context, produce a plain-language explanation.
   */
  explainWorkflow: publicProcedure
    .input(
      z.object({
        workflowId: z.string(),
        workflowName: z.string().optional(),
        runtime: z.string().optional(),
        status: z.string().optional(),
        execLogs: z
          .array(
            z.object({
              stepName: z.string(),
              eventType: z.string(),
              status: z.string(),
              message: z.string().nullable(),
            })
          )
          .optional(),
        context: z.enum(["overview", "errors", "performance"]).default("overview"),
      })
    )
    .mutation(async ({ input }) => {
      const failedSteps = (input.execLogs ?? []).filter((l) =>
        ["failed", "error"].includes(l.status.toLowerCase())
      );

      const logsText =
        (input.execLogs ?? [])
          .slice(0, 10)
          .map((l) => `- [${l.status.toUpperCase()}] ${l.stepName} (${l.eventType}): ${l.message ?? "no message"}`)
          .join("\n") || "No execution logs available.";

      const contextPrompts = {
        overview: `Explain what this workflow does, its current status, and any notable observations. Be concise and clear for a non-technical stakeholder.`,
        errors: `Analyse the failed steps and explain what went wrong, why it likely happened, and what the operator should do next. Be specific and actionable.`,
        performance: `Analyse the execution steps and provide a performance assessment. Highlight any bottlenecks, inefficiencies, or areas for improvement.`,
      };

      const prompt = `You are an AI governance assistant for an enterprise automation platform.

WORKFLOW:
- ID: ${input.workflowId}
- Name: ${input.workflowName ?? "Weekly Marketing Performance Reporting"}
- Runtime: ${input.runtime ?? "Unknown"}
- Status: ${input.status ?? "Unknown"}
- Failed steps: ${failedSteps.length}

EXECUTION LOG (last 10 steps):
${logsText}

TASK: ${contextPrompts[input.context]}

Respond in 2-3 clear paragraphs. Do not use bullet points. Be direct and professional.`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an enterprise AI governance assistant. Provide clear, professional explanations of workflow execution data.",
            },
            { role: "user", content: prompt },
          ],
        });
        return {
          explanation: response.choices?.[0]?.message?.content ?? "Unable to generate explanation.",
          context: input.context,
        };
      } catch {
        return {
          explanation: `This workflow (${input.workflowId}) is currently ${input.status ?? "in an unknown state"} on the ${input.runtime ?? "selected"} runtime. ${failedSteps.length > 0 ? `There are ${failedSteps.length} failed execution steps that require attention.` : "All execution steps completed without errors."} Review the execution timeline for detailed step-by-step traceability.`,
          context: input.context,
        };
      }
    }),

  /**
   * Anomaly detection: scan execution logs for failures, missing outputs, and patterns.
   */
  detectAnomalies: publicProcedure.query(async () => {
    const [workflows, execLogs] = await Promise.all([
      getWorkflows(),
      getExecutionLogs(),
    ]);

    const anomalies: Array<{
      severity: "critical" | "warning" | "info";
      workflowId: string;
      type: string;
      message: string;
    }> = [];

    // Failed steps
    const failedLogs = execLogs.filter((l) =>
      ["failed", "error"].includes(l.status.toLowerCase())
    );
    for (const log of failedLogs.slice(0, 5)) {
      const wf = workflows.find((w) =>
        log.workflowRecordIds.includes(w.recordId)
      );
      anomalies.push({
        severity: "critical",
        workflowId: wf?.workflowId ?? log.workflowRecordIds[0] ?? "unknown",
        type: "Step Failure",
        message: `Step "${log.stepName}" failed: ${log.message ?? "no details"}`,
      });
    }

    // Long-pending workflows (no completion date)
    const staleWorkflows = workflows.filter(
      (w) => w.status.toLowerCase() === "pending" && !w.dateCompleted
    );
    if (staleWorkflows.length > 5) {
      anomalies.push({
        severity: "warning",
        workflowId: "SYSTEM",
        type: "Stale Workflows",
        message: `${staleWorkflows.length} workflows have been pending without completion — possible runtime connectivity issue.`,
      });
    }

    // Runtime imbalance
    const makeCount = workflows.filter((w) => w.runtime?.toLowerCase() === "make").length;
    const n8nCount = workflows.filter((w) => w.runtime?.toLowerCase() === "n8n").length;
    if (Math.abs(makeCount - n8nCount) > workflows.length * 0.4) {
      anomalies.push({
        severity: "info",
        workflowId: "SYSTEM",
        type: "Runtime Imbalance",
        message: `Significant routing imbalance: Make (${makeCount}) vs n8n (${n8nCount}). Consider rebalancing workflow distribution.`,
      });
    }

    return { anomalies, scannedAt: new Date().toISOString() };
  }),
});
