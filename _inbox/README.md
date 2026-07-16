# Inbox — the lowest-friction way to update the site

Drop any `.md` or `.txt` file here: a raw note, a pasted email, a talk announcement,
a paper acceptance, a student update. Plain prose is fine.

Optional frontmatter if you know it:

```markdown
---
type: news        # news | paper | people | other
date: 2026-07-16
lang: en          # en | ja
---

Gave the keynote at JPCCA annual meeting on July 14. ~200 attendees.
Slides at https://example.com/slides.
```

Every Monday, the site automation reads this folder (and Slack + publication
databases), turns notes into properly formatted bilingual content, and opens a
pull request for review. Processed notes move to `processed/` inside that PR —
if the PR is rejected, nothing is lost and the note is retried next week.

Anything a human should double-check gets flagged in the PR description.

This folder is for humans AND agents: any AI assistant with repo access can
drop a file here. Agents with only GitHub API access can instead open an issue
labeled `site-update`.
