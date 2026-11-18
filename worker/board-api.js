// The course leaderboard API: a Cloudflare Pages Function on the free plan, same origin as the site (/api/board/...).
// It stores the numbers a learner chooses to share (points, streak, four progress parts) under a handle, and ranks them.
// The browser works the scores out from the learner's own activity. Learners are trusted: nothing is graded here.
import { weekKey } from '../site/training/arc42/course/board-core.js';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS learners (
    id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE COLLATE NOCASE, created INTEGER NOT NULL,
    total INTEGER NOT NULL DEFAULT 0, week_key TEXT NOT NULL DEFAULT '', week_pts INTEGER NOT NULL DEFAULT 0,
    prev_pts INTEGER NOT NULL DEFAULT 0, best_week INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0, best_streak INTEGER NOT NULL DEFAULT 0, overall INTEGER NOT NULL DEFAULT 0,
    recall INTEGER NOT NULL DEFAULT 0, build INTEGER NOT NULL DEFAULT 0, reviews INTEGER NOT NULL DEFAULT 0, consistency INTEGER NOT NULL DEFAULT 0,
    updated INTEGER NOT NULL DEFAULT 0)`,
  'CREATE INDEX IF NOT EXISTS learners_total ON learners (total DESC)',
  'CREATE INDEX IF NOT EXISTS learners_week ON learners (week_key, week_pts DESC)',
];
const HANDLE = /^[A-Za-z][A-Za-z0-9 _.-]{2,19}$/;
const RESERVED = /(admin|official|moderator|intellica|staff|support)/i;
const json = (o, status = 200, cache = 'no-store') => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache, 'x-content-type-options': 'nosniff' } });
const bad = (m, s = 400) => json({ error: m }, s);
const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');
const int = (v, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0; };

let ready = null; // the table is created the first time the API is used, so nothing has to be set up by hand
const ensure = (db) => ready || (ready = db.batch(SCHEMA.map((s) => db.prepare(s))).catch((e) => { ready = null; throw e; }));

/* The two boards. Week: only learners who have points this week. All time: everyone. */
const BOARDS = {
  week: { col: 'week_pts', where: 'week_key = ?', args: (k) => [k] },
  all: { col: 'total', where: '1 = 1', args: () => [] },
};
const row = (r, col) => ({ handle: r.handle, pts: r[col], streak: r.streak, overall: r.overall });

async function top(db, kind, key) {
  const b = BOARDS[kind];
  const { results } = await db.prepare(`SELECT handle, ${b.col}, streak, overall FROM learners WHERE ${b.where} AND ${b.col} > 0 ORDER BY ${b.col} DESC, created ASC LIMIT 10`).bind(...b.args(key)).all();
  return results.map((r) => row(r, b.col));
}
async function around(db, kind, key, me) {
  const b = BOARDS[kind], mine = me[b.col];
  const rank = 1 + (await db.prepare(`SELECT COUNT(*) AS n FROM learners WHERE ${b.where} AND ${b.col} > ?`).bind(...b.args(key), mine).first()).n;
  const above = (await db.prepare(`SELECT handle, ${b.col}, streak, overall FROM learners WHERE ${b.where} AND ${b.col} > ? ORDER BY ${b.col} ASC, created DESC LIMIT 2`).bind(...b.args(key), mine).all()).results.map((r) => row(r, b.col)).reverse();
  const below = (await db.prepare(`SELECT handle, ${b.col}, streak, overall FROM learners WHERE ${b.where} AND ${b.col} <= ? AND id != ? ORDER BY ${b.col} DESC, created ASC LIMIT 2`).bind(...b.args(key), mine, me.id).all()).results.map((r) => row(r, b.col));
  const next = above.length ? above[above.length - 1] : null;
  return { rank, pts: mine, around: [...above, { handle: me.handle, pts: mine, you: true }, ...below], toPass: next ? next.pts - mine + 1 : 0, passing: next ? next.handle : null };
}
async function view(db, me, now) {
  const key = weekKey(now);
  const learners = (await db.prepare('SELECT COUNT(*) AS n FROM learners').first()).n;
  const m = me.week_key === key ? me : { ...me, week_pts: 0 };
  return { handle: me.handle, learners, week: await around(db, 'week', key, m), all: await around(db, 'all', key, m), weekKey: key };
}

async function board(db, now) {
  const key = weekKey(now);
  const learners = (await db.prepare('SELECT COUNT(*) AS n FROM learners').first()).n;
  return json({ learners, weekKey: key, week: await top(db, 'week', key), all: await top(db, 'all', key), at: now }, 200, 'public, max-age=30');
}

async function join(db, env, body, now) {
  const handle = String(body.handle || '').trim().replace(/\s+/g, ' ');
  if (!HANDLE.test(handle) || RESERVED.test(handle)) return bad('Choose a handle of 3 to 20 letters, numbers, spaces, dots, dashes or underscores, starting with a letter.');
  if (!env.BOARD_PROOF || body.proof !== env.BOARD_PROOF) return bad('This browser does not hold a valid access code.', 403);
  const id = hex(16);
  try { await db.prepare('INSERT INTO learners (id, handle, created) VALUES (?, ?, ?)').bind(id, handle, now).run(); }
  catch { return bad('That handle is taken. Try another.', 409); }
  return json({ token: id, handle });
}

const learner = (db, token) => (/^[0-9a-f]{32}$/.test(token || '') ? db.prepare('SELECT * FROM learners WHERE id = ?').bind(token).first() : null);

async function sync(db, me, snap, now) {
  const key = weekKey(now), s = snap && typeof snap === 'object' ? snap : {};
  const current = s.weekKey === key;
  const next = {
    total: int(s.total, 10_000_000), week_pts: current ? int(s.week, 1_000_000) : 0, prev_pts: int(s.prev, 1_000_000), best_week: int(s.best, 1_000_000),
    streak: int(s.streak, 3650), best_streak: int(s.bestStreak, 3650), overall: int(s.overall, 100),
    recall: int(s.recall, 100), build: int(s.build, 100), reviews: int(s.reviews, 100), consistency: int(s.consistency, 100),
  };
  await db.prepare('UPDATE learners SET total=?, week_key=?, week_pts=?, prev_pts=?, best_week=?, streak=?, best_streak=?, overall=?, recall=?, build=?, reviews=?, consistency=?, updated=? WHERE id=?')
    .bind(next.total, key, next.week_pts, next.prev_pts, next.best_week, next.streak, next.best_streak, next.overall, next.recall, next.build, next.reviews, next.consistency, now, me.id).run();
  return json(await view(db, { ...me, ...next, week_key: key }, now));
}

export async function handle({ request, env }) {
  const db = env.DB;
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/board\/?/, '').replace(/\/$/, '');
  const now = Date.now();
  // not set up yet: an empty public board (so the page shows its empty state), and an honest message for everything else
  if (!db) return request.method === 'GET' && route === '' ? json({ learners: 0, week: [], all: [] }, 200, 'public, max-age=60') : bad('The board is not set up yet.', 503);
  try {
    await ensure(db);
    if (request.method === 'GET' && route === '') return await board(db, now);
    if (request.method === 'POST' && route === 'join') return await join(db, env, await request.json(), now);
    const auth = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
    const me = await learner(db, auth);
    if (!me) return bad('Not signed in to the board.', 401);
    if (request.method === 'GET' && route === 'me') return json(await view(db, me, now));
    if (request.method === 'POST' && route === 'sync') return await sync(db, me, (await request.json()).snapshot, now);
    if (request.method === 'DELETE' && route === 'me') { await db.prepare('DELETE FROM learners WHERE id = ?').bind(me.id).run(); return json({ deleted: true }); }
    return bad('Not found.', 404);
  } catch (e) {
    return bad('The board is busy. Your progress is saved on this device.', 503);
  }
}
