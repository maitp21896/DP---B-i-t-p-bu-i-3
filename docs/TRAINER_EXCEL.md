# Trainer nhận kết quả bằng Excel, không vào Supabase

## Cách dùng

Trainer mở link riêng → nhập mã lớp, ví dụ `DP27` → **Tải Excel tổng hợp**.

File `.xlsx` có:

- **Tong hop lop**: một dòng cho mỗi bài cuối, gồm họ tên, mã lớp, ngày nộp, ngân sách, giải thích nguyên văn, bằng chứng, hành động, KPI, điều kiện điều chỉnh và điểm tham khảo.
- **Lich su va phan hoi**: bản đầu và bản sửa nếu có, cùng phản hồi đã lưu.
- **Huong dan**: cách đọc file và giới hạn của điểm mô phỏng.

Không cần tài khoản trainer. Link riêng là quyền tải kết quả; chỉ gửi link bài tập thông thường cho học viên.

## Cấu hình Vercel — thêm một biến

Ngoài URL và service-role key Supabase đã có, server cần:

`TRAINER_EXPORT_TOKEN`: chuỗi ngẫu nhiên dài ít nhất 32 ký tự, không thêm `NEXT_PUBLIC_`.

Môi trường làm việc đã tạo sẵn hai file riêng ngoài repository:

- `trainer-export.env`: chỉ có biến mới để **Import .env** trong Vercel → Environment Variables. Chọn Secret, Production (và Preview nếu kiểm thử nhánh trước khi merge).
- `trainer-link.txt`: link trainer chứa cùng khóa trong phần sau `#`. Mở link này sau khi website cập nhật; không đăng link lên nhóm học viên.

Hai file không chứa service-role key và không được commit. Import không thay thế URL/key Supabase đã cấu hình.

Nếu bạn tự đặt token, dùng link `https://TEN-WEBSITE/trainer#key=TOKEN-CUA-BAN` rồi bookmark. Token nằm trong fragment nên không được gửi trong URL request hay Referrer; app gửi nó trong Authorization header khi tải file. Không đưa giá trị token vào chat hoặc ảnh chụp.

## Bài tập học viên

Popup thông tin → case & dataset → Bài 1 ngân sách → Bài 2 tối ưu → Bài 3 KPI/điều kiện điều chỉnh → mô phỏng, sửa một lần nếu cần → nộp bản cuối. Nút Next kiểm tra câu trả lời của từng bài. Bản nháp cũ được chuyển sang luồng mới và giữ nguyên nội dung.

Chỉ bài được server xác nhận đã nộp mới có trong Excel. Nếu lớp chưa có bài, trainer nhận thông báo rõ ràng. Mỗi lần tải hỗ trợ tối đa 200 bài trong 90 ngày; file lớn hơn 4 MB sẽ báo giới hạn thay vì xuất thiếu dữ liệu. Nếu lớp cần nhiều hơn, chia mã lớp theo nhóm.

## Bảo vệ dữ liệu

Không có endpoint liệt kê public. API xuất Excel kiểm tra token trên server trước khi đọc database. Service-role key không gửi về trình duyệt. Các câu trả lời được lưu dạng text trong XLSX, không được diễn giải thành công thức Excel. File chứa tên và câu trả lời: chỉ trainer nên giữ file.

Muốn thu hồi link, đổi `TRAINER_EXPORT_TOKEN` trong Vercel, redeploy và tạo link mới tương ứng. Người giữ link cũ không tải được nữa.

## Kiểm chứng

Bản cập nhật đã pass production build, TypeScript, 15 unit tests và 7 Chromium browser tests. Kiểm thử thật dùng một bài mẫu có hai phiên bản: POST vào app trả 201, xuất Excel bằng khóa đúng trả 200, không có khóa trả 403; file mở/đọc được bằng ExcelJS và giữ nguyên lập luận, ngân sách cuối và lịch sử. Bài mẫu đã được xóa. Khóa xuất file không xuất hiện trong browser bundle.

Các bài test browser có response mô phỏng để kiểm tra UX retry và tải file; kiểm thử Supabase/XLSX thật được thực hiện riêng. Chưa xác nhận bản cập nhật mới trên Vercel production. Safari/WebKit vẫn chưa được kiểm chứng.
