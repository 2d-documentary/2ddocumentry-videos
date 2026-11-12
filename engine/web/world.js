// world.js — painted backgrounds, real-landmark builders, maps and props
'use strict';

// ---------- sky / clouds / ground ----------
function sky(ctx, top = '#6FB6E8', bot = '#D4ECF7', y0 = 0, y1 = H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-W, y0 - H, W * 3, (y1 - y0) + H * 2);
}
function cloud(ctx, x, y, s, seed = 1, tint = '#FFFFFF') {
  const r = rng(seed); const puffs = [];
  for (let i = 0; i < 7; i++) puffs.push([(i - 3) * 0.32 + (r() - .5) * .15, -Math.sin(i / 6 * Math.PI) * .38 - r() * .12, .3 + Math.sin(i / 6 * Math.PI) * .22 + r() * .08]);
  const path = c => { puffs.forEach(([px, py, pr]) => { c.moveTo(x + (px + pr) * s, y + py * s); c.arc(x + px * s, y + py * s, pr * s, 0, 7); }); c.rect(x - 1.05 * s, y - .02 * s, 2.1 * s, .14 * s); };
  ctx.save();
  ctx.beginPath(); path(ctx); ctx.lineWidth = s * .05; ctx.strokeStyle = 'rgba(120,165,205,.55)'; ctx.stroke();
  ctx.beginPath(); path(ctx); ctx.fillStyle = mix(tint, '#C9DCEC', .55); ctx.fill(); ctx.clip();
  ctx.translate(-s * .04, -s * .1); ctx.beginPath(); path(ctx); ctx.fillStyle = tint; ctx.fill();
  ctx.restore();
}
function hills(ctx, y, col, amp, seed, blur = 0) {
  const r = rng(seed); ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.beginPath(); ctx.moveTo(-200, H + 200); ctx.lineTo(-200, y);
  let x = -200; while (x < W + 200) { const nx = x + 160 + r() * 220; ctx.quadraticCurveTo((x + nx) / 2, y - amp * (.4 + r() * .8), nx, y + (r() - .5) * amp * .3); x = nx; }
  ctx.lineTo(W + 200, H + 200); ctx.closePath();
  const g = ctx.createLinearGradient(0, y - amp, 0, y + 200); g.addColorStop(0, col); g.addColorStop(1, shade(col, .85));
  ctx.fillStyle = g; ctx.fill(); ctx.restore();
}
function cypress(ctx, x, y, h, col = '#2F5B36') {
  const w = h * .17;
  const path = c => { c.moveTo(x, y - h); c.bezierCurveTo(x + w * 1.1, y - h * .7, x + w * 1.05, y - h * .2, x + w * .35, y); c.lineTo(x - w * .35, y); c.bezierCurveTo(x - w * 1.05, y - h * .2, x - w * 1.1, y - h * .7, x, y - h); };
  ctx.save(); ctx.beginPath(); path(ctx); ctx.fillStyle = shade(col, .78); ctx.fill(); ctx.clip();
  ctx.beginPath(); ctx.ellipse(x - w * .5, y - h * .5, w * .9, h * .55, 0, 0, 7); ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = shade(col, 1.3); ctx.lineWidth = 2.5; for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.arc(x - w * .3, y - h * i / 7, w * .4, .3, 1.6); ctx.stroke(); }
  ctx.restore(); ctx.beginPath(); path(ctx); ctx.lineWidth = 4; ctx.strokeStyle = shade(col, .5); ctx.stroke();
  ctx.fillStyle = '#4a3523'; ctx.fillRect(x - 5, y - 4, 10, 14);
}
function lawn(ctx, y, col = '#7DB84C') {
  const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, shade(col, .95)); g.addColorStop(1, shade(col, 1.08));
  ctx.fillStyle = g; ctx.fillRect(-W, y, W * 3, H * 2);
  ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = '#fff';
  for (let i = -8; i < 14; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, y); ctx.lineTo(W / 2 + i * 260, H + 400); ctx.lineTo(W / 2 + i * 260 + 120, H + 400); ctx.lineTo(W / 2 + i * 60 + 28, y); ctx.fill(); i++; }
  ctx.restore(); ctx.fillStyle = shade(col, .8); ctx.fillRect(-W, y, W * 3, 5);
}

// ---------- Leaning Tower of Pisa (real proportions, cylindrical shading) ----------
const MARBLE = '#F2EDE2', MARBLE_LINE = '#6E6352', TOWER_OUT = '#3B332B';
function cylGrad(ctx, rr, base) {
  const g = ctx.createLinearGradient(-rr, 0, rr, 0);
  g.addColorStop(0, shade(base, .80)); g.addColorStop(.22, shade(base, 1.03)); g.addColorStop(.5, shade(base, .97)); g.addColorStop(.82, shade(base, .78)); g.addColorStop(1, shade(base, .66));
  return g;
}
function towerStorey(ctx, i, rr, h, sag, opts) {
  const lw = Math.max(1.5, rr * .018);
  const curveY = (x, y) => y - sag * (1 - (x / rr) * (x / rr));
  const band = (y, th, rad) => { // projecting ledge band
    ctx.beginPath(); ctx.moveTo(-rad, y); for (let k = -10; k <= 10; k++) { const x = rad * k / 10; ctx.lineTo(x, curveY(x * rr / rad, y)); }
    ctx.lineTo(rad, y - th); for (let k = 10; k >= -10; k--) { const x = rad * k / 10; ctx.lineTo(x, curveY(x * rr / rad, y - th)); } ctx.closePath();
    ctx.fillStyle = cylGrad(ctx, rad, '#E9E2D3'); ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = MARBLE_LINE; ctx.stroke();
  };
  const isBelfry = i === 7, isGround = i === 0;
  const R = isBelfry ? rr * .7 : rr;
  // core wall
  ctx.beginPath(); ctx.moveTo(-R, curveY(-R, 0)); ctx.lineTo(-R, curveY(-R, -h)); for (let k = -10; k <= 10; k++) { const x = R * k / 10; ctx.lineTo(x, curveY(x, -h)); } ctx.lineTo(R, 0); for (let k = 10; k >= -10; k--) { const x = R * k / 10; ctx.lineTo(x, curveY(x, 0)); } ctx.closePath();
  ctx.fillStyle = isGround ? cylGrad(ctx, R, MARBLE) : cylGrad(ctx, R, '#7A6F60'); ctx.fill();
  // grey-green stone bands on the ground storey (the real tower has subtle grey courses)
  if (isGround) { ctx.save(); ctx.clip(); ctx.globalAlpha = .18; ctx.fillStyle = '#7E8A86'; for (let y = -h * .1; y > -h; y -= h * .085) ctx.fillRect(-R, y, 2 * R, h * .018); ctx.restore(); }
  // columns + arches
  const N = isBelfry ? 12 : isGround ? 15 : 24; const off = opts.rot || 0;
  const cols = []; for (let k = 0; k < N; k++) { const a = off + k * Math.PI * 2 / N; const c = Math.cos(a); if (c > -0.02) cols.push({ x: R * Math.sin(a), c }); }
  cols.sort((a, b) => a.x - b.x);
  const yTopCol = isGround ? -h * .74 : isBelfry ? -h * .62 : -h * .64, yBot = isGround ? -h * .08 : -h * .05;
  // arches: interior dark between columns
  for (let k = 0; k < cols.length - 1; k++) {
    const a = cols[k], b = cols[k + 1]; const cw = (b.x - a.x); if (cw < 1) continue; const mx = (a.x + b.x) / 2;
    const archR = cw / 2; const yA = curveY(mx, yTopCol);
    ctx.beginPath(); ctx.moveTo(a.x, curveY(a.x, yBot)); ctx.lineTo(a.x, curveY(a.x, yTopCol)); ctx.ellipse(mx, yA, archR, Math.min(archR, h * .2), 0, Math.PI, 0); ctx.lineTo(b.x, curveY(b.x, yBot)); ctx.closePath();
    if (isGround) { ctx.lineWidth = lw * .9; ctx.strokeStyle = shade(MARBLE_LINE, 1.25); ctx.stroke(); }
    else { const lum = .55 + .25 * Math.min(a.c, b.c); ctx.fillStyle = shade('#4E463C', lum + .3); ctx.fill(); ctx.lineWidth = lw * .8; ctx.strokeStyle = MARBLE_LINE; ctx.stroke(); }
  }
  // door on the ground storey
  if (isGround && opts.door !== false) { const dw = rr * .26; ctx.beginPath(); ctx.moveTo(-dw / 2, curveY(0, 0)); ctx.lineTo(-dw / 2, -h * .42); ctx.arc(0, -h * .42, dw / 2, Math.PI, 0); ctx.lineTo(dw / 2, 0); ctx.closePath(); ctx.fillStyle = '#3A2F28'; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = MARBLE_LINE; ctx.stroke(); }
  // columns (white, shaded by facing angle)
  for (const cl of cols) {
    const cw = Math.max(1.2, rr * (isGround ? .055 : .04) * Math.max(.25, cl.c));
    const y1 = curveY(cl.x, yBot), y2 = curveY(cl.x, yTopCol);
    ctx.fillStyle = shade('#FBF8F1', .72 + .3 * cl.c); ctx.fillRect(cl.x - cw / 2, y2, cw, y1 - y2);
    ctx.lineWidth = lw * .55; ctx.strokeStyle = MARBLE_LINE; ctx.strokeRect(cl.x - cw / 2, y2, cw, y1 - y2);
    ctx.fillStyle = shade('#EFE8DA', .75 + .25 * cl.c); ctx.fillRect(cl.x - cw * .9, y2 - lw * 2, cw * 1.8, lw * 2.4);
  }
  // spandrel wall above arches (galleries have marble above the arches)
  if (!isGround) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(-R, curveY(-R, -h)); for (let k = -10; k <= 10; k++) { const x = R * k / 10; ctx.lineTo(x, curveY(x, -h)); } for (let k = 10; k >= -10; k--) { const x = R * k / 10; ctx.lineTo(x, curveY(x, yTopCol - h * .16)); } ctx.closePath(); ctx.clip();
    ctx.fillStyle = cylGrad(ctx, R, MARBLE); ctx.fillRect(-R, -h, 2 * R, h); ctx.restore();
    // redraw arch tops over spandrel
    for (let k = 0; k < cols.length - 1; k++) { const a = cols[k], b = cols[k + 1]; const cw = (b.x - a.x); if (cw < 2) continue; const mx = (a.x + b.x) / 2; ctx.beginPath(); ctx.ellipse(mx, curveY(mx, yTopCol), cw / 2, Math.min(cw / 2, h * .2), 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = shade('#4E463C', .85 + .25 * Math.min(a.c, b.c)); ctx.fill(); ctx.lineWidth = lw * .8; ctx.strokeStyle = MARBLE_LINE; ctx.stroke(); }
  }
  // outer silhouette
  ctx.lineWidth = lw * 2.2; ctx.strokeStyle = TOWER_OUT; ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(-R, -h); ctx.moveTo(R, 0); ctx.lineTo(R, -h); ctx.stroke();
  // ledge at the top of this storey
  band(-h, h * (isGround ? .07 : .09), R * 1.06);
  if (isBelfry) { band(-h * 1.0 - h * .09, h * .08, R * .95); }
}
/** o: {x, y, r, levels (0..8, float ok), lean (rad), curve (rad/storey from 3rd), sink, eye (storey index of eye level), scaffold, rot} */
function pisaTower(ctx, o) {
  const D = o.r * 2; const HS = [.72, .42, .42, .42, .42, .42, .42, .4].map(k => k * D);
  ctx.save(); ctx.translate(o.x, o.y + (o.sink || 0));
  // ground shadow
  ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = '#1E2A14'; ctx.beginPath(); ctx.ellipse(o.r * .4 + Math.sin(o.lean || 0) * D, 6, o.r * 1.7, o.r * .22, 0, 0, 7); ctx.fill(); ctx.restore();
  const full = Math.floor(o.levels), part = o.levels - full;
  for (let i = 0; i < Math.min(8, Math.ceil(o.levels)); i++) {
    const a = (o.lean || 0) - (i >= 3 ? (o.curve || 0) * (i - 2) : 0);
    ctx.rotate(i === 0 ? a : a - prevA); var prevA = a;
    let h = HS[i]; const frac = i < full ? 1 : part; if (frac <= 0) break;
    const sag = o.r * .06 * clamp((i - (o.eye ?? -1)) / 2, -1, 1);
    ctx.save(); if (frac < 1) { ctx.beginPath(); ctx.rect(-o.r * 2, -h * frac - 2, o.r * 4, h * frac + 40); ctx.clip(); }
    towerStorey(ctx, i, o.r, h, sag, o); ctx.restore();
    if (frac < 1 && o.scaffold) scaffold(ctx, o.r, h * frac);
    ctx.translate(0, -h * frac);
  }
  if (o.scaffold && o.levels % 1 === 0) scaffold(ctx, o.r, 0);
  if (o.levels >= 8) { // little roof on the belfry
    ctx.translate(0, -HS[7] * .17); inkFill(ctx, c => { c.ellipse(0, 0, o.r * .5, o.r * .07, 0, 0, 7); }, '#D8CFBE', 3, MARBLE_LINE);
  }
  ctx.restore();
}
function scaffold(ctx, r, top) {
  ctx.save(); ctx.strokeStyle = '#6B4B2E'; ctx.lineWidth = Math.max(3, r * .035); ctx.lineCap = 'round';
  for (const x of [-r * 1.12, -r * .5, r * .5, r * 1.12]) { ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x * 1.02, -top - r * .7); ctx.stroke(); }
  for (let y = -r * .35; y > -top - r * .6; y -= r * .45) { ctx.beginPath(); ctx.moveTo(-r * 1.2, y); ctx.lineTo(r * 1.2, y + 4); ctx.stroke(); }
  ctx.restore();
}

// ---------- Pisa Cathedral (Duomo) facade: 7 blind arches + 4 tiers of loggias + gable ----------
function duomo(ctx, x, y, w, opts = {}) {
  const h = w * 1.02; const line = '#7C7262'; const lw = Math.max(2, w * .006);
  ctx.save(); ctx.translate(x, y);
  // dome behind (oval dome over the crossing)
  if (opts.dome !== false) { // elliptical dome on an arcaded drum (as on the real cathedral)
    const dx = w * .62, dy = -h * .78, dw = w * .2;
    inkFill(ctx, c => { c.moveTo(dx - dw, dy + h * .14); c.lineTo(dx - dw, dy); c.quadraticCurveTo(dx, dy - h * .03, dx + dw, dy); c.lineTo(dx + dw, dy + h * .14); c.closePath(); }, '#E6DECF', lw, line);
    ctx.save(); ctx.strokeStyle = line; ctx.lineWidth = lw * .7; for (let i = 0; i < 7; i++) { const xx = dx - dw * .85 + i * dw * .28; ctx.beginPath(); ctx.moveTo(xx, dy + h * .11); ctx.lineTo(xx, dy + h * .04); ctx.arc(xx + dw * .07, dy + h * .04, dw * .07, Math.PI, 0); ctx.lineTo(xx + dw * .14, dy + h * .11); ctx.stroke(); } ctx.restore();
    celFill(ctx, c => { c.moveTo(dx - dw * 1.02, dy); c.bezierCurveTo(dx - dw * 1.0, dy - dw * 1.05, dx + dw * 1.0, dy - dw * 1.05, dx + dw * 1.02, dy); c.quadraticCurveTo(dx, dy + dw * .08, dx - dw * 1.02, dy); c.closePath(); }, '#C9A97E', -dw * .25, -dw * .05, lw, line);
    inkFill(ctx, c => { c.rect(dx - dw * .09, dy - dw * .95, dw * .18, dw * .22); }, '#E6DECF', lw, line); inkFill(ctx, c => { c.arc(dx, dy - dw * .97, dw * .1, Math.PI, 0); }, '#C9A97E', lw, line);
  }
  // nave side wall receding behind the facade (with clerestory arches)
  inkFill(ctx, c => { c.moveTo(w * .5, -h * .6); c.lineTo(w * 1.25, -h * .5); c.lineTo(w * 1.25, 0); c.lineTo(w * .5, 0); c.closePath(); }, '#D6CDBB', lw, line);
  ctx.save(); ctx.strokeStyle = line; ctx.lineWidth = lw * .8; for (let i = 0; i < 6; i++) { const xx = w * (.58 + i * .11), yy = -h * (.42 - i * .012); ctx.beginPath(); ctx.moveTo(xx, yy + h * .12); ctx.lineTo(xx, yy); ctx.arc(xx + w * .03, yy, w * .03, Math.PI, 0); ctx.lineTo(xx + w * .06, yy + h * .12); ctx.stroke(); } ctx.restore();
  inkFill(ctx, c => { c.moveTo(w * .5, -h * .6); c.lineTo(w * 1.25, -h * .5); c.lineTo(w * 1.25, -h * .56); c.lineTo(w * .5, -h * .68); c.closePath(); }, '#B88A5E', lw, line);
  const body = c => { c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h * .62); c.lineTo(-w * .3, -h * .74); c.lineTo(-w * .3, -h * .86); c.lineTo(0, -h); c.lineTo(w * .3, -h * .86); c.lineTo(w * .3, -h * .74); c.lineTo(w / 2, -h * .62); c.lineTo(w / 2, 0); c.closePath(); };
  ctx.beginPath(); body(ctx); const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#F3EEE4'); g.addColorStop(1, '#D9D0BF'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  // grey stripes (bichrome marble) on lower level
  ctx.fillStyle = 'rgba(110,120,118,.22)'; for (let yy = -6; yy > -h * .38; yy -= h * .035) ctx.fillRect(-w / 2, yy, w, h * .012);
  // 7 blind arches, 3 portals
  for (let i = 0; i < 7; i++) { const cx = -w / 2 + w * (i + .5) / 7, aw = w / 7 * .8; ctx.beginPath(); ctx.moveTo(cx - aw / 2, 0); ctx.lineTo(cx - aw / 2, -h * .3); ctx.arc(cx, -h * .3, aw / 2, Math.PI, 0); ctx.lineTo(cx + aw / 2, 0); ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke();
    if (i === 1 || i === 3 || i === 5) { const dw = aw * (i === 3 ? .72 : .6); ctx.fillStyle = '#5E4A36'; ctx.fillRect(cx - dw / 2, -h * .2, dw, h * .2); ctx.strokeRect(cx - dw / 2, -h * .2, dw, h * .2); } }
  // loggia tiers
  const tiers = [[-h * .4, -h * .52, w * .5, 19], [-h * .53, -h * .63, w * .5, 19], [-h * .66, -h * .76, w * .3, 11], [-h * .78, -h * .87, w * .3, 9]];
  for (const [yb, yt, hw, n] of tiers) {
    ctx.fillStyle = '#6F6555'; ctx.fillRect(-hw, yt, hw * 2, yb - yt);
    for (let k = 0; k <= n; k++) { const cx = -hw + hw * 2 * k / n; ctx.fillStyle = '#FAF6EE'; ctx.fillRect(cx - lw * 1.2, yt + 3, lw * 2.4, yb - yt - 3); }
    for (let k = 0; k < n; k++) { const cx = -hw + hw * 2 * (k + .5) / n, ar = hw / n; ctx.beginPath(); ctx.arc(cx, yt + ar, ar, Math.PI, 0); ctx.lineTo(cx + ar, yt); ctx.lineTo(cx - ar, yt); ctx.fillStyle = '#EDE6D8'; ctx.fill(); }
    ctx.fillStyle = '#E4DCCB'; ctx.fillRect(-hw - 4, yb - 2, hw * 2 + 8, lw * 3); ctx.strokeStyle = line; ctx.lineWidth = lw * .7; ctx.strokeRect(-hw - 4, yb - 2, hw * 2 + 8, lw * 3);
  }
  ctx.restore();
  ctx.beginPath(); body(ctx); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = shade(line, .8); ctx.stroke();
  // statue on top + corner pinnacles
  inkFill(ctx, c => { c.ellipse(0, -h - w * .05, w * .025, w * .05, 0, 0, 7); }, '#D7CEBD', lw, line);
  for (const s of [-1, 1]) inkFill(ctx, c => { c.moveTo(s * w * .3, -h * .86); c.lineTo(s * w * .29, -h * .93); c.lineTo(s * w * .31, -h * .93); c.closePath(); }, '#D7CEBD', lw, line);
  ctx.restore();
}

// ---------- flags (real city flags of the period, simplified) ----------
function flag(ctx, x, y, kind, t, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -230); ctx.stroke(); ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = 8; ctx.stroke();
  inkFill(ctx, c => c.arc(0, -236, 11, 0, 7), '#E8C15A', 6);
  const fw = 170, fh = 115, wv = (u) => Math.sin(u * 5 + t * 6) * 9 * u;
  const cloth = c => { c.moveTo(0, -225); for (let i = 0; i <= 10; i++) { const u = i / 10; c.lineTo(u * fw, -225 + wv(u)); } for (let i = 10; i >= 0; i--) { const u = i / 10; c.lineTo(u * fw, -225 + fh + wv(u)); } c.closePath(); };
  ctx.save(); ctx.beginPath(); cloth(ctx); ctx.clip();
  const bg = { pisa: '#C8202B', genoa: '#F7F5EF', lucca: '#F7F5EF', florence: '#F7F5EF' }[kind];
  ctx.fillStyle = bg; ctx.fillRect(0, -240, fw + 20, fh + 40);
  ctx.save(); ctx.translate(fw / 2, -225 + fh / 2 + wv(.5));
  if (kind === 'genoa') { ctx.fillStyle = '#C8202B'; ctx.fillRect(-fw, -14, fw * 2, 28); ctx.fillRect(-14, -fh, 28, fh * 2); }
  if (kind === 'lucca') { ctx.fillStyle = '#C8202B'; ctx.fillRect(-fw, 0, fw * 2, fh); }
  if (kind === 'pisa') { // the croce pisana: white cross with three-ball ends
    ctx.fillStyle = '#fff'; ctx.fillRect(-9, -40, 18, 80); ctx.fillRect(-40, -9, 80, 18);
    for (const [dx, dy] of [[0, -44], [0, 44], [-44, 0], [44, 0]]) for (const [ex, ey] of (dx ? [[0, -9], [0, 9], [dx > 0 ? 9 : -9, 0]] : [[-9, 0], [9, 0], [0, dy > 0 ? 9 : -9]])) { ctx.beginPath(); ctx.arc(dx + ex, dy + ey, 8, 0, 7); ctx.fill(); }
  }
  if (kind === 'florence') { // red giglio (fleur-de-lis)
    ctx.fillStyle = '#C8202B'; ctx.beginPath(); ctx.moveTo(0, -42); ctx.quadraticCurveTo(14, -18, 0, 6); ctx.quadraticCurveTo(-14, -18, 0, -42); ctx.fill();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 6, 0); ctx.quadraticCurveTo(s * 38, -8, s * 30, -34); ctx.quadraticCurveTo(s * 22, -10, s * 4, 8); ctx.fill(); }
    ctx.fillRect(-22, 6, 44, 9); ctx.beginPath(); ctx.moveTo(-4, 15); ctx.lineTo(4, 15); ctx.lineTo(0, 40); ctx.fill();
  }
  ctx.restore();
  // fold shading
  ctx.globalAlpha = .18; for (let i = 0; i < 4; i++) { const u = (i + .5) / 4; ctx.fillStyle = Math.sin(u * 5 + t * 6) > 0 ? '#fff' : '#000'; ctx.fillRect(u * fw - fw / 8, -240, fw / 8, fh + 40); }
  ctx.restore(); ctx.beginPath(); cloth(ctx); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

// subdivide a polygon and jitter it so borders look hand-drawn and organic (never boxy)
function wobble(pts, amp = 10, seed = 3) {
  const r = rng(seed), out = [];
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const n = Math.max(2, Math.round(L / 28));
    const nx = -(b[1] - a[1]) / (L || 1), ny = (b[0] - a[0]) / (L || 1); let ph = r() * 6;
    for (let k = 0; k < n; k++) { const u = k / n; const d = (Math.sin(u * 9 + ph) * .6 + (r() - .5)) * amp * Math.sin(u * Math.PI + .2); out.push([a[0] + (b[0] - a[0]) * u + nx * d, a[1] + (b[1] - a[1]) * u + ny * d]); } }
  return out;
}
// ---------- map of Tuscany & Liguria (lon/lat → screen) ----------
const MAP_BOX = { lon0: 8.2, lon1: 12.2, lat0: 42.6, lat1: 44.75 };
function mapXY(lon, lat, m) { const k = Math.cos(43.7 * Math.PI / 180); const sx = m.w / ((MAP_BOX.lon1 - MAP_BOX.lon0) * k); return [m.x + (lon - MAP_BOX.lon0) * k * sx, m.y + (MAP_BOX.lat1 - lat) * sx]; }
// approximate coastline (lon, lat), Genoa westwards → down the Tuscan coast → Monte Argentario
const COAST = [[8.2, 44.25], [8.45, 44.32], [8.75, 44.42], [8.93, 44.41], [9.2, 44.33], [9.5, 44.2], [9.75, 44.1], [9.85, 44.06], [10.05, 44.02], [10.2, 43.93], [10.26, 43.83], [10.28, 43.7], [10.31, 43.55], [10.42, 43.4], [10.5, 43.3], [10.53, 42.98], [10.7, 42.95], [10.75, 42.88], [10.95, 42.78], [11.1, 42.6]];
const CITIES = { genoa: [8.93, 44.41], lucca: [10.5, 43.84], pisa: [10.4, 43.72], florence: [11.25, 43.77] };
function COASTW(m) { const pts = COAST.map(p => mapXY(...p, m)); const out = []; const r = rng(17);
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; for (let k = 0; k < 6; k++) { const u = k / 6; out.push([a[0] + (b[0] - a[0]) * u + (r() - .5) * 9, a[1] + (b[1] - a[1]) * u + (r() - .5) * 9]); } }
  out.push(pts[pts.length - 1]); return out; }
function tuscanyMap(ctx, m, t, opts = {}) {
  // sea
  ctx.fillStyle = '#5E9FD3'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const land = c => { const p0 = mapXY(...COAST[0], m); c.moveTo(p0[0] - 400, p0[1]); c.lineTo(p0[0] - 400, -2000); c.lineTo(W + 2000, -2000); c.lineTo(W + 2000, mapXY(...COAST[COAST.length - 1], m)[1] + 1200); c.lineTo(mapXY(...COAST[COAST.length - 1], m)[0], mapXY(...COAST[COAST.length - 1], m)[1] + 1200); COASTW(m).slice().reverse().forEach(p => c.lineTo(p[0], p[1])); c.closePath(); };
  // coastal light band
  ctx.save(); ctx.beginPath(); land(ctx); ctx.lineWidth = 70; ctx.strokeStyle = '#9CCBEA'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineWidth = 34; ctx.strokeStyle = '#B9DCF2'; ctx.stroke(); ctx.restore();
  ctx.beginPath(); land(ctx); ctx.fillStyle = '#E9D9A0'; ctx.fill();
  ctx.save(); ctx.beginPath(); land(ctx); ctx.clip();
  // regions (rough polygons) tinted: Pisa red, others neutral tones
  const reg = (pts, col, a = .55) => { ctx.beginPath(); wobble(pts.map(p => mapXY(...p, m)), 11).forEach((q, i) => { i ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.closePath(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 7; ctx.strokeStyle = shade(col, .6); ctx.setLineDash([]); ctx.stroke(); };
  reg([[8.0, 44.9], [9.6, 44.9], [9.95, 44.6], [10.05, 44.3], [9.9, 44.12], [9.75, 44.1], [8.0, 44.2]], '#CFC6B0', .9); // Genoa
  reg([[10.05, 44.3], [10.45, 44.42], [10.8, 44.2], [10.78, 43.95], [10.62, 43.8], [10.38, 43.79], [10.25, 43.86], [10.0, 44.05]], '#D8CDB2', .9); // Lucca
  reg([[10.8, 44.2], [11.4, 44.3], [12.4, 44.1], [12.4, 43.0], [11.5, 42.9], [11.05, 43.15], [10.85, 43.45], [10.62, 43.8], [10.78, 43.95]], '#CDC3AC', .9); // Florence
  reg([[10.22, 43.88], [10.38, 43.79], [10.62, 43.8], [10.85, 43.45], [11.05, 43.15], [10.9, 42.85], [10.5, 42.85], [10.4, 43.3], [10.25, 43.6]], opts.pisaCol || '#D3343A', .85); // Pisa
  // Arno river
  ctx.beginPath(); [[11.25, 43.77], [11.0, 43.73], [10.8, 43.68], [10.6, 43.7], [10.4, 43.72], [10.28, 43.68]].forEach((p, i) => { const q = mapXY(...p, m); i ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.lineWidth = 9; ctx.strokeStyle = '#7DB7E2'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); land(ctx); ctx.lineWidth = 9; ctx.strokeStyle = '#B49A62'; ctx.stroke();
  // paper texture tone
  ctx.save(); ctx.globalAlpha = .1; ctx.fillStyle = '#7a5a2a'; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore();
}
function mapLabel(ctx, text, x, y, size = 46, col = '#fff') {
  ctx.save(); ctx.font = `700 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.strokeText(text, x, y); ctx.fillStyle = col; ctx.fillText(text, x, y); ctx.restore();
}
function curvedArrow(ctx, x1, y1, x2, y2, bend, k, col = '#E0282E') {
  if (k <= 0) return; const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const pt = u => [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2];
  const n = 30, end = Math.max(.02, k); const pts = []; for (let i = 0; i <= n; i++) pts.push(pt(end * i / n));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const stroke = (w, c) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); };
  stroke(44, INK); stroke(28, col);
  const [ex, ey] = pts[n], [px, py] = pts[n - 2]; const a = Math.atan2(ey - py, ex - px);
  ctx.translate(ex, ey); ctx.rotate(a); inkFill(ctx, c => { c.moveTo(42, 0); c.lineTo(-14, -38); c.lineTo(-14, 38); c.closePath(); }, col, 9);
  ctx.restore();
}
function crossedSwords(ctx, x, y, k, t) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * .78 + Math.sin(t * 30) * .03 * s);
    inkFill(ctx, c => { c.moveTo(-9, -120); c.lineTo(0, -150); c.lineTo(9, -120); c.lineTo(9, 40); c.lineTo(-9, 40); c.closePath(); }, '#DDE3EA', 7);
    inkFill(ctx, c => c.roundRect(-42, 38, 84, 18, 8), '#E2B24A', 7); inkFill(ctx, c => c.roundRect(-9, 56, 18, 52, 7), '#6B4429', 7); ctx.restore(); }
  ctx.restore();
}

// ---------- props ----------
function pudding(ctx, x, y, s, t, wob = 1) {
  ctx.save(); ctx.translate(x, y); const sk = Math.sin(t * 13) * .08 * wob; ctx.transform(1, 0, sk, 1, 0, 0); ctx.scale(s, s * (1 + Math.sin(t * 13 + 1) * .03 * wob));
  inkFill(ctx, c => c.ellipse(0, 6, 300, 40, 0, 0, 7), '#E8E4EC', 10);
  celFill(ctx, c => { c.moveTo(-230, 0); c.bezierCurveTo(-225, -90, -200, -175, -165, -190); c.lineTo(165, -190); c.bezierCurveTo(200, -175, 225, -90, 230, 0); c.quadraticCurveTo(0, 22, -230, 0); c.closePath(); }, '#F6C66A', -40, -6, 10);
  celFill(ctx, c => { c.moveTo(-168, -186); c.lineTo(168, -186); c.quadraticCurveTo(190, -150, 170, -130); c.quadraticCurveTo(150, -150, 120, -118); c.quadraticCurveTo(90, -150, 50, -125); c.quadraticCurveTo(10, -150, -30, -112); c.quadraticCurveTo(-70, -150, -110, -126); c.quadraticCurveTo(-150, -150, -178, -132); c.quadraticCurveTo(-190, -150, -168, -186); c.closePath(); }, '#9B5A26', -20, -4, 10);
  ctx.globalAlpha = .7; inkFill(ctx, c => c.ellipse(-90, -165, 40, 10, -.1, 0, 7), '#fff', 0); ctx.globalAlpha = 1;
  ctx.restore();
}
function banana(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const path = c => { c.moveTo(-20, -330); c.bezierCurveTo(60, -250, 120, -60, 40, 230); c.quadraticCurveTo(30, 262, 10, 250); c.bezierCurveTo(50, 40, -10, -200, -60, -300); c.closePath(); };
  celFill(ctx, path, '#F7D046', -16, 0, 12);
  ctx.lineWidth = 6; ctx.strokeStyle = '#C59A23'; ctx.beginPath(); ctx.moveTo(-28, -300); ctx.bezierCurveTo(40, -200, 70, 0, 26, 230); ctx.stroke();
  inkFill(ctx, c => c.roundRect(-58, -350, 34, 46, 8), '#7A5A2A', 10);
  inkFill(ctx, c => c.ellipse(24, 250, 14, 12, 0, 0, 7), '#4A3420', 8);
  ctx.restore();
}
function sparkle(ctx, x, y, s, t, col = '#FFF2A8') {
  const k = .6 + .4 * Math.sin(t * 9); ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.rotate(t);
  inkFill(ctx, c => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 14 : 46; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); }, col, 6); ctx.restore();
}
function soilSection(ctx, y, t, sinkK) {
  // cross-section ground layers (cutaway)
  const layers = [[0, 70, '#7DB84C'], [70, 150, '#8B6B46'], [150, 520, '#9A7FA0'], [520, 900, '#C9B07A']];
  for (const [a, b, c] of layers) {
    ctx.beginPath(); ctx.moveTo(-200, y + a); for (let x = -200; x <= W + 200; x += 60) ctx.lineTo(x, y + a + Math.sin(x * .02 + a) * 8); ctx.lineTo(W + 200, y + b + 20); ctx.lineTo(-200, y + b + 20); ctx.closePath();
    ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = shade(c, .6); ctx.stroke();
  }
  // squishy clay bubbles
  const r = rng(5); ctx.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(r() * W, y + 170 + r() * 330, 6 + r() * 16 + Math.sin(t * 4 + i) * 3, 0, 7); ctx.fill(); }
}

function sunGlow(ctx, x = 120, y = 120, a = .35) {
  ctx.save(); ctx.globalCompositeOperation = 'soft-light';
  const g = ctx.createRadialGradient(x, y, 50, x, y, 1500); g.addColorStop(0, `rgba(255,236,170,${a * 2})`); g.addColorStop(1, 'rgba(60,40,90,0.25)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore();
}
