import type { CollectionEntry } from 'astro:content';

type Paper = CollectionEntry<'papers'>;

export function papersByYear(papers: Paper[]): { year: number; papers: Paper[] }[] {
  const published = papers.filter((p) => !p.data.draft);
  const years = [...new Set(published.map((p) => p.data.year))].sort((a, b) => b - a);
  return years.map((year) => ({
    year,
    papers: published
      .filter((p) => p.data.year === year)
      .sort((a, b) => a.data.authors[0].family.localeCompare(b.data.authors[0].family)),
  }));
}

export function formatAuthors(authors: { family: string; given: string }[]): string {
  const names = authors.map((a) => `${a.family}, ${a.given}`);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, & ${names[names.length - 1]}`;
}

/** Reconstruct a strict CSL-JSON item (round-trip of the legacy format). */
export function toCsl(paper: Paper['data']): Record<string, unknown> {
  const item: Record<string, unknown> = {
    id: paper.citekey,
    type: paper.type,
    title: paper.title,
    author: paper.authors,
    issued: { 'date-parts': [[paper.year]] },
  };
  if (paper.editors) item.editor = paper.editors;
  if (paper.venue) item['container-title'] = paper.venue;
  if (paper.volume) item.volume = paper.volume;
  if (paper.issue) item.issue = paper.issue;
  if (paper.pages) item.page = paper.pages;
  if (paper.publisher) item.publisher = paper.publisher;
  if (paper.publisherPlace) item['publisher-place'] = paper.publisherPlace;
  if (paper.doi) item.DOI = paper.doi;
  if (paper.pdf) item.URL = `https://cml.chibatech.dev${paper.pdf}`;
  else if (paper.url) item.URL = paper.url;
  if (paper.abstract) item.abstract = paper.abstract;
  return item;
}
