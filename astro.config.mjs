import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

const legacyWorkPaths = new Set([
  "/work/campaña-building-of-the-year-awards/",
  "/work/registro-fotográfico-usach/",
]);

export default defineConfig({
  site: "https://plinto.cl",
  output: "static",
  build: {
    inlineStylesheets: "always",
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !legacyWorkPaths.has(decodeURI(pathname));
      },
    }),
  ],
});
