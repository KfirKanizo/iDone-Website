import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Work / case studies. One file per project per locale:
 *   src/content/work/<locale>/<slug>.md   →  id "he/boostcoach"
 * Both locales must exist for every slug (hreflang pairs).
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.string(),
    services: z.array(z.enum(['web', 'video', 'automation'])),
    summary: z.string(),
    problem: z.string(),
    built: z.array(z.string()),
    result: z.array(z.string()),
    tools: z.array(z.string()).default([]),
    /** Lower = earlier on the home page. Omit to keep off the home page. */
    featured: z.number().optional(),
    media: z
      .object({
        type: z.enum(['video', 'image', 'flow', 'none']),
        src: z.string().optional(),
        poster: z.string().optional(),
        alt: z.string().optional(),
        /** 9/16 for reels, 16/9 for films, 390/844 for phone screenshots */
        ratio: z.string().default('16 / 9'),
      })
      .default({ type: 'none', ratio: '16 / 9' }),
    /** Node labels for a brand-style flow diagram (media.type = 'flow'). */
    flow: z.array(z.string()).optional(),
    /** Extra images for the case page. */
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    /** Client logo (SVG/WebP). `dark: true` means it is artwork on a dark background. */
    clientLogo: z.object({ src: z.string(), dark: z.boolean().default(false) }).optional(),
    quote: z.object({ text: z.string(), who: z.string() }).optional(),
    /** Open items the owner must supply. Rendered as marked placeholders. */
    tbd: z.array(z.string()).default([]),
  }),
});

export const collections = { work };
