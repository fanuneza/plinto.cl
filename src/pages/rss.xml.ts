import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { APIContext } from "astro";

const imageDirs = ["projects", "people", "decorative", "brand"];

function sourceAsset(src: string): { size: number; type: string } | undefined {
  const base = src.split("/").pop() ?? "";
  const parts = base.split(".");
  const candidate = parts.length === 3 ? `${parts[0]}.${parts[2]}` : base;
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  const type = types[`.` + (candidate.split(".").pop() ?? "")];
  if (!type) return undefined;

  for (const dir of imageDirs) {
    try {
      const path = join(process.cwd(), "src", "assets", "images", dir, candidate);
      if (readdirSync(join(process.cwd(), "src", "assets", "images", dir)).includes(candidate)) {
        return { size: statSync(path).size, type };
      }
    } catch {
      continue;
    }
  }
  return undefined;
}

export async function GET(context: APIContext) {
  const works = (await getCollection("work")).sort((a, b) => a.data.order - b.data.order);
  const site = context.site ?? "https://plinto.cl";

  const items = works.map((work) => {
    const enclosureUrl = new URL(work.data.coverImage.src, site);
    const asset = sourceAsset(work.data.coverImage.src);

    return {
      title: work.data.title,
      description: work.data.summary,
      link: `/work/${work.id.replace(/\.mdx$/, "")}/`,
      pubDate: new Date(`${work.data.year}-01-01`),
      customData: asset ? `<enclosure url="${enclosureUrl}" length="${asset.size}" type="${asset.type}" />` : undefined,
    };
  });

  return rss({
    title: "Plinto — Proyectos",
    description: "Portafolio de proyectos, campañas y registros desarrollados por Plinto.",
    site,
    items,
    customData: `<language>es-cl</language>`,
  });
}
