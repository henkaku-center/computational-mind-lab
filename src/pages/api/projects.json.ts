import { getCollection } from 'astro:content';

export async function GET() {
  const projects = await getCollection('projects');
  const items = projects
    .filter((p) => !p.data.draft)
    .sort((a, b) => (a.data.weight ?? 100) - (b.data.weight ?? 100))
    .map((p) => ({
      ...p.data,
      url: `https://cml.chibatech.dev/${p.data.locale}/projects/${p.data.translationKey}/`,
    }));
  return new Response(JSON.stringify(items, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
