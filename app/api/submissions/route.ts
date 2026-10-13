import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { adminClient } from "@/lib/supabase/server";
import {
  checkOrigin,
  failure,
  HttpError,
  readBoundedJson,
} from "@/lib/submissions/http";
import { submissionSchema } from "@/lib/submissions/schema";
import { evaluate } from "@/lib/simulation";
import { summary } from "@/lib/report-summary";
import { dataset } from "@/lib/metrics";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const parsed = submissionSchema.safeParse(await readBoundedJson(request));
    if (!parsed.success)
      throw new HttpError(
        400,
        parsed.error.issues
          .slice(0, 5)
          .map((i) => i.message)
          .join(" "),
      );
    const d = parsed.data;
    const db = adminClient();
    // Vercel overwrites x-vercel-forwarded-for. Ignore user-supplied x-forwarded-for.
    const ip =
      process.env.VERCEL === "1"
        ? (request.headers.get("x-vercel-forwarded-for") || "")
            .split(",")[0]
            .trim()
        : "local";
    if (process.env.VERCEL === "1" && !isIP(ip))
      throw new HttpError(
        503,
        "Chưa xác minh được kết nối nộp bài. Vui lòng thử lại.",
      );
    const hash = (s: string) => createHash("sha256").update(s).digest("hex");
    const payload = { identity: d.identity, versions: d.versions };
    const { data, error } = await db.rpc("submit_campaign", {
      p_id: d.id,
      p_token_hash: hash(d.receiptToken),
      p_payload_hash: hash(JSON.stringify(payload)),
      p_student_name: d.identity.studentName,
      p_class_code: d.identity.classCode,
      p_versions: d.versions,
      p_feedback: d.versions.map((version) => ({
        ...evaluate(version),
        report: summary(version, d.identity, d.id),
      })),
      p_final_score: evaluate(d.versions.at(-1)!).indicative,
      p_data_version: dataset.sha256,
      p_rate_key: hash(ip + process.env.SUPABASE_SERVICE_ROLE_KEY),
    });
    if (error) {
      if (error.message.includes("RATE_LIMIT"))
        throw new HttpError(
          429,
          "Bạn đã gửi quá nhiều yêu cầu. Chờ hai phút rồi thử lại.",
          120,
        );
      if (error.message.includes("SUBMISSION_CONFLICT"))
        throw new HttpError(
          409,
          "Mã phiên đã được dùng cho một bài nộp khác. Giữ bài làm hiện tại và liên hệ giảng viên.",
        );
      throw new HttpError(
        503,
        "Chưa thể lưu bài lên database. Bài làm vẫn được giữ; vui lòng thử lại.",
      );
    }
    if (!data?.id || !data?.submitted_at)
      throw new HttpError(
        503,
        "Máy chủ chưa xác nhận lưu bài. Vui lòng thử lại.",
      );
    return Response.json(
      { id: data.id, submittedAt: data.submitted_at, status: "submitted" },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
