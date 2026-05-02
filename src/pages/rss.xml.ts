import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const works = await getCollection("work");
  works.sort((a, b) => a.data.order - b.data.order);

  return rss({
    title: "Plinto — Proyectos",
    description: "Portafolio de proyectos, campañas y registros desarrollados por Plinto.",
    site: context.site ?? "https://plinto.cl",
    items: works.map((work) => ({
      title: work.data.title,
      description: work.data.summary,
      link: `/work/${work.id.replace(/\.mdx$/, "")}/`,
      pubDate: new Date(`${work.data.year}-01-01`),
    })),
    customData: `<language>es-cl</language>`,
  });
}
