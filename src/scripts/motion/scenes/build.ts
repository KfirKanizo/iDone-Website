import gsap from 'gsap';
import type { Scene } from '../index';

/** Scene 3: the dot is a caret; a UI assembles block by block, then becomes the real app screen. */
export const build: Scene = ({ root }) => {
  const pin = root.querySelector<HTMLElement>('[data-pin]')!;
  const blocksWrap = root.querySelector<HTMLElement>('[data-blocks]')!;
  const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-blk]'));
  const caret = root.querySelector<HTMLElement>('[data-dot-slot="build"]')!;
  const local = caret.querySelector<HTMLElement>('.dot-local')!;
  const points = Array.from(root.querySelectorAll<HTMLElement>('[data-points] .point'));
  const shot = root.querySelector<HTMLElement>('[data-shot]')!;
  if (!blocks.length) return;

  // caret blink while docked (CSS-free, so it can be killed with the context)
  const blink = gsap.to(local, { opacity: 0.25, duration: 0.5, ease: 'steps(1)', yoyo: true, repeat: -1, paused: true });
  caret.addEventListener('dot:docked', () => blink.play());
  caret.addEventListener('dot:undocked', () => { blink.pause(); gsap.set(local, { opacity: 0 }); });

  // offsets are layout values (ignore transforms); the caret rests 14px from inline-start, 18px from top
  const rtl = document.documentElement.dir === 'rtl';
  const caretX = (el: HTMLElement) => rtl ? el.offsetLeft + el.offsetWidth - blocksWrap.clientWidth + 10 : el.offsetLeft - 10;
  const caretY = (el: HTMLElement) => el.offsetTop - 14;

  gsap.set(blocks, { opacity: 0, scale: 0.7, transformOrigin: rtl ? '100% 0%' : '0% 0%' });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, pin, start: 'top top', end: '+=160%', scrub: 0.5, anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        points.forEach((pt, i) => pt.classList.toggle('is-on', p > 0.12 + i * 0.22));
      } },
  });
  const step = 1;
  blocks.forEach((b, i) => {
    const t = i * step;
    tl.add(() => {}, t); // keep positions stable
    tl.to(caret, { x: () => caretX(b), y: () => caretY(b), duration: step * 0.45, ease: 'idone.inOut', immediateRender: false }, t);
    tl.to(b, { opacity: 1, scale: 1, duration: step * 0.55, ease: 'idone.back' }, t + step * 0.4);
  });
  const end = blocks.length * step;
  tl.to(shot, { opacity: 1, duration: 0.8, ease: 'idone.out' }, end + 0.2)
    .to(blocks, { opacity: 0, duration: 0.5, ease: 'idone.out', stagger: 0.03 }, end + 0.3)
    .to(local, { opacity: 0, duration: 0.2 }, end + 0.2)
    .to({}, { duration: 0.6 });
  // positions depend on layout: recompute when sizes change
  window.addEventListener('resize', () => { tl.invalidate(); });
};
