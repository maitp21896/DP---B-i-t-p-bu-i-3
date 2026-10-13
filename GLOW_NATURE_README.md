# Glow Nature — Campaign Rescue Simulator

Ứng dụng Next.js/TypeScript tiếng Việt cho Tomorrow Marketers. Giữ dashboard, ngân sách tương tác, mô phỏng, một lần điều chỉnh, local draft và báo cáo PDF.

Luồng đơn giản: học viên nhập họ tên/mã lớp → làm bài → nộp bản cuối → server lưu Supabase → trainer mở `trainer_results` trong Supabase để xem. Không có đăng ký học viên, đăng nhập trainer trong app hoặc phân quyền trainer tự xây.

## Cài đặt và triển khai

[Hướng dẫn Supabase/Vercel đơn giản](docs/SUPABASE_SETUP.md). Chỉ cần URL Supabase và service-role key trên server. Không cần anon key. Không đưa key vào mã nguồn hoặc chat.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm start
```

Cloud có thể dùng `npm ci --cache /workspace/.npm-cache`. Dùng checkout hiện tại, không tạo Git worktree nếu không được yêu cầu. Vercel dùng preset Next.js, root `./`, build `npm run build`.

## Dữ liệu và lưu bài

Workbook gốc được giữ nguyên tại `data/source.xlsx`, JSON tại `data/campaign.json`. 21 dòng theo ngày reconcile: Spend 8.000.000 VND, Click 3.800, LPV 2.444, ATC 132, Purchase 33. `scripts/import_data.py` cho phép nhập lại với openpyxl. Reach/Frequency không cộng dồn; chia cho 0 trả N/A. Không có impressions nên CTR/CPM cần dữ liệu bổ sung.

`lib/metrics.ts` và `lib/simulation.ts` giữ nguyên quy tắc giáo dục. Điểm /70 chỉ tham khảo; 30 điểm lập luận cần trainer xem xét. Không dự báo kết quả Meta Ads.

`app/api/submissions` xác minh payload, tính lại feedback, tạo báo cáo dễ đọc và gọi RPC Supabase. Key chỉ nằm trên server. Học viên không được đọc danh sách bài. Receipt riêng xử lý retry để không lưu trùng. Payload/text có giới hạn, endpoint kiểm tra origin và database giới hạn số yêu cầu.

`supabase/schema.sql` tạo bảng lưu, view `trainer_results`, RPC và cleanup 90 ngày. Trainer xem dữ liệu bằng tài khoản quản lý Supabase đã có; `/trainer` chỉ hướng dẫn và mở bảng. Không có trainer API riêng hay app login.

Local draft hồi phục khi refresh; reset xóa draft, không xóa bài server. Chỉ bấm Nộp cuối mới gửi bài; lỗi gửi không được coi là thành công. Báo cáo giữ nguyên câu trả lời, hiển thị họ tên/mã lớp và có thể in PDF.

## Kiểm thử

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser -- --project=chromium
```

Playwright chạy production server, kiểm tra identity, assignment review, persistence, revision, PDF, retry/confirmation và lối tắt xem kết quả. Kiểm thử phản hồi nộp bài dùng response giả lập có ghi rõ trong test; chưa chứng minh live Supabase.

Kiểm tra SQL thật trong PostgreSQL Docker riêng, không dùng database production:

```sh
docker run --detach --name glow-nature-rls-test --network none -e POSTGRES_PASSWORD=local-test-only postgres:17-alpine
python tests/database/run.py
docker rm -f glow-nature-rls-test
```

SQL tests kiểm tra public không đọc/sửa dữ liệu, owner đọc view kết quả, retry/conflict, rate limit và cleanup. Đã kiểm chứng app POST → Supabase thật → đọc lại câu trả lời/báo cáo và retry không lưu trùng; test record đã được xóa. View `trainer_results` trên dự án thật cần chạy SQL mới. Safari/WebKit và phiên bản triển khai Vercel vẫn chưa được kiểm chứng trong lần cập nhật này.

Trong cloud Node.js 24, dùng `NODE_USE_ENV_PROXY=1 npm start` để đi qua proxy có sẵn. Vercel không cần tùy chọn proxy này.

[Ảnh giao diện học viên](docs/screenshots/learner-assignment.png). Giao diện xem kết quả cuối là Table Editor có sẵn của Supabase.
