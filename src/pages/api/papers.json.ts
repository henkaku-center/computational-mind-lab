import { getCollection } from 'astro:content';

export async function GET() {
  const papers = await getCollection('papers');
  const items = papers
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.year - a.data.year)
    .map((p) => ({
      ...p.data,
      pdf: p.data.pdf ? `https://cml.chibatech.dev${p.data.pdf}` : undefined,
    }));
  return new Response(JSON.stringify(items, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
