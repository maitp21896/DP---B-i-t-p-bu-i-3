"use client";
import { useState } from "react";
import Link from "next/link";
export default function Trainer() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function download() {
    setBusy(true);
    setError("");
    setDone(false);
    try {
      const response = await fetch("/api/trainer/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không tải được file.");
      }
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "Tomorrow-Marketers-Tat-ca-lop.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không tải được file. Thử lại sau.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <strong>TOMORROW MARKETERS · TRAINER</strong>
        <Link href="/">← Bài tập học viên</Link>
      </header>
      <main>
        <section className="card">
          <span className="eyebrow">KẾT QUẢ HỌC VIÊN · EXCEL</span>
          <h1>Bài nộp của học viên</h1>
          <p>
            Mỗi bài nộp thành công được lưu ngay với thời điểm nhận bài. Tải
            file để lấy dữ liệu mới nhất của tất cả lớp; không cần nhập mã lớp.
          </p>
          <>
            <button onClick={download} disabled={busy}>
              {busy ? "Đang tạo file Excel…" : "Tải Excel tổng hợp"}
            </button>
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            {done && (
              <p role="status">
                Đã tải file Excel. Bấm tải lại bất cứ lúc nào để lấy các bài nộp
                mới.
              </p>
            )}
          </>
        </section>
        <section className="card">
          <span className="eyebrow">DÀNH CHO TRAINER</span>
          <h2>Đáp án gợi ý & hướng dẫn nhận xét</h2>
          <p>
            Đây là một phương án tham khảo; nhiều cách phân bổ có thể hợp lý khi
            có dữ liệu và giải thích phù hợp.
          </p>
          <h3>Bài 1 · Phân bổ và giải thích</h3>
          <p>
            Broad: 3.000.000 ₫ · Lookalike 1%: 3.400.000 ₫ · Retargeting:
            1.600.000 ₫.
          </p>
          <p>
            Giữ Broad để duy trì tiếp cận người mới, tăng Lookalike vì LPV Rate
            70% cao hơn Broad 52%. Giảm Retargeting vì Frequency 6,8 và CPA tăng
            từ ngày 1 đến ngày 7. Đây là tín hiệu cần kiểm chứng, chưa đủ kết
            luận nguyên nhân. Đánh đổi là có thể giảm chuyển đổi ngắn hạn.
          </p>
          <h3>Bài 2 · Hành động</h3>
          <p>
            Kiểm tra tốc độ mobile và hụt Link Click → LPV cho Broad; đổi
            creative Retargeting để kiểm chứng nguy cơ lặp lại quảng cáo.
          </p>
          <h3>Bài 3 · Theo dõi</h3>
          <p>
            Theo dõi Cost/LPV và ATC Rate. Nếu Cost/LPV tăng trên 20% trong ba
            ngày liên tiếp đồng thời ATC Rate giảm, kiểm tra landing page,
            creative và placement trước khi điều chỉnh ngân sách.
          </p>
          <h3>Trainer xem gì trong bài làm?</h3>
          <p>
            Kiểm tra số liệu dẫn chứng, lý do tăng/giảm/giữ ngân sách, hành động
            có đúng Ad Set, đánh đổi và điều kiện điều chỉnh có cụ thể. Chiến
            dịch hiện tại có mục tiêu Traffic; Purchase và CPA dùng chẩn đoán.
            Phản hồi tự động theo quy tắc nằm trong sheet “Lich su va phan hoi”,
            để trainer tham khảo.
          </p>
        </section>
      </main>
    </div>
  );
}
