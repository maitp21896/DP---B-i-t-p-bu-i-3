"use client";
import { useEffect, useRef } from "react";
export function Assignment() {
  return (
    <section className="assignment">
      <span className="eyebrow">YÊU CẦU BÀI TẬP · TOMORROW MARKETERS</span>
      <h2>Đề xuất tối ưu cho 7 ngày tiếp theo</h2>
      <p>
        Bạn là Performance Marketer của Glow Nature. Dùng số liệu 7 ngày đầu để
        đề xuất cách sử dụng thêm <strong>8.000.000 ₫</strong>, phục vụ traffic
        chất lượng, mở rộng khách hàng tiềm năng và hỗ trợ chuyển đổi.
      </p>
      <div className="assignment-grid">
        {[
          {
            n: "01",
            title: "Phân bổ ngân sách",
            text: "Chia đủ 8 triệu cho Broad, Lookalike và Retargeting. Giải thích nhóm nào tăng, giảm hoặc giữ nguyên và vì sao.",
          },
          {
            n: "02",
            title: "Hành động tối ưu",
            text: "Đề xuất tối đa 3 thay đổi cụ thể về creative, đối tượng hoặc landing page. Chỉ rõ Ad Set áp dụng và dữ liệu hỗ trợ.",
          },
          {
            n: "03",
            title: "Theo dõi & điều chỉnh",
            text: "Chọn 2–3 KPI. Viết điều kiện cụ thể và hành động bạn sẽ thực hiện khi cần thay đổi chiến lược.",
          },
        ].map((r) => (
          <div key={r.n}>
            <span>{r.n}</span>
            <h3>{r.title}</h3>
            <p>{r.text}</p>
          </div>
        ))}
      </div>
      <p className="caption">
        Đánh giá mô phỏng chưa phải nộp bài. Bạn được sửa một lần, sau đó chọn
        “Nộp đề xuất cuối cùng” để gửi giảng viên.
      </p>
    </section>
  );
}
export function AssignmentDialog({ close }: { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => {
      ref.current?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="assignment-dialog no-print"
      aria-label="Yêu cầu bài tập"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <Assignment />
      <div className="bottom-actions">
        <span>Đóng cửa sổ này vẫn giữ toàn bộ tiến độ.</span>
        <button autoFocus onClick={close}>
          Tiếp tục bài làm
        </button>
      </div>
    </dialog>
  );
}
