import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const str = z.string().nullish().transform((v) => v ?? '');

const home = defineCollection({
  loader: glob({ pattern: 'index.yaml', base: './src/content/home' }),
  schema: z.object({
    name: str,
    nickname: str,
    mobileName: str,
    role: str,
    bio: str,
    bioMobile: str,
    note: str,
    ctaLead: str,
    ctaLink: str,
    email: str,
    availability: str,
    prompt: str,
    copyright: str,
    socials: z.array(z.object({ label: str, url: str })).default([]),
    gallery: z
      .array(
        z.object({
          label: str,
          kind: z.enum(['image', 'video']).default('image'),
          image: str,
          video: str,
          size: z.enum(['small', 'tall', 'large']).default('small'),
          fit: z.enum(['cover', 'contain']).default('cover'),
          show: z.enum(['all', 'desktop', 'mobile']).default('all'),
          mobileOrder: z.number().nullish(),
        }),
      )
      .default([]),
  }),
});

const caseStudiesPage = defineCollection({
  loader: glob({ pattern: 'index.yaml', base: './src/content/case-studies-page' }),
  schema: z.object({
    eyebrow: str,
    title: str,
    tags: z.array(z.string()).default([]),
    description: str,
  }),
});

const caseStudies = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/case-studies',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    title: z.string(),
    seoTitle: str,
    number: str,
    order: z.number().nullish().transform((v) => v ?? 0),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    cardTitle: str,
    shortTitle: str,
    summary: str,
    cover: str,
    hero: str,
    glance: z.array(z.object({ label: str, value: str })).default([]),
    tldr: z.array(z.string()).default([]),
    download: z
      .object({ title: str, body: str, label: str, url: str })
      .nullish()
      .transform((v) => (v && v.title ? v : null)),
    toc: z.array(z.object({ label: str, heading: str })).default([]),
  }),
});

export const collections = { home, caseStudiesPage, caseStudies };
