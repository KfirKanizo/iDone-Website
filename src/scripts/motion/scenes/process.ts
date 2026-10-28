import gsap from 'gsap';
import type { Scene } from '../index';

/** Scene 8: the dot walks the rail, one step per stage. */
export const process: Scene = ({ root }) => {
  const list = root.querySelector<HTMLElement>('[data-steps]')!;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  const walker = root.querySelector<HTMLElement>('[data-dot-slot="process"]')!;
  if (steps.length < 2) return;

  const rtl = document.documentElement.dir === 'rtl';
  // x offset (physical) from the walker's anchor (inline-start of the list) to each step marker
  const offsets = () => {
    const L = list.getBoundingClientRect();
    return steps.map((s) => { const r = s.getBoundingClientRect(); return rtl ? r.right - L.right : r.left - L.left; });
  };
  const yOf = () => { const L = list.getBoundingClientRect(); const r = steps[0].getBoundingClientRect(); return r.top - L.top; };

  const o = { i: 0 };
  const apply = () => {
    const xs = offsets();
    const i = Math.floor(o.i), f = o.i - i, j = Math.min(i + 1, xs.length - 1);
    const x = xs[i] + (xs[j] - xs[i]) * f;
    const stacked = Math.abs(yOf()) > 4; // single column: walk vertically instead
    const ys = steps.map((s) => s.getBoundingClientRect().top - list.getBoundingClientRect().top);
    gsap.set(walker, stacked ? { x: 0, y: ys[i] + (ys[j] - ys[i]) * f, xPercent: -50 * (rtl ? -1 : 1), yPercent: -50 } : { x, y: 0, xPercent: -50 * (rtl ? -1 : 1), yPercent: -50 });
    steps.forEach((s, k) => s.classList.toggle('is-on', o.i >= k - 0.02));
  };
  const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 40%', scrub: 0.4 } });
  for (let k = 1; k < steps.length; k++) tl.to(o, { i: k, duration: 1, ease: 'idone.back', onUpdate: apply }, (k - 1) * 1.2);
  apply();
};
