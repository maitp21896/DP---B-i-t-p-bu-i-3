import { notifyGoogleSheets } from "@/lib/google-sheets";
import { checkOrigin, failure } from "@/lib/submissions/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const status = await notifyGoogleSheets();
    const message =
      status === "synced"
        ? "Đã đồng bộ. Mở Google Sheet và chọn tab “Bài nộp học viên”; mỗi bài đã nộp thành công là một dòng."
        : status === "not-configured"
          ? "Vercel chưa có GOOGLE_SHEETS_WEBHOOK_URL. Thêm URL Apps Script vào Environment Variables của Production, Save rồi Redeploy."
          : "Google Sheet chưa xác nhận đồng bộ. Trong Apps Script, chạy hàm syncNow và xem Nhật ký thực thi để biết lỗi. Kiểm tra Web app được triển khai Execute as: Me, Who has access: Anyone và URL kết thúc /exec.";
    return Response.json(
      { status, message },
      {
        status: status === "synced" ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (e) {
    return failure(e);
  }
}
