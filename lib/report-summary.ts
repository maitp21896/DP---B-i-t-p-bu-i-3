import { Identity } from "@/lib/submissions/schema";
import { Decision } from "@/types/campaign";
import { ids, money, shortNames } from "@/lib/metrics";
import { actions } from "@/lib/actions";
import { evaluate } from "@/lib/simulation";
export function summary(d: Decision, identity?: Identity, reference?: string) {
  return `GLOW NATURE — ĐỀ XUẤT TỐI ƯU CHIẾN DỊCH\n${identity ? `Học viên: ${identity.studentName} | Mã lớp: ${identity.classCode}\n` : ""}${reference ? `Mã bài nộp: ${reference}\n` : ""}Mục tiêu: Traffic | Ngân sách 7 ngày: 8.000.000 ₫\n\nPHÂN BỔ\n${ids.map((id) => `${shortNames[id]}: ${money(d.budgets[id])} (${((d.budgets[id] / 8000000) * 100).toFixed(1)}%)`).join("\n")}\n\nPHÁT HIỆN\n${d.evidence.map((e) => `${e.kind === "observation" ? "Quan sát" : "Giả thuyết"}: ${e.text}`).join("\n")}\n\nHÀNH ĐỘNG\n${d.actions.map((a) => `${actions.find((x) => x.id === a.id)?.label} — ${a.target === "all" ? "Toàn chiến dịch" : shortNames[a.target]}`).join("\n")}\n\nLẬP LUẬN\n${d.rationale}\n\nTHEO DÕI\n${d.monitors.join(", ")}\n${d.rule}\n\nRỦI RO\n${evaluate(d).risks.join("\n")}`;
}
