import gsap from 'gsap';
import type { Scene } from '../index';

type LogoEl = HTMLElement & { tap?: () => void };

/**
 * Scene 10: the mark waits with an empty counter. On a successful send the travelling dot
 * leaps into the counter, the mark's own dot takes over (accent restored) and tap() plays.
 */
export const cta: Scene = ({ root, dot }) => {
  const mark = root.querySelector<LogoEl>('#cta-mark');
  const counter = root.querySelector<HTMLElement>('[data-dot-slot="cta-done"]');
  const title = root.querySelector<HTMLElement>('[data-cta-title]');
  const sub = root.querySelector<HTMLElement>('[data-cta-sub]');
  const done = root.querySelector<HTMLElement>('[data-cta-done]');
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!mark || !counter || !form) return;

  // if the page is restored with a sent form, show the closed state immediately
  if (form.classList.contains('is-done')) mark.classList.add('is-landed');

  form.addEventListener('form:success', () => {
    const headerLogo = document.querySelector<LogoEl>('[data-header-logo] idone-logo');
    dot.leapAndVanish(counter, () => {
      mark.classList.add('is-landed');
      mark.tap?.();
      headerLogo?.tap?.();
      if (title && done) {
        gsap.to([title, sub].filter(Boolean), { autoAlpha: 0, y: -8, duration: 0.25, ease: 'idone.out', onComplete: () => {
          done.hidden = false;
          gsap.fromTo(done, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'idone.out' });
        } });
      }
    });
  }, { once: true });
};
