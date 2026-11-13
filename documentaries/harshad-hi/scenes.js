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

function scenes() {
  // ================= COLD OPEN
  shot(['H001', 'April'], (ctx, t, lt) => { pBG(ctx, 'sbi_mumbai', lt, { grade: 'night', tint: 'navy', tintAmt: .5, shade: .25 }); rain(ctx, t, .6);
    timeStamp(ctx, 'APRIL 1992', 120, 200, t, T('H001', 'April'), { size: 96 }); lowerTag(ctx, 'STATE BANK OF INDIA', 'Mumbai main branch', t, T('H001', 'State'));
    phoneRing(ctx, 1500, 640, .9, t); fadeIn(ctx, t, 0, .6); cred(ctx, 'sbi_mumbai'); }, { lead: .3, name: 'o-sbi' });
  cue(T('H001', 'April'), 'riser', .6); cue(T('H001', 'call'), 'ding', .5);
  shot(['H002', 'Sawaal'], (ctx, t, lt) => { darkBG(ctx, t, '#2A0A0A', '#000'); glitch(ctx, t, .25, 3);
    text(ctx, 'SAWAAL SIRF EK', W / 2, 260, { font: F.osw, size: 44, color: 'rgba(246,240,228,.75)', align: 'center', weight: 600, ls: 10 });
    rsCount(ctx, t, T('H002', '500'), 0, 500, W / 2, 560, { size: 210, dur: .8 }); punch(ctx, 'KAHAN HAIN?', W / 2, 800, t, T('H002', 'kahan'), { font: F.bebas, size: 170, color: HM.blood }); }, { name: 'o-500' });
  cue(T('H002', '500'), 'cash', .9); cue(T('H002', 'kahan'), 'hit', .8);
  shot(['H003', 'Aur'], (ctx, t, lt) => { pBG(ctx, 'bull_bse', lt, { grade: 'warm', shade: .35, fy: .45 }); lightLeak(ctx, t, .4, 2);
    punch(ctx, 'THE BIG BULL', W / 2, 860, t, T('H003', 'Big'), { font: F.bebas, size: 200, color: HM.gold, shadow: 30 }); cred(ctx, 'bull_bse'); }, { name: 'o-bull' });
  cue(T('H003', 'Big'), 'impact', .8);
  shot(['H004', 'Lexus'], (ctx, t, lt) => { darkBG(ctx, t); const ks = [['lexus', 'LEXUS', 'Lexus'], ['worli_sea', 'SEA-FACE PENTHOUSE', 'samundar'], ['dalal_sign', 'DALAL STREET', 'Dalal']];
    ks.forEach(([k, l, w], i) => { const st = T('H004', w), p = E.out(prog(t, st - .1, st + .35)); if (p <= 0) return; ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 80);
      frame(ctx, k, 110 + i * 590, 250, 520, 420, { rot: (i - 1) * .025, grade: 'warm', label: l, labelBg: i === 2 ? C.tred : '#222' }); ctx.restore(); });
    sourceTag(ctx, [credit('lexus'), credit('worli_sea'), credit('dalal_sign')].join(' | ')); }, { name: 'o-trip' });
  cue(T('H004', 'Lexus'), 'whoosh', .5); cue(T('H004', 'samundar'), 'whoosh', .5); cue(T('H004', 'Dalal'), 'whoosh', .5);
  shot(['H005', 'Uska'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1322', 'rgba(255,195,77,.07)', 54, 3); const bx = 260, by = 170, bw = 480, bh = 660;
    ctx.fillStyle = '#141C2A'; ctx.fillRect(bx, by, bw, bh); ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip(); hmFigure(ctx, bx + bw / 2, by + bh * .72, 1.1, { glow: 'rgba(255,195,77,.35)' }); ctx.restore();
    brackets(ctx, bx - 20, by - 20, bw + 40, bh + 40, prog(t, T('H005', 'Uska'), T('H005', 'Uska') + .3), HM.gold); scanBeam(ctx, bx, by, bw, bh, prog(t, T('H005', 'Uska'), T('H005', 'Uska') + 1.2), 'rgba(255,195,77,');
    kicker(ctx, 'FILE · 1954 – 2001', 860, 330, t, T('H005', 'Uska'), { color: HM.gold }); bigTitle(ctx, 'HARSHAD MEHTA', 860, 500, t, T('H005', 'Harshad'), { size: 170, bar: HM.gold });
    text(ctx, 'ILLUSTRATION', bx + bw - 12, by + bh - 14, { font: F.mono, size: 18, color: 'rgba(200,210,230,.5)', align: 'right' }); }, { name: 'o-name' });
  cue(T('H005', 'Harshad'), 'impact', .9);
  shot(['H006', 'Aur'], (ctx, t, lt) => { board(ctx, t); sticky(ctx, '500 CRORE', W / 2, 470, -.05, prog(t, T('H006', '500') - .1, T('H006', '500') + .3));
    penEllipse(ctx, W / 2, 470, 330, 200, prog(t, T('H006', 'yaad'), T('H006', 'yaad') + .6));
    if (t > T('H006', 'Kahani')) hand(ctx, 'Asli number isse kahin bada...', 470, 860, prog(t, T('H006', 'Kahani'), T('H006', 'badi') + .4), { color: HM.gold, size: 80 }); }, { name: 'o-loop' });
  cue(T('H006', '500'), 'paper', .7); cue(T('H006', 'yaad'), 'scribble', .6);
  // ================= CH 1
  shot(['H007', 'Chapter'], (ctx, t, lt) => chapterCard(ctx, t, lt, T('H007', 'Chapter'), 1, 'HOSIERY SE DALAL STREET TAK', 'bse_tall'), { lead: .4, name: 'c1' });
  cue(T('H007', 'Chapter') - .1, 'riser', .5); cue(T('H007', 'Hosiery'), 'impact', .6);
  shot(['H008', 'Harshad'], (ctx, t, lt) => { const pr = worldMap(ctx, t, { lon: 78, lat: 22, k: lerp(30, 40, clamp(lt / 5)) });
    pin(ctx, ...pr(70.8, 22.3), t, T('H008', 'Gujarat'), 'GUJARAT'); timeStamp(ctx, '29 JULY 1954', 120, 200, t, T('H008', '29'), { size: 90 }); sourceTag(ctx, 'Map: Natural Earth (public domain)'); }, { name: 'c1-map' });
  cue(T('H008', 'Gujarat'), 'ding', .5);
  shot(['H009', 'Bachpan'], (ctx, t, lt) => { const pr = worldMap(ctx, t, { lon: 78, lat: 21, k: 40 }); const m = pr(72.88, 19.08), r = pr(81.63, 21.25);
    pin(ctx, ...m, t, T('H009', 'Mumbai'), 'MUMBAI', { left: true }); pin(ctx, ...r, t, T('H009', 'Raipur'), 'RAIPUR'); route(ctx, m, r, prog(t, T('H009', 'Raipur') - .2, T('H009', 'Raipur') + .6), { color: HM.gold });
    sourceTag(ctx, 'Map: Natural Earth (public domain)'); }, { name: 'c1-map2' });
  shot(['H009', 'Ghar'], (ctx, t, lt) => { darkBG(ctx, t); const p1 = E.out(prog(t, T('H009', 'paisa'), T('H009', 'paisa') + .5)), p2 = E.out(prog(t, T('H009', 'sapne'), T('H009', 'sapne') + .9));
    text(ctx, 'PAISA', 360, 470, { font: F.bebas, size: 90, color: '#fff', align: 'right' }); ctx.fillStyle = HM.blood; ctx.fillRect(400, 410, 120 * p1, 70);
    text(ctx, 'SAPNE', 360, 670, { font: F.bebas, size: 90, color: '#fff', align: 'right' }); ctx.save(); ctx.shadowColor = HM.gold; ctx.shadowBlur = 30; ctx.fillStyle = HM.gold; ctx.fillRect(400, 610, 1350 * p2, 70); ctx.restore();
    if (p2 > .9) stars(ctx, t, 60, 4, .6); }, { name: 'c1-bars' });
  cue(T('H009', 'sapne'), 'riser', .4);
  shot(['H010', 'Graduation'], (ctx, t, lt) => { darkBG(ctx, t, '#1B140E', '#050302'); ctx.save(); ctx.translate(W / 2, H / 2 + 20); ctx.rotate(-.02); ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.fillRect(-520, -400, 1040, 800); ctx.shadowBlur = 0;
      ctx.drawImage(paperTex(PAL.cream, 5, 1040, 800), -520, -400); text(ctx, 'RESUME', 0, -300, { font: F.play, size: 70, color: HM.ink, align: 'center', weight: 700 }); text(ctx, 'H. S. MEHTA  ·  B.COM', 0, -245, { font: F.mono, size: 30, color: '#444', align: 'center' });
      [['HOSIERY SALESMAN', 'Hosiery'], ['CEMENT BECHA', 'cement'], ['DIAMOND SORTER', 'diamonds']].forEach(([s, w], i) => { const st = T('H010', w); if (t < st) return; typewriter(ctx, '- ' + s, -420, -120 + i * 120, t, st, 30, { size: 60 }); tick(ctx, 380, -140 + i * 120, 30, prog(t, st + .4, st + .8)); });
      text(ctx, 'ILLUSTRATION', 500, 380, { font: F.mono, size: 18, color: 'rgba(20,17,13,.45)', align: 'right' }); ctx.restore(); }, { name: 'c1-resume' });
  ['Hosiery', 'cement', 'diamonds'].forEach(w => cue(T('H010', w), 'key', .6));
  shot(['H011', 'Resume'], (ctx, t, lt) => { yellowBG(ctx); punch(ctx, 'YE AADMI', W / 2, 330, t, T('H011', 'aadmi'), { font: F.bebas, size: 150, color: '#111' });
    punch(ctx, 'KUCH BHI', W / 2, 520, t, T('H011', 'kuch'), { font: F.bebas, size: 210, color: HM.blood }); punch(ctx, 'BECH SAKTA HAI', W / 2, 720, t, T('H011', 'bech'), { font: F.bebas, size: 150, color: '#111' }); }, { name: 'c1-joke' });
  cue(T('H011', 'kuch'), 'stamp', .7); cue(T('H011', 'hai.'), 'ding', .6);
  shot(['H012', 'Aur'], (ctx, t, lt) => { pBG(ctx, 'worli_sky', lt, { grade: 'night', tint: 'navy', tintAmt: .6, shade: .3 }); stars(ctx, t, 90, 3, .7);
    if (t > T('H012', 'sapna')) glowText(ctx, 'EK SAPNA', W / 2, 600, { font: F.bebas, size: 220, color: HM.gold, align: 'center', glow: 'rgba(255,190,60,.8)', blur: 50, alpha: prog(t, T('H012', 'sapna'), T('H012', 'sapna') + .4) });
    if (t > T('H012', 'Poore')) text(ctx, 'POORE DESH KO', W / 2, 400, { font: F.osw, size: 50, color: '#fff', align: 'center', weight: 600, ls: 10, alpha: prog(t, T('H012', 'Poore'), T('H012', 'Poore') + .3) }); cred(ctx, 'worli_sky'); }, { name: 'c1-dream' });
  cue(T('H012', 'sapna'), 'riser', .5);
  shot(['H013', 'Phir'], (ctx, t, lt) => { darkBG(ctx, t, '#0B1A33', '#02050C'); pill(ctx, 'NEW INDIA ASSURANCE · SALES', W / 2, 300, { align: 'center', bg: '#333B4A', size: 46, alpha: prog(t, T('H013', 'New'), T('H013', 'New') + .3) });
    if (t > T('H013', 'share')) { ticker(ctx, 560, t, [['ACC', '214'], ['TISCO', '182'], ['RELIANCE', '98', false], ['HINDALCO', '310'], ['BPL', '76']]); glowText(ctx, 'SHARE MARKET KA CHASKA', W / 2, 820, { font: F.bebas, size: 130, color: HM.green, align: 'center', glow: 'rgba(61,220,132,.6)', alpha: prog(t, T('H013', 'chaska'), T('H013', 'chaska') + .3) }); } }, { name: 'c1-ins' });
  cue(T('H013', 'share'), 'tick', .6); cue(T('H013', 'chaska'), 'ding', .5);
  shot(['H014', 'Naukri'], (ctx, t, lt) => { pBG(ctx, 'bse_tower', lt, { grade: 'warm', shade: .2, fy: .4 }); gradeTop(ctx, .5); lowerTag(ctx, 'BOMBAY STOCK EXCHANGE', 'Dalal Street, Mumbai', t, T('H014', 'Bombay'));
    if (t > T('H014', 'jobber')) stamp(ctx, 'JOBBER', 1450, 330, t, T('H014', 'jobber'), { size: 120, color: HM.gold }); cred(ctx, 'bse_tower'); }, { name: 'c1-bse' });
  cue(T('H014', 'jobber'), 'stamp', .7);
  shot(['H015', 'Jobber'], (ctx, t, lt) => { darkBG(ctx, t, '#2A1A0A', '#050302'); crowd(ctx, t, 900, 13, { shout: t > T('H015', 'chillaate') });
    const p = E.back(prog(t, T('H015', 'chhota'), T('H015', 'chhota') + .4)); if (p > 0) { personIcon(ctx, W / 2, 1010, 1.4, HM.gold); penArrow(ctx, W / 2 + 260, 640, W / 2 + 60, 930, prog(t, T('H015', 'chhota'), T('H015', 'chhota') + .5), { color: HM.gold }); text(ctx, 'HARSHAD', W / 2 + 280, 620, { font: F.hand, size: 70, color: HM.gold, weight: 700, alpha: clamp(p) }); }
    text(ctx, 'FLOOR KA SABSE CHHOTA KHILADI', W / 2, 200, { font: F.bebas, size: 100, color: '#fff', align: 'center', alpha: prog(t, T('H015', 'floor'), T('H015', 'floor') + .3) }); }, { name: 'c1-floor' });
  cue(T('H015', 'chillaate'), 'hit', .4);
  shot(['H016', 'Par'], (ctx, t, lt) => { gridBG(ctx, t, '#06101C'); [['NUMBERS', 'Numbers', HM.green], ['DAR', 'dar', '#5DADE2'], ['LAALACH', 'laalach', HM.blood]].forEach(([s, w, c], i) => {
      popIn(ctx, t, T('H016', w), 400 + i * 560, 560, (g) => { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(-240, -120, 480, 240); g.strokeStyle = c; g.lineWidth = 6; g.strokeRect(-240, -120, 480, 240); text(g, s, 0, 40, { font: F.bebas, size: 120, color: c, align: 'center' }); }); }); }, { name: 'c1-learn' });
  ['Numbers', 'dar', 'laalach'].forEach(w => cue(T('H016', w), 'tick', .6));
  shot(['H017', 'Kuch'], (ctx, t, lt) => { pBG(ctx, 'bse_tall', lt, { grade: 'duo', tint: 'navy', tintAmt: .5, blur: 6, shade: .45 });
    plate(ctx, W / 2, H / 2, 1200, 380, 'GROWMORE', 'RESEARCH & ASSET MANAGEMENT', prog(t, T('H017', 'Growmore') - .2, T('H017', 'Growmore') + .8)); cred(ctx, 'bse_tall'); }, { name: 'c1-grow' });
  cue(T('H017', 'Growmore'), 'impact', .7);
  shot(['H018', 'Naam'], (ctx, t, lt) => { yellowBG(ctx); punch(ctx, 'GROW', 760, 420, t, T('H018', 'Naam'), { font: F.bebas, size: 230, color: '#111' }); punch(ctx, 'MORE', 1160, 420, t, T('H018', 'saaf'), { font: F.bebas, size: 230, color: HM.blood });
    penArrow(ctx, 1450, 700, 1550, 260, prog(t, T('H018', 'saaf'), T('H018', 'saaf') + .5), { color: '#111', lw: 12 });
    if (t > T('H018', 'Plan')) stamp(ctx, 'PLAN: CHHOTA NAHI', W / 2, 760, t, T('H018', 'Plan'), { size: 100, color: '#111', rot: -.04 }); capBand2(ctx); }, { name: 'c1-pun' });
  cue(T('H018', 'Plan'), 'stamp', .7);
  shot(['H019', 'Growmore'], (ctx, t, lt) => { board(ctx, t); figCard(ctx, W / 2, 500, 340, 460, 'KETAN PAREKH', prog(t, T('H019', 'Ketan') - .1, T('H019', 'Ketan') + .3), { rot: .03 });
    plate(ctx, 420, 250, 560, 220, 'GROWMORE', '', prog(t, T('H019', 'Growmore'), T('H019', 'Growmore') + .5) * .9, 110);
    sticky(ctx, 'YAAD\nRAKHIYE', 1460, 420, .08, prog(t, T('H019', 'yaad'), T('H019', 'yaad') + .3)); text(ctx, 'ILLUSTRATION', W / 2, 770, { font: F.mono, size: 20, color: 'rgba(255,255,255,.5)', align: 'center' }); }, { name: 'c1-ketan' });
  cue(T('H019', 'yaad'), 'paper', .6); cue(T('H019', 'Ketan'), 'stamp', .6);
  // ================= CH 2
  shot(['H020', 'Chapter'], (ctx, t, lt) => chapterCard(ctx, t, lt, T('H020', 'Chapter'), 2, 'BIG BULL', 'bull_kg'), { lead: .4, name: 'c2' });
  cue(T('H020', 'Chapter') - .1, 'riser', .5); cue(T('H020', 'Big'), 'impact', .7);
  shot(['H021', '1991'], (ctx, t, lt) => { pBG(ctx, 'rao_tv', lt, { grade: 'warm', shade: .2 }); timeStamp(ctx, '1991', 120, 200, t, T('H021', '1991'), { size: 110 });
    lowerTag(ctx, 'BAZAAR KHUL RAHA THA', 'PM P. V. Narasimha Rao, address to the nation, 1991', t, T('H021', 'bazaar')); if (t > T('H021', 'paisa')) ticker(ctx, 1000, t, [['ACC', '480'], ['TISCO', '210'], ['HINDALCO', '390'], ['BPL', '120'], ['APOLLO', '95']]); cred(ctx, 'rao_tv'); }, { name: 'c2-1991' });
  cue(T('H021', '1991'), 'whoosh', .6); cue(T('H021', 'paisa'), 'cash', .6);
  shot(['H022', 'Aur'], (ctx, t, lt) => { darkBG(ctx, t, '#03100A', '#000'); screenGrid(ctx, 260, 160, 1400, 760, t);
    ['BUY', 'BUY', 'BUY'].forEach((s, i) => { const st = T('H022', 'Bahut') + i * .18; if (t > st) stamp(ctx, s, 600 + i * 360, 560 + (i % 2) * 60, t, st, { size: 150, color: HM.green, rot: -.1 + i * .08 }); }); }, { name: 'c2-buy' });
  cue(T('H022', 'shuru'), 'key', .5); cue(T('H022', 'Bahut'), 'stamp', .8);
  shot(['H023', 'Uska'], (ctx, t, lt) => { gridBG(ctx, t, '#101010', 'rgba(255,255,255,.06)'); glowText(ctx, 'ACC', W / 2, 600, { font: F.bebas, size: 360, color: '#fff', align: 'center', glow: 'rgba(255,195,77,.6)', alpha: prog(t, T('H023', 'ACC'), T('H023', 'ACC') + .3) });
    if (t > T('H023', 'cement')) pill(ctx, 'EK CEMENT COMPANY', W / 2, 760, { align: 'center', bg: '#555', size: 50 }); }, { name: 'c2-acc' });
  cue(T('H023', 'ACC'), 'impact', .7);
  shot(['H024', 'Jo'], (ctx, t, lt) => { darkBG(ctx, t, '#06130C', '#000'); const t0 = T('H024', '200'), t1 = T('H024', '9,000');
    const p = prog(t, t0, t1 + .3); const pts = [[0, .02], [.2, .05], [.35, .12], [.5, .2], [.62, .35], [.75, .5], [.86, .72], [1, .95]];
    const last = lineChart(ctx, 260, 260, 1400, 600, pts, p); text(ctx, 'ACC SHARE PRICE (APPROX.)', 260, 200, { font: F.osw, size: 36, color: 'rgba(255,255,255,.7)', weight: 600, ls: 6 });
    if (t > t0) rsText(ctx, Math.round(lerp(200, 9000, E.inOut(clamp(p)))).toLocaleString('en-IN'), last[0] - 20, last[1] - 50, { size: 110, color: '#fff', align: 'left' }); }, { name: 'c2-acc-chart' });
  cue(T('H024', '200'), 'riser', .7); cue(T('H024', '9,000'), 'cash', .9);
  shot(['H025', 'Cement'], (ctx, t, lt) => { yellowBG(ctx); [['CEMENT: WAHI', 'Cement'], ['FACTORY: WAHI', 'Factory']].forEach(([s, w], i) => { if (t > T('H025', w)) { text(ctx, s, 420, 330 + i * 170, { font: F.bebas, size: 130, color: '#111' }); tick(ctx, 1260, 290 + i * 170, 45, prog(t, T('H025', w), T('H025', w) + .4), '#1B7A3A'); } });
    if (t > T('H025', 'daam')) { text(ctx, 'DAAM:', 420, 680, { font: F.bebas, size: 130, color: HM.blood }); const p = prog(t, T('H025', 'aasman'), T('H025', 'aasman') + 1.2); rocket(ctx, 1000 + p * 300, 820 - E.in(p) * 900, .9, t, { flame: true, rot: .3 }); } capBand2(ctx); }, { name: 'c2-joke' });
  cue(T('H025', 'aasman'), 'whoosh', .9); cue(T('H025', 'aasman') + .4, 'ding', .5);
  shot(['H026', 'Sensex'], (ctx, t, lt) => { darkBG(ctx, t, '#06130C', '#000'); text(ctx, 'SENSEX', 260, 200, { font: F.osw, size: 44, color: 'rgba(255,255,255,.75)', weight: 600, ls: 10 });
    lineChart(ctx, 260, 260, 1400, 600, [[0, .05], [.08, .07]], prog(t, T('H026', 'Sensex'), T('H026', '1,200'))); counter(ctx, 1200 * E.out(prog(t, T('H026', 'Sensex'), T('H026', '1,200'))), 1660, 820, { size: 150, color: HM.green, align: 'right' });
    timeStamp(ctx, 'APRIL 1991', 300, 380, t, T('H026', 'April'), { size: 70 }); }, { name: 'c2-sx1' });
  shot(['H027', 'April'], (ctx, t, lt) => { darkBG(ctx, t, '#06130C', '#000'); text(ctx, 'SENSEX', 260, 200, { font: F.osw, size: 44, color: 'rgba(255,255,255,.75)', weight: 600, ls: 10 });
    const p = prog(t, T('H027', 'April'), T('H027', '4,467') + .2); lineChart(ctx, 260, 260, 1400, 600, [[0, .05], [.15, .08], [.3, .14], [.45, .2], [.6, .3], [.75, .48], [.88, .7], [1, .96]], p);
    counter(ctx, lerp(1200, 4467, E.inOut(p)), 1660, 820, { size: 150, color: HM.green, align: 'right' }); timeStamp(ctx, 'APRIL 1992', 1240, 380, t, T('H027', '4,467'), { size: 70 });
    if (t > T('H027', 'chaar')) stamp(ctx, 'LAGBHAG 4X', 760, 520, t, T('H027', 'chaar'), { size: 120, color: HM.gold }); }, { name: 'c2-sx2' });
  cue(T('H027', 'April'), 'riser', .6); cue(T('H027', 'chaar'), 'stamp', .8);
  shot(['H028', 'Media'], (ctx, t, lt) => { darkBG(ctx, t, '#1C1408', '#000'); newspaper(ctx, W / 2 - 200, 560, .78, 'THE BIG\nBULL', 'Dalal Street ka naya raja', t, T('H028', 'Media'), { date: 'BOMBAY · 1991' });
    if (t > T('H028', 'Amitabh')) pill(ctx, 'STOCK MARKET KA AMITABH BACHCHAN', 1340, 860, { align: 'center', bg: HM.blood, size: 44 }); }, { name: 'c2-media' });
  cue(T('H028', 'Media'), 'paper', .7);
  shot(['H029', 'Worli'], (ctx, t, lt) => { pBG(ctx, 'worli_sea', lt, { grade: 'warm', shade: .25 }); lowerTag(ctx, 'WORLI SEA FACE', 'Mumbai', t, T('H029', 'Worli'));
    if (t > T('H029', '15,000')) { counter(ctx, 15000 * E.out(prog(t, T('H029', '15,000'), T('H029', '15,000') + .8)), W / 2, 520, { size: 230, color: '#fff', align: 'center', shadow: 30 }); text(ctx, 'SQUARE FEET (LAGBHAG)', W / 2, 600, { font: F.osw, size: 44, color: HM.gold, align: 'center', weight: 600, ls: 8 }); } cred(ctx, 'worli_sea'); }, { name: 'c2-worli' });
  cue(T('H029', '15,000'), 'cash', .6);
  shot(['H030', 'Andar'], (ctx, t, lt) => { pBG(ctx, 'worli_sky', lt, { grade: 'warm', blur: 8, shade: .45 }); popIn(ctx, t, T('H030', 'swimming'), 600, 560, (g) => { pool(g, -330, -170, 660, 340, t); }, .4);
    if (t > T('H030', 'swimming')) pill(ctx, 'SWIMMING POOL', 600, 830, { align: 'center', bg: '#1E6FA0', size: 44 });
    popIn(ctx, t, T('H030', 'golf'), 1350, 560, (g) => golf(g, 0, 0, 1.3, t), .4); if (t > T('H030', 'golf')) pill(ctx, 'MINI GOLF', 1350, 830, { align: 'center', bg: '#2E7D32', size: 44 }); cred(ctx, 'worli_sky', 'Illustration'); }, { name: 'c2-pool' });
  cue(T('H030', 'swimming'), 'whoosh', .5); cue(T('H030', 'golf'), 'ding', .5);
  shot(['H031', 'Aur'], (ctx, t, lt) => { pBG(ctx, 'lexus', lt, { grade: 'color', shade: .15, z0: 1.02 }); lowerTag(ctx, 'TOYOTA LEXUS LS400', 'Same model, 1990 (representative photo)', t, T('H031', 'Lexus'));
    if (t > T('H031', 'spaceship')) { speedLines(ctx, t); glowText(ctx, 'JAISE KOI SPACESHIP', W / 2, 260, { font: F.bebas, size: 130, color: '#fff', align: 'center', glow: 'rgba(120,200,255,.8)' }); } cred(ctx, 'lexus'); }, { name: 'c2-lexus' });
  cue(T('H031', 'spaceship'), 'whoosh', .8);
  shot(['H032', 'Log'], (ctx, t, lt) => { yellowBG(ctx); sedan(ctx, W / 2, 640, 1.1, t); for (let i = 0; i < 9; i++) personIcon(ctx, 220 + i * 185, 960, 2.4, '#222');
    punch(ctx, 'HARSHAD KO NAHI,', W / 2, 200, t, T('H032', 'Harshad'), { font: F.bebas, size: 120, color: '#111' }); punch(ctx, 'CAR KO.', W / 2, 330, t, T('H032', 'car'), { font: F.bebas, size: 150, color: HM.blood }); }, { name: 'c2-joke2' });
  cue(T('H032', 'car'), 'ding', .8);
  shot(['H033', 'Chhote'], (ctx, t, lt) => { pBG(ctx, 'bull_bse', lt, { grade: 'duo', tint: 'gold', tintAmt: .5, shade: .5 });
    if (t > T('H033', 'bhagwan')) glowText(ctx, 'BHAGWAN', W / 2, 330, { font: F.bebas, size: 200, color: HM.gold, align: 'center', glow: 'rgba(255,195,77,.8)', alpha: prog(t, T('H033', 'bhagwan'), T('H033', 'bhagwan') + .3) });
    if (t > T('H033', 'kharidta')) pill(ctx, 'WO KHARIDTA  →  SAB KHARIDTE', W / 2, 820, { align: 'center', bg: '#111', size: 54 }); crowd(ctx, t, 1060, 11, { s: 2, col: 'rgba(0,0,0,.85)' }); cred(ctx, 'bull_bse'); }, { name: 'c2-god' });
  shot(['H034', 'Par'], (ctx, t, lt) => { darkBG(ctx, t, '#140808', '#000'); typewriter(ctx, 'ITNA PAISA AA KAHAN SE RAHA THA?', 230, 580, t, T('H034', 'Itna'), 24, { size: 76, color: '#F6F0E4' });
    penEllipse(ctx, 640, 555, 170, 80, prog(t, T('H034', 'kahan'), T('H034', 'kahan') + .5), { color: HM.blood }); }, { name: 'c2-q' });
  typeCues('ITNA PAISA AA KAHAN SE RAHA THA?', T('H034', 'Itna'), 24, .4); cue(T('H034', 'Itna') - .2, 'riser', .5);
  // ================= CH 3
  shot(['H035', 'Chapter'], (ctx, t, lt) => chapterCard(ctx, t, lt, T('H035', 'Chapter'), 3, 'KHAALI RASID KA KHEL', 'sbi_hq'), { lead: .4, name: 'c3' });
  cue(T('H035', 'Chapter') - .1, 'riser', .5); cue(T('H035', 'Khaali'), 'impact', .7);
  shot(['H036', 'Ye'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); text(ctx, 'GHABRAIYE MAT', W / 2, 450, { font: F.osw, size: 60, color: 'rgba(255,255,255,.75)', align: 'center', weight: 600, ls: 12, alpha: prog(t, T('H036', 'ghabraiye'), T('H036', 'ghabraiye') + .3) });
    punch(ctx, 'BILKUL SIMPLE HAI', W / 2, 620, t, T('H036', 'simple'), { font: F.bebas, size: 170, color: '#fff' }); tick(ctx, W / 2 + 720, 600, 50, prog(t, T('H036', 'simple') + .2, T('H036', 'simple') + .6)); }, { name: 'c3-simple' });
  cue(T('H036', 'simple'), 'ding', .5);
  const AX = 520, BX = 1400, BY = 520;
  shot(['H037', 'Us'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); bankIcon(ctx, AX, BY, 1.2, 'BANK A'); bankIcon(ctx, BX, BY, 1.2, 'BANK B');
    if (t > T('H037', 'paise')) { pill(ctx, 'KUCH DIN KE LIYE PAISA CHAHIYE', AX, 250, { align: 'center', bg: HM.blood, size: 38 }); } }, { name: 'c3-banks' });
  shot(['H038', 'To'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); bankIcon(ctx, AX, BY, 1.2, 'BANK A'); bankIcon(ctx, BX, BY, 1.2, 'BANK B');
    flowArrow(ctx, [AX + 230, BY - 120], [BX - 230, BY - 120], prog(t, T('H038', 'securities'), T('H038', 'securities') + .8), '#9EC9FF', 'GOVT. SECURITIES (GIRVI)');
    flowArrow(ctx, [BX - 230, BY + 60], [AX + 230, BY + 60], prog(t, T('H038', 'loan'), T('H038', 'loan') + .8), HM.gold, 'PAISA (LOAN)'); }, { name: 'c3-rf' });
  cue(T('H038', 'securities'), 'whoosh', .5); cue(T('H038', 'loan'), 'cash', .5);
  shot(['H039', 'Lagbhag'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); bankIcon(ctx, AX, BY + 60, 1, 'BANK A'); bankIcon(ctx, BX, BY + 60, 1, 'BANK B'); flowArrow(ctx, [AX + 200, BY], [BX - 200, BY], 1, '#9EC9FF'); flowArrow(ctx, [BX - 200, BY + 120], [AX + 200, BY + 120], 1, HM.gold);
    popIn(ctx, t, T('H039', 'pandrah'), W / 2, 760, (g) => { g.fillStyle = '#fff'; g.fillRect(-110, -90, 220, 190); g.fillStyle = HM.blood; g.fillRect(-110, -90, 220, 50); text(g, '15', 0, 70, { font: F.bebas, size: 120, color: '#111', align: 'center' }); text(g, 'DIN', 0, -52, { font: F.bebas, size: 40, color: '#fff', align: 'center' }); });
    bigTitle(ctx, 'READY FORWARD DEAL', W / 2, 230, t, T('H039', 'ready'), { size: 140, align: 'center', bar: HM.gold }); }, { name: 'c3-rfd' });
  cue(T('H039', 'ready'), 'impact', .6);
  shot(['H040', 'Bilkul'], (ctx, t, lt) => { yellowBG(ctx); text(ctx, 'SUNAR KI DUKAAN', W / 2, 200, { font: F.bebas, size: 110, color: '#111', align: 'center' });
    popIn(ctx, t, T('H040', 'Zevar'), 480, 560, (g) => necklace(g, 0, 0, .9, t)); if (t > T('H040', 'Zevar')) text(ctx, 'ZEVAR RAKHO', 480, 860, { font: F.bebas, size: 90, color: '#111', align: 'center' });
    if (t > T('H040', 'paisa')) { noteStack(ctx, W / 2 + 40, 640, 1, 6, prog(t, T('H040', 'paisa'), T('H040', 'paisa') + .5)); text(ctx, 'PAISA LO', W / 2 + 40, 860, { font: F.bebas, size: 90, color: '#111', align: 'center' }); }
    if (t > T('H040', 'chhuda')) { text(ctx, 'WAPAS CHHUDAO', 1480, 860, { font: F.bebas, size: 90, color: HM.blood, align: 'center' }); penArrow(ctx, 1250, 560, 1650, 560, prog(t, T('H040', 'chhuda'), T('H040', 'chhuda') + .4), { color: '#111', lw: 10 }); } capBand2(ctx); }, { name: 'c3-sunar' });
  cue(T('H040', 'Zevar'), 'ding', .5); cue(T('H040', 'paisa'), 'cash', .6);
  shot(['H041', 'Par'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); bankIcon(ctx, AX, BY, 1, 'BANK A'); bankIcon(ctx, BX, BY, 1, 'BANK B');
    const p = prog(t, T('H041', 'rasid'), T('H041', 'rasid') + 1.2); if (t < T('H041', 'Unki')) { text(ctx, 'ASLI SECURITIES', W / 2, 330, { font: F.bebas, size: 80, color: '#9EC9FF', align: 'center' }); bigX(ctx, W / 2, 470, 90, prog(t, T('H041', 'nahi'), T('H041', 'nahi') + .5)); }
    else brReceipt(ctx, lerp(AX + 200, BX - 200, E.inOut(p)), 470, .45, t, {}); }, { name: 'c3-paper' });
  cue(T('H041', 'nahi'), 'hit', .5); cue(T('H041', 'rasid'), 'paper', .7);
  shot(['H042', 'Ise'], (ctx, t, lt) => { darkBG(ctx, t, '#1B140E', '#050302'); brReceipt(ctx, W / 2, 600, 1.2, t, {});
    if (t > T('H042', 'BR.')) glowText(ctx, 'BR = BANK RECEIPT', W / 2, 160, { font: F.bebas, size: 120, color: HM.gold, align: 'center', glow: 'rgba(255,190,60,.6)' }); }, { name: 'c3-br' });
  cue(T('H042', 'BR.'), 'stamp', .6);
  shot(['H043', 'Aur'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); bankIcon(ctx, 360, BY, 1, 'BANK A'); bankIcon(ctx, 1560, BY, 1, 'BANK B'); hmFigure(ctx, W / 2, 640, .8, { col: '#0B0F18', specs: false, tie: '#333', shirt: '#333' });
    if (t > T('H043', 'broker')) pill(ctx, 'BROKER', W / 2, 860, { align: 'center', bg: '#333', size: 46 }); if (t > T('H043', 'kaun')) { glitch(ctx, t, .4, 9); glowText(ctx, '?', W / 2, 420, { font: F.bebas, size: 260, color: HM.gold, align: 'center' }); } }, { name: 'c3-who' });
  cue(T('H043', 'kaun'), 'hit', .6);
  shot(['H044', 'Bilkul'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); bankIcon(ctx, 360, BY, 1, 'BANK A'); bankIcon(ctx, 1560, BY, 1, 'BANK B'); hmFigure(ctx, W / 2, 640, .8, { glow: 'rgba(255,195,77,.7)' });
    flash(ctx, t, T('H044', 'Harshad'), .15, HM.gold); if (t > T('H044', 'Harshad')) pill(ctx, 'HARSHAD MEHTA', W / 2, 860, { align: 'center', bg: HM.blood, size: 50 }); }, { name: 'c3-him' });
  cue(T('H044', 'Harshad'), 'impact', .9);
  const ACC = [W / 2, 820];
  shot(['H045', 'Aarop'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1F3A'); bankIcon(ctx, 360, 420, .9, 'BANK A'); bankIcon(ctx, 1560, 420, .9, 'BANK B'); kicker(ctx, 'AAROP', 120, 120, t, T('H045', 'Aarop'), { color: HM.blood });
    flowArrow(ctx, [1360, 360], [560, 360], prog(t, T('H045', 'doosre'), T('H045', 'doosre') + .5) * .5, HM.gold); if (t > T('H045', 'jagah')) bigX(ctx, W / 2, 360, 60, prog(t, T('H045', 'jagah'), T('H045', 'jagah') + .4));
    flowArrow(ctx, [1400, 520], [ACC[0] + 220, ACC[1] - 40], prog(t, T('H045', 'seedha'), T('H045', 'seedha') + .7), HM.gold);
    popIn(ctx, t, T('H045', 'Harshad'), ACC[0], ACC[1], (g) => { g.fillStyle = '#111'; g.fillRect(-260, -80, 520, 160); g.strokeStyle = HM.gold; g.lineWidth = 5; g.strokeRect(-260, -80, 520, 160); text(g, "HARSHAD KA ACCOUNT", 0, 20, { font: F.bebas, size: 64, color: HM.gold, align: 'center' }); }); }, { name: 'c3-divert' });
  cue(T('H045', 'jagah'), 'hit', .5); cue(T('H045', 'seedha'), 'whoosh', .6);
  shot(['H046', 'Aur'], (ctx, t, lt) => { darkBG(ctx, t, '#03100A', '#000'); screenGrid(ctx, 120, 200, 760, 640, t); const last = lineChart(ctx, 980, 260, 820, 520, [[0, .1], [.3, .3], [.6, .55], [1, .9]], prog(t, T('H046', 'Daam'), T('H046', 'Daam') + .8));
    [['DAAM UPAR', 'Daam', HM.green], ['MUNAFA JEB MEIN', 'munafa', HM.gold], ['PAISA WAPAS', 'wapas', '#9EC9FF']].forEach(([s, w, c], i) => { if (t > T('H046', w)) pill(ctx, s, 1390, 880 + 0, { align: 'center', bg: '#111', color: c, size: 46, alpha: i === ['Daam', 'munafa', 'wapas'].filter(x => t > T('H046', x)).length - 1 ? 1 : 0 }); });
    if (t > T('H046', 'munafa')) noteRain(ctx, t, T('H046', 'munafa'), 12); }, { name: 'c3-loop' });
  ['Daam', 'munafa', 'wapas'].forEach((w, i) => cue(T('H046', w), i === 1 ? 'cash' : 'tick', .6));
  shot(['H047', 'Par'], (ctx, t, lt) => { darkBG(ctx, t, '#2A0606', '#000'); glitch(ctx, t, .5, 4); punch(ctx, 'PAISA KAM PADA', W / 2, 480, t, T('H047', 'paisa'), { font: F.bebas, size: 180, color: '#fff' });
    if (t > T('H047', 'khatarnak')) text(ctx, 'AUR KAHANI KHATARNAK HO GAYI', W / 2, 650, { font: F.osw, size: 54, color: HM.blood, align: 'center', weight: 600, ls: 6 }); }, { name: 'c3-danger' });
  cue(T('H047', 'Par'), 'riser', .6); cue(T('H047', 'khatarnak'), 'hit', .8);
  shot(['H048', 'Do'], (ctx, t, lt) => { gridBG(ctx, t, '#1A0E0A', 'rgba(255,120,80,.08)'); popIn(ctx, t, T('H048', 'Karad'), 560, 480, (g) => bankIcon(g, 0, 0, .9, ''));
    if (t > T('H048', 'Karad')) text(ctx, 'BANK OF KARAD', 560, 720, { font: F.bebas, size: 70, color: '#fff', align: 'center' });
    popIn(ctx, t, T('H048', 'Metropolitan'), 1360, 480, (g) => bankIcon(g, 0, 0, .9, '')); if (t > T('H048', 'Metropolitan')) text(ctx, 'METROPOLITAN CO-OP BANK', 1360, 720, { font: F.bebas, size: 70, color: '#fff', align: 'center' });
    if (t > T('H048', 'fees')) { for (let i = 0; i < 4; i++) { const st = T('H048', 'fees') + i * .25; if (t > st) brReceipt(ctx, 420 + i * 360, 900 - E.out(prog(t, st, st + .4)) * 40, .3, t, { rot: (i - 1.5) * .06 }); } pill(ctx, 'FEES LEKAR BR', W / 2, 200, { align: 'center', bg: HM.blood, size: 46 }); } }, { name: 'c3-smallbanks' });
  cue(T('H048', 'Karad'), 'whoosh', .5); cue(T('H048', 'Metropolitan'), 'whoosh', .5); cue(T('H048', 'fees'), 'cash', .6);
  shot(['H049', 'Aisi'], (ctx, t, lt) => { darkBG(ctx, t, '#1B140E', '#050302'); brReceipt(ctx, W / 2, 560, 1.25, t, { sec: '— — — — —', empty: prog(t, T('H049', 'nahi'), T('H049', 'nahi') + .2) });
    if (t > T('H049', 'peeche')) penEllipse(ctx, W / 2 + 60, 500, 330, 60, prog(t, T('H049', 'peeche'), T('H049', 'peeche') + .5)); }, { name: 'c3-empty' });
  cue(T('H049', 'nahi'), 'stamp', .9);
  shot(['H050', 'Matlab'], (ctx, t, lt) => { yellowBG(ctx); const open = prog(t, T('H050', 'andar'), T('H050', 'andar') + .4); tiffin(ctx, 600, 640 - 0, 1.1, 'PANEER', 1);
    if (open > 0) { ctx.save(); ctx.translate(600, 640); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(0, -300 - open * 0, 140, 30, 0, 0, 7); ctx.fill(); ctx.restore(); }
    punch(ctx, 'KHAALI TIFFIN', 1300, 360, t, T('H050', 'Matlab'), { font: F.bebas, size: 140, color: '#111' }); if (t > T('H050', 'Upar')) text(ctx, 'UPAR: PANEER', 1300, 560, { font: F.bebas, size: 100, color: '#111', align: 'center' });
    if (t > T('H050', 'andar')) punch(ctx, 'ANDAR: KUCH NAHI', 1300, 720, t, T('H050', 'andar'), { font: F.bebas, size: 110, color: HM.blood }); capBand2(ctx); }, { name: 'c3-tiffin' });
  cue(T('H050', 'andar'), 'ding', .8);
  shot(['H051', 'Aur'], (ctx, t, lt) => { pBG(ctx, 'sbi_hq', lt, { grade: 'duo', tint: 'navy', tintAmt: .6, shade: .45 }); noteRain(ctx, t, T('H051', 'Aur'), 30);
    if (t > T('H051', 'karodon')) rsText(ctx, 'KARODON', W / 2, 600, { size: 220, glow: 'rgba(255,190,60,.7)' }); brReceipt(ctx, W / 2, 870, .4, t, { empty: 1 }); cred(ctx, 'sbi_hq'); }, { name: 'c3-crores' });
  cue(T('H051', 'karodon'), 'cash', .9);
  shot(['H052', 'Koi'], (ctx, t, lt) => { darkBG(ctx, t); text(ctx, 'CHECK KARNE WALA?', W / 2, 300, { font: F.bebas, size: 110, color: '#fff', align: 'center' });
    if (t > T('H052', 6)) punch(ctx, 'THA.', W / 2, 470, t, T('H052', 6), { font: F.bebas, size: 150, color: HM.green });
    if (t > T('H052', 'Bas')) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.strokeRect(W / 2 - 520, 620, 90, 90); ctx.restore(); text(ctx, 'CHECK KIYA', W / 2 - 400, 700, { font: F.bebas, size: 100, color: '#fff' }); bigX(ctx, W / 2 + 330, 665, 60, prog(t, T('H052', 11), T('H052', 11) + .4)); } }, { name: 'c3-check' });
  cue(T('H052', 6), 'tick', .6); cue(T('H052', 11), 'hit', .6);
  // ================= CH 4
  shot(['H053', 'Chapter'], (ctx, t, lt) => chapterCard(ctx, t, lt, T('H053', 'Chapter'), 4, 'BHANDA PHOOTA', 'sbi_mumbai'), { lead: .4, name: 'c4' });
  cue(T('H053', 'Chapter') - .1, 'riser', .5); cue(T('H053', 'Bhanda'), 'impact', .8);
  shot(['H054', 'April'], (ctx, t, lt) => { pBG(ctx, 'sbi_mumbai', lt, { grade: 'color', shade: .45, blur: 3 }); timeStamp(ctx, 'APRIL 1992', 120, 180, t, T('H054', 'April'), { size: 80 });
    ctx.save(); ctx.translate(W / 2, 600); ctx.fillStyle = '#F7F3EA'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillRect(-560, -280, 1120, 560); ctx.shadowBlur = 0;
    text(ctx, 'AUDIT · SBI', -520, -210, { font: F.osw, size: 40, color: '#333', weight: 600, ls: 6 }); [['BR (KAGAZ PE)', 'RS 500 CR'], ['ASLI SECURITIES', 'RS 0'], ['FARAK', 'RS 500 CR']].forEach(([a, b], i) => { if (t < T('H054', 'audit') + i * .35) return;
      text(ctx, a, -520, -90 + i * 120, { font: F.mono, size: 44, color: '#222' }); text(ctx, b, 520, -90 + i * 120, { font: F.mono, size: 52, color: i ? HM.blood : '#222', align: 'right', weight: 700 }); });
    highlighter(ctx, -540, 120, 1080, 70, prog(t, T('H054', 'mel'), T('H054', 'mel') + .5)); ctx.restore(); cred(ctx, 'sbi_mumbai'); }, { name: 'c4-audit' });
  cue(T('H054', 'audit'), 'paper', .6); cue(T('H054', 'mel'), 'scribble', .6);
  shot(['H055', 'Bank'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1322', 'rgba(255,90,72,.07)'); text(ctx, 'BR', 520, 420, { font: F.bebas, size: 160, color: '#fff', align: 'center' }); tick(ctx, 520, 560, 50, prog(t, T('H055', 'BR'), T('H055', 'BR') + .4));
    if (t > T('H055', 'securities')) { text(ctx, 'SECURITIES', 1400, 420, { font: F.bebas, size: 160, color: '#fff', align: 'center' }); bigX(ctx, 1400, 580, 60, prog(t, T('H055', 'gayab'), T('H055', 'gayab') + .5)); }
    if (t > T('H055', '500')) rsText(ctx, '500 CRORE  →  HARSHAD', W / 2, 860, { size: 110, glow: 'rgba(255,190,60,.6)' }); }, { name: 'c4-gap' });
  cue(T('H055', 'gayab'), 'hit', .7); cue(T('H055', '500'), 'cash', .7);
  shot(['H056', 'Yaad'], (ctx, t, lt) => { pBG(ctx, 'sbi_mumbai', lt, { grade: 'night', tint: 'navy', tintAmt: .5, shade: .3 }); phoneRing(ctx, W / 2, 560, 1.2, t); text(ctx, 'WAHI BULAWA', W / 2, 880, { font: F.bebas, size: 120, color: HM.gold, align: 'center', alpha: prog(t, T('H056', 'call'), T('H056', 'call') + .3) }); cred(ctx, 'sbi_mumbai'); }, { name: 'c4-call' });
  cue(T('H056', 'call'), 'ding', .6);
  shot(['H057', 'Ye'], (ctx, t, lt) => { darkBG(ctx, t, '#101A2A', '#03050A'); if (t > T('H057', 'journalist')) frame(ctx, 'sucheta', 1060, 160, 620, 520, { grade: 'color', fy: .4 });
    kicker(ctx, 'JOURNALIST', 140, 360, t, T('H057', 'journalist'), { color: HM.gold }); bigTitle(ctx, 'SUCHETA DALAL', 140, 520, t, T('H057', 'Sucheta'), { size: 150, bar: HM.gold });
    text(ctx, 'THE TIMES OF INDIA (1992)', 150, 600, { font: F.osw, size: 40, color: 'rgba(255,255,255,.75)', weight: 600, ls: 5, alpha: prog(t, T('H057', 'Times'), T('H057', 'Times') + .3) }); text(ctx, 'Photo: 2019', 1680, 750, { font: F.mono, size: 22, color: 'rgba(255,255,255,.6)', align: 'right' }); cred(ctx, 'sucheta'); }, { name: 'c4-sucheta' });
  cue(T('H057', 'journalist'), 'whoosh', .5);
  shot(['H058', '23'], (ctx, t, lt) => { darkBG(ctx, t, '#1C1408', '#000'); newspaper(ctx, W / 2, 580, .9, 'SBI KE 500 CRORE\nKAHAN GAYE?', 'Ek broker, bank ka paisa, aur share bazaar', t, T('H058', '23'), { date: 'BOMBAY · 23 APRIL 1992' });
    if (t > T('H058', 'palat')) { flash(ctx, t, T('H058', 'palat'), .15); glitch(ctx, t, .3, 5); } }, { name: 'c4-paper' });
  cue(T('H058', '23'), 'paper', .8); cue(T('H058', 'palat'), 'impact', .9);
  shot(['H059', 'Banks'], (ctx, t, lt) => { darkBG(ctx, t, '#2A0A0A', '#000'); for (let i = 0; i < 4; i++) bankIcon(ctx, 300 + i * 440, 520, .75, ['BANK A', 'BANK B', 'BANK C', 'BANK D'][i]);
    if (t > T('H059', 'wapas')) for (let i = 0; i < 4; i++) text(ctx, 'PAISA WAPAS!', 300 + i * 440, 300 + Math.sin(t * 8 + i) * 6, { font: F.bebas, size: 54, color: '#fff', align: 'center' });
    if (t > T('H059', 'panic')) { glitch(ctx, t, .6, 7); punch(ctx, 'PANIC', W / 2, 870, t, T('H059', 'panic'), { font: F.bebas, size: 200, color: HM.blood }); } }, { name: 'c4-panic' });
  cue(T('H059', 'panic'), 'hit', .9);
  shot(['H060', 'Sensex'], (ctx, t, lt) => { darkBG(ctx, t, '#1A0606', '#000'); text(ctx, 'SENSEX', 260, 200, { font: F.osw, size: 44, color: 'rgba(255,255,255,.75)', weight: 600, ls: 10 });
    const p = prog(t, T('H060', '4,467'), T('H060', '2,500') + .3); lineChart(ctx, 260, 260, 1400, 600, [[0, .95], [.15, .85], [.3, .7], [.45, .72], [.6, .55], [.75, .5], [.9, .42], [1, .4]], p, { color: HM.blood });
    counter(ctx, lerp(4467, 2500, E.inOut(p)), 1660, 820, { size: 150, color: HM.blood, align: 'right' }); timeStamp(ctx, 'AUGUST 1992', 1240, 380, t, T('H060', 'August'), { size: 70 }); }, { name: 'c4-crash' });
  cue(T('H060', 'girte'), 'thud', .8);
  shot(['H061', 'Laakhon'], (ctx, t, lt) => { bgGrad(ctx, '#0A0A0C', '#000', 'r'); for (let i = 0; i < 24; i++) personIcon(ctx, 160 + i * 70, 760, 1.6, `rgba(200,200,210,${.55 - .4 * prog(t, T('H061', 'doob'), T('H061', 'doob') + 2) * (hash(i) > .3 ? 1 : .3)})`);
    text(ctx, 'LAAKHON CHHOTE INVESTORS', W / 2, 400, { font: F.osw, size: 56, color: 'rgba(246,240,228,.85)', align: 'center', weight: 500, ls: 8, alpha: prog(t, T('H061', 'Laakhon'), T('H061', 'Laakhon') + .6) });
    text(ctx, 'jama poonji doob gayi', W / 2, 480, { font: F.playI, size: 48, color: 'rgba(246,240,228,.6)', align: 'center', alpha: prog(t, T('H061', 'doob'), T('H061', 'doob') + .8) }); }, { name: 'c4-loss' });
  shot(['H062', 'Jo'], (ctx, t, lt) => { pBG(ctx, 'bull_kg', lt, { grade: 'bw', shade: .55, zs: .01 }); text(ctx, 'SABSE ZYADA TOOTE', W / 2, 900, { font: F.osw, size: 60, color: 'rgba(246,240,228,.85)', align: 'center', weight: 500, ls: 10, alpha: prog(t, T('H062', 'sabse'), T('H062', 'sabse') + .6) }); cred(ctx, 'bull_kg'); }, { name: 'c4-hurt' });
  shot(['H063', 'RBI'], (ctx, t, lt) => { pBG(ctx, 'rbi_museum', lt, { grade: 'duo', tint: 'navy', tintAmt: .4, shade: .3 }); lowerTag(ctx, 'JANAKIRAMAN COMMITTEE', 'RBI ki jaanch committee, 1992', t, T('H063', 'Janakiraman')); cred(ctx, 'rbi_museum'); }, { lead: .5, name: 'c4-rbi' });
  cue(T('H063', 'RBI'), 'whoosh', .5);
  shot(['H064', 'Aur'], (ctx, t, lt) => { darkBG(ctx, t, '#1A1206', '#000'); sticky(ctx, '500 CRORE', 420, 300, -.06, prog(t, T('H064', '500') - .1, T('H064', '500') + .3)); bigX(ctx, 420, 300, 140, prog(t, T('H064', 'Committee'), T('H064', 'Committee') + .5));
    if (t > T('H064', '4,024')) rsCount(ctx, t, T('H064', '4,024'), 500, 4024, W / 2 + 180, 760, { size: 200, dur: 1.4 }); if (t > T('H064', 'size')) text(ctx, 'POORE SCAM KA SIZE (LAGBHAG)', W / 2 + 180, 880, { font: F.osw, size: 40, color: 'rgba(255,255,255,.8)', align: 'center', weight: 600, ls: 6 }); }, { name: 'c4-payoff' });
  cue(T('H064', 'Committee'), 'hit', .6); cue(T('H064', '4,024'), 'cash', 1);
  shot(['H065', 'Aur'], (ctx, t, lt) => { board(ctx, t); figCard(ctx, W / 2, 520, 360, 480, 'HARSHAD MEHTA', prog(t, T('H065', 'Aur'), T('H065', 'Aur') + .3), { specs: true }); }, { name: 'c4-board' });
  shot(['H066', 'Kai'], (ctx, t, lt) => { board(ctx, t); const c = [W / 2, 300]; figCard(ctx, W / 2, 520, 300, 400, 'HARSHAD MEHTA', 1, { specs: true });
    [[330, 360, 'BROKER', 'brokers'], [330, 800, 'BROKER', 'brokers'], [1590, 360, 'BANK OFFICER', 'officers'], [1590, 800, 'BANK OFFICER', 'officers']].forEach(([x, y, n, w], i) => { const st = T('H066', w) + (i % 2) * .2;
      redString(ctx, c, [x, y - 150], prog(t, st, st + .5), 40); figCard(ctx, x, y, 220, 290, n, prog(t, st, st + .3), { rot: (i % 2 ? .05 : -.04) }); }); }, { name: 'c4-web' });
  cue(T('H066', 'brokers'), 'paper', .5); cue(T('H066', 'officers'), 'paper', .5);
  shot(['H067', 'Bank'], (ctx, t, lt) => { darkBG(ctx, t, '#1A0E0A', '#000'); bankIcon(ctx, 560, 480, .9, 'BANK OF KARAD', '#DCE3EC', { size: 44 }); bankIcon(ctx, 1360, 480, .9, 'METROPOLITAN CO-OP', '#DCE3EC', { size: 44 });
    if (t > T('H067', 'band')) { stamp(ctx, 'BAND', 560, 460, t, T('H067', 'band'), { size: 130, color: HM.blood }); stamp(ctx, 'BAND', 1360, 460, t, T('H067', 'band') + .15, { size: 130, color: HM.blood }); } }, { name: 'c4-closed' });
  cue(T('H067', 'band'), 'stamp', .9);
  shot(['H068', 'In'], (ctx, t, lt) => { yellowBG(ctx); punch(ctx, 'NAAM HO GAYA.', W / 2, 400, t, T('H068', 'sabne'), { font: F.bebas, size: 170, color: '#111' }); punch(ctx, 'GALAT WAJAH SE.', W / 2, 620, t, T('H068', 'Galat'), { font: F.bebas, size: 190, color: HM.blood }); capBand2(ctx); }, { name: 'c4-joke' });
  cue(T('H068', 'Galat'), 'ding', .8);
  // ================= CH 5
  shot(['H069', 'Chapter'], (ctx, t, lt) => chapterCard(ctx, t, lt, T('H069', 'Chapter'), 5, 'ARREST AUR EK SUITCASE', 'highcourt_old'), { lead: .4, name: 'c5' });
  cue(T('H069', 'Chapter') - .1, 'riser', .5); cue(T('H069', 'suitcase.'), 'impact', .8);
  shot(['H070', '9'], (ctx, t, lt) => { darkBG(ctx, t, '#0E0E14', '#000'); timeStamp(ctx, '9 NOVEMBER 1992', 120, 180, t, T('H070', '9'), { size: 80 }); if (t > T('H070', 'CBI')) pill(ctx, 'CBI', 1700, 150, { bg: HM.blood, size: 50 });
    [['HARSHAD', 'Harshad'], ['ASHWIN', 'Ashwin'], ['SUDHIR', 'Sudhir']].forEach(([n, w], i) => figCard(ctx, 520 + i * 440, 520, 300, 400, n, prog(t, T('H070', w), T('H070', w) + .3), { specs: i === 0 }));
    handcuffs(ctx, W / 2, 900, .8, prog(t, T('H070', 'arrest'), T('H070', 'arrest') + .3)); }, { name: 'c5-arrest' });
  cue(T('H070', 'arrest'), 'thud', 1); ['Harshad', 'Ashwin', 'Sudhir'].forEach(w => cue(T('H070', w), 'shutter', .5));
  shot(['H071', 'Aarop'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1322', 'rgba(255,90,72,.07)'); kicker(ctx, 'AAROP', 140, 160, t, T('H071', 'Aarop'), { color: HM.blood });
    for (let i = 0; i < 9; i++) { const st = T('H071', 'transfer') + i * .08; if (t < st) continue; ctx.save(); ctx.translate(380 + (i % 3) * 60, 520 + Math.floor(i / 3) * 40); ctx.rotate((i - 4) * .05); ctx.fillStyle = '#EDE6D6'; ctx.fillRect(-150, -100, 300, 200); text(ctx, 'SHARE TRANSFER FORM', 0, -60, { font: F.mono, size: 18, color: '#333', align: 'center' }); ctx.restore(); }
    if (t > T('H071', '90')) { counter(ctx, 90 * E.out(prog(t, T('H071', '90'), T('H071', '90') + .6)), 1350, 440, { size: 170, color: '#fff', align: 'center' }); text(ctx, 'COMPANIES', 1350, 510, { font: F.osw, size: 40, color: HM.gold, align: 'center', weight: 600, ls: 8 }); }
    if (t > T('H071', '27')) { text(ctx, '27 LAKH', 1350, 760, { font: F.bebas, size: 170, color: HM.blood, align: 'center' }); text(ctx, 'SHARES', 1350, 830, { font: F.osw, size: 40, color: HM.gold, align: 'center', weight: 600, ls: 8 }); }
    text(ctx, 'ILLUSTRATION', 500, 760, { font: F.mono, size: 18, color: 'rgba(255,255,255,.45)', align: 'center' }); }, { name: 'c5-charge' });
  cue(T('H071', 'transfer'), 'paper', .6); cue(T('H071', '27'), 'hit', .6);
  shot(['H072', 'Uske'], (ctx, t, lt) => { pBG(ctx, 'highcourt', lt, { grade: 'duo', tint: 'navy', tintAmt: .5, shade: .5 }); files(ctx, 300, 900, 14, prog(t, T('H072', 'criminal'), T('H072', 'darj') + .5));
    if (t > T('H072', '70')) { text(ctx, '70+', 1100, 450, { font: F.bebas, size: 220, color: '#fff', align: 'center' }); text(ctx, 'CRIMINAL CASES', 1100, 520, { font: F.osw, size: 40, color: HM.gold, align: 'center', weight: 600, ls: 6 }); }
    if (t > T('H072', '600')) { text(ctx, '600+', 1550, 450, { font: F.bebas, size: 220, color: HM.blood, align: 'center' }); text(ctx, 'CIVIL CASES', 1550, 520, { font: F.osw, size: 40, color: HM.gold, align: 'center', weight: 600, ls: 6 }); } cred(ctx, 'highcourt'); }, { name: 'c5-cases' });
  cue(T('H072', '70'), 'stamp', .6); cue(T('H072', '600'), 'stamp', .7);
  shot(['H073', 'Lagbhag'], (ctx, t, lt) => { darkBG(ctx, t, '#101418', '#000'); text(ctx, 'LAGBHAG 3 MAHINE BAAD', W / 2, 300, { font: F.osw, size: 50, color: '#fff', align: 'center', weight: 600, ls: 8 });
    const op = prog(t, T('H073', 'bail'), T('H073', 'bail') + .8); ctx.save(); ctx.translate(-op * W, 0); bars(ctx, 1); ctx.restore(); if (t > T('H073', 'bail')) stamp(ctx, 'BAIL', W / 2, 600, t, T('H073', 'bail'), { size: 180, color: HM.green }); }, { name: 'c5-bail' });
  cue(T('H073', 'bail'), 'stamp', .8);
  shot(['H074', 'Aur'], (ctx, t, lt) => { darkBG(ctx, t, '#0E1626', '#03050A'); timeStamp(ctx, 'JUNE 1993', 120, 180, t, T('H074', 'June'), { size: 80 });
    if (t > T('H074', 'press')) { pill(ctx, 'PRESS CONFERENCE', 120, 330, { bg: HM.blood, size: 46 }); for (let i = 0; i < 6; i++) { if (t > T('H074', 'press') + i * .1) flash(ctx, t, T('H074', 'press') + i * .4, .06); } }
    if (t > T('H074', 'Ram')) frame(ctx, 'jethmalani', 1100, 180, 520, 620, { grade: 'color', label: 'RAM JETHMALANI · VAKEEL', labelBg: '#222' }); if (t > T('H074', 'Ram')) cred(ctx, 'jethmalani'); }, { name: 'c5-press' });
  cue(T('H074', 'press'), 'shutter', .8); cue(T('H074', 'press') + .4, 'shutter', .6);
  shot(['H075', 'Harshad'], (ctx, t, lt) => { pBG(ctx, 'rao_fort', lt, { grade: 'warm', shade: .3 }); kicker(ctx, 'HARSHAD KA DAAVA', 120, 160, t, T('H075', 'daava'), { color: HM.gold });
    lowerTag(ctx, 'P. V. NARASIMHA RAO', 'Prime Minister, 1991–96', t, T('H075', 'Narasimha')); if (t > T('H075', 'crore')) rsText(ctx, '1 CRORE?', 1450, 400, { size: 150, glow: 'rgba(255,190,60,.6)' }); cred(ctx, 'rao_fort'); }, { name: 'c5-claim' });
  cue(T('H075', 'crore'), 'cash', .7);
  shot(['H076', 'Party'], (ctx, t, lt) => { darkBG(ctx, t, '#14100A', '#000'); pill(ctx, '"PARTY DONATION"', W / 2, 200, { align: 'center', bg: '#333', size: 46 }); suitcase(ctx, W / 2, 620, 1.3, prog(t, T('H076', 'suitcase'), T('H076', 'suitcase') + .4));
    text(ctx, 'ILLUSTRATION', W / 2 + 330, 860, { font: F.mono, size: 20, color: 'rgba(255,255,255,.5)', align: 'right' }); }, { name: 'c5-case' });
  cue(T('H076', 'suitcase'), 'thud', .7);
  shot(['H077', 'Achanak'], (ctx, t, lt) => { yellowBG(ctx); suitcase(ctx, 520, 600, .9, 0, { col: '#3A3A44' }); punch(ctx, '1 CRORE', 1260, 380, t, T('H077', 'crore'), { font: F.bebas, size: 170, color: '#111' });
    punch(ctx, '=', 1260, 540, t, T('H077', 'ek', 'e') , { font: F.bebas, size: 150, color: '#111' }); punch(ctx, '1 SUITCASE?', 1260, 700, t, T('H077', 'suitcase'), { font: F.bebas, size: 170, color: HM.blood }); capBand2(ctx); }, { name: 'c5-joke' });
  cue(T('H077', 'suitcase'), 'ding', .8);
  shot(['H078', 'Narasimha'], (ctx, t, lt) => { pBG(ctx, 'rao_tv', lt, { grade: 'duo', tint: 'navy', tintAmt: .5, shade: .3 }); if (t > T('H078', 'inkaar')) stamp(ctx, 'AAROP SE INKAAR', W / 2, 820, t, T('H078', 'inkaar'), { size: 110, color: '#fff' }); cred(ctx, 'rao_tv'); }, { name: 'c5-deny' });
  cue(T('H078', 'inkaar'), 'stamp', .8);
  shot(['H079', 'Aur'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1322'); kicker(ctx, 'CBI JAANCH', 600, 360, t, T('H079', 'CBI'), { color: HM.gold }); dataRow(ctx, 'PAKKA SABOOT', 'NAHI MILA', 610, 470, t, T('H079', 'saboot'), { size: 110, gap: 130, color: HM.blood }); }, { name: 'c5-cbi' });
  cue(T('H079', 'nahi'), 'hit', .5);
  shot(['H080', 'Kuch'], (ctx, t, lt) => { darkBG(ctx, t); ctx.fillStyle = 'rgba(255,195,77,.08)'; ctx.fillRect(0, 0, W / 2, H); ctx.fillStyle = 'rgba(232,64,47,.08)'; ctx.fillRect(W / 2, 0, W / 2, H);
    if (t > T('H080', 'sach')) glowText(ctx, 'SACH?', W / 4, 580, { font: F.bebas, size: 220, color: HM.gold, align: 'center', glow: 'rgba(255,195,77,.6)' }); if (t > T('H080', 'chaal')) glowText(ctx, 'CHAAL?', W * .75, 580, { font: F.bebas, size: 220, color: HM.blood, align: 'center', glow: 'rgba(232,64,47,.6)' });
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(W / 2 - 2, 200, 4, 680); }, { name: 'c5-split' });
  cue(T('H080', 'sach'), 'whoosh', .5); cue(T('H080', 'chaal'), 'whoosh', .5);
  // ================= CH 6
  shot(['H081', 'Chapter'], (ctx, t, lt) => chapterCard(ctx, t, lt, T('H081', 'Chapter'), 6, 'BIG BULL KA ANT', 'bse_tall'), { lead: .4, name: 'c6' });
  cue(T('H081', 'Chapter') - .1, 'riser', .4); cue(T('H081', 'ant.'), 'thud', .6);
  shot(['H082', 'Bail'], (ctx, t, lt) => { darkBG(ctx, t, '#03100A', '#000'); screenGrid(ctx, 960, 200, 820, 680, t); kicker(ctx, 'COMEBACK', 140, 300, t, T('H082', 'comeback'), { color: HM.green });
    if (t > T('H082', 'tips')) pill(ctx, 'MARKET TIPS', 140, 480, { bg: '#1B5E20', size: 50 }); if (t > T('H082', 'plans')) pill(ctx, 'NAYE PLANS', 140, 620, { bg: '#1B5E20', size: 50 }); }, { name: 'c6-back' });
  cue(T('H082', 'tips'), 'tick', .5); cue(T('H082', 'plans'), 'tick', .5);
  shot(['H083', 'Par'], (ctx, t, lt) => { pBG(ctx, 'bull_bse', lt, { grade: 'bw', shade: .55 }); gauge(ctx, W / 2, 640, 260, lerp(.7, .04, E.inOut(prog(t, T('H083', 'bharosa'), T('H083', 'bharosa') + 1))), 'BHAROSA'); cred(ctx, 'bull_bse'); }, { name: 'c6-trust' });
  cue(T('H083', 'bharosa'), 'thud', .6);
  shot(['H084', 'SEBI'], (ctx, t, lt) => { pBG(ctx, 'sebi', lt, { grade: 'color', shade: .3 }); lowerTag(ctx, 'SEBI', 'Securities and Exchange Board of India', t, T('H084', 'SEBI'));
    if (t > T('H084', 'ban')) stamp(ctx, 'LIFETIME BAN', W / 2, 460, t, T('H084', 'ban'), { size: 150, color: HM.blood }); cred(ctx, 'sebi'); }, { name: 'c6-ban' });
  cue(T('H084', 'ban'), 'stamp', 1);
  shot(['H085', '1999'], (ctx, t, lt) => { pBG(ctx, 'highcourt', lt, { grade: 'duo', tint: 'navy', tintAmt: .5, shade: .5 }); timeStamp(ctx, '1999', 120, 180, t, T('H085', '1999'), { size: 100 });
    gavel(ctx, 520, 760, 1, t, T('H085', 'doshi')); if (t > T('H085', 'Paanch')) { text(ctx, '5 SAAL', 1300, 560, { font: F.bebas, size: 220, color: '#fff', align: 'center' }); text(ctx, 'KI SAZA (EK CASE MEIN)', 1300, 640, { font: F.osw, size: 44, color: HM.gold, align: 'center', weight: 600, ls: 6 }); } cred(ctx, 'highcourt'); }, { name: 'c6-convict' });
  cue(T('H085', 'doshi'), 'thud', 1);
  shot(['H086', 'Baaki'], (ctx, t, lt) => { darkBG(ctx, t, '#14100A', '#000'); files(ctx, W / 2, 920, 24, prog(t, T('H086', 'Baaki'), T('H086', 'rahe') + .3)); text(ctx, 'DARJANON CASE · ABHI JAARI', W / 2, 160, { font: F.bebas, size: 90, color: '#fff', align: 'center' }); }, { name: 'c6-files' });
  cue(T('H086', 'Baaki'), 'paper', .5);
  shot(['H087', '31'], (ctx, t, lt) => { bgGrad(ctx, '#0A0806', '#000', 'r'); candle(ctx, W / 2, 640, 1.4, t); text(ctx, '31 DECEMBER 2001', W / 2, 260, { font: F.osw, size: 56, color: 'rgba(246,240,228,.85)', align: 'center', weight: 500, ls: 10, alpha: prog(t, T('H087', '31'), T('H087', '31') + .8) });
    text(ctx, 'Thane', W / 2, 340, { font: F.playI, size: 44, color: 'rgba(246,240,228,.6)', align: 'center', alpha: prog(t, T('H087', 'Thane'), T('H087', 'Thane') + .8) }); fadeIn(ctx, t, T('H087', '31') - .4, 1); }, { lead: .5, name: 'c6-death' });
  shot(['H088', 'Hospital'], (ctx, t, lt) => { bgGrad(ctx, '#0A0806', '#000', 'r'); candle(ctx, W / 2 - 160, 660, 1.1, t); candle(ctx, W / 2 + 160, 660, 1.1, t + 1.3);
    text(ctx, 'HARSHAD MEHTA', W / 2, 330, { font: F.play, size: 80, color: 'rgba(246,240,228,.9)', align: 'center', weight: 700, alpha: prog(t, T('H088', 'Hospital'), T('H088', 'Hospital') + 1) });
    text(ctx, '1954 – 2001', W / 2, 410, { font: F.osw, size: 44, color: 'rgba(246,240,228,.6)', align: 'center', weight: 500, ls: 10, alpha: prog(t, T('H088', 'Umar'), T('H088', 'Umar') + 1) }); }, { name: 'c6-rip' });
  shot(['H089', 'Jab'], (ctx, t, lt) => { bgGrad(ctx, '#0A0806', '#000', 'r'); files(ctx, W / 2, 900, 10, 1); shade(ctx, .3); text(ctx, 'CASES: TAB BHI JAARI', W / 2, 260, { font: F.osw, size: 54, color: 'rgba(246,240,228,.75)', align: 'center', weight: 500, ls: 8, alpha: prog(t, T('H089', 'Jab'), T('H089', 'Jab') + .8) }); fadeOut(ctx, t, T('H090', 'Chapter') - .2, .5); }, { name: 'c6-after' });
  // ================= CH 7
  shot(['H090', 'Chapter'], (ctx, t, lt) => chapterCard(ctx, t, lt, T('H090', 'Chapter'), 7, 'WO SCAM JISNE BAZAAR BADAL DIYA', 'nse'), { lead: .3, name: 'c7' });
  cue(T('H090', 'Chapter') - .1, 'riser', .4); cue(T('H090', 'scam'), 'impact', .6);
  shot(['H091', 'Is'], (ctx, t, lt) => { pBG(ctx, 'sebi', lt, { grade: 'warm', shade: .35, fx: .6 }); if (t > T('H091', 'taaqat')) glowText(ctx, 'SEBI KO ASLI TAAQAT', W / 2, 330, { font: F.bebas, size: 140, color: '#fff', align: 'center', glow: 'rgba(120,200,255,.6)' });
    if (t > T('H091', 'Kanoon')) pill(ctx, 'NAYA KANOON', 700, 640, { align: 'center', bg: '#1E4E8C', size: 54 }); if (t > T('H091', 'rules')) pill(ctx, 'SAKHT RULES', 1220, 640, { align: 'center', bg: HM.blood, size: 54 }); cred(ctx, 'sebi'); }, { name: 'c7-sebi' });
  cue(T('H091', 'Kanoon'), 'stamp', .6); cue(T('H091', 'rules'), 'stamp', .6);
  shot(['H092', 'Bank'], (ctx, t, lt) => { darkBG(ctx, t, '#1B140E', '#050302'); brReceipt(ctx, W / 2, 560, 1.1, t, {}); if (t > T('H092', 'badla')) stamp(ctx, 'SYSTEM BADLA', W / 2, 560, t, T('H092', 'badla'), { size: 140, color: HM.green, rot: -.15 }); }, { name: 'c7-br' });
  cue(T('H092', 'badla'), 'stamp', .8);
  shot(['H093', 'Aur'], (ctx, t, lt) => { pBG(ctx, 'nse', lt, { grade: 'color', shade: .25 }); timeStamp(ctx, '1994 · NSE', 120, 180, t, T('H093', '1994'), { size: 90 });
    if (t > T('H093', 'screen')) { ctx.save(); ctx.globalAlpha = prog(t, T('H093', 'screen'), T('H093', 'screen') + .4); screenGrid(ctx, 1100, 280, 700, 560, t); ctx.restore(); } if (t > T('H093', 'computer.')) pill(ctx, 'JOBBERS → COMPUTER', 120, 900, { bg: '#111', color: HM.green, size: 50 }); cred(ctx, 'nse'); }, { name: 'c7-nse' });
  cue(T('H093', 'screen'), 'key', .6);
  shot(['H094', 'Floor'], (ctx, t, lt) => { const p = prog(t, T('H094', 'khatam'), T('H094', 'khatam') + 1); darkBG(ctx, t, '#03100A', '#000'); ctx.save(); ctx.globalAlpha = 1 - p; crowd(ctx, t, 900, 12, { shout: true }); ctx.restore();
    ctx.save(); ctx.globalAlpha = p; screenGrid(ctx, 360, 160, 1200, 640, t); ctx.restore(); if (t > T('H094', 'chupchaap')) punch(ctx, 'SHHH...', W / 2, 940, t, T('H094', 'chupchaap'), { font: F.bebas, size: 140, color: '#fff' }); }, { name: 'c7-quiet' });
  cue(T('H094', 'chupchaap'), 'ding', .4);
  shot(['H095', 'Aur'], (ctx, t, lt) => { board(ctx, t); figCard(ctx, W / 2, 500, 340, 460, 'KETAN PAREKH', 1, { rot: .03 }); sticky(ctx, 'YAAD\nHAI?', 1460, 400, .08, prog(t, T('H095', 'yaad'), T('H095', 'yaad') + .3)); text(ctx, 'ILLUSTRATION', W / 2, 770, { font: F.mono, size: 20, color: 'rgba(255,255,255,.5)', align: 'center' }); }, { name: 'c7-ketan' });
  cue(T('H095', 'yaad'), 'paper', .6);
  shot(['H096', '2001'], (ctx, t, lt) => { board(ctx, t); figCard(ctx, W / 2, 500, 340, 460, 'KETAN PAREKH', 1, { rot: .03 }); timeStamp(ctx, '2001', 120, 180, t, T('H096', '2001'), { size: 100 }); if (t > T('H096', 'scam')) stamp(ctx, 'EK AUR SCAM', W / 2, 560, t, T('H096', 'scam'), { size: 130, color: HM.blood }); }, { name: 'c7-ketan2' });
  cue(T('H096', 'scam'), 'stamp', .8);
  shot(['H097', 'Par'], (ctx, t, lt) => { darkBG(ctx, t); typewriter(ctx, 'WO KAHANI PHIR KABHI...', 520, 560, t, T('H097', 'Par'), 22, { size: 70, color: HM.gold }); }, { name: 'c7-later' });
  typeCues('WO KAHANI PHIR KABHI...', T('H097', 'Par'), 22, .4);
  shot(['H098', 'To'], (ctx, t, lt) => { darkBG(ctx, t, '#0E1626', '#03050A'); hmFigure(ctx, W / 2, 760, 1, { glow: 'rgba(255,255,255,.2)' }); text(ctx, 'KAUN THA?', W / 2, 200, { font: F.bebas, size: 110, color: '#fff', align: 'center', alpha: prog(t, T('H098', 'kaun'), T('H098', 'kaun') + .3) });
    if (t > T('H098', 'hero')) { glowText(ctx, 'HERO', 380, 560, { font: F.bebas, size: 200, color: HM.gold, align: 'center', glow: 'rgba(255,195,77,.7)' }); text(ctx, 'aam aadmi ko share market dikhaya', 380, 640, { font: F.playI, size: 36, color: 'rgba(255,255,255,.75)', align: 'center' }); } }, { name: 'c7-hero' });
  cue(T('H098', 'hero'), 'whoosh', .5);
  shot(['H099', 'Kuch'], (ctx, t, lt) => { darkBG(ctx, t, '#0E1626', '#03050A'); hmFigure(ctx, W / 2, 760, 1); glowText(ctx, 'HERO', 380, 560, { font: F.bebas, size: 200, color: HM.gold, align: 'center', glow: 'rgba(255,195,77,.7)' });
    if (t > T('H099', 'villain')) { glowText(ctx, 'VILLAIN', 1540, 560, { font: F.bebas, size: 200, color: HM.blood, align: 'center', glow: 'rgba(232,64,47,.7)' }); text(ctx, 'bank ka paisa daav pe', 1540, 640, { font: F.playI, size: 36, color: 'rgba(255,255,255,.75)', align: 'center' }); } }, { name: 'c7-villain' });
  cue(T('H099', 'villain'), 'whoosh', .5);
  shot(['H100', 'Par'], (ctx, t, lt) => { pBG(ctx, 'dalal_sign', lt, { grade: 'warm', shade: .35 }); if (t > T('H100', 'Dalal')) text(ctx, 'PEHLE JAISI NAHI RAHI', W / 2, 900, { font: F.bebas, size: 120, color: '#fff', align: 'center', shadow: 30 }); cred(ctx, 'dalal_sign'); }, { name: 'c7-dalal' });
  shot(['H101', 'Aapko'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1322'); text(ctx, 'AAPKO KYA LAGTA HAI?', W / 2, 260, { font: F.osw, size: 60, color: '#fff', align: 'center', weight: 600, ls: 8 });
    if (t > T('H101', 'mastermind')) pill(ctx, 'MASTERMIND?', 640, 560, { align: 'center', bg: HM.blood, size: 80 }); if (t > T('H101', 'chehra?')) pill(ctx, 'SIRF CHEHRA?', 1300, 560, { align: 'center', bg: '#1E4E8C', size: 80 }); }, { name: 'c7-q' });
  cue(T('H101', 'mastermind'), 'tick', .6); cue(T('H101', 'chehra?'), 'tick', .6);
  shot(['H102', 'Comment'], (ctx, t, lt) => { bgGrad(ctx, '#120A24', '#000', 'r'); fog(ctx, t, .3, '140,90,255'); popIn(ctx, t, T('H102', 'Comment'), 560, 420, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-260, -110, 520, 200, 40); g.fill(); g.beginPath(); g.moveTo(-120, 88); g.lineTo(-170, 160); g.lineTo(-40, 88); g.fill(); text(g, 'COMMENT KARO', 0, 20, { font: F.bebas, size: 80, color: '#111', align: 'center' }); });
    glowText(ctx, 'EDUANIMHUB', 1300, 440, { font: F.play, size: 110, color: '#fff', align: 'center', weight: 700, glow: 'rgba(138,92,246,.9)' });
    const tw = T('H102', 'subscribe'); if (t > tw - .2) { const p = Math.max(0, E.back(prog(t, tw - .2, tw + .1))); ctx.save(); ctx.translate(1300, 720); ctx.scale(p, p); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-300, -75, 600, 150, 75); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 28, { font: F.bebas, size: 90, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, 1); }, { name: 'end' });
  cue(T('H102', 'subscribe'), 'impact', .7);
}
