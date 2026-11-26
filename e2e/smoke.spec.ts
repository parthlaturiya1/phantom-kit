import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("spinlab loads and has no axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Spin Lab" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
