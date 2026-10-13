import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
const rationale =
  "Tôi giữ ngân sách người mới để mở rộng nguồn truy cập. Broad có LPV Rate thấp nên tôi kiểm tra tốc độ trang và tracking trước khi kết luận nguyên nhân. Retargeting có Frequency cao và CPA tăng, vì vậy cần creative mới và kiểm chứng xu hướng. Tôi ưu tiên Traffic và theo dõi Cost/LPV cùng ATC Rate.";
async function fill(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Lập chiến lược" }).click();
  await page.getByLabel("Kiểm tra tốc độ mobile và hụt").check();
  await page.getByLabel("Đổi creative Retargeting").check();
  await page
    .getByLabel("Nhận xét của bạn", { exact: true })
    .fill("Retargeting có Frequency 6,8 và CPA ngày 7 tăng so với ngày 1.");
  await page.getByRole("button", { name: "Lưu nhận xét" }).click();
  await page.getByLabel("Lập luận của bạn", { exact: true }).fill(rationale);
  await page.getByRole("checkbox", { name: "Cost / LPV", exact: true }).check();
  await page.getByRole("checkbox", { name: "ATC Rate", exact: true }).check();
  await page
    .getByLabel("Điều kiện và hành động điều chỉnh")
    .fill(
      "Nếu Cost/LPV tăng trên 20% trong ba ngày và ATC Rate giảm, tôi sẽ kiểm tra placement trước khi tăng ngân sách.",
    );
}
test("learner completes, persists, revises once, exports and resets", async ({
  page,
  browserName,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Khám phá chiến dịch" }).click();
  await page.screenshot({
    path: "/tmp/glow-nature-dashboard.png",
    fullPage: true,
  });
  await expect(page.getByText("2.444", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xem dữ liệu theo ngày" }).click();
  await expect(
    page.getByText("Dữ liệu gốc và chỉ số tính lại — 21 quan sát"),
  ).toBeVisible();
  await page.getByLabel("Chỉ số", { exact: true }).selectOption("lpvRate");
  await page.getByRole("checkbox", { name: "Broad", exact: true }).uncheck();
  await fill(page);
  const broad = page.getByRole("slider", { name: "Ngân sách Broad" });
  await broad.fill("8000000");
  await expect(broad).toHaveValue("3000000");
  await page.reload();
  await expect(
    page.getByLabel("Lập luận của bạn", { exact: true }),
  ).toHaveValue(rationale);
  await page.getByRole("button", { name: "Chạy đánh giá quyết định" }).click();
  await expect(
    page.getByText("Điểm mạnh, đánh đổi & điều cần kiểm chứng"),
  ).toBeVisible();
  await expect(page.locator(".proposal")).toContainText(rationale);
  await page.getByRole("button", { name: "Điều chỉnh một lần" }).click();
  await page
    .getByRole("slider", { name: "Ngân sách Retargeting" })
    .fill("1600000");
  await page
    .getByRole("slider", { name: "Ngân sách Lookalike 1%" })
    .fill("3400000");
  await page.getByRole("button", { name: "Đánh giá bản điều chỉnh" }).click();
  await expect(page.getByText("Đã dùng lượt điều chỉnh")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "So sánh đề xuất ban đầu & điều chỉnh" }),
  ).toBeVisible();
  await expect(page.locator(".proposal")).toContainText("3.400.000");
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tải bản tóm tắt" }).click();
  expect((await dl).suggestedFilename()).toContain("Glow-Nature");
  if (browserName === "chromium") {
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      path: "/tmp/glow-nature-report.pdf",
    });
    expect((await PDFDocument.load(pdf)).getPageCount()).toBe(1);
    await page.screenshot({
      path: "/tmp/glow-nature-report.png",
      fullPage: true,
    });
    await page.emulateMedia({ media: "screen" });
  }
  await page.getByRole("button", { name: "Làm lại", exact: true }).click();
  await page.getByRole("button", { name: "Xóa & bắt đầu lại" }).click();
  await expect(
    page.getByRole("button", { name: "Khám phá chiến dịch" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Khám phá chiến dịch" }).click();
  await page.getByRole("button", { name: "Lập chiến lược" }).click();
  await expect(
    page.getByLabel("Lập luận của bạn", { exact: true }),
  ).toHaveValue("");
  expect(errors).toEqual([]);
});
test("empty submissions blocked and tablet layout has no body overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await page.getByRole("button", { name: "Khám phá chiến dịch" }).click();
  await page.getByRole("button", { name: "Lập chiến lược" }).click();
  await page.getByRole("button", { name: "Chạy đánh giá quyết định" }).click();
  await expect(page.locator(".error[role=alert]")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("mobile fallback contains dashboard and decisions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Khám phá chiến dịch" }).click();
  await expect(
    page.getByRole("heading", { name: "So sánh Ad Set" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Lập chiến lược" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
