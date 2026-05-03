# CI/CD Test Suite for GitHub Deployment

> **AGENT INSTRUCTION:** When setting up CI/CD for an Astro project, create ALL files listed in this document. Do not skip any config. The CI pipeline must lint, type-check, build, run Lighthouse CI, and run Playwright accessibility tests before any code reaches production.

---

## 1. Prerequisites

Install these packages as dev dependencies:

```bash
npm install -D \
  @astrojs/check \
  typescript \
  eslint \
  eslint-plugin-astro \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier \
  prettier-plugin-astro \
  stylelint \
  stylelint-config-standard \
  @axe-core/playwright \
  @lhci/cli \
  @playwright/test
```

> **Why these packages:**
> - `@astrojs/check` + `typescript`: Type-check Astro files at build time
> - `eslint` + `eslint-plugin-astro`: Lint `.astro`, `.ts`, `.js` files
> - `prettier` + `prettier-plugin-astro`: Consistent formatting across all file types
> - `stylelint` + `stylelint-config-standard`: Lint CSS for errors and conventions
> - `@axe-core/playwright`: Automated accessibility testing
> - `@lhci/cli`: Lighthouse CI for performance/regression testing
> - `@playwright/test`: End-to-end browser testing

---

## 2. package.json Scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "lint": "eslint . && stylelint \"src/**/*.css\"",
    "lint:fix": "eslint . --fix && stylelint \"src/**/*.css\" --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test:lighthouse": "lhci autorun"
  }
}
```

> **AGENT INSTRUCTION:** The `build` script MUST run `astro check` before `astro build`. This catches TypeScript errors in `.astro` files before they become runtime failures. If your project has no CSS files in `src/`, change the Stylelint command to `"stylelint \"src/**/*.css\" --allow-empty-input"`.

---

## 3. ESLint Configuration

Create `eslint.config.mjs`:

```javascript
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      ".cache/**",
      ".lighthouseci/**",
      "playwright.config.ts",
      "tests/**",
      "src/env.d.ts",
    ],
  },
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
```

> **AGENT INSTRUCTION:** This is a flat config (ESLint 9+). Do NOT create `.eslintrc` files. The `ignores` section is critical — never lint `dist/`, `node_modules/`, or generated files. The `no-console` rule allows `console.warn` and `console.error` but warns on `console.log` (which should be removed before committing).

---

## 4. Prettier Configuration

Create `.prettierrc`:

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

> **AGENT INSTRUCTION:** `prettier-plugin-astro` is required to format `.astro` files correctly. The `parser: "astro"` override ensures Prettier understands Astro's frontmatter + HTML syntax. `endOfLine: "lf"` prevents Windows CI failures.

---

## 5. Stylelint Configuration

Create `.stylelintrc.json`:

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "comment-empty-line-before": null,
    "declaration-empty-line-before": null,
    "rule-empty-line-before": null,
    "at-rule-empty-line-before": null,
    "custom-property-empty-line-before": null,
    "font-family-name-quotes": null,
    "value-keyword-case": [
      "lower",
      {
        "camelCaseSvgKeywords": true,
        "ignoreKeywords": ["currentColor", "BlinkMacSystemFont", "Arial"]
      }
    ],
    "no-descending-specificity": null,
    "color-function-notation": null,
    "color-function-alias-notation": null,
    "alpha-value-notation": null,
    "media-feature-range-notation": null,
    "property-no-vendor-prefix": null,
    "declaration-block-single-line-max-declarations": null,
    "keyframes-name-pattern": null
  }
}
```

> **AGENT INSTRUCTION:** This config extends the standard but relaxes rules that cause false positives in real-world CSS (BEM class names, vendor prefixes, camelCase SVG keywords). `no-descending-specificity` is disabled because it's often noisy with component-based CSS.

---

## 6. Node Version Pinning

Create `.nvmrc`:

```
22
```

> **AGENT INSTRUCTION:** Astro 6.x requires Node ≥ 22.12.0. The `.nvmrc` file ensures GitHub Actions, Cloudflare Pages, and local developers all use the same version. Use `22` (not `22.14.1`) to get the latest patch automatically.

---

## 7. Main CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Build
        run: npm run build
        env:
          GITHUB_TOKEN: ${{ github.token }}

      - name: Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          GITHUB_TOKEN: ${{ github.token }}
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  test:
    runs-on: ubuntu-latest
    needs: lint-and-build
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build
        run: npm run build
        env:
          GITHUB_TOKEN: ${{ github.token }}

      - name: Run Playwright tests
        run: npx playwright test
        env:
          GITHUB_TOKEN: ${{ github.token }}
```

> **AGENT INSTRUCTION:** This workflow has two jobs:
> 1. `lint-and-build`: Runs on every push/PR. Validates code quality, builds the site, and runs Lighthouse CI against the static build.
> 2. `test`: Depends on `lint-and-build` passing. Installs Playwright, rebuilds, and runs browser-based tests.
>
> `permissions: contents: read` follows the principle of least privilege. `GITHUB_TOKEN` is passed to build steps that may fetch data. `LHCI_GITHUB_APP_TOKEN` is optional — it enables Lighthouse CI's GitHub App integration for PR comments.

---

## 8. Lighthouse CI Configuration

Create `.lighthouserc.cjs`:

```javascript
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: [
        "/",
        "/about/",
        "/contact/",
        "/404",
      ],
      numberOfRuns: 1,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Category scores — warn only so pre-existing issues don't block CI
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // Core Web Vitals thresholds
        "largest-contentful-paint": ["warn", { maxNumericValue: 3500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 200 }],

        // A11y rules that often fail on pre-existing design — monitor but don't block
        "color-contrast": "warn",
        "label-content-name-mismatch": "warn",
        "heading-order": "warn",
        "aria-hidden-focus": "warn",
        "target-size": "warn",

        // Image optimizations — monitor but don't block CI
        "lcp-lazy-loaded": "warn",
        "uses-responsive-images": "warn",
        "modern-image-formats": "warn",
        "render-blocking-resources": "warn",

        // Insights are informational only
        "network-dependency-tree-insight": "off",
        "image-delivery-insight": "off",
        "dom-size-insight": "off",
        "lcp-discovery-insight": "off",
        "render-blocking-insight": "off",
        "cls-culprits-insight": "off",

        // Console errors — warn only (third-party scripts may log warnings)
        "errors-in-console": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
```

> **AGENT INSTRUCTION:** Update the `url` array to match YOUR site's actual routes. Always include `/` (homepage) and `/404` (error page). Use `"warn"` for assertions that reflect pre-existing design/content issues — this surfaces them in CI logs without failing the build. Use `"off"` for purely informational insights. Use `"error"` only for issues that must never reach production.

---

## 9. Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4325);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
```

> **AGENT INSTRUCTION:** `webServer` automatically starts `astro preview` before tests run. `reuseExistingServer: !process.env.CI` lets you run tests locally against an already-running dev server. In CI, it always starts a fresh preview server. Chromium-only is fastest — add mobile profiles only if you need them.

---

## 10. Accessibility Tests

Create `tests/visual/a11y.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "home", path: "/" },
  { name: "about", path: "/about/" },
  { name: "contact", path: "/contact/" },
  { name: "404", path: "/404" },
];

// Rules disabled due to pre-existing design/content choices.
// These are MONITORED — if new violations appear, the test will fail.
const DISABLED_RULES = [
  "color-contrast",              // Design system uses brand colors that don't always meet 4.5:1
  "label-content-name-mismatch", // Icon-only buttons with aria-label
  "heading-order",               // Design uses visual hierarchy different from DOM order
];

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
```

> **AGENT INSTRUCTION:** Update the `pages` array to match your site's routes. Always test `/404`. Document WHY each disabled rule is disabled — this prevents future developers from blindly copying without understanding the trade-off. The test scans for WCAG 2.0 A, WCAG 2.0 AA, and WCAG 2.1 AA compliance. Any NEW violation (not in `DISABLED_RULES`) will fail the test.

---

## 11. Deploy Smoke Tests

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Smoke Tests

on:
  deployment_status:

jobs:
  smoke-test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run Playwright tests against deployed URL
        run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: ${{ github.event.deployment_status.environment_url }}
```

> **AGENT INSTRUCTION:** This workflow triggers after Cloudflare Pages (or any platform) reports a successful deployment. It runs the SAME Playwright test suite against the LIVE URL. This catches issues that only appear in production: CSP header blocks, wrong environment variables, CDN misconfiguration, etc. The `PLAYWRIGHT_BASE_URL` override skips the local `webServer` and hits the deployed site directly.

---

## 12. GitHub Repository Settings

Configure these in your GitHub repository settings:

### Branch protection for `main`

- [ ] **Require a pull request before merging**
- [ ] **Require status checks to pass before merging**
  - Select: `lint-and-build` and `test`
- [ ] **Require branches to be up to date before merging**
- [ ] **Restrict pushes that create files larger than 100MB**

### Secrets (Settings → Secrets and variables → Actions)

| Secret | Value | Required |
|--------|-------|----------|
| `LHCI_GITHUB_APP_TOKEN` | From [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) | Optional — enables PR comments with Lighthouse scores |

---

## 13. Running Tests Locally

```bash
# Lint everything
npm run lint

# Check formatting
npm run format:check

# Fix formatting
npm run format

# Type-check and build
npm run build

# Run Lighthouse CI locally
npm run test:lighthouse

# Run Playwright tests (starts preview server automatically)
npx playwright test

# Run a single test
npx playwright test --grep "a11y home"

# Open Playwright report
npx playwright show-report
```

> **AGENT INSTRUCTION:** Always run `npm run lint` and `npm run build` before committing. Run `npm run format` if `format:check` fails. The CI will reject any PR that doesn't pass these checks.

---

## 14. Troubleshooting

### "Lighthouse CI failed on color-contrast"

This means your design has text/background combinations below WCAG AA. Either:
1. Fix the colors in CSS, OR
2. Add `"color-contrast": "warn"` to `.lighthouserc.cjs` if the design is intentionally using brand colors

### "Playwright tests time out"

Increase `timeout` in `playwright.config.ts` or check that `npm run preview` works locally.

### "ESLint can't parse .astro files"

Ensure `eslint-plugin-astro` is installed and the flat config spreads `...eslintPluginAstro.configs.recommended`.

### "Stylelint fails with 'No files matching the pattern'"

Add `--allow-empty-input` to the Stylelint command if you have no CSS files in `src/`.

### "Cloudflare build fails with Node version error"

Ensure `.nvmrc` exists and contains a version Astro supports (22 for Astro 6.x).

---

## 15. Quick Setup Checklist

For a new project, create these files in order:

- [ ] `.nvmrc` → Node version
- [ ] `package.json` → scripts and dependencies
- [ ] `tsconfig.json` → TypeScript strict + path aliases
- [ ] `astro.config.mjs` → static output, sitemap
- [ ] `eslint.config.mjs` → flat config with Astro support
- [ ] `.prettierrc` → with `prettier-plugin-astro`
- [ ] `.stylelintrc.json` → standard config with relaxed rules
- [ ] `playwright.config.ts` → local preview server + Chromium
- [ ] `tests/visual/a11y.spec.ts` → axe-core accessibility scan
- [ ] `.lighthouserc.cjs` → Lighthouse CI assertions
- [ ] `.github/workflows/ci.yml` → lint, build, Lighthouse, Playwright
- [ ] `.github/workflows/deploy.yml` → post-deploy smoke tests
