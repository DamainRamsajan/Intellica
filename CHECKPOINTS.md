# Checkpoints

## Checkpoint 5 (current, not yet uploaded): discoverable, accessible, useful when empty
- Every page now carries its own title, description, canonical link and link-preview tags, baked in without JavaScript (`tools/prerender.mjs`, run by `npm run sync`). Added sitemap.xml, robots.txt and security.txt per site.
- Download tab: when there are no binaries it shows build-from-source commands with a copy button instead of an empty table.
- Support tab: known problems (FAQ) per product, from each repo's own troubleshooting notes, plus a security note.
- Markdown headings are demoted so each page has exactly one h1.
- Print stylesheet.
- Home copy no longer implies the demos run in-browser today.
- Browser check now has 13 checks, including an accessibility audit (landmarks, heading order, names, WCAG AA contrast in light and dark on every page of every site) and a no-JavaScript metadata check.
- Kit 0.2.0.

## Checkpoint 4 (superseded by 5, not uploaded): five products, real content
- Fifth product: AgentSeed (ASL toolchain).
- Every product site now has a real user manual, installation guide, reference, architecture overview and Verify page, written from that product's own repository (README, arc42, install guides, CLAIMS.md). No more "Nothing is published here yet" in the docs.
- Status line per product, taken from each repo's own status.
- VeriCrypt content follows its `CLAIMS.md` registry (see CONTENT-TODO).
- Browser check now loads every tab and docs page of all five products (9 checks).
- Verified commands: vcv verify (VeriChain), vericrypt analyze/verify (VeriCrypt), seed check/run/build (AgentSeed), cargo test (Sovereign ERP), python scripts/demo.py (OMC).

## Checkpoint 3 (uploaded)
Dependencies and browser check: `npm run setup`, `npm run verify`, devcontainer and CI.

## Checkpoint 2
Fresh `IntellicaWeb` repo layout; `npm run legacy -- <path>`.

## Checkpoint 1
Kit 0.1.0, home, template, scaffolds, tools, arc42 1 to 12. Docs sidebar fix.
