import type { CollectionEntry } from 'astro:content';

const SITE = 'https://cml.chibatech.dev';

export const labOrganization = {
  '@context': 'https://schema.org',
  '@type': 'ResearchOrganization',
  name: 'The Computational Mind Lab',
  alternateName: '計算マインド研究室',
  url: SITE,
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: 'Chiba Institute of Technology',
    department: { '@type': 'Organization', name: 'School of Design & Science' },
    url: 'https://www.it-chiba.ac.jp/',
  },
  founder: {
    '@type': 'Person',
    name: 'Joseph Austerweil',
    jobTitle: 'Professor & Academic Director, School of Design & Science',
  },
};

export function scholarlyArticle(paper: CollectionEntry<'papers'>['data']) {
  return {
    '@type': 'ScholarlyArticle',
    headline: paper.title,
    author: paper.authors.map((a) => ({
      '@type': 'Person',
      familyName: a.family,
      givenName: a.given,
    })),
    datePublished: String(paper.year),
    ...(paper.venue ? { isPartOf: { '@type': 'Periodical', name: paper.venue } } : {}),
    ...(paper.doi ? { sameAs: `https://doi.org/${paper.doi}` } : {}),
    ...(paper.pdf ? { url: `${SITE}${paper.pdf}` } : {}),
  };
}
