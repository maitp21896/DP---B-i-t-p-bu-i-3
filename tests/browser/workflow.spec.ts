import { test, expect, Page } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
const rationale =
  "Tôi giữ ngân sách người mới để mở rộng nguồn truy cập. Broad có LPV Rate thấp nên tôi kiểm tra tốc độ trang và tracking trước khi kết luận nguyên nhân. Retargeting có Frequency cao và CPA tăng, vì vậy cần creative mới và kiểm chứng xu hướng. Tôi ưu tiên Traffic và theo dõi Cost/LPV cùng ATC Rate.";
async function begin(page: Page) {
  await page.getByLabel("Họ và tên", { exact: true }).fill("Học Viên Kiểm Thử");
  await page.getByLabel("Mã lớp", { exact: true }).fill("DP27");
  await page.getByRole("button", { name: "Khám phá chiến dịch" }).click();
  await expect(
    page.getByRole("heading", { name: "Bối cảnh case & dữ liệu chiến dịch" }),
  ).toBeVisible();
}
async function budget(page: Page) {
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 1", exact: true })
    .click();
  await page
    .getByLabel("Nhận xét của bạn", { exact: true })
    .fill("Retargeting có Frequency 6,8 và CPA ngày 7 tăng so với ngày 1.");
  await page.getByRole("button", { name: "Lưu nhận xét" }).click();
  await page.getByLabel("Lập luận của bạn", { exact: true }).fill(rationale);
}
async function finish(page: Page) {
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 2", exact: true })
    .click();
  await page.getByLabel("Kiểm tra tốc độ mobile và hụt").check();
  await page.getByLabel("Đổi creative Retargeting").check();
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 3", exact: true })
    .click();
  await page.getByRole("checkbox", { name: "Cost / LPV", exact: true }).check();
  await page.getByRole("checkbox", { name: "ATC Rate", exact: true }).check();
  await page
    .getByLabel("Điều kiện và hành động điều chỉnh")
    .fill(
      "Nếu Cost/LPV tăng trên 20% trong ba ngày và ATC Rate giảm, tôi sẽ kiểm tra placement trước khi tăng ngân sách.",
    );
  await page.getByRole("button", { name: "Xem đánh giá mô phỏng" }).click();
}
test("popup, case and dataset, three tasks, revision, PDF and reset work end-to-end", async ({
  page,
  browserName,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Thông tin học viên" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Họ và tên", { exact: true })).toBeFocused();
  await page.getByLabel("Họ và tên", { exact: true }).fill("Nguyễn Minh Anh");
  await page.getByRole("button", { name: "Khám phá chiến dịch" }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Bắt đầu bài tập" }).click();
  await expect(page.getByLabel("Họ và tên", { exact: true })).toHaveValue(
    "Nguyễn Minh Anh",
  );
  await page.screenshot({
    path: "/tmp/glow-nature-identity-popup.png",
    fullPage: true,
  });
  await begin(page);
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("2.444", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xem dữ liệu theo ngày" }).click();
  await page.getByLabel("Chỉ số", { exact: true }).selectOption("lpvRate");
  await page.getByRole("checkbox", { name: "Broad", exact: true }).uncheck();
  await budget(page);
  const broad = page.getByRole("slider", { name: "Ngân sách Broad" });
  await broad.fill("8000000");
  await expect(broad).toHaveValue("8000000");
  await page.reload();
  await expect(
    page.getByLabel("Lập luận của bạn", { exact: true }),
  ).toHaveValue(rationale);
  await page.getByRole("button", { name: "Xem lại yêu cầu bài tập" }).click();
  await expect(
    page.getByRole("dialog", { name: "Yêu cầu bài tập" }),
  ).toContainText("Phân bổ ngân sách");
  await page.getByRole("button", { name: "Tiếp tục bài làm" }).click();
  await finish(page);
  await expect(page.locator(".proposal")).toContainText(rationale);
  await expect(page.locator(".proposal")).toContainText("Học Viên Kiểm Thử");
  await page.getByRole("button", { name: "Điều chỉnh một lần" }).click();
  await page
    .getByRole("slider", { name: "Ngân sách Retargeting" })
    .fill("1600000");
  await page
    .getByRole("slider", { name: "Ngân sách Lookalike 1%" })
    .fill("3400000");
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 3", exact: true })
    .click();
  await page.getByRole("button", { name: "Đánh giá bản điều chỉnh" }).click();
  await expect(page.getByText("Đã dùng lượt điều chỉnh")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "So sánh đề xuất ban đầu & điều chỉnh" }),
  ).toBeVisible();
  if (browserName === "chromium") {
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      path: "/tmp/glow-nature-report.pdf",
    });
    expect((await PDFDocument.load(pdf)).getPageCount()).toBe(1);
    await page.emulateMedia({ media: "screen" });
  }
  await page.getByRole("button", { name: "Làm lại", exact: true }).click();
  await page.getByRole("button", { name: "Xóa & bắt đầu lại" }).click();
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Họ và tên", { exact: true })).toHaveValue("");
  expect(errors).toEqual([]);
});
test("each assignment validates before Next; drafts persist when moving back", async ({
  page,
}) => {
  await page.goto("/");
  await begin(page);
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 2", exact: true })
    .click();
  await expect(page.locator(".error[role=alert]")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Bài 1 · Phân bổ ngân sách",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Nhận xét của bạn", { exact: true })
    .fill("Broad có LPV Rate 52%, thấp hơn Lookalike 70%.");
  await page.getByRole("button", { name: "Lưu nhận xét" }).click();
  await page.getByLabel("Lập luận của bạn", { exact: true }).fill(rationale);
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tiếp theo · Bài 3", exact: true })
    .click();
  await expect(page.locator(".error[role=alert]")).toContainText("hành động");
  await page.getByRole("button", { name: "← Quay lại", exact: true }).click();
  await expect(
    page.getByLabel("Lập luận của bạn", { exact: true }),
  ).toHaveValue(rationale);
});
test("simulation does not submit; failure retries exact snapshot and confirmation persists", async ({
  page,
}) => {
  await page.goto("/");
  await begin(page);
  await budget(page);
  let calls = 0;
  let first = "";
  await page.route("**/api/submissions", async (route) => {
    calls++;
    const body = route.request().postData()!;
    if (calls === 1) {
      first = body;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Lỗi lưu bài kiểm thử" }),
      });
    } else {
      expect(body).toBe(first);
      const d = JSON.parse(body);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: d.id,
          submittedAt: "2026-10-13T06:00:00.000Z",
          status: "submitted",
        }),
      });
    }
  });
  await finish(page);
  expect(calls).toBe(0);
  await page.getByLabel("Tôi đã kiểm tra đề xuất").check();
  await page
    .getByRole("button", { name: "Nộp đề xuất cuối cùng", exact: true })
    .click();
  await expect(page.locator(".final-submit .error")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Thử nộp lại" }).click();
  await expect(page.getByText("Đã nộp đề xuất cho giảng viên")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Đã nộp đề xuất cho giảng viên")).toBeVisible();
  expect(calls).toBe(2);
});
test("tablet and mobile do not overflow in popup, dataset or tasks", async ({
  page,
}) => {
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/");
    if (await page.getByRole("dialog", { name: "Thông tin học viên" }).count())
      await begin(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (
      await page
        .getByRole("button", { name: "Tiếp theo · Bài 1", exact: true })
        .count()
    )
      await budget(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
test("trainer page has no login and rejects public access to Excel", async ({
  page,
  request,
}) => {
  await page.goto("/trainer");
  await expect(
    page.getByRole("heading", { name: "Tải bài nộp của lớp" }),
  ).toBeVisible();
  await expect(
    page.getByText("Hãy mở link riêng dành cho trainer", { exact: false }),
  ).toBeVisible();
  const response = await request.post("/api/trainer/export", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { classCode: "DP27" },
  });
  expect(response.status()).toBe(403);
});

test("legacy v2 draft keeps identity, budgets and rationale in the new task flow", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "glow-nature-session-v2",
      JSON.stringify({
        stage: 2,
        started: Date.now(),
        timer: false,
        budgets: { broad: 2800000, lal: 3600000, rt: 1600000 },
        actions: [],
        rationale:
          "Đây là lập luận nguyên văn đã lưu trước khi cập nhật giao diện. Tôi giữ nguyên dữ liệu để tiếp tục phân tích ngân sách cho chiến dịch Traffic.",
        evidence: [],
        monitors: [],
        rule: "",
        submissions: [],
        identity: {
          studentName: "Học Viên Kiểm Thử",
          classCode: "TEST_MIGRATE",
        },
        sessionId: "11111111-1111-4111-8111-111111111111",
        receiptToken: "a".repeat(64),
        delivery: null,
        pendingSubmission: null,
      }),
    );
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Bài 1 · Phân bổ ngân sách",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Ngân sách Lookalike 1%" }),
  ).toHaveValue("3600000");
  expect(
    await page.getByLabel("Lập luận của bạn", { exact: true }).inputValue(),
  ).toContain("Đây là lập luận nguyên văn");
  await expect(
    page.getByRole("dialog", { name: "Thông tin học viên" }),
  ).toHaveCount(0);
});
test("trainer private-link UI downloads a class Excel file without login", async ({
  page,
}) => {
  await page.route("**/api/trainer/export", (route) =>
    route.fulfill({
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      body: Buffer.from("test-only-download-response"),
    }),
  );
  await page.goto("/trainer#key=test-only-private-link-fixture-000000000000");
  await page.getByLabel("Mã lớp", { exact: true }).fill("DP27");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải Excel tổng hợp", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("Glow-Nature-DP27.xlsx");
  await expect(
    page.getByText("Đã tải file Excel.", { exact: false }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/glow-nature-trainer-excel.png",
    fullPage: true,
  });
});

test("step buttons navigate freely and dragging reallocates a fully allocated budget", async ({ page }) => {
  await page.goto("/");
  await begin(page);
  const progress = page.locator(".progress");
  await progress.getByRole("button", { name: "Bài 3 · Theo dõi" }).click();
  await expect(page.getByLabel("Điều kiện và hành động điều chỉnh")).toBeVisible();
  await progress.getByRole("button", { name: "Bài 1 · Ngân sách" }).click();
  const slider = page.getByRole("slider", { name: "Ngân sách Broad" });
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.375, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  expect(Number(await slider.inputValue())).toBeGreaterThan(3000000);
  const values = await page.locator('input[type="range"]').evaluateAll((inputs) => inputs.map((input) => Number((input as HTMLInputElement).value)));
  expect(values.reduce((a, b) => a + b, 0)).toBe(8000000);
  await progress.getByRole("button", { name: "Case & dataset" }).click();
  await progress.getByRole("button", { name: "Bài 1 · Ngân sách" }).click();
  expect(Number(await slider.inputValue())).toBe(values[0]);
  await progress.getByRole("button", { name: "Kết quả & nộp bài" }).click();
  await expect(page.locator(".error[role=alert]")).toBeVisible();
});
