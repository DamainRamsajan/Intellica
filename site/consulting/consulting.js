// Self-assessments for the Consulting page. Everything runs in the visitor's browser:
// answers and results are kept in localStorage on their own device, and leave it only if they press Share.
// All text is inserted with textContent (via el), never as HTML.
import { $, el, storage, copyText } from '/kit/dom.js';

const NS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, ...kids) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  for (const k of kids) if (k != null) e.append(k);
  return e;
};
const read = (k, d) => { try { return JSON.parse(storage.get(k) || '') ?? d; } catch { return d; } };
const write = (k, v) => { try { storage.set(k, JSON.stringify(v)); } catch { /* storage blocked: the result still shows */ } };
const KEY = (id) => `iw-assess-${id}`;

/* ---------- scoring ---------- */

export function score(a, answers) {
  let sum = 0, max = 0;
  const dims = a.dims.map((d) => {
    const got = d.qs.reduce((n, _, i) => n + (answers[d.key] ? Number(answers[d.key][i]) || 0 : 0), 0);
    const top = d.qs.length * 3;
    sum += got; max += top;
    return { key: d.key, name: d.name, short: d.short, pct: Math.round((got / top) * 100), low: d.low, high: d.high };
  });
  return { dims, overall: Math.round((sum / max) * 100) };
}
const levelOf = (levels, pct) => levels.find((l) => pct <= l.max) || levels[levels.length - 1];

/* ---------- radar ---------- */

export function radar(dims, { size = 400 } = {}) {
  const C = size / 2, R = size * 0.29, n = dims.length;
  const pt = (i, f) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [C + R * f * Math.cos(a), C + R * f * Math.sin(a)]; };
  const poly = (f) => dims.map((_, i) => pt(i, f).map((v) => v.toFixed(1)).join(',')).join(' ');
  const root = svg('svg', { viewBox: `0 0 ${size} ${size}`, class: 'rd', role: 'img', 'aria-label': `Radar chart: ${dims.map((d) => `${d.short} ${d.pct}%`).join(', ')}` });
  for (const f of [0.25, 0.5, 0.75, 1]) root.append(svg('polygon', { class: 'rd-ring', points: poly(f) }));
  dims.forEach((_, i) => { const [x, y] = pt(i, 1); root.append(svg('line', { class: 'rd-axis', x1: C, y1: C, x2: x.toFixed(1), y2: y.toFixed(1) })); });
  root.append(svg('polygon', { class: 'rd-area', points: dims.map((d, i) => pt(i, Math.max(d.pct, 4) / 100).map((v) => v.toFixed(1)).join(',')).join(' ') }));
  dims.forEach((d, i) => { const [x, y] = pt(i, Math.max(d.pct, 4) / 100); root.append(svg('circle', { class: 'rd-dot', cx: x.toFixed(1), cy: y.toFixed(1), r: 4 })); });
  dims.forEach((d, i) => {
    const [x, y] = pt(i, 1.2);
    const anchor = Math.abs(x - C) < 6 ? 'middle' : x > C ? 'start' : 'end';
    root.append(svg('text', { class: 'rd-label', x: x.toFixed(1), y: (y + 4).toFixed(1), 'text-anchor': anchor }, document.createTextNode(d.short)));
  });
  return root;
}

/* ---------- summary text ---------- */

function summary(a, r, lvl) {
  const weakest = [...r.dims].sort((x, y) => x.pct - y.pct).slice(0, 2).map((d) => d.name);
  return [`Intellica self-check: ${a.title}`, `Overall: ${r.overall}% (${lvl.name})`, '', ...r.dims.map((d) => `- ${d.name}: ${d.pct}%`), '', `Focus first: ${weakest.join('; ')}`, '', 'Self-assessment: indicative only, not an audit.'].join('\n');
}

/* ---------- the app ---------- */

export async function assessApp(host) {
  let data, wa = '';
  try { data = await (await fetch(host.dataset.src)).json(); } catch { host.replaceChildren(el('p', { class: 'muted' }, 'The assessments could not be loaded. Refresh the page to try again.')); return; }
  try { wa = (await (await fetch('/site.json')).json()).whatsapp || ''; } catch { /* sharing is optional */ }
  const A = data.assessments;
  let mode = 'pick', cur = null, step = 0, answers = {};

  const go = (m, id) => {
    mode = m; cur = id ? A.find((x) => x.id === id) : null;
    draw();
    const head = $('[data-focus]', host);
    if (head) { head.setAttribute('tabindex', '-1'); head.focus({ preventScroll: true }); host.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  };

  function saved(id) { return read(KEY(id), null); }

  function drawPick() {
    return el('div', { class: 'k-pick' }, A.map((a) => {
      const s = saved(a.id);
      const done = s && s.done;
      const inProgress = s && !s.done && s.answers && Object.keys(s.answers).length;
      return el('article', { class: 'k-a' },
        el('p', { class: 'k-a-for' }, a.for),
        el('h3', {}, a.title),
        el('p', {}, a.intro),
        el('p', { class: 'muted small' }, `About ${a.minutes} minutes · ${a.dims.reduce((n, d) => n + d.qs.length, 0)} questions`),
        el('div', { class: 'k-a-actions' },
          el('button', { type: 'button', class: 'btn btn-primary', 'data-start': a.id }, done ? 'Retake' : inProgress ? 'Continue' : 'Start'),
          done ? el('button', { type: 'button', class: 'btn btn-ghost', 'data-result': a.id }, `See my result (${score(a, s.answers).overall}%)`) : null));
    }));
  }

  function drawRun() {
    const d = cur.dims[step];
    const total = cur.dims.length;
    const have = answers[d.key] || [];
    const complete = d.qs.every((_, i) => have[i] !== undefined);
    const wrap = el('div', { class: 'k-run' },
      el('p', { class: 'kicker-m' }, `${cur.title} · ${step + 1} of ${total}`),
      el('div', { class: 'k-prog', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': step, 'aria-label': 'Progress' }, el('i', { style: null })),
      el('h3', { 'data-focus': '' }, d.name),
      d.qs.map((q, qi) => el('fieldset', { class: 'k-q' },
        el('legend', {}, q.q),
        q.a.map((txt, ai) => {
          const id = `q-${step}-${qi}-${ai}`;
          const inp = el('input', { type: 'radio', name: `q-${step}-${qi}`, id, value: String(ai) });
          inp.checked = have[qi] === ai;
          inp.addEventListener('change', () => {
            answers[d.key] = answers[d.key] || [];
            answers[d.key][qi] = ai;
            write(KEY(cur.id), { answers, step, done: false });
            $('[data-next]', host).disabled = !d.qs.every((_, i) => (answers[d.key] || [])[i] !== undefined);
          });
          return el('label', { for: id, class: 'k-opt' }, inp, el('span', {}, txt));
        }))),
      el('div', { class: 'k-nav' },
        el('button', { type: 'button', class: 'btn btn-ghost', 'data-back': '' }, step ? 'Back' : 'All assessments'),
        el('button', { type: 'button', class: 'btn btn-primary', 'data-next': '', disabled: !complete }, step === total - 1 ? 'See my result' : 'Next')));
    $('i', wrap.querySelector('.k-prog')).style.width = `${Math.round((step / total) * 100)}%`;
    return wrap;
  }

  function drawResult() {
    const r = score(cur, answers), lvl = levelOf(data.levels, r.overall);
    const order = [...r.dims].sort((x, y) => x.pct - y.pct);
    const focus = order.slice(0, 2), best = order[order.length - 1];
    const text = summary(cur, r, lvl);
    const msg = `Hello, I took the Intellica ${cur.title} self-check. Overall ${r.overall}% (${lvl.name}): ${r.dims.map((d) => `${d.short} ${d.pct}%`).join(', ')}. I would like to talk through the results.`;
    const copy = el('button', { type: 'button', class: 'btn btn-ghost' }, 'Copy summary');
    copy.addEventListener('click', async () => { copy.textContent = (await copyText(text)) ? 'Copied' : 'Copy failed'; setTimeout(() => { copy.textContent = 'Copy summary'; }, 1800); });
    const dl = el('button', { type: 'button', class: 'btn btn-ghost' }, 'Download (.md)');
    dl.addEventListener('click', () => {
      const a = el('a', { href: URL.createObjectURL(new Blob([`# ${text.split('\n')[0]}\n\n${text.split('\n').slice(1).join('\n')}\n`], { type: 'text/markdown' })), download: `intellica-${cur.id}-self-check.md` });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
    return el('div', { class: 'k-result' },
      el('p', { class: 'kicker-m' }, `${cur.title} · your result`),
      el('h3', { 'data-focus': '' }, `${r.overall}%: ${lvl.name}`),
      el('p', { class: 'lead' }, lvl.text),
      el('div', { class: 'k-res-grid' },
        el('div', { class: 'k-res-chart' }, radar(r.dims)),
        el('div', {},
          el('h4', {}, 'By dimension'),
          el('ul', { class: 'k-bars' }, r.dims.map((d) => el('li', {}, el('span', { class: 'k-bar-l' }, d.name), el('span', { class: 'k-bar' }, el('i', { style: null, 'data-w': d.pct })), el('b', {}, `${d.pct}%`)))))),
      el('h4', {}, 'Where to focus first'),
      el('ol', { class: 'k-focus' }, focus.map((d) => el('li', {}, el('strong', {}, `${d.name} (${d.pct}%)`), el('span', {}, d.pct < 50 ? d.low : d.high)))),
      el('p', { class: 'muted' }, `Your strongest area is ${best.name} (${best.pct}%). `, 'Self-assessments run optimistic: if two answers fit, the lower one is usually the honest one.'),
      el('div', { class: 'k-a-actions' },
        wa ? el('a', { class: 'btn btn-primary', href: `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, rel: 'noopener' }, 'Talk through my result') : null,
        copy, dl,
        el('button', { type: 'button', class: 'btn btn-ghost', 'data-retake': cur.id }, 'Retake'),
        el('button', { type: 'button', class: 'btn btn-ghost', 'data-all': '' }, 'All assessments')),
      el('p', { class: 'muted small' }, 'Nothing has been sent. Your answers stay on this device unless you choose to share them.'));
  }

  function draw() {
    const node = mode === 'pick' ? drawPick() : mode === 'run' ? drawRun() : drawResult();
    host.replaceChildren(...[mode === 'pick' ? el('h3', { class: 'k-pick-h', 'data-focus': '' }, 'Choose an assessment') : null, node].filter(Boolean));
    for (const i of host.querySelectorAll('.k-bar i[data-w]')) i.style.width = `${i.dataset.w}%`;
  }

  host.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.start) {
      const a = A.find((x) => x.id === t.dataset.start), s = saved(a.id);
      answers = s && !s.done && s.answers ? s.answers : {};
      step = s && !s.done && Number.isInteger(s.step) ? Math.min(s.step, a.dims.length - 1) : 0;
      go('run', a.id);
    } else if (t.dataset.result) { const a = A.find((x) => x.id === t.dataset.result); answers = saved(a.id).answers; go('result', a.id); }
    else if (t.dataset.retake) { answers = {}; step = 0; write(KEY(t.dataset.retake), { answers: {}, step: 0, done: false }); go('run', t.dataset.retake); }
    else if ('all' in t.dataset) go('pick');
    else if ('back' in t.dataset) { if (step === 0) go('pick'); else { step--; write(KEY(cur.id), { answers, step, done: false }); go('run', cur.id); } }
    else if ('next' in t.dataset) {
      if (step < cur.dims.length - 1) { step++; write(KEY(cur.id), { answers, step, done: false }); go('run', cur.id); }
      else { write(KEY(cur.id), { answers, step, done: true }); go('result', cur.id); }
    }
  });
  draw();
}

/* ---------- boot ---------- */

const app = $('#assess-app');
if (app) assessApp(app);
const sample = $('#k-sample-radar');
if (sample) sample.append(radar([{ short: 'Strategy', pct: 58 }, { short: 'Data', pct: 42 }, { short: 'Technology', pct: 67 }, { short: 'Talent', pct: 50 }, { short: 'Governance', pct: 25 }, { short: 'Culture', pct: 75 }]));
