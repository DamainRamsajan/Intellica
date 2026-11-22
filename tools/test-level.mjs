// Unit tests for the Level 2 practice tools and the health check.
import assert from 'node:assert/strict';
import * as D from './level-tools/data.mjs';
import { healthChecks, MAIN } from './level-health.js';
for (const c of D.CASES) assert.equal(D.lintScenario(c.text).testable, c.testable, c.text);
assert.ok(Math.abs(D.downtime(99.99, 365).minutes - 52.56) < 0.01, 'SRE book: 99.99% is 52.56 minutes a year');
assert.equal(D.errorBudget(99.99, 2500000), 250, 'SRE book: 250 errors in 2.5M requests');
assert.ok(Math.abs(D.serial([99.9, 99.9]) - 99.8) < 0.01);
assert.equal(D.payback(16, 80), 12);
assert.equal(D.littles(20, 0.25), 5);
assert.equal(D.budgetSum([100, 200, 1200, 150], 2000).reserve, 350);
// health check: a started record with real answers passes; a template fails
const tpl = (k) => `## ${k.slice(1)}. Title\n\n**Lab:** x\n\n**Task 1.** do it\n\n_Your answer._\n\n**Evidence to include:** e`;
const t = Object.fromEntries(MAIN.map((k) => [k, tpl(k)]));
const run = (m, started) => healthChecks({ text: (k) => m[k], started, arc42: () => Object.values(m).join('\n') });
assert.ok(run(t, () => false).some((c) => !c.ok));
const answer = 'Our checkout confirms ninety five percent of orders within 2 seconds at 500 orders a minute during lunchtime peak and we measure it nightly.';
const done = Object.fromEntries(MAIN.map((k) => [k, tpl(k).replace('_Your answer._', answer)]));
assert.ok(run(done, () => true).every((c) => c.ok), JSON.stringify(run(done, () => true).filter((c) => !c.ok)));
const nonum = { ...done, s3: done.s3.replace(/\d+/g, (m, o) => (o < 20 ? m : 'x')) };
assert.equal(run(nonum, () => true).filter((c) => !c.ok).length, 1);
console.log('level 2 tools: ok');
