// Harshad Mehta: Big Bull ka sach — Eduanimhub (Hindi/Hinglish, 16:9)
'use strict';
const EP = { brand: 'EDUANIMHUB', images: {}, credit: {},  scenes };
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
// ---------------------------------------------------------------- Harshad kit (Eduanimhub): drawn props, rupee money, charts
const HM = { blood: '#E8402F', gold: '#FFC34D', green: '#3DDC84', ink: '#14110D', paper: '#F3E9D2', brown: '#9C6B3C', note: '#C9A06A' };
function rupee(ctx, x, y, s, col = HM.gold, lw) { // drawn rupee sign, (x,y) = top-left, s = height
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = lw || s * .11; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const w = s * .62;
  ctx.beginPath(); ctx.moveTo(0, s * .05); ctx.lineTo(w, s * .05); ctx.moveTo(0, s * .3); ctx.lineTo(w, s * .3);
  ctx.moveTo(0, s * .05); ctx.bezierCurveTo(w * .95, s * .02, w * .95, s * .56, 0, s * .54); ctx.lineTo(w * .8, s * .98); ctx.stroke(); ctx.restore(); return w;
}
function rsText(ctx, s, x, y, o = {}) { // rupee sign + text, centred on x
  const size = o.size || 160; ctx.save(); ctx.font = `${o.weight || ''} ${size}px ${o.font || F.bebas}`.trim(); if (o.ls) ctx.letterSpacing = o.ls + 'px';
  const tw = ctx.measureText(s).width; ctx.restore(); const rw = size * .5, gap = size * .12, total = rw + gap + tw;
  const x0 = o.align === 'left' ? x : x - total / 2; ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; }
  rupee(ctx, x0, y - size * .78, size * .8, o.color || HM.gold, size * .085);
  text(ctx, s, x0 + rw + gap, y, { font: o.font || F.bebas, size, color: o.color || HM.gold, weight: o.weight, ls: o.ls, shadow: o.shadow, alpha: o.alpha }); ctx.restore();
}
function rsCount(ctx, t, t0, v0, v1, x, y, o = {}) { if (t < t0) return; const p = E.out(prog(t, t0, t0 + (o.dur || 1.1)));
  rsText(ctx, Math.round(lerp(v0, v1, p)).toLocaleString('en-IN') + (o.suffix || ' CRORE'), x, y, { size: o.size || 170, color: o.color || HM.gold, glow: 'rgba(255,190,60,.55)' }); }
function noteINR(ctx, x, y, s, rot = 0, o = {}) { // generic illustrated banknote (not a replica)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); const w = 300, h = 140;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 14; ctx.fillStyle = o.col || HM.note; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(80,50,20,.55)'; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.ellipse(w * .22, 0, 34, 44, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,20,.25)'; ctx.lineWidth = 1.5; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-w * .18, 0, 12 + i * 7, 0, 7); ctx.stroke(); }
  rupee(ctx, -w / 2 + 22, -h / 2 + 18, 38, 'rgba(70,40,15,.85)', 4);
  text(ctx, o.d || '500', w / 2 - 20, -h / 2 + 50, { font: F.bebas, size: 48, color: 'rgba(70,40,15,.85)', align: 'right' });
  text(ctx, o.d || '500', -w / 2 + 22, h / 2 - 18, { font: F.bebas, size: 36, color: 'rgba(70,40,15,.6)' }); ctx.restore();
}
function noteRain(ctx, t, t0, n = 40, o = {}) { if (t < t0) return; const r = rng(o.seed || 7);
  for (let i = 0; i < n; i++) { const sx = r() * W, sp = 260 + r() * 360, ph = r() * 3, sz = (VERT ? .7 : .55) + r() * .35, y = -150 + ((t - t0 + ph) * sp) % (H + 300);
    noteINR(ctx, sx + Math.sin(t * 2 + i) * 40, y, sz, Math.sin(t * 1.6 + i * 2) * .7, { col: i % 3 ? HM.note : '#B7C08E' }); } }
function noteStack(ctx, x, y, s, n = 6, p = 1) { for (let i = 0; i < Math.round(n * clamp(p)); i++) noteINR(ctx, x + Math.sin(i * 2.1) * 6, y - i * 16 * s, s, Math.sin(i * 1.3) * .05); }
function brReceipt(ctx, x, y, s, t, o = {}) { // drawn "Bank Receipt" form
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -.03); ctx.scale(s, s); const w = 620, h = 400;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = HM.paper; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
  ctx.drawImage(paperTex(HM.paper, 33, w, h), -w / 2, -h / 2); ctx.strokeStyle = 'rgba(60,40,20,.5)'; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
  text(ctx, o.bank || 'XYZ BANK LTD.', 0, -h / 2 + 70, { font: F.play, size: 34, color: HM.ink, align: 'center', weight: 700 });
  text(ctx, 'BANK RECEIPT  (BR)', 0, -h / 2 + 112, { font: F.osw, size: 28, color: HM.blood, align: 'center', weight: 600, ls: 5 });
  const rows = [['NO.', o.no || '0417'], ['SECURITIES', o.sec || 'GOVT. STOCK 11.5%'], ['VALUE', o.val || 'RS 50 CRORE'], ['DATE', o.date || '15 / 03 / 1992']];
  rows.forEach(([a, b], i) => { const yy = -h / 2 + 170 + i * 50; text(ctx, a, -w / 2 + 50, yy, { font: F.mono, size: 24, color: 'rgba(20,17,13,.7)' });
    ctx.strokeStyle = 'rgba(20,17,13,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-w / 2 + 220, yy + 6); ctx.lineTo(w / 2 - 50, yy + 6); ctx.stroke();
    text(ctx, b, -w / 2 + 230, yy, { font: F.hand, size: 36, color: '#1B2A6B', weight: 700 }); });
  if (o.empty) { const p = clamp(o.empty); ctx.globalAlpha = p; stamp(ctx, 'KHAALI', 140, 40, 1, 0, { size: 90, color: HM.blood, rot: -.18 }); }
  text(ctx, 'ILLUSTRATION', w / 2 - 30, h / 2 - 24, { font: F.mono, size: 16, color: 'rgba(20,17,13,.45)', align: 'right' });
  ctx.restore();
}
function lineChart(ctx, x, y, w, h, pts, p, o = {}) { // pts: [[u 0..1, v 0..1], ...]
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + h * i / 4); ctx.lineTo(x + w, y + h * i / 4); ctx.stroke(); }
  const n = pts.length, k = clamp(p) * (n - 1); const P = (u, v) => [x + u * w, y + h - v * h];
  ctx.strokeStyle = o.color || HM.green; ctx.lineWidth = o.lw || 8; ctx.lineJoin = 'round'; ctx.shadowColor = o.color || HM.green; ctx.shadowBlur = 24; ctx.beginPath();
  let last = P(...pts[0]); ctx.moveTo(...last);
  for (let i = 1; i <= Math.ceil(k) && i < n; i++) { const f = Math.min(1, k - (i - 1)); const a = pts[i - 1], b = pts[i]; last = P(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); ctx.lineTo(...last); }
  ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(last[0], last[1], 12, 0, 7); ctx.fill(); ctx.restore(); return last;
}
function suitcase(ctx, x, y, s, open = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40;
  ctx.fillStyle = o.col || '#2B2B30'; ctx.beginPath(); ctx.roundRect(-260, -150, 520, 300, 24); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#555'; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-150, -205, 300, 70, 26); ctx.stroke();
  ctx.fillStyle = '#C9A24A'; ctx.fillRect(-190, -150, 40, 30); ctx.fillRect(150, -150, 40, 30); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(-260, -10, 520, 8);
  if (open > 0) { ctx.save(); ctx.globalAlpha = clamp(open); for (let i = 0; i < 9; i++) noteINR(ctx, -170 + (i % 3) * 170, -80 + Math.floor(i / 3) * 70, .52, (i % 2 ? .04 : -.04)); ctx.restore(); }
  ctx.restore();
}
function tiffin(ctx, x, y, s, label, p = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 3; i++) { const yy = 60 - i * 120; ctx.fillStyle = '#D9DEE4'; ctx.strokeStyle = '#8D97A3'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(-150, yy - 50, 300, 105, 18); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-130, yy - 38, 260, 10); }
  ctx.strokeStyle = '#8D97A3'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-160, 90); ctx.lineTo(-170, -260); ctx.quadraticCurveTo(0, -360, 170, -260); ctx.lineTo(160, 90); ctx.stroke();
  if (label) { ctx.fillStyle = '#FFE45C'; ctx.save(); ctx.rotate(-.06); ctx.fillRect(-120, -95, 240, 70); text(ctx, label, 0, -45, { font: F.hand, size: 56, color: '#1A1A1A', align: 'center', weight: 700 }); ctx.restore(); }
  ctx.restore();
}
function sedan(ctx, x, y, s, t, o = {}) { // generic luxury sedan silhouette, no badge
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = o.col || '#E8E6E1';
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-420, 40); ctx.lineTo(-410, -30); ctx.quadraticCurveTo(-380, -60, -260, -70);
  ctx.lineTo(-170, -150); ctx.quadraticCurveTo(-100, -175, 60, -170); ctx.lineTo(200, -80); ctx.quadraticCurveTo(380, -70, 420, -20); ctx.lineTo(425, 40); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(30,45,70,.85)'; ctx.beginPath(); ctx.moveTo(-235, -72); ctx.lineTo(-160, -138); ctx.quadraticCurveTo(-100, -158, -40, -156); ctx.lineTo(-40, -72); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -72); ctx.lineTo(-20, -156); ctx.lineTo(50, -154); ctx.lineTo(170, -78); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-380, -10, 760, 5);
  [-250, 260].forEach(wx => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(wx, 40, 70, 0, 7); ctx.fill(); ctx.fillStyle = '#9AA0A8'; ctx.beginPath(); ctx.arc(wx, 40, 36, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(wx, 40); ctx.rotate(t * (o.spin || 0)); ctx.strokeStyle = '#555'; ctx.lineWidth = 6; for (let i = 0; i < 5; i++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 32); ctx.stroke(); } ctx.restore(); });
  ctx.fillStyle = '#FFE9A8'; ctx.beginPath(); ctx.ellipse(400, -15, 18, 10, 0, 0, 7); ctx.fill(); ctx.restore();
}
function newspaper(ctx, x, y, s, head, sub, t, t0, o = {}) { // generic newspaper page, no real masthead
  const p = E.out(prog(t, t0, t0 + .5)); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(o.spin ?? 6, o.rot ?? -.04, p)); ctx.scale(s * p, s * p);
  const w = 900, h = 1100; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.fillStyle = '#EDE6D6'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
  ctx.drawImage(paperTex('#EDE6D6', 9, w, h), -w / 2, -h / 2);
  text(ctx, o.mast || 'THE MORNING PAPER', 0, -h / 2 + 100, { font: F.play, size: 76, color: HM.ink, align: 'center', weight: 700 });
  ctx.fillStyle = HM.ink; ctx.fillRect(-w / 2 + 40, -h / 2 + 130, w - 80, 4); text(ctx, o.date || 'BOMBAY · 1992', 0, -h / 2 + 165, { font: F.mono, size: 24, color: HM.ink, align: 'center' });
  ctx.fillRect(-w / 2 + 40, -h / 2 + 180, w - 80, 2);
  head.split('\n').forEach((l, i) => text(ctx, l, 0, -h / 2 + 300 + i * 110, { font: F.bebas, size: 120, color: HM.ink, align: 'center' }));
  if (sub) text(ctx, sub, 0, -h / 2 + 330 + head.split('\n').length * 110, { font: F.playI, size: 40, color: '#3A332A', align: 'center' });
  ctx.fillStyle = 'rgba(20,17,13,.18)'; for (let c = 0; c < 3; c++) for (let i = 0; i < 16; i++) ctx.fillRect(-w / 2 + 50 + c * 275, -h / 2 + 560 + i * 30, 245 - (i % 5 === 4 ? 90 : 0), 12);
  text(ctx, 'ILLUSTRATION', w / 2 - 30, h / 2 - 24, { font: F.mono, size: 18, color: 'rgba(20,17,13,.45)', align: 'right' }); ctx.restore();
}
function ticker(ctx, y, t, items, o = {}) { // scrolling stock ticker band
  ctx.save(); ctx.fillStyle = o.bg || 'rgba(5,8,12,.88)'; ctx.fillRect(0, y - 44, W, 70); ctx.font = `48px ${F.bebas}`; ctx.letterSpacing = '2px';
  const seg = items.map(i => i[0] + '  ' + i[1]); const ws = seg.map(s => ctx.measureText(s).width + 120); const tot = ws.reduce((a, b) => a + b, 0);
  let x = -((t * (o.speed || 160)) % tot); for (let k = 0; k < 3; k++) seg.forEach((s, i) => { const up = items[i][2] !== false; ctx.fillStyle = up ? HM.green : HM.blood; ctx.fillText(s, x, y);
    const tx = x + ws[i] - 90; ctx.beginPath(); if (up) { ctx.moveTo(tx, y - 4); ctx.lineTo(tx + 16, y - 30); ctx.lineTo(tx + 32, y - 4); } else { ctx.moveTo(tx, y - 30); ctx.lineTo(tx + 16, y - 4); ctx.lineTo(tx + 32, y - 30); } ctx.fill(); x += ws[i]; });
  ctx.restore();
}
function necklace(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.shadowColor = 'rgba(255,200,80,.7)'; ctx.shadowBlur = 30;
  for (let i = 0; i <= 18; i++) { const a = Math.PI * .15 + Math.PI * .7 * i / 18; const px = Math.cos(a) * 220, py = Math.sin(a) * 160; ctx.fillStyle = i % 2 ? '#FFD45A' : '#E6A93A'; ctx.beginPath(); ctx.arc(px, py, i === 9 ? 34 : 16, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#C0392B'; ctx.beginPath(); ctx.arc(0, 160, 16, 0, 7); ctx.fill(); ctx.restore(); }
function candle(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#EFE6D2'; ctx.fillRect(-26, -10, 52, 170);
  const f = 1 + .08 * Math.sin(t * 13 + x) + .05 * Math.sin(t * 29); const g = ctx.createRadialGradient(0, -50, 0, 0, -50, 160); g.addColorStop(0, 'rgba(255,190,90,.45)'); g.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = g; ctx.fillRect(-160, -210, 320, 320); ctx.fillStyle = '#FFC861'; ctx.beginPath(); ctx.ellipse(0, -40 * f, 14, 34 * f, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.ellipse(0, -32, 6, 16, 0, 0, 7); ctx.fill(); ctx.restore(); }
function handcuffs(ctx, x, y, s, p = 1) { if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * lerp(1.4, 1, E.out(p)), s * lerp(1.4, 1, E.out(p))); ctx.globalAlpha = clamp(p * 3);
  ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 22; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 20; [-130, 130].forEach(cx => { ctx.beginPath(); ctx.arc(cx, 0, 90, 0, 7); ctx.stroke(); });
  ctx.lineWidth = 12; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-40 + i * 40, 0, 24, 14, 0, 0, 7); ctx.stroke(); } ctx.restore(); }
function bankIcon(ctx, x, y, s, label, col = '#DCE3EC', o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-170, -90); ctx.lineTo(0, -180); ctx.lineTo(170, -90); ctx.closePath(); ctx.fill(); ctx.fillRect(-170, -80, 340, 20);
  for (let i = 0; i < 5; i++) ctx.fillRect(-150 + i * 70, -55, 30, 130); ctx.fillRect(-180, 80, 360, 26); ctx.restore();
  if (label) text(ctx, label, x, y + 150 * s + 40, { font: F.osw, size: o.size || 34, color: o.lc || '#fff', align: 'center', weight: 600, ls: 3 }); }
function crowd(ctx, t, y, n = 14, o = {}) { for (let i = 0; i < n; i++) { const x = (i + .5) * W / n + Math.sin(i * 7) * 20, b = Math.abs(Math.sin(t * 6 + i * 1.7)) * 14;
  personIcon(ctx, x, y - b, o.s || (VERT ? 2.2 : 2.6), o.col || 'rgba(20,24,32,.95)'); if (o.shout && i % 3 === 0) { const sp = (t * 2 + i * .37) % 1; text(ctx, '!', x + 30, y - 220 - sp * 40, { font: F.bebas, size: 70, color: HM.gold, alpha: 1 - sp }); } } }
function screenGrid(ctx, x, y, w, h, t, o = {}) { // trading terminal
  ctx.save(); ctx.fillStyle = '#05140C'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(61,220,132,.35)'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  const rows = Math.floor(h / 56); const names = ['ACC', 'TISCO', 'RELIANCE', 'HINDALCO', 'BPL', 'VIDEOCON', 'APOLLO', 'STERLITE', 'GRASIM', 'HERO HONDA'];
  for (let i = 0; i < rows; i++) { const nm = names[i % names.length], v = (100 + hash(i + Math.floor(t * 2)) * 900).toFixed(2), up = hash(i * 3 + Math.floor(t * 2)) > .4;
    text(ctx, nm, x + 30, y + 52 + i * 56, { font: F.mono, size: 34, color: '#9FF5C4' }); text(ctx, v, x + w - 220, y + 52 + i * 56, { font: F.mono, size: 34, color: up ? HM.green : HM.blood, align: 'right' });
    text(ctx, up ? '+' + (hash(i) * 4).toFixed(1) + '%' : '-' + (hash(i + 9) * 4).toFixed(1) + '%', x + w - 30, y + 52 + i * 56, { font: F.mono, size: 30, color: up ? HM.green : HM.blood, align: 'right' }); }
  scanlines(ctx, .08); ctx.restore(); }
function flowArrow(ctx, a, b, p, col = HM.gold, label) { if (p <= 0) return; const q = E.inOut(clamp(p)), x = lerp(a[0], b[0], q), y = lerp(a[1], b[1], q);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -p * 200; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.fillStyle = col; ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-22, -20); ctx.lineTo(-22, 20); ctx.fill(); ctx.restore();
  if (label && p > .5) text(ctx, label, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 28, { font: F.osw, size: 34, color: col, align: 'center', weight: 600, ls: 3, alpha: prog(p, .5, .8) }); }
function phoneRing(ctx, x, y, s, t) { ctx.save(); ctx.translate(x + Math.sin(t * 60) * 4 * (Math.sin(t * 5) > 0 ? 1 : 0), y); ctx.scale(s, s); ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.roundRect(-180, -60, 360, 160, 30); ctx.fill();
  ctx.fillStyle = '#2A2A2A'; ctx.beginPath(); ctx.roundRect(-200, -120, 400, 70, 35); ctx.fill(); ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(0, 30, 52, 0, 7); ctx.fill();
  ctx.fillStyle = '#1A1A1A'; for (let i = 0; i < 10; i++) { const a = i * .55 - 1.3; ctx.beginPath(); ctx.arc(Math.cos(a) * 34, 30 + Math.sin(a) * 34, 8, 0, 7); ctx.fill(); } ctx.restore();
  if (Math.sin(t * 5) > 0) { [1, 2, 3].forEach(k => { ctx.save(); ctx.strokeStyle = 'rgba(255,195,77,' + (.9 - k * .25) + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 160 * s + k * 30, -2.4, -.8); ctx.stroke(); ctx.restore(); }); } }
function lockerSafe(ctx, x, y, s, open = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#3A4250'; ctx.beginPath(); ctx.roundRect(-200, -220, 400, 440, 24); ctx.fill();
  ctx.fillStyle = '#0B0E13'; ctx.fillRect(-170, -190, 340, 380); if (open < 1) { ctx.save(); ctx.scale(1 - open * .9, 1); ctx.fillStyle = '#596377'; ctx.fillRect(-170, -190, 340, 380); ctx.strokeStyle = '#2A303B'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(60, 0, 50, 0, 7); ctx.stroke(); ctx.restore(); } ctx.restore(); }
// ---------------------------------------------------------------- episode helpers
function yellowBG(ctx) { bgGrad(ctx, '#FFD84D', '#FFB01F'); halftone(ctx, .12, 9); }
function darkBG(ctx, t, a = '#0E1626', b = '#03050A', fogTint) { bgGrad(ctx, a, b, 'r'); if (fogTint) fog(ctx, t, .25, fogTint); }
function pBG(ctx, key, lt, o = {}) { camPhoto(ctx, key, lt, { z0: o.z0 ?? 1.04, zs: o.zs ?? .02, fx: o.fx, fy: o.fy, grade: o.grade || 'color', tint: o.tint, tintAmt: o.tintAmt, blur: o.blur });
  if (o.shade !== undefined) shade(ctx, o.shade); if (o.vign !== false) vign(ctx, .5); }
function cred(ctx, key, extra) { const c = credit(key, extra); if (c) sourceTag(ctx, c); }
function chapterCard(ctx, t, lt, t0, n, title, key, col = HM.gold) {
  if (key) pBG(ctx, key, lt, { grade: 'duo', tint: 'navy', tintAmt: .55, shade: .55 }); else darkBG(ctx, t);
  lightLeak(ctx, t, .35, n, 'warm'); const p = E.out(prog(t, t0, t0 + .5));
  text(ctx, 'CHAPTER ' + n, W / 2, H / 2 - 70, { font: F.osw, size: 46, color: col, align: 'center', weight: 600, ls: 14, alpha: p });
  ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = p; ctx.fillRect(W / 2 - 160 * p, H / 2 - 40, 320 * p, 5); ctx.restore();
  punch(ctx, title, W / 2, H / 2 + 60, t, t0 + .25, { font: F.bebas, size: 130, color: HM.paper || '#F6F0E4', from: 1.3 });
  if (key) cred(ctx, key);
}
function hmFigure(ctx, x, y, s, o = {}) { // illustrated silhouette (no real photo used)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = o.col || '#1B2230';
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 50; }
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -150, 70, 86, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-190, 160); ctx.quadraticCurveTo(-180, -40, -40, -55); ctx.lineTo(40, -55); ctx.quadraticCurveTo(180, -40, 190, 160); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = o.shirt || '#E9E4D8'; ctx.beginPath(); ctx.moveTo(-40, -55); ctx.lineTo(0, 30); ctx.lineTo(40, -55); ctx.closePath(); ctx.fill();
  ctx.fillStyle = o.tie || HM.blood; ctx.beginPath(); ctx.moveTo(-10, -45); ctx.lineTo(10, -45); ctx.lineTo(16, 40); ctx.lineTo(0, 60); ctx.lineTo(-16, 40); ctx.closePath(); ctx.fill();
  if (o.specs !== false) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 5; ctx.strokeRect(-52, -168, 42, 28); ctx.strokeRect(10, -168, 42, 28); ctx.beginPath(); ctx.moveTo(-10, -156); ctx.lineTo(10, -156); ctx.stroke(); }
  ctx.restore();
}
function figCard(ctx, x, y, w, h, name, p, o = {}) { // pinned silhouette card
  if (p <= 0) return; const sc = lerp(1.2, 1, E.out(clamp(p))); ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 3);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.fillStyle = '#E9E0CC'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
  ctx.fillStyle = '#2A3240'; ctx.fillRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 80); ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 80); ctx.clip();
  hmFigure(ctx, 0, -h / 2 + 14 + (h - 80) * .72, (w - 28) / 420, { col: '#465166', specs: o.specs ?? false, tie: o.tie || '#6A7385' }); ctx.restore();
  let fs = 34; ctx.font = `${fs}px ${F.bebas}`; while (ctx.measureText(name).width > w - 20 && fs > 18) { fs--; ctx.font = `${fs}px ${F.bebas}`; }
  text(ctx, name, 0, h / 2 - 24, { font: F.bebas, size: fs, color: HM.ink, align: 'center', ls: 2 });
  ctx.fillStyle = '#C0392B'; ctx.beginPath(); ctx.arc(0, -h / 2 + 6, 11, 0, 7); ctx.fill(); ctx.restore();
}
function files(ctx, x, y, n, p, o = {}) { for (let i = 0; i < Math.round(n * clamp(p)); i++) { ctx.save(); ctx.translate(x + Math.sin(i * 3.1) * 24, y - i * 22); ctx.rotate(Math.sin(i * 1.7) * .06);
  ctx.fillStyle = i % 2 ? '#C8A86A' : '#B8955A'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 10; ctx.fillRect(-170, -18, 340, 36); ctx.shadowBlur = 0;
  text(ctx, (o.label || 'CASE') + ' #' + (101 + i * 7), -150, 10, { font: F.mono, size: 20, color: 'rgba(40,25,10,.8)' }); ctx.restore(); } }
function pool(ctx, x, y, w, h, t) { ctx.save(); ctx.fillStyle = '#1E8FC9'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let k = 0; k <= 20; k++) { const xx = x + 20 + k * (w - 40) / 20, yy = y + 30 + i * (h - 60) / 5 + Math.sin(t * 2 + k * .7 + i) * 6; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.strokeStyle = '#EAF6FF'; ctx.lineWidth = 10; ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.stroke(); ctx.restore(); }
function golf(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#3FA34D'; ctx.beginPath(); ctx.ellipse(0, 40, 220, 60, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(40, 40, 16, 6, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ddd'; ctx.fillRect(36, -180, 6, 220);
  ctx.fillStyle = HM.blood; ctx.beginPath(); ctx.moveTo(42, -180); ctx.lineTo(42 + 90 + Math.sin(t * 4) * 8, -150); ctx.lineTo(42, -120); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-90, 30, 12, 0, 7); ctx.fill(); ctx.restore(); }
function board(ctx, t) { bgGrad(ctx, '#3A2A1C', '#1A120B', 'r'); ctx.save(); ctx.globalAlpha = .18; for (let i = 0; i < 400; i++) { ctx.fillStyle = i % 2 ? '#000' : '#6B5238'; ctx.fillRect(hash(i) * W, hash(i * 3) * H, 3, 3); } ctx.restore(); vign(ctx, .6); }
function plate(ctx, x, y, w, h, l1, l2, p, fs = 150) { if (p <= 0) return; ctx.save(); ctx.globalAlpha = clamp(p * 2); const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#E7C873'); g.addColorStop(.5, '#B8913F'); g.addColorStop(1, '#8A6A2A');
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h / 2, w, h); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(60,40,10,.6)'; ctx.lineWidth = 4; ctx.strokeRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28);
  wipeText(ctx, l1, x, y + (l2 ? 10 : fs * .35), prog(p, 0, .6), { size: fs, color: '#2A1C08', align: 'center' }); text(ctx, l2, x, y + 70, { font: F.osw, size: 30, color: '#3A2A10', align: 'center', weight: 600, ls: 6, alpha: prog(p, .5, 1) }); ctx.restore(); }
function capBand2(ctx) { if (EP.captions) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0, (EP.captionY || H * .72) - 100, W, 200); ctx.restore(); } }
