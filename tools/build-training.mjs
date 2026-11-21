#!/usr/bin/env node
// Generates the /training/ pages from site/training/training.json.
//   site/training/index.html            training index
//   site/training/<id>/index.html       workshop page
//   site/training/<id>/guide/           student guide
//   site/training/<id>/register/        registration
// and the "Training" block on the home page (between the training-home markers in site/index.html).
// The content is real HTML, so it works without JavaScript and search engines can read it.
// training.js only adds conveniences (deadline countdown, saved checklists, copy buttons, mail form).
// Safe to run repeatedly. Usage: node tools/build-training.mjs

import fs from 'node:fs';
import path from 'node:path';
import { researchHtml, boardHtml } from './lab-html.mjs';
import { page, esc, kicker, cols, base } from './training-shell.mjs';
import { courseTiles, featuredBlock, catalogSections, certificateBlock, allLevels, levelPath } from './catalog-html.mjs';

const SITE = path.resolve('site');
const catalog = JSON.parse(fs.readFileSync(path.join(SITE, 'training', 'catalog.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(SITE, 'training', 'training.json'), 'utf8'));
// the first lesson that is encrypted: decrypting it proves a saved access code works
const probeId = (w) => w.course.modules.flatMap((m) => m.lessons).find((id) => !(w.course.free || []).includes(id));
const family = JSON.parse(fs.readFileSync(path.join(SITE, 'family.json'), 'utf8'));

const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

function write(rel, html) {
  const file = path.join(SITE, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}


/* ---------- workshop pieces ---------- */

function ebText(w) {
  const p = w.price;
  return `Early-bird price ${p.label} until ${p.earlyUntilLabel}.`;
}

function mailtoHref(w) {
  const subject = `${w.title}: reserve a seat (${w.dateShort})`;
  const body = 'Name:\nEmail:\nTeam or organisation (optional):\nAnything we should know:\n';
  return `mailto:${w.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function subnav(w, active) {
  const items = [['', 'Workshop'], ...(w.course && w.course.enabled ? [['course/', 'Online course']] : []), ['example/', 'Worked example'], ['guide/', 'Student guide'], ['register/', 'Register']];
  return `    <nav class="subnav" aria-label="${esc(w.title)}">
      <p class="crumb"><a href="/training/">Training</a><span aria-hidden="true"> / </span>${esc(w.title)}</p>
      <ul>${items.map(([p, l]) => `<li><a href="${w.path}${p}"${p === active ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}<li><a class="sn-code" href="/training/my-courses/">Enter access code</a></li></ul>
    </nav>`;
}


function heroTitle(w) {
  const h = w.hero;
  if (!h || !h.title) return esc(w.headline);
  const t = esc(h.title), k = esc(h.highlight || '');
  return k && t.includes(k) ? t.replace(k, `<span class="hl">${k}</span>`) : t;
}

// The twelve sections as a picker: tap one to see the question it answers. Plain links without JavaScript.
function sheet(w) {
  return `<div class="sheet" aria-label="The twelve arc42 sections">
        <p class="sheet-k">Tap a section to see the question it answers.</p>
        <div class="cells">${w.sections.map(([name, q], i) => `<a class="cell" href="#twelve-${i + 1}" data-q="${esc(q)}"><b>${i + 1}</b><span>${esc(name)}</span></a>`).join('')}</div>
        <p class="sheet-q" data-sheet-q aria-live="polite">Start with section 1.</p>
      </div>`;
}

function factsheet(w) {
  return `<dl class="factsheet">
        <div><dt>Date</dt><dd>${esc(w.dateLong)}</dd></div>
        <div><dt>Time</dt><dd>${esc(w.time)}</dd></div>
        <div><dt>Place</dt><dd>${esc(w.venue)}</dd></div>
        <div><dt>Format</dt><dd>${esc(w.format)}</dd></div>
        <div><dt>Price</dt><dd><strong>${esc(w.price.label)}</strong> per person. ${esc(w.included)}<span class="eb" data-eb data-until="${w.price.earlyUntil}" data-label="${esc(w.price.label)}" data-until-label="${esc(w.price.earlyUntilLabel)}" data-after="${esc(w.price.standardNote)}">${esc(ebText(w))}</span></dd></div>
      </dl>`;
}

function dayList(w) {
  return `<ol class="day">
${w.day.map((d) => {
    if (d.kind === 'group') return `        <li class="grp"><h3>${esc(d.title)}</h3></li>`;
    if (d.kind === 'break') return `        <li class="brk"><time>${d.t}</time><span>${esc(d.title)}</span></li>`;
    return `        <li><time>${d.t}</time><div><h4>${esc(d.title)}</h4><p>${esc(d.text)}</p>${d.tag ? `<p class="tag">${esc(d.tag)}</p>` : ''}</div></li>`;
  }).join('\n')}
      </ol>`;
}


function eventLd(w) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: w.title,
    description: w.lead,
    startDate: w.start,
    endDate: w.end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: w.venue, address: { '@type': 'PostalAddress', addressLocality: w.region, addressCountry: w.country } },
    organizer: { '@type': 'Organization', name: 'Intellica', url: base + '/' },
    performer: { '@type': 'Organization', name: 'Intellica' },
    offers: { '@type': 'Offer', url: base + w.path + 'register/', price: String(w.price.amount), priceCurrency: w.price.currency, validThrough: w.price.earlyUntil, availability: 'https://schema.org/InStock' },
  };
}

/* ---------- workshop page ---------- */

function workshopPage(w) {
  const parts = w.day.filter((d) => !d.kind);
  let n = 0;
  const body = `
${subnav(w, '')}

    <section class="t-hero" aria-labelledby="t-title">
      <div class="t-hero-copy">
        <span class="t-pill" data-eb data-until="${w.price.earlyUntil}" data-label="${esc(w.price.label)}" data-until-label="${esc(w.price.earlyUntilLabel)}" data-after="${esc(w.price.standardNote)}">${esc(ebText(w))}</span>
        <h1 id="t-title">${heroTitle(w)}</h1>
        <p class="lead">${esc(w.lead)}</p>
        <div class="actions">
          <a class="btn btn-primary" href="${w.path}register/">Reserve a seat</a>
          <a class="btn btn-ghost" href="#day">See the day</a>
        </div>
        <p class="t-facts">${esc(w.dateLong)}, ${esc(w.time)}, ${esc(w.venue)}. ${esc(w.format)}.</p>
        <p class="fine">Led by a ${esc(w.facilitator.role.charAt(0).toLowerCase() + w.facilitator.role.slice(1))}.</p>
      </div>
      ${sheet(w)}
    </section>

    <section class="t-strip" aria-label="At a glance">
      <dl>${w.strip.map((s) => `<div><dt>${esc(s.k)}</dt><dd>${esc(s.v)}</dd></div>`).join('')}</dl>
    </section>

    <section class="t-block lvl-wrap" aria-label="Level 1 of 5 in software architecture">
      <p class="sub">This is Level 1 of Intellica\u2019s five-level software architecture path.</p>
      ${levelPath(allLevels(catalog, w), 1)}
    </section>

    <section class="t-block" id="twelve" aria-labelledby="twelve-t">
      ${kicker(++n, 'The template')}
      <h2 id="twelve-t">Twelve sections, twelve questions</h2>
      <p class="sub">arc42 gives each kind of architecture information one place to live. By the end of the day you will have answered every one of these for your own system.</p>
      <ol class="twelve">${w.sections.map(([name, q], i) => `<li id="twelve-${i + 1}"><span class="num">${i + 1}</span><div><strong>${esc(name)}</strong><span>${esc(q)}</span></div></li>`).join('')}</ol>
    </section>

    <section class="t-block" id="what" aria-labelledby="what-t">
      ${kicker(++n, 'Why now')}
      <h2 id="what-t">What arc42 is, and why it matters now</h2>
      <p class="pull">${esc(w.why.pull)}</p>
      <div class="two">
        <div><h3>What it is</h3>${w.why.what.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div><h3>Why it matters now</h3>${w.why.now.map((p) => `<p><strong>${esc(p.lead)}</strong> ${esc(p.text)}</p>`).join('')}</div>
      </div>
    </section>

    <section class="t-block" id="help" aria-labelledby="help-t">
      ${kicker(++n, 'How it helps')}
      <h2 id="help-t">Pick what you want to do</h2>
      <p class="sub">We show how arc42 gets you there, what you do in the workshop, and what you leave with.</p>
      <div class="goals">${w.goals.map((g, i) => `
        <details class="goal" name="goal"${i === 0 ? ' open' : ''}>
          <summary><span class="gk">${esc(g.k)}</span><span class="gh">${esc(g.h)}</span></summary>
          <div class="gb">
            <p>${esc(g.how)}</p>
            <p><strong>In the workshop.</strong> ${esc(g.ws)}</p>
            <p class="real"><strong>Be realistic.</strong> ${esc(g.real)}</p>
          </div>
        </details>`).join('')}
      </div>
    </section>

    <section class="t-block" id="without" aria-labelledby="without-t">
      ${kicker(++n, 'The cost of not writing it down')}
      <h2 id="without-t">What goes wrong without it</h2>
      ${cols(w.without, 'c4')}
    </section>

    <section class="t-block" id="able" aria-labelledby="able-t">
      ${kicker(++n, 'Outcomes')}
      <h2 id="able-t">What you will be able to do</h2>
      ${cols(w.able, 'c3')}
    </section>

    <section class="t-block" id="day" aria-labelledby="day-t">
      ${kicker(++n, 'The programme')}
      <h2 id="day-t">The day, hour by hour</h2>
      <p class="sub">${WORDS[parts.length]} short parts. ${esc(w.dayIntro)}</p>
      ${dayList(w)}
      <div class="actions"><a class="btn btn-primary" href="${w.path}register/">Reserve a seat</a><a class="btn btn-ghost" href="${w.path}guide/">Read the student guide</a>${w.course && w.course.enabled ? `<a class="btn btn-ghost" href="${w.path}course/">Take it online</a>` : ''}</div>
    </section>

    <section class="t-block" id="leave" aria-labelledby="leave-t">
      ${kicker(++n, 'Take-home')}
      <h2 id="leave-t">You leave with</h2>
      ${cols(w.leave, 'c3')}
    </section>

    <section class="t-block" id="learn" aria-labelledby="learn-t">
      ${kicker(++n, 'Method')}
      <h2 id="learn-t">How you will learn</h2>
      <p class="sub">${esc(w.learn.intro)}</p>
      ${cols(w.learn.items, 'c3')}
    </section>

    ${w.course && w.course.lab ? `<section class="t-block" id="lab-after" aria-labelledby="lab-after-t">
      ${kicker(++n, 'After the day')}
      <h2 id="lab-after-t">Keep building in the hands-on lab</h2>
      <p class="sub">The online course turns the same material into short lessons, and after each one a lab step opens your own arc42 document in the browser. Finish the sections the day did not have time for, at your own pace, with a health check that reads your draft.</p>
      <div class="actions"><a class="btn btn-ghost" href="${w.path}course/">See the course and the lab</a><a class="btn btn-ghost" href="${w.path}course/lab/">Open the lab editor</a></div>
      <p class="muted small">The lab editor opens with the twelve-section skeleton, a live preview and Markdown export, and you can use it without an access code. Your work stays in your browser, so download it often.</p>
    </section>

    <section class="t-block" id="leaderboard" aria-labelledby="lb-t">
      ${boardHtml(kicker(++n, 'Leaderboard'))}
    </section>

    ${certificateBlock(catalog, ++n)}

    <section class="t-block" id="research" aria-labelledby="res-t">
      ${researchHtml(w.course.lab.research, kicker(++n, w.course.lab.research.kicker))}
    </section>
` : ''}
    <section class="t-block" id="who" aria-labelledby="who-t">
      ${kicker(++n, 'Audience')}
      <h2 id="who-t">Who it\u2019s for</h2>
      <div class="who">${w.who.map((x) => `<p><strong>${esc(x.lead)}</strong> ${esc(x.text)}</p>`).join('')}<p class="muted">${esc(w.whoNote)}</p></div>
    </section>

    <section class="t-block" id="facilitator" aria-labelledby="fac-t">
      ${kicker(++n, 'Your facilitator')}
      <h2 id="fac-t">${esc(w.facilitator.name)}</h2>
      <p class="role">${esc(w.facilitator.role)}</p>
      <ul class="facts">${w.facilitator.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <p class="bio">${esc(w.facilitator.bio)}</p>
    </section>

    <section class="t-cta" aria-labelledby="cta-t">
      <h2 id="cta-t">Seats are open for ${esc(w.dateShort)}</h2>
      <p><span class="eb" data-eb data-until="${w.price.earlyUntil}" data-label="${esc(w.price.label)}" data-until-label="${esc(w.price.earlyUntilLabel)}" data-after="${esc(w.price.standardNote)}">${esc(ebText(w))}</span></p>
      <div class="actions"><a class="btn btn-primary" href="${w.path}register/">Reserve a seat</a></div>
    </section>

    <section class="t-block" id="faq" aria-labelledby="faq-t">
      ${kicker(++n, 'Questions')}
      <h2 id="faq-t">Questions</h2>
      <div class="faqs">${w.faq.map((f) => `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
    </section>

    <aside class="t-notes" aria-label="Notes and sources">
      <p>${esc(w.affiliation)}</p>
      <details><summary>Sources and how we use them</summary><p>${esc(w.sources).replace(esc(w.sourceLink[0]), `<a href="${esc(w.sourceLink[1])}" rel="noopener">${esc(w.sourceLink[0])}</a>`)}</p></details>
    </aside>`;
  return page({
    title: `${w.title}: ${w.headline.replace(/\.$/, '')} | Intellica Training`,
    description: `${w.lead} ${w.dateLong}, ${w.venue}.`,
    canonicalPath: w.path,
    ld: eventLd(w),
    css: ['/training/catalog.css'],
    body,
  });
}

/* ---------- student guide ---------- */

function guidePage(w) {
  const g = w.guide;
  const check = (items, group) => `<ul class="checks">${items.map((t, i) => `<li><label><input type="checkbox" data-check="${group}-${i}"><span>${esc(t)}</span></label></li>`).join('')}</ul>`;
  let n = 0;
  const body = `
${subnav(w, 'guide/')}

    <section class="t-hero t-hero-single">
      <div class="t-hero-copy">
        <p class="eyebrow">Student guide</p>
        <h1>Prepare for ${esc(w.title)}</h1>
        <p class="lead">${esc(g.intro)}</p>
        <ul class="jump" aria-label="On this page">
          <li><a href="#setup">Setup</a></li><li><a href="#prepare">Prepare</a></li><li><a href="#reading">Reading</a></li><li><a href="#produce">What you produce</a></li><li><a href="#skeleton">Skeleton</a></li><li><a href="#terms">Key terms</a></li><li><a href="#ai">AI rules</a></li><li><a href="#leave">Before you leave</a></li><li><a href="#thirty">Your 30 days</a></li>
        </ul>
      </div>
    </section>

    <section class="t-block" id="setup" aria-labelledby="setup-t">
      ${kicker(++n, 'Before the day')}
      <h2 id="setup-t">Setup checklist</h2>
      ${check(g.setup, 'setup')}
      <p class="muted small" data-saved-note hidden>Your ticks are saved in this browser only.</p>
    </section>

    <section class="t-block" id="prepare" aria-labelledby="prep-t">
      ${kicker(++n, 'Preparation')}
      <h2 id="prep-t">Prepare at your level</h2>
      <div class="levels">${g.levels.map((l) => `<div class="level"><h3>${esc(l.title)}</h3><p class="muted">${esc(l.time)}:</p><ul>${l.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>
    </section>

    <section class="t-block" id="reading" aria-labelledby="read-t">
      ${kicker(++n, 'Reading')}
      <h2 id="read-t">Free and open material</h2>
      <ul class="links">${g.resources.map(([t, u, d]) => `<li><a href="${esc(u)}" rel="noopener"><strong>${esc(t)}</strong><span>${esc(d)}</span></a></li>`).join('')}</ul>
      <p class="muted small">${esc(g.resourcesNote)}</p>
    </section>

    <section class="t-block" id="produce" aria-labelledby="prod-t">
      ${kicker(++n, 'Outputs')}
      <h2 id="prod-t">What you will produce</h2>
      <div class="table-wrap"><table>
        <thead><tr><th scope="col">Exercise</th><th scope="col">Produces</th><th scope="col">Section</th><th scope="col">Done when</th></tr></thead>
        <tbody>${g.exercises.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </section>

    <section class="t-block" id="skeleton" aria-labelledby="skel-t">
      ${kicker(++n, 'Template')}
      <h2 id="skel-t">Team skeleton</h2>
      <p>Paste this into <code>arc42-team.md</code> on the day.</p>
      <div class="code-block"><pre id="skeleton-text"><code>${esc(g.skeleton)}</code></pre><button type="button" class="code-copy" data-copy="skeleton-text" hidden>Copy</button></div>
      <h3>Mermaid in 30 seconds</h3>
      <pre><code>${esc(g.mermaid)}</code></pre>
    </section>

    <section class="t-block" id="terms" aria-labelledby="terms-t">
      ${kicker(++n, 'Vocabulary')}
      <h2 id="terms-t">Key terms</h2>
      <dl class="terms">${g.terms.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
    </section>

    <section class="t-block" id="ai" aria-labelledby="ai-t">
      ${kicker(++n, 'Ground rules')}
      <h2 id="ai-t">Rules for AI today</h2>
      <p class="pull">${esc(g.aiRules)}</p>
    </section>

    <section class="t-block" id="leave" aria-labelledby="leave-t">
      ${kicker(++n, 'Self-check')}
      <h2 id="leave-t">Check before you leave</h2>
      ${check(g.before, 'before')}
    </section>

    <section class="t-block" id="thirty" aria-labelledby="thirty-t">
      ${kicker(++n, 'After')}
      <h2 id="thirty-t">Your 30 days</h2>
      <p>${esc(g.thirty)}</p>
    </section>

    <section class="t-cta">
      <h2>Not registered yet?</h2>
      <p>${esc(w.dateLong)}, ${esc(w.venue)}.</p>
      <div class="actions"><a class="btn btn-primary" href="${w.path}register/">Reserve a seat</a><a class="btn btn-ghost" href="${w.path}">Back to the workshop</a></div>
    </section>`;
  return page({
    title: `Student guide | ${w.title} | Intellica Training`,
    description: `Setup checklist, preparation by level, free reading and the team skeleton for ${w.title} on ${w.dateLong}.`,
    canonicalPath: w.path + 'guide/',
    ld: null,
    body,
  });
}

/* ---------- register ---------- */

function registerPage(w) {
  const wa = `https://wa.me/${w.whatsapp}?text=${encodeURIComponent(`Hello, I\u2019d like to reserve a seat for ${w.title} on ${w.dateShort} at ${w.venue}.`)}`;
  const body = `
${subnav(w, 'register/')}

    <section class="t-hero t-hero-reg" aria-labelledby="reg-t">
      <div class="t-hero-copy">
        <p class="eyebrow">Register</p>
        <h1 id="reg-t">Reserve a seat for ${esc(w.dateShort)}</h1>
        <p class="lead">${esc(w.dateLong)}, ${esc(w.time)}, ${esc(w.venue)}. Send your details and we reply by email to confirm your seat.</p>

        <form id="reserve" class="reserve" data-to="${esc(w.contact)}" data-subject="${esc(`${w.title}: reserve a seat (${w.dateShort})`)}" hidden>
          <label>Your name<input name="name" required autocomplete="name"></label>
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Team or organisation (optional)<input name="team" autocomplete="organization"></label>
          <label>Anything we should know?<textarea name="message" rows="3"></textarea></label>
          <div class="actions"><button class="btn btn-primary" type="submit">Reserve a seat</button></div>
          <p id="reserve-msg" role="status" class="muted small"></p>
        </form>

        <div class="reg-plain" id="reg-plain">
          <div class="actions">
            <a class="btn btn-primary" data-mail href="${esc(mailtoHref(w))}">Email to reserve</a>
            <a class="btn btn-ghost" href="${esc(wa)}" rel="noopener">WhatsApp</a>
          </div>
        </div>
        <p class="muted small">Reserving opens your email app with your details ready to send. Nothing is stored on this site. We reply by email to confirm your seat; registered participants get the exact room before the day.</p>
      </div>
      ${factsheet(w)}
    </section>

    <section class="t-block" aria-labelledby="next-t">
      ${kicker(1, 'What happens next')}
      <h2 id="next-t">Three steps</h2>
      <ol class="steps">
        <li><div><strong>You send your details.</strong> Name, email and, if you like, the team you will work with.</div></li>
        <li><div><strong>We reply to confirm.</strong> You get your confirmation and the next steps by email.</div></li>
        <li><div><strong>You prepare in an hour or less.</strong> The <a href="${w.path}guide/">student guide</a> has a setup checklist and optional reading, and nothing in it is required.</div></li>
      </ol>
      <p class="muted">${esc(w.affiliation)}</p>
    </section>`;
  return page({
    title: `Register | ${w.title} | Intellica Training`,
    description: `Reserve a seat for ${w.title}, ${w.dateLong}, ${w.venue}. ${ebText(w)}`,
    canonicalPath: w.path + 'register/',
    ld: null,
    body,
  });
}

/* ---------- worked example ---------- */

function examplePage(w) {
  const x = w.example;
  const body = `
${subnav(w, 'example/')}

    <section class="t-hero t-hero-single" aria-labelledby="ex-t">
      <p class="eyebrow">Worked example</p>
      <h1 id="ex-t">${esc(x.title)}</h1>
      <p class="lead">${esc(x.lead)}</p>
      <div class="actions">${x.files.map(([l, h], i) => `<a class="btn ${i ? 'btn-ghost' : 'btn-primary'}" href="${h}">${esc(l)}</a>`).join('')}</div>
    </section>

    <section class="t-block" aria-labelledby="ex-in">
      ${kicker(1, 'What is in it')}
      <h2 id="ex-in">Four parts that fit together</h2>
      ${cols(x.parts, 'c4')}
    </section>

    <section class="t-block" aria-labelledby="ex-run">
      ${kicker(2, 'Run it')}
      <h2 id="ex-run">Five minutes to a running system</h2>
      <p class="sub">${esc(x.needs)} Unzip, then in a terminal:</p>
      <div class="code-block"><pre id="run-text"><code>${x.run.map(esc).join('\n')}</code></pre><button type="button" class="code-copy" data-copy="run-text" hidden>Copy</button></div>
      <h3>What you can try</h3>
      <ul class="facts">${x.demos.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    </section>

    <section class="t-block" aria-labelledby="ex-lim">
      ${kicker(3, 'Scope')}
      <h2 id="ex-lim">Where the example is deliberately simple</h2>
      <ul class="facts">${x.limits.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <p class="muted">Each of these is a good question to ask of any real system.</p>
    </section>`;
  return page({
    title: `Worked example | ${w.title} | Intellica Training`,
    description: x.lead,
    canonicalPath: w.path + 'example/',
    ld: null,
    body,
  });
}

/* ---------- training index ---------- */

function indexPage() {
  const ix = data.index;
  const cards = data.workshops.map((w) => `
        <article class="ws-card">
          <p class="eyebrow">Next live workshop</p>
          <h3><a href="${w.path}">${esc(w.title)}</a></h3>
          <p>${esc(w.lead)}</p>
          <dl class="mini"><div><dt>When</dt><dd>${esc(w.dateLong)}, ${esc(w.time)}</dd></div><div><dt>Where</dt><dd>${esc(w.venue)}</dd></div><div><dt>Price</dt><dd>${esc(w.price.label)} <span class="eb" data-eb data-until="${w.price.earlyUntil}" data-label="${esc(w.price.label)}" data-until-label="${esc(w.price.earlyUntilLabel)}" data-after="${esc(w.price.standardNote)}">early bird until ${esc(w.price.earlyUntilLabel)}</span></dd></div></dl>
          <div class="actions"><a class="btn btn-primary" href="${w.path}">See the day</a><a class="btn btn-ghost" href="${w.path}register/">Reserve a seat</a></div>
        </article>`).join('');
  const body = `
    <section class="t-hero t-hero-index" aria-labelledby="ti-t">
      <div class="t-hero-copy">
        <p class="eyebrow">Intellica Training</p>
        <h1 id="ti-t">${esc(ix.headline)}</h1>
        <p class="lead">${esc(ix.lead)}</p>
        <div class="actions"><a class="btn btn-primary" href="#courses">Browse the courses</a><a class="btn btn-ghost" href="#live">Next live workshop</a><a class="btn btn-link" href="/training/my-courses/">I have an access code</a></div>
      </div>
      ${courseTiles(catalog, data.workshops[0])}
    </section>

    <section class="t-strip" aria-label="What every course includes"><dl>
      <div><dt>Hands-on lab</dt><dd>in every course</dd></div>
      <div><dt>Verifiable certificate</dt><dd>to share on LinkedIn</dd></div>
      <div><dt>Always current</dt><dd>amended as the research moves</dd></div>
      <div><dt>Yours to keep</dt><dd>every update to your edition</dd></div>
    </dl></section>

${featuredBlock(catalog)}

${catalogSections(catalog, data.workshops[0], 1)}

    <section class="t-block" id="live" aria-labelledby="ws-t">
      ${kicker(2, 'Live workshops')}
      <h2 id="ws-t">Learn it live, with us in the room</h2>
      <p class="sub">The courses are always there. Workshops are the dated part, and the dates change: small rooms, one real system, a printed workbook and time to ask. Each one sits on top of its online course, so you can prepare before and keep going after.</p>
      <div class="ws-list">${cards}
      </div>
    </section>

${certificateBlock(catalog, 3)}

    <section class="t-block" aria-labelledby="how-t">
      ${kicker(4, 'How we teach')}
      <h2 id="how-t">Every course follows the same loop</h2>
      ${cols(ix.principles, 'c3')}
      <p class="pull">${esc(ix.honesty)}</p>
    </section>

    <section class="t-block" aria-labelledby="team-t">
      ${kicker(5, 'For teams')}
      <h2 id="team-t">Training a whole team?</h2>
      <p class="sub">We can run a workshop on your own system, or build a learning path across several courses for your staff. <a href="/consulting/">See how we work with teams</a>, or message us on WhatsApp from the button on this page.</p>
    </section>`;
  return page({
    title: 'Training | Intellica',
    description: `Hands-on training from Intellica: software architecture in five levels and seven courses for the agentic era, each with a lab and a verifiable certificate. Next workshop: ${data.workshops[0].title}, ${data.workshops[0].dateLong}.`,
    canonicalPath: '/training/',
    ld: null,
    css: ['/training/catalog.css'],
    body,
  });
}

/* ---------- home block ---------- */

function homeBlock() {
  const w = data.workshops[0];
  return `<!-- training-home:start -->
    <section class="block t-home" id="training" aria-labelledby="training-title">
      <p class="eyebrow">Training</p>
      <h2 id="training-title">Learn the method, hands-on</h2>
      <div class="t-home-grid">
        <p class="lead">Short, practical workshops that end with something you can use on Monday. Taught in person, on a real system, with a clear scope you can plan around.</p>
        <div class="t-home-cards">
        <a class="t-home-card" href="/training/">
          <span class="t-home-k">Next workshop</span>
          <strong>${esc(w.title)}</strong>
          <span>${esc(w.dateLong)}</span>
          <span>${esc(w.venue)}</span>
          <span class="t-home-go">See training <span aria-hidden="true">\u2192</span></span>
        </a>
        ${w.course && w.course.enabled ? `<a class="t-home-card" href="${w.path}course/">
          <span class="t-home-k">Online course</span>
          <strong>${esc(w.title)}, at your own pace</strong>
          <span>Lessons, transcripts and a worked example. The first two are free.</span>
          <span class="t-home-go">Look inside <span aria-hidden="true">\u2192</span></span>
        </a>` : ''}
        </div>
      </div>
    </section>
    <!-- training-home:end -->`;
}

/* ---------- write ---------- */

write('training/index.html', indexPage());
for (const w of data.workshops) {
  const dir = w.path.replace(/^\//, '');
  write(`${dir}index.html`, workshopPage(w));
  write(`${dir}guide/index.html`, guidePage(w));
  write(`${dir}register/index.html`, registerPage(w));
  if (w.example) write(`${dir}example/index.html`, examplePage(w));
}

const homeFile = path.join(SITE, 'index.html');
let home = fs.readFileSync(homeFile, 'utf8');
if (/<!-- training-home:start -->/.test(home)) {
  home = home.replace(/<!-- training-home:start -->[\s\S]*?<!-- training-home:end -->/, homeBlock());
  fs.writeFileSync(homeFile, home);
} else {
  console.log('warn: site/index.html has no training-home markers; home block not written');
}
console.log(`built training: index + ${data.workshops.length} workshop(s) x 3 pages, home block`);
