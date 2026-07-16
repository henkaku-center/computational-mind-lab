/**
 * Thin Anthropic SDK wrapper for the site automation.
 * - model from CLAUDE_MODEL env (default claude-sonnet-5)
 * - structured JSON output via output_config.format (json_schema)
 * - NO temperature/top_p/top_k (rejected by Sonnet 5)
 * - usage logged per call; totals to GITHUB_STEP_SUMMARY when available
 */
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';

export const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';

const client = new Anthropic({ maxRetries: 4 });

const totals = { input: 0, output: 0, calls: 0 };

/**
 * One structured-output call. Returns the parsed object.
 * @param {object} opts
 * @param {string} opts.system - system prompt
 * @param {string} opts.user - user message
 * @param {object} opts.schema - JSON schema (objects need additionalProperties:false)
 * @param {'low'|'medium'|'high'} [opts.effort='low']
 * @param {number} [opts.maxTokens=8192]
 */
export async function structuredCall({ system, user, schema, effort = 'low', maxTokens = 8192 }) {
  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    output_config: {
      effort,
      format: { type: 'json_schema', schema },
    },
    messages: [{ role: 'user', content: user }],
  };

  let response;
  if (maxTokens > 16000) {
    const stream = client.messages.stream(params);
    response = await stream.finalMessage();
  } else {
    response = await client.messages.create(params);
  }

  totals.calls += 1;
  totals.input += response.usage.input_tokens;
  totals.output += response.usage.output_tokens;
  console.error(
    `[claude] ${MODEL} call ${totals.calls}: in=${response.usage.input_tokens} out=${response.usage.output_tokens} stop=${response.stop_reason}`
  );

  if (response.stop_reason === 'refusal') {
    throw new Error('model refused the request');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('output truncated at max_tokens');
  }

  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  return JSON.parse(text);
}

/** Append usage totals to the GitHub Actions job summary (no-op locally). */
export function writeUsageSummary(label) {
  const line = `**${label}** — ${totals.calls} Claude call(s), ${totals.input} in / ${totals.output} out tokens (${MODEL})\n`;
  console.error('[claude] ' + line.trim());
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, line);
  }
}
