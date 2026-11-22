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
assert.equal((await call('POST', '/api/cert/issue', { ...good, course: 'data-analytics' })).status, 404, 'courses that are not open issue nothing');
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

// cybersecurity: its proof comes from its own derived key, and the arc42 proof does not open it
{
  const crypto = await import('node:crypto');
  const master = crypto.randomBytes(32);
  const derived = crypto.createHmac('sha256', master).update('course:cybersecurity').digest('base64url');
  const proof = (k) => crypto.createHash('sha256').update('board-v1:' + k).digest('base64url');
  const e2 = { DB, BOARD_PROOF: proof(master.toString('base64url')), SECRETS: { courseKey: master.toString('base64url') } };
  const cy = { course: 'cybersecurity', name: 'Cy Buyer', proof: proof(derived), record: { lessons: 28, sections: 28, checks: 5, mastered: 59 } };
  const ok = await call('POST', '/api/cert/issue', cy, e2);
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.equal((await call('POST', '/api/cert/issue', { ...cy, proof: proof(master.toString('base64url')) }, e2)).status, 403, 'the arc42 key does not claim a cybersecurity certificate');
  assert.equal((await call('POST', '/api/cert/issue', { ...cy, record: { ...cy.record, lessons: 27 } }, e2)).status, 422);
  assert.equal((await call('POST', '/api/cert/issue', { ...good, proof: e2.BOARD_PROOF }, e2)).status, 200, 'arc42 still works with secrets present');
  const total = JSON.parse((await import('node:fs')).readFileSync('site/training/cybersecurity/course/data/board-index.json', 'utf8')).total;
  assert.equal(total, 84, 'quiz total in the course matches the certificate rule');
}
{
  const crypto = await import('node:crypto');
  const master = crypto.randomBytes(32);
  const derived = crypto.createHmac('sha256', master).update('course:quality-decisions').digest('base64url');
  const proof = (k) => crypto.createHash('sha256').update('board-v1:' + k).digest('base64url');
  const e2 = { DB, BOARD_PROOF: proof(master.toString('base64url')), SECRETS: { courseKey: master.toString('base64url') } };
  const q = { course: 'quality-decisions', name: 'Q Buyer', proof: proof(derived), record: { lessons: 20, sections: 20, checks: 6, mastered: 42 } };
  assert.equal((await call('POST', '/api/cert/issue', q, e2)).status, 200);
  assert.equal((await call('POST', '/api/cert/issue', { ...q, record: { ...q.record, checks: 5 } }, e2)).status, 422);
  assert.equal((await call('POST', '/api/cert/issue', { ...q, proof: proof(master.toString('base64url')) }, e2)).status, 403);
  const total = JSON.parse((await import('node:fs')).readFileSync('site/training/quality-decisions/course/data/board-index.json', 'utf8')).total;
  assert.equal(total, 60, 'quiz total in the Level 2 course matches the certificate rule');
}
console.log('certificate api (cybersecurity, quality-decisions): ok');
