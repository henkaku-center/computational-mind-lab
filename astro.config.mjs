import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cml.chibatech.dev',
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
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
