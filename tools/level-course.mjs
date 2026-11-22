// The Level 2 course, "Architecture for Quality and Decisions": turns training-private/quality-decisions/part*.mjs and the "course"
// block of the quality-decisions entry in site/training/catalog.json (ladder.levels) into what build-course.mjs needs.
// It reuses the cyber course's engine copy (cyber-course.mjs engineFiles) with its own storage prefix, health check and wording.
import fs from 'node:fs';
import path from 'node:path';
import { page, esc as xesc } from './training-shell.mjs';
import { fromCompact, slug } from './cyber-course.mjs';
import * as XT from './level-tools/data.mjs';
import { engineFiles } from './cyber-course.mjs';

export const ID = 'quality-decisions';
export const COPY = { noun: 'quality and decisions record', own: 'your own quality and decisions record', doc: 'Your decisions record', file: 'decisions-record.md',
  extra: 'A model solution for every lab, and a rubric to mark your own work', labFor: 'Build your own quality and decisions record', store: 'iwq-course-code', sysEx: 'e.g. Doubles-to-Go ordering app',
  tools: [['course/lab/scenario/', 'Scenario checker'], ['course/lab/budget/', 'Budget calculator']] };
const DIR = path.resolve('training-private/quality-decisions');

export function load(SITE) {
  if (!fs.existsSync(DIR)) { console.log('quality-decisions course: no training-private/quality-decisions, skipped'); return null; }
  const catalog = JSON.parse(fs.readFileSync(path.join(SITE, 'training', 'catalog.json'), 'utf8'));
  const ent = catalog.ladder.levels.find((x) => x.id === ID);
  const cc = ent && ent.course;
  if (!cc || !cc.enabled) return null;
  const parts = fs.readdirSync(DIR).filter((f) => /^part\d+\.mjs$/.test(f)).sort();
  const compact = [];
  for (const f of parts) compact.push(...(QP[f] || []));
  const lessons = compact.map(fromCompact);
  const site = JSON.parse(fs.readFileSync(path.join(SITE, 'site.json'), 'utf8'));
  const idOf = slug;
  const css = fs.readFileSync(path.resolve('tools/cyber-slides.css'), 'utf8');
  const slides = [];
  for (const l of lessons) for (const sl of l.slides) slides.push({ part: l.title, t: sl.title, o: false, e: 0, n: '', h: sl.html });
  const deck = { slides, dgx: () => '', deck: ID, css };
  const quiz = {};
  for (const l of lessons) quiz[idOf(l.title)] = l.quiz.map((q) => ({ q: q.q, o: q.o, a: q.a, why: q.why }));
  const modules = ent.modules.map((m) => ({ title: m.title, note: m.note || '', lessons: m.lessons.map((t) => {
    const l = lessons.find((x) => idOf(x.title) === idOf(t));
    if (!l) throw new Error(`catalog.json: module "${m.title}" names a lesson that is not in the course files: ${t}`);
    return idOf(l.title);
  }) }));
  const inModules = new Set(modules.flatMap((m) => m.lessons));
  for (const l of lessons) if (!inModules.has(idOf(l.title))) throw new Error(`lesson not in any module: ${l.title}`);
  const free = (cc.free || []).map((n) => idOf(lessons[n - 1].title));
  const w = { id: ID, path: ent.path, title: ent.title, whatsapp: site.whatsapp, facilitator: null };
  const c = { enabled: true, noBoard: true, headline: cc.headline, lead: cc.lead, honesty: cc.honesty, free, skip: [], price: cc.price || null, priceNote: cc.priceNote || '',
    method: cc.method, evidence: cc.evidence, faq: cc.faq, modules, preview: { lesson: idOf(lessons[cc.preview.lesson - 1].title), slideTitle: lessons[cc.preview.lesson - 1].slides[cc.preview.slide - 1].title } };
  const reading = {};
  for (const l of lessons) reading[idOf(l.title)] = [
    { h: 'Field guide', ps: l.guide }, { h: 'Worked case', ps: [l.case] },
    { h: 'How your lab is assessed', ps: ['Mark your own work against these four criteria. Score each 0, 1 or 2.'], head: ['Criterion', '0: Missing', '1: Partial', '2: Competent'], rows: l.rubric.map((r) => [r.criterion, r.missing, r.partial, r.competent]) },
    ...(l.sources && l.sources.length ? [{ h: 'Sources', ps: l.sources }] : []),
  ];
  return { w, c, deck, quiz, lab: (ls) => buildLab(lessons, ls, idOf), reading };
}

/* The lab: one growing decisions record. Section s<n> belongs to lesson n and holds that lesson's tasks. */
function buildLab(src, lessons, idOf) {
  const sections = [{ key: 'head', title: 'Record header', short: 'Header', template: [
    '| | |', '|---|---|', '| **System** | _One sentence: the system this record is about_ |', '| **Level 1 arc42** | _where your arc42 lives_ |', '| **Owner** | _the accountable person_ |', '| **Status** | Draft v0.1 |', '| **Date** | _today_ |', '',
    '**Scope.** _What the record covers, and what it does not._'] }];
  const steps = [];
  src.forEach((l, i) => {
    const n = i + 1, key = `s${n}`;
    const tpl = [`## ${n}. ${l.title}`, '', `**Lab:** ${l.lab.title}`, ''];
    l.lab.tasks.forEach((t, k) => { tpl.push(`**Task ${k + 1}.** ${t}`, '', '_Your answer._', ''); });
    tpl.push(`**Evidence to include:** ${l.lab.evidence}`);
    sections.push({ key, title: `${n}. ${l.title}`, short: `§${n}`, template: tpl });
    const lesson = lessons.find((x) => x.id === idOf(l.title));
    steps.push({ id: idOf(l.title), title: l.lab.title, sections: [key], minutes: 25, brief: l.lab.intro,
      do: l.lab.tasks, done: [...l.rubric.map((r) => `${r.criterion}: ${r.competent}`), `Evidence: ${l.lab.evidence}`],
      experienced: 'Apply it to a real system your team runs, with real numbers, real owners and real dates.', example: l.lab.model,
      free: lesson.free, lessonNum: lesson.num, lessonTitle: lesson.title, next: null });
  });
  steps.sort((a, b) => a.lessonNum - b.lessonNum);
  steps.forEach((s, i) => { const nx = steps[i + 1]; s.next = nx ? { id: nx.id, title: nx.title } : null; });
  return { sections, steps };
}

const levelText = (src) => src
  .replaceAll('Your arc42 so far: ${started} of 12 sections started.', 'Your record so far: ${started} of 20 sections started.')
  .replaceAll('Your arc42 is yours to keep', 'Your record is yours to keep').replaceAll("'Open your arc42'", "'Open your record'")
  .replaceAll('architecture documentation (arc42)', 'quality and decisions record').replaceAll('-arc42.md', '-decisions-record.md').replaceAll("|| 'arc42'", "|| 'decisions-record'")
  .replaceAll('No arc42 sections found. The file needs headings like "## 1. Introduction and Goals".', 'No sections found. The file needs headings like "## 1. Quality Models and the Quality Tree".')
  .replaceAll('See the finished version (Doubles-to-Go worked example)', 'See a model solution').replaceAll('write the next arc42 section in the lab', 'write the next section of your record in the lab')
  .replaceAll('sectionsTotal: 12', 'sectionsTotal: 20').replaceAll('rec.sections, 12, rec.sections >= 12', 'rec.sections, 20, rec.sections >= 20')
  .replaceAll('n <= 12', 'n <= 20').replaceAll('arc42.md', 'decisions-record.md')
  .replaceAll("/:?\\s*architecture documentation.*$/i", "/:?\\s*quality and decisions record.*$/i").replaceAll('.*arc42.*$', '.*decisions record.*$');

/* Two practice tools, free to open: a scenario checker and a budget calculator. */
function writeTools(out, w) {
  const base = `${w.path}course/lab/`, put = (rel, txt) => { const f = path.join(out, 'lab', rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); };
  const src = path.resolve('tools/level-tools');
  put('tools/data.js', fs.readFileSync(path.join(src, 'data.mjs'), 'utf8'));
  for (const f of ['scenario.js', 'budget.js']) put(`tools/${f}`, fs.readFileSync(path.join(src, f), 'utf8'));
  put('tools/tools.css', fs.readFileSync(path.resolve('tools/cyber-tools/tools.css'), 'utf8') + '\n.xt textarea { min-height: 120px; background: transparent; color: var(--text-hi); border: 1px solid var(--line-hi); border-radius: 4px; padding: var(--s2); font: inherit; }\n.xt .res { margin: var(--s2) 0 var(--s4); color: var(--text-hi); min-height: 1.4em; }\n.xt input[type=number] { min-height: 44px; background: transparent; color: var(--text-hi); border: 1px solid var(--line-hi); border-radius: 4px; padding: 0 var(--s2); font: inherit; }\n.xt form.calc { border: 1px solid var(--line-hi); border-radius: 4px; padding: var(--s3) var(--s4); background: var(--card); margin-bottom: 0; }\n');
  const nav = (here) => `<nav class="subnav" aria-label="Practice tools"><p class="crumb"><a href="/training/">Training</a><span aria-hidden="true"> / </span><a href="${w.path}">${xesc(w.title)}</a><span aria-hidden="true"> / </span>${here}</p><a class="sn-code" href="/training/my-courses/">Enter access code</a></nav>`;
  const css = [`${base}tools/tools.css`];
  const scenario = `${nav('Scenario checker')}
    <section class="t-hero t-hero-single"><div class="t-hero-copy"><p class="eyebrow">Practice tool</p><h1>Scenario checker</h1><p class="lead">A quality scenario is only useful if you could test it. Paste yours and see which parts are missing, then judge six examples yourself.</p></div></section>
    <div class="xt" data-scenario>
      <h2>Check your scenario</h2>
      <label>Your scenario<textarea data-text rows="4" placeholder="During lunchtime peak, 500 orders a minute are submitted; 95% are confirmed within 2 seconds."></textarea></label>
      <div data-out aria-live="polite"></div>
      <h2>Judge six examples</h2>
      <p class="muted">Is each one testable? <strong data-score role="status">0 of 0 right</strong></p>
      <ol class="cases" data-cases></ol>
      <p class="muted small">The checker looks for words and numbers. It cannot tell if your number is the right one. Use it as a first pass, then ask: where does the number come from, and how will we measure it?</p>
    </div>
    <script type="module" src="${base}tools/scenario.js"></script>`;
  const field = (label, name, val, extra = '') => `<label>${label}<input type="${extra.includes('text') ? 'text' : 'number'}" name="${name}" value="${val}" step="any" ${extra.replace('text', '')}></label>`;
  const budget = `${nav('Budget calculator')}
    <section class="t-hero t-hero-single"><div class="t-hero-copy"><p class="eyebrow">Practice tool</p><h1>Budget calculator</h1><p class="lead">Five small calculators for the arithmetic in Level 2: downtime and error budgets, dependencies in series, latency budgets, work in flight and the payback of technical debt.</p></div></section>
    <div class="xt" data-budget>
      <h2>Availability and error budget</h2>
      <form class="calc grid" data-avail>${field('Availability target (%)', 'target', 99.9, 'min="0" max="100"')}${field('Requests in the period', 'reqs', 2500000, 'min="0"')}</form><p class="res" data-res aria-live="polite"></p>
      <h2>Dependencies in series</h2>
      <form class="calc grid" data-serial>${field('Availabilities in %, separated by commas', 'list', '99.95, 99.9, 99.5', 'text')}</form><p class="res" data-res aria-live="polite"></p>
      <h2>Latency budget</h2>
      <form class="calc grid" data-latency>${field('End-to-end goal (ms)', 'total', 2000, 'min="0"')}${field('Hop budgets in ms, separated by commas', 'parts', '100, 200, 1200, 150', 'text')}</form><p class="res" data-res aria-live="polite"></p>
      <h2>Work in flight (Little's law)</h2>
      <form class="calc grid" data-little>${field('Arrivals per second', 'rate', 8.3, 'min="0"')}${field('Seconds in the system', 'secs', 0.4, 'min="0"')}</form><p class="res" data-res aria-live="polite"></p>
      <h2>Payback of technical debt</h2>
      <form class="calc grid" data-debt>${field('Hours to fix', 'hours', 16, 'min="0"')}${field('Minutes lost each month', 'mins', 80, 'min="0"')}</form><p class="res" data-res aria-live="polite"></p>
      <p class="muted small">These are rough planning tools. Replace the inputs with your own measurements as soon as you have them.</p>
    </div>
    <script type="module" src="${base}tools/budget.js"></script>`;
  put('scenario/index.html', page({ title: 'Scenario checker | Architecture for Quality and Decisions', description: 'Check whether a quality scenario is testable.', canonicalPath: `${base}scenario/`, body: scenario, css }));
  put('budget/index.html', page({ title: 'Budget calculator | Architecture for Quality and Decisions', description: 'Downtime, error budgets, latency budgets, capacity and debt payback.', canonicalPath: `${base}budget/`, body: budget, css }));
}

export function writeEngine(out, w, SITE) {
  writeTools(out, w);
  engineFiles(out, w, SITE, { prefix: 'iwq-', health: 'tools/level-health.js', text: levelText });
}

const QP = {};
for (const f of fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((x) => /^part\d+\.mjs$/.test(x)).sort() : []) QP[f] = (await import(path.join(DIR, f))).default;
