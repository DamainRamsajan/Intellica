# 10. Quality requirements

## 10.1 Quality tree

Verifiability, Consistency, Accessibility, Speed, Independence, Low cost.

## 10.2 Scenarios

| ID | Scenario | Response |
| --- | --- | --- |
| Q1 | Visitor opens the home on a phone | Role cards and products readable; no horizontal scroll at 390px |
| Q2 | Visitor tampers with a demo input | Result changes visibly and the demo can be reset |
| Q3 | Someone adds an inline script | `npm run check` fails |
| Q4 | Someone hand-edits a kit file | Manifest check reports drift |
| Q5 | Product has no binaries yet | Download tab says nothing is published; no broken links |
| Q6 | Keyboard-only visitor | Skip link first; all controls reachable |
| Q7 | Product chat delivers a WASM demo | Replaces `demo.js`; no shell change needed |
| Q8 | Page load on mid-range phone | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 |
| Q9 | Docs link to another Markdown file | Navigates inside the Docs tab |
| Q10 | Hostile Markdown | Rendered as escaped text |
