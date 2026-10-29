const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const S = process.argv[2], G = S + '/gen';
  fs.copyFileSync(G + '/downloads/cisco-solutions-generator.html', G + '/_wrap.html');
  const b = await chromium.launch();
  for (const [w, h] of [[1320, 900], [400, 860]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/fonts\.g/.test(m.text()) && errs.push(m.text()));
    await p.goto('file://' + G + '/_wrap.html#compose'); await p.waitForTimeout(600);
    const mics = await p.evaluate(() => ({ fields: document.querySelectorAll('#f input[type=text], #f textarea').length, mics: document.querySelectorAll('#f .mic.ready').length }));
    console.log(w, 'inputs', JSON.stringify(mics), 'sw', await p.evaluate(() => document.documentElement.scrollWidth));
    await p.locator('#f .mic').first().click(); await p.waitForTimeout(5000);
    console.log('help shown', await p.evaluate(() => !document.getElementById('micHelp').hidden), await p.textContent('#micHelpWhy'));
    if (w > 1000) await p.screenshot({ path: S + '/g3-compose.png' });
    if (await p.isVisible('#micHelpClose')) await p.click('#micHelpClose');
    // questionnaire by typing
    await p.click('#qaOpen'); await p.waitForTimeout(300);
    await p.click('[data-qtype="C"]'); await p.click('#qaNext'); await p.waitForTimeout(300);
    await p.fill('#qaAns', 'Northwind Power test customer'); await p.click('#qaNext'); await p.waitForTimeout(200);
    if (w > 1000) await p.screenshot({ path: S + '/g3-qa.png' });
    const steps = await p.evaluate(() => qa.steps.length);
    for (let i = 0; i < steps; i++) { const isRev = await p.evaluate(() => qa.steps[qa.i].kind === 'review'); if (isRev) break; await p.click('#qaNext'); await p.waitForTimeout(80); }
    if (w > 1000) await p.screenshot({ path: S + '/g3-review.png' });
    await p.click('#qaNext'); await p.waitForTimeout(300);
    const res = await p.evaluate(() => ({ type: state.type, first: document.querySelector('#f [data-key]').value, inPrompt: document.getElementById('prompt').textContent.includes('Northwind Power test customer'), qaHidden: document.getElementById('qa').hidden }));
    console.log('qa result', JSON.stringify(res));
    console.log('errors', errs.slice(0, 5));
  }
  await b.close();
})();
