#!/usr/bin/env node
/**
 * One-time migration: _posts/news/*.md and _posts/projects/*.md ->
 * src/content/{news,projects}/<key>.en.md, plus redirect stubs in public/
 * at the exact old Jekyll URLs (/news/YYYY/MM/DD/slug.html).
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = 'https://cml.chibatech.dev';

const PROJECT_KEYS = {
  '2017-12-8-snafu': 'snafu',
  '2017-6-28-jarjar-slack': 'jarjar-slack',
  '2020-2-24-Cookies-Cognition': 'cookies-cognition',
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function parseFilename(file) {
  const m = path.basename(file, '.md').match(/^(\d{4})-(\d{1,2})-(\d{1,2})-(.+)$/);
  if (!m) return null;
  const [, y, mo, d, slug] = m;
  return { y, mo: pad(mo), d: pad(d), slug, date: `${y}-${pad(mo)}-${pad(d)}` };
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function migrateDir(kind) {
  const srcDir = path.join(ROOT, '_posts', kind);
  const outDir = path.join(ROOT, 'src/content', kind);
  fs.mkdirSync(outDir, { recursive: true });
  const stubs = [];

  const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith('.md') && !f.endsWith('.md~') && !/ copy\.md$/.test(f));

  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) {
      console.error(`  cannot parse filename, skipping: ${file}`);
      continue;
    }
    const { data, content } = matter(fs.readFileSync(path.join(srcDir, file), 'utf8'));

    const baseKey = `${parsed.date}-${parsed.slug}`;
    const key = kind === 'projects' ? (PROJECT_KEYS[path.basename(file, '.md')] ?? parsed.slug) : baseKey;

    let body = content;
    if (data.assets) {
      body = body.replaceAll('{{page.assets}}', String(data.assets)).replaceAll('{{ page.assets }}', String(data.assets));
    }
    if (data.excerpt) {
      body = body.replaceAll('{{page.excerpt}}', String(data.excerpt)).replaceAll('{{ page.excerpt }}', String(data.excerpt));
    }
    // strip leftover simple Liquid expressions, keep a warning
    if (/\{\{|\{%/.test(body)) {
      console.error(`  WARNING leftover Liquid in ${file}`);
    }
    // verify referenced local images exist
    for (const m of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)|src=["']([^"']+)["']/g)) {
      const ref = (m[1] ?? m[2] ?? '').split(/[?#]/)[0];
      if (ref.startsWith('/') && !fs.existsSync(path.join(ROOT, 'public', ref))) {
        console.error(`  WARNING missing asset ${ref} referenced by ${file}`);
      }
    }

    const fm = {
      title: String(data.title ?? parsed.slug).trim(),
      excerpt: String(data.excerpt ?? '').trim(),
      date: parsed.date,
      locale: 'en',
      translationKey: key,
      translated: 'original',
      tags: normalizeTags(data.tags),
    };
    if (kind === 'projects') fm.status = 'archived';

    fs.writeFileSync(path.join(outDir, `${key}.en.md`), matter.stringify('\n' + body.trim() + '\n', fm));

    // redirect stub at old Jekyll URL
    const newUrl = `/en/${kind}/${key}/`;
    const stubDir = path.join(ROOT, 'public', kind, parsed.y, parsed.mo, parsed.d);
    fs.mkdirSync(stubDir, { recursive: true });
    fs.writeFileSync(
      path.join(stubDir, `${parsed.slug}.html`),
      `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${newUrl}"><link rel="canonical" href="${SITE}${newUrl}"><a href="${newUrl}">Moved to ${newUrl}</a>\n`
    );
    stubs.push(`${kind}/${parsed.y}/${parsed.mo}/${parsed.d}/${parsed.slug}.html`);
  }
  console.log(`${kind}: migrated ${files.length} posts, ${stubs.length} redirect stubs`);
}

migrateDir('news');
migrateDir('projects');
