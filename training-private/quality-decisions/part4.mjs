// Level 2, lessons 16-20: Review and risk; decisions in the AI era.
// The two 2026 papers in lessons 19 and 20 were read on their arXiv pages on 2026-11-22; both are research results, not guarantees.
export default [
{
  n: 16, title: 'Risk Storming',
  lead: 'Risks hide until someone looks for them on purpose. You will run a short structured session in which each person marks where they think the design is weakest, and turn the results into a ranked list.',
  slides: [
    ['Look for risks on purpose', 'Explain why a structured risk session beats general worry.',
      'People notice different risks, so a structured session pools what each person sees.',
      'arc42 section 11 advises detecting and evaluating risks systematically, involving different stakeholders, and reviewing external interfaces, business processes, data structures and source code. Risk storming is one way: individuals mark risks on a diagram first, then compare.',
      'Invite someone from operations, someone from the business and someone who did not build the design.',
      'Who in your organisation sees risks your team would miss?'],
    ['Individually, then together', 'Run the session in two rounds.',
      'Round one is silent and individual; round two is shared. That keeps loud voices from steering.',
      'Give each person a diagram and three colours: for example red for high, amber for medium, green for low. Each marks the places they see risk for one quality (say availability) with a sticker or a note, without talking. Then the group looks at where marks cluster and where people disagree.',
      'Run one round per quality leaf and keep each round to 15 minutes.',
      'Why have people mark risks silently before discussing?'],
    ['From marks to risks', 'Turn marks into written risks.',
      'A risk statement names a cause, an event and an effect, with a likelihood and an impact.',
      'Write: "Because the payment provider has one region (cause), an outage there (event) stops all orders (effect). Likelihood: medium. Impact: high." Rate with simple scales, and say who owns the risk.',
      'Write each risk in one sentence in that form, and add an owner.',
      'Rewrite "payments might fail" as a proper risk statement.'],
    ['Rank and respond', 'Rank risks and choose a response.',
      'Rank by likelihood times impact, then choose a response: avoid, reduce, accept or transfer.',
      'For each top risk write what you will do, by when and who does it. An accepted risk needs a named person who accepted it. Link the risk to a scenario or decision where it changes one.',
      'Keep the top ten, and put the rest in a backlog.',
      'What is the difference between reducing and accepting a risk?']
  ],
  guide: [
    'The value of risk storming is the disagreement. When two people mark opposite ends of the diagram as risky, one of them knows something the other does not. Write down both reasons before you rank anything.',
    'Keep the output small. Ten well-written risks with owners are worth more than sixty on a spreadsheet. Link the biggest ones into arc42 section 11, and convert any that need a design change into scenarios or decisions.'
  ],
  case: 'Illustrative case. Four people mark an availability round. Operations marks the SMS provider as red because it has failed twice. The developers marked it green because SMS is optional in the design. The discussion shows that "optional" is true for orders but not for the vendor login code, which uses SMS. They write the risk: "Because vendor login depends on SMS (cause), a provider outage (event) locks vendors out during service (effect). Likelihood medium, impact high. Owner: head of operations." Response: add an email fallback by 1 March.',
  lab: {
    title: 'Run a risk storm and write your top risks',
    intro: 'Run one round on your most important quality leaf with at least two other people. If you are alone, ask one colleague to mark the diagram separately.',
    tasks: [
      'Choose the quality and the diagram, and list who took part and their roles.',
      'Record where marks clustered and where people disagreed, with the reasons.',
      'Write at least five risks in cause, event, effect form with likelihood, impact and owner.',
      'Choose a response for the top three, with a date and a person.'
    ],
    evidence: 'Participants, the cluster and disagreement notes, five risk statements and responses for the top three.',
    model: '**Quality:** availability. **Diagram:** context view. **Participants:** developer, operations, product owner.\n**Cluster:** payment provider and SMS. **Disagreement:** SMS, ops red, developers green; resolved: vendor login depends on it.\n| Risk | L | I | Owner | Response |\n|---|---|---|---|---|\n| Because vendor login uses SMS, an outage locks out vendors | M | H | Head of ops | Email fallback by 1 Mar (reduce) |\n| Because payments run in one region, an outage stops orders | L | H | CTO | Accept; revisit at 2,000 orders a minute |'
  },
  rubric: [
    ['Participants', 'Only the author', 'Team only', 'Includes someone outside the build team'],
    ['Risk statements', 'Worries only', 'Event without cause or effect', 'Cause, event, effect, likelihood, impact'],
    ['Disagreement', 'Not recorded', 'Recorded', 'Recorded with reasons'],
    ['Response', 'None', 'Response without an owner', 'Response with owner and date']
  ],
  quiz: [
    ['Why mark risks individually before discussing?', ['It saves time.', 'It stops loud voices from steering and pools what each person sees.', 'It is required by arc42.', 'It makes the diagram clearer.'], 1, 'Different people notice different risks; silence first keeps that variety.'],
    ['Which is a proper risk statement?', ['Payments might fail.', 'Because the provider has one region, an outage there stops all orders.', 'Risk: bad.', 'We need better payments.'], 1, 'It names cause, event and effect.'],
    ['What must an accepted risk have?', ['Nothing.', 'A named person who accepted it, and a trigger to revisit.', 'A bigger budget.', 'A new tool.'], 1, 'Acceptance is a decision and needs an owner.']
  ],
  sources: [
    'arc42 documentation, section 11 Risks and Technical Debts. docs.arc42.org/section-11/'
  ]
},
{
  n: 17, title: 'Scenario-Based Design Review',
  lead: 'A design is only good against something. You will walk your design through its own scenarios, mark where it is sensitive, find the trade-offs, and write down what you found, in the spirit of ATAM.',
  slides: [
    ['What a review tests', 'State what a scenario-based review is for.',
      'A review checks the design against the quality scenarios, not against taste.',
      'ATAM, from the Software Engineering Institute, is a structured technique for understanding the trade-offs in software architectures: how well a design meets competing quality attributes, and how decisions affect their interaction. You can run a lightweight version in half a day.',
      'Start from your ranked scenarios, not from the diagram.',
      'Why start a review from scenarios rather than from the diagram?'],
    ['Walk the scenarios', 'Walk each scenario through the design.',
      'Take each High/High scenario and trace the stimulus through the building blocks to the response.',
      'At each step ask: which block handles this, what decision makes it work, what could go wrong, and how do we know? Record the path as a short list of blocks and decisions, and note any step you cannot explain.',
      'Take the top five scenarios and trace each in 15 minutes.',
      'Trace "order with no connection" through your design and note any step you cannot explain.'],
    ['Sensitivity and trade-off points', 'Find sensitivity points and trade-off points.',
      'A sensitivity point is a place where a small change affects a quality; a trade-off point is one that affects several qualities in opposite ways.',
      'Example: the size of the retry queue is a sensitivity point for availability; the replay batch size is a trade-off point between replay time and server load. Mark them; they are where most future decisions will be.',
      'List the sensitivity and trade-off points and which decision each belongs to.',
      'Name one trade-off point in your design and the two qualities it pulls between.'],
    ['Findings you can act on', 'Write findings with owners.',
      'A finding is a risk, a gap, or a confirmed strength, written so someone can act on it.',
      'Group findings: risks (add to section 11), non-risks (confirmed good), and decisions needed (write an ADR). Give each an owner and a date, and re-run the review when the scenarios or the design change materially.',
      'Finish with a one-page summary: top risks, confirmed strengths, decisions needed.',
      'What three groups should a review end with?']
  ],
  guide: [
    'You do not need a full ATAM to get most of its value. A half-day with the architect, a developer, an operations person and a product owner, working through the top five scenarios, produces a list of trade-off points and risks that no document review would find.',
    'The discipline is to keep to the scenarios. When the discussion drifts to preferences ("I would use a different framework"), ask which scenario it serves. If none, park it.'
  ],
  case: 'Illustrative case. Reviewing Q2 (order with no connection), the group traces: phone queue (ADR-003) → replay on reconnect → server duplicate check (contract, lesson 13) → vendor sees order. At the replay step nobody can say what happens if the server restarts during replay. Finding: risk, replay may stall; fix: make replay resumable. Trade-off point: batch size 500 trades replay time for server load. Non-risk confirmed: duplicate check works.',
  lab: {
    title: 'Run a scenario-based design review',
    intro: 'Review your design against your five most important scenarios.',
    tasks: [
      'For each of five scenarios, trace the path through blocks and decisions and note steps you cannot explain.',
      'List at least three sensitivity or trade-off points and the decisions they belong to.',
      'Write findings in three groups: risks, confirmed strengths and decisions needed.',
      'Give each finding an owner and a date and add the risks to your section 11 list.'
    ],
    evidence: 'Five traced scenarios, the sensitivity and trade-off list, grouped findings with owners and dates.',
    model: '**Q2 trace.** Phone queue (ADR-003) → replay → server duplicate check → vendor screen. Unexplained: server restart mid-replay.\n**Points.** Retry queue size: sensitivity (availability). Replay batch size: trade-off (replay time vs server load).\n| Group | Finding | Owner | Date |\n|---|---|---|---|\n| Risk | Replay may stall after a server restart | Backend lead | 15 Mar |\n| Strength | Duplicate check works (tested) | | |\n| Decision | Write ADR for replay batch size | Architect | 1 Mar |'
  },
  rubric: [
    ['Scenario trace', 'Diagram walk only', 'Traces without blocks', 'Traces through blocks and decisions with gaps noted'],
    ['Points found', 'None', 'Listed without decisions', 'Listed and tied to decisions'],
    ['Findings', 'One list', 'Grouped without owners', 'Grouped with owners and dates'],
    ['Discipline', 'Opinions mixed in', 'Mostly scenario-based', 'Every item ties to a scenario']
  ],
  quiz: [
    ['What is a trade-off point?', ['A bug.', 'A design choice that affects several qualities in opposite ways.', 'A meeting break.', 'A tool setting.'], 1, 'It is where improving one quality costs another.'],
    ['Where should a review start?', ['With the code.', 'With the ranked quality scenarios.', 'With the vendor demo.', 'With the org chart.'], 1, 'Scenarios give the review something to be good against.'],
    ['What should a review do with a step nobody can explain?', ['Skip it.', 'Record it as a risk or a finding with an owner.', 'Delete the scenario.', 'Rename it.'], 1, 'Unexplained steps are where problems hide.']
  ],
  sources: [
    'Kazman, Klein, Barbacci, Longstaff, Lipson, Carriere. The Architecture Tradeoff Analysis Method. SEI report CMU/SEI-98-TR-008, 1998. sei.cmu.edu/library/the-architecture-tradeoff-analysis-method',
    'arc42 documentation, section 11 Risks and Technical Debts (names ATAM as a qualitative evaluation). docs.arc42.org/section-11/'
  ]
},
{
  n: 18, title: 'Risks and Technical Debt',
  lead: 'Every system carries debt and risk. The skill is to keep an honest, short, ranked list, to say what each item costs you every month, and to decide when to pay.',
  slides: [
    ['Risk versus debt', 'Tell a risk from a debt.',
      'A risk is something that may go wrong; technical debt is a shortcut already taken that costs you now.',
      'arc42 section 11 holds both, ordered by priority, with optional measures to minimise risks or reduce debt. A risk has a likelihood; debt has an interest rate: the extra time or money each change costs because of the shortcut.',
      'For each debt item write what it costs every month in time, money or risk.',
      'Is an unpatched library a risk or a debt? Can it be both?'],
    ['Interest and principal', 'Estimate what a debt item costs.',
      'Principal is the cost to fix it once; interest is what it costs while you leave it.',
      'Example: a hand-edited deployment step costs 20 minutes per release; with four releases a month that is 80 minutes. If fixing it takes two days, it pays back in about 12 months. A rough number is enough to rank items against each other.',
      'Give each item a rough principal and monthly interest and rank by payback time.',
      'Principal 16 hours, interest 80 minutes a month: how many months to pay back?'],
    ['A short honest list', 'Keep the list short and current.',
      'A list of 200 items is a graveyard; keep about ten, ranked, with owners.',
      'Review it monthly: remove what is done, add what you found, re-rank. Say how each item connects to a quality scenario or decision, so people see why it matters.',
      'Cap the active list at ten and move the rest to a backlog.',
      'What do you do with the 11th item?'],
    ['When to pay', 'Decide when to pay down debt.',
      'Pay debt when it blocks a scenario, when interest exceeds principal quickly, or when you are touching the code anyway.',
      'Pair paying down with work already planned: touch a module, improve it. Tell the sponsor in terms of cost and scenario: "this shortcut adds 80 minutes to every release and blocks the weekly-release goal".',
      'Write each item\'s case in a sentence that a non-technical sponsor understands.',
      'Write the sponsor sentence for one of your debt items.']
  ],
  guide: [
    'Technical debt lists fail when they are vague ("refactor orders module") and when they have no cost. Give each item a monthly cost and a reason to care. Then the conversation with the sponsor is about money and goals, not about code quality.',
    'Treat risks and debt in the same list because they compete for the same time. A risk with high impact and moderate likelihood may outrank a debt with low interest. Ranking them together shows that.'
  ],
  case: 'Illustrative case. Section 11 has nine items. Top: "Release steps hand-edited" (principal 16 h, interest 80 min a month, payback about 12 months, blocks Q6 weekly releases). Second: "One person knows the payment adapter" (risk: medium likelihood, high impact; fix: pair and document, 2 days). The team agrees to spend two days on the second now, because a risk with high impact outranks a debt with a 12-month payback, and schedules the release script for the next quiet sprint.',
  lab: {
    title: 'Write your risks and debt list for section 11',
    intro: 'Combine the risks from your storm and review with the debt you know about.',
    tasks: [
      'List at least eight items, labelled risk or debt, each linked to a scenario or decision.',
      'Give each debt item a principal and a monthly interest, and each risk a likelihood and impact.',
      'Rank all items together and cap the active list at ten.',
      'For the top three write the sponsor sentence and choose a response, owner and date.'
    ],
    evidence: 'A ranked list with costs and links, and a sponsor sentence, owner and date for the top three.',
    model: '| # | Item | Type | Cost | Linked to |\n|---|---|---|---|---|\n| 1 | Payment adapter known by one person | Risk | L medium, I high | ADR-002 |\n| 2 | Release steps hand-edited | Debt | 16 h to fix, 80 min a month | Q6 |\n| 3 | Reports reads nightly copy | Debt | 4 h a month in support | Q-data |\n\n**Sponsor sentence (#2).** This shortcut adds 80 minutes to every release and blocks weekly releases; two days of work removes it.\n**Response.** #1 pair and document, Priya, 15 Mar; #2 next quiet sprint.'
  },
  rubric: [
    ['Cost', 'None', 'Qualitative', 'Numbers for each item'],
    ['Ranking', 'Unranked', 'Separate lists', 'Risks and debt ranked together'],
    ['Link', 'None', 'Some', 'Every item linked to a scenario or decision'],
    ['Sponsor case', 'Technical wording', 'Partial', 'A plain sentence tied to money and goals']
  ],
  quiz: [
    ['What is "interest" on technical debt?', ['A bank charge.', 'The extra time or money each change costs because of the shortcut.', 'The principal.', 'The bug count.'], 1, 'Interest is the ongoing cost of leaving the shortcut.'],
    ['Principal 16 hours, interest 80 minutes a month. Payback is about...', ['1 month', '6 months', '12 months', '24 months'], 2, '16 h = 960 min; 960 ÷ 80 = 12 months.'],
    ['How many items should an active list hold?', ['All of them.', 'About ten, ranked, with owners.', 'Exactly one.', 'None.'], 1, 'A long list becomes a graveyard.']
  ],
  sources: [
    'arc42 documentation, section 11 Risks and Technical Debts. docs.arc42.org/section-11/'
  ]
},
{
  n: 19, title: 'Using LLMs to Draft Options and Records',
  lead: 'AI can draft decision records and find decisions hidden in code. Recent research shows what helps and what it cannot do. You will use an assistant as a drafting partner while keeping the judgment yourself.',
  slides: [
    ['What the research says', 'Summarise what 2026 research shows about LLM-drafted ADRs.',
      'LLMs can draft decision records well when given the right context, but the research is early.',
      'Gupta, Dhar, Feitosa and Vaidhyanathan (EASE 2026) found that giving an LLM historical ADRs as context substantially improves generated records over no context, that a recency window of about 3 to 5 prior records gave the best balance of quality and efficiency, and that context engineering mattered more than model scale. These are results from their study setup, not guarantees for yours.',
      'Give the assistant your earlier ADRs and the relevant scenarios; do not rely on a bare prompt.',
      'What context improved generated ADRs most in that study?'],
    ['Agents that recover decisions', 'Describe how agents can extract decisions from code.',
      'Agentic workflows can recover candidate decisions from a repository, but a person must confirm them.',
      'Dhar, Vaidhyanathan and Varma (arXiv preprint, February 2026) propose AgenticAKM, which splits the job into extraction, retrieval, generation and validation agents. Their prototype generated ADRs from code repositories, and a user study over 29 repositories favoured the agentic approach over a single prompt. It is a preprint and a prototype.',
      'Use agents to propose candidate records from code, then verify each with the people who made the decision.',
      'Why must a person confirm an ADR that an agent recovered from code?'],
    ['Draft, do not decide', 'Use the assistant for drafts and challenges.',
      'Ask the assistant to draft options, list consequences and attack your choice; make the decision yourself.',
      'Good uses: generate three alternatives you had not considered; list consequences by quality; critique a draft ADR for missing negatives; reformat notes into the template. Weak use: asking it to choose, because it does not know your constraints, your budget or your risk appetite unless you supply them.',
      'Paste your constraints, drivers and scenarios into the prompt and ask for a critique, not a verdict.',
      'Write a prompt that asks an assistant to critique your ADR, not to choose.'],
    ['Check what it wrote', 'Verify generated records.',
      'Generated text can be fluent and wrong; check it against the code, the scenarios and the people.',
      'Check each claim: is the context true, is the stated reason the real one, are the consequences complete, are the cited numbers from your sources? Mark generated drafts in the record, and keep the human decider\'s name on it.',
      'Add "drafted with AI, reviewed by" to the record and list what you changed.',
      'What should you check first in an AI-drafted ADR?']
  ],
  guide: [
    'The practical lesson of the 2026 research is context. A record written from a bare prompt reads generically; one written with your last few ADRs, your constraints and your scenarios looks like your team wrote it. Keep a short prompt that names the template, the style and the files to read.',
    'Keep the roles clear. The assistant drafts and challenges; the architect and the business decide and sign. A record written by an assistant and never reviewed is worse than none, because it looks like a decision someone made.'
  ],
  case: 'Illustrative case. The architect pastes ADR-001 to ADR-003, the constraints table and scenario Q2, and asks for a draft ADR on replay batch size and a critique of its consequences. The draft names two options, adds an unmentioned consequence (server load spikes after a regional outage), and writes the cause of one option wrongly, claiming the provider limits batches to 100. The architect checks the provider documentation, finds the limit is not stated, deletes the claim, keeps the new consequence and marks the record "drafted with AI, reviewed by the architect".',
  lab: {
    title: 'Draft and review one ADR with an assistant',
    intro: 'Use any AI assistant you are allowed to use with your material. Do not paste confidential data; use your own practice system if needed.',
    tasks: [
      'Write the prompt: the template, your last two or three ADRs, the constraints, the drivers and the scenarios.',
      'Ask the assistant for options, a draft ADR and a critique, and keep its output.',
      'Check every factual claim and number and list what was wrong, missing or invented.',
      'Write the final ADR, mark it as AI-assisted, and name the human reviewer.'
    ],
    evidence: 'The prompt, the assistant output, your list of corrections and the final ADR.',
    model: '**Prompt.** "Use the template below. Here are ADR-001 to ADR-003, our constraints, drivers and Q2. Propose three options for replay batch size, draft the ADR for the best, and list consequences we may have missed. Mark anything you are unsure of."\n**Corrections.** (1) Claimed the provider limits batches to 100; not in the documentation, removed. (2) Missed duplicate-check cost, added. (3) Context mentioned a 2-second target; actual is p95 2 s, fixed.\n**Final ADR-005.** Status: accepted. Drafted with AI, reviewed by the architect. Decision: replay in batches of 500...'
  },
  rubric: [
    ['Context given', 'Bare prompt', 'Template only', 'Template, earlier ADRs, constraints and scenarios'],
    ['Verification', 'Accepted as written', 'Skimmed', 'Every claim checked and corrections listed'],
    ['Roles', 'Assistant decided', 'Mixed', 'Assistant drafted, a named person decided'],
    ['Marking', 'Not marked', 'Marked', 'Marked with reviewer and changes']
  ],
  quiz: [
    ['What did Gupta and colleagues (EASE 2026) find about context for ADR generation?', ['Context made no difference.', 'Historical ADRs as context improved quality, and a recency window of about 3 to 5 worked best.', 'Only the largest models work.', 'Retrieval always beats recency.'], 1, 'Context strategy mattered more than model scale in their study.'],
    ['What is the safest use of an assistant for decisions?', ['Letting it choose.', 'Drafting options and critiquing your draft while a person decides.', 'Hiding its use.', 'Skipping review.'], 1, 'The assistant does not know your constraints or appetite for risk unless you tell it.'],
    ['What status does AgenticAKM have?', ['A product.', 'An arXiv preprint describing a prototype and a user study.', 'An ISO standard.', 'A law.'], 1, 'It is early research and should be treated as such.']
  ],
  sources: [
    'Gupta, Dhar, Feitosa, Vaidhyanathan. Context Matters: Evaluating Context Strategies for Automated ADR Generation Using LLMs. EASE 2026. arxiv.org/abs/2604.03826',
    'Dhar, Vaidhyanathan, Varma. AgenticAKM: Enroute to Agentic Architecture Knowledge Management. arXiv 2602.04445, 4 February 2026 (preprint). arxiv.org/abs/2602.04445'
  ]
},
{
  n: 20, title: 'Decisions Your Coding Agents Can Follow',
  lead: 'AI coding tools write code that fits your architecture only if they can read it. You will turn your quality scenarios and decisions into short, checkable instructions and finish by reviewing the whole record as one.',
  slides: [
    ['Agents read your repository', 'Explain why coding agents need your decisions in writing.',
      'A coding agent does not know your decisions unless they are in files it reads or checks it must pass.',
      'If the ADR that says "the UI never touches the database" lives in someone\'s head, an agent will write code that breaks it, quickly and fluently. Decisions in the repository, in a short and specific form, become instructions that people and tools both follow.',
      'Put a short "rules of this architecture" file in the repository root and link it to the ADRs.',
      'Which decision in your system would an agent most likely break?'],
    ['Rules, not prose', 'Write decisions as short rules.',
      'Turn each decision into a rule an agent can apply: what to do, what never to do, and where to look.',
      'Example: "All payment calls go through Payments (ADR-002). Never import provider types outside the adapter. Orders are idempotent by clientOrderId (contract, section 13)." Short, specific, each with a reference.',
      'Write one line per decision, with the ADR number and one example.',
      'Rewrite ADR-003 as a rule an agent can follow.'],
    ['Checks, not hopes', 'Back each rule with a check.',
      'A rule that no check enforces is advice; a rule with a failing build is a guardrail.',
      'Link each rule to a fitness function (lesson 15): an import rule, a test, an ADR lint. When an agent or a person breaks a rule, the build says which ADR it violates. Agents can then fix their own change using that message.',
      'Make failure messages name the rule and the ADR.',
      'What should a failing rule check say so that an agent can fix the change?'],
    ['Review the whole record', 'Close the loop with a review of your whole record.',
      'Finish by checking the record end to end: scenarios, decisions, checks, risks.',
      'For every High/High scenario there should be a decision, and for every decision a check or a revisit trigger, and for every risk an owner. Gaps are your next tasks. Publish the record, tell the team where it lives, and set a date for the next review.',
      'Run the end-to-end completeness check and fix the gaps you find.',
      'What three things should every High/High scenario have behind it?']
  ],
  guide: [
    'Agents make drift faster, because they produce more code, more quickly, without the context a colleague would have. The remedy is the same as for people, delivered in a form that machines read: short rules in the repository, backed by checks that fail with clear messages.',
    'This lesson closes the level. Your record now holds measured goals, scenarios, budgets, decisions with options and reasons, boundaries, contracts, data ownership, checks, risks and debt. The last task is to make sure the parts connect, and to hand it to someone who was not in the room.'
  ],
  case: 'Illustrative case. After a coding assistant adds a screen that imports the database client directly, the team adds a RULES file with eight lines, each pointing to an ADR, and an import check whose failure says "Violates ADR-004: UI must not import data modules. Use the Orders service." The next time the assistant breaks the rule, it reads the message and fixes its own change. The final review finds that Q6 has no decision behind it; they write ADR-007 and a deploy-time check.',
  lab: {
    title: 'Write your agent rules and run the final review',
    intro: 'This is the capstone: package your decisions for people and tools, and test the whole record.',
    tasks: [
      'Write one rule line per decision, with the ADR number, a do and a never.',
      'For each rule name the check that enforces it and what its failure message says.',
      'Run the completeness check: every High/High scenario has a decision, every decision has a check or revisit trigger, every risk has an owner. List the gaps.',
      'Write the one-page handover for someone who was not in the room: where things live, the top five decisions and the top three risks.'
    ],
    evidence: 'The rules file, the checks with their messages, the gap list and the one-page handover.',
    model: '**RULES.md.** 1. All payment calls go through Payments (ADR-002); never import provider types elsewhere. 2. Orders are idempotent by clientOrderId (contract). 3. UI never imports data modules (ADR-004).\n**Check.** Import rule: "Violates ADR-004: UI must not import data modules. Use the Orders service."\n**Gaps.** Q6 weekly releases has no decision; ADR-007 to write by 1 Mar. Risk 4 has no owner; assigned to head of ops.\n**Handover.** Record lives in /docs/architecture; top decisions ADR-002, 003, 004, 005, 007; top risks: SMS lockout, single-region payments, one-person payment adapter.'
  },
  rubric: [
    ['Rules', 'Prose paragraphs', 'Rules without references', 'Short rules with ADR numbers and a do and a never'],
    ['Checks', 'None', 'Named', 'Named with failure messages that cite the ADR'],
    ['Completeness', 'Not run', 'Run partly', 'Gaps found and listed with owners'],
    ['Handover', 'None', 'Long summary', 'One page someone outside could use']
  ],
  quiz: [
    ['Why write decisions as short rules for coding agents?', ['Agents prefer rules to code.', 'Agents only follow decisions that are in files they read or checks they must pass.', 'Rules are shorter than ADRs.', 'It is a standard.'], 1, 'An undocumented decision cannot be followed by a tool.'],
    ['What makes a rule a guardrail rather than advice?', ['A longer description.', 'A check that fails the build when it is broken.', 'A louder tone.', 'A meeting.'], 1, 'Enforcement turns advice into a guardrail.'],
    ['What should every High/High scenario have behind it?', ['A diagram.', 'A decision, and a check or revisit trigger, and an owner for its risks.', 'A tool.', 'A budget line.'], 1, 'The final review looks for scenarios with no decision and decisions with no check.']
  ],
  sources: [
    'arc42 documentation, sections 9 and 11. docs.arc42.org/section-9/',
    'Dhar, Vaidhyanathan, Varma. AgenticAKM. arXiv 2602.04445 (preprint). arxiv.org/abs/2602.04445'
  ]
}
];
