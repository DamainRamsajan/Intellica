// HTML pieces for the course catalogue: the five-level architecture path, the agentic-era series, the certificate.
// Used by build-training.mjs (index page, arc42 page) and build-catalog.mjs (the course pages).
import { esc, kicker, cols, site } from './training-shell.mjs';

export const wa = (t) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t)}`;
export const lessonCount = (c) => c.modules.reduce((n, m) => n + m.lessons.length, 0);

/* Level 1 is the arc42 workshop from training.json; levels 2 to 5 come from catalog.json. */
export function allLevels(catalog, arc) {
  const l1 = { n: 1, id: 'arc42', path: arc.path, title: arc.title, short: 'arc42 in a Day', lead: arc.lead, live: true, price: arc.course && arc.course.price ? arc.course.price.label : '' };
  return [l1, ...catalog.ladder.levels];
}

export function levelPath(levels, current) {
  return `<ol class="lvl-path" aria-label="The five levels">${levels.map((l) => `<li${l.n === current ? ' aria-current="step" class="is-here"' : ''}><a href="${l.path}"><b>${l.n}</b><span>${esc(l.short)}</span>${l.live ? '<i>Live workshop</i>' : ''}</a></li>`).join('')}</ol>`;
}

const card = (c, tag) => `
        <article class="cat-card">
          <p class="cat-tag">${esc(tag)}${(c.price || (c.course && c.course.enabled && c.course.price && c.course.price.label)) ? `<span class="cat-price">${esc(c.price || c.course.price.label)}</span>` : ''}${c.live ? '<span class="cat-status is-live">Live workshop too</span>' : ''}</p>
          <h3><a href="${c.path}">${esc(c.title)}</a></h3>
          <p>${esc(c.lead)}</p>
          <a class="cat-go" href="${c.path}">See the course <span aria-hidden="true">\u2192</span></a>${c.live ? `
          <a class="cat-go" href="${c.path}course/#get-t" data-access data-learn="${c.path}course/learn/" data-probe="${c.path}course/data/part-2-1-goals.json" data-probe-id="part-2-1-goals">Get access</a>` : ''}
        </article>`;

/* The whole catalogue as one list of tracks. Every course is a permanent online course; live workshops are a separate, dated thing. */
export function catalogSections(catalog, arc, startN) {
  const levels = allLevels(catalog, arc);
  const sr = catalog.series;
  const track = (id, title, lead, items, tag) => `
      <div class="track" id="track-${id}">
        <h3>${esc(title)}</h3>
        <p class="sub">${esc(lead)}</p>
        <div class="cat-grid">${items.map((l) => card(l, tag(l))).join('')}
        </div>
      </div>`;
  return `
    <section class="t-block" id="courses" aria-labelledby="crs-t">
      ${kicker(startN, 'Courses')}
      <h2 id="crs-t">Every course, online, yours to keep</h2>
      <p class="sub">${esc(catalog.coursesLead)}</p>
      ${track('architecture', catalog.ladder.title, catalog.ladder.lead, levels, (l) => `Level ${l.n} of 5`)}
      ${catalog.tracks.map((t) => track(t.id, t.title, t.lead, sr.courses.filter((c) => c.track === t.id), () => 'Online course')).join('')}
    </section>`;
}

export function featuredBlock(catalog) {
  const f = catalog.featured, c = catalog.series.courses.find((x) => x.id === f.id);
  return `<section class="t-block feat" aria-labelledby="feat-t">
      <p class="eyebrow">${esc(f.kicker)}</p>
      <h2 id="feat-t"><a href="${c.path}">${esc(f.title)}</a></h2>
      <p class="feat-line">${esc(f.line)}</p>
      <ul class="facts-list">${f.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="actions"><a class="btn btn-primary" href="${c.path}">See the course</a><a class="btn btn-ghost" href="#courses">All courses</a></div>
    </section>`;
}

export function certificateBlock(catalog, n, { id = 'certificate' } = {}) {
  const c = catalog.certificate;
  return `<section class="t-block" id="${id}" aria-labelledby="${id}-t">
      ${kicker(n, 'Certificate')}
      <h2 id="${id}-t">A certificate you can verify and share</h2>
      <p class="sub">${esc(c.text)}</p>
      <div class="two">
        <div><h3>To earn it</h3><ol class="cert-criteria">${c.criteria.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
        <div><h3>What you get</h3><ul class="facts-list"><li>A credential ID and a public page that confirms it</li><li>Add to LinkedIn in one click</li><li>Share on LinkedIn, X or Facebook, or copy the link</li><li>Save as a PDF</li></ul></div>
      </div>
      <p class="muted">${esc(c.scope)}</p>
    </section>`;
}

export function coursePage(c, { catalog, levels, kindLabel, series }) {
  const lessons = lessonCount(c);
  const interest = wa(`Hello, I would like to hear when "${c.title}" opens.`);
  const nav = levels
    ? `<p class="crumb"><a href="/training/">Training</a><span aria-hidden="true"> / </span><a href="/training/#track-architecture">Software architecture</a><span aria-hidden="true"> / </span>Level ${c.n}</p>`
    : `<p class="crumb"><a href="/training/">Training</a><span aria-hidden="true"> / </span><a href="/training/#track-${c.track || 'build'}">${c.track === 'run' ? 'Run and grow a business' : 'Build and secure agentic systems'}</a><span aria-hidden="true"> / </span>${esc(c.short)}</p>`;
  let n = 0;
  return `
    <nav class="subnav" aria-label="${esc(c.title)}">
      ${nav}
      <a class="sn-code" href="/training/my-courses/">Enter access code</a>
    </nav>

    <section class="t-hero t-hero-single" aria-labelledby="c-title">
      <div class="t-hero-copy">
        <p class="cat-tag"><span>${esc(kindLabel)}</span></p>
        <h1 id="c-title">${esc(c.title)}</h1>
        <p class="lead">${esc(c.lead)}</p>
        ${c.course && c.course.enabled ? `<div class="actions"><a class="btn btn-primary" href="${c.path}course/">Start the free lessons</a><a class="btn btn-ghost" href="${c.path}course/#get-t">Buy the course, ${esc(c.course.price.label)}</a><a class="btn btn-ghost" href="#syllabus">See the syllabus</a></div>
        <p class="fine">Lesson${c.course.free.length > 1 ? 's' : ''} ${c.course.free.join(' and ')} ${c.course.free.length > 1 ? 'are' : 'is'} free to open now. ${esc(c.course.price.note)} Questions? <a href="${esc(wa(`Hello, I would like to ask about "${c.title}".`))}" rel="noopener">Contact sales</a>.</p>` : `<div class="actions"><a class="btn btn-primary" href="${esc(interest)}" rel="noopener">Contact sales</a><a class="btn btn-ghost" href="#syllabus">See the syllabus</a></div>
        <p class="fine">Enrol by message. We confirm what is ready today, send every module as it is released, and you keep every update to this edition.</p>`}
      </div>
    </section>
${levels ? `
    <section class="t-block lvl-wrap" aria-label="Where this level sits">${levelPath(levels, c.n)}</section>
` : ''}
    <section class="t-strip" aria-label="At a glance">
      <dl>
        <div><dt>${lessons} lessons</dt><dd>in ${c.modules.length} modules</dd></div>
        <div><dt>${c.lab.steps.length}-step lab</dt><dd>${esc(c.lab.title)}</dd></div>
        <div><dt>Certificate</dt><dd>Verifiable and shareable</dd></div>
        <div><dt>Your pace</dt><dd>Any device, no deadlines</dd></div>
      </dl>
    </section>

    <section class="t-block" id="why" aria-labelledby="why-t">
      ${kicker(++n, 'Why now')}
      <h2 id="why-t">Why this course, and why now</h2>
      <p class="pull">${esc(c.why)}</p>
    </section>

    <section class="t-block" id="able" aria-labelledby="able-t">
      ${kicker(++n, 'Outcomes')}
      <h2 id="able-t">What you will be able to do</h2>
      ${cols(c.outcomes, 'c4')}
    </section>

    <section class="t-block" id="syllabus" aria-labelledby="syl-t">
      ${kicker(++n, 'Syllabus')}
      <h2 id="syl-t">${lessons} lessons in ${c.modules.length} modules</h2>
      <div class="syl">${c.modules.map((m, i) => `
        <div class="syl-m"><h3><span>Module ${i + 1}</span>${esc(m.title)}</h3><p class="muted">${esc(m.note)}</p>
          <ol>${m.lessons.map((l) => `<li>${esc(l)}</li>`).join('')}</ol></div>`).join('')}
      </div>
    </section>

    <section class="t-block" id="lab" aria-labelledby="lab-t">
      ${kicker(++n, 'The lab')}
      <h2 id="lab-t">${esc(c.lab.title)}</h2>
      <p class="sub">${esc(c.lab.text)} ${esc(c.lab.intro)}</p>
      <div class="two">
        <div><h3>The steps</h3><ol class="lab-steps">${c.lab.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
        <div><h3>What the health check looks for</h3><ul class="lab-checks">${c.lab.checks.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
      </div>
    </section>

    <section class="t-block" id="learn" aria-labelledby="learn-t">
      ${kicker(++n, 'How you learn')}
      <h2 id="learn-t">The same method as every Intellica course</h2>
      ${cols(catalog.learn, 'c4')}
      <p class="muted">The method follows published research on retrieval practice, worked examples and spaced review. <a href="/training/arc42/#research">Read the evidence and sources</a>.</p>
    </section>

    ${certificateBlock(catalog, ++n)}

    <section class="t-block" id="who" aria-labelledby="who-t">
      ${kicker(++n, 'Who it is for')}
      <h2 id="who-t">${levels ? 'What it builds on' : 'What you need'}</h2>
      <p class="sub">${esc(c.needs)}</p>
      <div class="actions"><a class="btn btn-primary" href="${esc(interest)}" rel="noopener">Contact sales</a><a class="btn btn-ghost" href="/training/">All training</a></div>
    </section>`;
}

/* Small boxes for the training header: every course one click away. */
export function courseTiles(catalog, arc) {
  const levels = allLevels(catalog, arc);
  const tile = (href, top, name, open) => `<a class="tile${open ? ' is-open' : ''}" href="${href}"><span class="tile-top">${esc(top)}</span><span class="tile-name">${esc(name)}</span></a>`;
  const group = (label, tiles) => `<div class="tile-group"><p class="tile-label">${esc(label)}</p><div class="tiles">${tiles.join('')}</div></div>`;
  return `<nav class="hero-tiles" aria-label="Jump to a course">
        ${group(catalog.ladder.title, levels.map((l) => tile(l.path, `Level ${l.n}`, l.short, false)))}
        ${catalog.tracks.map((t) => group(t.title, catalog.series.courses.filter((c) => c.track === t.id).map((c) => tile(c.path, 'Course', c.short, false)))).join('')}
      </nav>`;
}
