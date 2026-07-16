export function GET() {
  const body = `# The Computational Mind Lab

> Research lab of Joseph Austerweil (Professor & Academic Director) at the
> School of Design & Science, Chiba Institute of Technology, Japan.
> Computational cognitive science: how minds build models of the world.
> Formerly the Austerweil Lab at UW-Madison and Brown University.

The site is bilingual: English under /en/, Japanese under /ja/.

## Machine-readable data

- [Publications (site JSON)](https://cml.chibatech.dev/api/papers.json)
- [Publications (strict CSL-JSON for citation managers)](https://cml.chibatech.dev/papers.csl.json)
- [People](https://cml.chibatech.dev/api/people.json)
- [News](https://cml.chibatech.dev/api/news.json)
- [Projects](https://cml.chibatech.dev/api/projects.json)
- [News RSS (English)](https://cml.chibatech.dev/rss.xml)
- [News RSS (Japanese)](https://cml.chibatech.dev/ja/rss.xml)
- [Sitemap](https://cml.chibatech.dev/sitemap-index.xml)

## Key pages

- [Home](https://cml.chibatech.dev/en/)
- [People](https://cml.chibatech.dev/en/people/)
- [Publications](https://cml.chibatech.dev/en/publications/)
- [News](https://cml.chibatech.dev/en/news/)
- [Projects](https://cml.chibatech.dev/en/projects/)
- [Join](https://cml.chibatech.dev/en/join/)
- [Contact](https://cml.chibatech.dev/en/contact/)

## Contributing updates

The site is built from https://github.com/AusterweilLab/AusterweilLab.github.io
(Astro content collections; see CLAUDE.md and CONTENT.md in the repo).
AI agents with repo access can drop raw notes in _inbox/ or open a GitHub
issue labeled "site-update"; a weekly automation turns them into content PRs.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
