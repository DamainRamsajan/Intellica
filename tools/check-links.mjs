#!/usr/bin/env node
// Link check over dist/: every internal link, image, script and stylesheet in every HTML page must point at a
// file that exists, and every #anchor must exist in its target page. Also checks the paths written in
// family.json / site.json and the hrefs written inside kit/shell.js, which build links at run time.
// Usage: node tools/check-links.mjs   (run after npm run assemble)
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
if (!fs.existsSync(DIST)) { console.error('dist/ not found. Run npm run sync first.'); process.exit(1); }
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p); } })(DIST);
const rel = (p) => '/' + path.relative(DIST, p).split(path.sep).join('/');
const set = new Set(files.map(rel));
const resolve = (u) => { // returns the file a URL path serves, or null
  let p = decodeURIComponent(u);
  if (set.has(p)) return p;
  if (p.endsWith('/') && set.has(p + 'index.html')) return p + 'index.html';
  if (!p.endsWith('/') && set.has(p + '/index.html')) return p + '/index.html';
  return null;
};
const idsCache = {};
const ids = (f) => idsCache[f] ||= new Set([...fs.readFileSync(path.join(DIST, f), 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const problems = [];
const check = (from, raw) => {
  if (!raw || /^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(raw)) return;
  const [pre, hash] = raw.split('#');
  const [pth] = pre.split('?');
  let target;
  if (!pth) target = from;
  else {
    const abs = pth.startsWith('/') ? pth : path.posix.join(path.posix.dirname(from), pth);
    target = resolve(abs);
    if (!target) { problems.push(`${from}: ${raw} does not exist`); return; }
  }
  if (hash && target.endsWith('.html') && !ids(target).has(hash)) problems.push(`${from}: ${raw} has no #${hash} on the target page`);
};

for (const f of files.map(rel).filter((f) => f.endsWith('.html') && !f.startsWith('/legacy/') && !f.includes('/deck-'))) {
  const html = fs.readFileSync(path.join(DIST, f), 'utf8').replace(/<script[^>]*type="application\/ld\+json"[\s\S]*?<\/script>/g, '');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) check(f, m[1]);
}
for (const j of ['site.json', 'family.json']) {
  const file = path.join(DIST, j);
  if (!fs.existsSync(file)) continue;
  const walkJ = (v) => { if (Array.isArray(v)) v.forEach(walkJ); else if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) { if ((k === 'path' || k === 'href') && typeof x === 'string') check('/' + j, x); else walkJ(x); } } };
  walkJ(JSON.parse(fs.readFileSync(file, 'utf8')));
}
const shell = fs.readFileSync(path.join(DIST, 'kit/shell.js'), 'utf8');
for (const m of shell.matchAll(/href:\s*'(\/[^']*)'/g)) check('/kit/shell.js', m[1]);

if (problems.length) { console.error(`LINK CHECK FAILED (${problems.length})`); for (const p of [...new Set(problems)].slice(0, 60)) console.error('  ' + p); process.exit(1); }
console.log(`links ok: ${files.filter((f) => f.endsWith('.html')).length} pages checked`);
