#!/usr/bin/env node
// Generates /consulting/ (site/consulting/index.html) from site/consulting/consulting.json.
// The page is real HTML, so it works without JavaScript and search engines can read it. The self-assessments
// (site/consulting/assessments.json + consulting.js) need JavaScript and run entirely in the visitor's browser.
// Safe to run repeatedly. Usage: node tools/build-consulting.mjs

import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve('site');
const c = JSON.parse(fs.readFileSync(path.join(SITE, 'consulting', 'consulting.json'), 'utf8'));
const family = JSON.parse(fs.readFileSync(path.join(SITE, 'family.json'), 'utf8'));
const site = JSON.parse(fs.readFileSync(path.join(SITE, 'site.json'), 'utf8'));
const base = family.home.replace(/\/$/, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
const src = (id) => { const i = c.sources.findIndex((s) => s.id === id); return i < 0 ? '' : `<a class="k-ref" href="#src-${id}" aria-label="Source ${i + 1}">[${i + 1}]</a>`; };

const hl = (t, k) => { const e = esc(t); return k && e.includes(esc(k)) ? e.replace(esc(k), `<span class="hl">${esc(k)}</span>`) : e; };

const body = `
    <section class="hero k-hero" aria-labelledby="k-title">
      <div class="hero-copy">
        <p class="eyebrow">${esc(c.hero.kicker)}</p>
        <h1 id="k-title">${hl(c.hero.title, c.hero.highlight)}</h1>
        <p class="lead">${esc(c.hero.lead)}</p>
        <div class="actions">
          <a class="btn btn-primary" href="${c.hero.primary.href}">${esc(c.hero.primary.label)}</a>
          <a class="btn btn-ghost" href="${c.hero.secondary.href}">${esc(c.hero.secondary.label)}</a>
        </div>
      </div>
      <figure class="hero-visual k-sample" aria-label="An example assessment result">
        <div id="k-sample-radar" aria-hidden="true"></div>
        <figcaption><span class="k-sample-k">Example result</span>Your result shows six dimensions, a level, and the first moves to make. <a href="#assess">Try it</a></figcaption>
      </figure>
    </section>

    <section class="block" id="why" aria-labelledby="why-title">
      <p class="kicker-m">${esc(c.why.kicker)}</p>
      <h2 id="why-title">${esc(c.why.title)}</h2>
      <p class="lead k-lead">${esc(c.why.lead)}</p>
      <div class="k-cards">
${c.why.cards.map((x) => `        <article class="k-card"><p class="k-stat">${esc(x.stat)}</p><h3>${esc(x.title)} ${src(x.src)}</h3><p>${esc(x.text)}</p></article>`).join('\n')}
      </div>
    </section>

    <section class="block" id="engagements" aria-labelledby="eng-title">
      <p class="kicker-m">${esc(c.engagements.kicker)}</p>
      <h2 id="eng-title">${esc(c.engagements.title)}</h2>
      <p class="lead k-lead">${esc(c.engagements.lead)}</p>
      <div class="k-eng">
${c.engagements.items.map((x) => `        <article class="k-offer" id="${x.id}">
          <header><span class="k-n">${x.n}</span><span class="k-tag">${esc(x.tag)}</span></header>
          <h3>${esc(x.title)}</h3>
          <p class="k-pitch">${esc(x.pitch)}</p>
          <ul>${x.gets.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
          <p class="k-check"><b>How you check it.</b> ${esc(x.check)}</p>
          <p class="k-cta">${esc(x.cta)}</p>
        </article>`).join('\n')}
      </div>
      <aside class="k-enable">
        <div><h3>${esc(c.engagements.enable.title)}</h3><p>${esc(c.engagements.enable.text)}</p></div>
        <a class="btn btn-ghost" href="${c.engagements.enable.href}">${esc(c.engagements.enable.label)}</a>
      </aside>
    </section>

    <section class="block" id="how" aria-labelledby="how-title">
      <p class="kicker-m">${esc(c.how.kicker)}</p>
      <h2 id="how-title">${esc(c.how.title)}</h2>
      <div class="k-habits">
${c.how.items.map((x) => `        <div><h3>${esc(x.t)}</h3><p>${esc(x.p)}</p></div>`).join('\n')}
      </div>
      <ol class="how k-steps">
${c.how.steps.map((x, i) => `        <li><span class="how-n">0${i + 1}</span><h3>${esc(x.t)}</h3><p>${esc(x.p)}</p></li>`).join('\n')}
      </ol>
    </section>

    <section class="block" id="assess" aria-labelledby="assess-title">
      <p class="kicker-m">${esc(c.assess.kicker)}</p>
      <h2 id="assess-title">${esc(c.assess.title)}</h2>
      <p class="lead k-lead">${esc(c.assess.lead)}</p>
      <div id="assess-app" class="k-app" data-src="/consulting/assessments.json"><p class="muted">Loading the assessments…</p></div>
      <noscript><p class="lead">The assessments need JavaScript. They run entirely in your browser. Or <a href="${wa('Hello, I would like an AI readiness review.')}">message us</a> and we will run one with you.</p></noscript>
      <p class="muted small k-note">${esc(c.assess.note)} ${src('cisco')}</p>
      <p class="muted small k-note">${esc(c.assess.caveat)}</p>
    </section>

    <section class="block k-systems" aria-labelledby="sys-title">
      <p class="kicker-m">${esc(c.systems.kicker)}</p>
      <h2 id="sys-title">${esc(c.systems.title)}</h2>
      <p class="lead k-lead">${esc(c.systems.lead)}</p>
      <ul class="k-sys-list">
${family.products.map((p) => `        <li><a href="${p.url}"><strong>${esc(p.name)}</strong><span>${esc(p.short || '')}</span></a></li>`).join('\n')}
      </ul>
      <p><a class="btn btn-ghost" href="${c.systems.href}">${esc(c.systems.label)}</a></p>
    </section>

    <section class="cta-band" id="contact" aria-labelledby="contact-title">
      <div><h2 id="contact-title">${esc(c.cta.title)}</h2><p>${esc(c.cta.text)}</p></div>
      <div class="actions"><a class="btn btn-primary" href="${wa('Hello, I would like to talk about AI consulting.')}">Contact sales</a></div>
    </section>

    <section class="k-sources" aria-labelledby="src-title">
      <h2 id="src-title" class="foot-h">Sources</h2>
      <ol>
${c.sources.map((s) => `        <li id="src-${s.id}"><a href="${s.url}" rel="noopener">${esc(s.label)}</a></li>`).join('\n')}
      </ol>
    </section>`;

const ld = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Intellica Consulting', url: `${base}/consulting/`, description: c.description, provider: { '@type': 'Organization', name: 'Intellica', url: base + '/' }, serviceType: ['AI readiness review', 'Architecture for AI-assisted delivery', 'AI and agent engineering', 'AI governance and assurance', 'Post-quantum cryptography readiness', 'AI value measurement'] };
const title = `${c.title}: AI engineering you can check | Intellica`;
const url = `${base}/consulting/`;

const html = `<!doctype html>
<!-- Generated by tools/build-consulting.mjs from site/consulting/consulting.json. Edit the data, not this file. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(c.description)}">
  <meta name="theme-color" content="#00C8FF">
  <link rel="canonical" href="${url}">
  <meta property="og:site_name" content="Intellica">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(c.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://meeting-mind.com/assets/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <script src="/kit/theme-init.js"></script>
  <link rel="stylesheet" href="/kit/tokens.css">
  <link rel="stylesheet" href="/kit/shell.css">
  <link rel="stylesheet" href="/consulting/consulting.css">
</head>
<body data-tab="consulting" data-generated="consulting" data-section="consulting">
  <a class="skip-link" href="#main">Skip to content</a>
  <div id="shell-header"></div>
  <main id="main" class="container k">${body}
  </main>
  <div id="shell-footer"></div>
  <script type="module" src="/kit/shell.js"></script>
  <script type="module" src="/consulting/consulting.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(SITE, 'consulting', 'index.html'), html);
console.log('built consulting page');
