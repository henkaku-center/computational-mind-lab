import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getLocalized } from '../../lib/translations';

export async function GET(context: APIContext) {
  const news = getLocalized(await getCollection('news'), 'ja');
  return rss({
    title: '計算マインド研究室',
    description: '計算マインド研究室（千葉工業大学デザイン＆サイエンス学部）のニュース',
    site: context.site!,
    items: news.map(({ entry }) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.excerpt,
      link: `/ja/news/${entry.data.translationKey}/`,
    })),
  });
}
