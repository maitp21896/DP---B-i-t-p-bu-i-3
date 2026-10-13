export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
export async function readBoundedJson(
  request: Request,
  maxBytes = 65536,
): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new HttpError(415, "Yêu cầu phải ở định dạng JSON.");
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new HttpError(413, "Bài nộp quá lớn.");
  if (!request.body) throw new HttpError(400, "Thiếu nội dung bài nộp.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, "Bài nộp quá lớn.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const combined = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    combined.set(c, offset);
    offset += c.byteLength;
  }
  try {
    return JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(combined),
    );
  } catch {
    throw new HttpError(400, "Nội dung JSON không hợp lệ.");
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Next may build Request.url using an internal hostname behind a proxy.
  // Browser-supplied Host is forbidden; use the received request Host, not forwarded headers.
  const host = request.headers.get("host") || new URL(request.url).host;
  let allowed = false;
  try {
    const parsed = new URL(origin || "");
    allowed =
      parsed.origin === origin &&
      parsed.host === host &&
      ["https:", "http:"].includes(parsed.protocol);
  } catch {}
  if (!allowed) throw new HttpError(403, "Chỉ nhận bài nộp từ website này.");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new HttpError(403, "Yêu cầu không hợp lệ.");
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return Response.json(
      { error: error.message },
      {
        status: error.status,
        headers: {
          "Cache-Control": "no-store",
          ...(error.retryAfter
            ? { "Retry-After": String(error.retryAfter) }
            : {}),
        },
      },
    );
  return Response.json(
    {
      error:
        "Không thể kết nối dịch vụ lúc này. Bài làm vẫn được giữ trên thiết bị; vui lòng thử lại.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
