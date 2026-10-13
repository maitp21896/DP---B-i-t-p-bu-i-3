import { adminClient } from "@/lib/supabase/server";
import {
  failure,
  HttpError,
  readBoundedJson,
  checkOrigin,
} from "@/lib/submissions/http";
import { validExportToken } from "@/lib/trainer-export-auth";
import { classWorkbook } from "@/lib/excel";
import { StoredSubmission } from "@/types/campaign";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const token =
      request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
    if (!validExportToken(token, process.env.TRAINER_EXPORT_TOKEN))
      throw new HttpError(
        403,
        "Link tải kết quả không hợp lệ hoặc đã được đổi.",
      );
    checkOrigin(request);
    const body = (await readBoundedJson(request, 1024)) as {
      classCode?: unknown;
    };
    if (!body || typeof body.classCode !== "string")
      throw new HttpError(400, "Nhập mã lớp cần tải.");
    const cls = body.classCode.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{1,23}$/.test(cls))
      throw new HttpError(400, "Mã lớp không hợp lệ.");
    const db = adminClient();
    let rows: StoredSubmission[] = [];
    for (let page = 0; page < 3; page++) {
      const { data, error } = await db
        .from("submissions")
        .select(
          "id,student_name,class_code,submitted_at,status,versions,final_proposal,final_version,final_score,feedback,data_version",
        )
        .eq("class_code", cls)
        .gt("submitted_at", new Date(Date.now() - 90 * 86400000).toISOString())
        .order("submitted_at")
        .order("id")
        .range(page * 100, page * 100 + 99);
      if (error)
        throw new HttpError(
          503,
          "Chưa tải được bài nộp từ database. Thử lại sau.",
        );
      rows.push(...(data as StoredSubmission[]));
      if (data.length < 100) break;
    }
    if (rows.length > 200)
      throw new HttpError(
        413,
        "Lớp có hơn 200 bài nộp. Cần chia nhóm lớp để xuất file nhỏ hơn.",
      );
    if (!rows.length)
      throw new HttpError(
        404,
        "Lớp này chưa có bài nộp trong thời hạn lưu 90 ngày.",
      );
    const bytes = await classWorkbook(rows);
    if (bytes.length > 4000000)
      throw new HttpError(
        413,
        "File quá lớn để tải trong một lần. Cần chia nhóm lớp.",
      );
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Glow-Nature-${cls}.xlsx"`,
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
