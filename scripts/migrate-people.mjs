#!/usr/bin/env node
/**
 * One-time migration: _data/people.json (grouped object) ->
 * src/content/people/<slug>.yaml (one file per person) + TRANSITION.md checklist.
 *
 * Transition policy (lab moved UW-Madison -> Chiba Tech in 2025):
 * all former "current" members are migrated as alumni of the uw-madison era
 * with needsReview: true. Staying current is now the exception; corrections
 * happen in one pass via TRANSITION.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import JSON5 from 'json5';
import YAML from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const data = JSON5.parse(fs.readFileSync(path.join(ROOT, '_data/people.json'), 'utf8'));
const OUT_DIR = path.join(ROOT, 'src/content/people');
fs.mkdirSync(OUT_DIR, { recursive: true });

const GROUP_MAP = {
  '1_overlord': { group: 'pi', era: 'chibatech', review: false },
  '2_grads_postdocs': { group: 'alumni', era: 'uw-madison', review: true },
  '3_undergrads': { group: 'alumni', era: 'uw-madison', review: true },
  '4_affiliates': { group: 'affiliates', era: 'uw-madison', review: true },
  '5_alumni': { group: 'alumni', era: 'uw-madison', review: true },
};

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const transitionRows = [];
let count = 0;

for (const [groupKey, groupVal] of Object.entries(data)) {
  const mapping = GROUP_MAP[groupKey];
  if (!mapping) {
    console.error(`unknown group ${groupKey} — skipping`);
    continue;
  }
  (groupVal.people ?? []).forEach((p, i) => {
    const slug = slugify(p.name);
    const isJoe = slug === 'joseph-austerweil' || slug === 'joe-austerweil';

    const entry = {
      name: p.name.trim(),
      title: isJoe
        ? 'Professor & Academic Director, School of Design & Science'
        : (p.title ?? '').trim() || 'Member',
      group: isJoe ? 'pi' : mapping.group,
      era: isJoe ? 'chibatech' : mapping.era,
    };
    if (!isJoe && mapping.group === 'alumni' && p.title) {
      // preserve what they were in the lab
      entry.years = '';
      entry.currentPosition = '';
    }
    if (p.blurb?.trim()) entry.blurb = p.blurb.trim();
    if (p.image?.trim()) entry.image = p.image.trim();
    if (isJoe) {
      entry.email = ''; // TODO: new Chiba Tech address
    } else if (p.email?.trim()) {
      entry.email = p.email.trim();
    }
    if (p.website?.trim()) {
      try {
        new URL(p.website.trim());
        entry.website = p.website.trim();
      } catch {
        console.error(`  invalid website for ${p.name}: ${p.website}`);
      }
    }
    entry.weight = (i + 1) * 10;
    entry.needsReview = isJoe ? true : mapping.review;

    // strip empty-string fields (schema treats them as absent)
    for (const k of Object.keys(entry)) {
      if (entry[k] === '') delete entry[k];
    }

    let text = new YAML.Document(entry).toString({ lineWidth: 0 });
    if (isJoe) {
      text = `# TODO-review: confirm title wording, add new Chiba Tech email, nameJa/titleJa/blurbJa\n` + text;
    }
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.yaml`), text);
    count++;

    transitionRows.push({
      slug,
      name: p.name.trim(),
      oldGroup: groupKey,
      oldTitle: (p.title ?? '').trim(),
      proposed: `${entry.group} (${entry.era})`,
      needsReview: entry.needsReview,
    });
  });
}

console.log(`wrote ${count} files to src/content/people/`);

// TRANSITION.md checklist
const lines = [
  '# Lab transition checklist — people',
  '',
  'The migration defaulted every UW-era member to `group: alumni, era: uw-madison, needsReview: true`.',
  'For each person below: correct `group` if they are still active with the lab, and fill in',
  '`years` (e.g. "2017–2021") and `currentPosition` (e.g. "→ Postdoc, MIT") in their file under',
  '`src/content/people/`. When done, set `needsReview: false`. The weekly audit nags until this',
  'list is empty; delete this file when everyone is resolved.',
  '',
  '## Also decide',
  '',
  '- [ ] Joe: new Chiba Tech email + official Japanese name/title (`nameJa`, `titleJa`) — see `joseph-austerweil.yaml`',
  '- [ ] Official Japanese lab name (placeholder in `src/i18n/ui.ja.json` is 計算マインド研究室, flagged `_comment`)',
  '- [ ] Join page: is the lab currently recruiting students at Chiba Tech? (`src/pages/[locale]/join.astro` copy)',
  '- [ ] Lab photo on People page: keep UW "Fall 2024" photo as legacy, replace, or drop?',
  '',
  '## People',
  '',
  '| File | Name | Was (UW era) | Migrated as | Years | Current position |',
  '|---|---|---|---|---|---|',
  ...transitionRows.map(
    (r) =>
      `| \`${r.slug}.yaml\` | ${r.name} | ${r.oldTitle || r.oldGroup} | ${r.proposed}${r.needsReview ? ' ⚠️' : ''} | fill in | fill in |`
  ),
  '',
];
fs.writeFileSync(path.join(ROOT, 'TRANSITION.md'), lines.join('\n'));
console.log('wrote TRANSITION.md');
