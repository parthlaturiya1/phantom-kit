import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const MODES = ["Flat", "Window", "Ghost Desk", "Card"];

test("demo: four shapes, four buttons, axe clean on every screen, no network after load", async ({ page }) => {
  const requests: string[] = [];
  await page.goto("/");
  page.on("request", (r) => requests.push(r.url()));
  for (const name of ["L block", "Square pyramid", "Standing triangle prism", "Eight-sided log"]) {
    await expect(page.getByRole("button", { name })).toBeVisible();
  }
  for (const mode of MODES) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await expect(page.getByRole("button", { name: mode, exact: true })).toHaveAttribute("aria-pressed", "true");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `axe on ${mode}`).toEqual([]);
  }
  expect(requests).toEqual([]);
});

test("ghost desk shows the honest line, the guide and the sharp-edge warning", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ghost Desk", exact: true }).click();
  await expect(page.getByText("Pepper's ghost illusion, best for 2 to 4 learners in a dim room. Not a true hologram.")).toBeVisible();
  await expect(page.getByText(/sharp edges/)).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(6);
  // black background, and the canvas has bright pixels
  const bright = await page.locator("canvas").evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    const corner = d[0] + d[1] + d[2];
    let white = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 250 && d[i + 1] > 250 && d[i + 2] > 250) white++;
    return { corner, white };
  });
  expect(bright.corner).toBe(0);
  expect(bright.white).toBeGreaterThan(100);
});

test("card prints on one A4 page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Card", exact: true }).click();
  await expect(page.locator(".sheet svg")).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Print card" })).toBeHidden();
  const pdf = await page.pdf({ preferCSSPageSize: true });
  expect(pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)).toHaveLength(1);
  const box = await page.locator(".sheet svg").boundingBox();
  expect(box!.width).toBeCloseTo((210 / 25.4) * 96, 0);
});
