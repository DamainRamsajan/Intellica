// The lab's health check as a pure function. The lab page uses it to show feedback, and the leaderboard
// server runs the same code on the document a learner submits, so the Build score is computed, not claimed.
export const MAIN = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12'];
const ID = /\b(?:ADR-\d{4}|TD\d+|[CQR]\d+)\b/g;

/* text(k): the current text of section k. started(k): the learner has written beyond the template.
   arc42(): the whole assembled document. Returns [{ ok, label, detail }]. */
export function healthChecks({ text, started, arc42 }) {
  const out = [];
  const t = arc42();
  const miss = MAIN.filter((k) => !new RegExp(`^## ${k.slice(1)}\\. `, 'm').test(text(k)));
  out.push({ ok: !miss.length, label: 'All 12 section headings are present', detail: miss.length ? `Missing: ${miss.map((k) => '§' + k.slice(1)).join(', ')}` : '' });
  const todo = MAIN.filter((k) => !started(k));
  out.push({ ok: !todo.length, label: 'Every section has been written', detail: todo.length ? `Still the template: ${todo.map((k) => '§' + k.slice(1)).join(', ')}` : '' });
  const defined = new Set(), mentions = {};
  for (const line of t.split('\n')) {
    const m = line.match(/^\|\s*((?:ADR-\d{4}|TD\d+|[CQR]\d+))\s*\|/) || line.match(/^###\s+(ADR-\d{4}):/);
    if (m) defined.add(m[1]);
    for (const x of line.match(ID) || []) (mentions[x] = mentions[x] || []).push(line);
  }
  const loose = [...defined].filter((i) => !(mentions[i] || []).some((l) => !(new RegExp(`^\\|\\s*${i}\\s*\\||^###\\s+${i}`).test(l))));
  const undef = Object.keys(mentions).filter((i) => !defined.has(i));
  out.push({ ok: !loose.length && !undef.length, label: 'IDs (C1, Q1, ADR-0001, R1) are defined and used elsewhere', detail: [undef.length ? `Used but never defined: ${undef.join(', ')}` : '', loose.length ? `Defined but never referenced: ${loose.join(', ')}` : ''].filter(Boolean).join('. ') });
  const noNum = [];
  for (const line of text('s10').split('\n')) { const c = line.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim()); if (/^Q\d+$/.test(c[0]) && c.length >= 5 && !/\d|\bzero\b/i.test(c[c.length - 1])) noNum.push(c[0]); }
  out.push({ ok: !noNum.length, label: 'Every quality scenario has a number in its measure', detail: noNum.length ? `No number: ${noNum.join(', ')}` : '' });
  const adrs = text('s9').split(/^(?=### ADR-)/m).filter((b) => /^### ADR-/.test(b));
  const weak = adrs.filter((b) => !/options?:[^\n]*(;|\bor\b|\bvs\b)/i.test(b) || !/consequences?:[^\n]*\b(bad|negative|downside|cost|risk)/i.test(b)).map((b) => b.match(/ADR-\d{4}/)[0]);
  out.push({ ok: adrs.length > 0 && !weak.length, label: 'Each decision lists two options and a bad consequence', detail: !adrs.length ? 'No decision written yet' : weak.length ? `Check: ${weak.join(', ')}` : '' });
  const risky = /([\w.+-]+@[\w-]+\.[\w.]+)|(\b(password|passwd|secret|api[_ -]?key|token)\s*[:=]\s*\S+)|([A-Za-z0-9+/_-]{32,})/i.test(t.replace(/`[^`]*`/g, ''));
  out.push({ ok: !risky, label: 'Nothing that looks confidential', detail: risky ? 'Found something that looks like an email address, a key or a password. Check before you share this document.' : '' });
  return out;
}
