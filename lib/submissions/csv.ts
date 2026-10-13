export type SummaryRow = {
  id: string;
  student_name: string;
  class_code: string;
  submitted_at: string;
  status: string;
  final_score: number;
  final_version: number;
};
// Prefix formula-like cells, including values obscured by leading control characters.
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function classCsv(rows: SummaryRow[]) {
  const headings = [
    "Mã bài nộp",
    "Họ và tên",
    "Mã lớp",
    "Thời gian UTC",
    "Trạng thái",
    "Điểm cấu trúc /70",
    "Phiên bản cuối",
  ];
  return (
    "\uFEFF" +
    [
      headings.map(csvCell).join(","),
      ...rows.map((r) =>
        [
          r.id,
          r.student_name,
          r.class_code,
          r.submitted_at,
          r.status === "submitted" ? "Đã nộp" : r.status,
          r.final_score,
          r.final_version + 1,
        ]
          .map(csvCell)
          .join(","),
      ),
    ].join("\r\n")
  );
}
