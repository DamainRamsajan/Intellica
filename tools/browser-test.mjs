#!/usr/bin/env node
// Real-browser check. Starts the dev servers, drives Chromium, asserts, exits non-zero on failure.
// Needs: npm run setup   (installs Playwright and Chromium)
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright is not installed. Run: npm run setup'); process.exit(2); }

const PRODUCTS = [['verichain', 8081], ['vericrypt', 8082], ['sovereign-erp', 8083], ['omc', 8084], ['agentseed', 8085]];
const servers = [['site', 8080], ...PRODUCTS.map(([id, port]) => [`products/${id}/site`, port])].map(([dir, port]) =>
  spawn('node', ['tools/serve.mjs', dir, String(port)], { stdio: 'ignore' }));
const stop = () => servers.forEach((s) => s.kill());
process.on('exit', stop);
await new Promise((r) => setTimeout(r, 800));

const HOME = 'http://localhost:8080', VC = 'http://localhost:8082';
let failed = 0;
const step = async (name, fn) => { try { await fn(); console.log('ok   ' + name); } catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + e.message); } };

const browser = await chromium.launch();
async function open(url, opts = { viewport: { width: 1280, height: 900 } }) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.problems = [];
  page.on('console', (m) => { if (m.type() === 'error') page.problems.push(m.text()); });
  page.on('pageerror', (e) => page.problems.push(e.message));
  await page.goto(url);
  await page.waitForSelector('html[data-ready="true"]', { timeout: 8000 });
  return page;
}

await step('home renders roles and products, no console errors', async () => {
  const p = await open(HOME);
  assert.equal(await p.locator('#roles-grid .card').count(), 6);
  assert.equal(await p.locator('#family-cards .card').count(), 5);
  assert.deepEqual(p.problems, []);
});
await step('home has no horizontal scroll at 390px', async () => {
  const p = await open(HOME, { viewport: { width: 390, height: 844 } });
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
});
await step('theme button switches theme', async () => {
  const p = await open(HOME);
  const before = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await p.locator('.theme-btn').click();
  assert.notEqual(await p.evaluate(() => document.documentElement.getAttribute('data-theme')), before);
});
await step('keyboard: skip link is first focus', async () => {
  const p = await open(VC);
  await p.keyboard.press('Tab');
  assert.match(await p.evaluate(() => document.activeElement.textContent.trim()), /skip to content/i);
});
await step('demo: untouched matches, tampered does not, reset restores', async () => {
  const p = await open(VC + '/demo/');
  await p.waitForSelector('.chain-row');
  await p.click('text=Verify against the sealed chain');
  assert.match(await p.locator('.demo-result').innerText(), /^Match/);
  await p.fill('#entry-1', 'Authority skipped');
  await p.click('text=Verify against the sealed chain');
  assert.match(await p.locator('.demo-result').innerText(), /^No match/);
  await p.click('text=Reset the demo');
  await p.waitForSelector('.chain-row');
  assert.equal(await p.inputValue('#entry-1'), 'Authority checked');
});
await step('docs: sidebar navigation changes the page', async () => {
  const p = await open(VC + '/docs/');
  const first = await p.locator('article.prose h2').innerText();
  await p.locator('.docs-nav a', { hasText: 'Reference' }).click();
  await p.waitForSelector('article.prose h2');
  assert.notEqual(await p.locator('article.prose h2').innerText(), first);
  assert.match(p.url(), /\?d=/);
});
await step('download, verify and support tabs render without errors', async () => {
  for (const path of ['/download/', '/verify/', '/support/']) {
    const p = await open(VC + path);
    assert.deepEqual(p.problems, [], path);
  }
});

await step('every product: all tabs and every docs page load without errors', async () => {
  for (const [id, port] of PRODUCTS) {
    const base = `http://localhost:${port}`;
    const index = await (await fetch(base + '/docs/docs.json')).json();
    for (const item of index.groups.flatMap((g) => g.items)) {
      const p = await open(`${base}/docs/?d=${encodeURIComponent(item.md)}`);
      const text = await p.locator('article.prose').innerText();
      assert.ok(text.length > 40, `${id} ${item.md} is empty`);
      assert.ok(!/could not be loaded/.test(text), `${id} ${item.md} failed to load`);
      assert.deepEqual(p.problems, [], `${id} ${item.md}`);
    }
    for (const tab of ['/', '/demo/', '/download/', '/verify/', '/support/']) {
      const p = await open(base + tab);
      assert.deepEqual(p.problems, [], `${id}${tab}`);
    }
  }
});
await step('no product page shows an unpublished placeholder in its main docs', async () => {
  for (const [id, port] of PRODUCTS) {
    const p = await open(`http://localhost:${port}/docs/`);
    assert.ok(!/Nothing is published here yet/.test(await p.locator('#docs-root').innerText()), id);
  }
});


// ---- accessibility and content checks (WCAG 2.2 AA basics) ----
const AUDIT = () => {
  const out = [];
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = (el) => { const stack = []; for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; } } let base = { r: 255, g: 255, b: 255, a: 1 }; if (!stack.length || stack[stack.length - 1].a < 1) { const c = parse(getComputedStyle(document.body).backgroundColor); if (c) base = { ...c, a: 1 }; } for (const c of stack.reverse()) base = blend(c, base); return base; };
  const main = document.querySelectorAll('main');
  if (main.length !== 1) out.push(`expected 1 <main>, found ${main.length}`);
  if (document.querySelectorAll('h1').length !== 1) out.push(`expected 1 <h1>, found ${document.querySelectorAll('h1').length}`);
  if (!document.documentElement.lang) out.push('missing lang');
  let prev = 0;
  for (const h of document.querySelectorAll('h1,h2,h3,h4')) { const l = Number(h.tagName[1]); if (prev && l > prev + 1) out.push(`heading jumps h${prev} to h${l}: ${h.textContent.trim().slice(0, 30)}`); prev = l; }
  for (const el of document.querySelectorAll('a[href],button')) { const name = (el.getAttribute('aria-label') || el.textContent || '').trim(); if (!name) out.push(`unnamed ${el.tagName.toLowerCase()} ${el.getAttribute('href') || ''}`); }
  for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) out.push('img without alt');
  const seen = new Set();
  for (const el of document.querySelectorAll('main *, header *, footer *')) {
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bg = bgOf(el); const f = blend(fg, bg);
    const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    if (ratio < need) { const k = el.tagName + el.className; if (!seen.has(k)) { seen.add(k); out.push(`low contrast ${ratio.toFixed(2)} (< ${need}) on <${el.tagName.toLowerCase()} class="${el.className}"> "${el.textContent.trim().slice(0, 24)}"`); } }
  }
  return out;
};
await step('accessibility: landmarks, headings, names, contrast, light and dark, every page', async () => {
  const bad = [];
  const sites = [['home', 8080, ['/']], ...PRODUCTS.map(([id, port]) => [id, port, ['/', '/demo/', '/download/', '/docs/', '/verify/', '/support/']])];
  for (const scheme of ['light', 'dark']) {
    for (const [id, port, paths] of sites) for (const path of paths) {
      const p = await open(`http://localhost:${port}${path}`, { viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      for (const issue of await p.evaluate(AUDIT)) bad.push(`${scheme} ${id}${path}: ${issue}`);
      await p.context().close();
    }
  }
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} issue(s)`);
});
await step('every page has its own title, description and canonical link, with no JavaScript needed', async () => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  const titles = new Set();
  for (const [id, port] of PRODUCTS) for (const path of ['/', '/demo/', '/download/', '/docs/', '/verify/', '/support/']) {
    await page.goto(`http://localhost:${port}${path}`);
    const title = await page.title();
    assert.ok(title && title !== 'Overview' && !titles.has(id + title), `${id}${path} title: ${title}`);
    titles.add(id + title);
    assert.ok((await page.locator('meta[name=description]').getAttribute('content')).length > 20, `${id}${path} description`);
    assert.match(await page.locator('link[rel=canonical]').getAttribute('href'), /^https:\/\/[a-z-]*\.?meeting-mind\.com\//, `${id}${path} canonical`);
  }
  await page.goto('http://localhost:8082/');
  assert.match(await page.locator('noscript').first().innerText(), /VeriCrypt/);
  await ctx.close();
});
await step('download tab with no binaries shows build-from-source; support shows known problems', async () => {
  for (const [id, port] of PRODUCTS) {
    let p = await open(`http://localhost:${port}/download/`);
    assert.match(await p.locator('#downloads-root').innerText(), /no packaged downloads/i, id);
    assert.ok(await p.locator('#downloads-root pre').count() >= 1, id + ' build steps');
    p = await open(`http://localhost:${port}/support/`);
    assert.ok(await p.locator('#support-faq details').count() >= 3, id + ' faq');
  }
});
await step('sitemap, robots and security.txt exist for every site', async () => {
  for (const port of [8080, ...PRODUCTS.map(([, x]) => x)]) {
    for (const f of ['/sitemap.xml', '/robots.txt', '/.well-known/security.txt']) {
      const r = await fetch(`http://localhost:${port}${f}`);
      assert.equal(r.status, 200, `${port}${f}`);
    }
  }
});

await browser.close();
stop();
console.log(failed ? `\n${failed} failed` : '\nall browser checks passed');
process.exit(failed ? 1 : 0);
