import "server-only";
import { createClient } from "@supabase/supabase-js";
import { HttpError } from "@/lib/submissions/http";
function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon)
    throw new HttpError(
      503,
      "Dịch vụ nộp bài chưa được cấu hình. Bài làm vẫn được lưu trên thiết bị.",
    );
  return { url, anon };
}
export function adminClient() {
  const { url } = config();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key)
    throw new HttpError(
      503,
      "Dịch vụ nộp bài chưa được cấu hình. Bài làm vẫn được lưu trên thiết bị.",
    );
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function trainerClient(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ") || header.length > 8192)
    throw new HttpError(401, "Vui lòng đăng nhập bằng tài khoản giảng viên.");
  const { url, anon } = config();
  const token = header.slice(7);
  const db = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user)
    throw new HttpError(
      401,
      "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
    );
  const trainer = await db
    .from("trainers")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (trainer.error)
    throw new HttpError(
      503,
      "Chưa thể xác minh quyền giảng viên. Kiểm tra cấu hình database.",
    );
  if (!trainer.data)
    throw new HttpError(403, "Tài khoản này chưa được cấp quyền giảng viên.");
  return db;
}
