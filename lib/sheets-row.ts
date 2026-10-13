import { StoredSubmission } from "@/types/campaign";
import { actions } from "@/lib/actions";
import { shortNames } from "@/lib/metrics";
export const sheetsHeaders = [
  "Mã bài nộp",
  "Họ và tên",
  "Mã lớp",
  "Nộp lúc (giờ Việt Nam)",
  "Broad (VND)",
  "Lookalike (VND)",
  "Retargeting (VND)",
  "Bài 1: giải thích ngân sách",
  "Nhận xét về data hiện tại",
  "Bài 2: hành động tối ưu",
  "Bài 3: KPI theo dõi",
  "Bài 3: điều kiện điều chỉnh",
];
export function sheetsRow(record: StoredSubmission): (string | number)[] {
  const d = record.final_proposal;
  return [
    record.id,
    record.student_name,
    record.class_code,
    new Date(record.submitted_at).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    }),
    d.budgets.broad,
    d.budgets.lal,
    d.budgets.rt,
    d.rationale,
    d.evidence.map((e) => e.text).join("\n"),
    d.actions
      .map(
        (a) =>
          `${actions.find((x) => x.id === a.id)?.label || a.id} (${a.target === "all" ? "Toàn chiến dịch" : shortNames[a.target]})`,
      )
      .join("\n"),
    d.monitors.join(" · "),
    d.rule,
  ];
}
