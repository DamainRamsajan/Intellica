#!/usr/bin/env node
// Real-browser check. Starts the dev servers, drives Chromium, asserts, exits non-zero on failure.
// Needs: npm run setup   (installs Playwright and Chromium)
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright is not installed. Run: npm run setup'); process.exit(2); }

const servers = [['site', 8080], ['products/vericrypt/site', 8082]].map(([dir, port]) =>
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
  assert.equal(await p.locator('#roles-grid .card').count(), 5);
  assert.equal(await p.locator('#family-cards .card').count(), 4);
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
  const first = await p.locator('article.prose h1').innerText();
  await p.locator('.docs-nav a', { hasText: 'Reference' }).click();
  await p.waitForSelector('article.prose h1');
  assert.notEqual(await p.locator('article.prose h1').innerText(), first);
  assert.match(p.url(), /\?d=/);
});
await step('download, verify and support tabs render without errors', async () => {
  for (const path of ['/download/', '/verify/', '/support/']) {
    const p = await open(VC + path);
    assert.deepEqual(p.problems, [], path);
  }
});

await browser.close();
stop();
console.log(failed ? `\n${failed} failed` : '\nall browser checks passed');
process.exit(failed ? 1 : 0);
