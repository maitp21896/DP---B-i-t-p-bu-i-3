import "server-only";
import { createClient } from "@supabase/supabase-js";
import { HttpError } from "@/lib/submissions/http";
function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url)
    throw new HttpError(
      503,
      "Dịch vụ nộp bài chưa được cấu hình. Bài làm vẫn được lưu trên thiết bị.",
    );
  return { url };
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
