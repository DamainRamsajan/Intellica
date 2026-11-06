# 11. Risks and technical debt

| ID | Item | Mitigation |
| --- | --- | --- |
| R1 | Kit copies drift between repos | Manifest and `npm run check`; keep versions in `VERSION` |
| R2 | Placeholder demos left in place | Label is visible; `CONTENT-TODO.md` tracks each product |
| R3 | Sovereign ERP has no arc42 yet | Page shows only what is defined; fill when arc42 exists |
| R4 | Legacy pages need a loose CSP | Confined to `/legacy/*`; rebuild pages over time |
| R5 | Domain moves can break email | Keep MX/TXT records; change only web records |
| R6 | Support chat has no owner or backend | Support tab is a contact page until decided |
| R7 | Binary hosting undecided | Download tab links to wherever files live; checksums required |
| R8 | Products' verify commands not confirmed | Marked in `CONTENT-TODO.md` |
| R9 | Hand-written Markdown renderer | Tested; escapes first; keep scope small |
