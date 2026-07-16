# The Computational Mind Lab — website

Bilingual (English/Japanese) website for [The Computational Mind Lab](https://cml.chibatech.dev)
at the Chiba Tech School of Design & Science, led by Joseph Austerweil.
Formerly the Austerweil Lab (UW-Madison / Brown).

Built with [Astro](https://astro.build), styled to the SDS visual identity
(Pentagram), deployed to GitHub Pages via GitHub Actions.

## Quick start

```bash
npm ci
npm run dev      # local dev server
npm run build    # production build
npm run check    # type + content lint
```

Requires Node ≥ 20.

## Updating the site

- **Humans & AI agents**: see [CLAUDE.md](CLAUDE.md) (conventions) and
  [CONTENT.md](CONTENT.md) (schemas). Adding content = adding one file.
- **Zero-friction path**: drop a raw note in [`_inbox/`](_inbox/README.md) —
  the weekly automation formats it, translates it, and opens a PR.
- English content is translated to Japanese automatically on every push
  (`.github/workflows/translate.yml`).

## Architecture

- `src/content/` — content collections (news, papers, people, projects), one file per item
- `src/pages/[locale]/` — every page, generated for `/en/` and `/ja/`
- `src/styles/` — SDS design tokens (no frameworks, no motion, flat & sharp)
- `public/` — PDFs, images, redirect stubs for legacy Jekyll URLs
- `scripts/` — migrations, content lint, automation entrypoints
- `TRANSITION.md` — UW-Madison → Chiba Tech transition checklist
