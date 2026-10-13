// Test-only component harness. This is not an application route or a login bypass.
import { createRoot } from "react-dom/client";
import TrainerDashboard from "@/components/TrainerDashboard";
import { Decision, StoredSubmission } from "@/types/campaign";
import { evaluate } from "@/lib/simulation";
import { dataset } from "@/lib/metrics";
const initial: Decision = {
  budgets: { broad: 3000000, lal: 3000000, rt: 2000000 },
  actions: [
    { id: "speed", target: "broad" },
    { id: "rtCreative", target: "rt" },
  ],
  rationale:
    "Broad có LPV Rate 52%, thấp hơn Lookalike. Tôi giữ nguồn traffic mới và kiểm tra tốc độ mobile để kiểm chứng nguyên nhân. Retargeting có Frequency 6,8 và CPA tăng; đây là tín hiệu cần theo dõi, chưa đủ để kết luận đã bão hòa.",
  evidence: [
    {
      kind: "observation",
      text: "Broad có LPV Rate 52%, Lookalike 70%. Retargeting có Frequency 6,8.",
    },
  ],
  monitors: ["Cost / LPV", "ATC Rate"],
  rule: "Nếu Cost/LPV tăng trên 20% trong ba ngày đồng thời ATC Rate giảm, tôi sẽ kiểm tra placement và tạm dừng tăng ngân sách.",
};
const revised: Decision = {
  ...initial,
  budgets: { broad: 2800000, lal: 3600000, rt: 1600000 },
  actions: [...initial.actions, { id: "scale", target: "lal" }],
  rationale:
    initial.rationale +
    " Sau phản hồi, tôi tăng Lookalike từng bước và giảm Retargeting để kiểm tra đánh đổi về quy mô.",
};
const record: StoredSubmission = {
  id: "11111111-1111-4111-8111-111111111111",
  student_name: "Học Viên Mẫu",
  class_code: "TEST01",
  submitted_at: "2026-10-13T05:30:00.000Z",
  status: "submitted",
  versions: [initial, revised],
  feedback: [evaluate(initial), evaluate(revised)],
  final_proposal: revised,
  final_version: 1,
  final_score: evaluate(revised).indicative,
  data_version: dataset.sha256,
};
createRoot(document.getElementById("root")!).render(
  <div className="trainer-shell">
    <header className="trainer-header no-print">
      <strong>TOMORROW MARKETERS · TRAINER</strong>
      <span className="badge warning">
        Dữ liệu kiểm thử giao diện · Chưa kết nối Supabase
      </span>
    </header>
    <main>
      <div className="page-title no-print">
        <div>
          <span className="eyebrow">BẢN KIỂM THỬ THÀNH PHẦN</span>
          <h1>Không gian đánh giá bài nộp</h1>
          <p>Bài ví dụ cho kiểm thử UI, không phải bài học viên đã nộp.</p>
        </div>
      </div>
      <TrainerDashboard
        request={async (body) => {
          if (body.id) return { submission: record };
          const match =
            (!body.class || body.class === record.class_code) &&
            (!body.search || record.student_name.includes(String(body.search)));
          return { submissions: match ? [record] : [], total: match ? 1 : 0 };
        }}
      />
    </main>
  </div>,
);
