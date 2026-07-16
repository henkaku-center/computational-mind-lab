/**
 * Monolingual Japanese naturalness pass: a FRESH headless Claude session
 * reviews machine-translated Japanese without ever seeing the English source,
 * and edits it to read naturally. (Each `claude -p` invocation is its own
 * session, so isolation from the translation context is structural.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { structuredCall } from './claude.mjs';
import { ROOT } from './content.mjs';

const SYSTEM = fs.readFileSync(path.join(ROOT, 'scripts/prompts/polish-ja-system.md'), 'utf8');

const POLISH_SCHEMA = {
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

/** Polish Japanese {title, excerpt, body}; returns same shape + notes. */
export async function polishJapanese({ title, excerpt, body }) {
  const out = await structuredCall({
    system: SYSTEM,
    user: [
      '次の日本語テキストを校正してください。',
      '',
      `タイトル: ${title}`,
      `要約: ${excerpt}`,
      '',
      '本文（Markdown）:',
      (body ?? '').trim() || '（本文なし）',
    ].join('\n'),
    schema: POLISH_SCHEMA,
  });
  return out;
}
