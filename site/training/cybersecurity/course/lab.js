// The hands-on lab: the student's own arc42, written inside the course, one lesson at a time.
// Everything is stored in this browser (localStorage key iw-lab-doc). There is no server and no account.
// Step instructions for paid lessons are encrypted like the lessons; the document itself is always the student's.
// Text from files and from the student is only ever inserted with textContent, never as HTML.
import { $, $$, el, storage, copyText } from '/kit/dom.js';
import { parseCode, decryptLesson, CODE_KEY, LAB_KEY } from '/training/cybersecurity/course/course.js';
import { healthChecks, MAIN } from '/training/cybersecurity/course/health.js';

const readJSON = (k, d) => { try { return JSON.parse(storage.get(k) || '') ?? d; } catch { return d; } };

/* ---------- Markdown preview (small, safe, DOM-built) ---------- */

function inline(text) {
  const out = [];
  const re = /(`[^`\n]+`|\*\*[^*\n]+\*\*|_[^_\n]+_|\*[^*\n]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t[0] === '`') out.push(el('code', {}, t.slice(1, -1)));
    else if (t.startsWith('**')) out.push(el('strong', {}, t.slice(2, -2)));
    else out.push(el('em', {}, t.slice(1, -1)));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const mermaidLink = (code) => {
  const json = JSON.stringify({ code, mermaid: '{"theme":"dark"}', autoSync: true, updateDiagram: true });
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `https://mermaid.live/edit#base64:${b64}`;
};

export function renderMd(text) {
  const root = document.createDocumentFragment();
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  let i = 0;
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^```\s*(\w*)/);
    if (fence) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      const code = buf.join('\n');
      const box = el('figure', { class: 'md-code' }, el('pre', {}, el('code', {}, code)));
      if (fence[1] === 'mermaid') box.append(el('figcaption', {}, 'Mermaid diagram. ', el('a', { href: mermaidLink(code), target: '_blank', rel: 'noopener' }, 'Open it in Mermaid Live to see it drawn')));
      root.append(box); continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { root.append(el('h' + Math.min(6, h[1].length + 1), {}, inline(h[2]))); i++; continue; }
    if (/^\s*---+\s*$/.test(line)) { root.append(el('hr')); i++; continue; }
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = cells(line); i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]));
      root.append(el('div', { class: 'md-table' }, el('table', {}, el('thead', {}, el('tr', {}, head.map((c) => el('th', {}, inline(c))))), el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, inline(c)))))))));
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ''));
      root.append(el(ordered ? 'ol' : 'ul', {}, items.map((t) => el('li', {}, inline(t)))));
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      root.append(el('blockquote', {}, inline(buf.join(' ')))); continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\||>\s?|\s*([-*]|\d+\.)\s+|\s*---+\s*$)/.test(lines[i])) para.push(lines[i++]);
    if (!para.length) { para.push(lines[i++]); }
    root.append(el('p', {}, inline(para.join(' '))));
  }
  return root;
}

/* ---------- the document ---------- */

const blank = () => ({ v: 1, system: '', sections: {}, steps: {}, current: '', sec: 'head', updated: 0 });

export async function labPage() {
  const root = $('[data-lab-page]');
  const code = parseCode(storage.get(CODE_KEY) || '');
  let hasCode = false;
  if (code) { try { await decryptLesson(root.dataset.probeUrl, root.dataset.probeId, code); hasCode = true; } catch { hasCode = false; } }

  let idx;
  try { idx = await (await fetch(root.dataset.index)).json(); }
  catch { root.replaceChildren(el('p', { class: 'lead' }, 'The lab could not be loaded. Check your connection and refresh.')); root.hidden = false; return; }
  root.hidden = false;

  const secs = Object.fromEntries(idx.sections.map((s) => [s.key, s]));
  const doc = Object.assign(blank(), readJSON(LAB_KEY, {}));
  doc.sections = doc.sections || {}; doc.steps = doc.steps || {};

  const text = (k) => (doc.sections[k] !== undefined ? doc.sections[k] : secs[k].template);
  const started = (k) => doc.sections[k] !== undefined;

  /* ----- saving ----- */
  const status = $('[data-status]', root);
  let timer = 0, dirty = false;
  const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  function save() {
    clearTimeout(timer); dirty = false;
    doc.updated = Date.now();
    try { localStorage.setItem(LAB_KEY, JSON.stringify(doc)); status.textContent = `Saved on this device, ${clock()}`; status.classList.remove('is-bad'); }
    catch { status.textContent = 'Could not save here (storage is full or blocked). Download your work now.'; status.classList.add('is-bad'); }
  }
  function touch() { dirty = true; status.textContent = 'Saving…'; clearTimeout(timer); timer = setTimeout(save, 450); }
  addEventListener('pagehide', () => { if (dirty) save(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && dirty) save(); });

  /* ----- assembling the document ----- */
  const arc42 = () => {
    const sys = doc.system.trim() || 'System name';
    return [`# ${sys}: agent security assurance pack`, text('head').trim(), ...MAIN.map((k) => text(k).trim())].join('\n\n') + '\n';
  };
  const slug = () => (doc.system.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'assurance-pack');
  function download(name, content) {
    const a = el('a', { href: URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' })), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ----- header actions ----- */
  const sys = $('[data-sys]', root);
  sys.value = doc.system;
  sys.addEventListener('input', () => { doc.system = sys.value; touch(); if (view === 'whole') drawView(); runCheck(); });
  $('[data-download]', root).addEventListener('click', () => { if (dirty) save(); download(`${slug()}-assurance-pack.md`, arc42()); });
  const dlJson = $('[data-download-json]', root);
  if (dlJson) dlJson.addEventListener('click', () => {
    if (dirty) save();
    const parts = arc42().split(/^## /m), head = parts.shift();
    const sections = parts.map((t) => { const i = t.indexOf('\n'); return { heading: (i < 0 ? t : t.slice(0, i)).trim(), body: (i < 0 ? '' : t.slice(i + 1)).trim() }; });
    download(`${slug()}.json`, JSON.stringify({ system: ($('[data-sys]', root).value || '').trim(), exported: new Date().toISOString(), header: head.trim(), sections }, null, 2));
  });
  const dlAgents = $('[data-download-agents]', root);
  dlAgents.addEventListener('click', () => { if (dirty) save(); download('AGENTS.md', text('agents').trim() + '\n'); });
  const showAgents = () => { dlAgents.hidden = !started('agents'); };
  $('[data-reset]', root).addEventListener('click', () => {
    if (!confirm('Start over? This clears everything you wrote in the lab on this device. Download first if you want to keep it.')) return;
    for (const k of Object.keys(doc.sections)) delete doc.sections[k];
    doc.steps = {}; doc.system = ''; sys.value = ''; save(); openStep(idx.steps[0].id); showAgents(); drawAll();
  });
  const file = $('[data-file]', root);
  $('[data-import]', root).addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    const f = file.files[0]; file.value = '';
    if (!f) return;
    if (f.size > 1_000_000) { alert('That file is too large for the lab (over 1 MB).'); return; }
    const src = await f.text();
    const parts = src.replace(/\r\n?/g, '\n').split(/^(?=## \d+\. )/m);
    const found = parts.filter((p) => /^## \d+\. /.test(p));
    if (!found.length) { alert('No sections found. The file needs headings like "## 1. Security Foundations for the Agentic Era".'); return; }
    if (!confirm(`Import ${f.name}? It replaces the sections it contains (${found.length} found). Download your current work first if you want to keep it.`)) return;
    const first = parts[0].split('\n');
    const title = first.find((l) => /^# /.test(l));
    if (title) { doc.system = title.replace(/^#\s+/, '').replace(/:?\s*agent security assurance pack.*$/i, '').replace(/\s*[(—-].*assurance pack.*$/i, '').trim(); sys.value = doc.system; }
    const head = first.filter((l) => !/^# /.test(l)).join('\n').trim();
    if (head) doc.sections.head = head;
    for (const p of found) { const n = Number(p.match(/^## (\d+)\./)[1]); if (n >= 1 && n <= 28) doc.sections['s' + n] = p.trim(); }
    save(); drawAll();
  });

  /* ----- step bar ----- */
  const pick = $('[data-step-select]', root);
  const doneN = () => idx.steps.filter((x) => doc.steps[x.id] && doc.steps[x.id].done).length;
  function drawRail() {
    pick.replaceChildren(...idx.steps.map((s, k) => {
      const done = doc.steps[s.id] && doc.steps[s.id].done;
      const o = el('option', { value: s.id }, `${k + 1}. ${s.title}${done ? '  ✓' : ''}${!s.free && !hasCode ? '  (needs access code)' : ''}`);
      if (s.id === doc.current) o.selected = true;
      return o;
    }));
    const n = doneN();
    $('[data-prog]', root).textContent = `${n} of ${idx.steps.length} steps done`;
    $('[data-prog-fill]', root).style.width = `${Math.round((n / idx.steps.length) * 100)}%`;
    const i = idx.steps.findIndex((x) => x.id === doc.current);
    $('[data-prev]', root).disabled = i <= 0; $('[data-next]', root).disabled = i >= idx.steps.length - 1;
  }
  pick.addEventListener('change', () => openStep(pick.value));
  $('[data-prev]', root).addEventListener('click', () => { const i = idx.steps.findIndex((x) => x.id === doc.current); if (i > 0) openStep(idx.steps[i - 1].id); });
  $('[data-next]', root).addEventListener('click', () => { const i = idx.steps.findIndex((x) => x.id === doc.current); if (i < idx.steps.length - 1) openStep(idx.steps[i + 1].id); });

  /* ----- step panel ----- */
  const panel = $('[data-step-panel]', root);
  const stepsCache = {};
  async function stepDetail(s) {
    if (stepsCache[s.id]) return stepsCache[s.id];
    const url = `${root.dataset.courseUrl}data/lab-${s.id}.json`;
    let d;
    if (s.free) d = await (await fetch(url)).json();
    else { if (!hasCode) throw new Error('locked'); d = await decryptLesson(url, `lab-${s.id}`, code); }
    return (stepsCache[s.id] = d);
  }
  async function openStep(id, { focusSection = true } = {}) {
    const s = idx.steps.find((x) => x.id === id) || idx.steps[0];
    doc.current = s.id;
    if (focusSection) doc.sec = s.sections[0];
    touch(); drawRail(); drawSecs(); drawView();
    panel.replaceChildren(el('p', { class: 'muted' }, 'Loading this step…'));
    let d;
    try { d = await stepDetail(s); }
    catch {
      panel.replaceChildren(el('p', { class: 'kicker-m' }, `Step ${idx.steps.indexOf(s) + 1} · ${s.minutes} min`), el('h2', {}, s.title),
        el('p', {}, 'The instructions for this step are part of the full course. You can still write in every section of your document.'),
        el('div', { class: 'actions' }, el('a', { class: 'btn btn-primary', href: `${root.dataset.courseUrl}#get-t` }, 'Get access'), el('a', { class: 'btn btn-ghost', href: root.dataset.courseUrl }, 'Paste my access code')));
      return;
    }
    const st = doc.steps[s.id] = doc.steps[s.id] || { checks: [], done: false };
    st.checks = d.done.map((_, k) => !!st.checks[k]);
    const tick = (k, on) => { st.checks[k] = on; st.done = st.checks.every(Boolean); touch(); drawRail(); drawNext(); };
    const list = el('ul', { class: 'lab-done' }, d.done.map((t, k) => {
      const cb = el('input', { type: 'checkbox', id: `lc-${k}` });
      cb.checked = st.checks[k];
      cb.addEventListener('change', () => tick(k, cb.checked));
      return el('li', {}, el('label', { for: `lc-${k}` }, cb, el('span', {}, t)));
    }));
    const nextBox = el('div', { class: 'actions lab-next' });
    function drawNext() {
      nextBox.replaceChildren(
        el('a', { class: 'btn btn-ghost', href: `${root.dataset.courseUrl}${s.id}/` }, 'Back to the lesson'),
        st.done && s.next ? el('a', { class: 'btn btn-primary', href: `${root.dataset.courseUrl}${s.next.id}/` }, `Next lesson: ${s.next.title}`) : null,
        st.done && !s.next ? el('a', { class: 'btn btn-primary', href: root.dataset.learn }, 'Back to my course') : null);
    }
    drawNext();
    const exCard = d.example ? el('details', { class: 'lab-ex' }, el('summary', {}, 'See a model solution'), el('div', { class: 'lab-ex-body' }, renderMd(d.example))) : null;
    panel.replaceChildren(
      el('p', { class: 'kicker-m' }, `Step ${idx.steps.indexOf(s) + 1} of ${idx.steps.length} · ${s.minutes} min · after lesson ${s.lessonNum}`),
      el('h2', {}, s.title),
      el('p', { class: 'lead' }, d.brief),
      el('h3', {}, 'Do this'),
      el('ol', { class: 'lab-do' }, d.do.map((t) => el('li', {}, inline(t)))),
      el('h3', {}, 'You are done when'),
      list,
      d.experienced ? el('p', { class: 'lab-exp' }, el('strong', {}, 'Experienced? '), d.experienced) : null,
      exCard, nextBox);
  }

  /* ----- section tabs, editor, views ----- */
  const secsBox = $('[data-secs]', root), ta = $('[data-text]', root), prev = $('[data-preview]', root), snips = $('[data-snips]', root), count = $('[data-count]', root);
  let view = 'write';
  const curStep = () => idx.steps.find((x) => x.id === doc.current) || idx.steps[0];
  function drawSecs() {
    secsBox.replaceChildren();
    const cur = curStep();
    for (const s of idx.sections) {
      const b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(s.key === doc.sec), class: `chip${s.key === doc.sec ? ' is-on' : ''}${cur.sections.includes(s.key) ? ' is-step' : ''}${s.extra ? ' is-extra' : ''}`, 'data-sec': s.key },
        started(s.key) ? el('i', { class: 'dot', 'aria-hidden': 'true' }) : null, s.short, started(s.key) ? el('span', { class: 'sr' }, ' (started)') : null);
      secsBox.append(b);
    }
  }
  secsBox.addEventListener('click', (e) => { const b = e.target.closest('[data-sec]'); if (!b) return; doc.sec = b.dataset.sec; if (view === 'whole') view = 'write'; touch(); drawSecs(); drawView(); drawViewBtns(); });
  function drawSnips() {
    snips.replaceChildren(el('span', { class: 'muted small' }, 'Insert:'));
    for (const sn of secs[doc.sec].snippets || []) snips.append(el('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'data-snip': sn.label }, sn.label));
  }
  snips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-snip]'); if (!b) return;
    const sn = (secs[doc.sec].snippets || []).find((x) => x.label === b.dataset.snip);
    if (!sn) return;
    const at = ta.selectionEnd ?? ta.value.length;
    lenBefore = ta.value.length;
    const before = ta.value.slice(0, at), after = ta.value.slice(at);
    ta.value = `${before}${before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''}${sn.text}\n${after.startsWith('\n') || !after ? '' : '\n'}${after}`;
    ta.dispatchEvent(new Event('input')); ta.focus();
  });
  /* Process mirror: how the text got here (typed, pasted, or inserted from a template). Informational only. */
  const mirrorEl = $('[data-mirror]', root);
  doc.mirror = Object.assign({ typed: 0, pasted: 0, template: 0 }, doc.mirror);
  let lenBefore = 0;
  ta.addEventListener('beforeinput', () => { lenBefore = ta.value.length; });
  function drawMirror() {
    const m = doc.mirror, tot = m.typed + m.pasted + m.template;
    if (!mirrorEl) return;
    mirrorEl.hidden = tot < 200;
    if (mirrorEl.hidden) return;
    const pc = (n) => Math.round((n / tot) * 100);
    $('[data-mirror-text]', mirrorEl).textContent = `Typed by you ${pc(m.typed)}% · pasted ${pc(m.pasted)}% · inserted from templates ${pc(m.template)}%`;
    const bar = $('[data-mirror-bar]', mirrorEl);
    bar.replaceChildren(...[['typed', m.typed], ['pasted', m.pasted], ['template', m.template]].map(([c, n]) => el('i', { class: `mi-${c}`, style: `flex-grow:${n}` })));
  }
  function trackInput(e) {
    const d = ta.value.length - lenBefore;
    if (d <= 0) { lenBefore = ta.value.length; return; }
    const t = e.inputType || '';
    doc.mirror[/^insertFrom(Paste|Drop)/.test(t) ? 'pasted' : t ? 'typed' : 'template'] += d;
    lenBefore = ta.value.length; drawMirror();
  }
  ta.addEventListener('input', trackInput);
  ta.addEventListener('input', () => {
    const k = doc.sec;
    if (ta.value.trim() === secs[k].template.trim()) delete doc.sections[k]; else doc.sections[k] = ta.value;
    touch(); drawCount(); drawDots(); runCheck(); showAgents();
  });
  function drawDots() { for (const b of $$('[data-sec]', secsBox)) { const on = started(b.dataset.sec); let d = $('.dot', b); if (on && !d) b.prepend(el('i', { class: 'dot', 'aria-hidden': 'true' })); if (!on && d) d.remove(); } }
  function drawCount() { const w = (ta.value.trim().match(/\S+/g) || []).length; count.textContent = `${w} words · saved as you type · Markdown`; }
  const viewBtns = $$('[data-view]', root);
  function drawViewBtns() { for (const b of viewBtns) { const on = b.dataset.view === view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); } }
  for (const b of viewBtns) b.addEventListener('click', () => { view = b.dataset.view; drawViewBtns(); drawView(); });
  function drawView() {
    const w = view === 'write';
    ta.hidden = !w; snips.hidden = !w; prev.hidden = w; count.hidden = !w;
    if (w) { ta.value = text(doc.sec); drawSnips(); drawCount(); }
    else if (view === 'preview') prev.replaceChildren(renderMd(text(doc.sec)));
    else {
      const bar = el('div', { class: 'actions' }, el('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'data-copy': '' }, 'Copy Markdown'));
      prev.replaceChildren(bar, renderMd(arc42()));
      $('[data-copy]', prev).addEventListener('click', async (e) => { const ok = await copyText(arc42()); e.target.textContent = ok ? 'Copied' : 'Copy failed: use Download instead'; });
    }
  }

  /* ----- health check ----- */
  const chkList = $('[data-check-list]', root), chkBadge = $('[data-check-badge]', root);
  const check = () => healthChecks({ text, started, arc42 });
  function runCheck() {
    const r = check(), bad = r.filter((x) => !x.ok);
    chkBadge.textContent = bad.length ? `${bad.length} to look at` : 'All clear';
    chkBadge.classList.toggle('badge-done', !bad.length);
    import('/training/cybersecurity/course/board.js').then((m) => m.recordBuild(MAIN.filter(started).length, r.filter((x) => x.ok).length, doc.sections));
    chkList.replaceChildren(...r.map((x) => el('li', { class: x.ok ? 'ok' : 'warn' }, el('span', { class: 'ck', 'aria-hidden': 'true' }, x.ok ? '✓' : '!'), el('span', {}, el('strong', {}, x.label), x.detail ? el('span', { class: 'muted' }, ` ${x.detail}`) : null), el('span', { class: 'sr' }, x.ok ? ' passed' : ' needs attention'))));
  }

  function drawAll() { drawMirror(); drawRail(); drawSecs(); drawView(); drawViewBtns(); runCheck(); showAgents(); }

  /* ----- start: the step named in the link, else where the student left off, else the first unfinished one ----- */
  const want = new URLSearchParams(location.search).get('step');
  const firstOpen = idx.steps.find((s) => !(doc.steps[s.id] && doc.steps[s.id].done));
  const startId = idx.steps.some((s) => s.id === want) ? want : (idx.steps.some((s) => s.id === doc.current) ? doc.current : (firstOpen || idx.steps[0]).id);
  drawViewBtns();
  await openStep(startId, { focusSection: !!want || !doc.current || startId !== doc.current });
  drawMirror(); runCheck(); showAgents();
}
