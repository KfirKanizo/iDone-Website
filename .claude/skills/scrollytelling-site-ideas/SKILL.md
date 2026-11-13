---
name: scrollytelling-site-ideas
description: Find and develop concept ideas for scrollytelling websites (a signature through-line element, scene storyboard, scroll mechanics) tailored to a specific product, service, brand or idea. Use when the user wants ideas, a concept, a creative direction, or "what should the scroll story be" for a site or landing page, before building it; also for brainstorming new scenes for an existing scrollytelling site. Hands off to the scrollytelling-site skill for the build.
---

# Scrollytelling site ideas

Turns "I have a product/idea" into **2–3 distinct, buildable scroll-story concepts**, picks one with the user, and develops it into a storyboard the `scrollytelling-site` skill can build. The point is fit: every concept must be impossible to paste onto a different company.

Read when needed:
- `references/idea-methods.md` — the discovery lenses, metaphor prompts, through-line archetypes, and the scoring rubric.
- `references/concept-templates.md` — exact output formats (concept card, storyboard table, handoff brief).

## Workflow

1. **Understand (few questions, mostly infer).** From the user's message and any repo/docs: what is it, who is it for, what does it replace, the one-sentence promise, the single moment the customer cares about, brand mark/colours/tone, and **level**: *brand-level* (a studio or company selling several services) or *product-level* (one product). Default to the level the user stated; the user's standing preference is brand-level, equal weight across offerings, no single flagship product unless asked. Ask at most 3 questions, only for what cannot be inferred.
2. **Mine the raw material** with the lenses in `references/idea-methods.md`: the transformation, the friction, the mechanism, the proof moment, the mark. Write 5–8 raw observations first; concepts come from them, not from templates.
3. **Generate 3 concepts that are genuinely different** in through-line, mechanic, and mood (not three variants of one idea). Each in the concept-card format: name, the one-sentence through-line ("The ___ starts as ___ and ends as ___"), 5–8 scene beats, the signature scroll mechanic, why it fits *this* brand, risks/cost.
4. **Score and recommend.** Use the rubric (fit, clarity, wow, buildability, honesty, brand-level equality). Give a clear recommendation with a reason and say which is the most expensive to build. Do not list 10 options.
5. **Develop the chosen one** into a storyboard table (scene → message → mechanic → through-line role → mobile fallback → assets needed), plus copy sketches (headline per scene, ≤ 12 words) in the user's languages.
6. **Hand off.** Produce a handoff brief in the format of `concept-templates.md` and, when the user wants the site built, continue with the `scrollytelling-site` skill (or give them a prompt for it).

## Rules

- **Anchor in the brand's own mark or mechanism.** If the logo has a dot, line, letterform, or the product has a visible mechanic (a flow, a timeline, a counter, a map), the through-line comes from there.
- **Show, don't claim.** A scene should *demonstrate* the promise through motion (things connecting, assembling, resolving), not decorate it.
- **Equal weight** across offerings for brand-level sites; no one client's product dominates.
- **Honesty:** never base a concept on invented clients, statistics, or testimonials; use abstract diagrams where real proof does not exist, and mark placeholders.
- **Buildable:** every concept must be doable with transforms/opacity, GSAP ScrollTrigger pin+scrub, SVG, canvas, and CSS; no WebGL dependency unless the user wants it. Mobile must degrade gracefully (stacked + reveals).
- **Distinct moods:** if all three concepts feel calm-technical, change one (playful, cinematic, editorial).
- **Short:** a concept card fits on half a screen. Depth goes into the chosen concept only.

## Output discipline

Chat answer: the three cards, the scores in one compact table, the recommendation. No essays. If the user chooses, then the storyboard. Write long deliverables to a file (e.g. `docs/` in the repo or the scratchpad) and send it; keep the chat summary to a few lines.
