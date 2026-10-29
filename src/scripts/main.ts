/**
 * Site entry. Runs on every page (bundled by Astro). Re-initialises on View Transitions.
 */
import { initUI } from './ui';
import { initForms } from './form';
import { initPreferences } from './preferences';
import { initChat } from './chat';
import { initMotion, destroyMotion } from './motion/index';

function boot() {
  initUI();
  initForms();
  initPreferences();
  initChat();
  initMotion();
}

function restoreHtmlState() {
  const d = document.documentElement;
  d.classList.remove('no-js'); d.classList.add('js');
  try {
    const th = localStorage.getItem('idone-theme'); if (th === 'dark' || th === 'light') d.setAttribute('data-theme', th);
    if (localStorage.getItem('idone-motion') === 'reduced') d.setAttribute('data-motion', 'reduced');
    if (sessionStorage.getItem('idone-intro') === 'seen') d.setAttribute('data-intro', 'seen');
  } catch {}
  document.body.style.overflow = '';
}

document.addEventListener('astro:page-load', boot);
document.addEventListener('astro:before-swap', () => destroyMotion());
document.addEventListener('astro:after-swap', restoreHtmlState);
