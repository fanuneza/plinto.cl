import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const textExtensions = new Set([".astro", ".css", ".js", ".json", ".md", ".mdx", ".mjs", ".svg", ".ts", ".txt"]);

function filesIn(directory: string): string[] {
  if (!existsSync(directory)) return [];

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return filesIn(path);
    return path;
  });
}

function textFilesIn(directory: string) {
  return filesIn(directory).filter((file) => textExtensions.has(extname(file)));
}

test("source keeps analytics opt-in and ships no placeholders", () => {
  for (const file of [...textFilesIn(join(root, "src")), ...textFilesIn(join(root, "public"))]) {
    const source = readFileSync(file, "utf8");
    expect(source, relative(root, file)).not.toContain("gtag/js");
    expect(source, relative(root, file)).not.toContain("google-analytics.com/gtag");
    expect(source, relative(root, file)).not.toContain("REPLACE_WITH_");
  }
});

test("astro sources carry no inline styles except custom properties", () => {
  const inlineStyle = /style="(?!--)/;
  for (const file of textFilesIn(join(root, "src")).filter((file) => extname(file) === ".astro")) {
    const source = readFileSync(file, "utf8");
    expect(inlineStyle.test(source), relative(root, file)).toBe(false);
  }
});

test("llms discovery indexes list every work entry", () => {
  const llmsFull = readFileSync(join(root, "public", "llms-full.txt"), "utf8");
  const llms = readFileSync(join(root, "public", "llms.txt"), "utf8");
  const slugs = filesIn(join(root, "src", "content", "work"))
    .filter((file) => extname(file) === ".mdx")
    .map(
      (file) =>
        file
          .split("/")
          .pop()
          ?.replace(/\.mdx$/, "") ?? ""
    );

  for (const slug of slugs) {
    expect(llmsFull, `llms-full.txt missing ${slug}`).toContain(`/work/${slug}/`);
    expect(llms, `llms.txt missing ${slug}`).toContain(`/work/${slug}/`);
  }
});

test("security headers include the baseline protections", () => {
  const headers = readFileSync(join(root, "public", "_headers"), "utf8");

  expect(headers).toContain("Strict-Transport-Security:");
  expect(headers).toContain("Content-Security-Policy:");
  expect(headers).toContain("X-Frame-Options: DENY");
  expect(headers).toContain("X-Content-Type-Options: nosniff");
  expect(headers).toContain("Referrer-Policy: strict-origin-when-cross-origin");
  expect(headers).toContain("Permissions-Policy:");
  expect(headers).toContain("Cross-Origin-Opener-Policy: same-origin");
  expect(headers).toContain("Cross-Origin-Resource-Policy: same-origin");
});
