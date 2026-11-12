// bg.js — inked, painted, detailed backgrounds (real architecture, real map data)
// All scenes draw in 1920×1080 space. Ink colour matches the characters.
'use strict';
const BINK = '#2A2220';

// ---------- texture helpers ----------
let _paper = null;
function paperTex() { // soft watercolour blotches (used at low alpha inside clips)
  if (_paper) return _paper; const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'); const r = rng(11);
  for (let i = 0; i < 260; i++) { const x = r() * 1024, y = r() * 1024, rad = 20 + r() * 110; const gr = g.createRadialGradient(x, y, 0, x, y, rad); const v = r() > .5 ? 255 : 0; gr.addColorStop(0, `rgba(${v},${v},${v},${.05 + r() * .07})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  _paper = c; return c;
}
function wash(ctx, alpha = .6, mode = 'soft-light') { ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = mode; const p = paperTex(); for (let x = -200; x < 2200; x += 1024) for (let y = -200; y < 1400; y += 1024) ctx.drawImage(p, x, y); ctx.restore(); }
function inkStroke(ctx, w = 3, col = BINK) { ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function poly(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
function vgrad(ctx, y0, y1, c0, c1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
function hgrad(ctx, x0, x1, c0, c1, mid) { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, c0); if (mid) g.addColorStop(.35, mid); g.addColorStop(1, c1); return g; }

// masonry: rows of blocks inside the current clip, each block slightly tinted, mortar inked
function masonry(ctx, x0, y0, x1, y1, o = {}) {
  const bh = o.bh || 26, base = o.base || '#D9C9A8', r = rng(o.seed || 3), lw = o.lw || 1.6;
  for (let y = y0, row = 0; y < y1; y += bh, row++) {
    let x = x0 - (row % 2 ? (o.bw || 60) * .5 : 0);
    while (x < x1) { const w = (o.bw || 60) * (.75 + r() * .6); const tint = .9 + r() * .16;
      ctx.fillStyle = shade(base, tint); ctx.fillRect(x, y, w, bh);
      if (r() < .25) { ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.fillRect(x + w * .1, y + bh * .55, w * .8, bh * .35); }
      ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + (r() - .5) * 1.5, y + bh); inkStroke(ctx, lw * .8, o.mortar || shade(base, .55));
      x += w; }
    ctx.beginPath(); ctx.moveTo(x0, y + bh); for (let xx = x0; xx < x1; xx += 40) ctx.lineTo(xx, y + bh + (r() - .5) * 1.4); inkStroke(ctx, lw, o.mortar || shade(base, .55));
  }
}
// terracotta roof tiles (coppi) in rows, inside the current clip
function roofTiles(ctx, x0, y0, x1, y1, base = '#B5523A', seed = 2) {
  const r = rng(seed); ctx.fillStyle = base; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0; y < y1; y += 18) for (let x = x0 + ((y / 18) % 2) * 13; x < x1; x += 26) {
    ctx.beginPath(); ctx.ellipse(x, y + 9, 12, 10, 0, Math.PI, 0); ctx.fillStyle = shade(base, .9 + r() * .2); ctx.fill(); ctx.strokeStyle = shade(base, .55); ctx.lineWidth = 1.4; ctx.stroke(); }
}
function windowShutter(ctx, x, y, w, h, o = {}) {
  ctx.save();
  // opening (dark) + arched top
  poly(ctx, [[x, y + h], [x, y + w * .35], [x + w, y + w * .35], [x + w, y + h]]); ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w * .5); ctx.arc(x + w / 2, y + w * .5, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
  ctx.fillStyle = '#3B3330'; ctx.fill(); inkStroke(ctx, 2.2);
  if (o.shutters !== false) { const sc = o.col || '#6E7F5C'; for (const s of [-1, 1]) { const sx = s < 0 ? x - w * .48 : x + w * 1.02; ctx.fillStyle = sc; ctx.fillRect(sx, y + w * .2, w * .46, h - w * .2); ctx.strokeStyle = shade(sc, .6); ctx.lineWidth = 1.2; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(sx + 2, y + w * .2 + (h - w * .2) * k / 6); ctx.lineTo(sx + w * .46 - 2, y + w * .2 + (h - w * .2) * k / 6); ctx.stroke(); } ctx.beginPath(); ctx.rect(sx, y + w * .2, w * .46, h - w * .2); inkStroke(ctx, 2); } }
  // sill
  ctx.fillStyle = '#E6DCC6'; ctx.fillRect(x - 6, y + h, w + 12, 7); ctx.beginPath(); ctx.rect(x - 6, y + h, w + 12, 7); inkStroke(ctx, 1.8);
  ctx.restore();
}
function plankDoor(ctx, x, y, w, h, col = '#6A4A33') {
  ctx.save(); ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w * .5); ctx.arc(x + w / 2, y + w * .5, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
  ctx.fillStyle = hgrad(ctx, x, x + w, shade(col, 1.08), shade(col, .8)); ctx.fill(); ctx.clip();
  ctx.strokeStyle = shade(col, .55); ctx.lineWidth = 2; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x + w * k / 5, y); ctx.lineTo(x + w * k / 5, y + h); ctx.stroke(); }
  ctx.fillStyle = '#3C3A3A'; for (const yy of [.35, .75]) ctx.fillRect(x, y + h * yy, w, 5);
  ctx.restore(); ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w * .5); ctx.arc(x + w / 2, y + w * .5, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); inkStroke(ctx, 2.6);
}
function vine(ctx, x, y, len, dir = 1, seed = 1) {
  const r = rng(seed); ctx.save(); ctx.strokeStyle = '#5C4A2E'; ctx.lineWidth = 2;
  let px = x, py = y; for (let i = 0; i < len; i++) { const nx = px + dir * (6 + r() * 10), ny = py + (r() - .3) * 10; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
    for (let k = 0; k < 2; k++) { const lx = nx + (r() - .5) * 18, ly = ny + (r() - .5) * 14, lr = 6 + r() * 6; ctx.beginPath(); ctx.ellipse(lx, ly, lr, lr * .7, r() * 3, 0, 7); ctx.fillStyle = r() > .5 ? '#6E8C3E' : '#86A24A'; ctx.fill(); ctx.strokeStyle = '#3F5426'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.strokeStyle = '#5C4A2E'; ctx.lineWidth = 2; }
    px = nx; py = ny; }
  ctx.restore();
}
function painterlySky(ctx, y1, top, bot, seed = 4, clouds = true) {
  ctx.fillStyle = vgrad(ctx, 0, y1, top, bot); ctx.fillRect(-100, -100, 2120, y1 + 100);
  if (!clouds) return; const r = rng(seed);
  for (let i = 0; i < 6; i++) { const cx = r() * 1920, cy = 80 + r() * (y1 * .45), s = 90 + r() * 120;
    ctx.save(); const path = () => { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 5) * Math.PI; ctx.moveTo(cx + Math.cos(Math.PI - a) * s * 1.1 + s * .35, cy - Math.sin(a) * s * .35); ctx.arc(cx + Math.cos(Math.PI - a) * s * 1.1, cy - Math.sin(a) * s * .35, s * (.28 + .12 * Math.sin(a)), 0, 7); } ctx.rect(cx - s * 1.4, cy - 4, s * 2.8, s * .18); };
      path(); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill(); ctx.clip(); ctx.translate(s * .08, s * .12); path(); ctx.fillStyle = 'rgba(205,218,232,.85)'; ctx.fill(); ctx.restore();
    ctx.save(); path(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(120,150,180,.5)'; ctx.stroke(); ctx.restore(); }
}

// ---------- real landmark: Leaning Tower of Pisa (detailed) ----------
// reuses pisaTower() from world.js for the colonnade geometry, then adds masonry courses, weathering and ink
function pisaTowerDetailed(ctx, o) {
  pisaTower(ctx, o);
  // weathering streaks + warm light
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.lean || 0); const D = o.r * 2, H = D * 3.57 * Math.min(1, (o.levels || 8) / 8);
  ctx.beginPath(); ctx.rect(-o.r * 1.1, -H, o.r * 2.2, H); ctx.clip();
  const r = rng(9); ctx.globalAlpha = .12; for (let i = 0; i < 26; i++) { const x = (r() - .5) * o.r * 2, y = -r() * H; ctx.fillStyle = r() > .5 ? '#6E6656' : '#9C8F70'; ctx.fillRect(x, y, 2 + r() * 4, 20 + r() * 80); }
  ctx.restore();
}

// ---------- real landmark: Pisa Cathedral facade (Duomo) ----------
// grey-and-white banded marble, 7 blind arches with lozenge inlays, 3 bronze doors, 4 loggia tiers, statue + angels, dome behind
function duomoDetailed(ctx, x, y, w) {
  const h = w * .98, L = BINK, lw = Math.max(1.4, w * .0035);
  ctx.save(); ctx.translate(x, y);
  // dome on an arcaded drum + transept roof behind
  { const dx = w * .62, dy = -h * .8, dw = w * .21;
    ctx.fillStyle = '#D9CDB8'; poly(ctx, [[w * .3, -h * .6], [w * 1.0, -h * .52], [w * 1.0, -h * .38], [w * .3, -h * .38]]); ctx.fill(); inkStroke(ctx, lw);
    ctx.fillStyle = hgrad(ctx, dx - dw, dx + dw, '#EDE5D6', '#BDB3A2'); ctx.fillRect(dx - dw, dy, dw * 2, h * .16); ctx.beginPath(); ctx.rect(dx - dw, dy, dw * 2, h * .16); inkStroke(ctx, lw);
    for (let i = 0; i < 9; i++) { const xx = dx - dw + dw * 2 * (i + .5) / 9; ctx.beginPath(); ctx.moveTo(xx - dw * .07, dy + h * .14); ctx.lineTo(xx - dw * .07, dy + h * .06); ctx.arc(xx, dy + h * .06, dw * .07, Math.PI, 0); ctx.lineTo(xx + dw * .07, dy + h * .14); ctx.fillStyle = '#5A5148'; ctx.fill(); inkStroke(ctx, lw * .7); }
    ctx.beginPath(); ctx.moveTo(dx - dw * 1.02, dy); ctx.bezierCurveTo(dx - dw, dy - dw * 1.1, dx + dw, dy - dw * 1.1, dx + dw * 1.02, dy); ctx.closePath(); ctx.fillStyle = hgrad(ctx, dx - dw, dx + dw, '#C9A57A', '#8E6E4C', '#D8B78C'); ctx.fill(); inkStroke(ctx, lw * 1.2);
    ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.lineWidth = 1.2; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(dx + k * dw * .28, dy); ctx.quadraticCurveTo(dx + k * dw * .2, dy - dw * .7, dx, dy - dw * .82); ctx.stroke(); }
    ctx.fillStyle = '#E4DAC8'; ctx.fillRect(dx - dw * .1, dy - dw * 1.05, dw * .2, dw * .25); ctx.beginPath(); ctx.rect(dx - dw * .1, dy - dw * 1.05, dw * .2, dw * .25); inkStroke(ctx, lw * .8); }
  // facade silhouette (nave + sloping aisle shoulders + gable)
  const body = c => { c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h * .56); c.lineTo(-w * .28, -h * .7); c.lineTo(-w * .28, -h * .86); c.lineTo(0, -h); c.lineTo(w * .28, -h * .86); c.lineTo(w * .28, -h * .7); c.lineTo(w / 2, -h * .56); c.lineTo(w / 2, 0); c.closePath(); };
  ctx.beginPath(); body(ctx); ctx.fillStyle = hgrad(ctx, -w / 2, w / 2, '#F4EFE5', '#CFC4B1', '#F7F2EA'); ctx.fill();
  ctx.save(); ctx.beginPath(); body(ctx); ctx.clip();
  // bichrome marble bands on the ground level
  for (let yy = -4, k = 0; yy > -h * .4; yy -= h * .026, k++) if (k % 2) { ctx.fillStyle = 'rgba(96,108,104,.28)'; ctx.fillRect(-w / 2, yy - h * .01, w, h * .01); }
  // 7 blind arches with lozenge inlays + 3 bronze doors
  for (let i = 0; i < 7; i++) { const cx = -w / 2 + w * (i + .5) / 7, aw = w / 7 * .82, top = -h * .3;
    ctx.beginPath(); ctx.moveTo(cx - aw / 2, 0); ctx.lineTo(cx - aw / 2, top); ctx.arc(cx, top, aw / 2, Math.PI, 0); ctx.lineTo(cx + aw / 2, 0); inkStroke(ctx, lw);
    ctx.fillStyle = '#E8E1D3'; ctx.fillRect(cx - aw / 2 - aw * .06, -h * .4, aw * .12, h * .4);
    ctx.save(); ctx.translate(cx, top - aw * .05); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#8B9A92'; ctx.fillRect(-aw * .1, -aw * .1, aw * .2, aw * .2); ctx.beginPath(); ctx.rect(-aw * .1, -aw * .1, aw * .2, aw * .2); inkStroke(ctx, lw * .7); ctx.restore();
    if (i === 1 || i === 3 || i === 5) { const dw = aw * (i === 3 ? .74 : .6), dh = h * (i === 3 ? .24 : .2); ctx.fillStyle = hgrad(ctx, cx - dw / 2, cx + dw / 2, '#8A6B3E', '#5A4226'); ctx.fillRect(cx - dw / 2, -dh, dw, dh);
      ctx.strokeStyle = 'rgba(40,28,15,.7)'; ctx.lineWidth = 1; for (let a = 1; a < 3; a++) for (let b = 1; b < 4; b++) ctx.strokeRect(cx - dw / 2 + dw * (a - 1) / 2 + 2, -dh + dh * (b - 1) / 3 + 2, dw / 2 - 4, dh / 3 - 4);
      ctx.beginPath(); ctx.rect(cx - dw / 2, -dh, dw, dh); inkStroke(ctx, lw * 1.2); ctx.fillStyle = '#D9D0BE'; ctx.fillRect(cx - dw / 2 - 4, -dh - 6, dw + 8, 6); } }
  // four loggia tiers of small columns and round arches
  const tiers = [[-h * .41, -h * .53, w * .5, 19], [-h * .545, -h * .65, w * .5, 19], [-h * .67, -h * .77, w * .28, 9], [-h * .785, -h * .87, w * .28, 8]];
  for (const [yb, yt, hw, n] of tiers) {
    ctx.fillStyle = vgrad(ctx, yt, yb, '#4F463D', '#6E6457'); ctx.fillRect(-hw, yt, hw * 2, yb - yt);
    for (let k = 0; k < n; k++) { const cx = -hw + hw * 2 * (k + .5) / n, ar = hw / n; ctx.beginPath(); ctx.moveTo(cx - ar, yt); ctx.lineTo(cx - ar, yt + ar); ctx.arc(cx, yt + ar, ar, Math.PI, 0, true); ctx.lineTo(cx + ar, yt); ctx.closePath(); ctx.fillStyle = '#EEE7DA'; ctx.fill(); }
    for (let k = 0; k <= n; k++) { const cx = -hw + hw * 2 * k / n; ctx.fillStyle = '#FBF8F2'; ctx.fillRect(cx - lw * 1.3, yt + 4, lw * 2.6, yb - yt - 6); ctx.beginPath(); ctx.rect(cx - lw * 1.3, yt + 4, lw * 2.6, yb - yt - 6); inkStroke(ctx, lw * .5); }
    ctx.fillStyle = '#E2D9C6'; ctx.fillRect(-hw - 6, yb - 3, hw * 2 + 12, lw * 3.4); ctx.beginPath(); ctx.rect(-hw - 6, yb - 3, hw * 2 + 12, lw * 3.4); inkStroke(ctx, lw * .8);
    ctx.fillStyle = '#E2D9C6'; ctx.fillRect(-hw - 6, yt - 2, hw * 2 + 12, lw * 2.5); }
  ctx.restore();
  ctx.beginPath(); body(ctx); inkStroke(ctx, lw * 2);
  // Madonna statue on the apex, angels on the corners
  for (const [sx, sy, sc] of [[0, -h, 1], [-w * .28, -h * .86, .7], [w * .28, -h * .86, .7], [-w / 2, -h * .56, .6], [w / 2, -h * .56, .6]]) { ctx.beginPath(); ctx.ellipse(sx, sy - w * .045 * sc, w * .022 * sc, w * .05 * sc, 0, 0, 7); ctx.fillStyle = '#D6CCBA'; ctx.fill(); inkStroke(ctx, lw); }
  ctx.restore();
}

// ---------- real landmark: Baptistery of Pisa (round, Romanesque base + Gothic gables + dome) ----------
function baptistery(ctx, x, y, w) {
  const h = w * 1.05, lw = Math.max(1.3, w * .004); ctx.save(); ctx.translate(x, y);
  const R = w / 2;
  // lower drum with blind arcade
  ctx.fillStyle = hgrad(ctx, -R, R, '#EFE8DA', '#B9AE9B', '#F6F0E6'); ctx.fillRect(-R, -h * .38, w, h * .38); ctx.beginPath(); ctx.rect(-R, -h * .38, w, h * .38); inkStroke(ctx, lw * 1.4);
  for (let k = -9; k <= 9; k++) { const a = k / 9 * Math.PI / 2, xx = Math.sin(a) * R, cw = Math.cos(a) * R * .16; ctx.beginPath(); ctx.moveTo(xx - cw, 0); ctx.lineTo(xx - cw, -h * .26); ctx.arc(xx, -h * .26, cw, Math.PI, 0); ctx.lineTo(xx + cw, 0); inkStroke(ctx, lw * .7, '#7C7262'); }
  // gothic upper: gables + pinnacles
  ctx.fillStyle = hgrad(ctx, -R * .96, R * .96, '#EAE2D2', '#B3A893'); ctx.fillRect(-R * .96, -h * .58, R * 1.92, h * .2); ctx.beginPath(); ctx.rect(-R * .96, -h * .58, R * 1.92, h * .2); inkStroke(ctx, lw * 1.2);
  for (let k = -5; k <= 5; k++) { const a = k / 5.5 * Math.PI / 2, xx = Math.sin(a) * R * .96, gw = Math.cos(a) * R * .17; poly(ctx, [[xx - gw, -h * .58], [xx, -h * .68], [xx + gw, -h * .58]]); ctx.fillStyle = '#E4DBCA'; ctx.fill(); inkStroke(ctx, lw * .8); ctx.beginPath(); ctx.moveTo(xx + gw, -h * .58); ctx.lineTo(xx + gw, -h * .7); inkStroke(ctx, lw * .8); }
  // dome (truncated cone with a hemispherical cap), lead-grey on the sea side, red tiles on the other
  ctx.beginPath(); ctx.moveTo(-R * .8, -h * .62); ctx.quadraticCurveTo(-R * .5, -h * .98, -R * .14, -h * 1.0); ctx.lineTo(R * .14, -h * 1.0); ctx.quadraticCurveTo(R * .5, -h * .98, R * .8, -h * .62); ctx.closePath();
  ctx.fillStyle = hgrad(ctx, -R * .8, R * .8, '#B07A5A', '#8C8E91', '#C08A66'); ctx.fill(); inkStroke(ctx, lw * 1.3);
  ctx.beginPath(); ctx.ellipse(0, -h * 1.0, R * .16, R * .1, 0, Math.PI, 0); ctx.fillStyle = '#D9CFBE'; ctx.fill(); inkStroke(ctx, lw); ctx.beginPath(); ctx.ellipse(0, -h * 1.08, R * .03, R * .07, 0, 0, 7); ctx.fillStyle = '#C9A04A'; ctx.fill(); inkStroke(ctx, lw * .8);
  ctx.restore();
}
// Camposanto: long white marble wall with blind arcades
function camposanto(ctx, x0, x1, y, h) {
  ctx.fillStyle = vgrad(ctx, y - h, y, '#EFE9DC', '#D4CAB7'); ctx.fillRect(x0, y - h, x1 - x0, h); ctx.beginPath(); ctx.rect(x0, y - h, x1 - x0, h); inkStroke(ctx, 2);
  for (let x = x0 + 30; x < x1 - 20; x += 46) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h * .62); ctx.arc(x + 18, y - h * .62, 18, Math.PI, 0); ctx.lineTo(x + 36, y); inkStroke(ctx, 1.4, '#857A68'); }
  ctx.fillStyle = '#B9604A'; ctx.fillRect(x0 - 4, y - h - 8, x1 - x0 + 8, 9); ctx.beginPath(); ctx.rect(x0 - 4, y - h - 8, x1 - x0 + 8, 9); inkStroke(ctx, 1.6);
}
function stonePine(ctx, x, y, s, seed = 1) { // Tuscan umbrella pine
  const r = rng(seed); ctx.save();
  ctx.beginPath(); ctx.moveTo(x - s * .05, y); ctx.quadraticCurveTo(x - s * .02, y - s * .5, x + s * .08, y - s * .9); ctx.lineTo(x + s * .12, y - s * .88); ctx.quadraticCurveTo(x + s * .04, y - s * .5, x + s * .05, y); ctx.closePath(); ctx.fillStyle = '#6B4E36'; ctx.fill(); inkStroke(ctx, 2);
  const cy = y - s * .98; ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI, rx = s * .62, ry = s * .22; const px = x + s * .08 + Math.cos(a) * rx, py = cy + Math.sin(a) * ry; ctx.moveTo(px + s * .12, py); ctx.arc(px, py, s * (.1 + r() * .05), 0, 7); } ctx.rect(x + s * .08 - s * .6, cy - 2, s * 1.2, s * .1);
  ctx.fillStyle = '#4C6A38'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#6F8E48'; ctx.fillRect(x - s, cy - s, s * 1.6, s * .9); ctx.restore(); inkStroke(ctx, 2); ctx.restore();
}
function cypressD(ctx, x, y, h) { cypress(ctx, x, y, h, '#2F5236'); }
function grassField(ctx, y0, y1, base = '#86A84E', seed = 5) {
  ctx.fillStyle = vgrad(ctx, y0, y1, shade(base, .92), shade(base, 1.05)); ctx.fillRect(-50, y0, 2020, y1 - y0);
  const r = rng(seed); ctx.lineCap = 'round';
  for (let i = 0; i < 1400; i++) { const y = y0 + Math.pow(r(), .7) * (y1 - y0), x = r() * 1920, k = (y - y0) / (y1 - y0), len = 3 + k * 12; ctx.strokeStyle = r() > .5 ? shade(base, 1.18) : shade(base, .8); ctx.lineWidth = .8 + k * 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - .5) * 4, y - len); ctx.stroke(); }
}

// ---------- SCENES ----------
const SCENES = {};
SCENES.piazza = (ctx, t = 0, o = {}) => { // Piazza dei Miracoli, wide
  painterlySky(ctx, 700, '#6DA9D8', '#D9ECF4', 7);
  // distant Pisan Mountains (Monte Pisano) with haze
  hills(ctx, 640, '#9FB2B8', 60, 3, 3); hills(ctx, 680, '#8FA59C', 40, 9, 1.5);
  // city wall + tower houses behind the Camposanto
  ctx.fillStyle = '#C79C74'; ctx.fillRect(-20, 600, 1960, 90); ctx.save(); ctx.beginPath(); ctx.rect(-20, 600, 1960, 90); ctx.clip(); masonry(ctx, -20, 600, 1960, 690, { bh: 14, bw: 30, base: '#C9A27C', lw: 1 }); ctx.restore(); ctx.beginPath(); ctx.rect(-20, 600, 1960, 90); inkStroke(ctx, 2);
  for (let x = 20; x < 1920; x += 48) { ctx.fillStyle = '#B98F69'; ctx.fillRect(x, 588, 26, 14); ctx.beginPath(); ctx.rect(x, 588, 26, 14); inkStroke(ctx, 1.4); }
  camposanto(ctx, -20, 1940, 760, 70);
  stonePine(ctx, 90, 740, 210, 3); stonePine(ctx, 1830, 745, 240, 8);
  baptistery(ctx, 270, 850, 330);
  duomoDetailed(ctx, 900, 870, 560);
  pisaTowerDetailed(ctx, { x: 1460, y: 900, r: o.towerR || 92, levels: o.levels ?? 8, lean: o.lean ?? .07, curve: o.curve ?? .012, eye: 0 });
  grassField(ctx, 850, 1080, '#7FA64A');
  // white marble paths
  ctx.fillStyle = '#E9E2D2'; poly(ctx, [[0, 900], [1920, 905], [1920, 940], [0, 935]]); ctx.fill(); inkStroke(ctx, 1.6);
  poly(ctx, [[820, 880], [980, 880], [1180, 1080], [620, 1080]]); ctx.fill(); inkStroke(ctx, 1.8);
  // cast shadows on the lawn
  ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = '#1F2B14'; poly(ctx, [[1420, 905], [1520, 905], [1760, 1000], [1600, 1000]]); ctx.fill(); ctx.restore();
  wash(ctx, .5);
};
SCENES.street = (ctx, t = 0) => { // medieval Pisa street: tower-houses, shutters, vines, paving
  painterlySky(ctx, 500, '#78B2DC', '#E8F2F2', 12);
  // far tower-houses (case-torri)
  const house = (x, w, top, base, col, seed, win = 3, roof = true) => {
    ctx.save(); ctx.beginPath(); ctx.rect(x, top, w, base - top); ctx.clip(); masonry(ctx, x, top, x + w, base, { bh: 22, bw: 46, base: col, seed, lw: 1.3 });
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(255,240,210,.18)'); g.addColorStop(1, 'rgba(40,20,30,.22)'); ctx.fillStyle = g; ctx.fillRect(x, top, w, base - top); ctx.restore();
    ctx.beginPath(); ctx.rect(x, top, w, base - top); inkStroke(ctx, 3);
    if (roof) { ctx.save(); poly(ctx, [[x - 18, top], [x + w + 18, top], [x + w + 4, top - 34], [x - 4, top - 34]]); ctx.clip(); roofTiles(ctx, x - 20, top - 36, x + w + 20, top + 2, '#B65A3E', seed); ctx.restore(); poly(ctx, [[x - 18, top], [x + w + 18, top], [x + w + 4, top - 34], [x - 4, top - 34]]); inkStroke(ctx, 2.6); }
    const r = rng(seed); for (let fy = top + 50; fy < base - 180; fy += 150) for (let k = 0; k < win; k++) windowShutter(ctx, x + w * (k + .5) / win - 22, fy, 44, 80, { col: ['#6E7F5C', '#5C6F7F', '#7F5C4E'][Math.floor(r() * 3)] });
  };
  house(-40, 360, 120, 900, '#D8BC94', 1, 2); house(320, 300, 40, 900, '#C9A07A', 2, 2); house(1250, 330, 80, 900, '#DCC4A0', 3, 2); house(1580, 380, 140, 900, '#C79A73', 4, 2);
  // the street vanishing toward the Duomo
  ctx.save(); ctx.beginPath(); ctx.rect(620, 300, 630, 600); ctx.clip(); duomoDetailed(ctx, 935, 760, 380); ctx.restore();
  house(620, 110, 380, 900, '#D3B48C', 6, 1); house(1140, 110, 400, 900, '#CDAA84', 7, 1);
  plankDoor(ctx, 380, 760, 110, 140); plankDoor(ctx, 1330, 770, 100, 130, '#5E4532');
  vine(ctx, 320, 260, 22, 1, 3); vine(ctx, 1580, 300, 18, -1, 5); vine(ctx, 280, 600, 12, -1, 8);
  // paving: large stone slabs in perspective
  ctx.fillStyle = '#CDBEA4'; ctx.fillRect(-20, 900, 1960, 200);
  ctx.save(); ctx.beginPath(); ctx.rect(-20, 900, 1960, 200); ctx.clip(); const r = rng(6);
  for (let row = 0; row < 7; row++) { const y = 900 + row * row * 4.5 + row * 6, hh = 8 + row * 9; for (let x = -40 + (row % 2) * 40; x < 1960; x += 70 + row * 18) { ctx.fillStyle = shade('#CDBEA4', .88 + r() * .2); ctx.fillRect(x, y, 70 + row * 18, hh); ctx.beginPath(); ctx.rect(x, y, 70 + row * 18, hh); inkStroke(ctx, 1 + row * .25, '#8B7C66'); } }
  ctx.restore(); ctx.beginPath(); ctx.moveTo(-20, 900); ctx.lineTo(1940, 900); inkStroke(ctx, 2.4);
  // cast shadow from the left houses
  ctx.save(); ctx.globalAlpha = .22; ctx.fillStyle = '#2A1F2E'; poly(ctx, [[-20, 900], [660, 900], [900, 1080], [-20, 1080]]); ctx.fill(); ctx.restore();
  wash(ctx, .5);
};
SCENES.towerBase = (ctx, t = 0, o = {}) => { // close: the three-storey stump with scaffolding, 1178
  painterlySky(ctx, 760, '#7AB0DA', '#E3EFF2', 21);
  hills(ctx, 720, '#9DB0A6', 50, 2, 2.5);
  camposanto(ctx, -20, 1940, 800, 60);
  pisaTowerDetailed(ctx, { x: 980, y: 930, r: 230, levels: o.levels ?? 3, lean: o.lean ?? .06, scaffold: true, eye: -1 });
  // timber crane (treadwheel) + stone blocks
  ctx.save(); ctx.translate(1450, 930);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(60, -420); ctx.lineTo(80, -420); ctx.lineTo(30, 0); ctx.closePath(); ctx.fillStyle = '#8A6440'; ctx.fill(); inkStroke(ctx, 3);
  ctx.beginPath(); ctx.moveTo(70, -410); ctx.lineTo(-260, -470); inkStroke(ctx, 10, '#7A5636'); ctx.beginPath(); ctx.moveTo(70, -410); ctx.lineTo(-260, -470); inkStroke(ctx, 2.5);
  ctx.beginPath(); ctx.moveTo(-250, -468); ctx.lineTo(-250, -260); inkStroke(ctx, 2); ctx.fillStyle = '#DCD3C2'; ctx.fillRect(-285, -262, 70, 46); ctx.beginPath(); ctx.rect(-285, -262, 70, 46); inkStroke(ctx, 2.4);
  ctx.beginPath(); ctx.arc(120, -70, 70, 0, 7); ctx.lineWidth = 12; ctx.strokeStyle = '#7A5636'; ctx.stroke(); ctx.beginPath(); ctx.arc(120, -70, 70, 0, 7); inkStroke(ctx, 2.4); for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(120, -70); ctx.lineTo(120 + Math.cos(k * Math.PI / 4) * 70, -70 + Math.sin(k * Math.PI / 4) * 70); inkStroke(ctx, 2.2, '#5E4128'); }
  ctx.restore();
  for (const [bx, by] of [[300, 960], [380, 975], [340, 930], [1650, 990]]) { ctx.fillStyle = '#E3DACA'; ctx.fillRect(bx, by - 50, 90, 50); ctx.fillStyle = '#C8BEAC'; poly(ctx, [[bx + 90, by - 50], [bx + 110, by - 62], [bx + 110, by - 12], [bx + 90, by]]); ctx.fill(); ctx.fillStyle = '#F0E9DC'; poly(ctx, [[bx, by - 50], [bx + 20, by - 62], [bx + 110, by - 62], [bx + 90, by - 50]]); ctx.fill(); poly(ctx, [[bx, by], [bx, by - 50], [bx + 20, by - 62], [bx + 110, by - 62], [bx + 110, by - 12], [bx + 90, by]]); inkStroke(ctx, 2.2); }
  // ground: packed earth + grass tufts + marble chips
  ctx.fillStyle = vgrad(ctx, 900, 1080, '#B39A72', '#9C825E'); ctx.fillRect(-20, 900, 1960, 200); const r = rng(4);
  for (let i = 0; i < 140; i++) { ctx.fillStyle = r() > .5 ? 'rgba(255,255,255,.35)' : 'rgba(60,40,20,.25)'; ctx.beginPath(); ctx.ellipse(r() * 1920, 910 + r() * 170, 2 + r() * 5, 1 + r() * 2, 0, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-20, 905); ctx.lineTo(1940, 905); inkStroke(ctx, 2);
  wash(ctx, .5);
};
SCENES.walls = (ctx, t = 0) => { // dusk: Pisa's medieval walls along the Arno, lungarno houses
  painterlySky(ctx, 620, '#3E4C86', '#F0A86A', 30, false);
  ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = '#FFE2A8'; ctx.beginPath(); ctx.arc(1500, 560, 60, 0, 7); ctx.fill(); ctx.restore();
  hills(ctx, 600, '#6E6E8E', 40, 5, 2);
  // lungarno: row of houses with towers, warm lit windows
  const r = rng(8); let x = -30;
  while (x < 1950) { const w = 120 + r() * 120, top = 380 + r() * 160; ctx.fillStyle = shade(['#C99A6E', '#D7B07C', '#B97F5E', '#D9C095'][Math.floor(r() * 4)], .82);
    ctx.fillRect(x, top, w, 640 - top); ctx.save(); ctx.beginPath(); ctx.rect(x, top, w, 640 - top); ctx.clip(); masonry(ctx, x, top, x + w, 640, { bh: 16, bw: 34, base: shade('#C99A6E', .8), seed: Math.floor(x), lw: 1 }); ctx.restore();
    ctx.beginPath(); ctx.rect(x, top, w, 640 - top); inkStroke(ctx, 2.2);
    for (let fy = top + 30; fy < 600; fy += 60) for (let k = 0; k < Math.floor(w / 50); k++) { const lit = r() > .5; ctx.fillStyle = lit ? '#FFD47A' : '#3A3036'; ctx.fillRect(x + 18 + k * 50, fy, 18, 30); ctx.beginPath(); ctx.rect(x + 18 + k * 50, fy, 18, 30); inkStroke(ctx, 1.4); }
    ctx.save(); poly(ctx, [[x - 8, top], [x + w + 8, top], [x + w - 4, top - 22], [x + 4, top - 22]]); ctx.clip(); roofTiles(ctx, x - 10, top - 24, x + w + 10, top + 2, '#8E4A38', Math.floor(x)); ctx.restore(); poly(ctx, [[x - 8, top], [x + w + 8, top], [x + w - 4, top - 22], [x + 4, top - 22]]); inkStroke(ctx, 2);
    x += w; }
  // the river Arno with reflections
  ctx.fillStyle = vgrad(ctx, 640, 860, '#4E5E8E', '#2C3560'); ctx.fillRect(-20, 640, 1960, 220);
  for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,214,140,${.15 + r() * .3})`; ctx.fillRect(r() * 1920, 650 + r() * 200, 20 + r() * 60, 2); }
  ctx.beginPath(); ctx.moveTo(-20, 640); ctx.lineTo(1940, 640); inkStroke(ctx, 2.4);
  // foreground river wall (spalletta) in brick
  ctx.save(); ctx.beginPath(); ctx.rect(-20, 860, 1960, 240); ctx.clip(); masonry(ctx, -20, 860, 1940, 1100, { bh: 28, bw: 64, base: '#9E6F55', lw: 1.6 }); ctx.fillStyle = 'rgba(30,20,50,.25)'; ctx.fillRect(-20, 860, 1960, 240); ctx.restore();
  ctx.fillStyle = '#C9B79A'; ctx.fillRect(-20, 850, 1960, 18); ctx.beginPath(); ctx.rect(-20, 850, 1960, 18); inkStroke(ctx, 2.6);
  wash(ctx, .45);
};

// map: real coastline (Natural Earth 1:10m), watercolour fills, halftone, double borders
let GEO = null;
async function loadGeo() { if (!GEO) GEO = await (await fetch('../data/tuscany.json')).json(); return GEO; }
const MAPV = { lon0: 8.3, lon1: 12.1, lat1: 44.75 };   // view: Liguria → Tuscany
function mxy(lon, lat) { const k = Math.cos(43.7 * Math.PI / 180); const sx = 1920 / ((MAPV.lon1 - MAPV.lon0) * k); return [(lon - MAPV.lon0) * k * sx, (MAPV.lat1 - lat) * sx]; }
function geoPath(ctx, ring) { ring.forEach((p, i) => { const q = mxy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); }
function halftone(ctx, col, step = 14, rad = 2.6) { ctx.fillStyle = col; for (let y = 0; y < 1100; y += step) for (let x = ((y / step) % 2) * step / 2; x < 1940; x += step) { ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); } }
SCENES.map = (ctx, t = 0, o = {}) => {
  const G = GEO; // must be preloaded
  ctx.fillStyle = '#6FA8D8'; ctx.fillRect(-20, -20, 1960, 1120);
  const land = () => { ctx.beginPath(); for (const ring of G.land) geoPath(ctx, ring); };
  // light coastal water band
  ctx.save(); land(); ctx.lineWidth = 60; ctx.strokeStyle = '#9CCAEB'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineWidth = 26; ctx.strokeStyle = '#BDDDF2'; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha = .25; ctx.strokeStyle = '#E8F4FB'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.save(); land(); ctx.lineWidth = 80 + i * 40; ctx.globalAlpha = .08; ctx.stroke(); ctx.restore(); } ctx.restore();
  // land: parchment watercolour
  land(); ctx.fillStyle = '#E8D7A4'; ctx.fill('evenodd');
  ctx.save(); land(); ctx.clip('evenodd'); wash(ctx, .9, 'multiply'); halftone(ctx, 'rgba(160,130,70,.16)', 16, 2.2);
  // regions with organic borders that follow real geography (approximate medieval territories)
  const R = (name, pts, col) => { const P = wobble(pts.map(p => mxy(p[0], p[1])), 8, name.length); ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    ctx.save(); ctx.globalAlpha = .82; ctx.fillStyle = col; ctx.fill(); ctx.restore(); ctx.save(); ctx.clip(); halftone(ctx, 'rgba(255,255,255,.18)', 14, 2); ctx.restore();
    ctx.lineWidth = 10; ctx.strokeStyle = shade(col, .55); ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#FFF6E6'; ctx.stroke(); };
  R('Genoa', [[7.9, 45.2], [9.7, 45.2], [9.95, 44.55], [9.9, 44.2], [9.6, 44.05], [7.9, 43.9]], '#C9C1A9');
  R('Lucca', [[10.05, 44.45], [10.5, 44.45], [10.82, 44.1], [10.72, 43.82], [10.45, 43.78], [10.28, 43.85], [10.1, 44.05]], '#D6B472');
  R('Florence', [[10.82, 44.1], [11.6, 44.25], [12.3, 44.0], [12.3, 43.05], [11.5, 42.9], [11.0, 43.15], [10.85, 43.5], [10.72, 43.82]], '#B9C28E');
  R('Pisa', [[10.2, 43.9], [10.45, 43.78], [10.72, 43.82], [10.85, 43.5], [11.0, 43.15], [10.85, 42.8], [10.45, 42.8], [10.3, 43.3], [10.25, 43.6]], o.pisaCol || '#C8463E');
  // Arno + Serchio from real river data
  ctx.lineCap = 'round'; for (const rv of G.rivers) { ctx.beginPath(); rv.forEach((p, i) => { const q = mxy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.lineWidth = 7; ctx.strokeStyle = '#5E92C4'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#9CCAEB'; ctx.stroke(); }
  // relief: soft hill shading for the Apuan Alps / Apennines / Monte Pisano
  for (const [lo, la, rr] of [[10.25, 44.05, 120], [10.6, 44.25, 160], [11.2, 44.1, 200], [10.55, 43.75, 70], [11.0, 43.3, 160]]) { const [hx, hy2] = mxy(lo, la); const g = ctx.createRadialGradient(hx - rr * .2, hy2 - rr * .2, 0, hx, hy2, rr); g.addColorStop(0, 'rgba(90,70,40,.18)'); g.addColorStop(1, 'rgba(90,70,40,0)'); ctx.fillStyle = g; ctx.fillRect(hx - rr, hy2 - rr, rr * 2, rr * 2); }
  ctx.restore();
  // coastline ink
  ctx.save(); land(); ctx.lineWidth = 5; ctx.strokeStyle = '#8C6E3E'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  // city markers
  for (const [lo, la] of [[8.93, 44.41], [10.5, 43.84], [10.4, 43.72], [11.25, 43.77]]) { const [cx, cy] = mxy(lo, la); ctx.beginPath(); ctx.arc(cx, cy, 11, 0, 7); ctx.fillStyle = '#FFF6E6'; ctx.fill(); inkStroke(ctx, 4); ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fillStyle = BINK; ctx.fill(); }
  wash(ctx, .35);
};
