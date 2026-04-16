# AgentOps Platform — TODO

## Phase 1: Database Schema
- [x] Add Workflows table to drizzle/schema.ts
- [x] Add ExecutionLogs table to drizzle/schema.ts
- [x] Add AI_Logs table to drizzle/schema.ts
- [x] Add Reports table to drizzle/schema.ts
- [x] Generate and apply migration SQL

## Phase 2: Backend API
- [x] Workflow CRUD procedures (create, list, getById, updateStatus)
- [x] ExecutionLog procedures (create, listByWorkflow)
- [x] AI_Log procedures (create, listByWorkflow)
- [x] Report procedures (create, getByWorkflow)
- [x] Inbound webhook endpoint for Make (/api/webhooks/make)
- [x] Inbound webhook endpoint for n8n (/api/webhooks/n8n)
- [x] Outbound runtime routing logic (dispatch to Make or n8n)
- [x] AI-powered report generation using invokeLLM
- [x] server/db.ts helpers for all tables

## Phase 3: Frontend Layout & Dashboard
- [x] Design system: color palette, typography, global CSS
- [x] DashboardLayout integration with sidebar nav
- [x] Dashboard overview page with stats cards and workflow table
- [x] Status badge components
- [x] Runtime badge components

## Phase 4: Workflow Pages
- [x] Workflow intake form page (create new workflow)
- [x] Workflow detail page with drill-down tabs
- [x] Execution logs tab with timeline view
- [x] Error highlighting in execution logs

## Phase 5: AI Logs, Reports, Webhooks
- [x] AI logs view per workflow
- [x] Reports view with structured output (summary, insights, risks, recommendations)
- [x] Webhook simulation panel for testing inbound events
- [x] Full audit trail view per workflow

## Phase 6: Tests & Polish
- [x] Vitest tests for workflow router
- [x] Vitest tests for webhook handlers
- [x] Final UI polish and responsive design
- [x] Checkpoint and delivery

## Airtable Integration
- [x] Store AIRTABLE_API_KEY and AIRTABLE_BASE_ID as secrets
- [x] Build server/airtable.ts client with typed fetchers for all 5 tables
- [x] Build server/routers/airtable.ts tRPC router exposing all 5 tables
- [x] Register airtable router in server/routers.ts
- [x] Update Dashboard page to show Airtable workflow data + stats
- [x] Update WorkflowDetail page to show Airtable execution + AI + report data
- [x] Update ReportsPage to show Airtable Final Report data
- [x] Add PerformanceData page with metrics table and KPI summary cards
- [x] Add Performance Data nav item to sidebar
- [x] Write Vitest tests for Airtable router
- [x] Checkpoint and deliver

## Enterprise SaaS Upgrade
- [x] Design system: dark/light theme toggle (persistent), premium color tokens, Inter font
- [x] Global CSS overhaul: spacing scale, shadow system, animation tokens
- [x] Topbar component: live sync indicator, theme toggle, breadcrumbs, user menu
- [x] Enhanced sidebar: collapsible groups, active states, keyboard nav
- [x] Dashboard: health score card, success rate, AI insights panel (LLM-generated)
- [x] Dashboard: recent alerts / anomalies section
- [x] Dashboard: search + filter (status, runtime, date) + sort on workflow table
- [x] WorkflowDetail: execution timeline (step-by-step visual trace)
- [x] WorkflowDetail: AI interaction trace view (prompt/response panels)
- [x] WorkflowDetail: error inspection panel with full error details
- [x] WorkflowDetail: audit trail visualization
- [x] Reports: Executive Summary card view
- [x] Reports: Approve Report button (Airtable PATCH writeback)
- [x] Reports: Export mock (PDF/JSON download)
- [x] Enterprise: system logs panel page
- [x] Enterprise: usage metrics (workflow count, AI call count)
- [x] Enterprise: billing/plan tiers UI (Starter, Pro, Enterprise)
- [x] Enterprise: role-based UI placeholders (Admin, Analyst)
- [x] Polish: skeleton loading states across all pages
- [x] Polish: empty states with illustrations/icons
- [x] Polish: micro-interactions (hover, transition, focus)
- [x] Polish: data freshness / last-updated indicators
- [x] Tests: 32 Vitest tests passing (0 failures)
- [x] Checkpoint and deliver
