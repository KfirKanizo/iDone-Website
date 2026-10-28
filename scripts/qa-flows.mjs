// Interaction QA: intro once-per-visit + skip, language switch keeps the scene, theme/motion toggles,
// contact form success (webhook mocked) with the dot landing in the D, no-JS render, reduced motion,
// mobile menu. Writes screenshots to qa/flows and prints PASS/FAIL lines.
//   node scripts/qa-flows.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || 'http://localhost:4321';
const out = 'qa/flows';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok, extra }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  · ' + extra : ''}`); };
const shot = (page, name) => page.screenshot({ path: path.join(out, name + '.png') });

/* 1. intro: runs on first visit, header hidden meanwhile, dot appears after; second load is static */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
  const page = await ctx.newPage();
  await page.goto(`${base}/he/`);
  await page.waitForTimeout(300);
  const running = await page.evaluate(() => document.documentElement.classList.contains('intro-running'));
  await shot(page, '01-intro-running');
  await page.waitForTimeout(2600);
  const after = await page.evaluate(() => ({ running: document.documentElement.classList.contains('intro-running'), seen: sessionStorage.getItem('idone-intro'), dotOpacity: getComputedStyle(document.getElementById('dot')).opacity, copyReady: document.querySelector('[data-hero-copy]').classList.contains('is-ready') }));
  await shot(page, '02-intro-done');
  check('intro runs once and releases the page', running && !after.running && after.seen === 'seen' && after.dotOpacity === '1' && after.copyReady, JSON.stringify(after));
  await page.reload(); await page.waitForTimeout(600);
  const second = await page.evaluate(() => ({ running: document.documentElement.classList.contains('intro-running'), anim: document.getElementById('hero-logo').getAttribute('animation'), dash: document.getElementById('hero-logo').shadowRoot.querySelector('.trace').getAttribute('stroke-dasharray') }));
  check('second visit shows the static logo', !second.running && second.anim === 'none' && second.dash.startsWith('100'), JSON.stringify(second));
  // skip with Escape
  await ctx.clearCookies(); await page.evaluate(() => sessionStorage.clear());
  await page.reload(); await page.waitForTimeout(200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const skipped = await page.evaluate(() => ({ running: document.documentElement.classList.contains('intro-running'), dash: document.getElementById('hero-logo').shadowRoot.querySelector('.trace').getAttribute('stroke-dasharray') }));
  check('Escape skips the intro to the final frame', !skipped.running && skipped.dash.startsWith('100'), JSON.stringify(skipped));
  await ctx.close();
}

/* 2. language switch keeps the scene, remembers the choice; hreflang pairs */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
  await ctx.addInitScript(() => sessionStorage.setItem('idone-intro', 'seen'));
  const page = await ctx.newPage();
  await page.goto(`${base}/he/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('scene-automation').scrollIntoView());
  await page.waitForTimeout(800);
  await page.click('[data-lang-switch]');
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(900);
  const st = await page.evaluate(() => ({ url: location.pathname, lang: document.documentElement.lang, dir: document.documentElement.dir, stored: localStorage.getItem('idone-lang'), sceneTop: Math.round(document.getElementById('scene-automation').getBoundingClientRect().top) }));
  await shot(page, '03-lang-switch-en');
  check('language switch lands on the same scene in English', st.url === '/en/' && st.lang === 'en' && st.dir === 'ltr' && st.stored === 'en' && Math.abs(st.sceneTop) < 120, JSON.stringify(st));
  const alt = await page.evaluate(() => Array.from(document.querySelectorAll('link[rel=alternate]')).map((l) => l.getAttribute('hreflang') + ' ' + l.getAttribute('href')));
  check('hreflang set on the page', alt.length === 3 && alt.some((a) => a.startsWith('he-IL')) && alt.some((a) => a.startsWith('x-default')), alt.join(' | '));
  // inner page pair
  await page.goto(`${base}/en/work/boostcoach/`); await page.waitForTimeout(300);
  const href = await page.getAttribute('[data-lang-switch]', 'href');
  check('inner page switch targets the Hebrew twin', href === '/he/work/boostcoach/', href);
  await ctx.close();
}

/* 3. theme + motion toggles, logo follows theme */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  await ctx.addInitScript(() => sessionStorage.setItem('idone-intro', 'seen'));
  const page = await ctx.newPage();
  await page.goto(`${base}/en/about/`, { waitUntil: 'networkidle' });
  await page.click('[data-theme-toggle]'); await page.waitForTimeout(300);
  const dark = await page.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), bg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.querySelector('[data-header-logo] idone-logo').shadowRoot.querySelector('.ink')).fill, stored: localStorage.getItem('idone-theme') }));
  await shot(page, '04-dark-mode');
  check('dark mode toggles tokens and the header logo', dark.theme === 'dark' && dark.bg === 'rgb(14, 26, 43)' && dark.ink === 'rgb(244, 246, 250)' && dark.stored === 'dark', JSON.stringify(dark));
  await page.click('[data-motion-toggle]'); await page.waitForTimeout(300);
  const red = await page.evaluate(() => ({ motion: document.documentElement.getAttribute('data-motion'), dotHidden: document.documentElement.classList.contains('dot-hidden'), dotDisplay: getComputedStyle(document.getElementById('dot')).display, pressed: document.querySelector('[data-motion-toggle]').getAttribute('aria-pressed') }));
  check('motion toggle disables the dot and animations', red.motion === 'reduced' && red.dotHidden && red.dotDisplay === 'none' && red.pressed === 'true', JSON.stringify(red));
  await ctx.close();
}

/* 4. contact form: validation, success with mocked webhook, dot lands in the D, tap() */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
  await ctx.addInitScript(() => sessionStorage.setItem('idone-intro', 'seen'));
  const page = await ctx.newPage();
  let posted = null;
  await page.route('https://n8n.idone.co.il/webhook/website-form', async (route) => { posted = route.request().postDataJSON(); await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await page.goto(`${base}/he/contact/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.click('#contact-form [data-submit]'); await page.waitForTimeout(200);
  const invalid = await page.evaluate(() => document.querySelectorAll('#contact-form [data-invalid="true"]').length);
  check('empty submit shows validation errors', invalid >= 3, `${invalid} fields`);
  await page.fill('#contact-form-name', 'בדיקה'); await page.fill('#contact-form-phone', '0501234567'); await page.fill('#contact-form-email', 'test@example.com');
  await page.check('#contact-form input[value="automation"]'); await page.fill('#contact-form-message', 'הודעת בדיקה');
  await shot(page, '05-form-filled');
  await page.click('#contact-form [data-submit]');
  await page.waitForTimeout(1600);
  const done = await page.evaluate(() => ({ state: document.getElementById('contact-form').dataset.state, statusTitle: document.querySelector('#contact-form [data-status-title]').textContent, landed: document.getElementById('cta-mark').classList.contains('is-landed'), accent: getComputedStyle(document.getElementById('cta-mark').shadowRoot.querySelector('.dot')).fill, doneText: !document.querySelector('[data-cta-done]').hidden }));
  await shot(page, '06-form-success');
  check('form posts JSON to the webhook', !!posted && posted.name === 'בדיקה' && Array.isArray(posted.need) && posted.locale === 'he', JSON.stringify(posted));
  check('success state: dot lands in the D, mark shows its dot, "סגרנו" appears', done.state === 'success' && done.statusTitle.includes('קיבלנו') && done.landed && done.accent === 'rgb(47, 91, 255)' && done.doneText, JSON.stringify(done));
  // error path
  await page.unroute('https://n8n.idone.co.il/webhook/website-form');
  await page.route('https://n8n.idone.co.il/webhook/website-form', (route) => route.fulfill({ status: 500, body: 'nope' }));
  await page.goto(`${base}/en/contact/`, { waitUntil: 'networkidle' });
  await page.fill('#contact-form-name', 'Test'); await page.fill('#contact-form-phone', '+972501234567'); await page.fill('#contact-form-email', 'test@example.com');
  await page.click('#contact-form [data-submit]'); await page.waitForTimeout(800);
  const err = await page.evaluate(() => ({ state: document.getElementById('contact-form').dataset.state, title: document.querySelector('#contact-form [data-status-title]').textContent, formVisible: !document.getElementById('contact-form').classList.contains('is-done') }));
  await shot(page, '07-form-error');
  check('error state keeps the form and offers WhatsApp', err.state === 'error' && err.title.includes('wrong') && err.formVisible, JSON.stringify(err));
  await ctx.close();
}

/* 5. no JavaScript: content, static logo fallback, no dot */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false, locale: 'he-IL' });
  const page = await ctx.newPage();
  await page.goto(`${base}/he/`); await page.waitForTimeout(800);
  const nojs = await page.evaluate(() => ({ cls: document.documentElement.className, fallbackVisible: getComputedStyle(document.querySelector('#hero-logo .logo-fallback img')).display !== 'none', fallbackSrc: document.querySelector('#hero-logo .logo-fallback img').getAttribute('src'), dot: getComputedStyle(document.getElementById('dot')).display, h2s: document.querySelectorAll('main h2').length, textLen: document.body.innerText.length }));
  await shot(page, '08-no-js');
  await page.evaluate(() => document.getElementById('scene-automation').scrollIntoView()); await shot(page, '09-no-js-automation');
  check('no-JS: animated SVG fallback, no dot, all content present', nojs.cls === 'no-js' && nojs.fallbackVisible && nojs.fallbackSrc.includes('intro.svg') && nojs.dot === 'none' && nojs.h2s >= 8 && nojs.textLen > 1500, JSON.stringify(nojs));
  await ctx.close();
}

/* 6. prefers-reduced-motion */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', locale: 'en-US' });
  const page = await ctx.newPage();
  await page.goto(`${base}/en/`, { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  const rm = await page.evaluate(() => ({ dotHidden: document.documentElement.classList.contains('dot-hidden'), running: document.documentElement.classList.contains('intro-running'), dash: document.getElementById('hero-logo').shadowRoot.querySelector('.trace').getAttribute('stroke-dasharray'), pins: document.querySelectorAll('.pin-spacer').length, copy: getComputedStyle(document.querySelector('[data-hero-copy] h1')).opacity }));
  await page.evaluate(() => document.getElementById('scene-automation').scrollIntoView()); await page.waitForTimeout(300); await shot(page, '10-reduced-motion-automation');
  check('reduced motion: no dot, no pinning, logo final frame, copy visible', rm.dotHidden && !rm.running && rm.dash.startsWith('100') && rm.pins === 0 && rm.copy === '1', JSON.stringify(rm));
  await ctx.close();
}

/* 7. mobile menu + services submenu */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'he-IL' });
  await ctx.addInitScript(() => sessionStorage.setItem('idone-intro', 'seen'));
  const page = await ctx.newPage();
  await page.goto(`${base}/he/`, { waitUntil: 'networkidle' });
  await page.click('[data-menu-toggle]'); await page.waitForTimeout(400);
  await page.click('[data-services-menu] summary'); await page.waitForTimeout(200);
  const m = await page.evaluate(() => ({ open: document.getElementById('site-header').hasAttribute('data-open'), expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'), navVisible: getComputedStyle(document.getElementById('site-nav')).visibility, sub: document.querySelector('[data-services-menu]').open }));
  await shot(page, '11-mobile-menu');
  check('mobile menu opens with services submenu', m.open && m.expanded === 'true' && m.navVisible === 'visible' && m.sub, JSON.stringify(m));
  await ctx.close();
}

/* 8. head code, manifest, og image, structured data */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${base}/en/`);
  const head = await page.evaluate(() => ({
    icons: Array.from(document.querySelectorAll('link[rel=icon]')).map((l) => l.getAttribute('href')),
    manifest: document.querySelector('link[rel=manifest]')?.getAttribute('href'),
    og: document.querySelector('meta[property="og:image"]')?.content,
    tokens: !!document.querySelector('link[href="/brand/tokens/tokens.css"]'),
    ld: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).map((x) => x['@type']),
    title: document.title, desc: document.querySelector('meta[name=description]')?.content.length,
  }));
  const codes = {};
  for (const u of ['/brand/favicon/favicon.ico', '/brand/favicon/favicon.svg', '/brand/favicon/site.webmanifest', '/brand/png/og-image.png', '/brand/animation/idone-logo.js', '/sitemap-index.xml', '/robots.txt']) {
    const r = await page.request.get(base + u); codes[u] = r.status();
  }
  check('brand head code + files resolve', head.icons.length === 2 && head.manifest === '/brand/favicon/site.webmanifest' && head.og.endsWith('/brand/png/og-image.png') && head.tokens && head.ld.includes('ProfessionalService') && Object.entries(codes).filter(([u]) => u !== '/robots.txt').every(([, c]) => c === 200), JSON.stringify({ head, codes }));
  await ctx.close();
}

/* 9. root redirect: Hebrew by default, no browser-language redirect, no suggestion bar */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  await ctx.addInitScript(() => sessionStorage.setItem('idone-intro', 'seen'));
  const page = await ctx.newPage();
  await page.goto(`${base}/`); await page.waitForTimeout(800);
  const st = await page.evaluate(() => ({ url: location.pathname, lang: document.documentElement.lang, bar: !!document.getElementById('lang-suggest') }));
  check('root goes to Hebrew even for an English browser, no suggestion bar', st.url === '/he/' && st.lang === 'he' && !st.bar, JSON.stringify(st));
  // menu state survives a client-side navigation: html keeps .js, nav stays closed
  await page.goto(`${base}/he/about/`, { waitUntil: 'networkidle' });
  await page.click('#site-nav a[href="/he/contact/"]'); await page.waitForTimeout(900);
  const nav = await page.evaluate(() => ({ js: document.documentElement.classList.contains('js'), open: document.getElementById('site-header').hasAttribute('data-open'), path: location.pathname }));
  check('after a page transition html keeps .js and the menu is closed', nav.js && !nav.open && nav.path === '/he/contact/', JSON.stringify(nav));
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, '_results.json'), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
