// QA screenshots: languages × viewports × themes. Home is captured scene by scene (pinned scenes at
// their start, middle and end); inner pages full-page.
//   node scripts/screenshots.mjs [baseUrl] [outDir] [--quick] [--only=<path fragment>] [--themes=light,dark]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const base = args.find((a) => a.startsWith('http')) || 'http://localhost:4321';
const out = args.find((a) => !a.startsWith('http') && !a.startsWith('--')) || 'qa/shots';
const quick = args.includes('--quick');
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7);
const themes = ((args.find((a) => a.startsWith('--themes=')) || '--themes=light,dark').slice(9)).split(',');
const langs = ((args.find((a) => a.startsWith('--langs=')) || '--langs=he,en').slice(8)).split(',');
const vps = ((args.find((a) => a.startsWith('--vp=')) || '--vp=desktop,mobile').slice(5)).split(',');
fs.mkdirSync(out, { recursive: true });

const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } };
const pages = ['/', '/services/web', '/services/video', '/services/automation', '/work/boostcoach', '/about', '/contact', '/accessibility', '/404'];

const browser = await chromium.launch();
const log = [];
for (const lang of langs) {
  for (const vpName of vps) {
    const vp = viewports[vpName];
    for (const theme of themes) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1, colorScheme: theme, locale: lang === 'he' ? 'he-IL' : 'en-US' });
      await context.addInitScript(() => { try { sessionStorage.setItem('idone-intro', 'seen'); localStorage.setItem('idone-lang', 'x'); } catch {} });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      for (const p of pages) {
        if (only && !(p === '/' ? 'home' : p).includes(only)) continue; // pass --only=home for the home page
        const url = `${base}/${lang}${p === '/' ? '/' : p + '/'}`;
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
        const tag = `${lang}-${vpName}-${theme}${p === '/' ? '-home' : p.replace(/\//g, '-')}`;
        if (p === '/') {
          const scenes = await page.evaluate(() => Array.from(document.querySelectorAll('[data-scene]')).map((s) => {
            const r = s.getBoundingClientRect();
            return { id: s.id, top: r.top + scrollY, height: r.height, pinned: !!s.querySelector('[data-pin]') };
          }));
          let n = 0;
          for (const s of scenes) {
            const stops = s.pinned && s.height > innerHeightOf(vp) * 1.3 ? [0, 0.5, 1] : [0];
            for (const k of stops) {
              const y = s.id === 'scene-hero' ? 0 : Math.round(s.top + (s.height - vp.height) * k);
              await page.evaluate((y) => window.scrollTo(0, y), y);
              await page.waitForTimeout(quick ? 600 : 1300);
              const file = path.join(out, `${tag}-${String(n++).padStart(2, '0')}-${s.id.replace('scene-', '')}-${Math.round(k * 100)}.png`);
              await page.screenshot({ path: file }); process.stdout.write('.');
            }
          }
        } else {
          await page.screenshot({ path: path.join(out, `${tag}.png`), fullPage: true });
        }
        if (quick && p !== '/') break;
      }
      if (errors.length) log.push({ lang, vpName, theme, errors: [...new Set(errors)].slice(0, 10) });
      await context.close();
    }
  }
}
function innerHeightOf(vp) { return vp.height; }
await browser.close();
fs.writeFileSync(path.join(out, '_errors.json'), JSON.stringify(log, null, 2));
console.log('done →', out, log.length ? `(${log.length} contexts with console errors)` : '(no console errors)');
