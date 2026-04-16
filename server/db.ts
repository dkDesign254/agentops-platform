import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AI_Logs,
  ExecutionLogs,
  InsertAILog,
  InsertExecutionLog,
  InsertReport,
  InsertUser,
  InsertWorkflow,
  reports,
  users,
  workflows,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Workflows ────────────────────────────────────────────────────────────────

export async function createWorkflow(data: InsertWorkflow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(workflows).values(data);
  return data;
}

export async function listWorkflows() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workflows).orderBy(desc(workflows.createdAt));
}

export async function getWorkflowById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return result[0];
}

export async function updateWorkflowStatus(
  id: string,
  status: "pending" | "running" | "completed" | "failed",
  completedAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (completedAt) updateData.completedAt = completedAt;
  await db.update(workflows).set(updateData).where(eq(workflows.id, id));
}

// ─── ExecutionLogs ────────────────────────────────────────────────────────────

export async function createExecutionLog(data: InsertExecutionLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(ExecutionLogs).values(data);
}

export async function listExecutionLogsByWorkflow(workflowId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ExecutionLogs)
    .where(eq(ExecutionLogs.workflowId, workflowId))
    .orderBy(ExecutionLogs.timestamp);
}

export async function countFailedLogs(workflowId: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select()
    .from(ExecutionLogs)
    .where(
      and(
        eq(ExecutionLogs.workflowId, workflowId),
        eq(ExecutionLogs.status, "failure")
      )
    );
  return result.length;
}

// ─── AI_Logs ──────────────────────────────────────────────────────────────────

export async function createAILog(data: InsertAILog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(AI_Logs).values(data);
}

export async function listAILogsByWorkflow(workflowId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(AI_Logs)
    .where(eq(AI_Logs.workflowId, workflowId))
    .orderBy(AI_Logs.timestamp);
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reports).values(data);
}

export async function getReportByWorkflow(workflowId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.workflowId, workflowId))
    .limit(1);
  return result[0];
}

export async function listAllReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.createdAt));
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, running: 0, completed: 0, failed: 0 };

  const all = await db.select().from(workflows);
  return {
    total: all.length,
    pending: all.filter((w) => w.status === "pending").length,
    running: all.filter((w) => w.status === "running").length,
    completed: all.filter((w) => w.status === "completed").length,
    failed: all.filter((w) => w.status === "failed").length,
  };
}
