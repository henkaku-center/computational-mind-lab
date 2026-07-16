import { getCollection } from 'astro:content';

export async function GET() {
  const people = await getCollection('people');
  const items = people
    .sort((a, b) => a.data.weight - b.data.weight)
    .map((p) => ({
      id: p.id,
      ...p.data,
      image: `https://cml.chibatech.dev${p.data.image}`,
    }));
  return new Response(JSON.stringify(items, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
