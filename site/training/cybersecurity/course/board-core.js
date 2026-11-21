// How the course scores a learner. Everything is worked out in the browser from the learner's own recorded activity;
// the public board only stores the numbers a learner chooses to share. Pure functions, no storage, no DOM.
export const DAY = 864e5;
export const GAPS = [1, 3, 7, 21];      // days until a question returns, by how many times in a row it was answered right
export const WINDOW = 3 * DAY;          // a review counts as on time within this long after it falls due
export const ACTIVE_TARGET = 12;        // active days in the last 28 that earn a full Consistency score
// Points are what the weekly and all-time boards rank. They reward doing the work (never speed).
export const POINTS = { first: 10, firstWrong: 2, review: 8, reviewLate: 4, reviewWrong: 2, section: 15, check: 10, day: 5, streakMax: 10 };
export const WEIGHTS = { recall: 0.3, build: 0.3, reviews: 0.2, consistency: 0.2 };
export const BUILD_UNITS = 18;          // 12 sections written + 6 health checks passed

/* One quiz question for one learner. q is the stored state or undefined. Returns the new state and what kind of attempt it was:
   first (counts for Recall), review (counts for Reviews) or early (too soon to count, just practice). */
export function answer(q, now, ok) {
  if (!q) return { kind: 'first', s: { firstOk: ok ? 1 : 0, box: 0, due: now + GAPS[0] * DAY, ontime: 0, late: 0 } };
  if (now < q.due) return { kind: 'early', s: q };
  const onTime = now <= q.due + WINDOW;
  const box = ok ? Math.min(q.box + 1, GAPS.length - 1) : 0;
  const gap = ok ? GAPS[box] : 1;
  return { kind: 'review', onTime, s: { ...q, box, due: now + gap * DAY, ontime: q.ontime + (onTime ? 1 : 0), late: q.late + (onTime ? 0 : 1) } };
}

export const isDue = (q, now) => !!q && now >= q.due;
export const day = (now) => new Date(now).toISOString().slice(0, 10);

/* inputs: total questions in the course, the learner's question states, active days (ISO date strings),
   build = { sections: 0-12, checks: 0-6 }. Returns four components and the overall, each 0 to 100. */
export function score({ total, qs, days, build, now }) {
  const states = Object.values(qs || {});
  const sum = (f) => states.reduce((n, q) => n + f(q), 0);
  const recall = total ? (100 * sum((q) => q.firstOk)) / total : 0;
  const done = sum((q) => q.ontime);
  const missed = sum((q) => q.late) + sum((q) => (now > q.due + WINDOW ? 1 : 0));
  const reviews = done + missed ? (100 * done) / (done + missed) : 0;
  const since = day(now - 27 * DAY);
  const active = new Set((days || []).filter((d) => d >= since && d <= day(now))).size;
  const consistency = Math.min(1, active / ACTIVE_TARGET) * 100;
  const b = build || { sections: 0, checks: 0 };
  const built = (100 * (Math.min(12, b.sections) + Math.min(6, b.checks))) / BUILD_UNITS;
  const parts = { recall, build: built, reviews, consistency };
  const overall = Object.entries(WEIGHTS).reduce((n, [k, w]) => n + w * parts[k], 0);
  const r = (x) => Math.round(x);
  return { recall: r(recall), build: r(built), reviews: r(reviews), consistency: r(consistency), overall: r(overall), answered: states.length, due: states.filter((q) => isDue(q, now)).length };
}

/* What to do next, from the learner's own numbers (never from their rank). */
export function nextStep(s, total) {
  if (!s.answered) return 'Answer the check questions at the end of a lesson to start your Recall score.';
  if (s.due) return `${s.due} ${s.due === 1 ? 'question is' : 'questions are'} due for review. Reviews are where Recall turns into memory.`;
  const lowest = ['recall', 'build', 'reviews', 'consistency'].sort((a, b) => s[a] - s[b])[0];
  return {
    recall: 'Your lowest part is Recall: finish the next lesson and answer its questions.',
    build: 'Your lowest part is Build: write the next section of your pack in the lab.',
    reviews: 'Your lowest part is Reviews: come back when questions fall due.',
    consistency: 'Your lowest part is Consistency: a short session on more days lifts it fastest.',
  }[lowest];
}

/* The week a moment belongs to: the date of its Monday, in UTC. Weeks reset every Monday at 00:00 UTC. */
export function weekKey(now) {
  const d = new Date(now), dow = (d.getUTCDay() + 6) % 7;
  return day(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
}

/* Streak: active days in a row. One missed day is forgiven; two missed days in a row end it. Today not being over yet never breaks it. */
export function streakOf(days, now) {
  const set = new Set(days || []);
  const start = set.has(day(now)) ? now : now - DAY;
  let count = 0, miss = 0;
  for (let i = 0; i < 500; i++) {
    if (set.has(day(start - i * DAY))) { count++; miss = 0; } else if (++miss >= 2) break;
  }
  return count;
}

/* Points for one answer, by the kind returned from answer(). */
export function answerPoints(kind, ok, onTime) {
  if (kind === 'first') return ok ? POINTS.first : POINTS.firstWrong;
  if (kind === 'review') return ok ? (onTime ? POINTS.review : POINTS.reviewLate) : POINTS.reviewWrong;
  return 0;
}

/* Questions the learner has got right: first try, or in a later review (a correct review moves a question up a box). */
export const mastered = (qs) => Object.values(qs || {}).filter((q) => q && (q.firstOk || q.box >= 1)).length;
/* The certificate rule: finish every lesson and the lab, and master at least 70% of the check questions. */
export const PASS_RATE = 0.7;
export function certProgress({ lessons, lessonsTotal, sections, sectionsTotal, checks, checksTotal, mastered: m, questions }) {
  const need = Math.ceil(PASS_RATE * questions);
  const met = { lessons: lessonsTotal > 0 && lessons >= lessonsTotal, lab: sections >= sectionsTotal && checks >= checksTotal, questions: questions > 0 && m >= need };
  return { met, need, earned: met.lessons && met.lab && met.questions };
}
