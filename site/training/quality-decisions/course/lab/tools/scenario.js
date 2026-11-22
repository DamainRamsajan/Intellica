import { $, el } from '/kit/dom.js';
import { lintScenario, CASES } from './data.js';

const root = $('[data-scenario]');
const ta = $('[data-text]', root), out = $('[data-out]', root);
const render = () => {
  const r = lintScenario(ta.value);
  if (!ta.value.trim()) { out.replaceChildren(el('p', { class: 'muted' }, 'Type or paste a scenario to check it.')); return; }
  out.replaceChildren(
    el('p', { class: r.testable ? 'verdict is-allow' : 'verdict is-deny', role: 'status' }, `${r.score} of ${r.total}: ${r.testable ? 'testable' : 'not yet testable'}`),
    el('ul', { class: 'rules' }, ...r.checks.map((c) => el('li', { class: c.ok ? 'ok' : 'bad' }, `${c.ok ? 'Pass' : 'Fix'}: ${c.label}${c.ok ? '' : '. ' + c.tip}`))),
    r.vague.length ? el('p', { class: 'muted small' }, `Vague words found: ${r.vague.join(', ')}.`) : '');
};
ta.addEventListener('input', render); render();

const list = $('[data-cases]', root), score = $('[data-score]', root);
let right = 0, done = 0;
CASES.forEach((s, n) => {
  const fb = el('p', { class: 'fb', role: 'status' });
  const btns = ['Testable', 'Not testable'].map((label) => el('button', { class: 'btn btn-ghost', type: 'button' }, label));
  btns.forEach((b, k) => b.addEventListener('click', () => {
    btns.forEach((x) => { x.disabled = true; });
    const ok = (k === 0) === s.testable; done++; if (ok) right++;
    fb.textContent = `${ok ? 'Correct.' : 'Not quite.'} ${s.why}`;
    score.textContent = `${right} of ${done} right`;
  }));
  list.append(el('li', { class: 'case' }, el('h3', {}, `${n + 1}.`), el('p', {}, s.text), el('div', { class: 'actions' }, ...btns), fb));
});
