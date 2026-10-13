export type AdId = "broad" | "lal" | "rt";
export type Counts = {
  spend: number;
  clicks: number;
  lpv: number;
  atc: number;
  purchases: number;
};
export type Daily = Counts & { day: number; id: AdId };
export type Metric = "cpa" | "cpc" | "costLpv" | "lpvRate" | "atcRate";
export type Evidence = { text: string; kind: "observation" | "hypothesis" };
export type Decision = {
  budgets: Record<AdId, number>;
  actions: { id: string; target: AdId | "all" }[];
  rationale: string;
  evidence: Evidence[];
  monitors: string[];
  rule: string;
};
export type Session = Decision & {
  stage: number;
  started: number;
  timer: boolean;
  submissions: Decision[];
};
