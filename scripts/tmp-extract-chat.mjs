// Print one conversation's human-authored text by uuid/name substring.
import fs from 'node:fs';
const PATH = '/tmp/claude-1000/-home-jausterw-work-AusterweilLab-github-io/9a6fb3a1-4dbb-4534-aab3-f01361478a9e/scratchpad/chats/conversations.json';
const needle = process.argv[2].toLowerCase();
const who = process.argv[3] ?? 'human';
const convos = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const c = convos.find((c) => (c.name ?? '').toLowerCase().includes(needle) || c.uuid === process.argv[2]);
if (!c) {
  console.error('not found');
  process.exit(1);
}
console.log(`### ${c.name} (${(c.created_at ?? '').slice(0, 10)})\n`);
for (const m of c.chat_messages ?? []) {
  if (who !== 'all' && m.sender !== who) continue;
  const t = typeof m.text === 'string' && m.text ? m.text : (m.content ?? []).map((x) => x.text ?? '').join('\n');
  if (t.trim()) console.log(`--- [${m.sender}]\n${t.trim().slice(0, 6000)}\n`);
}
