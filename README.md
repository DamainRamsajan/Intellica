# IntellicaWeb

The Intellica web system: company home, shared kit, product-site template, tools and arc42.

- `site/` is the company home (meeting-mind.com)
- `products/*/site/` are generated starting points; copy each into its product repo
- `templates/product-site/` is the template for new product sites
- `site/kit/` is the shared kit (see below)
- `docs/arc42/` is the architecture

## Commands (Node 20+, nothing to install)

| Command | What it does |
| --- | --- |
| `npm run setup` | one-time: check Node, install Playwright and Chromium |
| `npm run verify` | gate plus real-browser check |
| `npm run gate` | tests, sync kit, check everything (no install needed) |
| `npm run dev` | home on :8080 |
| `npm run dev:verichain` / `dev:vericrypt` / `dev:erp` / `dev:omc` | product sites on :8081 to :8084 |
| `npm run scaffold` | create a product site from the template |
| `npm run legacy -- <path>` | import the old `web` folder into `site/legacy/` |

## What the kit is

Every site (home and four products) looks and behaves the same: same header, tabs, footer, colors, theme button, docs viewer. That shared code is the kit: a handful of files in `site/kit/`. Because each product lives in its own repo and deploys on its own, each repo holds its own copy. `npm run sync` copies the master kit into the product folders here, and the checker warns if a copy was edited by hand.

See `INSTALL.md`, `CHECKPOINTS.md`, `CONTENT-TODO.md`.
