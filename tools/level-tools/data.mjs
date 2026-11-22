// Pure helpers for the Level 2 practice tools. Browser and tests both import this file (it is copied to the course as data.js).
export const VAGUE = ['fast', 'quick', 'quickly', 'secure', 'user-friendly', 'easy', 'scalable', 'robust', 'reliable', 'high availability', 'highly available', 'good', 'flexible', 'efficient', 'modern', 'seamless', 'intuitive'];
const UNIT = /\d[\d,.]*\s?(ms|milliseconds?|s|sec|seconds?|min|minutes?|hours?|days?|%|percent|orders?|requests?|users?|calls?|errors?|usd|us\$|tt\$|\$)\b|\bp9[0-9]\b|\b\d+(st|nd|th)\s+percentile\b/i;
export function lintScenario(text) {
  const t = String(text || '').trim(), low = t.toLowerCase();
  const words = (t.match(/\S+/g) || []).length;
  const found = [];
  const has = (re) => re.test(t);
  const checks = [
    { id: 'number', label: 'A number with a unit (a measure you could test)', ok: has(UNIT), tip: 'Add a threshold such as "95% within 2 seconds" or "under 30 minutes".' },
    { id: 'stimulus', label: 'A stimulus or load (what happens, how much, how often)', ok: has(/\b(when|during|at \d|\d+\s*(orders?|requests?|users?|calls?)|per (second|minute|hour|day)|a (second|minute|hour)|peak|concurrent|fails?|outage|attempts?|submits?|requests?|add|adds|swap\w*|chang\w*|upgrad\w*|migrat\w*|deploy\w*|replac\w*)\b/i), tip: 'Say what triggers it and how much: "500 orders a minute at lunchtime peak".' },
    { id: 'context', label: 'A context (the situation or environment)', ok: has(/\b(during|while|when|with no|without|under|at peak|after|in (production|the region)|offline|normal operation|lunchtime|peak)\b/i), tip: 'Name the situation: peak load, offline, after a failure, a new release.' },
    { id: 'response', label: 'A response (what the system does)', ok: has(/\b(is|are|returns?|confirm\w*|refus\w*|reject\w*|complete\w*|reconcil\w*|respond\w*|revok\w*|notif\w*|logged|recover\w*|restor\w*|added|saved|sent|delivered|can)\b/i), tip: 'Say what the system does, not only how well.' },
    { id: 'percentile', label: 'A percentile or proportion for time or success (not an average)', ok: !/\b(average|mean)\b/i.test(t) && (has(/\bp9[0-9]\b|\b\d+(st|nd|th)\s+percentile\b|\b\d+(\.\d+)?\s?%/i) || !has(/\b\d+\s?(ms|milliseconds?|s|sec|seconds?)\b/i)), tip: 'Use "95% within 2 s" or "p95 under 2 s". An average hides slow requests.' },
    { id: 'vague', label: 'No vague adjectives', ok: !VAGUE.some((v) => new RegExp(`\\b${v}\\b`, 'i').test(low)), tip: 'Replace words like fast, secure, scalable with a measure.' }
  ];
  const vague = VAGUE.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(low));
  const score = checks.filter((c) => c.ok).length;
  return { checks, score, total: checks.length, vague, words, testable: score >= 5 && words >= 8 };
}
export const CASES = [
  { text: 'The system should be fast and scalable.', testable: false, why: 'Two vague adjectives, no number, no stimulus.' },
  { text: 'During lunchtime peak, 500 orders a minute are submitted; 95% are confirmed within 2 seconds.', testable: true, why: 'Context, load, response and a percentile with a threshold.' },
  { text: 'Average response time should be under 1 second.', testable: false, why: 'An average hides slow requests, and there is no load or context.' },
  { text: 'When a vendor\'s session is stolen, a change to payout details is refused without a second factor and logged within 1 minute.', testable: true, why: 'Attacker, attempt, a response and a time measure.' },
  { text: 'A developer can add a vendor in under 1 hour with no code change, measured by a timed exercise each quarter.', testable: true, why: 'A change scenario with a number and a way to measure it.' },
  { text: 'The service must be highly available and reliable.', testable: false, why: 'Vague words, no measurement rule, no period.' }
];
// Availability: allowed downtime for a target over a period of days, and the request error budget.
export function downtime(availPct, days = 365) { const f = 1 - availPct / 100; return { minutes: f * days * 1440, hours: f * days * 24 }; }
export function errorBudget(availPct, requests) { return Math.floor((1 - availPct / 100) * requests + 1e-9); }
export function serial(list) { return list.reduce((p, a) => p * (a / 100), 1) * 100; }
export function budgetSum(parts, total) { const used = parts.reduce((a, b) => a + b, 0); return { used, reserve: total - used, share: parts.map((p) => (total ? p / total : 0)) }; }
export function littles(perSecond, seconds) { return perSecond * seconds; }
export function payback(principalHours, interestMinutesPerMonth) { return interestMinutesPerMonth > 0 ? (principalHours * 60) / interestMinutesPerMonth : Infinity; }
