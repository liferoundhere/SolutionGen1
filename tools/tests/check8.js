const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const S = process.argv[2], G = S + '/gen';
  fs.copyFileSync(G + '/downloads/cisco-solutions-generator.html', G + '/_wrap.html');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1320, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + G + '/_wrap.html#compose'); await p.waitForTimeout(600);
  const block = async () => { const t = await p.evaluate(() => document.getElementById('prompt').textContent); const i = t.indexOf('**Create a masterpiece.**'); return t.slice(i, t.indexOf('\n\n', i)); };
  console.log('DEFAULT:\n' + await block());
  await p.fill('#mpExamples', 'https://rosy-beacon-q5c8.here.now/ for the globe and mission flow'); await p.waitForTimeout(100);
  console.log('\nWITH EXAMPLES:\n' + await block());
  await p.check('#mpBar'); await p.waitForTimeout(100);
  const t = await block(); console.log('\nWITH BAR: lines', t.split('\n').length, 'has slop list', t.includes('AI slop to avoid'));
  await p.locator('[data-guard="master"]').uncheck(); await p.waitForTimeout(100);
  console.log('options hidden when off', await p.evaluate(() => document.getElementById('mpOpts').hidden));
  const all = await p.evaluate(() => document.getElementById('prompt').textContent); console.log('rubric anywhere', /rubric/i.test(all));
  console.log('errors', errs); await b.close();
})();
