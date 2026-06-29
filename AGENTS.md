# Agent Guidance — plinto.cl

Welcome to the `plinto.cl` codebase. This is a static Astro 7 site for Plinto, a brand strategy and content marketing studio focused on the architecture and construction sector in Chile. It is deployed to Cloudflare Pages and optimized for performance, clean SEO, and AI discoverability.

Read this file fully before touching any code.

---

## 1. Opening Moves & MCP Workflow

**Always start a session with both MCPs:**

- **jCodeMunch MCP**: Use it to index, navigate, and understand the codebase before making changes.
  - Run `resolve_repo { "path": "." }` first to check if the repo is already indexed.
  - If not indexed, run `index_folder { "path": "." }` before anything else.
  - After editing a file, call `register_edit` or `index_file` on the modified file to keep the symbol index current.
  - Prefer `search_symbols`, `get_file_tree`, `find_references`, and `get_symbol_source` over raw `grep` searches. Use `get_context_bundle` or `assemble_task_context` to gather relevant context before making multi-file changes.

- **Astro Docs MCP**: Query `astro-docs` for anything related to Astro APIs, content collections, image optimization, View Transitions, static prerendering, and current best practices before writing Astro-specific code.

---

## 2. Technical Stack

- **Framework**: Astro 7, `output: "static"` — every page is pre-rendered at build time.
- **Runtime**: Node.js ≥ 22.12.0, npm with committed `package-lock.json`.
- **Deployment**: Cloudflare Pages via GitHub integration. Build command: `npm run build`. Output directory: `dist/`.
- **No Astro Adapter**: Do **NOT** install or configure any adapter (e.g. `@astrojs/cloudflare`). Static output with an adapter changes the output structure to `dist/client/`, breaking Cloudflare Pages root integration and causing 404 errors.
- **Styling**: Vanilla CSS, split across `src/styles/`. No CSS framework, no Tailwind. Do not introduce utility CSS libraries.
- **TypeScript**: Strict mode. `src/` uses the `@/*` import alias defined in `tsconfig.json`. Always use this alias for imports within `src/`.
- **MDX**: Work portfolio entries are authored in MDX at `src/content/work/*.mdx` and consumed via Astro's Content Collections API.
- **Image optimization**: Astro's built-in `<Image>` component from `astro:assets` for all processed images. Raw `<img>` tags are only used for static decorative assets where Astro processing adds no value.

---

## 3. Project Structure

```
src/
  assets/images/          # Processed by Astro at build (WebP variants, responsive sizes)
    brand/                # Logo, OG images
    decorative/           # Hero stone images, stacked stone
    people/               # Team portrait photos
    projects/             # Work portfolio cover and gallery images
  components/
    ServiceIcon.astro     # Renders an SVG icon by name from public/assets/icons/
    ServiceList.astro     # Service card list; accepts headingLevel="h2"|"h3"
    SectionTitle.astro    # Full-width h1 banner for inner pages
    WorkGrid.astro        # Responsive portfolio grid; handles eager/lazy loading
  content/
    work/*.mdx            # Portfolio entries (see content model below)
  content.config.ts       # Zod schema for the "work" collection
  data/
    site.ts               # Shared site metadata: URL, nav items, asset() helper
  layouts/
    BaseLayout.astro      # Root layout: <head>, SEO, header, footer, View Transitions
  pages/
    index.astro           # Homepage: hero, brand intro, somos, portfolio preview, services, audience
    about.astro           # Team bios, context, collaborators
    contact.astro         # Contact links
    service.astro         # Service offerings by client type (uses bodyClass="service-page")
    404.astro             # Not found page
    work/
      index.astro         # Full portfolio listing with grid/list view toggle
      [slug].astro        # Dynamic work detail page; handles legacy slugs + noindex
      [...slug].md.ts     # Markdown alternate endpoint for crawlers and AI agents
    rss.xml.ts            # RSS feed for the work collection
    schemamap.xml.ts      # Semantic discovery map
    schema/
      work.json.ts        # Consolidated JSON-LD corpus for the work collection
    591c2b87f0b68c44f260215f5d8e9da3.txt.ts  # IndexNow key endpoint
    .well-known/          # RFC 9727 linkset catalog (api-catalog)
  styles/
    global.css            # Entry point — imports all partials
    base.css              # @font-face declarations, CSS tokens (:root), element resets
    layout.css            # Header, footer, skip link
    components.css        # Hero, cards, work grid, service list, audience grid, lightbox
    pages.css             # Work detail, about, contact, gallery
    responsive.css        # Mobile-first breakpoint overrides (≤809px and ≤1199px)
    utilities.css         # One-off utility classes
  utils/
    schema.ts             # Typed Schema.org graph builder (buildSchemaGraph)
public/
  _headers                # Cloudflare Pages HTTP headers (cache, CSP, security)
  robots.txt              # Generated by astro-robots-txt integration
  site.webmanifest        # PWA manifest
  assets/
    favicon.ico
    fonts/                # Self-hosted Satoshi and Inter font files (woff2)
    icons/                # SVG icon files (check.svg, dna.svg, mobile.svg, …)
    images/brand/         # Static brand images (og-image.webp, plinto-og-image.webp)
  scripts/
    site.js               # Menu toggle, focus trap, keyboard handling, view toggle
    lightbox.js           # Lightbox dialog logic for work detail galleries
```

---

## 4. CSS Architecture

All styles live in `src/styles/` and are imported through `global.css`. **Never write inline styles or add `<style>` blocks to component files** — all CSS belongs in the shared partials.

### Design tokens (`base.css`)

```css
:root {
  --bg: #fffbf7; /* warm off-white page background */
  --text: #0d0d0d; /* near-black body text */
  --muted: #687076; /* secondary text, labels, captions */
  --line: #e5e2de; /* borders, dividers */
  --panel: #f7f3ef; /* card/panel backgrounds */
  --label: #1f3545; /* metadata labels in work detail */
  --font-body: Satoshi, ui-sans-serif, system-ui, …;
  --font-ui: Satoshi, ui-sans-serif, system-ui, …;
}
```

### Breakpoints

- `≤1199px`: tablet adjustments (padding, nav gaps, hero size)
- `≤809px`: mobile layout (hamburger menu, stacked grids, full-width sections)

### Key component classes

- `.work-grid` — 2-col portfolio grid; collapses to 1-col on mobile.
- `.work-card` — link wrapper for a portfolio item.
- `.service-list` / `.service-item` — 2-col service card grid (1-col on mobile).
- `.page-section` — standard section padding with clamped values.
- `.section-title` — full-width `<h1>` banner (used by `SectionTitle.astro`).
- `.work-detail` — article layout for work case study pages.
- `.gallery` / `.gallery-item` / `.gallery-item--featured` — image gallery in work detail.
- `.lightbox` — native `<dialog>` fullscreen image viewer.
- `.site-header` / `.site-footer` — sticky header, dark-background footer.

### Heading hierarchy rule

The `ServiceList.astro` component accepts a `headingLevel` prop (`"h2"` default, `"h3"` on the homepage). This matters because the homepage's services section is already under an `<h2>` heading — always pass `headingLevel="h3"` there. The service page (`bodyClass="service-page"`) uses the default `"h2"` since those items sit directly under the page `<h1>`.

---

## 5. Content Model — Work Collection

Each portfolio entry is an MDX file in `src/content/work/` with the following frontmatter schema (defined in `src/content.config.ts`):

| Field            | Type                       | Required | Notes                                                 |
| ---------------- | -------------------------- | -------- | ----------------------------------------------------- |
| `title`          | string                     | ✅       | Display title                                         |
| `client`         | string                     | ✅       | Client name                                           |
| `service`        | string                     | ✅       | Service label shown in grid                           |
| `year`           | number                     | ✅       | Year of execution                                     |
| `coverImage`     | `image()`                  | ✅       | Astro image reference → `src/assets/images/projects/` |
| `coverAlt`       | string                     | ✅       | Alt text for cover                                    |
| `gallery`        | `{ src, alt, caption? }[]` | ✅       | Array of gallery images                               |
| `summary`        | string                     | ✅       | Short summary for RSS and lists                       |
| `seoTitle`       | string                     | ✅       | `<title>` tag on detail page                          |
| `seoDescription` | string                     | ✅       | Meta description on detail page                       |
| `featured`       | boolean (default: false)   | —        | Reserved for future featured filter                   |
| `order`          | number                     | ✅       | Sort order across all grids (ascending)               |
| `liveUrl`        | url (optional)             | —        | External project URL                                  |
| `legacySlugs`    | string[] (default: [])     | —        | Old slugs that redirect to canonical                  |
| `brief`          | string (optional)          | —        | Client brief text for detail page                     |
| `solution`       | string (optional)          | —        | Approach/solution text for detail page                |
| `deliverables`   | string[] (default: [])     | —        | List of deliverables                                  |

**Adding a new project:**

1. Create `src/content/work/<slug>.mdx` with all required fields.
2. Place the cover image in `src/assets/images/projects/` and reference it with a relative path from the MDX file (e.g. `../../assets/images/projects/my-project-cover.jpg`).
3. Assign a unique `order` value to control grid position.
4. Run `npm run build` — Astro will type-check the frontmatter against the schema.

---

## 6. SEO & Structured Data

Base metadata and JSON-LD are emitted by `src/layouts/BaseLayout.astro` on every page via the `@jdevalk/astro-seo-graph` integration and `src/utils/schema.ts`.

### How it works

`buildSchemaGraph()` in `src/utils/schema.ts` always emits:

- `WebSite` node (with `SearchAction`)
- `Organization` node for Plinto
- `Person` node for Fernanda Castro (default author)
- `WebPage` node for the current URL

Pages pass a `schema` prop to `<BaseLayout>` to merge additional nodes (e.g. `CreativeWork` + `BreadcrumbList` on work detail pages). Never emit JSON-LD only from a page without going through the layout's base graph — the layout must always produce a baseline.

### SEO artifact surfaces — keep these aligned

- `src/utils/schema.ts` — Typed graph builder
- `src/pages/schema/work.json.ts` — JSON-LD corpus for work collection
- `src/pages/schemamap.xml.ts` — Semantic discovery map
- `src/pages/.well-known/` — RFC 9727 API catalog
- `src/pages/work/[...slug].md.ts` — Markdown alternates for work entries
- `src/pages/rss.xml.ts` — RSS feed
- `src/pages/591c2b87f0b68c44f260215f5d8e9da3.txt.ts` — IndexNow key
- `public/_headers` — `No-Vary-Search` must retain UTM params + campaign params

### Image SEO rules

- Always specify `width` and `height` on `<Image>` components.
- LCP images (first hero, first above-fold work card) must have `loading="eager"` and `fetchpriority="high"`.
- All other images use `loading="lazy"` and `fetchpriority="low"`.
- Decorative images use `alt=""` and `aria-hidden="true"`.

---

## 7. Performance Constraints

The site targets a 100/100 PSI score on all categories. Every change must preserve:

- **LCP**: Hero images (`stone-hero-left`, `stone-hero-right`) on the homepage use `loading="eager"` + `fetchpriority="high"`. Do not regress these.
- **Render-blocking scripts**: `site.js` and `lightbox.js` must never be synchronous. `site.js` uses `type="module"` (deferred by spec). `lightbox.js` uses `is:inline defer` on the work detail page.
- **CSS delivery**: `inlineStylesheets: "auto"` in `astro.config.mjs` lets Astro decide whether to inline or link CSS based on size. Do not change this to `"always"` — it causes unused-CSS penalties.
- **Font preloads**: Only `Satoshi-Regular.woff2` uses `fetchpriority="high"`. Other fonts are not preloaded to avoid competing with LCP.
- **No Adapter**: See §2. Never install `@astrojs/cloudflare` or any SSR adapter.

---

## 8. JavaScript — `public/scripts/`

`site.js` and `lightbox.js` are plain ES modules served statically. They are **not** processed by Astro's bundler (loaded via `src` attribute, not as Astro `<script>` tags without `src`). Keep them framework-agnostic vanilla JS.

- `site.js`: mobile menu toggle, aria-expanded management, keyboard focus trap, desktop media query handler, and work-page grid/list view toggle.
- `lightbox.js`: native `<dialog>` lightbox for work detail gallery. Initialized once per page-load via `astro:page-load` event. Guard against double-initialization with `data-lightbox-ready`.

Both files listen for `astro:page-load` to re-initialize after View Transitions navigations.

---

## 9. Security & HTTP Headers

`public/_headers` controls all Cloudflare Pages response headers. Do not remove or weaken:

- **HSTS** (`Strict-Transport-Security`)
- **CSP** (`Content-Security-Policy`): `script-src 'self'`; `script-src-elem 'self' 'unsafe-inline'` (required for Astro View Transitions inline scripts); `img-src 'self' data:`
- **`X-Frame-Options: DENY`**
- **`No-Vary-Search`**: must retain `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid` to avoid cache fragmentation from tracking parameters.

Cache rules:

- `/_astro/*` — `max-age=31536000, immutable` (content-hashed by Astro)
- `/assets/fonts/*` — 30-day cache, `stale-while-revalidate`
- HTML pages — `max-age=0, must-revalidate` (always fresh from CDN)

---

## 10. View Transitions

The site uses Astro's `<ClientRouter>` for client-side navigation with animated transitions. Work card images use `transition:name` to animate between the grid and detail view. If you add new pages or shared animated elements, use `transition:name` with a unique, stable identifier.

---

## 11. Verification Checklist

Before finishing any change, run:

```bash
npm run format         # Prettier — formats .astro, .ts, .css, .json
npm run lint           # ESLint + Stylelint
npm run build          # astro check (TypeScript) + astro build
npm run test           # Playwright accessibility + visual tests
npm run test:lighthouse  # Lighthouse CI against dist/ (warns, does not gate)
```

`npm run build` runs `astro check` first — TypeScript errors will block the build. Fix them before proceeding.

If you skip a check, document why.

---

## 12. Absolute Path Policy

**Never use absolute local filesystem paths** (e.g. `/home/user/...`) inside any project file, comment, or configuration. Always use repository-relative paths (e.g. `src/content/work/`) to ensure portability across environments and contributors.

---

## 13. Language & Copywriting

- The site language is `es-CL`. All user-facing copy must be in Chilean Spanish.
- `<html lang="es-CL">` and `og:locale="es_CL"` are set in `BaseLayout.astro`. Do not change these.
- Heading elements must not end in a period.
- Follow Spanish sentence case for headings (capitalize first word and proper nouns only).
- All files must be UTF-8. Do not introduce encoding issues with accented characters.
