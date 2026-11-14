#!/usr/bin/env node
// Self-hosts the two typefaces from the original arc42 workshop page: IBM Plex Sans (text) and
// Bricolage Grotesque (headings on /training/). Both are open source (SIL Open Font License).
// Run once, from the repo root, on a machine with internet (a Codespace is fine):   npm run fonts
// Then: npm run verify. Nothing is loaded from a third party: the files are copied into site/assets/fonts/.
// To undo: node tools/install-fonts.mjs --remove
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FONTS = [
  { pkg: '@fontsource/ibm-plex-sans', id: 'ibm-plex-sans', family: 'IBM Plex Sans', weights: [400, 500, 600] },
  { pkg: '@fontsource/bricolage-grotesque', id: 'bricolage-grotesque', family: 'Bricolage Grotesque', weights: [600, 800] },
];
const OUT = path.resolve('site/assets/fonts');
const START = '/* fonts:start (written by tools/install-fonts.mjs) */';
const END = '/* fonts:end */';

function setBlock(file, block) {
  let s = fs.readFileSync(file, 'utf8');
  const re = new RegExp(`\\n?${START.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\n?`);
  s = re.test(s) ? s.replace(re, block ? `\n${START}\n${block}\n${END}\n` : '\n') : (block ? `${s.replace(/\n*$/, '\n')}\n${START}\n${block}\n${END}\n` : s);
  fs.writeFileSync(file, s);
}

if (process.argv.includes('--remove')) {
  setBlock('site/kit/shell.css', '');
  setBlock('site/training/training.css', '');
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const prod of fs.existsSync('products') ? fs.readdirSync('products') : []) fs.rmSync(path.join('products', prod, 'site', 'assets', 'fonts'), { recursive: true, force: true });
  console.log('Fonts removed. Run: npm run sync');
  process.exit(0);
}

if (!process.env.FONTS_SKIP_INSTALL) {
  const r = spawnSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', ...FONTS.map((f) => `${f.pkg}@5`)], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('\nnpm could not download the fonts. Check you are online, then run: npm run fonts'); process.exit(1); }
}

fs.mkdirSync(OUT, { recursive: true });
let total = 0;
const faces = [];
for (const f of FONTS) {
  const dir = path.resolve('node_modules', f.pkg);
  if (!fs.existsSync(path.join(dir, 'files'))) { console.error(`Missing ${dir}/files. Did the install work?`); process.exit(1); }
  for (const w of f.weights) {
    const name = `${f.id}-latin-${w}-normal.woff2`;
    const src = path.join(dir, 'files', name);
    if (!fs.existsSync(src)) { console.error(`Expected file not found: ${src}\nFiles present: ${fs.readdirSync(path.join(dir, 'files')).filter((x) => /latin-\d+-normal\.woff2$/.test(x)).join(', ')}`); process.exit(1); }
    fs.copyFileSync(src, path.join(OUT, name));
    total += fs.statSync(src).size;
    faces.push(`@font-face { font-family: "${f.family}"; font-style: normal; font-weight: ${w}; font-display: swap; src: url("/assets/fonts/${name}") format("woff2"); }`);
  }
  const lic = path.join(dir, 'LICENSE');
  if (fs.existsSync(lic)) fs.copyFileSync(lic, path.join(OUT, `LICENSE-${f.id}.txt`));
}

// the kit CSS is shared, so every product site needs the same files
for (const prod of fs.existsSync('products') ? fs.readdirSync('products') : []) {
  const dest = path.join('products', prod, 'site', 'assets', 'fonts');
  if (!fs.existsSync(path.join('products', prod, 'site'))) continue;
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.copyFileSync(path.join(OUT, f), path.join(dest, f));
}

setBlock('site/kit/shell.css', `${faces.join('\n')}\n:root { --font-sans: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }`);
setBlock('site/training/training.css', `body[data-section] main.tr { --serif: "Bricolage Grotesque", "Iowan Old Style", Georgia, serif; }\n.tr h1, .tr h2 { font-weight: 800; letter-spacing: -0.02em; }\n.twelve .num { font-style: normal; }`);
console.log(`\nInstalled ${faces.length} font files (${Math.round(total / 1000)} KB) into site/assets/fonts/.\nNow run: npm run verify`);
