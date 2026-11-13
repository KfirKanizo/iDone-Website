# Engine snippets (copy, then adapt names/tokens)

## 1. Importmap and setup

```html
<script type="importmap">
{ "imports": {
  "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js",
  "gsap/ScrollTrigger": "https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js",
  "gsap/CustomEase": "https://cdn.jsdelivr.net/npm/gsap@3.13.0/CustomEase.js",
  "lenis": "https://unpkg.com/lenis@1.3.23/dist/lenis.mjs" } }
</script>
```

```js
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import { CustomEase } from 'gsap/CustomEase'; import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('idone.out','0.33,1,0.68,1'); CustomEase.create('idone.inOut','0.65,0,0.35,1'); CustomEase.create('idone.back','0.34,1.56,0.64,1');

const html = document.documentElement;
html.classList.add('js');
const mq = (q) => matchMedia(q).matches;
const lowEnd = () => (navigator.deviceMemory && navigator.deviceMemory <= 2) || navigator.connection?.saveData;
const reduced = () => mq('(prefers-reduced-motion: reduce)') || html.dataset.motion === 'reduced' || lowEnd();
const isDesktop = () => mq('(min-width:900px)') && mq('(hover:hover)');
const dir = () => (document.documentElement.dir === 'rtl' ? -1 : 1);

let lenis;
if (isDesktop() && !reduced()) {
  lenis = new Lenis({ smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToId = (id) => { const el = document.getElementById(id); if (!el) return; lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: 'smooth' }); };
```

## 2. Scene registry (build/rebuild)

```js
let ctx;
function buildScenes() {
  ctx?.revert();
  ctx = gsap.context(() => {
    const motionOn = !reduced();
    const base = { dot, dir: dir(), isDesktop: isDesktop() && motionOn };
    document.querySelectorAll('[data-scene]').forEach((root) => {
      const fn = scenes[root.dataset.scene];
      if (fn) fn({ root, ...base });
    });
  });
  ScrollTrigger.refresh();
}
document.fonts.ready.then(buildScenes);                // after fonts: layout is final
matchMedia('(min-width:900px)').addEventListener('change', buildScenes);
// call buildScenes() after language / theme / motion toggles too
```

Pinned scene skeleton:

```js
const scene = ({ root, isDesktop }) => {
  if (!isDesktop) return;                              // stacked + .reveal fallback
  const tl = gsap.timeline({ scrollTrigger: { trigger: root, pin: root.querySelector('[data-pin]'),
    start: 'top top', end: '+=150%', scrub: 0.5, anticipatePin: 1,
    onEnter: () => dot.moveTo(slot), onEnterBack: () => dot.moveTo(slot) } });
  // ...tl.to(...) in 0..N timeline units, hold with tl.to({}, {duration:.3})
};
```

## 3. Through-line controller (generalised "travelling dot")

One fixed element, transforms only, glued to the active scene's slot.

```css
.tl-el{position:fixed;inset-inline-start:0;top:0;width:var(--dot-size);height:var(--dot-size);border-radius:50%;background:var(--accent);pointer-events:none;z-index:90;will-change:transform}
html:not(.js) .tl-el, html[data-motion="reduced"] .tl-el{display:none}
.dot-slot{position:relative;display:inline-block;width:var(--dot-size);height:var(--dot-size)}
.dot-local{position:absolute;inset:0;border-radius:50%;background:var(--accent);opacity:0}
```

```js
class Dot {
  constructor(el){ this.el=el; this.slot=null; this.x=-100; this.y=-100; this.vis=false; this.leaping=false;
    gsap.set(el,{opacity:0,xPercent:-50,yPercent:-50}); gsap.ticker.add(()=>this.tick()); }
  static center(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }
  scaleOf(slot){ return parseFloat(slot.dataset.dotScale||1); }
  tick(){ if(!this.slot||this.leaping||!this.vis) return; const c=Dot.center(this.slot); this.x=c.x; this.y=c.y;
    gsap.set(this.el,{x:c.x,y:c.y}); }
  moveTo(slot){
    if(this.slot===slot) return;
    const prev=this.slot; if(prev) this.undock(prev);
    this.slot=slot; const to=Dot.center(slot);
    if(!this.vis){ this.vis=true; gsap.set(this.el,{x:to.x,y:to.y,opacity:1}); return this.land(slot); }
    this.leaping=true; const from={x:this.x,y:this.y};
    const mid={x:(from.x+to.x)/2,y:Math.min(from.y,to.y)-Math.max(80,Math.abs(to.x-from.x)*0.25)};   // arc control point
    const o={t:0};
    gsap.to(o,{t:1,duration:.72,ease:'idone.inOut',onUpdate:()=>{ const t=o.t,u=1-t;
        this.x=u*u*from.x+2*u*t*mid.x+t*t*to.x; this.y=u*u*from.y+2*u*t*mid.y+t*t*to.y;
        gsap.set(this.el,{x:this.x,y:this.y}); },
      onComplete:()=>{ this.leaping=false; this.land(slot); }});
  }
  land(slot){ gsap.fromTo(this.el,{scaleX:1.25,scaleY:.8},{scaleX:this.scaleOf(slot),scaleY:this.scaleOf(slot),duration:.5,ease:'idone.back'});
    if(slot.hasAttribute('data-dot-handoff')){ gsap.set(this.el,{opacity:0}); slot.dispatchEvent(new CustomEvent('dot:docked')); } }
  undock(slot){ if(slot.hasAttribute('data-dot-handoff')){ gsap.set(this.el,{opacity:1,x:Dot.center(slot).x,y:Dot.center(slot).y}); slot.dispatchEvent(new CustomEvent('dot:undocked')); } }
  leapAndVanish(slot,cb){ this.moveTo(slot); gsap.delayedCall(.8,()=>{ gsap.to(this.el,{opacity:0,duration:.2}); cb?.(); }); }
}
const dot = new Dot(document.querySelector('.tl-el'));
```

Rules: scenes using `data-dot-handoff` own a `.dot-local` they animate on their own timeline; the fixed dot hides on dock and reappears on undock. In reduced mode never call `moveTo`; show `.dot-local` static (`opacity:1`).

## 4. Reveals

```css
html.js .reveal{opacity:0;translate:0 24px;transition:opacity var(--dur-scene) var(--ease-out),translate var(--dur-scene) var(--ease-out);transition-delay:var(--delay,0ms)}
html.js .reveal.is-in{opacity:1;translate:0 0}
@media (prefers-reduced-motion:reduce){html.js .reveal{opacity:1;translate:none;transition:none}}
```
```js
const io=new IntersectionObserver((es)=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target);} }),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
```
Line reveal (headings): wrap each visual line in `span{display:block;overflow:hidden}` with an inner span `translateY(100%)→0`, 900ms `cubic-bezier(.215,.61,.355,1)`, stagger 100–120ms. Word reveal (statements): per word `translateY(24px)→0` + opacity, 35ms stagger, 700ms `cubic-bezier(.165,.84,.44,1)`.

## 5. Logo intro (SVG + GSAP timeline pattern)

Build the mark as separate SVG parts (`#spine`, `#bowl`, `#dot`) + wordmark letters. Timeline ≈ 1.9s: spine rises (scaleY from bottom) → dot pops above → bowl draws (`strokeDashoffset`/clip) → dot leaps in an arc and lands inside the bowl on the same frame the bowl closes, squash with `idone.back`, tiny scale click on the whole mark → wordmark letters in (12px, 60ms stagger, the `i`-dot last) → tagline fade. Dispatch `idone:landed` / `idone:finished`; expose `tap()`. Play once per visit (`sessionStorage`), skippable via scroll/click/Esc. Static final state when no JS or reduced motion.

## 6. Adaptive rem grid (Lumora style; use when the whole layout is rem-based)

```css
html{font-size:16px}
@media (max-width:1920px){html{font-size:.833333vw}}
@media (max-width:1440px){html{font-size:1.111111vw}}
@media (max-width:1024px){html{font-size:1.5625vw}}
@media (max-width:640px){html{font-size:4.444444vw}}
```
```js
function applyAdaptiveGrid(){ const B=16,W=1920,c=.6666,w=innerWidth; const red=((W-w)/W)*100; const s=B-(B*(red*c))/100;
  s>B ? html.style.fontSize=s+'px' : html.style.removeProperty('font-size'); }
applyAdaptiveGrid(); addEventListener('resize',applyAdaptiveGrid);
```
Skip this for fluid-`clamp()` sites; do not mix both.

## 7. Liquid cursor-reveal (hero image A shown, image B painted under the pointer)

Params: `brushRadius=143` CSS px, `decay=.016`, `dpr=min(devicePixelRatio,2)`. Base `<img>` (always visible, LCP) + `<canvas aria-hidden>` on top, `pointer-events:none`. Offscreen *cover* canvas holds image B drawn with object-fit:cover math; offscreen *brush* canvas (diameter=ceil(2·radius·dpr)). On `pointermove` (window): convert to canvas coords ×dpr, ignore if > radius outside, interpolate from last point with `step=max(radius*.3,1)` up to 60 points. rAF tick: if queued points → `idle=0` else `idle++` and stop at 120; `fade = drawing ? decay : min(decay+idle*.004,.5)`; `destination-out` fillRect with `rgba(0,0,0,fade)`; stamp each point: on brush canvas clear, radial gradient (`0:#fff 1`, `.55:#fff .82`, `1:#fff 0`), `source-in` drawImage of the cover region, then `source-over` drawImage(brush) onto main canvas; at idle 120 `clearRect`. Reduced motion: skip the canvas. Touch devices: tie the brush to scroll progress or auto-sweep instead.

## 8. Loader (opt-in, only when asked)

Fixed panel, `z-index:120`, ink background, bottom corners rounded; counter 000→100 over 1300ms easeInOutCubic (`t<.5?4t³:1-((-2t+2)³)/2`), 1px progress bar; on 100 slide `translateY(0→-100%)` ~700ms `idone.out`, fade the centre content, then start scroll and remove the node. Lock scroll with `lenis.stop()` + `html{overflow:hidden}` while it runs. Hero reveals wait for the `ready` flag.

## 9. Scroll count-up

Per number: ScrollTrigger `start:'top bottom'`, `end:'center center'`, `scrub:true`; `onUpdate: self => el.textContent = Math.round(self.progress * target)`. Throttle ~30ms. Suffix in a sibling span. Final text must equal the target when reduced motion or no JS (write the real number in the markup).

## 10. Theme / motion / language toggles

```js
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
// theme: html.dataset.theme='dark'|'light' (default from prefers-color-scheme), persist
// motion: html.dataset.motion='reduced'|''; then buildScenes()
// language: html.lang, html.dir, apply DICT, document.title, buildScenes(); keep section: remember current [data-scene] id, scroll back to it
```
Dark tokens must be defined for both `:root[data-theme="dark"]` and the `prefers-color-scheme` media query guarded by `:not([data-theme="light"])`.
