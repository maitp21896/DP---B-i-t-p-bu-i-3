import { Decision } from "@/types/campaign";
import { actions, monitorOptions } from "./actions";
import { BUDGET, ids, aggregates, metrics, money, dataset } from "./metrics";
export function validate(d: Decision): string[] {
  const errors: string[] = [];
  if (
    ids.some(
      (id) =>
        !Number.isFinite(d.budgets[id]) ||
        d.budgets[id] < 0 ||
        d.budgets[id] % 200000 !== 0,
    ) ||
    ids.reduce((s, id) => s + d.budgets[id], 0) !== BUDGET
  )
    errors.push("Phân bổ đủ 8.000.000 ₫, theo bước 200.000 ₫.");
  if (
    d.actions.length < 1 ||
    d.actions.length > 3 ||
    new Set(d.actions.map((a) => a.id)).size !== d.actions.length ||
    d.actions.some(
      (a) => !actions.find((x) => x.id === a.id)?.targets.includes(a.target),
    )
  )
    errors.push("Chọn 1–3 hành động với Ad Set phù hợp.");
  if (!d.rationale.trim()) errors.push("Nhập giải thích của bạn.");
  if (d.evidence.some((e) => !e.text.trim()))
    errors.push("Nhận xét đã lưu không được để trống.");
  if (
    d.monitors.length < 2 ||
    d.monitors.length > 3 ||
    new Set(d.monitors).size !== d.monitors.length ||
    d.monitors.some((m) => !monitorOptions.includes(m))
  )
    errors.push("Chọn 2–3 chỉ số theo dõi.");
  if (!d.rule.trim())
    errors.push("Nhập điều kiện điều chỉnh của bạn.");
  return errors;
}
export function evaluate(d: Decision) {
  const selected = (id: string) => d.actions.some((a) => a.id === id);
  const acquisition = d.budgets.broad + d.budgets.lal;
  const rtShare = d.budgets.rt / BUDGET;
  const broadDrop = 1 - metrics(aggregates.broad).lpvRate!;
  const trafficAction = d.actions.some(
    (a) =>
      ["speed", "tracking", "product", "page"].includes(a.id) &&
      ["broad", "all"].includes(a.target),
  );
  const fatigueAction =
    selected("rtCreative") ||
    selected("fatigue") ||
    d.actions.some(
      (a) => a.id === "recent" && ["rt", "all"].includes(a.target),
    );
  const rtFirst = metrics(
    dataset.daily.find((r) => r.id === "rt" && r.day === 1)!,
  ).cpa;
  const rtLast = metrics(
    dataset.daily.find((r) => r.id === "rt" && r.day === 7)!,
  ).cpa;
  const conflicts: string[] = [];
  if (selected("scale") && d.budgets.lal <= aggregates.lal.spend)
    conflicts.push(
      "Bạn chọn tăng Lookalike nhưng ngân sách đề xuất không tăng so với tuần trước.",
    );
  if (selected("fatigue") && d.budgets.rt >= aggregates.rt.spend)
    conflicts.push(
      "Bạn chọn giảm Retargeting nhưng phân bổ chưa thấp hơn tuần trước.",
    );
  if (selected("prospect") && d.budgets.broad === 0)
    conflicts.push("Bạn chọn duy trì Broad nhưng ngân sách Broad bằng 0.");
  const supported = d.monitors.filter(
    (m) => !["CTR (Link)", "CPM"].includes(m),
  );
  const assessment = [
    {
      name: "Chất lượng traffic",
      status: trafficAction ? "Hợp lý" : "Cần chú ý",
      reason: `Broad có ${(broadDrop * 100).toFixed(1)}% Link Click không thành LPV. ${trafficAction ? "Hành động của bạn giúp kiểm chứng chất lượng truy cập hoặc hành trình trang." : "Cân nhắc kiểm tra tracking, trang đích hoặc tốc độ tải."} Dữ liệu hiện tại chưa xác định nguyên nhân.`,
    },
    {
      name: "Khả năng mở rộng",
      status: acquisition > 0 ? "Hợp lý" : "Cần chú ý",
      reason:
        acquisition > 0
          ? `Bạn dành ${money(acquisition)} cho người mới. Theo dõi Cost/LPV và ATC Rate khi thay đổi ngân sách; hiệu suất lịch sử không đảm bảo hiệu suất khi mở rộng.`
          : "Toàn bộ ngân sách vào người đã xem sản phẩm sẽ hạn chế nguồn người mới và quy mô retargeting trong tương lai.",
    },
    {
      name: "Rủi ro lặp lại đối tượng",
      status:
        rtShare <= aggregates.rt.spend / BUDGET && fatigueAction
          ? "Hợp lý"
          : "Cần chú ý",
      reason: `Retargeting có Frequency ${aggregates.rt.frequency} và CPA ngày 1 → 7 tăng từ ${money(rtFirst!)} lên ${money(rtLast!)}. Đây là tín hiệu cần kiểm tra, chưa chứng minh creative fatigue. ${fatigueAction ? "Bạn đã có hành động theo dõi hoặc xử lý." : "Nên bổ sung kiểm tra xu hướng hoặc nội dung."}`,
    },
    {
      name: "Hiệu quả ngân sách",
      status: conflicts.length ? "Cần chú ý" : "Hợp lý",
      reason: conflicts.length
        ? conflicts.join(" ")
        : "Phân bổ và hành động không có mâu thuẫn có thể kiểm tra bằng quy tắc. CPA chỉ dùng chẩn đoán; ưu tiên traffic chất lượng và chi phí LPV.",
    },
    {
      name: "Chất lượng bằng chứng",
      status: "Chờ giảng viên",
      reason:
        "Nhận xét, giả thuyết và lập luận được giữ nguyên để giảng viên đánh giá. Hệ thống không hiểu ngữ nghĩa văn bản tự do hoặc xác nhận quan hệ nhân quả.",
    },
  ];
  const structured = [
    {
      name: "Phân bổ & đánh đổi",
      weight: 25,
      points:
        (acquisition > 0 ? 12 : 0) +
        (conflicts.length === 0 ? 8 : 0) +
        (d.budgets.rt === 0 || fatigueAction ? 5 : 0),
    },
    {
      name: "Hành động cụ thể & khả thi",
      weight: 30,
      points:
        Math.min(15, d.actions.length * 5) +
        (trafficAction ? 8 : 0) +
        (fatigueAction ? 7 : 0),
    },
    {
      name: "Theo dõi & điều chỉnh",
      weight: 15,
      points: Math.min(10, supported.length * 5) + (d.rule.trim() ? 5 : 0),
    },
  ];
  return {
    assessment,
    conflicts,
    structured,
    indicative: structured.reduce((s, x) => s + x.points, 0),
    pending: 30,
    risks: [
      ...(rtShare > 0
        ? "Frequency cao của Retargeting cần theo dõi theo thời gian; không có Reach/Frequency hằng ngày.".split(
            "|",
          )
        : []),
      "Chưa có phân tích placement, thiết bị hoặc tốc độ trang để kiểm chứng nguyên nhân.",
      ...(supported.length < d.monitors.length
        ? [
            "CTR/CPM cần bổ sung impressions; chưa thể theo dõi từ bộ dữ liệu này.",
          ]
        : []),
    ],
  };
}
