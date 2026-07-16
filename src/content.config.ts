import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const locale = z.enum(['en', 'ja']);
const translated = z.enum(['original', 'auto', 'human']);
const personName = z.object({ family: z.string(), given: z.string() });

const localizedPost = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.coerce.date(),
  locale,
  translationKey: z.string(),
  translated: translated.default('original'),
  sourceHash: z.string().optional(),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
});

const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/news' }),
  schema: localizedPost,
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: localizedPost.extend({
    status: z.enum(['active', 'archived']).default('active'),
    repo: z.string().url().optional(),
    weight: z.number().default(100),
  }),
});

const papers = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/papers' }),
  schema: z.object({
    citekey: z.string(),
    title: z.string(),
    authors: z.array(personName).min(1),
    editors: z.array(personName).optional(),
    year: z.number().int(),
    type: z.enum(['article-journal', 'paper-conference', 'chapter']),
    venue: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    publisher: z.string().optional(),
    publisherPlace: z.string().optional(),
    pdf: z.string().startsWith('/papers/files/').optional(),
    doi: z.string().optional(),
    url: z.string().url().optional(),
    abstract: z.string().optional(),
    abstractJa: z.string().optional(),
    abstractJaTranslated: translated.optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    nameJa: z.string().optional(),
    title: z.string(),
    titleJa: z.string().optional(),
    group: z.enum(['pi', 'members', 'undergrads', 'affiliates', 'alumni']),
    /** For alumni: which role they held in the lab (drives grouping). */
    alumniRole: z.enum(['postdoc', 'grad', 'undergrad', 'staff']).optional(),
    era: z.enum(['brown', 'uw-madison', 'chibatech']).default('chibatech'),
    years: z.string().optional(),
    /** Last year active in the lab; sorts alumni most-recent-first. */
    lastActiveYear: z.number().int().optional(),
    currentPosition: z.string().optional(),
    blurb: z.string().optional(),
    blurbJa: z.string().optional(),
    image: z.string().default('/img/people/default.jpg'),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    weight: z.number().default(100),
    needsReview: z.boolean().default(false),
  }),
});

export const collections = { news, projects, papers, people };
