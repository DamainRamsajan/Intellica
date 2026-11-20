// Unit tests for the scoring rules used by the browser. Run: node tools/test-board.mjs
import assert from 'node:assert/strict';
import { answer, answerPoints, score, day, DAY, GAPS, WINDOW, weekKey, streakOf, POINTS, mastered, certProgress } from '../site/training/arc42/course/board-core.js';
import { healthChecks } from '../site/training/arc42/course/health.js';

const t0 = Date.UTC(2026, 10, 1, 12);
let q = answer(undefined, t0, true);
assert.equal(q.kind, 'first'); assert.equal(q.s.firstOk, 1); assert.equal(q.s.due, t0 + DAY);
assert.equal(answer(q.s, t0 + 3600e3, true).kind, 'early', 'too soon to count');
let r = answer(q.s, t0 + DAY, true);
assert.equal(r.kind, 'review'); assert.equal(r.onTime, true); assert.equal(r.s.box, 1); assert.equal(r.s.due, t0 + DAY + GAPS[1] * DAY);
let w = answer(r.s, r.s.due, false);
assert.equal(w.s.box, 0, 'a wrong review resets the box'); assert.equal(w.s.due, r.s.due + DAY);
const late = answer(q.s, t0 + DAY + WINDOW + 1, true);
assert.equal(late.onTime, false); assert.equal(late.s.late, 1);
let top = r.s; for (let i = 0; i < 6; i++) top = answer(top, top.due, true).s;
assert.equal(top.box, 3, 'box stops at the last gap');
assert.equal(answer(undefined, t0, false).s.firstOk, 0);

// points
assert.equal(answerPoints('first', true), POINTS.first); assert.equal(answerPoints('first', false), POINTS.firstWrong);
assert.equal(answerPoints('review', true, true), POINTS.review); assert.equal(answerPoints('review', true, false), POINTS.reviewLate);
assert.equal(answerPoints('review', false, true), POINTS.reviewWrong); assert.equal(answerPoints('early', true), 0, 'practice earns nothing');
// weeks start on Monday 00:00 UTC
assert.equal(weekKey(Date.UTC(2026, 10, 16, 0, 0)), '2026-11-16');
assert.equal(weekKey(Date.UTC(2026, 10, 15, 23, 59)), '2026-11-09', 'Sunday belongs to the week before');
assert.equal(weekKey(Date.UTC(2026, 10, 22, 23, 59)), '2026-11-16');
// streaks: one missed day is forgiven, two in a row end it, today not being over never breaks it
const ds = (...offsets) => offsets.map((o) => day(t0 - o * DAY));
assert.equal(streakOf([], t0), 0);
assert.equal(streakOf(ds(0, 1, 2), t0), 3);
assert.equal(streakOf(ds(1, 2, 3), t0), 3, 'today is still open');
assert.equal(streakOf(ds(0, 2, 3), t0), 3, 'one missed day is forgiven');
assert.equal(streakOf(ds(0, 3, 4), t0), 1, 'two missed days in a row end it');
assert.equal(streakOf(ds(0, 2, 4, 5), t0), 4, 'a forgiven day can happen more than once');
assert.equal(streakOf(ds(2, 3), t0), 2, 'yesterday missed, day before active: still alive');
assert.equal(streakOf(ds(3, 4), t0), 0, 'nothing for two days: over');

const none = score({ total: 34, qs: {}, days: [], build: null, now: t0 });
assert.deepEqual([none.recall, none.build, none.reviews, none.consistency, none.overall], [0, 0, 0, 0, 0]);
const qs = {}; for (let i = 0; i < 34; i++) qs['l:' + i] = { firstOk: 1, box: 0, due: t0 + DAY, ontime: 2, late: 0 };
const days = Array.from({ length: 12 }, (_, i) => day(t0 - i * DAY));
const full = score({ total: 34, qs, days, build: { sections: 12, checks: 6 }, now: t0 });
assert.equal(full.overall, 100); assert.equal(full.consistency, 100);
const half = score({ total: 34, qs: Object.fromEntries(Object.entries(qs).slice(0, 17)), days: days.slice(0, 6), build: { sections: 6, checks: 3 }, now: t0 });
assert.equal(half.recall, 50); assert.equal(half.build, 50); assert.equal(half.consistency, 50);
assert.equal(half.overall, Math.round(0.3 * 50 + 0.3 * 50 + 0.2 * 100 + 0.2 * 50));
const missed = score({ total: 1, qs: { a: { firstOk: 1, box: 0, due: t0 - 10 * DAY, ontime: 0, late: 0 } }, days: [], build: null, now: t0 });
assert.equal(missed.reviews, 0, 'an overdue review counts as missed');
assert.equal(score({ total: 1, qs: {}, days: [day(t0 - 40 * DAY)], build: null, now: t0 }).consistency, 0, 'old days fall out of the 28-day window');
const tpl = (k) => `## ${k.slice(1)}. Title\n_template_`;
const res = healthChecks({ text: tpl, started: () => false, arc42: () => Array.from({ length: 12 }, (_, i) => tpl('s' + (i + 1))).join('\n') });
assert.equal(res.length, 6); assert.equal(res[0].ok, true); assert.equal(res[1].ok, false);
// certificate rule
assert.equal(mastered({ a: { firstOk: 1, box: 0 }, b: { firstOk: 0, box: 0 }, c: { firstOk: 0, box: 1 } }), 2, 'first try, or right in a later review');
const base = { lessons: 19, lessonsTotal: 19, sections: 12, sectionsTotal: 12, checks: 6, checksTotal: 6, mastered: 24, questions: 34 };
assert.equal(certProgress(base).earned, true); assert.equal(certProgress(base).need, 24, '70% of 34 rounds up to 24');
assert.equal(certProgress({ ...base, mastered: 23 }).earned, false);
assert.equal(certProgress({ ...base, lessons: 18 }).earned, false);
assert.equal(certProgress({ ...base, checks: 5 }).earned, false);
assert.equal(certProgress({ ...base, questions: 0, mastered: 0 }).earned, false, 'no questions loaded: not earned');
console.log('board core: all checks passed');
