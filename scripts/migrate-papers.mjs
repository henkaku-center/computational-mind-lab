#!/usr/bin/env node
/**
 * One-time migration: _data/papers.json (CSL-like, non-strict JSON) ->
 * src/content/papers/<citekey>.yaml (one file per paper).
 * Also: _data/tagcolors.json -> src/data/tagcolors.json (strict JSON).
 *
 * Idempotent: re-running overwrites generated files deterministically.
 */
import fs from 'node:fs';
import path from 'node:path';
import JSON5 from 'json5';
import YAML from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '_data/papers.json');
const OUT_DIR = path.join(ROOT, 'src/content/papers');
const PDF_DIR = path.join(ROOT, 'public/papers/files');

/**
 * The legacy file contains raw newlines inside string literals (illegal even
 * in JSON5). Rejoin any line that ends with an unterminated string (odd count
 * of unescaped quotes) with the following line.
 */
function fixRawNewlinesInStrings(text) {
  const out = [];
  let buffer = null;
  for (const line of text.split('\n')) {
    const candidate = buffer === null ? line : buffer + ' ' + line.trimStart();
    const quotes = (candidate.match(/(?<!\\)"/g) ?? []).length;
    if (quotes % 2 === 1) {
      buffer = candidate;
    } else {
      out.push(candidate);
      buffer = null;
    }
  }
  if (buffer !== null) out.push(buffer);
  return out.join('\n');
}

/** Titles missing in the legacy data, recovered from the PDFs themselves. */
const TITLE_FIXES = {
  '/papers/files/AusterweilBNPBookChapter2025.pdf':
    'Capturing the growth of knowledge with nonparametric Bayesian models',
  '/papers/files/Austerweiletal2024catgen.pdf':
    'Creating Something Different: Similarity, Contrast, and Representativeness in Categorization',
};

const raw = fs.readFileSync(SRC, 'utf8');
const papers = JSON5.parse(fixRawNewlinesInStrings(raw));
for (const p of papers) {
  if (!p.title && TITLE_FIXES[p.URL]) p.title = TITLE_FIXES[p.URL];
}
console.log(`parsed ${papers.length} paper entries`);

fs.mkdirSync(OUT_DIR, { recursive: true });

const warnings = [];
const seenKeys = new Set();

function slugifyKey(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function makeCitekey(p) {
  if (p.id && String(p.id).trim()) return slugifyKey(String(p.id));
  const fam = p.author?.[0]?.family ?? 'anon';
  const word = (p.title ?? '').split(/\s+/).find((w) => w.length > 3) ?? 'work';
  return slugifyKey(`${fam}${String(p.year).slice(-2)}${word}`);
}

function cleanStr(s) {
  if (s === undefined || s === null) return undefined;
  const out = String(s).replace(/\s+/g, ' ').trim();
  return out.length ? out : undefined;
}

function mapType(t) {
  const map = {
    'article-journal': 'article-journal',
    'paper-conference': 'paper-conference',
    conference: 'paper-conference',
    'article-conference': 'paper-conference',
    chapter: 'chapter',
  };
  if (!map[t]) throw new Error(`unknown paper type: ${t}`);
  return map[t];
}

for (const p of papers) {
  let citekey = makeCitekey(p);
  while (seenKeys.has(citekey)) citekey += 'x';
  seenKeys.add(citekey);

  const entry = { citekey, title: cleanStr(p.title) };

  entry.authors = (p.author ?? []).map((a) => ({
    family: cleanStr(a.family) ?? '',
    given: cleanStr(a.given) ?? '',
  }));
  if (p.editor?.length) {
    entry.editors = p.editor.map((e) => ({
      family: cleanStr(e.family) ?? '',
      given: cleanStr(e.given) ?? '',
    }));
  }
  entry.year = Number(p.year);
  entry.type = mapType(p.type);
  if (cleanStr(p['container-title'])) entry.venue = cleanStr(p['container-title']);
  if (cleanStr(p.volume)) entry.volume = String(cleanStr(p.volume));
  if (cleanStr(p.issue)) entry.issue = String(cleanStr(p.issue));
  if (cleanStr(p.page)) entry.pages = cleanStr(p.page);
  if (cleanStr(p.publisher)) entry.publisher = cleanStr(p.publisher);
  if (cleanStr(p.publisherplace)) entry.publisherPlace = cleanStr(p.publisherplace);

  const url = cleanStr(p.URL);
  if (url) {
    if (url.startsWith('/papers/files/')) {
      const pdfPath = path.join(PDF_DIR, url.replace('/papers/files/', ''));
      if (fs.existsSync(pdfPath)) {
        entry.pdf = url;
      } else {
        warnings.push(`${citekey}: pdf missing on disk: ${url}`);
      }
    } else if (/^https?:\/\//.test(url)) {
      entry.url = url;
    } else {
      warnings.push(`${citekey}: unrecognized URL kept as comment: ${url}`);
    }
  }
  if (cleanStr(p.DOI ?? p.doi)) entry.doi = cleanStr(p.DOI ?? p.doi);
  if (cleanStr(p.abstract)) entry.abstract = cleanStr(p.abstract);
  entry.tags = (p.tags ?? []).map((t) => cleanStr(t)).filter(Boolean);

  const doc = new YAML.Document(entry);
  const bad = url && !entry.pdf && !entry.url;
  let text = doc.toString({ lineWidth: 0 });
  if (bad) text = `# TODO unresolved URL from papers.json: ${url}\n` + text;
  fs.writeFileSync(path.join(OUT_DIR, `${citekey}.yaml`), text);
}

console.log(`wrote ${seenKeys.size} files to src/content/papers/`);

// tagcolors -> strict JSON + coverage check
const tagcolorsRaw = fs.readFileSync(path.join(ROOT, '_data/tagcolors.json'), 'utf8');
const tagcolors = JSON5.parse(tagcolorsRaw);
const allTags = new Set(papers.flatMap((p) => (p.tags ?? []).map((t) => cleanStr(t)).filter(Boolean)));
const MATERIAL_FALLBACKS = ['#D1C4E9', '#C5CAE9', '#B3E5FC', '#B2DFDB', '#DCEDC8', '#FFF9C4', '#FFE0B2'];
let fi = 0;
for (const tag of [...allTags].sort()) {
  if (!tagcolors[tag]) {
    tagcolors[tag] = MATERIAL_FALLBACKS[fi++ % MATERIAL_FALLBACKS.length];
    warnings.push(`tag without color assigned fallback: "${tag}" -> ${tagcolors[tag]}`);
  }
}
fs.mkdirSync(path.join(ROOT, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/data/tagcolors.json'), JSON.stringify(tagcolors, null, 2) + '\n');
console.log(`wrote src/data/tagcolors.json (${Object.keys(tagcolors).length} tags)`);

if (warnings.length) {
  console.error('\nWARNINGS:');
  for (const w of warnings) console.error('  - ' + w);
}
