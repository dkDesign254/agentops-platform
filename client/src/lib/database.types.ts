/**
 * NexusOps — Supabase database TypeScript types
 *
 * Generated from the Supabase schema. To regenerate after schema changes, run:
 *   pnpm run types:supabase
 *
 * This file is committed to source control and should be kept in sync with
 * supabase/migrations/001_nexusops_schema.sql.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          organisation: string | null;
          role: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          organisation?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          organisation?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      workflows: {
        Row: {
          id: string;
          workflow_id: string;
          workflow_name: string;
          requested_by: string | null;
          runtime_used: string | null;
          status: string | null;
          report_period: string | null;
          date_requested: string | null;
          date_completed: string | null;
          duration_mins: number | null;
          log_count: number | null;
          trigger_source: string | null;
          notes: string | null;
          created_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          workflow_name: string;
          requested_by?: string | null;
          runtime_used?: string | null;
          status?: string | null;
          report_period?: string | null;
          date_requested?: string | null;
          date_completed?: string | null;
          duration_mins?: number | null;
          log_count?: number | null;
          trigger_source?: string | null;
          notes?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          workflow_name?: string;
          requested_by?: string | null;
          runtime_used?: string | null;
          status?: string | null;
          report_period?: string | null;
          date_requested?: string | null;
          date_completed?: string | null;
          duration_mins?: number | null;
          log_count?: number | null;
          trigger_source?: string | null;
          notes?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
      };
      execution_logs: {
        Row: {
          id: string;
          log_id: string | null;
          workflow_id: string | null;
          runtime: string | null;
          step_name: string | null;
          event_type: string | null;
          status: string | null;
          timestamp: string | null;
          message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          log_id?: string | null;
          workflow_id?: string | null;
          runtime?: string | null;
          step_name?: string | null;
          event_type?: string | null;
          status?: string | null;
          timestamp?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          log_id?: string | null;
          workflow_id?: string | null;
          runtime?: string | null;
          step_name?: string | null;
          event_type?: string | null;
          status?: string | null;
          timestamp?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
      };
      ai_interaction_logs: {
        Row: {
          id: string;
          log_display_id: string | null;
          workflow_id: string | null;
          prompt_text: string | null;
          response_text: string | null;
          model_used: string | null;
          timestamp: string | null;
          cost_notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          log_display_id?: string | null;
          workflow_id?: string | null;
          prompt_text?: string | null;
          response_text?: string | null;
          model_used?: string | null;
          timestamp?: string | null;
          cost_notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          log_display_id?: string | null;
          workflow_id?: string | null;
          prompt_text?: string | null;
          response_text?: string | null;
          model_used?: string | null;
          timestamp?: string | null;
          cost_notes?: string | null;
          created_at?: string | null;
        };
      };
      performance_data: {
        Row: {
          id: string;
          campaign_name: string;
          workflow_id: string | null;
          impressions: number | null;
          clicks: number | null;
          conversions: number | null;
          spend: number | null;
          ctr: number | null;
          roas: number | null;
          reporting_period: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_name: string;
          workflow_id?: string | null;
          impressions?: number | null;
          clicks?: number | null;
          conversions?: number | null;
          spend?: number | null;
          ctr?: number | null;
          roas?: number | null;
          reporting_period?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          campaign_name?: string;
          workflow_id?: string | null;
          impressions?: number | null;
          clicks?: number | null;
          conversions?: number | null;
          spend?: number | null;
          ctr?: number | null;
          roas?: number | null;
          reporting_period?: string | null;
          created_at?: string | null;
        };
      };
      final_reports: {
        Row: {
          id: string;
          report_display_id: string | null;
          workflow_id: string | null;
          executive_summary: string | null;
          key_insights: string | null;
          risks_or_anomalies: string | null;
          recommendation: string | null;
          approved: boolean | null;
          approved_by: string | null;
          approved_at: string | null;
          report_timestamp: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          report_display_id?: string | null;
          workflow_id?: string | null;
          executive_summary?: string | null;
          key_insights?: string | null;
          risks_or_anomalies?: string | null;
          recommendation?: string | null;
          approved?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          report_timestamp?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          report_display_id?: string | null;
          workflow_id?: string | null;
          executive_summary?: string | null;
          key_insights?: string | null;
          risks_or_anomalies?: string | null;
          recommendation?: string | null;
          approved?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          report_timestamp?: string | null;
          created_at?: string | null;
        };
      };
      platform_config: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
