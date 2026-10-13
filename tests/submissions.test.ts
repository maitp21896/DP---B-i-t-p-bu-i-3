import { test } from "node:test";
import assert from "node:assert/strict";
import { identitySchema, submissionSchema } from "../lib/submissions/schema";
import {
  readBoundedJson,
  checkOrigin,
  HttpError,
} from "../lib/submissions/http";
import { csvCell, classCsv } from "../lib/submissions/csv";
import { fresh } from "../store/session";
const decision = {
  ...fresh(),
  actions: [{ id: "speed", target: "broad" as const }],
  evidence: [
    {
      text: "Broad có LPV Rate bằng 52% trong bảy ngày đầu.",
      kind: "observation" as const,
    },
  ],
  rationale:
    "Tôi giữ traffic mới và kiểm tra việc tải trang để kiểm chứng nguyên nhân của tỷ lệ LPV thấp trước khi thay đổi toàn bộ ngân sách.",
  monitors: ["Cost / LPV", "LPV Rate"],
  rule: "Nếu Cost/LPV tăng trong ba ngày và LPV Rate giảm, tôi sẽ kiểm tra trang đích.",
};
const { budgets, actions, evidence, rationale, monitors, rule } = decision;
const input = {
  id: "1d50cfe9-7e34-4dcf-a082-4e6e912775ac",
  receiptToken: "a".repeat(64),
  identity: { studentName: "Nguyễn Minh Anh", classCode: "dp27" },
  versions: [{ budgets, actions, evidence, rationale, monitors, rule }],
  website: "",
};
test("single explanation can be submitted without a separate evidence field", () => {
  const parsed = submissionSchema.parse({
    ...input,
    versions: input.versions.map((version) => ({ ...version, evidence: [] })),
  });
  assert.equal(parsed.versions[0].rationale, rationale);
  assert.deepEqual(parsed.versions[0].evidence, []);
});
test("identity validated without using name as authentication", () => {
  assert.equal(identitySchema.parse(input.identity).classCode, "DP27");
  for (const d of [
    { studentName: "A", classCode: "DP27" },
    { studentName: "Nguyen", classCode: "DP27" },
    { studentName: "Nguyen Van An", classCode: "<script>" },
  ])
    assert.equal(identitySchema.safeParse(d).success, false);
});
test("strict final payload rejects tampering, wrong types, duplicates and honeypot", () => {
  assert.equal(submissionSchema.safeParse(input).success, true);
  for (const d of [
    { ...input, feedback: { indicative: 70 } },
    { ...input, website: "bot" },
    {
      ...input,
      versions: [{ ...input.versions[0], rationale: 123 }],
    },
    {
      ...input,
      versions: [
        {
          ...input.versions[0],
          budgets: { broad: 8000000, lal: 3000000, rt: 2000000 },
        },
      ],
    },
    { ...input, versions: Array(3).fill(input.versions[0]) },
    { ...input, receiptToken: "not-a-secret-token" },
  ])
    assert.equal(submissionSchema.safeParse(d).success, false);
});
test("rationale preserved verbatim", () => {
  const raw = "  " + rationale + "\nĐiều này vẫn cần kiểm chứng.  ";
  assert.equal(
    submissionSchema.parse({
      ...input,
      versions: [{ ...input.versions[0], rationale: raw }],
    }).versions[0].rationale,
    raw,
  );
});
test("bounded request parsing checks actual bytes and content type", async () => {
  const req = (body: string, type = "application/json") =>
    new Request("https://example.com/api/submissions", {
      method: "POST",
      headers: { "content-type": type },
      body,
    });
  assert.deepEqual(await readBoundedJson(req('{"ok":true}')), { ok: true });
  await assert.rejects(
    () => readBoundedJson(req("a".repeat(100)), 20),
    (e: unknown) => e instanceof HttpError && e.status === 413,
  );
  await assert.rejects(
    () => readBoundedJson(req("broken")),
    (e: unknown) => e instanceof HttpError && e.status === 400,
  );
  await assert.rejects(
    () => readBoundedJson(req("{}", "text/plain")),
    (e: unknown) => e instanceof HttpError && e.status === 415,
  );
});
test("submission origin guard rejects cross-site requests", () => {
  assert.doesNotThrow(() =>
    checkOrigin(
      new Request("https://example.com/api/submissions", {
        headers: { origin: "https://example.com" },
      }),
    ),
  );
  for (const origin of ["https://evil.com", "null", ""])
    assert.throws(
      () =>
        checkOrigin(
          new Request("https://example.com/api/submissions", {
            headers: { origin },
          }),
        ),
      HttpError,
    );
});
test("CSV keeps Vietnamese and protects formula injection", () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.ok(csvCell(" \t+1").includes("'"));
  const csv = classCsv([
    {
      id: "id",
      student_name: "Nguyễn Minh Anh",
      class_code: "DP27",
      submitted_at: "2026-10-13",
      status: "submitted",
      final_score: 60,
      final_version: 1,
    },
  ]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("Nguyễn Minh Anh"));
  assert.ok(csv.includes('"2"'));
});

test("origin guard accepts the actual request Host behind Next proxy", () => {
  assert.doesNotThrow(() =>
    checkOrigin(
      new Request("http://internal:3000/api/submissions", {
        headers: {
          host: "school.example.com",
          origin: "https://school.example.com",
        },
      }),
    ),
  );
  assert.throws(
    () =>
      checkOrigin(
        new Request("http://internal:3000/api/submissions", {
          headers: {
            host: "school.example.com",
            origin: "https://evil.example.com",
          },
        }),
      ),
    HttpError,
  );
});

test("answers accept short text, long text and many optional comments without keywords", () => {
  for (const text of ["Ừ", "x".repeat(5000)]) {
    const version = {
      ...input.versions[0],
      rationale: text,
      rule: text,
      evidence: Array.from({ length: 5 }, () => ({
        kind: "observation",
        text: "Ý",
      })),
    };
    const saved = submissionSchema.parse({ ...input, versions: [version] });
    assert.equal(saved.versions[0].rationale, text);
    assert.equal(saved.versions[0].evidence.length, 5);
  }
});
