# Astro Development Best Practices (2026)

> **AGENT INSTRUCTION:** When asked to build a new Astro website, follow this document from top to bottom. Every section contains copy-paste-ready configurations and explicit rules. Do not skip sections.

---

## 1. Project Setup

### Node Version

Astro 6.x requires Node.js ≥ 22.12.0. Pin it with `.nvmrc`:

```
22
```

> **Why:** Cloudflare Pages, GitHub Actions, and local dev all read `.nvmrc`. Pinning prevents "works on my machine" failures.

### package.json

```json
{
  "name": "your-project",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "lint": "eslint . && stylelint \"src/**/*.css\"",
    "lint:fix": "eslint . --fix && stylelint \"src/**/*.css\" --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test:lighthouse": "lhci autorun"
  },
  "engines": {
    "node": ">=22"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.9",
    "@astrojs/sitemap": "^3.7.2",
    "astro": "^6.1.9",
    "typescript": "^5.7.2"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.11.3",
    "@lhci/cli": "^0.15.1",
    "@playwright/test": "^1.59.1",
    "@typescript-eslint/eslint-plugin": "^8.59.1",
    "@typescript-eslint/parser": "^8.59.1",
    "eslint": "^10.3.0",
    "eslint-plugin-astro": "^1.7.0",
    "prettier": "^3.8.3",
    "prettier-plugin-astro": "^0.14.1",
    "stylelint": "^17.9.1",
    "stylelint-config-standard": "^40.0.0"
  }
}
```

> **AGENT INSTRUCTION:** Use `"type": "module"`. Use `"build": "astro check && astro build"` — type-checking must pass before building. The lint script runs ESLint then Stylelint. If no CSS files exist in `src/`, add `--allow-empty-input` to the Stylelint command.

---

## 2. Directory Structure

```
├── public/
│   ├── _headers              # Cloudflare security headers
│   ├── _redirects            # URL redirects
│   ├── robots.txt
│   ├── favicon.ico
│   └── fonts/                # Self-hosted font files (WOFF2)
├── src/
│   ├── components/           # Reusable .astro components
│   ├── layouts/              # Page layouts (BaseLayout, BlogPost, etc.)
│   ├── pages/                # File-based routes
│   ├── content/              # Content collections (blog posts, etc.)
│   ├── data/                 # TypeScript data files (navigation, services)
│   ├── styles/               # Global CSS files
│   ├── assets/               # Images processed by Astro (<Image />)
│   ├── env.d.ts              # Global type declarations
│   └── content.config.ts     # Content collection schemas
├── .github/
│   └── workflows/
│       ├── ci.yml            # Lint, build, Lighthouse CI
│       └── deploy.yml        # Post-deploy smoke tests
├── .lighthouserc.cjs         # Lighthouse CI configuration
├── astro.config.mjs          # Astro configuration
├── eslint.config.mjs         # ESLint flat config
├── tsconfig.json             # TypeScript strict config
├── .prettierrc               # Prettier config
├── .stylelintrc.json         # Stylelint config
└── .nvmrc                    # Node version
```

> **AGENT INSTRUCTION:** Never put images that need optimization in `public/`. Put them in `src/assets/` or inside `src/content/` so Astro can generate responsive AVIF/WebP variants. Use `public/` only for files that must be served verbatim: fonts, favicons, `robots.txt`, `_headers`, `_redirects`.

---

## 3. Images

### Where to place images

| Location            | Use case                                     | Optimization            |
| ------------------- | -------------------------------------------- | ----------------------- |
| `src/assets/`       | Photos, illustrations, hero images           | Full Astro optimization |
| `src/content/blog/` | Inline blog images                           | Full Astro optimization |
| `public/`           | Favicons, downloadable files, external logos | None — served as-is     |

### The `<Image />` component

```astro
---
import { Image } from "astro:assets";
import myImage from "../assets/hero.jpg";
---

<Image
  src={myImage}
  alt="Descriptive alt text for accessibility"
  width={1200}
  height={600}
  format="avif"
  quality={80}
  loading="eager"
  decoding="async"
/>
```

> **AGENT INSTRUCTION:** For the Largest Contentful Paint (LCP) image, always use `loading="eager"` and `decoding="async"`. For every other image, use `loading="lazy"`. Always provide meaningful `alt` text. If an image is purely decorative, use `alt=""` (empty string, not omitted).

### Responsive images

```astro
<Image
  src={myImage}
  alt="Team photo"
  width={800}
  height={600}
  densities={[1, 2]}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

> **Why `densities`:** Generates 1x and 2x variants automatically for retina displays without manual srcset math.

### Font preloading

Self-host fonts in `public/fonts/` and preload critical weights in `<head>`:

```astro
<link rel="preload" as="font" type="font/woff2" href="/fonts/montserrat-latin-900-normal.woff2" crossorigin />
```

> **AGENT INSTRUCTION:** Preload only the font weights used above the fold (typically 1–3 weights). Use `font-display: swap` in CSS to prevent invisible text during load.

---

## 4. Components

### Astro components (default choice)

```astro
---
// components/Card.astro
interface Props {
  title: string;
  description: string;
  href?: string;
}

const { title, description, href } = Astro.props;
---

<article class="card">
  <h3>{title}</h3>
  <p>{description}</p>
  {href && <a href={href}>Learn more</a>}
</article>
```

> **AGENT INSTRUCTION:** Use `.astro` components for all static UI. They compile to zero JavaScript by default. Only add a `client:*` directive when interactivity is actually needed.

### Islands architecture

| Directive        | Hydrates when       | Use case                                          |
| ---------------- | ------------------- | ------------------------------------------------- |
| `client:load`    | Immediately         | Critical interactive elements (mobile nav toggle) |
| `client:idle`    | Browser idle        | Non-critical interactivity (carousel, accordion)  |
| `client:visible` | Enters viewport     | Below-fold widgets (maps, comments)               |
| `client:media`   | Media query matches | Responsive components (desktop-only search)       |

```astro
<InteractiveMap client:visible />
```

> **AGENT INSTRUCTION:** Do NOT hydrate components that don't need JavaScript. A static FAQ section should be plain Astro HTML, not a React component.

### Props with defaults

```astro
---
interface Props {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  class?: string;
}

const { title, level = 2, class: className } = Astro.props;
const Tag = `h${level}` as const;
---

<Tag class={className}>{title}</Tag>
```

---

## 5. Layouts

### BaseLayout pattern

```astro
---
// layouts/BaseLayout.astro
import SEO from "@components/SEO.astro";
import Nav from "@components/Nav.astro";
import Footer from "@components/Footer.astro";
import "@styles/global.css";

interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  schema?: object;
}

const { title, description, image, canonical, noindex, schema } = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SEO
      title={title}
      description={description}
      image={image}
      canonical={canonical}
      noindex={noindex}
      schema={schema}
    />
    <meta name="theme-color" content="#1c2e1a" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  </head>
  <body>
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

> **AGENT INSTRUCTION:** Every page must use a layout that includes `<!doctype html>`, `<html lang="...">`, `<meta charset="UTF-8">`, and `<meta name="viewport">`. The `<main>` element must wrap the primary content. Skip links for keyboard navigation are strongly recommended.

### Slot composition

```astro
---
// layouts/BlogPost.astro
import BaseLayout from "./BaseLayout.astro";
---

<BaseLayout {...Astro.props}>
  <article>
    <header>
      <h1>{Astro.props.title}</h1>
      <time>{Astro.props.publishDate}</time>
    </header>
    <slot name="hero" />
    <div class="prose">
      <slot />
    </div>
  </article>
  <aside slot="after-main">
    <slot name="related" />
  </aside>
</BaseLayout>
```

---

## 6. Content Collections

### Schema definition

```typescript
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    publishDate: z.date(),
    author: z.string().default("Anonymous"),
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

> **AGENT INSTRUCTION:** Always define `zod` schemas. This gives you TypeScript autocomplete, runtime validation, and clear error messages when frontmatter is wrong. Use `.max(160)` for meta descriptions.

### Querying content

```astro
---
import { getCollection } from "astro:content";

const posts = await getCollection("blog", (post) => !post.data.draft);
posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
---
```

### Dynamic routes

```astro
---
// pages/blog/[slug].astro
import { getCollection, render } from "astro:content";
import BlogPost from "@layouts/BlogPost.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<BlogPost {...post.data}>
  <Content />
</BlogPost>
```

> **AGENT INSTRUCTION:** For static sites, always use `getStaticPaths()` with `output: "static"`. This generates HTML at build time — the fastest, most secure, and most SEO-friendly option.

---

## 7. SEO

### SEO component

```astro
---
// components/SEO.astro
interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  schema?: object;
}

const { title, description, image, canonical, noindex, schema } = Astro.props;
const site = "https://yourdomain.com";
const ogImage = image ? new URL(image, site).toString() : new URL("/og-default.jpg", site).toString();
---

<title>{title}</title>
<meta name="description" content={description} />
{canonical && <link rel="canonical" href={canonical} />}
{noindex && <meta name="robots" content="noindex, nofollow" />}

<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:image" content={ogImage} />
<meta property="og:url" content={canonical ?? Astro.url} />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />

<!-- Structured Data -->
{schema && <script type="application/ld+json" set:html={JSON.stringify(schema)} />}
```

> **AGENT INSTRUCTION:** Every page must have a unique `<title>` (50–60 chars) and `<meta name="description">` (150–160 chars). Use `<link rel="canonical">` to prevent duplicate content issues. Generate Open Graph images at 1200×630px.

### robots.txt

```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap-index.xml
```

### Sitemap

```typescript
// astro.config.mjs
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: "https://yourdomain.com",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/politica-de-cookies"),
    }),
  ],
});
```

---

## 8. Performance (Core Web Vitals)

### Output mode

```typescript
// astro.config.mjs
export default defineConfig({
  output: "static", // Always default to static
});
```

> **AGENT INSTRUCTION:** Use `output: "static"` unless you genuinely need server-side rendering. Static output means zero runtime JavaScript, zero cold starts, and perfect cacheability.

### Image optimization checklist

- [ ] LCP image uses `loading="eager"`
- [ ] All other images use `loading="lazy"`
- [ ] Use AVIF format when supported (`format="avif"`)
- [ ] Provide `width` and `height` to prevent layout shift
- [ ] Use `densities={[1, 2]}` for retina
- [ ] Use `sizes` for responsive images

### Font loading

```css
/* In your global CSS */
@font-face {
  font-family: "Montserrat";
  src: url("/fonts/montserrat-latin-400-normal.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

> **AGENT INSTRUCTION:** Always use `font-display: swap`. Preload only critical weights. Self-host fonts — do NOT use Google Fonts CDN links unless you have no alternative (they add DNS/TCP/TLS overhead).

### Animations with reduced motion support

```astro
<script>
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    document.querySelectorAll(".scroll-reveal").forEach((el) => el.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
  }
</script>
```

> **AGENT INSTRUCTION:** All scroll-triggered animations MUST respect `prefers-reduced-motion`. Do not use CSS-only `@keyframes` entrance animations without checking this media query first.

---

## 9. Accessibility (a11y)

### Semantic HTML (non-negotiable)

```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main id="main">
    <article>...</article>
  </main>
  <footer>...</footer>
</body>
```

> **AGENT INSTRUCTION:** Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<aside>`. Do NOT use `<div>` when a semantic element exists. Every page must have exactly one `<main>` and one `<h1>`.

### Forms

```astro
<form action="/contact" method="POST">
  <label for="name">Full name</label>
  <input type="text" id="name" name="name" required autocomplete="name" />

  <label for="email">Email address</label>
  <input type="email" id="email" name="email" required autocomplete="email" />

  <button type="submit">Send message</button>
</form>
```

> **AGENT INSTRUCTION:** Every `<input>` must have an associated `<label>` with matching `for` attribute. Use `autocomplete` attributes. Mark required fields with the `required` attribute (not just visually with a `*`).

### Focus management

```css
/* Visible focus styles */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Never remove focus outlines without replacement */
:focus {
  outline: none; /* Only if :focus-visible is styled above */
}
```

### Color contrast

> **AGENT INSTRUCTION:** All text must meet WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+). Use tools like the WebAIM contrast checker. Do not rely on color alone to convey information — add icons, labels, or patterns.

### Alt text guidelines

| Image type          | Alt text                                |
| ------------------- | --------------------------------------- |
| Informative photo   | Describe what's happening               |
| Decorative divider  | `alt=""`                                |
| Logo linking home   | `alt="Home — Company Name"`             |
| Chart/graph         | Describe the data trend                 |
| Complex infographic | Short summary + long description nearby |

---

## 10. TypeScript Configuration

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@data/*": ["src/data/*"],
      "@styles/*": ["src/styles/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

> **AGENT INSTRUCTION:** Always extend `astro/tsconfigs/strict`. Define path aliases for every `src/` subdirectory you use. This enables clean imports like `import Card from "@components/Card.astro"`.

### env.d.ts

```typescript
/// <reference path="../.astro/types.d.ts" />

// Add global declarations here
declare const gtag: (...args: unknown[]) => void;
```

---

## 11. Styling

### Global CSS structure

```css
/* src/styles/global.css */

/* 1. CSS Custom Properties (design tokens) */
:root {
  --color-primary: #1c2e1a;
  --color-secondary: #4a7c59;
  --color-text: #1a1a1a;
  --color-background: #ffffff;
  --font-sans: "Montserrat", system-ui, sans-serif;
  --font-serif: "Lora", Georgia, serif;
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --radius: 0.5rem;
}

/* 2. Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #e0e0e0;
    --color-background: #121212;
  }
}

/* 3. Reset / normalize */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.6;
}

/* 4. Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: var(--space-sm);
  background: var(--color-primary);
  color: white;
  z-index: 9999;
}
.skip-link:focus {
  top: 0;
}

/* 5. Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

> **AGENT INSTRUCTION:** Use CSS custom properties for all design tokens (colors, spacing, fonts). This makes theming trivial and ensures consistency. Write mobile-first CSS — base styles for mobile, then use `@media (min-width: ...)` for larger screens.

---

## 12. Third-Party Scripts

### Analytics (Google Analytics 4)

```astro
<!-- In BaseLayout.astro <head> -->
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script type="text/partytown">
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

> **AGENT INSTRUCTION:** Use `type="text/partytown"` for analytics scripts to run them in a web worker, off the main thread. This prevents them from blocking page rendering. Add `gtag` to `env.d.ts`.

### Cookie consent (GDPR)

Implement a cookie banner that:

1. Blocks GA until consent is given
2. Stores consent in `localStorage`
3. Respects `data-cookieconsent` attributes on scripts

> **AGENT INSTRUCTION:** Do not load analytics before user consent in EU jurisdictions. A simple banner with "Accept / Decline" is sufficient for basic compliance.

---

## 13. Security Basics

- **CSP via headers**, not `<meta>` tags. Use `public/_headers` (Cloudflare) or server config.
- **No inline event handlers** (`onclick`, `onload` on HTML elements). Use event listeners in `<script>` tags.
- **Sanitize user input** before rendering. Astro auto-escapes expressions, but `set:html` is dangerous — only use with trusted content.
- **`rel="noopener noreferrer"`** on all external links.

```astro
<a href="https://example.com" target="_blank" rel="noopener noreferrer"> External link </a>
```

---

## 14. Quick Reference Checklist

Before marking any page as complete, verify:

- [ ] `<!doctype html>` and `<html lang="...">` present
- [ ] `<meta charset="UTF-8">` and `<meta name="viewport">` present
- [ ] Unique `<title>` and `<meta name="description">` on every page
- [ ] Exactly one `<h1>` per page
- [ ] Semantic HTML structure (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] All images have `alt` text
- [ ] All forms have associated labels
- [ ] Focus styles are visible
- [ ] `prefers-reduced-motion` respected
- [ ] LCP image uses `loading="eager"`
- [ ] All other images use `loading="lazy"`
- [ ] Self-hosted fonts with `font-display: swap`
- [ ] No console errors
- [ ] `build` script runs without errors
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
