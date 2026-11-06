# 9. Architecture decisions

| ID | Decision | Why | Consequence |
| --- | --- | --- | --- |
| ADR-01 | One domain, product subdomains | Only one domain owned | Each product needs its own Pages project |
| ADR-02 | One repo and Pages project per product | Independent releases; a domain attaches to one project | Shared code must be copied |
| ADR-03 | Static HTML per tab, no framework | Speed, safety, no build | Shell code is plain modules |
| ADR-04 | Shared kit copied with manifest | Works offline per repo; drift is detectable | Needs a sync step |
| ADR-05 | Strict CSP, no third parties | Verifiability story must be true of the site itself | No analytics or CDN fonts |
| ADR-06 | Content in JSON and Markdown | Product chats edit content, not code | Schemas must stay stable |
| ADR-07 | Demo mount contract | Product chats build engines independently | Shell owns the frame and labels |
| ADR-08 | Labeled placeholder demo | No empty or misleading pages | Must be replaced per product |
| ADR-09 | Legacy pages under `/legacy/` | Keep sector pages and decks alive | Looser CSP on that path only |
| ADR-10 | Docs follow Diátaxis (Use, Install, Reference, Architecture) | Readers arrive with different needs | Four groups per product |
| ADR-11 | Six fixed tabs | Predictable across products | Products hide tabs they lack |
| ADR-12 | System fonts | No third-party requests | Less brand typography |
