// Renders the logo animation to a PNG frame sequence (transparent or on a colour),
// then optionally encodes MP4 / ProRes 4444 / WebM with ffmpeg.
//
//   npm i -D playwright && npx playwright install chromium
//   node brand/animation/export/render.mjs --layout horizontal --theme dark --bg "#0E1A2B" --out exports/intro-dark
//
// Options
//   --layout     mark | horizontal | stacked     (horizontal)
//   --theme      light | dark | mono-black | mono-white   (light)
//   --timeline   intro | loop                    (intro)
//   --bg         transparent | #hex              (transparent)
//   --width/--height  frame size in px           (1920 / 1080)
//   --logo       logo width as share of frame width (0.42; mark/stacked use height share 0.34)
//   --fps        (60)   --hold  ms to hold the final frame (1100)   --lead ms empty before start (300)
//   --encode     mp4,mov,prores,webm (comma list; needs ffmpeg on PATH)
//                mov = QuickTime with PNG codec: lossless + alpha, small for flat graphics (Premiere, Resolve, After Effects)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const animDir = path.resolve(here, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const o = {
  layout: arg('layout', 'horizontal'), theme: arg('theme', 'light'), timeline: arg('timeline', 'intro'),
  bg: arg('bg', 'transparent'), W: +arg('width', 1920), H: +arg('height', 1080),
  logo: +arg('logo', 0), fps: +arg('fps', 60), hold: +arg('hold', 1100), lead: +arg('lead', 300),
  out: path.resolve(arg('out', 'exports/logo')), encode: (arg('encode', '') || '').split(',').filter(Boolean),
};
fs.mkdirSync(path.join(o.out, 'frames'), { recursive: true });

const server = http.createServer((req, res) => {
  const f = path.join(animDir, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(animDir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: o.W, height: o.H } });
await page.goto(`http://localhost:${port}/idone-logo.js`); // same origin for the module import
await page.setContent(`<html><body style="margin:0;background:${o.bg === 'transparent' ? 'transparent' : o.bg}">
  <div id="s" style="width:${o.W}px;height:${o.H}px;display:grid;place-items:center"></div></body></html>`);
const meta = await page.evaluate(async ({ port, o }) => {
  const m = await import(`http://localhost:${port}/idone-logo.js`);
  window.M = m;
  const s = document.getElementById('s');
  s.innerHTML = m.markup(o.layout);
  const svg = s.querySelector('svg');
  const th = o.theme === 'dark' ? m.DATA.palette.dark : o.theme === 'mono-black' ? { ink: '#000', accent: '#000' }
    : o.theme === 'mono-white' ? { ink: '#fff', accent: '#fff' } : m.DATA.palette.light;
  const st = document.createElement('style');
  st.textContent = `.ink{fill:${th.ink}}.accent{fill:${th.accent}}svg{overflow:visible}`;
  document.head.append(st);
  const vb = svg.viewBox.baseVal;
  const share = o.logo || (o.layout === 'horizontal' ? 0.42 : 0.34);
  if (o.layout === 'horizontal') svg.style.width = o.W * share + 'px';
  else svg.style.height = o.H * share + 'px';
  return { dur: m.TIMELINES[o.timeline].duration };
}, { port, o });

const total = o.lead + meta.dur + (o.timeline === 'loop' ? 0 : o.hold);
const n = Math.round(total / 1000 * o.fps);
for (let i = 0; i < n; i++) {
  const t = i * 1000 / o.fps - o.lead;
  await page.evaluate(({ t, tl, dur }) => {
    const svg = document.querySelector('svg');
    window.M.apply(svg, window.M.frame(tl, Math.max(0, Math.min(t, dur))));
    svg.style.visibility = t < 0 && tl === 'intro' ? 'hidden' : 'visible';
  }, { t, tl: o.timeline, dur: meta.dur });
  await page.screenshot({ path: path.join(o.out, 'frames', `f${String(i).padStart(4, '0')}.png`), omitBackground: o.bg === 'transparent' });
}
await browser.close(); server.close();
console.log(`${n} frames → ${o.out}/frames`);

const seq = path.join(o.out, 'frames', 'f%04d.png');
const run = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(o.fps), '-i', seq, ...args], { stdio: 'inherit' });
if (o.encode.includes('mp4')) run(['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(o.out, 'logo.mp4')]);
if (o.encode.includes('mov')) run(['-c:v', 'png', '-pix_fmt', 'rgba', path.join(o.out, 'logo-alpha.mov')]);
if (o.encode.includes('prores')) run(['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', path.join(o.out, 'logo-alpha.mov')]);
if (o.encode.includes('webm')) run(['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', '-row-mt', '1', path.join(o.out, 'logo-alpha.webm')]);
