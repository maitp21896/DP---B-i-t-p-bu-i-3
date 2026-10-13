import ExcelJS from "exceljs";
import { StoredSubmission } from "@/types/campaign";
import { actions } from "@/lib/actions";
import { shortNames } from "@/lib/metrics";
export async function classWorkbook(records: StoredSubmission[]) {
  const book = new ExcelJS.Workbook();
  book.creator = "Tomorrow Marketers Academy";
  const sheet = book.addWorksheet("Tong hop lop");
  sheet.columns = [
    { header: "Mã bài nộp", key: "id", width: 38 },
    { header: "Họ và tên", key: "name", width: 25 },
    { header: "Mã lớp", key: "class", width: 12 },
    { header: "Nộp lúc (giờ Việt Nam)", key: "date", width: 24 },
    { header: "Broad (VND)", key: "broad", width: 18 },
    { header: "Lookalike (VND)", key: "lal", width: 18 },
    { header: "Retargeting (VND)", key: "rt", width: 18 },
    {
      header: "Bài 1: giải thích ngân sách (nguyên văn)",
      key: "rationale",
      width: 65,
    },
    { header: "Bằng chứng / giả thuyết", key: "evidence", width: 60 },
    { header: "Bài 2: hành động tối ưu", key: "actions", width: 65 },
    { header: "Bài 3: KPI theo dõi", key: "monitors", width: 30 },
    {
      header: "Bài 3: điều kiện điều chỉnh (nguyên văn)",
      key: "rule",
      width: 60,
    },
    { header: "Điểm cấu trúc tham khảo /70", key: "score", width: 20 },
    { header: "Số phiên bản", key: "versions", width: 15 },
  ];
  const history = book.addWorksheet("Lich su va phan hoi");
  history.columns = [
    { header: "Mã bài nộp", key: "id", width: 38 },
    { header: "Họ và tên", key: "name", width: 25 },
    { header: "Mã lớp", key: "class", width: 12 },
    { header: "Phiên bản", key: "version", width: 15 },
    { header: "Broad (VND)", key: "broad", width: 18 },
    { header: "Lookalike (VND)", key: "lal", width: 18 },
    { header: "Retargeting (VND)", key: "rt", width: 18 },
    { header: "Lập luận nguyên văn", key: "rationale", width: 65 },
    { header: "Quan sát / giả thuyết", key: "evidence", width: 60 },
    { header: "Hành động & Ad Set", key: "actions", width: 65 },
    { header: "KPI", key: "monitors", width: 30 },
    { header: "Điều kiện điều chỉnh", key: "rule", width: 60 },
    { header: "Phản hồi mô phỏng đã lưu", key: "feedback", width: 75 },
  ];
  const decisionRow = (d: StoredSubmission["final_proposal"]) => ({
    broad: d.budgets.broad,
    lal: d.budgets.lal,
    rt: d.budgets.rt,
    rationale: d.rationale,
    evidence: d.evidence
      .map(
        (e) =>
          `${e.kind === "observation" ? "Quan sát" : "Giả thuyết"}: ${e.text}`,
      )
      .join("\n"),
    actions: d.actions
      .map(
        (a) =>
          `${actions.find((x) => x.id === a.id)?.label || a.id} — ${a.target === "all" ? "Toàn chiến dịch" : shortNames[a.target]}`,
      )
      .join("\n"),
    monitors: d.monitors.join(" · "),
    rule: d.rule,
  });
  for (const r of records) {
    const base = { id: r.id, name: r.student_name, class: r.class_code };
    sheet.addRow({
      ...base,
      ...decisionRow(r.final_proposal),
      date: new Date(r.submitted_at).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
      score: r.final_score,
      versions: r.versions.length,
    });
    r.versions.forEach((d, i) =>
      history.addRow({
        ...base,
        ...decisionRow(d),
        version: i + 1,
        feedback:
          r.feedback[i]?.assessment
            .map((a) => `${a.name}: ${a.status}\n${a.reason}`)
            .join("\n\n") || "",
      }),
    );
  }
  for (const s of [sheet, history]) {
    s.views = [{ state: "frozen", ySplit: 1 }];
    s.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: Math.max(1, s.rowCount), column: s.columnCount },
    };
    s.getRow(1).height = 38;
    s.getRow(1).eachCell((c) => {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF142A35" },
      };
      c.alignment = { wrapText: true, vertical: "middle" };
    });
    s.eachRow((row, i) => {
      if (i > 1) {
        row.height = 90;
        row.eachCell((c) => {
          c.alignment = { vertical: "top", wrapText: true };
          c.font = { name: "Calibri", size: 11 };
        });
        for (const key of ["broad", "lal", "rt"])
          row.getCell(key).numFmt = '#,##0" ₫"';
      }
    });
  }
  const info = book.addWorksheet("Huong dan");
  info.addRow(["GLOW NATURE — KẾT QUẢ BÀI TẬP"]);
  info.addRow([
    "Tong hop lop: bản cuối của mỗi học viên. Lich su va phan hoi: bản đầu và bản điều chỉnh.",
  ]);
  info.addRow([
    "Câu trả lời được giữ nguyên, không viết lại bằng AI. Điểm /70 chỉ tham khảo; 30 điểm lập luận cần trainer đánh giá.",
  ]);
  info.addRow([
    "Dữ liệu có họ tên và bài làm; file chỉ dành cho trainer. Không chia sẻ cho cả lớp.",
  ]);
  info.getColumn(1).width = 120;
  info.eachRow((r) => {
    r.height = 40;
    r.getCell(1).alignment = { wrapText: true, vertical: "top" };
  });
  return Buffer.from(await book.xlsx.writeBuffer());
}
