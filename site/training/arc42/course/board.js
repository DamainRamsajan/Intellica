// The course scoreboard and leaderboard, browser side.
// Everything is worked out on this device from the learner's own activity: points, streak and four progress parts.
// Joining the public board is optional. When joined, the device shares those numbers under the learner's handle.
import { $, el, storage } from '/kit/dom.js';
import { mastered, answer, answerPoints, score, nextStep, day, isDue, weekKey, streakOf, POINTS, DAY } from '/training/arc42/course/board-core.js';

const LOCAL_KEY = 'iw-board-local', TOKEN_KEY = 'iw-board-token', INDEX_URL = '/training/arc42/course/data/board-index.json';
const API = '/api/board';
const read = () => { try { return JSON.parse(storage.get(LOCAL_KEY) || '') || {}; } catch { return {}; } };
const write = (o) => { try { storage.set(LOCAL_KEY, JSON.stringify(o)); } catch { /* storage blocked: scores simply do not persist */ } };
export const token = () => storage.get(TOKEN_KEY) || '';
const rm = (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

async function call(path, { method = 'GET', body } = {}) {
  const t = token();
  if (!t) return null;
  try {
    const res = await fetch(API + path, { method, headers: { 'content-type': 'application/json', authorization: `Bearer ${t}` }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 401) { rm(TOKEN_KEY); return null; }
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

/* ---------- points ledger ---------- */
function award(s, n, now) {
  if (!n) return;
  s.pts = s.pts || { total: 0, weeks: {} };
  const k = weekKey(now);
  s.pts.total += n; s.pts.weeks[k] = (s.pts.weeks[k] || 0) + n;
  const keep = Object.keys(s.pts.weeks).sort().slice(-12); // only the last twelve weeks are kept
  s.pts.weeks = Object.fromEntries(keep.map((x) => [x, s.pts.weeks[x]]));
}
/* A device that has history from before points existed counts it all from day one. */
function ensureLedger(s, now) {
  if (s.pts) return;
  s.pts = { total: 0, weeks: {} };
  for (const q of Object.values(s.qs || {})) s.pts.total += (q.firstOk ? POINTS.first : POINTS.firstWrong) + q.ontime * POINTS.review + q.late * POINTS.reviewLate;
  const wk = weekKey(now);
  for (const d of s.days || []) { s.pts.total += POINTS.day; if (weekKey(Date.parse(d)) === wk) s.pts.weeks[wk] = (s.pts.weeks[wk] || 0) + POINTS.day; }
  const b = s.build || { sections: 0, checks: 0 };
  s.hw = { sections: b.sections, checks: b.checks };
  s.pts.total += b.sections * POINTS.section + b.checks * POINTS.check;
}
function load(now) { const s = read(); ensureLedger(s, now); return s; }

/* ---------- recording ---------- */
function touchDay(s, now) {
  s.days = s.days || [];
  const d = day(now);
  if (s.days.includes(d)) return;
  s.days = [...s.days, d].slice(-400);
  const streak = streakOf(s.days, now);
  s.bestStreak = Math.max(s.bestStreak || 0, streak);
  award(s, POINTS.day + Math.min(streak, POINTS.streakMax), now);
}
export function markActive(now = Date.now()) { const s = load(now); touchDay(s, now); write(s); queueSync(); }
export function recordAnswer(lesson, qi, choice, ok, now = Date.now()) {
  const s = load(now); s.qs = s.qs || {};
  const r = answer(s.qs[`${lesson}:${qi}`], now, ok);
  s.qs[`${lesson}:${qi}`] = r.s;
  const pts = answerPoints(r.kind, ok, r.onTime);
  award(s, pts, now); touchDay(s, now); write(s); queueSync();
  return { kind: r.kind, pts };
}
export function recordBuild(sections, checks, _doc, now = Date.now()) {
  const s = load(now); s.build = { sections, checks };
  const hw = s.hw || { sections: 0, checks: 0 };
  award(s, Math.max(0, sections - hw.sections) * POINTS.section + Math.max(0, checks - hw.checks) * POINTS.check, now);
  s.hw = { sections: Math.max(hw.sections, sections), checks: Math.max(hw.checks, checks) };
  touchDay(s, now); write(s); queueSync();
}
export const dueQuestions = (now = Date.now()) => Object.entries(read().qs || {}).filter(([, q]) => isDue(q, now)).map(([k]) => k);
export function dueByLesson(now = Date.now()) {
  const out = {}; for (const k of dueQuestions(now)) { const l = k.split(':')[0]; out[l] = (out[l] || 0) + 1; } return out;
}
export async function quizTotal() { try { return (await (await fetch(INDEX_URL)).json()).total; } catch { return 0; } }

/* Everything the scoreboard shows, from this device. */
export async function myStats(now = Date.now()) {
  const s = load(now); write(s);
  const scores = score({ total: await quizTotal(), qs: s.qs, days: s.days, build: s.build, now });
  const weeks = s.pts.weeks, wk = weekKey(now), prevKey = weekKey(now - 7 * DAY);
  const past = Object.entries(weeks).filter(([k]) => k !== wk).map(([, v]) => v);
  return { scores, total: s.pts.total, week: weeks[wk] || 0, prev: weeks[prevKey] || 0, best: past.length ? Math.max(...past) : 0, streak: streakOf(s.days, now), bestStreak: s.bestStreak || 0, weekKey: wk };
}

/* ---------- sharing with the public board (only when joined) ---------- */
let pending = false;
function queueSync() {
  if (!token() || pending) return;
  pending = true;
  setTimeout(() => { pending = false; syncNow(); }, 15000); // at most one update every 15 seconds; the last change is always included
}
export async function syncNow() {
  if (!token()) return null;
  const m = await myStats();
  const snapshot = { total: m.total, week: m.week, weekKey: m.weekKey, prev: m.prev, best: m.best, streak: m.streak, bestStreak: m.bestStreak, overall: m.scores.overall, recall: m.scores.recall, build: m.scores.build, reviews: m.scores.reviews, consistency: m.scores.consistency };
  return call('/sync', { method: 'POST', body: { snapshot } });
}

/* ---------- check questions in a lesson ---------- */
export function renderQuiz(box, lesson, quiz, { dueOnly = false } = {}) {
  const now = Date.now(), due = new Set(dueQuestions(now));
  const items = quiz.map((q, i) => ({ q, i })).filter(({ i }) => !dueOnly || due.has(`${lesson}:${i}`));
  box.hidden = !items.length; if (!items.length) return;
  box.replaceChildren(
    el('h2', {}, dueOnly ? 'Review: questions due today' : 'Check yourself'),
    el('p', { class: 'sub' }, dueOnly ? 'These come back on a schedule of 1, 3, 7 and 21 days. Answering on time earns more points and raises your Reviews score.' : 'Two questions on this lesson. Answer from memory: your first answer earns the most points.'),
    ...items.map(({ q, i }) => {
      const name = `q-${lesson}-${i}`;
      const out = el('p', { class: 'qz-out', role: 'status' });
      const opts = q.o.map((t, k) => el('label', { class: 'qz-o' }, el('input', { type: 'radio', name, value: String(k) }), el('span', {}, t)));
      const fs = el('fieldset', { class: 'qz' }, el('legend', {}, q.q), ...opts, out);
      fs.addEventListener('change', (e) => {
        const choice = Number(e.target.value), ok = choice === q.a;
        const r = recordAnswer(lesson, i, choice, ok);
        fs.querySelectorAll('input').forEach((x) => { x.disabled = true; });
        opts[q.a].classList.add('is-right'); if (!ok) opts[choice].classList.add('is-wrong');
        const note = r.kind === 'early' ? 'Practice: this question was already scored.' : `${r.kind === 'review' ? 'Review recorded. ' : ''}+${r.pts} ${r.pts === 1 ? 'point' : 'points'}.`;
        out.textContent = `${ok ? 'Correct.' : 'Not quite.'} ${q.why} ${note}`;
      });
      return fs;
    }));
}

/* ---------- the learner's own scoreboard (My course) ---------- */
const PARTS = [['recall', 'Recall', 'first-try answers to check questions'], ['build', 'Build', 'sections written and health checks passed in your lab document'], ['reviews', 'Reviews', 'questions answered on time when they came due'], ['consistency', 'Consistency', 'active days in the last 28 (12 gives full marks)']];
const pct = (n) => `${n}%`;
const n0 = (n) => Number(n).toLocaleString('en-US');
function bars(s) {
  return el('ul', { class: 'sb-parts' }, PARTS.map(([k, name, hint]) => el('li', {},
    el('span', { class: 'sb-name' }, name), el('span', { class: 'sb-n' }, pct(s[k])),
    el('span', { class: 'sb-bar', 'aria-hidden': 'true' }, el('i', { style: `width:${s[k]}%` })), el('span', { class: 'sb-hint muted' }, hint))));
}
function aroundList(list) {
  return el('ol', { class: 'sb-around' }, list.map((r) => el('li', { class: r.you ? 'is-you' : '' }, el('span', { class: 'sb-ah' }, r.you ? `${r.handle} (you)` : r.handle), el('span', { class: 'sb-ap' }, `${n0(r.pts)} pts`))));
}
/* The target for the week: beat your best week, or last week, or just get going. */
function weekGoal(m) {
  const mark = Math.max(m.best, m.prev);
  if (!mark) return { text: m.week ? 'This is your first week on the board. Whatever you reach sets the bar.' : 'Answer a question or write a section to start your first week.', pct: m.week ? 100 : 0 };
  if (m.week > mark) return { text: `New personal best: ${n0(m.week)} points, ${n0(m.week - mark)} above your previous high of ${n0(mark)}.`, pct: 100 };
  return { text: `${n0(mark - m.week + 1)} more ${mark - m.week + 1 === 1 ? 'point' : 'points'} to beat your ${m.best >= m.prev ? 'best week' : 'last week'} (${n0(mark)}).`, pct: Math.round((100 * m.week) / mark) };
}
export async function scoreboardCard(root, proofFn) {
  const draw = async () => {
    markActive();
    const m = await myStats(), joined = !!token();
    const live = joined ? await syncNow() : null;
    const goal = weekGoal(m);
    const head = el('div', { class: 'sb-hero' },
      el('div', { class: 'sb-big' }, el('strong', {}, n0(m.week)), el('span', {}, 'Points this week')),
      el('div', { class: 'sb-big' }, el('strong', {}, String(m.streak)), el('span', {}, m.streak === 1 ? 'Day streak' : 'Days streak')),
      el('div', { class: 'sb-big' }, el('strong', {}, String(m.scores.overall)), el('span', {}, 'Overall, out of 100')));
    const target = el('div', { class: 'sb-goal' }, el('p', { class: 'sb-goal-t' }, goal.text),
      el('span', { class: 'sb-bar', 'aria-hidden': 'true' }, el('i', { style: `width:${goal.pct}%` })),
      el('p', { class: 'muted small' }, `Last week ${n0(m.prev)} · Best week ${n0(Math.max(m.best, m.prev))} · All time ${n0(m.total)} · Best streak ${m.bestStreak}. Weeks start Monday 00:00 UTC. One missed day never breaks a streak; two in a row do.`));
    const parts = [el('h2', {}, 'Your progress'), head, target, el('p', { class: 'sb-next' }, nextStep(m.scores, 0)), bars(m.scores)];
    if (joined && live) {
      const w = live.week;
      parts.push(el('div', { class: 'sb-rank' },
        el('h3', {}, `Number ${w.rank} this week of ${live.learners}. Number ${live.all.rank} all time.`),
        w.toPass ? el('p', { class: 'sb-pass' }, `${n0(w.toPass)} ${w.toPass === 1 ? 'point' : 'points'} to pass ${w.passing}.`) : el('p', { class: 'sb-pass' }, w.rank === 1 && m.week ? 'You lead this week. Keep your lead.' : 'Earn points to enter this week’s board.'),
        aroundList(w.around)),
      el('p', { class: 'muted small' }, `You are on the public board as ${live.handle}. Ranks update about every 15 seconds while you work.`),
      el('button', { class: 'btn btn-ghost', type: 'button', 'data-leave': '' }, 'Remove me from the board'));
    } else if (joined) {
      parts.push(el('p', { class: 'muted small' }, 'The board is not reachable right now. Your progress is saved on this device and will be shared when it is back.'),
        el('button', { class: 'btn btn-ghost', type: 'button', 'data-leave': '' }, 'Remove me from the board'));
    } else parts.push(joinForm());
    root.replaceChildren(...parts);
    const leave = $('[data-leave]', root);
    if (leave) leave.addEventListener('click', async () => { await call('/me', { method: 'DELETE' }); rm(TOKEN_KEY); draw(); });
  };
  function joinForm() {
    const msg = el('p', { class: 'muted small', role: 'status', 'data-join-msg': '' });
    const input = el('input', { type: 'text', maxlength: '20', autocomplete: 'off', 'aria-label': 'Handle', placeholder: 'Choose a handle', 'data-handle': '' });
    const btn = el('button', { class: 'btn btn-primary', type: 'submit' }, 'Join the board');
    const form = el('form', { class: 'sb-join' }, el('h3', {}, 'Compete on the public leaderboard'),
      el('p', { class: 'muted small' }, 'Optional. Your points, streak and progress so far all count from day one. Others see your handle and numbers only. You can leave at any time and your record is deleted.'),
      el('div', { class: 'sb-row' }, input, btn), msg);
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); btn.disabled = true; msg.textContent = 'Joining…';
      try {
        const res = await fetch(API + '/join', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ handle: input.value, proof: await proofFn() }) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) { msg.textContent = out.error || 'The board is not available right now. Your progress is still kept on this device.'; btn.disabled = false; return; }
        storage.set(TOKEN_KEY, out.token);
        draw();
      } catch { msg.textContent = 'The board is not reachable. Your progress is still kept on this device.'; btn.disabled = false; }
    });
    return form;
  }
  await draw();
}

/* Raw numbers the certificate rule needs, from this device. */
export async function certInputs() {
  const s = read(), b = s.build || { sections: 0, checks: 0 };
  return { sections: b.sections, checks: b.checks, mastered: mastered(s.qs), questions: await quizTotal() };
}
