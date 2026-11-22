import { $, el } from '/kit/dom.js';
import { TRACE_BAD, TRACE_GOOD, FLAGS, checkTrace } from './data.js';

const root = $('[data-trace]');
const which = $('[data-which]', root), body = $('[data-rows]', root), res = $('[data-res]', root), code = $('[data-code]', root);
const traces = { bad: TRACE_BAD, good: TRACE_GOOD };
const label = Object.fromEntries(FLAGS);
let events = TRACE_BAD;

function draw() {
  events = traces[which.value]; res.textContent = '';
  body.replaceChildren(...events.map((e) => {
    const { step, type, ...rest } = e;
    const sel = el('select', { 'aria-label': `Violation at step ${step}`, 'data-step': step }, el('option', { value: '' }, 'No violation'), ...FLAGS.map(([v, l]) => el('option', { value: v }, l)));
    return el('tr', { 'data-row': step }, el('td', {}, String(step)), el('td', {}, type), el('td', {}, el('code', {}, JSON.stringify(rest))), el('td', {}, sel), el('td', { class: 'mark' }));
  }));
}
which.addEventListener('change', draw); draw();

$('[data-check]', root).addEventListener('click', () => {
  const want = checkTrace(events), mine = [...body.querySelectorAll('select')].map((s) => ({ step: +s.dataset.step, type: s.value })).filter((m) => m.type);
  const key = (x) => `${x.step}:${x.type}`, wk = new Set(want.map(key)), mk = new Set(mine.map(key));
  let hit = 0, miss = 0, extra = 0;
  for (const tr of body.querySelectorAll('tr')) {
    const step = +tr.dataset.row, cell = tr.querySelector('.mark'), w = want.filter((x) => x.step === step), m = mine.filter((x) => x.step === step);
    const good = w.every((x) => mk.has(key(x))) && m.every((x) => wk.has(key(x)));
    w.forEach((x) => (mk.has(key(x)) ? hit++ : miss++)); m.forEach((x) => { if (!wk.has(key(x))) extra++; });
    cell.textContent = good ? (w.length ? 'Correct' : '') : (w.length ? `Expected: ${w.map((x) => label[x.type]).join('; ')}` : 'No violation here');
    tr.classList.toggle('is-bad', !good);
  }
  res.textContent = `${hit} of ${want.length} violations found, ${miss} missed, ${extra} false alarm${extra === 1 ? '' : 's'}.${want.length === 0 && !extra ? ' This trace is clean, and you left it alone.' : ''}`;
});
$('[data-run]', root).addEventListener('click', () => {
  const f = checkTrace(events);
  res.textContent = f.length ? `Reference checker: ${f.map((x) => `step ${x.step} (${x.type})`).join(', ')}.` : 'Reference checker: no violations.';
});
code.textContent = checkTrace.toString();
