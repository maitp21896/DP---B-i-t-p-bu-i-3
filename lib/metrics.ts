import raw from "@/data/campaign.json";
import { AdId, Counts, Daily, Metric } from "@/types/campaign";
export const ids: AdId[] = ["broad", "lal", "rt"];
export const dataset = {
  ...raw,
  daily: raw.daily as Daily[],
  adSets: raw.adSets as {
    id: AdId;
    name: string;
    reach: number;
    frequency: number;
  }[],
};
export const ratio = (n: number, d: number): number | null =>
  d > 0 ? n / d : null;
export function totals(rows: Counts[]): Counts {
  return rows.reduce(
    (a, r) => ({
      spend: a.spend + r.spend,
      clicks: a.clicks + r.clicks,
      lpv: a.lpv + r.lpv,
      atc: a.atc + r.atc,
      purchases: a.purchases + r.purchases,
    }),
    { spend: 0, clicks: 0, lpv: 0, atc: 0, purchases: 0 },
  );
}
export function metrics(c: Counts) {
  return {
    cpa: ratio(c.spend, c.purchases),
    cpc: ratio(c.spend, c.clicks),
    costLpv: ratio(c.spend, c.lpv),
    lpvRate: ratio(c.lpv, c.clicks),
    atcRate: ratio(c.atc, c.lpv),
  };
}
export const aggregates = Object.fromEntries(
  ids.map((id) => [
    id,
    {
      ...totals(dataset.daily.filter((r) => r.id === id)),
      ...dataset.adSets.find((s) => s.id === id)!,
    },
  ]),
) as Record<
  AdId,
  Counts & { id: AdId; name: string; reach: number; frequency: number }
>;
export const overall = totals(dataset.daily);
export const money = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
export const number = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
export const metricNames: Record<Metric, string> = {
  cpa: "CPA",
  cpc: "CPC",
  costLpv: "Cost / LPV",
  lpvRate: "LPV Rate",
  atcRate: "ATC Rate",
};
export const displayMetric = (value: number | null, key: Metric) =>
  value === null
    ? "N/A"
    : key.endsWith("Rate")
      ? `${(value * 100).toFixed(1)}%`
      : money(value);
export const shortNames: Record<AdId, string> = {
  broad: "Broad",
  lal: "Lookalike 1%",
  rt: "Retargeting",
};
export const BUDGET = 8000000;
export function clampBudget(b: Record<AdId, number>, id: AdId, value: number) {
  const next = {
    ...b,
    [id]: Math.max(0, Math.min(BUDGET, Math.round(value / 200000) * 200000)),
  };
  let excess = ids.reduce((sum, key) => sum + next[key], 0) - BUDGET;
  // Transfer from the largest other allocation first, in the same 200k steps.
  const others = ids
    .filter((key) => key !== id)
    .sort((a, c) => next[c] - next[a]);
  for (const key of others) {
    const reduction = Math.min(next[key], Math.max(0, excess));
    next[key] -= reduction;
    excess -= reduction;
  }
  return next;
}
