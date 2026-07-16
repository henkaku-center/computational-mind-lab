/**
 * Content helpers shared by the translation and weekly workflows:
 * frontmatter parse/serialize, sourceHash, translation-pair resolution.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';

export const ROOT = path.resolve(import.meta.dirname, '../..');

export const PAIRED_DIRS = ['src/content/news', 'src/content/projects'];

/** Fields of paired markdown that are translated (besides the body). */
export const TRANSLATABLE_FM = ['title', 'excerpt'];

export function readEntry(file) {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  return { file, data, body: content };
}

export function writeEntry(file, data, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, matter.stringify('\n' + body.trim() + '\n', data));
}

/** sha256 over the translatable payload of a paired-markdown entry. */
export function sourceHash(data, body) {
  const payload = JSON.stringify({
    fm: Object.fromEntries(TRANSLATABLE_FM.map((k) => [k, data[k] ?? null])),
    body: body.trim(),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/** Parse "<key>.<locale>.md" -> {key, locale} or null. */
export function parsePairName(file) {
  const m = path.basename(file, '.md').match(/^(.+)\.(en|ja)$/);
  return m ? { key: m[1], locale: m[2] } : null;
}

export function counterpartPath(file) {
  const parsed = parsePairName(file);
  if (!parsed) return null;
  const other = parsed.locale === 'en' ? 'ja' : 'en';
  return path.join(path.dirname(file), `${parsed.key}.${other}.md`);
}

/** All paired markdown files, repo-relative. */
export function listPairedFiles() {
  const out = [];
  for (const dir of PAIRED_DIRS) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) continue;
    for (const f of fs.readdirSync(full)) {
      if (f.endsWith('.md')) out.push(path.join(dir, f));
    }
  }
  return out;
}
