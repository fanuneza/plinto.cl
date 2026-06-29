import { getCollection } from "astro:content";
import { createSchemaEndpoint } from "@jdevalk/astro-seo-graph";
import { buildSchemaGraph } from "../../utils/schema";

export const GET = createSchemaEndpoint({
  entries: () => getCollection("work"),
  mapper: (work) => {
    const canonicalSlug = work.id.replace(/\.mdx$/, "");
    const url = `https://plinto.cl/work/${canonicalSlug}/`;
    const graph = buildSchemaGraph({
      pageType: "webpage",
      url,
      title: work.data.title,
      description: work.data.seoDescription,
    });
    return graph["@graph"];
  },
});
