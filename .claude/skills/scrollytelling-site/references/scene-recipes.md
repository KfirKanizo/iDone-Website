# Scene recipes

Every recipe lists: purpose · markup · timeline · through-line role · mobile/reduced fallback. Pin lengths are `end:'+=N%'`. `dir` mirrors horizontal motion in RTL. Mix and match; 8–11 scenes per site; alternate light and ink surfaces to make rhythm visible.

## Hero
Purpose: state the offer; show the brand mark's intro once. Layout: logo block + eyebrow + H1 (≤ 12 words) + lead + 2 CTAs (primary with a small accent dotmark, ghost). Copy is visible from first paint, dimmed to `.55` only while the intro runs, then lifts with 60ms stagger. Through-line: emerges from the logo and leaps to the H1 bullet slot. Fallback: static logo, copy at full opacity.
Variant (visual brands): full-bleed image with liquid cursor-reveal (engine §7), giant low-opacity watermark word, rating row, carousel card, trusted-by grid.

## One Table (the "before/after" claim)
Purpose: show the brand replaces fragmentation. Three generic stations (one per offering, **same size/weight**; wireframe / editing timeline / node graph with a broken link) start scattered and rotated, then gather into one aligned row on a table line; dashed links turn solid, the broken link closes. Pin 170%, scrub .6: gather 0→1.2, connect 1→1.8, line1 out / line2 in 1.4→2.4, hold. Slot on the table line. Mobile: stacked, organised state, reveals. No client names.

## Words converge (lighter alternative)
Three scattered words (`xPercent ±16·dir`, `yPercent −120/70/−90`, rotations ±5) ease into one row; dashed SVG wires between word centres (recompute per update) turn solid at 62%; line1 fades out, line2 in. Pin 140%.

## Build (typing a UI)
Two columns: copy (points get `.is-on` at progress `.12 + i·.22`) + phone/browser frame of wireframe blocks. Through-line = blinking text caret (`data-dot-handoff`, steps(1) blink started on `dot:docked`). For each block: caret moves to just before it (.45, `inOut`), block pops (`scale .7→1`, `back`). Caret position from layout offsets, mirrored in RTL. End: wireframe cross-fades to a real screenshot or a CSS-built screen. Pin 160%.

## Film (horizontal reel)
Header block + horizontal track of 9:16 cards. Through-line = play button on the first card; on `dot:docked` auto-play muted, click toggles and unmutes; videos lazy-load (`data-src`→`src`), pause off-screen. Desktop: pin `end:'+='+max(600, overflow·1.2)px`, tween track `x: −overflow·dir`, hint fades over first 25%. Mobile: native scroll-snap row. Use labelled "coming soon" placeholders for missing reels.

## Connect (flow diagram)
SVG polyline path (`viewBox 0 0 100 40`, `preserveAspectRatio:none`) through 4–6 nodes (ring + mono label) zig-zag. Base faint path + `.lit` path drawn with `strokeDashoffset 1→0`; runner (through-line, handoff) follows `getPointAtLength`; nodes toggle `.is-on` when the runner passes their fractional position. Pin 150%.

## Together (orbit)
Ring (`r=86` in a 200 box) with three tiles converging from centre to 12/4/8 o'clock (`spread {0,−1},{.87,.5},{−.87,.5}` × `dir`), stroke draws while the dot orbits one lap; copy fades in. Pin 150%.

## Process (rail walker)
4 steps, mono numbers, hairline rail, walker dot interpolating between step markers with `back`; vertical walk on the stacked layout; steps toggle `.is-on`. Trigger on the list: `start:'top 70%'`, `end:'bottom 40%'`, scrub .4. Optional: tiny abstract diagram per step (two circles, 3-line checklist, growing bars, orbiting ring).

## Work
Featured list of 3–4 cards, equal weight, first one large. Cards with their own live site link out in a **new tab** (`target=_blank rel="noopener noreferrer"`, `↗` that is not mirrored in RTL, hidden "opens in a new tab" text); cards without one are non-links with a quiet "Want something similar?" → contact. Never build fake case-study pages.

## Services list with hover-fill rows
Rows with index, title, short description, circular arrow badge; hover fills the row (`background` alpha 0→1, padding-inline 1.5rem→2rem/1.25rem, 240ms spring-ish `back`) and shifts the arrow 5px. Hover-only on `(hover:hover)`.

## Stats panel
Ink rounded panel, eyebrow, H2, 2×2 → 4-col grid of big numbers with scroll count-up (engine §9). Real numbers only.

## Before/after liquid reveal (visual brands)
Engine §7. Pair it with a caption that tells what changed. Touch fallback: auto-sweep the brush once when in view.

## About / values
Narrow ink block: statement H2 with word reveal, 3 values (name + one sentence each), tool list as mono chips.

## CTA / contact (payoff scene)
Large static mark **missing its dot** + empty ring counter (`cta-done` slot); form fields with inline validation, honeypot, consent checkbox; on success the through-line leaps into the counter, the mark's dot takes over, mark `tap()`, headline swaps to the one-word payoff ("Done."). Stub the submit unless an endpoint is given. Show direct contact row (email, phone `dir=ltr`, WhatsApp, socials).

## Footer
Ink, three columns (brand + tagline, nav, contact), hairline separators, legal row, optional giant watermark word at 5% opacity.

## Floating assistant (optional)
56px button → 380×560 panel, suggestions, disclosure line, stub replies unless a backend is given, `role=dialog`, focus trap, Esc closes.

## Stitching rules
- Order = story: promise → problem → how it feels (Build/Film/Connect) → synthesis (Together) → proof (Work/Stats) → method (Process) → who (About) → action (CTA).
- Max two long pins in a row; put a non-pinned reveal section between them.
- Exactly one scene owns the through-line at any time.
- Total pinned scroll budget ≈ 8–10 viewport heights; more feels like scroll-jacking.
