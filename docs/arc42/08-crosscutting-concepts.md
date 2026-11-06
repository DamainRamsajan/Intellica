# 8. Cross-cutting concepts

## 8.1 Security

- CSP: `default-src 'self'`; no inline scripts or styles; `wasm-unsafe-eval` only on `/demo/*`.
- `/legacy/*` has a looser policy (inline, Google Fonts, Calendly) because the old pages need it.
- JSON values are inserted as text or attributes, never as HTML.
- Markdown: all HTML escaped, `javascript:`/`data:` links dropped, external images dropped.
- `safeHref` allows http(s), mailto, relative paths and query-only links.

## 8.2 Theming

Dark neutral base from the Intellica navy palette, plus a light theme. The theme button cycles auto, light, dark and saves the choice. Each product sets `--accent`; `--accent-ink` is derived with `color-mix`, and `--on-accent` is chosen by luminance in JS so text on accent stays readable.

## 8.3 Accessibility

WCAG 2.2 AA. Skip link first in tab order, visible focus, 44px targets, `aria-current` on active tabs, reduced motion respected, status never conveyed by color alone.

## 8.4 Performance

No framework, system fonts, wasm loaded only on the demo, `/kit/*` cached.

## 8.5 Honesty of content

Missing content shows "Nothing is published here yet." The placeholder demo is labeled as a placeholder, not as any product's engine. Product claims come from product arc42s.

## 8.6 Errors

Failed loads show an in-page message with the reason; the 404 page links back to the product home.

## 8.7 Testing

`npm run gate` runs the Markdown tests, syncs the kit and runs the checker. `npm run verify` adds `tools/browser-test.mjs`, a Playwright check of home, demo, docs, tabs, mobile overflow, theme and keyboard focus. Playwright is the only dependency (dev only); the site itself has none.
