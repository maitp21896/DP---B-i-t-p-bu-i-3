"use client";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AdId, Metric } from "@/types/campaign";
import {
  aggregates,
  dataset,
  displayMetric,
  ids,
  metricNames,
  metrics,
  money,
  number,
  overall,
  shortNames,
} from "@/lib/metrics";
export const colors = { broad: "#28a69b", lal: "#5368d6", rt: "#d49746" };
export default function Dashboard() {
  const [metric, setMetric] = useState<Metric>("cpa");
  const [visible, setVisible] = useState<AdId[]>(ids);
  const [daily, setDaily] = useState(false);
  const chart = Array.from({ length: 7 }, (_, i) => ({
    day: `Ngày ${i + 1}`,
    ...Object.fromEntries(
      ids.map((id) => [
        id,
        metrics(dataset.daily.find((r) => r.id === id && r.day === i + 1)!)[
          metric
        ],
      ]),
    ),
  }));
  return (
    <>
      <div className="kpis">
        {[
          ["Chi tiêu 7 ngày", money(overall.spend), "Ngân sách đã sử dụng"],
          [
            "Landing Page Views",
            number(overall.lpv),
            `${displayMetric(metrics(overall).lpvRate, "lpvRate")} từ Link Click`,
          ],
          [
            "Chi phí / LPV",
            money(metrics(overall).costLpv!),
            `${number(overall.clicks)} Link Click`,
          ],
          [
            "Add to Cart",
            number(overall.atc),
            `${displayMetric(metrics(overall).atcRate, "atcRate")} trên LPV`,
          ],
        ].map(([label, value, note]) => (
          <div className="card kpi" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <section className="card">
        <div className="section-head">
          <div>
            <h2>Hiệu suất theo thời gian</h2>
            <p>Khám phá xu hướng, kiểm chứng trước khi kết luận.</p>
          </div>
          <label>
            Chỉ số{" "}
            <select
              aria-label="Chỉ số"
              value={metric}
              onChange={(e) => setMetric(e.target.value as Metric)}
            >
              {Object.entries(metricNames).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="legend">
          {ids.map((id) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={visible.includes(id)}
                onChange={() =>
                  setVisible(
                    visible.includes(id)
                      ? visible.filter((x) => x !== id)
                      : [...visible, id],
                  )
                }
              />
              <i style={{ background: colors[id] }} />
              {shortNames[id]}
            </label>
          ))}
        </div>
        <div
          className="chart"
          role="img"
          aria-label={`Xu hướng ${metricNames[metric]} trong 7 ngày; dữ liệu tương đương có trong bảng theo ngày`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chart}
              margin={{ top: 10, right: 20, left: 15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
                stroke="#e6ebee"
              />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  metric.endsWith("Rate")
                    ? `${Math.round(v * 100)}%`
                    : `${Math.round(v / 1000)}k`
                }
              />
              <Tooltip
                formatter={(v) =>
                  displayMetric(typeof v === "number" ? v : null, metric)
                }
              />
              {visible.map((id) => (
                <Line
                  key={id}
                  type="linear"
                  isAnimationActive={false}
                  dataKey={id}
                  name={shortNames[id]}
                  stroke={colors[id]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="caption">
          CPA = Spend / Purchase. Purchase và CPA là chỉ số chẩn đoán, không
          phải mục tiêu tối ưu của chiến dịch Traffic.
        </p>
      </section>
      <section className="card">
        <div className="section-head">
          <div>
            <h2>So sánh Ad Set</h2>
            <p>Reach và Frequency được giữ nguyên từ báo cáo gốc.</p>
          </div>
          <button className="secondary" onClick={() => setDaily(!daily)}>
            {daily ? "Ẩn" : "Xem"} dữ liệu theo ngày
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ad Set</th>
                <th>Spend</th>
                <th>Reach</th>
                <th>Frequency</th>
                <th>Clicks</th>
                <th>LPV</th>
                <th>LPV Rate</th>
                <th>ATC</th>
                <th>ATC Rate</th>
                <th>Purchase</th>
                <th>CPC</th>
                <th>Cost/LPV</th>
                <th>CPA</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id) => {
                const a = aggregates[id],
                  m = metrics(a);
                return (
                  <tr key={id}>
                    <th>
                      <i className="dot" style={{ background: colors[id] }} />
                      {shortNames[id]}
                    </th>
                    <td>{money(a.spend)}</td>
                    <td>{number(a.reach)}</td>
                    <td>{a.frequency}</td>
                    <td>{number(a.clicks)}</td>
                    <td>{number(a.lpv)}</td>
                    <td>{displayMetric(m.lpvRate, "lpvRate")}</td>
                    <td>{a.atc}</td>
                    <td>{displayMetric(m.atcRate, "atcRate")}</td>
                    <td>{a.purchases}</td>
                    <td>{displayMetric(m.cpc, "cpc")}</td>
                    <td>{displayMetric(m.costLpv, "costLpv")}</td>
                    <td>{displayMetric(m.cpa, "cpa")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {daily && (
          <div className="table-scroll">
            <table>
              <caption>Dữ liệu gốc và chỉ số tính lại — 21 quan sát</caption>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Ad Set</th>
                  <th>Spend</th>
                  <th>Clicks</th>
                  <th>LPV</th>
                  <th>ATC</th>
                  <th>Purchase</th>
                  {Object.values(metricNames).map((n) => (
                    <th key={n}>{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.daily.map((r) => (
                  <tr key={`${r.id}${r.day}`}>
                    <td>{r.day}</td>
                    <th>{shortNames[r.id]}</th>
                    <td>{money(r.spend)}</td>
                    <td>{r.clicks}</td>
                    <td>{r.lpv}</td>
                    <td>{r.atc}</td>
                    <td>{r.purchases}</td>
                    {Object.keys(metricNames).map((k) => (
                      <td key={k}>
                        {displayMetric(metrics(r)[k as Metric], k as Metric)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <details className="card">
        <summary>Nguồn dữ liệu & giới hạn đo lường</summary>
        <p>{dataset.source}</p>
        {dataset.limitations.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <p>
          Dữ liệu giả lập phục vụ lớp học. Chưa có mâu thuẫn giữa công thức tổng
          quan và dữ liệu theo ngày được phát hiện khi nhập.
        </p>
      </details>
    </>
  );
}
