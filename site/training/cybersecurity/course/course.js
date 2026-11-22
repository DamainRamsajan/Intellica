// Online course client. Progressive enhancement: pages are complete HTML; this adds the lesson player,
// the access-code unlock, recall cards, spaced review and saved progress.
// Paid lessons are AES-256-GCM files. The access code carries the key; nothing about it is sent anywhere.
// Everything is stored in this browser only (localStorage), and every read is wrapped in try/catch.
import { $, $$, el, storage } from '/kit/dom.js';
import { b64u, parseCode, decryptLesson } from '/training/cybersecurity/course/access.js';
export { parseCode, decryptLesson };

export const CODE_KEY = 'iwc-course-code';
export const LAB_KEY = 'iwc-lab-doc'; // the student's own arc42 (see lab.js)
const PROGRESS_KEY = 'iwc-course-progress';
const REVIEW_KEY = 'iwc-course-review';
const POS_KEY = 'iwc-course-pos';
const GAPS = [1, 3, 7, 21]; // days until a card returns, by how many times it was remembered in a row

const readJSON = (k, d) => { try { return JSON.parse(storage.get(k) || '') ?? d; } catch { return d; } };
const writeJSON = (k, v) => storage.set(k, JSON.stringify(v));

/* ---------- access code ---------- */

async function codeWorks(form, code) {
  try { await decryptLesson(form.dataset.probe, form.dataset.probeId, code); return true; } catch { return false; }
}

/* ---------- unlock forms (index and locked lessons) ---------- */

async function setupUnlock(onUnlocked) {
  const forms = $$('[data-unlock]');
  if (!forms.length) return null;
  let active = null;
  const saved = parseCode(storage.get(CODE_KEY) || '');
  for (const form of forms) {
    form.hidden = false;
    const msg = $('[data-unlock-msg]', form);
    const forget = $('[data-forget]', form);
    if (saved && await codeWorks(form, saved)) {
      active = saved;
      if (form.dataset.learn) for (const a of $$('[data-course-home]')) a.setAttribute('href', form.dataset.learn);
      msg.textContent = `Unlocked${saved.name ? ` for ${saved.name}` : ''}.`;
      forget.hidden = false;
      $('input', form).hidden = true; $('label', form).hidden = true; $('[type=submit]', form).hidden = true;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = parseCode($('input', form).value);
      const raw = $('input', form).value.trim();
      if (!code && /^[A-Za-z0-9_-]{40,46}$/.test(raw) && !raw.startsWith('eyJ')) { msg.textContent = 'That is not an access code. Access codes are longer and start with "eyJ". Ask us for yours.'; return; }
      if (!code) { msg.textContent = 'That does not look like an access code. Paste the whole code from your message. It starts with "eyJ".'; return; }
      msg.textContent = 'Checking…';
      if (!(await codeWorks(form, code))) { msg.textContent = 'That code does not unlock this course. Check you pasted all of it, or ask us for a new one.'; return; }
      storage.set(CODE_KEY, $('input', form).value.trim());
      storage.set('iwc-course-just', '1');
      msg.textContent = 'Code accepted. Opening your course…';
      // from the course sales page, go straight to the learner's own page; on a lesson, stay and open the lesson
      if (document.body.dataset.course === 'index' && form.dataset.learn) location.href = form.dataset.learn; else location.reload();
    });
    forget.addEventListener('click', () => { try { localStorage.removeItem(CODE_KEY); } catch { /* ignore */ } location.reload(); });
  }
  if (active && onUnlocked) onUnlocked(active);
  return active;
}

/* ---------- progress and review ---------- */

const done = () => readJSON(PROGRESS_KEY, {});
const markDone = (id) => { const d = done(); d[id] = Date.now(); writeJSON(PROGRESS_KEY, d); };
const cardKey = (lesson, i) => `${lesson}:${i}`;

function rate(lesson, i, ok) {
  const r = readJSON(REVIEW_KEY, {});
  const k = cardKey(lesson, i);
  const box = ok ? Math.min((r[k]?.box ?? -1) + 1, GAPS.length - 1) : 0;
  r[k] = { box, due: Date.now() + (ok ? GAPS[box] : 1) * 864e5 };
  writeJSON(REVIEW_KEY, r);
}

/* ---------- the player ---------- */

/* Field guide, worked case and rubric (courses that have them). Built from data with el(), never from HTML. */
function renderReading(box, items) {
  if (!box || !items || !items.length) return;
  const table = (it) => el('div', { class: 'md-table' }, el('table', {}, el('thead', {}, el('tr', {}, it.head.map((c) => el('th', {}, c)))), el('tbody', {}, it.rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, c)))))));
  box.replaceChildren(...items.flatMap((it) => [el('h2', {}, it.h), ...(it.ps || []).map((p) => el('p', {}, p)), it.rows ? table(it) : null]));
  box.hidden = false;
}

function initPlayer(root, data, code) {
  showLabCta();
  const stage = $('[data-stage]', root), frame = $('[data-frame]', root);
  const pos = $('[data-pos]', root), prev = $('[data-prev]', root), next = $('[data-next]', root);
  const reveal = $('[data-reveal]', root), speak = $('[data-speak]', root), rateSel = $('[data-rate]', root);
  const transcript = $('[data-transcript]', root);
  const outline = $('[data-outline]', root), bar = $('[data-bar]', root), fill = $('[data-fill]', root);
  const lesson = root.dataset.lesson;
  const n = data.slides.length;
  renderReading($('[data-reading]', root.parentElement || root), data.reading);
  let i = 0, narrating = false, audio = null;

  $('[data-stage-wrap]', root).hidden = false;
  // questions that have come due for this lesson are offered straight away, without replaying the slides
  if (data.quiz && data.quiz.length) import('/training/cybersecurity/course/board.js').then((m) => { m.markActive(); m.renderQuiz($('[data-quiz]', root), lesson, data.quiz, { dueOnly: true }); });
  if (code && code.name) $('[data-licence]', root).textContent = `Licensed to ${code.name}. Please do not share this course.`;
  const canSpeak = 'speechSynthesis' in window;
  if (!canSpeak && !data.audio.some(Boolean)) speak.hidden = true;

  const theatre = $('[data-theatre]', root), full = $('[data-full]', root);
  const fit = () => {
    const fs = document.fullscreenElement === theatre;
    // in full screen the slide is as large as fits the screen, centred; otherwise it fills the column
    const s = fs ? Math.min(innerWidth / 1280, innerHeight / 720) : theatre.clientWidth / 1280;
    frame.style.width = fs ? `${Math.floor(1280 * s)}px` : '';
    stage.style.transform = `scale(${s})`;
    frame.style.height = `${Math.round(720 * s)}px`;
  };
  new ResizeObserver(fit).observe(theatre);
  document.addEventListener('fullscreenchange', fit);
  if (theatre.requestFullscreen) full.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else theatre.requestFullscreen().catch(() => {}); });
  else full.hidden = true;
  const items = data.titles.map((t, k) => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.textContent = t; b.addEventListener('click', () => show(k));
    li.append(b); outline.append(li); return li;
  });

  function show(k) {
    i = Math.max(0, Math.min(n - 1, k));
    { const p = readJSON(POS_KEY, {}); p[lesson] = i; writeJSON(POS_KEY, p); }
    const sec = document.createElement('section');
    sec.className = 's on';
    sec.innerHTML = data.slides[i]; // trusted: built by tools/build-course.mjs from our own deck; paid lessons are authenticated by AES-GCM
    stage.replaceChildren(sec);
    stage.setAttribute('aria-label', `Slide ${i + 1} of ${n}: ${data.titles[i]}`);
    pos.textContent = `${i + 1} / ${n}`;
    items.forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('seen', k < i); const b = li.firstChild; if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    const pct = Math.round(((i + 1) / n) * 100);
    fill.style.width = pct + '%'; bar.setAttribute('aria-valuenow', String(pct));
    const cur = items[i]; if (cur && cur.scrollIntoView && outline.scrollHeight > outline.clientHeight) outline.scrollTop = cur.offsetTop - outline.offsetTop - 40;
    prev.disabled = i === 0;
    next.textContent = i === n - 1 ? 'Finish' : 'Next';
    const frs = $$('.fr', sec);
    reveal.hidden = frs.length === 0;
    reveal.onclick = () => { const f = frs.find((x) => !x.classList.contains('on')); if (f) f.classList.add('on'); reveal.hidden = frs.every((x) => x.classList.contains('on')); };
    const say = document.createElement('p'); say.textContent = data.say[i];
    transcript.replaceChildren(say);
    if (data.notes[i]) { const f = document.createElement('p'); f.className = 'fnote'; f.textContent = `Facilitator note: ${data.notes[i]}`; transcript.append(f); }
    fit();
    if (narrating) narrate();
  }

  function stopNarration() {
    if (canSpeak) speechSynthesis.cancel();
    if (audio) { audio.pause(); audio = null; }
  }
  function narrate() {
    stopNarration();
    const advance = () => { if (narrating && i < n - 1) show(i + 1); else { narrating = false; speak.setAttribute('aria-pressed', 'false'); speak.textContent = 'Read aloud'; } };
    if (data.audio[i]) { audio = new Audio(data.audio[i]); audio.playbackRate = Number(rateSel.value); audio.onended = advance; audio.play().catch(advance); return; }
    if (!canSpeak) return;
    const u = new SpeechSynthesisUtterance(data.say[i]);
    u.rate = Number(rateSel.value);
    u.onend = advance;
    speechSynthesis.speak(u);
  }
  speak.addEventListener('click', () => {
    narrating = !narrating;
    speak.setAttribute('aria-pressed', String(narrating));
    speak.textContent = narrating ? 'Stop reading' : 'Read aloud';
    if (narrating) narrate(); else stopNarration();
  });
  rateSel.addEventListener('change', () => { if (narrating) narrate(); });

  prev.addEventListener('click', () => show(i - 1));
  next.addEventListener('click', () => { if (i === n - 1) finish(); else show(i + 1); });
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(e.target.tagName) && e.key === ' ') return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    // like a presenter: forward builds the next piece of the slide first, then moves on
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); if (!reveal.hidden) reveal.click(); else next.click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    if (e.key === 'f' || e.key === 'F') { e.preventDefault(); full.click(); }
  });

  function finish() {
    narrating = false; stopNarration();
    markDone(lesson);
    next.textContent = 'Finished';
    const rec = $('[data-recall]', root);
    const box = $('[data-cards]', root);
    box.replaceChildren();
    for (const k of data.cards) {
      const card = document.createElement('div'); card.className = 'rcard';
      const q = document.createElement('p'); q.textContent = `Without looking back: what do you remember about “${data.titles[k]}”?`;
      const b = document.createElement('button'); b.className = 'btn btn-ghost'; b.textContent = 'Show the answer';
      const ans = document.createElement('div'); ans.className = 'ans'; ans.hidden = true;
      const t = document.createElement('p'); t.textContent = data.say[k];
      const row = document.createElement('div'); row.className = 'actions';
      const yes = document.createElement('button'); yes.className = 'btn btn-primary'; yes.textContent = 'I remembered it';
      const no = document.createElement('button'); no.className = 'btn btn-ghost'; no.textContent = 'Not yet';
      const out = document.createElement('p'); out.className = 'muted small'; out.setAttribute('role', 'status');
      const answer = (ok) => { rate(lesson, k, ok); out.textContent = ok ? 'Good. This comes back for review later.' : 'No problem. This comes back tomorrow.'; yes.disabled = no.disabled = true; };
      yes.onclick = () => answer(true); no.onclick = () => answer(false);
      row.append(yes, no);
      ans.append(t, row, out);
      b.onclick = () => { ans.hidden = false; b.hidden = true; };
      card.append(q, b, ans);
      box.append(card);
    }
    const qb = $('[data-quiz]', root);
    if (qb && data.quiz && data.quiz.length) import('/training/cybersecurity/course/board.js').then((m) => m.renderQuiz(qb, lesson, data.quiz));
    rec.hidden = data.cards.length === 0;
    if (!rec.hidden) rec.scrollIntoView({ block: 'start' });
  }

  const resumeAt = readJSON(POS_KEY, {})[lesson];
  show(Number.isInteger(resumeAt) && resumeAt > 0 && resumeAt < n - 1 ? resumeAt : 0);
}

/* ---------- the lab, seen from lessons and from "My course" ---------- */

const readLab = () => readJSON(LAB_KEY, { sections: {}, steps: {} });

// Shown under a lesson once it is open: the hands-on step for this lesson, with a hint of where the student's own document stands.
function showLabCta() {
  const box = $('[data-lab-cta]');
  if (!box) return;
  const doc = readLab();
  const started = Object.keys(doc.sections || {}).filter((k) => /^s\d+$/.test(k)).length;
  const st = (doc.steps || {})[box.dataset.step];
  const meta = $('[data-lab-meta]', box);
  if (st && st.done) meta.textContent = 'You finished this step. Open it again to refine your work.';
  else if (started) meta.textContent = `Your assurance pack so far: ${started} of 28 sections started. This step opens where you left off.`;
  box.hidden = false;
}

function showLabCard(root) {
  const card = $('[data-lab-card]', root);
  if (!card) return;
  const ids = card.dataset.labSteps.split(','), titles = card.dataset.labTitles.split('|');
  const doc = readLab();
  const doneN = ids.filter((id) => doc.steps && doc.steps[id] && doc.steps[id].done).length;
  const nextI = ids.findIndex((id) => !(doc.steps && doc.steps[id] && doc.steps[id].done));
  const started = Object.keys(doc.sections || {}).length > 0;
  $('[data-lab-fill]', card).style.width = `${Math.round((doneN / ids.length) * 100)}%`;
  const link = $('[data-lab-link]', card);
  if (nextI < 0) { $('[data-lab-sum]', card).textContent = `All ${ids.length} lab steps finished. Your assurance pack is yours to keep: download it from the lab.`; link.textContent = 'Open your pack'; return; }
  if (started || doneN) {
    $('[data-lab-sum]', card).textContent = `${doneN} of ${ids.length} steps finished. Next: ${titles[nextI]}.`;
    link.setAttribute('href', `${link.getAttribute('href').split('?')[0]}?step=${ids[nextI]}`);
    link.textContent = 'Continue your lab';
  }
}

/* ---------- the lab demo on the course page: the same kind of check the lab runs ---------- */

function labDemo() {
  const box = $('[data-lab-demo]');
  if (!box) return;
  const ta = $('textarea', box), list = $('[data-demo-checks]', box), msg = $('[data-demo-msg]', box);
  const cells = (t) => t.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  function run() {
    const c = cells(ta.value.split('\n')[0] || '');
    const rows = [
      ['It names a quality goal (a #tag)', /#\w+/.test(ta.value)],
      ['It has a stimulus and a response', c.length >= 5 && !!c[2] && !!c[3]],
      ['The measure has a number', c.length >= 5 && /\d/.test(c[c.length - 1])]
    ];
    list.replaceChildren(...rows.map(([t, ok]) => el('li', { class: ok ? 'ok' : 'warn' }, el('span', { class: 'ck', 'aria-hidden': 'true' }, ok ? '✓' : '!'), el('span', {}, t), el('span', { class: 'lx-sr' }, ok ? ' passed' : ' needs attention'))));
    const all = rows.every(([, ok]) => ok);
    msg.textContent = all ? 'All three pass. In the lab, the health check runs checks like these across your whole document.' : ta.dataset.hint;
    msg.classList.toggle('is-ok', all);
  }
  ta.addEventListener('input', run);
  run();
  box.hidden = false;
}

/* ---------- pages ---------- */

async function lessonPage() {
  const root = $('[data-player]');
  if (root.dataset.plain) {
    try { initPlayer(root, await (await fetch(root.dataset.plain)).json(), null); }
    catch { $('[data-stage-wrap]', root).replaceChildren('The lesson could not be loaded. Check your connection and refresh.'); $('[data-stage-wrap]', root).hidden = false; }
    return;
  }
  const locked = $('[data-locked]', root);
  const url = root.dataset.enc;
  const code = await setupUnlock();
  if (!code) { locked.hidden = false; return; }
  try {
    const data = await decryptLesson(url, root.dataset.lesson, code);
    locked.hidden = true;
    initPlayer(root, data, code);
  } catch {
    locked.hidden = false;
    const msg = $('[data-unlock-msg]', locked);
    if (msg) msg.textContent = 'Your saved code does not open this lesson. Ask us for a new code.';
  }
}

function fitPreview() {
  const fig = $('[data-preview]');
  if (!fig) return;
  const frame = $('[data-frame]', fig), stage = $('[data-stage]', fig);
  fig.hidden = false;
  const fit = () => { const s = frame.clientWidth / 1280; stage.style.transform = `scale(${s})`; frame.style.height = `${Math.round(720 * s)}px`; };
  new ResizeObserver(fit).observe(frame); fit();
}

async function indexPage() {
  fitPreview();
  const code = await setupUnlock();
  const d = done();
  const rows = $$('li.lesson');
  let count = 0;
  for (const li of rows) {
    const id = li.dataset.lesson;
    const badge = $('[data-badge]', li);
    if (d[id]) { count++; badge.textContent = 'Done'; badge.classList.add('badge-done'); }
    else if (code && !li.classList.contains('is-free')) badge.textContent = 'Unlocked';
  }
  if (code) {
    const learn = $('[data-unlock]').dataset.learn;
    const banner = el('div', { class: 'unlock-banner', role: 'status' },
      el('div', {}, el('strong', {}, `You are in${code.name ? `, ${code.name}` : ''}.`),
        el('span', {}, count ? ` ${count} of ${rows.length} lessons finished on this device.` : ' All lessons are open.')),
      el('a', { class: 'btn btn-primary', href: learn }, 'Go to my course'));
    $('main').prepend(banner);
  }
  const prog = $('[data-progress]');
  if (prog && count) { prog.hidden = false; prog.textContent = `${count} of ${rows.length} lessons finished on this device.`; }
  // review: lessons with cards due today
  const r = readJSON(REVIEW_KEY, {});
  const due = {};
  for (const [k, v] of Object.entries(r)) if (v.due <= Date.now()) { const id = k.split(':')[0]; due[id] = (due[id] || 0) + 1; }
  try { const { dueByLesson: qd } = await import('/training/cybersecurity/course/board.js'); for (const [id, n] of Object.entries(qd())) due[id] = (due[id] || 0) + n; } catch { /* board.js unavailable: card reviews still work */ }
  const list = $('[data-due-list]');
  const ids = Object.keys(due).filter((id) => rows.some((li) => li.dataset.lesson === id));
  if (list && ids.length) {
    $('[data-due]').hidden = false;
    for (const id of ids) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const src = rows.find((x) => x.dataset.lesson === id);
      a.href = $('a', src).getAttribute('href');
      a.textContent = `${$('strong', src).textContent}: ${due[id]} ${due[id] === 1 ? 'question' : 'questions'} to review`;
      li.append(a); list.append(li);
    }
  }
}

function dueByLesson() {
  const r = readJSON(REVIEW_KEY, {});
  const due = {};
  for (const [k, v] of Object.entries(r)) if (v.due <= Date.now()) { const id = k.split(':')[0]; due[id] = (due[id] || 0) + 1; }
  return due;
}

async function learnPage() {
  const root = $('[data-learn-page]');
  const code = parseCode(storage.get(CODE_KEY) || '');
  let ok = false;
  if (code) { try { await decryptLesson(root.dataset.probeUrl, root.dataset.probeId, code); ok = true; } catch { ok = false; } }
  if (!ok) { location.replace(root.dataset.home); return; }
  root.hidden = false;
  if (code.name) {
    $('[data-name]', root).textContent = `, ${code.name}`;
    $('[data-licence]', root).textContent = `Licensed to ${code.name}. Please do not share this course.`;
  }
  const d = done();
  const rows = $$('li.lesson', root);
  const total = rows.length;
  let count = 0, minutesLeft = 0, next = null;
  for (const li of rows) {
    const id = li.dataset.lesson, badge = $('[data-badge]', li);
    if (d[id]) { count++; badge.textContent = 'Completed'; badge.className = 'badge badge-done'; li.classList.add('is-done'); }
    else { minutesLeft += Number(li.dataset.min) || 0; if (!next) { next = li; badge.textContent = count ? 'Up next' : 'Start here'; badge.className = 'badge badge-next'; } else badge.textContent = 'Open'; }
  }
  for (const m of $$('[data-module]', root)) {
    const lis = $$('li.lesson', m), n = lis.filter((li) => li.classList.contains('is-done')).length;
    const h = $('header', m);
    h.append(el('p', { class: 'm-prog' }, `${n} of ${lis.length} complete`));
  }
  const proofOf = async () => {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`board-v1:${code.key}`));
    return btoa(String.fromCharCode(...new Uint8Array(h))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const cc = $('[data-cert-card]', root);
  if (cc) import('/training/cybersecurity/course/cert.js').then((m) => m.certificateCard(cc, { course: cc.dataset.course, title: cc.dataset.title, lessons: count, lessonsTotal: total, name: code.name, proof: proofOf }));
  const sb = $('[data-board-card]', root);
  if (sb) import('/training/cybersecurity/course/board.js').then((m) => m.scoreboardCard(sb, async () => {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`board-v1:${code.key}`));
    return btoa(String.fromCharCode(...new Uint8Array(h))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }));
  const pct = Math.round((count / total) * 100);
  $('[data-pct]', root).textContent = `${pct}%`;
  $('[data-ring]', root).style.setProperty('--p', `${pct}`);
  $('[data-done]', root).textContent = `${count} of ${total}`;
  $('[data-left]', root).textContent = minutesLeft >= 60 ? `${(minutesLeft / 60).toFixed(1).replace(/\.0$/, '')} h` : `${minutesLeft} min`;
  $('[data-fill]', root).style.width = `${pct}%`;
  $('[data-pbar]', root).setAttribute('aria-valuenow', String(pct));
  const link = $('[data-next-link]', root);
  if (next) {
    $('[data-next-title]', root).textContent = $('strong', next).textContent;
    $('[data-next-meta]', root).textContent = `Lesson ${$('.ln', next).textContent} of ${total} · ${$('.lm', next).textContent}`;
    link.setAttribute('href', $('a', next).getAttribute('href'));
    link.textContent = count ? `Resume: lesson ${$('.ln', next).textContent}` : 'Start lesson 1';
    if (count) $('[data-resume-k]', root).textContent = 'Continue where you left off';
  } else {
    $('[data-resume-k]', root).textContent = 'Course complete';
    $('[data-next-title]', root).textContent = 'You have finished every lesson';
    $('[data-next-meta]', root).textContent = 'Review anything again, or work through the recall cards.';
    link.setAttribute('href', $('a', rows[0]).getAttribute('href')); link.textContent = 'Review from lesson 1';
  }
  showLabCard(root);
  const due = dueByLesson();
  try { const { dueByLesson: qd } = await import('/training/cybersecurity/course/board.js'); for (const [id, n] of Object.entries(qd())) due[id] = (due[id] || 0) + n; } catch { /* card reviews still work */ }
  const ids = Object.keys(due).filter((id) => rows.some((li) => li.dataset.lesson === id));
  $('[data-dueN]', root).textContent = String(ids.reduce((a, id) => a + due[id], 0));
  if (ids.length) {
    $('[data-due]', root).hidden = false;
    const list = $('[data-due-list]', root);
    for (const id of ids) {
      const src = rows.find((x) => x.dataset.lesson === id);
      list.append(el('li', {}, el('a', { href: $('a', src).getAttribute('href') }, `${$('strong', src).textContent}: ${due[id]} ${due[id] === 1 ? 'question' : 'questions'}`)));
    }
  }
  $('[data-forget-learn]', root).addEventListener('click', () => { try { localStorage.removeItem(CODE_KEY); } catch { /* ignore */ } location.replace(root.dataset.home); });
}

const kind = document.body.dataset.course;
if (['index', 'learn', 'lesson', 'lab'].includes(kind) && storage.get('iwc-order')) import('/training/cybersecurity/course/pay.js').then((m) => m.recheck());
if (kind === 'lesson') lessonPage(); else if (kind === 'index') { indexPage(); labDemo(); if (document.querySelector('[data-price]')) import('/training/cybersecurity/course/pay.js').then((m) => m.buy()); } else if (kind === 'learn') learnPage();
else if (kind === 'welcome') import('/training/cybersecurity/course/pay.js').then((m) => m.welcome());
else if (kind === 'admin') import('/training/cybersecurity/course/pay.js').then((m) => m.admin());
else if (kind === 'lab') import('/training/cybersecurity/course/lab.js').then((m) => m.labPage());
