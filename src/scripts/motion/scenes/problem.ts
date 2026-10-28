import gsap from 'gsap';
import type { Scene } from '../index';

/** Scene 2: three scattered words pull into one line; dashed wires become one solid line. */
export const problem: Scene = ({ root, dir, isDesktop }) => {
  const sx = isDesktop ? 1 : 0; // no sideways scatter on narrow screens
  const pin = root.querySelector<HTMLElement>('[data-pin]')!;
  const words = Array.from(root.querySelectorAll<HTMLElement>('[data-word]'));
  const wrap = root.querySelector<HTMLElement>('.row-wrap')!;
  const lines = Array.from(root.querySelectorAll<SVGLineElement>('[data-wire]'));
  const line1 = root.querySelector<HTMLElement>('[data-line="1"]')!;
  const line2 = root.querySelector<HTMLElement>('[data-line="2"]')!;
  if (words.length < 3) return;

  const scatter = [
    { xPercent: -16 * dir * sx, yPercent: -120, rotation: -5 * dir },
    { xPercent: 0, yPercent: 70, rotation: 3 * dir },
    { xPercent: 18 * dir * sx, yPercent: -90, rotation: 5 * dir },
  ];

  const drawWires = () => {
    const w = wrap.getBoundingClientRect();
    const c = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2 - w.left, y: r.top + r.height / 2 - w.top }; };
    const p = words.map((el) => c(el.firstElementChild!));
    lines.forEach((ln, i) => {
      ln.setAttribute('x1', String(p[i].x)); ln.setAttribute('y1', String(p[i].y));
      ln.setAttribute('x2', String(p[i + 1].x)); ln.setAttribute('y2', String(p[i + 1].y));
    });
  };

  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, pin, start: 'top top', end: '+=140%', scrub: 0.6, anticipatePin: 1,
      onUpdate: (self) => { drawWires(); root.classList.toggle('is-joined', self.progress > 0.62); } },
  });
  words.forEach((w, i) => tl.from(w, { ...scatter[i], ease: 'idone.inOut', duration: 1 }, 0));
  tl.to(line1, { autoAlpha: 0, y: -10, duration: 0.3, ease: 'idone.out' }, 0.95)
    .fromTo(line2, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'idone.out' }, 1.15)
    .to({}, { duration: 0.4 }); // hold
  drawWires();
  window.addEventListener('resize', drawWires);
};
