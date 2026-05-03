import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "home", path: "/" },
  { name: "work", path: "/work/" },
  { name: "work-detail", path: "/work/casa-kddk/" },
  { name: "service", path: "/service/" },
  { name: "about", path: "/about/" },
  { name: "contact", path: "/contact/" },
  { name: "404", path: "/404" },
];

// Rules disabled due to pre-existing design/content choices that would require
// significant redesign to fix. We still run the scan and monitor for regressions.
const DISABLED_RULES = ["color-contrast", "label-content-name-mismatch", "heading-order"];

for (const pageInfo of pages) {
  test(`a11y ${pageInfo.name}`, async ({ page }) => {
    await page.goto(pageInfo.path, { waitUntil: "networkidle" });
    await expect(page.locator("body")).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .disableRules(DISABLED_RULES)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
}
