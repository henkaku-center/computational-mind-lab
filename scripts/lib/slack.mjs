/**
 * Slack ingestion for the weekly hook: fetch messages from the configured
 * channel since the stored cursor. Requires SLACK_BOT_TOKEN with
 * channels:history + channels:read (or groups:* for private channels),
 * and the bot invited to the channel.
 */

const SECRET_PATTERNS = [
  /xox[abp]-[\w-]+/g, // slack tokens
  /sk-ant-[\w-]+/g, // anthropic keys
  /ghp_[A-Za-z0-9]+/g, // github PATs
  /AKIA[0-9A-Z]{16}/g, // aws access keys
];

function scrub(text) {
  let out = text ?? '';
  for (const re of SECRET_PATTERNS) out = out.replace(re, '[redacted]');
  return out;
}

async function slackApi(method, params) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('SLACK_BOT_TOKEN not set');
  const url = new URL(`https://slack.com/api/${method}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!json.ok) {
    const hints = {
      invalid_auth: 'SLACK_BOT_TOKEN is invalid or revoked — reinstall the Slack app and update the secret.',
      not_in_channel: 'The bot is not in the channel — run /invite @lab-site-bot in it.',
      channel_not_found: 'Channel not found — check .automation/config.json slack.channelName and the bot scopes.',
      missing_scope: 'Token lacks a required scope — add channels:history + channels:read (groups:* if private).',
    };
    throw new Error(`slack ${method}: ${json.error}. ${hints[json.error] ?? ''}`);
  }
  return json;
}

export async function resolveChannelId(channelName) {
  let cursor;
  do {
    const res = await slackApi('conversations.list', {
      types: 'public_channel,private_channel',
      limit: 200,
      ...(cursor ? { cursor } : {}),
    });
    const hit = res.channels.find((c) => c.name === channelName.replace(/^#/, ''));
    if (hit) return hit.id;
    cursor = res.response_metadata?.next_cursor;
  } while (cursor);
  throw new Error(`slack channel not found: ${channelName}`);
}

/**
 * Fetch messages newer than `oldestTs` ("0" for full history).
 * Returns { messages: [{ts, iso, user, text}], newestTs } oldest-first,
 * capped at ~maxChars total (oldest dropped first).
 */
export async function fetchMessages(channelId, oldestTs, maxChars = 20000) {
  const all = [];
  let cursor;
  do {
    const res = await slackApi('conversations.history', {
      channel: channelId,
      oldest: oldestTs || '0',
      limit: 200,
      ...(cursor ? { cursor } : {}),
    });
    for (const m of res.messages) {
      if (m.type !== 'message' || m.subtype) continue;
      all.push({
        ts: m.ts,
        iso: new Date(Number(m.ts) * 1000).toISOString(),
        user: m.user ?? 'unknown',
        text: scrub(m.text),
      });
    }
    cursor = res.response_metadata?.next_cursor;
  } while (cursor);

  all.sort((a, b) => Number(a.ts) - Number(b.ts));
  const newestTs = all.length ? all[all.length - 1].ts : oldestTs;

  let total = 0;
  const kept = [];
  for (const m of all.slice().reverse()) {
    total += m.text.length;
    if (total > maxChars) break;
    kept.unshift(m);
  }
  if (kept.length < all.length) {
    console.error(`[slack] truncated ${all.length - kept.length} oldest messages to stay under ${maxChars} chars`);
  }
  return { messages: kept, newestTs };
}
