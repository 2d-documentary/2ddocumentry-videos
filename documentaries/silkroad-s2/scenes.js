// Silk Road Short (silkroad-s2) — vertical 1080x1920, uses the silkroad asset set.
'use strict';
const EP = { images: { pardon_doc_p1: 'archives/documents/pardon_doc_p1.jpg' }, credit: {}, billCrop: [12, 12, 1176, 481], rossCrop: [800, 200, 1800, 2290], captions: true, captionY: 1560, captionSize: 96, scenes };
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
const CX = 540;
const FACE = () => (IMG.ross ? ['ross', EP.rossCrop] : [null, null]);
function scenes() { return SHORTS['silkroad-s2'](); }
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
// ---------------------------------------------------------------- shared vertical bits
function brand(ctx) { text(ctx, 'UNFILED FILMS', CX, 110, { font: F.play, size: 34, color: 'rgba(246,240,228,.8)', align: 'center', weight: 700, ls: 5 }); }
function capBand(ctx) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0, 1460, W, 200); ctx.restore(); }
function vLibrary(ctx, t, lt, scr) { shelves(ctx, t, lt, { sign: 'SCIENCE FICTION', signY: 170 }); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 1060, W, 400);
  ctx.fillStyle = '#6A4A2E'; ctx.fillRect(140, 1100, 800, 30); personIcon(ctx, CX, 1090, 3.4, '#1D2330'); laptop(ctx, CX, 1100, .6, { glow: true }, srScreen(scr || 'ADMIN · SILK ROAD')); }
function ctaShot(id) {
  shot([id, 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#120A24', '#000', 'r'); fog(ctx, t, .3, '140,90,255');
    glowText(ctx, 'THE SILK ROAD', CX, 720, { font: F.play, size: 110, color: '#fff', align: 'center', weight: 700, glow: 'rgba(138,92,246,.9)' });
    text(ctx, 'FULL STORY ON UNFILED FILMS', CX, 840, { font: F.osw, size: 46, color: SR.amber, align: 'center', weight: 600, ls: 4, alpha: prog(t, T(id, 'story'), T(id, 'story') + .3) });
    if (t > T(id, 'Unfiled')) { const p = Math.max(0, E.back(prog(t, T(id, 'Unfiled'), T(id, 'Unfiled') + .3))); ctx.save(); ctx.translate(CX, 1080); ctx.scale(p, p); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-280, -70, 560, 140, 70); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 25, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .5);
  }, { name: 's-cta' });
  cue(T(id, 'The') - .05, 'impact', .7);
}
function finish() { const _d = SHOTS.map(s => s.draw); SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _d[i](ctx, t, lt, sh); brand(ctx); }; }); }
const SHORTS = {
'silkroad-s1': function scenes() {
  shot(['A01', 'The'], (ctx, t, lt) => { vLibrary(ctx, t, lt); shade(ctx, .35);
    text(ctx, 'FBI', CX, 420, { font: F.bebas, size: 200, color: '#fff', align: 'center', shadow: 20 }); text(ctx, 'VS', CX, 520, { font: F.bebas, size: 90, color: SR.amber, align: 'center' });
    text(ctx, 'DARK WEB BOSS', CX, 650, { font: F.bebas, size: 130, color: '#fff', align: 'center', shadow: 20 });
    if (t > T('A01', 'faking')) popIn(ctx, t, T('A01', 'faking'), CX, 820, c => pill(c, "A FAKE LOVERS' FIGHT", 0, 0, { align: 'center', bg: SR.blood, size: 56 }));
    if (t > T('A01', 'library.')) stamp(ctx, 'IN A LIBRARY', CX, 960, t, T('A01', 'library.'), { size: 100, color: SR.amber }); fadeIn(ctx, t, 0, .3);
  }, { lead: .3, name: 'a-hook' });
  cue(T('A01', 'faking'), 'hit', .7); cue(T('A01', 'library.'), 'stamp');
  shot(['A02', 'October'], (ctx, t, lt) => { camPhoto(ctx, 'glenpark', lt, { grade: 'color', z0: 1.0 }); shade(ctx, .35);
    timeStamp(ctx, 'OCT 2013', CX - 170, 360, t, T('A02', 'October'), { size: 100, color: SR.amber }); if (t > T('A02', 'Ross')) lowerTag(ctx, 'ROSS ULBRICHT', 'FOUNDER OF SILK ROAD', t, T('A02', 'Ross'));
    if (t > T('A02', 'science')) popIn(ctx, t, T('A02', 'science'), CX, 1150, c => pill(c, 'SCIENCE FICTION SECTION', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 50 })); sourceTag(ctx, credit('glenpark'));
  }, { name: 'a-library' });
  shot(['A03', 'His'], (ctx, t, lt) => { bgGrad(ctx, '#0B1420', '#000', 'r'); laptop(ctx, CX, 1000, 1.0, { glow: true }, srScreen('DREAD PIRATE ROBERTS'));
    if (t > T('A03', 'everything.')) text(ctx, 'EVERYTHING IS ON IT', CX, 420, { font: F.bebas, size: 110, color: '#fff', align: 'center' });
    if (t > T('A03', 'closes,')) { const p = prog(t, T('A03', 'closes,'), T('A03', 'closes,') + .4); ctx.save(); ctx.globalAlpha = p * .75; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); text(ctx, 'ENCRYPTED', CX, 720, { font: F.bebas, size: 170, color: SR.amber, align: 'center', alpha: p }); }
    if (t > T('A03', 'gone.')) stamp(ctx, 'EVIDENCE: GONE', CX, 900, t, T('A03', 'gone.'), { size: 90 });
  }, { name: 'a-laptop' });
  cue(T('A03', 'gone.'), 'stamp');
  shot(['A04', 'So'], (ctx, t, lt) => { vLibrary(ctx, t, lt); personIcon(ctx, 260, 1060, 3.4, '#3B2A2A'); personIcon(ctx, 820, 1060, 3.4, '#2A2F3B');
    if (t > T('A04', 'argument')) { const sh = (hash(Math.floor(t * 20)) - .5) * 12; popIn(ctx, t, T('A04', 'argument'), 260 + sh, 640, c => pill(c, 'HOW COULD YOU?!', 0, 0, { align: 'center', bg: SR.blood, size: 44 })); popIn(ctx, t, T('A04', 'argument') + .2, 820 - sh, 760, c => pill(c, '#@!!', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 54 })); }
    if (t > T('A04', 'turns')) text(ctx, '(BOTH FBI AGENTS)', CX, 500, { font: F.hand, size: 70, color: SR.amber, align: 'center', weight: 700 });
  }, { name: 'a-fight' });
  cue(T('A04', 'argument'), 'hit', .6);
  shot(['A05', 'In'], (ctx, t, lt) => { vLibrary(ctx, t, lt); const p = E.inOut(prog(t, T('A05', 'slides'), T('A05', 'slides') + .7));
    laptop(ctx, CX + 600 * p, 1100 - 300 * p, .6 + .3 * p, { glow: true }, srScreen('LOGGED IN')); if (t > T('A05', 'Logged')) pill(ctx, 'STILL LOGGED IN', CX, 420, { align: 'center', bg: SR.green, color: '#062010', size: 56 });
    if (t > T('A05', 'Game')) stamp(ctx, 'GAME OVER', CX, 640, t, T('A05', 'Game'), { size: 170 });
  }, { name: 'a-grab' });
  cue(T('A05', 'slides'), 'whoosh', .8); cue(T('A05', 'Game'), 'stamp');
  shot(['A06', 'Moral'], (ctx, t, lt) => { bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9); text(ctx, 'MORAL OF THE STORY', CX, 500, { font: F.osw, size: 56, color: '#111', align: 'center', weight: 700, ls: 8 });
    punch(ctx, 'ALWAYS LOCK', CX, 740, t, T('A06', 'always'), { font: F.bebas, size: 190, color: '#111' }); punch(ctx, 'YOUR LAPTOP.', CX, 920, t, T('A06', 'laptop.'), { font: F.bebas, size: 190, color: SR.blood }); capBand(ctx);
  }, { name: 'a-moral' });
  cue(T('A06', 'laptop.'), 'ding', .7);
  ctaShot('A07'); finish();
},
'silkroad-s2': function scenes() {
  shot(['B01', 'The'], (ctx, t, lt) => { bgGrad(ctx, '#0E1522', '#000', 'r'); text(ctx, 'MOST WANTED', CX, 460, { font: F.bebas, size: 180, color: '#fff', align: 'center' }); text(ctx, 'ON THE DARK WEB', CX, 580, { font: F.bebas, size: 110, color: SR.purple, align: 'center' });
    if (t > T('B01', 'caught')) text(ctx, 'CAUGHT BY:', CX, 760, { font: F.osw, size: 56, color: '#fff', align: 'center', weight: 600, ls: 8 });
    if (t > T('B01', 'Google')) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(120, 840, 840, 120, 60); ctx.fill(); text(ctx, 'search: "silk road"', 180, 920, { font: F.osw, size: 48, color: '#333' }); ctx.restore(); }
    fadeIn(ctx, t, 0, .3); }, { lead: .3, name: 'b-hook' });
  cue(T('B01', 'Google'), 'ding', .8);
  shot(['B02', 'An'], (ctx, t, lt) => { camPhoto(ctx, IMG.irs ? 'irs' : 'fbi', lt, { grade: 'color', tint: 'navy', tintAmt: .45 }); shade(ctx, .55); lowerTag(ctx, 'IRS AGENT', 'GARY ALFORD', t, T('B02', 'IRS'));
    if (t > T('B02', 'oldest')) pill(ctx, 'OLDEST POSTS FIRST', CX, 520, { align: 'center', bg: '#fff', color: '#111', size: 50 });
    if (t > T('B02', 'altoid.')) glowText(ctx, 'altoid', CX, 860, { font: F.mono, size: 170, color: '#fff', align: 'center', glow: 'rgba(59,224,122,.9)', weight: 700 }); sourceTag(ctx, credit(IMG.irs ? 'irs' : 'fbi')); }, { name: 'b-altoid' });
  cue(T('B02', 'altoid.'), 'hit', .8);
  shot(['B03', 'Later,'], (ctx, t, lt) => { bgGrad(ctx, '#1B2232', '#090C12', 'r'); forumPost(ctx, 90, 300, 900, 'altoid', 'Need an IT pro with Bitcoin experience. Send replies to:', t, T('B03', 'coding'), { h: 380, forum: 'FORUM · 2011' });
    if (t > T('B03', 'email:')) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(60, 800, 960, 150, 24); ctx.fill(); text(ctx, 'rossulbricht@gmail.com', CX, 900, { font: F.mono, size: 58, color: '#1B4FB8', align: 'center', weight: 700 }); ctx.restore(); highlighter(ctx, 110, 850, 470, 64, prog(t, T('B03', 'rossulbricht'), T('B03', 'rossulbricht') + .5)); }
    if (t > T('B03', 'gmail')) stamp(ctx, 'HIS REAL NAME', CX, 1130, t, T('B03', 'gmail'), { size: 110 }); }, { name: 'b-gmail' });
  cue(T('B03', 'email:'), 'key', .6); cue(T('B03', 'gmail'), 'stamp');
  shot(['B04', 'Then'], (ctx, t, lt) => { bgGrad(ctx, '#1E2A3A', '#0A0F16', 'r'); const op = E.out(prog(t, T('B04', 'nine') - .3, T('B04', 'nine') + .3)); parcel(ctx, CX, 1250, .95, op);
    const [fk, fc] = FACE(); for (let i = 0; i < 9; i++) { const st = T('B04', 'nine') + i * .08; if (t < st) continue; const p = E.out(prog(t, st, st + .35)); idCard(ctx, lerp(CX, 200 + (i % 3) * 340, p), lerp(1200, 340 + Math.floor(i / 3) * 230, p), .8, ['J. TERREY', 'R. SMITH', 'A. JONES', 'M. BROWN', 'D. LEE', 'C. WHITE', 'P. HALL', 'T. KING', 'S. HILL'][i], i, { rot: (hash(i) - .5) * .2, face: fk, crop: fc }); }
    if (t > T('B04', 'face,')) pill(ctx, 'SAME FACE ON ALL 9', CX, 1060, { align: 'center', bg: SR.blood, size: 50 }); }, { name: 'b-ids' });
  cue(T('B04', 'nine'), 'paper', .7);
  shot(['B05', 'When'], (ctx, t, lt) => { camPhoto(ctx, 'sfhouses', lt, { grade: 'color', tint: 'navy', tintAmt: .35 }); shade(ctx, .5);
    if (t > T('B05', 'hypothetically,')) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(80, 520, 920, 420, 30); ctx.fill(); wrapText(ctx, '"Hypothetically, anyone could buy them on Silk Road."', 130, 640, 820, 90, { font: F.play, size: 66, color: '#111', weight: 700 }); ctx.restore(); }
    sourceTag(ctx, credit('sfhouses')); }, { name: 'b-quote' });
  shot(['B06', 'Hypothetically.'], (ctx, t, lt) => { bgGrad(ctx, '#000', '#000'); punch(ctx, 'HYPOTHETICALLY.', CX, 820, t, T('B06', 'Hypothetically.'), { font: F.bebas, size: 150, color: '#fff' }); text(ctx, '*WINK WINK*', CX, 980, { font: F.osw, size: 60, color: SR.amber, align: 'center', alpha: prog(t, T('B06', 'Hypothetically.') + .3, T('B06', 'Hypothetically.') + .6) }); }, { name: 'b-hypo' });
  cue(T('B06', 'Hypothetically.'), 'impact', .6);
  ctaShot('B07'); finish();
},
'silkroad-s3': function scenes() {
  shot(['C01', 'Two'], (ctx, t, lt) => { bgGrad(ctx, '#200A0A', '#000', 'r'); coinRain(ctx, t, T('C01', 'robbing'), 24, { r: 40 }); personIcon(ctx, 330, 1150, 4.4, '#2A2F3B'); personIcon(ctx, 750, 1150, 4.4, '#2A2F3B');
    pill(ctx, 'FEDERAL AGENT', 330, 760, { align: 'center', bg: '#1E3A7A', size: 36 }); pill(ctx, 'FEDERAL AGENT', 750, 760, { align: 'center', bg: '#1E3A7A', size: 36 });
    text(ctx, 'HUNTING THE DARK WEB...', CX, 400, { font: F.bebas, size: 100, color: '#fff', align: 'center' }); if (t > T('C01', 'secretly')) stamp(ctx, 'ROBBING IT', CX, 560, t, T('C01', 'robbing'), { size: 140 });
    fadeIn(ctx, t, 0, .3); }, { lead: .3, name: 'c-hook' });
  cue(T('C01', 'robbing'), 'impact', .8);
  shot(['C02', 'The'], (ctx, t, lt) => { bgGrad(ctx, '#151515', '#000', 'r'); glowText(ctx, 'SILK ROAD', CX, 460, { font: F.play, size: 130, color: '#fff', align: 'center', weight: 700, glow: 'rgba(138,92,246,.9)' });
    if (t > T('C02', 'founder,')) lowerTag(ctx, 'ROSS ULBRICHT', 'FOUNDER', t, T('C02', 'founder,')); gavel(ctx, CX, 1150, 1.1, t, T('C02', 'two'));
    if (t > T('C02', 'two')) text(ctx, '2 LIFE SENTENCES', CX, 800, { font: F.bebas, size: 140, color: SR.blood, align: 'center' }); }, { name: 'c-context' });
  cue(T('C02', 'two'), 'thud', .9);
  shot(['C03', 'But'], (ctx, t, lt) => { bgGrad(ctx, '#0E0E14', '#000', 'r'); popIn(ctx, t, T('C03', 'DEA'), CX, 760, c => { c.fillStyle = '#1A1F2B'; c.beginPath(); c.roundRect(-420, -380, 840, 760, 30); c.fill(); personIcon(c, 0, 120, 4, '#3A4458');
      text(c, 'DEA AGENT', 0, 230, { font: F.bebas, size: 100, color: '#fff', align: 'center' }); text(c, 'TOOK BITCOIN FROM ROSS', 0, 310, { font: F.osw, size: 42, color: SR.btc, align: 'center', weight: 600 }); });
    if (t > T('C03', 'pretending')) pill(ctx, 'WHILE IN DISGUISE', CX, 1260, { align: 'center', bg: SR.blood, size: 50 }); }, { name: 'c-dea' });
  shot(['C04', 'And'], (ctx, t, lt) => { bgGrad(ctx, '#0E0E14', '#000', 'r'); popIn(ctx, t, T('C04', 'Secret'), CX, 680, c => { c.fillStyle = '#1A1F2B'; c.beginPath(); c.roundRect(-420, -300, 840, 600, 30); c.fill(); personIcon(c, 0, 100, 4, '#3A4458');
      text(c, 'SECRET SERVICE AGENT', 0, 210, { font: F.bebas, size: 84, color: '#fff', align: 'center' }); });
    moneyCount(ctx, t, T('C04', '800,000'), 0, 820000, CX, 1180, { size: 120 }); coinRain(ctx, t, T('C04', 'stole'), 18, { r: 36 }); }, { name: 'c-ss' });
  cue(T('C04', '800,000'), 'cash', .8);
  shot(['C05', 'Both'], (ctx, t, lt) => { bgGrad(ctx, '#151515', '#000', 'r'); personIcon(ctx, 330, 1150, 4.4, '#2A2F3B'); personIcon(ctx, 750, 1150, 4.4, '#2A2F3B'); bars(ctx, prog(t, T('C05', 'prison.'), T('C05', 'prison.') + .5));
    if (t > T('C05', 'caught.')) stamp(ctx, 'CAUGHT', CX, 500, t, T('C05', 'caught.'), { size: 150 }); }, { name: 'c-prison' });
  cue(T('C05', 'prison.'), 'thud', .8);
  shot(['C06', 'The'], (ctx, t, lt) => { bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9); punch(ctx, 'THE INVESTIGATORS', CX, 700, t, T('C06', 'investigators'), { font: F.bebas, size: 130, color: '#111' }); punch(ctx, 'NEEDED', CX, 860, t, T('C06', 'needed'), { font: F.bebas, size: 150, color: '#111' }); punch(ctx, 'INVESTIGATING.', CX, 1020, t, T('C06', 'investigating.'), { font: F.bebas, size: 150, color: SR.blood }); capBand(ctx); }, { name: 'c-punch' });
  cue(T('C06', 'investigating.'), 'ding', .7);
  ctaShot('C07'); finish();
},
'silkroad-s4': function scenes() {
  shot(['D01', 'Agents'], (ctx, t, lt) => { bgGrad(ctx, '#2A0A0A', '#000', 'r'); coinRain(ctx, t, T('D01', 'billion'), 30); popcornTin(ctx, CX, 1300, 1.1, t, prog(t, T('D01', 'popcorn'), T('D01', 'popcorn') + .8));
    moneyCount(ctx, t, T('D01', '3'), 0, 3e9, CX, 420, { size: 150 }); if (t > T('D01', 'popcorn')) text(ctx, 'IN A POPCORN TIN', CX, 560, { font: F.bebas, size: 110, color: '#fff', align: 'center', shadow: 20 }); fadeIn(ctx, t, 0, .3);
  }, { lead: .3, name: 'd-hook' });
  cue(T('D01', '3'), 'cash', .9);
  shot(['D02', 'In'], (ctx, t, lt) => { bgGrad(ctx, '#0E1522', '#000', 'r'); timeStamp(ctx, '2012', CX - 110, 360, t, T('D02', '2012,'), { size: 110 });
    text(ctx, 'A HACKER TRICKS SILK ROAD', CX, 560, { font: F.bebas, size: 90, color: '#fff', align: 'center', alpha: prog(t, T('D02', 'hacker'), T('D02', 'hacker') + .3) });
    if (t > T('D02', '50,000')) { counter(ctx, Math.floor(lerp(0, 50000, E.out(prog(t, T('D02', '50,000'), T('D02', '50,000') + .8)))), CX, 820, { size: 190, color: SR.btc, align: 'center' }); text(ctx, 'BITCOINS', CX, 900, { font: F.osw, size: 44, color: '#fff', align: 'center', weight: 600, ls: 8 }); btcCoin(ctx, CX, 1150, 140, t, { flip: true, spin: 2 }); }
  }, { name: 'd-hack' });
  shot(['D03', 'Then'], (ctx, t, lt) => { bgGrad(ctx, '#0A0A0E', '#000', 'r'); const y = Math.floor(lerp(2012, 2021, prog(t, T('D03', 'waited.'), T('D03', 'years.', 'e') + .4)));
    text(ctx, String(y), CX, 820, { font: F.mono, size: 220, color: SR.amber, align: 'center', weight: 700 }); text(ctx, 'WAITING...', CX, 980, { font: F.bebas, size: 110, color: '#fff', align: 'center' });
    clockFace(ctx, CX, 1250, 120, (t * 2) % 12, (t * 24) % 60); }, { name: 'd-wait' });
  shot(['D04', 'In'], (ctx, t, lt) => { camPhoto(ctx, IMG.gainesville ? 'gainesville' : 'sfhouses', lt, { grade: 'color', tint: 'navy', tintAmt: .4, blur: 2 }); shade(ctx, .55);
    timeStamp(ctx, 'NOV 2021 · RAID', CX - 230, 300, t, T('D04', '2021,'), { size: 80 }); if (t > T('D04', 'safe,')) pill(ctx, 'UNDERGROUND SAFE', CX, 470, { align: 'center', bg: '#333', size: 50 });
    if (t > T('D04', 'closet,')) pill(ctx, 'BATHROOM CLOSET', CX, 580, { align: 'center', bg: '#fff', color: '#111', size: 50 }); popcornTin(ctx, CX, 1330, 1.1, t, prog(t, T('D04', 'tiny'), T('D04', 'tiny') + .8)); }, { name: 'd-raid' });
  cue(T('D04', 'tiny'), 'paper', .7);
  shot(['D05', 'On'], (ctx, t, lt) => { bgGrad(ctx, '#1A1000', '#000', 'r'); coinRain(ctx, t, T('D05', 'On'), 40); shade(ctx, .3);
    counter(ctx, 50676, CX, 600, { size: 170, color: SR.btc, align: 'center' }); text(ctx, 'BITCOINS', CX, 680, { font: F.osw, size: 44, color: '#fff', align: 'center', weight: 600, ls: 8 }); if (t > T('D05', '3.36')) glowText(ctx, '$' + lerp(0, 3.36, E.out(prog(t, T('D05', '3.36'), T('D05', '3.36') + 1))).toFixed(2) + ' BILLION', CX, 960, { font: F.bebas, size: 140, color: C.gold, align: 'center', glow: 'rgba(255,190,60,.6)', blur: 30 }); }, { name: 'd-value' });
  cue(T('D05', '3.36'), 'cash', .9);
  shot(['D06', 'The'], (ctx, t, lt) => { bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9); popcornTin(ctx, CX, 1300, .9, t, 1);
    punch(ctx, 'THE MOST EXPENSIVE', CX, 480, t, T('D06', 'most'), { font: F.bebas, size: 120, color: '#111' }); punch(ctx, 'POPCORN', CX, 640, t, T('D06', 'popcorn'), { font: F.bebas, size: 190, color: SR.blood }); punch(ctx, 'IN HISTORY.', CX, 780, t, T('D06', 'history.'), { font: F.bebas, size: 120, color: '#111' }); capBand(ctx); }, { name: 'd-punch' });
  cue(T('D06', 'popcorn'), 'ding', .7);
  ctaShot('D07'); finish();
},
};
