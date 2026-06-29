import { createSchemaMap, gitLastmod } from "@jdevalk/astro-seo-graph";

export const GET = createSchemaMap({
  siteUrl: "https://plinto.cl",
  entries: [
    {
      path: "/schema/work.json",
      lastModified: gitLastmod("src/pages/schema/work.json.ts") || new Date(),
    },
  ],
});
