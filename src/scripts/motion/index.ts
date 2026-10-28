/**
 * Motion system: GSAP + ScrollTrigger scenes, the travelling dot, Lenis on desktop.
 * Everything is built inside a gsap.context so a page swap or the motion toggle can revert it.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { DotController } from './dot';
import { hero } from './scenes/hero';
import { problem } from './scenes/problem';
import { build } from './scenes/build';
import { video } from './scenes/video';
import { automation } from './scenes/automation';
import { together } from './scenes/together';
import { process } from './scenes/process';
import { cta } from './scenes/cta';

gsap.registerPlugin(ScrollTrigger, CustomEase);
// the brand curves, by name
CustomEase.create('idone.out', '0.33,1,0.68,1');
CustomEase.create('idone.inOut', '0.65,0,0.35,1');
CustomEase.create('idone.back', '0.34,1.56,0.64,1');
ScrollTrigger.config({ ignoreMobileResize: true });

export interface SceneCtx {
  root: HTMLElement;
  dot: DotController;
  isDesktop: boolean;
  dir: 1 | -1;
}
export type Scene = (ctx: SceneCtx) => void;

const SCENES: Record<string, Scene> = { hero, problem, build, video, automation, together, process, cta };

let ctx: gsap.Context | null = null;
let lenis: Lenis | null = null;
let dot: DotController | null = null;
let rafCb: ((t: number) => void) | null = null;

const html = document.documentElement;

function lowEnd(): boolean {
  const n = navigator as any;
  return (n.deviceMemory && n.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || n.connection?.saveData === true;
}
export function isReduced(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || html.getAttribute('data-motion') === 'reduced' || lowEnd();
}

export function destroyMotion() {
  ctx?.revert(); ctx = null;
  dot?.destroy(); dot = null;
  if (lenis) { lenis.destroy(); lenis = null; html.classList.remove('lenis'); }
  if (rafCb) { gsap.ticker.remove(rafCb); rafCb = null; }
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

export function initMotion() {
  destroyMotion();
  const dotEl = document.getElementById('dot');
  if (isReduced() || !dotEl) {
    html.classList.add('dot-hidden');
    return;
  }
  html.classList.remove('dot-hidden');

  const isDesktop = matchMedia('(pointer: fine) and (min-width: 900px)').matches;
  const dir: 1 | -1 = html.dir === 'rtl' ? -1 : 1;

  if (isDesktop) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    rafCb = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);
    html.classList.add('lenis');
  }

  dot = new DotController(dotEl);

  ctx = gsap.context(() => {
    const d = dot!;
    const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));

    // scene-specific choreography
    scenes.forEach((root) => {
      const fn = SCENES[root.dataset.scene!];
      if (fn) fn({ root, dot: d, isDesktop, dir });
    });

    // activation: when a scene owns the middle of the viewport, the dot goes to its slot
    scenes.forEach((root) => {
      const slot = root.querySelector<HTMLElement>('[data-dot-slot]:not([data-dot-scale="0"])');
      if (!slot) return;
      ScrollTrigger.create({
        trigger: root,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (!self.isActive) return;
          if (root.dataset.scene === 'hero' && html.classList.contains('intro-running')) return; // the intro delivers the dot
          d.moveTo(slot);
        },
      });
    });
  });

  // measurements settle after fonts
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export function getDot() { return dot; }
export function scrollTo(target: Element | number, immediate = false) {
  if (lenis) lenis.scrollTo(target as any, { immediate });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
  else (target as Element).scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
}
