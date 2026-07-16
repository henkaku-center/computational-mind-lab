# Site automation — operations

Two GitHub Actions workflows call Claude (model from the `CLAUDE_MODEL` Actions
variable, default `claude-sonnet-5`):

| Workflow | Trigger | What it does |
|---|---|---|
| `translate.yml` | push to master touching content | generates/refreshes locale counterparts, commits directly (`[skip-translate]`), re-dispatches deploy |
| `weekly-update.yml` | Mondays 09:00 JST + manual | inbox + Slack + publication APIs + audit → ONE proposal PR on `automation/weekly-proposals` |

## Secrets & variables (Settings → Secrets and variables → Actions)

- Secret `ANTHROPIC_API_KEY` — console.anthropic.com; set a ~$10/month workspace
  spend limit there as the hard cost backstop (expected usage ≈ $1–2/month).
- Secret `SLACK_BOT_TOKEN` — Slack app with `channels:history` + `channels:read`
  (or `groups:*` if the channel is private), installed in the JPCCA workspace and
  invited to `#accounthub_joe` (`/invite @lab-site-bot`).
- Variable `CLAUDE_MODEL` (optional) — model override.
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
