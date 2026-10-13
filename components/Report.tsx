"use client";
import { useState } from "react";
import { summary } from "@/lib/report-summary";
import { Identity } from "@/lib/submissions/schema";
import { Decision } from "@/types/campaign";
import { ids, money, shortNames } from "@/lib/metrics";
import { actions } from "@/lib/actions";
export default function Report({
  d,
  identity,
  reference,
}: {
  d: Decision;
  identity?: Identity;
  reference?: string;
}) {
  const [copy, setCopy] = useState("");
  async function copyText() {
    try {
      await navigator.clipboard.writeText(summary(d, identity, reference));
      setCopy("Đã sao chép");
    } catch {
      setCopy("Không thể truy cập clipboard. Dùng Tải bản tóm tắt.");
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([summary(d, identity, reference)], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "Glow-Nature-De-xuat.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="report-tools no-print">
        <button onClick={() => window.print()}>In / Lưu PDF</button>
        <button className="secondary" onClick={copyText}>
          Sao chép tóm tắt
        </button>
        <button className="text-button" onClick={download}>
          Tải bản tóm tắt
        </button>
        <span role="status">{copy}</span>
        <small>
          Chọn A4 ngang, tắt header/footer trình duyệt. Văn bản rất dài sẽ mở
          rộng để không bị cắt.
        </small>
      </div>
      <article className="proposal">
        <header>
          <div>
            <span className="eyebrow">
              TOMORROW MARKETERS · CASE GLOW NATURE
            </span>
            <h2>Đề xuất tối ưu chiến dịch</h2>
            <p>Traffic · Ngân sách 8.000.000 ₫ · Tomorrow Marketers Academy</p>
          </div>
          <span className="badge">Bản đề xuất học viên</span>
        </header>
        {identity && (
          <div className="report-identity">
            <strong>Học viên: {identity.studentName}</strong>
            <span>Mã lớp: {identity.classCode}</span>
            {reference && <span>Mã bài: {reference}</span>}
          </div>
        )}
        <div className="report-grid">
          <section>
            <h3>01 / Phân bổ ngân sách</h3>
            {ids.map((id) => (
              <div className="report-budget" key={id}>
                <span>{shortNames[id]}</span>
                <strong>{money(d.budgets[id])}</strong>
                <span>{((d.budgets[id] / 8000000) * 100).toFixed(1)}%</span>
              </div>
            ))}
            {d.evidence.length > 0 && <h3>Nhận xét về data hiện tại</h3>}
            {d.evidence.map((e, i) => (
              <p key={i}>
                <b>{e.kind === "observation" ? "Quan sát" : "Giả thuyết"}.</b>{" "}
                {e.text}
              </p>
            ))}
            <h3>03 / Hành động tối ưu</h3>
            {d.actions.map((a) => (
              <p key={a.id}>
                {actions.find((x) => x.id === a.id)?.label}
                <br />
                <small>
                  Áp dụng:{" "}
                  {a.target === "all"
                    ? "Toàn chiến dịch"
                    : shortNames[a.target]}
                </small>
              </p>
            ))}
          </section>
          <section>
            <h3>04 / Lập luận nguyên văn</h3>
            <p className="preserve">{d.rationale}</p>
            <h3>05 / Kế hoạch theo dõi</h3>
            <p>
              <strong>{d.monitors.join(" · ")}</strong>
            </p>
            <p className="preserve">{d.rule}</p>
          </section>
        </div>
        <footer>
          Bản tóm tắt quyết định và câu trả lời của học viên · Tomorrow
          Marketers
        </footer>
      </article>
    </>
  );
}
