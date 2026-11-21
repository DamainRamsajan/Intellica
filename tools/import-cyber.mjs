// Reads the cybersecurity course file (one HTML document: 20 lessons, each with 12 slides, a field guide, a worked case,
// a practical lab with model solution, a rubric and a 3-question check) and writes training-private/cybersecurity-source.json.
// Usage: node tools/import-cyber.mjs path/to/cybersecurity_course.html
// The source stays in training-private/ (model solutions and quiz answers are never published in the clear).
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Usage: node tools/import-cyber.mjs <course.html>'); process.exit(1); }
const html = fs.readFileSync(file, 'utf8');
const ent = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&');
const txt = (s) => ent(s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const all = (re, s) => [...s.matchAll(re)];

const lessonRe = /<section class="lesson" data-lesson="(\d+)" id="lesson-\d+">([\s\S]*?)(?=<section class="lesson" data-lesson="|<section class="template-zone"|$)/g;
const lessons = [];
for (const m of html.matchAll(lessonRe)) {
  const n = Number(m[1]), body = m[2];
  const head = body.match(/<header class="lesson-head">([\s\S]*?)<\/header>/)[1];
  const title = txt(head.match(/<h1>([\s\S]*?)<\/h1>/)[1]);
  const lead = txt((head.match(/<\/h1>\s*<p>([\s\S]*?)<\/p>/) || [, ''])[1]);
  const slides = all(/<article class="slide"[^>]*data-title="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g, body).map((a) => ({
    title: ent(a[1]),
    html: a[2].replace(/<div class="eyebrow">[\s\S]*?<\/div>\s*/, '').replace(/<div class="slide-refs">[\s\S]*?<\/div>\s*$/, '').trim(),
    refs: all(/href="#ref-(\d+)"/g, a[2]).map((r) => Number(r[1])).filter((v, i, x) => x.indexOf(v) === i),
  }));
  const guide = all(/<p>([\s\S]*?)<\/p>/g, (body.match(/<div class="guide-copy">([\s\S]*?)<\/div>/) || [, ''])[1]).map((p) => txt(p[1]));
  const kase = txt((body.match(/<div class="case-study">([\s\S]*?)<\/div>/) || [, ''])[1]);
  const labTitle = txt((body.match(/<h3>Practical lab · ([\s\S]*?)<\/h3>/) || [, ''])[1]);
  const lab = (body.match(/<div class="lab-panel">([\s\S]*?)<label for="work-/) || [, ''])[1];
  const labIntro = txt((lab.match(/<p>([\s\S]*?)<\/p>/) || [, ''])[1]);
  const tasks = all(/<li>([\s\S]*?)<\/li>/g, (lab.match(/<ol class="task-list">([\s\S]*?)<\/ol>/) || [, ''])[1]).map((x) => txt(x[1]));
  const evidence = txt((lab.match(/Required evidence:\s*<\/strong>([\s\S]*?)<\/p>/) || [, ''])[1]);
  const model = txt((body.match(/<details class="model-answer"[^>]*>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/) || [, ''])[1]);
  const rubric = all(/<tr><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g, (body.match(/<table class="rubric">([\s\S]*?)<\/table>/) || [, ''])[1]).map((r) => ({ criterion: txt(r[1]), missing: txt(r[2]), partial: txt(r[3]), competent: txt(r[4]) }));
  const quiz = all(/<fieldset class="quiz-question" data-correct="(\d+)" data-why="([^"]*)"><legend>([\s\S]*?)<\/legend>([\s\S]*?)<\/fieldset>/g, body).map((q) => ({
    q: txt(q[3]).replace(/^\d+\.\s*/, ''), o: all(/<label class="quiz-option">[\s\S]*?<\/label>/g, q[4]).map((l) => txt(l[0])), a: Number(q[1]), why: ent(q[2]),
  }));
  lessons.push({ n, title, lead, slides, guide, case: kase, lab: { title: labTitle, intro: labIntro, tasks, evidence, model }, rubric, quiz });
}

const refs = all(/<li id="ref-(\d+)">([\s\S]*?)<\/li>/g, html).map((r) => ({ n: Number(r[1]), text: txt(r[2]) }));
const glossary = all(/<div><strong>([\s\S]*?)<\/strong><br\/>([\s\S]*?)<\/div>/g, (html.match(/<div class="glossary-grid">([\s\S]*?)<\/div>\s*<\/section>/) || [, ''])[1]).map((g) => ({ term: txt(g[1]), def: txt(g[2]) }));
const out = { source: file.split('/').pop(), imported: new Date().toISOString().slice(0, 10), lessons, refs, glossary };
fs.mkdirSync('training-private', { recursive: true });
fs.writeFileSync('training-private/cybersecurity-source.json', JSON.stringify(out, null, 1));
const bad = [];
for (const l of lessons) {
  if (l.slides.length !== 12) bad.push(`lesson ${l.n}: ${l.slides.length} slides`);
  if (l.quiz.length !== 3) bad.push(`lesson ${l.n}: ${l.quiz.length} questions`);
  if (l.lab.tasks.length < 3 || !l.lab.model) bad.push(`lesson ${l.n}: lab incomplete`);
  if (l.guide.length < 2 || !l.case || l.rubric.length !== 4) bad.push(`lesson ${l.n}: guide/case/rubric incomplete`);
  for (const q of l.quiz) if (q.o.length !== 4 || !(q.a >= 0 && q.a < 4)) bad.push(`lesson ${l.n}: question options`);
}
console.log(`imported ${lessons.length} lessons, ${lessons.reduce((a, l) => a + l.slides.length, 0)} slides, ${lessons.reduce((a, l) => a + l.quiz.length, 0)} questions, ${lessons.reduce((a, l) => a + l.lab.tasks.length, 0)} lab tasks, ${refs.length} references, ${glossary.length} glossary terms`);
if (bad.length) { console.error('Check these:\n' + bad.join('\n')); process.exit(1); }
