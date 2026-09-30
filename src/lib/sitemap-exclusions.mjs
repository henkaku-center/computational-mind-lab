// Pages that exist only as fallback copies of another locale's page. They set a
// canonical pointing at the source page, so the sitemap should leave them out.
// Plain .mjs (not a content-collection query) because astro.config runs before content loads.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import YAML from 'yaml';

const LOCALES = ['en', 'ja'];

function list(dir, ext) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)) : [];
}

export function sitemapExclusions(root, site) {
  const excluded = new Set(['/404/']);

  for (const kind of ['news', 'projects']) {
    const dir = path.join(root, 'src/content', kind);
    const localesByKey = new Map();
    for (const file of list(dir, '.md')) {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (data.draft) continue;
      if (!localesByKey.has(data.translationKey)) localesByKey.set(data.translationKey, new Set());
      localesByKey.get(data.translationKey).add(data.locale);
    }
    for (const [key, present] of localesByKey) {
      for (const locale of LOCALES) {
        if (!present.has(locale)) excluded.add(`/${locale}/${kind}/${key}/`);
      }
    }
  }

  const papersDir = path.join(root, 'src/content/papers');
  for (const file of list(papersDir, '.yaml')) {
    const data = YAML.parse(fs.readFileSync(path.join(papersDir, file), 'utf8'));
    if (!data.draft && !data.abstractJa) excluded.add(`/ja/publications/${data.citekey}/`);
  }

  return new Set([...excluded].map((p) => new URL(p, site).href));
}
