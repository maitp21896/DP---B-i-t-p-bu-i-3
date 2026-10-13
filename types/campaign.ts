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
  identity: { studentName: string; classCode: string };
  sessionId: string;
  receiptToken: string;
  delivery: DeliveryReceipt | null;
  pendingSubmission: import("@/lib/submissions/schema").SubmissionInput | null;
};
export type DeliveryReceipt = {
  id: string;
  submittedAt: string;
  status: "submitted";
};
export type StoredSubmission = {
  id: string;
  student_name: string;
  class_code: string;
  submitted_at: string;
  status: "submitted";
  versions: Decision[];
  final_proposal: Decision;
  final_version: number;
  final_score: number;
  feedback: ReturnType<typeof import("@/lib/simulation").evaluate>[];
  data_version: string;
};
