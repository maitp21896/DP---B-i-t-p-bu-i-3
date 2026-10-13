"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Trainer() {
  const [key, setKey] = useState("");
  const [cls, setCls] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setKey(new URLSearchParams(window.location.hash.slice(1)).get("key") || "");
  }, []);
  async function download(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone(false);
    try {
      const response = await fetch("/api/trainer/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ classCode: cls.trim().toUpperCase() }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không tải được file.");
      }
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `Glow-Nature-${cls.trim().toUpperCase()}.xlsx`;
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
        <section className="card trainer-login">
          <span className="eyebrow">KẾT QUẢ CẢ LỚP · EXCEL</span>
          <h1>Tải bài nộp của lớp</h1>
          <p>
            Không cần tài khoản hoặc mở Supabase. Chọn mã lớp để tải toàn bộ bài
            đã nộp, câu trả lời nguyên văn và lịch sử điều chỉnh.
          </p>
          {!key ? (
            <div className="notice">
              Hãy mở link riêng dành cho trainer để tải file. Link bài tập của
              học viên không cấp quyền xem kết quả cả lớp.
            </div>
          ) : (
            <form onSubmit={download}>
              <label>
                Mã lớp
                <input
                  required
                  minLength={2}
                  maxLength={24}
                  value={cls}
                  onChange={(e) => setCls(e.target.value.toUpperCase())}
                  placeholder="DP27"
                />
              </label>
              <button disabled={busy} type="submit">
                {busy ? "Đang tạo file Excel…" : "Tải Excel tổng hợp"}
              </button>
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}
              {done && (
                <p role="status" className="notice">
                  Đã tải file Excel. Sheet “Tong hop lop” chứa bản cuối; “Lich
                  su va phan hoi” chứa các phiên bản và phản hồi.
                </p>
              )}
            </form>
          )}
          <p className="caption">
            Chỉ lưu các bài đã nhận xác nhận nộp thành công. Link riêng và file
            kết quả chỉ dành cho trainer.
          </p>
        </section>
      </main>
    </div>
  );
}
