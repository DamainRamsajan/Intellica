// Level 2, lessons 7-11: Deciding well.
export default [
{
  n: 7, title: 'Decision Drivers and Constraints',
  lead: 'Good decisions start from the forces that push on them. You will separate the drivers you can negotiate from the constraints you cannot, and write them where the next person will look.',
  slides: [
    ['Drivers, goals and constraints', 'Tell a driver from a constraint.',
      'A constraint limits your options and cannot be traded; a driver pushes you toward one option and can be weighed against others.',
      'arc42 puts constraints in section 2 and the most important decisions and strategy in section 4. A rule such as "must run on the customer\'s cloud account" is a constraint. "We would like fast releases" is a driver.',
      'For each force on a decision, mark it constraint or driver, and test the constraint by asking who can lift it.',
      'Is "the team only knows Python" a constraint or a driver? What would change your answer?'],
    ['Find the hidden ones', 'Surface constraints nobody wrote down.',
      'Many constraints live in people\'s heads: skills, budget, contracts, calendars and politics.',
      'Ask five questions: What must we use? What may we not use? What can we not afford? What must be done by when? Who must agree? The answers are often one sentence each and change the option list.',
      'Hold a 30-minute session with the sponsor and the operations lead, and write their answers down verbatim.',
      'Which of the five questions would your team find hardest to answer today?'],
    ['Decision drivers', 'List the drivers for a single decision.',
      'Every decision should name the three to five drivers that matter, ranked.',
      'Typical drivers come from the quality tree: the High/High leaves, a cost ceiling, a deadline, a skills gap. Each driver should point to a scenario or constraint already written, so that the link from requirement to decision can be followed.',
      'Cite the scenario ID beside each driver in the decision record.',
      'Name three drivers for choosing a database for your system and cite the scenario for each.'],
    ['Challenge a constraint', 'Test whether a constraint is real.',
      'Constraints are sometimes assumptions in disguise; challenge the expensive ones.',
      'Ask: who set this, when, and for what reason? Is the reason still true? What would lifting it save? A constraint that costs a lot and has no living owner deserves a question to the sponsor.',
      'Record the answer. A lifted constraint is a result; a confirmed one is a record.',
      'Which constraint in your system costs the most, and who could lift it?']
  ],
  guide: [
    'Drivers and constraints are the inputs to every decision record. If they are missing, the record shows a choice with no reason, and the next team cannot tell if the reason still holds. arc42 asks for rejected alternatives and the criteria used; the criteria are your drivers.',
    'Be strict about the difference. Constraints reduce the option set before you start weighing; drivers rank what remains. Mixing them leads to a matrix in which "must run on-premise" gets a weight of 8 out of 10, which is nonsense.'
  ],
  case: 'Illustrative case. The vendor app team is choosing how to store orders. Constraints from the session: card data only at the payment provider (contract), customer data in-region (contract), one operations person. Drivers: offline ordering (Q2, High/High), cost ceiling (Q5), team knows SQL. The one-operator constraint rules out running a self-managed cluster before any weighing starts. Challenged, the sponsor confirms the in-region rule but lifts a "no managed services" rule that nobody could source.',
  lab: {
    title: 'Write constraints and drivers for three decisions',
    intro: 'Choose three decisions your system must make or has made: for example storage, hosting, and how components communicate.',
    tasks: [
      'Run the five questions with someone from the business or operations and write the constraints.',
      'For each of the three decisions write three to five ranked drivers and cite the scenario or constraint behind each.',
      'Mark every constraint with its owner and the reason it exists.',
      'Challenge your most expensive constraint and record the answer.'
    ],
    evidence: 'A constraints table with owners and reasons, three driver lists with scenario references, and the recorded challenge.',
    model: '| Constraint | Owner | Reason |\n|---|---|---|\n| Card data only at the payment provider | Finance | Provider contract |\n| Customer data in-region | Legal | Customer contract, clause 7 |\n| One operations person | Head of ops | Budget |\n\n**Decision: order storage.** Drivers: (1) works offline, Q2; (2) cost under US$0.40 per thousand orders, Q5; (3) team knows SQL; (4) in-region.\n**Challenged:** "No managed services". Owner: sponsor. Reason: an old policy from a past outage. Lifted on 12 Feb.'
  },
  rubric: [
    ['Constraints vs drivers', 'Mixed', 'Mostly separated', 'Clearly separated with owners'],
    ['Link to scenarios', 'No links', 'Some links', 'Every driver cites a scenario or constraint'],
    ['Ranking', 'Unranked', 'Ranked without reasons', 'Ranked with a reason'],
    ['Challenge', 'None', 'Question asked, not recorded', 'Question, answer and outcome recorded']
  ],
  quiz: [
    ['Which is a constraint?', ['We want fast releases.', 'The contract requires data to stay in the region.', 'Users prefer dark mode.', 'The team likes a framework.'], 1, 'A contract duty cannot be traded against other goals.'],
    ['Why cite a scenario beside each driver?', ['To make the record longer.', 'So the reason for the decision can be traced and re-checked.', 'To satisfy a tool.', 'Scenarios are drivers.'], 1, 'Without a link nobody can tell if the reason still holds.'],
    ['What should you do with an expensive constraint nobody owns?', ['Ignore it.', 'Ask who set it, why, and whether it still holds.', 'Remove it silently.', 'Add more weight to it.'], 1, 'Constraints are sometimes assumptions in disguise; record the answer.']
  ],
  sources: [
    'arc42 documentation, sections 2 Constraints, 4 Solution Strategy and 9 Architecture Decisions. docs.arc42.org/section-9/'
  ]
},
{
  n: 8, title: 'Options, Criteria and Trade-off Analysis',
  lead: 'Choosing well means laying out real options, judging them against stated criteria, and showing what you give up. You will use a decision matrix honestly and know when not to trust it.',
  slides: [
    ['Real options', 'Generate options that are genuinely different.',
      'A decision needs at least two real options, and "do nothing" or "use what we have" is one of them.',
      'arc42 asks for rejected alternatives and the criteria used to choose. Three options are better than two; seven are usually too many. Each option should be stated in a sentence and be feasible under the constraints.',
      'Write each option as a short sentence and check it against the constraints before analysing it.',
      'For storing orders offline, name three genuinely different options.'],
    ['Criteria from drivers', 'Derive criteria from your drivers.',
      'Criteria are your drivers made comparable: each is something you can say an option does better or worse.',
      'Start from the ranked drivers of lesson 7. For each, say how you would judge an option: a number from a spike, a scenario result, a cost estimate or a plain High/Medium/Low rating with a reason.',
      'Keep criteria few, 4 to 6, and write the evidence for each cell, not just the score.',
      'Write the evidence you would need to rate an option on "works offline".'],
    ['The decision matrix', 'Use a weighted matrix without being fooled by it.',
      'A weighted matrix organises the argument; it does not make the decision.',
      'Scores such as 3 or 4 out of 5 look precise but are judgments. Small changes in weights can flip the winner, so test the result: change a weight by one step and see if the answer moves. If it does, the options are close and the discussion matters more than the total.',
      'Present the matrix and the sensitivity check together, and read the cells, not the total.',
      'What should you do if changing one weight flips the winner?'],
    ['Say what you give up', 'State the cost of the chosen option.',
      'Every option costs something; the record should say what you accept by choosing it.',
      'Write each consequence as positive, negative or neutral. For the chosen option, write its two worst consequences, who bears them, and what would make you revisit the decision.',
      'Add a "revisit when" line: a measurable trigger such as "if orders exceed 2,000 a minute".',
      'Write a "revisit when" trigger for a decision of yours.']
  ],
  guide: [
    'People like matrices because they feel objective. Use them to expose reasons, not to hide opinions in numbers. The most valuable part is usually the argument about the criteria, because that is where the team discovers it disagrees on what matters.',
    'ATAM-style trade-off analysis asks a sharper question than "which scores highest": where does this choice help one quality and hurt another, and how much? Add a short trade-off sentence for each option in addition to the scores.'
  ],
  case: 'Illustrative case. Three options for offline ordering: A) a local database on the phone that syncs; B) a queue of requests replayed on reconnect; C) require a connection and show a clear message. C is cheapest and fails the High/High scenario. The matrix puts A narrowly ahead of B. Changing the weight for cost from 2 to 3 flips them. The team reads the cells: A needs a conflict-resolution rule for edits, B does not because orders are append-only. They choose B and record: "Gives up editing an order while offline. Revisit if vendors need offline edits."',
  lab: {
    title: 'Compare options for your first decision',
    intro: 'Take the first of your three decisions from lesson 7.',
    tasks: [
      'Write three genuinely different options, each in a sentence, including one simple or "do nothing" option.',
      'Write four to six criteria from your drivers and the evidence you will use for each.',
      'Fill the matrix with ratings and a reason for each cell, then run the weight sensitivity check.',
      'Write the two worst consequences of your choice, who bears them, and a measurable revisit trigger.'
    ],
    evidence: 'The options, the criteria with evidence, the matrix with sensitivity check and the consequences with a revisit trigger.',
    model: '**Options.** A local database that syncs; B a queue replayed on reconnect; C require a connection.\n| Criterion | A | B | C |\n|---|---|---|---|\n| Works offline (Q2) | H | H | L, fails |\n| Cost (Q5) | M | M | H |\n| Team skill | M | H | H |\n| Complexity | L | M | H |\n**Sensitivity:** raising cost weight flips A and B, so options are close; cells decide.\n**Choice:** B. **Gives up:** editing an order offline. **Revisit when:** vendors ask for offline edits in more than 10% of tickets.'
  },
  rubric: [
    ['Options', 'One option', 'Two options', 'Three real options including a simple one'],
    ['Criteria', 'Not linked to drivers', 'Linked, no evidence', 'Linked with evidence for each'],
    ['Sensitivity', 'Not tested', 'Mentioned', 'Tested and discussed'],
    ['Consequences', 'Positive only', 'Both listed', 'Worst two, who bears them, revisit trigger']
  ],
  quiz: [
    ['What should you do when a small change in one weight flips the matrix winner?', ['Pick the higher total.', 'Treat the options as close and read the cell reasons.', 'Change the weights back.', 'Choose at random.'], 1, 'A flip shows the totals are not decisive; the argument matters more.'],
    ['What does arc42 ask you to record besides the chosen option?', ['The meeting date only.', 'The rejected alternatives and the criteria used to choose.', 'Nothing more.', 'The names of voters.'], 1, 'Section 9 asks for rejected alternatives and criteria.'],
    ['A good "revisit when" trigger is...', ['Someday.', 'If we are unhappy.', 'If orders exceed 2,000 a minute.', 'After the next release.'], 2, 'A measurable trigger says when new facts should reopen the decision.']
  ],
  sources: [
    'arc42 documentation, section 9 Architecture Decisions. docs.arc42.org/section-9/',
    'Kazman and others. The Architecture Tradeoff Analysis Method. SEI, 1998. sei.cmu.edu/library/the-architecture-tradeoff-analysis-method'
  ]
},
{
  n: 9, title: 'Architecture Decision Records in Practice',
  lead: 'A decision nobody wrote down gets remade, or reversed by accident. You will write short records that keep the reason alive, and learn how to store them so people and tools find them.',
  slides: [
    ['What an ADR is', 'Describe an ADR and its five parts.',
      'An architecture decision record is a short document about one decision, with its reason and consequences.',
      'Michael Nygard proposed the format on 15 November 2011: Title, Context, Decision, Status and Consequences. Status values are proposed, accepted, deprecated and superseded. arc42 section 9 recommends one ADR per important decision.',
      'Write each ADR in about a page, in plain sentences.',
      'Name the five parts of a Nygard ADR.'],
    ['Which decisions to record', 'Choose what deserves a record.',
      'Record only architecturally significant decisions: those that affect structure, quality, key dependencies, interfaces or construction techniques.',
      'arc42 gives that test. Many choices are local and belong in code or a building-block description. If reversing it would take weeks, or change a quality scenario, it deserves a record.',
      'Ask "would a new team member need this to understand why the system is like this?"',
      'Is a choice of date-format library significant? Is the choice of database?'],
    ['Keep them honest', 'Keep records stable and readable over time.',
      'Number records sequentially, never reuse a number, and never rewrite history.',
      'Nygard\'s rule: numbers are sequential and monotonic and not reused. When a decision is reversed, keep the old record and mark it superseded by the new one. The trail of changes is part of the value.',
      'Store records in the repository next to the code so they change in the same review.',
      'What should you do with an old ADR when a decision is reversed?'],
    ['Consequences and links', 'Write consequences that help later readers.',
      'Consequences should list negative and neutral effects as well as positive ones, and link to scenarios.',
      'arc42 stresses that teams usually see what was chosen but not why. Link each ADR to the scenarios (Q numbers) and drivers it serves, and to the building blocks it affects, so a reader can move both ways.',
      'End every record with the scenarios it protects and a revisit trigger.',
      'Why list neutral and negative consequences?']
  ],
  guide: [
    'The point of an ADR is the next reader: a new colleague, an auditor, an agent working in the repository, or you in a year. Write for them. State the situation (context), the choice (decision) in active voice, and what follows (consequences). Keep it short enough that people will actually read it.',
    'A common failure is writing records after the fact to justify a choice. Write them while deciding: the act of writing the alternatives and the consequences often changes the decision. If you must record a past decision, say so and mark the reasons as reconstructed.'
  ],
  case: 'Illustrative case. ADR-003 reads: "Title: Queue offline orders on the phone. Status: accepted. Context: Q2 requires orders with no connection; vendors have weak data; one operations person. Decision: We will store orders in a local queue and replay them on reconnect. Consequences: (+) satisfies Q2; (+) no conflict rules since orders are append-only; (−) vendors cannot edit an order offline; (neutral) need a retry and duplicate check on the server. Revisit if vendors ask for offline edits in over 10% of tickets." A year later ADR-011 supersedes it, and ADR-003 stays, marked superseded.',
  lab: {
    title: 'Write three decision records',
    intro: 'Turn your three decisions from lesson 7 into records.',
    tasks: [
      'Write each decision as an ADR with Title, Status, Context, Decision and Consequences.',
      'Give every record a sequential number and link it to the scenarios it serves.',
      'In each Consequences section include at least one negative and one neutral effect.',
      'Add a revisit trigger to each record, and list the three in a decision log table for arc42 section 9.'
    ],
    evidence: 'Three ADRs, each linked to scenarios, and the section 9 decision log.',
    model: '### ADR-003: Queue offline orders on the phone\n**Status:** accepted\n**Context:** Q2 requires orders without a connection; vendors have weak data; one operations person.\n**Decision:** We will store orders in a local queue and replay them on reconnect.\n**Consequences:** (+) meets Q2. (+) no conflict rules, orders are append-only. (−) no offline editing. (neutral) server needs a duplicate check.\n**Serves:** Q2, Q5. **Revisit:** offline edits requested in over 10% of tickets.\n\n| ADR | Decision | Status |\n|---|---|---|\n| 001 | Managed SQL database in-region | accepted |\n| 002 | Payment provider hosts card forms | accepted |\n| 003 | Offline order queue | accepted |'
  },
  rubric: [
    ['Structure', 'Free text', 'Some parts missing', 'All five parts present'],
    ['Consequences', 'Positive only', 'Both positive and negative', 'Positive, negative and neutral'],
    ['Traceability', 'No links', 'Links to scenarios', 'Scenarios and revisit trigger'],
    ['Significance', 'Trivial choices recorded', 'Mix', 'Only significant decisions recorded']
  ],
  quiz: [
    ['What should you do with an ADR when its decision is reversed?', ['Delete it.', 'Edit it to match the new decision.', 'Keep it and mark it superseded by the new record.', 'Move it to an archive that nobody reads.'], 2, 'Nygard: keep the old record and mark it superseded; the history has value.'],
    ['Which are Nygard\'s five ADR parts?', ['Title, Context, Decision, Status, Consequences', 'Title, Author, Date, Tags, Body', 'Goal, Plan, Risk, Cost, Time', 'Problem, Cause, Fix, Test, Review'], 0, 'Title, Context, Decision, Status and Consequences, as in his 2011 post and arc42 section 9.'],
    ['Where should ADRs live?', ['In a chat thread.', 'In the repository next to the code.', 'In someone\'s head.', 'In an email folder.'], 1, 'They then change in the same review as the code and can be found by people and tools.']
  ],
  sources: [
    'Nygard, M. Documenting Architecture Decisions. Cognitect, 15 November 2011. cognitect.com/blog/2011/11/15/documenting-architecture-decisions',
    'arc42 documentation, section 9 Architecture Decisions. docs.arc42.org/section-9/'
  ]
},
{
  n: 10, title: 'Spikes and Cheap Evidence',
  lead: 'Arguments about options go on forever; a small experiment ends them. You will design a spike with a question, a time box and a pass mark, and record what you learned.',
  slides: [
    ['What a spike is', 'Define a spike and when to use one.',
      'A spike is a small, time-boxed experiment that answers one question about a risky option.',
      'Use a spike when an option rests on an assumption nobody has checked: "the sync library handles 5,000 queued orders", "the provider accepts a retry within 10 seconds". It is not a prototype to keep.',
      'Write the assumption first, then decide whether a spike is cheaper than being wrong.',
      'Name an assumption in one of your options that a spike could test.'],
    ['Question, box, pass mark', 'Design a spike properly.',
      'A good spike has one question, a time box, a pass mark and a place to write the answer.',
      'Example: "Can the phone queue 5,000 orders and replay them in under 60 seconds? Time box: 2 days. Pass: replay in under 60 s with no duplicates on the server." Without the pass mark, the spike produces opinions.',
      'Decide the pass mark before you start so you cannot move it afterwards.',
      'Write the question, time box and pass mark for one spike of yours.'],
    ['Cheap evidence', 'Choose the cheapest evidence that answers the question.',
      'Evidence ranges from reading the docs to a full load test; take the cheapest that answers the question.',
      'Order by cost: read the vendor limits, ask a user of the product, run a small script, build a thin vertical slice. A thin slice through the real path often reveals problems a paper analysis misses.',
      'Prefer evidence from your own conditions: your data, your devices, your network.',
      'Which kind of evidence would answer "can the provider retry safely?" most cheaply?'],
    ['Record the result', 'Turn the spike result into a decision input.',
      'A spike result goes into the decision record as evidence, including when it failed.',
      'Write: the question, what you did, what you saw, the numbers, and what it means for the options. A failed spike is a success if it eliminated an option cheaply.',
      'Link the spike notes from the ADR and keep them even if the code is thrown away.',
      'Why record a spike that failed?']
  ],
  guide: [
    'The most common spike failure is scope creep: a two-day test turns into a three-week prototype that nobody dares throw away. The time box and the pass mark protect you. When the box ends, write down what you know, decide, and delete the code or label it clearly as throwaway.',
    'Evidence should be proportionate. If an option would be easy to reverse, a quick look is enough. If it would be hard to reverse (lesson 11), spend more. The more expensive the mistake, the more a spike is worth.'
  ],
  case: 'Illustrative case. The team doubts the local-queue option: will a phone really hold and replay thousands of orders? Question: can a mid-range phone queue 5,000 orders and replay them in under 60 s with no duplicates? Time box: two days. They test on two older phones in airplane mode. Replay takes 41 s on the better phone and 95 s on the older one, with no duplicates. The result changes the decision: batch the replay and show progress. The spike notes are linked from ADR-003.',
  lab: {
    title: 'Plan and record one spike',
    intro: 'Choose the riskiest assumption behind your first decision.',
    tasks: [
      'State the assumption and why being wrong would be expensive.',
      'Write the question, the time box and the pass mark before running anything.',
      'Run the spike, or a paper version of it using vendor limits and a calculation, and record the numbers.',
      'Write what the result means for your options and link it from the decision record.'
    ],
    evidence: 'The assumption, the spike plan, the recorded result, and the updated ADR link.',
    model: '**Assumption.** A mid-range phone can hold 5,000 queued orders and replay them quickly. If wrong, offline ordering fails for busy vendors.\n**Plan.** Question: replay 5,000 orders in under 60 s with no duplicates? Box: 2 days. Pass: under 60 s, zero duplicates.\n**Result.** Phone A 41 s, phone B 95 s; zero duplicates.\n**Meaning.** Pass on A, fail on B. Decision updated: replay in batches of 500 and show progress. Notes linked from ADR-003.'
  },
  rubric: [
    ['Question', 'Vague', 'Clear question', 'Clear question tied to an option'],
    ['Pass mark', 'None', 'Written after the fact', 'Written before running'],
    ['Evidence', 'Opinion', 'Some data', 'Numbers from your own conditions'],
    ['Use of result', 'Not linked', 'Mentioned', 'Linked to the ADR and the options changed or confirmed']
  ],
  quiz: [
    ['Why write the pass mark before the spike?', ['It is a rule of the standard.', 'So you cannot move it to fit the result.', 'It makes the spike longer.', 'It is optional.'], 1, 'A pass mark set afterwards turns evidence into opinion.'],
    ['What should happen to spike code at the end of the time box?', ['It ships.', 'Write down what you learned, then delete it or label it throwaway.', 'It becomes the prototype.', 'It is hidden.'], 1, 'Keep the learning, not necessarily the code.'],
    ['Which evidence is cheapest to try first?', ['A full load test.', 'Reading the vendor\'s published limits and asking a user.', 'Rewriting the system.', 'A year of production data.'], 1, 'Take the cheapest evidence that answers the question.']
  ],
  sources: [
    'arc42 documentation, section 9 Architecture Decisions. docs.arc42.org/section-9/'
  ]
},
{
  n: 11, title: 'Reversible and Irreversible Decisions',
  lead: 'Some choices you can undo on Friday; others you will live with for years. You will sort your decisions by how hard they are to reverse and spend your care where it counts.',
  slides: [
    ['Cost of reversal', 'Rate a decision by how hard it is to reverse.',
      'The care a decision needs depends on what it costs to undo, not on how technical it feels.',
      'Rate each decision by time and money to reverse: hours, weeks, months, or practically never. A choice of logging format is hours; a choice of data model with years of customer data is months; a choice of legal entity or cloud region can be close to never.',
      'Rate every ADR with a reversal cost and write it in the record.',
      'Rate the reversal cost of your database choice: hours, weeks, months or never?'],
    ['Decide late, but not too late', 'Use the last responsible moment.',
      'Delay a hard-to-reverse decision until you have enough evidence, but not until it is made for you.',
      'The last responsible moment is when the cost of waiting exceeds the value of more information. Ask what evidence would change the decision, how long it takes to get, and what is blocked while you wait.',
      'Write the date by which the decision must be made and what you will do to learn more before then.',
      'What would a deadline for your storage decision be, and why?'],
    ['Make it easier to reverse', 'Reduce the cost of reversal by design.',
      'You can often turn a hard decision into an easier one by adding a boundary.',
      'Hide the database behind an interface; keep data exports; avoid provider-specific features without a reason; keep a record of what you used. Each of these costs a little now and saves a lot later. The cost is only worth paying for decisions that are likely to need reversing.',
      'For each months-or-never decision, write what you do now to make leaving cheaper.',
      'Name one thing you could do today to make leaving your cloud provider cheaper.'],
    ['Commit and move on', 'Make a decision stick without making it sacred.',
      'Once decided, act on it and stop reopening it without new evidence.',
      'The revisit trigger from lesson 8 is the rule: reopen only when a trigger fires or a driver changes. Otherwise a team can spend its energy rediscussing decisions that nothing has challenged.',
      'Hold a decision review each quarter that looks only at triggers and drivers.',
      'What should reopen a decision, and what should not?']
  ],
  guide: [
    'Teams tend to treat all decisions alike: either too much ceremony for easy ones or too little for hard ones. Sorting by reversal cost lets you save the long discussion, the spike and the careful record for the few that need it, and make the rest quickly.',
    'It also guides what to build. If a decision is hard to reverse and likely to change, pay a small premium to keep options open. If it is hard to reverse and unlikely to change, commit and save the effort.'
  ],
  case: 'Illustrative case. The team lists nine decisions and rates reversal cost. Logging format, message wording and CSS framework are hours. Payment provider is weeks, because of the integration. Data model and cloud region are months to never. They spend a full day on the region and the data model and ten minutes each on the rest. For the data model they add an export job and a schema-version column now, which costs half a day and makes a future migration far cheaper.',
  lab: {
    title: 'Sort your decisions by reversal cost',
    intro: 'List every decision in your decision log and every decision you expect to make in the next six months.',
    tasks: [
      'Rate each decision hours, weeks, months or never, with a one-line reason.',
      'For each months-or-never decision, write the latest responsible date and the evidence you still need.',
      'For each, write one thing you will do now to make reversing it cheaper, or say why not.',
      'Write the rule for when a decision may be reopened.'
    ],
    evidence: 'A rated decision list, dates and evidence for hard decisions, the reversal-cost measures, and the reopening rule.',
    model: '| Decision | Reversal | Why |\n|---|---|---|\n| Log format | hours | Config change |\n| Payment provider | weeks | Integration and contract |\n| Data model | months | Years of customer data |\n| Cloud region | never | Data residency, latency |\n\n**Data model.** Decide by 30 June after the spike; keep a schema-version column and a nightly export now.\n**Rule.** Reopen only when a revisit trigger fires or a driver in the ADR changes; review quarterly.'
  },
  rubric: [
    ['Rating', 'None', 'Rated without reasons', 'Rated with reasons'],
    ['Timing', 'No dates', 'Dates without evidence plans', 'Date and evidence still needed'],
    ['Reducing reversal cost', 'None', 'Generic ideas', 'Specific, costed measures'],
    ['Reopening rule', 'None', 'Vague', 'Specific rule tied to triggers']
  ],
  quiz: [
    ['What should determine how much care a decision gets?', ['How technical it feels.', 'What it costs to reverse.', 'Who proposed it.', 'How long the meeting is.'], 1, 'The cost of reversal tells you how much evidence and ceremony the decision deserves.'],
    ['The last responsible moment is when...', ['Everyone is ready.', 'The cost of waiting exceeds the value of more information.', 'The deadline has passed.', 'The vendor calls.'], 1, 'Decide late enough to learn, early enough not to have it made for you.'],
    ['When should a decision be reopened?', ['Whenever someone disagrees.', 'When a revisit trigger fires or a driver changes.', 'Every week.', 'Never.'], 1, 'Otherwise teams burn energy on decisions nothing has challenged.']
  ],
  sources: [
    'arc42 documentation, section 9 Architecture Decisions. docs.arc42.org/section-9/',
    'Nygard, M. Documenting Architecture Decisions. Cognitect, 2011. cognitect.com/blog/2011/11/15/documenting-architecture-decisions'
  ]
}
];
