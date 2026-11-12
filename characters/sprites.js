// Renders each cast member to transparent PNG sprites for the 3D film: expressions x mouth (closed/open) x view.
// usage: node sprites.js <outDir> [ids,comma] [exprs,comma]
const { chromium } = require('playwright'); const fs = require('fs');
const { character, DEFS } = require('./chars'); const { ROME } = require('./rome_cast');
const out = process.argv[2] || 'sprites'; fs.mkdirSync(out, { recursive: true });
const ids = process.argv[3] ? process.argv[3].split(',') : Object.keys(ROME);
const exprs = process.argv[4] ? process.argv[4].split(',') : ['neutral', 'happy', 'angry', 'shocked', 'confused', 'smug', 'bored'];
const views = [['f', 0], ['q', 0.5], ['s', 1]];
const VB = [-170, -360, 340, 380], PX = 2.2;   // viewBox: x, y, w, h (feet at 0,0)
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: Math.round(VB[2] * PX), height: Math.round(VB[3] * PX) } });
  let n = 0;
  for (const k of ids) for (const e of exprs) for (const [vn, v] of views) for (const mo of [0, 1]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${VB[2] * PX}" height="${VB[3] * PX}" viewBox="${VB.join(' ')}">${DEFS}${character(ROME[k], { x: 0, y: 0, scale: 1, view: v, expr: e, mouthOpen: mo })}</svg>`;
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await p.screenshot({ path: `${out}/${k}_${e}_${vn}_${mo}.png`, omitBackground: true }); n++;
  }
  fs.writeFileSync(`${out}/meta.json`, JSON.stringify({ viewBox: VB, px: PX, feetPx: [-VB[0] * PX, -VB[1] * PX], unitsPerMetre: 233 / 1.65 }));
  console.log('sprites', n); await b.close();
})();
