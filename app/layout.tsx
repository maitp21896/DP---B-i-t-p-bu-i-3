import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Glow Nature — Campaign Rescue Simulator",
  description:
    "Mô phỏng quyết định tối ưu chiến dịch Traffic — Tomorrow Marketers Academy",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
