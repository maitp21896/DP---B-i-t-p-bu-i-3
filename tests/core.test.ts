import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dataset,
  aggregates,
  overall,
  metrics,
  ratio,
  clampBudget,
  ids,
} from "../lib/metrics";
import { evaluate, validate } from "../lib/simulation";
import { fresh } from "../store/session";
function proposal() {
  return {
    ...fresh(),
    actions: [
      { id: "speed", target: "broad" as const },
      { id: "rtCreative", target: "rt" as const },
    ],
    evidence: [
      {
        kind: "observation" as const,
        text: "Broad có tỷ lệ LPV thấp hơn Lookalike trong bảy ngày.",
      },
    ],
    rationale:
      "Tôi sẽ duy trì nguồn người mới và kiểm tra tốc độ trang cho Broad vì tỷ lệ LPV thấp. Retargeting cần thay đổi nội dung và theo dõi thay vì giả định chắc chắn đã bão hòa.",
    monitors: ["Cost / LPV", "ATC Rate"],
    rule: "Nếu chi phí LPV tăng trong ba ngày và ATC Rate giảm, tôi sẽ kiểm tra placement trước khi tăng tiếp ngân sách.",
  };
}
test("21 workbook rows reconcile with exact expected daily event totals", () => {
  assert.equal(dataset.daily.length, 21);
  assert.deepEqual(overall, {
    spend: 8000000,
    clicks: 3800,
    lpv: 2444,
    atc: 132,
    purchases: 33,
  });
  assert.deepEqual(
    ids.map((id) => [
      aggregates[id].spend,
      aggregates[id].clicks,
      aggregates[id].lpv,
      aggregates[id].atc,
      aggregates[id].purchases,
    ]),
    [
      [3000000, 1700, 884, 31, 9],
      [3000000, 1350, 945, 52, 11],
      [2000000, 750, 615, 49, 13],
    ],
  );
  for (const id of ids) {
    assert.equal(dataset.daily.filter((r) => r.id === id).length, 7);
    assert.equal(
      metrics(aggregates[id]).cpa,
      aggregates[id].spend / aggregates[id].purchases,
    );
  }
  assert.equal(aggregates.rt.reach, 12000);
  assert.equal(aggregates.rt.frequency, 6.8);
});
test("ratios and daily CPA safe for zero denominators", () => {
  assert.equal(ratio(1, 0), null);
  assert.equal(
    metrics({ spend: 100, clicks: 0, lpv: 0, atc: 0, purchases: 0 }).cpa,
    null,
  );
  for (const r of dataset.daily)
    assert.equal(metrics(r).cpa, r.spend / r.purchases);
});
test("budget never exceeds cap and uses increments", () => {
  for (const id of ids)
    for (const value of [-100, 100000, 3400000, 20000000]) {
      const b = clampBudget(
        { broad: 3000000, lal: 3000000, rt: 2000000 },
        id,
        value,
      );
      assert.ok(ids.reduce((s, x) => s + b[x], 0) <= 8000000);
      assert.ok(b[id] >= 0);
      assert.equal(b[id] % 200000, 0);
    }
});
test("raising a fully allocated slider transfers funds and decreasing releases them", () => {
  const raised = clampBudget({ broad: 3000000, lal: 3000000, rt: 2000000 }, "broad", 4400000);
  assert.deepEqual(raised, { broad: 4400000, lal: 1600000, rt: 2000000 });
  const lowered = clampBudget(raised, "broad", 2800000);
  assert.deepEqual(lowered, { broad: 2800000, lal: 1600000, rt: 2000000 });
  const all = clampBudget(lowered, "rt", 8000000);
  assert.deepEqual(all, { broad: 0, lal: 0, rt: 8000000 });
});
test("submission requires rationale, budget, evidence and monitoring", () => {
  const d = proposal();
  assert.deepEqual(validate(d), []);
  assert.ok(validate({ ...d, rationale: "ok" }).length);
  assert.ok(validate({ ...d, budgets: { ...d.budgets, rt: 0 } }).length);
  assert.ok(
    validate({ ...d, actions: [{ id: "rtCreative", target: "broad" }] }).length,
  );
  assert.ok(validate({ ...d, monitors: ["CPA"] }).length);
});
test("deterministic feedback permits alternative allocations and flags contradictions", () => {
  const d = proposal();
  assert.deepEqual(evaluate(d), evaluate(d));
  assert.equal(evaluate(d).pending, 30);
  assert.ok(
    evaluate({ ...d, actions: [{ id: "scale", target: "lal" }] }).conflicts
      .length,
  );
  assert.deepEqual(
    validate({ ...d, budgets: { broad: 2000000, lal: 4400000, rt: 1600000 } }),
    [],
  );
  assert.deepEqual(
    validate({ ...d, budgets: { broad: 4000000, lal: 2800000, rt: 1200000 } }),
    [],
  );
  assert.equal(
    evaluate({ ...d, rationale: "A".repeat(120) }).indicative,
    evaluate(d).indicative,
  );
  assert.ok(
    evaluate({ ...d, monitors: ["CPA", "CPM"] }).risks.some((x) =>
      x.includes("impressions"),
    ),
  );
});

test("feedback respects action targets", () => {
  const d = proposal();
  const a = evaluate({
    ...d,
    actions: [
      { id: "speed", target: "rt" },
      { id: "recent", target: "broad" },
    ],
  });
  assert.equal(a.assessment[0].status, "Cần chú ý");
  assert.equal(a.assessment[2].status, "Cần chú ý");
});
