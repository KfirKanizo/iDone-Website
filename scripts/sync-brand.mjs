// Copies the brand kit (source of truth: /brand) into /public/brand so the
// paths from brand/README.md (/brand/...) work unchanged on the site.
// Videos that browsers cannot play (PNG-in-MOV) are skipped to keep the build small.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'brand');
const dst = path.join(root, 'public', 'brand');
const SKIP = new Set(['.mov']); // editing-only formats, not web-playable
const SKIP_DIRS = new Set(['export']); // render.mjs + playwright tooling stays out of the bundle

function copy(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const f = path.join(from, entry.name), t = path.join(to, entry.name);
    if (entry.isDirectory()) { if (SKIP_DIRS.has(entry.name)) continue; fs.mkdirSync(t, { recursive: true }); copy(f, t); continue; }
    if (SKIP.has(path.extname(entry.name).toLowerCase())) continue;
    if (entry.name === 'demo.html') continue;
    const s = fs.statSync(f);
    if (fs.existsSync(t) && fs.statSync(t).mtimeMs >= s.mtimeMs && fs.statSync(t).size === s.size) continue;
    fs.copyFileSync(f, t);
  }
}
fs.mkdirSync(dst, { recursive: true });
copy(src, dst);
console.log('brand kit synced → public/brand');
