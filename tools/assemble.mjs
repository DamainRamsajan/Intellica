#!/usr/bin/env node
// Builds dist/: the one folder that is deployed. Everything lives on one domain:
//   /                  the Intellica home site (site/)
//   /verichain/ ...    each system (products/<id>/site/), under its own folder
// The systems share the home site's kit (/kit/), fonts and family.json. Links inside a system that point at
// the system's own pages are rewritten to include its folder, and a <meta name="site-base"> tells the kit
// where the system lives. Manifests are written last, from the files exactly as they are served.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT = path.resolve('dist');
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.xml', '.txt', '.md', '.svg', '.webmanifest']);
// paths a system owns (everything else, such as /kit/, /training/ and /family.json, belongs to the home site)
const OWN = ['docs', 'assets', 'verify', 'download', 'demo', 'support', 'verify-site', 'legacy', 'site.json', 'docs.json', 'downloads.json', 'site-manifest.json', 'sitemap.xml', 'robots.txt', 'index.html'];
const SKIP_IN_PRODUCT = new Set(['kit', 'family.json', '_headers', '_redirects', '404.html', '.well-known', 'site-manifest.json']);
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function copyDir(src, dest, skip = new Set(), rewrite = null, top = true) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (top && skip.has(e.name)) continue;
    if (e.name === '.DS_Store' || e.name === 'node_modules') continue;
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    if (e.isDirectory()) { copyDir(s, d, skip, rewrite, false); continue; }
    if (rewrite && TEXT.has(path.extname(e.name))) fs.writeFileSync(d, rewrite(fs.readFileSync(s, 'utf8'), e.name));
    else fs.copyFileSync(s, d);
  }
}

function rewriter(id) {
  const names = OWN.map((n) => n.replace(/[.]/g, '\\.')).join('|');
  // a quote, ( or = followed by /<own path>, not /assets/fonts (shared)
  const re = new RegExp(`(["'(=])/(?!assets/fonts/)(${names})(?=[/"'?#)\\s])`, 'g');
  return (text, name) => {
    let out = text.replace(re, `$1/${id}/$2`);
    if (name.endsWith('.html')) {
      out = out.replace(/<meta charset="utf-8">/i, `<meta charset="utf-8">\n  <meta name="site-base" content="/${id}">`);
    }
    return out;
  };
}

// _headers: the home rules as they are, plus each system's path-specific rules under its folder
function prefixHeaders(id, text) {
  const lines = text.split('\n'); const out = []; let skipBlock = false;
  for (const raw of lines) {
    if (raw.trim() === '' || raw.trim().startsWith('#')) { continue; }
    if (!/^\s/.test(raw)) {
      const pat = raw.trim();
      skipBlock = pat === '/*' || pat.startsWith('/kit');
      if (!skipBlock) out.push('', `/${id}${pat === '/' ? '/' : pat}`);
      continue;
    }
    if (!skipBlock) out.push(raw);
  }
  return out.join('\n');
}

function manifest(dir, exclude = []) {
  const files = {};
  const visit = (d, relBase) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      const rel = relBase + '/' + e.name;
      if (e.isDirectory()) { if (relBase === '' && exclude.includes(e.name)) continue; if (!e.name.startsWith('deck-')) visit(p, rel); continue; }
      if (['_headers', '_redirects', 'site-manifest.json', '.DS_Store'].includes(e.name)) continue;
      files[rel] = sha(fs.readFileSync(p));
    }
  };
  visit(dir, '');
  const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1)));
  const root = sha(Buffer.from(Object.entries(sorted).map(([f, h]) => `${f}\t${h}\n`).join('')));
  const kit = fs.existsSync(path.join(dir, 'kit', 'VERSION')) ? fs.readFileSync(path.join(dir, 'kit', 'VERSION'), 'utf8').trim() : '';
  fs.writeFileSync(path.join(dir, 'site-manifest.json'), JSON.stringify({ format: 1, kit, root, files: sorted }) + '\n');
  return Object.keys(sorted).length;
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(path.resolve('site'), OUT);

const ids = fs.existsSync('products') ? fs.readdirSync('products').sort().filter((p) => fs.existsSync(path.join('products', p, 'site'))) : [];
let headers = fs.readFileSync(path.join(OUT, '_headers'), 'utf8').trimEnd();
for (const id of ids) {
  const src = path.resolve('products', id, 'site');
  copyDir(src, path.join(OUT, id), SKIP_IN_PRODUCT, rewriter(id));
  const h = path.join(src, '_headers');
  if (fs.existsSync(h)) headers += '\n' + prefixHeaders(id, fs.readFileSync(h, 'utf8'));
}
fs.writeFileSync(path.join(OUT, '_headers'), headers.trimEnd() + '\n');
// one robots.txt for the domain, pointing at every system's sitemap
const robots = path.join(OUT, 'robots.txt');
if (fs.existsSync(robots)) fs.appendFileSync(robots, ids.map((id) => `Sitemap: https://meeting-mind.com/${id}/sitemap.xml\n`).join(''));

console.log(`assembled dist/: home + ${ids.length} systems`);
console.log(`manifest dist (home): ${manifest(OUT, ids)} files`);
for (const id of ids) console.log(`manifest dist/${id}: ${manifest(path.join(OUT, id))} files`);
