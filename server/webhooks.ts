import { Router } from "express";
import {
  createExecutionLog,
  getWorkflowById,
  updateWorkflowStatus,
} from "./db";

const webhookRouter = Router();

// Shared handler for inbound webhook events from external runtimes
async function handleInboundWebhook(
  runtime: "make" | "n8n",
  body: Record<string, unknown>,
  res: import("express").Response
) {
  const workflowId = body.workflowId as string | undefined;

  if (!workflowId) {
    return res.status(400).json({ error: "Missing workflowId in payload" });
  }

  const workflow = await getWorkflowById(workflowId);
  if (!workflow) {
    return res.status(404).json({ error: `Workflow ${workflowId} not found` });
  }

  const step = (body.step as string) || "External Step";
  const eventType = (body.eventType as string) || "execution";
  const status = (body.status as string) === "failure" ? "failure" : "success";
  const message = (body.message as string) || `Event received from ${runtime.toUpperCase()} runtime.`;

  // Validate eventType against allowed values
  const validEventTypes = [
    "intake",
    "routing",
    "execution",
    "ai_call",
    "report",
    "error",
    "completion",
    "webhook_received",
  ] as const;
  type EventType = (typeof validEventTypes)[number];
  const safeEventType: EventType = validEventTypes.includes(eventType as EventType)
    ? (eventType as EventType)
    : "webhook_received";

  await createExecutionLog({
    workflowId,
    step,
    eventType: safeEventType,
    status: status as "success" | "failure" | "info",
    message: `[${runtime.toUpperCase()} Inbound] ${message}`,
  });

  // If the runtime reports a failure, update workflow status
  if (status === "failure") {
    await updateWorkflowStatus(workflowId, "failed");
  }

  return res.status(200).json({
    received: true,
    workflowId,
    runtime,
    logged: true,
  });
}

// ─── Make Inbound Webhook ─────────────────────────────────────────────────────
webhookRouter.post("/make", async (req, res) => {
  try {
    await handleInboundWebhook("make", req.body as Record<string, unknown>, res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Webhook/Make] Error:", msg);
    res.status(500).json({ error: msg });
  }
});

// ─── n8n Inbound Webhook ──────────────────────────────────────────────────────
webhookRouter.post("/n8n", async (req, res) => {
  try {
    await handleInboundWebhook("n8n", req.body as Record<string, unknown>, res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Webhook/n8n] Error:", msg);
    res.status(500).json({ error: msg });
  }
});

export { webhookRouter };
