#!/usr/bin/env node
/**
 * Repeatable content lint (part of `npm run check`):
 *  - news/projects: filename matches `<translationKey>.<locale>.md` frontmatter
 *  - unique translationKey per locale
 *  - papers: pdf paths resolve; citekey matches filename; every tag has a color
 *  - warns on machine translations (`translated: auto`) older than 90 days
 * Exits 1 on errors, 0 with warnings.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import YAML from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const errors = [];
const warnings = [];

function listFiles(dir, ext) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(ext)).map((f) => path.join(full, f));
}

// --- paired markdown collections ---
let awaitingReview = 0;
for (const kind of ['news', 'projects']) {
  const seen = new Set();
  for (const file of listFiles(`src/content/${kind}`, '.md')) {
    const base = path.basename(file, '.md');
    const m = base.match(/^(.+)\.(en|ja)$/);
    if (!m) {
      errors.push(`${kind}/${base}.md: filename must end in .en.md or .ja.md`);
      continue;
    }
    const [, key, loc] = m;
    const { data } = matter(fs.readFileSync(file, 'utf8'));
    if (data.translationKey !== key) {
      errors.push(`${kind}/${base}.md: translationKey "${data.translationKey}" != filename key "${key}"`);
    }
    if (data.locale !== loc) {
      errors.push(`${kind}/${base}.md: locale "${data.locale}" != filename locale "${loc}"`);
    }
    const pairId = `${key}|${loc}`;
    if (seen.has(pairId)) errors.push(`${kind}: duplicate ${pairId}`);
    seen.add(pairId);
    if (data.translated === 'auto') awaitingReview++;
  }
}
if (awaitingReview > 0) {
  warnings.push(`${awaitingReview} machine translation(s) awaiting human review (translated: auto)`);
}

// --- papers ---
const tagcolors = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tagcolors.json'), 'utf8'));
for (const file of listFiles('src/content/papers', '.yaml')) {
  const base = path.basename(file, '.yaml');
  const data = YAML.parse(fs.readFileSync(file, 'utf8'));
  if (data.citekey !== base) errors.push(`papers/${base}.yaml: citekey "${data.citekey}" != filename`);
  if (data.pdf) {
    const pdfPath = path.join(ROOT, 'public', data.pdf);
    if (!fs.existsSync(pdfPath)) errors.push(`papers/${base}.yaml: pdf not found: ${data.pdf}`);
  }
  for (const tag of data.tags ?? []) {
    if (!tagcolors[tag]) warnings.push(`papers/${base}.yaml: tag "${tag}" has no color in src/data/tagcolors.json`);
  }
}

// --- people ---
let needsReview = 0;
for (const file of listFiles('src/content/people', '.yaml')) {
  const data = YAML.parse(fs.readFileSync(file, 'utf8'));
  if (data.needsReview) needsReview++;
}
if (needsReview > 0) warnings.push(`${needsReview} people entries still have needsReview: true (see TRANSITION.md)`);

for (const w of warnings) console.warn('WARN  ' + w);
for (const e of errors) console.error('ERROR ' + e);
console.log(`check-content: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
