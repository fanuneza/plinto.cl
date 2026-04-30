# Plinto.cl

Static Astro site for Plinto, a strategy, content, and communication studio for architecture and construction brands.

## Commands

- `npm install`: install dependencies.
- `npm run dev`: start the local development server.
- `npm run build`: run Astro type checks and build the static site.
- `npm run preview`: preview the production build locally.

## Project Structure

- `src/pages/`: Astro routes.
- `src/layouts/`: shared page layouts.
- `src/components/`: reusable UI components.
- `src/content/work/*.mdx`: portfolio entries and frontmatter.
- `src/data/site.ts`: global site metadata and navigation.
- `src/styles/global.css`: design tokens and global component styles.
- `public/assets/`: static image and media assets.

Existing migrated images are stored in `public/assets/framer/` for compatibility with current content. Prefer neutral `public/assets/` subfolders for new assets.

`docs/site-capture/` is historical reference material from the previous source site, not current implementation documentation.
