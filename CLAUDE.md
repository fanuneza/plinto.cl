# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server (Astro)
npm run build      # type-check + production build → dist/
npm run preview    # serve dist/ locally
```

No test runner is configured. Playwright is available as a dev dependency for local visual captures only — it is not wired into a test script.

## Architecture

Static site built with **Astro 6** + **TypeScript**, deployed as a fully static output (`output: "static"`). No server-side rendering.

### Content layer

Portfolio entries live in `src/content/work/*.mdx` and are loaded via Astro's Content Collections API. The schema is defined in `src/content.config.ts` — all frontmatter fields are validated with Zod at build time. The slug for each entry is derived from the filename (minus `.mdx`).

The detail page `src/pages/work/[slug].astro` also registers `legacySlugs` as valid paths but serves them with `noindex` and a canonical pointing to the current slug.

### Responsive images

`src/utils/responsive-images.ts` provides two helpers:

- `getResponsiveImageSources(src, originalWidth)` — generates `avif` and `webp` srcsets at 480/800/1200w for modern format `<source>` elements.
- `getRasterImageSrcSet(src, originalWidth)` — generates a raster srcset at 480/640/800/960/1200w for the fallback `<img>`.

These rely on **pre-generated image variants** already present in `public/assets/images/projects/` (e.g. `casa-kddk-cover-480.jpg`, `casa-kddk-cover-480.avif`). When adding a new project with images, you must generate those variants manually before referencing them in MDX.

### Shared data

`src/data/site.ts` exports `site` (global metadata), `navItems` (nav links), and `asset()` (helper that resolves `/assets/images/` paths). All pages import from here to keep contact info and nav consistent.

### Layout

`src/layouts/BaseLayout.astro` wraps every page. It handles the full `<head>` (SEO meta, OG tags, structured data, fonts), the site header with mobile menu, and the footer. Structured data from individual pages is merged with the global Organization and WebSite schemas.

### Client-side scripts

`public/scripts/site.js` — handles the mobile nav toggle and scroll-based reveal animations (`data-reveal`).  
`public/scripts/lightbox.js` — handles the image gallery lightbox on work detail pages.

Both are loaded with `is:inline defer` from the layout/detail page respectively, so they are not processed by Astro's bundler.

## Adding a project

1. Create `src/content/work/<slug>.mdx` with all required frontmatter fields.
2. Generate raster variants at 480/640/800/960px and the original width, plus avif/webp variants at 480/800/1200px for every image listed in `coverImage` and `gallery`.
3. Place all image files under `public/assets/images/projects/`.
4. Set `order` to control listing sort order (lower = earlier).

## Sitemap exclusions

`astro.config.mjs` filters out legacy Spanish-character slugs (`legacyWorkPaths`) from the sitemap so they don't compete with canonical URLs.

## Code Exploration Policy

Always use jCodemunch-MCP tools for code navigation. Never fall back to Read, Grep, Glob, or Bash for code exploration.
**Exception:** Use `Read` when you need to edit a file — the agent harness requires a `Read` before `Edit`/`Write` will succeed. Use jCodemunch tools to _find and understand_ code, then `Read` only the specific file you're about to modify.

**Start any session:**

1. `resolve_repo { "path": "." }` — confirm the project is indexed. If not: `index_folder { "path": "." }`
2. `suggest_queries` — when the repo is unfamiliar

**Finding code:**

- symbol by name → `search_symbols` (add `kind=`, `language=`, `file_pattern=`, `decorator=` to narrow)
- decorator-aware queries → `search_symbols(decorator="X")` to find symbols with a specific decorator (e.g. `@property`, `@route`); combine with set-difference to find symbols _lacking_ a decorator (e.g. "which endpoints lack CSRF protection?")
- string, comment, config value → `search_text` (supports regex, `context_lines`)
- database columns (dbt/SQLMesh) → `search_columns`

**Reading code:**

- before opening any file → `get_file_outline` first
- one or more symbols → `get_symbol_source` (single ID → flat object; array → batch)
- symbol + its imports → `get_context_bundle`
- specific line range only → `get_file_content` (last resort)

**Repo structure:**

- `get_repo_outline` → dirs, languages, symbol counts
- `get_file_tree` → file layout, filter with `path_prefix`

**Relationships & impact:**

- what imports this file → `find_importers`
- where is this name used → `find_references`
- is this identifier used anywhere → `check_references`
- file dependency graph → `get_dependency_graph`
- what breaks if I change X → `get_blast_radius`
- what symbols actually changed since last commit → `get_changed_symbols`
- find unreachable/dead code → `find_dead_code`
- class hierarchy → `get_class_hierarchy`

## Session-Aware Routing

**Opening move for any task:**

1. `plan_turn { "repo": "...", "query": "your task description", "model": "<your-model-id>" }` — get confidence + recommended files; the `model` parameter narrows the exposed tool list to match your capabilities at zero extra requests.
2. Obey the confidence level:
   - `high` → go directly to recommended symbols, max 2 supplementary reads
   - `medium` → explore recommended files, max 5 supplementary reads
   - `low` → the feature likely doesn't exist. Report the gap to the user. Do NOT search further hoping to find it.

**Interpreting search results:**

- If `search_symbols` returns `negative_evidence` with `verdict: "no_implementation_found"`:
  - Do NOT re-search with different terms hoping to find it
  - Do NOT assume a related file (e.g. auth middleware) implements the missing feature (e.g. CSRF)
  - DO report: "No existing implementation found for X. This would need to be created."
  - DO check `related_existing` files — they show what's nearby, not what exists
- If `verdict: "low_confidence_matches"`: examine the matches critically before assuming they implement the feature

**After editing files:**

- If PostToolUse hooks are installed (Claude Code only), edited files are auto-reindexed
- Otherwise, call `register_edit` with edited file paths to invalidate caches and keep the index fresh
- For bulk edits (5+ files), always use `register_edit` with all paths to batch-invalidate

**Token efficiency:**

- If `_meta` contains `budget_warning`: stop exploring and work with what you have
- If `auto_compacted: true` appears: results were automatically compressed due to turn budget
- Use `get_session_context` to check what you've already read — avoid re-reading the same files

## Model-Driven Tool Tiering

Your jcodemunch-mcp server narrows the exposed tool list based on the model you are running as. To avoid wasting requests on primitives when a composite would do, always include `model="<your-model-id>"` in your opening `plan_turn` call.

Replace `<your-model-id>` with your active model:

- Claude Opus variants → `claude-opus-4-7` (or any `claude-opus-*`)
- Claude Sonnet variants → `claude-sonnet-4-6`
- Claude Haiku variants → `claude-haiku-4-5`
- GPT-4o / GPT-5 / o1 / Llama → use the model id as printed by your runner

The `model=` parameter rides on the existing `plan_turn` call — it does **not** add a separate tool invocation. If `plan_turn` is not appropriate for a non-code task, call `announce_model(model="...")` once instead.
