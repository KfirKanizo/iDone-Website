# Output templates

## Concept card (use for each of the 3)

```
### <N>. <Concept name>
**Through-line:** The ___ starts as ___ and ends as ___.
**Mood:** calm-technical | playful | cinematic | editorial | …
**Scene beats:** 1) … 2) … 3) … (5–8 beats, one line each)
**Signature mechanic:** the one scroll interaction people will remember
**Why it fits:** 1–2 sentences tied to the brand's mark/mechanism
**Risks / cost:** what could go wrong or be expensive; mobile fallback in a phrase
```

## Scoring table

| Concept | Fit | Clarity | Wow | Buildable | Honesty | Equality | Total |
|---|---|---|---|---|---|---|---|

Then: **Recommendation:** one concept, one reason. **Most expensive to build:** one concept.

## Storyboard (for the chosen concept)

| # | Scene | Message (≤12 words, he / en) | Mechanic | Through-line role | Mobile / reduced | Assets |
|---|---|---|---|---|---|---|

Add underneath: pinned scroll budget (viewport heights), which scenes are light vs ink, the payoff scene description, and open questions for the user.

## Handoff brief (feeds the `scrollytelling-site` skill or a build prompt)

```
Brand: … | Level: brand-level/product-level | Languages: …
Positioning: one line
Offerings (equal weight): …
Through-line: The ___ starts as ___ and ends as ___.
Scenes (ordered): <id> · purpose · mechanic · through-line role · pin length · fallback
Palette/fonts/mark: … (or "use existing tokens")
Real assets available: … | Placeholders needed: …
Links out (new tab): <name → URL> …
Copy: verbatim strings per scene (he/en) — mark any that are drafts
Constraints: no invented proof; reduced-motion + no-JS states; RTL mirrored
Output: single index.html | project
```

## Idea-only reply shape (when the user just wants ideas)

1. One line restating the brand and level.
2. The three concept cards.
3. Scoring table + recommendation + most expensive.
4. One question: "Which direction should I develop into a storyboard?"
