#!/usr/bin/env node
/**
 * Translate the people collection's display fields into Japanese:
 *   title -> titleJa, blurb -> blurbJa   (two-stage: translate + blind polish)
 *   name  -> nameJa                       ONLY from the explicit map below
 *
 * Name policy (per lab direction): do NOT machine-transliterate personal names.
 * Only names in NAME_JA are set; everyone else keeps their English name on the
 * JA site. currentPosition stays in English (institutions/proper nouns).
 *
 * Idempotent: a per-field sourceHash is stored; unchanged fields are skipped.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';
import { structuredCall } from './lib/claude.mjs';
import { polishJapanese } from './lib/polish.mjs';
import { ROOT } from './lib/content.mjs';

const DIR = path.join(ROOT, 'src/content/people');

// Confirmed Japanese renderings only. Family-name-first per JP convention.
const NAME_JA = {
  'joseph-austerweil': 'オウステウェイル ジョセフ',
};

const FIELD_SCHEMA = {
  type: 'object',
  properties: { text: { type: 'string' }, notes: { type: 'string' } },
  required: ['text', 'notes'],
  additionalProperties: false,
};

const SYSTEM =
  'You translate short professional text for an academic research-lab website from English to Japanese. ' +
  'Register: plain, neutral, professional (だ・である is fine for bios; titles are noun phrases). ' +
  'Keep institution names, degree names, paper/venue names, and URLs in their original form. ' +
  'For a job title, produce a natural Japanese title. Return JSON per the schema; put uncertainty in notes.';

function hash(s) {
  return crypto.createHash('sha256').update(s ?? '').digest('hex').slice(0, 16);
}

async function translateField(text, kind) {
  const out = await structuredCall({
    system: SYSTEM,
    user: `Translate this ${kind} to Japanese:\n\n${text}`,
    schema: FIELD_SCHEMA,
  });
  // blind naturalness pass on the Japanese
  const polished = await polishJapanese({ title: '', excerpt: '', body: out.text });
  return (polished.body || out.text).trim();
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.yaml'));
let changed = 0;

for (const f of files) {
  const slug = f.replace('.yaml', '');
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const lead = raw.match(/^(#[^\n]*\n)+/)?.[0] ?? ''; // preserve leading TODO comments
  const data = YAML.parse(raw);
  let touched = false;

  const wantName = NAME_JA[slug];
  if (wantName && data.nameJa !== wantName) {
    data.nameJa = wantName;
    touched = true;
  }

  const jobs = [
    ['title', 'titleJa', 'job title'],
    ['blurb', 'blurbJa', 'bio'],
  ];
  for (const [src, dst, kind] of jobs) {
    if (!data[src]) continue;
    const hkey = `${dst}Hash`;
    if (data[hkey] === hash(data[src])) continue; // in sync
    console.error(`  ${slug}: translating ${src}`);
    data[dst] = await translateField(data[src], kind);
    data[hkey] = hash(data[src]);
    touched = true;
  }

  if (touched) {
    fs.writeFileSync(path.join(DIR, f), lead + new YAML.Document(data).toString({ lineWidth: 0 }));
    changed++;
    console.log(`updated ${slug}`);
  }
}
console.log(`\npeople translated: ${changed}/${files.length}`);
