// Level 2, lessons 1-6: Quality in numbers. Compact format: slides are [title, objective, principle, evidence, response, check].
// Facts about arc42, Q42 and ISO/IEC 25010 were read on their own pages on 2026-11-22. Cases marked "Illustrative" are invented.
export default [
{
  n: 1, title: 'Quality Models and the Quality Tree',
  lead: 'Everyone wants a system that is fast, secure and easy to change. This lesson turns those wishes into a short, ranked tree that your whole team can see, and that later lessons fill with numbers.',
  slides: [
    ['Why quality shapes structure', 'Explain why quality goals, more than features, decide an architecture.',
      'Two systems with the same features can need completely different structures because their quality goals differ.',
      'arc42 section 10 states the motivation directly: quality requirements strongly shape architecture, so the important ones must be identified specifically and measurably. The few most important belong in section 1.2; section 10 holds the full set.',
      'Before choosing any structure, write down the three to five qualities that matter most for this system.',
      'Name one feature two systems could share and one quality goal that would make their architectures differ.'],
    ['Use a model as a checklist', 'Use a published quality model to avoid forgetting a quality.',
      'A quality model is a checklist, not a goal list. You pick from it; you do not satisfy all of it.',
      'ISO/IEC 25010:2023 describes a product quality model of nine characteristics, each divided into subcharacteristics. arc42 cites it as a basis for grouping and as a thoroughness checklist. The Q42 quality model (quality.arc42.org, CC BY-SA 4.0) lists 191 quality characteristics, 150 example requirements and 56 solution approaches.',
      'Scan a model once to find qualities you had not considered, then keep only the few that matter.',
      'Why is trying to satisfy every characteristic in a quality model a mistake?'],
    ['Build a quality tree', 'Refine one quality into leaves you can attach a scenario to.',
      'A quality tree breaks a vague word into specific concerns, ending in leaves that can each carry a measurable scenario.',
      'arc42 calls this a quality attribute tree and notes that Bass and colleagues call it the quality attribute utility tree. Example: Performance → response time → checkout under peak load; Performance → throughput → orders per minute at lunchtime.',
      'Stop splitting when a leaf is specific enough that you could write a test for it.',
      'Is "the system should be fast" a leaf? What would you change to make it one?'],
    ['Rank the leaves', 'Rank leaves by importance to the business and difficulty for the architecture.',
      'Not every leaf deserves equal effort. Rank by business importance and by how hard it is to achieve.',
      'A simple two-letter grade works: H, M or L for importance and for difficulty. Leaves that are High and High are your architecture drivers; leaves that are High and Low are just good practice.',
      'Put your High/High leaves at the top of section 10 and make sure each has at least one scenario.',
      'Which leaves most deserve a decision record: High/High, or Low/Low?']
  ],
  guide: [
    'A quality tree is the first Level 2 artefact because it forces the conversation most teams skip: what do we actually care about, and in what order? Start from the three to five quality goals in section 1.2 of your arc42 and give each a branch. Then split each branch until its leaves are things you could test.',
    'Use the published models as a prompt, not a template. Read the ISO 25010 characteristics and the Q42 list once, ask "does this matter here?", and cross out most of them. A tree with eight leaves that the team believes beats one with eighty it has never read.'
  ],
  case: 'Illustrative case. A small team builds an ordering app for street-food vendors. Their first list of qualities has fourteen adjectives. In a one-hour session they cross out all but five and build a tree: Performance (checkout stays fast at lunchtime), Availability (orders still work when mobile data is weak), Security (card data never touches our servers), Modifiability (a new vendor can be added without code changes) and Cost (hosting under US$200 a month). They rank each leaf H/M/L twice. Only "orders work with weak connectivity" is High on both. That single leaf drives their biggest decision, an offline-first design.',
  lab: {
    title: 'Build the quality tree for your system',
    intro: 'Take the system you documented at Level 1. Read your section 1.2 quality goals and build the tree behind them.',
    tasks: [
      'Copy your quality goals from section 1.2 and name the system in one sentence.',
      'Draw the tree: each goal splits into at least two leaves, each leaf specific enough to test.',
      'Rank every leaf H, M or L for business importance and for difficulty.',
      'List the High/High leaves and say which of them you suspect your current design handles worst.'
    ],
    evidence: 'The tree (indented list is fine), the ranking, and the list of High/High leaves.',
    model: '**System:** Vendor ordering app for street-food stalls.\n\n- **Performance**\n  - Checkout response at lunchtime peak (importance H, difficulty M)\n  - Menu load on a slow phone (M, M)\n- **Availability**\n  - Order can be placed with no connection (H, H)\n  - Vendor sees the order within 30 seconds of reconnecting (H, M)\n- **Security**\n  - Card data never stored by us (H, L)\n- **Modifiability**\n  - New vendor added without a code change (M, L)\n\n**High/High:** offline ordering. **Suspected weakest:** the current design assumes a live connection at checkout.'
  },
  rubric: [
    ['Leaves are testable', 'Adjectives only', 'Some leaves specific', 'Every leaf could carry a measurable scenario'],
    ['Ranking', 'No ranking', 'One dimension ranked', 'Importance and difficulty ranked for every leaf'],
    ['Focus', 'More than fifteen leaves, none prioritised', 'A shortlist without reasons', 'A short list with the High/High leaves named'],
    ['Link to design', 'No link', 'Mentions the design generally', 'Names which part of the current design is most at risk']
  ],
  quiz: [
    ['What is the best use of a published quality model such as ISO/IEC 25010 or Q42?', ['Satisfy every characteristic it lists.', 'Use it as a checklist to find qualities you may have missed, then keep only the few that matter.', 'Copy it as your section 10.', 'Skip it, because models are too general to help.'], 1, 'The models are prompts. arc42 itself cites ISO 25010 as a basis for grouping and as a thoroughness checklist.'],
    ['Which is a leaf of a quality tree?', ['Fast', 'Performance', 'Checkout responds quickly at lunchtime peak', 'The system must be good'], 2, 'A leaf is specific enough that a scenario and a test can be written for it.'],
    ['Which leaves are the architecture drivers?', ['Low importance, low difficulty', 'High importance, low difficulty', 'High importance, high difficulty', 'Low importance, high difficulty'], 2, 'High/High leaves are important to the business and hard to achieve, so they shape structure.']
  ],
  sources: [
    'arc42 documentation, section 10 Quality Requirements. docs.arc42.org/section-10/',
    'ISO/IEC 25010:2023, Product quality model (nine characteristics). iso.org/standard/78176.html',
    'Q42, the arc42 Quality Model, CC BY-SA 4.0. quality.arc42.org/'
  ]
},
{
  n: 2, title: 'Writing Quality Scenarios',
  lead: 'A scenario turns "should be secure" into something a person can test on Tuesday. You will learn the two standard forms, write scenarios with numbers, and run a linter on them.',
  slides: [
    ['Why scenarios', 'Explain what a quality scenario adds to a quality goal.',
      'A scenario makes a quality requirement concrete and testable.',
      'arc42 section 10.2 asks for scenarios that are specific and measurable, and names two useful kinds: usage scenarios, which describe runtime reactions including performance, and change scenarios, which describe the effort or duration of a modification.',
      'For each High/High leaf write at least one scenario, and write change scenarios as well as usage ones.',
      'Which kind of scenario would you write for "a new vendor can be added without code changes"?'],
    ['The short form', 'Write a scenario in the short form.',
      'The short form has three parts: the context, the source and stimulus, and a metric as the acceptance criterion.',
      'arc42 notes that Q42 uses this short form. Example: "During lunchtime peak (context), 500 customers submit orders within a minute (stimulus); 95% of orders are confirmed within 2 seconds (metric)."',
      'Use the short form for most scenarios. It fits on one line of a table.',
      'Rewrite "checkout is fast" in the short form with your own numbers.'],
    ['The long form', 'Use the long form when the detail matters.',
      'The long form adds ID, name, source, stimulus, environment, artifact, response and response measure.',
      'arc42 attributes the long form to the SEI and Bass and colleagues. The extra fields make you say which part of the system is stressed (the artifact) and what it must do (the response), not only how well.',
      'Use the long form for scenarios that drive a decision or that a stakeholder will challenge.',
      'Which long-form field is missing from "95% of orders are confirmed within 2 seconds"?'],
    ['Numbers you can defend', 'Choose a response measure with a reason.',
      'Every number needs a reason, a way to measure it, and an owner who can say if it moves.',
      'Prefer percentiles to averages for time (95th or 99th percentile), counts over a window for volume, and minutes for change effort. Write where the number came from: a contract, a user study, a competitor, or an honest guess marked as one.',
      'Mark guessed numbers as guesses and schedule when you will replace them with measurements.',
      'Why is "average response time under 1 second" a weak measure?']
  ],
  guide: [
    'Most weak scenarios fail in one of three ways: no number, a number nobody can measure, or a number nobody can justify. When you write a scenario, ask three questions. Could I tell on a given day if it is met? Where does the number come from? Who would be upset if it moved?',
    'Scenarios are also your test plan in embryo. A usage scenario becomes a load test or a monitor; a change scenario becomes a timed exercise ("add a vendor, stopwatch running"). If you cannot imagine the test, the scenario is not finished.'
  ],
  case: 'Illustrative case. A scenario table has the line "Orders should process quickly." In review the architect asks the three questions. Nobody can say when it is met, so they add a context and a stimulus. The number: marketing says "under three seconds" but the product owner remembers a study that put the drop-off at two. They write "95% of orders confirmed within 2 seconds at 500 orders a minute (source: checkout study, 2025; to be re-measured after launch)". The scenario now names its source and its re-measure date, and it turns straight into a load-test target.',
  lab: {
    title: 'Write six quality scenarios',
    intro: 'Choose six leaves from your quality tree, including at least two High/High leaves and at least one change scenario.',
    tasks: [
      'Write each scenario in the short form (context, stimulus, metric).',
      'Rewrite your two most important scenarios in the long form.',
      'For each scenario state where the number comes from, and mark guesses as guesses.',
      'For each scenario describe in one sentence the test or monitor that would show it is met.'
    ],
    evidence: 'Six scenarios, two of them in the long form, each with a source for its number and a described test.',
    model: '| # | Scenario | Source of number | Test |\n|---|---|---|---|\n| Q1 | At lunchtime peak, 500 orders a minute; 95% confirmed within 2 s | Checkout study 2025 | Load test, nightly |\n| Q2 | With no connection, an order is saved on the phone and sent within 30 s of reconnecting | Guess, to be measured | Airplane-mode test |\n| Q3 | A developer adds a vendor in under 1 hour with no code change | Team estimate | Timed exercise each quarter |\n\n**Q1, long form.** Source: customers. Stimulus: submit order. Environment: lunchtime peak. Artifact: checkout service. Response: order confirmed. Response measure: 95% within 2 s.'
  },
  rubric: [
    ['Numbers', 'No numbers', 'Numbers on some scenarios', 'Every scenario has a measurable number'],
    ['Source of the number', 'Not stated', 'Stated for some', 'Stated for all, guesses marked as guesses'],
    ['Long form', 'Not attempted', 'Long form with fields missing', 'All fields present and consistent with the short form'],
    ['Testability', 'No test thought of', 'Vague test', 'A concrete test or monitor for each scenario']
  ],
  quiz: [
    ['Which is a usage scenario and which a change scenario? "Add a payment provider in under two weeks" is...', ['A usage scenario.', 'A change scenario.', 'Neither; it is a constraint.', 'A risk.'], 1, 'arc42 distinguishes usage scenarios (runtime reactions) from change scenarios (effort or duration of a modification).'],
    ['Which response measure is best?', ['Average response is fast.', 'Response under 1 second on average.', '95% of requests complete within 2 seconds at 500 requests a minute.', 'No complaints from users.'], 2, 'It uses a percentile, a threshold and a load, so it can be tested.'],
    ['A scenario says "99.99% available". What should you add before you rely on it?', ['Nothing; it is a number.', 'How it is measured, where the number comes from, and over what period.', 'A longer name.', 'A colour code.'], 1, 'A number needs a measurement method, a source, and a time window.']
  ],
  sources: [
    'arc42 documentation, section 10.2 Quality Scenarios. docs.arc42.org/section-10/',
    'Q42, the arc42 Quality Model. quality.arc42.org/'
  ]
},
{
  n: 3, title: 'Latency and Capacity Budgets',
  lead: 'Speed is the quality people feel first and measure worst. You will learn to split a time goal across the parts of a request, to use percentiles, and to size capacity from numbers rather than hope.',
  slides: [
    ['Percentiles, not averages', 'Choose the right statistic for a time goal.',
      'A time goal should name a percentile, because the average hides the slow requests that users remember.',
      'If 95 requests take 100 ms and 5 take 3 seconds, the average is about 245 ms while one request in twenty feels broken. State the 95th or 99th percentile and the load it applies to.',
      'Write time goals as "p95 under X at load Y".',
      'What is the average of 95 requests at 100 ms and 5 at 3000 ms, and why is it misleading?'],
    ['Splitting a budget', 'Divide an end-to-end time goal across the steps in a request.',
      'An end-to-end goal needs a budget for each hop, so every team knows its share.',
      'Example: a 2000 ms checkout target might be split into 200 ms for the edge, 300 ms for the API, 800 ms for payment provider, 300 ms for the database, and 400 ms held back. Percentiles do not simply add, so keep a reserve.',
      'Always hold back a reserve, and name the hop with the biggest share as the one to challenge first.',
      'Which hop in your system is least in your control, and how much of the budget should it get?'],
    ['Capacity from numbers', 'Estimate capacity from load, service time and headroom.',
      'Capacity is arithmetic before it is hardware: arrivals per second times time per request gives the work in flight.',
      'Little\'s law says work in progress equals arrival rate times time in system. 500 orders a minute is about 8.3 a second; at 0.5 s each, about 4 are in flight on average. Add headroom for bursts and for losing one node.',
      'State your assumed peak, your service time, and the headroom you chose, in that order.',
      'Using Little\'s law, how many requests are in flight at 20 a second with 0.25 s per request?'],
    ['Where time hides', 'Find the hidden contributors to latency.',
      'Time hides in queues, retries, cold starts, serialisation and shared dependencies.',
      'A call that "usually takes 50 ms" with two retries on timeout can take seconds. A cold start or a garbage-collection pause shows up only at high percentiles.',
      'Instrument each hop and look at the p99, not the typical case, before you trust a budget.',
      'Give two reasons a p99 can be far above a typical request time.']
  ],
  guide: [
    'A latency budget is a conversation tool. It lets the person who owns the database and the person who owns the payment integration agree on shares of the same two seconds, and it shows early when a goal is unrealistic because one hop alone exceeds the whole budget.',
    'Capacity planning follows the same pattern: write the assumptions, do the arithmetic, add headroom, and say what would change the answer. The result is a number you can defend and a list of assumptions you can check later against real traffic.'
  ],
  case: 'Illustrative case. The checkout goal is p95 under 2 s at 500 orders a minute. The team lists the hops: edge 100 ms, API 200 ms, payment provider 1200 ms (from the provider\'s own published figure), database 150 ms. The total is 1650 ms, leaving 350 ms of reserve. They notice the payment provider uses 60% of the budget and is outside their control, so they decide to confirm the order before payment settles and show settlement as a second step. The budget did not make the system faster; it told them which decision to take.',
  lab: {
    title: 'Write a latency budget and a capacity estimate',
    intro: 'Use your most important performance scenario from lesson 2.',
    tasks: [
      'List every hop in the request path and give each a budget in milliseconds.',
      'State the reserve and identify the hop with the largest share and whether you control it.',
      'Estimate in-flight work with Little\'s law at your stated peak, and state the headroom you chose.',
      'List two hidden contributors to latency in your system and how you would measure them.'
    ],
    evidence: 'The hop budget table, the reserve, the capacity arithmetic and the two hidden contributors.',
    model: '| Hop | Budget (ms) |\n|---|---|\n| Edge | 100 |\n| API | 200 |\n| Payment | 1200 |\n| Database | 150 |\n| Reserve | 350 |\n| **Total** | **2000** |\n\n**Largest share:** payment, 60%, not in our control.\n**Capacity:** 500/min = 8.3/s at 0.4 s each, about 3.3 in flight; headroom 3x for burst and one node lost, so plan for 10 in flight.\n**Hidden:** retries on payment timeout (measure retry rate); cold start of the API on scale-up (measure p99 after idle).'
  },
  rubric: [
    ['Percentile and load', 'Average only', 'Percentile without load', 'Percentile and load stated'],
    ['Budget split', 'One number for the whole path', 'Split with no reserve', 'Split with a reserve and the largest share identified'],
    ['Capacity arithmetic', 'No arithmetic', 'Arithmetic without headroom', 'Arithmetic, headroom and stated assumptions'],
    ['Hidden contributors', 'None', 'Named but not measurable', 'Named with how each would be measured']
  ],
  quiz: [
    ['Why prefer a percentile to an average for a time goal?', ['It is easier to compute.', 'The average hides the slow requests that users notice.', 'Percentiles are required by ISO.', 'It makes the goal lower.'], 1, 'A few slow requests barely move the average but dominate how the system feels.'],
    ['Using Little\'s law, 20 requests a second at 0.25 s each gives about how many in flight?', ['2', '5', '20', '80'], 1, '20 × 0.25 = 5 on average.'],
    ['Why keep a reserve in a latency budget?', ['To pad the report.', 'Percentiles do not simply add, and hidden delays exist.', 'Reserves are free.', 'The database needs it.'], 1, 'Real paths have queues, retries and variance that the hop figures do not show.']
  ],
  sources: [
    'arc42 documentation, section 10 Quality Requirements. docs.arc42.org/section-10/',
    'Beyer, Jones, Petoff, Murphy (eds). Site Reliability Engineering, chapter 3 Embracing Risk. sre.google/sre-book/embracing-risk/'
  ]
},
{
  n: 4, title: 'Availability and Error Budgets',
  lead: 'Availability sounds simple until someone asks what "available" means. You will turn it into minutes, requests and an error budget the team can spend on purpose.',
  slides: [
    ['What nines mean', 'Convert an availability percentage into allowed downtime.',
      'Every extra nine cuts the allowed downtime by a factor of ten and usually multiplies the cost.',
      'The Google SRE book gives one data point: at 99.99% availability a system may be down up to 52.56 minutes a year. 99.9% allows about 8.8 hours a year; 99% about 3.65 days.',
      'Ask what one more nine would cost before promising it.',
      'How many hours a year does 99.9% allow? Show the arithmetic.'],
    ['Time or requests', 'Choose how availability is measured.',
      'Availability can be measured by time up or by requests served; pick one and say so.',
      'The SRE book describes request-based measurement: a system serving 2.5 million requests a day with a 99.99% daily target can return up to 250 errors and still meet it. Request-based measures fit systems whose load varies.',
      'Write what counts as a success, what counts as an error, and over what window.',
      'Why can a system be "up" all day and still miss a request-based target?'],
    ['The error budget', 'Use an error budget to balance reliability and change.',
      'The error budget is the allowed unreliability, and it can be spent on purpose, for example on releases.',
      'The SRE book defines it as a clear, objective metric of how unreliable the service is allowed to be within a single quarter. When the budget is used up, risky changes pause; when plenty remains, the team can move faster.',
      'Agree in advance what the team does when the budget is spent.',
      'A team has spent its budget in week 4 of the quarter. What should the rule say?'],
    ['Designing for the target', 'Connect an availability target to design choices.',
      'The target decides how much redundancy, automation and process the design needs.',
      'Serial dependencies multiply: two components at 99.9% each give about 99.8% together. Redundant components in parallel improve it but add cost and failure modes of their own.',
      'List your hard dependencies and compute the best availability you can offer from them.',
      'Three serial dependencies each at 99.9%: roughly what combined availability?']
  ],
  guide: [
    'Teams promise availability they cannot afford and measure it in ways nobody can reproduce. Fix both: write the target as a number with a measurement rule, then check it against the dependencies you cannot control. If your payment provider promises 99.9%, you cannot offer 99.99% on checkout without a plan for when it is down.',
    'The error budget turns reliability from an argument into a shared number. It does not remove judgment, but it makes the trade-off between shipping and stability visible, and it gives the team a written rule for what happens when the budget is spent.'
  ],
  case: 'Illustrative case. The vendor app promises "high availability". The team writes: successful order submissions divided by all order submissions, per calendar month, target 99.9%, which allows about 43 minutes of failure a month at constant load. They then list dependencies: hosting 99.95%, payment 99.9%, SMS 99.5%. Serial multiplication puts them near 99.35%, below the target. They respond by making SMS optional (the order does not fail if the text fails), which removes it from the serial path.',
  lab: {
    title: 'Set an availability target and an error budget',
    intro: 'Pick the availability leaf from your quality tree, or the one nearest to it.',
    tasks: [
      'Write the availability scenario with a measurement rule: what is a success, an error, and the window.',
      'Convert the target to allowed failure per month in minutes or requests, showing your arithmetic.',
      'List your hard dependencies with their published availability and compute the best you can offer.',
      'Write the error-budget policy: what the team does when more than half, and when all, of the budget is spent.'
    ],
    evidence: 'The scenario, the budget arithmetic, the dependency table and the written policy.',
    model: '**Scenario.** Successful order submissions ÷ all submissions, per calendar month: 99.9%.\n**Budget.** 0.1% of a 30-day month is 43.2 minutes at constant load, or 1 failed order in 1,000.\n**Dependencies.** Hosting 99.95%, payment 99.9%, SMS 99.5% (made optional). Serial: 0.9995 × 0.999 = 99.85%, below the target.\n**Finding.** Payment alone limits us; add a retry queue so short payment outages do not fail the order.\n**Policy.** Over 50% spent: review the causes at the weekly meeting. 100% spent: only fixes and reliability work ship until the next window.'
  },
  rubric: [
    ['Measurement rule', 'None', 'Success defined, window missing', 'Success, error and window all defined'],
    ['Arithmetic', 'None', 'Arithmetic with errors', 'Correct conversion to minutes or requests'],
    ['Dependencies', 'Not considered', 'Listed, not combined', 'Combined and compared to the target'],
    ['Budget policy', 'No policy', 'Generic policy', 'Specific actions at specific thresholds']
  ],
  quiz: [
    ['Two serial components each at 99.9% give about...', ['99.99%', '99.9%', '99.8%', '99%'], 2, 'Availabilities multiply for serial dependencies: 0.999 × 0.999 ≈ 0.998.'],
    ['What is an error budget?', ['The money set aside for incidents.', 'The allowed unreliability for a period, which the team can spend on purpose.', 'The number of bugs in the backlog.', 'The cost of the monitoring tool.'], 1, 'The SRE book defines it as how unreliable the service is allowed to be within a quarter.'],
    ['A 99.99% yearly target allows how much downtime?', ['About 5 minutes', 'About 52.56 minutes', 'About 8.8 hours', 'About 3.65 days'], 1, 'The SRE book gives 52.56 minutes a year for 99.99%.']
  ],
  sources: [
    'Beyer, Jones, Petoff, Murphy (eds). Site Reliability Engineering, chapter 3 Embracing Risk. sre.google/sre-book/embracing-risk/'
  ]
},
{
  n: 5, title: 'Cost and Security as Measurable Qualities',
  lead: 'Cost and security are the two qualities most often left as adjectives. Here you give each a number, a boundary and an owner, so they can drive decisions like speed does.',
  slides: [
    ['Cost as a quality', 'Write cost as a unit cost with a ceiling.',
      'Cost belongs in the quality tree: a unit cost with a ceiling, not a vague wish to be cheap.',
      'Examples of unit costs: hosting per thousand orders, support minutes per vendor per month, cost per active user. A ceiling such as "hosting under US$0.40 per thousand orders" can be tested against a bill.',
      'Pick one unit that grows with the business and set a ceiling and a review date.',
      'Name a unit cost for a system you know and set a ceiling.'],
    ['Cost drivers', 'Find what makes the bill grow.',
      'Costs grow with a few drivers: traffic, data stored, data moved, and the people who operate the system.',
      'List the three biggest drivers and for each say how it grows: linearly with users, with data over time, or with each new feature. The fastest-growing driver is the one to design around.',
      'Draw a rough curve of each driver at 1x, 10x and 100x scale.',
      'Which cost driver in your system grows fastest, and at what scale does it matter?'],
    ['Security scenarios', 'Write a security quality scenario with a measure.',
      'A security scenario names an attacker, an attempt, and a measurable response.',
      'Examples: "An unauthenticated caller requests another vendor\'s orders; the request is refused and logged within one second" or "A leaked API key is revoked everywhere within 15 minutes." Measures can be time, count or coverage.',
      'Write abuse cases alongside use cases for every High importance leaf.',
      'Rewrite "the system must be secure" as a scenario with a measure.'],
    ['Compliance as a constraint', 'Separate a quality goal from a legal constraint.',
      'A legal or contractual duty is a constraint, not a preference, and goes in arc42 section 2 with a reference.',
      'Examples: card-data standards, data-protection law, a customer\'s contract. State the source of the duty, the owner, and the evidence you must keep. Quality scenarios then describe how you meet it.',
      'Keep a one-line source for every constraint so nobody argues about where it came from.',
      'Is "customer data stays in the region" a quality goal or a constraint? Why does it matter?']
  ],
  guide: [
    'Cost and security get neglected for opposite reasons. Cost feels like finance\'s job, so the architecture never carries a number; security feels like a specialist\'s job, so the design never carries a scenario. Put both into the quality tree and they become design inputs rather than late surprises.',
    'For security, resist the long checklist. Pick the two or three assets whose loss would hurt most, write one abuse scenario for each, and give each a measurable response. For cost, find the one driver that grows fastest and design around it.'
  ],
  case: 'Illustrative case. The vendor app stores order photos. The team sets a cost ceiling of US$0.40 per thousand orders and sketches the drivers: photo storage grows with every order, forever. At 100x scale storage would dominate the bill. They add a decision to resize on upload and archive after 90 days. For security, their High asset is vendor bank details. The scenario: "An attacker who obtains a vendor\'s session cannot change payout details without a second factor; the change attempt is logged and the vendor notified within one minute."',
  lab: {
    title: 'Add cost and security leaves with numbers',
    intro: 'Extend your quality tree and scenarios with one cost leaf and two security leaves.',
    tasks: [
      'Write one cost scenario with a unit cost, a ceiling and a review date.',
      'List your three cost drivers and say how each grows at 10x and 100x.',
      'Write two security scenarios, each with an attacker, an attempt and a measurable response.',
      'List the constraints (legal, contractual) that apply and the source of each.'
    ],
    evidence: 'One cost scenario, a driver table, two security scenarios and a constraint list with sources.',
    model: '**Cost.** Hosting under US$0.40 per thousand orders; review quarterly.\n| Driver | 10x | 100x |\n|---|---|---|\n| Photo storage | 10x, grows forever | dominates bill |\n| API calls | 10x | 100x, small |\n| Support time | 5x | 20x |\n\n**Security.** S1: a stolen session cannot change payout details without a second factor; logged, vendor notified in 1 minute. S2: a leaked API key is revoked everywhere in 15 minutes.\n**Constraints.** Card data handled only by the payment provider (provider contract); customer data stored in-region (customer contract, clause 7).'
  },
  rubric: [
    ['Cost scenario', 'No number', 'Number without a unit', 'Unit cost, ceiling and review date'],
    ['Drivers', 'None', 'Named', 'Named with growth at 10x and 100x'],
    ['Security scenarios', 'Adjectives', 'Attacker without a measure', 'Attacker, attempt and measurable response'],
    ['Constraints', 'Mixed with goals', 'Listed without sources', 'Listed separately with a source for each']
  ],
  quiz: [
    ['Which is the better cost goal?', ['Be cheap.', 'Hosting under US$0.40 per thousand orders, reviewed quarterly.', 'Use the cloud.', 'Minimise cost at all times.'], 1, 'It has a unit, a ceiling and a review point.'],
    ['"Customer data stays in the region" because the contract says so is a...', ['Quality goal', 'Constraint', 'Risk', 'Decision'], 1, 'A legal or contractual duty is a constraint; it goes in section 2 with its source.'],
    ['What makes a security scenario testable?', ['It mentions the word secure.', 'It names an attacker, an attempt and a measurable response.', 'It lists tools.', 'It is long.'], 1, 'Without an attempt and a measure nobody can tell if it is met.']
  ],
  sources: [
    'arc42 documentation, sections 2 Constraints and 10 Quality Requirements. docs.arc42.org/section-10/',
    'ISO/IEC 25010:2023, Product quality model. iso.org/standard/78176.html'
  ]
},
{
  n: 6, title: 'When Qualities Conflict',
  lead: 'Make it faster and it costs more. Make it safer and it gets slower. You will learn to find the conflicts in your own tree, name them out loud, and decide who gets to settle each one.',
  slides: [
    ['Conflicts are normal', 'Recognise that quality goals compete.',
      'Qualities compete for the same resources, so you cannot maximise all of them.',
      'The ATAM report (Kazman and colleagues, SEI, 1998) is built on this: improving one quality attribute can harm others, so an architecture must be evaluated for how decisions affect their interaction.',
      'Assume every pair of High qualities conflicts somewhere, and look for where.',
      'Give an example of two qualities that conflict in a system you know.'],
    ['A conflict matrix', 'Find conflicts systematically.',
      'A small matrix of your High leaves shows where decisions will pull in different directions.',
      'Write the leaves on both axes and mark each pair: helps, hurts, or independent. Offline ordering helps availability, hurts consistency, and may hurt security if data sits on the phone.',
      'Work through each hurting pair and write one sentence on what the tension actually is.',
      'Pick two leaves of yours and fill one cell with the tension in a sentence.'],
    ['Priorities and thresholds', 'Settle a conflict with a priority and a threshold.',
      'Settle a conflict by ranking, and by saying how much of the lower quality you will give up.',
      'Rather than "availability beats consistency", write: "an order may be shown as pending for up to 30 seconds after reconnecting; never lost." The threshold is what lets engineers act.',
      'Write each resolution as a ranking plus a threshold plus an owner.',
      'Turn "availability beats consistency" into a threshold statement.'],
    ['Who decides', 'Assign each conflict an owner.',
      'Some conflicts are technical, many are business choices, and each needs a named decider.',
      'Cost against reliability is a budget choice; privacy against convenience is a policy choice; speed against correctness is often a product choice. Record who decided and when.',
      'Put the decider and the date next to each resolved conflict in your decision log.',
      'Who should decide whether to spend more to reach one more nine, and why?']
  ],
  guide: [
    'The matrix is a thinking tool. Its output is not a table but a short list of sentences like "offline ordering trades consistency for availability; accepted up to 30 seconds of staleness, decided by the product owner on 3 March". Each such sentence is an architecture decision waiting to be recorded.',
    'Do not hide a conflict by calling both goals High. If both truly are, the design must show where each wins and where it gives way. If you cannot say, you have not found the conflict yet.'
  ],
  case: 'Illustrative case. In the matrix the team finds that "orders work offline" helps availability but hurts "never show a wrong stock level". They write the resolution: availability wins for placing orders; stock is shown as "approximate" for up to 30 seconds; a vendor can always reject an order they cannot fulfil. The product owner signs it off. The sentence becomes ADR-004 and a scenario: "After reconnecting, 95% of pending orders reconcile within 30 s."',
  lab: {
    title: 'Find and resolve your quality conflicts',
    intro: 'Use the High leaves from your tree.',
    tasks: [
      'Build the conflict matrix and mark every pair helps, hurts or independent.',
      'Write one sentence for each "hurts" pair describing the actual tension.',
      'Resolve your three most important conflicts with a ranking, a threshold and an owner.',
      'Add one scenario that proves each resolution, with a number.'
    ],
    evidence: 'The matrix, the tension sentences, three resolutions with owners and the matching scenarios.',
    model: '| | Offline | Fast checkout | Low cost |\n|---|---|---|---|\n| Offline | | independent | hurts (sync service) |\n| Fast checkout | independent | | hurts (more capacity) |\n\n**Resolution 1.** Availability beats stock accuracy for placing orders. Stock may be up to 30 s stale; orders are never lost. Owner: product owner. Scenario: 95% reconcile within 30 s.\n**Resolution 2.** Checkout speed is funded up to US$0.40 per thousand orders; beyond that, accept p95 of 3 s. Owner: head of operations.'
  },
  rubric: [
    ['Conflicts found', 'Says none', 'Names obvious ones', 'Matrix completed with tension sentences'],
    ['Resolution', 'Ranking only', 'Ranking with no threshold', 'Ranking, threshold and owner'],
    ['Owner', 'Not named', 'Team named', 'Named role for each decision'],
    ['Proof', 'None', 'Scenario without a number', 'Scenario with a number for each resolution']
  ],
  quiz: [
    ['What makes a conflict resolution actionable?', ['Calling both goals High.', 'A ranking, a threshold, and an owner.', 'A long meeting.', 'A new tool.'], 1, 'Engineers need to know how much of one quality to give up and who decided.'],
    ['Why did ATAM exist, according to the SEI report?', ['To rank programming languages.', 'To reason about how decisions affect interacting quality attributes.', 'To replace testing.', 'To write requirements.'], 1, 'Improving one quality can harm another, so evaluation looks at their interaction.'],
    ['Who should decide cost against reliability?', ['Whoever codes it.', 'The person accountable for the budget and the risk, with the architect advising.', 'A vote of all staff.', 'The vendor.'], 1, 'It is a business trade-off; the architect makes the options and consequences clear.']
  ],
  sources: [
    'Kazman, Klein, Barbacci, Longstaff, Lipson, Carriere. The Architecture Tradeoff Analysis Method. SEI report CMU/SEI-98-TR-008, 1998. sei.cmu.edu/library/the-architecture-tradeoff-analysis-method'
  ]
}
];
