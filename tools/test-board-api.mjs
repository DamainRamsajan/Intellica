// Runs the real board API against a real SQLite database (node:sqlite) wearing a D1-shaped wrapper.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handle } from '../worker/board-api.js';
import { weekKey } from '../site/training/arc42/course/board-core.js';

const sqlite = new DatabaseSync(':memory:');
const stmt = (sql, args = []) => ({
  bind: (...a) => stmt(sql, a),
  all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
  first: async () => sqlite.prepare(sql).get(...args) ?? null,
  run: async () => { sqlite.prepare(sql).run(...args); return {}; },
  _run: () => sqlite.prepare(sql).run(...args),
});
const DB = { prepare: (sql) => stmt(sql), batch: async (list) => { for (const s of list) s._run(); return []; } };
const PROOF = 'proof-123';
const env = { DB, BOARD_PROOF: PROOF };
const call = async (method, path, body, token, e = env) => {
  const res = await handle({ request: new Request('https://x.test' + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined }), env: e });
  return { status: res.status, body: await res.json() };
};
const wk = weekKey(Date.now());
const snap = (o) => ({ snapshot: { total: 0, week: 0, weekKey: wk, prev: 0, best: 0, streak: 0, bestStreak: 0, overall: 0, recall: 0, build: 0, reviews: 0, consistency: 0, ...o } });

assert.equal((await call('GET', '/api/board', null, null, {})).status, 200, 'no database: an empty board, not an error');
assert.equal((await call('POST', '/api/board/join', {}, null, {})).status, 503, 'no database: says so');
let r = await call('GET', '/api/board');
assert.equal(r.status, 200, 'the table creates itself on first use'); assert.deepEqual(r.body.week, []); assert.equal(r.body.learners, 0);

r = await call('POST', '/api/board/join', { handle: 'Ada', proof: 'wrong' }); assert.equal(r.status, 403, 'a wrong proof is refused');
r = await call('POST', '/api/board/join', { handle: 'Ada' }, null, { DB }); assert.equal(r.status, 403, 'no proof configured: nobody can join');
r = await call('POST', '/api/board/join', { handle: 'Intellica Staff', proof: PROOF }); assert.equal(r.status, 400, 'reserved words are refused');
r = await call('POST', '/api/board/join', { handle: '<b>x</b>', proof: PROOF }); assert.equal(r.status, 400, 'markup is refused');
r = await call('POST', '/api/board/join', { handle: 'Ada L', proof: PROOF }); assert.equal(r.status, 200); const ada = r.body.token;
r = await call('POST', '/api/board/join', { handle: 'ada l', proof: PROOF }); assert.equal(r.status, 409, 'handles are unique, ignoring case');
const names = ['Bob', 'Cy', 'Dee', 'Eve'], tok = {};
for (const n of names) tok[n] = (await call('POST', '/api/board/join', { handle: n + 'xx', proof: PROOF })).body.token;

assert.equal((await call('POST', '/api/board/sync', snap({}))).status, 401, 'no token, no sync');
assert.equal((await call('POST', '/api/board/sync', snap({}), 'f'.repeat(32))).status, 401, 'unknown token');
// scores: week and all time
await call('POST', '/api/board/sync', snap({ total: 100, week: 40, streak: 3 }), ada);
await call('POST', '/api/board/sync', snap({ total: 300, week: 10 }), tok.Bob);
await call('POST', '/api/board/sync', snap({ total: 200, week: 25 }), tok.Cy);
await call('POST', '/api/board/sync', snap({ total: 50, week: 5 }), tok.Dee);
r = await call('POST', '/api/board/sync', snap({ total: 20, week: 0 }), tok.Eve);
assert.equal(r.body.week.rank, 5, 'no points this week: last'); assert.equal(r.body.all.rank, 5);
r = await call('GET', '/api/board');
assert.deepEqual(r.body.week.map((x) => x.handle), ['Ada L', 'Cyxx', 'Bobxx', 'Deexx'], 'weekly order; learners with 0 points are not listed');
assert.deepEqual(r.body.all.map((x) => x.handle), ['Bobxx', 'Cyxx', 'Ada L', 'Deexx', 'Evexx']);
assert.ok(r.body.week.every((x) => !('id' in x) && !('token' in x)), 'tokens never leave the server');
r = await call('POST', '/api/board/sync', snap({ total: 100, week: 40, streak: 3 }), ada);
assert.equal(r.body.week.rank, 1); assert.equal(r.body.week.toPass, 0); assert.equal(r.body.all.rank, 3);
assert.deepEqual(r.body.all.around.map((x) => x.handle), ['Bobxx', 'Cyxx', 'Ada L', 'Deexx', 'Evexx'], 'two above, you, two below');
r = await call('GET', '/api/board/me', null, tok.Bob);
assert.equal(r.body.week.rank, 3); assert.equal(r.body.week.toPass, 16); assert.equal(r.body.week.passing, 'Cyxx', 'points needed to pass the next learner up');
assert.deepEqual(r.body.week.around.map((x) => x.handle), ['Ada L', 'Cyxx', 'Bobxx', 'Deexx', 'Evexx']);
// stale weeks and bad input
r = await call('POST', '/api/board/sync', snap({ total: 500, week: 999, weekKey: '2020-01-06' }), tok.Dee); assert.equal(r.body.week.pts, 0, 'a snapshot from an old week adds nothing to this week');
r = await call('POST', '/api/board/sync', snap({ total: 'x', week: -5, overall: 900 }), tok.Dee); assert.equal(r.status, 200);
assert.equal(sqliteRow(tok.Dee).overall, 100, 'values are clamped to their range'); assert.equal(sqliteRow(tok.Dee).week_pts, 0);
function sqliteRow(id) { return sqlite.prepare('SELECT * FROM learners WHERE id = ?').get(id); }
r = await call('DELETE', '/api/board/me', null, tok.Bob); assert.equal(r.body.deleted, true);
assert.equal((await call('GET', '/api/board/me', null, tok.Bob)).status, 401);
assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM learners WHERE id = ?').get(tok.Bob).n, 0, 'deleting removes the learner\'s row');
console.log('board api: all checks passed');
