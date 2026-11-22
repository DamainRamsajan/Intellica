// Level 2, lessons 12-15: Structure for change.
export default [
{
  n: 12, title: 'Modularity and Boundaries',
  lead: 'Change is cheap where boundaries are good and expensive where they are not. You will draw boundaries around reasons to change, test them with change scenarios, and spot the ones that leak.',
  slides: [
    ['Boundaries follow change', 'Place boundaries where change happens.',
      'A good boundary groups what changes together and separates what changes for different reasons.',
      'arc42 distinguishes change scenarios (effort or duration of modifications) from usage scenarios. Your change scenarios from lesson 2 tell you where boundaries must hold: "add a vendor", "swap the payment provider", "add a language".',
      'For each change scenario, list the building blocks that would have to change.',
      'List the building blocks a "swap the payment provider" scenario would touch.'],
    ['Coupling and cohesion', 'Judge a boundary by coupling and cohesion.',
      'Low coupling means few, small dependencies between blocks; high cohesion means a block does one cluster of related things.',
      'Signs of bad boundaries: one change touches five blocks; two blocks always change together; a block imports internals of another; a shared database table is written by many blocks.',
      'Count how many blocks each change scenario touches, and aim for one or two.',
      'A change touches five blocks. Is that a coupling or a cohesion problem, or both?'],
    ['The dependency rule', 'Set direction for dependencies.',
      'Dependencies should point one way: from details toward the core, and never in circles.',
      'Write the allowed directions between your building blocks in a table. A cycle between two blocks means they are really one block, or a third idea is missing. Allowed directions can be checked by a tool in every build (lesson 15).',
      'Draw the dependency arrows between your blocks and remove cycles.',
      'What does a dependency cycle between two blocks suggest?'],
    ['Right-sized blocks', 'Avoid both too many and too few blocks.',
      'Too few blocks make a big ball of mud; too many make a distributed one.',
      'Size blocks by what a team can understand and change independently. Splitting into services adds network calls, deployment and data issues; do it for a quality reason in a scenario, not for fashion.',
      'For each proposed split, name the scenario it helps and the cost it adds.',
      'Name a reason to split a block that appears in a scenario, and one that does not.']
  ],
  guide: [
    'Boundaries are decisions, and the best test of one is a change scenario. Take "add a vendor", walk through the system, and list what you must touch. If the answer is "everything", the boundaries are wrong for that scenario. If it is "one configuration entry", the boundary works.',
    'Many teams split systems into services early for scalability, then find the real problem was change. A well-structured single deployable with clear module boundaries often meets change scenarios at far less cost, and can be split later if a scenario demands it.'
  ],
  case: 'Illustrative case. Walking "swap the payment provider" through the design shows the provider\'s types in six places, including the order screen and the reports. The team introduces a small Payments interface with the five operations they use and moves provider code behind it. The same scenario now touches one block and one adapter. They also find that Orders and Menu import each other; a short design session shows the shared idea is "Catalogue", which they extract.',
  lab: {
    title: 'Test your boundaries with change scenarios',
    intro: 'Use your Level 1 building-block view and your change scenarios.',
    tasks: [
      'Write three change scenarios and list the building blocks each would touch.',
      'Write the allowed dependency directions as a table and mark any cycles.',
      'Propose one boundary change that would reduce the number of blocks touched, with its cost.',
      'Say which one proposed split you will not do, and why.'
    ],
    evidence: 'Three change scenarios with touched blocks, a dependency table, one boundary proposal and one rejected split.',
    model: '| Change scenario | Blocks touched today | After |\n|---|---|---|\n| Swap payment provider | Orders, Reports, Checkout screen, Admin, Receipts, Config | Payments adapter only |\n| Add a vendor | Config | Config |\n| Add a language | Every screen | Translation layer |\n\n**Dependencies.** UI → Orders → Payments, Catalogue. Cycle found: Orders ↔ Menu, resolved by a Catalogue block.\n**Rejected split.** Reports as a separate service: no scenario needs it; costs a deployment and a network hop.'
  },
  rubric: [
    ['Change scenarios', 'None', 'Described without blocks', 'Each with the blocks it touches'],
    ['Dependencies', 'Not shown', 'Shown, with cycles', 'Shown, cycles resolved'],
    ['Boundary proposal', 'None', 'Proposed without cost', 'Proposed with cost and the scenario it helps'],
    ['Restraint', 'Splits everything', 'Splits some without reasons', 'Names a split not worth making']
  ],
  quiz: [
    ['What is the best test of a boundary?', ['How it looks on a diagram.', 'How many blocks a realistic change scenario touches.', 'The number of services.', 'The team size.'], 1, 'Change scenarios show whether related changes stay within one block.'],
    ['A cycle between two blocks suggests...', ['A healthy design.', 'They are really one block, or a shared concept is missing.', 'A need for more services.', 'A testing gap.'], 1, 'Extract the shared idea or merge the blocks.'],
    ['Why should a split be tied to a scenario?', ['Scenarios are mandatory.', 'A split adds cost, so it must buy a stated quality.', 'To make the diagram bigger.', 'To use more tools.'], 1, 'Splitting adds network calls and deployment overhead; it should serve a named scenario.']
  ],
  sources: [
    'arc42 documentation, section 10.2 Quality Scenarios (change scenarios). docs.arc42.org/section-10/',
    'arc42 documentation, section 5 Building Block View. docs.arc42.org/section-5/'
  ]
},
{
  n: 13, title: 'Interfaces and Contracts',
  lead: 'Most systems break at the seams. You will write interfaces as contracts that say what is promised and what is not, plan for them to change, and keep consumers from being surprised.',
  slides: [
    ['An interface is a promise', 'Describe an interface as a contract.',
      'An interface is a promise about what a block offers, how to ask, and what happens when things go wrong.',
      'A contract names the operations, the data shapes, the errors, the limits (rate, size, time) and the quality promises (for example "responds in 300 ms at p95"). arc42 section 3 covers the context and its external interfaces; section 5 covers internal ones.',
      'Write each important interface with its errors and limits, not only its happy path.',
      'List three things beyond the data shape that belong in an interface contract.'],
    ['Change without breaking', 'Plan for an interface to evolve.',
      'Interfaces change; the job is to change them without breaking consumers.',
      'Additive changes (new optional fields, new operations) are usually safe; removing or renaming fields, changing meaning or tightening limits is breaking. Version the interface, say how long old versions are supported, and tell consumers how they will hear about changes.',
      'Write the compatibility rule in the contract: what is additive, what is breaking and how long you support old versions.',
      'Is adding an optional field breaking? Is renaming one?'],
    ['Contracts you can test', 'Make contracts checkable.',
      'A contract that is not tested is a hope.',
      'Use examples as tests: a set of requests and expected responses that both sides run. Consumer-driven contract tests let each consumer state what it relies on, so the provider learns what it must not break. Tests run in both builds.',
      'Keep a small set of example calls beside each interface and run them in the build.',
      'What does a consumer-driven contract test tell a provider?'],
    ['Failure behaviour', 'Specify what happens when a call fails.',
      'Every interface needs a stated behaviour for timeouts, retries and duplicates.',
      'Say whether an operation is safe to retry (idempotent) and how: for example an order carries a client-generated ID, so a second submission is recognised and not created twice. State timeouts and what the caller should show the user.',
      'For every operation that changes data, write whether it is safe to retry and how duplicates are detected.',
      'How can a server recognise a retried order as the same order?']
  ],
  guide: [
    'Write the contract before the code where you can, and keep it where both sides see it. The most valuable lines are rarely the data shapes; they are the sentences about errors, retries, limits and what is not promised.',
    'Interfaces to systems you do not control, such as a payment provider, are especially risky because you cannot version them. Put an adapter in front, write your own contract at that boundary, and test the adapter against a recorded set of the provider\'s responses.'
  ],
  case: 'Illustrative case. The orders interface returns "status": "ok" or an error code. A mobile app released two years ago treats any unknown status as a failure. When the team adds the status "pending", old apps show an error and customers reorder. A contract that said "clients must ignore unknown statuses" would have told the app authors what to do; a published compatibility rule would have told the provider that adding a value was breaking for this consumer. They add both rules and example calls to the build.',
  lab: {
    title: 'Write contracts for your two riskiest interfaces',
    intro: 'Choose the interface to the outside world that worries you most and one internal interface.',
    tasks: [
      'For each interface list operations, data shapes, errors, limits and quality promises.',
      'Write the compatibility rule: what is additive, what is breaking, and how long old versions are supported.',
      'Write the retry and duplicate behaviour for each operation that changes data.',
      'Write three example calls with expected responses that a test could run.'
    ],
    evidence: 'Two contracts with errors and limits, the compatibility rule, retry behaviour and three example calls.',
    model: '**POST /orders.** Body: vendorId, items[], clientOrderId. Responses: 201 created, 200 already received (same clientOrderId), 422 invalid item, 503 retry later. Limits: 50 items, 1 MB. Promise: p95 under 300 ms.\n**Compatibility.** Adding optional fields or enum values is additive; clients must ignore unknown values. Removing or renaming is breaking; old versions supported 12 months after a replacement.\n**Retry.** Safe to retry with the same clientOrderId.\n**Examples.** (1) valid order → 201. (2) same request again → 200. (3) unknown item → 422.'
  },
  rubric: [
    ['Completeness', 'Data shapes only', 'Shapes and errors', 'Shapes, errors, limits and quality promises'],
    ['Compatibility rule', 'None', 'Mentions versions', 'States additive, breaking and support period'],
    ['Retry behaviour', 'Not stated', 'Stated for some', 'Stated for every changing operation'],
    ['Examples', 'None', 'One or two', 'Three or more runnable examples']
  ],
  quiz: [
    ['Which change is usually breaking?', ['Adding an optional field.', 'Renaming a field.', 'Adding a new operation.', 'Adding documentation.'], 1, 'Consumers rely on names; renaming or removing breaks them.'],
    ['How can a server recognise a retried order?', ['By the time of day.', 'By a client-generated ID sent with the order.', 'By IP address.', 'It cannot.'], 1, 'An idempotency key makes retries safe.'],
    ['What is a consumer-driven contract test?', ['A test written by the provider about itself.', 'A test where each consumer states what it relies on and the provider must keep it passing.', 'A load test.', 'A security audit.'], 1, 'It tells the provider what it must not break.']
  ],
  sources: [
    'arc42 documentation, sections 3 Context and Scope and 5 Building Block View. docs.arc42.org/section-5/'
  ]
},
{
  n: 14, title: 'Data Ownership and Consistency',
  lead: 'Data outlives code, and who owns it decides who can change it. You will assign every important piece of data a single owner, choose how much consistency each use needs, and write down the price.',
  slides: [
    ['One owner per fact', 'Assign each important piece of data one owner.',
      'Every important fact should have one owning block that is the source of truth; others hold copies.',
      'Two blocks that both write the same table will eventually disagree. List your main data (orders, vendors, menu, payments) and write the owner, the readers, and how readers learn about changes: by query, by event or by copy.',
      'Make a table of data, owner, readers and how they stay up to date.',
      'Who owns a vendor\'s payout details in your system, and who may read them?'],
    ['How much consistency', 'Choose the consistency each use needs.',
      'Not every read needs the latest value; decide per use, and write down how stale is acceptable.',
      'A balance shown before a payment may need to be exact; a "popular items" list can be minutes old. Stronger consistency costs latency, availability or money. State the acceptable staleness as a number in a scenario.',
      'Write "may be up to N seconds old" next to every copy.',
      'Name one use in your system that needs exact data and one that can be stale.'],
    ['Distributed changes', 'Handle a change that spans blocks.',
      'A change that spans two owners cannot be one transaction; design the steps and the failures.',
      'Write the steps (reserve stock, take payment, confirm order), what happens if step two fails (release the stock), and what the user sees. Compensating steps and idempotent operations (lesson 13) make partial failure survivable.',
      'Draw one multi-step flow with a compensation for each step that can fail.',
      'What compensation undoes "reserve stock" if payment fails?'],
    ['Data outlives code', 'Plan for the data to change shape and move.',
      'Plan for the schema to change, for data to be exported and for old data to be deleted.',
      'Write a retention rule per data type with its source (law, contract, need). Keep a way to migrate: schema versions, backward-compatible changes first, and an export you have tested. Deletion is a design requirement, not an afterthought.',
      'Write for each data type how long it is kept and how it is deleted.',
      'Why is deletion a design concern?']
  ],
  guide: [
    'Data ownership is the quiet source of most integration pain. When it is unclear, teams copy data "just for reporting", then copy the copy, and nobody knows which is right. A table of owners, readers and staleness limits prevents that and takes an hour to write.',
    'Consistency choices are decisions with consequences. Record them as decisions: "Stock shown on the menu may be up to 30 s stale; an order is always checked against the owner at submission." That sentence tells developers what to build and tells vendors what to expect.'
  ],
  case: 'Illustrative case. Reports reads a copy of orders that Orders updates nightly. A vendor sees yesterday\'s totals and complains. The team writes the ownership table. Orders owns orders; Reports holds a copy, may be 5 minutes stale, and receives order events. The nightly copy is replaced by events, with a nightly reconciliation to catch gaps. For a two-step flow of reserve-then-pay, they write a compensation: if payment fails within 2 minutes, stock is released.',
  lab: {
    title: 'Write your data ownership table',
    intro: 'List the five most important kinds of data in your system.',
    tasks: [
      'For each data type write the owner, the readers and how readers stay up to date.',
      'For each copy, state how stale it may be, as a number.',
      'Draw one multi-step flow across two owners and write a compensation for each step that can fail.',
      'Write retention and deletion for each data type with its source.'
    ],
    evidence: 'The ownership table with staleness limits, one flow with compensations and the retention rules.',
    model: '| Data | Owner | Readers | Freshness | Retention |\n|---|---|---|---|---|\n| Orders | Orders | Reports (events), Vendor app (query) | Reports ≤ 5 min | 7 years (tax rule) |\n| Menu | Catalogue | Orders (query) | ≤ 30 s | Until vendor leaves + 90 days |\n| Payout details | Payments | none | exact | Until vendor leaves + 7 years |\n\n**Flow.** Reserve stock → take payment → confirm. If payment fails in 2 min, release stock; if confirm fails, refund.'
  },
  rubric: [
    ['Single owner', 'Several owners', 'Owner named for most', 'One owner per data type'],
    ['Staleness', 'Not stated', 'Words only', 'A number per copy'],
    ['Failure flows', 'Happy path only', 'Some failures', 'Compensation for each step'],
    ['Retention', 'None', 'Without source', 'Rule, source and deletion method']
  ],
  quiz: [
    ['Why should each fact have one owner?', ['To reduce the number of tables.', 'Two writers will eventually disagree.', 'It is faster.', 'Databases require it.'], 1, 'A single source of truth lets other copies be refreshed and checked.'],
    ['What is a compensation?', ['A payment to users.', 'A step that undoes an earlier step when a later one fails.', 'A bug fix.', 'A test.'], 1, 'Multi-owner flows cannot be one transaction, so they need explicit undo steps.'],
    ['How should acceptable staleness be written?', ['As "reasonably fresh".', 'As a number, such as up to 30 seconds.', 'It should not be written.', 'As a colour.'], 1, 'A number can be tested and agreed.']
  ],
  sources: [
    'arc42 documentation, sections 5 Building Block View and 8 Cross-cutting Concepts. docs.arc42.org/section-5/'
  ]
},
{
  n: 15, title: 'Fitness Functions and Architecture Drift',
  lead: 'Documents go stale and designs wear away. You will turn your most important decisions into automatic checks, so the build tells you when the code stops matching the architecture.',
  slides: [
    ['What drift is', 'Explain architecture drift.',
      'Drift is the slow gap between what the architecture says and what the code does.',
      'Each shortcut is small. After a year the dependency rules in your section 5 are no longer true, and a decision record describes something the code no longer does. Drift is normal; the question is whether you see it.',
      'Choose three statements in your arc42 that you would be upset to find false.',
      'Which statement in your arc42 is most likely to have drifted?'],
    ['Fitness functions', 'Define a fitness function.',
      'A fitness function is an automatic check that an architectural property still holds.',
      'The term comes from evolutionary architecture (Ford, Parsons, Kua). Examples: a test that fails when UI code imports database code; a build check that no cycle exists between modules; a load test that fails when p95 exceeds the scenario; a script that fails when an ADR links to a missing scenario.',
      'For each important decision, write one check that would fail if the decision were broken.',
      'Write a check that would catch "Orders must not call Reports".'],
    ['Cheap checks first', 'Choose practical, cheap checks.',
      'Start with checks that need no new tools: import rules, file-existence checks and one performance test.',
      'A simple script that scans imports, or a test that opens the ADR folder and checks every ADR has a status and a scenario link, costs an hour and pays back. Run them on every change. Keep the number small; a hundred noisy checks get ignored.',
      'Pick three checks you can add this week and run them in the build.',
      'Which three checks would you add first?'],
    ['Docs and code together', 'Keep documents and code in step.',
      'Keep architecture documents in the repository and review them with the code.',
      'Put the arc42 and ADRs in the repo, as text. A change that alters a boundary should change the document in the same review. A check can flag when a changed module has no matching update to its description.',
      'Make "does this change affect an ADR or scenario?" a question in the code review template.',
      'What question would you add to your review checklist?']
  ],
  guide: [
    'Fitness functions are not exotic. They are tests for the decisions you already made. Start from your ADRs: for each one, ask "how would I know if this stopped being true?", and write the cheapest automatic answer.',
    'Pair each check with the decision it protects, and write the link in the ADR. When a check fails, the team learns either that the code drifted, or that the decision should be revisited. Both are useful. A failing check that is simply deleted is a decision made without a record.'
  ],
  case: 'Illustrative case. The team has four checks: an import rule (UI must not import the database module), a cycle check, a nightly load test at the Q1 load that fails above p95 2 s, and an ADR lint that fails if a record lacks a status or scenario link. Three weeks later the import rule fails: a developer imported the database client into a screen to fix a bug quickly. The failure leads to a five-minute fix and a note in the review checklist.',
  lab: {
    title: 'Write fitness functions for three decisions',
    intro: 'Use the decisions and scenarios you have recorded so far.',
    tasks: [
      'Choose three decisions or scenarios and write the property each must keep.',
      'For each write the check in plain words: what it examines, what makes it fail, and how often it runs.',
      'Say for each whether it can run in the build and what it would cost to add.',
      'Add the checks to your ADRs as a "Protected by" line and add a question to your review checklist.'
    ],
    evidence: 'Three checks with failure conditions, their cost, links from the ADRs and the review question.',
    model: '| Protects | Check | Fails when | Runs |\n|---|---|---|---|\n| ADR-004 UI never touches the database | Import rule over source files | any UI file imports the data module | every build |\n| Q1 p95 under 2 s | Load test at 500 orders a minute | p95 exceeds 2 s | nightly |\n| ADR quality | ADR lint | a record lacks status or scenario link | every build |\n\n**Review question.** Does this change affect an ADR, a scenario, or an interface contract?'
  },
  rubric: [
    ['Property', 'Vague', 'Stated', 'Stated and tied to a decision or scenario'],
    ['Failure condition', 'None', 'Described loosely', 'Precise condition that can be coded'],
    ['Practicality', 'No cost thought of', 'Cost mentioned', 'Cost and frequency stated'],
    ['Link', 'No link', 'Link from check only', 'Link from the ADR and the review checklist']
  ],
  quiz: [
    ['What is a fitness function?', ['A gym test.', 'An automatic check that an architectural property still holds.', 'A performance review.', 'A UML diagram.'], 1, 'It tests that a decision or quality scenario is still true in the code.'],
    ['What should you do when a fitness check fails?', ['Delete the check.', 'Decide whether the code drifted or the decision should change, and record which.', 'Ignore it.', 'Rewrite the tests.'], 1, 'Either answer is useful; deleting silently is an unrecorded decision.'],
    ['Why keep the number of checks small?', ['Checks are expensive.', 'Noisy checks get ignored.', 'Tools allow only ten.', 'To reduce the architecture.'], 1, 'A few meaningful checks are better than many that people stop reading.']
  ],
  sources: [
    'Ford, Parsons, Kua. Building Evolutionary Architectures. O\'Reilly Media. oreilly.com/library/view/building-evolutionary-architectures/9781491986356/ch02.html',
    'arc42 documentation, section 9 Architecture Decisions. docs.arc42.org/section-9/'
  ]
}
];
