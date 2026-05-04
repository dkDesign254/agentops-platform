/**
 * NexusOps — Client-side Airtable reader
 *
 * Reads the 5 SUPPORTING tables from Airtable directly in the browser.
 * The 5 core governance tables (workflows, logs, etc.) are read from
 * Supabase which is synced server-side — this file is for config-type
 * data that doesn't need realtime: pricing, integrations, tour content,
 * translations, and platform config.
 *
 * Rate limit: 5 req/s per base. A 200ms throttle is applied between
 * paginated requests to stay well within limits.
 *
 * Required env vars:
 *   VITE_AIRTABLE_TOKEN    — Airtable personal access token
 *   VITE_AIRTABLE_BASE_ID  — Defaults to app4DDa3zvaGspOhz
 */

const TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN as string | undefined;
const BASE  = (import.meta.env.VITE_AIRTABLE_BASE_ID as string | undefined) ?? "app4DDa3zvaGspOhz";
const BASE_URL = `https://api.airtable.com/v0/${BASE}`;

// ─── Table IDs ────────────────────────────────────────────────────────────────

export const TABLE_IDS = {
  platformConfig:    "tbl3JaS3SAuDElVjS",
  translations:      "tbl4qXtm02u7fBTjj",
  pricingPlans:      "tblzpl7KOGfcyQAOX",
  integrationRegistry: "tblVmcaXwPPrlpvAO",
  tourContent:       "tblM4Gl3WKHAwstYq",
} as const;

// ─── Generic types ────────────────────────────────────────────────────────────

interface AirtableRecord<T> {
  id: string;
  createdTime: string;
  fields: T;
}

interface AirtableListResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

interface FetchAllParams {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: "asc" | "desc" }>;
  fields?: string[];
  maxRecords?: number;
}

/** Simple delay helper for rate-limit throttle. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches all records from an Airtable table, automatically following
 * pagination offsets. Applies a 200ms throttle between paginated requests.
 */
async function fetchAll<T>(tableId: string, params: FetchAllParams = {}): Promise<AirtableRecord<T>[]> {
  if (!TOKEN) {
    console.warn("[NexusOps/Airtable] VITE_AIRTABLE_TOKEN is not set. Airtable reads will return empty.");
    return [];
  }

  const allRecords: AirtableRecord<T>[] = [];
  let offset: string | undefined;
  let isFirstRequest = true;

  do {
    if (!isFirstRequest) await sleep(200);
    isFirstRequest = false;

    const url = new URL(`${BASE_URL}/${tableId}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    if (params.filterByFormula) url.searchParams.set("filterByFormula", params.filterByFormula);
    if (params.maxRecords) url.searchParams.set("maxRecords", String(params.maxRecords));
    if (params.fields?.length) {
      params.fields.forEach((f) => url.searchParams.append("fields[]", f));
    }
    if (params.sort?.length) {
      params.sort.forEach((s, i) => {
        url.searchParams.set(`sort[${i}][field]`, s.field);
        url.searchParams.set(`sort[${i}][direction]`, s.direction);
      });
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`[Airtable] ${res.status} ${res.statusText}: ${text}`);
    }

    const data: AirtableListResponse<T> = await res.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

// ─── Pricing Plans ────────────────────────────────────────────────────────────

export interface PricingPlan {
  recordId: string;
  name: string;
  slug: string;
  monthlyPriceUsd: number | null;
  annualPriceUsd: number | null;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  workflowLimit: number;   // -1 = unlimited
  seatsIncluded: number;   // -1 = unlimited
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  tier: string | null;
}

interface PricingPlanFields {
  "Plan Name"?: string;
  "Plan Slug"?: string;
  "Monthly Price USD"?: number;
  "Annual Price USD"?: number;
  "Description"?: string;
  "Features JSON"?: string;
  "Is Popular"?: boolean;
  "Is Active"?: boolean;
  "Sort Order"?: number;
  "Workflow Limit"?: number;
  "Seats Included"?: number;
  "Stripe Price ID Monthly"?: string;
  "Stripe Price ID Annual"?: string;
  "Tier"?: string;
}

/**
 * Fetches all active pricing plans from Airtable, sorted by Sort Order.
 */
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const records = await fetchAll<PricingPlanFields>(TABLE_IDS.pricingPlans, {
    filterByFormula: "{Is Active}",
    sort: [{ field: "Sort Order", direction: "asc" }],
  });

  return records.map((r) => {
    let features: string[] = [];
    try {
      const raw = r.fields["Features JSON"];
      if (raw) features = JSON.parse(raw) as string[];
    } catch {
      features = [];
    }
    return {
      recordId: r.id,
      name: r.fields["Plan Name"] ?? "Plan",
      slug: r.fields["Plan Slug"] ?? r.id,
      monthlyPriceUsd: r.fields["Monthly Price USD"] ?? null,
      annualPriceUsd: r.fields["Annual Price USD"] ?? null,
      description: r.fields["Description"] ?? "",
      features,
      isPopular: r.fields["Is Popular"] ?? false,
      isActive: r.fields["Is Active"] ?? false,
      sortOrder: r.fields["Sort Order"] ?? 0,
      workflowLimit: r.fields["Workflow Limit"] ?? -1,
      seatsIncluded: r.fields["Seats Included"] ?? -1,
      stripePriceIdMonthly: r.fields["Stripe Price ID Monthly"] ?? null,
      stripePriceIdAnnual: r.fields["Stripe Price ID Annual"] ?? null,
      tier: r.fields["Tier"] ?? null,
    };
  });
}

// ─── Integration Registry ─────────────────────────────────────────────────────

export interface Integration {
  recordId: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  status: "Live" | "Beta" | "Coming Soon";
  webhookSupported: boolean;
  oauthSupported: boolean;
  autoBuildSupported: boolean;
  docsUrl: string | null;
  sortOrder: number;
}

interface IntegrationFields {
  "Integration Name"?: string;
  "Slug"?: string;
  "Category"?: string;
  "Description"?: string;
  "Status"?: string;
  "Webhook Supported"?: boolean;
  "OAuth Supported"?: boolean;
  "Auto Build Supported"?: boolean;
  "Docs URL"?: string;
  "Sort Order"?: number;
}

/**
 * Fetches integrations from the Integration Registry.
 * @param status - Optional filter: "Live" | "Beta" | "Coming Soon"
 */
export async function fetchIntegrations(status?: string): Promise<Integration[]> {
  const params: FetchAllParams = {
    sort: [{ field: "Sort Order", direction: "asc" }],
  };
  if (status) {
    params.filterByFormula = `{Status} = "${status}"`;
  }

  const records = await fetchAll<IntegrationFields>(TABLE_IDS.integrationRegistry, params);

  return records.map((r) => ({
    recordId: r.id,
    name: r.fields["Integration Name"] ?? "Integration",
    slug: r.fields["Slug"] ?? r.id,
    category: r.fields["Category"] ?? "Other",
    description: r.fields["Description"] ?? "",
    status: (r.fields["Status"] ?? "Coming Soon") as Integration["status"],
    webhookSupported: r.fields["Webhook Supported"] ?? false,
    oauthSupported: r.fields["OAuth Supported"] ?? false,
    autoBuildSupported: r.fields["Auto Build Supported"] ?? false,
    docsUrl: r.fields["Docs URL"] ?? null,
    sortOrder: r.fields["Sort Order"] ?? 0,
  }));
}

// ─── Tour and Help Content ────────────────────────────────────────────────────

export type TourContentType = "tour_step" | "tooltip" | "gaia_context" | "onboarding" | "empty_state";

export interface TourStep {
  recordId: string;
  helpKey: string;
  type: TourContentType;
  page: string;
  title: string;
  bodyText: string;
  tourStepOrder: number;
  ctaLabel: string | null;
  ctaAction: string | null;
  targetElementSelector: string | null;
  active: boolean;
}

interface TourContentFields {
  "Help Key"?: string;
  "Type"?: string;
  "Page"?: string;
  "Title"?: string;
  "Body Text"?: string;
  "Tour Step Order"?: number;
  "CTA Label"?: string;
  "CTA Action"?: string;
  "Target Element Selector"?: string;
  "Active"?: boolean;
}

/**
 * Fetches tour/help content for a given page, sorted by Tour Step Order.
 * @param page - Page identifier e.g. "dashboard", "workflows"
 * @param type - Optional type filter e.g. "tour_step"
 */
export async function fetchTourContent(page: string, type?: TourContentType): Promise<TourStep[]> {
  let formula = `AND({Page} = "${page}", {Active})`;
  if (type) formula = `AND({Page} = "${page}", {Type} = "${type}", {Active})`;

  const records = await fetchAll<TourContentFields>(TABLE_IDS.tourContent, {
    filterByFormula: formula,
    sort: [{ field: "Tour Step Order", direction: "asc" }],
  });

  return records.map((r) => ({
    recordId: r.id,
    helpKey: r.fields["Help Key"] ?? r.id,
    type: (r.fields["Type"] ?? "tooltip") as TourContentType,
    page: r.fields["Page"] ?? page,
    title: r.fields["Title"] ?? "",
    bodyText: r.fields["Body Text"] ?? "",
    tourStepOrder: r.fields["Tour Step Order"] ?? 0,
    ctaLabel: r.fields["CTA Label"] ?? null,
    ctaAction: r.fields["CTA Action"] ?? null,
    targetElementSelector: r.fields["Target Element Selector"] ?? null,
    active: r.fields["Active"] ?? false,
  }));
}

// ─── Platform Config ──────────────────────────────────────────────────────────

export interface ConfigItem {
  recordId: string;
  key: string;
  value: string;
  category: string;
}

interface PlatformConfigFields {
  "Key"?: string;
  "Value"?: string;
  "Category"?: string;
}

/**
 * Fetches platform configuration records, optionally filtered by category.
 * @param category - Optional category filter e.g. "gaia", "ui", "limits"
 */
export async function fetchPlatformConfig(category?: string): Promise<ConfigItem[]> {
  const params: FetchAllParams = {};
  if (category) {
    params.filterByFormula = `{Category} = "${category}"`;
  }

  const records = await fetchAll<PlatformConfigFields>(TABLE_IDS.platformConfig, params);

  return records.map((r) => ({
    recordId: r.id,
    key: r.fields["Key"] ?? r.id,
    value: r.fields["Value"] ?? "",
    category: r.fields["Category"] ?? "",
  }));
}
