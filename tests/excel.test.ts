import { test } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { classWorkbook } from "../lib/excel";
import { evaluate } from "../lib/simulation";
import { Decision, StoredSubmission } from "../types/campaign";
const d: Decision = {
  budgets: { broad: 3000000, lal: 3000000, rt: 2000000 },
  actions: [{ id: "speed", target: "broad" }],
  rationale:
    '=HYPERLINK("not-a-formula")\nLập luận nguyên văn được giữ nguyên.',
  evidence: [
    { kind: "observation", text: "Broad có LPV Rate 52% trong dữ liệu gốc." },
  ],
  monitors: ["LPV Rate", "Cost / LPV"],
  rule: "Nếu LPV Rate giảm trong ba ngày, tôi sẽ kiểm tra trang đích.",
};
const record: StoredSubmission = {
  id: "11111111-1111-4111-8111-111111111111",
  student_name: "Học Viên Kiểm Thử",
  class_code: "TEST01",
  submitted_at: "2026-10-13T06:00:00Z",
  status: "submitted",
  versions: [
    d,
    { ...d, budgets: { broad: 2800000, lal: 3600000, rt: 1600000 } },
  ],
  final_proposal: {
    ...d,
    budgets: { broad: 2800000, lal: 3600000, rt: 1600000 },
  },
  feedback: [evaluate(d), evaluate(d)],
  final_version: 1,
  final_score: 60,
  data_version: "test",
};
test("xlsx includes final budgets, identity, original reasoning and both versions as literal text", async () => {
  const bytes = await classWorkbook([record]);
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(bytes as never);
  const sheet = book.getWorksheet("Tong hop lop")!;
  assert.equal(sheet.rowCount, 2);
  assert.equal(sheet.columnCount, 12);
  assert.ok(!sheet.getRow(1).values.toString().includes("Điểm cấu trúc"));
  assert.ok(!sheet.getRow(1).values.toString().includes("Số phiên bản"));
  assert.equal(sheet.getCell("B2").value, record.student_name);
  assert.equal(sheet.getCell("E2").value, 2800000);
  assert.equal(sheet.getCell("H2").value, d.rationale);
  assert.equal(sheet.getCell("H2").type, ExcelJS.ValueType.String);
  const history = book.getWorksheet("Lich su va phan hoi")!;
  assert.equal(history.rowCount, 3);
  assert.equal(history.getCell("D3").value, 2);
  assert.ok(String(history.getCell("M2").value).includes("Chất lượng traffic"));
});
