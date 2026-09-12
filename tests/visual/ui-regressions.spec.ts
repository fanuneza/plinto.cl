import { expect, test } from "@playwright/test";

test("reduced motion keeps the introduction and first project visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const introduction = page.locator(".brand-intro");
  await introduction.scrollIntoViewIfNeeded();
  // Visibility matchers do not consider ancestor opacity: check the painted subtree.
  expect(
    await introduction.evaluate((element) => {
      for (let node: Element | null = element; node; node = node.parentElement) {
        if (getComputedStyle(node).opacity === "0") return false;
      }
      return true;
    })
  ).toBe(true);

  await page.goto("/work/");
  const firstProject = page.locator(".work-card").first();
  await expect(firstProject).toBeVisible();
  await expect(firstProject.locator("..")).toHaveCSS("opacity", "1");
  await firstProject.click();
  await expect(page.locator(".work-hero h1")).toBeVisible();
});

test("mobile list view keeps project metadata inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/");
  await page.getByRole("button", { name: "Vista lista" }).click();
  await expect(page.getByRole("button", { name: "Vista lista" })).toHaveAttribute("aria-pressed", "true");
  for (const card of await page.locator(".work-card").all()) {
    await expect(card.locator(".work-year")).toBeVisible();
    const bounds = await card.locator(".work-meta").boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
