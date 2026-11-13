// Elon Musk: the craziest hand of poker — vertical Short v2 (1080x1920) in the KINETIC style (doc/snippets/kinetic.js).
'use strict';
const EP = { images: {}, credit: {}, billCrop: [12, 12, 1176, 481], captions: false, scenes,
  kEmph: ['garbage', 'three', 'fire', 'mars', 'rent', 'folds', 'everything', 'one', 'orbit', 'nasa', 'christmas', 'bankrupt', 'all', 'trillionaire', '2008', 'elon'], kBleep: ['fuck', 'shit'] };
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const CLIPS = { ign: ['catch_vid', 35], rise: ['catch_vid', 38], boom: ['ift1_vid', 32], boom2: ['ift1_vid', 32], up: ['ift1_vid', 35] };
for (const k in CLIPS) for (let i = 0; i < CLIPS[k][1]; i++) EP.images[k + '_' + i] = `archives/footage/${CLIPS[k][0]}_${k}_${i}.jpg`;
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
const CX = 540;

// Shared editorial helpers (from the Musk / Silk Road episodes). Paste into an episode's scenes.js AFTER the header,
// which must define: EP, C (palette), credit(k, extra), and (for worldMap pins) PLACES. See doc/snippets/README.md.
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


// Drawn props (bitcoin coins, laptop, fake IDs, parcel, popcorn tin, chat window, forum post, prison bars, shelves, diary, spreadsheet,
// gavel, marketplace mock, cash stack). Needs editorial_helpers.js first. Uses SR palette defined at the top of this file.
// ---------------------------------------------------------------- Silk Road props (drawn)
const SR = { purple: '#8A5CF6', green: '#3BE07A', amber: '#FFB547', paper: '#F4ECDC', ink: '#1B1712', blood: '#C8322A', night: '#070A12', btc: '#F7931A' };
function btcCoin(ctx, x, y, r, t, o = {}) { // physical-style bitcoin prop
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); const sx = o.flip ? Math.cos(t * (o.spin || 3)) : 1; ctx.scale(sx, 1);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#FFE39A'); g.addColorStop(.6, '#F7A928'); g.addColorStop(1, '#B86A08');
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = r * .4; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(120,60,0,.6)'; ctx.lineWidth = r * .07; ctx.beginPath(); ctx.arc(0, 0, r * .84, 0, 7); ctx.stroke();
  if (Math.abs(sx) > .25) { ctx.fillStyle = '#8A4A00'; ctx.font = `700 ${r * 1.15}px ${F.osw}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.rotate(.21); ctx.fillText('B', 0, r * .04);
    ctx.fillRect(-r * .2, -r * .7, r * .09, r * .22); ctx.fillRect(r * .03, -r * .7, r * .09, r * .22); ctx.fillRect(-r * .2, r * .48, r * .09, r * .22); ctx.fillRect(r * .03, r * .48, r * .09, r * .22); }
  ctx.restore();
}
function coinRain(ctx, t, t0, n = 40, o = {}) { if (t < t0) return; const lt = t - t0;
  for (let i = 0; i < n; i++) { const st = hash(i * 3) * (o.spread || 1.5); if (lt < st) continue; const y = -100 + (lt - st) * (500 + hash(i) * 500); if (y > H + 100) continue;
    btcCoin(ctx, hash(i * 7) * W, y, (o.r || 46) * (.7 + hash(i * 11) * .6), t + i, { flip: true, spin: 3 + hash(i) * 4 }); } }
function laptop(ctx, x, y, s, o = {}, screenFn) { // base centre at (x,y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const w = 520, h = 330;
  ctx.fillStyle = '#B9BEC6'; ctx.beginPath(); ctx.moveTo(-w / 2 - 50, 0); ctx.lineTo(w / 2 + 50, 0); ctx.lineTo(w / 2 + 30, 26); ctx.lineTo(-w / 2 - 30, 26); ctx.fill();
  ctx.fillStyle = '#2A2E35'; ctx.beginPath(); ctx.roundRect(-w / 2, -h - 8, w, h, 14); ctx.fill();
  ctx.fillStyle = o.screen || '#0B0F14'; ctx.fillRect(-w / 2 + 16, -h + 8, w - 32, h - 32);
  if (screenFn) { ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 16, -h + 8, w - 32, h - 32); ctx.clip(); ctx.translate(-w / 2 + 16, -h + 8); screenFn(ctx, w - 32, h - 32); ctx.restore(); }
  if (o.glow) { ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(0, -h / 2, 10, 0, -h / 2, 500); g.addColorStop(0, 'rgba(120,200,255,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-600, -700, 1200, 900); }
  ctx.restore();
}
function srScreen(label, col = SR.green) { return (c, w, h) => { c.fillStyle = '#0A140E'; c.fillRect(0, 0, w, h); c.fillStyle = col; c.font = `600 26px ${F.mono}`;
  c.fillText(label, 18, 40); for (let i = 0; i < 6; i++) { c.globalAlpha = .5; c.fillRect(18, 70 + i * 34, 120 + hash(i * 5) * 300, 14); } c.globalAlpha = 1; }; }
function onion(ctx, x, y, r, t, p = 1) { ctx.save(); ctx.translate(x, y);
  for (let i = 4; i >= 0; i--) { const rr = r * (.35 + i * .16) * clamp(p * 5 - (4 - i)); if (rr <= 0) continue; ctx.fillStyle = i % 2 ? '#6B3FD6' : '#9A73FF'; ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(0, -rr * 1.25); ctx.bezierCurveTo(rr * 1.1, -rr * .5, rr * 1.0, rr * .9, 0, rr); ctx.bezierCurveTo(-rr * 1.0, rr * .9, -rr * 1.1, -rr * .5, 0, -rr * 1.25); ctx.fill(); }
  ctx.strokeStyle = '#B9F27A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -r * 1.05); ctx.quadraticCurveTo(r * .2, -r * 1.4, r * .1, -r * 1.6); ctx.stroke(); ctx.restore(); }
function idCard(ctx, x, y, s, name, i, o = {}) { // generic fake ID prop with the face photo
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); const cols = ['#D9E8F5', '#F5E3D9', '#E1F5D9', '#F2D9F5', '#F5F1D9'];
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.fillStyle = cols[i % 5]; ctx.beginPath(); ctx.roundRect(-170, -108, 340, 216, 14); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = ['#1E4E8C', '#8C2E1E', '#2E7A3A', '#6A2E8C', '#8C7A1E'][i % 5]; ctx.fillRect(-170, -108, 340, 40);
  text(ctx, ['DRIVER LICENSE', 'IDENTITY CARD', 'DRIVING PERMIT', 'NATIONAL ID', 'LICENCE'][i % 5], 0, -80, { font: F.osw, size: 22, color: '#fff', align: 'center', weight: 600, ls: 3 });
  if (o.face && IMG[o.face]) { ctx.save(); ctx.beginPath(); ctx.rect(-150, -50, 110, 140); ctx.clip(); const im = IMG[o.face], c = o.crop || [0, 0, im.width, im.height]; ctx.filter = 'grayscale(.3)'; ctx.drawImage(im, c[0], c[1], c[2], c[3], -150, -50, 110, 140); ctx.restore(); }
  else { ctx.fillStyle = '#9AA3AE'; ctx.fillRect(-150, -50, 110, 140); personIcon(ctx, -95, 80, 1.2, '#5A6470'); }
  text(ctx, name, -20, -20, { font: F.osw, size: 28, color: '#111', weight: 600 }); for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-20, 5 + k * 22, 150 - k * 20, 8); }
  text(ctx, 'FAKE', 90, 90, { font: F.bebas, size: 30, color: 'rgba(200,40,40,.0)' }); ctx.restore(); }
function parcel(ctx, x, y, s, open, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#C89A5E'; ctx.fillRect(-260, -150, 520, 300); ctx.fillStyle = '#B4864C'; ctx.fillRect(-260, -150, 520, 40);
  const a = open * 1.9; ctx.save(); ctx.translate(-260, -150); ctx.rotate(-a); ctx.fillStyle = '#D6A96C'; ctx.fillRect(0, -2, 260, 40); ctx.restore();
  ctx.save(); ctx.translate(260, -150); ctx.rotate(a); ctx.fillStyle = '#D6A96C'; ctx.fillRect(-260, -2, 260, 40); ctx.restore();
  ctx.fillStyle = '#E8D7A8'; ctx.globalAlpha = .9; ctx.fillRect(-26, -150, 52, 300); ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.fillRect(40, -60, 190, 120); text(ctx, o.from || 'FROM: CANADA', 50, -25, { font: F.mono, size: 20, color: '#111' }); text(ctx, o.to || 'TO: SAN FRANCISCO', 50, 10, { font: F.mono, size: 20, color: '#111' });
  ctx.restore(); }
function popcornTin(ctx, x, y, s, t, lid = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-200, 0, 200, 0); g.addColorStop(0, '#9E1B1B'); g.addColorStop(.5, '#E2453A'); g.addColorStop(1, '#8A1515'); ctx.fillStyle = g; ctx.fillRect(-200, -300, 400, 400);
  ctx.fillStyle = '#F5E6C8'; for (let i = 0; i < 6; i++) ctx.fillRect(-200 + i * 72, -300, 30, 400);
  ctx.fillStyle = '#FFD45A'; ctx.beginPath(); ctx.ellipse(0, 100, 200, 34, 0, 0, Math.PI); ctx.fill();
  text(ctx, 'POPCORN', 0, -90, { font: F.bebas, size: 110, color: '#fff', align: 'center', shadow: 10 });
  ctx.save(); ctx.translate(0, -300 - lid * 260); ctx.rotate(lid * -.5); ctx.fillStyle = '#C9C9C9'; ctx.beginPath(); ctx.ellipse(0, 0, 214, 40, 0, 0, 7); ctx.fill(); ctx.restore();
  if (lid > .3) { const p = clamp((lid - .3) / .7); ctx.save(); ctx.translate(0, -300 - 220 * E.out(p)); ctx.fillStyle = '#1F6E3A'; ctx.fillRect(-120, -70, 240, 140);
    ctx.fillStyle = '#C9A227'; for (let i = 0; i < 10; i++) ctx.fillRect(-110 + i * 22, 60, 10, 16); ctx.fillStyle = '#222'; ctx.fillRect(-60, -40, 90, 60); ctx.fillStyle = '#DDD'; ctx.fillRect(50, -50, 50, 30);
    ctx.globalCompositeOperation = 'screen'; const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, 260); gg.addColorStop(0, `rgba(255,200,80,${.6 * p})`); gg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gg; ctx.fillRect(-300, -300, 600, 600); ctx.restore(); }
  ctx.restore(); }
function chatWin(ctx, x, y, w, msgs, t, o = {}) { // msgs: [who, text, t0, side]
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(12,16,24,.94)'; ctx.beginPath(); ctx.roundRect(0, 0, w, o.h || 520, 20); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#1B2232'; ctx.beginPath(); ctx.roundRect(0, 0, w, 64, [20, 20, 0, 0]); ctx.fill(); text(ctx, o.title || 'PRIVATE CHAT', 28, 42, { font: F.mono, size: 26, color: '#9FB3D1' });
  let yy = 110; msgs.forEach(([who, s, t0, side]) => { if (t < t0) return; const p = E.out(prog(t, t0, t0 + .3)); ctx.save(); ctx.globalAlpha = p; const bw = Math.min(w - 120, 40 + s.length * 17), bx = side ? w - bw - 30 : 30;
    ctx.fillStyle = side ? '#2B5DD9' : '#2A3142'; ctx.beginPath(); ctx.roundRect(bx, yy - 34, bw, 66, 16); ctx.fill(); text(ctx, who, bx + 4, yy - 44, { font: F.mono, size: 20, color: 'rgba(255,255,255,.55)' });
    text(ctx, s, bx + 20, yy + 10, { font: F.osw, size: 30, color: '#fff' }); ctx.restore(); yy += 110; }); ctx.restore(); }
function forumPost(ctx, x, y, w, user, body, t, t0, o = {}) { const p = E.out(prog(t, t0, t0 + .35)); if (p <= 0) return; ctx.save(); ctx.translate(x, y + (1 - p) * 40); ctx.globalAlpha = p;
  ctx.fillStyle = '#EDEFF2'; ctx.beginPath(); ctx.roundRect(0, 0, w, o.h || 300, 10); ctx.fill(); ctx.fillStyle = '#C9D2DE'; ctx.fillRect(0, 0, w, 56);
  text(ctx, o.forum || 'FORUM · 2011', 24, 38, { font: F.mono, size: 24, color: '#2A3A50' }); ctx.fillStyle = '#7A8CA6'; ctx.fillRect(24, 80, 70, 70);
  text(ctx, user, 112, 106, { font: F.osw, size: 34, color: '#1D3A6E', weight: 600 }); text(ctx, o.when || 'posted', 112, 140, { font: F.mono, size: 20, color: '#556' });
  wrapText(ctx, body.slice(0, Math.floor(clamp((t - t0 - .2) * 30, 0, body.length))), 24, 200, w - 48, 44, { font: F.type, size: 32, color: '#1B1B1B' }); ctx.restore(); }
function bars(ctx, p) { if (p <= 0) return; ctx.save(); ctx.fillStyle = '#2A2F36'; for (let i = 0; i < 12; i++) { const x = 60 + i * 160, h = H * E.out(p); ctx.fillRect(x, 0, 26, h);
  const g = ctx.createLinearGradient(x, 0, x + 26, 0); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, 0, 10, h); ctx.fillStyle = '#2A2F36'; }
  ctx.fillRect(0, H * .12, W * E.out(p), 22); ctx.fillRect(0, H * .82, W * E.out(p), 22); ctx.restore(); }
function shelves(ctx, t, lt, o = {}) { bgGrad(ctx, '#2A1C14', '#0C0806'); const cols = ['#7A2E2E', '#2E4A7A', '#2E6A4A', '#7A6A2E', '#5A2E7A', '#3A3A3A'];
  for (let r = 0; r < 4; r++) { const y = 120 + r * 250; ctx.fillStyle = '#4A3222'; ctx.fillRect(0, y + 210, W, 26); let x = -lt * 30 - (r % 2) * 40;
    while (x < W) { const bw = 30 + hash(x * .1 + r) * 40, h = 150 + hash(x + r * 13) * 55; ctx.fillStyle = cols[Math.floor(hash(x * 3 + r) * 6)]; ctx.fillRect(x, y + 210 - h, bw - 4, h); x += bw; } }
  if (o.sign) { const sy = o.signY ?? 40; ctx.fillStyle = '#F2E9D8'; ctx.fillRect(W / 2 - 330, sy, 660, 90); text(ctx, o.sign, W / 2, sy + 65, { font: F.osw, size: 52, color: '#2A1C14', align: 'center', weight: 700, ls: 6 }); }
  vign(ctx, .55); }
function diaryPage(ctx, x, y, lines, t, t0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -.02); ctx.fillStyle = '#FBF6E8'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.fillRect(-380, -260, 760, 520); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(80,120,200,.25)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-360, -170 + i * 54); ctx.lineTo(360, -170 + i * 54); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(200,60,60,.4)'; ctx.beginPath(); ctx.moveTo(-300, -260); ctx.lineTo(-300, 260); ctx.stroke();
  lines.forEach((s, i) => { const st = t0 + i * .5; if (t < st) return; const n = Math.floor(clamp((t - st) * 30, 0, s.length)); text(ctx, s.slice(0, n), -280, -180 + i * 54, { font: F.hand, size: 44, color: '#1E2A55', weight: 700 }); });
  ctx.restore(); }
function sheet(ctx, x, y, w, rows, t, t0) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, 60 + rows.length * 56); ctx.fillStyle = '#1F7A45'; ctx.fillRect(0, 0, w, 60);
  text(ctx, 'PROFITS.xls', 20, 42, { font: F.mono, size: 30, color: '#fff' }); rows.forEach(([a, b], i) => { if (t < t0 + i * .2) return; const yy = 60 + i * 56; ctx.fillStyle = i % 2 ? '#F2F6F3' : '#fff'; ctx.fillRect(0, yy, w, 56);
    ctx.strokeStyle = '#CFD8D2'; ctx.strokeRect(0, yy, w, 56); text(ctx, a, 20, yy + 38, { font: F.mono, size: 28, color: '#222' }); text(ctx, b, w - 20, yy + 38, { font: F.mono, size: 28, color: '#1F7A45', align: 'right', weight: 700 }); }); ctx.restore(); }
function gavel(ctx, x, y, s, t, t0) { const a = t < t0 ? -.6 : -.6 + Math.min(1, (t - t0) * 6) * .75; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#5A3A1E'; ctx.fillRect(-160, 60, 320, 40); ctx.save(); ctx.rotate(a); ctx.fillStyle = '#7A4E28'; ctx.fillRect(-10, -250, 20, 230); ctx.fillStyle = '#6A4020'; ctx.beginPath(); ctx.roundRect(-90, -300, 180, 80, 20); ctx.fill(); ctx.restore(); ctx.restore(); }
function shopMock(ctx, x, y, w, h, t, t0, o = {}) { // generic anonymous marketplace mock (no real listings)
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#F6F1E6'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#2E5E3A'; ctx.fillRect(0, 0, w, 90);
  text(ctx, 'silk road', 30, 64, { font: F.playI || F.play, size: 54, color: '#F6F1E6', weight: 700 }); text(ctx, 'anonymous marketplace', w - 30, 58, { font: F.mono, size: 22, color: '#CFE3D3', align: 'right' });
  for (let i = 0; i < 6; i++) { const st = t0 + i * .12; if (t < st) continue; const cx = 30 + (i % 3) * ((w - 60) / 3), cy = 120 + Math.floor(i / 3) * ((h - 140) / 2), cw = (w - 60) / 3 - 20, chh = (h - 140) / 2 - 20;
    ctx.globalAlpha = E.out(prog(t, st, st + .3)); ctx.fillStyle = '#fff'; ctx.fillRect(cx, cy, cw, chh); ctx.fillStyle = '#D8D2C4'; ctx.fillRect(cx + 14, cy + 14, cw - 28, chh * .5);
    text(ctx, 'LISTING #' + (1040 + i * 7), cx + 14, cy + chh * .5 + 54, { font: F.mono, size: 22, color: '#333' });
    const stars = o.stars ? 5 : 4 + (i % 2); for (let k = 0; k < 5; k++) { ctx.fillStyle = k < stars ? '#E8A21B' : '#CCC'; star(ctx, cx + 26 + k * 34, cy + chh - 30, 13); }
    ctx.globalAlpha = 1; } ctx.restore(); }
function star(ctx, x, y, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function cashStack(ctx, x, y, s, n = 5) { for (let i = 0; i < n; i++) { if (!IMG.bill100) { ctx.fillStyle = '#7BA05B'; ctx.fillRect(x - 140 * s, y - i * 14 * s, 280 * s, 120 * s); continue; }
  const im = IMG.bill100, c = EP.billCrop; ctx.save(); ctx.translate(x + (hash(i) - .5) * 20 * s, y - i * 14 * s); ctx.rotate((hash(i * 3) - .5) * .08); ctx.drawImage(im, c[0], c[1], c[2], c[3], -150 * s, -64 * s, 300 * s, 128 * s); ctx.restore(); } }
// ---- poker props (drawn): felt table, chips, playing cards (suits drawn as paths, no glyph fonts needed)
function feltTable(ctx, t) { bgGrad(ctx, '#0F4A2C', '#03140B', 'r'); ctx.save(); ctx.globalAlpha = .08; for (let i = 0; i < 600; i++) { ctx.fillStyle = hash(i) > .5 ? '#fff' : '#000'; ctx.fillRect(hash(i * 3) * W, hash(i * 7) * H, 2, 2); } ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, W * .8); g.addColorStop(0, 'rgba(255,240,200,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function chip(ctx, x, y, r, col = '#C8322A') { ctx.save(); ctx.translate(x, y); ctx.scale(1, .42); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(0, r * .25, r, 0, 7); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = r * .18; ctx.setLineDash([r * .32, r * .32]); ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(0, 0, r * .5, 0, 7); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r * .4, 0, 7); ctx.fill(); ctx.restore(); }
function chipStack(ctx, x, y, r, n, col) { for (let i = 0; i < n; i++) chip(ctx, x + (hash(i * 3 + x) - .5) * r * .08, y - i * r * .16, r, col); }
function suitPath(ctx, s, x, y, k) { ctx.beginPath();
  if (s === 'h') { ctx.moveTo(x, y + k * .35); ctx.bezierCurveTo(x - k * .9, y - k * .2, x - k * .45, y - k * .85, x, y - k * .35); ctx.bezierCurveTo(x + k * .45, y - k * .85, x + k * .9, y - k * .2, x, y + k * .35); }
  else if (s === 'd') { ctx.moveTo(x, y - k * .5); ctx.lineTo(x + k * .38, y); ctx.lineTo(x, y + k * .5); ctx.lineTo(x - k * .38, y); }
  else if (s === 's') { ctx.moveTo(x, y - k * .5); ctx.bezierCurveTo(x + k * .9, y + k * .05, x + k * .4, y + k * .55, x, y + k * .15); ctx.bezierCurveTo(x - k * .4, y + k * .55, x - k * .9, y + k * .05, x, y - k * .5); ctx.moveTo(x, y + k * .1); ctx.lineTo(x + k * .18, y + k * .5); ctx.lineTo(x - k * .18, y + k * .5); }
  else { [[0, -.25], [-.25, .08], [.25, .08]].forEach(([a, b]) => { ctx.moveTo(x + a * k + k * .22, y + b * k); ctx.arc(x + a * k, y + b * k, k * .22, 0, 7); }); ctx.moveTo(x, y); ctx.lineTo(x + k * .16, y + k * .5); ctx.lineTo(x - k * .16, y + k * .5); }
  ctx.closePath(); ctx.fill(); }
function playingCard(ctx, x, y, w, rank, suit, rot = 0, flip = 1) { // flip: 1 = face up, 0 = back (animate 0..1)
  const h = w * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(Math.max(.02, Math.abs(Math.cos((1 - flip) * Math.PI))), 1);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = '#FBFAF6'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * .07); ctx.fill(); ctx.shadowColor = 'transparent';
  if (flip < .5) { ctx.fillStyle = '#9B1C1C'; ctx.beginPath(); ctx.roundRect(-w / 2 + w * .07, -h / 2 + w * .07, w * .86, h - w * .14, w * .05); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; for (let i = -8; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-w / 2, i * w * .14); ctx.lineTo(w / 2, i * w * .14 + w * .5); ctx.stroke(); } }
  else { const red = suit === 'h' || suit === 'd'; ctx.fillStyle = red ? '#C8221C' : '#141414';
    text(ctx, rank, -w * .36, -h * .3, { font: F.play, size: w * .26, color: ctx.fillStyle, weight: 700 }); suitPath(ctx, suit, -w * .29, -h * .2, w * .16);
    suitPath(ctx, suit, 0, h * .05, w * .5); }
  ctx.restore(); }

// Vertical Short helpers: brand bug, CTA end shot, caption band for light backgrounds, finish() to stamp the brand on every shot.
// Brand text comes from EP.brand (default 'UNFILED FILMS'). Needs editorial_helpers.js + props.js, and CX = 540 in the header.
function brand(ctx) { text(ctx, EP.brand || 'UNFILED FILMS', CX, 110, { font: F.play, size: 34, color: 'rgba(246,240,228,.8)', align: 'center', weight: 700, ls: 5 }); }
function capBand(ctx) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0, 1460, W, 200); ctx.restore(); } // call on yellow/light shots so captions stay readable
function ctaShot(id, title, line2, firstWord) { // end card: title + "full story" line + subscribe pop on the last word
  const words = (LINE[id] || { words: [] }).words; const w0 = firstWord || (words[0] && words[0].w), wl = words.length ? words[words.length - 1].w : w0;
  shot([id, w0], (ctx, t, lt) => {
    bgGrad(ctx, '#120A24', '#000', 'r'); fog(ctx, t, .3, '140,90,255');
    glowText(ctx, title, CX, 720, { font: F.play, size: 110, color: '#fff', align: 'center', weight: 700, glow: 'rgba(138,92,246,.9)' });
    text(ctx, line2 || 'FULL STORY ON ' + (EP.brand || 'UNFILED FILMS'), CX, 840, { font: F.osw, size: 46, color: '#FFB547', align: 'center', weight: 600, ls: 4, alpha: prog(t, T(id, w0), T(id, w0) + .4) });
    const tw = T(id, wl); if (t > tw - .2) { const p = Math.max(0, E.back(prog(t, tw - .2, tw + .1))); ctx.save(); ctx.translate(CX, 1080); ctx.scale(p, p); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-280, -70, 560, 140, 70); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 25, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .5);
  }, { name: 's-cta' });
  cue(T(id, w0) - .05, 'impact', .7);
}
function finish() { const _d = SHOTS.map(s => s.draw); SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _d[i](ctx, t, lt, sh); brand(ctx); }; }); }

// KINETIC style (fast-cut cinematic doc look): glowing serif word-by-word subtitles, a cut every 0.5-1.5 s,
// light-bar / flash / pixel / blur-in transitions, big glowing serif words & numbers, photo walls, desk collages,
// headline cards with black highlight boxes, calendars, CRT TVs, real footage clips.
// Needs docengine + editorial_helpers (+ props for cash/bitcoin rain). Call kfinish() at the end of scenes()
// instead of finish(): it draws the subtitles and brand on every shot. Header: EP.captions = false.
// EP.kEmph = ['word', ...] -> those words render big italic. Shot option { cap: false } hides subtitles,
// { capY: 0.3 } moves them, { capDark: true } = dark text for white shots, { capMode: 'spread'|'stack'|'line' }.
GRADES.mood = 'grayscale(.45) saturate(.8) contrast(1.18) brightness(.82)';
GRADES.ink = 'grayscale(1) contrast(1.35) brightness(.9)';
GRADES.fire = 'contrast(1.6) saturate(1.5) brightness(.75) sepia(.25)';
GRADES.cine = 'saturate(.9) contrast(1.15) brightness(.85) sepia(.08)';

// ---------------------------------------------------------------- subtitles
let _KG = null;
function kGroups() {
  if (_KG) return _KG; _KG = [];
  TL.lines.forEach(l => {
    let g = [];
    const push = (end) => { if (g.length) _KG.push({ id: l.id, words: g, s: g[0].s, e: end }); g = []; };
    l.words.forEach((w, i) => {
      g.push(w); const nxt = l.words[i + 1]; const punct = /[.,!?;:]$/.test(w.w);
      if (!nxt) push(l.end + .3); else if (punct || g.length >= 3) push(nxt.s);
    });
  });
  for (let i = 0; i < _KG.length - 1; i++) _KG[i].e = Math.min(_KG[i].e, _KG[i + 1].s);
  return _KG;
}
const kClean = (w) => w.replace(/[^\w$'.,%-]/g, '').replace(/[.,]$/, '').toLowerCase();
function kcaps(ctx, t, sh) {
  if (sh && sh.cap === false) return;
  const g = kGroups().find(c => t >= c.s && t < c.e); if (!g) return;
  const emph = new Set((EP.kEmph || []).map(s => s.toLowerCase()));
  const y = H * (sh && sh.capY != null ? sh.capY : (VERT ? .5 : .52)), base = VERT ? 58 : 52;
  const dark = sh && sh.capDark;
  const bleep = new Set((EP.kBleep || []).map(s => s.toLowerCase()));
  const mask = (s) => bleep.has(kClean(s)) ? s.replace(/^(\W*\w)(\w*)/, (m, a, b) => a + '*'.repeat(Math.max(2, b.length))) : s;
  const parts = g.words.map(w => ({ w, s: mask(w.w.replace(/[",]/g, '').replace(/\.$/, g.words.length === 1 ? '.' : '')), big: emph.has(kClean(w.w)) }));
  const m0 = (sh && sh.capMode) || ''; if (m0 === 'caps' || m0 === 'box' || m0 === 'stack') { kcapsAlt(ctx, t, g, parts, m0, y, base, dark); return; }
  const mode = (sh && sh.capMode) || (g.words.length === 2 && hash(g.s * 7) > .55 ? 'spread' : 'line');
  ctx.save(); ctx.textBaseline = 'alphabetic';
  const fontOf = (p) => `${p.big ? 'italic ' : ''}${p.big ? base * 2.1 : base}px ${p.big ? F.playI : F.play}`;
  const widths = parts.map(p => { ctx.font = fontOf(p); return ctx.measureText(p.s).width; });
  const gap = base * .32; let xs;
  if (mode === 'spread') xs = [clamp(W * .22 - widths[0] / 2, 40, W - widths[0] - 40), clamp(W * .78 - widths[1] / 2, 40, W - widths[1] - 40)];
  else { const tot = widths.reduce((a, b) => a + b, 0) + gap * (parts.length - 1); let x = W / 2 - tot / 2; xs = widths.map(w => { const x0 = x; x += w + gap; return x0; }); }
  parts.forEach((p, i) => {
    const a = E.out(prog(t, p.w.s - .02, p.w.s + .14)); if (a <= 0) return;
    ctx.font = fontOf(p); ctx.globalAlpha = a;
    const yy = y + (1 - a) * 10, bl = (1 - a) * 8;
    ctx.filter = bl > .5 ? `blur(${bl}px)` : 'none';
    if (dark) { ctx.fillStyle = '#111'; ctx.shadowColor = 'rgba(255,255,255,.6)'; ctx.shadowBlur = 14; }
    else { ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(255,255,255,.75)'; ctx.shadowBlur = p.big ? 34 : 22; }
    ctx.fillText(p.s, xs[i], yy);
    if (!dark) { ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 18; ctx.globalAlpha = a * .55; ctx.fillText(p.s, xs[i], yy); }
  });
  ctx.restore();
}
function kfinish() {
  const _d = SHOTS.map(s => s.draw);
  SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _d[i](ctx, t, lt, sh); kcaps(ctx, t, sh); if (typeof brand === 'function' && EP.brandOn !== false) kbrand(ctx); }; });
}
function kbrand(ctx) { text(ctx, EP.brand || 'UNFILED FILMS', W / 2, VERT ? 96 : 60, { font: F.play, size: VERT ? 26 : 22, color: 'rgba(255,255,255,.55)', align: 'center', weight: 700, ls: 6 }); }

function kcapsAlt(ctx, t, g, parts, mode, y, base, dark) { // other subtitle looks from the references
  ctx.save(); ctx.textBaseline = 'alphabetic';
  if (mode === 'caps') { // bold condensed caps with cold glow (tech/AI look)
    const size = base * 1.25; ctx.font = `600 ${size}px ${F.osw}`; ctx.letterSpacing = '3px';
    const ws = parts.map(p => ctx.measureText(p.s.toUpperCase()).width), gap = size * .3, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1); let x = W / 2 - tot / 2;
    parts.forEach((p, i) => { const a = E.out(prog(t, p.w.s - .02, p.w.s + .12)); if (a > 0) { ctx.globalAlpha = a; ctx.shadowColor = 'rgba(90,150,255,.95)'; ctx.shadowBlur = 30; ctx.fillStyle = '#DCE8FF'; ctx.fillText(p.s.toUpperCase(), x, y); ctx.shadowBlur = 8; ctx.fillText(p.s.toUpperCase(), x, y); } x += ws[i] + gap; });
  } else if (mode === 'box') { // yellow marker boxes, black serif text
    const size = base * .95; ctx.font = `${size}px ${F.play}`;
    const ws = parts.map(p => ctx.measureText(p.s).width), gap = size * .22, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1); let x = W / 2 - tot / 2;
    parts.forEach((p, i) => { const a = E.out(prog(t, p.w.s - .02, p.w.s + .1)); if (a > 0) { ctx.globalAlpha = 1; ctx.fillStyle = '#F2E33A'; ctx.fillRect(x - 10, y - size * .82, (ws[i] + 20) * a, size * 1.08); if (a > .6) { ctx.fillStyle = '#111'; ctx.fillText(p.s, x, y); } } x += ws[i] + gap; });
  } else { // stack: one word per line, staggered, mixed sizes
    let yy = y - parts.length * base * .55;
    parts.forEach((p, i) => { const a = E.out(prog(t, p.w.s - .02, p.w.s + .14)); const size = p.big ? base * 2 : base * 1.15; yy += size * .95; if (a <= 0) return;
      ctx.font = `${p.big ? 'italic ' : ''}${size}px ${p.big ? F.playI : F.play}`; ctx.globalAlpha = a; ctx.fillStyle = dark ? '#111' : '#fff'; ctx.shadowColor = dark ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.7)'; ctx.shadowBlur = 22;
      ctx.fillText(p.s, W * .2 + i * base * .5, yy); });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- transitions (call at the END of a shot's draw)
function kIn(ctx, lt, type = 'flash', d) {
  if (type === 'flash') { const p = prog(lt, 0, d || .14); if (p < 1) { ctx.save(); ctx.globalAlpha = 1 - p; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  else if (type === 'bar') { const p = prog(lt, 0, d || .3); if (p < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const w = W * E.out(Math.min(1, p * 2)), h = 6 + 70 * p * p, a = 1 - p;
    const g = ctx.createLinearGradient(0, H / 2 - h, 0, H / 2 + h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(W / 2 - w / 2, H / 2 - h, w, h * 2); ctx.shadowColor = '#fff'; ctx.shadowBlur = 40; ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(W / 2 - w / 2, H / 2 - 3, w, 6); ctx.restore(); } }
  else if (type === 'pix') { const p = prog(lt, 0, d || .22); if (p < 1) { ctx.save(); const n = 26, s = W / 9; for (let i = 0; i < n; i++) { if (hash(i * 3.1) > 1 - p * 1.3 + .3) continue;
    ctx.globalAlpha = .9 * (1 - p); ctx.fillStyle = hash(i) > .5 ? '#fff' : '#cfd6e6'; ctx.fillRect(Math.floor(hash(i * 5) * 9) * s, Math.floor(hash(i * 7) * (H / s)) * s, s * (1 + (hash(i * 9) > .7)), s); } ctx.restore(); } }
  else if (type === 'blur') { const p = prog(lt, 0, d || .22); if (p < 1) { ctx.save(); ctx.filter = `blur(${(1 - p) * 26}px)`; ctx.globalAlpha = 1 - E.in(p); ctx.drawImage(ctx.canvas, 0, 0); ctx.restore(); } }
  else if (type === 'glitch') { const p = prog(lt, 0, d || .2); if (p < 1) glitch(ctx, lt * 3, 1.6 * (1 - p), 3); }
  else if (type === 'zoom') { const p = prog(lt, 0, d || .28); if (p < 1) { const z = lerp(1.32, 1, E.out(p)); ctx.save(); ctx.filter = `blur(${(1 - p) * 6}px)`; ctx.drawImage(ctx.canvas, W / 2 - W * z / 2, H / 2 - H * z / 2, W * z, H * z); ctx.restore(); } }
  else if (type === 'black') { const p = prog(lt, 0, d || .2); if (p < 1) { ctx.save(); ctx.globalAlpha = 1 - p; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
}
// bloom: soft glow of the bright parts (cheap)
function bloom(ctx, a = .35) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.filter = 'blur(22px) brightness(1.1)'; ctx.drawImage(ctx.canvas, 0, 0); ctx.restore(); }
function kGrade(ctx, t, o = {}) { vign(ctx, o.vig ?? .75); if (o.bloom !== false) bloom(ctx, o.bloom ?? .28); }

// ---------------------------------------------------------------- visuals
function kPhoto(ctx, key, lt, o = {}) { // fast cinematic push-in on a photo
  const z = (o.z0 ?? 1.16) - (o.pull ? lt * .05 : -lt * (o.zs ?? .05));
  photo(ctx, key, { zoom: Math.max(1, z), fx: o.fx ?? .5, fy: o.fy ?? .45, grade: o.grade || 'mood', tint: o.tint, tintAmt: o.tintAmt, blur: o.blur });
  if (o.shade) shade(ctx, o.shade);
}
function clipFrame(ctx, prefix, n, lt, o = {}) { // footage frames prefix_0..n-1 at fps
  const fps = o.fps || 15; let i = Math.floor(lt * fps * (o.speed || 1)) + (o.from || 0); i = o.loop ? i % n : Math.min(n - 1, i);
  photo(ctx, prefix + '_' + i, { zoom: (o.z0 ?? 1.08) + lt * (o.zs ?? .03), fx: o.fx ?? .5, fy: o.fy ?? .5, grade: o.grade || 'cine', blur: o.blur });
  if (o.shake) { ctx.translate((hash(Math.floor(lt * 30)) - .5) * o.shake, (hash(Math.floor(lt * 30) + 9) - .5) * o.shake); }
}
function bigWord(ctx, s, lt, o = {}) { // giant glowing serif word on black
  if (!o.keepBG) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  const p = E.out(prog(lt, 0, .35)), size = o.size || (VERT ? 230 : 210);
  ctx.save(); ctx.translate(W / 2, (o.y ?? .5) * H); ctx.scale(1 + (1 - p) * .12 + lt * .02, 1 + (1 - p) * .45 + lt * .02);
  ctx.font = `${o.italic ? 'italic ' : ''}${size}px ${o.italic ? F.playI : F.play}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = p; ctx.filter = p < 1 ? `blur(${(1 - p) * 14}px)` : 'none';
  ctx.shadowColor = o.glow || 'rgba(255,255,255,.85)'; ctx.shadowBlur = 60; ctx.fillStyle = o.color || '#fff'; ctx.fillText(s, 0, 0);
  ctx.shadowBlur = 18; ctx.fillText(s, 0, 0); ctx.restore();
}
function glowNum(ctx, v0, v1, lt, o = {}) { // counting big number with glow over stars
  if (!o.keepBG) { bgGrad(ctx, '#05070D', '#000', 'r'); stars(ctx, lt * 3, 120, 2, .6); }
  const p = E.out(prog(lt, o.delay || 0, (o.delay || 0) + (o.dur || 1.1))); const v = Math.round(lerp(v0, v1, p));
  const s = (o.pre || '') + v.toLocaleString('en-US') + (o.post || ''); let size = o.size || (VERT ? 130 : 170);
  ctx.save(); ctx.font = `${size}px ${F.play}`; const w = ctx.measureText(s).width; if (w > W * .9) size *= W * .9 / w; ctx.restore();
  glowText(ctx, s, W / 2, H * (o.y ?? .5), { font: F.play, size, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.8)', blur: 50 });
  if (o.sub) text(ctx, o.sub, W / 2 + (o.subDx ?? W * .28), H * (o.y ?? .5) + size * .42, { font: F.playI, size: size * .3, color: 'rgba(255,255,255,.85)', align: 'right' });
}
function photoWall(ctx, t, keys, o = {}) { // curved wall of tiles, slow pan; o.hero = index that glows
  ctx.fillStyle = '#05060A'; ctx.fillRect(0, 0, W, H);
  const cols = VERT ? 3 : 5, tw = W / cols * .94, th = tw * .72, pan = (o.pan ?? 1) * t * 40;
  const rows = Math.ceil(H / th) + 2;
  for (let r = -1; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = keys[(r * cols + c + 99 * keys.length) % keys.length];
    const cx = (c + .5) * W / cols, cy = r * th * 1.04 + ((pan + (c % 2) * th * .5) % th) - th * .2;
    const dx = (cx - W / 2) / W, sc = 1 - Math.abs(dx) * .18;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
    photo(ctx, k, { x: -tw / 2, y: -th / 2, w: tw - 8, h: th - 8, zoom: 1.05, grade: 'mood' }); ctx.restore();
  }
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .15, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function desk(ctx, t, o = {}) { // dark desk surface with a sweeping light
  bgGrad(ctx, o.a || '#2A1E14', o.b || '#0B0805', 'r');
  ctx.save(); ctx.globalAlpha = .18; for (let i = 0; i < 40; i++) { ctx.fillStyle = hash(i) > .5 ? '#000' : '#5a4330'; ctx.fillRect(0, hash(i * 3) * H, W, 2 + hash(i * 5) * 6); } ctx.restore();
  const x = W * (.3 + .4 * Math.sin(t * .4)); const g = ctx.createRadialGradient(x, H * .4, 0, x, H * .4, W * .9); g.addColorStop(0, 'rgba(255,230,190,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function polaroid(ctx, key, x, y, w, rot, p = 1, o = {}) {
  if (p <= 0) return; const h = w * (o.ratio || 1.05), sc = lerp(1.25, 1, E.out(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 2.5);
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; ctx.fillStyle = '#F2EFE8'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  photo(ctx, key, { x: -w / 2 + w * .06, y: -h / 2 + w * .06, w: w * .88, h: h - w * .26, zoom: 1.05, grade: o.grade || 'mood' });
  if (o.label) text(ctx, o.label, 0, h / 2 - w * .07, { font: F.hand, size: w * .1, color: '#222', align: 'center', weight: 700 });
  ctx.restore();
}
function yString(ctx, a, b, p, col = '#E6F23C') { // yellow evidence string with pins
  if (p <= 0) return; const q = E.out(clamp(p)); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], b[0], q), lerp(a[1], b[1], q)); ctx.stroke(); ctx.fillStyle = col;
  [a, q > .98 ? b : null].forEach(pt => { if (!pt) return; ctx.beginPath(); ctx.arc(pt[0], pt[1], 11, 0, 7); ctx.fill(); }); ctx.restore();
}
function headline(ctx, lt, lines, o = {}) { // paper headline card; o.hl = [lineIndex, 'phrase'] gets a black box
  ctx.fillStyle = '#F4F2EE'; ctx.fillRect(0, 0, W, H);
  const z = (VERT ? 1.02 : 1.2) + lt * .05; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(o.rot ?? -.025); ctx.translate(-W / 2, -H / 2);
  const size = o.size || (VERT ? 72 : 80), x0 = o.x ?? W * .08; let y = H * (o.y ?? .42);
  lines.forEach((ln, i) => {
    ctx.font = `${i === 0 && o.kicker ? 30 : size}px ${o.font || F.play}`; ctx.fillStyle = '#141414'; ctx.textBaseline = 'alphabetic';
    if (o.hl && o.hl[0] === i) { const idx = ln.indexOf(o.hl[1]); const pre = ctx.measureText(ln.slice(0, idx)).width, w = ctx.measureText(o.hl[1]).width, p = E.out(prog(lt, .25, .55));
      ctx.fillText(ln.slice(0, idx), x0, y); ctx.fillStyle = '#0B0B0B'; ctx.fillRect(x0 + pre - 8, y - size * .82, (w + 16) * p, size * 1.05);
      ctx.fillStyle = p > .5 ? '#fff' : '#141414'; ctx.fillText(o.hl[1], x0 + pre, y); ctx.fillStyle = '#141414'; ctx.fillText(ln.slice(idx + o.hl[1].length), x0 + pre + w, y); }
    else ctx.fillText(ln, x0, y);
    y += size * 1.15;
  });
  ctx.font = `28px ${F.osw}`; ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 9; i++) { ctx.fillRect(x0, y + 40 + i * 44, W * (.6 + hash(i) * .3), 14); }
  ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .2, W / 2, H / 2, H * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function calendarPage(ctx, lt, month, day, o = {}) { // fisheye calendar with the day circled
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const r = VERT ? W * .47 : H * .62; const z = 1.04 + lt * .06;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(Math.sin(lt * .8) * .02 - .04);
  ctx.fillStyle = '#F3EEE4'; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  text(ctx, month, -r * .82, -r * .55, { font: F.osw, size: r * (month.length > 7 ? .22 : .28), color: '#D7261E', weight: 700 });
  if (o.year) text(ctx, o.year, r * .8, -r * .55, { font: F.osw, size: r * .16, color: '#D7261E', weight: 500, align: 'right' });
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], cw = r * 1.64 / 7, start = o.start ?? 1;
  days.forEach((d, i) => text(ctx, d, -r * .82 + cw * (i + .5), -r * .32, { font: F.osw, size: r * .07, color: '#D7261E', align: 'center', weight: 600 }));
  for (let n = 1; n <= (o.len || 31); n++) { const c = (n - 1 + start) % 7, rr = Math.floor((n - 1 + start) / 7);
    const x = -r * .82 + cw * (c + .5), y = -r * .12 + rr * cw * .78; text(ctx, String(n), x, y, { font: F.osw, size: r * .1, color: '#2B2B2B', align: 'center', weight: 500 });
    if (n === day) { const p = prog(lt, .3, .8); penEllipse(ctx, x, y - r * .035, cw * .48, cw * .4, p, { color: "#D7261E", lw: 8 }); } }
  ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H / 2, r * .45, W / 2, H / 2, r * 1.2); g.addColorStop(0, 'rgba(255,240,215,0)'); g.addColorStop(.7, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,.95)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function crt(ctx, key, lt, o = {}) { // photo playing on an old TV in a dark room
  bgGrad(ctx, '#0E1420', '#000', 'r'); const w = VERT ? W * .82 : W * .5, h = w * .78, cx = W / 2, cy = H * (o.y ?? .5);
  ctx.save(); ctx.shadowColor = 'rgba(120,170,255,.45)'; ctx.shadowBlur = 90; ctx.fillStyle = '#1B1B1D'; ctx.beginPath(); ctx.roundRect(cx - w / 2 - 40, cy - h / 2 - 40, w + 80, h + 120, 40); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 50); ctx.clip();
  if (o.draw) o.draw(cx - w / 2, cy - h / 2, w, h); else photo(ctx, key, { x: cx - w / 2, y: cy - h / 2, w, h, zoom: 1.06 + lt * .03, grade: o.grade || 'cine' });
  ctx.globalAlpha = .18; for (let y = cy - h / 2; y < cy + h / 2; y += 6) { ctx.fillStyle = '#000'; ctx.fillRect(cx - w / 2, y, w, 3); }
  ctx.restore();
  ctx.fillStyle = '#2A2A2E'; ctx.beginPath(); ctx.arc(cx + w / 2 - 30, cy + h / 2 + 50, 16, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx + w / 2 - 80, cy + h / 2 + 50, 16, 0, 7); ctx.fill();
}
function orbitRing(ctx, t, lt) { // Earth limb + glowing orbit path with a tiny craft
  spaceBG(ctx, t, '#1E3A8A'); const R = W * 1.4, cx = W / 2, cy = H + R * .62;
  const g = ctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.08); g.addColorStop(0, '#0B2A5C'); g.addColorStop(.92, '#2E7BD6'); g.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.08, 0, 7); ctx.fill();
  const p = E.inOut(prog(lt, .1, 1.8)); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.setLineDash([2, 14]);
  ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.18, R * 1.18, 0, Math.PI * 1.25, Math.PI * (1.25 + .5 * p)); ctx.stroke(); ctx.setLineDash([]);
  const a = Math.PI * (1.25 + .5 * p); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R * 1.18, cy + Math.sin(a) * R * 1.18, 9, 0, 7); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- group photos: spotlight the main person
// photoPt(key, o, u, v): canvas point of image point (u, v in 0..1) for a photo() drawn with the same options o.
function photoPt(key, o, u, v) {
  const im = IMG[key]; if (!im) return [W / 2, H / 2];
  const bx = o.x ?? 0, by = o.y ?? 0, bw = o.w ?? W, bh = o.h ?? H, z = o.zoom ?? 1, fx = o.fx ?? .5, fy = o.fy ?? .5;
  const s = Math.max(bw / im.width, bh / im.height) * z, dw = im.width * s, dh = im.height * s;
  const dx = clamp(bx + bw / 2 - fx * dw, bx + bw - dw, bx), dy = clamp(by + bh / 2 - fy * dh, by + bh - dh, by);
  return [dx + u * dw, dy + v * dh];
}
// spotlight(ctx, x, y, rx, ry, p): everyone else goes dark, the main person stays lit (+ optional yellow frame / name)
function spotlight(ctx, x, y, rx, ry, p = 1, o = {}) {
  if (p <= 0) return; const a = (o.dark ?? .82) * E.out(clamp(p));
  ctx.save(); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.72, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(x + rx * 1.35, y); ctx.ellipse(x, y, rx * 1.35, ry * 1.35, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill('evenodd');
  ctx.translate(x, y); ctx.scale(rx * 1.35, ry * 1.35); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill(); ctx.restore();
  if (o.frame !== false) { const q = E.out(prog(p, .3, 1)); if (q > 0) { ctx.save(); ctx.strokeStyle = o.color || '#E6F23C'; ctx.lineWidth = 6; ctx.shadowColor = o.color || '#E6F23C'; ctx.shadowBlur = 16;
    const w = rx * 2 * q, h = ry * 2; ctx.strokeRect(x - w / 2, y - h / 2, w, h); ctx.restore(); } }
  if (o.name) { const q = E.out(prog(p, .5, 1)); text(ctx, o.name, x, y + ry + 70, { font: F.playI, size: 54, color: '#fff', align: 'center', alpha: q, shadow: 20 }); }
}

function scenes() {
  // No SFX on cuts (transitions are silent). Sound only where the story needs it: explosions, cash, stamp, beeps.
  const tag = (ctx, k, extra) => { const c = credit(k, extra); if (c) sourceTag(ctx, c.length > 70 ? c.slice(0, 68) + '…' : c); };
  const ILL = 'Illustrative · Starship test footage, NASA';
  const ILL2 = 'Illustrative · SpaceX launch 2024, CC BY 3.0';
  const jump = (lt, at = .55) => lt > at ? 1.1 : 1;
  const wall1 = ['p_2006', 'p_2008', 'p_2008b', 'p_2008c', 'f1_omelek', 'p_roadster08', 'p_griffin', 'p_tesla07', 'f1_2009', 'lehman', 'modelS', 'p_obama'];
  const beep = (id, w) => cue(T(id, w) - .02, 'beep', 1, T(id, w, 'e') - T(id, w) + .06);
  const hand = (ctx, t, s0, o = {}) => { // the "garbage" hand: 7 of clubs + 2 of diamonds
    playingCard(ctx, CX - 150, 980 + (o.dy || 0), 300, '7', 'c', -.12, clamp(prog(t, s0 + .1, s0 + .4))); playingCard(ctx, CX + 150, 1000 + (o.dy || 0), 300, '2', 'd', .1, clamp(prog(t, s0 + .3, s0 + .6)));
  };
  const chipsCenter = (ctx, t, s0, n = 7) => { for (let i = 0; i < n; i++) { const p = E.inOut(prog(t, s0 + i * .06, s0 + .45 + i * .06)); const a = i / n * 6.28; const x = lerp(i % 2 ? 1200 : -120, CX + Math.cos(a) * 150, p), y = lerp(1900, 1250 + Math.sin(a) * 70, p); chipStack(ctx, x, y, 115, 7 + (i % 4), ['#C8322A', '#1F4FA8', '#111', '#E8B12E'][i % 4]); } };

  // ---- P01 hook: poker
  shot(['P01', 'In'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008', lt, { z0: 1.25 * jump(lt, .8), grade: 'ink', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_2008'); kIn(ctx, lt, 'black', .3); }, { lead: .35 });
  shot(['P01', 'craziest'], (ctx, t, lt, sh) => { feltTable(ctx, t); chipsCenter(ctx, t, sh.start - .3); kGrade(ctx, t); kIn(ctx, lt, 'zoom'); }, { capY: .3 });
  shot(['P01', 'business'], (ctx, t, lt) => { photoWall(ctx, t, wall1, { pan: 1.5 }); kGrade(ctx, t, { bloom: .35 }); kIn(ctx, lt, 'flash'); });
  // ---- P02 garbage hand
  shot(['P02', 'And'], (ctx, t, lt, sh) => { feltTable(ctx, t); hand(ctx, t, sh.start); kGrade(ctx, t); kIn(ctx, lt, 'blur'); }, { capY: .3 });
  // ---- P03 three failures
  shot(['P03', 'SpaceX'], (ctx, t, lt) => { kPhoto(ctx, 'f1_omelek', lt, { z0: 1.15 * jump(lt, .7), grade: 'cine' }); kGrade(ctx, t); tag(ctx, 'f1_omelek'); kIn(ctx, lt, 'zoom'); });
  shot(['P03', 'three'], (ctx, t, lt, sh) => { bgGrad(ctx, '#0B0E16', '#000', 'r'); hudRockets(ctx, t, sh.start + .05, CX - 150, 1180); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { capY: .32, capMode: 'caps' });
  shot(['P03', 'All'], (ctx, t, lt) => { clipFrame(ctx, 'ign', 35, lt, { from: 14, z0: 2.3, fx: .5, fy: .66, grade: 'fire', shake: 24 }); boom(ctx, CX, 1100, t, T('P03', 'failed') - .05, 1100); kGrade(ctx, t, { bloom: .5 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'flash', .16); });
  cue(T('P03', 'failed'), 'impact', .8);
  shot(['P03', 'One'], (ctx, t, lt) => { const k = (hash(Math.floor(t * 30)) - .5) * 20; ctx.save(); ctx.translate(k, k * .5); kPhoto(ctx, 'f1_2009', lt, { z0: 1.25, grade: 'ink', shade: .3 }); ctx.restore(); boom(ctx, CX, 820, t, T('P03', 'last') - .1, 1000); kGrade(ctx, t, { bloom: .45 }); tag(ctx, 'f1_2009'); kIn(ctx, lt, 'glitch'); });
  // ---- P04 Tesla on fire
  shot(['P04', 'Tesla'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.15 * jump(lt), grade: 'mood' }); kGrade(ctx, t); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'zoom'); });
  shot(['P04', 'cash'], (ctx, t, lt, sh) => { bgGrad(ctx, '#3A0806', '#000', 'r'); moneyRain(ctx, t, sh.start, 'bill100', EP.billCrop, 46, { spread: .8 }); shade(ctx, .25, '60,0,0'); kGrade(ctx, t); kIn(ctx, lt, 'flash'); });
  cue(T('P04', 'cash'), 'cash', .7);
  shot(['P04', 'basically'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.35, grade: 'warm', shade: .2 }); embers(ctx, t, 1); boom(ctx, CX, 1300, t, T('P04', 'fire') - .1, 900); kGrade(ctx, t, { bloom: .5 }); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'blur'); }, { capMode: 'stack' });
  // ---- P05 economy / Mars / rent
  shot(['P05', 'whole'], (ctx, t, lt) => { kPhoto(ctx, 'lehman', lt, { z0: 1.2, zs: .1, grade: 'ink' }); kGrade(ctx, t); tag(ctx, 'lehman'); kIn(ctx, lt, 'pix'); });
  shot(['P05', 'collapsing'], (ctx, t, lt) => { headline(ctx, lt, ['SEPTEMBER 15, 2008', 'Lehman Brothers', 'files for', 'bankruptcy'], { kicker: true, hl: [3, 'bankruptcy'], y: .3, size: 100, x: 70 }); kIn(ctx, lt, 'flash'); }, { capDark: true, capY: .8 });
  shot(['P05', 'guy'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008c', lt, { z0: 1.2 * jump(lt, .8), grade: 'mood', fy: .35 }); kGrade(ctx, t); tag(ctx, 'p_2008c'); kIn(ctx, lt, 'zoom'); });
  shot(['P05', 'Mars'], (ctx, t, lt) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(ctx, t, 140, 3); photo(ctx, 'mars', { x: W * .08, y: H * .3, w: W * .84, h: W * .84, zoom: 1 + lt * .04, grade: 'cine' }); kGrade(ctx, t, { bloom: .45 }); tag(ctx, 'mars'); kIn(ctx, lt, 'flash'); }, { capY: .72 });
  shot(['P05', 'borrowing'], (ctx, t, lt, sh) => {
    desk(ctx, t); const s0 = sh.start;
    polaroid(ctx, 'p_2008', 300, 560, 420, -.1, prog(t, s0, s0 + .25), { label: 'Elon, 2008' });
    polaroid(ctx, 'p_2008b', 800, 760, 380, .12, prog(t, s0 + .2, s0 + .45));
    cashStack(ctx, 760, 1400, .9, 2); sticky(ctx, 'RENT\nDUE', 300, 1300, -.08, prog(t, s0 + .45, s0 + .7));
    yString(ctx, [300, 400], [800, 600], prog(t, s0 + .3, s0 + .7)); yString(ctx, [800, 600], [300, 1170], prog(t, s0 + .6, s0 + 1));
    kGrade(ctx, t); kIn(ctx, lt, 'zoom');
  }, { capY: .5, capMode: 'box' });
  // ---- P06 folds
  shot(['P06', 'Any'], (ctx, t, lt, sh) => { feltTable(ctx, t); const p = E.in(prog(t, T('P06', 'folds'), T('P06', 'folds') + .4)); hand(ctx, t, sh.start - 1, { dy: -p * 1400 }); kGrade(ctx, t); kIn(ctx, lt, 'blur'); }, { capY: .3, capMode: 'caps' });
  // ---- P07 all in (bleeped)
  shot(['P07', 'Elon'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008b', lt, { z0: 1.3 * jump(lt, .6), grade: 'mood', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_2008b'); kIn(ctx, lt, 'zoom'); }, { capMode: 'stack' });
  beep('P07', 'fuck');
  shot(['P07', 'pushed'], (ctx, t, lt, sh) => { feltTable(ctx, t); chipsCenter(ctx, t, sh.start, 9); kGrade(ctx, t, { bloom: .35 }); kIn(ctx, lt, 'flash'); }, { capY: .3 });
  cue(T('P07', 'pushed') + .3, 'cash', .5);
  // ---- P08 one more launch
  shot(['P08', 'Enough'], (ctx, t, lt) => { desk(ctx, t, { a: '#1C1610' }); const n = Math.max(1, 6 - Math.floor(lt * 5)); cashStack(ctx, CX, 1100, 1.6, n); kGrade(ctx, t); kIn(ctx, lt, 'pix'); }, { capY: .35 });
  shot(['P08', 'That\'s'], (ctx, t, lt) => { bigWord(ctx, 'that\'s it.', lt, { italic: true, size: 170 }); kIn(ctx, lt, 'bar'); }, { cap: false });
  // ---- P09 Sept 28
  shot(['P09', 'September'], (ctx, t, lt) => { calendarPage(ctx, lt, 'SEPTEMBER', 28, { year: '2008', start: 1, len: 30 }); kIn(ctx, lt, 'zoom'); }, { capY: .88 });
  shot(['P09', 'Falcon'], (ctx, t, lt) => { const s = (hash(Math.floor(t * 30)) - .5) * 14; ctx.save(); ctx.translate(s, s * .6); kPhoto(ctx, 'f1_flight4', lt, { z0: 1.12, zs: .12, grade: 'cine', fy: .55 }); ctx.restore(); embers(ctx, t, .5); kGrade(ctx, t, { bloom: .5 }); tag(ctx, 'f1_flight4'); kIn(ctx, lt, 'flash'); });
  shot(['P09', 'lifts'], (ctx, t, lt) => { clipFrame(ctx, 'rise', 38, lt, { z0: 1.6, fx: .42, fy: .55, grade: 'cine', speed: 1.2 }); kGrade(ctx, t, { bloom: .5 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'blur'); });
  // ---- P10 holy (bleep) orbit
  shot(['P10', 'And'], (ctx, t, lt) => { clipFrame(ctx, 'rise', 38, lt + .3, { z0: 1.6, fx: .42, fy: .55, grade: 'cine' }); kGrade(ctx, t, { bloom: .55 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'zoom'); }, { capMode: 'stack' });
  beep('P10', 'shit');
  shot(['P10', 'It'], (ctx, t, lt) => { orbitRing(ctx, t, lt); kGrade(ctx, t, { bloom: .4 }); kIn(ctx, lt, 'bar'); }, { capY: .42 });
  // ---- P11 NASA
  shot(['P11', 'Three'], (ctx, t, lt) => { calendarPage(ctx, lt, 'DECEMBER', 23, { year: '2008', start: 1 }); kIn(ctx, lt, 'flash'); }, { capY: .88 });
  shot(['P11', 'NASA'], (ctx, t, lt) => { // group photo: pan across the room, then spotlight Musk
    const o = { zoom: 1.5, fx: lerp(.12, .92, E.inOut(prog(lt, 0, .75))), fy: .05, grade: 'mood' }; photo(ctx, 'p_griffin', o);
    const [x, y] = photoPt('p_griffin', o, .89, .15); spotlight(ctx, x, y, 240, 290, prog(lt, .7, 1.1), { name: 'Elon Musk' });
    kGrade(ctx, t); tag(ctx, 'p_griffin'); kIn(ctx, lt, 'zoom'); }, { capY: .78 });
  shot(['P11', 'billion'], (ctx, t, lt) => { glowNum(ctx, 0, 1600000000, lt, { pre: '$', y: .42, dur: 1.2 }); kIn(ctx, lt, 'bar'); }, { capY: .6 });
  // ---- P12 Christmas Eve
  shot(['P12', 'next'], (ctx, t, lt) => { calendarPage(ctx, lt, 'DECEMBER', 24, { year: '2008', start: 1 }); snow(ctx, t, 90); kIn(ctx, lt, 'zoom'); }, { capY: .88 });
  shot(['P12', 'Tesla'], (ctx, t, lt) => { headline(ctx, lt, ['DECEMBER 24, 2008', 'Tesla closes', 'a $40 million', 'funding round'], { kicker: true, hl: [2, '$40 million'], y: .3, size: 100, x: 70 }); kIn(ctx, lt, 'flash'); }, { capDark: true, capY: .8 });
  shot(['P12', 'days'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.3, grade: 'ink', shade: .45 }); stamp(ctx, 'BANKRUPT', CX, 700, t, T('P12', 'bankrupt') - .05, { size: 130, color: '#D7261E' }); bigX(ctx, CX, 700, 300, prog(t, T('P12', 'bankrupt') + .35, T('P12', 'bankrupt') + .8)); kGrade(ctx, t); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'blur'); }, { capY: .55 });
  cue(T('P12', 'bankrupt'), 'stamp', .8);
  // ---- P13 Merry Christmas
  shot(['P13', 'Merry'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008b', lt, { z0: 1.15, grade: 'warm', fy: .35 }); lightLeak(ctx, t, .35); snow(ctx, t, 110); kGrade(ctx, t, { bloom: .4 }); tag(ctx, 'p_2008b'); kIn(ctx, lt, 'flash'); }, { capY: .7, capMode: 'line' });
  // ---- P14 most people lose
  shot(['P14', 'Most'], (ctx, t, lt, sh) => { feltTable(ctx, t); ctx.save(); ctx.globalAlpha = 1 - prog(t, T('P14', 'lose'), T('P14', 'lose') + .5); chipsCenter(ctx, sh.start - 2, 0, 7); ctx.restore(); shade(ctx, .35); kGrade(ctx, t); kIn(ctx, lt, 'blur'); }, { capY: .3 });
  // ---- P15 trillionaire
  shot(['P15', 'Elon'], (ctx, t, lt) => { kPhoto(ctx, 'p_royal', lt, { z0: 1.2 * jump(lt, .7), grade: 'cine', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_royal'); kIn(ctx, lt, 'zoom'); });
  shot(['P15', 'became'], (ctx, t, lt, sh) => { glowNum(ctx, 0, 1e12, lt, { pre: '$', y: .4, dur: 1.4 }); moneyRain(ctx, t, sh.start + .5, 'bill100', EP.billCrop, 34, { spread: 1.2 }); kIn(ctx, lt, 'flash'); }, { capY: .62 });
  cue(T('P15', 'became') + .5, 'cash', .6);
  // ---- silent end card
  shot(LINE['P15'].end + .5, (ctx, t, lt) => {
    bgGrad(ctx, '#0A0C14', '#000', 'r'); stars(ctx, t, 120, 2, .5);
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, 0, .5)); glowText(ctx, 'Unfiled Films', CX, 900, { font: F.play, size: 128, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.8)', blur: 50 }); ctx.restore();
    const q = Math.max(0, E.back(prog(lt, .4, .7))); ctx.save(); ctx.translate(CX, 1100); ctx.scale(q, q); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-250, -62, 500, 124, 62); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 26, { font: F.osw, size: 64, color: '#fff', align: 'center', weight: 600, ls: 4 }); ctx.restore();
    kIn(ctx, lt, 'blur'); fadeOut(ctx, t, TL.duration, .5);
  }, { cap: false });
  kfinish();
}
