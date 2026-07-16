# Site automation — operations

Two GitHub Actions workflows call Claude **via the Claude Code CLI in headless
mode (`claude -p`), billed against the Claude Pro/Max subscription** — no
pay-per-token API key. Model from the `CLAUDE_MODEL` Actions variable
(default `sonnet`):

| Workflow | Trigger | What it does |
|---|---|---|
| `translate.yml` | push to master touching content | generates/refreshes locale counterparts, commits directly (`[skip-translate]`), re-dispatches deploy |
| `weekly-update.yml` | Mondays 09:00 JST + manual | inbox + Slack + publication APIs + audit → ONE proposal PR on `automation/weekly-proposals` |

## Secrets & variables (Settings → Secrets and variables → Actions)

- Secret `CLAUDE_CODE_OAUTH_TOKEN` — subscription auth for CI. Generate once on
  your machine with `claude setup-token` (requires your Pro/Max login; token is
  long-lived), then `gh secret set CLAUDE_CODE_OAUTH_TOKEN`. Re-run setup-token
  and update the secret if it ever expires or is revoked.
  Note: automation usage shares your personal subscription rate limits.
- Secret `SLACK_BOT_TOKEN` — **not needed yet**: Slack ingestion is disabled in
  `config.json` (`slack.enabled: false`) pending workspace-admin coordination.
  When ready: Slack app with `channels:history` + `channels:read` (or `groups:*`
  if private), install, `/invite` the bot to `#accounthub_joe`, add the secret,
  flip `enabled: true`.
- Variable `CLAUDE_MODEL` (optional) — model override (default `sonnet`).
- Repo settings: Actions → General → Workflow permissions: **Read and write** +
  **Allow GitHub Actions to create and approve pull requests**.

## Config & state

- `config.json` — Slack channel, publication author IDs (fill once, see comment).
- `state.json` — Slack cursor, seen DOIs, last run. Updated only inside the weekly
  PR (merge = acknowledge; close = automatic retry next week). Never edit by hand.

## Dry runs

```bash
node scripts/translate.mjs --dry-run --full-scan        # plan only, no API calls
gh workflow run translate.yml -f dry_run=true -f full_scan=true
node scripts/weekly.mjs --dry-run --only=audit           # audit needs no secrets
gh workflow run weekly-update.yml -f dry_run=true -f only=slack
```

## Backfill (first real run)

```bash
gh workflow run weekly-update.yml -f dry_run=false -f window=2020-01-01
```

Pulls publications since 2020 and full Slack history into one catch-up PR.

## Disable

Comment out the `schedule:` block in `weekly-update.yml`, or disable the workflow
in the Actions tab. Translation can be paused by adding `[skip-translate]` to
commit messages.
