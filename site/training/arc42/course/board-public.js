// The public leaderboard on the workshop page. Kept separate from board.js so the page stays light.
import { el, storage } from '/kit/dom.js';

const API = '/api/board';
const n0 = (n) => Number(n).toLocaleString('en-US');
async function mineView() {
  const t = storage.get('iw-board-token');
  if (!t) return null;
  try { const res = await fetch(API + '/me', { headers: { authorization: `Bearer ${t}` } }); return res.ok ? await res.json() : null; } catch { return null; }
}

export async function publicBoard(root) {
  let data = null;
  try { const res = await fetch(API); if (res.ok) data = await res.json(); } catch { /* not reachable */ }
  const mine = await mineView();
  const kinds = [['week', 'This week'], ['all', 'All time']];
  let kind = 'week';
  const draw = () => {
    const rows = (data && data[kind]) || [];
    const tabs = el('div', { class: 'lb-tabs', role: 'group', 'aria-label': 'Board' }, kinds.map(([k, label]) => { const b = el('button', { type: 'button', class: 'lb-tab', 'aria-pressed': String(k === kind), 'data-kind': k }, label); b.addEventListener('click', () => { kind = k; draw(); }); return b; }));
    const body = rows.length
      ? el('div', { class: 'lb-wrap' }, el('table', { class: 'lb-table' }, el('caption', { class: 'sr' }, kind === 'week' ? 'Top learners this week' : 'Top learners of all time'),
        el('thead', {}, el('tr', {}, ...['#', 'Learner', 'Points', 'Streak'].map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, rows.map((r, i) => el('tr', { class: mine && mine.handle === r.handle ? 'is-you' : '' }, el('th', { scope: 'row' }, String(i + 1)), el('td', { class: 'lb-h' }, r.handle), el('td', { class: 'lb-o' }, n0(r.pts)), el('td', {}, String(r.streak)))))))
      : el('p', { class: 'lb-empty' }, el('strong', {}, kind === 'week' ? 'A new week has started.' : 'The board is open.'), kind === 'week' ? ' Nobody has points yet. The first learner to earn some takes number one.' : ' No learner has joined yet. The first to join will appear here.');
    const you = mine ? el('p', { class: 'lb-you' }, `You: number ${mine[kind].rank} ${kind === 'week' ? 'this week' : 'all time'} with ${n0(mine[kind].pts)} points.${mine[kind].toPass ? ` ${n0(mine[kind].toPass)} to pass ${mine[kind].passing}.` : ''}`) : null;
    const count = data && data.learners ? el('p', { class: 'muted small' }, `${data.learners} ${data.learners === 1 ? 'learner has' : 'learners have'} joined. The weekly board starts again every Monday at 00:00 UTC. Updates about once a minute.`) : null;
    root.replaceChildren(...[tabs, body, you, count].filter(Boolean));
  };
  draw();
}
