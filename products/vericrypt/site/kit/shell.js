// Intellica shell: builds the header, tab bar, status line and footer around each page,
// and hydrates the page body from JSON/Markdown files that live in the same site.
// Loaded as <script type="module" src="/kit/shell.js"> on every page.

import { $, el, loadJSON, loadText, copyText, safeHref, storage } from './dom.js';
import { renderMarkdown } from './markdown.js';

export const KIT_VERSION = '0.2.0';

const TABS = {
  overview: { label: 'Overview', path: '/' },
  demo: { label: 'Demo', path: '/demo/' },
  download: { label: 'Download', path: '/download/' },
  docs: { label: 'Docs', path: '/docs/' },
  verify: { label: 'Verify', path: '/verify/' },
  support: { label: 'Support', path: '/support/' },
};

/* ---------- brand and theme ---------- */

function contrastOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#04121a';
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (L + 0.05) / 0.056 > 1.05 / (L + 0.05) ? '#04121a' : '#ffffff';
}

function applyBrand(site) {
  const root = document.documentElement;
  if (site.accent) {
    root.style.setProperty('--accent', site.accent);
    root.style.setProperty('--on-accent', contrastOn(site.accent));
  }
  const staticTitle = document.title || '';
  document.title = !staticTitle || staticTitle === site.name ? site.name : `${site.name} · ${staticTitle}`;
  const desc = $('meta[name="description"]');
  if (desc && site.tagline) desc.setAttribute('content', site.tagline);
}

const THEMES = ['auto', 'light', 'dark'];

function themeButton() {
  let mode = storage.get('iw-theme');
  mode = THEMES.includes(mode) ? mode : 'auto';
  const btn = el('button', { type: 'button', class: 'btn btn-ghost theme-btn' });
  const paint = () => { btn.textContent = `Theme: ${mode}`; btn.setAttribute('aria-label', `Colour theme: ${mode}. Activate to change.`); };
  btn.addEventListener('click', () => {
    mode = THEMES[(THEMES.indexOf(mode) + 1) % THEMES.length];
    if (mode === 'auto') { document.documentElement.removeAttribute('data-theme'); storage.set('iw-theme', 'auto'); }
    else { document.documentElement.setAttribute('data-theme', mode); storage.set('iw-theme', mode); }
    paint();
  });
  paint();
  return btn;
}

/* ---------- chrome ---------- */

function familyMenu(site, family) {
  if (!family) return null;
  const items = [{ id: 'intellica', name: 'Intellica home', url: family.home }, ...family.products];
  return el('details', { class: 'family' },
    el('summary', {}, 'Intellica family'),
    el('ul', {}, items.map((p) =>
      el('li', {}, el('a', { href: p.url, 'aria-current': p.id === site.id ? 'page' : null }, p.name)))));
}

function renderHeader(site, family, page) {
  const host = $('#shell-header');
  if (!host) return;
  const parts = [];
  parts.push(el('header', { class: 'shell-header' },
    el('div', { class: 'container bar' },
      el('a', { class: 'brand', href: '/' }, el('span', { class: 'brand-mark', 'aria-hidden': 'true' }), el('span', { class: 'brand-name' }, site.name)),
      el('div', { class: 'bar-right' }, familyMenu(site, family), themeButton()))));

  const tabs = (site.tabs || []).filter((t) => TABS[t]);
  if (tabs.length) {
    parts.push(el('nav', { class: 'tabs', 'aria-label': 'Sections' },
      el('div', { class: 'container' },
        el('ul', {}, tabs.map((t) =>
          el('li', {}, el('a', { href: TABS[t].path, 'aria-current': t === page ? 'page' : null }, TABS[t].label)))))));
  }

  if (site.status || site.version) {
    parts.push(el('div', { class: 'status-strip' },
      el('div', { class: 'container' },
        site.status ? el('span', { class: 'badge' }, site.status) : null,
        site.version ? el('span', { class: 'muted' }, `Version ${site.version}`) : null)));
  }
  host.replaceChildren(...parts);
}

function renderFooter(site, family) {
  const host = $('#shell-footer');
  if (!host) return;
  const contact = site.contact || (family && family.contact);
  host.replaceChildren(el('footer', { class: 'shell-footer' },
    el('div', { class: 'container foot' },
      el('p', {}, 'Part of the Intellica family.', contact ? [' ', el('a', { href: `mailto:${contact}` }, contact)] : null),
      el('p', { class: 'muted' }, `Self-hosted: this site loads nothing from third parties. Kit ${KIT_VERSION}.`))));
}

/* ---------- page: home (Intellica) ---------- */

const productUrl = (product, tab) => product.url.replace(/\/$/, '') + (TABS[tab] ? TABS[tab].path : '/');

function hydrateHome(site, family) {
  if (!family) return;
  const byId = Object.fromEntries(family.products.map((p) => [p.id, p]));

  const roles = $('#roles-grid');
  if (roles) {
    roles.replaceChildren(...family.roles.map((r) =>
      el('article', { class: 'card role' },
        el('h3', {}, r.title),
        el('p', { class: 'muted' }, r.blurb),
        el('ul', { class: 'link-list' }, r.links
          .filter((l) => l.href || byId[l.product])
          .map((l) => el('li', {}, el('a', { href: l.href || productUrl(byId[l.product], l.tab) }, l.label)))))));
  }

  const cards = $('#family-cards');
  if (cards) {
    cards.replaceChildren(...family.products.map((p) => {
      const card = el('article', { class: 'card product' },
        el('h3', {}, el('a', { href: p.url }, p.name)),
        el('p', {}, p.tagline),
        p.status ? el('p', {}, el('span', { class: 'badge' }, p.status)) : null,
        el('ul', { class: 'chip-links' }, ['overview', 'demo', 'download', 'docs'].map((t) =>
          el('li', {}, el('a', { href: productUrl(p, t) }, TABS[t].label)))));
      card.style.setProperty('--card-accent', p.accent);
      return card;
    }));
  }

  const sectors = $('#sector-links');
  if (sectors && family.sectors && family.sectors.length) {
    sectors.replaceChildren(...family.sectors.map((s) => el('li', {}, el('a', { href: s.path }, s.title))));
  } else if (sectors) {
    sectors.closest('section')?.setAttribute('hidden', '');
  }

  const standards = $('#standards-list');
  if (standards && family.standards) {
    standards.replaceChildren(...family.standards.map((s) => el('li', {}, s)));
  }

  const contact = $('#contact-link');
  if (contact && family.contact) {
    contact.setAttribute('href', `mailto:${family.contact}`);
    contact.textContent = family.contact;
  }
}

/* ---------- page: overview (product) ---------- */

function section(title, ...kids) {
  return el('section', { class: 'block' }, el('h2', {}, title), ...kids);
}

function hydrateOverview(site) {
  const root = $('#overview-root');
  if (!root) return;
  const tabs = site.tabs || [];
  const actions = [];
  if (tabs.includes('demo')) actions.push(el('a', { class: 'btn btn-primary', href: '/demo/' }, 'Try the demo'));
  if (tabs.includes('download')) actions.push(el('a', { class: 'btn btn-ghost', href: '/download/' }, 'Download'));
  if (tabs.includes('docs')) actions.push(el('a', { class: 'btn btn-ghost', href: '/docs/' }, 'Read the docs'));

  const parts = [el('section', { class: 'hero' },
    el('p', { class: 'eyebrow' }, 'Intellica'),
    el('h1', {}, site.name),
    el('p', { class: 'lead' }, site.tagline),
    el('div', { class: 'actions' }, actions))];

  if (site.audience && site.audience.length) {
    parts.push(section('Who it is for', el('div', { class: 'grid grid-3' }, site.audience.map((a) =>
      el('article', { class: 'card' }, el('h3', {}, a.role), el('p', { class: 'muted' }, a.concern))))));
  }
  if (site.highlights && site.highlights.length) {
    parts.push(section('What it does', el('div', { class: 'grid grid-2' }, site.highlights.map((h) =>
      el('article', { class: 'card' }, el('h3', {}, h.title), el('p', { class: 'muted' }, h.text))))));
  }
  if (site.verifyIt) {
    const next = tabs.includes('demo') ? el('a', { class: 'btn btn-primary', href: '/demo/' }, 'Open the demo')
      : tabs.includes('verify') ? el('a', { class: 'btn btn-primary', href: '/verify/' }, 'Go to Verify') : null;
    parts.push(el('section', { class: 'callout verify' },
      el('h2', {}, 'Verify it yourself'), el('p', {}, site.verifyIt), next ? el('div', { class: 'actions' }, next) : null));
  }
  root.replaceChildren(...parts);
}

/* ---------- page: demo ---------- */

const ENGINE_LABELS = {
  wasm: 'Real engine, compiled to WebAssembly',
  trace: 'Recorded trace made by the real engine',
  placeholder: 'Placeholder: a generic hash-chain demo, not this product’s engine',
};

async function hydrateDemo(site) {
  const root = $('#demo-root');
  if (!root) return;
  const cfg = site.demo || {};
  const engine = ENGINE_LABELS[cfg.engine] ? cfg.engine : 'placeholder';

  const mountArea = el('div', { id: 'demo-mount', class: 'demo-mount' });
  const reset = el('button', { type: 'button', class: 'btn btn-ghost' }, 'Reset the demo');
  let handle = null;

  async function start() {
    try { handle && handle.unmount && handle.unmount(); } catch { /* ignore */ }
    mountArea.replaceChildren(el('p', { class: 'muted' }, 'Loading the demo…'));
    try {
      const mod = await import(new URL('./demo.js', location.href).href);
      const theme = document.documentElement.getAttribute('data-theme') ||
        (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      handle = await mod.mount(mountArea, {
        base: new URL('./', location.href).href,
        theme,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      });
    } catch (err) {
      mountArea.replaceChildren(el('p', { class: 'callout bad' }, `The demo could not start: ${err.message}`));
    }
  }
  reset.addEventListener('click', start);

  const parts = [
    el('h1', {}, cfg.title || `${site.name} demo`),
    cfg.summary ? el('p', { class: 'lead' }, cfg.summary) : null,
    el('div', { class: 'demo-strip' },
      el('span', { class: 'badge', 'data-engine': engine }, ENGINE_LABELS[engine]),
      cfg.sample ? el('span', { class: 'muted' }, `Sample input: ${cfg.sample}`) : null,
      el('span', { class: 'muted' }, 'Runs entirely in your browser. Nothing is sent anywhere.')),
    el('div', { class: 'demo-frame' }, mountArea, el('div', { class: 'actions' }, reset)),
  ];

  if (cfg.command) {
    const copy = el('button', { type: 'button', class: 'btn btn-ghost' }, 'Copy command');
    copy.addEventListener('click', async () => { copy.textContent = (await copyText(cfg.command)) ? 'Copied' : 'Copy failed'; });
    parts.push(section('Run it yourself',
      el('p', {}, 'The same check with the downloaded binary:'),
      el('pre', {}, el('code', {}, cfg.command)),
      cfg.expected ? [el('p', {}, 'Expected result:'), el('pre', {}, el('code', {}, cfg.expected))] : null,
      el('div', { class: 'actions' }, copy)));
  }
  root.replaceChildren(...parts);
  await start();
}

/* ---------- page: download ---------- */

function formatBytes(n) {
  if (!Number.isFinite(n)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
}

async function hydrateDownload(site) {
  const root = $('#downloads-root');
  if (!root) return;
  let data;
  try { data = await loadJSON('./downloads.json'); } catch { data = null; }
  const items = (data && data.items) || [];
  const parts = [];

  if (data && data.licence) parts.push(el('p', { class: 'callout' }, data.licence));

  if (!items.length) {
    parts.push(el('p', { class: 'muted' }, 'There are no packaged downloads yet.'));
    const b = site && site.buildFromSource;
    if (b) {
      const copy = el('button', { type: 'button', class: 'btn btn-ghost btn-small' }, 'Copy commands');
      copy.addEventListener('click', async () => { copy.textContent = (await copyText(b.steps)) ? 'Copied' : 'Failed'; });
      parts.push(section(b.title || 'Build from source',
        b.intro ? el('p', {}, b.intro) : null,
        el('pre', {}, el('code', {}, b.steps)),
        copy,
        b.note ? el('p', { class: 'muted' }, b.note) : null,
        site.repo ? el('p', {}, el('a', { href: safeHref(site.repo) }, 'Source repository')) : null));
    }
  } else {
    const rows = items.map((it) => {
      const copy = el('button', { type: 'button', class: 'btn btn-ghost btn-small' }, 'Copy');
      copy.addEventListener('click', async () => { copy.textContent = (await copyText(it.sha256)) ? 'Copied' : 'Failed'; });
      return el('tr', {},
        el('td', {}, it.file ? el('a', { href: it.file, download: '' }, it.name) : it.name),
        el('td', {}, it.version || ''),
        el('td', {}, it.platform || ''),
        el('td', {}, formatBytes(it.bytes)),
        el('td', {}, el('code', { class: 'hash' }, it.sha256 || ''), ' ', it.sha256 ? copy : null),
        el('td', {}, it.signature ? el('a', { href: it.signature }, 'Signature') : ''),
        el('td', {}, it.notes || ''));
    });
    parts.push(el('div', { class: 'table-wrap' }, el('table', {},
      el('thead', {}, el('tr', {}, ['Name', 'Version', 'Platform', 'Size', 'SHA-256', 'Signature', 'Notes'].map((h) => el('th', {}, h)))),
      el('tbody', {}, rows))));
  }

  if (items.length) {
    parts.push(section('Check what you downloaded',
      el('p', {}, 'Compare the SHA-256 of the file you received with the value in the table.'),
      el('pre', {}, el('code', {}, 'macOS:    shasum -a 256 <file>\nLinux:    sha256sum <file>\nWindows:  Get-FileHash <file> -Algorithm SHA256'))));
  }
  root.replaceChildren(...parts);
}

/* ---------- page: docs ---------- */

function docsRelative(href, docDir) {
  const base = new URL('./', location.href);
  const target = new URL(href, new URL(docDir, base));
  return { rel: target.pathname.slice(base.pathname.length), hash: target.hash };
}

async function hydrateDocs(site) {
  const root = $('#docs-root');
  if (!root) return;
  let index;
  try { index = await loadJSON('./docs.json'); } catch { root.replaceChildren(el('p', { class: 'muted' }, 'Nothing is published here yet.')); return; }
  const flat = index.groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
  if (!flat.length) { root.replaceChildren(el('p', { class: 'muted' }, 'Nothing is published here yet.')); return; }

  const wanted = new URLSearchParams(location.search).get('d');
  const entry = flat.find((i) => i.md === wanted) || flat[0];

  const nav = el('nav', { class: 'docs-nav', 'aria-label': 'Documentation' }, index.groups.map((g) =>
    el('div', { class: 'docs-group' }, el('h2', {}, g.title),
      el('ul', {}, g.items.map((i) => el('li', {}, el('a', { href: `?d=${encodeURIComponent(i.md)}`, 'aria-current': i.md === entry.md ? 'page' : null }, i.title)))))));

  const article = el('article', { class: 'prose' });
  root.replaceChildren(el('div', { class: 'docs-layout' }, nav, article));
  document.title = `${entry.title} · ${site.name} docs`;

  try {
    article.innerHTML = renderMarkdown(await loadText(`./${entry.md}`), { demote: 1 });
  } catch (err) {
    article.replaceChildren(el('p', { class: 'callout bad' }, `This page could not be loaded: ${err.message}`));
    return;
  }
  const docDir = `./${entry.md.split('/').slice(0, -1).join('/')}${entry.md.includes('/') ? '/' : ''}`;
  article.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (/^([a-z]+:|\/|#)/i.test(href)) return;
    const { rel, hash } = docsRelative(href.split('#')[0] || '.', docDir);
    a.setAttribute('href', rel.endsWith('.md') ? `?d=${encodeURIComponent(rel)}${hash || (href.includes('#') ? '#' + href.split('#')[1] : '')}` : `./${rel}`);
  });
  article.querySelectorAll('img[src]').forEach((img) => {
    const { rel } = docsRelative(img.getAttribute('src'), docDir);
    img.setAttribute('src', `./${rel}`);
  });
  const heads = [...article.querySelectorAll('h2, h3')];
  if (heads.length > 3) {
    article.prepend(el('details', { class: 'toc' }, el('summary', {}, 'On this page'),
      el('ul', {}, heads.map((h) => el('li', { class: h.tagName === 'H3' ? 'sub' : '' }, el('a', { href: `#${h.id}` }, h.textContent))))));
  }
}

/* ---------- page: verify (markdown) ---------- */

async function hydrateMarkdownPage() {
  const root = $('#md-root');
  if (!root) return;
  try {
    root.innerHTML = renderMarkdown(await loadText(root.getAttribute('data-src') || './page.md'), { demote: 1 });
  } catch (err) {
    root.replaceChildren(el('p', { class: 'muted' }, 'Nothing is published here yet.'));
  }
}

/* ---------- page: support ---------- */

function hydrateSupport(site, family) {
  const contact = site.contact || (family && family.contact);
  const mail = $('#support-contact');
  if (mail && contact) { mail.setAttribute('href', `mailto:${contact}`); mail.textContent = contact; }
  const faq = $('#support-faq');
  if (faq) {
    const items = site.faq || [];
    if (!items.length) faq.closest('section')?.setAttribute('hidden', '');
    else faq.replaceChildren(...items.map((it) => el('details', { class: 'faq-item' }, el('summary', {}, it.q), el('p', {}, it.a))));
  }
  const issues = $('#support-issues');
  if (issues && site.repo) { issues.setAttribute('href', safeHref(`${site.repo.replace(/\/$/, '')}/issues`)); }
  else if (issues) { issues.closest('li')?.setAttribute('hidden', ''); }
}

/* ---------- boot ---------- */

const HYDRATE = {
  home: hydrateHome,
  overview: hydrateOverview,
  demo: hydrateDemo,
  download: hydrateDownload,
  docs: hydrateDocs,
  verify: hydrateMarkdownPage,
  support: hydrateSupport,
};

async function main() {
  const page = document.body.getAttribute('data-tab') || 'overview';
  try {
    const [site, family] = await Promise.all([loadJSON('/site.json'), loadJSON('/family.json').catch(() => null)]);
    applyBrand(site);
    renderHeader(site, family, page);
    renderFooter(site, family);
    if (HYDRATE[page]) await HYDRATE[page](site, family);
    document.documentElement.setAttribute('data-ready', 'true');
  } catch (err) {
    const main = $('#main');
    if (main) main.prepend(el('p', { class: 'callout bad' }, `This page could not finish loading: ${err.message}`));
  }
}

main();
