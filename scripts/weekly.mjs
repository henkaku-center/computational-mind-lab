#!/usr/bin/env node
/**
 * Weekly proposal pipeline: deterministic collect -> ONE Claude drafting call
 * -> deterministic apply. Stages changes in the working tree; CI turns them
 * into a single PR (peter-evans/create-pull-request). Never commits.
 *
 * Usage:
 *   node scripts/weekly.mjs [--dry-run] [--only=inbox,slack,papers,audit]
 *                           [--window=YYYY-MM-DD]   # backfill: pubs since date, slack cursor 0
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { structuredCall, writeUsageSummary } from './lib/claude.mjs';
import { ROOT, writeEntry, sourceHash, readEntry } from './lib/content.mjs';
import { resolveChannelId, fetchMessages } from './lib/slack.mjs';
import { fetchCandidates, dedupe } from './lib/pubs.mjs';
import { runAudit } from './lib/audit.mjs';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const onlyArg = args.find((a) => a.startsWith('--only='))?.slice(7);
const ONLY = onlyArg ? new Set(onlyArg.split(',')) : null;
const windowArg = args.find((a) => a.startsWith('--window='))?.slice(9);
const on = (src) => !ONLY || ONLY.has(src);

const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, '.automation/config.json'), 'utf8'));
const STATE_PATH = path.join(ROOT, '.automation/state.json');
const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
const SYSTEM = fs.readFileSync(path.join(ROOT, 'scripts/prompts/weekly-draft-system.md'), 'utf8');
const CONTENT_MD = fs.readFileSync(path.join(ROOT, 'CONTENT.md'), 'utf8');

const MAX_INBOX_NOTES = 20;

// ---------- Stage 1: collect ----------
const material = { inbox: [], issues: [], slack: [], pubs: [], audit: [] };
const stateUpdates = {};

if (on('inbox')) {
  const inboxDir = path.join(ROOT, '_inbox');
  const notes = fs
    .readdirSync(inboxDir)
    .filter((f) => /\.(md|txt)$/i.test(f) && f !== 'README.md')
    .slice(0, MAX_INBOX_NOTES);
  for (const f of notes) {
    material.inbox.push({ file: f, text: fs.readFileSync(path.join(inboxDir, f), 'utf8') });
  }
  // GitHub issues labeled site-update (best-effort; needs GH_TOKEN + gh cli)
  try {
    const raw = execSync('gh issue list --label site-update --state open --json number,title,body --limit 20', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    material.issues = JSON.parse(raw);
  } catch {
    console.error('[inbox] gh issue list unavailable (no token or gh) — skipping issue inbox');
  }
}

if (on('slack')) {
  try {
    const channelId = state.slack?.channelId || (await resolveChannelId(CONFIG.slack.channelName));
    const oldest = windowArg ? '0' : state.slack?.lastTs || '0';
    const { messages, newestTs } = await fetchMessages(channelId, oldest, CONFIG.slack.maxChars ?? 20000);
    material.slack = messages;
    stateUpdates.slack = { channelId, lastTs: newestTs };
  } catch (err) {
    console.error(`[slack] ${err.message} — continuing without Slack`);
  }
}

if (on('papers')) {
  const since =
    windowArg ??
    (state.lastRun ? state.lastRun.slice(0, 10) : new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10));
  const candidates = await fetchCandidates(CONFIG.papers ?? {}, since);
  material.pubs = dedupe(candidates, state);
  console.error(`[pubs] ${candidates.length} candidates, ${material.pubs.length} after dedupe (window since ${since})`);
}

if (on('audit')) {
  material.audit = runAudit();
}

const haveMaterial =
  material.inbox.length || material.issues.length || material.slack.length || material.pubs.length;

// ---------- Stage 2: one drafting call ----------
const PROPOSAL_SCHEMA = {
  type: 'object',
  properties: {
    newsPosts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          translationKey: { type: 'string' },
          date: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          en: {
            type: 'object',
            properties: { title: { type: 'string' }, excerpt: { type: 'string' }, body: { type: 'string' } },
            required: ['title', 'excerpt', 'body'],
            additionalProperties: false,
          },
          ja: {
            type: 'object',
            properties: { title: { type: 'string' }, excerpt: { type: 'string' }, body: { type: 'string' } },
            required: ['title', 'excerpt', 'body'],
            additionalProperties: false,
          },
          sources: { type: 'array', items: { type: 'string' } },
        },
        required: ['translationKey', 'date', 'tags', 'en', 'ja', 'sources'],
        additionalProperties: false,
      },
    },
    paperEntries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          citekey: { type: 'string' },
          yaml: { type: 'string', description: 'complete YAML file content following the papers schema, draft: true' },
          sources: { type: 'array', items: { type: 'string' } },
        },
        required: ['citekey', 'yaml', 'sources'],
        additionalProperties: false,
      },
    },
    prSummary: { type: 'string' },
  },
  required: ['newsPosts', 'paperEntries', 'prSummary'],
  additionalProperties: false,
};

let proposals = { newsPosts: [], paperEntries: [], prSummary: '' };
if (haveMaterial) {
  const user = [
    '## Content schema reference (excerpts)',
    CONTENT_MD.slice(0, 6000),
    '',
    '## Inbox notes',
    ...material.inbox.map((n) => `### ${n.file}\n${n.text}`),
    '',
    '## GitHub issues labeled site-update',
    ...material.issues.map((i) => `### #${i.number} ${i.title}\n${i.body ?? ''}`),
    '',
    `## Slack messages from ${CONFIG.slack?.channelName ?? 'n/a'} (personal activity notes)`,
    ...material.slack.map((m) => `[${m.iso}] ${m.text}`),
    '',
    '## New publication candidates (deduped, from OpenAlex/S2/arXiv)',
    JSON.stringify(material.pubs, null, 2),
    '',
    '## Audit findings (context only — do not draft posts from these)',
    ...material.audit.map((f) => `- ${f.kind}: ${f.detail}`),
    '',
    'Draft the proposals now.',
  ].join('\n');

  proposals = await structuredCall({
    system: SYSTEM,
    user,
    schema: PROPOSAL_SCHEMA,
    effort: 'high',
    maxTokens: 32000,
  });
} else {
  console.error('no new material this run');
}

// ---------- Stage 3: deterministic apply ----------
const applied = [];

function validKey(k) {
  return /^[a-z0-9][a-z0-9-]+$/.test(k);
}

for (const post of proposals.newsPosts ?? []) {
  if (!validKey(post.translationKey) || !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
    applied.push(`REJECTED news (bad key/date): ${post.translationKey}`);
    continue;
  }
  const base = { date: post.date, translationKey: post.translationKey, tags: post.tags ?? [] };
  const enData = { title: post.en.title, excerpt: post.en.excerpt, ...base, locale: 'en', translated: 'original' };
  if (!DRY_RUN) {
    writeEntry(path.join(ROOT, `src/content/news/${post.translationKey}.en.md`), enData, post.en.body);
    const hash = sourceHash(enData, post.en.body);
    writeEntry(
      path.join(ROOT, `src/content/news/${post.translationKey}.ja.md`),
      { title: post.ja.title, excerpt: post.ja.excerpt, ...base, locale: 'ja', translated: 'auto', sourceHash: hash },
      post.ja.body
    );
  }
  applied.push(`news: ${post.translationKey} (${post.sources.join(', ')})`);
}

for (const paper of proposals.paperEntries ?? []) {
  if (!validKey(paper.citekey)) {
    applied.push(`REJECTED paper (bad citekey): ${paper.citekey}`);
    continue;
  }
  if (!/draft: true/.test(paper.yaml)) {
    applied.push(`REJECTED paper (missing draft: true): ${paper.citekey}`);
    continue;
  }
  if (!DRY_RUN) {
    fs.writeFileSync(path.join(ROOT, `src/content/papers/${paper.citekey}.yaml`), paper.yaml.trim() + '\n');
  }
  applied.push(`paper: ${paper.citekey} (${paper.sources.join(', ')})`);
}

// move processed inbox notes (inside the PR: rejected PR -> notes untouched on master)
if (!DRY_RUN) {
  for (const n of material.inbox) {
    const stamp = new Date().toISOString().slice(0, 10);
    fs.renameSync(path.join(ROOT, '_inbox', n.file), path.join(ROOT, '_inbox/processed', `${stamp}-${n.file}`));
  }
  // state updates ride inside the PR too
  const newState = {
    ...state,
    ...(!ONLY || ONLY.has('slack') ? { slack: { ...state.slack, ...stateUpdates.slack } } : {}),
    lastRun: new Date().toISOString(),
    papers: {
      seenDois: [...new Set([...(state.papers?.seenDois ?? []), ...material.pubs.map((p) => p.doi).filter(Boolean)])],
      seenTitleKeys: [
        ...new Set([...(state.papers?.seenTitleKeys ?? []), ...material.pubs.map((p) => p.titleKey).filter(Boolean)]),
      ],
    },
  };
  fs.writeFileSync(STATE_PATH, JSON.stringify(newState, null, 2) + '\n');
}

// PR body
const prBody = [
  `## Weekly proposals — ${new Date().toISOString().slice(0, 10)}`,
  '',
  proposals.prSummary || '_No new content proposals this week._',
  '',
  '### Applied to this PR',
  ...applied.map((a) => `- [ ] ${a}`),
  '',
  '### 🧹 Freshness audit',
  ...material.audit.map((f) => `- ${f.kind === 'info' ? 'ℹ️' : '⚠️'} ${f.detail}`),
  '',
  material.issues.length ? `Refs ${material.issues.map((i) => `#${i.number}`).join(', ')}` : '',
].join('\n');

if (!DRY_RUN) {
  fs.writeFileSync(path.join(ROOT, '.automation/pr-body.md'), prBody);
}
console.log(prBody);
writeUsageSummary('weekly');
