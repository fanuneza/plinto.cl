import { getCollection } from "astro:content";
import { createMarkdownEndpoint } from "@jdevalk/astro-seo-graph";

export const getStaticPaths = async () => {
  const works = await getCollection("work");
  return works.flatMap((work) => {
    const slug = work.id.replace(/\.mdx$/, "");
    const slugs = [slug, ...work.data.legacySlugs];
    return slugs.map((pathSlug) => ({
      params: { slug: pathSlug },
    }));
  });
};

export const GET = createMarkdownEndpoint({
  entries: () => getCollection("work"),
  mapper: (work, slug) => {
    const canonicalSlug = work.id.replace(/\.mdx$/, "");
    const match = canonicalSlug === slug || work.data.legacySlugs.includes(slug);
    if (!match) return null;
    return {
      frontmatter: {
        title: work.data.title,
        canonical: `https://plinto.cl/work/${canonicalSlug}/`,
        client: work.data.client,
        service: work.data.service,
        year: work.data.year,
        description: work.data.seoDescription,
        summary: work.data.summary,
      },
      body: work.body ?? "",
    };
  },
});
