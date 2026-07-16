import { getCollection } from 'astro:content';

export async function GET() {
  const news = await getCollection('news');
  const items = news
    .filter((n) => !n.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((n) => ({
      ...n.data,
      url: `https://cml.chibatech.dev/${n.data.locale}/news/${n.data.translationKey}/`,
    }));
  return new Response(JSON.stringify(items, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
