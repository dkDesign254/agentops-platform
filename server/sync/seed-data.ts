/**
 * NexusOps — Seed Data Service
 *
 * Inserts realistic sample governance data into Supabase when:
 *   1. Supabase workflows table is empty (no live data), AND
 *   2. Airtable sync is unavailable or returned 0 records
 *
 * This ensures the dashboard is never blank during development or
 * when the Airtable connection has not yet been established.
 *
 * Sample data mirrors the research context:
 *   "Design and Evaluation of a Runtime-Independent AgentOps Platform
 *    for Governed AI Automation in Marketing Workflows."
 */

import { getSupabaseAdmin, isSupabaseAdminAvailable } from "../src/lib/supabase-admin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeedWorkflow {
  workflow_id: string;
  workflow_name: string;
  requested_by: string;
  runtime_used: string;
  status: string;
  report_period: string;
  date_requested: string;
  date_completed: string | null;
  duration_mins: number | null;
  log_count: number;
  trigger_source: string;
  notes: string | null;
}

// ─── Sample workflows ─────────────────────────────────────────────────────────

const SEED_WORKFLOWS: SeedWorkflow[] = [
  {
    workflow_id: "WF-2026-001",
    workflow_name: "Weekly Marketing Performance Reporting",
    requested_by: "Dustine Kibagendi",
    runtime_used: "Make",
    status: "Completed",
    report_period: "Q1 2026 — Week 12",
    date_requested: "2026-03-24T08:00:00Z",
    date_completed: "2026-03-24T08:47:22Z",
    duration_mins: 47.4,
    log_count: 7,
    trigger_source: "Scheduled",
    notes: null,
  },
  {
    workflow_id: "WF-2026-002",
    workflow_name: "Weekly Marketing Performance Reporting",
    requested_by: "Dustine Kibagendi",
    runtime_used: "n8n",
    status: "Completed",
    report_period: "Q1 2026 — Week 13",
    date_requested: "2026-03-31T08:00:00Z",
    date_completed: "2026-03-31T09:02:15Z",
    duration_mins: 62.3,
    log_count: 7,
    trigger_source: "Scheduled",
    notes: "Cross-runtime comparison run — n8n replicate of WF-2026-001.",
  },
  {
    workflow_id: "WF-2026-003",
    workflow_name: "Weekly Marketing Performance Reporting",
    requested_by: "Dustine Kibagendi",
    runtime_used: "Make",
    status: "Completed",
    report_period: "Q2 2026 — Week 14",
    date_requested: "2026-04-07T08:00:00Z",
    date_completed: "2026-04-07T08:51:08Z",
    duration_mins: 51.1,
    log_count: 7,
    trigger_source: "Scheduled",
    notes: null,
  },
  {
    workflow_id: "WF-2026-004",
    workflow_name: "Weekly Marketing Performance Reporting",
    requested_by: "Dustine Kibagendi",
    runtime_used: "n8n",
    status: "Failed",
    report_period: "Q2 2026 — Week 15",
    date_requested: "2026-04-14T08:00:00Z",
    date_completed: null,
    duration_mins: null,
    log_count: 3,
    trigger_source: "Scheduled",
    notes: "Workflow stalled at AI report generation step — LLM timeout.",
  },
  {
    workflow_id: "WF-2026-005",
    workflow_name: "Weekly Marketing Performance Reporting",
    requested_by: "Dustine Kibagendi",
    runtime_used: "Make",
    status: "Completed",
    report_period: "Q2 2026 — Week 15 (Retry)",
    date_requested: "2026-04-14T10:30:00Z",
    date_completed: "2026-04-14T11:18:45Z",
    duration_mins: 48.8,
    log_count: 7,
    trigger_source: "Manual",
    notes: "Manual retry after WF-2026-004 failure.",
  },
  {
    workflow_id: "WF-2026-006",
    workflow_name: "Weekly Marketing Performance Reporting",
    requested_by: "Dustine Kibagendi",
    runtime_used: "Make",
    status: "Running",
    report_period: "Q2 2026 — Week 16",
    date_requested: "2026-04-21T08:00:00Z",
    date_completed: null,
    duration_mins: null,
    log_count: 4,
    trigger_source: "Scheduled",
    notes: null,
  },
];

// ─── Derived child records ────────────────────────────────────────────────────

const EVENT_SEQUENCE = [
  { step_name: "Workflow Intake",      event_type: "intake",    status: "success" },
  { step_name: "Runtime Routing",      event_type: "routing",   status: "success" },
  { step_name: "Runtime Dispatch",     event_type: "execution", status: "success" },
  { step_name: "Data Collection",      event_type: "execution", status: "success" },
  { step_name: "AI Report Generation", event_type: "ai_call",   status: "success" },
  { step_name: "Report Storage",       event_type: "report",    status: "success" },
  { step_name: "Workflow Completion",  event_type: "completion", status: "success" },
];

const FAILED_EVENT_SEQUENCE = [
  { step_name: "Workflow Intake",      event_type: "intake",    status: "success" },
  { step_name: "Runtime Routing",      event_type: "routing",   status: "success" },
  { step_name: "Runtime Dispatch",     event_type: "execution", status: "success" },
  { step_name: "AI Report Generation", event_type: "ai_call",   status: "failure", message: "LLM request timed out after 30s — Forge API unavailable." },
];

const PARTIAL_EVENT_SEQUENCE = [
  { step_name: "Workflow Intake",      event_type: "intake",    status: "success" },
  { step_name: "Runtime Routing",      event_type: "routing",   status: "success" },
  { step_name: "Runtime Dispatch",     event_type: "execution", status: "success" },
  { step_name: "Data Collection",      event_type: "execution", status: "success" },
];

// ─── Seed function ────────────────────────────────────────────────────────────

/**
 * Seeds the Supabase database with sample governance data.
 * Only runs if the workflows table is empty.
 * Returns the number of records inserted.
 */
export async function seedIfEmpty(): Promise<{ seeded: boolean; workflowsInserted: number }> {
  if (!isSupabaseAdminAvailable()) {
    console.warn("[Seed] Supabase admin not configured — skipping seed.");
    return { seeded: false, workflowsInserted: 0 };
  }

  const db = getSupabaseAdmin();

  // Check if data already exists
  const { count } = await db
    .from("workflows")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    console.log(`[Seed] Supabase workflows table has ${count} records — skipping seed.`);
    return { seeded: false, workflowsInserted: 0 };
  }

  console.log("[Seed] No data found — inserting sample governance data…");

  // Insert workflows
  const { data: insertedWorkflows, error: wfError } = await db
    .from("workflows")
    .insert(SEED_WORKFLOWS)
    .select("id, workflow_id, status, log_count");

  if (wfError) {
    console.error("[Seed] Failed to insert workflows:", wfError.message);
    return { seeded: false, workflowsInserted: 0 };
  }

  const workflowMap = new Map(
    (insertedWorkflows ?? []).map((w) => [w.workflow_id, w.id as string])
  );

  // Insert execution logs for each workflow
  const baseTime = (wfId: string, offsetMs: number): string => {
    const wf = SEED_WORKFLOWS.find((w) => w.workflow_id === wfId);
    const base = wf?.date_requested ? new Date(wf.date_requested).getTime() : Date.now();
    return new Date(base + offsetMs).toISOString();
  };

  for (const wf of insertedWorkflows ?? []) {
    const supabaseId = wf.id as string;
    const isRunning = wf.status === "Running";
    const isFailed = wf.status === "Failed";

    const sequence = isFailed
      ? FAILED_EVENT_SEQUENCE
      : isRunning
      ? PARTIAL_EVENT_SEQUENCE
      : EVENT_SEQUENCE;

    const logRows = sequence.map((evt, i) => ({
      log_id:     `LOG-${wf.workflow_id}-${String(i + 1).padStart(3, "0")}`,
      workflow_id: supabaseId,
      runtime:     SEED_WORKFLOWS.find((w) => workflowMap.get(w.workflow_id) === supabaseId)?.runtime_used ?? "Make",
      step_name:   evt.step_name,
      event_type:  evt.event_type,
      status:      evt.status,
      timestamp:   baseTime(wf.workflow_id, i * 6 * 60_000), // 6 min apart
      message:     (evt as { message?: string }).message
        ?? `${evt.step_name} completed successfully on ${SEED_WORKFLOWS.find((w) => workflowMap.get(w.workflow_id) === supabaseId)?.runtime_used ?? "Make"} runtime.`,
    }));

    await db.from("execution_logs").insert(logRows);

    // Insert AI logs — 2 per completed workflow, 1 for running, none for failed
    if (!isFailed) {
      // Primary report generation log
      await db.from("ai_interaction_logs").insert({
        log_display_id: `AI-${wf.workflow_id}-001`,
        workflow_id: supabaseId,
        prompt_text: `You are a senior marketing analyst AI. Generate a structured Weekly Marketing Performance Report for the workflow requested by "Dustine Kibagendi".\n\nThe report must be a valid JSON object with keys: summary, insights, risks, recommendation.\n\nBase the content on realistic marketing KPIs: CTR, ROAS, conversion rates, spend efficiency, audience engagement, and channel performance.\nReturn ONLY the JSON object.`,
        response_text: `{"summary":"Campaign performance for ${wf.workflow_id} showed a 3.2% CTR across Google and Meta placements, with ROAS of 4.1x exceeding the 3.5x target. Total spend was £12,400 across 3 active campaigns.","insights":"Google Search delivered the highest ROAS at 5.2x.\\nMeta Retargeting drove 68% of conversions despite 22% of spend.\\nMobile CTR outperformed desktop by 1.4x.\\nWeekend engagement dropped 31% versus weekdays.","risks":"Email nurture sequence shows declining open rates (-8% WoW) suggesting audience fatigue.\\nLinkedIn campaign underperforming at 0.9% CTR against 1.5% benchmark.\\nDisplay spend consuming 18% of budget with <1% contribution to conversions.","recommendation":"Reallocate 40% of display budget to Google Search based on ROAS differential.\\nPause LinkedIn campaign pending creative refresh.\\nRun A/B test on email subject lines to address declining open rates.\\nIncrease mobile bid adjustments by 15% on Google Search."}`,
        model_used: "gemini-2.5-flash",
        tokens_used: 847,
        confidence: 0.88,
        flagged: false,
        timestamp: baseTime(wf.workflow_id, 4 * 6 * 60_000),
      });

      // Secondary anomaly detection log (for completed workflows only)
      if (wf.status === "Completed") {
        await db.from("ai_interaction_logs").insert({
          log_display_id: `AI-${wf.workflow_id}-002`,
          workflow_id: supabaseId,
          prompt_text: `Analyse the following campaign metrics for statistical anomalies and governance risks. Identify any metrics that deviate more than 2 standard deviations from the 4-week baseline. Report as JSON: {anomalies: [], risk_level: "low|medium|high", recommended_action: ""}`,
          response_text: `{"anomalies":["LinkedIn CTR at 0.9% is 40% below the 1.5% benchmark","Display conversion rate of 0.015% is 3 sigma below baseline","Email open rate decline of -8% WoW accelerating"],"risk_level":"medium","recommended_action":"Flag LinkedIn and Display campaigns for immediate creative review. Escalate email list health assessment to CRM team. No immediate budget action required — monitor next 2 cycles."}`,
          model_used: "gemini-2.5-flash",
          tokens_used: 312,
          confidence: 0.74,
          flagged: wf.workflow_id === "WF-2026-002", // Flag one for demo purposes
          timestamp: baseTime(wf.workflow_id, 5 * 6 * 60_000),
        });
      }
    }
  }

  // Insert sample performance data
  const perfRows = [
    { campaign_name: "Google Search — Brand", workflow_id: workflowMap.get("WF-2026-001") ?? null, impressions: 48200, clicks: 1544, conversions: 186, spend: 3800, ctr: 0.0320, roas: 5.2, reporting_period: "Q1 2026 — Week 12" },
    { campaign_name: "Meta Retargeting",       workflow_id: workflowMap.get("WF-2026-001") ?? null, impressions: 92100, clicks: 2948, conversions: 312, spend: 2700, ctr: 0.0320, roas: 4.8, reporting_period: "Q1 2026 — Week 12" },
    { campaign_name: "Display Network",        workflow_id: workflowMap.get("WF-2026-001") ?? null, impressions: 310000, clicks: 931, conversions: 14, spend: 2200, ctr: 0.0030, roas: 0.9, reporting_period: "Q1 2026 — Week 12" },
    { campaign_name: "LinkedIn Sponsored",     workflow_id: workflowMap.get("WF-2026-001") ?? null, impressions: 18400, clicks: 165, conversions: 22, spend: 3700, ctr: 0.0090, roas: 1.1, reporting_period: "Q1 2026 — Week 12" },
    { campaign_name: "Google Search — Brand", workflow_id: workflowMap.get("WF-2026-003") ?? null, impressions: 51100, clicks: 1635, conversions: 204, spend: 4000, ctr: 0.0320, roas: 5.4, reporting_period: "Q2 2026 — Week 14" },
    { campaign_name: "Meta Retargeting",       workflow_id: workflowMap.get("WF-2026-003") ?? null, impressions: 88400, clicks: 2830, conversions: 298, spend: 2850, ctr: 0.0320, roas: 4.6, reporting_period: "Q2 2026 — Week 14" },
  ].filter((r) => r.workflow_id != null);

  if (perfRows.length > 0) {
    await db.from("performance_data").insert(perfRows);
  }

  // Insert final reports for completed workflows
  const completedWfs = (insertedWorkflows ?? []).filter((w) => w.status === "Completed");
  const reportRows = completedWfs.map((wf) => ({
    report_display_id:   `RPT-${wf.workflow_id}`,
    workflow_id:          wf.id,
    executive_summary:    `Governance run ${wf.workflow_id} completed successfully. All 7 execution steps traced and logged. AI-generated report reviewed and approved by platform admin. Campaign performance exceeded ROAS targets with notable mobile conversion uplift.`,
    key_insights:         `Google Search maintained the highest ROAS at 5.2x, significantly above the 3.5x target.\nMobile conversions outpaced desktop by 38% — mobile bid adjustments recommended.\nMeta Retargeting provided strongest conversion volume (68%) relative to spend (22%).\nWeekend engagement gap of 31% represents a scheduling optimisation opportunity.\nDisplay network ROI remains negative after cost attribution.`,
    risks_or_anomalies:   `LinkedIn underperformance (0.9% CTR vs 1.5% benchmark) flagged for creative review.\nEmail open rate decline (-8% WoW) indicates potential audience fatigue.\nDisplay network contributing <2% of conversions despite 18% spend allocation.\nAI anomaly detection flagged 3 metrics deviating >2 standard deviations from baseline.`,
    recommendation:       `Reallocate 40% of display budget to Google Search based on ROAS differential.\nPause LinkedIn campaign pending creative refresh — estimate 2-week turnaround.\nRun A/B test on email subject lines targeting 15% open rate recovery.\nIncrease mobile bid adjustments by 15% on Google Search.\nSchedule weekend campaign pause test for 2 cycles to measure impact.`,
    action_items:         `1. Creative team: Refresh LinkedIn ad copy and visuals by 2026-05-01\n2. PPC team: Implement -40% display budget reallocation in Google Ads by EOW\n3. Email team: Brief A/B subject line test for next send cycle\n4. Analytics: Add weekend vs weekday bid modifier test to campaign settings\n5. Manager review: Approve mobile bid adjustment of +15% on Google Search`,
    approved:             wf.workflow_id !== "WF-2026-005",
    report_timestamp:     SEED_WORKFLOWS.find((s) => workflowMap.get(s.workflow_id) === (wf.id as string))?.date_completed ?? null,
  }));

  if (reportRows.length > 0) {
    await db.from("final_reports").insert(reportRows);
  }

  const total = (insertedWorkflows ?? []).length;
  console.log(`[Seed] Inserted ${total} workflows + execution logs + AI logs + performance data + reports.`);

  return { seeded: true, workflowsInserted: total };
}
