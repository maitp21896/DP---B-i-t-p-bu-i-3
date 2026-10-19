import type { Metadata } from "next";
import Link from "next/link";
import TrainerAnswerKey from "@/components/trainer/AnswerKey";

export const metadata: Metadata = {
  title:
    "Đáp án gợi ý — Meta Consideration & Conversion Optimization | Tomorrow Marketers",
  description:
    "Tham khảo phân tích dữ liệu, ba phương án tối ưu và kế hoạch theo dõi cho bài tập Glow Nature.",
};

export default function StudentAnswers() {
  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <strong>TOMORROW MARKETERS · ĐÁP ÁN GỢI Ý</strong>
        <Link href="/">← Về bài tập</Link>
      </header>
      <main>
        <div className="page-title">
          <div>
            <span className="eyebrow">
              META CONSIDERATION &amp; CONVERSION OPTIMIZATION
            </span>
            <h1>Đáp án gợi ý cho học viên</h1>
            <p>
              Case Glow Nature · Phân tích, lựa chọn chiến lược và theo dõi kết
              quả.
            </p>
          </div>
        </div>
        <TrainerAnswerKey forStudents />
      </main>
    </div>
  );
}
