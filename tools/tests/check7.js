const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const S = process.argv[2], G = S + '/gen';
  fs.copyFileSync(G + '/downloads/cisco-solutions-generator.html', G + '/_wrap.html');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1320, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + G + '/_wrap.html#compose'); await p.waitForTimeout(600);
  const get = () => p.evaluate(() => document.getElementById('prompt').textContent);
  for (const k of ['A', 'B']) {
    await p.click(`.preset-opt:has(input[value="${k}"])`); await p.waitForTimeout(150);
    const t = await get(); const sk = t.slice(t.indexOf('## Skills for the visuals'), t.indexOf('## Skills for the visuals') + 300);
    console.log(k, 'one-shot skills:', JSON.stringify(sk.split('\n').slice(0, 4)), 'no-stop', t.includes('do not stop and do not ask'));
  }
  await p.locator('[data-guard="oneshot"]').uncheck(); await p.waitForTimeout(150);
  let t = await get();
  console.log('guided B head:', JSON.stringify(t.slice(0, 1400)));
  console.log('stops for skill', t.includes('stop before you build anything'), 'script', t.includes('the talk script'), 'end', t.trim().split('\n').slice(-1));
  await p.click(`.preset-opt:has(input[value="D"])`); await p.waitForTimeout(150);
  t = await get(); console.log('D script', t.includes('the mission script'), 'skills D:', (t.match(/- `[a-z0-9-]+` \(\w+\)/g) || []));
  await p.fill('#skillAdd', 'frontend-design'); await p.click('#skillAddBtn'); await p.waitForTimeout(150);
  t = await get(); console.log('custom skill', t.includes('`frontend-design` (recommended)'));
  await p.locator('[data-skill-use="cisco-branded"]').uncheck(); await p.waitForTimeout(150);
  t = await get(); console.log('branded removed', !t.includes('`cisco-branded`'));
  await p.evaluate(() => document.getElementById('skillsList').scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: S + '/g5-skills.png' });
  console.log('errors', errs);
  await b.close();
})();
