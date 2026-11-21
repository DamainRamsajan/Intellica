// One place to enter an access code for any course. Nothing is sent to a server: the code is checked by
// decrypting one lesson file of each course in this browser, then saved under that course's own key.
import { $, el, storage } from '/kit/dom.js';
import { parseCode, decryptLesson } from '/training/access.js';

const root = $('[data-mycourses]');
const courses = JSON.parse(root.dataset.courses);
const opens = async (c, code) => { try { await decryptLesson(c.probe, c.probeId, code); return true; } catch { return false; } };

const form = $('[data-code-form]', root), input = $('input', form), msg = $('[data-msg]', root), mine = $('[data-mine]', root);

// courses this browser already holds a working code for
(async () => {
  const rows = [];
  for (const c of courses) {
    const code = parseCode(storage.get(c.store) || '');
    if (code && await opens(c, code)) rows.push(el('li', {}, el('a', { class: 'btn btn-primary', href: c.learn }, `Continue: ${c.title}`), el('span', { class: 'muted small' }, code.name ? `Licensed to ${code.name}` : '')));
  }
  if (rows.length) { mine.replaceChildren(el('h2', {}, 'Welcome back'), el('ul', { class: 'mine-list' }, ...rows)); mine.hidden = false; }
})();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim(), code = parseCode(text);
  msg.textContent = '';
  if (!code) { msg.textContent = text.length > 200 ? 'That does not look like an access code. Paste the whole code from your message.' : 'Paste the access code we sent you. It is a long line of letters and numbers.'; return; }
  msg.textContent = 'Checking…';
  for (const c of courses) {
    if (await opens(c, code)) { storage.set(c.store, text); msg.textContent = `Unlocked: ${c.title}. Opening your course…`; location.href = c.learn; return; }
  }
  msg.textContent = 'That code does not open any course here. Check you pasted the whole code, or message us and we will send it again.';
});
