const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const S = process.argv[2], G = S + '/gen';
  fs.writeFileSync(G + '/_wrap.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(S + '/cisco-generator.html', 'utf8') + '</body></html>');
  const b = await chromium.launch();
  for (const [w, h] of [[1320, 900], [400, 860]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/fonts\.g/.test(m.text()) && errs.push(m.text()));
    for (const v of ['gallery', 'compose', 'install', 'design']) {
      await p.goto('file://' + G + '/_wrap.html#' + v); await p.waitForTimeout(500);
      if (w > 1000) await p.screenshot({ path: `${S}/g2-${v}.png` });
      console.log(w, v, 'sw', await p.evaluate(() => document.documentElement.scrollWidth));
    }
    if (w > 1000) {
      await p.goto('file://' + G + '/_wrap.html#compose'); await p.waitForTimeout(400);
      for (const k of ['A', 'B', 'C', 'D']) {
        await p.click(`.preset-opt:has(input[value="${k}"])`); await p.waitForTimeout(200);
        const r = await p.evaluate(() => ({ words: document.getElementById('meter').textContent, miss: document.getElementById('missing').textContent, left: (document.getElementById('prompt').textContent.match(/\{\{[A-Z_]+\}\}/g) || []).length, els: document.getElementById('elCount').textContent }));
        console.log(k, JSON.stringify(r));
      }
      await p.click('.preset-opt:has(input[value="A"])');
      await p.locator('#ownEls input').first().uncheck();
      await p.click('details.more summary'); await p.locator('#otherEls input').first().check();
      const t = await p.evaluate(() => document.getElementById('prompt').textContent);
      console.log('leave-out', t.includes('## Leave these out'), 'also', t.includes('## Also include'), 'way', t.includes('## Way of working'));
      await p.screenshot({ path: `${S}/g2-compose-A.png` });
    }
    console.log('errors', errs.slice(0, 5));
  }
  await b.close();
})();
