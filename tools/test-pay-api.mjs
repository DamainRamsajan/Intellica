// Real API code against real SQLite (D1-shaped wrapper) with a fake receipt reader.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { handle, judge, BANK } from '../worker/pay-api.js';

const sqlite = new DatabaseSync(':memory:');
const stmt = (sql, args = []) => ({
  bind: (...a) => stmt(sql, a),
  first: async () => sqlite.prepare(sql).get(...args) ?? null,
  all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
  run: async () => { sqlite.prepare(sql).run(...args); return {}; },
  _run: () => sqlite.prepare(sql).run(...args),
});
const DB = { prepare: (sql) => stmt(sql), batch: async (l) => { for (const s of l) s._run(); return []; } };
const KEY = crypto.randomBytes(32).toString('base64url');
const SECRETS = { courseKey: KEY, adminKey: 'owner-key-123' };
let reading = null;                      // what the fake "AI" returns
const AI = { run: async () => ({ response: reading === 'junk' ? 'sorry' : JSON.stringify(reading) }) };
const NOW = Date.parse('2026-11-20T15:00:00Z');
const call = async (method, path, { body, raw, headers, e } = {}) => {
  const init = { method, headers: { 'content-type': 'application/json', ...headers } };
  if (raw) { init.body = raw; init.headers['content-type'] = 'image/jpeg'; } else if (body) init.body = JSON.stringify(body);
  const res = await handle({ request: new Request('https://x.test' + path, init), env: e || { DB, SECRETS, AI }, now: NOW });
  return { status: res.status, body: await res.json() };
};
const img = (n) => crypto.randomBytes(2000 + n);
const good = (o) => ({ amount: 899, currency: 'TTD', to_account: BANK.account, date: '2026-11-20', reference: '', txn: 'RB' + crypto.randomBytes(5).toString('hex'), looks_edited: false, ...o });

// pure judge
const ord = { amount: 899, ref: 'IC-ABC234', created: NOW - 36e5 };
assert.equal(judge(good(), ord, NOW).pass, true);
assert.equal(judge(good({ to_account: '****1825' }), ord, NOW).pass, true, 'masked account: last four');
assert.equal(judge(good({ to_account: '****9999' }), ord, NOW).pass, false);
assert.equal(judge(good({ amount: 500 }), ord, NOW).pass, false, 'too little');
assert.equal(judge(good({ amount: 9000 }), ord, NOW).pass, false, 'absurdly more: look at it');
assert.equal(judge(good({ amount: 'TT$ 1,000.00' }), ord, NOW).pass, true, 'overpay with symbols');
assert.equal(judge(good({ currency: 'USD' }), ord, NOW).pass, false);
assert.equal(judge(good({ date: '2026-10-01' }), ord, NOW).pass, false, 'old receipt');
assert.equal(judge(good({ txn: '' }), ord, NOW).pass, false, 'no txn number cannot be made unique');
assert.equal(judge(good({ looks_edited: true }), ord, NOW).pass, false);
assert.equal(judge(null, ord, NOW).pass, false);

assert.equal((await call('POST', '/api/pay/order', { body: {}, e: {} })).status, 503, 'not configured: says so');
assert.equal((await call('POST', '/api/pay/order', { body: { course: 'nonexistent', name: 'Ada L', email: 'a@b.co' } })).status, 404);
assert.equal((await call('POST', '/api/pay/order', { body: { course: 'arc42', name: '<b>', email: 'a@b.co' } })).status, 400);
const order = async (name = 'Ada Lovelace') => (await call('POST', '/api/pay/order', { body: { course: 'arc42', name, email: 'ada@example.com' } })).body;

const o1 = await order();
assert.equal(o1.amount, 899); assert.match(o1.ref, /^IC-[A-Z0-9]{6}$/); assert.equal(o1.bank.account, '110000005001825');
assert.equal((await call('GET', '/api/pay/claim?o=' + o1.id)).status, 202, 'no code before payment');
reading = good({ reference: o1.ref });
const r1 = await call('POST', '/api/pay/receipt?o=' + o1.id, { raw: img(1) });
assert.equal(r1.body.status, 'paid');
const c = await call('GET', '/api/pay/claim?o=' + o1.id);
assert.equal(c.status, 200);
assert.deepEqual(JSON.parse(Buffer.from(c.body.code, 'base64url').toString()), { v: 1, b: 'Ada Lovelace', k: KEY }, 'code is what the course accepts');

// the same photo again on another order, and a reused transaction number
const o2 = await order('Bob Marley');
const o3 = await order('Cy Young');
const sameTxn = good({ txn: 'FIXEDTXN1' });
reading = sameTxn; const o4 = await order('Di Prince');
assert.equal((await call('POST', '/api/pay/receipt?o=' + o3.id, { raw: img(3) })).body.status, 'paid');
assert.equal((await call('POST', '/api/pay/receipt?o=' + o4.id, { raw: img(4) })).body.status, 'review', 'same transaction number twice: held');
{ const c4 = await call('GET', '/api/pay/claim?o=' + o4.id); assert.equal(c4.status, 200, 'held receipt: the buyer gets the course now'); assert.equal(c4.body.provisional, true); assert.ok(c4.body.code); }

// duplicate photo bytes
const photo = img(9), o5 = await order('Ed Sheeran'), o6 = await order('Fay Wray');
reading = good(); await call('POST', '/api/pay/receipt?o=' + o5.id, { raw: photo });
assert.equal((await call('POST', '/api/pay/receipt?o=' + o6.id, { raw: photo })).status, 409);

// unreadable receipt, or no reader at all: held, never unlocked
const o7 = await order('Gil Scott');
reading = 'junk';
assert.equal((await call('POST', '/api/pay/receipt?o=' + o7.id, { raw: img(7) })).body.status, 'review');
assert.equal((await call('POST', '/api/pay/receipt?o=' + o7.id, { raw: img(8), e: { DB, SECRETS } })).body.status, 'review', 'no AI binding');
assert.equal((await call('POST', '/api/pay/receipt?o=' + o7.id, { raw: Buffer.alloc(0) })).status, 413);

// owner review
assert.equal((await call('GET', '/api/pay/admin/list')).status, 401);
assert.equal((await call('GET', '/api/pay/admin/list', { headers: { 'x-admin-key': 'wrong' } })).status, 401);
const list = (await call('GET', '/api/pay/admin/list', { headers: { 'x-admin-key': SECRETS.adminKey } })).body.orders;
assert.equal(list[0].status, 'review'); assert.ok(list.find((x) => x.id === o1.id && x.status === 'paid'));
const img1 = await call('GET', '/api/pay/admin/image?id=' + list.find((x) => x.id === o7.id).receipt, { headers: { 'x-admin-key': SECRETS.adminKey } });
assert.match(img1.body.image, /^data:image\/jpeg;base64,/);
assert.equal((await call('POST', '/api/pay/admin/decide', { body: { id: o7.id, approve: true }, headers: { 'x-admin-key': SECRETS.adminKey } })).status, 200);
assert.equal((await call('GET', '/api/pay/claim?o=' + o7.id)).status, 200, 'approved by owner: unlocked');
await call('POST', '/api/pay/admin/decide', { body: { id: o4.id, approve: false }, headers: { 'x-admin-key': SECRETS.adminKey } });
assert.equal((await call('GET', '/api/pay/claim?o=' + o4.id)).status, 403, 'revoked: claim refused');
assert.equal((await call('POST', '/api/pay/receipt?o=' + o4.id, { raw: img(44) })).status, 403, 'a revoked order cannot reopen itself');
assert.equal((await call('GET', '/api/pay/region')).body.tt, false);
// the cybersecurity course: priced in TT$, and its code carries the derived key, not the arc42 one
{
  const cyc = (await call('POST', '/api/pay/order', { body: { course: 'cybersecurity', name: 'Cy Buyer', email: 'cy@example.com' } })).body;
  assert.equal(cyc.amount, 2799);
  reading = good({ amount: 2799, reference: cyc.ref });
  assert.equal((await call('POST', '/api/pay/receipt?o=' + cyc.id, { raw: img(77) })).body.status, 'paid');
  const cl = await call('GET', '/api/pay/claim?o=' + cyc.id);
  const want = crypto.createHmac('sha256', Buffer.from(KEY, 'base64url')).update('course:cybersecurity').digest('base64url');
  assert.deepEqual(JSON.parse(Buffer.from(cl.body.code, 'base64url').toString()), { v: 1, b: 'Cy Buyer', k: want });
  assert.notEqual(JSON.parse(Buffer.from(cl.body.code, 'base64url').toString()).k, KEY, 'an arc42 key never opens cybersecurity');
  assert.match(cl.body.learn, /cybersecurity/);
  const cat = JSON.parse((await import('node:fs')).readFileSync('site/training/catalog.json', 'utf8')).series.courses.find((x) => x.id === 'cybersecurity').course.price;
  const { OFFERS } = await import('../worker/pay-api.js');
  assert.equal(cat.ttd, OFFERS.cybersecurity.ttd, 'catalog TT$ price matches the payment API'); assert.equal(cat.label, 'US$' + OFFERS.cybersecurity.usd);
}
// Level 2, Quality and Decisions
{
  const q = (await call('POST', '/api/pay/order', { body: { course: 'quality-decisions', name: 'Q Buyer', email: 'q@example.com' } })).body;
  assert.equal(q.amount, 1399);
  reading = good({ amount: 1399, reference: q.ref });
  assert.equal((await call('POST', '/api/pay/receipt?o=' + q.id, { raw: img(78) })).body.status, 'paid');
  const cl = await call('GET', '/api/pay/claim?o=' + q.id);
  const want = crypto.createHmac('sha256', Buffer.from(KEY, 'base64url')).update('course:quality-decisions').digest('base64url');
  assert.equal(JSON.parse(Buffer.from(cl.body.code, 'base64url').toString()).k, want);
  assert.match(cl.body.learn, /quality-decisions/);
  const cat = JSON.parse((await import('node:fs')).readFileSync('site/training/catalog.json', 'utf8')).ladder.levels.find((x) => x.id === 'quality-decisions').course.price;
  const { OFFERS } = await import('../worker/pay-api.js');
  assert.equal(cat.ttd, OFFERS['quality-decisions'].ttd); assert.equal(cat.label, 'US$' + OFFERS['quality-decisions'].usd);
}
// owner phone alerts (ntfy): one message when a receipt is held, one when a sale passes, none without a topic
{
  const sent = [], real = globalThis.fetch;
  globalThis.fetch = async (u, i) => { sent.push([String(u), i]); return { ok: true }; };
  try {
    const on = await order('Nia Notify'); reading = 'junk';
    await call('POST', '/api/pay/receipt?o=' + on.id, { raw: img(201), e: { DB, SECRETS: { ...SECRETS, ntfyTopic: 'secret-topic' }, AI } });
    assert.equal(sent.length, 1); assert.equal(sent[0][0], 'https://ntfy.sh/secret-topic');
    assert.equal(sent[0][1].headers.Title, 'Check this receipt'); assert.equal(sent[0][1].headers.Priority, '4'); assert.match(sent[0][1].body, /Nia Notify/); assert.match(sent[0][1].body, /OPEN/);
    assert.equal((await call('GET', '/api/pay/claim?o=' + on.id)).body.provisional, true);
    const om = await order('Mo Money'); reading = good({ reference: om.ref });
    await call('POST', '/api/pay/receipt?o=' + om.id, { raw: img(202), e: { DB, SECRETS: { ...SECRETS, ntfyTopic: 'secret-topic' }, AI } });
    assert.equal(sent.length, 2); assert.equal(sent[1][1].headers.Title, 'New sale');
    const oq = await order('Quiet Q'); reading = 'junk';
    await call('POST', '/api/pay/receipt?o=' + oq.id, { raw: img(203) });
    assert.equal(sent.length, 2, 'no topic set: nothing sent');
  } finally { globalThis.fetch = real; }
}
console.log('payment api: all checks passed');
