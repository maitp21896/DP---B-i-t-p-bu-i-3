"use client";
import { useState } from "react";
import Link from "next/link";
import TrainerAnswerKey from "@/components/trainer/AnswerKey";
export default function Trainer() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  async function syncSheet() {
    setSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch("/api/trainer/sheets", { method: "POST" });
      const data = await response.json();
      setSyncMessage(
        data.message || data.error || "Chưa kiểm tra được kết nối.",
      );
    } catch {
      setSyncMessage("Không kết nối được máy chủ. Thử lại sau.");
    } finally {
      setSyncing(false);
    }
  }
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
          <span className="eyebrow">KẾT QUẢ HỌC VIÊN · GOOGLE SHEETS</span>
          <h1>Bài nộp của học viên</h1>
          <p>
            <a
              className="primary-link"
              href="https://docs.google.com/spreadsheets/d/1k7wdWHJbV7jmlDH1cadgvVNpcYUN_5z1s1rzy7whj3s/edit"
              target="_blank"
              rel="noreferrer"
            >
              Mở Google Sheet kết quả ↗
            </a>
          </p>
          <p>
            Mở tab “Bài nộp học viên” trong Google Sheet để xem kết quả. Nếu
            Sheet còn trống, bấm “Đồng bộ Sheet ngay” để kiểm tra kết nối và lấy
            lại các bài đã lưu.
          </p>
          <div className="trainer-sheet-actions">
            <button
              className="secondary"
              onClick={syncSheet}
              disabled={syncing}
            >
              {syncing ? "Đang đồng bộ Sheet…" : "Đồng bộ Sheet ngay"}
            </button>
            <button className="secondary" onClick={download} disabled={busy}>
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
          </div>
          {syncMessage && (
            <p role="status" className="notice">
              {syncMessage}
            </p>
          )}
        </section>
        <TrainerAnswerKey />
      </main>
    </div>
  );
}
