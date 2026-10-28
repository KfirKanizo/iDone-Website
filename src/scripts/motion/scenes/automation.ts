import gsap from 'gsap';
import type { Scene } from '../index';

/** Scene 5: the dot is a lead travelling through the systems; each node lights up as it passes. */
export const automation: Scene = ({ root, dir }) => {
  const pin = root.querySelector<HTMLElement>('[data-pin]')!;
  const flow = root.querySelector<HTMLElement>('[data-flow]')!;
  const path = root.querySelector<SVGPathElement>('[data-flow-path]')!;
  const runner = root.querySelector<HTMLElement>('[data-dot-slot="automation"]')!;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-node]'));
  if (!path) return;

  const total = path.getTotalLength();
  // node positions as fractions of the path length (vertices of the polyline)
  const vb = { w: 100, h: 40 };
  const pts = nodes.map((n) => ({ x: parseFloat(n.style.getPropertyValue('--x')), y: parseFloat(n.style.getPropertyValue('--y')) / 100 * vb.h }));
  const fractions: number[] = [];
  let acc = 0;
  pts.forEach((p, i) => { if (i > 0) acc += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); fractions.push(acc); });
  const totalPoly = acc || 1;
  fractions.forEach((f, i) => (fractions[i] = f / totalPoly));

  // the runner is positioned with logical insets (--x/--y as %), so it mirrors with dir for free
  gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
  const place = (p: number) => {
    const pt = path.getPointAtLength(p * total);
    runner.style.setProperty('--x', (pt.x / vb.w * 100).toFixed(2) + '%');
    runner.style.setProperty('--y', (pt.y / vb.h * 100).toFixed(2) + '%');
    nodes.forEach((n, i) => n.classList.toggle('is-on', p >= fractions[i] - 0.01));
  };
  const o = { p: 0 };
  gsap.timeline({
    scrollTrigger: { trigger: root, pin, start: 'top top', end: '+=150%', scrub: 0.5, anticipatePin: 1 },
  })
    .to(o, { p: 1, duration: 1, ease: 'none', onUpdate: () => place(o.p) })
    .to(path, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
    .to({}, { duration: 0.3 });
  place(0);
  void flow; void dir;
};
