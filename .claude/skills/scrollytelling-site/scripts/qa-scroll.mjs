#!/usr/bin/env node
/**
 * Scroll QA for scrollytelling pages (Playwright, preinstalled chromium).
 * Usage: node qa-scroll.mjs <url-or-file> [outDir]
 *   file path:  node qa-scroll.mjs /abs/path/index.html /tmp/qa
 * Produces screenshots at ~12 scroll stops (desktop), a mobile pass, a no-JS pass and
 * a reduced-motion pass, and prints console errors, failed requests and horizontal overflow.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const target = process.argv[2];
if (!target) { console.error('usage: qa-scroll.mjs <url|file> [outDir]'); process.exit(1); }
const url = /^https?:|^file:/.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const out = path.resolve(process.argv[3] || 'qa-shots');
mkdirSync(out, { recursive: true });

const problems = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function pass(name, ctxOpts, { stops = 12, js = true } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1, javaScriptEnabled: js, ...ctxOpts });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`[${name}] console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${name}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`[${name}] request failed: ${r.url()}`));
  await page.goto(url, { waitUntil: 'load' });
  await wait(2500); // let intro/fonts settle
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow > 1) problems.push(`[${name}] horizontal overflow: ${overflow}px`);
  for (let i = 0; i <= stops; i++) {
    const y = Math.round((total * i) / stops);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await wait(js ? 900 : 150); // scrubbed timelines + dot leaps need time to settle
    await page.screenshot({ path: path.join(out, `${name}-${String(i).padStart(2, '0')}.png`) });
  }
  console.log(`${name}: height=${total + (await page.evaluate(() => innerHeight))}px, screenshots=${stops + 1}`);
  await browser.close();
}

await pass('desktop', { viewport: { width: 1440, height: 900 } });
await pass('mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, { stops: 10 });
await pass('reduced', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, { stops: 6 });
await pass('nojs', { viewport: { width: 1440, height: 900 } }, { stops: 6, js: false });

console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n- ` + [...new Set(problems)].join('\n- ') : '\nNo console errors, failed requests or overflow detected.');
console.log(`\nScreenshots: ${out}\nLook at them: through-line never stranded, pins release cleanly, no overlapping text, RTL mirrored, dark theme legible.`);
