// Verifies a credential by its ID and shows the certificate with its share actions.
import { $, el } from '/kit/dom.js';

const root = $('[data-cert-body]');
const msg = (t) => root.replaceChildren(el('p', { class: 'lead', role: 'status' }, t));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (ms) => { const d = new Date(ms); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

async function run() {
  const id = (new URLSearchParams(location.search).get('id') || '').trim().toUpperCase();
  if (!id) return msg('Add a credential ID to the address to verify a certificate, for example ?id=IC-XXXXXXXXXXXX.');
  let c;
  try {
    const res = await fetch(`/api/cert/${encodeURIComponent(id)}`);
    if (res.status === 404) return msg(`No certificate has the ID ${id}. Check the ID and try again.`);
    if (!res.ok) return msg('The certificate service is not reachable right now. Please try again in a moment.');
    c = await res.json();
  } catch { return msg('The certificate service is not reachable right now. Please try again in a moment.'); }
  let titles = {};
  try { titles = await (await fetch('/training/certificate/courses.json')).json(); } catch { /* falls back to the course id */ }
  const title = titles[c.course] || c.course, url = `${location.origin}/training/certificate/?id=${c.id}`, d = new Date(c.issued);
  const r = c.record;
  document.title = `${c.name}: ${title} | Intellica certificate`;
  const link = (label, href, ghost = true) => el('a', { class: `btn ${ghost ? 'btn-ghost' : 'btn-primary'}`, href, target: '_blank', rel: 'noopener noreferrer' }, label);
  const add = `https://www.linkedin.com/profile/add?${new URLSearchParams({ startTask: 'CERTIFICATION_NAME', name: title, organizationName: 'Intellica', issueYear: String(d.getUTCFullYear()), issueMonth: String(d.getUTCMonth() + 1), certUrl: url, certId: c.id })}`;
  const text = `I completed ${title} with Intellica Training.`;
  const copy = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Copy link');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(url); copy.textContent = 'Link copied'; } catch { copy.textContent = url; } });
  const print = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Save as PDF');
  print.addEventListener('click', () => window.print());
  root.replaceChildren(
    el('article', { class: 'cert-card', 'aria-label': 'Certificate' },
      el('p', { class: 'cert-issuer' }, 'Intellica Training certificate'),
      el('p', {}, 'This certifies that'),
      el('h2', { class: 'cert-name' }, c.name),
      el('p', {}, 'has completed'),
      el('p', { class: 'cert-course' }, title),
      el('p', { class: 'cert-meta' }, el('span', {}, `Issued ${longDate(c.issued)}`), el('span', {}, `Credential ID ${c.id}`)),
      el('p', { class: 'cert-valid' }, 'Verified: this credential exists'),
      el('p', { class: 'small' }, `Record at issue: ${r.lessons} of ${r.lessonsTotal} lessons, ${r.sections} of ${r.sectionsTotal} lab sections, ${r.checks} of ${r.checksTotal} health checks, ${r.mastered} of ${r.questions} check questions mastered.`)),
    el('div', { class: 'cert-actions' },
      link('Add to LinkedIn profile', add, false),
      link('Share on LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`),
      link('Share on X', `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url })}`),
      link('Share on Facebook', `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: url })}`),
      copy, print),
    el('p', { class: 'muted small cert-note' }, 'Intellica certificates show that the holder finished this course. They are not accredited qualifications. Anyone can confirm this one at this address.'));
}
run();
