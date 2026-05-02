import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const outputDir = path.resolve(".cache", "parity");
const pages = [
  { name: "home", path: "/", tag: "@home" },
  { name: "service", path: "/service/", tag: "@service" },
  { name: "work", path: "/work/", tag: "@work" },
  { name: "work-detail", path: "/work/campana-building-of-the-year-awards/", tag: "@work" },
  { name: "about", path: "/about/", tag: "@about" },
  { name: "contact", path: "/contact/", tag: "@contact" },
  { name: "404", path: "/404", tag: "@404" },
] as const;

const viewports = [
  { name: "1440", width: 1440, height: 2400 },
  { name: "1200", width: 1200, height: 2200 },
  { name: "810", width: 810, height: 2200 },
  { name: "390", width: 390, height: 3000 },
] as const;

test.beforeAll(async () => {
  await mkdir(outputDir, { recursive: true });
});

for (const pageInfo of pages) {
  for (const viewport of viewports) {
    test(`${pageInfo.tag} capture ${pageInfo.name} ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(pageInfo.path, { waitUntil: "networkidle" });
      await expect(page.locator("body")).toBeVisible();

      await page.screenshot({
        path: path.join(outputDir, `local-${pageInfo.name}-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
}
