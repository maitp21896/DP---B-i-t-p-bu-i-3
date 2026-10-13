"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  RotateCcw,
  Clock3,
  BarChart3,
  Target,
  FileText,
  Compass,
} from "lucide-react";
import Dashboard from "@/components/Dashboard";
import Decisions, { DataComments } from "@/components/Decisions";
import Report from "@/components/Report";
import { IdentityDialog } from "@/components/Identity";
import FinalSubmission from "@/components/FinalSubmission";
import { Assignment, AssignmentDialog } from "@/components/Assignment";
import { identitySchema } from "@/lib/submissions/schema";
import { useSession, newIdentifiers } from "@/store/session";
import { validate } from "@/lib/simulation";
import { Decision } from "@/types/campaign";
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
    if (problems.length === 0) {
      set({
        ...s,
        stage: 5,
        submissions: s.submissions.length
          ? [s.submissions[0], decision]
          : [decision],
      });
      window.scrollTo(0, 0);
    }
  }
  function go(stage: number) {
    if (stage > 0 && !identitySchema.safeParse(s.identity).success) {
      setShowIdentity(true);
      return;
    }
    if (stage === 5 && !s.delivery && !s.pendingSubmission) {
      const firstIncomplete = [2, 3, 4].find((task) => taskErrors(task).length);
      if (firstIncomplete) {
        set({ ...s, stage: firstIncomplete });
        setErrors(taskErrors(firstIncomplete));
        window.scrollTo(0, 0);
      } else submit();
      return;
    }
    const identity = identitySchema.safeParse(s.identity);
    set({
      ...s,
      stage,
      ...(stage < 5 && (s.delivery || s.pendingSubmission)
        ? {
            ...newIdentifiers(),
            delivery: null,
            pendingSubmission: null,
            submissions: [],
          }
        : {}),
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
            <BarChart3 size={23} />
          </span>
          <span>
            Tomorrow
            <br />
            Marketers<small>META ADS PRACTICE</small>
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
              <span className="eyebrow exercise-name">
                Bài tập thực hành Meta Consideration &amp; Conversion
                Optimization
              </span>
              <h1>
                {
                  [
                    "Bài tập thực hành Meta Consideration & Conversion Optimization",
                    "Bối cảnh case & dữ liệu chiến dịch",
                    "Bài 1 · Phân bổ ngân sách",
                    "Bài 2 · Đề xuất hành động tối ưu",
                    "Bài 3 · Theo dõi và điều chỉnh",
                    "Tóm tắt & nộp bài",
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
                    "Kiểm tra câu trả lời và nộp bài cho giảng viên.",
                  ][s.stage]
                }
              </p>
            </div>
            <span className="step-count">BƯỚC {s.stage + 1} / 6</span>
          </div>
          <div className="progress no-print">
            {steps.map((label, i) => (
              <button
                type="button"
                className={i <= s.stage ? "done" : ""}
                key={label}
                aria-current={s.stage === i ? "step" : undefined}
                onClick={() => go(i)}
              >
                <span>{i + 1}</span>
                {label}
              </button>
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
              Đã hết 20 phút. Bạn vẫn có thể hoàn thành và nộp bài bình thường.
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
            <section className="case-brief card">
              <h2>Case Glow Nature</h2>
              <p>
                Bạn là Performance Marketer của Glow Nature, thương hiệu chăm
                sóc da hữu cơ cho da nhạy cảm, bán qua website. Dựa trên dữ liệu
                <strong> 7 ngày chạy Meta Ads</strong>, hãy đề xuất tối ưu cho
                tuần tiếp theo với ngân sách <strong>8.000.000 ₫</strong>.
              </p>
              <dl className="case-audiences">
                <div>
                  <dt>Ad Set A · Broad</dt>
                  <dd>
                    Nữ 25–40 tại Hà Nội và TP.HCM, không giới hạn sở thích.
                  </dd>
                </div>
                <div>
                  <dt>Ad Set B · Lookalike 1%</dt>
                  <dd>
                    Tương tự người mua trong 180 ngày; giới hạn địa lý và tuổi
                    phù hợp.
                  </dd>
                </div>
                <div>
                  <dt>Ad Set C · Retargeting</dt>
                  <dd>
                    Người xem trang sản phẩm trong 30 ngày, loại trừ người đã
                    mua.
                  </dd>
                </div>
              </dl>
              <p className="case-objective">
                <strong>Mục tiêu chiến dịch hiện tại: Traffic.</strong> Đánh giá
                chất lượng truy cập và tín hiệu chuyển đổi; Purchase và CPA là
                chỉ số chẩn đoán. Giả định các tệp đã được loại trừ để giảm
                trùng lặp.
              </p>
            </section>
          )}
          {s.stage === 1 && (
            <>
              <Dashboard />
              <DataComments s={s} set={set} />
              <div className="bottom-actions">
                <p>Tiếp tục để phân bổ ngân sách cho tuần tới.</p>
                <button onClick={() => go(2)}>
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
                    Xem tóm tắt bài làm <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </>
          )}
          {s.stage === 5 && submitted && (
            <>
              <section className="card no-print">
                <h2>Tóm tắt bài làm</h2>
                <p>Kiểm tra quyết định và câu trả lời của bạn trước khi nộp.</p>
                <button className="secondary" onClick={() => go(2)}>
                  Chỉnh sửa bài làm
                </button>
              </section>
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
          Tomorrow Marketers · Meta Consideration & Conversion Optimization{" "}
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
