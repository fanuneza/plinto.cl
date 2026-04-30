import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    service: z.string(),
    year: z.number(),
    coverImage: z.string(),
    gallery: z.array(z.string()),
    summary: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    featured: z.boolean().default(false),
    order: z.number(),
    liveUrl: z.url().optional(),
    legacySlugs: z.array(z.string()).default([]),
    brief: z.string().optional(),
    solution: z.string().optional(),
    deliverables: z.array(z.string()).default([]),
  }),
});

export const collections = { work };
