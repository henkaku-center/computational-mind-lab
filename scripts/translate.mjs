#!/usr/bin/env node
/**
 * Auto-translation: keeps locale counterparts of paired markdown content in sync.
 *
 * Usage:
 *   node scripts/translate.mjs --changed "src/content/news/x.en.md,..."   # diff-scoped
 *   node scripts/translate.mjs --full-scan [--dry-run]                    # reconcile all
 *
 * Decision table per pair (source = the side that changed / is authoritative):
 *   counterpart missing            -> generate (translated: auto), direct write
 *   counterpart translated: auto   -> regenerate if sourceHash stale, direct write
 *   counterpart translated: human  -> NEVER overwrite; write proposal to
 *                                     .automation/refresh-proposals/ (CI opens a PR)
 *   both locales changed same push -> skip pair, list in conflicts output
 *   human edited a translated file -> flip to translated: human, resync sourceHash
 *
 * Loop safety: generated files carry sourceHash of their source's translatable
 * payload; an unchanged hash produces no writes, so re-runs are no-ops.
 */
import fs from 'node:fs';
import path from 'node:path';
import { structuredCall, writeUsageSummary } from './lib/claude.mjs';
import {
  ROOT,
  TRANSLATABLE_FM,
  readEntry,
  writeEntry,
  sourceHash,
  parsePairName,
  counterpartPath,
  listPairedFiles,
} from './lib/content.mjs';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FULL_SCAN = args.includes('--full-scan');
const MAX_FILES = 25;
const changedArg = args.includes('--changed') ? args[args.indexOf('--changed') + 1] : '';

const SYSTEM = fs.readFileSync(path.join(ROOT, 'scripts/prompts/translate-system.md'), 'utf8');

const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    excerpt: { type: 'string' },
    body: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['title', 'excerpt', 'body', 'notes'],
  additionalProperties: false,
};

function repoRel(p) {
  return path.isAbsolute(p) ? path.relative(ROOT, p) : p;
}

/** Determine which pairs need work. Returns [{sourceFile, reason}] and conflicts. */
function plan() {
  const jobs = [];
  const conflicts = [];

  if (FULL_SCAN) {
    // every EN/JA file whose counterpart is missing or hash-stale, preferring
    // the 'original' side as source
    const seen = new Set();
    for (const rel of listPairedFiles()) {
      const parsed = parsePairName(rel);
      if (!parsed || seen.has(parsed.key)) continue;
      seen.add(parsed.key);
      const entry = readEntry(path.join(ROOT, rel));
      const cp = counterpartPath(path.join(ROOT, rel));
      const source =
        entry.data.translated === 'original' || !fs.existsSync(cp)
          ? path.join(ROOT, rel)
          : cp;
      jobs.push({ sourceFile: source, reason: 'full-scan' });
    }
    return { jobs, conflicts };
  }

  const changed = changedArg
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s.endsWith('.md') && /src\/content\/(news|projects)\//.test(s))
    .filter((s) => fs.existsSync(path.join(ROOT, s)));

  const byKey = new Map();
  for (const rel of changed) {
    const parsed = parsePairName(rel);
    if (!parsed) continue;
    if (!byKey.has(parsed.key)) byKey.set(parsed.key, []);
    byKey.get(parsed.key).push(rel);
  }

  for (const [key, files] of byKey) {
    if (files.length > 1) {
      conflicts.push(key);
      continue;
    }
    jobs.push({ sourceFile: path.join(ROOT, files[0]), reason: 'changed' });
  }
  return { jobs, conflicts };
}

async function translatePair(sourceFile) {
  const src = readEntry(sourceFile);
  const cpFile = counterpartPath(sourceFile);
  const srcLocale = src.data.locale;
  const dstLocale = srcLocale === 'en' ? 'ja' : 'en';
  const hash = sourceHash(src.data, src.body);

  // Case: the changed file is itself a machine translation a human edited ->
  // take ownership (flip to human) and resync its hash to the current source.
  if (src.data.translated === 'auto' && fs.existsSync(cpFile)) {
    const cp = readEntry(cpFile);
    if (cp.data.translated === 'original') {
      const cpHash = sourceHash(cp.data, cp.body);
      if (src.data.sourceHash === cpHash) {
        return { action: 'noop', file: repoRel(sourceFile), why: 'auto translation unchanged vs source' };
      }
      if (!DRY_RUN) {
        writeEntry(sourceFile, { ...src.data, translated: 'human', sourceHash: cpHash }, src.body);
      }
      return { action: 'took-ownership', file: repoRel(sourceFile) };
    }
  }

  const cpExists = fs.existsSync(cpFile);
  const cp = cpExists ? readEntry(cpFile) : null;

  if (cp && cp.data.translated === 'human') {
    if (cp.data.sourceHash === hash) {
      return { action: 'noop', file: repoRel(cpFile), why: 'human translation in sync' };
    }
    if (DRY_RUN) return { action: 'would-propose-refresh', file: repoRel(cpFile) };
    // never overwrite a human translation: emit a proposal for CI to PR
    const proposal = await generate(src, dstLocale, hash);
    const outDir = path.join(ROOT, '.automation/refresh-proposals');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, path.basename(cpFile)), proposal.fileText);
    return { action: 'refresh-proposal', file: repoRel(cpFile) };
  }

  if (cp && cp.data.sourceHash === hash) {
    return { action: 'noop', file: repoRel(cpFile), why: 'hash up to date' };
  }

  if (DRY_RUN) {
    return { action: cpExists ? 'would-regenerate' : 'would-create', file: repoRel(cpFile) };
  }
  const result = await generate(src, dstLocale, hash);
  fs.writeFileSync(cpFile, result.fileText);
  return { action: cpExists ? 'regenerated' : 'created', file: repoRel(cpFile), notes: result.notes };
}

async function generate(src, dstLocale, hash) {
  const fmValues = Object.fromEntries(TRANSLATABLE_FM.map((k) => [k, src.data[k] ?? '']));
  const out = await structuredCall({
    system: SYSTEM,
    user: [
      `Translate the following ${src.data.locale === 'en' ? 'English' : 'Japanese'} content to ${dstLocale === 'ja' ? 'Japanese' : 'English'}.`,
      ``,
      `Frontmatter fields to translate: ${JSON.stringify(fmValues)}`,
      ``,
      `Body (Markdown):`,
      src.body.trim() || '(no body)',
    ].join('\n'),
    schema: TRANSLATION_SCHEMA,
    effort: 'low',
  });

  const data = {
    ...src.data,
    title: out.title,
    excerpt: out.excerpt,
    locale: dstLocale,
    translated: 'auto',
    sourceHash: hash,
  };
  const matter = await import('gray-matter');
  const fileText = matter.default.stringify('\n' + (out.body || '').trim() + '\n', data);
  return { fileText, notes: out.notes };
}

// ---- main ----
const { jobs, conflicts } = plan();
const capped = jobs.slice(0, MAX_FILES);
if (jobs.length > MAX_FILES) {
  console.error(`capping at ${MAX_FILES} files; ${jobs.length - MAX_FILES} deferred to next run`);
}

const results = [];
for (const job of capped) {
  try {
    results.push(await translatePair(job.sourceFile));
  } catch (err) {
    results.push({ action: 'error', file: repoRel(job.sourceFile), why: String(err.message) });
  }
}

for (const r of results) {
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${r.action}: ${r.file}${r.why ? ` (${r.why})` : ''}${r.notes ? ` [notes: ${r.notes}]` : ''}`);
}
if (conflicts.length) {
  console.log(`CONFLICTS (both locales edited in one push, skipped): ${conflicts.join(', ')}`);
  fs.writeFileSync(path.join(ROOT, '.automation/translate-conflicts.txt'), conflicts.join('\n') + '\n');
}
writeUsageSummary('translate');

const errors = results.filter((r) => r.action === 'error');
process.exit(errors.length ? 1 : 0);
