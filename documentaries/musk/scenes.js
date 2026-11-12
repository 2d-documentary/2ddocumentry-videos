// Elon Musk: The Man Who Bet Everything — Unfiled Films (16:9). Bright editorial motion graphics, real photos.
'use strict';
const EP = { images: {}, credit: {}, billCrop: [12, 12, 1176, 481], scenes };
// still frames pulled from Commons videos by the fetcher (archives/footage/<id>_f<N>.jpg)
for (let i = 0; i < 14; i++) { EP.images['catch_f' + i] = `archives/footage/catch_vid_f${i}.jpg`; EP.images['ift1_f' + i] = `archives/footage/ift1_vid_f${i}.jpg`; EP.images['ift1b_f' + i] = `archives/footage/ift1_vid2_f${i}.jpg`; }
const PLACES = { PRETORIA: [28.19, -25.75], KINGSTON: [-76.48, 44.23], PHILLY: [-75.19, 39.95], PALOALTO: [-122.14, 37.44], LA: [-118.35, 33.92],
  MOSCOW: [37.62, 55.75], SYDNEY: [151.2, -33.87], SANJOSE: [-121.89, 37.34] };
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const CATCH = 'catch_f10', BOOM = 'ift1_f9';           // chosen frames (see manifest frames)
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };

// ---------------------------------------------------------------- helpers
function stars(ctx, t, n = 160, sp = 6, a = .9) {
  ctx.save(); for (let i = 0; i < n; i++) { const x = (hash(i * 3) * W + t * sp * (.3 + hash(i) * 1.5)) % W, y = hash(i * 7) * H, r = .6 + hash(i * 11) * 1.8;
    ctx.globalAlpha = a * (.4 + .6 * Math.abs(Math.sin(t * (1 + hash(i)) + i))); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } ctx.restore();
}
function spaceBG(ctx, t, tint = C.violet) {
  bgGrad(ctx, '#0B1230', C.space, 'r'); const g = ctx.createRadialGradient(W * .75, H * .2, 0, W * .75, H * .2, W * .7);
  g.addColorStop(0, tint + '55'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); stars(ctx, t);
}
function worldMap(ctx, t, v, o = {}) {
  const pr = geoProj(v); bgGrad(ctx, '#0A1838', '#040815', 'r');
  ctx.save(); ctx.strokeStyle = 'rgba(120,180,255,.07)'; ctx.lineWidth = 1.5;
  for (let lo = -180; lo <= 180; lo += 15) { const [x0, y0] = pr(lo, -80), [x1, y1] = pr(lo, 80); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  for (let la = -75; la <= 75; la += 15) { const [x0, y0] = pr(-180, la), [x1, y1] = pr(180, la); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  ctx.fillStyle = o.land || '#16305E'; ctx.strokeStyle = o.coast || 'rgba(110,200,255,.75)'; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(80,180,255,.6)'; ctx.shadowBlur = 12;
  GEO_WORLD.land.forEach(r => { geoPath(ctx, r, pr, true); ctx.fill(); }); ctx.shadowBlur = 0; GEO_WORLD.land.forEach(r => { geoPath(ctx, r, pr, true); ctx.stroke(); });
  ctx.restore(); return pr;
}
const mapAt = (k) => (pr) => pr(...PLACES[k]);
function chapter(ctx, t, t0, num, title, col) {
  const p = E.out(prog(t, t0, t0 + .4)); if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = col; ctx.fillRect(110, 140, 10, 60);
  text(ctx, 'CHAPTER ' + num, 140, 186, { font: F.osw, size: 40, color: col, weight: 600, ls: 8 });
  text(ctx, title, 140, 250, { font: F.osw, size: 34, color: 'rgba(246,240,228,.85)', weight: 400, ls: 5 }); ctx.restore();
}
function rocket(ctx, x, y, s, t, o = {}) { // Falcon-ish silhouette, nose up, base at (x,y)
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  if (o.flame) { const f = 1 + .25 * Math.sin(t * 40); const g = ctx.createLinearGradient(0, 0, 0, 140 * f); g.addColorStop(0, '#FFF6D0'); g.addColorStop(.3, '#FFB23A'); g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(0, 160 * f, 14, 0); ctx.fill(); }
  ctx.fillStyle = o.color || '#F2F4F8'; ctx.fillRect(-14, -200, 28, 200); ctx.beginPath(); ctx.moveTo(-14, -200); ctx.quadraticCurveTo(0, -250, 14, -200); ctx.fill();
  ctx.fillStyle = '#1A1E26'; ctx.fillRect(-14, -150, 28, 6); ctx.fillRect(-14, -12, 28, 12);
  ctx.fillStyle = o.color || '#F2F4F8'; ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(-26, 0); ctx.lineTo(-14, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(14, -30); ctx.lineTo(26, 0); ctx.lineTo(14, 0); ctx.fill();
  ctx.restore();
}
function bigX(ctx, x, y, r, p, col = C.tred) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20;
  const a = E.out(clamp(p * 2)), b = E.out(clamp(p * 2 - 1));
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
  if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); } ctx.restore();
}
function tick(ctx, x, y, r, p, col = C.lime) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20;
  const q = E.out(clamp(p)); ctx.beginPath(); ctx.moveTo(x - r, y); const k = clamp(q * 2); ctx.lineTo(x - r + r * .7 * k, y + r * .7 * k);
  if (q > .5) { const m = (q - .5) * 2; ctx.lineTo(x - r * .3 + r * 1.4 * m, y + r * .7 - r * 1.5 * m); } ctx.stroke(); ctx.restore();
}
function pill(ctx, s, x, y, o = {}) { // rounded label
  ctx.save(); ctx.font = `${o.weight || 600} ${o.size || 40}px ${o.font || F.osw}`; if (o.ls) ctx.letterSpacing = o.ls + 'px'; const w = ctx.measureText(s).width, h = (o.size || 40) * 1.6;
  const ax = o.align === 'center' ? x - w / 2 - 28 : x; ctx.globalAlpha = o.alpha ?? 1; ctx.fillStyle = o.bg || C.tred; ctx.beginPath(); ctx.roundRect(ax, y - h * .7, w + 56, h, h / 2); ctx.fill();
  ctx.fillStyle = o.color || '#fff'; ctx.fillText(s, ax + 28, y + (o.size || 40) * .12); ctx.restore(); return w + 56;
}
function popIn(ctx, t, t0, x, y, fn, d = .35) { const p = prog(t, t0, t0 + d); if (p <= 0) return; const s = Math.max(0, E.back(p)); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 3); fn(ctx); ctx.restore(); }
function postCard(ctx, cx, cy, w, msg, t, t0, o = {}) { // generic social post (no platform branding)
  const h = o.h || 330, p = E.out(prog(t, t0, t0 + .35)); if (p <= 0) return;
  ctx.save(); ctx.translate(cx, cy + (1 - p) * 60); ctx.globalAlpha = p; ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 50;
  ctx.fillStyle = o.bg || '#101418'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 28); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#2C3440'; ctx.beginPath(); ctx.arc(-w / 2 + 70, -h / 2 + 72, 38, 0, 7); ctx.fill();
  if (o.avatar && IMG[o.avatar]) { ctx.save(); ctx.beginPath(); ctx.arc(-w / 2 + 70, -h / 2 + 72, 38, 0, 7); ctx.clip(); const im = IMG[o.avatar], cp = o.crop || [0, 0, im.width, im.height];
    ctx.drawImage(im, cp[0], cp[1], cp[2], cp[3], -w / 2 + 32, -h / 2 + 34, 76, 76); ctx.restore(); }
  text(ctx, o.name || 'Elon Musk', -w / 2 + 128, -h / 2 + 66, { font: F.osw, size: 36, color: '#fff', weight: 600 });
  text(ctx, (o.handle || '@elonmusk') + (o.date ? '  ·  ' + o.date : ''), -w / 2 + 128, -h / 2 + 104, { font: F.osw, size: 28, color: 'rgba(255,255,255,.55)', weight: 400 });
  const n = Math.floor(clamp((t - t0 - .25) * 26, 0, msg.length)); const words = msg.slice(0, n);
  wrapText(ctx, words, -w / 2 + 50, -h / 2 + 178, w - 100, 56, { font: F.osw, size: 46, color: '#fff', weight: 400 });
  ctx.restore();
}
function wrapText(ctx, s, x, y, maxW, lh, o) {
  ctx.save(); ctx.font = `${o.weight || ''} ${o.size}px ${o.font}`.trim(); let line = '', yy = y;
  s.split(' ').forEach(w => { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { text(ctx, line, x, yy, o); line = w; yy += lh; } else line = test; });
  if (line) text(ctx, line, x, yy, o); ctx.restore();
}
function money(v) { // $ formatter with short scale words
  if (v >= 1e12) return '$' + (v / 1e12).toFixed(1) + ' TRILLION'; if (v >= 1e9) return '$' + (v / 1e9).toFixed(v >= 1e10 ? 0 : 1) + ' BILLION';
  if (v >= 1e6) return '$' + Math.round(v / 1e6) + ' MILLION'; return '$' + Math.round(v).toLocaleString('en-US');
}
function moneyCount(ctx, t, t0, v0, v1, x, y, o = {}) { const p = E.out(prog(t, t0, t0 + (o.dur || 1.1))); if (t < t0) return;
  glowText(ctx, money(lerp(v0, v1, p)), x, y, { font: F.bebas, size: o.size || 170, color: o.color || C.gold, align: o.align || 'center', glow: o.glow || 'rgba(255,190,60,.6)', blur: 30 }); }
function frame(ctx, key, x, y, w, h, o = {}) { // photo in a framed card with optional label
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(o.rot || 0); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = o.border || '#fff';
  ctx.fillRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20); ctx.restore();
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(o.rot || 0); ctx.translate(-w / 2, -h / 2); photo(ctx, key, { x: 0, y: 0, w, h, zoom: o.zoom || 1.03, fx: o.fx, fy: o.fy, grade: o.grade || 'color', tint: o.tint, tintAmt: o.tintAmt }); ctx.restore();
  if (o.label) pill(ctx, o.label, x + w / 2, y + h + 50, { align: 'center', bg: o.labelBg || C.tred, size: 34 });
}
function snow(ctx, t, n = 120) { ctx.save(); ctx.fillStyle = '#fff'; for (let i = 0; i < n; i++) { const x = (hash(i) * W + Math.sin(t + i) * 30) % W, y = (hash(i * 5) * H + t * (60 + hash(i * 9) * 90)) % H;
  ctx.globalAlpha = .4 + hash(i * 2) * .5; ctx.beginPath(); ctx.arc(x, y, 1.5 + hash(i * 3) * 3, 0, 7); ctx.fill(); } ctx.restore(); }
function speedLines(ctx, t, col = 'rgba(255,255,255,.18)') { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3;
  for (let i = 0; i < 60; i++) { const a = hash(i) * Math.PI * 2, r0 = 200 + ((t * 900 + hash(i * 3) * 2000) % 1400); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0);
    ctx.lineTo(W / 2 + Math.cos(a) * (r0 + 160), H / 2 + Math.sin(a) * (r0 + 160)); ctx.stroke(); } ctx.restore(); }
function cracks(ctx, x, y, p, n = 14) { if (p <= 0) return; ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.shadowColor = '#fff'; ctx.shadowBlur = 6;
  for (let i = 0; i < n; i++) { let a = i / n * Math.PI * 2 + hash(i) * .3, r = 0, px = x, py = y; ctx.beginPath(); ctx.moveTo(x, y);
    const L = (140 + hash(i * 5) * 260) * E.out(p); while (r < L) { r += 40; a += (hash(i * 13 + r) - .5) * .5; px = x + Math.cos(a) * r; py = y + Math.sin(a) * r; ctx.lineTo(px, py); } ctx.stroke(); }
  ctx.beginPath(); ctx.arc(x, y, 30 * E.out(p), 0, 7); ctx.stroke(); ctx.restore(); }
function boom(ctx, x, y, t, t0, r = 400) { const p = prog(t, t0, t0 + .9); if (p <= 0 || p >= 1) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * E.out(p)); g.addColorStop(0, `rgba(255,250,220,${1 - p})`); g.addColorStop(.4, `rgba(255,150,40,${.8 * (1 - p)})`); g.addColorStop(1, 'rgba(255,60,20,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function embers(ctx, t, a) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, H, 0, H * .35);
  g.addColorStop(0, `rgba(255,110,30,${.55 * a})`); g.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { const lt = (t * (.25 + hash(i) * .4) + hash(i * 3)) % 1, x = hash(i * 7) * W + Math.sin(t * 2 + i) * 40, y = H - lt * H * .9;
    ctx.globalAlpha = a * (1 - lt); ctx.fillStyle = i % 3 ? '#FFB347' : '#FF5A1F'; ctx.beginPath(); ctx.arc(x, y, 2 + hash(i * 5) * 4, 0, 7); ctx.fill(); } ctx.restore(); }
function shelf(ctx, t, lt) { // encyclopedia set, drawn
  bgGrad(ctx, '#3A2414', '#140A04'); const cols = ['#7A1E1E', '#1E3A7A', '#1E5A3A', '#6A4A1A'], n = 22, bw = 74, x0 = W / 2 - n * bw / 2 - lt * 20;
  for (let r = 0; r < 2; r++) { const y = 180 + r * 420; ctx.fillStyle = '#5A3A1E'; ctx.fillRect(0, y + 360, W, 40);
    for (let i = 0; i < n; i++) { const x = x0 + i * bw + r * 30, h = 330 + hash(i + r * 31) * 30; ctx.fillStyle = cols[(i + r) % 4]; ctx.fillRect(x, y + 360 - h, bw - 6, h);
      ctx.fillStyle = 'rgba(255,215,120,.85)'; ctx.fillRect(x + 8, y + 360 - h + 40, bw - 22, 4); ctx.fillRect(x + 8, y + 360 - 60, bw - 22, 4);
      text(ctx, String.fromCharCode(65 + (i + r * n) % 26), x + (bw - 6) / 2, y + 360 - h + 110, { font: F.play, size: 40, color: 'rgba(255,215,120,.9)', align: 'center', weight: 700 }); } }
}
function vign(ctx, a = .6) { const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function camPhoto(ctx, key, lt, o = {}) { photo(ctx, key, { zoom: (o.z0 ?? 1.05) + lt * (o.zs ?? .025), fx: o.fx ?? .5, fy: o.fy ?? .5, grade: o.grade || 'color', tint: o.tint, tintAmt: o.tintAmt, blur: o.blur }); }
function hudRockets(ctx, t, t0, x, y, o = {}) { // three failed rockets
  for (let i = 0; i < 3; i++) { const st = t0 + i * .22; if (t < st) continue; const p = E.back(prog(t, st, st + .3));
    rocket(ctx, x + i * 150, y, .9 * Math.max(0, p), t, { color: '#DDE3EE' }); bigX(ctx, x + i * 150, y - 110, 60, prog(t, st + .25, st + .6)); }
}
function sticky(ctx, s, x, y, rot, p, col = '#FFE45C') { if (p <= 0) return; const sc = lerp(1.3, 1, E.out(p)); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 3);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.fillStyle = col; ctx.fillRect(-230, -150, 460, 300); ctx.shadowBlur = 0;
  const ls = s.split('\n'); ls.forEach((l, i) => text(ctx, l, 0, -30 + i * 80 - (ls.length - 1) * 30, { font: F.hand, size: 74, color: '#1A1A1A', align: 'center', weight: 700 })); ctx.restore(); }
function sinkIcon(ctx, s) { ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#D8DEE6'; ctx.strokeStyle = '#8A96A6'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(-200, -40, 400, 150, 30); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#AEB8C6'; ctx.beginPath(); ctx.roundRect(-170, -20, 340, 100, 24); ctx.fill();
  ctx.fillStyle = '#C9D1DC'; ctx.fillRect(-12, -150, 24, 110); ctx.beginPath(); ctx.roundRect(-12, -160, 120, 26, 12); ctx.fill(); ctx.fillRect(84, -160, 24, 50); ctx.restore(); }
function bird(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#7EC8FF'; const f = Math.sin(t * 18) * .6;
  ctx.beginPath(); ctx.ellipse(0, 0, 60, 34, -.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(50, -28, 24, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(70, -30); ctx.lineTo(100, -22); ctx.lineTo(70, -18); ctx.fill();
  ctx.save(); ctx.rotate(-f); ctx.beginPath(); ctx.moveTo(-10, -10); ctx.quadraticCurveTo(-40, -110, -90, -90); ctx.quadraticCurveTo(-50, -40, -20, 0); ctx.fill(); ctx.restore(); ctx.restore(); }
function gauge(ctx, x, y, r, v, label) { ctx.save(); ctx.lineWidth = 30; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.stroke();
  const g = ctx.createLinearGradient(x - r, 0, x + r, 0); g.addColorStop(0, C.tred); g.addColorStop(.5, C.gold); g.addColorStop(1, C.lime); ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, Math.PI + Math.PI * v); ctx.stroke();
  ctx.translate(x, y); ctx.rotate(Math.PI + Math.PI * v); ctx.fillStyle = '#fff'; ctx.fillRect(0, -6, r - 40, 12); ctx.restore();
  ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fill(); ctx.restore();
  text(ctx, label, x, y + 90, { font: F.osw, size: 40, color: C.cream, align: 'center', weight: 600, ls: 6 }); }
function bowl(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#F2EBDD'; ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI); ctx.fill(); ctx.fillStyle = C.tred; ctx.fillRect(-160, -6, 320, 14);
  ctx.strokeStyle = '#F7D58A'; ctx.lineWidth = 6; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-120 + i * 30, 0); ctx.quadraticCurveTo(-100 + i * 30, -60 + Math.sin(t * 3 + i) * 10, -80 + i * 30 + 20, -120 - i * 4); ctx.stroke(); }
  ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(40, -260); ctx.lineTo(-20, -110); ctx.stroke(); ctx.beginPath(); ctx.moveTo(90, -250); ctx.lineTo(10, -100); ctx.stroke(); ctx.restore(); }

// ---------------------------------------------------------------- scenes
function scenes() {
  // ======== COLD OPEN
  shot(['M001', 'In'], (ctx, t, lt) => {
    gridBG(ctx, t, '#07101F', 'rgba(56,214,232,.08)', 64, 8); vign(ctx, .7);
    glowText(ctx, '2008', 160, 260, { font: F.bebas, size: 230, color: C.cream, glow: 'rgba(56,214,232,.5)' });
    if (t > T('M001', 'three')) { hudRockets(ctx, t, T('M001', 'three'), 260, 820); text(ctx, '3 FAILED ROCKETS', 400, 930, { font: F.osw, size: 44, color: C.tred, align: 'center', weight: 600, ls: 6, alpha: prog(t, T('M001', 'failed'), T('M001', 'failed') + .3) }); }
    if (t > T('M001', 'car')) { const p = prog(t, T('M001', 'car'), T('M001', 'car') + .4), x = 1000, y = 560;
      ctx.save(); ctx.globalAlpha = p; text(ctx, 'TESLA · CASH', x, y - 30, { font: F.osw, size: 40, color: C.cream, weight: 600, ls: 6 });
      ctx.strokeStyle = C.cream; ctx.lineWidth = 6; ctx.strokeRect(x, y, 640, 110); const lv = lerp(.9, .07, E.inOut(prog(t, T('M001', 'car'), T('M001', 'cash', 'e') + .5)));
      ctx.fillStyle = lv < .25 ? C.tred : C.lime; ctx.fillRect(x + 10, y + 10, 620 * lv, 90); ctx.fillRect(x + 646, y + 30, 18, 50); ctx.restore(); }
    if (t > T('M001', 'one')) popIn(ctx, t, T('M001', 'one'), 1320, 880, c => pill(c, '1 MORE TRY', 0, 0, { align: 'center', bg: C.gold, color: '#111', size: 64 }));
    scanlines(ctx, .06); fadeIn(ctx, t, 0, .4);
  }, { lead: .35, name: 'open-2008' });
  cue(T('M001', 'three'), 'thud', .5); cue(T('M001', 'three') + .22, 'thud', .5); cue(T('M001', 'three') + .44, 'thud', .5); cue(T('M001', 'one'), 'ding', .6);
  shot(['M002', 'In'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_laugh', lt, { tint: 'gold', tintAmt: .55, grade: 'warm', fx: .45, fy: .35 }); shade(ctx, .45); lightLeak(ctx, t, .35, 3);
    glowText(ctx, '2026', W / 2, 330, { font: F.bebas, size: 200, color: C.cream, align: 'center', glow: 'rgba(255,195,77,.6)' });
    moneyCount(ctx, t, T('M002', 'first'), 1e9, 1e12, W / 2, 650, { size: 220, dur: 1.4 });
    if (t > T('M002', 'trillionaire')) text(ctx, "WORLD'S FIRST TRILLIONAIRE", W / 2, 790, { font: F.osw, size: 56, color: '#fff', align: 'center', weight: 600, ls: 10, alpha: prog(t, T('M002', 'trillionaire'), T('M002', 'trillionaire') + .3) });
    sourceTag(ctx, credit('p_laugh'));
  }, { name: 'open-2026' });
  cue(T('M002', 'In'), 'impact', .7); cue(T('M002', 'first'), 'riser', .5); cue(T('M002', 'trillionaire'), 'cash', .8);
  shot(['M003', "That's"], (ctx, t, lt) => {
    bgGrad(ctx, '#1A1200', '#000', 'r'); speedLines(ctx, t, 'rgba(255,195,77,.12)');
    punch(ctx, '$1,000,000,000,000', W / 2, 420, t, T('M003', "That's"), { font: F.bebas, size: 210, color: C.gold });
    if (t > T('M003', 'With')) { const p = prog(t, T('M003', 'With'), T('M003', 'With') + .3); ctx.save(); ctx.globalAlpha = p; text(ctx, 'WITH A', W / 2 - 140, 760, { font: F.bebas, size: 150, color: '#fff', align: 'center' }); ctx.restore();
      popIn(ctx, t, T('M003', 'T.'), W / 2 + 200, 700, c => { glowText(c, 'T', 0, 60, { font: F.bebas, size: 300, color: C.gold, align: 'center', glow: 'rgba(255,195,77,.9)', blur: 50 }); }); }
  }, { name: 'trillion-T' });
  cue(T('M003', 'T.'), 'impact', .8);
  shot(['M004', 'His'], (ctx, t, lt) => {
    photo(ctx, 'p_royal', { x: 0, y: 0, w: W * .5, h: H, zoom: 1.08 + lt * .015, fy: .3, grade: 'color' });
    ctx.fillStyle = '#0B1024'; ctx.fillRect(W * .5, 0, W * .5, H);
    bigTitle(ctx, 'ELON MUSK', 1040, 330, t, T('M004', 'Elon'), { size: 200, bar: C.teal });
    if (t > T('M004', 'genius')) popIn(ctx, t, T('M004', 'genius'), 1240, 520, c => pill(c, 'GENIUS?', 0, 0, { align: 'center', bg: C.teal, color: '#041014', size: 60 }));
    if (t > T('M004', 'meme')) popIn(ctx, t, T('M004', 'meme'), 1560, 660, c => pill(c, 'WALKING MEME?', 0, 0, { align: 'center', bg: C.violet, size: 60 }));
    if (t > T('M004', 'Probably')) stamp(ctx, 'BOTH.', 1420, 880, t, T('M004', 'Probably'), { size: 150, color: C.gold, rot: -.08 });
    sourceTag(ctx, credit('p_royal'));
  }, { name: 'name' });
  cue(T('M004', 'genius'), 'ding', .5); cue(T('M004', 'meme'), 'ding', .5); cue(T('M004', 'Probably'), 'stamp');
  shot(['M005', 'But'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_2008c', lt, { grade: 'bw', tint: 'red', tintAmt: .5, fx: .4 }); shade(ctx, .45); vign(ctx, .7);
    wipeText(ctx, 'HOW CLOSE HE CAME', 140, 470, prog(t, T('M005', 'close'), T('M005', 'close') + .4), { size: 130, color: '#fff' });
    wipeText(ctx, 'TO LOSING IT ALL', 140, 620, prog(t, T('M005', 'losing'), T('M005', 'losing') + .4), { size: 130, color: C.tred });
    if (t > T('M005', 'Hold')) sticky(ctx, 'HOLD THAT\nTHOUGHT', 1480, 760, .06, prog(t, T('M005', 'Hold'), T('M005', 'Hold') + .3));
    sourceTag(ctx, credit('p_2008c'));
  }, { name: 'hook-loop' });
  cue(T('M005', 'Hold'), 'paper', .7);
  shot(['M006', 'This'], (ctx, t, lt) => {
    camPhoto(ctx, IMG.f9_arc ? 'f9_arc' : 'f9_trail', lt, { z0: 1.12, zs: .02, grade: 'color' }); shade(ctx, .35); lightLeak(ctx, t, .25, 5, 'cool');
    bigTitle(ctx, 'ELON MUSK', W / 2, 520, t, T('M006', 'Elon') - .2, { size: 260, align: 'center', bar: C.tred });
    text(ctx, 'THE MAN WHO BET EVERYTHING', W / 2, 640, { font: F.osw, size: 58, color: C.cream, align: 'center', weight: 500, ls: 16, alpha: prog(t, T('M006', 'Musk'), T('M006', 'Musk') + .5) });
    text(ctx, 'AN UNFILED FILMS DOCUMENTARY', W / 2, 980, { font: F.play, size: 30, color: 'rgba(246,240,228,.7)', align: 'center', weight: 700, ls: 8 });
    sourceTag(ctx, credit(IMG.f9_arc ? 'f9_arc' : 'f9_trail')); fadeOut(ctx, t, T('M007', 'Pretoria') - .1, .35);
  }, { name: 'title' });
  cue(T('M006', 'This') - .1, 'riser', .6); cue(T('M006', 'Elon'), 'hit', .8);

  // ======== CH1 CHILDHOOD
  shot(['M007', 'Pretoria'], (ctx, t, lt) => {
    const z = lerp(260, 1400, E.inOut(prog(t, T('M007', 'Pretoria'), T('M007', 'Pretoria') + 1.6)));
    const pr = worldMap(ctx, t, { lon: lerp(10, 28.19, clamp(z / 1400)), lat: lerp(10, -25.75, clamp(z / 1400)) * 1, k: z / 100 * 1.0, theme: 'night' });
    pin(ctx, ...pr(...PLACES.PRETORIA), t, T('M007', 'Pretoria') + 1.2, 'PRETORIA, SOUTH AFRICA', { color: C.gold });
    timeStamp(ctx, '28 JUNE 1971', 140, 960, t, T('M007', 'June'), { size: 96, bg: 'rgba(5,10,22,.85)', color: C.gold });
    chapter(ctx, t, T('M007', 'Pretoria'), 1, 'THE KID WHO READ EVERYTHING', C.gold);
  }, { name: 'pretoria' });
  cue(T('M007', 'June'), 'stamp', .5);
  shot(['M008', 'As'], (ctx, t, lt) => {
    shelf(ctx, t, lt); vign(ctx);
    if (t > T('M008', 'encyclopedia')) { wipeText(ctx, 'THE ENCYCLOPEDIA', 140, 520, prog(t, T('M008', 'encyclopedia'), T('M008', 'encyclopedia') + .4), { size: 150, color: '#fff' }); }
    if (t > T('M008', 'fun.')) stamp(ctx, 'FOR FUN.', 1450, 820, t, T('M008', 'fun.'), { size: 150, color: C.gold });
  }, { name: 'books' });
  cue(T('M008', 'fun.'), 'stamp');
  shot(['M009', 'At'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B2230', '#07090D', 'r'); dust(ctx, t, 50, .25);
    personIcon(ctx, W / 2, 700, 4.5 + lt * .05, '#3A4558');
    [[-1, 0], [1, 0], [-1.6, .2], [1.6, .2]].forEach(([dx, dy], i) => { const p = prog(t, T('M009', 'bullied') + i * .1, T('M009', 'bullied') + i * .1 + .4); if (p > 0) personIcon(ctx, W / 2 + dx * 260 * p + dx * 40, 700 + dy * 60, 5.5, `rgba(20,24,32,${p})`); });
    text(ctx, 'SMALL. NERDY. BULLIED.', W / 2, 260, { font: F.bebas, size: 120, color: C.cream, align: 'center', alpha: prog(t, T('M009', 'small'), T('M009', 'small') + .3) });
  }, { name: 'bullied' });
  shot(['M010', 'So'], (ctx, t, lt) => {
    gridBG(ctx, t, '#06140A', 'rgba(120,255,140,.08)', 48, 10);
    card(ctx, 'blastar', { cx: 560, cy: 520, maxW: 760, maxH: 620, rot: -.03, scale: 1 + lt * .01 });
    if (t > T('M010', 'Blastar')) { const p = prog(t, T('M010', 'Blastar'), T('M010', 'Blastar') + .4); ctx.save(); ctx.globalAlpha = p;
      glowText(ctx, 'BLASTAR', 1420, 360, { font: F.mono, size: 130, color: C.lime, align: 'center', glow: 'rgba(120,255,140,.8)', weight: 700 });
      rocket(ctx, 1420 + Math.sin(t * 3) * 120, 640, .7, t, { color: C.lime, flame: true }); ctx.restore(); }
    if (t > T('M010', 'five')) moneyCount(ctx, t, T('M010', 'five'), 0, 500, 1420, 920, { size: 150, dur: .7 });
    timeStamp(ctx, 'AGE 12', 140, 140, t, T('M010', 'twelve'), { size: 80, color: C.lime });
    sourceTag(ctx, 'Blastar source code, 1984 · ' + (cr('blastar') || 'public domain'));
  }, { name: 'blastar' });
  cue(T('M010', 'Blastar'), 'key', .6); cue(T('M010', 'five'), 'cash', .7);
  shot(['M011', 'Twelve'], (ctx, t, lt) => {
    ctx.fillStyle = '#06140A'; ctx.fillRect(0, 0, W / 2, H); ctx.fillStyle = C.navy; ctx.fillRect(W / 2, 0, W / 2, H);
    card(ctx, 'blastar', { cx: W / 4, cy: 470, maxW: 640, maxH: 480, rot: -.03 }); text(ctx, 'AGE 12: SPACE GAME', W / 4, 860, { font: F.bebas, size: 90, color: C.lime, align: 'center' });
    if (t > T('M011', 'Some')) { photo(ctx, 'f9_lz1', { x: W / 2 + 120, y: 200, w: W / 2 - 240, h: 520, grade: 'color' }); text(ctx, 'LATER: SPACE COMPANY', W * .75, 860, { font: F.bebas, size: 90, color: C.teal, align: 'center', alpha: prog(t, T('M011', 'Some'), T('M011', 'Some') + .3) }); }
    else text(ctx, '?', W * .75, 560, { font: F.bebas, size: 300, color: 'rgba(255,255,255,.2)', align: 'center' });
  }, { name: 'some-things' });
  cue(T('M011', 'Some'), 'whoosh', .6);
  shot(['M012', 'At'], (ctx, t, lt) => {
    const pr = worldMap(ctx, t, { lon: -25, lat: 12, k: 5.6, theme: 'night' });
    const pa = pr(...PLACES.PRETORIA), pk = pr(...PLACES.KINGSTON), pp = pr(...PLACES.PHILLY);
    pin(ctx, ...pa, t, T('M012', 'At'), 'PRETORIA', { color: C.gold }); route(ctx, pa, pk, prog(t, T('M012', 'Canada') - .5, T('M012', 'Canada') + .5), { plane: true, color: C.teal, ctrl: [(pa[0] + pk[0]) / 2, 120] });
    pin(ctx, ...pk, t, T('M012', 'Canada'), 'CANADA · AGE 17', { color: C.teal, left: true });
    pin(ctx, ...pp, t, T('M012', 'United'), 'USA · PHYSICS + ECONOMICS', { color: C.tred, size: 38 });
  }, { name: 'move-west' });
  cue(T('M012', 'Canada') - .4, 'whoosh', .5);
  shot(['M013', 'In'], (ctx, t, lt) => {
    camPhoto(ctx, 'stanford', lt, { grade: 'warm', fy: .4 }); shade(ctx, .35);
    timeStamp(ctx, '1995 · STANFORD PhD', 140, 200, t, T('M013', 'In'), { size: 80 });
    if (t > T('M013', 'lasts')) { const n = t > T('M013', 'days.') ? 2 : 1; text(ctx, 'DAY ' + n, W / 2, 620, { font: F.bebas, size: 260, color: '#fff', align: 'center', shadow: 30 }); }
    if (t > T('M013', 'days.') + .3) stamp(ctx, 'DROPPED OUT', W / 2, 820, t, T('M013', 'days.') + .3, { size: 120 });
    sourceTag(ctx, credit('stanford'));
  }, { name: 'stanford' });
  cue(T('M013', 'days.') + .3, 'stamp');
  shot(['M014', 'Two'], (ctx, t, lt) => {
    bgGrad(ctx, '#F4E9D2', '#E2D2B2'); const t0 = T('M014', 'Some');
    const bars = [['STANFORD PhD', 2, C.tred], ['RETURNING SHOES', 30, C.xblue]];
    bars.forEach(([l, d, col], i) => { const p = E.out(prog(t, t0 + i * .5, t0 + i * .5 + .7)), y = 430 + i * 260;
      text(ctx, l, 200, y - 30, { font: F.osw, size: 52, color: '#1A1A1A', weight: 600, ls: 4 }); ctx.fillStyle = col; ctx.fillRect(200, y, 1400 * d / 30 * p + 12, 110);
      text(ctx, d + ' DAYS', 230 + 1400 * d / 30 * p + 12, y + 82, { font: F.bebas, size: 90, color: '#1A1A1A' }); });
    text(ctx, 'TIME COMMITTED', W / 2, 200, { font: F.bebas, size: 110, color: '#1A1A1A', align: 'center' });
  }, { name: 'shoes' });
  cue(T('M014', 'Some'), 'whoosh', .5);
  shot(['M015', 'Because'], (ctx, t, lt) => {
    bgGrad(ctx, '#0A6E6E', '#043030'); const bx = 360, by = 220, bw = 1200, bh = 640;
    ctx.fillStyle = '#C0C0C0'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = '#000080'; ctx.fillRect(bx + 8, by + 8, bw - 16, 56); text(ctx, 'Netscape-style browser · 1995', bx + 30, by + 50, { font: F.mono, size: 30, color: '#fff' });
    ctx.fillStyle = '#fff'; ctx.fillRect(bx + 20, by + 90, bw - 40, bh - 120);
    text(ctx, 'THE INTERNET', bx + bw / 2, by + 300, { font: F.bebas, size: 150, color: '#000080', align: 'center' });
    const p = prog(t, T('M015', 'Because'), T('M015', 'in.', 'e')); ctx.fillStyle = '#ddd'; ctx.fillRect(bx + 200, by + 420, bw - 400, 50); ctx.fillStyle = '#1D9BF0'; ctx.fillRect(bx + 200, by + 420, (bw - 400) * p, 50);
    text(ctx, 'LOADING... ' + Math.round(p * 100) + '%', bx + bw / 2, by + 540, { font: F.mono, size: 36, color: '#333', align: 'center' });
    if (t > T('M015', 'Elon')) stamp(ctx, 'ELON WANTS IN', 1400, 900, t, T('M015', 'Elon'), { size: 90, color: C.tred });
  }, { name: 'internet' });
  cue(T('M015', 'Elon'), 'stamp', .7);

  // ======== CH2 ZIP2 + PAYPAL
  shot(['M016', 'With'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0C1A2E', 'rgba(255,255,255,.07)', 80, 0); chapter(ctx, t, T('M016', 'With'), 2, 'THE FIRST MILLIONS', C.teal);
    for (let i = 0; i < 9; i++) { const st = T('M016', 'guide') + i * .1; if (t > st) pin(ctx, 300 + hash(i * 3) * 1300, 360 + hash(i * 7) * 520, t, st, null, { color: C.teal }); }
    glowText(ctx, 'ZIP2', 1460, 520, { font: F.bebas, size: 260, color: '#fff', align: 'center', glow: 'rgba(56,214,232,.7)', alpha: prog(t, T('M016', 'Zip2,'), T('M016', 'Zip2,') + .3) });
    if (t > T('M016', 'guide')) text(ctx, 'ONLINE CITY GUIDE + MAPS', 1460, 640, { font: F.osw, size: 44, color: C.teal, align: 'center', weight: 600, ls: 6 });
    if (t > T('M016', 'Kimbal,')) pill(ctx, 'WITH BROTHER KIMBAL', 140, 960, { bg: C.violet, size: 38 });
  }, { name: 'zip2' });
  cue(T('M016', 'Zip2,'), 'hit', .6);
  shot(['M017', 'Money'], (ctx, t, lt) => {
    camPhoto(ctx, 'ymca', lt, { grade: 'color', tint: 'blue', tintAmt: .3 }); shade(ctx, .4);
    const items = [['SLEPT IN THE OFFICE', 'office'], ['SHOWERED AT THE YMCA', 'showers']];
    items.forEach(([s, w], i) => { if (t < T('M017', w)) return; const y = 420 + i * 200; tick(ctx, 220, y - 30, 50, prog(t, T('M017', w), T('M017', w) + .4));
      text(ctx, s, 320, y, { font: F.bebas, size: 120, color: '#fff', shadow: 20, alpha: prog(t, T('M017', w), T('M017', w) + .3) }); });
    sourceTag(ctx, credit('ymca'));
  }, { name: 'broke' });
  cue(T('M017', 'office'), 'scribble', .5); cue(T('M017', 'showers'), 'scribble', .5);
  shot(['M018', 'Then'], (ctx, t, lt) => {
    camPhoto(ctx, 'compaq', lt, { grade: 'color', tint: 'navy', tintAmt: .45 }); shade(ctx, .55);
    timeStamp(ctx, '1999', 140, 180, t, T('M018', '1999,'), { size: 90 });
    text(ctx, 'COMPAQ BUYS ZIP2', W / 2, 360, { font: F.osw, size: 60, color: '#fff', align: 'center', weight: 600, ls: 8, alpha: prog(t, T('M018', 'Compaq'), T('M018', 'Compaq') + .3) });
    moneyCount(ctx, t, T('M018', '307'), 0, 307e6, W / 2, 560, { size: 190 });
    if (t > T('M018', 'share')) { moneyCount(ctx, t, T('M018', 'share'), 0, 22e6, W / 2, 790, { size: 130, color: C.lime, glow: 'rgba(182,243,106,.6)' }); text(ctx, "ELON'S SHARE", W / 2, 870, { font: F.osw, size: 40, color: C.lime, align: 'center', weight: 600, ls: 8 }); }
    if (t > T('M018', 'twenty-seven.')) pill(ctx, 'AGE 27', 1560, 980, { bg: C.tred, size: 44 });
    sourceTag(ctx, credit('compaq'));
  }, { name: 'compaq' });
  cue(T('M018', '307'), 'cash', .8); cue(T('M018', 'share'), 'cash', .6);
  shot(['M019', 'So'], (ctx, t, lt) => {
    const cr0 = T('M019', 'crashes'); const shake = t > cr0 && t < cr0 + .5 ? (hash(Math.floor(t * 60)) - .5) * 40 : 0;
    ctx.save(); ctx.translate(shake, shake * .6); camPhoto(ctx, 'mclaren', lt, { grade: 'color', z0: 1.08, zs: .04 }); ctx.restore(); gradeTop(ctx, .5);
    text(ctx, 'McLAREN F1', 140, 200, { font: F.bebas, size: 120, color: '#fff', shadow: 20 }); text(ctx, '~ $1 MILLION SUPERCAR', 140, 260, { font: F.osw, size: 40, color: C.gold, weight: 600, ls: 6 });
    if (t > cr0) { glitch(ctx, t, clamp(1 - (t - cr0) * 1.5)); flash(ctx, t, cr0, .15, '#fff'); cracks(ctx, 1200, 520, prog(t, cr0, cr0 + .5)); }
    if (t > T('M019', 'insured.')) stamp(ctx, 'NOT INSURED', 1300, 880, t, T('M019', 'insured.'), { size: 130 });
    sourceTag(ctx, credit('mclaren', 'Illustrative: same model'));
  }, { name: 'mclaren' });
  cue(T('M019', 'crashes'), 'impact', .9); cue(T('M019', 'insured.'), 'stamp');
  shot(['M020', 'Lesson'], (ctx, t, lt) => {
    bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9);
    [['LESSON 1', 'GO FAST.', 'one'], ['LESSON 2', 'MAYBE GET INSURANCE.', 'two:']].forEach(([a, b, w], i) => { const st = T('M020', w); if (t < st) return; const p = E.out(prog(t, st, st + .35)), y = 340 + i * 360;
      ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * -200, 0); text(ctx, a, 200, y, { font: F.osw, size: 50, color: '#1A1A1A', weight: 600, ls: 10 }); text(ctx, b, 200, y + 160, { font: F.bebas, size: 180, color: '#111' }); ctx.restore(); });
  }, { name: 'lessons' });
  cue(T('M020', 'one'), 'ding', .5); cue(T('M020', 'two:'), 'ding', .5);
  shot(['M021', 'His'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0E0B24', 'rgba(123,92,255,.12)', 70, 6);
    glowText(ctx, 'X.com', W / 2, 400, { font: F.bebas, size: 240, color: '#fff', align: 'center', glow: 'rgba(123,92,255,.8)', alpha: prog(t, T('M021', 'X.com,'), T('M021', 'X.com,') + .3) });
    text(ctx, 'AN ONLINE BANK · 1999', W / 2, 490, { font: F.osw, size: 44, color: C.violet, align: 'center', weight: 600, ls: 8, alpha: prog(t, T('M021', 'bank.'), T('M021', 'bank.') + .3) });
    if (t > T('M021', 'merges')) { const p = E.inOut(prog(t, T('M021', 'merges'), T('M021', 'merges') + .8)); ctx.save(); ctx.globalAlpha = 1 - clamp((t - T('M021', 'PayPal.')) * 3);
      pill(ctx, 'X.com', lerp(500, 820, p), 720, { align: 'center', bg: C.violet, size: 54 }); pill(ctx, 'RIVAL STARTUP', lerp(1420, 1100, p), 720, { align: 'center', bg: '#3A3F55', size: 54 }); ctx.restore(); }
    if (t > T('M021', 'PayPal.')) { frame(ctx, 'paypal_hq', 560, 590, 800, 360, { rot: -.015 }); pill(ctx, 'PAYPAL', W / 2, 1010, { align: 'center', bg: C.xblue, size: 50 }); }
  }, { name: 'xcom' });
  cue(T('M021', 'merges'), 'whoosh', .5); cue(T('M021', 'PayPal.'), 'hit', .6);
  shot(['M022', 'In'], (ctx, t, lt) => {
    const pr = worldMap(ctx, t, { lon: -40, lat: 20, k: 6, theme: 'night' }); const a = pr(...PLACES.PALOALTO);
    const p = prog(t, T('M022', 'plane') - .3, T('M022', 'board') + .4); // flying west, over the Pacific
    route(ctx, a, [-150, 900], p, { plane: true, color: C.teal, ctrl: [a[0] - 100, 760] }); if (t > T('M022', 'Australia,')) pill(ctx, '→ AUSTRALIA', 120, 980, { bg: C.teal, color: '#041014', size: 40 });
    pin(ctx, ...a, t, T('M022', 'In'), 'SILICON VALLEY', { color: C.teal });
    if (t > T('M022', 'replaces')) { const q = prog(t, T('M022', 'replaces'), T('M022', 'replaces') + .4); ctx.save(); ctx.globalAlpha = q; ctx.fillStyle = 'rgba(5,10,22,.85)'; ctx.fillRect(1100, 360, 640, 260);
      text(ctx, 'CEO', 1420, 470, { font: F.osw, size: 50, color: 'rgba(255,255,255,.6)', align: 'center', weight: 600, ls: 10 }); text(ctx, 'ELON MUSK', 1420, 570, { font: F.bebas, size: 110, color: '#fff', align: 'center' }); ctx.restore();
      stamp(ctx, 'REPLACED', 1420, 520, t, T('M022', 'replaces') + .35, { size: 110 }); }
    timeStamp(ctx, '2000', 140, 180, t, T('M022', 'In'), { size: 80 });
  }, { name: 'ousted' });
  cue(T('M022', 'replaces') + .35, 'stamp');
  shot(['M023', 'Still,'], (ctx, t, lt) => {
    camPhoto(ctx, 'paypal_hq', lt, { grade: 'color', tint: 'blue', tintAmt: .35 }); shade(ctx, .5);
    moneyRain(ctx, t, T('M023', 'one'), 'bill100', EP.billCrop, 26, { size: 240, spread: 2, alpha: .8 }); shade(ctx, .2);
    timeStamp(ctx, '2002', 140, 180, t, T('M023', '2002,'), { size: 80 }); text(ctx, 'eBAY BUYS PAYPAL', W / 2, 360, { font: F.osw, size: 60, color: '#fff', align: 'center', weight: 600, ls: 8, alpha: prog(t, T('M023', 'eBay'), T('M023', 'eBay') + .3) });
    moneyCount(ctx, t, T('M023', 'one'), 0, 1.5e9, W / 2, 560, { size: 190 });
    if (t > T('M023', '180')) { moneyCount(ctx, t, T('M023', '180'), 0, 180e6, W / 2, 790, { size: 130, color: C.lime, glow: 'rgba(182,243,106,.6)' }); text(ctx, "ELON'S SHARE (APPROX.)", W / 2, 870, { font: F.osw, size: 40, color: C.lime, align: 'center', weight: 600, ls: 8 }); }
    sourceTag(ctx, credit('paypal_hq'));
  }, { name: 'ebay' });
  cue(T('M023', 'one'), 'cash', .9); cue(T('M023', '180'), 'cash', .6);
  shot(['M024', 'Most'], (ctx, t, lt) => {
    bgGrad(ctx, '#7FD8F0', '#F7E2A8'); const p = prog(t, T('M024', 'Elon'), T('M024', 'Elon') + .3);
    text(ctx, 'RETIRE TO A BEACH', W / 2, 400, { font: F.bebas, size: 170, color: '#1A3A4A', align: 'center' });
    if (p > 0) { ctx.save(); ctx.strokeStyle = C.tred; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(W / 2 - 640, 350); ctx.lineTo(W / 2 - 640 + 1280 * E.out(p), 350); ctx.stroke(); ctx.restore(); }
    if (t > T('M024', 'build')) { const q = prog(t, T('M024', 'build'), T('M024', 'build') + 1.6);
      glowText(ctx, 'BUILD ROCKETS', W / 2, 640, { font: F.bebas, size: 210, color: C.tred, align: 'center', glow: 'rgba(232,33,39,.5)' }); rocket(ctx, 1640, 1000 - 900 * E.in(q), 1.1, t, { flame: true }); }
  }, { name: 'beach-rockets' });
  cue(T('M024', 'Elon'), 'scribble', .6); cue(T('M024', 'build'), 'riser', .6);

  // ======== CH3 SPACEX
  shot(['M025', 'Why'], (ctx, t, lt) => {
    spaceBG(ctx, t, '#C2502A'); chapter(ctx, t, T('M025', 'Why'), 3, 'SPACEX', C.tred);
    ctx.save(); ctx.beginPath(); ctx.arc(1360, 540, 360, 0, 7); ctx.clip(); photo(ctx, 'mars', { x: 1000, y: 180, w: 720, h: 720, zoom: 1.02, grade: 'color' }); ctx.restore();
    text(ctx, 'GOAL: HUMANS ON MARS', 140, 560, { font: F.bebas, size: 110, color: '#fff', alpha: prog(t, T('M025', 'Mars.'), T('M025', 'Mars.') + .3) });
    if (t > T('M025', 'price')) { popIn(ctx, t, T('M025', 'price'), 520, 760, c => pill(c, 'PRICE OF A ROCKET:', 0, 0, { align: 'center', bg: '#222', size: 48 })); }
    if (t > T('M025', 'lot.')) stamp(ctx, 'A LOT.', 520, 900, t, T('M025', 'lot.'), { size: 150, color: C.gold });
    sourceTag(ctx, credit('mars', 'Mars'));
  }, { name: 'mars' });
  cue(T('M025', 'lot.'), 'stamp');
  shot(['M026', 'So'], (ctx, t, lt) => {
    const st = T('M026', 'meetings');
    if (t < st) { const pr = worldMap(ctx, t, { lon: -40, lat: 45, k: 6.2, theme: 'night' }); const a = pr(...PLACES.LA), b = pr(...PLACES.MOSCOW);
      pin(ctx, ...a, t, T('M026', 'So'), 'LOS ANGELES', { color: C.teal }); route(ctx, a, b, prog(t, T('M026', 'flies'), T('M026', 'Russia') + .6), { plane: true, color: C.tred, ctrl: [(a[0] + b[0]) / 2, 0] });
      pin(ctx, ...b, t, T('M026', 'Russia'), 'MOSCOW', { color: C.tred, left: true });
      if (t > T('M026', 'missiles.')) popIn(ctx, t, T('M026', 'missiles.'), W / 2, 900, c => pill(c, 'SHOPPING LIST: USED MISSILES', 0, 0, { align: 'center', bg: C.tred, size: 48 })); }
    else { camPhoto(ctx, 'redsquare', t - st, { grade: 'color', tint: 'red', tintAmt: .25 }); shade(ctx, .35);
      const q = prog(t, T('M026', 'discount'), T('M026', 'discount') + .35); if (q > 0) { ctx.save(); ctx.globalAlpha = q; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(260, 300, 1400, 300, 40); ctx.fill();
        ctx.beginPath(); ctx.moveTo(500, 600); ctx.lineTo(460, 700); ctx.lineTo(600, 600); ctx.fill(); wrapText(ctx, '"Can I get a discount on your missiles?"', 330, 420, 1260, 100, { font: F.play, size: 76, color: '#111', weight: 700 }); ctx.restore(); }
      if (t > T('M026', 'tough')) stamp(ctx, 'DEAL: NO', 1500, 860, t, T('M026', 'tough'), { size: 120 });
      sourceTag(ctx, credit('redsquare', 'Moscow')); }
  }, { name: 'russia' });
  cue(T('M026', 'flies'), 'whoosh', .6); cue(T('M026', 'discount'), 'paper', .6); cue(T('M026', 'tough'), 'stamp');
  shot(['M027', 'On'], (ctx, t, lt) => {
    if (t < T('M027', 'founds')) { gridBG(ctx, t, '#0B1A12', 'rgba(182,243,106,.1)', 60, 4);
      const rows = [["RAW MATERIALS", "~3% OF A ROCKET'S PRICE"], ['BUILD IN-HOUSE?', 'YES'], ['DECISION', 'DO IT YOURSELF']];
      rows.forEach(([a, b], i) => dataRow(ctx, a, b, 360, 340 + i * 190, t, T('M027', 'decides') + i * .35, { size: 70, color: C.lime, ls: 34, gap: 80 }));
      text(ctx, 'NOTES FROM THE FLIGHT HOME', 360, 240, { font: F.mono, size: 34, color: 'rgba(182,243,106,.7)' }); }
    else { camPhoto(ctx, 'p_2006', t - T('M027', 'founds'), { grade: 'color', fx: .5 }); shade(ctx, .35); gradeTop(ctx, .6);
      bigTitle(ctx, 'SPACEX', 140, 900, t, T('M027', 'SpaceX.') - .1, { size: 220, bar: C.tred }); timeStamp(ctx, '2002', 140, 180, t, T('M027', 'founds'), { size: 80 });
      sourceTag(ctx, credit('p_2006')); }
  }, { name: 'founds' });
  cue(T('M027', 'decides'), 'key', .4); cue(T('M027', 'SpaceX.'), 'hit', .8);
  shot(['M028', 'Experts'], (ctx, t, lt) => {
    bgGrad(ctx, '#151A26', '#05070B', 'r'); const v = lerp(.6, .08, E.out(prog(t, T('M028', 'chance'), T('M028', 'chance') + .8)));
    gauge(ctx, W / 2, 560, 330, v, 'CHANCE OF SUCCESS');
    if (t > T('M028', 'rocket')) text(ctx, 'ROCKET SCIENCE IS... ROCKET SCIENCE.', W / 2, 860, { font: F.bebas, size: 96, color: C.gold, align: 'center', alpha: prog(t, T('M028', 'rocket'), T('M028', 'rocket') + .3) });
  }, { name: 'odds' });
  const fail = (id, key, label, n) => shot([id, id === 'M029' ? 'Falcon' : 'Flight'], (ctx, t, lt) => {
    camPhoto(ctx, key, lt, { grade: 'color', z0: 1.08, zs: .05, tint: n === 3 ? 'red' : undefined, tintAmt: .3 }); shade(ctx, .25); vign(ctx, .6);
    timeStamp(ctx, label, 140, 180, t, T(id, id === 'M029' ? 'Falcon' : 'Flight'), { size: 86, color: C.cream });
    const w = id === 'M029' ? 'crashes.' : (id === 'M030' ? 'fails.' : 'again.'); if (t > T(id, w)) { glitch(ctx, t, clamp(1 - (t - T(id, w)) * 2)); stamp(ctx, 'FAILED', W / 2 + 300, 700, t, T(id, w), { size: 170 }); }
    for (let i = 0; i < 3; i++) { const on = i < n - 1 || t > T(id, w); ctx.fillStyle = on ? C.tred : 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(1500 + i * 90, 150, 28, 0, 7); ctx.fill(); }
    sourceTag(ctx, credit(key, 'Falcon 1 (later flight shown)'));
  }, { name: 'fail' + n });
  fail('M029', 'f1_2009', 'FLIGHT 1 · 2006', 1); fail('M030', 'f1_omelek', 'FLIGHT 2 · 2007', 2); fail('M031', 'f1_flight4', 'FLIGHT 3 · AUG 2008', 3);
  cue(T('M029', 'crashes.'), 'impact', .8); cue(T('M030', 'fails.'), 'impact', .8); cue(T('M031', 'again.'), 'impact', .9);
  shot(['M032', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#2A0606', '#050000', 'r'); const blink = Math.floor(t * 3) % 2;
    text(ctx, 'SPACEX FUNDS', W / 2, 330, { font: F.osw, size: 60, color: C.cream, align: 'center', weight: 600, ls: 12 });
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.strokeRect(460, 420, 1000, 200); ctx.fillStyle = blink ? C.tred : '#7A0E10'; ctx.fillRect(476, 436, 968 * .12, 168); ctx.restore();
    text(ctx, 'ENOUGH FOR: 1 MORE LAUNCH', W / 2, 760, { font: F.bebas, size: 120, color: C.tred, align: 'center' });
    if (t > T('M032', 'Maybe.')) text(ctx, '(MAYBE)', W / 2, 880, { font: F.hand, size: 90, color: C.cream, align: 'center', weight: 700 });
  }, { name: 'one-left' });
  cue(T('M032', 'one'), 'tick', .6);

  // ======== CH4 2008
  shot(['M033', 'Meanwhile,'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_roadster08', lt, { grade: 'warm', tint: 'red', tintAmt: .2 }); shade(ctx, .3); chapter(ctx, t, T('M033', 'Meanwhile,'), 4, 'THE WORST YEAR', C.tred);
    if (t > T('M033', 'fire.')) embers(ctx, t, prog(t, T('M033', 'fire.'), T('M033', 'fire.') + .6));
    if (t > T('M033', 'Tesla.')) { bigTitle(ctx, 'TESLA', 140, 900, t, T('M033', 'Tesla.') - .1, { size: 200, bar: C.tred }); timeStamp(ctx, 'INVESTS 2004', 1400, 180, t, T('M033', '2004,'), { size: 70 }); }
    sourceTag(ctx, credit('p_roadster08'));
  }, { name: 'tesla' });
  cue(T('M033', 'fire.'), 'riser', .4); cue(T('M033', 'Tesla.'), 'hit', .7);
  shot(['M034', 'Its'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_roadster08', lt, { grade: 'color', z0: 1.2, fx: .55 }); shade(ctx, .4);
    text(ctx, 'THE ROADSTER', 140, 200, { font: F.bebas, size: 130, color: '#fff', shadow: 20 });
    const p = E.out(prog(t, T('M034', 'costs'), T('M034', 'planned.', 'e'))); const bx = 1100, by = 860;
    [['PLANNED COST', .45, C.lime], ['ACTUAL COST', .45 + .5 * p, C.tred]].forEach(([l, v, col], i) => { if (t < T('M034', 'costs')) return; const x = bx + i * 300, h = 600 * v; ctx.fillStyle = col; ctx.fillRect(x, by - h, 200, h);
      text(ctx, l, x + 100, by + 60, { font: F.osw, size: 32, color: '#fff', align: 'center', weight: 600 }); });
    sourceTag(ctx, credit('p_roadster08'));
  }, { name: 'roadster-cost' });
  shot(['M035', 'Then'], (ctx, t, lt) => {
    if (t < T('M035', 'Elon')) { camPhoto(ctx, 'lehman', lt, { grade: 'bw', tint: 'red', tintAmt: .35 }); shade(ctx, .45);
      ctx.fillStyle = C.tred; ctx.fillRect(0, 860, W, 110); const s = '2008 FINANCIAL CRISIS  ·  MARKETS CRASH  ·  BANKS COLLAPSE  ·  '; const off = (t * 300) % 1900;
      for (let k = -1; k < 3; k++) text(ctx, s, k * 1900 - off, 940, { font: F.bebas, size: 80, color: '#fff' });
      if (t > T('M035', 'Tesla')) popIn(ctx, t, T('M035', 'Tesla'), W / 2, 500, c => pill(c, 'TESLA: RUNNING OUT OF CASH', 0, 0, { align: 'center', bg: '#111', size: 64 }));
      sourceTag(ctx, credit('lehman')); }
    else { bgGrad(ctx, '#121A2C', '#04060C', 'r'); const st = T('M035', 'Elon');
      timeStamp(ctx, 'CEO: ELON MUSK', 140, 220, t, T('M035', 'CEO'), { size: 90 });
      const bal = lerp(180e6, 3e6, E.inOut(prog(t, T('M035', 'pours'), T('M035', 'left.', 'e'))));
      text(ctx, 'PERSONAL FORTUNE', W / 2, 480, { font: F.osw, size: 50, color: C.cream, align: 'center', weight: 600, ls: 10 });
      glowText(ctx, money(bal), W / 2, 680, { font: F.bebas, size: 220, color: bal < 30e6 ? C.tred : C.gold, align: 'center', glow: 'rgba(232,33,39,.5)' });
      text(ctx, '(ILLUSTRATIVE)', W / 2, 760, { font: F.mono, size: 30, color: 'rgba(255,255,255,.45)', align: 'center' }); }
  }, { name: 'crisis' });
  cue(T('M035', 'Then'), 'thud', .6); cue(T('M035', 'pours'), 'riser', .4);
  shot(['M036', 'That'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_2008', lt, { grade: 'bw', z0: 1.05, fx: .55, fy: .4 }); shade(ctx, .35); vign(ctx, .75); rain(ctx, t, .6);
    wipeText(ctx, '"THE WORST YEAR OF MY LIFE"', 120, 930, prog(t, T('M036', 'worst'), T('M036', 'worst') + .5), { size: 110, color: '#fff' });
    timeStamp(ctx, 'MARRIAGE ENDS', 120, 200, t, T('M036', 'marriage'), { size: 70 });
    sourceTag(ctx, credit('p_2008'));
  }, { name: 'worst-year' });
  shot(['M037', 'Remember'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_2008c', lt, { grade: 'bw', tint: 'red', tintAmt: .5 }); shade(ctx, .55); glitch(ctx, t, .4 + .3 * Math.sin(t * 10));
    text(ctx, '◀◀ REWIND', 140, 200, { font: F.mono, size: 60, color: '#fff' });
    sticky(ctx, 'HOLD THAT\nTHOUGHT', 1480, 420, .06, 1);
    if (t > T('M037', 'This')) { wipeText(ctx, 'THIS IS THE MOMENT.', W / 2, 860, prog(t, T('M037', 'This'), T('M037', 'This') + .4), { size: 150, color: C.gold, align: 'center' }); }
  }, { name: 'callback' });
  cue(T('M037', 'Remember'), 'whoosh', .6);
  shot(['M038', 'September'], (ctx, t, lt) => {
    camPhoto(ctx, 'f1_flight4', 0, { z0: 1.6, fx: .5, fy: .45, grade: 'color', blur: 2 }); shade(ctx, .55);
    timeStamp(ctx, '28 SEP 2008', 140, 200, t, T('M038', 'September'), { size: 96, color: C.gold });
    text(ctx, 'FALCON 1 · FLIGHT 4', W / 2, 420, { font: F.osw, size: 60, color: '#fff', align: 'center', weight: 600, ls: 10 });
    if (t > T('M038', 'last')) { const n = 3 - Math.floor((t - T('M038', 'last')) * 2.2); if (n >= 1) punch(ctx, String(n), W / 2, 700, t, T('M038', 'last') + (3 - n) / 2.2, { font: F.bebas, size: 300, color: C.tred }); }
    text(ctx, 'THE LAST SHOT', W / 2, 980, { font: F.bebas, size: 90, color: C.tred, align: 'center', alpha: prog(t, T('M038', 'last'), T('M038', 'last') + .3) });
  }, { name: 'flight4-count' });
  cue(T('M038', 'last'), 'tick', .7); cue(T('M038', 'last') + .45, 'tick', .7); cue(T('M038', 'last') + .9, 'tick', .7);
  shot(['M039', 'And'], (ctx, t, lt) => {
    camPhoto(ctx, 'f1_flight4', lt, { z0: 1.15, zs: .03, grade: 'color' }); lightLeak(ctx, t, .3, 7); gradeTop(ctx, .4);
    if (t > T('M039', 'orbit.')) { flash(ctx, t, T('M039', 'orbit.'), .2, '#fff'); glowText(ctx, 'ORBIT.', W / 2, 520, { font: F.bebas, size: 280, color: '#fff', align: 'center', glow: 'rgba(182,243,106,.8)' }); tick(ctx, W / 2 + 420, 440, 70, prog(t, T('M039', 'orbit.'), T('M039', 'orbit.') + .5)); }
    if (t > T('M039', 'first')) text(ctx, 'FIRST PRIVATELY DEVELOPED LIQUID-FUEL ROCKET TO REACH ORBIT', W / 2, 980, { font: F.osw, size: 40, color: C.lime, align: 'center', weight: 600, ls: 4, alpha: prog(t, T('M039', 'first'), T('M039', 'first') + .3) });
    sourceTag(ctx, credit('f1_flight4', 'Falcon 1 Flight 4, 28 Sep 2008'));
  }, { name: 'orbit' });
  cue(T('M039', 'orbit.'), 'hit', 1);
  shot(['M040', 'Then,'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_bolden', lt, { grade: 'warm', tint: 'blue', tintAmt: .25, fy: .3 }); shade(ctx, .55); snow(ctx, t);
    text(ctx, 'DAYS BEFORE CHRISTMAS', W / 2, 260, { font: F.osw, size: 56, color: '#fff', align: 'center', weight: 600, ls: 10 });
    text(ctx, 'NASA CONTRACT', W / 2, 440, { font: F.bebas, size: 130, color: '#fff', align: 'center', alpha: prog(t, T('M040', 'NASA'), T('M040', 'NASA') + .3) });
    moneyCount(ctx, t, T('M040', '1.6'), 0, 1.6e9, W / 2, 660, { size: 210 });
    if (t > T('M040', 'cargo')) text(ctx, 'FLY CARGO TO THE SPACE STATION', W / 2, 780, { font: F.osw, size: 46, color: C.teal, align: 'center', weight: 600, ls: 6 });
    sourceTag(ctx, credit('p_bolden', 'NASA chief Charles Bolden with Musk, 2012'));
  }, { name: 'nasa' });
  cue(T('M040', '1.6'), 'cash', .9);
  shot(['M041', "Elon's"], (ctx, t, lt) => {
    bgGrad(ctx, '#0B1D45', '#030714', 'r'); snow(ctx, t, 80);
    noteCard(ctx, ['I love NASA.'], t, [T('M041', 'I')], { x: W / 2, y: 540, z: 1.1 });
  }, { name: 'love-nasa' });
  cue(T('M041', 'I'), 'scribble', .6);
  shot(['M042', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#3A0A0E', '#0A0204', 'r'); snow(ctx, t);
    ctx.save(); ctx.translate(560, 540); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.fillRect(-260, -300, 520, 600); ctx.shadowBlur = 0;
    ctx.fillStyle = C.tred; ctx.fillRect(-260, -300, 520, 150); text(ctx, 'DECEMBER', 0, -200, { font: F.bebas, size: 90, color: '#fff', align: 'center' });
    text(ctx, '24', 0, 180, { font: F.bebas, size: 360, color: '#111', align: 'center' }); ctx.restore();
    text(ctx, 'CHRISTMAS EVE', 1340, 360, { font: F.osw, size: 56, color: C.cream, align: 'center', weight: 600, ls: 10 });
    if (t > T('M042', 'funding')) { glowText(ctx, 'TESLA FUNDING', 1340, 560, { font: F.bebas, size: 140, color: '#fff', align: 'center' }); stamp(ctx, 'APPROVED', 1340, 760, t, T('M042', 'through.'), { size: 130, color: C.lime }); }
    if (t > T('M042', 'last')) text(ctx, 'AT THE LAST POSSIBLE MOMENT', 1340, 960, { font: F.osw, size: 40, color: C.gold, align: 'center', weight: 600, ls: 6 });
  }, { name: 'xmas-eve' });
  cue(T('M042', 'through.'), 'stamp');
  shot(['M043', 'Two'], (ctx, t, lt) => {
    bgGrad(ctx, '#0C3A1E', '#03120A', 'r'); snow(ctx, t, 140);
    [['SPACEX', 600], ['TESLA', 1320]].forEach(([s, x], i) => { const st = T('M043', 'saved') + i * .25; if (t < st) return;
      popIn(ctx, t, st, x, 470, c => { c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.roundRect(-300, -200, 600, 400, 30); c.fill(); text(c, s, 0, -40, { font: F.bebas, size: 150, color: '#fff', align: 'center' }); });
      tick(ctx, x, 560, 60, prog(t, st + .2, st + .6)); });
    if (t > T('M043', 'Santa')) text(ctx, 'SANTA WAS CLEARLY A FAN.', W / 2, 920, { font: F.bebas, size: 120, color: C.gold, align: 'center', alpha: prog(t, T('M043', 'Santa'), T('M043', 'Santa') + .3) });
  }, { name: 'santa' });
  cue(T('M043', 'saved'), 'ding', .6); cue(T('M043', 'saved') + .25, 'ding', .6);

  // ======== CH5 RISE
  shot(['M044', 'From'], (ctx, t, lt) => {
    if (t < T('M044', '2012,')) { gridBG(ctx, t, '#0A1430', 'rgba(56,214,232,.08)', 64, 6); chapter(ctx, t, T('M044', 'From'), 5, 'LIFTOFF', C.teal);
      timelineBar(ctx, 620, [[2008, 'ORBIT + NASA', T('M044', 'From') + .3], [2010, 'TESLA GOES PUBLIC', T('M044', '2010,')], [2012, 'DRAGON → ISS', T('M044', '2012,')]], 2007, 2013, t, T('M044', 'From'), { dot: C.teal }); }
    else { camPhoto(ctx, 'dragon_iss', t - T('M044', '2012,'), { grade: 'color' }); shade(ctx, .3);
      if (t > T('M044', 'first')) text(ctx, 'FIRST COMMERCIAL SPACECRAFT TO VISIT THE ISS', W / 2, 980, { font: F.osw, size: 46, color: '#fff', align: 'center', weight: 600, ls: 4, shadow: 20 });
      timeStamp(ctx, 'MAY 2012', 140, 180, t, T('M044', '2012,'), { size: 80 }); sourceTag(ctx, credit('dragon_iss')); }
  }, { name: 'rise' });
  cue(T('M044', '2012,'), 'whoosh', .6);
  shot(['M045', 'Then'], (ctx, t, lt) => {
    camPhoto(ctx, 'modelS', lt, { grade: 'color', z0: 1.06 }); shade(ctx, .25); lightLeak(ctx, t, .25, 11);
    text(ctx, 'MODEL S', 140, 200, { font: F.bebas, size: 140, color: '#fff', shadow: 20 });
    if (t > T('M045', 'cool.')) { text(ctx, 'ELECTRIC CARS =', W / 2 - 80, 900, { font: F.bebas, size: 130, color: '#fff', align: 'center', shadow: 20 }); stamp(ctx, 'COOL', W / 2 + 420, 860, t, T('M045', 'cool.'), { size: 140, color: C.teal }); }
    sourceTag(ctx, credit('modelS'));
  }, { name: 'model-s' });
  cue(T('M045', 'cool.'), 'stamp');
  shot(['M046', 'December'], (ctx, t, lt) => {
    if (t < T('M046', 'lands')) { camPhoto(ctx, 'f9_arc', lt, { grade: 'color', z0: 1.1, zs: .03 }); shade(ctx, .1);
      timeStamp(ctx, '21 DEC 2015', 140, 180, t, T('M046', 'December'), { size: 86 }); sourceTag(ctx, credit('f9_arc', 'Falcon 9 booster after landing, Dec 2015')); }
    else { camPhoto(ctx, 'f9_lz1', t - T('M046', 'lands'), { grade: 'color', z0: 1.05 }); lightLeak(ctx, t, .2, 2, 'cool');
      glowText(ctx, 'LANDED.', 140, 900, { font: F.bebas, size: 220, color: '#fff', glow: 'rgba(56,214,232,.8)' });
      if (t > T('M046', 'parks')) popIn(ctx, t, T('M046', 'parks'), 1500, 300, c => { c.fillStyle = '#1E5BD8'; c.beginPath(); c.roundRect(-110, -110, 220, 220, 24); c.fill(); text(c, 'P', 0, 70, { font: F.bebas, size: 220, color: '#fff', align: 'center' }); });
      if (t > T('M046', 'parks')) text(ctx, 'A ROCKET THAT PARKS ITSELF', 1500, 500, { font: F.osw, size: 40, color: '#fff', align: 'center', weight: 600, ls: 4 });
      sourceTag(ctx, credit('f9_lz1')); }
  }, { name: 'landing' });
  cue(T('M046', 'lands'), 'hit', .9); cue(T('M046', 'parks'), 'ding', .6);
  shot(['M047', 'In'], (ctx, t, lt) => {
    if (t < T('M047', 'Roadster,')) { camPhoto(ctx, 'falconheavy', lt, { grade: 'color', z0: 1.08 }); shade(ctx, .25);
      timeStamp(ctx, 'FALCON HEAVY · 2018', 140, 180, t, T('M047', 'In'), { size: 80 }); text(ctx, 'PAYLOAD: ???', W / 2, 950, { font: F.bebas, size: 120, color: '#fff', align: 'center', shadow: 20 }); sourceTag(ctx, credit('falconheavy')); }
    else { camPhoto(ctx, 'roadster_space2', t - T('M047', 'Roadster,'), { grade: 'color', z0: 1.05 });
      pill(ctx, "ELON'S OWN TESLA ROADSTER", 140, 180, { bg: C.tred, size: 44 });
      if (t > T('M047', 'Starman')) { penArrow(ctx, 760, 260, 900, 420, prog(t, T('M047', 'Starman'), T('M047', 'Starman') + .4), { color: C.gold }); pill(ctx, 'STARMAN', 560, 250, { bg: C.gold, color: '#111', size: 44 }); }
      sourceTag(ctx, credit('roadster_space2')); }
  }, { name: 'falcon-heavy' });
  cue(T('M047', 'Roadster,'), 'whoosh', .6);
  shot(['M048', 'On'], (ctx, t, lt) => {
    if (t < T('M048', 'still')) { camPhoto(ctx, 'roadster_space', lt, { grade: 'color', z0: 1.1 }); shade(ctx, .3);
      glowText(ctx, "DON'T PANIC", W / 2, 560, { font: F.bebas, size: 230, color: '#fff', align: 'center', glow: 'rgba(56,214,232,.9)', alpha: prog(t, T('M048', "Don't"), T('M048', "Don't") + .3) }); sourceTag(ctx, credit('roadster_space')); }
    else { spaceBG(ctx, t, '#2A6CFF'); const cx = W / 2, cy = 560; ctx.save(); const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120); g.addColorStop(0, '#FFF6C8'); g.addColorStop(1, 'rgba(255,190,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 120, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(56,214,232,.5)'; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.ellipse(cx, cy, 620, 300, -.1, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      const a = t * .8; ctx.fillStyle = C.tred; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 620 * Math.cos(.1) , cy + Math.sin(a) * 300 - Math.cos(a) * 60, 18, 0, 7); ctx.fill(); ctx.restore();
      text(ctx, 'STILL CIRCLING THE SUN', W / 2, 160, { font: F.osw, size: 52, color: '#fff', align: 'center', weight: 600, ls: 10 });
      if (t > T('M048', 'traffic.')) text(ctx, 'ZERO TRAFFIC. ZERO PARKING TICKETS.', W / 2, 1000, { font: F.bebas, size: 90, color: C.gold, align: 'center' }); }
  }, { name: 'dont-panic' });
  shot(['M049', 'And'], (ctx, t, lt) => {
    camPhoto(ctx, 'demo2', lt, { grade: 'color', z0: 1.05 }); shade(ctx, .25); lightLeak(ctx, t, .25, 4);
    timeStamp(ctx, 'MAY 2020', 140, 180, t, T('M049', '2020,'), { size: 80 });
    text(ctx, 'FIRST PRIVATE COMPANY TO FLY ASTRONAUTS TO THE ISS', W / 2, 980, { font: F.osw, size: 44, color: '#fff', align: 'center', weight: 600, ls: 3, shadow: 20, alpha: prog(t, T('M049', 'first'), T('M049', 'first') + .3) });
    sourceTag(ctx, credit('demo2'));
  }, { name: 'demo2' });
  cue(T('M049', 'And'), 'riser', .5);

  // ======== CH6 CHAOS
  shot(['M050', 'But'], (ctx, t, lt) => {
    gridBG(ctx, t, '#06131F', 'rgba(29,155,240,.12)', 54, 10); chapter(ctx, t, T('M050', 'But'), 6, 'THE CHAOS ERA', C.xblue);
    if (t > T('M050', 'tweets.')) { glitch(ctx, t, .8 * clamp(1 - (t - T('M050', 'tweets.')) * 2)); glowText(ctx, 'TWEETS.', W / 2, 640, { font: F.bebas, size: 300, color: '#fff', align: 'center', glow: 'rgba(29,155,240,.9)' }); }
    else glowText(ctx, 'ROCKETS?', W / 2, 640, { font: F.bebas, size: 300, color: 'rgba(255,255,255,.25)', align: 'center', glow: 'rgba(0,0,0,0)' });
  }, { name: 'tweets' });
  cue(T('M050', 'tweets.'), 'impact', .7);
  shot(['M051', 'In'], (ctx, t, lt) => {
    bgGrad(ctx, '#0F2236', '#04080E', 'r');
    postCard(ctx, W / 2, 500, 1200, 'Am considering taking Tesla private at $420. Funding secured.', t, T('M051', 'In'), { date: 'Aug 7, 2018', avatar: 'p_2015', crop: [250, 120, 500, 500] });
    if (t > T('M051', 'secured.')) highlighter(ctx, 960, 560, 420, 70, prog(t, T('M051', 'secured.'), T('M051', 'secured.') + .4));
  }, { name: 'funding-secured' });
  cue(T('M051', 'In') + .2, 'key', .5);
  shot(['M052', 'It'], (ctx, t, lt) => {
    bgGrad(ctx, '#0F2236', '#04080E', 'r');
    postCard(ctx, W / 2, 380, 1200, 'Am considering taking Tesla private at $420. Funding secured.', 99, 0, { date: 'Aug 7, 2018', avatar: 'p_2015', crop: [250, 120, 500, 500] });
    stamp(ctx, 'IT WASN\'T.', 1340, 430, t, T('M052', 'It'), { size: 120 });
    if (t > T('M052', 'fined')) { moneyCount(ctx, t, T('M052', '20'), 0, 20e6, 620, 800, { size: 120, color: C.tred, glow: 'rgba(232,33,39,.5)' }); moneyCount(ctx, t, T('M052', 'each,'), 0, 20e6, 1300, 800, { size: 120, color: C.tred, glow: 'rgba(232,33,39,.5)' });
      text(ctx, 'ELON', 620, 870, { font: F.osw, size: 40, color: '#fff', align: 'center', weight: 600, ls: 8 }); if (t > T('M052', 'each,')) text(ctx, 'TESLA', 1300, 870, { font: F.osw, size: 40, color: '#fff', align: 'center', weight: 600, ls: 8 }); }
    if (t > T('M052', 'chairman.')) pill(ctx, 'STEPS DOWN AS CHAIRMAN', W / 2, 1000, { align: 'center', bg: C.tred, size: 40 });
  }, { name: 'sec' });
  cue(T('M052', 'It'), 'stamp'); cue(T('M052', '20'), 'cash', .6);
  shot(['M053', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A0F00', '#050300', 'r'); speedLines(ctx, t, 'rgba(255,195,77,.08)');
    wipeText(ctx, 'THE MOST EXPENSIVE TWEET', W / 2, 500, prog(t, T('M053', 'The'), T('M053', 'The') + .5), { size: 150, color: '#fff', align: 'center' });
    if (t > T('M053', 'until')) text(ctx, '...SO FAR', W / 2, 700, { font: F.hand, size: 130, color: C.gold, align: 'center', weight: 700, alpha: prog(t, T('M053', 'until'), T('M053', 'until') + .3) });
  }, { name: 'so-far' });
  shot(['M054', 'Then'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_boring', lt, { grade: 'color', tint: 'gold', tintAmt: .2 }); shade(ctx, .35);
    if (t > T('M054', '20,000')) { counter(ctx, lerp(0, 20000, E.out(prog(t, T('M054', '20,000'), T('M054', '20,000') + 1))), 140, 400, { size: 220, color: C.gold }); text(ctx, 'SOLD', 140, 480, { font: F.osw, size: 50, color: '#fff', weight: 600, ls: 10 }); }
    if (t > T('M054', 'named:')) { embers(ctx, t, 1);
      glowText(ctx, '"NOT A FLAMETHROWER"', W / 2, 850, { font: F.bebas, size: 150, color: '#fff', align: 'center', glow: 'rgba(255,120,40,.9)' }); }
    sourceTag(ctx, credit('p_boring', 'The Boring Company tunnel'));
  }, { name: 'flamethrower' });
  cue(T('M054', '20,000'), 'cash', .5); cue(T('M054', 'named:'), 'whoosh', .6);
  shot(['M055', 'In'], (ctx, t, lt) => {
    const sm = T('M055', 'smashes.'), sh = t > sm && t < sm + .4 ? (hash(Math.floor(t * 60)) - .5) * 30 : 0;
    if (t < T('M055', 'designer')) { camPhoto(ctx, 'cybertruck', lt, { grade: 'color', z0: 1.06 }); shade(ctx, .25); timeStamp(ctx, 'CYBERTRUCK · 2019', 140, 180, t, T('M055', 'In'), { size: 80 });
      if (t > T('M055', 'armor')) pill(ctx, '"ARMOR GLASS"', 140, 960, { bg: C.teal, color: '#041014', size: 50 }); sourceTag(ctx, credit('cybertruck', 'Production model')); }
    else { ctx.save(); ctx.translate(sh, 0); camPhoto(ctx, 'p_franz', t - T('M055', 'designer'), { grade: 'color', z0: 1.05 }); ctx.restore(); shade(ctx, .25);
      lowerTag(ctx, 'FRANZ VON HOLZHAUSEN', "TESLA'S CHIEF DESIGNER", t, T('M055', 'designer'));
      if (t > T('M055', 'ball')) { const p = prog(t, T('M055', 'ball'), sm); ctx.fillStyle = '#C9CED6'; ctx.beginPath(); ctx.arc(lerp(200, 1300, p), lerp(800, 500, p) - Math.sin(p * Math.PI) * 200, 40, 0, 7); ctx.fill(); }
      if (t > sm) { cracks(ctx, 1300, 500, prog(t, sm, sm + .3)); flash(ctx, t, sm, .12); }
      if (t > T('M055', 'Twice.')) { cracks(ctx, 1600, 620, prog(t, T('M055', 'Twice.'), T('M055', 'Twice.') + .3), 10); stamp(ctx, 'TWICE.', 600, 300, t, T('M055', 'Twice.'), { size: 150 }); }
      sourceTag(ctx, credit('p_franz')); }
  }, { name: 'cybertruck' });
  cue(T('M055', 'smashes.'), 'impact', 1); cue(T('M055', 'Twice.'), 'impact', .9);
  shot(['M056', "Elon's"], (ctx, t, lt) => {
    bgGrad(ctx, '#1A2230', '#06080C', 'r'); noteCard(ctx, ['Room for', 'improvement.'], t, [T('M056', 'Room'), T('M056', 'improvement.')], { x: W / 2, y: 540 });
  }, { name: 'improvement' });
  cue(T('M056', 'Room'), 'scribble', .6);
  shot(['M057', 'In'], (ctx, t, lt) => {
    gridBG(ctx, t, '#100820', 'rgba(123,92,255,.12)', 70, 8); timeStamp(ctx, '2020 · A SON IS BORN', 140, 200, t, T('M057', 'In'), { size: 70 });
    if (t > T('M057', 'X')) { glitch(ctx, t, .3); glowText(ctx, 'X Æ A-12', W / 2, 640, { font: F.bebas, size: 300, color: '#fff', align: 'center', glow: 'rgba(123,92,255,.9)' }); }
    if (t > T('M057', 'really.')) text(ctx, 'YES, REALLY.', W / 2, 860, { font: F.hand, size: 120, color: C.gold, align: 'center', weight: 700 });
  }, { name: 'xaea12' });
  cue(T('M057', 'X'), 'hit', .7);
  shot(['M058', 'And'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_battery', lt, { grade: 'color', tint: 'gold', tintAmt: .35 }); shade(ctx, .45); lightLeak(ctx, t, .3, 8);
    timeStamp(ctx, 'JANUARY 2021', 140, 180, t, T('M058', 'January'), { size: 80 });
    if (t > T('M058', 'richest')) { glowText(ctx, '#1', W / 2, 600, { font: F.bebas, size: 360, color: C.gold, align: 'center', glow: 'rgba(255,195,77,.8)' }); text(ctx, 'RICHEST PERSON ON EARTH', W / 2, 760, { font: F.osw, size: 60, color: '#fff', align: 'center', weight: 600, ls: 10 }); }
    sourceTag(ctx, credit('p_battery'));
  }, { name: 'richest' });
  cue(T('M058', 'richest'), 'cash', .8);

  // ======== CH7 TWITTER
  shot(['M059', 'Which'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E2E4A', '#041420', 'r'); chapter(ctx, t, T('M059', 'Which'), 7, 'THE BIRD AND THE SINK', C.xblue);
    const p = E.out(prog(t, T('M059', 'expensive'), T('M059', 'expensive') + .8)); ctx.save(); ctx.translate(W / 2 + 300, 560 - (1 - p) * 300); ctx.rotate(.03);
    ctx.fillStyle = '#FAFAF5'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.fillRect(-300, -380, 600, 760); ctx.shadowBlur = 0;
    text(ctx, 'RECEIPT', 0, -290, { font: F.mono, size: 50, color: '#111', align: 'center', weight: 700 }); text(ctx, '1x SOCIAL NETWORK', -250, -170, { font: F.mono, size: 34, color: '#111' });
    text(ctx, '$44,000,000,000', -250, -110, { font: F.mono, size: 44, color: '#111', weight: 700 }); ctx.fillStyle = '#111'; ctx.fillRect(-250, -60, 500, 3);
    text(ctx, 'REFUNDS: NONE', -250, 10, { font: F.mono, size: 34, color: '#111' }); text(ctx, 'THANK YOU!', 0, 300, { font: F.mono, size: 40, color: '#111', align: 'center' }); ctx.restore();
    text(ctx, 'IMPULSE', 140, 480, { font: F.bebas, size: 200, color: '#fff' }); text(ctx, 'BUY', 140, 660, { font: F.bebas, size: 200, color: C.xblue });
  }, { name: 'receipt' });
  cue(T('M059', 'expensive'), 'paper', .7);
  shot(['M060', 'In'], (ctx, t, lt) => {
    camPhoto(ctx, 'twitter_hq', lt, { grade: 'color', tint: 'blue', tintAmt: .45 }); shade(ctx, .45);
    timeStamp(ctx, '2022', 140, 180, t, T('M060', 'In'), { size: 80 }); moneyCount(ctx, t, T('M060', '44'), 0, 44e9, W / 2, 520, { size: 200, color: '#fff', glow: 'rgba(29,155,240,.7)' });
    if (t > T('M060', 'back')) stamp(ctx, 'DEAL OFF?', 620, 820, t, T('M060', 'back'), { size: 110, color: C.tred });
    if (t > T('M060', 'anyway.')) stamp(ctx, 'DEAL ON.', 1340, 820, t, T('M060', 'anyway.'), { size: 110, color: C.lime });
    sourceTag(ctx, credit('twitter_hq'));
  }, { name: 'twitter-44b' });
  cue(T('M060', 'back'), 'stamp'); cue(T('M060', 'anyway.'), 'stamp');
  shot(['M061', 'Just'], (ctx, t, lt) => {
    camPhoto(ctx, 'twitter_hq2', lt, { grade: 'color', z0: 1.08 }); shade(ctx, .3);
    if (t > T('M061', 'sink.')) popIn(ctx, t, T('M061', 'sink.'), 1360, 640, c => sinkIcon(c, 1.3), .5);
    if (t > T('M061', 'caption:')) postCard(ctx, 620, 760, 900, 'Entering Twitter HQ – let that sink in!', t, T('M061', 'caption:'), { date: 'Oct 26, 2022', avatar: 'p_2015', crop: [250, 120, 500, 500], h: 290 });
    sourceTag(ctx, credit('twitter_hq2'));
  }, { name: 'sink' });
  cue(T('M061', 'sink.'), 'thud', .7);
  shot(['M062', 'He'], (ctx, t, lt) => {
    camPhoto(ctx, 'x_hq', lt, { grade: 'bw', z0: 1.05 }); shade(ctx, .5);
    [['MOST STAFF: FIRED', 'fires'], ['BLUE CHECKS: FOR SALE', 'sells'], ['NEW NAME: X', 'renames']].forEach(([s, w], i) => { if (t < T('M062', w)) return; const y = 360 + i * 190;
      popIn(ctx, t, T('M062', w), 160, y, c => pill(c, s, 0, 0, { bg: [C.tred, C.xblue, '#111'][i], size: 64 })); });
    if (t > T('M062', 'X.')) glowText(ctx, 'X', 1500, 760, { font: F.bebas, size: 600, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.6)' });
    sourceTag(ctx, credit('x_hq'));
  }, { name: 'x-rename' });
  cue(T('M062', 'fires'), 'stamp', .5); cue(T('M062', 'sells'), 'cash', .5); cue(T('M062', 'X.'), 'hit', .9);
  shot(['M063', 'Goodbye,'], (ctx, t, lt) => {
    bgGrad(ctx, '#0D1117', '#000');
    if (t < T('M063', 'Hello,')) { const p = prog(t, T('M063', 'Goodbye,'), T('M063', 'Hello,')); bird(ctx, lerp(W / 2, W + 300, E.in(p)), lerp(540, 100, E.in(p)), 1.6, t); text(ctx, 'BYE, BIRDIE', W / 2, 960, { font: F.bebas, size: 110, color: '#7EC8FF', align: 'center' }); }
    else { const xs = [['X.com', '1999'], ['SpaceX', '2002'], ['X Æ A-12', '2020'], ['X', '2023']];
      glowText(ctx, 'HIS FAVOURITE LETTER', W / 2, 220, { font: F.osw, size: 56, color: '#fff', align: 'center', weight: 600, ls: 10 });
      xs.forEach(([a, y], i) => { const st = T('M063', 'favourite') + i * .25; if (t < st) return; popIn(ctx, t, st, 330 + i * 420, 560, c => { c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect(-180, -170, 360, 340, 26); c.fill();
        text(c, a, 0, 0, { font: F.bebas, size: a.length > 6 ? 90 : 130, color: '#fff', align: 'center' }); text(c, y, 0, 90, { font: F.osw, size: 44, color: C.gold, align: 'center', weight: 600 }); }); });
      if (t > T('M063', 'noticed.')) text(ctx, 'IN CASE YOU HADN\'T NOTICED', W / 2, 920, { font: F.hand, size: 90, color: C.gold, align: 'center', weight: 700 }); }
  }, { name: 'favourite-letter' });
  cue(T('M063', 'Hello,'), 'hit', .6); for (let i = 0; i < 4; i++) cue(T('M063', 'favourite') + i * .25, 'ding', .45);
  shot(['M064', 'In'], (ctx, t, lt) => {
    photo(ctx, 'p_doge', { x: 0, y: 0, w: W * .45, h: H, zoom: 1.05 + lt * .01, fy: .3, grade: 'color' }); ctx.fillStyle = '#0B1024'; ctx.fillRect(W * .45, 0, W * .55, H);
    timeStamp(ctx, '2025 · WASHINGTON', 960, 200, t, T('M064', 'Washington'), { size: 70 });
    text(ctx, 'GOVERNMENT COST-CUTTING TEAM', 960, 330, { font: F.osw, size: 40, color: C.cream, weight: 600, ls: 6, alpha: prog(t, T('M064', 'cost-cutting'), T('M064', 'cost-cutting') + .3) });
    if (t > T('M064', 'DOGE.')) glowText(ctx, 'DOGE', 960, 520, { font: F.bebas, size: 220, color: '#fff' });
    if (t > T('M064', 'hero')) { pill(ctx, 'HERO TO SOME', 960, 690, { bg: C.lime, color: '#111', size: 50 }); }
    if (t > T('M064', 'villain')) { pill(ctx, 'VILLAIN TO OTHERS', 1360, 800, { bg: C.tred, size: 50 }); }
    if (t > T('M064', 'out.')) stamp(ctx, 'EXIT · MAY 2025', 1340, 960, t, T('M064', 'out.'), { size: 90, color: C.gold });
    sourceTag(ctx, credit('p_doge'));
  }, { name: 'doge' });
  cue(T('M064', 'out.'), 'stamp');

  // ======== CH8 STARSHIP + TRILLION
  shot(['M065', 'Meanwhile'], (ctx, t, lt) => {
    camPhoto(ctx, 'starship_pad', lt, { grade: 'color', z0: 1.08, fy: .4 }); shade(ctx, .3); lightLeak(ctx, t, .25, 6); chapter(ctx, t, T('M065', 'Meanwhile'), 8, 'TO ORBIT, AND A TRILLION', C.gold);
    if (t > T('M065', 'Starship.')) bigTitle(ctx, 'STARSHIP', 140, 900, t, T('M065', 'Starship.') - .1, { size: 220, bar: C.gold });
    if (t > T('M065', 'biggest')) pill(ctx, 'BIGGEST ROCKET EVER BUILT', 1300, 960, { bg: C.gold, color: '#111', size: 40 });
    sourceTag(ctx, credit('starship_pad'));
  }, { name: 'starship' });
  cue(T('M065', 'Starship.'), 'hit', .8);
  shot(['M066', 'Its'], (ctx, t, lt) => {
    const k = IMG[BOOM] ? (t < T('M066', 'explosion.') ? 'ift1_f6' : BOOM) : 'starship_ift2'; camPhoto(ctx, k, lt, { grade: 'color', z0: 1.06, zs: .02, fy: .6 }); shade(ctx, .2);
    timeStamp(ctx, 'FIRST FLIGHT · APRIL 2023', 140, 180, t, T('M066', 'first'), { size: 70 });
    if (t > T('M066', 'explosion.')) { boom(ctx, W / 2, H / 2, t, T('M066', 'explosion.'), 900); }
    if (t > T('M066', 'calls')) { const p = prog(t, T('M066', 'calls'), T('M066', 'calls') + .4); ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = 'rgba(250,246,236,.96)'; ctx.fillRect(260, 640, 1400, 300);
      text(ctx, 'rapid unscheduled disassembly', 320, 750, { font: F.play, size: 76, color: '#111', weight: 700 }); text(ctx, '(n.) SpaceX term for...', 320, 850, { font: F.playI, size: 50, color: '#555' }); ctx.restore(); }
    sourceTag(ctx, credit(k.startsWith('ift1') ? 'ift1_vid' : 'starship_ift2', 'Starship IFT-1, NASA WB-57 camera'));
  }, { name: 'rud' });
  cue(T('M066', 'explosion.'), 'impact', 1);
  shot(['M067', 'Which'], (ctx, t, lt) => {
    const k = IMG['ift1b_f9'] ? 'ift1b_f9' : (IMG[BOOM] ? BOOM : 'starship_ift2'); camPhoto(ctx, k, lt, { grade: 'color', z0: 1.5, fy: .38, fx: .66 }); shade(ctx, .35);
    ctx.save(); ctx.fillStyle = 'rgba(250,246,236,.96)'; ctx.fillRect(260, 640, 1400, 300); text(ctx, 'rapid unscheduled disassembly', 320, 750, { font: F.play, size: 76, color: '#111', weight: 700 }); ctx.restore();
    stamp(ctx, '= IT BLEW UP.', W / 2, 870, t, T('M067', 'it'), { size: 130 }); boom(ctx, W / 2, 300, t, T('M067', 'up.'), 700);
  }, { name: 'blew-up' });
  cue(T('M067', 'it'), 'stamp'); cue(T('M067', 'up.'), 'impact', .8);
  shot(['M068', 'But'], (ctx, t, lt) => {
    const ok = IMG[CATCH], f = ok ? (t < T('M068', 'catches') ? 'catch_f9' : CATCH) : 'starship_ift5'; camPhoto(ctx, IMG[f] ? f : 'starship_ift5', lt, { grade: 'color', z0: ok ? 2.5 : 1.05, zs: .06, fx: .57, fy: .6 }); shade(ctx, .15);
    timeStamp(ctx, '13 OCT 2024', 140, 180, t, T('M068', 'October'), { size: 80 });
    if (t > T('M068', 'catches')) glowText(ctx, 'CAUGHT.', W - 160, 900, { font: F.bebas, size: 200, color: '#fff', align: 'right', glow: 'rgba(56,214,232,.9)' });
    if (t > T('M068', 'chopsticks.')) pill(ctx, '"THE CHOPSTICKS"', 140, 960, { bg: C.gold, color: '#111', size: 50 });
    sourceTag(ctx, credit(ok ? 'catch_vid' : 'starship_ift5', 'Starship IFT-5 booster catch'));
  }, { name: 'catch' });
  cue(T('M068', 'catches'), 'hit', 1);
  shot(['M069', 'Catching'], (ctx, t, lt) => {
    bgGrad(ctx, '#FFE7B8', '#F6B96B'); halftone(ctx, .1, 9); bowl(ctx, 1460, 760, 1.4, t);
    text(ctx, 'SPACEX: CATCHES A', 140, 360, { font: F.bebas, size: 120, color: '#2A1A0A' }); text(ctx, 'SKYSCRAPER-SIZED ROCKET', 140, 480, { font: F.bebas, size: 120, color: C.tred });
    if (t > T('M069', 'Most')) { text(ctx, 'US: CAN\'T EVEN', 140, 700, { font: F.bebas, size: 120, color: '#2A1A0A' }); text(ctx, 'CATCH NOODLES', 140, 820, { font: F.bebas, size: 120, color: C.tred }); }
  }, { name: 'noodles' });
  cue(T('M069', 'Most'), 'ding', .6);
  shot(['M070', 'Then'], (ctx, t, lt) => {
    bgGrad(ctx, '#140A2A', '#000', 'r'); speedLines(ctx, t, 'rgba(255,255,255,.2)');
    punch(ctx, '2026', W / 2, 360, t, T('M070', '2026'), { font: F.bebas, size: 260, color: '#fff' });
    if (t > T('M070', 'merges')) { const p = E.inOut(prog(t, T('M070', 'merges'), T('M070', 'merges') + .7));
      pill(ctx, 'SPACEX', lerp(500, 800, p), 720, { align: 'center', bg: '#fff', color: '#111', size: 70 }); text(ctx, '+', W / 2, 745, { font: F.bebas, size: 120, color: C.gold, align: 'center', alpha: p });
      pill(ctx, 'xAI', lerp(1420, 1120, p), 720, { align: 'center', bg: C.violet, size: 70 }); }
    if (t > T('M070', 'xAI.')) text(ctx, 'FEBRUARY 2026 · MERGER', W / 2, 900, { font: F.osw, size: 44, color: C.cream, align: 'center', weight: 600, ls: 8 });
  }, { name: 'merge' });
  cue(T('M070', '2026'), 'impact', .7); cue(T('M070', 'merges'), 'whoosh', .6);
  shot(['M071', 'On'], (ctx, t, lt) => {
    camPhoto(ctx, 'nasdaq26', lt, { grade: 'color', z0: 1.05, fy: .35 }); shade(ctx, .45); lightLeak(ctx, t, .2, 9, 'cool');
    timeStamp(ctx, 'JUNE 12, 2026', 140, 180, t, T('M071', 'June'), { size: 86 }); text(ctx, 'SPACEX GOES PUBLIC', W / 2, 400, { font: F.osw, size: 64, color: '#fff', align: 'center', weight: 600, ls: 10, alpha: prog(t, T('M071', 'public.'), T('M071', 'public.') + .3) });
    moneyCount(ctx, t, T('M071', '75'), 0, 75e9, W / 2, 620, { size: 200 });
    if (t > T('M071', 'biggest')) pill(ctx, 'BIGGEST IPO IN HISTORY', W / 2, 820, { align: 'center', bg: C.tred, size: 56 });
    sourceTag(ctx, credit('nasdaq26', 'Nasdaq'));
  }, { name: 'ipo' });
  cue(T('M071', '75'), 'cash', .9); cue(T('M071', 'biggest'), 'ding', .6);
  shot(['M072', 'By'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A1200', '#000', 'r'); lightLeak(ctx, t, .25, 2);
    moneyRain(ctx, t, T('M072', 'Forbes'), 'bill100', EP.billCrop, 40, { size: 260, spread: 2.5, alpha: .8 }); shade(ctx, .25);
    moneyCount(ctx, t, T('M072', '2'), 75e9, 2e12, W / 2, 380, { size: 160, color: '#fff', glow: 'rgba(255,255,255,.4)' }); text(ctx, 'SPACEX VALUE, END OF DAY ONE', W / 2, 460, { font: F.osw, size: 40, color: C.cream, align: 'center', weight: 600, ls: 8, alpha: prog(t, T('M072', '2'), T('M072', '2') + .3) });
    if (t > T('M072', 'Forbes')) { moneyCount(ctx, t, T('M072', 'Forbes'), 0.4e12, 1.1e12, W / 2, 740, { size: 230 }); text(ctx, "ELON'S NET WORTH (FORBES)", W / 2, 830, { font: F.osw, size: 44, color: C.gold, align: 'center', weight: 600, ls: 8 });
 }
  }, { name: 'trillionaire' });
  cue(T('M072', 'Forbes'), 'cash', 1);
  shot(['M073', 'Remember'], (ctx, t, lt) => {
    photo(ctx, 'p_laugh', { x: W * .5, y: 0, w: W * .5, h: H, zoom: 1.08, fx: .45, fy: .3, grade: 'color' }); ctx.fillStyle = '#07101F'; ctx.fillRect(0, 0, W * .5, H);
    hudRockets(ctx, t, T('M073', 'Remember'), 260, 700); text(ctx, '2008: 3 FAILED ROCKETS', 400, 860, { font: F.osw, size: 44, color: C.tred, align: 'center', weight: 600, ls: 4 });
    if (t > T('M073', 'Yeah.')) stamp(ctx, 'YEAH. HIM.', 1440, 900, t, T('M073', 'Yeah.'), { size: 130, color: C.gold });
    sourceTag(ctx, credit('p_laugh'));
  }, { name: 'yeah-him' });
  cue(T('M073', 'Yeah.'), 'stamp');
  shot(['M074', 'In'], (ctx, t, lt) => {
    if (t < T('M074', 'Next')) { camPhoto(ctx, 'starship_iss', lt, { grade: 'color', z0: 1.05 }); shade(ctx, .2); timeStamp(ctx, 'SEPTEMBER 2026 · ORBIT', 140, 180, t, T('M074', 'In'), { size: 70 }); sourceTag(ctx, credit('starship_iss', 'Starship seen from the ISS (2024)')); }
    else { spaceBG(ctx, t, '#C2502A'); const steps = [['CATCH BOTH HALVES', 'catch'], ['THE MOON', 'Moon.'], ['MARS', 'Mars.']];
      steps.forEach(([s, w], i) => { const st = T('M074', w); if (t < st) return; const x = 330 + i * 630; popIn(ctx, t, st, x, 540, c => {
        if (i === 2) { c.save(); c.beginPath(); c.arc(0, -40, 170, 0, 7); c.clip(); photo(c, 'mars', { x: -170, y: -210, w: 340, h: 340, grade: 'color' }); c.restore(); }
        else if (i === 1) { const g = c.createRadialGradient(-30, -70, 10, 0, -40, 170); g.addColorStop(0, '#F4F4F0'); g.addColorStop(1, '#8C8C88'); c.fillStyle = g; c.beginPath(); c.arc(0, -40, 170, 0, 7); c.fill(); }
        else { rocket(c, -50, 100, .8, t); rocket(c, 60, 100, .8, t); }
        text(c, s, 0, 230, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); });
        if (i) { penArrow(ctx, x - 470, 520, x - 210, 520, prog(t, st - .1, st + .2), { color: C.gold }); } }); }
  }, { name: 'next' });
  cue(T('M074', 'Moon.'), 'ding', .5); cue(T('M074', 'Mars.'), 'hit', .7);

  // ======== CH9 WHO IS HE
  shot(['M075', 'So'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_royal', lt, { grade: 'color', z0: 1.15, zs: .04, fy: .3 }); shade(ctx, .35); vign(ctx, .7);
    wipeText(ctx, 'WHO IS ELON MUSK,', W / 2, 820, prog(t, T('M075', 'who'), T('M075', 'who') + .4), { size: 140, color: '#fff', align: 'center' });
    wipeText(ctx, 'REALLY?', W / 2, 960, prog(t, T('M075', 'really?'), T('M075', 'really?') + .3), { size: 140, color: C.gold, align: 'center' });
    sourceTag(ctx, credit('p_royal'));
  }, { name: 'who' });
  shot(['M076', 'A'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0A1022', 'rgba(255,255,255,.05)', 80, 4);
    const cards = [['blastar', 'THE $500 GAME', 'kid'], ['f1_flight4', 'BET EVERYTHING', 'bet'], ['p_twitter', 'POSTS AT 2 A.M.', 'billionaire']];
    cards.forEach(([k, l, w], i) => { const st = T('M076', w); if (t < st) return; const p = E.out(prog(t, st, st + .4));
      ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 80); frame(ctx, k, 140 + i * 590, 260, 500, 460, { rot: (i - 1) * .03, label: l, labelBg: [C.lime, C.tred, C.xblue][i] }); ctx.restore(); });
  }, { name: 'triptych' });
  cue(T('M076', 'kid'), 'shutter', .6); cue(T('M076', 'bet'), 'shutter', .6); cue(T('M076', 'billionaire'), 'shutter', .6);
  shot(['M077', 'Love'], (ctx, t, lt) => {
    bgGrad(ctx, '#151A2E', '#05060C', 'r');
    text(ctx, 'LOVE HIM OR HATE HIM, HE CHANGED HOW WE...', W / 2, 260, { font: F.osw, size: 52, color: C.cream, align: 'center', weight: 600, ls: 6 });
    [['DRIVE', 'drive,', 'modelS'], ['FLY', 'fly,', 'demo2'], ['ARGUE', 'argues.', 'x_hq']].forEach(([s, w, k], i) => { const st = T('M077', w); if (t < st) return; const x = 140 + i * 590;
      frame(ctx, k, x, 380, 500, 380, { rot: 0 }); popIn(ctx, t, st, x + 250, 880, c => pill(c, s, 0, 0, { align: 'center', bg: [C.tred, C.teal, C.xblue][i], size: 70 })); });
  }, { name: 'changed' });
  cue(T('M077', 'drive,'), 'ding', .5); cue(T('M077', 'fly,'), 'ding', .5); cue(T('M077', 'argues.'), 'ding', .5);
  shot(['M078', 'And'], (ctx, t, lt) => {
    camPhoto(ctx, 'redsquare', lt, { grade: 'color', tint: 'red', tintAmt: .3, z0: 1.1 }); shade(ctx, .5);
    text(ctx, 'IF YOUR PLAN FEELS TOO CRAZY...', W / 2, 340, { font: F.osw, size: 56, color: '#fff', align: 'center', weight: 600, ls: 8 });
    if (t > T('M078', 'started')) wipeText(ctx, 'IT ALL STARTED WITH', W / 2, 580, prog(t, T('M078', 'started'), T('M078', 'started') + .4), { size: 130, color: '#fff', align: 'center' });
    if (t > T('M078', 'missiles')) wipeText(ctx, 'MISSILE SHOPPING IN RUSSIA', W / 2, 740, prog(t, T('M078', 'missiles'), T('M078', 'missiles') + .4), { size: 130, color: C.gold, align: 'center' });
    sourceTag(ctx, credit('redsquare'));
  }, { name: 'crazy-plan' });
  shot(['M079', 'This'], (ctx, t, lt) => {
    spaceBG(ctx, t, C.tred); const t0 = T('M079', 'This');
    glowText(ctx, 'UNFILED FILMS', W / 2, 300, { font: F.play, size: 96, color: C.cream, align: 'center', weight: 700, glow: 'rgba(255,255,255,.3)', alpha: prog(t, t0, t0 + .4) });
    if (t > T('M079', 'genius,')) { text(ctx, 'GENIUS', W / 2 - 360, 600, { font: F.bebas, size: 180, color: C.teal, align: 'center' }); }
    if (t > T('M079', 'or')) text(ctx, 'OR', W / 2, 580, { font: F.osw, size: 60, color: '#fff', align: 'center', weight: 600 });
    if (t > T('M079', 'lucky?')) text(ctx, 'LUCKY?', W / 2 + 360, 600, { font: F.bebas, size: 180, color: C.gold, align: 'center' });
    if (t > T('M079', 'comments,')) pill(ctx, 'TELL US IN THE COMMENTS', W / 2, 770, { align: 'center', bg: '#fff', color: '#111', size: 44 });
    if (t > T('M079', 'subscribe')) { const p = Math.max(0, E.back(prog(t, T('M079', 'subscribe'), T('M079', 'subscribe') + .35))); ctx.save(); ctx.translate(W / 2, 920); ctx.scale(p, p);
      ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-260, -62, 520, 124, 62); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 26, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .8);
  }, { name: 'cta' });
  cue(T('M079', 'subscribe'), 'ding', .7);
}
