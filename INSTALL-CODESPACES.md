# Install in Codespaces

1. Download `intellica-web.zip` and open your `intellica` repo in Codespaces.
2. Upload the zip to the repo root (drag it into the Explorer).
3. In the terminal, at the repo root:

```
unzip -o intellica-web.zip
rm intellica-web.zip
cd intellica-web
npm run gate
```

`gate` should end with no errors.

4. Preview: `npm run dev`, then open the forwarded port 8080. Product previews: `npm run dev:vericrypt` (8082) and so on.
5. Import old pages (the old site is in `../web`):

```
npm run legacy
npm run gate
```

6. Commit and push:

```
cd ..
git add -A
git commit -m "Add intellica-web: new home, kit, product template, arc42"
git push
```

## Cloudflare Pages

- Project: connect the `intellica` repo.
- Root directory: `intellica-web`; build command: none; output directory: `site`.
- Check the preview URL, then attach `meeting-mind.com` (detach it from the old MeetingMind project first; keep MX/TXT records).

## Product repos

For each product: `npm run scaffold` already generated `products/<name>/site/`. Copy that folder's contents into the product repo as `site/`, set the Pages project output to `site`, and attach its subdomain.
