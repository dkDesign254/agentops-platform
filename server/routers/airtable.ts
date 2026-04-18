import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import {
  getWorkflows,
  getWorkflowByRecordId,
  getExecutionLogs,
  getAILogs,
  getPerformanceData,
  getFinalReports,
  getDashboardStats,
  approveReport,
  updateWorkflowStatus,
} from "../airtable";

export const airtableRouter = router({
  dashboardStats: protectedProcedure.query(async () => {
    return getDashboardStats();
  }),

  workflows: protectedProcedure.query(async () => {
    return getWorkflows();
  }),

  workflowById: protectedProcedure
    .input(z.object({ recordId: z.string() }))
    .query(async ({ input }) => {
      return getWorkflowByRecordId(input.recordId);
    }),

  executionLogs: protectedProcedure
    .input(z.object({ workflowRecordId: z.string().optional() }))
    .query(async ({ input }) => {
      return getExecutionLogs(input.workflowRecordId);
    }),

  aiLogs: protectedProcedure
    .input(z.object({ workflowRecordId: z.string().optional() }))
    .query(async ({ input }) => {
      return getAILogs(input.workflowRecordId);
    }),

  performanceData: protectedProcedure
    .input(z.object({ workflowRecordId: z.string().optional() }))
    .query(async ({ input }) => {
      return getPerformanceData(input.workflowRecordId);
    }),

  finalReports: protectedProcedure
    .input(z.object({ workflowRecordId: z.string().optional() }))
    .query(async ({ input }) => {
      return getFinalReports(input.workflowRecordId);
    }),

  approveReport: adminProcedure
    .input(z.object({ recordId: z.string() }))
    .mutation(async ({ input }) => {
      return approveReport(input.recordId);
    }),

  updateWorkflowStatus: adminProcedure
    .input(
      z.object({
        recordId: z.string(),
        status: z.enum(["Pending", "Running", "Completed", "Failed"]),
      })
    )
    .mutation(async ({ input }) => {
      return updateWorkflowStatus(input.recordId, input.status);
    }),
});
