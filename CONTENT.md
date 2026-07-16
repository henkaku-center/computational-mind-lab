# Content schema reference

Single source of truth for humans and automation. Every content item is one file.
Schemas are enforced by zod (`src/content.config.ts`) — a bad field fails the build.

## news — `src/content/news/<translationKey>.<locale>.md`

`translationKey` = filename minus `.en.md`/`.ja.md`, conventionally `YYYY-MM-DD-slug`.

```markdown
---
title: New paper on category generation
excerpt: One-sentence summary shown in lists and RSS.
date: 2026-07-16
locale: en                # en | ja — must match the filename suffix
translationKey: 2026-07-16-catgen-paper
translated: original      # original | auto | human
tags: [categorization, publications]
draft: false              # optional; true hides it everywhere
---

Body in Markdown. Images go in `public/news/assets/<translationKey>/` and are
referenced as `/news/assets/<translationKey>/photo.jpg`.
```

Create the `.en.md` only; automation writes the `.ja.md` twin (flagged
`translated: auto` + `sourceHash`). Japanese-native posts work in reverse.

## papers — `src/content/papers/<citekey>.yaml`

```yaml
citekey: austerweil26example        # must equal the filename
title: An Example Paper Title
authors:
  - family: Austerweil
    given: J. L.
  - family: Example
    given: A. B.
year: 2026
type: article-journal               # article-journal | paper-conference | chapter
venue: Journal of Example Studies   # journal/proceedings/book title
volume: '12'                        # optional, string
issue: '3'                          # optional, string
pages: 45-67                        # optional
publisher: MIT Press                # optional (chapters)
publisherPlace: Cambridge, MA       # optional
pdf: /papers/files/Austerweil2026example.pdf   # optional; file must exist in public/papers/files/
doi: 10.1234/example.2026           # optional
url: https://example.com            # optional external landing page
abstract: >-
  English abstract text.
abstractJa: >-                      # optional Japanese abstract
  日本語の要旨。
tags: [categorization, bayesian modeling]   # colors in src/data/tagcolors.json
featured: false
draft: false                        # automation proposes new papers with draft: true
```

Titles/venues stay in the original publication language (never translated).
New tag? Add a color to `src/data/tagcolors.json` (flat Material-style hues).

## people — `src/content/people/<name-slug>.yaml`

```yaml
name: Jane Example
nameJa: ジェーン・エグザンプル        # optional
title: Graduate Student
titleJa: 大学院生                    # optional
group: members            # pi | members | undergrads | affiliates | alumni
era: chibatech            # brown | uw-madison | chibatech
years: 2026–              # optional, display string
currentPosition: → Postdoc, MIT     # optional, alumni only
blurb: One-paragraph research description.
blurbJa: 研究内容の紹介。             # optional
image: /img/people/jane.jpg          # file in public/img/people/; defaults to default.jpg
email: jane@example.com              # optional
website: https://example.com         # optional
weight: 20                # sort order within group (low = first)
needsReview: false        # true = flagged in weekly audit (see TRANSITION.md)
```

## projects — `src/content/projects/<translationKey>.<locale>.md`

Same frontmatter as news plus:

```yaml
status: active            # active | archived
repo: https://github.com/AusterweilLab/example   # optional
weight: 10                # sort order (low = first)
```

## UI strings — `src/i18n/ui.en.json` / `ui.ja.json`

Page chrome (nav labels, headings, badges). Keep keys identical across both files;
automation fills missing keys in the counterpart.

## Review workflow for machine translations

1. Automation writes `.ja.md` with `translated: auto` (banner shows on the page).
2. A human reviews/edits the Japanese and sets `translated: human`.
3. From then on automation never overwrites it — if the English source changes,
   it proposes a refresh PR instead.
