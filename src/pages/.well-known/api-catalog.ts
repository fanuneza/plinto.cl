import { createApiCatalog } from "@jdevalk/astro-seo-graph";

export const GET = createApiCatalog({
  siteUrl: "https://plinto.cl",
  schemaEndpoints: [
    {
      path: "/schema/work.json",
      schemaType: "CreativeWork",
      serviceDoc: "/work/",
    },
  ],
  schemaMap: {
    path: "/schemamap.xml",
    serviceDoc: "/work/",
  },
});
