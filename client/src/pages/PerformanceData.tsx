import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  BarChart2,
  CalendarRange,
  DollarSign,
  Eye,
  Loader2,
  MousePointerClick,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Colour palette for campaign bars ─────────────────────────────────────────

const CAMPAIGN_COLORS = [
  "hsl(221 83% 63%)",
  "hsl(245 58% 60%)",
  "hsl(152 69% 45%)",
  "hsl(38 92% 55%)",
  "hsl(330 70% 58%)",
  "hsl(190 80% 50%)",
  "hsl(20 85% 55%)",
  "hsl(270 60% 60%)",
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs max-w-[220px]">
      <p className="font-semibold text-foreground mb-2 break-words">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground tabular-nums">
            {p.name === "Spend (USD)" ? `$${p.value.toFixed(2)}` : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-opacity-10 shrink-0 ${color}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
        <p className="text-base font-semibold tabular-nums text-foreground mt-0.5">{value}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ─── X-axis tick that wraps long campaign names ───────────────────────────────

function CampaignTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  const name = payload?.value ?? "";
  // Split on " – " or " - " or space to wrap at ~12 chars per line
  const words = name.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > 12 && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={0}
          dy={12 + i * 12}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={9}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

// ─── Date-range helpers ───────────────────────────────────────────────────────

function parseStartDate(period: string | null | undefined): Date | null {
  if (!period) return null;
  const raw = period.split(/\s+to\s+/i)[0].trim();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerformanceData() {
  const { data: perfData, isLoading } = trpc.airtable.performanceData.useQuery({});

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredData = useMemo(() => {
    if (!perfData) return [];
    if (!startDate && !endDate) return perfData;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + "T23:59:59") : null;
    return perfData.filter((row) => {
      const d = parseStartDate(row.reportingPeriod);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [perfData, startDate, endDate]);

  const hasFilter = startDate || endDate;

  const totals = filteredData.reduce(
    (acc, row) => ({
      impressions: acc.impressions + row.impressions,
      clicks: acc.clicks + row.clicks,
      conversions: acc.conversions + row.conversions,
      spend: acc.spend + row.spend,
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
  );

  const overallCtr =
    totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : "0.00";

  const costPerConversion =
    totals.conversions > 0
      ? (totals.spend / totals.conversions).toFixed(2)
      : "0.00";

  // Full campaign names — no truncation for chart labels
  const chartData = filteredData.map((row) => ({
    name: row.campaignName,
    Impressions: row.impressions,
    Clicks: row.clicks,
    Conversions: row.conversions,
    "Spend (USD)": row.spend,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Performance Data
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Marketing campaign metrics sourced from Airtable — tracking impressions, clicks,
            conversions, and advertising spend across all active campaigns.
          </p>
        </div>

        {/* Date-range filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground shrink-0">
            <CalendarRange className="w-4 h-4 text-primary" />
            Filter by Reporting Period
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">From</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-36 bg-muted/30 border-border/60"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">To</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-36 bg-muted/30 border-border/60"
              />
            </div>
            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                <X className="w-3 h-3" />
                Clear filter
              </Button>
            )}
          </div>
          {hasFilter && (
            <span className="text-xs text-primary font-medium shrink-0">
              {filteredData.length} of {perfData?.length ?? 0} campaigns shown
            </span>
          )}
        </div>

        {/* Summary Cards */}
        {filteredData.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Summary{hasFilter ? " (filtered period)" : " — All Campaigns"}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <StatCard
                label="Total Impressions"
                value={totals.impressions.toLocaleString()}
                sublabel="Ad views across all campaigns"
                icon={Eye}
                color="text-blue-400"
              />
              <StatCard
                label="Total Clicks"
                value={totals.clicks.toLocaleString()}
                sublabel="Users who clicked an ad"
                icon={MousePointerClick}
                color="text-indigo-400"
              />
              <StatCard
                label="Total Conversions"
                value={totals.conversions.toLocaleString()}
                sublabel="Goal completions"
                icon={Target}
                color="text-emerald-400"
              />
              <StatCard
                label="Total Spend"
                value={`$${totals.spend.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                sublabel="Total advertising budget used"
                icon={DollarSign}
                color="text-amber-400"
              />
              <StatCard
                label="Click-Through Rate"
                value={`${overallCtr}%`}
                sublabel="Clicks ÷ Impressions"
                icon={TrendingUp}
                color="text-cyan-400"
              />
              <StatCard
                label="Cost per Conversion"
                value={`$${costPerConversion}`}
                sublabel="Spend ÷ Conversions"
                icon={BarChart2}
                color="text-rose-400"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !perfData || perfData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-accent text-muted-foreground">
              <BarChart2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No performance data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Campaign metrics will appear here once data is added to Airtable.
              </p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-accent text-muted-foreground">
              <CalendarRange className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No campaigns in this date range</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting the start or end date, or clear the filter to see all campaigns.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">Campaign Charts</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Visual breakdown of key metrics per campaign. Hover over any bar for exact values.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Impressions & Clicks */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-0.5">
                    Impressions vs. Clicks
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    How many people saw each ad versus how many clicked through.
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={<CampaignTick />} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="Impressions" fill="hsl(221 83% 63%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Clicks" fill="hsl(245 58% 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Conversions */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-0.5">
                    Conversions per Campaign
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Number of completed goals (purchases, sign-ups, etc.) attributed to each campaign.
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={<CampaignTick />} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="Conversions" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Spend */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-0.5">
                    Advertising Spend per Campaign (USD)
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Total budget consumed by each campaign during the selected period.
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -4, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={<CampaignTick />} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="Spend (USD)" fill="hsl(38 92% 55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Clicks → Conversions funnel */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-0.5">
                    Clicks to Conversions — Funnel View
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Compares clicks against conversions to reveal which campaigns convert visitors most efficiently.
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={<CampaignTick />} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="Clicks" fill="hsl(245 58% 60%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Conversions" fill="hsl(152 69% 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Campaign Records
                    {hasFilter && (
                      <span className="text-muted-foreground font-normal ml-1">
                        — {filteredData.length} shown (filtered)
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Raw performance data rows from Airtable. Derived metrics (Click-Through Rate,
                    Conversion Rate, Cost per Click) are calculated from the source figures.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {[
                          { label: "Campaign Name", title: "" },
                          { label: "Impressions", title: "Total ad views" },
                          { label: "Clicks", title: "Users who clicked" },
                          { label: "Conversions", title: "Completed goals" },
                          { label: "Spend (USD)", title: "Budget consumed" },
                          { label: "Click-Through Rate", title: "Clicks ÷ Impressions × 100" },
                          { label: "Conversion Rate", title: "Conversions ÷ Clicks × 100" },
                          { label: "Cost per Click", title: "Spend ÷ Clicks" },
                          { label: "Reporting Period", title: "" },
                        ].map(({ label, title }) => (
                          <th
                            key={label}
                            title={title}
                            className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, idx) => {
                        const ctr =
                          row.impressions > 0
                            ? ((row.clicks / row.impressions) * 100).toFixed(2)
                            : "0.00";
                        const convRate =
                          row.clicks > 0
                            ? ((row.conversions / row.clicks) * 100).toFixed(2)
                            : "0.00";
                        const cpc =
                          row.clicks > 0
                            ? (row.spend / row.clicks).toFixed(2)
                            : "0.00";
                        return (
                          <tr
                            key={row.recordId}
                            className={`border-b border-border last:border-0 hover:bg-accent/10 transition-colors ${
                              idx % 2 === 0 ? "bg-card" : "bg-background"
                            }`}
                          >
                            <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ background: CAMPAIGN_COLORS[idx % CAMPAIGN_COLORS.length] }}
                                />
                                {row.campaignName}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                              {row.impressions.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                              {row.clicks.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs text-emerald-400 tabular-nums">
                              {row.conversions.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs text-amber-400 tabular-nums">
                              ${row.spend.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-xs text-blue-400 tabular-nums">
                              {ctr}%
                            </td>
                            <td className="px-4 py-3 text-xs text-cyan-400 tabular-nums">
                              {convRate}%
                            </td>
                            <td className="px-4 py-3 text-xs text-indigo-400 tabular-nums">
                              ${cpc}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                              {row.reportingPeriod ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
