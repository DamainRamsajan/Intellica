// The quality and decisions record's health check, as a pure function (copied into the course by tools/level-course.mjs).
// It checks structure and effort, never "correctness": a design needs a human reviewer, and the rubric is there for that.
export const MAIN = Array.from({ length: 20 }, (_, i) => 's' + (i + 1));
const words = (t) => (t.match(/\S+/g) || []).length;

export function healthChecks({ text, started, arc42 }) {
  const out = [];
  const t = arc42();
  const miss = MAIN.filter((k) => !new RegExp(`^## ${k.slice(1)}\\. `, 'm').test(text(k)));
  out.push({ ok: !miss.length, label: 'All 20 section headings are present', detail: miss.length ? `Missing: ${miss.map((k) => '§' + k.slice(1)).join(', ')}` : '' });
  const todo = MAIN.filter((k) => !started(k));
  out.push({ ok: !todo.length, label: 'Every section has been started', detail: todo.length ? `Still the template: ${todo.map((k) => '§' + k.slice(1)).join(', ')}` : '' });
  const open = [];
  for (const k of MAIN.filter(started)) {
    const parts = text(k).split(/^\*\*Task (\d+)\.\*\*/m);
    for (let i = 1; i < parts.length; i += 2) {
      const body = parts[i + 1].split('\n').slice(1).join('\n').split(/\*\*Evidence to include:\*\*/)[0].replace(/_Your answer\._/g, '');
      if (words(body) < 12) open.push(`§${k.slice(1)} task ${parts[i]}`);
    }
  }
  out.push({ ok: !open.length, label: 'Every task in a started section has a real answer (12 words or more)', detail: open.length ? `Needs an answer: ${open.slice(0, 8).join(', ')}${open.length > 8 ? '…' : ''}` : '' });
  const left = MAIN.filter((k) => started(k) && /_Your answer\._/.test(text(k)));
  out.push({ ok: !left.length, label: 'No placeholder text left in started sections', detail: left.length ? `Placeholders in: ${left.map((k) => '§' + k.slice(1)).join(', ')}` : '' });
  // Quality scenarios, budgets and risks only work with numbers: sections 2 to 6 and 18 must each contain at least one digit in the learner's own answers.
  const numeric = ['s2', 's3', 's4', 's5', 's6', 's18'].filter((k) => started(k) && !/\d/.test(text(k).split('\n').filter((l) => !/^\*\*(Lab|Task \d+|Evidence to include:)(\.|\*\*)/.test(l) && !/^## /.test(l)).join('\n')));
  out.push({ ok: !numeric.length, label: 'Quality, budget and risk sections contain numbers', detail: numeric.length ? `No numbers in: ${numeric.map((k) => '§' + k.slice(1)).join(', ')}` : '' });
  const risky = /([\w.+-]+@[\w-]+\.[\w.]+)|(\b(password|passwd|secret|api[_ -]?key|token)\s*[:=]\s*\S+)|([A-Za-z0-9+/_-]{32,})/i.test(t.replace(/`[^`]*`/g, ''));
  out.push({ ok: !risky, label: 'Nothing that looks confidential', detail: risky ? 'Found something that looks like an email address, a key or a password. Remove real secrets before you share this record.' : '' });
  return out;
}
