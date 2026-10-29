// Headless review: screenshots every scene (or a list) and reports console errors.
// Usage: node tools/review.mjs [baseUrl] [width] [height] [list like "0/0,3/2"]
// Needs puppeteer-core and Chrome. Set CHROME=/path/to/chrome if it is not at the default.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const [, , base = 'http://localhost:8765/', w = '1440', h = '900', list = 'all'] = process.argv;
const out = 'tmp/review'; mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
await page.goto(base, { waitUntil: 'networkidle0' });
await sleep(2500);
await page.evaluate(() => document.querySelector('.film-gate')?.setAttribute('hidden', ''));
const n = await page.evaluate(() => document.querySelectorAll('#dots .dot').length);
const targets = list === 'all' ? [...Array(n).keys()].map((i) => [i, 0]) : list.split(',').map((s) => s.split('/').map(Number));
for (const [i, s] of targets) {
  // jump is instant; headless WebGL is slow, so give scenes time to settle.
  await page.evaluate((i, s) => window.__stage.jump(i, s), i, s || 0);
  await sleep(6000);
  await page.screenshot({ path: `${out}/s${String(i).padStart(2, '0')}_${s || 0}_${w}.png` });
}
console.log(errs.join('\n') || 'no console errors', `\nshots in ${out}/`);
await browser.close();
