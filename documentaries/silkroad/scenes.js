// Ross Ulbricht & The Silk Road — Unfiled Films (16:9). Generic helpers shared with the Musk episode; props drawn.
'use strict';
const EP = { images: { pardon_doc_p1: 'archives/documents/pardon_doc_p1.jpg' }, credit: {}, billCrop: [12, 12, 1176, 481], rossCrop: [800, 200, 1800, 2290], scenes };
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
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
// ---------------------------------------------------------------- scenes (16:9)
const FACE = () => (IMG.ross ? ['ross', EP.rossCrop] : [null, null]);
function libraryScene(ctx, t, lt, o = {}) { // drawn: the science-fiction aisle, Ross at a table with a laptop
  shelves(ctx, t, lt, { sign: 'SCIENCE FICTION' }); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 760, W, 320);
  ctx.fillStyle = '#6A4A2E'; ctx.fillRect(560, 800, 800, 30); personIcon(ctx, 960, 790, 3.2, '#1D2330');
  laptop(ctx, 960, 800, .55, { glow: true }, srScreen(o.screen || 'ADMIN · SILK ROAD', SR.green));
}
function scenes() {
  // ======== COLD OPEN
  shot(['R001', 'October'], (ctx, t, lt) => {
    camPhoto(ctx, 'glenpark', lt, { grade: 'color', z0: 1.08, tint: 'teal', tintAmt: .2 }); shade(ctx, .35); vign(ctx, .6);
    timeStamp(ctx, '1 OCT 2013', 140, 200, t, T('R001', 'October'), { size: 96, color: SR.amber }); timeStamp(ctx, 'SAN FRANCISCO', 140, 300, t, T('R001', 'San'), { size: 60 });
    if (t > T('R001', 'library.')) popIn(ctx, t, T('R001', 'library.'), W - 360, 940, c => pill(c, 'SHHH. A QUIET LIBRARY.', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 40 }));
    sourceTag(ctx, credit('glenpark', 'Glen Park Branch Library')); fadeIn(ctx, t, 0, .4);
  }, { lead: .35, name: 'open-library' });
  cue(T('R001', 'October'), 'key', .5);
  shot(['R002', 'In'], (ctx, t, lt) => {
    if (t < T('R002', 'typing')) { camPhoto(ctx, 'lib_in2', lt, { grade: 'warm', z0: 1.05 }); shade(ctx, .3); if (t > T('R002', 'science')) popIn(ctx, t, T('R002', 'science'), W / 2, 200, c => pill(c, 'SCIENCE FICTION SECTION', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 48 })); sourceTag(ctx, credit('lib_in2', 'Glen Park Branch Library')); }
    else libraryScene(ctx, t, lt, { screen: 'typing...' });
    if (t > T('R002', '29-year-old')) popIn(ctx, t, T('R002', '29-year-old'), 1380, 560, c => pill(c, 'AGE 29 · T-SHIRT', 0, 0, { align: 'center', bg: SR.amber, color: '#111', size: 40 }));
  }, { name: 'scifi-aisle' });
  shot(['R003', 'He'], (ctx, t, lt) => {
    const st = T('R003', 'actually');
    if (t < st) { libraryScene(ctx, t, lt); popIn(ctx, t, T('R003', 'grad'), 1400, 560, c => pill(c, 'GRAD STUDENT?', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 44 })); }
    else { bgGrad(ctx, '#06120A', '#000', 'r'); glitch(ctx, t, clamp(1 - (t - st) * 2)); laptop(ctx, W / 2, 900, 1.25, { glow: true }, (c, w, h) => shopMock(c, 0, 0, w, h, t, st));
      if (t > T('R003', 'black')) text(ctx, 'THE BIGGEST BLACK MARKET ON THE INTERNET', W / 2, 120, { font: F.bebas, size: 90, color: '#fff', align: 'center', shadow: 20 });
      if (t > T('R003', '1.2')) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 420, W, 220); ctx.restore(); moneyCount(ctx, t, T('R003', '1.2'), 0, 1.2e9, W / 2, 590, { size: 190 }); text(ctx, 'IN SALES · FBI ESTIMATE', W / 2, 650, { font: F.osw, size: 36, color: SR.amber, align: 'center', weight: 600, ls: 8 }); } }
  }, { name: 'reveal' });
  cue(T('R003', 'actually'), 'impact', .7); cue(T('R003', '1.2'), 'cash', .8);
  shot(['R004', 'Behind'], (ctx, t, lt) => {
    libraryScene(ctx, t, lt);
    const a = T('R004', 'argument.'); if (t > T('R004', 'man')) { personIcon(ctx, 560, 760, 3.6, '#3B2A2A'); personIcon(ctx, 720, 760, 3.4, '#2A2F3B'); }
    if (t > a) { const sh = (hash(Math.floor(t * 20)) - .5) * 10; popIn(ctx, t, a, 520 + sh, 380, c => pill(c, '!!', 0, 0, { align: 'center', bg: SR.blood, size: 60 })); popIn(ctx, t, a + .15, 760 - sh, 340, c => pill(c, '?!', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 60 })); }
    if (t > T('R004', 'one')) { glowText(ctx, '1 SECOND', 1500, 300, { font: F.bebas, size: 150, color: '#fff', align: 'center', glow: 'rgba(255,80,60,.8)' }); }
  }, { name: 'argument' });
  cue(T('R004', 'argument.'), 'hit', .6);
  shot(['R005', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#140404', '#000', 'r'); laptop(ctx, W / 2 + lerp(0, 700, E.inOut(prog(t, T('R005', 'one'), T('R005', 'everything.') + .3))), 860, 1.1, { glow: true }, srScreen('LOGGED IN: DREAD PIRATE ROBERTS', SR.green));
    if (t > T('R005', 'ends')) stamp(ctx, 'GAME OVER', 620, 360, t, T('R005', 'ends'), { size: 150 });
    if (t > T('R005', 'back.')) { glitch(ctx, t, .6); text(ctx, '◀◀ 1984', W / 2, 200, { font: F.mono, size: 80, color: '#fff', align: 'center' }); }
  }, { name: 'ends-everything' });
  cue(T('R005', 'ends'), 'stamp'); cue(T('R005', 'back.'), 'whoosh', .7);
  shot(['R006', 'This'], (ctx, t, lt) => {
    camPhoto(ctx, IMG.seized ? 'seized' : 'glenpark', lt, { grade: 'color', z0: 1.1, tint: 'navy', tintAmt: .35, blur: 6 }); shade(ctx, .78); fog(ctx, t, .3, '140,90,255');
    bigTitle(ctx, 'THE SILK ROAD', W / 2, 520, t, T('R006', 'Silk') - .2, { size: 230, align: 'center', bar: SR.purple });
    text(ctx, 'ROSS ULBRICHT · THE AMAZON OF THE DARK WEB', W / 2, 640, { font: F.osw, size: 46, color: SR.paper, align: 'center', weight: 500, ls: 10, alpha: prog(t, T('R006', 'Ross'), T('R006', 'Ross') + .5) });
    text(ctx, 'AN UNFILED FILMS DOCUMENTARY', W / 2, 980, { font: F.play, size: 30, color: 'rgba(244,236,220,.7)', align: 'center', weight: 700, ls: 8 });
    fadeOut(ctx, t, T('R007', 'Austin,') - .1, .35);
  }, { name: 'title' });
  cue(T('R006', 'This'), 'riser', .6); cue(T('R006', 'Silk'), 'hit', .8);

  // ======== CH1 ROSS
  shot(['R007', 'Austin,'], (ctx, t, lt) => {
    const pr = worldMap(ctx, t, { lon: lerp(-98, -97.74, prog(t, T('R007', 'Austin,'), T('R007', 'Austin,') + 1.5)), lat: 31, k: lerp(8, 30, E.inOut(prog(t, T('R007', 'Austin,'), T('R007', 'Austin,') + 1.5))), theme: 'night' }); pin(ctx, ...pr(-97.74, 30.27), t, T('R007', 'Austin,') + 1, 'AUSTIN, TEXAS', { color: SR.amber }); chapter(ctx, t, T('R007', 'Austin,'), 1, 'THE EAGLE SCOUT', SR.amber);
    timeStamp(ctx, 'AUSTIN, TEXAS · 1984', 140, 920, t, T('R007', '1984.'), { size: 80, color: SR.amber });
    if (t > T('R007', 'Eagle')) popIn(ctx, t, T('R007', 'Eagle'), 1500, 560, c => { c.fillStyle = '#C9A227'; star(c, 0, 0, 120); c.fillStyle = '#1E3A7A'; c.beginPath(); c.arc(0, 0, 60, 0, 7); c.fill(); text(c, 'EAGLE SCOUT', 0, 190, { font: F.bebas, size: 70, color: '#fff', align: 'center', shadow: 10 }); });
  }, { name: 'austin' });
  cue(T('R007', 'Eagle'), 'ding', .6);
  shot(['R008', 'He'], (ctx, t, lt) => {
    camPhoto(ctx, 'pennstate', lt, { grade: 'color', tint: 'navy', tintAmt: .5, z0: 1.06 }); shade(ctx, .55); sourceTag(ctx, credit('pennstate', 'Penn State (illustrative)'));
    [['PHYSICS', 'physics,', '#3FA9F5'], ["MASTER'S: MATERIALS SCIENCE", "master's", '#9A73FF']].forEach(([s, w, c], i) => { if (t > T('R008', w)) popIn(ctx, t, T('R008', w), 560, 360 + i * 200, cc => pill(cc, s, 0, 0, { align: 'center', bg: c, size: 54 })); });
    if (t > T('R008', 'Crystals,')) { for (let i = 0; i < 7; i++) { const a = t * .6 + i; ctx.save(); ctx.translate(1420 + Math.cos(a) * 160, 520 + Math.sin(a * 1.3) * 160); ctx.rotate(a); ctx.fillStyle = `hsla(${190 + i * 20},90%,70%,.85)`;
      ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(36, 0); ctx.lineTo(0, 60); ctx.lineTo(-36, 0); ctx.closePath(); ctx.fill(); ctx.restore(); } text(ctx, 'CRYSTALS, MOSTLY.', 1420, 860, { font: F.hand, size: 90, color: '#fff', align: 'center', weight: 700 }); }
  }, { name: 'studies' });
  shot(['R009', 'But'], (ctx, t, lt) => {
    bgGrad(ctx, '#2A1A06', '#050300', 'r'); lightLeak(ctx, t, .25, 4);
    if (t > T('R009', 'freedom.')) glowText(ctx, 'FREEDOM.', W / 2, 360, { font: F.bebas, size: 220, color: '#fff', align: 'center', glow: 'rgba(255,181,71,.7)' });
    if (t > T('R009', 'libertarian')) popIn(ctx, t, T('R009', 'libertarian'), W / 2, 560, c => pill(c, 'LIBERTARIAN ECONOMICS', 0, 0, { align: 'center', bg: SR.amber, color: '#111', size: 50 }));
    if (t > T('R009', 'governments')) wipeText(ctx, '"NO GOVERNMENT SAYS WHAT YOU CAN BUY OR SELL"', W / 2, 780, prog(t, T('R009', 'governments'), T('R009', 'governments') + .6), { size: 70, color: '#fff', align: 'center' });
  }, { name: 'ideas' });
  shot(['R010', 'He'], (ctx, t, lt) => {
    bgGrad(ctx, '#F4ECDC', '#E2D3B6'); halftone(ctx, .08, 10); text(ctx, 'CAREER ATTEMPTS', W / 2, 180, { font: F.bebas, size: 110, color: SR.ink, align: 'center' });
    [['DAY TRADING', 'fails.'], ['VIDEO GAME COMPANY', 'too.'], ['USED BOOKS ONLINE', 'great.']].forEach(([s, w], i) => { const st = T('R010', s === 'DAY TRADING' ? 'day' : s === 'VIDEO GAME COMPANY' ? 'video' : 'sells'); if (t < st) return; const y = 360 + i * 200;
      text(ctx, s, 360, y, { font: F.bebas, size: 110, color: SR.ink, alpha: prog(t, st, st + .3) }); if (t > T('R010', w)) bigX(ctx, 1560, y - 40, 50, prog(t, T('R010', w), T('R010', w) + .4)); });
    if (t > T('R010', 'Honestly?')) text(ctx, '(ALSO NOT GREAT)', 1560, 1000, { font: F.hand, size: 60, color: SR.blood, align: 'center', weight: 700 });
  }, { name: 'fails' });
  cue(T('R010', 'fails.'), 'thud', .5); cue(T('R010', 'too.'), 'thud', .5); cue(T('R010', 'great.'), 'thud', .5);
  shot(['R011', 'So'], (ctx, t, lt) => {
    bgGrad(ctx, '#0C0A1A', '#000', 'r'); timeStamp(ctx, '2010', 140, 180, t, T('R011', '2010,'), { size: 90 });
    popIn(ctx, t, T('R011', 'idea.'), W / 2, 380, c => { c.fillStyle = '#FFD45A'; c.beginPath(); c.arc(0, 0, 110, 0, 7); c.fill(); c.fillStyle = '#B88A1A'; c.fillRect(-40, 100, 80, 50); });
    if (t > T('R011', 'website')) wipeText(ctx, 'BUY ANYTHING.', W / 2, 700, prog(t, T('R011', 'anyone'), T('R011', 'anyone') + .4), { size: 170, color: '#fff', align: 'center' });
    if (t > T('R011', 'anonymously.')) wipeText(ctx, 'COMPLETELY ANONYMOUSLY.', W / 2, 870, prog(t, T('R011', 'anonymously.'), T('R011', 'anonymously.') + .4), { size: 120, color: SR.purple, align: 'center' });
  }, { name: 'idea' });
  cue(T('R011', 'idea.'), 'ding', .7);

  // ======== CH2 SILK ROAD
  shot(['R012', 'He'], (ctx, t, lt) => {
    const pr = worldMap(ctx, t, { lon: 65, lat: 38, k: 8, theme: 'night' }); chapter(ctx, t, T('R012', 'He'), 2, 'OPEN FOR BUSINESS', SR.purple);
    const pts = [[116.4, 39.9], [87.6, 43.8], [69.2, 41.3], [51.4, 35.7], [44.4, 33.3], [28.97, 41.0], [12.5, 41.9]].map(p => pr(...p));
    const p = prog(t, T('R012', 'ancient'), T('R012', 'Europe.') + .2); ctx.save(); ctx.strokeStyle = SR.amber; ctx.lineWidth = 8; ctx.setLineDash([22, 14]); ctx.beginPath();
    const n = Math.max(1, Math.floor(p * (pts.length - 1) * 10) / 10); pts.forEach((q, i) => { if (i <= n) i ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.stroke(); ctx.restore();
    glowText(ctx, 'SILK ROAD', W / 2, 960, { font: F.play, size: 120, color: '#fff', align: 'center', weight: 700, glow: 'rgba(255,181,71,.6)', alpha: prog(t, T('R012', 'Silk'), T('R012', 'Silk') + .3) });
  }, { name: 'name' });
  shot(['R013', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#120A24', '#030208', 'r');
    if (t > T('R013', 'Tor')) { onion(ctx, 560, 560, 200, t, prog(t, T('R013', 'Tor'), T('R013', 'Tor') + .6)); text(ctx, 'TOR: HIDES WHERE YOU ARE', 560, 900, { font: F.bebas, size: 80, color: '#C9B4FF', align: 'center' }); }
    if (t > T('R013', 'Bitcoin,')) { if (IMG.casascius) { ctx.save(); ctx.beginPath(); ctx.arc(1360, 540, 230, 0, 7); ctx.clip(); photo(ctx, 'casascius', { x: 1130, y: 310, w: 460, h: 460, zoom: 1.35, grade: 'color' }); ctx.restore(); sourceTag(ctx, credit('casascius', 'Physical bitcoin (Casascius)')); } else btcCoin(ctx, 1360, 540, 190, t, { flip: true, spin: 2 }); text(ctx, 'BITCOIN: HIDES WHO PAYS', 1360, 900, { font: F.bebas, size: 80, color: SR.btc, align: 'center' }); }
  }, { name: 'tech' });
  cue(T('R013', 'Tor'), 'whoosh', .5); cue(T('R013', 'Bitcoin,'), 'cash', .6);
  shot(['R013B', 'Tor'], (ctx, t, lt) => {
    const pr = worldMap(ctx, t, { lon: 10, lat: 25, k: 5.2, theme: 'night' }); const hops = [[-122.4, 37.8], [13.4, 52.5], [-73.6, 45.5], [18.1, 59.3], [139.7, 35.7], [4.9, 52.4]].map(p => pr(...p));
    for (let i = 0; i < hops.length - 1; i++) { const st = T('R013B', 'bounced') + i * .3; if (t < st) break; route(ctx, hops[i], hops[i + 1], prog(t, st, st + .35), { color: '#9A73FF', ctrl: [(hops[i][0] + hops[i + 1][0]) / 2, Math.min(hops[i][1], hops[i + 1][1]) - 150] }); }
    onion(ctx, 220, 900, 90, t, prog(t, T('R013B', 'onion.'), T('R013B', 'onion.') + .5));
    if (t > T('R013B', 'layers')) text(ctx, 'LAYER · LAYER · LAYER', 380, 920, { font: F.mono, size: 40, color: '#C9B4FF' });
    if (t > T('R013B', 'no')) stamp(ctx, 'ORIGIN: ???', 1500, 900, t, T('R013B', 'no'), { size: 90, color: SR.purple });
  }, { name: 'tor-bounce' });
  cue(T('R013B', 'bounced'), 'whoosh', .5);
  shot(['R014', 'Back'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A1000', '#000', 'r'); btcCoin(ctx, 640, 540, 230, t, { flip: true, spin: 1.5 }); text(ctx, '=', W / 2, 590, { font: F.bebas, size: 200, color: '#fff', align: 'center' });
    ctx.save(); ctx.translate(1300, 540); ctx.rotate(-.05); { ctx.fillStyle = '#7BA05B'; ctx.fillRect(-260, -110, 520, 220); text(ctx, '$1', 0, 40, { font: F.bebas, size: 160, color: '#fff', align: 'center' }); } ctx.restore();
    text(ctx, '1 BITCOIN ~ $1 (EARLY 2011)', W / 2, 900, { font: F.osw, size: 52, color: SR.amber, align: 'center', weight: 600, ls: 6 });
    if (t > T('R014', 'Keep')) sticky(ctx, 'REMEMBER\nTHIS', 1600, 240, .08, prog(t, T('R014', 'Keep'), T('R014', 'Keep') + .3));
  }, { name: 'one-dollar' });
  cue(T('R014', 'Keep'), 'paper', .7);
  shot(['R015', 'To'], (ctx, t, lt) => {
    camPhoto(ctx, 'mushrooms', lt, { grade: 'color', z0: 1.08, tint: 'teal', tintAmt: .15 }); shade(ctx, .35);
    if (t > T('R015', 'grows')) popIn(ctx, t, T('R015', 'grows'), 520, 300, c => pill(c, 'STOCKING THE SHELVES HIMSELF', 0, 0, { align: 'center', bg: SR.green, color: '#062010', size: 46 }));
    if (t > T('R015', 'cabin')) timeStamp(ctx, 'A CABIN OUTSIDE AUSTIN', 140, 960, t, T('R015', 'cabin'), { size: 70 });
    sourceTag(ctx, credit('mushrooms', 'Psilocybe cubensis'));
  }, { name: 'mushrooms' });
  shot(['R016', 'February'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E1A12', '#020503', 'r'); timeStamp(ctx, 'FEB 2011 · LIVE', 140, 160, t, T('R016', 'February'), { size: 80, color: SR.green });
    laptop(ctx, W / 2, 1000, 1.45, { glow: true }, (c, w, h) => shopMock(c, 0, 0, w, h, t, T('R016', 'listings,')));
    if (t > T('R016', 'Except')) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 380, W, 200); ctx.restore(); stamp(ctx, 'MOSTLY ILLEGAL DRUGS', W / 2, 480, t, T('R016', 'Except'), { size: 110 }); }
  }, { name: 'live' });
  cue(T('R016', 'live.'), 'ding', .6); cue(T('R016', 'Except'), 'stamp');
  shot(['R016B', 'Sellers'], (ctx, t, lt) => {
    bgGrad(ctx, '#F6F1E6', '#E7DECB');
    [['★★★★★ STAR RATINGS', 'ratings.'], ['"WOULD BUY AGAIN" — REVIEWS', 'reviews.'], ['CUSTOMER SUPPORT: 24/7', 'support.']].forEach(([s, w], i) => { const st = T('R016B', w); if (t < st - .4) return;
      popIn(ctx, t, st - .4, W / 2, 330 + i * 220, c => pill(c, s, 0, 0, { align: 'center', bg: ['#E8A21B', '#2E5E3A', '#2B5DD9'][i], size: 64 })); });
  }, { name: 'reviews' });
  shot(['R016C', 'Somewhere'], (ctx, t, lt) => {
    bgGrad(ctx, '#2E5E3A', '#10241A', 'r'); ctx.save(); ctx.translate(W / 2, 520); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-640, -230, 1280, 460, 30); ctx.fill();
    ctx.fillStyle = '#E8A21B'; for (let k = 0; k < 5; k++) if (t > T('R016C', 'five') + k * .08) star(ctx, -520 + k * 90, -120, 38);
    text(ctx, '"Fast shipping. Lovely packaging."', -560, 30, { font: F.play, size: 64, color: '#111', weight: 700 }); text(ctx, '— a very satisfied anonymous customer', -560, 130, { font: F.playI, size: 40, color: '#555' }); ctx.restore();
    text(ctx, '(ACTUAL ADVICE: DON\'T)', W / 2, 960, { font: F.hand, size: 70, color: '#FFE45C', align: 'center', weight: 700, alpha: prog(t, T('R016C', 'packaging.'), T('R016C', 'packaging.') + .3) });
  }, { name: 'five-stars' });
  cue(T('R016C', 'five'), 'ding', .5);
  shot(['R017', 'To'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B2232', '#090C12', 'r'); forumPost(ctx, 360, 260, 1200, 'altoid', 'Has anyone seen Silk Road yet? It\'s kind of like an anonymous amazon.com...', t, T('R017', 'forums,'), { h: 360, when: 'posted · Jan 2011' });
    if (t > T('R017', 'altoid.')) { penEllipse(ctx, 520, 365, 160, 50, prog(t, T('R017', 'altoid.'), T('R017', 'altoid.') + .5), { color: SR.blood }); }
    if (t > T('R017', 'Remember')) sticky(ctx, 'REMEMBER\n"ALTOID"', 1520, 820, -.06, prog(t, T('R017', 'Remember'), T('R017', 'Remember') + .3));
  }, { name: 'altoid' });
  cue(T('R017', 'Remember'), 'paper', .7);
  shot(['R018', 'In'], (ctx, t, lt) => {
    bgGrad(ctx, '#EEE8DA', '#D9CFBA'); halftone(ctx, .07, 9); timeStamp(ctx, 'JUNE 2011', 140, 160, t, T('R018', 'June'), { size: 80 });
    ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-.02); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 30; ctx.fillRect(-620, -220, 1240, 440); ctx.shadowBlur = 0;
    text(ctx, 'NEWS · TECH', -580, -160, { font: F.osw, size: 30, color: SR.blood, weight: 700, ls: 6 }); wrapText(ctx, 'The underground website where you can buy any drug imaginable', -580, -80, 1160, 90, { font: F.play, size: 76, color: '#111', weight: 700 }); ctx.restore();
    if (t > T('R018', 'Overnight,')) { for (let i = 0; i < 18; i++) { const st = T('R018', 'Overnight,') + i * .05; if (t > st) personIcon(ctx, 120 + i * 100, 1040, 1.2 + hash(i) * .5, `hsl(${hash(i) * 360},40%,40%)`); } }
    if (t > T('R018', 'senator')) stamp(ctx, 'SHUT IT DOWN!', 1480, 820, t, T('R018', 'senator'), { size: 100 });
  }, { name: 'gawker' });
  cue(T('R018', 'senator'), 'stamp');
  shot(['R019', 'Which,'], (ctx, t, lt) => {
    bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9); text(ctx, 'FREE ADVERTISING', W / 2, 420, { font: F.bebas, size: 220, color: '#111', align: 'center' });
    const v = Math.floor(lerp(1200, 98000, E.in(prog(t, T('R019', 'Which,'), T('R019', 'beat.', 'e'))))); counter(ctx, v, W / 2, 700, { size: 160, color: SR.blood, align: 'center' }); text(ctx, 'VISITORS (ILLUSTRATIVE)', W / 2, 780, { font: F.mono, size: 34, color: '#333', align: 'center' });
  }, { name: 'free-ads' });

  // ======== CH3 THE PIRATE
  shot(['R020', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#0B1A12', '#000', 'r'); chapter(ctx, t, T('R020', 'The'), 3, 'THE DREAD PIRATE', SR.green); speedLines(ctx, t, 'rgba(59,224,122,.12)');
    if (t > T('R020', 'Thousands')) text(ctx, 'THOUSANDS OF SELLERS', W / 2, 460, { font: F.bebas, size: 130, color: '#fff', align: 'center' });
    if (t > T('R020', 'million')) { counter(ctx, Math.floor(lerp(0, 957079, E.out(prog(t, T('R020', 'million'), T('R020', 'million') + 1.2)))), W / 2, 700, { size: 190, color: SR.green, align: 'center' }); text(ctx, 'USER ACCOUNTS (FBI)', W / 2, 790, { font: F.osw, size: 40, color: '#fff', align: 'center', weight: 600, ls: 8 }); }
  }, { name: 'explodes' });
  cue(T('R020', 'million'), 'riser', .5);
  shot(['R021', 'Ross'], (ctx, t, lt) => {
    bgGrad(ctx, '#05080E', '#000', 'r'); fog(ctx, t, .4, '80,90,120');
    ctx.save(); ctx.translate(W / 2, 520); ctx.fillStyle = '#0E1118'; ctx.beginPath(); ctx.arc(0, -80, 110, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-240, 260); ctx.quadraticCurveTo(0, 0, 240, 260); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(0, -170, 220, 50, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-120, -175); ctx.quadraticCurveTo(0, -330, 120, -175); ctx.fill();
    ctx.restore();
    glowText(ctx, 'DREAD PIRATE ROBERTS', W / 2, 920, { font: F.bebas, size: 150, color: '#fff', align: 'center', glow: 'rgba(200,50,40,.8)', alpha: prog(t, T('R021', 'Dread'), T('R021', 'Dread') + .3) });
    if (t > T('R021', 'passed')) { ['PIRATE #1', 'PIRATE #2', 'PIRATE #3'].forEach((s, i) => { if (t > T('R021', 'passed') + i * .3) pill(ctx, s, 200 + i * 300, 160, { bg: '#2A2F3B', size: 34 }); }); }
    if (t > T('R021', 'nobody')) stamp(ctx, 'WHO IS HE?', 1560, 300, t, T('R021', 'nobody'), { size: 100 });
  }, { name: 'dpr' });
  cue(T('R021', 'Dread'), 'hit', .8);
  shot(['R022', 'He'], (ctx, t, lt) => {
    camPhoto(ctx, 'coin_bill', lt, { grade: 'color', z0: 1.1, blur: 4 }); shade(ctx, .7); coinRain(ctx, t, T('R022', 'moves'), 40); shade(ctx, .2); sourceTag(ctx, credit('coin_bill'));
    text(ctx, 'SALES', 520, 380, { font: F.osw, size: 50, color: '#fff', align: 'center', weight: 600, ls: 10 }); if (t > T('R022', '9.5')) { counter(ctx, Math.floor(lerp(0, 9519664, E.out(prog(t, T('R022', '9.5'), T('R022', '9.5') + 1)))), 520, 560, { size: 120, color: SR.btc, align: 'center' }); text(ctx, 'BITCOINS', 520, 640, { font: F.osw, size: 40, color: SR.btc, align: 'center', weight: 600 }); }
    text(ctx, 'COMMISSIONS', 1400, 380, { font: F.osw, size: 50, color: '#fff', align: 'center', weight: 600, ls: 10 }); moneyCount(ctx, t, T('R022', '80'), 0, 80e6, 1400, 580, { size: 140 });
    if (t > T('R022', 'cut')) text(ctx, 'HIS CUT OF EVERY SALE', W / 2, 900, { font: F.bebas, size: 90, color: '#fff', align: 'center' });
  }, { name: 'money' });
  cue(T('R022', 'moves'), 'cash', .8); cue(T('R022', '80'), 'cash', .6);
  shot(['R022B', 'He'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E2618', '#020805', 'r'); sheet(ctx, 360, 220, 1200, [['MONTH', 'COMMISSION'], ['2012-01', 'BTC ▓▓▓▓'], ['2012-06', 'BTC ▓▓▓▓▓▓'], ['2013-01', 'BTC ▓▓▓▓▓▓▓▓'], ['2013-06', 'BTC ▓▓▓▓▓▓▓▓▓▓']], t, T('R022B', 'spreadsheets,'));
    if (t > T('R022B', 'small')) text(ctx, 'SMALL BUSINESS OWNER', W / 2, 860, { font: F.bebas, size: 110, color: '#fff', align: 'center' });
    if (t > T('R022B', 'not')) { bigX(ctx, W / 2 - 250, 820, 60, prog(t, T('R022B', 'not'), T('R022B', 'not') + .4)); stamp(ctx, 'NOT SMALL. NOT LEGAL.', W / 2, 990, t, T('R022B', 'legal.'), { size: 80 }); }
  }, { name: 'spreadsheet' });
  shot(['R023', 'And'], (ctx, t, lt) => {
    camPhoto(ctx, 'sfhouses', lt, { grade: 'color', z0: 1.06, tint: 'teal', tintAmt: .15 }); shade(ctx, .4);
    if (t > T('R023', 'room')) popIn(ctx, t, T('R023', 'room'), 520, 360, c => pill(c, 'A RENTED ROOM', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 54 }));
    if (t > T('R023', 'thousand')) { cashStack(ctx, 1460, 640, 1.0, 6); text(ctx, '$1,000 / MONTH · CASH', 1460, 820, { font: F.bebas, size: 80, color: '#fff', align: 'center', shadow: 20 }); }
    if (t > T('R023', 'Josh.')) { ctx.save(); ctx.translate(560, 700); ctx.fillStyle = '#fff'; ctx.fillRect(-250, -90, 500, 180); ctx.fillStyle = SR.blood; ctx.fillRect(-250, -90, 500, 60); text(ctx, 'HELLO, MY NAME IS', 0, -48, { font: F.osw, size: 30, color: '#fff', align: 'center', weight: 700 }); text(ctx, 'Josh', 0, 60, { font: F.hand, size: 100, color: '#111', align: 'center', weight: 700 }); ctx.restore(); }
    sourceTag(ctx, credit('sfhouses', 'San Francisco'));
  }, { name: 'josh' });
  cue(T('R023', 'thousand'), 'cash', .6); cue(T('R023', 'Josh.'), 'paper', .7);
  shot(['R024', 'His'], (ctx, t, lt) => {
    bgGrad(ctx, '#20263A', '#0A0C14'); ctx.fillStyle = '#3A3226'; ctx.fillRect(0, 800, W, 280); personIcon(ctx, 760, 800, 3, '#11141C'); laptop(ctx, 1040, 800, .5, { glow: true }, srScreen('...'));
    personIcon(ctx, 260, 820, 2.6, '#4A5268'); personIcon(ctx, 420, 820, 2.6, '#4A5268'); popIn(ctx, t, T('R024', 'quiet'), 340, 380, c => pill(c, '"QUIET GUY. ALWAYS ON HIS COMPUTER."', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 40 }));
    if (t > T('R024', 'true.')) stamp(ctx, 'ACCURATE.', 1500, 400, t, T('R024', 'true.'), { size: 120, color: SR.green });
  }, { name: 'roommates' });
  cue(T('R024', 'true.'), 'stamp');
  shot(['R025', 'But'], (ctx, t, lt) => { // serious beat — no jokes
    bgGrad(ctx, '#121418', '#050507'); dust(ctx, t, 40, .2);
    for (let i = 0; i < 6; i++) { const st = T('R025', 'six') + i * .25; if (t < st) continue; const a = prog(t, st, st + .6); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#FFE3A0'; const x = 460 + i * 200;
      ctx.fillRect(x - 10, 560, 20, 140); const fl = 1 + .1 * Math.sin(t * 9 + i); ctx.beginPath(); ctx.ellipse(x, 540, 12 * fl, 28 * fl, 0, 0, 7); ctx.fillStyle = '#FFB547'; ctx.fill(); ctx.restore(); }
    text(ctx, 'SIX DEATHS LINKED BY PROSECUTORS', W / 2, 860, { font: F.osw, size: 52, color: '#E8E2D6', align: 'center', weight: 500, ls: 6, alpha: prog(t, T('R025', 'six'), T('R025', 'six') + .6) });
    text(ctx, 'Families spoke at his sentencing.', W / 2, 940, { font: F.playI, size: 42, color: 'rgba(232,226,214,.75)', align: 'center', alpha: prog(t, T('R025', 'parents'), T('R025', 'parents') + .6) });
  }, { name: 'deaths' });
  shot(['R026', 'Prosecutors'], (ctx, t, lt) => {
    bgGrad(ctx, '#121418', '#050507'); ctx.save(); ctx.translate(W / 2, 470); ctx.fillStyle = '#F4ECDC'; ctx.fillRect(-560, -240, 1120, 480);
    text(ctx, 'PROSECUTORS ALLEGED:', -500, -160, { font: F.osw, size: 40, color: SR.ink, weight: 700, ls: 4 }); wrapText(ctx, 'He paid for murders-for-hire to protect the site.', -500, -80, 1000, 70, { font: F.type, size: 54, color: SR.ink }); ctx.restore();
    if (t > T('R026', 'No')) text(ctx, 'NO ONE WAS ACTUALLY HARMED', W / 2, 860, { font: F.bebas, size: 90, color: '#fff', align: 'center' });
    if (t > T('R026', 'never')) text(ctx, 'NEVER CONVICTED ON THOSE CLAIMS', W / 2, 970, { font: F.bebas, size: 80, color: SR.amber, align: 'center' });
  }, { name: 'murder-for-hire' });

  // ======== CH4 THE HUNT
  shot(['R027', 'Meanwhile,'], (ctx, t, lt) => {
    bgGrad(ctx, '#0A1022', '#000', 'r'); chapter(ctx, t, T('R027', 'Meanwhile,'), 4, 'THE HUNT', SR.blood); scanBeam(ctx, 0, 0, W, H, (t * .4) % 1, 'rgba(255,70,60,');
    ['FBI', 'DEA', 'HOMELAND SECURITY', 'IRS'].forEach((s, i) => { const st = T('R027', ['FBI,', 'DEA,', 'Homeland', 'IRS'][i]); if (t > st) popIn(ctx, t, st, 360 + i * 400, 520, c => pill(c, s, 0, 0, { align: 'center', bg: ['#1E3A7A', '#2E2E2E', '#2E5E3A', '#7A2E2E'][i], size: 48 })); });
    if (t > T('R027', 'pirate.')) { text(ctx, 'VS', W / 2, 760, { font: F.bebas, size: 120, color: '#fff', align: 'center' }); text(ctx, '1 PIRATE', W / 2, 920, { font: F.bebas, size: 140, color: SR.blood, align: 'center' }); }
  }, { name: 'hunt' });
  cue(T('R027', 'pirate.'), 'hit', .7);
  shot(['R028', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E1522', '#000', 'r');
    [['HACKERS?', 'hackers'], ['SPY SATELLITES?', 'satellites.']].forEach(([s, w], i) => { if (t > T('R028', w)) { text(ctx, s, W / 2, 330 + i * 170, { font: F.bebas, size: 120, color: 'rgba(255,255,255,.5)', align: 'center' }); bigX(ctx, W / 2 + 380, 290 + i * 170, 45, prog(t, T('R028', w) + .2, T('R028', w) + .5)); } });
    if (t > T('R028', 'Google.')) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(360, 720, 1200, 120, 60); ctx.fill(); text(ctx, 'search: "silk road"', 440, 800, { font: F.osw, size: 52, color: '#333' }); ctx.restore(); text(ctx, 'A SEARCH ENGINE.', W / 2, 960, { font: F.bebas, size: 110, color: SR.green, align: 'center' }); }
  }, { name: 'google' });
  cue(T('R028', 'Google.'), 'ding', .8);
  shot(['R029', 'An'], (ctx, t, lt) => {
    camPhoto(ctx, IMG.irs ? 'irs' : 'fbi', lt, { grade: 'color', tint: 'navy', tintAmt: .45 }); shade(ctx, .55);
    lowerTag(ctx, 'GARY ALFORD', 'IRS SPECIAL AGENT', t, T('R029', 'Gary'));
    if (t > T('R029', 'oldest')) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(460, 260, 1000, 100, 50); ctx.fill(); text(ctx, 'silk road  ·  sort: OLDEST FIRST', 520, 326, { font: F.osw, size: 44, color: '#333' }); ctx.restore(); }
    if (t > T('R029', 'altoid.')) { glowText(ctx, 'altoid', W / 2, 640, { font: F.mono, size: 180, color: '#fff', align: 'center', glow: 'rgba(59,224,122,.9)', weight: 700 }); }
    sourceTag(ctx, credit(IMG.irs ? 'irs' : 'fbi'));
  }, { name: 'alford' });
  cue(T('R029', 'altoid.'), 'hit', .8);
  shot(['R030', 'Later,'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B2232', '#090C12', 'r'); forumPost(ctx, 360, 200, 1200, 'altoid', 'Looking for an IT pro with Bitcoin experience... Send replies to:', t, T('R030', 'programmer.') - .3, { h: 330, forum: 'FORUM · OCT 2011' });
    if (t > T('R030', 'email')) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(360, 640, 1200, 160, 24); ctx.fill(); text(ctx, 'rossulbricht@gmail.com', W / 2, 745, { font: F.mono, size: 72, color: '#1B4FB8', align: 'center', weight: 700 }); ctx.restore();
      highlighter(ctx, 470, 700, 600, 70, prog(t, T('R030', 'rossulbricht'), T('R030', 'rossulbricht') + .6)); }
  }, { name: 'gmail' });
  cue(T('R030', 'email'), 'key', .6);
  shot(['R031', 'His'], (ctx, t, lt) => {
    bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9);
    [['HIS REAL NAME.', 'real'], ['IN HIS EMAIL.', 'email.'], ['ON THE INTERNET.', 'internet.']].forEach(([s, w], i) => { if (t > T('R031', w)) punch(ctx, s, W / 2, 300 + i * 190, t, T('R031', w), { font: F.bebas, size: 150, color: '#111' }); });
    if (t > T('R031', 'ladies')) text(ctx, 'THE DREAD PIRATE, LADIES AND GENTLEMEN.', W / 2, 960, { font: F.hand, size: 70, color: SR.blood, align: 'center', weight: 700 });
  }, { name: 'real-name' });
  cue(T('R031', 'real'), 'thud', .5); cue(T('R031', 'email.'), 'thud', .5); cue(T('R031', 'internet.'), 'thud', .6);
  shot(['R031B', 'It'], (ctx, t, lt) => {
    bgGrad(ctx, '#151A26', '#05070B', 'r'); const sw = T('R031B', 'frosty.');
    ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(460, 300, 1000, 300, 20); ctx.fill(); text(ctx, 'CODING Q&A SITE', 500, 360, { font: F.mono, size: 28, color: '#888' });
    text(ctx, 'asked by:', 500, 460, { font: F.osw, size: 44, color: '#444' }); text(ctx, t < sw ? 'Ross Ulbricht' : 'frosty', 720, 460, { font: F.osw, size: 64, color: t < sw ? SR.blood : '#1B4FB8', weight: 700 }); ctx.restore();
    if (t > sw) { glitch(ctx, t, clamp(1 - (t - sw) * 3)); }
    if (t > T('R031B', 'Less')) { const s = clamp((t - T('R031B', 'Less')) * 30, 0, 59); text(ctx, '00:' + String(Math.floor(s)).padStart(2, '0'), W / 2, 800, { font: F.mono, size: 120, color: SR.amber, align: 'center', weight: 700 }); }
    if (t > T('R031B', 'remembers.')) text(ctx, 'THE INTERNET REMEMBERS.', W / 2, 980, { font: F.bebas, size: 100, color: '#fff', align: 'center' });
  }, { name: 'frosty' });
  cue(T('R031B', 'frosty.'), 'whoosh', .5);
  shot(['R032', 'Then,'], (ctx, t, lt) => {
    camPhoto(ctx, 'cbp', lt, { grade: 'color', tint: 'navy', tintAmt: .5, blur: 3 }); shade(ctx, .6); timeStamp(ctx, 'JULY 2013 · BORDER CHECK', 140, 160, t, T('R032', 'July'), { size: 70 });
    const op = E.out(prog(t, T('R032', 'Inside:') - .3, T('R032', 'Inside:') + .4)); parcel(ctx, W / 2, 860, 1.2, op, { from: 'FROM: CANADA', to: 'TO: SAN FRANCISCO' });
    if (t > T('R032', 'nine')) { const [fk, fc] = FACE(); for (let i = 0; i < 9; i++) { const st = T('R032', 'nine') + i * .09; if (t < st) continue; const p = E.out(prog(t, st, st + .35));
      idCard(ctx, lerp(W / 2, 260 + (i % 5) * 350, p), lerp(800, 330 + Math.floor(i / 5) * 260, p), .82, ['J. TERREY', 'R. SMITH', 'A. JONES', 'M. BROWN', 'D. LEE', 'C. WHITE', 'P. HALL', 'T. KING', 'S. HILL'][i], i, { rot: (hash(i) - .5) * .2, face: fk, crop: fc }); } }
    if (t > T('R032', 'Same')) pill(ctx, 'DIFFERENT NAMES. SAME FACE.', W / 2, 1010, { align: 'center', bg: SR.blood, size: 46 });
  }, { name: 'fake-ids' });
  cue(T('R032', 'Inside:'), 'paper', .7); cue(T('R032', 'nine'), 'shutter', .5);
  shot(['R033', 'Homeland'], (ctx, t, lt) => {
    camPhoto(ctx, 'sfhouses', lt, { grade: 'color', tint: 'navy', tintAmt: .35, z0: 1.15 }); shade(ctx, .45);
    if (t > T('R033', 'knocks')) { const k = Math.floor((t - T('R033', 'knocks')) * 5); if (k < 3) text(ctx, 'KNOCK', 400 + k * 160, 300 + k * 30, { font: F.bebas, size: 110, color: '#fff', shadow: 20 }); }
    if (t > T('R033', 'nothing.')) pill(ctx, 'ADMITS: NOTHING', 140, 520, { bg: '#111', size: 50 });
    if (t > T('R033', 'hypothetically,')) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(560, 640, 1240, 260, 30); ctx.fill(); wrapText(ctx, '"Hypothetically, anyone could buy fake IDs on a site called Silk Road."', 610, 730, 1150, 70, { font: F.play, size: 54, color: '#111', weight: 700 }); ctx.restore(); }
    sourceTag(ctx, credit('sfhouses', 'San Francisco'));
  }, { name: 'knock' });
  cue(T('R033', 'knocks'), 'thud', .7); cue(T('R033', 'knocks') + .2, 'thud', .7); cue(T('R033', 'knocks') + .4, 'thud', .7);
  shot(['R034', 'Hypothetically.'], (ctx, t, lt) => {
    bgGrad(ctx, '#000', '#000'); punch(ctx, 'HYPOTHETICALLY.', W / 2, 600, t, T('R034', 'Hypothetically.'), { font: F.bebas, size: 220, color: '#fff' });
    text(ctx, '*WINK WINK*', W / 2, 820, { font: F.osw, size: 70, color: SR.amber, align: 'center', alpha: prog(t, T('R034', 'Hypothetically.') + .4, T('R034', 'Hypothetically.') + .7) });
  }, { name: 'hypothetically' });
  cue(T('R034', 'Hypothetically.'), 'impact', .6);

  // ======== CH5 THE ARREST
  shot(['R035', 'Now'], (ctx, t, lt) => {
    bgGrad(ctx, '#0B1420', '#000', 'r'); chapter(ctx, t, T('R035', 'Now'), 5, 'THE LIBRARY', SR.amber);
    laptop(ctx, W / 2, 900, 1.2, { glow: true }, srScreen('DREAD PIRATE ROBERTS · ADMIN'));
    if (t > T('R035', 'closes,')) { const p = prog(t, T('R035', 'closes,'), T('R035', 'closes,') + .5); ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      popIn(ctx, t, T('R035', 'locked'), W / 2, 480, c => { c.fillStyle = SR.amber; c.beginPath(); c.roundRect(-120, -40, 240, 200, 20); c.fill(); c.strokeStyle = SR.amber; c.lineWidth = 34; c.beginPath(); c.arc(0, -40, 80, Math.PI, 0); c.stroke(); });
      text(ctx, 'ENCRYPTED', W / 2, 820, { font: F.bebas, size: 150, color: SR.amber, align: 'center', alpha: prog(t, T('R035', 'encrypted.'), T('R035', 'encrypted.') + .3) }); }
  }, { name: 'encrypted' });
  cue(T('R035', 'locked'), 'stamp', .6);
  shot(['R036', 'They'], (ctx, t, lt) => {
    bgGrad(ctx, '#0B1420', '#000', 'r'); laptop(ctx, W / 2, 900, 1.2, { glow: true }, srScreen('LOGGED IN · DREAD PIRATE ROBERTS'));
    [['MISSION:', 'They'], ['GRAB IT OPEN', 'open,'], ['WHILE HE\'S LOGGED IN', 'logged']].forEach(([s, w], i) => { if (t > T('R036', w)) text(ctx, s, 140, 200 + i * 110, { font: F.bebas, size: 100, color: i ? SR.green : '#fff' }); });
  }, { name: 'mission' });
  shot(['R037', 'October'], (ctx, t, lt) => {
    bgGrad(ctx, '#0A0F18', '#000', 'r'); timeStamp(ctx, '1 OCT 2013 · AFTERNOON', 140, 160, t, T('R037', 'October'), { size: 70, color: SR.amber });
    chatWin(ctx, 460, 260, 1000, [['cirrus (undercover agent)', 'hey, you around?', T('R037', 'chatting') - .2, 0], ['Dread Pirate Roberts', 'hey', T('R037', 'boss.'), 1]], t, { title: 'SILK ROAD · STAFF CHAT', h: 460 });
    if (t > T('R037', 'undercover')) pill(ctx, 'UNDERCOVER AGENT', 460, 820, { bg: SR.blood, size: 44 }); if (t > T('R037', 'staff')) pill(ctx, 'HIJACKED STAFF ACCOUNT', 900, 820, { bg: '#2A3142', size: 44 });
  }, { name: 'chat' });
  cue(T('R037', 'boss.'), 'ding', .5);
  shot(['R038', 'Ross'], (ctx, t, lt) => {
    const st = T('R038', 'next');
    if (t < st) { camPhoto(ctx, IMG.cafe ? 'cafe' : 'glenpark', lt, { grade: 'warm', z0: 1.08 }); shade(ctx, .4); if (t > T('R038', 'crowded.')) stamp(ctx, 'TOO CROWDED', W / 2, 540, t, T('R038', 'crowded.'), { size: 140 }); sourceTag(ctx, credit(IMG.cafe ? 'cafe' : 'glenpark')); }
    else { camPhoto(ctx, 'glenpark', t - st, { grade: 'color', z0: 1.04 }); shade(ctx, .3); lowerTag(ctx, 'GLEN PARK LIBRARY', 'SAN FRANCISCO', t, st + .2); sourceTag(ctx, credit('glenpark')); }
  }, { name: 'cafe-library' });
  cue(T('R038', 'crowded.'), 'stamp');
  shot(['R039', 'He'], (ctx, t, lt) => {
    libraryScene(ctx, t, lt, { screen: t > T('R039', 'logs') ? 'LOGIN OK' : 'login:' });
    if (t > T('R039', 'science')) penArrow(ctx, 1500, 220, 1300, 100, prog(t, T('R039', 'science'), T('R039', 'science') + .4), { color: SR.amber });
    if (t > T('R039', 'science')) text(ctx, 'OF ALL PLACES', 1560, 260, { font: F.hand, size: 60, color: SR.amber, weight: 700 });
  }, { name: 'scifi-login' });
  cue(T('R039', 'logs'), 'key', .5);
  shot(['R040', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#0A0F18', '#000', 'r');
    chatWin(ctx, 120, 200, 900, [['cirrus', 'can you check a flagged message?', T('R040', 'check') - .1, 0], ['Dread Pirate Roberts', 'sure. let me log in', T('R040', 'opens'), 1]], t, { title: 'SILK ROAD · STAFF CHAT', h: 420 });
    laptop(ctx, 1460, 900, .85, { glow: true }, srScreen('ADMIN PANEL · OPEN', SR.green));
    if (t > T('R040', 'opens')) pill(ctx, 'ADMIN PAGE: OPEN', 1460, 980, { align: 'center', bg: SR.green, color: '#062010', size: 40 });
  }, { name: 'admin' });
  shot(['R041', 'Behind'], (ctx, t, lt) => {
    libraryScene(ctx, t, lt); const a = T('R041', 'fight.'); personIcon(ctx, 480, 760, 3.6, '#3B2A2A'); personIcon(ctx, 640, 760, 3.4, '#2A2F3B');
    if (t > T('R041', 'act:')) { const sh = (hash(Math.floor(t * 20)) - .5) * 12; popIn(ctx, t, T('R041', 'act:'), 440 + sh, 360, c => pill(c, '#@!!', 0, 0, { align: 'center', bg: SR.blood, size: 60 })); popIn(ctx, t, T('R041', 'loud'), 690 - sh, 320, c => pill(c, 'HOW COULD YOU?!', 0, 0, { align: 'center', bg: '#fff', color: '#111', size: 44 })); }
    if (t > T('R041', 'FBI')) text(ctx, '(BOTH FBI AGENTS)', 560, 1010, { font: F.hand, size: 56, color: SR.amber, align: 'center', weight: 700 });
    if (t > T('R041', 'turns')) { penArrow(ctx, 900, 560, 720, 560, prog(t, T('R041', 'turns'), T('R041', 'turns') + .3), { color: '#fff' }); }
  }, { name: 'lovers-fight' });
  cue(T('R041', 'act:'), 'hit', .5);
  shot(['R042', 'In'], (ctx, t, lt) => {
    libraryScene(ctx, t, lt); const st = T('R042', 'slides'); const p = E.inOut(prog(t, st, st + .7));
    laptop(ctx, 960 + 700 * p, 800 - 120 * p, .55 + .5 * p, { glow: true }, srScreen('LOGGED IN: DREAD PIRATE ROBERTS'));
    if (t > T('R042', 'Screen')) pill(ctx, 'SCREEN: ON', 1300, 220, { bg: SR.green, color: '#062010', size: 44 }); if (t > T('R042', 'Logged')) pill(ctx, 'LOGGED IN', 1300, 320, { bg: SR.green, color: '#062010', size: 44 });
    if (t > T('R042', 'Game')) stamp(ctx, 'GAME OVER', 560, 300, t, T('R042', 'Game'), { size: 150 });
  }, { name: 'grab' });
  cue(T('R042', 'slides'), 'whoosh', .8); cue(T('R042', 'Game'), 'stamp');
  shot(['R043', 'Lesson'], (ctx, t, lt) => {
    bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9); text(ctx, 'LESSON OF THE DAY', W / 2, 330, { font: F.osw, size: 60, color: '#111', align: 'center', weight: 700, ls: 12 });
    punch(ctx, 'ALWAYS LOCK YOUR LAPTOP.', W / 2, 600, t, T('R043', 'always'), { font: F.bebas, size: 170, color: '#111' });
    popIn(ctx, t, T('R043', 'laptop.'), W / 2, 820, c => { c.fillStyle = '#111'; c.beginPath(); c.roundRect(-60, -10, 120, 100, 12); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 20; c.beginPath(); c.arc(0, -10, 44, Math.PI, 0); c.stroke(); });
  }, { name: 'lock-laptop' });
  cue(T('R043', 'laptop.'), 'ding', .7);
  shot(['R044', 'On'], (ctx, t, lt) => {
    camPhoto(ctx, 'laptop_real', lt, { grade: 'color', z0: 1.05, fx: .45 }); shade(ctx, .55); pill(ctx, 'HIS ACTUAL LAPTOP · FBI EVIDENCE', 140, 140, { bg: SR.blood, size: 36 }); sourceTag(ctx, credit('laptop_real'));
    const items = [['CHAT LOGS', 'Chat'], ['PROFIT SPREADSHEETS', 'Spreadsheets'], ['A PERSONAL DIARY', 'diary']]; items.forEach(([s, w], i) => { if (t > T('R044', w)) popIn(ctx, t, T('R044', w), 380 + i * 580, 420, c => { c.fillStyle = ['#2B5DD9', '#1F7A45', '#8C5A2B'][i]; c.beginPath(); c.roundRect(-230, -150, 460, 300, 24); c.fill(); text(c, s, 0, 20, { font: F.bebas, size: 64, color: '#fff', align: 'center' }); }); });
    if (t > T('R044', 'describing')) diaryPage(ctx, W / 2, 820, ['2010: began working on', 'a project... Silk Road'], t, T('R044', 'describing'), { rot: .01 });
  }, { name: 'evidence' });
  cue(T('R044', 'Chat'), 'shutter', .5); cue(T('R044', 'Spreadsheets'), 'shutter', .5); cue(T('R044', 'diary'), 'shutter', .5);
  shot(['R045', 'He'], (ctx, t, lt) => {
    bgGrad(ctx, '#2A1C14', '#0C0806'); diaryPage(ctx, W / 2, 470, ['Dear diary,', 'today I committed', 'several crimes.'], t, T('R045', 'He'), { rot: -.02 });
    if (t > T('R045', 'evidence.')) stamp(ctx, 'EXHIBIT A', 1450, 880, t, T('R045', 'evidence.'), { size: 120 });
    text(ctx, '(DRAMATIZED)', 300, 1000, { font: F.mono, size: 30, color: 'rgba(255,255,255,.5)' });
  }, { name: 'diary-joke' });
  cue(T('R045', 'evidence.'), 'stamp');
  shot(['R046', 'Agents'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A1000', '#000', 'r'); coinRain(ctx, t, T('R046', '144,000'), 50, { r: 40 }); shade(ctx, .2);
    if (t > T('R046', '144,000')) { counter(ctx, Math.floor(lerp(0, 144336, E.out(prog(t, T('R046', '144,000'), T('R046', '144,000') + 1)))), W / 2, 400, { size: 200, color: SR.btc, align: 'center' }); text(ctx, 'BITCOINS SEIZED', W / 2, 480, { font: F.osw, size: 44, color: '#fff', align: 'center', weight: 600, ls: 8 }); }
    if (t > T('R046', '28')) { pill(ctx, '2013: ~$28 MILLION', W / 2 - 330, 700, { align: 'center', bg: '#333', size: 56 }); }
    if (t > T('R046', 'billions.')) { popIn(ctx, t, T('R046', 'billions.'), W / 2 + 330, 700, c => pill(c, 'TODAY: BILLIONS', 0, 0, { align: 'center', bg: SR.btc, color: '#111', size: 56 })); }
  }, { name: 'seized' });
  cue(T('R046', '144,000'), 'cash', .8); cue(T('R046', 'billions.'), 'hit', .7);
  shot(['R046B', 'And'], (ctx, t, lt) => {
    if (IMG.seized) { camPhoto(ctx, 'seized', lt, { grade: 'color', z0: 1.02 }); shade(ctx, .35); sourceTag(ctx, credit('seized', 'Silk Road seizure notice, 2013')); } else bgGrad(ctx, '#0A1022', '#000', 'r');
    if (t > T('R046B', '2.0.')) { if (IMG.seized2) { camPhoto(ctx, 'seized2', t - T('R046B', '2.0.'), { grade: 'color', z0: 1.02, blur: 3 }); shade(ctx, .75); } glitch(ctx, t, .5); glowText(ctx, 'SILK ROAD 2.0', W / 2, 520, { font: F.play, size: 140, color: '#fff', align: 'center', weight: 700, glow: 'rgba(138,92,246,.9)' }); }
    if (t > T('R046B', 'Shut')) stamp(ctx, 'SHUT DOWN · 2014', W / 2, 760, t, T('R046B', 'Shut'), { size: 110 });
    if (t > T('R046B', 'copying.')) text(ctx, 'CTRL + C, CTRL + V', W / 2, 960, { font: F.mono, size: 70, color: SR.amber, align: 'center', weight: 700 });
  }, { name: 'sr2' });
  cue(T('R046B', 'Shut'), 'stamp');

  // ======== CH6 TRIAL + TWISTS
  shot(['R047', 'In'], (ctx, t, lt) => {
    camPhoto(ctx, 'courthouse', lt, { grade: 'bw', tint: 'navy', tintAmt: .3 }); shade(ctx, .5); chapter(ctx, t, T('R047', 'In'), 6, 'THE VERDICT', '#D9DEE6');
    timeStamp(ctx, 'FEB 2015 · NEW YORK', 140, 900, t, T('R047', 'February'), { size: 70 });
    if (t > T('R047', 'guilty')) stamp(ctx, 'GUILTY × 7', 1400, 520, t, T('R047', 'guilty'), { size: 160 });
    sourceTag(ctx, credit('courthouse', 'Manhattan federal court'));
  }, { name: 'verdict' });
  cue(T('R047', 'guilty'), 'impact', .9);
  shot(['R048', 'In'], (ctx, t, lt) => {
    bgGrad(ctx, '#151515', '#000', 'r'); gavel(ctx, 1500, 700, 1.2, t, T('R048', 'sentences'));
    [['LIFE', 'two'], ['LIFE', 'life'], ['+ 40 YEARS', 'forty'], ['NO PAROLE', 'parole.']].forEach(([s, w], i) => { if (t > T('R048', w) + (i === 1 ? .2 : 0)) punch(ctx, s, 600, 260 + i * 200, t, T('R048', w) + (i === 1 ? .2 : 0), { font: F.bebas, size: 160, color: i === 3 ? SR.blood : '#fff' }); });
    bars(ctx, prog(t, T('R048', 'parole.'), T('R048', 'parole.') + .6));
  }, { name: 'sentence' });
  cue(T('R048', 'sentences'), 'thud', .9); cue(T('R048', 'parole.'), 'thud', .8);
  shot(['R049', 'But'], (ctx, t, lt) => {
    bgGrad(ctx, '#200A0A', '#000', 'r'); glitch(ctx, t, .2);
    if (t > T('R049', 'twist.')) text(ctx, 'PLOT TWIST', W / 2, 300, { font: F.bebas, size: 180, color: SR.blood, align: 'center' });
    if (t > T('R049', 'agents')) { personIcon(ctx, 760, 900, 5, '#2A2F3B'); personIcon(ctx, 1160, 900, 5, '#2A2F3B'); pill(ctx, 'FEDERAL AGENT', 760, 500, { align: 'center', bg: '#1E3A7A', size: 34 }); pill(ctx, 'FEDERAL AGENT', 1160, 500, { align: 'center', bg: '#1E3A7A', size: 34 }); }
    if (t > T('R049', 'stealing')) { coinRain(ctx, t, T('R049', 'stealing'), 20, { r: 34 }); stamp(ctx, 'STEALING BITCOIN', W / 2, 1000, t, T('R049', 'themselves.'), { size: 90 }); }
  }, { name: 'twist' });
  cue(T('R049', 'twist.'), 'impact', .8);
  shot(['R050', 'A'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E0E14', '#000', 'r');
    const cards = [['DEA AGENT', 'TOOK BITCOIN FROM ROSS', 'DEA'], ['SECRET SERVICE AGENT', 'STOLE $800K+ IN BITCOIN', 'Secret']];
    cards.forEach(([a, b, w], i) => { const st = T('R050', w); if (t < st) return; const x = 520 + i * 880; popIn(ctx, t, st, x, 500, c => { c.fillStyle = '#1A1F2B'; c.beginPath(); c.roundRect(-380, -300, 760, 600, 30); c.fill();
      personIcon(c, 0, 80, 3.4, '#3A4458'); text(c, a, 0, 170, { font: F.bebas, size: 72, color: '#fff', align: 'center' }); text(c, b, 0, 250, { font: F.osw, size: 36, color: SR.btc, align: 'center', weight: 600 }); }); });
    if (t > T('R050', '800,000')) moneyCount(ctx, t, T('R050', '800,000'), 0, 820000, 1400, 960, { size: 90 });
  }, { name: 'bad-agents' });
  cue(T('R050', 'DEA'), 'shutter', .5); cue(T('R050', 'Secret'), 'shutter', .5);
  shot(['R051', 'Both'], (ctx, t, lt) => {
    bgGrad(ctx, '#151515', '#000', 'r'); personIcon(ctx, 760, 900, 5, '#2A2F3B'); personIcon(ctx, 1160, 900, 5, '#2A2F3B'); bars(ctx, prog(t, T('R051', 'prison.'), T('R051', 'prison.') + .5));
    if (t > T('R051', 'investigators')) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(0, 380, W, 260); ctx.restore(); wipeText(ctx, 'THE INVESTIGATORS NEEDED INVESTIGATING.', W / 2, 540, prog(t, T('R051', 'investigators'), T('R051', 'investigators') + .6), { size: 110, color: SR.amber, align: 'center' }); }
  }, { name: 'investigating' });
  cue(T('R051', 'prison.'), 'thud', .8);
  shot(['R052', 'And'], (ctx, t, lt) => {
    const st = T('R052', 'Agents');
    if (t < st) { bgGrad(ctx, '#0E1522', '#000', 'r'); counter(ctx, Math.floor(lerp(0, 50000, E.out(prog(t, T('R052', '50,000'), T('R052', '50,000') + .8)))), W / 2, 520, { size: 220, color: SR.btc, align: 'center' }); text(ctx, 'BITCOINS TRICKED OUT OF SILK ROAD', W / 2, 620, { font: F.osw, size: 44, color: '#fff', align: 'center', weight: 600, ls: 6 });
      if (t > T('R052', 'hid')) { const y = Math.floor(lerp(2012, 2021, prog(t, T('R052', 'hid'), st))); text(ctx, String(y), W / 2, 880, { font: F.mono, size: 120, color: SR.amber, align: 'center', weight: 700 }); } }
    else { camPhoto(ctx, IMG.gainesville ? 'gainesville' : 'sfhouses', t - st, { grade: 'color', tint: 'navy', tintAmt: .4, blur: 2 }); shade(ctx, .55); popcornTin(ctx, W / 2, 900, 1.2, t, prog(t, T('R052', 'tiny'), T('R052', 'tiny') + .8));
      timeStamp(ctx, 'NOV 2021 · RAID', 140, 160, t, st, { size: 70 }); if (t > T('R052', 'closet.')) pill(ctx, 'BATHROOM CLOSET', 1500, 300, { align: 'center', bg: '#fff', color: '#111', size: 44 }); }
  }, { name: 'popcorn' });
  cue(T('R052', 'tiny'), 'paper', .7);
  shot(['R053', 'Worth'], (ctx, t, lt) => {
    bgGrad(ctx, '#2A0A0A', '#000', 'r'); coinRain(ctx, t, T('R053', 'Worth'), 40); popcornTin(ctx, W / 2, 1060, .75, t, .25);
    if (t > T('R053', '3')) glowText(ctx, '$' + lerp(0, 3.36, E.out(prog(t, T('R053', '3'), T('R053', '3') + 1))).toFixed(2) + ' BILLION', W / 2, 300, { font: F.bebas, size: 180, color: C.gold, align: 'center', glow: 'rgba(255,190,60,.6)', blur: 30 });
    if (t > T('R053', 'expensive')) text(ctx, 'THE MOST EXPENSIVE POPCORN IN HISTORY', W / 2, 460, { font: F.bebas, size: 90, color: '#fff', align: 'center', shadow: 20 });
  }, { name: 'popcorn-price' });
  cue(T('R053', '3'), 'cash', .9);

  // ======== CH7 FREEDOM
  shot(['R054', 'Ross'], (ctx, t, lt) => {
    camPhoto(ctx, 'prison', lt, { grade: 'bw', z0: 1.06 }); shade(ctx, .5); chapter(ctx, t, T('R054', 'Ross'), 7, 'THE PARDON', SR.amber);
    if (t > T('R054', 'eleven')) { text(ctx, String(Math.floor(lerp(2013, 2024, prog(t, T('R054', 'eleven'), T('R054', 'eleven') + 1.2)))), W / 2, 520, { font: F.bebas, size: 200, color: '#fff', align: 'center' }); text(ctx, '11+ YEARS BEHIND BARS', W / 2, 610, { font: F.osw, size: 44, color: SR.amber, align: 'center', weight: 600, ls: 8 }); }
    if (t > T('R054', 'Supporters')) pill(ctx, 'FREE ROSS', 520, 860, { align: 'center', bg: SR.amber, color: '#111', size: 60 }); if (t > T('R054', 'Critics')) pill(ctx, 'SENTENCE FITS THE CRIME', 1400, 860, { align: 'center', bg: '#333', size: 50 });
    sourceTag(ctx, credit('prison', 'Illustrative'));
  }, { name: 'years' });
  shot(['R055', 'Then,'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A1408', '#000', 'r'); lightLeak(ctx, t, .25, 3); if (IMG.pardon_doc_p1) { ctx.save(); ctx.translate(1380, 560); ctx.rotate(.02); const im = IMG.pardon_doc_p1, w = 760, h = w * im.height / im.width; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40;
      ctx.beginPath(); ctx.rect(-w / 2, -440, w, 900); ctx.clip(); ctx.drawImage(im, -w / 2, -440 - (h * .02) - lt * 30, w, h); ctx.restore(); }
    timeStamp(ctx, 'JANUARY 21, 2025', 140, 180, t, T('R055', 'January'), { size: 80 });
    if (t > T('R055', 'pardon.')) { highlighter(ctx, 1020, 220, 720, 60, prog(t, T('R055', 'pardon.'), T('R055', 'pardon.') + .5)); pill(ctx, 'FULL AND UNCONDITIONAL PARDON', 140, 400, { bg: SR.amber, color: '#111', size: 44 }); }
    if (t > T('R055', 'free')) stamp(ctx, 'FREE MAN', 560, 860, t, T('R055', 'free'), { size: 130, color: SR.green });
    sourceTag(ctx, credit('pardon_doc', 'Executive grant of clemency, 21 Jan 2025'));
  }, { name: 'pardon' });
  cue(T('R055', 'pardon.'), 'stamp', .7); cue(T('R055', 'free'), 'hit', .7);
  shot(['R056', 'Months'], (ctx, t, lt) => {
    camPhoto(ctx, 'ross_stage', lt, { grade: 'color', z0: 1.06 }); shade(ctx, .2); lightLeak(ctx, t, .3, 7);
    text(ctx, 'BITCOIN CONFERENCE · 2025', 140, 200, { font: F.osw, size: 56, color: '#fff', weight: 600, ls: 8, shadow: 20 });
    if (t > T('R056', 'cheering')) { for (let i = 0; i < 30; i++) { const x = hash(i) * W, y = 900 + hash(i * 3) * 160 - Math.abs(Math.sin(t * 6 + i)) * 40; personIcon(ctx, x, y, 1.6, '#0A0A10'); } }
    sourceTag(ctx, credit('ross_stage', 'Bitcoin 2025, Las Vegas'));
  }, { name: 'conference' });
  shot(['R057', 'So'], (ctx, t, lt) => {
    if (IMG.ross) { photo(ctx, 'ross', { x: W * .3, y: 0, w: W * .4, h: H, zoom: 1.05 + lt * .01, grade: 'color' }); } else { bgGrad(ctx, '#151A26', '#000', 'r'); personIcon(ctx, W / 2, 900, 6, '#2A2F3B'); }
    ctx.fillStyle = 'rgba(232,180,80,.12)'; ctx.fillRect(0, 0, W * .3, H); ctx.fillStyle = 'rgba(200,50,40,.12)'; ctx.fillRect(W * .7, 0, W * .3, H);
    if (t > T('R057', 'freedom')) text(ctx, 'FREEDOM FIGHTER?', W * .15, 540, { font: F.bebas, size: 90, color: SR.amber, align: 'center' });
    if (t > T('R057', 'kingpin?')) text(ctx, 'KINGPIN?', W * .85, 540, { font: F.bebas, size: 110, color: SR.blood, align: 'center' });
    if (t > T('R057', 'argue')) text(ctx, 'PEOPLE STILL ARGUE', W / 2, 1010, { font: F.osw, size: 44, color: '#fff', align: 'center', weight: 600, ls: 8, shadow: 20 });
    if (IMG.ross) sourceTag(ctx, credit('ross'));
  }, { name: 'who' });
  shot(['R058', 'But'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0A1022', 'rgba(255,255,255,.05)', 80, 4); text(ctx, 'CAUGHT BY:', W / 2, 220, { font: F.osw, size: 60, color: '#fff', align: 'center', weight: 600, ls: 12 });
    const items = [['A GOOGLE SEARCH', 'Google', '#2B5DD9'], ['A BOX OF FAKE IDS', 'box', '#C89A5E'], ['A FAKE ARGUMENT', 'argument', SR.blood]];
    items.forEach(([s, w, c], i) => { const st = T('R058', w); if (t < st) return; popIn(ctx, t, st, 360 + i * 600, 560, cc => { cc.fillStyle = c; cc.beginPath(); cc.roundRect(-260, -170, 520, 340, 30); cc.fill(); text(cc, s, 0, 20, { font: F.bebas, size: 70, color: '#fff', align: 'center' }); }); });
    if (t > T('R058', 'library.')) text(ctx, 'IN A LIBRARY.', W / 2, 920, { font: F.bebas, size: 110, color: SR.amber, align: 'center' });
  }, { name: 'caught-by' });
  cue(T('R058', 'Google'), 'ding', .5); cue(T('R058', 'box'), 'ding', .5); cue(T('R058', 'argument'), 'ding', .5);
  shot(['R059', 'This'], (ctx, t, lt) => {
    bgGrad(ctx, '#120A24', '#000', 'r'); fog(ctx, t, .3, '140,90,255'); const t0 = T('R059', 'This');
    glowText(ctx, 'UNFILED FILMS', W / 2, 300, { font: F.play, size: 96, color: SR.paper, align: 'center', weight: 700, glow: 'rgba(255,255,255,.3)', alpha: prog(t, t0, t0 + .4) });
    if (t > T('R059', 'pardoned?')) text(ctx, 'SHOULD HE HAVE BEEN PARDONED?', W / 2, 560, { font: F.bebas, size: 120, color: '#fff', align: 'center' });
    if (t > T('R059', 'comments,')) pill(ctx, 'TELL US IN THE COMMENTS', W / 2, 740, { align: 'center', bg: '#fff', color: '#111', size: 44 });
    if (t > T('R059', 'subscribe')) { const p = Math.max(0, E.back(prog(t, T('R059', 'subscribe'), T('R059', 'subscribe') + .35))); ctx.save(); ctx.translate(W / 2, 900); ctx.scale(p, p);
      ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-260, -62, 520, 124, 62); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 26, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .8);
  }, { name: 'cta' });
  cue(T('R059', 'subscribe'), 'ding', .7);
}
