# The Computational Mind Lab website

Bilingual (EN/JA) Astro site for The Computational Mind Lab — Joseph Austerweil's
research lab at the Chiba Tech School of Design & Science. Deploys to GitHub Pages
(cml.chibatech.dev) from `master` via GitHub Actions.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build to `dist/`
- `npm run check` — astro check + content lint (`scripts/check-content.mjs`)
- Local Node must be ≥ 20 (a standalone Node 22 lives at `~/.local/opt/node-22/bin` if the system Node is older)

## How to add content (one file each; see CONTENT.md for full schemas)

| Type | Where | Notes |
|---|---|---|
| News post | `src/content/news/<YYYY-MM-DD-slug>.en.md` | Create the `.en.md` ONLY — the translate workflow generates the `.ja.md` automatically |
| Paper | `src/content/papers/<citekey>.yaml` | PDF goes in `public/papers/files/`; set `pdf: /papers/files/<name>.pdf` |
| Person | `src/content/people/<name-slug>.yaml` | Photo in `public/img/people/` |
| Project | `src/content/projects/<slug>.en.md` | Same pairing rules as news |

**Unsure? Don't edit `src/content/` directly — drop a freeform note in `_inbox/`
instead** (or open a GitHub issue labeled `site-update`). The Monday automation
turns notes into properly formatted bilingual content as a reviewable PR.

## Translation model

- Paired files: `<key>.en.md` + `<key>.ja.md`, linked by `translationKey` frontmatter.
- `translated: original | auto | human` — `auto` = machine translation awaiting review.
  **If you hand-edit a `.ja.md`, set `translated: human`** so automation never overwrites it.
- `sourceHash` is machine-managed (translation staleness detection) — never edit it by hand.
- Missing translations are fine: pages fall back to the other locale with an "(English)" badge.
- Papers/people are single files with optional `*Ja` fields (`nameJa`, `titleJa`, `blurbJa`, `abstractJa`).

## Brand rules (SDS identity by Pentagram — never violate)

- **No motion**: no CSS animations, transitions, marquees, carousels. Ever.
- **Flat & sharp**: no gradients, no box-shadows, no border-radius.
- Logos/symbol only ever black or white; SDS lockup always left-aligned in the header.
- English text never in the JP typeface and vice versa (mark inline foreign phrases with `lang=`).
- Japanese text is sized 0.86× English (handled by `--lang-scale`; don't fight it).
- Licensed brand fonts (Finder/Now Gothic) drop into `public/fonts/` + `src/styles/fonts.css`
  when available; stacks already list them first.

## Automation map

- `.github/workflows/deploy.yml` — build + deploy Pages on push to master.
- `.github/workflows/translate.yml` — on content push: generates missing/stale locale
  counterparts, commits with `[skip-translate]`, re-dispatches deploy.
- `.github/workflows/weekly-update.yml` — Monday cron: processes `_inbox/` + Slack +
  publication APIs + freshness audit into ONE proposal PR (branch `automation/weekly-proposals`).
- State lives in `.automation/state.json` — never edit by hand.
- Generated files: `public/news/**/**.html` and `public/projects/**/**.html` redirect stubs
  come from `scripts/migrate-posts.mjs`; regenerate, don't hand-edit.

## Reading the site programmatically

`/llms.txt` · `/api/{papers,people,news,projects}.json` · `/papers.csl.json` (citation
managers) · `/rss.xml` + `/ja/rss.xml` · `/sitemap-index.xml`

## Transition status

`TRANSITION.md` tracks the UW-Madison → Chiba Tech transition (alumni statuses,
pending decisions). The weekly audit nags while entries have `needsReview: true`.
