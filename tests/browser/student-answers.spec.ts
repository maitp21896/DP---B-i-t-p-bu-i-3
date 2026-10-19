import { test, expect } from "@playwright/test";

test("student answer page opens directly without student results or export controls", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) calls.push(request.url());
  });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dap-an-goi-y");
    await expect(
      page.getByRole("heading", {
        name: "Đáp án gợi ý cho học viên",
        exact: true,
      }),
    ).toBeVisible();
    for (const scenario of [
      "Balanced Growth",
      "Acquisition First",
      "Conversion Support",
    ])
      await expect(
        page.getByRole("heading", { name: new RegExp(scenario) }),
      ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "3. KPI và nguyên tắc điều chỉnh cho từng scenario",
      }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /Excel|Google Sheet/ }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Đáp án gợi ý cho học viên",
        exact: true,
      }),
    ).toBeVisible();
  }
  expect(calls).toEqual([]);
});
