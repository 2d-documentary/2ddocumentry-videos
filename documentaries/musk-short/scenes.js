// Elon Musk in 60 seconds — vertical Short (1080x1920). Uses the musk asset set. Helpers copied from documentaries/musk/scenes.js.
'use strict';
const EP = { images: {}, credit: {}, billCrop: [12, 12, 1176, 481], captions: true, captionY: 1560, captionSize: 96, scenes };
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

const CX = 540;
// ---------------------------------------------------------------- scenes (vertical Short)
function brand(ctx) { text(ctx, 'UNFILED FILMS', CX, 110, { font: F.play, size: 34, color: 'rgba(246,240,228,.8)', align: 'center', weight: 700, ls: 5 }); }
function scenes() {
  shot(['S01', 'In'], (ctx, t, lt) => {
    gridBG(ctx, t, '#07101F', 'rgba(56,214,232,.08)', 64, 8); vign(ctx, .7);
    photo(ctx, 'p_2008b', { x: 0, y: 180, w: W, h: 620, zoom: 1.05 + lt * .02, fx: .5, fy: .35, grade: 'bw', tint: 'navy', tintAmt: .4 });
    glowText(ctx, '2008', CX, 960, { font: F.bebas, size: 220, color: C.cream, align: 'center', glow: 'rgba(56,214,232,.5)' });
    if (t > T('S01', 'three')) { hudRockets(ctx, t, T('S01', 'three'), CX - 150, 1330); }
    if (t > T('S01', 'one')) popIn(ctx, t, T('S01', 'one'), CX, 1430, c => pill(c, '1 LAST TRY', 0, 0, { align: 'center', bg: C.gold, color: '#111', size: 60 }));
    fadeIn(ctx, t, 0, .3);
  }, { lead: .3, name: 's-2008' });
  cue(T('S01', 'three'), 'thud', .5); cue(T('S01', 'three') + .22, 'thud', .5); cue(T('S01', 'three') + .44, 'thud', .5); cue(T('S01', 'one'), 'ding', .6);
  shot(['S02', 'Tesla'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_roadster08', lt, { grade: 'warm', tint: 'red', tintAmt: .3, z0: 1.1 }); shade(ctx, .45); embers(ctx, t, .7);
    text(ctx, 'TESLA · CASH', 140, 420, { font: F.osw, size: 48, color: C.cream, weight: 600, ls: 6 });
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.strokeRect(140, 460, 800, 120); const lv = lerp(.8, .06, E.inOut(prog(t, T('S02', 'Tesla'), T('S02', 'cash.', 'e') + .3)));
    ctx.fillStyle = lv < .25 ? C.tred : C.lime; ctx.fillRect(150, 470, 780 * lv, 100); ctx.restore();
    if (t > T('S02', 'marriage')) stamp(ctx, 'MARRIAGE: OVER', CX, 900, t, T('S02', 'marriage'), { size: 110 });
  }, { name: 's-cash' });
  cue(T('S02', 'marriage'), 'stamp');
  shot(['S03', 'Then'], (ctx, t, lt) => {
    camPhoto(ctx, 'f1_flight4', lt, { z0: 1.0, zs: .03, grade: 'color', fx: .5 }); lightLeak(ctx, t, .3, 7); gradeTop(ctx, .4);
    text(ctx, 'ROCKET #4', CX, 380, { font: F.bebas, size: 130, color: '#fff', align: 'center', shadow: 20 });
    if (t > T('S03', 'orbit.')) { flash(ctx, t, T('S03', 'orbit.'), .2); glowText(ctx, 'ORBIT.', CX, 960, { font: F.bebas, size: 260, color: '#fff', align: 'center', glow: 'rgba(182,243,106,.8)' }); }
  }, { name: 's-orbit' });
  cue(T('S03', 'orbit.'), 'hit', 1);
  shot(['S03', 'NASA'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_bolden', lt, { grade: 'warm', tint: 'blue', tintAmt: .3, z0: 1.0, fy: .3 }); shade(ctx, .55); snow(ctx, t);
    text(ctx, 'NASA CONTRACT', CX, 640, { font: F.bebas, size: 140, color: '#fff', align: 'center' });
    moneyCount(ctx, t, T('S03', '1.6'), 0, 1.6e9, CX, 860, { size: 170 });
    if (t > T('S03', 'Christmas')) { text(ctx, 'CHRISTMAS EVE', CX, 1080, { font: F.osw, size: 52, color: C.cream, align: 'center', weight: 600, ls: 10 }); }
    if (t > T('S03', 'saved.')) { pill(ctx, 'TESLA SAVED', CX - 40, 1250, { align: 'center', bg: C.lime, color: '#111', size: 64 }); }
  }, { name: 's-nasa' });
  cue(T('S03', '1.6'), 'cash', .9); cue(T('S03', 'saved.'), 'ding', .7);
  shot(['S04', 'After'], (ctx, t, lt) => {
    const a = T('S04', 'car'), b = T('S04', 'armored');
    if (t < a) { camPhoto(ctx, 'f9_arc', lt, { grade: 'color', z0: 1.0, fx: .5 }); shade(ctx, .2); if (t > T('S04', 'Rockets')) text(ctx, 'ROCKETS THAT LAND THEMSELVES', CX, 1250, { font: F.bebas, size: 90, color: '#fff', align: 'center', shadow: 25 }); }
    else if (t < b) { camPhoto(ctx, 'roadster_space', t - a, { grade: 'color', z0: 1.0, fx: .3 }); text(ctx, 'A CAR IN SPACE', CX, 1250, { font: F.bebas, size: 120, color: '#fff', align: 'center', shadow: 25 }); }
    else { const sm = T('S04', 'smashed'), sh = t > sm && t < sm + .35 ? (hash(Math.floor(t * 60)) - .5) * 30 : 0; ctx.save(); ctx.translate(sh, 0); camPhoto(ctx, 'cybertruck', t - b, { grade: 'color', z0: 1.0, fx: .5 }); ctx.restore();
      if (t > sm) { cracks(ctx, 560, 760, prog(t, sm, sm + .3)); flash(ctx, t, sm, .12); }
      if (t > T('S04', 'Twice.')) { cracks(ctx, 760, 900, prog(t, T('S04', 'Twice.'), T('S04', 'Twice.') + .3), 10); stamp(ctx, 'TWICE.', CX, 1250, t, T('S04', 'Twice.'), { size: 160 }); } }
  }, { name: 's-after' });
  cue(T('S04', 'car'), 'whoosh', .6); cue(T('S04', 'smashed'), 'impact', 1); cue(T('S04', 'Twice.'), 'impact', .9);
  shot(['S05', 'He'], (ctx, t, lt) => {
    camPhoto(ctx, 'twitter_hq', lt, { grade: 'color', tint: 'blue', tintAmt: .5, z0: 1.05 }); shade(ctx, .45);
    text(ctx, 'BOUGHT TWITTER', CX, 560, { font: F.osw, size: 64, color: '#fff', align: 'center', weight: 600, ls: 8 });
    moneyCount(ctx, t, T('S05', '44'), 0, 44e9, CX, 760, { size: 170, color: '#fff', glow: 'rgba(29,155,240,.7)' });
    if (t > T('S05', 'X.')) { glitch(ctx, t, .4); glowText(ctx, 'X', CX, 1330, { font: F.bebas, size: 480, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.7)' }); }
  }, { name: 's-x' });
  cue(T('S05', '44'), 'cash', .7); cue(T('S05', 'X.'), 'hit', .9);
  shot(['S06', 'And'], (ctx, t, lt) => {
    camPhoto(ctx, 'nasdaq26', lt, { grade: 'color', z0: 1.0, fy: .4 }); shade(ctx, .5); lightLeak(ctx, t, .25, 2);
    moneyRain(ctx, t, T('S06', 'first'), 'bill100', EP.billCrop, 26, { size: 240, spread: 2, alpha: .8 }); shade(ctx, .2);
    timeStamp(ctx, '2026', CX - 110, 420, t, T('S06', '2026,'), { size: 120 }); text(ctx, 'SPACEX GOES PUBLIC', CX, 600, { font: F.osw, size: 56, color: '#fff', align: 'center', weight: 600, ls: 6, alpha: prog(t, T('S06', 'debut'), T('S06', 'debut') + .3) });
    if (t > T('S06', 'first')) { moneyCount(ctx, t, T('S06', 'first'), 0.4e12, 1.1e12, CX, 900, { size: 150 }); text(ctx, 'FIRST TRILLIONAIRE IN HISTORY', CX, 1000, { font: F.osw, size: 44, color: C.gold, align: 'center', weight: 600, ls: 4 }); }
  }, { name: 's-trillion' });
  cue(T('S06', 'first'), 'cash', 1);
  shot(['S07', 'Not'], (ctx, t, lt) => {
    gridBG(ctx, t, '#06140A', 'rgba(120,255,140,.08)', 48, 10);
    card(ctx, 'blastar', { cx: CX, cy: 640, maxW: 860, maxH: 620, rot: -.03 });
    glowText(ctx, 'BLASTAR · AGE 12', CX, 1060, { font: F.mono, size: 70, color: C.lime, align: 'center', glow: 'rgba(120,255,140,.8)', weight: 700 });
    moneyCount(ctx, t, T('S07', 'five'), 0, 500, CX, 1300, { size: 170, dur: .6 });
  }, { name: 's-blastar' });
  cue(T('S07', 'five'), 'cash', .7);
  shot(['S08', 'His'], (ctx, t, lt) => {
    camPhoto(ctx, 'p_royal', lt, { grade: 'color', z0: 1.05, fy: .25 }); shade(ctx, .4); vign(ctx, .7);
    bigTitle(ctx, 'ELON MUSK', CX, 860, t, T('S08', 'His') - .1, { align: 'center', size: 190, bar: C.tred });
    text(ctx, 'FULL STORY ON UNFILED FILMS', CX, 960, { font: F.osw, size: 46, color: C.gold, align: 'center', weight: 600, ls: 4, alpha: prog(t, T('S08', 'story'), T('S08', 'story') + .3) });
    if (t > T('S08', 'Unfiled')) { const p = Math.max(0, E.back(prog(t, T('S08', 'Unfiled'), T('S08', 'Unfiled') + .3))); ctx.save(); ctx.translate(CX, 1200); ctx.scale(p, p); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-280, -70, 560, 140, 70); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 25, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .5);
  }, { name: 's-cta' });
  cue(T('S08', 'His') - .1, 'impact', .8);
  const _d = SHOTS.map(s => s.draw); SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _d[i](ctx, t, lt, sh); brand(ctx); }; });
}
