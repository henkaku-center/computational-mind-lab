/**
 * Publications discovery for the weekly hook. Queries stable author-based
 * APIs (OpenAlex, Semantic Scholar, arXiv; ORCID if configured) — never
 * Google Scholar. Dedupes against existing papers + seen state by
 * normalized DOI and title similarity.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { ROOT } from './content.mjs';

function normDoi(doi) {
  return (doi ?? '')
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
    .replace(/^doi:/, '')
    .trim();
}

function normTitle(title) {
  return (title ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleTokens(title) {
  return new Set(normTitle(title).split(' ').filter((w) => w.length > 2));
}

function jaccard(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

async function tryFetch(name, url, parse) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'cml-site-bot (joseph.austerweil@gmail.com)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await parse(res);
  } catch (err) {
    console.error(`[pubs] ${name} failed (continuing without it): ${err.message}`);
    return [];
  }
}

/** Fetch candidate works published since `sinceDate` (YYYY-MM-DD). */
export async function fetchCandidates(config, sinceDate) {
  const out = [];

  if (config.openalexAuthorId) {
    out.push(
      ...(await tryFetch(
        'openalex',
        `https://api.openalex.org/works?filter=author.id:${config.openalexAuthorId},from_publication_date:${sinceDate}&per-page=50&mailto=joseph.austerweil@gmail.com`,
        async (res) => {
          const json = await res.json();
          return (json.results ?? []).map((w) => ({
            source: `openalex:${w.id}`,
            title: w.title,
            year: w.publication_year,
            doi: normDoi(w.doi),
            venue: w.primary_location?.source?.display_name,
            authors: (w.authorships ?? []).map((a) => a.author?.display_name).filter(Boolean),
          }));
        }
      ))
    );
  }

  if (config.s2AuthorId) {
    out.push(
      ...(await tryFetch(
        'semanticscholar',
        `https://api.semanticscholar.org/graph/v1/author/${config.s2AuthorId}/papers?fields=title,year,externalIds,venue,authors&limit=100`,
        async (res) => {
          const json = await res.json();
          const sinceYear = Number(sinceDate.slice(0, 4));
          return (json.data ?? [])
            .filter((p) => p.year >= sinceYear)
            .map((p) => ({
              source: `s2:${p.paperId ?? ''}`,
              title: p.title,
              year: p.year,
              doi: normDoi(p.externalIds?.DOI),
              venue: p.venue,
              authors: (p.authors ?? []).map((a) => a.name),
            }));
        }
      ))
    );
  }

  out.push(
    ...(await tryFetch(
      'arxiv',
      'http://export.arxiv.org/api/query?search_query=au:%22Austerweil%22&sortBy=submittedDate&sortOrder=descending&max_results=25',
      async (res) => {
        const xml = await res.text();
        const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
        const sinceMs = new Date(sinceDate).getTime();
        return entries
          .map((m) => {
            const block = m[1];
            const get = (tag) => block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim();
            return {
              source: `arxiv:${get('id') ?? ''}`,
              title: (get('title') ?? '').replace(/\s+/g, ' '),
              year: Number((get('published') ?? '').slice(0, 4)),
              published: get('published'),
              doi: '',
              venue: 'arXiv',
              authors: [...block.matchAll(/<name>([^<]+)<\/name>/g)].map((a) => a[1]),
            };
          })
          .filter((e) => e.published && new Date(e.published).getTime() >= sinceMs);
      }
    ))
  );

  // author guard against homonyms
  const guarded = out.filter((c) => c.authors.some((a) => /austerweil/i.test(a)));

  return guarded;
}

/** Remove candidates already present in src/content/papers or seen state. */
export function dedupe(candidates, state) {
  const existing = [];
  const papersDir = path.join(ROOT, 'src/content/papers');
  for (const f of fs.readdirSync(papersDir).filter((f) => f.endsWith('.yaml'))) {
    const data = YAML.parse(fs.readFileSync(path.join(papersDir, f), 'utf8'));
    existing.push({ doi: normDoi(data.doi), tokens: titleTokens(data.title), year: data.year });
  }
  const seenDois = new Set((state.papers?.seenDois ?? []).map(normDoi));
  const seenTitleKeys = new Set(state.papers?.seenTitleKeys ?? []);

  const fresh = [];
  for (const c of candidates) {
    const key = `${normTitle(c.title).split(' ').slice(0, 5).join('')}|${c.year}`;
    if (c.doi && (seenDois.has(c.doi) || existing.some((e) => e.doi && e.doi === c.doi))) continue;
    if (seenTitleKeys.has(key)) continue;
    const ct = titleTokens(c.title);
    if (existing.some((e) => Math.abs((e.year ?? 0) - c.year) <= 1 && jaccard(e.tokens, ct) >= 0.85)) continue;
    if (fresh.some((f) => jaccard(titleTokens(f.title), ct) >= 0.85)) continue;
    fresh.push({ ...c, titleKey: key });
  }
  return fresh;
}
