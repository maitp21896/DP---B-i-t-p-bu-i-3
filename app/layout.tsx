import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Bài tập thực hành Meta Consideration & Conversion Optimization",
  description:
    "Thực hành phân tích dữ liệu Meta Ads và đề xuất tối ưu cho case Glow Nature — Tomorrow Marketers Academy",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
