"use client";
import { useCallback, useEffect, useState } from "react";
import { Session as AuthSession } from "@supabase/supabase-js";
import { ShieldCheck, LogOut } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";
import TrainerDashboard from "@/components/TrainerDashboard";
export default function Trainer() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [configurationMissing, setConfigurationMissing] = useState(false);
  useEffect(() => {
    const client = browserClient();
    if (!client) {
      setConfigurationMissing(true);
      setReady(true);
      return;
    }
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = client.auth.onAuthStateChange((_, next) =>
      setSession(next),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  const request = useCallback(async (body: Record<string, unknown>) => {
    const client = browserClient();
    const current = await client?.auth.getSession();
    const token = current?.data.session?.access_token;
    if (!token) throw new Error("Vui lòng đăng nhập lại.");
    const response = await fetch("/api/trainer/submissions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không tải được dữ liệu.");
    return data;
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const client = browserClient();
      if (!client)
        throw new Error(
          "Chưa cấu hình Supabase. Xem hướng dẫn thiết lập trong dự án.",
        );
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error)
        throw new Error(
          "Không đăng nhập được. Kiểm tra email và mật khẩu tài khoản giảng viên.",
        );
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể đăng nhập.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="trainer-shell">
      <header className="trainer-header no-print">
        <a href="/" className="trainer-brand">
          <span>
            TOMORROW
            <br />
            <strong>MARKETERS</strong>
          </span>
          <span className="trainer-brand-rule" />
          Campaign Lab
        </a>
        <div>
          <span className="badge">
            <ShieldCheck size={13} /> Không gian giảng viên
          </span>
          {session && (
            <button
              className="text-button"
              onClick={async () => {
                await browserClient()?.auth.signOut();
                setSession(null);
              }}
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          )}
        </div>
      </header>
      <main>
        {!ready ? (
          <p role="status">Đang xác minh phiên đăng nhập…</p>
        ) : !session ? (
          <section className="card trainer-login">
            <span className="eyebrow">GLOW NATURE · TRAINER</span>
            <h1>
              Đọc quyết định.
              <br />
              Hiểu cách học viên tư duy.
            </h1>
            <p>
              Đăng nhập bằng tài khoản giảng viên được cấp quyền để xem bài nộp
              tập trung, so sánh điều chỉnh và xuất báo cáo.
            </p>
            {configurationMissing && (
              <div className="notice">
                Chưa kết nối Supabase. Chức năng đăng nhập và danh sách bài nộp
                sẽ hoạt động sau khi quản trị viên cấu hình dự án.
              </div>
            )}
            <form onSubmit={login}>
              <label>
                Email giảng viên
                <input
                  type="email"
                  autoComplete="username"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Mật khẩu
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" disabled={busy || configurationMissing}>
                {busy ? "Đang đăng nhập…" : "Đăng nhập giảng viên"}
              </button>
            </form>
            <p className="caption">
              Học viên không cần tài khoản. Họ tên và mã lớp không cấp quyền
              truy cập dữ liệu. Chỉ quản trị viên cấp quyền giảng viên trong
              database.
            </p>
            <a className="trainer-back" href="/">
              ← Quay lại bài tập học viên
            </a>
          </section>
        ) : (
          <>
            <div className="page-title no-print">
              <div>
                <span className="eyebrow">
                  TOMORROW MARKETERS · CAMPAIGN RESCUE
                </span>
                <h1>Không gian đánh giá bài nộp</h1>
                <p>
                  Dữ liệu riêng tư · Lập luận nguyên văn · Quyết định có căn cứ
                </p>
              </div>
            </div>
            <TrainerDashboard request={request} />
          </>
        )}
      </main>
      <footer className="app-footer no-print">
        Tomorrow Marketers Academy
        <span>
          Thông tin chỉ dành cho giảng viên được cấp quyền · Lưu tối đa 90 ngày
        </span>
      </footer>
    </div>
  );
}
