// Runs the real certificate API against a real SQLite database (node:sqlite) wearing a D1-shaped wrapper.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handle } from '../worker/cert-api.js';

const sqlite = new DatabaseSync(':memory:');
const stmt = (sql, args = []) => ({
  bind: (...a) => stmt(sql, a),
  first: async () => sqlite.prepare(sql).get(...args) ?? null,
  run: async () => { sqlite.prepare(sql).run(...args); return {}; },
  _run: () => sqlite.prepare(sql).run(...args),
});
const DB = { prepare: (sql) => stmt(sql), batch: async (l) => { for (const s of l) s._run(); return []; } };
const env = { DB, BOARD_PROOF: 'p1' };
const call = async (method, path, body, e = env) => {
  const res = await handle({ request: new Request('https://x.test' + path, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), env: e });
  return { status: res.status, body: await res.json() };
};
const good = { course: 'arc42', name: 'Ada Lovelace', proof: 'p1', record: { lessons: 19, sections: 12, checks: 6, mastered: 30 } };

assert.equal((await call('POST', '/api/cert/issue', good, {})).status, 503, 'no database: says so');
assert.equal((await call('POST', '/api/cert/issue', { ...good, proof: 'no' })).status, 403, 'wrong proof');
assert.equal((await call('POST', '/api/cert/issue', good, { DB })).status, 403, 'no proof configured: nobody can claim');
assert.equal((await call('POST', '/api/cert/issue', { ...good, course: 'cybersecurity' })).status, 404, 'courses that are not open issue nothing');
assert.equal((await call('POST', '/api/cert/issue', { ...good, name: '<script>' })).status, 400, 'markup in a name is refused');
assert.equal((await call('POST', '/api/cert/issue', { ...good, name: 'A' })).status, 400);
for (const bad of [{ lessons: 18 }, { sections: 11 }, { checks: 5 }, { mastered: 23 }]) {
  assert.equal((await call('POST', '/api/cert/issue', { ...good, record: { ...good.record, ...bad } })).status, 422, 'the criteria are enforced: ' + JSON.stringify(bad));
}
const r = await call('POST', '/api/cert/issue', good);
assert.equal(r.status, 200); assert.match(r.body.id, /^IC-[2-9A-HJ-NP-Z]{12}$/);
const got = await call('GET', '/api/cert/' + r.body.id);
assert.equal(got.status, 200); assert.equal(got.body.name, 'Ada Lovelace'); assert.equal(got.body.course, 'arc42');
assert.deepEqual(got.body.record, { lessons: 19, lessonsTotal: 19, sections: 12, sectionsTotal: 12, checks: 6, checksTotal: 6, mastered: 30, questions: 34 }, 'the record shows the real totals, not what the browser claimed');
assert.equal((await call('GET', '/api/cert/IC-AAAAAAAAAAAA')).status, 404, 'unknown id');
assert.equal((await call('GET', '/api/cert/not-an-id')).status, 404);
const two = await call('POST', '/api/cert/issue', good);
assert.notEqual(two.body.id, r.body.id, 'every certificate has its own ID');
console.log('certificate api: all checks passed');
