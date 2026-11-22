import { $, el } from '/kit/dom.js';
import { downtime, errorBudget, serial, budgetSum, littles, payback } from './data.js';

const root = $('[data-budget]');
const num = (name, f) => Number(f[name].value);
const fmt = (n, d = 1) => (Number.isFinite(n) ? n.toLocaleString('en', { maximumFractionDigits: d }) : 'never');
const wire = (sel, fn) => { const f = $(sel, root), o = $(`${sel} + [data-res]`, root); const run = () => { try { o.textContent = fn(f); } catch { o.textContent = 'Check the numbers.'; } }; f.addEventListener('input', run); run(); };

wire('[data-avail]', (f) => { const a = num('target', f), d = downtime(a, 365), m = downtime(a, 30); return `${a}% allows ${fmt(d.hours)} hours (${fmt(d.minutes, 0)} min) a year, or ${fmt(m.minutes)} minutes in a 30-day month. Of ${fmt(num('reqs', f), 0)} requests, ${fmt(errorBudget(a, num('reqs', f)), 0)} may fail.`; });
wire('[data-serial]', (f) => { const list = f.list.value.split(/[,\s]+/).filter(Boolean).map(Number); if (!list.length || list.some((n) => !(n > 0 && n <= 100))) throw 0; return `${list.length} dependencies in series give about ${fmt(serial(list), 3)}% at best.`; });
wire('[data-latency]', (f) => { const parts = f.parts.value.split(/[,\s]+/).filter(Boolean).map(Number); const t = num('total', f); const r = budgetSum(parts, t); if (parts.some((n) => !(n >= 0))) throw 0; return `Hops use ${fmt(r.used, 0)} ms of ${fmt(t, 0)} ms. Reserve: ${fmt(r.reserve, 0)} ms${r.reserve < 0 ? ' (over budget)' : ''}. Largest share: ${fmt(Math.max(...r.share) * 100, 0)}%.`; });
wire('[data-little]', (f) => `About ${fmt(littles(num('rate', f), num('secs', f)), 1)} requests in flight on average. Plan for several times that as headroom.`);
wire('[data-debt]', (f) => { const m = payback(num('hours', f), num('mins', f)); return Number.isFinite(m) ? `Pays back in about ${fmt(m, 1)} months.` : 'No interest: it never pays back.'; });
