/**
 * The travelling dot. One fixed element, moved with transforms only.
 *
 * Scenes declare landing spots with `data-dot-slot`. When a scene becomes active the
 * dot leaps there along a quadratic arc (the same idea as the brand intro's leap), lands
 * with a short squash (brand ease-back) and then tracks the slot while the page scrolls.
 *
 * A slot with `data-dot-handoff` owns a local `.dot-local` element that the scene's own
 * scroll timeline animates; on landing the fixed dot hides and the local dot takes over,
 * and the reverse happens when the dot leaves.
 */
import gsap from 'gsap';

export type Slot = HTMLElement;

const EASE_LEAP = 'idone.inOut';
const EASE_LAND = 'idone.back';

function readMs(name: string, fallback: number): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!v) return fallback;
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
}

export class DotController {
  el: HTMLElement;
  slot: Slot | null = null;
  x = -100; y = -100;
  scale = 1; sx = 1; sy = 1;
  lean = { x: 0, y: 0 };
  visible = false;
  leaping = false;
  docked = false;
  private base = 16;
  private tween?: gsap.core.Tween | gsap.core.Timeline;
  private tickFn = () => this.tick();

  constructor(el: HTMLElement) {
    this.el = el;
    this.measure();
    gsap.set(el, { opacity: 0 });
    gsap.ticker.add(this.tickFn);
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    gsap.ticker.remove(this.tickFn);
    window.removeEventListener('resize', this.onResize);
    this.tween?.kill();
    if (this.slot) this.undock(this.slot);
    gsap.set(this.el, { opacity: 0 });
  }

  private onResize = () => this.measure();
  private measure() { this.base = this.el.offsetWidth || 16; }

  static center(el: Element) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  static scaleOf(slot: Slot) { return parseFloat(slot.dataset.dotScale ?? '1'); }

  /** Apply the current state to the element (fixed; viewport coordinates). */
  private apply() {
    const s = this.base;
    gsap.set(this.el, { x: this.x - s / 2, y: this.y - s / 2, scaleX: this.scale * this.sx, scaleY: this.scale * this.sy, force3D: true });
  }

  private tick() {
    if (!this.slot || this.leaping || this.docked) return;
    const c = DotController.center(this.slot);
    this.x = c.x + this.lean.x; this.y = c.y + this.lean.y;
    this.apply();
  }

  /** Appear at a slot with the brand "pop" (no arc). Used after the intro and on inner pages. */
  appearAt(slot: Slot, from?: { x: number; y: number }) {
    this.tween?.kill();
    this.leaving();
    this.slot = slot;
    const c = from ?? DotController.center(slot);
    this.x = c.x; this.y = c.y; this.scale = 0; this.sx = this.sy = 1; this.visible = true;
    this.apply();
    gsap.set(this.el, { opacity: 1 });
    const target = DotController.scaleOf(slot);
    const o = { s: 0 };
    this.leaping = !!from;
    this.tween = gsap.to(o, {
      s: 1, duration: 0.42, ease: EASE_LAND,
      onUpdate: () => {
        if (from) { const t = DotController.center(slot); const k = o.s; this.x = c.x + (t.x - c.x) * k; this.y = c.y + (t.y - c.y) * k; }
        this.scale = o.s * target; this.apply();
      },
      onComplete: () => { this.leaping = false; this.scale = target; this.landed(slot); },
    });
  }

  /** Move to a slot: leap if visible, otherwise appear. */
  moveTo(slot: Slot) {
    if (slot === this.slot) return;
    if (!this.visible) return this.appearAt(slot);
    this.leap(slot);
  }

  private leaving() {
    if (this.slot) this.undock(this.slot);
    this.lean.x = this.lean.y = 0;
  }

  leap(slot: Slot) {
    this.tween?.kill();
    this.leaving(); // undocking may move x/y to the local dot's current spot
    const from = { x: this.x, y: this.y };
    const fromScale = this.scale || 1;
    const target = DotController.scaleOf(slot);
    this.slot = slot;
    this.leaping = true;
    this.docked = false;
    gsap.set(this.el, { opacity: 1 });
    const dur = Math.max(0.3, readMs('--site-dur-leap', 720) / 1000);
    const o = { u: 0 };
    this.tween = gsap.to(o, {
      u: 1, duration: dur, ease: EASE_LEAP,
      onUpdate: () => {
        const to = DotController.center(slot);
        const u = o.u;
        const dx = to.x - from.x, dy = to.y - from.y;
        const dist = Math.hypot(dx, dy);
        // control point: above the chord, like the brand's leapControl
        const lift = Math.min(260, Math.max(48, dist * 0.32));
        const cx = (from.x + to.x) / 2, cy = Math.min(from.y, to.y) - lift;
        this.x = (1 - u) * (1 - u) * from.x + 2 * (1 - u) * u * cx + u * u * to.x;
        this.y = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * cy + u * u * to.y;
        const stretch = 0.14 * Math.sin(Math.PI * u); // elongate mid-flight
        this.sx = 1 - stretch; this.sy = 1 + stretch;
        this.scale = fromScale + (target - fromScale) * u;
        this.apply();
      },
      onComplete: () => {
        this.leaping = false; this.sx = this.sy = 1; this.scale = target;
        this.land(slot);
      },
    });
  }

  /** Landing squash + "landed" event. */
  private land(slot: Slot) {
    const o = { k: 0 };
    this.sx = 1.28; this.sy = 0.72; this.apply();
    this.tween = gsap.to(o, {
      k: 1, duration: 0.34, ease: EASE_LAND,
      onUpdate: () => { this.sx = 1.28 - 0.28 * o.k; this.sy = 0.72 + 0.28 * o.k; this.tick(); if (this.docked) this.apply(); },
      onComplete: () => { this.sx = this.sy = 1; this.landed(slot); },
    });
  }

  private landed(slot: Slot) {
    slot.dispatchEvent(new CustomEvent('dot:landed', { bubbles: true, detail: { slot } }));
    if (slot.hasAttribute('data-dot-handoff')) this.dock(slot);
    else this.tick();
  }

  private dock(slot: Slot) {
    this.docked = true;
    slot.classList.add('is-docked');
    const local = slot.querySelector<HTMLElement>('.dot-local');
    if (local) gsap.set(local, { opacity: 1 });
    gsap.set(this.el, { opacity: 0 });
    slot.dispatchEvent(new CustomEvent('dot:docked', { bubbles: true }));
  }

  private undock(slot: Slot) {
    if (!slot.hasAttribute('data-dot-handoff')) return;
    slot.classList.remove('is-docked');
    const local = slot.querySelector<HTMLElement>('.dot-local');
    if (local) {
      // take off from where the local dot currently is
      if (this.docked) { const c = DotController.center(local); this.x = c.x; this.y = c.y; }
      gsap.set(local, { opacity: 0 });
    }
    this.docked = false;
    gsap.set(this.el, { opacity: this.visible ? 1 : 0 });
    slot.dispatchEvent(new CustomEvent('dot:undocked', { bubbles: true }));
  }

  /** Hide for good (e.g. after landing inside the mark). */
  vanish() {
    this.tween?.kill();
    this.leaving();
    this.slot = null; this.visible = false; this.leaping = false;
    gsap.to(this.el, { opacity: 0, duration: 0.15 });
  }

  /** Move to a slot and then hide the fixed dot (the slot's own graphic takes over). */
  leapAndVanish(slot: Slot, onLanded?: () => void) {
    const done = () => { slot.removeEventListener('dot:landed', done); onLanded?.(); this.vanish(); };
    slot.addEventListener('dot:landed', done);
    this.visible ? this.leap(slot) : this.appearAt(slot);
  }
}
