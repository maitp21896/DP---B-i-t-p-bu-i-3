"use client";
import { useEffect, useState } from "react";
import {
  Leaf,
  ArrowRight,
  RotateCcw,
  Clock3,
  BarChart3,
  Target,
  FileText,
  Compass,
} from "lucide-react";
import Dashboard from "@/components/Dashboard";
import Decisions, { EvidenceBoard } from "@/components/Decisions";
import Report from "@/components/Report";
import { IdentityDialog } from "@/components/Identity";
import FinalSubmission from "@/components/FinalSubmission";
import { Assignment, AssignmentDialog } from "@/components/Assignment";
import { identitySchema } from "@/lib/submissions/schema";
import { useSession } from "@/store/session";
import { evaluate, validate } from "@/lib/simulation";
import { Decision } from "@/types/campaign";
import { actions } from "@/lib/actions";
import { ids, money, shortNames } from "@/lib/metrics";
const steps = [
  "Thông tin học viên",
  "Case & dataset",
  "Bài 1 · Ngân sách",
  "Bài 2 · Tối ưu",
  "Bài 3 · Theo dõi",
  "Kết quả & nộp bài",
];
export default function Home() {
  const {
    session: s,
    setSession: set,
    loaded,
    storageError,
    reset,
  } = useSession();
  const [errors, setErrors] = useState<string[]>([]);
  const [now, setNow] = useState(Date.now());
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (loaded && s.stage === 0) setShowIdentity(true);
  }, [loaded, s.stage]);
  function taskErrors(stage: number) {
    const all = validate(s);
    return all.filter((e) =>
      stage === 2
        ? /ngân sách|Phân bổ|giải thích|nhận xét/.test(e)
        : stage === 3
          ? /hành động/.test(e)
          : /chỉ số|điều kiện/.test(e),
    );
  }
  function nextTask() {
    const problems = taskErrors(s.stage);
    setErrors(problems);
    if (!problems.length) go(s.stage + 1);
  }
  if (!loaded)
    return <main className="loading">Đang tải không gian chiến dịch…</main>;
  const remaining = Math.max(0, 1200 - Math.floor((now - s.started) / 1000));
  const submitted = s.submissions.at(-1);
  const result = submitted ? evaluate(submitted) : null;
  function submit() {
    const decision: Decision = {
      budgets: { ...s.budgets },
      actions: s.actions.map((a) => ({ ...a })),
      rationale: s.rationale,
      evidence: s.evidence.map((e) => ({ ...e })),
      monitors: [...s.monitors],
      rule: s.rule,
    };
    const problems = validate(decision);
    setErrors(problems);
    if (problems.length === 0 && s.submissions.length < 2) {
      set({ ...s, stage: 5, submissions: [...s.submissions, decision] });
      window.scrollTo(0, 0);
    }
  }
  function go(stage: number) {
    if (stage > 0 && !identitySchema.safeParse(s.identity).success) {
      setShowIdentity(true);
      return;
    }
    if (
      [2, 3, 4].includes(stage) &&
      (s.delivery || s.pendingSubmission || s.submissions.length === 2)
    )
      return;
    if (stage === 3 && taskErrors(2).length) {
      setErrors(taskErrors(2));
      return;
    }
    if (stage === 4 && (taskErrors(2).length || taskErrors(3).length)) {
      setErrors([...taskErrors(2), ...taskErrors(3)]);
      return;
    }
    const identity = identitySchema.safeParse(s.identity);
    set({
      ...s,
      stage,
      ...(identity.success ? { identity: identity.data } : {}),
    });
    setErrors([]);
    window.scrollTo(0, 0);
  }
  return (
    <div className="shell">
      <aside className="sidebar no-print">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Leaf size={23} />
          </span>
          <span>
            glow nature<small>CAMPAIGN LAB</small>
          </span>
        </a>
        <div className="workspace-label">KHÔNG GIAN HỌC TẬP</div>
        <nav>
          {steps.map((step, i) => {
            const Icon = [Compass, BarChart3, Target, Target, Target, FileText][
              i
            ];
            return (
              <button
                key={step}
                className={s.stage === i ? "nav active" : "nav"}
                disabled={
                  (i === 5 && !submitted) ||
                  (i > 0 && !identitySchema.safeParse(s.identity).success) ||
                  (i === 3 && taskErrors(2).length > 0) ||
                  (i === 4 &&
                    (taskErrors(2).length > 0 || taskErrors(3).length > 0)) ||
                  ([2, 3, 4].includes(i) &&
                    (s.submissions.length === 2 ||
                      !!s.delivery ||
                      !!s.pendingSubmission))
                }
                onClick={() => go(i)}
              >
                <Icon size={19} />
                <span>{step}</span>
                <small>0{i + 1}</small>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <span className="live-dot" /> Mô phỏng lớp học
          <p>
            Dữ liệu giả lập. Quyết định thật.
            <br />
            Không kết nối tài khoản Meta Ads.
          </p>
        </div>
        <div className="academy">
          TOMORROW
          <br />
          <strong>MARKETERS</strong>
          <small>Digital Performance Marketing</small>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar no-print">
          <div>
            <span className="breadcrumb">Tomorrow Marketers / Glow Nature</span>
            <span className="badge">Traffic · Meta Ads</span>
          </div>
          <div className="top-actions">
            <button
              className="secondary assignment-link"
              onClick={() => setShowAssignment(true)}
            >
              Xem lại yêu cầu bài tập
            </button>
            <button
              className="text-button"
              onClick={() => set({ ...s, timer: !s.timer })}
            >
              <Clock3 size={16} />
              {s.timer
                ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                : "Bật 20 phút"}
            </button>
            <button
              className="text-button"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw size={15} />
              Làm lại
            </button>
          </div>
        </header>
        <main>
          <div className="page-title no-print">
            <div>
              <span className="eyebrow">CHIẾN DỊCH 01 / GLOW NATURE</span>
              <h1>
                {
                  [
                    "Chào mừng đến Campaign Lab.",
                    "Bối cảnh case & dữ liệu chiến dịch",
                    "Bài 1 · Phân bổ ngân sách",
                    "Bài 2 · Đề xuất hành động tối ưu",
                    "Bài 3 · Theo dõi và điều chỉnh",
                    "Đánh giá & nộp đề xuất cuối cùng",
                  ][s.stage]
                }
              </h1>
              <p>
                {
                  [
                    "Nhập họ tên và mã lớp để bắt đầu bài tập.",
                    "Hiểu tình huống, khám phá dataset và ghi lại bằng chứng.",
                    "Chia 8 triệu đồng cho 3 Ad Set và giải thích quyết định.",
                    "Chọn tối đa 3 thay đổi cụ thể cùng Ad Set áp dụng.",
                    "Chọn 2–3 KPI và đặt điều kiện điều chỉnh chiến lược.",
                    "Xem phản hồi, sửa một lần nếu cần và nộp bản cuối.",
                  ][s.stage]
                }
              </p>
            </div>
            <span className="step-count">BƯỚC {s.stage + 1} / 6</span>
          </div>
          <div className="progress no-print">
            {steps.map((label, i) => (
              <div className={i <= s.stage ? "done" : ""} key={label}>
                <span>{i + 1}</span>
                {label}
              </div>
            ))}
          </div>
          {storageError && (
            <p className="notice">
              Trình duyệt không lưu được phiên. Giữ tab này mở và tải tóm tắt
              trước khi đóng.
            </p>
          )}
          {s.timer && remaining === 0 && (
            <p className="notice no-print">
              Đã hết 20 phút. Bạn vẫn có thể hoàn thành và xuất đề xuất.
            </p>
          )}
          {s.stage === 0 && (
            <section className="card">
              <h2>Nhập thông tin để bắt đầu</h2>
              <p>
                Họ tên và mã lớp giúp trainer nhận diện bài làm của bạn. Sau khi
                xác nhận, bạn sẽ vào bối cảnh case và dataset.
              </p>
              <button onClick={() => setShowIdentity(true)}>
                Bắt đầu bài tập
              </button>
            </section>
          )}
          {s.stage === 1 && (
            <>
              <section className="brief-hero card">
                <div>
                  <span className="eyebrow">
                    VAI TRÒ CỦA BẠN · PERFORMANCE MARKETER
                  </span>
                  <h2>
                    Traffic tốt hôm nay.
                    <br />
                    Nền tảng tăng trưởng ngày mai.
                  </h2>
                  <p>
                    Glow Nature bán sản phẩm chăm sóc da hữu cơ cho da nhạy cảm
                    qua website. Sau 7 ngày chạy Meta Ads, quản lý giao bạn ngân
                    sách <strong>8.000.000 ₫</strong> cho tuần tiếp theo.
                  </p>
                  <p>
                    Nhiệm vụ: đọc dữ liệu, cân nhắc đánh đổi và đưa ra đề xuất
                    tối ưu có thể kiểm chứng.
                  </p>
                  <span className="badge">
                    Học viên: {s.identity.studentName} · {s.identity.classCode}
                  </span>
                </div>
                <div className="brief-stats">
                  <Leaf size={44} />
                  <strong>08 triệu</strong>
                  <span>NGÂN SÁCH TUẦN TIẾP THEO</span>
                  <div>
                    <b>3</b> Ad Set <b>7</b> ngày <b>20</b> phút
                  </div>
                </div>
              </section>

              <div className="scenario-grid">
                {[
                  {
                    name: "Broad",
                    tag: "Tiếp cận người mới",
                    text: "Nữ 25–40 tại Hà Nội & TP.HCM, không giới hạn sở thích.",
                  },
                  {
                    name: "Lookalike 1%",
                    tag: "Mở rộng tệp khách hàng",
                    text: "Tương tự nhóm đã mua trong 180 ngày; giới hạn địa lý và tuổi phù hợp.",
                  },
                  {
                    name: "Retargeting",
                    tag: "Kết nối lại người quan tâm",
                    text: "Xem trang sản phẩm trong 30 ngày; loại trừ người đã mua.",
                  },
                ].map((a, i) => (
                  <section className="card" key={a.name}>
                    <span className="eyebrow">AD SET {["A", "B", "C"][i]}</span>
                    <h2>{a.name}</h2>
                    <span className="badge">{a.tag}</span>
                    <p>{a.text}</p>
                  </section>
                ))}
              </div>
              <div className="notice">
                <strong>Giữ đúng mục tiêu Traffic.</strong> Ưu tiên chất lượng
                truy cập, mở rộng người mới và tín hiệu retargeting. Purchase và
                CPA là chỉ số chẩn đoán. Giả định đã cấu hình loại trừ để giảm
                overlap.
              </div>
              <section className="card">
                <h2>Đầu ra của bạn</h2>
                <p>
                  Một đề xuất gồm ngân sách, tối đa 3 phát hiện, tối đa 3 hành
                  động, lập luận của bạn, kế hoạch theo dõi và rủi ro. Bạn được
                  điều chỉnh một lần sau đánh giá.
                </p>
                <p className="caption">
                  Không cần tài khoản học viên · Lưu bản nháp trên trình duyệt ·
                  Nộp bài riêng cho giảng viên
                </p>
              </section>
            </>
          )}
          {s.stage === 1 && (
            <>
              <Dashboard />
              <EvidenceBoard s={s} set={set} />
              <div className="bottom-actions">
                <p>Quan sát là bằng chứng. Nguyên nhân vẫn cần kiểm chứng.</p>
                <button
                  disabled={
                    s.submissions.length === 2 ||
                    !!s.delivery ||
                    !!s.pendingSubmission
                  }
                  onClick={() => go(2)}
                >
                  Tiếp theo · Bài 1 <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}
          {[2, 3, 4].includes(s.stage) && (
            <>
              <section className="notice">
                <strong>Yêu cầu bài {s.stage - 1}: </strong>
                {s.stage === 2
                  ? "Phân bổ đủ 8 triệu; giải thích Ad Set tăng, giảm hoặc giữ nguyên dựa trên dữ liệu."
                  : s.stage === 3
                    ? "Đề xuất tối đa 3 thay đổi cụ thể về creative, đối tượng hoặc landing page; chỉ rõ Ad Set."
                    : "Chọn 2–3 KPI và viết điều kiện cùng hành động điều chỉnh."}
              </section>
              <Decisions
                s={s}
                set={set}
                part={
                  s.stage === 2
                    ? "budget"
                    : s.stage === 3
                      ? "actions"
                      : "monitor"
                }
              />
              {errors.length > 0 && (
                <div className="error" role="alert">
                  <strong>Hoàn thiện câu trả lời trước khi tiếp tục:</strong>
                  <ul>
                    {errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bottom-actions">
                <button className="secondary" onClick={() => go(s.stage - 1)}>
                  ← Quay lại
                </button>
                {s.stage < 4 ? (
                  <button onClick={nextTask}>
                    Tiếp theo · Bài {s.stage} <ArrowRight size={17} />
                  </button>
                ) : (
                  <button onClick={submit}>
                    {s.submissions.length === 1
                      ? "Đánh giá bản điều chỉnh"
                      : "Xem đánh giá mô phỏng"}{" "}
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </>
          )}
          {s.stage === 5 && submitted && result && (
            <>
              <section className="card evaluation no-print">
                <div className="section-head">
                  <div>
                    <span className="eyebrow">
                      ĐÁNH GIÁ TÁC ĐỘNG QUYẾT ĐỊNH
                    </span>
                    <h2>Điểm mạnh, đánh đổi & điều cần kiểm chứng</h2>
                    <p>
                      Quy tắc giáo dục xác định · Không dự báo hiệu suất Meta
                      Ads.
                    </p>
                  </div>
                  {s.submissions.length === 1 &&
                  !s.delivery &&
                  !s.pendingSubmission ? (
                    <button className="secondary" onClick={() => go(2)}>
                      Điều chỉnh một lần
                    </button>
                  ) : (
                    <span className="badge">
                      {s.delivery
                        ? "Đề xuất đã nộp"
                        : s.pendingSubmission
                          ? "Đang chờ xác nhận nộp"
                          : "Đã dùng lượt điều chỉnh"}
                    </span>
                  )}
                </div>
                <div className="assessment-grid">
                  {result.assessment.map((a) => (
                    <div className="assessment" key={a.name}>
                      <h3>{a.name}</h3>
                      <span
                        className={
                          a.status === "Cần chú ý" ? "badge warning" : "badge"
                        }
                      >
                        {a.status}
                      </span>
                      <p>{a.reason}</p>
                    </div>
                  ))}
                </div>
                <div className="score">
                  <div>
                    <strong>
                      {result.indicative}
                      <small>/70</small>
                    </strong>
                    <span>Điểm tham khảo cho quyết định có cấu trúc</span>
                  </div>
                  <p>
                    <b>30 điểm phân tích bằng chứng: chờ giảng viên.</b> Điểm
                    không khẳng định chất lượng lập luận hoặc tính đúng đắn của
                    văn bản. Mức ngân sách khác nhau có thể đều hợp lý.
                  </p>
                </div>
                <div className="rubric">
                  {result.structured.map((x) => (
                    <div key={x.name}>
                      <span>
                        {x.name} ({x.weight}%)
                      </span>
                      <b>
                        {x.points}/{x.weight}
                      </b>
                    </div>
                  ))}
                </div>
                <p className="caption">
                  Giảng viên xem tính phù hợp của số liệu, giả thuyết, nguyên
                  nhân, giải thích đánh đổi và điều kiện điều chỉnh. Không chấm
                  bằng từ khóa.
                </p>
              </section>
              {s.submissions.length === 2 && (
                <section className="card no-print">
                  <h2>So sánh đề xuất ban đầu & điều chỉnh</h2>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Hạng mục</th>
                          <th>Ban đầu</th>
                          <th>Điều chỉnh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ids.map((id) => (
                          <tr key={id}>
                            <th>{shortNames[id]}</th>
                            {s.submissions.map((d, i) => (
                              <td key={i}>{money(d.budgets[id])}</td>
                            ))}
                          </tr>
                        ))}
                        <tr>
                          <th>Điểm cấu trúc /70</th>
                          {s.submissions.map((d, i) => (
                            <td key={i}>{evaluate(d).indicative}</td>
                          ))}
                        </tr>
                        <tr>
                          <th>Lập luận nguyên văn</th>
                          {s.submissions.map((d, i) => (
                            <td className="preserve" key={i}>
                              {d.rationale}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>Hành động</th>
                          {s.submissions.map((d, i) => (
                            <td key={i}>
                              {d.actions
                                .map(
                                  (a) =>
                                    actions.find((x) => x.id === a.id)?.label +
                                    " (" +
                                    (a.target === "all"
                                      ? "Toàn chiến dịch"
                                      : shortNames[a.target]) +
                                    ")",
                                )
                                .join(", ")}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>Theo dõi</th>
                          {s.submissions.map((d, i) => (
                            <td key={i}>
                              {d.monitors.join(", ")}
                              <p>{d.rule}</p>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              <FinalSubmission s={s} set={set} />
              <Report
                d={submitted}
                identity={s.identity}
                reference={s.delivery?.id}
              />
            </>
          )}
        </main>
        <footer className="app-footer no-print">
          Glow Nature Campaign Lab{" "}
          <span>Tomorrow Marketers Academy · Học qua quyết định</span>
        </footer>
      </div>
      {showIdentity && (
        <IdentityDialog
          s={s}
          set={set}
          close={() => setShowIdentity(false)}
          start={() => {
            setShowIdentity(false);
            go(1);
          }}
        />
      )}
      {showAssignment && (
        <AssignmentDialog close={() => setShowAssignment(false)} />
      )}
      {confirmReset && (
        <div className="modal-backdrop no-print">
          <div
            className="card modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirmReset(false);
              if (e.key === "Tab") {
                const buttons =
                  e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
                const first = buttons[0],
                  last = buttons[buttons.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <h2 id="reset-title">Bắt đầu lại bài tập?</h2>
            <p>
              Ngân sách, nhận xét, lập luận và đề xuất đã lưu trên trình duyệt
              này sẽ được xóa. Bài đã nộp trên máy chủ vẫn được giảng viên lưu;
              để yêu cầu xóa, liên hệ giảng viên với mã tham chiếu.
            </p>
            <div className="bottom-actions">
              <button
                className="secondary"
                autoFocus
                onClick={() => setConfirmReset(false)}
              >
                Giữ bài làm
              </button>
              <button
                onClick={() => {
                  reset();
                  setErrors([]);
                  setConfirmReset(false);
                }}
              >
                Xóa & bắt đầu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
