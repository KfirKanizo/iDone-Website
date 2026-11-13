# Brief and copy

## Discovery (ask only what you can't infer)

1. Brand name, one-line positioning, tone (precise / playful / luxurious).
2. Offerings (2–4). If more than one, they get **equal visual weight**.
3. Languages (default: one; if Hebrew/Arabic involved: add RTL from day one).
4. Assets: logo (SVG), palette, fonts, video/screenshot files, existing site/repo to mine for copy.
5. Output: single `index.html` or project. Hosting target.
6. Must-have: contact form endpoint, WhatsApp number, social links, legal pages.
7. Any real projects the brand wants shown, and which have their own external sites (link out in a new tab with `rel="noopener noreferrer"` instead of building case-study pages).

If the repo exists, read: README, brand/tokens, i18n JSON, content collections, scene components. Reuse real strings verbatim.

## The through-line

Derive it from the brand mark. Examples:
- iDone: the logo's dot → title bullet → text caret → play button → lead on a path → orbit → rail walker → "done" counter.
- A brand with a line/underscore: a thread that threads through scenes.
- A brand with a letterform: the glyph morphs per scene.
Deliverable of this step: one sentence plus a table `scene → role of the through-line → landing spot`.

## Copy rules

- Headline pattern: one concrete claim per scene, ≤ 12 words, no buzzwords.
- Three-point lists: parallel grammar, each point a concrete outcome.
- CTAs: verb + outcome ("Book a call"), never "Learn more".
- Every offering gets a short *what's included / who it's for / how it fits with the rest / FAQ* if secondary pages are requested.
- Hebrew: write natively, not as translation; short sentences; no negative tracking; keep Latin product names inside Hebrew text with `dir=auto` or `<bdi>`.
- Numbers: only real ones. If unknown: "Where we're still collecting numbers, we say so."
- Never invent client names, quotes, awards, headcount, years founded.

## i18n structure

`DICT = { he:{…}, en:{…} }`, identical key paths, applied with `data-i18n="a.b.c"` (and `data-i18n-attr="aria-label:a.b"` when needed). Arrays by index (`home.build.points.0`). Language switch: update `lang`, `dir`, `<title>`, meta description, persist, keep scroll position by section id, rebuild scene contexts.
