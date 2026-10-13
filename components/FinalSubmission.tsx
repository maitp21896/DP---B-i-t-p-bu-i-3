"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Session, DeliveryReceipt } from "@/types/campaign";
import { submissionSchema } from "@/lib/submissions/schema";
export default function FinalSubmission({
  s,
  set,
}: {
  s: Session;
  set: Dispatch<SetStateAction<Session>>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [website, setWebsite] = useState("");
  async function send() {
    if (busy || s.delivery) return;
    setError("");
    const input = s.pendingSubmission ?? {
      id: s.sessionId,
      receiptToken: s.receiptToken,
      identity: s.identity,
      versions: s.submissions,
      website,
    };
    const parsed = submissionSchema.safeParse(input);
    if (!parsed.success) {
      setError("Kiểm tra lại thông tin học viên và bài làm trước khi nộp.");
      return;
    }
    setBusy(true);
    set({ ...s, pendingSubmission: parsed.data });
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Không thể lưu bài. Vui lòng thử lại.");
      const receipt = {
        id: data.id,
        submittedAt: data.submittedAt,
        status: data.status,
      } as DeliveryReceipt;
      if (
        receipt.id !== s.sessionId ||
        !Number.isFinite(Date.parse(receipt.submittedAt)) ||
        receipt.status !== "submitted"
      )
        throw new Error(
          "Máy chủ chưa xác nhận đúng bài nộp. Vui lòng thử lại.",
        );
      set((current) =>
        current.sessionId === parsed.data.id
          ? {
              ...current,
              delivery: receipt,
              pendingSubmission: null,
            }
          : current,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Kết nối bị gián đoạn. Bài làm vẫn được giữ; hãy thử lại.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (s.delivery)
    return (
      <section className="card submission-confirmation no-print" role="status">
        <span className="eyebrow">MÁY CHỦ ĐÃ XÁC NHẬN</span>
        <h2>Đã nộp đề xuất cho giảng viên</h2>
        <p>
          Bài nộp này đã được lưu. Bạn có thể in bản sao, hoặc chỉnh sửa và nộp
          lại bất kỳ lúc nào.
        </p>
        <p>
          Mã tham chiếu: <strong className="reference">{s.delivery.id}</strong>
        </p>
        <small>
          {new Date(s.delivery.submittedAt).toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          })}{" "}
          · Giờ Việt Nam
        </small>
      </section>
    );
  return (
    <section className="card final-submit no-print">
      <span className="eyebrow">HOÀN TẤT BÀI TẬP</span>
      <h2>Nộp đề xuất cuối cùng</h2>
      <p>
        Bạn có thể chỉnh sửa và nộp lại bao nhiêu lần cũng được. Mỗi lần nộp
        thành công được lưu riêng. Mốc 20 phút chỉ để nhắc thời gian.
      </p>
      {s.pendingSubmission ? (
        <p className="notice">
          Đang giữ nguyên phiên bản đã gửi để thử lại an toàn. Nếu lần trước đã
          lưu nhưng mất kết nối, thử lại sẽ không tạo bài trùng.
        </p>
      ) : (
        <label className="confirm-choice">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          Tôi đã kiểm tra đề xuất và đồng ý gửi họ tên, mã lớp cùng bài làm cho
          giảng viên.
        </label>
      )}
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <div className="error" role="alert">
          {error} Bài chưa được xác nhận thành công; bản nháp vẫn được giữ.
        </div>
      )}
      <button
        onClick={send}
        disabled={busy || (!confirmed && !s.pendingSubmission)}
      >
        {busy
          ? "Đang gửi & chờ xác nhận…"
          : s.pendingSubmission
            ? "Thử nộp lại"
            : "Nộp đề xuất cuối cùng"}
      </button>
      <p className="caption">
        Mã bài nộp là mã tham chiếu, không phải mật khẩu để đọc bài.
      </p>
    </section>
  );
}
