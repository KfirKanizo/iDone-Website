import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Scene } from '../index';
import { DotController } from '../dot';

type LogoEl = HTMLElement & { play?: () => void; stop?: () => void; replay?: () => void };

/**
 * Scene 0/1: the brand intro plays once per visit inside the hero. When the dot locks into
 * the D the headline reveals; when the intro finishes a copy of the dot emerges from the
 * mark and leaps to its place beside the title. Scroll, click or Esc skips to the end.
 */
export const hero: Scene = ({ root, dot, isDesktop }) => {
  const html = document.documentElement;
  const logo = root.querySelector<LogoEl>('#hero-logo');
  const copy = root.querySelector<HTMLElement>('[data-hero-copy]');
  const slot = root.querySelector<HTMLElement>('[data-dot-slot="hero"]');
  const skip = root.querySelector<HTMLButtonElement>('[data-skip-intro]');
  if (!logo || !copy || !slot) return;

  const seen = html.getAttribute('data-intro') === 'seen';

  const finish = () => {
    if (!html.classList.contains('intro-running')) return;
    html.classList.remove('intro-running');
    html.setAttribute('data-intro', 'seen');
    try { sessionStorage.setItem('idone-intro', 'seen'); } catch {}
    copy.classList.add('is-ready');
    if (skip) skip.hidden = true;
    // the dot emerges from the mark's own dot and leaps to the title
    const markDot = logo.shadowRoot?.querySelector('.dot');
    const from = markDot ? DotController.center(markDot) : undefined;
    const r = slot.getBoundingClientRect();
    const inView = r.top > 0 && r.top < window.innerHeight;
    if (from && inView) { dot.appearAt(slot, from); } else { dot.appearAt(slot); }
    cleanupSkip();
  };

  const onSkip = (e?: Event) => {
    if (e && e.type === 'keydown' && (e as KeyboardEvent).key !== 'Escape') return;
    logo.stop?.();
    finish();
  };
  const skipEvents: [string, EventListener][] = [['wheel', onSkip], ['touchstart', onSkip], ['keydown', onSkip]];
  const cleanupSkip = () => { skipEvents.forEach(([n, f]) => window.removeEventListener(n, f)); skip?.removeEventListener('click', onSkip); };

  if (seen) {
    logo.setAttribute('animation', 'none');
    logo.stop?.(); // the component shows an empty first frame until told to show the final one
    copy.classList.add('is-ready');
    dot.appearAt(slot);
  } else {
    html.classList.add('intro-running');
    if (skip) skip.hidden = false;
    logo.addEventListener('idone:landed', () => copy.classList.add('is-ready'), { once: true });
    logo.addEventListener('idone:finished', () => finish(), { once: true });
    skipEvents.forEach(([n, f]) => window.addEventListener(n, f, { passive: true }));
    skip?.addEventListener('click', onSkip);
    customElements.whenDefined('idone-logo').then(() => {
      // give fonts/paint a beat so the first frame is not dropped
      setTimeout(() => { if (html.classList.contains('intro-running')) logo.play?.(); }, 120);
      // safety: never hold the page hostage
      setTimeout(() => finish(), 4000);
    });
  }

  // header logo stays hidden while the big hero logo is on screen (home page only)
  const headerBrand = document.querySelector<HTMLElement>('[data-header-logo]');
  if (headerBrand) {
    gsap.set(headerBrand, { autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: logo, start: 'bottom top+=' + 80, // once the hero logo has scrolled under the header
      onEnter: () => gsap.to(headerBrand, { autoAlpha: 1, duration: 0.3 }),
      onLeaveBack: () => gsap.to(headerBrand, { autoAlpha: 0, duration: 0.2 }),
    });
  }

  // gentle lean towards the pointer, desktop only, hero only
  if (isDesktop) {
    const onMove = (e: PointerEvent) => {
      if (dot.slot !== slot || dot.leaping) return;
      const c = DotController.center(slot);
      const dx = e.clientX - c.x, dy = e.clientY - c.y;
      const k = 0.06, max = 22;
      dot.lean.x = Math.max(-max, Math.min(max, dx * k));
      dot.lean.y = Math.max(-max, Math.min(max, dy * k));
    };
    const onLeave = () => { gsap.to(dot.lean, { x: 0, y: 0, duration: 0.5, ease: 'idone.out' }); };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
  }
};
