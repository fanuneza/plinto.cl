import { defineConfig, svgoOptimizer } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import seoGraph from "@jdevalk/astro-seo-graph/integration";

const legacyWorkPaths = new Set(["/work/campaña-building-of-the-year-awards/", "/work/registro-fotográfico-usach/"]);

export default defineConfig({
  site: "https://plinto.cl",
  output: "static",
  trailingSlash: "always",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  build: {
    inlineStylesheets: "auto",
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
    seoGraph({
      validateH1: true,
      validateUniqueMetadata: true,
      validateImageAlt: true,
      validateMetadataLength: true,
      validateInternalLinks: {
        skip: (href) =>
          href.startsWith("/api/") ||
          href.startsWith("/feed.xml") ||
          href.startsWith("/sitemap.xml") ||
          href.startsWith("/schemamap.xml") ||
          href.startsWith("/schema/"),
      },
      indexNow: {
        key: "591c2b87f0b68c44f260215f5d8e9da3",
        host: "plinto.cl",
        siteUrl: "https://plinto.cl",
      },
      markdownAlternate: true,
    }),
  ],
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
