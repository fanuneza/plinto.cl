# Repository Guidelines

## Project Structure & Module Organization

This is a static Astro site for Plinto.cl. Source code lives in `src/`, with layouts in `src/layouts/`, reusable UI in `src/components/`, shared data in `src/data/`, global styles in `src/styles/`, and routes in `src/pages/`.

Portfolio entries are content collection files in `src/content/work/*.mdx`; their schema is defined in `src/content.config.ts`. Static files are served from `public/`. Existing migrated media currently lives in `public/assets/framer/`; treat that directory as legacy source-imported media and prefer neutral `public/assets/` subfolders for new assets.

Generated output and local tooling artifacts should stay uncommitted. The repository ignores dependency folders, Astro/build output, Playwright results, caches, logs, coverage, and local environment files.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Astro development server.
- `npm run build`: run `astro check` and build the static site.
- `npm run preview`: preview the production build locally.
  Playwright visual capture files may exist locally for parity checks, but they are ignored and are not part of the shared repository contract.

## Coding Style & Naming Conventions

Follow the existing Astro and TypeScript style: 2-space indentation, `camelCase` for variables and helpers, `PascalCase` for Astro components, and lowercase kebab-case for route, asset, and directory names.

Keep modules small and purpose-specific. Use the established component/layout/data structure before adding new abstractions. Keep design tokens and site-wide component rules in `src/styles/global.css`; avoid adding late override blocks when a value can be consolidated into the canonical selector.

## Content & Asset Guidelines

Work pages are driven by MDX frontmatter. Keep project metadata, gallery images, summaries, SEO text, and legacy slugs in frontmatter so lists and detail pages remain generated from one source.

Use meaningful `alt` text for project, portrait, and editorial images. Decorative stones and purely ornamental marks may keep empty alt text. Add intrinsic width and height when the rendered dimensions are known.

Do not commit secrets. Use `.env.example` for documented variable names and keep real `.env` files local.

## Testing Guidelines

Run `npm run build` for code, content, and route changes. For visible layout changes, inspect the affected pages locally before opening a pull request.

There is no unit test runner configured yet. Add focused tests with any new non-trivial behavior once a framework is introduced.

## Commit & Pull Request Guidelines

Use short, imperative commit messages such as `Extract layout script` or `Update work image alt text`.

Pull requests should include a concise description, the reason for the change, verification steps, and screenshots for visible UI changes. Link related issues when available, and call out configuration or environment changes.

## Historical Reference Material

`docs/site-capture/` contains source capture material from the previous Framer site. Keep it labeled and treated as reference-only; it should not be used as current implementation documentation.

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
