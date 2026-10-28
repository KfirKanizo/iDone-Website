/**
 * Non-motion UI: header, theme + motion toggles, language switch with scene memory,
 * the English suggestion bar, reveal-on-scroll, lazy video.
 */
import { initMotion } from './motion/index';
import { loadVideo } from './media';

const html = document.documentElement;
let bound = false;

export function initUI() {
  bindOnce();
  initHeader();
  initLangSwitch();
  initReveal();
  initLazyVideo();
  restoreScene();
}

/* ---------------------------------------------------------------- one-time global bindings */
function bindOnce() {
  if (bound) return;
  bound = true;

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const theme = t.closest<HTMLElement>('[data-theme-toggle]');
    if (theme) return toggleTheme(theme);
    const motion = t.closest<HTMLElement>('[data-motion-toggle]');
    if (motion) return toggleMotion();
    const menu = t.closest<HTMLElement>('[data-menu-toggle]');
    if (menu) return toggleMenu(menu);
    // close mobile menu when a link inside it is followed
    if (t.closest('#site-nav a')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  const onScroll = () => {
    document.getElementById('site-header')?.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------------- header */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  syncThemeLabel();
  syncMotionLabel();
  // close the services <details> when clicking elsewhere
  document.addEventListener('click', (e) => {
    document.querySelectorAll<HTMLDetailsElement>('[data-services-menu][open]').forEach((d) => {
      if (!d.contains(e.target as Node)) d.open = false;
    });
  });
}
function toggleMenu(btn: HTMLElement) {
  const header = document.getElementById('site-header')!;
  const open = !header.hasAttribute('data-open');
  header.toggleAttribute('data-open', open);
  btn.setAttribute('aria-expanded', String(open));
  btn.querySelector<HTMLElement>('[data-label-open]')!.hidden = open;
  btn.querySelector<HTMLElement>('[data-label-close]')!.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMenu() {
  const header = document.getElementById('site-header');
  if (!header?.hasAttribute('data-open')) return;
  toggleMenu(header.querySelector('[data-menu-toggle]')!);
}

/* ---------------------------------------------------------------- theme */
function currentTheme(): 'light' | 'dark' {
  const set = html.getAttribute('data-theme');
  if (set === 'dark' || set === 'light') return set;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function toggleTheme(_btn: HTMLElement) {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('idone-theme', next); } catch {}
  syncThemeLabel();
}
function syncThemeLabel() {
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((b) => {
    const dark = currentTheme() === 'dark';
    b.setAttribute('aria-label', dark ? b.dataset.labelLight! : b.dataset.labelDark!);
    b.setAttribute('aria-pressed', String(dark));
  });
}

/* ---------------------------------------------------------------- motion */
function toggleMotion() {
  const reduced = html.getAttribute('data-motion') === 'reduced';
  if (reduced) html.removeAttribute('data-motion'); else html.setAttribute('data-motion', 'reduced');
  try { if (reduced) localStorage.removeItem('idone-motion'); else localStorage.setItem('idone-motion', 'reduced'); } catch {}
  syncMotionLabel();
  initMotion(); // rebuild (or tear down) the scroll choreography
}
function syncMotionLabel() {
  const reduced = html.getAttribute('data-motion') === 'reduced';
  document.querySelectorAll<HTMLElement>('[data-motion-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(reduced));
    b.setAttribute('aria-label', reduced ? b.dataset.labelOn! : b.dataset.labelOff!);
  });
}

/* ---------------------------------------------------------------- language switch: keep the scene */
function currentSceneId(): string | null {
  const mid = window.innerHeight / 2;
  let best: { id: string; d: number } | null = null;
  document.querySelectorAll<HTMLElement>('[data-scene][id], main section[id]').forEach((s) => {
    const r = s.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) { best = { id: s.id, d: 0 }; return; }
    const d = Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
    if (!best || d < best.d) best = { id: s.id, d };
  });
  return best ? (best as { id: string }).id : null;
}
function initLangSwitch() {
  document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((a) => {
    a.addEventListener('click', () => {
      const id = currentSceneId();
      try {
        localStorage.setItem('idone-lang', a.getAttribute('hreflang') || '');
        if (id) sessionStorage.setItem('idone-scene', id);
        sessionStorage.setItem('idone-scene-path', a.pathname);
      } catch {}
    });
  });
}
function restoreScene() {
  let id: string | null = null;
  try {
    if (sessionStorage.getItem('idone-scene-path') === location.pathname) id = sessionStorage.getItem('idone-scene');
    sessionStorage.removeItem('idone-scene'); sessionStorage.removeItem('idone-scene-path');
  } catch {}
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  // after layout settles (fonts, pins)
  const go = () => el.scrollIntoView({ block: 'start', behavior: 'auto' });
  go();
  document.fonts?.ready.then(() => setTimeout(go, 50));
}

/* ---------------------------------------------------------------- reveal on scroll */
function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  els.forEach((e) => io.observe(e));
}

/* ---------------------------------------------------------------- lazy video: load near the viewport, play in view */
function initLazyVideo() {
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-hover-video], video[data-reel-video]');
  if (!vids.length) return;
  const saveData = (navigator as any).connection?.saveData;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = en.target as HTMLVideoElement;
      if (en.isIntersecting) {
        if (!saveData) loadVideo(v);
        if (v.hasAttribute('data-hover-video') && !saveData && !html.matches('[data-motion="reduced"]')) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: '200px 0px' });
  vids.forEach((v) => io.observe(v));
}
