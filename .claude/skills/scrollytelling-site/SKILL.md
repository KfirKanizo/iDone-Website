---
name: scrollytelling-site
description: Build a premium scrollytelling marketing site (pinned scenes, scroll-scrubbed GSAP choreography, a signature through-line element, Lenis smooth scroll, bilingual HE/EN with RTL, light/dark, reduced-motion safe). Use whenever the user asks to create, redesign, or generate a website, landing page, or studio/agency/software/automation/video company site "at the iDone / Lumora level", with scroll storytelling, animations, or a high-end feel. Also use to extend such a site with a new scene.
---

# Scrollytelling site builder

Produces a site at the quality bar of two reference builds: **iDone Technologies** (a travelling cobalt dot that changes role per scene) and **Lumora** (rem-adaptive grid, loader, liquid cursor-reveal hero). The result must feel authored, not templated: one idea carried through the whole scroll, calm typography, zero decoration for its own sake.

Read the reference files **when you reach the step that needs them**, not all upfront:
- `references/brief-and-copy.md` — discovery questions, copy rules, what never to invent.
- `references/engine.md` — copy-ready JS/CSS: setup, tokens, through-line controller, reveals, loader, adaptive rem, liquid reveal, count-up.
- `references/scene-recipes.md` — the scene library (what each scene shows, timeline numbers, mobile fallback).
- `scripts/qa-scroll.mjs` — Playwright scroll QA (screenshots at scroll stops, console errors, no-JS and reduced-motion passes).

## Workflow

1. **Brief (max one round of questions).** Ask only what you cannot infer: brand name + one-line positioning, the 2–4 offerings, languages, existing assets (logo, palette, fonts, video, screenshots), output form (single `index.html` vs Astro/Next project), and any must-use copy. If the user already pasted a brief or repo, extract answers from it instead of asking. See `references/brief-and-copy.md`.
2. **Choose the through-line.** Pick ONE signature element that travels the whole page and changes role per scene (iDone: the dot from the logo; alternatives: a line/thread, a cursor-follow glyph, a counter, a light beam). It must come from the brand's own mark or core idea. Write one sentence: "The ___ starts as ___ and ends as ___." If you cannot, the concept is not ready.
3. **Plan scenes** (8–11, one message each). Use the recipes; adapt to the offerings. Every scene needs: a one-line purpose, the scroll mechanic (pin/scrub, reveal, horizontal, orbit…), the through-line's role in it, and its mobile fallback. Keep **equal visual weight across offerings** when the brand sells several services; never centre the page on one client's product unless asked.
4. **Set the foundation first** (`references/engine.md`): tokens, fonts, i18n dictionary, logical-properties CSS, motion engine, reduced-motion/no-JS gating. Get this right before any scene.
5. **Build scene by scene**, each as its own function receiving `{root, dot, dir, isDesktop}`. Test each as you go.
6. **QA** with `scripts/qa-scroll.mjs`, view the screenshots, fix, and re-run. Do not claim it works until you have looked at the output.
7. **Report** what was built, what is placeholder, and the exact open/run instructions.

## Non-negotiable quality bar

**Motion**
- Pinned/scrubbed scenes run **only on desktop** (`min-width:900px` and hover-capable). Narrower: plain stacked blocks with IntersectionObserver reveals, native scroll-snap for horizontal rows.
- Use three named easings everywhere (`out .33,1,.68,1`, `inOut .65,0,.35,1`, `back .34,1.56,.64,1`); scrub 0.4–0.6; pin lengths 140–170% per scene. No linear tweens except path-following and progress counters.
- Move with **transforms and opacity only**. No layout-thrashing animation, no `top/left` tweens, no filters in scrubbed timelines.
- Lenis on desktop only; connect to ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`, GSAP ticker drives Lenis, `lagSmoothing(0)`).
- The through-line is owned by **one controller**; the most recently activated scene owns it. It must never be stranded between scenes.

**Resilience**
- Content first: no blocking loader unless the user asks for one (Lumora-style loader is a recipe, opt-in). Copy visible at first paint.
- No-JS: every section readable and complete; hidden initial states only under `html.js`.
- `prefers-reduced-motion`, a visible **motion toggle**, and low-end detection (`deviceMemory<=2`, `saveData`) all produce the final static state with durations 0.
- Rebuild scenes inside `gsap.context()`; on language/theme/motion switch revert, rebuild and `ScrollTrigger.refresh()`.

**Craft**
- Tokens only (no raw hex in components); 4px spacing grid; fluid type scale with `clamp()`.
- **CSS logical properties only** (`inline-start`, `margin-inline`, `padding-block`, `inset-inline-*`); mirror motion with `dir = ±1`. The logo never mirrors.
- Hairlines (`1px var(--line)`), generous whitespace, one accent colour reserved for the through-line and tiny highlights. No gradients/shadows/3D unless the brand demands it.
- Typography does the heavy lifting: display weight 600, tight tracking for Latin, **zero tracking and 1.08 leading for Hebrew**.
- Accessibility: WCAG 2.2 AA, landmarks, skip link, visible focus, `aria-hidden` on decorative layers, meaningful alt text, contrast ≥ 4.5:1 in both themes.

**Honesty**
- Never invent clients, testimonials, statistics, awards or logos. Use abstract wireframes/diagrams for generic scenes and clearly marked placeholders for missing media. If numbers are unknown, say so on the page.
- Contact/forms: do not wire to unknown endpoints; use the user's endpoint or stub it and say it is stubbed.

## Output forms

- **Single file** (default for "generate a site"): one `index.html`, CSS in one `<style>`, JS in one `<script type="module">`, libraries via importmap CDN (GSAP 3.13, ScrollTrigger, CustomEase, Lenis 1.3.x; pin exact versions).
- **Project** (when the repo is Astro/Next): scenes as components, motion in `scripts/motion/scenes/*.ts`, tokens in a CSS file, i18n in JSON per locale. Same rules apply.

## Extending an existing site

Edit only what was asked. Reuse the file's tokens, helpers, easings and `DotController` API; keep section ids and DOM order stable; add copy through the existing i18n structure; return the whole file plus a 3-line changelog. Re-run QA focusing on the touched scene and its neighbours (through-line hand-off).

## Anti-patterns (reject on sight)

Auto-playing sound; scroll-jacking that fights the browser (use pin+scrub, never `wheel` handlers that `preventDefault`); parallax on everything; stock photos as hero; gradients-and-glass "AI look"; a loader that gates content; hover-only information; animation that does not respect reduced motion; copy that could belong to any company.
