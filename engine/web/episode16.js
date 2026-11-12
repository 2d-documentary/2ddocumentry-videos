// episode16.js — 16:9 shot engine: cached set backgrounds, Ken Burns camera, talking characters, overlay FX
'use strict';
const BG = {};   // cache: key -> canvas
function bgCanvas(name, blur = 0) {
  const key = name + '|' + blur; if (BG[key]) return BG[key];
  let c;
  if (blur) { const src = bgCanvas(name, 0); c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d'); g.filter = `blur(${blur}px)`; g.drawImage(src, 0, 0); g.filter = 'none'; g.fillStyle = 'rgba(250,236,210,.12)'; g.fillRect(0, 0, 1920, 1080); }
  else { c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d'); const [set, extra] = name.split('+'); SETS[set](g, {}); if (extra && window.EXTRA && EXTRA[extra]) EXTRA[extra](g); }
  BG[key] = c; return c;
}
const SPEAKER2CAST = { NARMER: 'NARMER', KHUFU: 'KHUFU', HATSHEPSUT: 'HATSHEPSUT', AKHENATEN: 'AKHENATEN', TUT: 'TUT', RAMESSES: 'RAMESSES', CLEOPATRA: 'CLEOPATRA', VIZIER: 'VIZIER', SOLDIER: 'SOLDIER', WORKER: 'WORKER_EG', CAESAR: 'CAESAR', ANTONY: 'ANTONY', OCTAVIAN: 'OCTAVIAN' };
const CAST2SPEAKER = Object.fromEntries(Object.entries(SPEAKER2CAST).map(([a, b]) => [b, a]));
function activeLine(t) { for (const l of TL.lines) if (t >= l.start - .02 && t <= l.end + .05) return l; return null; }
function talkingNow(speaker, t) { const l = activeLine(t); if (!l || l.speaker !== speaker) return false; // mouth moves only during words, closes in gaps between words
  for (const w of l.words) if (t >= w.s && t <= w.e + .03) return true; return false; }
function at(spec) { if (spec == null) return 0; if (typeof spec === 'number') return spec; return wt(spec[0], spec[1] ?? 0); }

// ---------- characters in shots ----------
function drawCast(ctx, chars, t, lt, sh) {
  const sorted = chars.slice().sort((a, b) => (a.y ?? 1000) - (b.y ?? 1000));
  for (const c of sorted) {
    const ch = CAST[c.c]; if (!ch) continue; const spk = CAST2SPEAKER[c.c];
    let o = { x: c.x, y: c.y ?? 1000, s: c.s ?? 60, flip: c.flip, t, bob: c.bob ?? 1.2, eyes: c.eyes || 'neutral', mouth: c.mouth || 'smile', armL: c.armL || 'down', armR: c.armR || 'down', sweat: c.sweat, blinkPhase: (c.x || 0) * .013 };
    for (const r of (c.react || [])) if (t >= at(r[0])) Object.assign(o, r[1]);
    const talking = spk && talkingNow(spk, t); if (talking) { o.talk = true; if (c.talkArm) o.armR = c.talkArm; }
    if (c.enter) { const k = E.out(clamp(lt / .45, 0, 1)); o.x += (1 - k) * (c.enter === 'L' ? -900 : 900); }
    if (c.hop && talking) o.y -= Math.abs(Math.sin(t * 9)) * 6;
    if (c.shadow !== false) { ctx.save(); ctx.globalAlpha = .4; ctx.fillStyle = '#3A2214'; ctx.beginPath(); ctx.ellipse(o.x, o.y + o.s * .04, o.s * 1.35, o.s * .3, 0, 0, 7); ctx.fill(); ctx.restore(); }
    drawCharacter(ctx, ch, o);
  }
}

// ---------- overlay FX (screen space) ----------
function fxText(ctx, text, x, y, size, col = '#FFF8EA', ink = '#1C1614', align = 'center') { ctx.save(); ctx.font = `700 ${size}px Poppins`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * .22; ctx.strokeStyle = ink; ctx.strokeText(text, x, y); ctx.fillStyle = col; ctx.fillText(text, x, y); ctx.restore(); }
function fxDate(ctx, text, k) { if (k <= 0) return; ctx.save(); ctx.translate(250, 120); ctx.rotate(-.04); ctx.scale(k, k); ctx.font = '700 64px Poppins'; const w = ctx.measureText(text).width + 70; inkFill(ctx, c => c.roundRect(-w / 2, -50, w, 100, 18), '#C8202B', 6); fxText(ctx, text, 0, 4, 64, '#FFF8EA', '#5A0E10'); ctx.restore(); }
function fxLabel(ctx, text, x, y, k, col = '#FFF8EA', size = 46) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); fxText(ctx, text, 0, 0, size, col); ctx.restore(); }
function fxCard(ctx, title, sub, k) { if (k <= 0) return; ctx.save(); ctx.translate(960, 520); ctx.scale(k, k); fxText(ctx, title, 0, -40, 96, '#F2C14E', '#2A1A0E'); if (sub) fxText(ctx, sub, 0, 70, 52, '#FFF8EA', '#2A1A0E'); ctx.restore(); }
function fxArrow(ctx, pts, p, col = '#C8202B', w = 14) { if (p <= 0) return; const P = spline(pts, false, 10); const n = Math.max(2, Math.floor(P.length * clamp(p, 0, 1))); const Q = P.slice(0, n); inkLine(ctx, Q, w + 8, { col: '#1C1614' }); inkLine(ctx, Q, w, { col }); const a = Q[Q.length - 1], b = Q[Q.length - 2]; const ang = Math.atan2(a[1] - b[1], a[0] - b[0]); const hd = [[a[0] + Math.cos(ang) * 30, a[1] + Math.sin(ang) * 30], [a[0] + Math.cos(ang + 2.4) * 30, a[1] + Math.sin(ang + 2.4) * 30], [a[0] + Math.cos(ang - 2.4) * 30, a[1] + Math.sin(ang - 2.4) * 30]]; poly(ctx, hd, col, '#1C1614', 4); }
function fxIcon(ctx, kind, x, y, s, k, t) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k / 100, s * k / 100);
  const B = (fn, col, sh) => blob(ctx, fn, col, { lw: 4, shade: sh });
  if (kind === 'ufo') { B(g => { g.ellipse(0, 0, 90, 26, 0, 0, 7); g.moveTo(40, -10); g.ellipse(0, -14, 40, 34, 0, Math.PI, 0); }, '#B8C4CC'); for (let i = -2; i <= 2; i++) { ctx.fillStyle = (Math.floor(t * 6) + i) % 2 ? '#F2C14E' : '#7FD3E8'; ctx.beginPath(); ctx.arc(i * 32, 6, 7, 0, 7); ctx.fill(); } ctx.fillStyle = 'rgba(180,240,200,.35)'; ctx.beginPath(); ctx.moveTo(-50, 20); ctx.lineTo(50, 20); ctx.lineTo(90, 220); ctx.lineTo(-90, 220); ctx.fill(); }
  if (kind === 'bread') { B(g => { g.ellipse(-60, 0, 55, 34, 0, 0, 7); }, '#D9A458', g => { g.strokeStyle = '#9A6A30'; g.lineWidth = 4; for (const dx of [-80, -60, -40]) { g.beginPath(); g.moveTo(dx, -20); g.lineTo(dx + 10, 10); g.stroke(); } }); B(g => { g.roundRect(30, -60, 70, 100, 12); }, '#E8B04A', g => { g.fillStyle = '#FFF6E0'; g.fillRect(25, -66, 80, 26); }); }
  if (kind === 'beard') { B(g => { g.moveTo(-26, -60); g.lineTo(26, -60); g.lineTo(20, 50); g.quadraticCurveTo(0, 70, -20, 50); g.closePath(); }, '#3A2A1E', g => { g.strokeStyle = '#D9B24E'; g.lineWidth = 5; for (let yy = -45; yy < 50; yy += 14) { g.beginPath(); g.moveTo(-24, yy); g.lineTo(24, yy); g.stroke(); } }); }
  if (kind === 'monkey') { B(g => { g.arc(0, 0, 50, 0, 7); g.moveTo(-40, -30); g.arc(-52, -30, 18, 0, 7); g.moveTo(88, -30); g.arc(52, -30, 18, 0, 7); }, '#7A5634', g => { g.fillStyle = '#D9B48A'; g.beginPath(); g.ellipse(0, 12, 34, 28, 0, 0, 7); g.fill(); }); ctx.fillStyle = '#1C1614'; for (const ex of [-16, 16]) { ctx.beginPath(); ctx.arc(ex, -8, 6, 0, 7); ctx.fill(); } }
  if (kind === 'mask') { B(g => { g.moveTo(-70, -90); g.lineTo(70, -90); g.lineTo(95, 40); g.lineTo(60, 100); g.lineTo(-60, 100); g.lineTo(-95, 40); g.closePath(); }, '#E8B83E', g => { g.strokeStyle = '#2F5FA8'; g.lineWidth = 9; for (let yy = -70; yy < 100; yy += 20) { g.beginPath(); g.moveTo(-95, yy); g.lineTo(-55, yy); g.moveTo(55, yy); g.lineTo(95, yy); g.stroke(); } g.fillStyle = '#F2CC5E'; g.beginPath(); g.ellipse(0, 0, 44, 58, 0, 0, 7); g.fill(); }); ctx.fillStyle = '#1C1614'; for (const ex of [-18, 18]) { ctx.beginPath(); ctx.ellipse(ex, -10, 10, 5, 0, 0, 7); ctx.fill(); } }
  if (kind === 'scales') { inkLine(ctx, [[0, 90], [0, -60]], 10, { col: '#8A6A3A' }); const tilt = Math.sin(t * 1.5) * .12; ctx.save(); ctx.rotate(tilt); inkLine(ctx, [[-110, -60], [110, -60]], 9, { col: '#8A6A3A' }); for (const sx of [-1, 1]) { inkLine(ctx, [[sx * 110, -60], [sx * 110, -10]], 3); B(g => { g.ellipse(sx * 110, -6, 40, 10, 0, 0, Math.PI); g.closePath(); }, '#D9B24E'); } ctx.restore(); B(g => { g.moveTo(-110, -50); g.bezierCurveTo(-140, -90, -110, -110, -110, -80); g.bezierCurveTo(-110, -110, -80, -90, -110, -50); }, '#C0453A'); B(g => { g.ellipse(110, -40, 8, 34, .2, 0, 7); }, '#F1EADB'); }
  if (kind === 'brain') { B(g => { g.ellipse(0, 0, 70, 50, 0, 0, 7); }, '#E8A0A8', g => { g.strokeStyle = '#B86A78'; g.lineWidth = 5; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 18, -40); g.bezierCurveTo(i * 18 + 14, -10, i * 18 - 14, 10, i * 18, 40); g.stroke(); } }); }
  if (kind === 'stone') { B(g => { g.moveTo(-80, 110); g.lineTo(-90, -60); g.lineTo(-40, -110); g.lineTo(60, -100); g.lineTo(90, 110); g.closePath(); }, '#4A4A52', g => { g.strokeStyle = '#8A8A94'; g.lineWidth = 3; for (let yy = -80; yy < 100; yy += 12) { g.beginPath(); g.moveTo(-80, yy); g.lineTo(80, yy); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(-90, -40, 180, 6); g.fillRect(-90, 30, 180, 6); }); }
  if (kind === 'treaty') { B(g => { g.roundRect(-90, -110, 180, 220, 20); }, '#C9A06A', g => { g.strokeStyle = '#7A5634'; g.lineWidth = 3; for (let yy = -90; yy < 100; yy += 14) { g.beginPath(); g.moveTo(-70, yy); for (let xx = -70; xx < 70; xx += 10) g.lineTo(xx, yy + (xx % 20 ? 4 : 0)); g.stroke(); } }); }
  if (kind === 'grain') { B(g => { g.moveTo(-90, 80); g.quadraticCurveTo(-100, -40, -40, -70); g.lineTo(40, -70); g.quadraticCurveTo(100, -40, 90, 80); g.closePath(); }, '#C9A05A', g => { g.fillStyle = '#E8CF7A'; g.beginPath(); g.ellipse(0, -66, 46, 16, 0, 0, 7); g.fill(); }); }
  if (kind === 'chair') { for (const [dx, h] of [[-50, 1], [50, 1], [-50, .55]]) inkLine(ctx, [[dx, 30], [dx + (h < 1 ? 20 : 0), 30 + 100 * h]], 12, { col: '#7A5634' }); B(g => { g.roundRect(-70, -10, 140, 40, 8); }, '#A87A4A'); }
  ctx.restore(); }
function fxFlash(ctx, t, a, dur = .15) { if (t < a || t > a + dur) return; ctx.fillStyle = `rgba(255,255,255,${(1 - (t - a) / dur) * .8})`; ctx.fillRect(0, 0, 1920, 1080); }
function fxBars(ctx, k) { if (k <= 0) return; ctx.fillStyle = '#0E0A08'; ctx.fillRect(0, 0, 1920, 90 * k); ctx.fillRect(0, 1080 - 90 * k, 1920, 90 * k); }

// ---------- shot runner ----------
function runShot(ctx, sh, t, lt) {
  const cam = sh.cam || [1, 1.04, 960, 540]; const p = E.inOut(clamp(lt / Math.max(.5, sh.dur), 0, 1));
  const s = Math.max(1, lerp(cam[0], cam[1], p)); const fx = clamp(lerp(cam[2], cam[4] ?? cam[2], p), 960 / s, 1920 - 960 / s), fy = clamp(lerp(cam[3], cam[5] ?? cam[3], p), 540 / s, 1080 - 540 / s);
  let shake = 0; for (const f of (sh.fx || [])) if (f.t === 'shake') { const a = at(f.at); if (t > a && t < a + (f.dur || .5)) shake = (1 - (t - a) / (f.dur || .5)) * (f.amt || 14); }
  ctx.save(); ctx.translate(960 + (shake ? Math.sin(t * 90) * shake : 0), 540 + (shake ? Math.cos(t * 77) * shake : 0)); ctx.scale(s, s); ctx.translate(-fx, -fy);
  ctx.drawImage(bgCanvas(sh.bg, sh.blur || 0), 0, 0);
  if (sh.under) sh.under(ctx, t, lt, sh);
  if (sh.chars) drawCast(ctx, sh.chars, t, lt, sh);
  if (sh.over) sh.over(ctx, t, lt, sh);
  ctx.restore();
  for (const f of (sh.fx || [])) { const a = at(f.at), k = popScale(t, a, .25); const out = f.until ? t > at(f.until) : false; if (out) continue;
    if (f.t === 'date') fxDate(ctx, f.text, k); else if (f.t === 'label') fxLabel(ctx, f.text, f.x, f.y, k, f.col, f.size); else if (f.t === 'card') fxCard(ctx, f.text, f.sub, k);
    else if (f.t === 'big') bigNumber(ctx, f.text, f.x ?? 960, f.y ?? 420, k, f.col, f.size ?? 170); else if (f.t === 'arrow') fxArrow(ctx, f.pts, (t - a) / (f.dur || .8), f.col, f.w);
    else if (f.t === 'icon') fxIcon(ctx, f.kind, f.x, f.y + (f.bob ? Math.sin(t * 3) * 10 : 0), f.s || 100, k, t); else if (f.t === 'flash') fxFlash(ctx, t, a); else if (f.t === 'bars') fxBars(ctx, clamp((t - a) / .4, 0, 1));
    else if (f.t === 'fn') f.fn(ctx, t, t - a, k); }
}
