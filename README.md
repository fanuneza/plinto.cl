# Plinto.cl

Static Astro site for Plinto, a strategy, content, and communication studio focused on architecture and construction brands.

## Stack

- `Astro 6`
- `TypeScript`
- `@astrojs/mdx` for work entries
- `@astrojs/sitemap` for sitemap generation

## Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Astro development server.
- `npm run build`: run `astro check` and build the static site into `dist/`.
- `npm run preview`: preview the production build locally.

## Project Structure

- `src/pages/`: route entrypoints for home, about, service, contact, 404, and work pages.
- `src/pages/work/[slug].astro`: generated work detail pages, including legacy slug support from content frontmatter.
- `src/layouts/`: shared page layout.
- `src/components/`: reusable UI such as the work grid, section title, and service list/icon components.
- `src/content/work/*.mdx`: portfolio entries and frontmatter-driven metadata.
- `src/content.config.ts`: content collection schema for work entries.
- `src/data/site.ts`: global site metadata, navigation, and asset helper.
- `src/styles/global.css`: global styles, design tokens, and page-level rules.
- `public/assets/icons/`: static SVG icons used across the site.
- `public/assets/images/`: site image library organized by `brand/`, `decorative/`, `people/`, and `projects/`.

## Content Model

Each work entry in `src/content/work/` is an MDX file with frontmatter used to generate list and detail pages. Current fields include:

- `title`
- `client`
- `service`
- `year`
- `coverImage`
- `gallery`
- `summary`
- `seoTitle`
- `seoDescription`
- `featured`
- `order`
- `liveUrl`
- `legacySlugs`
- `brief`
- `solution`
- `deliverables`

## Asset Conventions

- Project images live under `public/assets/images/projects/`.
- Team portraits live under `public/assets/images/people/`.
- Brand assets such as the Plinto logo live under `public/assets/images/brand/`.
- Decorative stones and similar non-content images live under `public/assets/images/decorative/`.
- New assets should use descriptive, SEO-friendly filenames instead of hashed imports.

## Notes

- `docs/site-capture/` contains historical reference material from the previous site and should be treated as reference-only.
- `dist/`, local logs, caches, and other generated artifacts are not part of the committed source of truth.
