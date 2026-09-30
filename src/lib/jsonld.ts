import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

const SITE = 'https://cml.chibatech.dev';
const LAB_ID = `${SITE}/#lab`;

export const labOrganization = {
  '@context': 'https://schema.org',
  '@type': 'ResearchOrganization',
  '@id': LAB_ID,
  name: 'The Computational Mind Lab',
  // "Austerweil Lab" was the name at Brown and UW–Madison; people still search for it.
  alternateName: ['計算マインド研究室', 'Austerweil Lab'],
  url: SITE,
  logo: `${SITE}/og-default.png`,
  sameAs: ['https://github.com/AusterweilLab'],
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
    alternateName: 'オウステウェイル ジョセフ',
    sameAs: [
      'https://scholar.google.com/citations?user=Jrn-jxQAAAAJ',
      'https://orcid.org/0000-0002-1316-4691',
    ],
  },
};

/** Canonical page for a paper (the English one; Scholar wants one URL per paper). */
export function paperPageUrl(citekey: string, locale: Locale = 'en'): string {
  return `${SITE}/${locale}/publications/${citekey}/`;
}

export function scholarlyArticle(paper: CollectionEntry<'papers'>['data']) {
  const pageUrl = paperPageUrl(paper.citekey);
  return {
    '@type': 'ScholarlyArticle',
    '@id': pageUrl,
    url: pageUrl,
    headline: paper.title,
    author: paper.authors.map((a) => ({
      '@type': 'Person',
      familyName: a.family,
      givenName: a.given,
    })),
    datePublished: String(paper.year),
    ...(paper.abstract ? { abstract: paper.abstract } : {}),
    ...(paper.venue ? { isPartOf: { '@type': 'Periodical', name: paper.venue } } : {}),
    ...(paper.doi ? { sameAs: `https://doi.org/${paper.doi}` } : {}),
    ...(paper.pdf
      ? { encoding: { '@type': 'MediaObject', contentUrl: `${SITE}${paper.pdf}`, encodingFormat: 'application/pdf' } }
      : {}),
    ...(paper.tags.length ? { keywords: paper.tags.join(', ') } : {}),
  };
}

export function person(entry: CollectionEntry<'people'>, pageUrl: string) {
  const d = entry.data;
  const isAlumni = d.group === 'alumni';
  return {
    '@type': 'Person',
    '@id': `${pageUrl}#${entry.id}`,
    name: d.name,
    ...(d.nameJa ? { alternateName: d.nameJa } : {}),
    ...(!isAlumni ? { jobTitle: d.title } : {}),
    image: new URL(d.image, SITE).href,
    ...(d.website ? { url: d.website } : {}),
    ...(d.profiles.length ? { sameAs: d.profiles } : {}),
    [isAlumni ? 'alumniOf' : 'memberOf']: { '@id': LAB_ID },
  };
}

export function blogPosting(
  entry: CollectionEntry<'news'>,
  pageUrl: string,
) {
  const d = entry.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': pageUrl,
    mainEntityOfPage: pageUrl,
    headline: d.title,
    description: d.excerpt,
    datePublished: d.date.toISOString(),
    inLanguage: d.locale,
    ...(d.heroImage ? { image: new URL(d.heroImage, SITE).href } : {}),
    ...(d.tags.length ? { keywords: d.tags.join(', ') } : {}),
    author: { '@id': LAB_ID },
    publisher: { '@id': LAB_ID, '@type': 'ResearchOrganization', name: labOrganization.name },
  };
}
