# Checkpoint 33: instant access after the receipt, owner phone alerts, soft revoke

Buying: the buyer uploads the receipt and is taken straight into the course, with no code to copy. If the automatic check cannot confirm the receipt (status `review`), the course still opens ("provisional") and the owner gets a high-priority phone alert; a passing receipt sends a normal "New sale" alert. Alerts use ntfy.sh (free, no account): `deploy.mjs` creates a random topic in `.pay.json` (`ntfyTopic`), prints it once, and puts it in the uploaded Function's secrets; the owner subscribes to that topic in the ntfy app. `worker/pay-api.js`: `notify()`, `claim` returns the code for `paid` and `review`, a `rejected` (revoked) order is refused (403) and cannot reopen itself by sending another receipt. Owner page buttons: "Money is in: confirm" and "Revoke access".
Revoke is soft, by design (no database for access): a code is a key held in the buyer's browser. Course pages for a buyer (`recheck()` in pay.js) ask the server on load; a revoked order removes the code it issued and shows a message; an approved one opens the course on a device that lacks the code. Someone who copied the key out of the code can still decrypt offline. Owner-issued codes are never touched.
Also: "Step 2 of 3 / 3 of 3" in the buy dialog, "Your course opens the moment you send your receipt" on the price note.

# Checkpoint 32: Level 2 course (Architecture for Quality and Decisions), 20 lessons

Level 2 is now an online course like Level 1 and the cybersecurity course: 20 lessons in five modules (quality in numbers, deciding well, structure for change, review and risk, decisions in the AI era), four slides each plus field guide, worked case, rubric, three recall questions and sources; one lab step per lesson that builds a single decisions record on top of the learner's arc42; a certificate rule (20 lessons, 20 sections, 6 health checks, 70% of 60 questions). Price US$199 / TT$1,399 (catalog `ladder.levels[quality-decisions].course`, `OFFERS` in worker/pay-api.js, `ISSUABLE` in worker/cert-api.js, `COURSES` in tools/code.mjs). Owner code: `npm run code -- quality-decisions "Buyer name"`.
Source lessons: `training-private/quality-decisions/part1-4.mjs` (compact format as frontier.mjs). Built by `tools/level-course.mjs`, which reuses the cyber engine copy (`engineFiles` in cyber-course.mjs) with storage prefix `iwq-`, health check `tools/level-health.js` (adds a "numbers present" check), key `deriveKey(master,'quality-decisions')`. Practice tools: scenario checker and budget calculator (`tools/level-tools`, unit tests in tools/test-level.mjs).
Facts read on their pages 2026-11-22: arc42 sections 9, 10, 11 and Q42 (191 characteristics, CC BY-SA 4.0), ISO/IEC 25010:2023 (nine characteristics), Nygard 2011 ADR post, SEI ATAM report (1998), Google SRE book chapter 3 (52.56 min, 250 errors in 2.5M), Context Matters (EASE 2026, arXiv 2604.03826), AgenticAKM (arXiv 2602.04445, preprint). Not iSAQB coursework: topics only, no accreditation claims.
Also: home proof panel waits 2.5 s after it scrolls into view before fetching the manifest (keeps the 150 KB page budget as the manifest grows).

# Checkpoint 27: Training page restructured (feature + one catalogue + live workshops), cybersecurity course structure

Training page order: hero, a four-fact strip (hands-on lab, verifiable certificate, always current, yours to keep), a featured course (Cybersecurity for the Agentic Era), the full catalogue as one set of tracks with no available/soon split (architecture Levels 1 to 5, Build and secure, Run and grow), Live workshops as the dated section, certificate, how we teach, teams. Cybersecurity catalogue page now follows the 20-lesson course (five modules, capstone) with a matching lab. Level 1 card keeps its Get access button. Research findings for the cyber course are in the chat reply, not in a file.

# Checkpoint 26: buy by bank deposit with automatic receipt check, TT$/US$ by visitor, per-course status

arc42 online course: US$129 flat (live workshop stays TT$999). Visitors in Trinidad and Tobago (Cloudflare country) see TT$899 and a Buy button; everyone else sees US$129 and a WhatsApp prompt until card payment (Stripe) is added. Popup: details, then bank details (Royal Bank, St Augustine branch, account 110000005001825) with a personal reference IC-XXXXXX, then Scan with camera / Upload a photo. `worker/pay-api.js` + `functions/api/pay/` (tables `orders`, `receipts` create themselves). The receipt is read by Workers AI (needs the `AI` binding); it passes only if amount, receiving account, recent date and a transaction number are all found, and the photo and transaction number are not already used. Anything else is held and the owner approves or rejects it at `/training/arc42/course/admin/` (owner key from `.pay.json`, git-ignored, created and printed by the first `npm run deploy -- home`). Limits, stated plainly: nothing sees the bank account, so a receipt is read, not proven; and an access code is the course key, so it cannot be taken back once given. Catalog: every new course has `status: soon` in `site/training/catalog.json`. Tests: `tools/test-pay-api.mjs` and a browser test of the popup, upload and unlock. WiPay code was dropped (needs a separate approved business account).

# Checkpoint 25: five-level architecture path, seven agentic-era courses, verifiable certificates
Training index now lists: architecture Levels 1 to 5 (Level 1 = arc42 in a Day, open; 2 to 5 'Opening soon') and seven agentic-era courses (AI agents for business, cybersecurity, data analytics, software development, digital marketing, project and operations, entrepreneurship), plus a certificate section. Content lives in `site/training/catalog.json`; `tools/build-catalog.mjs` writes `/training/<id>/` pages (hero, why now, outcomes, syllabus, lab, method, certificate, Contact sales on WhatsApp) and `/training/certificate/`. Shared shell in `tools/training-shell.mjs`, HTML pieces in `tools/catalog-html.mjs`, styles in `site/training/catalog.css`. No prices, dates or testimonials are shown. Course 6 of the source list was not supplied.
Certificates: `worker/cert-api.js` + `functions/api/cert/` (same free D1 database and same join proof as the leaderboard; table `certs` creates itself). Criteria: all 19 lessons, 12 lab sections and 6 health checks, at least 70% of 34 check questions mastered (first try or right in a later review). Claim card on My course (`course/cert.js`); verify, share, Add to LinkedIn and Save as PDF on `/training/certificate/?id=IC-...`. Only arc42 can issue; add a course to ISSUABLE in `worker/cert-api.js` when it opens.

# Checkpoint 24: trust-based leaderboard (weekly and all-time, streaks, personal bests)

Leaderboard (trust-based, cp24): the browser works out points, streak and four progress parts from the learner's own activity and shares only those numbers under an opt-in handle. `functions/api/board/` (Cloudflare Pages Function, free plan) with logic in `worker/board-api.js`; the D1 table creates itself on first use. Points: first-try answer 10/2, review 8/4/2, section 15, health check 10, daily 5 + streak up to 10. Weekly board resets Monday 00:00 UTC, plus all-time; everyone sees their own rank, neighbours and points to the next learner; personal-best week target; streak forgives one missed day. Join gate: `worker/proof.js` is filled in by `npm run deploy -- home` from the course key and restored afterwards (no dashboard secret). 34 check questions in `training-private/arc42-quiz.json` with instant client-side feedback. Rules in `board-core.js`.
Also: process mirror in the lab (Maier et al., arXiv 2609.20143), Training as the sixth card on the home page, defensive copy rewritten across training, course, consulting and product pages, five sector pages under `/industries/`, `tools/check-links.mjs`, home CSS split to stay inside the 150 KB budget, deploy sends `functions/` only with the home project.
Tests: `npm test` (scoring rules, API against real SQLite) and `npm run verify`.

# Checkpoint 22: sector pages, "Get access" button, link check, more evidence

The five sector links on the home page were dead (`/legacy/*.html` was never imported). They are now real pages at `/industries/enterprise|finance|government|energy|smb/`, generated by `tools/build-industries.mjs` from `site/industries/industries.json` (strict CSP rule added). The online-course button on the training page says "Get access", and says "Open the course" (straight to My course) when this browser holds a working code (`site/training/access.js`, shared with the course). `tools/check-links.mjs` runs in `npm run check`: every internal link, image, script and #anchor, plus paths in family.json, site.json and shell.js, must exist. Research blocks gain three cited studies (practice testing, self-explanation, MOOC completion) and a plain statement that we make no claim about other courses.

# Checkpoint 21: Consulting page and assessments, new header, home messaging, lab showcase and evidence on workshop and course pages

Header is Consulting, Training, Systems (kit 0.7.0). New: site/consulting (consulting.json, assessments.json, consulting.js), tools/build-consulting.mjs, tools/lab-html.mjs. Home leads with "AI engineering for work that has to be right". Old contact email removed from structured data. CSP rule added for /consulting/*.

# Checkpoint 20: deploy message points at meeting-mind.com (project intellica-web)

# Checkpoint 19: lab shown on the course page; deploy can target the project that holds meeting-mind.com

`npm run deploy:where` lists Pages projects and their domains; `npm run deploy -- home --project=NAME` uploads to a named project. Course page, inclusion card and lesson rows now mention the lab.

# Checkpoint 18: hands-on lab (your own arc42 inside the course)

New: `/training/arc42/course/lab/`. 16 lab steps, one per lesson, from the workshop's real exercises (source: `site/training/arc42/lab.json`; paid steps are encrypted like the lessons). Autosave in the browser (`iw-lab-doc`), live preview, health check, Markdown import and download, a lab card on each lesson and on My course. Logo SVGs slimmed 30%.

# Checkpoint 17: dark-only, new logo, player upgrades, hero layout fix

# Checkpoints

## cp31: cybersecurity upgrade (28 lessons, practice tools)
- Lessons 26 MCP authorization (2026-07-28 spec: RFC 9728, 8707, 8414/OIDC, 9207 iss, client metadata documents, no token passthrough), 27 skills and tool trust (OWASP Agentic Skills Top 10 list as read on the project page, MAESTRO layers, rug pulls, shadowing), 28 agent identity and delegation (NIST CAISI and NCCoE status stated as in progress). Facts checked on the spec, OWASP, NCCoE and CSA pages on 2026-11-22.
- Practice tools (free to open, with downloadable fixtures): `/training/cybersecurity/course/lab/policy/` (policy tester, Rego reference) and `/lab/trace/` (trace spotter). Source in `tools/cyber-tools/`.
- Certificate rule: 28 lessons, 28 sections, 5 checks, 70% of 84 questions.
- Home page: the live proof now loads the manifest only when its panel scrolls into view (keeps the page under the 150 KB budget); manifest written compact.
- From the handoff, not applicable to our build: truncation at lesson 16, duplicate citation chips, purple --panel (those belong to the source HTML, not this site). Not done: JSON export of the lab dossier.

## cp30: one place to enter a code, header tiles
- `/training/my-courses/`: paste a code for any course; it finds the course, saves it, opens it. Returning visitors see a Continue button. Linked from the training header ("I have an access code"), every course subnav ("Enter access code") and the course hero.
- Training header: the empty right side is now 12 small tiles (five levels, seven courses) that jump to each course page.
- Prices on course cards (arc42 US$129, cybersecurity US$399). Cyber course strip no longer shows arc42-only figures (timed exercises, worked example).
- Page generated by `tools/my-courses-html.mjs` from build-course.mjs; logic in `site/training/my-courses.js`.

## cp28: Cybersecurity for the Agentic Era (complete)
- 25 lessons: your 20 (slides, field guide, worked case, rubric, 3 questions, lab) plus 5 frontier lessons (21 adaptive evaluation, 22 out-of-band enforcement, 23 containing your own agents, 24 measuring poisoning, 25 runtime monitors) from `training-private/frontier.mjs`. Every figure there was read on its source page on 2026-11-21 and is cited in the lesson.
- "2026 update" notes added to lessons 6, 9, 10, 15, 16, 17, 18.
- Lab: one assurance pack, 25 sections. Certificate: lessons 25, sections 25, health checks 5, 70% of 75 questions. Cert API derives each course's proof from the master key.
- Price US$399 / TT$2,799 (catalog.json and `OFFERS` in worker/pay-api.js; a test keeps them equal). Bank-deposit buying works for both courses; the claim returns that course's own key.
- Owner code command (no chat needed): `npm run code -- list`, `npm run code -- cybersecurity "Buyer name"`. Logged in `.codes.log` (git-ignored). Needs `.course-key` in the folder.
- Not yet: leaderboard for cyber (hidden), Stripe, templates/glossary pages, key rotation.

## Checkpoint 16 (current): after a code is entered the buyer lands on a new "My course" page (welcome, next lesson, progress ring, curriculum with status, review, resources); lessons numbered in study order. Earlier: cp15 header fix.

## Checkpoint 14: v14 — one domain: every system lives under meeting-mind.com/<system>/ and one deploy (`npm run deploy -- home`) uploads `dist/` (built by tools/assemble.mjs).  (kit files are now revalidated on every load, so a deploy shows at once)
Includes 13. New logo (I-beam tile with a cyan checkable half), the original interactive twelve-section card on the workshop page (aligned with the headline), a visible "You are in" banner after a course code is pasted, `npm run course:check`, course price TT$299 (regular TT$399, shown crossed out), proof strip, "How it works" and a sales band on the home page, WhatsApp-only purchase.

## Checkpoint 13 (superseded): professional identity
Includes checkpoint 12. Kit 0.6.0.
- No personal name or email address is displayed anywhere. Contact is a WhatsApp button labelled "Contact sales" (icon plus label; the number is only in the link). Facilitator is described by role.
- "Intellica family" is now "Systems".
- New I-beam logo mark and favicon; IBM Plex Sans and IBM Plex Mono (run `npm run fonts` again after unzipping).
- Square-cornered engineering style, mono labels, drafting grid, new footer.
- Home: animated system map of the five systems and a live panel in which the page re-hashes its own files against the public manifest.
- Motion (scroll reveal, page transitions) only where the browser supports it and never when reduced motion is requested.
- Remaining: security.txt and the booking mailto keep the company address in link targets (not displayed).

## Checkpoint 12 (superseded by 13): fonts
Includes checkpoint 11. Adds `npm run fonts`, which self-hosts IBM Plex Sans and Bricolage Grotesque (the typefaces of the original workshop page). Run it once in the Codespace; `node tools/install-fonts.mjs --remove` undoes it.

## Checkpoint 11 (superseded by 12): the online course, made visible and rebuilt
Includes checkpoint 10. The course is now promoted on Home, Training and the workshop page; the course page has a live slide preview, four syllabus modules, a price and access panel and the instructor; lessons have an outline sidebar and progress bar.

## Checkpoint 10 (superseded by 11): the online course
Includes checkpoint 9. Upload this one.
- **Online course** at `/training/arc42/course/`: the workshop as 19 lessons built from the slide deck (breaks and lunch dropped, appendices merged). Narrated slide player with transcript, read-aloud, optional recorded audio, keyboard control; free recall cards at the end; review at 1, 3, 7, 21 days; progress saved in the browser. Two lessons are a free preview; the rest are encrypted and open with an access code you issue (`npm run course:code -- "Buyer name"`).
- **Worked example** page `/training/arc42/example/`: Doubles-to-Go arc42 plus the working app (33 tests pass) as a download; source in `training-material/doubles-to-go/` (`npm run example:pack` rebuilds the zip).
- **MP4 export** per lesson: `npm run course:video -- <lesson-id>` (needs ffmpeg).
- Slides (7) are byte-identical to the deck already in checkpoint 8, so nothing changed there.
- Payments: Stripe is not available in Trinidad and Tobago, so access codes are issued by you after you receive payment. See ADR-29 and INSTALL.md.
- Also fixed: numbered steps on the register page rendered as broken columns.
- Browser check now has 37 checks. Kit unchanged (0.5.0).

## Checkpoint 9 (superseded by 10, may be uploaded): deploy from the Codespace
Includes checkpoint 8. Adds `npm run deploy -- <home|verichain|vericrypt|erp|omc|agentseed|all>`: syncs, runs the gate, creates the Pages project if needed and uploads with Wrangler (direct upload, no GitHub integration). `tools/deploy.config.json` holds the project names. INSTALL.md section 6 rewritten for this route.

## Checkpoint 8 (superseded by 9, may be uploaded): the Training section
Includes everything from checkpoints 6 and 7 (neither was confirmed uploaded). Upload this one.
- **`/training/`** index and **`/training/arc42/`** workshop (arc42 in a Day, **Saturday 30 January 2027**, UWI St Augustine), with **Student guide** and **Register** pages. Linked from a Training item in the home header, a Training block on the home page and the family menu on every product site.
- Built from one data file, `site/training/training.json`, into real HTML (works without JavaScript; Event structured data; in the sitemap). `training.js` only adds the deadline countdown, saved checklists, copy buttons and the email form.
- **Early bird TT$999 until 30 November 2026**; the text counts down and ends on its own. The standard price after that is not set: add `price.standard` in `training.json` when decided.
- **Your slides** (210) are a private presenter page at an unlisted address (`site/training/arc42/deck-<token>/`): not linked, not in the sitemap, manifest or robots, `noindex`, strict CSP, microphone and screen capture allowed for its recording feature. Converted without changing a slide. See INSTALL.md for real access control.
- Registration uses the company address (`dpramsajan@meeting-mind.com`), not a personal mailbox.
- Copy corrected from the original page: it said "fifteen short parts" but the programme has thirteen; the count is now computed from the data.
- Header no longer overflows at 320 px. Kit 0.5.0. Browser audit: 27 checks.

## Checkpoint 7 (superseded by 8, not uploaded): faster, safer headers, better docs
- **Found and fixed: `/verify-site/` had no Content-Security-Policy** (the rule list missed it). Added it, plus Cross-Origin-Opener-Policy and Strict-Transport-Security. A new test fetches every HTML page of every site and fails if any lacks a strict policy.
- **Found and fixed: layout shift.** Pages jumped while the shell built the header (CLS up to 0.18 on some pages; the limit is 0.1). The body and footer now wait for the shell; with a 2.5 s and 4 s time limit so nothing stays blank. Browser audit now enforces CLS, LCP and a 150 KB page budget on every product page.
- **Docs:** search across the whole manual (built in the browser), copy buttons on code blocks. Fixed a broken table cell in the VeriCrypt install page and added a test for stray backticks.
- Structured data (JSON-LD) on the home and every product overview.
- 320 px reflow test on every page (WCAG 1.4.10).
- Kit 0.4.0. Browser audit: 20 checks.

## Checkpoint 6 (superseded by 7, not uploaded): the site verifies itself; briefs for the product chats
- **Verify this site** on every site: published `site-manifest.json` (SHA-256 of every file plus a root hash) and a page that re-hashes everything in the visitor's browser. Footer link on every page.
- **What it does not do yet** section on every product Overview, from each repo's own limits.
- Briefs for the five product chats in `docs/briefs/` (paste-ready, with questions, demo concept, hand-back list and the shared contract) and `docs/CONTENT-SCHEMAS.md`.
- Checker guards: status and limits required; demo engine label must match the demo's code.
- `npm run scaffold` no longer overwrites finished work without `--force`.
- Browser audit: 15 checks.
- arc42: ADR-13 to 17, new scenarios and risks.
- Kit 0.3.0.

## Housekeeping after checkpoint 5
- Found in the uploaded repo: `node_modules/` was committed (no `.gitignore`) and a stale `INSTALL-CODESPACES.md` from checkpoint 1 was still present. Added `.gitignore`, removed the stale file. Verified a clean clone builds, scaffolds and passes the gate.

## Checkpoint 5 (uploaded): discoverable, accessible, useful when empty
- Every page now carries its own title, description, canonical link and link-preview tags, baked in without JavaScript (`tools/prerender.mjs`, run by `npm run sync`). Added sitemap.xml, robots.txt and security.txt per site.
- Download tab: when there are no binaries it shows build-from-source commands with a copy button instead of an empty table.
- Support tab: known problems (FAQ) per product, from each repo's own troubleshooting notes, plus a security note.
- Markdown headings are demoted so each page has exactly one h1.
- Print stylesheet.
- Home copy no longer implies the demos run in-browser today.
- Browser check now has 13 checks, including an accessibility audit (landmarks, heading order, names, WCAG AA contrast in light and dark on every page of every site) and a no-JavaScript metadata check.
- Kit 0.2.0.

## Checkpoint 4 (superseded by 5): five products, real content
- Fifth product: AgentSeed (ASL toolchain).
- Every product site now has a real user manual, installation guide, reference, architecture overview and Verify page, written from that product's own repository (README, arc42, install guides, CLAIMS.md). No more "Nothing is published here yet" in the docs.
- Status line per product, taken from each repo's own status.
- VeriCrypt content follows its `CLAIMS.md` registry (see CONTENT-TODO).
- Browser check now loads every tab and docs page of all five products (9 checks).
- Verified commands: vcv verify (VeriChain), vericrypt analyze/verify (VeriCrypt), seed check/run/build (AgentSeed), cargo test (Sovereign ERP), python scripts/demo.py (OMC).

## Checkpoint 3
Dependencies and browser check: `npm run setup`, `npm run verify`, devcontainer and CI.

## Checkpoint 2
Fresh `IntellicaWeb` repo layout; `npm run legacy -- <path>`.

## Checkpoint 1
Kit 0.1.0, home, template, scaffolds, tools, arc42 1 to 12. Docs sidebar fix.
