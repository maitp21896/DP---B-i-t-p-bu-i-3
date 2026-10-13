// The webhook only triggers a pull from the canonical database. It accepts no
// student answers, so callers cannot inject rows directly into the Sheet.
export async function notifyGoogleSheets(
  url = process.env.GOOGLE_SHEETS_WEBHOOK_URL,
  send: typeof fetch = fetch,
): Promise<"not-configured" | "synced" | "pending"> {
  if (!url) return "not-configured";
  if (
    !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
      url,
    )
  )
    return "pending";
  try {
    const response = await send(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!response.ok) return "pending";
    return (await response.json()).ok === true ? "synced" : "pending";
  } catch {
    return "pending";
  }
}
