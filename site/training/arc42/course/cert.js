// "Your certificate" card on My course: shows progress against the criteria, and lets the learner claim the certificate.
import { el, storage } from '/kit/dom.js';
import { certProgress } from '/training/arc42/course/board-core.js';
import { certInputs } from '/training/arc42/course/board.js';

const KEY = (course) => `iw-cert-${course}`;
const saved = (course) => { try { return JSON.parse(storage.get(KEY(course)) || ''); } catch { return null; } };

export async function certificateCard(root, { course, title, lessons, lessonsTotal, name, proof }) {
  const inp = await certInputs();
  const rec = { lessons, lessonsTotal, sections: inp.sections, sectionsTotal: 12, checks: inp.checks, checksTotal: 6, mastered: inp.mastered, questions: inp.questions };
  const p = certProgress(rec);
  const row = (label, now, of, ok) => el('li', {}, el('span', {}, label), el('span', { class: ok ? 'ok' : '' }, `${ok ? '✓ ' : ''}${now} of ${of}`));
  const list = el('ul', { class: 'cc-list' },
    row('Lessons finished', lessons, lessonsTotal, p.met.lessons),
    row('Lab sections written', rec.sections, 12, rec.sections >= 12),
    row('Lab health checks passed', rec.checks, 6, rec.checks >= 6),
    row('Check questions mastered', rec.mastered, `${rec.questions} (need ${p.need})`, p.met.questions));
  const box = el('div', { class: 'cc-box' });
  const mine = saved(course);
  const show = (c) => box.replaceChildren(
    el('p', { class: 'cc-done' }, `Certificate issued to ${c.name}.`),
    el('p', { class: 'muted small' }, `Credential ID ${c.id}`),
    el('a', { class: 'btn btn-primary', href: `/training/certificate/?id=${c.id}` }, 'View, share and add to LinkedIn'));
  if (mine && mine.id) show(mine);
  else if (!p.earned) box.append(el('p', { class: 'muted small' }, 'Finish every lesson and the lab, and master at least 70% of the check questions. Your progress updates as you work.'));
  else {
    const input = el('input', { type: 'text', maxlength: '60', value: name || '', 'aria-label': 'Name on the certificate', autocomplete: 'name' });
    const msg = el('p', { class: 'muted small', role: 'status' });
    const btn = el('button', { class: 'btn btn-primary', type: 'submit' }, 'Claim my certificate');
    const form = el('form', { class: 'cc-row' }, el('p', { class: 'cc-done' }, 'You have met every requirement.'), el('label', { class: 'muted small' }, 'Name to print on the certificate'), input, btn, msg);
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); btn.disabled = true; msg.textContent = 'Issuing…';
      try {
        const res = await fetch('/api/cert/issue', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ course, name: input.value, proof: await proof(), record: { lessons, sections: rec.sections, checks: rec.checks, mastered: rec.mastered } }) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) { msg.textContent = out.error || 'Certificates are not available right now. Try again later.'; btn.disabled = false; return; }
        const c = { id: out.id, name: input.value.trim().replace(/\s+/g, ' ') };
        storage.set(KEY(course), JSON.stringify(c)); show(c);
      } catch { msg.textContent = 'Could not reach the certificate service. Try again in a moment.'; btn.disabled = false; }
    });
    box.append(form);
  }
  root.replaceChildren(el('h2', {}, 'Your certificate'), el('p', { class: 'muted small' }, `${title}. Verifiable, and ready for LinkedIn.`), list, box);
}
