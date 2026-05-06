import { defineConfig, svgoOptimizer } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

const legacyWorkPaths = new Set(["/work/campaña-building-of-the-year-awards/", "/work/registro-fotográfico-usach/"]);

export default defineConfig({
  site: "https://plinto.cl",
  output: "static",
  trailingSlash: "always",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !legacyWorkPaths.has(decodeURI(pathname));
      },
    }),
    robotsTxt(),
  ],
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
