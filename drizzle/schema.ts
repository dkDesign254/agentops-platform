import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "analyst", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const workflows = mysqlTable("workflows", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  runtime: mysqlEnum("runtime", ["make", "n8n"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  requestedBy: varchar("requestedBy", { length: 255 }).notNull(),
  webhookUrl: text("webhookUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

export const ExecutionLogs = mysqlTable("ExecutionLogs", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: varchar("workflowId", { length: 36 }).notNull(),
  step: varchar("step", { length: 255 }).notNull(),
  eventType: mysqlEnum("eventType", [
    "intake",
    "routing",
    "execution",
    "ai_call",
    "report",
    "error",
    "completion",
    "webhook_received",
  ]).notNull(),
  status: mysqlEnum("status", ["success", "failure", "info"]).notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ExecutionLog = typeof ExecutionLogs.$inferSelect;
export type InsertExecutionLog = typeof ExecutionLogs.$inferInsert;

export const AI_Logs = mysqlTable("AI_Logs", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: varchar("workflowId", { length: 36 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AILog = typeof AI_Logs.$inferSelect;
export type InsertAILog = typeof AI_Logs.$inferInsert;

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: varchar("workflowId", { length: 36 }).notNull().unique(),
  summary: text("summary").notNull(),
  insights: text("insights").notNull(),
  risks: text("risks").notNull(),
  recommendation: text("recommendation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
