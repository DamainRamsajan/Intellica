import { $, el } from '/kit/dom.js';
import { TOOLS, APPROVALS, SCENARIOS, evaluate } from './data.js';

const root = $('[data-policy]');
const show = (box, res) => {
  box.replaceChildren(
    el('p', { class: res.allow ? 'verdict is-allow' : 'verdict is-deny' }, res.allow ? 'ALLOW' : 'DENY'),
    el('ul', { class: 'rules' }, ...res.rules.map((r) => el('li', { class: r.ok ? 'ok' : 'bad' }, `${r.ok ? 'Pass' : 'Fail'}: ${r.text}`))));
};

/* playground */
const f = $('[data-play]', root), out = $('[data-play-out]', root);
const read = () => ({ tool: f.tool.value, tainted: f.tainted.checked, egress: f.egress.checked, audience_valid: f.aud.checked, token_passthrough: f.pass.checked, approval: f.approval.value });
const run = () => show(out, evaluate(read()));
f.addEventListener('input', run); run();

/* challenge */
const list = $('[data-cases]', root), score = $('[data-score]', root);
let right = 0, done = 0;
SCENARIOS.forEach((s, n) => {
  const i = s.input, res = evaluate(i);
  const fb = el('p', { class: 'fb', role: 'status' });
  const btns = ['Allow', 'Deny'].map((label) => el('button', { class: 'btn btn-ghost', type: 'button' }, label));
  const row = el('li', { class: 'case' }, el('h3', {}, `${n + 1}. ${s.title}`),
    el('p', { class: 'muted small' }, `tool ${i.tool}; tainted ${i.tainted}; egress ${i.egress}; audience valid ${i.audience_valid}; token passthrough ${i.token_passthrough}; approval: ${APPROVALS.find((a) => a[0] === i.approval)[1]}`),
    el('div', { class: 'actions' }, ...btns), fb);
  btns.forEach((b, k) => b.addEventListener('click', () => {
    btns.forEach((x) => { x.disabled = true; });
    const ok = (k === 0) === res.allow; done++; if (ok) right++;
    fb.textContent = `${ok ? 'Correct.' : 'Not quite.'} The policy says ${res.allow ? 'ALLOW' : 'DENY'}${res.failed.length ? `: ${res.failed.map((r) => r.text).join('; ')}.` : ': every rule passes.'}`;
    score.textContent = `${right} of ${done} right (${SCENARIOS.length} cases)`;
  }));
  list.append(row);
});
$('[data-tools]', f).replaceChildren(...TOOLS.map((t) => el('option', { value: t }, t)));
$('[data-approvals]', f).replaceChildren(...APPROVALS.map(([v, l]) => el('option', { value: v }, l)));
run();
