// node render.js <in.svg|html> <out.png> <w> <h>
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [inp, out, w, h] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0">${fs.readFileSync(inp, 'utf8')}</body></html>`);
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: +w, height: +h } }); await b.close();
})();
