import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { notifyGoogleSheets } from "../lib/google-sheets";
import { sheetsHeaders, sheetsRow } from "../lib/sheets-row";
import { StoredSubmission } from "../types/campaign";
const record = {
  id: "receipt-1",
  student_name: "Nguyễn Minh Anh",
  class_code: "DP27",
  submitted_at: "2026-10-13T08:00:00Z",
  final_proposal: {
    budgets: { broad: 3000000, lal: 3400000, rt: 1600000 },
    rationale: "=SUM(1,2)\nGiải thích nguyên văn",
    evidence: [],
    actions: [{ id: "speed", target: "broad" }],
    monitors: ["Cost / LPV", "ATC Rate"],
    rule: "Kiểm tra trang nếu Cost/LPV tăng.",
  },
} as unknown as StoredSubmission;
test("Sheet rows retain original answers without grading or version-count columns", () => {
  const row = sheetsRow(record);
  assert.equal(row.length, 12);
  assert.equal(row[7], record.final_proposal.rationale);
  assert.equal(row[0], record.id);
  assert.ok(!sheetsHeaders.some((h) => /điểm|phiên bản/i.test(h)));
});
test("Google webhook failure leaves submission committed; absent config makes no request", async () => {
  let calls = 0;
  const send = (async () => {
    calls++;
    return Response.json({ ok: true });
  }) as typeof fetch;
  assert.equal(await notifyGoogleSheets("", send), "not-configured");
  assert.equal(
    await notifyGoogleSheets("https://wrong.example/exec", send),
    "pending",
  );
  assert.equal(calls, 0);
  const url = "https://script.google.com/macros/s/test-only/exec";
  assert.equal(await notifyGoogleSheets(url, send), "synced");
  assert.equal(
    await notifyGoogleSheets(url, async () => {
      throw new Error("offline");
    }),
    "pending",
  );
  assert.equal(
    await notifyGoogleSheets(url, async () => Response.json({ ok: false })),
    "pending",
  );
});
test("Apps Script recovery deduplicates receipts, imports new rows and escapes formulas", () => {
  let cells: unknown[][] = [];
  let incoming = [sheetsRow(record)];
  const range = (row: number, col: number, count: number, width: number) => {
    const api = {
      getValues: () =>
        Array.from({ length: count }, (_, i) =>
          Array.from(
            { length: width },
            (_, j) => cells[row - 1 + i]?.[col - 1 + j] ?? "",
          ),
        ),
      setValues: (values: unknown[][]) => {
        values.forEach((valuesRow, i) => {
          cells[row - 1 + i] ||= [];
          valuesRow.forEach((v, j) => (cells[row - 1 + i][col - 1 + j] = v));
        });
        return api;
      },
      setBackground: () => api,
      setFontColor: () => api,
      setFontWeight: () => api,
      setNumberFormat: () => api,
      setWrap: () => api,
      setVerticalAlignment: () => api,
    };
    return api;
  };
  const sheet = {
    getLastRow: () => cells.length,
    getMaxRows: () => 1000,
    insertRowsAfter: () => {},
    getRange: range,
    setFrozenRows: () => {},
  };
  const context: Record<string, any> = {
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }) },
    LockService: {
      getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }),
    },
    UrlFetchApp: {
      fetch: (_url: string, options: { headers: { Origin: string } }) => {
        assert.equal(
          options.headers.Origin,
          "https://dp-b-i-t-p-bu-i-3.vercel.app",
        );
        return {
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({ headers: sheetsHeaders, rows: incoming }),
        };
      },
    },
  };
  runInNewContext(readFileSync("sheets/Code.gs", "utf8"), context);
  assert.equal(context.syncNow(), true);
  assert.equal(context.syncNow(), true);
  assert.equal(cells.length, 2);
  assert.equal(cells[1][7], "'" + record.final_proposal.rationale);
  incoming = [sheetsRow(record), sheetsRow({ ...record, id: "receipt-2" })];
  assert.equal(context.syncNow(), true);
  assert.equal(cells.length, 3);
  cells[0][0] = "Existing unrelated contents";
  assert.throws(() => context.syncNow(), /Tab đã có nội dung khác/);
});
