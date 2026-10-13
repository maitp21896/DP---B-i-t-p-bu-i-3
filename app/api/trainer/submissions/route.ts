import { trainerClient } from "@/lib/supabase/server";
import {
  failure,
  HttpError,
  checkOrigin,
  readBoundedJson,
} from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const db = await trainerClient(request);
    checkOrigin(request);
    const p = (await readBoundedJson(request, 4096)) as Record<string, unknown>;
    if (
      !p ||
      typeof p !== "object" ||
      Array.isArray(p) ||
      Object.keys(p).some(
        (k) => !["class", "search", "page", "id"].includes(k),
      ) ||
      ("class" in p && typeof p.class !== "string") ||
      ("search" in p && typeof p.search !== "string") ||
      ("page" in p && typeof p.page !== "number") ||
      ("id" in p && typeof p.id !== "string")
    )
      throw new HttpError(400, "Bộ lọc không hợp lệ.");
    const cls = ((p.class as string) || "").trim().toUpperCase();
    const search = ((p.search as string) || "").trim();
    const page = Number(p.page || 0);
    if (
      cls.length > 24 ||
      search.length > 100 ||
      !Number.isInteger(page) ||
      page < 0 ||
      page > 10000
    )
      throw new HttpError(400, "Bộ lọc không hợp lệ.");
    const rawId = p.id as string | undefined;
    if (rawId) {
      if (!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(rawId))
        throw new HttpError(400, "Mã bài nộp không hợp lệ.");
      const { data, error } = await db
        .from("submissions")
        .select("*")
        .eq("id", rawId)
        .maybeSingle();
      if (error) throw new HttpError(503, "Không tải được bài nộp.");
      if (!data)
        throw new HttpError(
          404,
          "Không tìm thấy bài nộp hoặc bài đã hết thời hạn lưu.",
        );
      return Response.json(
        { submission: data },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    let q = db
      .from("submissions")
      .select(
        "id,student_name,class_code,submitted_at,status,final_score,final_version",
        { count: "exact" },
      )
      .order("submitted_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * 50, page * 50 + 49);
    if (cls) q = q.eq("class_code", cls);
    if (search) {
      const literal = search.replace(/[\\%_]/g, "\\$&");
      q = q.ilike("student_name", `%${literal}%`);
    }
    const { data, error, count } = await q;
    if (error)
      throw new HttpError(
        503,
        "Không tải được danh sách bài nộp. Kiểm tra cấu hình database.",
      );
    return Response.json(
      { submissions: data, total: count, page },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
