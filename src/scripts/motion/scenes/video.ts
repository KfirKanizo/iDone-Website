import gsap from 'gsap';
import type { Scene } from '../index';
import { loadVideo } from '../../media';

/** Scene 4: the dot becomes the play button; on desktop the reel row scrolls sideways with the page. */
export const video: Scene = ({ root, isDesktop, dir }) => {
  const pin = root.querySelector<HTMLElement>('[data-pin]')!;
  const track = root.querySelector<HTMLElement>('[data-track]')!;
  const play = root.querySelector<HTMLElement>('[data-dot-slot="video"]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]');
  const reel0 = track.querySelector<HTMLElement>('[data-reel="0"]')!;
  const vid = reel0.querySelector<HTMLVideoElement>('video');
  const btn = reel0.querySelector<HTMLButtonElement>('[data-play]');

  const setPlaying = (on: boolean) => {
    reel0.classList.toggle('is-playing', on);
    btn?.setAttribute('aria-label', on ? btn.dataset.labelPause! : btn.dataset.labelPlay!);
  };
  const start = () => { if (!vid) return; loadVideo(vid); vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); };
  const stop = () => { if (!vid) return; vid.pause(); setPlaying(false); };

  play.addEventListener('dot:docked', () => { play.classList.add('is-on'); start(); });
  play.addEventListener('dot:undocked', () => { play.classList.remove('is-on'); stop(); });
  btn?.addEventListener('click', () => { if (!vid) return; vid.paused ? start() : stop(); if (!vid.paused) vid.muted = false; });

  if (!isDesktop) return; // mobile: native horizontal scroll-snap row, no pin

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, pin, start: 'top top', end: () => '+=' + Math.max(600, distance() * 1.2), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => { if (hint) hint.style.opacity = String(1 - Math.min(1, self.progress * 4)); } },
  });
  // forward = reading direction: LTR moves the track left (negative x), RTL moves it right
  tl.to(track, { x: () => -distance() * dir, ease: 'none' });
};
