"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Session, AdId } from "@/types/campaign";
import {
  BUDGET,
  aggregates,
  clampBudget,
  ids,
  money,
  shortNames,
} from "@/lib/metrics";
import { actions, monitorOptions } from "@/lib/actions";
export function DataComments({
  s,
  set,
}: {
  s: Session;
  set: Dispatch<SetStateAction<Session>>;
}) {
  const [text, setText] = useState("");
  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Nhận xét về data hiện tại</h2>
          <p>
            Ghi lại những điểm đáng chú ý trong dữ liệu trước khi làm bài tập
            (không bắt buộc).
          </p>
        </div>
      </div>
      {s.evidence.map((e, i) => (
        <div className="evidence-row" key={i}>
          <span className="badge">
            {e.kind === "observation" ? "Quan sát" : "Giả thuyết"}
          </span>
          <p>{e.text}</p>
          <button
            className="text-button"
            aria-label={`Xóa nhận xét ${i + 1}`}
            onClick={() =>
              set({ ...s, evidence: s.evidence.filter((_, j) => i !== j) })
            }
          >
            Xóa
          </button>
        </div>
      ))}
      <div className="evidence-input">
        <label className="grow">
          Nhận xét
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ad Set nào đáng chú ý? Chỉ số hoặc xu hướng nào cho thấy điều đó?"
          />
        </label>
        <button
          disabled={!text.trim()}
          onClick={() => {
            set({
              ...s,
              evidence: [
                ...s.evidence,
                { text: text.trim(), kind: "observation" },
              ],
            });
            setText("");
          }}
        >
          Lưu nhận xét
        </button>
      </div>
    </section>
  );
}
export default function Decisions({
  s,
  set,
  part = "all",
}: {
  s: Session;
  set: Dispatch<SetStateAction<Session>>;
  part?: "all" | "budget" | "actions" | "monitor";
}) {
  const total = ids.reduce((n, id) => n + s.budgets[id], 0);
  return (
    <>
      {(part === "all" || part === "budget") && (
        <>
          <section className="card">
            <div className="section-head">
              <div>
                <h2>Phân bổ ngân sách tuần tiếp theo</h2>
                <p>
                  Kéo để chỉnh từng nhóm, bước 200.000 ₫. Khi tăng vượt tổng 8
                  triệu, ngân sách nhóm khác sẽ tự giảm.
                </p>
              </div>
              <button
                className="secondary"
                onClick={() =>
                  set({
                    ...s,
                    budgets: { broad: 3000000, lal: 3000000, rt: 2000000 },
                  })
                }
              >
                Đặt lại ngân sách
              </button>
            </div>
            <div className="budget-summary">
              <strong>{money(total)}</strong>
              <span>/ {money(BUDGET)}</span>
              <span className={total === BUDGET ? "badge" : "badge warning"}>
                Còn {money(BUDGET - total)}
              </span>
            </div>
            <div className="budget-bar">
              {ids.map((id) => (
                <div
                  key={id}
                  className={id}
                  style={{ width: `${(s.budgets[id] / BUDGET) * 100}%` }}
                />
              ))}
            </div>
            {ids.map((id) => (
              <div className="budget-row" key={id}>
                <div>
                  <h3>{shortNames[id]}</h3>
                  <small>
                    Tuần trước: {money(aggregates[id].spend)} ·{" "}
                    {((aggregates[id].spend / BUDGET) * 100).toFixed(1)}%
                  </small>
                </div>
                <input
                  type="range"
                  aria-label={`Ngân sách ${shortNames[id]}`}
                  min="0"
                  max={BUDGET}
                  step="200000"
                  value={s.budgets[id]}
                  onChange={(e) =>
                    set((current) => ({
                      ...current,
                      budgets: clampBudget(
                        current.budgets,
                        id,
                        +e.target.value,
                      ),
                    }))
                  }
                />
                <div className="budget-value">
                  <strong>{money(s.budgets[id])}</strong>
                  <small>
                    {((s.budgets[id] / BUDGET) * 100).toFixed(1)}% tổng ngân
                    sách
                  </small>
                </div>
              </div>
            ))}
          </section>
          <section className="card">
            <h2>Giải thích</h2>
            <label>
              Giải thích
              <textarea
                aria-label="Giải thích"
                rows={7}
                value={s.rationale}
                onChange={(e) => set({ ...s, rationale: e.target.value })}
                placeholder={
                  "Câu trả lời nên gồm:\n1. Ad Set nào tăng, giảm hoặc giữ nguyên ngân sách.\n2. Số liệu hoặc xu hướng cụ thể làm dẫn chứng.\n3. Lý do dữ liệu đó dẫn đến quyết định của bạn.\n4. Đánh đổi, rủi ro và giả thuyết cần kiểm chứng."
                }
              />
            </label>
          </section>
        </>
      )}
      {(part === "all" || part === "actions") && (
        <>
          <section className="card">
            <div className="section-head">
              <div>
                <h2>Hành động tối ưu</h2>
                <p>Chọn 1–3 hành động và đối tượng áp dụng.</p>
              </div>
              <span className="badge">{s.actions.length}/3</span>
            </div>
            {[...new Set(actions.map((a) => a.group))].map((group) => (
              <div key={group}>
                <h3 className="group-title">{group}</h3>
                <div className="action-grid">
                  {actions
                    .filter((a) => a.group === group)
                    .map((a) => {
                      const selected = s.actions.find((x) => x.id === a.id);
                      return (
                        <div
                          className={`action ${selected ? "selected" : ""}`}
                          key={a.id}
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={!!selected}
                              disabled={!selected && s.actions.length >= 3}
                              onChange={() =>
                                set({
                                  ...s,
                                  actions: selected
                                    ? s.actions.filter((x) => x.id !== a.id)
                                    : [
                                        ...s.actions,
                                        {
                                          id: a.id,
                                          target: a.targets[0] as AdId | "all",
                                        },
                                      ],
                                })
                              }
                            />
                            {a.label}
                          </label>
                          {selected && (
                            <label className="target">
                              Áp dụng cho
                              <select
                                value={selected.target}
                                onChange={(e) =>
                                  set({
                                    ...s,
                                    actions: s.actions.map((x) =>
                                      x.id === a.id
                                        ? {
                                            ...x,
                                            target: e.target.value as
                                              AdId | "all",
                                          }
                                        : x,
                                    ),
                                  })
                                }
                              >
                                {a.targets.map((id) => (
                                  <option key={id} value={id}>
                                    {id === "all"
                                      ? "Toàn chiến dịch"
                                      : shortNames[id as AdId]}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
      {(part === "all" || part === "monitor") && (
        <>
          <section className="card">
            <h2>Kế hoạch theo dõi & điều chỉnh</h2>
            <p>
              Chọn 2–3 chỉ số ưu tiên và tự đặt điều kiện thay đổi quyết định.
            </p>
            <div className="monitor-grid">
              {monitorOptions.map((m) => (
                <label className="monitor" key={m}>
                  <input
                    type="checkbox"
                    checked={s.monitors.includes(m)}
                    disabled={!s.monitors.includes(m) && s.monitors.length >= 3}
                    onChange={() =>
                      set({
                        ...s,
                        monitors: s.monitors.includes(m)
                          ? s.monitors.filter((x) => x !== m)
                          : [...s.monitors, m],
                      })
                    }
                  />
                  {m}
                  {["CTR (Link)", "CPM"].includes(m) && (
                    <small>Cần bổ sung impressions</small>
                  )}
                </label>
              ))}
            </div>
            <label>
              Điều kiện và hành động điều chỉnh
              <textarea
                aria-label="Điều kiện và hành động điều chỉnh"
                rows={3}
                value={s.rule}
                onChange={(e) => set({ ...s, rule: e.target.value })}
                placeholder="Nếu chỉ số nào thay đổi, trong khoảng thời gian nào, bạn sẽ kiểm tra hoặc điều chỉnh điều gì?"
              />
            </label>
          </section>
        </>
      )}
    </>
  );
}
