import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sitemapExclusions } from './src/lib/sitemap-exclusions.mjs';

const SITE = 'https://cml.chibatech.dev';
const excluded = sitemapExclusions(import.meta.dirname, SITE);

export default defineConfig({
  site: SITE,
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  redirects: {
    '/people': '/en/people/',
    '/papers': '/en/publications/',
    '/news': '/en/news/',
    '/projects': '/en/projects/',
    '/joinUs': '/en/join/',
    '/snafu': '/en/projects/snafu/',
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ja: 'ja' } },
      filter: (page) => !page.includes('/api/') && !excluded.has(page),
    }),
  ],
});
