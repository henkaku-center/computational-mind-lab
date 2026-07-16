/**
 * Claude wrapper for the site automation — SUBSCRIPTION EDITION.
 *
 * Calls the Claude Code CLI in headless print mode (`claude -p`) instead of
 * the pay-per-token API, so usage bills against the Claude Pro/Max
 * subscription. Auth resolution:
 *   - locally: your normal `claude` login
 *   - CI: CLAUDE_CODE_OAUTH_TOKEN secret (generate once with `claude setup-token`)
 *
 * Structured output is enforced by instruction + local validation + one retry
 * (the raw json_schema API feature is API-key-only, so we verify ourselves).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

export const MODEL = process.env.CLAUDE_MODEL || 'sonnet';

const totals = { calls: 0, ms: 0 };

function extractJson(text) {
  // Try several extractions and return the first that parses. Order matters:
  // the outermost brace span is tried FIRST because content may itself contain
  // ``` fences (e.g. a page documenting code) — a non-greedy fence match would
  // stop at the body's first inner fence and truncate the JSON.
  const candidates = [];

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) candidates.push(text.slice(start, end + 1));

  const fencedAll = text.match(/```(?:json)?\s*([\s\S]*)```/); // greedy: outermost pair
  if (fencedAll) candidates.push(fencedAll[1]);

  const fencedFirst = text.match(/```(?:json)?\s*([\s\S]*?)```/); // non-greedy
  if (fencedFirst) candidates.push(fencedFirst[1]);

  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      /* try next */
    }
  }
  throw new Error('no parseable JSON object in output');
}

function validate(obj, schema) {
  for (const key of schema.required ?? []) {
    if (!(key in obj)) throw new Error(`missing required key "${key}"`);
  }
  return obj;
}

async function invokeClaude(system, user) {
  const args = ['-p', '--output-format', 'json', '--model', MODEL, '--append-system-prompt', system];
  const stdout = execFileSync('claude', args, {
    input: user,
    maxBuffer: 32 * 1024 * 1024,
    timeout: 600_000,
    encoding: 'utf8',
    env: { ...process.env },
  });
  const envelope = JSON.parse(stdout);
  if (envelope.is_error) throw new Error(`claude CLI error: ${envelope.result ?? envelope.subtype}`);
  totals.calls += 1;
  totals.ms += envelope.duration_ms ?? 0;
  console.error(
    `[claude] ${MODEL} call ${totals.calls}: ${envelope.duration_ms}ms, ${String(envelope.result ?? '').length} chars`
  );
  return envelope.result ?? '';
}

/**
 * One structured-output call. Returns the parsed, required-keys-validated object.
 * `effort`/`maxTokens` kept for interface compatibility (headless CLI manages
 * its own budgets); effort is passed as a style hint only.
 */
export async function structuredCall({ system, user, schema }) {
  const sys = [
    system,
    '',
    'OUTPUT CONTRACT: Respond with ONLY a single JSON object (no prose, no markdown fences)',
    'that validates against this JSON Schema:',
    JSON.stringify(schema),
    'Do not use any tools. Do not read or write any files.',
  ].join('\n');

  let text = await invokeClaude(sys, user);
  try {
    return validate(extractJson(text), schema);
  } catch (err) {
    console.error(`[claude] output invalid (${err.message}), retrying once`);
    text = await invokeClaude(
      sys,
      `${user}\n\nYour previous output was invalid (${err.message}). Return ONLY the corrected JSON object.`
    );
    return validate(extractJson(text), schema);
  }
}

/** Append usage totals to the GitHub Actions job summary (no-op locally). */
export function writeUsageSummary(label) {
  const line = `**${label}** — ${totals.calls} Claude Code call(s), ${(totals.ms / 1000).toFixed(1)}s total (${MODEL}, subscription)\n`;
  console.error('[claude] ' + line.trim());
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, line);
  }
}
