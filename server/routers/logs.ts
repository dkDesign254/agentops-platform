import { z } from "zod";
import {
  listAILogsByWorkflow,
  listExecutionLogsByWorkflow,
  listAllReports,
  getDashboardStats,
} from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const logsRouter = router({
  executionLogs: publicProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ input }) => {
      return listExecutionLogsByWorkflow(input.workflowId);
    }),

  aiLogs: publicProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ input }) => {
      return listAILogsByWorkflow(input.workflowId);
    }),

  allReports: publicProcedure.query(async () => {
    return listAllReports();
  }),

  dashboardStats: publicProcedure.query(async () => {
    return getDashboardStats();
  }),
});
