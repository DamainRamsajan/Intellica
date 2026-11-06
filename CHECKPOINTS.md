# Checkpoints

## Checkpoint 1
Kit 0.1.0, home, template, four scaffolds, tools, arc42 1 to 12 plus appendices. Docs sidebar bug fixed.

## Checkpoint 3 (current): dependencies and browser check
- `npm run setup` (Node check, Playwright, Chromium) and `npm run verify` (gate + real-browser check, 7 checks).
- Devcontainer and CI run both.

## Checkpoint 2: fresh `IntellicaWeb` repo
- Repo root is the project root (no `intellica-web/` subfolder); Cloudflare root directory is empty.
- Added `.devcontainer`, simplified CI, new `INSTALL.md`.
- `npm run legacy -- <path>` now takes the old web folder as an argument.
- arc42 chapters 5, 7 and appendices updated for the new layout.
- Resolved: OMC is "Operating-Margin Controller" (OFC was a typo). Sovereign ERP facts checked against the code zip (no arc42 in it).
- Uploaded: (fill in when done)
