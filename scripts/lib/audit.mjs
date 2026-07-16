/**
 * Deterministic freshness audit for the weekly hook: missing translations,
 * stale sourceHashes, broken internal links/assets, needsReview people,
 * dead external links in content (reported, not fetched-fixed).
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { ROOT, readEntry, sourceHash, parsePairName, counterpartPath, listPairedFiles } from './content.mjs';

export function runAudit() {
  const findings = [];

  // 1. translation coverage + stale hashes
  const seen = new Set();
  for (const rel of listPairedFiles()) {
    const parsed = parsePairName(rel);
    if (!parsed) continue;
    const full = path.join(ROOT, rel);
    const entry = readEntry(full);
    const cp = counterpartPath(full);
    if (!fs.existsSync(cp) && !seen.has(parsed.key)) {
      seen.add(parsed.key);
      findings.push({ kind: 'missing-translation', detail: `${rel} has no counterpart` });
    }
    if (entry.data.translated === 'auto' && entry.data.sourceHash && fs.existsSync(cp)) {
      const src = readEntry(cp);
      if (sourceHash(src.data, src.body) !== entry.data.sourceHash) {
        findings.push({ kind: 'stale-translation', detail: `${rel} sourceHash no longer matches its source` });
      }
    }
  }

  // 2. internal asset references in content bodies
  for (const rel of listPairedFiles()) {
    const entry = readEntry(path.join(ROOT, rel));
    for (const m of entry.body.matchAll(/!\[[^\]]*\]\(([^)]+)\)|src=["']([^"']+)["']|href=["'](\/[^"']+)["']|\]\((\/[^)]+)\)/g)) {
      const ref = (m[1] ?? m[2] ?? m[3] ?? m[4] ?? '').split(/[?#]/)[0];
      if (!ref.startsWith('/')) continue;
      const asFile = path.join(ROOT, 'public', ref);
      const asRoute = /^\/(en|ja)\//.test(ref);
      if (!asRoute && !fs.existsSync(asFile)) {
        findings.push({ kind: 'broken-internal-ref', detail: `${rel} references missing ${ref}` });
      }
    }
  }

  // 3. people needing review
  const peopleDir = path.join(ROOT, 'src/content/people');
  const needsReview = fs
    .readdirSync(peopleDir)
    .filter((f) => f.endsWith('.yaml'))
    .filter((f) => YAML.parse(fs.readFileSync(path.join(peopleDir, f), 'utf8')).needsReview);
  if (needsReview.length) {
    findings.push({
      kind: 'people-review',
      detail: `${needsReview.length} people entries still have needsReview: true (see TRANSITION.md): ${needsReview.slice(0, 5).join(', ')}${needsReview.length > 5 ? '…' : ''}`,
    });
  }

  // 4. external http(s) links (existence only; liveness checked manually/PR review)
  const external = new Set();
  for (const rel of listPairedFiles()) {
    const entry = readEntry(path.join(ROOT, rel));
    for (const m of entry.body.matchAll(/https?:\/\/[^\s)"'<>\]]+/g)) external.add(m[0]);
  }
  findings.push({ kind: 'info', detail: `${external.size} unique external links in content (liveness not auto-checked)` });

  return findings;
}
