"use client";
import { useCallback, useEffect, useState } from "react";
import { SummaryRow, classCsv } from "@/lib/submissions/csv";
import { StoredSubmission } from "@/types/campaign";
import { evaluate } from "@/lib/simulation";
import { ids, money, shortNames } from "@/lib/metrics";
import { actions } from "@/lib/actions";
import Report from "@/components/Report";
export type TrainerRequest = (
  body: Record<string, unknown>,
) => Promise<{
  submissions?: SummaryRow[];
  total?: number;
  submission?: StoredSubmission;
}>;
export default function TrainerDashboard({
  request,
}: {
  request: TrainerRequest;
}) {
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [cls, setCls] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ class: "", search: "" });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<StoredSubmission | null>(null);
  const [exporting, setExporting] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");
    setRows([]);
    request({ ...filters, page })
      .then((r) => {
        if (active) {
          setRows(r.submissions || []);
          setTotal(r.total || 0);
        }
      })
      .catch((e) => {
        if (active) setError(e.message || "Không tải được danh sách.");
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [request, filters, page, refresh]);
  async function open(id: string) {
    setBusy(true);
    setError("");
    try {
      const data = await request({ id });
      if (!data.submission) throw new Error("Không tìm thấy bài nộp.");
      setDetail(data.submission);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được bài nộp.");
    } finally {
      setBusy(false);
    }
  }
  async function csv() {
    setExporting(true);
    setError("");
    try {
      let all: SummaryRow[] = [];
      let p = 0;
      let count = 1;
      while (all.length < count) {
        const r = await request({ ...filters, page: p });
        count = r.total || 0;
        if (count > 5000)
          throw new Error("Hơn 5.000 bài: hãy lọc theo mã lớp trước khi xuất.");
        if (!r.submissions?.length) break;
        all.push(...r.submissions);
        p++;
      }
      const unique = [...new Map(all.map((r) => [r.id, r])).values()];
      if (unique.length !== count)
        throw new Error("Danh sách thay đổi trong khi xuất. Vui lòng thử lại.");
      const url = URL.createObjectURL(
        new Blob([classCsv(unique)], { type: "text/csv;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `Glow-Nature-${filters.class || "cac-lop"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không xuất được CSV.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <>
      {error && (
        <div className="error no-print" role="alert">
          {error}
          <button
            className="text-button"
            onClick={() => setRefresh((n) => n + 1)}
          >
            Thử tải lại
          </button>
        </div>
      )}
      {detail ? (
        <>
          <div className="section-head no-print">
            <div>
              <h2>Bài nộp của {detail.student_name}</h2>
              <p>
                {detail.class_code} ·{" "}
                {new Date(detail.submitted_at).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}{" "}
                (giờ Việt Nam)
              </p>
            </div>
            <button className="secondary" onClick={() => setDetail(null)}>
              ← Danh sách bài nộp
            </button>
          </div>
          <section className="card no-print">
            <span className="badge">
              Đã nộp · phiên bản {detail.final_version + 1}
            </span>
            <p className="caption">
              Mã tham chiếu: {detail.id} · Lập luận giữ nguyên văn
            </p>
            <h2 className="trainer-detail-title">Đánh giá mô phỏng đã lưu</h2>
            <div className="assessment-grid">
              {detail.feedback[detail.final_version].assessment.map((a) => (
                <div className="assessment" key={a.name}>
                  <h3>{a.name}</h3>
                  <span className="badge">{a.status}</span>
                  <p>{a.reason}</p>
                </div>
              ))}
            </div>
            <p>
              Điểm cấu trúc tham khảo: <b>{detail.final_score}/70</b>. Phân tích
              bằng chứng: 30 điểm cần giảng viên đánh giá.
            </p>
          </section>
          {detail.versions.length === 2 && (
            <section className="card no-print">
              <h2>Ban đầu & điều chỉnh</h2>
              <div className="table-scroll">
                <table className="revision-table">
                  <thead>
                    <tr>
                      <th>Hạng mục</th>
                      <th>Ban đầu</th>
                      <th>Điều chỉnh (cuối cùng)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ids.map((id) => (
                      <tr key={id}>
                        <th>{shortNames[id]}</th>
                        {detail.versions.map((d, i) => (
                          <td key={i}>{money(d.budgets[id])}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <th>Hành động</th>
                      {detail.versions.map((d, i) => (
                        <td key={i}>
                          {d.actions.map((a) => (
                            <p key={a.id}>
                              {actions.find((x) => x.id === a.id)?.label} ·{" "}
                              {a.target === "all"
                                ? "Toàn chiến dịch"
                                : shortNames[a.target]}
                            </p>
                          ))}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th>Nhận xét</th>
                      {detail.versions.map((d, i) => (
                        <td key={i}>
                          {d.evidence.map((e, j) => (
                            <p key={j}>
                              {e.kind === "observation"
                                ? "Quan sát"
                                : "Giả thuyết"}
                              : {e.text}
                            </p>
                          ))}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th>Lập luận nguyên văn</th>
                      {detail.versions.map((d, i) => (
                        <td key={i} className="preserve">
                          {d.rationale}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th>Theo dõi & điều chỉnh</th>
                      {detail.versions.map((d, i) => (
                        <td key={i}>
                          {d.monitors.join(" · ")}
                          <p className="preserve">{d.rule}</p>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th>Điểm tham khảo /70</th>
                      {detail.feedback.map((f, i) => (
                        <td key={i}>{f.indicative}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <Report
            d={detail.final_proposal}
            identity={{
              studentName: detail.student_name,
              classCode: detail.class_code,
            }}
            reference={detail.id}
          />
        </>
      ) : (
        <>
          <section className="card no-print">
            <div className="section-head">
              <div>
                <span className="eyebrow">BÀI NỘP TẬP TRUNG</span>
                <h2>Đề xuất của học viên</h2>
                <p>
                  Chỉ hiện bài đã được máy chủ xác nhận, trong thời hạn 90 ngày.
                </p>
              </div>
              <button onClick={csv} disabled={busy || exporting || total === 0}>
                {exporting ? "Đang xuất…" : "Xuất CSV theo bộ lọc"}
              </button>
            </div>
            <form
              className="trainer-filters"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                setFilters({
                  class: cls.trim().toUpperCase(),
                  search: search.trim(),
                });
              }}
            >
              <label>
                Mã lớp
                <input
                  value={cls}
                  onChange={(e) => setCls(e.target.value.toUpperCase())}
                  maxLength={24}
                  placeholder="Tất cả lớp / DP27"
                />
              </label>
              <label>
                Tìm theo tên học viên
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  maxLength={100}
                  placeholder="Nhập họ hoặc tên"
                />
              </label>
              <button type="submit" className="secondary">
                Lọc bài nộp
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => setRefresh((n) => n + 1)}
              >
                Làm mới
              </button>
            </form>
          </section>
          <section className="card no-print">
            {busy ? (
              <p role="status">Đang tải bài nộp…</p>
            ) : rows.length === 0 ? (
              <div className="empty-state">
                <h2>
                  {error ? "Chưa tải được dữ liệu" : "Chưa có bài nộp phù hợp"}
                </h2>
                <p>
                  {error
                    ? "Thử lại sau khi kiểm tra kết nối."
                    : "Học viên cần chọn “Nộp đề xuất cuối cùng” và nhận xác nhận. Bạn có thể thay đổi bộ lọc hoặc làm mới."}
                </p>
              </div>
            ) : (
              <>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Học viên</th>
                        <th>Mã lớp</th>
                        <th>Nộp lúc (giờ Việt Nam)</th>
                        <th>Trạng thái</th>
                        <th>Phiên bản</th>
                        <th>Điểm /70</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <th>{r.student_name}</th>
                          <td>{r.class_code}</td>
                          <td>
                            {new Date(r.submitted_at).toLocaleString("vi-VN", {
                              timeZone: "Asia/Ho_Chi_Minh",
                            })}
                          </td>
                          <td>
                            <span className="badge">Đã nộp</span>
                          </td>
                          <td>{r.final_version + 1}</td>
                          <td>{r.final_score}</td>
                          <td>
                            <button
                              className="secondary"
                              onClick={() => open(r.id)}
                            >
                              Xem đề xuất
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bottom-actions">
                  <small>
                    {total} bài · Trang {page + 1}
                  </small>
                  <div>
                    <button
                      className="secondary"
                      disabled={page === 0}
                      onClick={() => setPage((n) => n - 1)}
                    >
                      Trước
                    </button>{" "}
                    <button
                      className="secondary"
                      disabled={(page + 1) * 50 >= total}
                      onClick={() => setPage((n) => n + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}
      {busy && detail && (
        <p className="no-print" role="status">
          Đang tải…
        </p>
      )}
    </>
  );
}
