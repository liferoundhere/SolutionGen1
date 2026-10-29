// Headless review of a bundled deck page: wraps it in the publish skeleton, jumps to each scene, screenshots.
// Usage: node shoot.mjs <page.html> <outDir> [width] [height] [waitMs] [narrated]
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs'; import path from 'node:path';
const [page, outDir, w = 1440, h = 900, wait = 6500] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const wrapped = path.join(outDir, '_wrapped.html');
fs.writeFileSync(wrapped, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${fs.readFileSync(page, 'utf8')}</body></html>`);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
await p.goto('file://' + path.resolve(wrapped)); await p.waitForTimeout(3000);
const n = await p.evaluate(() => window.__stage ? (document.querySelectorAll('#dots > *').length) : -1);
console.log('scenes', n);
for (let i = 0; i < Math.max(n, 1); i++) {
  await p.evaluate(i => window.__stage && window.__stage.jump(i, 0), i);
  await p.waitForTimeout(+wait);
  await p.screenshot({ path: path.join(outDir, `scene-${String(i).padStart(2, '0')}.png`) });
}
const sw = await p.evaluate(() => document.documentElement.scrollWidth);
console.log('scrollWidth', sw, 'errors', JSON.stringify(errs.slice(0, 10)));
await b.close();
