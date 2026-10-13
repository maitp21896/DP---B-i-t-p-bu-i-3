import Link from "next/link";
export default function Trainer() {
  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <strong>TOMORROW MARKETERS · KẾT QUẢ BÀI TẬP</strong>
        <Link href="/">← Bài tập học viên</Link>
      </header>
      <main>
        <section className="card trainer-login">
          <span className="eyebrow">CÁCH XEM ĐƠN GIẢN</span>
          <h1>Mở bảng kết quả học viên</h1>
          <p>
            Học viên bấm “Nộp đề xuất cuối cùng”. Kết quả được lưu trong
            Supabase; bạn xem trực tiếp ở đó, không cần tạo tài khoản trainer
            hay cấp quyền trong app.
          </p>
          <ol>
            <li>Mở Supabase bằng tài khoản quản lý dự án của bạn.</li>
            <li>
              Trong <strong>Table Editor</strong>, chọn bảng kết quả{" "}
              <strong>trainer_results</strong>.
            </li>
            <li>
              Lọc theo <strong>ma_lop</strong>, xem{" "}
              <strong>lap_luan_nguyen_van</strong> và{" "}
              <strong>bao_cao_day_du</strong>. Cột lịch sử lưu cả lần đầu và bản
              điều chỉnh.
            </li>
          </ol>
          <a
            className="button-link"
            href="https://supabase.com/dashboard/project/bfcgltjyrtpjgqvbexxz/editor"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở bảng kết quả trên Supabase ↗
          </a>
          <p className="caption">
            Supabase sử dụng tài khoản quản lý dự án sẵn có của bạn. Trang này
            không hiển thị công khai tên hoặc bài làm của học viên.
          </p>
        </section>
      </main>
    </div>
  );
}
