const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const S = process.argv[2], G = S + '/gen';
  fs.copyFileSync(G + '/downloads/cisco-solutions-generator.html', G + '/_wrap.html');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1320, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + G + '/_wrap.html#compose'); await p.waitForTimeout(600);
  const bad = /(wait for (my )?approval|for approval|ask me|send me a .*plan|before writing code)/i;
  for (const k of ['A', 'B', 'C', 'D']) {
    await p.click(`.preset-opt:has(input[value="${k}"])`); await p.waitForTimeout(150);
    const t = await p.evaluate(() => document.getElementById('prompt').textContent);
    const hits = t.split('\n').filter(l => bad.test(l) && !/Do not (present|ask)|not as a question|Do not ask me anything/.test(l));
    console.log(k, 'starts', JSON.stringify(t.slice(0, 40)), 'reminder', t.includes('## Start now'), 'conflicts', hits.length, hits.slice(0, 3));
  }
  await p.click('#grGuide'); await p.waitForTimeout(150);
  let t = await p.evaluate(() => document.getElementById('prompt').textContent);
  console.log('guide mode', t.slice(0, 60).replace(/\n/g, ' | '), 'reminder', t.includes('## Start now'), 'summary', await p.textContent('#grSummary'));
  await p.click('#grBuild'); await p.locator('[data-guard="noq"]').uncheck(); await p.waitForTimeout(150);
  t = await p.evaluate(() => document.getElementById('prompt').textContent);
  console.log('mixed', t.includes('**Ask what you need.**'), t.includes('**One shot.**'), await p.textContent('#grSummary'));
  await p.click('#grBuild'); await p.waitForTimeout(100);
  await p.evaluate(() => document.getElementById('guards').scrollIntoView());
  await p.screenshot({ path: S + '/g4-guards.png' });
  console.log('errors', errs);
  await b.close();
})();
