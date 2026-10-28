import gsap from 'gsap';
import type { Scene } from '../index';

/** Scene 6: the three tiles converge into a ring and the dot runs one lap around them. */
export const together: Scene = ({ root, dir }) => {
  const pin = root.querySelector<HTMLElement>('[data-pin]')!;
  const wrap = root.querySelector<HTMLElement>('[data-ring-wrap]')!;
  const ring = root.querySelector<SVGCircleElement>('[data-ring-path]')!;
  const tiles = Array.from(root.querySelectorAll<HTMLElement>('[data-tile]'));
  const orbit = root.querySelector<HTMLElement>('[data-dot-slot="together"]')!;
  const copy = root.querySelector<HTMLElement>('.copy')!;

  const spread = [{ x: 0, y: -1 }, { x: 0.87, y: 0.5 }, { x: -0.87, y: 0.5 }];
  const R = () => wrap.getBoundingClientRect().width * 0.43; // 86/200 of the box
  const size = () => wrap.getBoundingClientRect().width;

  gsap.set(ring, { strokeDasharray: 1, strokeDashoffset: 1 });
  // GSAP clears the CSS `translate` centring when it writes transforms, so centre with xPercent/yPercent
  gsap.set(orbit, { x: 0, y: 0, xPercent: -50, yPercent: -50 });
  gsap.set(tiles, { xPercent: -50, yPercent: -50 });
  // orbit anchor: the slot sits at the top of the ring (12 o'clock); x/y are offsets from there
  const place = (p: number) => {
    const a = -Math.PI / 2 + p * Math.PI * 2 * dir;
    const r = R();
    gsap.set(orbit, { x: Math.cos(a) * r, y: Math.sin(a) * r + r, xPercent: -50, yPercent: -50 });
  };

  const o = { k: 0, p: 0 };
  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, pin, start: 'top top', end: '+=150%', scrub: 0.5, anticipatePin: 1 },
  });
  tl.to(o, { k: 1, duration: 1, ease: 'idone.inOut', onUpdate: () => {
      const s = size() * 0.43; // tile centres land on the ring
      tiles.forEach((t, i) => gsap.set(t, { x: spread[i].x * s * o.k * dir, y: spread[i].y * s * o.k, xPercent: -50, yPercent: -50 }));
    } }, 0)
    .to(ring, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0.8)
    .to(o, { p: 1, duration: 1, ease: 'none', onUpdate: () => place(o.p) }, 0.8)
    .from(copy.children, { autoAlpha: 0, y: 16, stagger: 0.1, duration: 0.5, ease: 'idone.out' }, 0.3)
    .to({}, { duration: 0.3 });
  place(0);
};
