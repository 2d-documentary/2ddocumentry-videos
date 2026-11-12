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
  // the elephant (Hannibal's war elephant): same ink and flat colour, drawn once per view
  const { cel, ell, circ, line } = require('./chars');
  for (const [vn, flipE] of [['f', 1], ['q', 1]]) {
    const E = `<g transform="translate(-50,0) scale(${flipE * 1.0},1.0)" filter="url(#wob)">` +
      cel('M-260,-120 C-280,-300 -60,-360 80,-330 C220,-310 260,-200 250,-120 Z', '#8E8A86') +
      [[-210, -140], [-120, -140], [90, -140], [180, -140]].map(([x, y]) => cel(`M${x},${y} h56 v140 h-56z`, '#86827e')).join('') +
      cel('M200,-300 C320,-330 360,-240 330,-170 C320,-120 300,-60 320,-10 L290,-6 C266,-70 280,-140 250,-180Z', '#8E8A86') +
      cel('M210,-290 C170,-300 150,-220 190,-200 C220,-190 230,-240 210,-290Z', '#7a7672') +
      cel('M300,-190 q50,10 60,-30 q-36,30 -60,14z', '#F4F1E8') + `<circle cx="300" cy="-262" r="7" fill="#1E1A1C"/>` +
      cel('M-40,-350 h150 v40 h-150z', '#9B2226') + cel('M-30,-420 h120 v70 h-120z', '#7a4a28') + '</g>';
    const EV = [-450, -580, 900, 600], EP = 1.4;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${EV[2] * EP}" height="${EV[3] * EP}" viewBox="${EV.join(' ')}">${DEFS}${E}</svg>`;
    await p.setViewportSize({ width: Math.round(EV[2] * EP), height: Math.round(EV[3] * EP) });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    for (const e of exprs) for (const mo of [0, 1]) await p.screenshot({ path: `${out}/elephant_${e}_${vn}_${mo}.png`, omitBackground: true });
    await p.setViewportSize({ width: Math.round(VB[2] * PX), height: Math.round(VB[3] * PX) });
  }
  fs.writeFileSync(`${out}/meta.json`, JSON.stringify({ viewBox: VB, px: PX, unitsPerMetre: 233 / 1.65, special: { elephant: { viewBox: [-450, -580, 900, 600] } } }));
  console.log('sprites', n); await b.close();
})();
