// node sheets.js -> rome_lineup.svg, rome_model.svg
const { character, DEFS, INK } = require('./chars');
const { ROME } = require('./rome_cast');
const fs = require('fs');
const T = (x, y, s, txt, o = '') => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-size="${s}" fill="${INK}" ${o}>${txt}</text>`;
// ---------- line-up
{
  const keys = Object.keys(ROME), W = 2700, cols = 6, cw = (W - 120) / cols, rowY = [640, 1220, 1800], H = 2020;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${DEFS}<rect width="${W}" height="${H}" fill="#F3EBDD"/>`;
  s += T(60, 86, 54, 'THE ROMAN EMPIRE · Cast line-up', 'font-family="DejaVu Serif" font-weight="bold"') + T(60, 130, 24, 'Model sheet v1 · front view, neutral pose · same flat 2D system as the Pirates cast', 'fill="#6b5f55"');
  keys.forEach((k, i) => {
    const c = ROME[k], cx = 60 + cw * (i % cols) + cw / 2, y = rowY[Math.floor(i / cols)], sc = k === 'augustulus' ? 1.25 : 1.45;
    s += `<ellipse cx="${cx}" cy="${y + 4}" rx="90" ry="12" fill="${INK}" opacity=".08"/>` + character(c, { x: cx, y, scale: sc });
    s += T(cx, y + 50, 25, c.name, 'text-anchor="middle" font-weight="bold"') + T(cx, y + 80, 18, `${c.id} · ${c.role}`, 'text-anchor="middle" fill="#6b5f55"');
  });
  fs.writeFileSync('rome_lineup.svg', s + '</svg>');
}
// ---------- model sheet: turnaround + expressions for the recurring speakers
{
  const who = ['citizen', 'citizen2', 'senator', 'general', 'caesar'];
  const exprs = [['neutral', 'NEUTRAL'], ['happy', 'HAPPY'], ['angry', 'ANGRY'], ['shocked', 'SHOCKED'], ['confused', 'CONFUSED']];
  const W = 2700, RH = 540, H = 200 + RH * who.length;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${DEFS}<rect width="${W}" height="${H}" fill="#F3EBDD"/>`;
  s += T(60, 86, 54, 'Model sheet · turnaround and expressions', 'font-family="DejaVu Serif" font-weight="bold"') + T(60, 130, 24, 'Recurring speakers of the Roman documentary. Every scene pulls from these drawings.', 'fill="#6b5f55"');
  who.forEach((k, r) => {
    const c = ROME[k], y0 = 200 + r * RH, base = y0 + 450;
    s += `<rect x="40" y="${y0 + 10}" width="${W - 80}" height="${RH - 30}" rx="18" fill="#FBF6EC" stroke="#d8ccb8" stroke-width="2"/>`;
    s += T(70, y0 + 58, 30, `${c.id} · ${c.name}`, 'font-weight="bold"') + T(70 + (c.id.length + c.name.length + 3) * 19 + 16, y0 + 58, 22, c.role, 'fill="#6b5f55"');
    [0, 0.5, 1].forEach((v, i) => { const x = 210 + i * 300; s += `<ellipse cx="${x}" cy="${base + 4}" rx="80" ry="10" fill="${INK}" opacity=".08"/>` + character(c, { x, y: base, scale: 1.3, view: v, expr: 'neutral' }) + T(x, base + 44, 18, ['FRONT', '3/4', 'SIDE'][i], 'text-anchor="middle" fill="#6b5f55"'); });
    s += `<line x1="1080" y1="${y0 + 40}" x2="1080" y2="${y0 + RH - 50}" stroke="#d8ccb8" stroke-width="2"/>`;
    exprs.forEach(([e, label], i) => {
      const x = 1230 + i * 300, id = `cl${r}${i}`;
      s += `<clipPath id="${id}"><rect x="${x - 135}" y="${y0 + 40}" width="270" height="390" rx="14"/></clipPath><rect x="${x - 135}" y="${y0 + 40}" width="270" height="390" rx="14" fill="#F1E8D8"/>`;
      s += `<g clip-path="url(#${id})">${character(c, { x, y: y0 + 660, scale: 2.0, view: 0, expr: e })}</g>` + T(x, base + 44, 18, label, 'text-anchor="middle" fill="#6b5f55"');
    });
  });
  fs.writeFileSync('rome_model.svg', s + '</svg>');
}
