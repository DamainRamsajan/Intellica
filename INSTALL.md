# Start IntellicaWeb from scratch

## 1. Create the repo and Codespace
1. GitHub: New repository, name `IntellicaWeb`, owner `intellica-ai-llc`, add a README (so there is a main branch).
2. Open it: Code > Codespaces > Create codespace on main.

## 2. Upload and unpack
Drag `IntellicaWeb-cp4.zip` into the Explorer panel, then in the terminal:

```
unzip -o IntellicaWeb-cp4.zip
rm IntellicaWeb-cp4.zip
npm run setup
npm run verify
```

`setup` checks Node is 20 or newer, installs Playwright (the only dependency, used for the browser check) and downloads Chromium. It takes a couple of minutes. `verify` runs the tests, the checker and a real-browser check; it must end with `all browser checks passed`.

If setup fails: run `node -v` (need 20+), then `npm install` and `npx playwright install --with-deps chromium` separately and read the error. Once the zip is committed, any new Codespace runs setup and verify by itself (`.devcontainer`).

The site itself needs no dependencies; only the browser check does. `npm run gate` alone (no install) is the quick check.

## 3. Look at it
```
npm run dev
```
Open the forwarded port 8080 (Ports tab). Product previews: `npm run dev:vericrypt` and so on.

## 4. Commit
```
git add -A
git commit -m "IntellicaWeb checkpoint 4"
git push
```

## 5. Bring the old pages (optional, do when ready)
The old sector pages and decks are in the `intellica` repo, `web/` folder. On GitHub open that repo, Code > Download ZIP, unzip it on your computer, zip just the `web` folder (or upload the folder), drag it into the Codespace Explorer, then:

```
npm run legacy -- web
npm run gate
```
They then live at `/legacy/...`.

## 6. Cloudflare Pages
1. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > pick `IntellicaWeb`.
2. Framework preset: None. Build command: leave empty. Build output directory: `site`. Root directory: leave empty.
3. Save and deploy. Open the `*.pages.dev` preview and check it.
4. Move the domain: in the old MeetingMind Pages project, Custom domains, remove `meeting-mind.com` (and `www`). Then in this project, Custom domains, Set up a domain, `meeting-mind.com`.
5. Do not touch MX or TXT DNS records (email).
6. Product subdomains later: each product repo gets its own Pages project with output `site`, then add `verichain.meeting-mind.com` and so on in that project's Custom domains.

## 7. Product repos
All five products have real docs now. Products: verichain, vericrypt, sovereign-erp, omc, agentseed.
`products/<name>/site/` is the starting point. In each product repo, copy its contents into a `site/` folder (kit included), then do step 6 for that repo.
