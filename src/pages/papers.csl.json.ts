import { getCollection } from 'astro:content';
import { toCsl } from '../lib/papers';

export async function GET() {
  const papers = await getCollection('papers');
  const items = papers
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.year - a.data.year)
    .map((p) => toCsl(p.data));
  return new Response(JSON.stringify(items, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
