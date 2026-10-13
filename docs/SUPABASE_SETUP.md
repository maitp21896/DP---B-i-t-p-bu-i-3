# Lưu trữ Supabase (phần backend)

**Trainer nay dùng [link tải Excel](TRAINER_EXCEL.md), không cần vào Supabase.** Phần Table Editor bên dưới chỉ dành cho quản trị khi kiểm tra dữ liệu.

# Thiết lập đơn giản: nộp bài → lưu Supabase → xem kết quả

Không cần tài khoản học viên hoặc tài khoản trainer. Backend tiếp tục lưu Supabase; trainer tải Excel bằng link riêng.

## Bước 1 — Tạo nơi lưu kết quả

Mở dự án `bfcgltjyrtpjgqvbexxz` trên Supabase → **SQL Editor → New query**. Copy toàn bộ [schema.sql](../supabase/schema.sql), paste và bấm **Run**.

Nếu đã chạy bản SQL cũ, vẫn chạy bản mới này. Dữ liệu bài nộp được giữ nguyên; app không còn dùng bảng trainer hay yêu cầu đăng nhập riêng.

## Bước 2 — Thêm đúng 2 biến vào Vercel

Vercel → dự án hiện tại → **Settings → Environment Variables**:

| Name                        | Value                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| `SUPABASE_URL`              | `https://bfcgltjyrtpjgqvbexxz.supabase.co`                                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Key `service_role` trong Supabase **Settings → API / API Keys → Legacy keys** |

Chọn Production và Preview nếu cần kiểm thử trước khi cập nhật main. Không gửi key qua chat. Key thứ hai chỉ được dùng trên server, không thêm `NEXT_PUBLIC_` vào tên key.

Nếu đã thêm `NEXT_PUBLIC_SUPABASE_URL` theo hướng dẫn cũ, URL đó vẫn dùng được; không bắt buộc đổi tên. `NEXT_PUBLIC_SUPABASE_ANON_KEY` không còn cần thiết.

## Bước 3 — Cập nhật website

Merge nhánh `feature/trainer-submissions` vào `main` sau khi cấu hình xong. Vercel sẽ build phiên bản mới; nếu thêm biến sau khi build, chọn **Redeploy**.

Học viên vẫn đi qua bài tập hiện tại, nhập họ tên/mã lớp, xem mô phỏng và bấm **Nộp đề xuất cuối cùng**. Chỉ khi server xác nhận thì app mới hiện **Đã nộp**. Không tạo tài khoản học viên.

## Bước 4 — Trainer xem kết quả

Mở https://supabase.com/dashboard/project/bfcgltjyrtpjgqvbexxz/editor bằng tài khoản Supabase quản lý dự án.

Trong **Table Editor**, chọn view **trainer_results**. Nếu chưa thấy view, tìm trong danh sách quan hệ; cũng có thể dùng SQL Editor:

```sql
select * from public.trainer_results order by thoi_gian_nop desc;
```

Các cột dễ đọc:

- `ho_va_ten`, `ma_lop`, `thoi_gian_nop`: ai nộp, lớp nào, khi nào.
- `ngan_sach_broad`, `ngan_sach_lookalike`, `ngan_sach_retargeting`: ngân sách.
- `lap_luan_nguyen_van`, `dieu_kien_dieu_chinh`: câu trả lời gốc.
- `bao_cao_day_du`: bản tóm tắt đầy đủ gồm phát hiện, hành động, KPI và rủi ro.
- `lich_su_de_xuat`, `phan_hoi_mo_phong`: bản đầu, bản sửa và phản hồi.

Để xem một lớp:

```sql
select * from public.trainer_results
where ma_lop = 'DP27'
order by thoi_gian_nop desc;
```

Có thể tải kết quả CSV từ bảng kết quả query trong SQL Editor. Trong app, `/trainer` chỉ là lối tắt sang Supabase, không có form đăng nhập hay danh sách bài nộp công khai.

## Kiểm thử một lần

Nộp một bài với mã lớp `TEST01`, đợi xác nhận, rồi mở `trainer_results` trong Supabase để kiểm tra họ tên, lập luận và báo cáo. Nếu có sửa một lần, lịch sử phải có hai bản. Refresh hoặc thử gửi lại không được tạo bài trùng.

Đã kiểm thử POST nộp bài trên bản production local nối tới dự án Supabase thật: server trả 201, câu trả lời/báo cáo được lưu đúng, retry không tạo trùng và bài mẫu đã được xóa. View `trainer_results` chưa có trong dự án thật; chạy SQL mới để tạo view. Việc cập nhật website Vercel chưa được xác minh.

Trong lúc chưa tạo view, bạn đã có thể mở bảng `submissions`: `final_proposal` chứa câu trả lời cuối và `feedback` chứa báo cáo đầy đủ.

## Lưu giữ và xóa

Mặc định giữ bài tối đa 90 ngày; không lưu email, mật khẩu học viên hoặc IP thô. Bản nháp trên trình duyệt cũng hết hạn sau 90 ngày hoặc khi reset. Reset không xóa bài trên Supabase.

Supabase **Database → Extensions** → bật `pg_cron`, rồi chạy một lần:

```sql
select cron.schedule('glow-nature-daily-retention','0 20 * * *',
 'select public.cleanup_campaign_submissions();');
```

Nếu chưa bật cron, chạy thủ công hằng ngày:

```sql
select public.cleanup_campaign_submissions();
```

Để xóa bài theo yêu cầu học viên, tìm đúng mã bài rồi xóa dòng trong bảng `submissions`; receipt đi kèm tự xóa. Không tắt RLS hoặc cho public đọc bảng: chỉ tài khoản quản lý Supabase cần xem dữ liệu này.
