# Attaching cml.chibatech.dev

The site launches at https://henkaku-center.github.io/ without a custom domain,
because `cml.chibatech.dev` DNS currently points at `henkaku-center.github.io`
(a different GitHub org) and cannot be served from this repo until repointed.

## To attach the domain (once)

1. **DNS** (chibatech.dev Cloudflare admin): repoint the `cml` CNAME record from
   `henkaku-center.github.io` to `henkaku-center.github.io`. Confirm the Henkaku
   org has not "verified" the domain org-wide (Settings → Pages → domain
   verification) — if it has, it must be released there first, or GitHub will
   block this repo from claiming it.
2. Wait for propagation (`dig +short cml.chibatech.dev` should show
   `henkaku-center.github.io`).
3. Restore the CNAME file: `git mv public/CNAME.pending public/CNAME`, commit,
   push. The deploy re-runs and GitHub provisions the HTTPS cert automatically.
4. Repo → Settings → Pages: confirm the custom domain shows `cml.chibatech.dev`
   with "DNS check successful" and enable "Enforce HTTPS".
