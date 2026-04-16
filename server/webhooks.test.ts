import { describe, expect, it, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { webhookRouter } from "./webhooks";

// Mock DB helpers
vi.mock("./db", () => ({
  getWorkflowById: vi.fn(),
  createExecutionLog: vi.fn().mockResolvedValue({}),
  updateWorkflowStatus: vi.fn().mockResolvedValue({}),
  upsertUser: vi.fn().mockResolvedValue({}),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/webhooks", webhookRouter);
  return app;
}

describe("POST /api/webhooks/make", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const db = await import("./db");
    vi.mocked(db.createExecutionLog).mockResolvedValue({} as never);
    vi.mocked(db.updateWorkflowStatus).mockResolvedValue({} as never);
  });

  it("returns 400 when workflowId is missing", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/webhooks/make")
      .send({ step: "Test", status: "success" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("workflowId");
  });

  it("returns 404 when workflow does not exist", async () => {
    const db = await import("./db");
    vi.mocked(db.getWorkflowById).mockResolvedValue(undefined);

    const app = buildApp();
    const res = await request(app)
      .post("/api/webhooks/make")
      .send({ workflowId: "nonexistent-id", step: "Test", status: "success" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 200 and logs a success event for a valid workflow", async () => {
    const db = await import("./db");
    vi.mocked(db.getWorkflowById).mockResolvedValue({
      id: "wf-test-123",
      name: "Weekly Marketing Performance Reporting",
      runtime: "make",
      status: "running",
      requestedBy: "Test User",
      webhookUrl: null,
      createdAt: new Date(),
      completedAt: null,
    } as never);

    const app = buildApp();
    const res = await request(app)
      .post("/api/webhooks/make")
      .send({
        workflowId: "wf-test-123",
        step: "Data Collection",
        eventType: "execution",
        status: "success",
        message: "Data collected from all channels.",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      received: true,
      workflowId: "wf-test-123",
      runtime: "make",
      logged: true,
    });
    expect(db.createExecutionLog).toHaveBeenCalledOnce();
  });

  it("updates workflow status to failed when failure event is received", async () => {
    const db = await import("./db");
    vi.mocked(db.getWorkflowById).mockResolvedValue({
      id: "wf-fail-456",
      name: "Weekly Marketing Performance Reporting",
      runtime: "make",
      status: "running",
      requestedBy: "Test User",
      webhookUrl: null,
      createdAt: new Date(),
      completedAt: null,
    } as never);

    const app = buildApp();
    const res = await request(app)
      .post("/api/webhooks/make")
      .send({
        workflowId: "wf-fail-456",
        step: "API Call",
        eventType: "error",
        status: "failure",
        message: "External API returned 503.",
      });

    expect(res.status).toBe(200);
    expect(db.updateWorkflowStatus).toHaveBeenCalledWith("wf-fail-456", "failed");
  });
});

describe("POST /api/webhooks/n8n", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const db = await import("./db");
    vi.mocked(db.createExecutionLog).mockResolvedValue({} as never);
    vi.mocked(db.updateWorkflowStatus).mockResolvedValue({} as never);
  });

  it("returns 400 when workflowId is missing", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/webhooks/n8n")
      .send({ step: "Test", status: "success" });

    expect(res.status).toBe(400);
  });

  it("returns 200 and logs event from n8n runtime", async () => {
    const db = await import("./db");
    vi.mocked(db.getWorkflowById).mockResolvedValue({
      id: "wf-n8n-789",
      name: "Weekly Marketing Performance Reporting",
      runtime: "n8n",
      status: "running",
      requestedBy: "Marketing Team",
      webhookUrl: null,
      createdAt: new Date(),
      completedAt: null,
    } as never);

    const app = buildApp();
    const res = await request(app)
      .post("/api/webhooks/n8n")
      .send({
        workflowId: "wf-n8n-789",
        step: "Report Aggregation",
        eventType: "execution",
        status: "success",
        message: "n8n aggregated all marketing data.",
      });

    expect(res.status).toBe(200);
    expect(res.body.runtime).toBe("n8n");
    expect(db.createExecutionLog).toHaveBeenCalledOnce();
  });

  it("labels log message with n8n runtime prefix", async () => {
    const db = await import("./db");
    vi.mocked(db.getWorkflowById).mockResolvedValue({
      id: "wf-n8n-prefix",
      name: "Weekly Marketing Performance Reporting",
      runtime: "n8n",
      status: "running",
      requestedBy: "Test",
      webhookUrl: null,
      createdAt: new Date(),
      completedAt: null,
    } as never);

    const app = buildApp();
    await request(app)
      .post("/api/webhooks/n8n")
      .send({
        workflowId: "wf-n8n-prefix",
        step: "Step A",
        status: "success",
        message: "Done",
      });

    const callArgs = vi.mocked(db.createExecutionLog).mock.calls[0]?.[0];
    expect(callArgs?.message).toContain("[N8N Inbound]");
  });
});
