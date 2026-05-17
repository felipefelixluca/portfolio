import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    role: z.string(),
    year: z.string(),
    order: z.number(),
    accent: z.enum(['red', 'yellow', 'blue']).default('red'),
    summary: z.string(),
    team: z.string().optional(),
    tools: z.array(z.string()).default([]),
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    heroAsset: z.string().optional(),
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        })
      )
      .default([]),
    galleryColumns: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
    status: z.enum(['published', 'draft']).default('published'),
    draftNote: z.string().optional(),
  }),
});

export const collections = { projects };
