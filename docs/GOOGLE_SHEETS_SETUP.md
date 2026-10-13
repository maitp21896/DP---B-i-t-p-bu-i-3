# Kết nối Google Sheets

Sheet đã chọn: https://docs.google.com/spreadsheets/d/1k7wdWHJbV7jmlDH1cadgvVNpcYUN_5z1s1rzy7whj3s/edit

## Bật kết nối một lần

1. Merge bản cập nhật và đợi Vercel báo Ready.
2. Mở Google Sheet → **Extensions / Tiện ích mở rộng → Apps Script**.
3. Thay nội dung `Code.gs` bằng toàn bộ mã trong [sheets/Code.gs](../sheets/Code.gs), rồi Save.
4. Chọn hàm **setup** ở thanh trên và bấm **Run**. Dùng tài khoản sở hữu Sheet để cấp quyền cho script đọc website và ghi vào Sheet. Nếu Google hiện cảnh báo ứng dụng chưa xác minh, chỉ tiếp tục nếu đây đúng là script bạn vừa tự tạo trong tài khoản của mình.
5. Script tạo tab riêng **Bài nộp học viên** và bật đồng bộ mỗi phút. Các tab khác được giữ nguyên. Không cần mở Sheet liên tục.
6. Để cập nhật ngay sau mỗi bài nộp: **Deploy → New deployment → Web app**. Chọn **Execute as: Me**, **Who has access: Anyone**, rồi Deploy.
7. Copy **Web app URL** kết thúc bằng `/exec`. Trong Vercel → Environment Variables, thêm `GOOGLE_SHEETS_WEBHOOK_URL` với URL đó, chọn Production → Save → Redeploy.

Web app không nhận câu trả lời do người gọi gửi vào. Nó chỉ đọc các bài đã được website xác nhận, nên không thể ghi một bài giả vào Sheet bằng cách gửi dữ liệu tùy ý vào webhook. Không cần token cho trainer hoặc webhook. Quyền xem/chỉnh sửa Google Sheet vẫn tuân theo Share của chủ Sheet.

## Hoạt động

Website lưu bài vào Supabase trước rồi gọi Apps Script sau khi trả xác nhận cho học viên. Bình thường Sheet cập nhật sau vài giây; nếu Google tạm lỗi hoặc bận, trigger mỗi phút lấy lại bài đã lưu. Retry dùng cùng mã bài và không tạo dòng trùng. Giới hạn/quota hoặc lỗi quyền của Google có thể làm chậm đồng bộ; bài gốc vẫn được giữ.

Bảng có tên, mã lớp, thời điểm nộp, ngân sách và câu trả lời nguyên văn. Không có điểm tham khảo hoặc số phiên bản. Nội dung dạng công thức được đưa vào ô dưới dạng văn bản. App lấy tối đa 1.000 bài trong 90 ngày; dữ liệu đã đưa vào Google Sheet được giữ cho tới khi chủ Sheet tự xóa.

Đáp án gợi ý ở `/trainer`. Nút mở Google Sheet dùng link đã chọn; Excel vẫn có sẵn để tải dự phòng. Chọn menu **Bài nộp học viên → Đồng bộ ngay** trong Sheet để lấy lại dữ liệu thủ công.

Nếu chỉnh mã Apps Script, dùng **Deploy → Manage deployments → Edit → New version → Deploy** để giữ nguyên URL webhook.
