import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getLocalized } from '../lib/translations';

export async function GET(context: APIContext) {
  const news = getLocalized(await getCollection('news'), 'en');
  return rss({
    title: 'The Computational Mind Lab',
    description: 'News from The Computational Mind Lab, Chiba Tech School of Design & Science',
    site: context.site!,
    items: news.map(({ entry }) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.excerpt,
      link: `/en/news/${entry.data.translationKey}/`,
    })),
  });
}
