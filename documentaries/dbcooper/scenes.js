// D.B. Cooper — INK AND ANTIQUITY (full documentary, 16:9). Every shot is keyed to narration words.
'use strict';
const EP = {
  images: { vault_p1: 'archives/documents/vault1_p1.jpg', vault_p3: 'archives/documents/vault1_p3.jpg', vault_p5: 'archives/documents/vault1_p5.jpg', vault_p8: 'archives/documents/vault1_p8.jpg' },
  credit: {},
  scenes,
};
const PLACES = { PDX: [-122.597, 45.589], SEA: [-122.309, 47.449], JUMP: [-122.56, 45.95], RENO: [-119.768, 39.499], TENA: [-122.77, 45.72],
  TACOMA: [-122.44, 47.25], MCCHORD: [-122.476, 47.137], ARIEL: [-122.56, 45.95], CASTLE: [-122.65, 46.27], MERWIN: [-122.5, 45.97] };

// ---------------------------------------------------------------- helpers
const cr = k => { const c = EP.credit[k]; return c ? (c.length > 80 ? c.slice(0, 77) + '…' : c) : ''; };
function imgCam(ctx, key, cam, o = {}) {
  const im = IMG[key]; if (!im) { placeholder(ctx, key, {}); return (x, y) => [x, y]; }
  const base = (o.contain ? Math.min : Math.max)(W / im.width, H / im.height), s = base * cam.s;
  const tx = W / 2 - cam.x * s, ty = H / 2 - cam.y * s;
  ctx.save(); ctx.filter = o.filter || GRADES[o.grade || 'color']; if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.drawImage(im, tx, ty, im.width * s, im.height * s); ctx.restore();
  if (o.tint) { ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.fillStyle = TINTS[o.tint] || o.tint; ctx.globalAlpha = o.tintAmt ?? 1; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  return (x, y) => [tx + x * s, ty + y * s];
}
function camAt(kfs, lt) {
  if (lt <= kfs[0][0]) return { x: kfs[0][1], y: kfs[0][2], s: kfs[0][3] };
  for (let i = 1; i < kfs.length; i++) if (lt < kfs[i][0]) { const a = kfs[i - 1], b = kfs[i], u = E.inOut((lt - a[0]) / (b[0] - a[0]));
    return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), s: lerp(a[3], b[3], u) }; }
  const z = kfs[kfs.length - 1]; return { x: z[1], y: z[2], s: z[3] };
}
const T = (id, w, which) => wt(id, w, which);
function shade(ctx, a = .45, c = '0,0,0') { ctx.fillStyle = `rgba(${c},${a})`; ctx.fillRect(0, 0, W, H); }
function gradeTop(ctx, a = .55) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.4, 'rgba(0,0,0,0)'); g.addColorStop(.7, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function kicker(ctx, s, x, y, t, t0, o = {}) {
  const p = E.out(prog(t, t0, t0 + .35)); if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = o.color || PAL.red2; ctx.fillRect(x, y - 30, 8, 38);
  text(ctx, s, x + 22, y, { font: F.osw, size: o.size || 34, color: o.textColor || PAL.cream, weight: 600, ls: 6 }); ctx.restore();
}
function bigTitle(ctx, s, x, y, t, t0, o = {}) { wipeText(ctx, s, x, y, prog(t, t0, t0 + (o.dur || .45)), { size: o.size || 170, color: o.color || PAL.cream, align: o.align, bar: true, barColor: o.bar || PAL.red2 }); }
function pinMap(ctx, pr, key, t, t0, label, o) { const [x, y] = pr(...PLACES[key]); pin(ctx, x, y, t, t0, label, o); return [x, y]; }
function pin(ctx, x, y, t, t0, label, o = {}) {
  if (t <= t0) return; const p = E.back(prog(t, t0, t0 + .35)); if (p <= 1e-6) return;
  const pulse = ((t - t0) % 1.2) / 1.2, col = o.color || PAL.red2;
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.globalAlpha = 1 - pulse; ctx.beginPath(); ctx.arc(0, 0, 14 + 50 * pulse, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.shadowColor = col; ctx.shadowBlur = 25; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 13 * Math.max(0, p), 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 5 * Math.max(0, p), 0, 7); ctx.fill();
  if (label) { const lp = prog(t, t0 + .15, t0 + .5); ctx.globalAlpha = lp; ctx.font = `${o.size || 44}px ${F.bebas}`; ctx.letterSpacing = '3px';
    const w = ctx.measureText(label).width, lx = o.left ? -w - 60 : 32; ctx.fillStyle = 'rgba(10,12,18,.88)'; ctx.fillRect(lx - 14, -30, w + 28, 54);
    ctx.fillStyle = col; ctx.fillRect(lx - 14, -30, 5, 54); ctx.fillStyle = PAL.cream; ctx.fillText(label, lx, 12); }
  ctx.restore();
}
function route(ctx, a, b, p, o = {}) {
  if (p <= 0) return; const c = o.ctrl || [(a[0] + b[0]) / 2 + 80, (a[1] + b[1]) / 2];
  const pt = u => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
  ctx.save(); ctx.lineCap = 'round'; const n = Math.floor(80 * clamp(p));
  for (const [lw, col] of [[16, 'rgba(255,70,50,.18)'], [o.lw || 5, o.color || '#FF5A48']]) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(lw > 10 ? [] : (o.dash || [16, 10])); ctx.beginPath(); ctx.moveTo(...a);
    for (let i = 1; i <= n; i++) ctx.lineTo(...pt(i / 80)); ctx.stroke(); }
  ctx.setLineDash([]);
  if (o.plane && p < 1) { const u = clamp(p), [x, y] = pt(u), [x2, y2] = pt(Math.min(1, u + .01)); ctx.translate(x, y); ctx.rotate(Math.atan2(y2 - y, x2 - x)); planeIcon(ctx, o.planeScale || 1.1); }
  ctx.restore();
}
function planeIcon(ctx, s = 1, color = '#FFFFFF') {
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = color; ctx.shadowColor = 'rgba(255,90,72,.9)'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(18, -5); ctx.lineTo(4, -5); ctx.lineTo(-6, -30); ctx.lineTo(-14, -30); ctx.lineTo(-8, -5);
  ctx.lineTo(-24, -5); ctx.lineTo(-32, -15); ctx.lineTo(-37, -15); ctx.lineTo(-33, 0); ctx.lineTo(-37, 15); ctx.lineTo(-32, 15); ctx.lineTo(-24, 5);
  ctx.lineTo(-8, 5); ctx.lineTo(-14, 30); ctx.lineTo(-6, 30); ctx.lineTo(4, 5); ctx.lineTo(18, 5); ctx.closePath(); ctx.fill(); ctx.restore();
}
function chuteIcon(ctx, x, y, s, p, o = {}) {
  if (p <= 0) return; const sc = s * E.back(clamp(p)), sw = Math.sin((o.t || 0) * 2.2 + x) * .06;
  ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.scale(sc, sc); ctx.strokeStyle = o.line || PAL.cream; ctx.lineWidth = 4; ctx.fillStyle = o.fill || PAL.red2;
  ctx.beginPath(); ctx.arc(0, 0, 70, Math.PI, 0); ctx.quadraticCurveTo(52, 14, 35, 0); ctx.quadraticCurveTo(17, 14, 0, 0); ctx.quadraticCurveTo(-17, 14, -35, 0); ctx.quadraticCurveTo(-52, 14, -70, 0); ctx.fill(); ctx.stroke();
  ctx.beginPath(); [-70, -35, 0, 35, 70].forEach(xx => { ctx.moveTo(xx, 4); ctx.lineTo(0, 110); }); ctx.stroke();
  ctx.fillStyle = o.line || PAL.cream; ctx.beginPath(); ctx.arc(0, 118, 10, 0, 7); ctx.fill(); ctx.fillRect(-8, 128, 16, 34); ctx.restore();
}
function personIcon(ctx, x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -36, 13, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-17, -18); ctx.lineTo(17, -18); ctx.lineTo(14, 20); ctx.lineTo(-14, 20); ctx.fill(); ctx.fillRect(-12, 20, 9, 26); ctx.fillRect(3, 20, 9, 26); ctx.restore(); }
// Blueprint Boeing 727 side view (nose at +x). stair 0..1, pitch radians
function b727(ctx, cx, cy, sc, o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-(o.pitch || 0)); ctx.scale(sc, sc);
  ctx.strokeStyle = o.line || 'rgba(200,225,255,.95)'; ctx.lineWidth = 3 / sc * 1.4; ctx.fillStyle = o.fill || 'rgba(120,170,230,.10)'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(420, 10); ctx.quadraticCurveTo(470, 12, 478, 30); ctx.quadraticCurveTo(470, 52, 420, 56); ctx.lineTo(-330, 56);
  ctx.quadraticCurveTo(-380, 54, -420, 30); ctx.lineTo(-450, 10); ctx.lineTo(-330, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-330, 4); ctx.lineTo(-400, -150); ctx.lineTo(-450, -150); ctx.lineTo(-450, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-470, -150); ctx.lineTo(-360, -150); ctx.lineTo(-380, -140); ctx.lineTo(-470, -140); ctx.closePath(); ctx.stroke();
  [[-300, 0], [-300, 26]].forEach(([x, y], i) => { ctx.beginPath(); ctx.ellipse(x, y + (i ? 20 : 4), 70, 14, 0, 0, 7); ctx.fill(); ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(60, 40); ctx.lineTo(-90, 48); ctx.lineTo(-140, 58); ctx.lineTo(10, 54); ctx.closePath(); ctx.stroke();
  for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.rect(380 - i * 26, 20, 10, 12); ctx.stroke(); }
  if (o.gear) { ctx.beginPath(); ctx.moveTo(-40, 56); ctx.lineTo(-40, 92); ctx.moveTo(360, 56); ctx.lineTo(360, 88); ctx.stroke(); [[-40, 98], [360, 94]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke(); }); }
  const a = (o.stair || 0) * 1.05;
  ctx.save(); ctx.translate(-330, 56); ctx.rotate(-a); ctx.strokeStyle = o.stairColor || '#FF5A48'; ctx.lineWidth = 6 / sc * 1.4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-110, 0); ctx.stroke(); for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-k * 20, 0); ctx.lineTo(-k * 20, -8); ctx.stroke(); }
  ctx.restore(); ctx.restore();
}
function blueprintLabel(ctx, s, x, y, o = {}) { text(ctx, s, x, y, { font: F.mono, size: o.size || 26, color: o.color || 'rgba(200,225,255,.85)', align: o.align }); }
function clockFace(ctx, x, y, r, h, m, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = o.color || PAL.cream; ctx.fillStyle = 'rgba(10,12,18,.6)'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * .82, -Math.cos(a) * r * .82); ctx.lineTo(Math.sin(a) * r * .94, -Math.cos(a) * r * .94); ctx.stroke(); }
  const ha = ((h % 12) + m / 60) / 12 * Math.PI * 2, ma = m / 60 * Math.PI * 2;
  ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * r * .5, -Math.cos(ha) * r * .5); ctx.stroke();
  ctx.strokeStyle = PAL.red2; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ma) * r * .78, -Math.cos(ma) * r * .78); ctx.stroke();
  ctx.fillStyle = PAL.red2; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.restore();
}
function noteCard(ctx, lines, t, starts, o = {}) {
  ctx.save(); ctx.translate(o.x ?? W / 2, o.y ?? H / 2); ctx.rotate(o.rot ?? -.025); const z = o.z ?? 1; ctx.scale(z, z);
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; ctx.fillStyle = PAL.cream; ctx.fillRect(-720, -300, 1440, 600); ctx.shadowColor = 'transparent';
  ctx.drawImage(paperTex(PAL.cream, 21, 1440, 600), -720, -300);
  lines.forEach((s, i) => hand(ctx, s, -640, -170 + i * 125, prog(t, starts[i] - .05, starts[i] + .45), { color: PAL.ink, size: 96, rot: 0 }));
  if (o.after) o.after(ctx);
  ctx.restore();
}
function photoShot(from, key, o = {}) {
  shot(from, (ctx, t, lt, sh) => {
    const u = clamp(lt / Math.max(2, sh.dur));
    photo(ctx, key, { zoom: lerp(o.z0 ?? 1.05, o.z1 ?? 1.16, u), fx: lerp(o.fx0 ?? .5, o.fx1 ?? .5, u), fy: lerp(o.fy0 ?? .5, o.fy1 ?? .5, u), grade: o.grade || 'color', tint: o.tint, tintAmt: o.tintAmt, blur: o.blur });
    if (o.shade) shade(ctx, o.shade); if (o.grad !== false) gradeTop(ctx, .5);
    if (o.leak) lightLeak(ctx, t, o.leak, o.seed || 1, o.leakHue);
    if (o.rain) rain(ctx, t, o.rain);
    if (o.draw) o.draw(ctx, t, lt, sh);
    if (o.tag) lowerTag(ctx, o.tag[0], o.tag[1], t, T(...from) + .15);
    if (o.credit !== false) sourceTag(ctx, o.creditText || cr(key));
  }, { name: o.name || key });
  if (o.sfx !== null) cue(T(...from) - .08, o.sfx || 'whoosh', o.sfxGain ?? .6);
}
const dossier = (from, key, name, rows, verdict, o = {}) => {
  shot(from, (ctx, t, lt) => {
    gridBG(ctx, t, '#0A1322', 'rgba(255,90,72,.07)', 54, 3); const bx = 200, by = 180, bw = 480, bh = 640;
    if (key && IMG[key]) photo(ctx, key, { x: bx, y: by, w: bw, h: bh, zoom: 1.02 + lt * .01, grade: 'bw' });
    else { ctx.fillStyle = '#141C2A'; ctx.fillRect(bx, by, bw, bh); personIcon(ctx, bx + bw / 2, by + bh / 2 + 40, 5, '#2A3A55'); text(ctx, 'NO PHOTO ON FILE', bx + bw / 2, by + bh - 40, { font: F.mono, size: 26, color: 'rgba(200,220,255,.6)', align: 'center' }); }
    brackets(ctx, bx - 20, by - 20, bw + 40, bh + 40, prog(t, T(...from), T(...from) + .3)); scanBeam(ctx, bx, by, bw, bh, prog(t, T(...from), T(...from) + 1.2));
    kicker(ctx, 'SUSPECT FILE', 800, 220, t, T(...from)); bigTitle(ctx, name, 800, 360, t, T(...from), { size: 130 });
    rows.forEach(([l, v, id, w], i) => dataRow(ctx, l, v, 810, 460 + i * 115, t, T(id, w)));
    if (verdict && t > T(verdict[1], verdict[2])) stamp(ctx, verdict[0], 1350, 920, t, T(verdict[1], verdict[2]), { size: 100, color: verdict[3] || '#E8402F' });
    if (key && IMG[key]) sourceTag(ctx, o.credit || 'Photo: public domain');
  }, { name: 'dossier-' + name });
  cue(T(...from) - .1, 'whoosh', .6); if (verdict) cue(T(verdict[1], verdict[2]), 'stamp');
};
const billCrop = () => IMG.bill20 ? [0, 0, IMG.bill20.width, IMG.bill20.height] : null;
function rainBills(ctx, t, t0, n, o) { const c = billCrop(); if (c) moneyRain(ctx, t, t0, 'bill20', c, n, o); }

// ======================================================================= scenes
function scenes() {
  // ---------------- COLD OPEN
  { const date = 'NOVEMBER 24, 1971', t0 = T('L001', 'November') - .05; typeCues(date, t0, 24); cue(t0 + date.length / 24 + .05, 'ding');
    shot(['L001', 'November'], (ctx, t, lt) => {
      photo(ctx, 'plane_pd', { zoom: 1.25 + lt * .02, blur: 6, grade: 'duo', tint: 'navy', tintAmt: .9 }); shade(ctx, .45, '6,10,20');
      lightLeak(ctx, t, .35, 2); dust(ctx, t, 50, .35);
      const x = W / 2 - 520; ctx.fillStyle = PAL.red2; ctx.fillRect(x, 470, 520 * E.out(prog(t, t0, t0 + .3)), 6);
      typewriter(ctx, date, x, 450, t, t0, 24, { size: 120, color: PAL.cream });
      kicker(ctx, 'THE DAY BEFORE THANKSGIVING', x, 560, t, T('L001', 'day'));
      kicker(ctx, 'PORTLAND, OREGON', x, 620, t, T('L001', 'Thanksgiving'), { color: PAL.gold, size: 30 });
      fadeIn(ctx, t, 0, .7);
    }, { lead: .7, name: 'date' }); }
  shot(['L002', 'quiet'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0A1322', 'rgba(255,90,72,.08)', 54, 4);
    const bx = 220, by = 140, bw = 540, bh = 800;
    photo(ctx, 'sketch_a', { x: bx, y: by, w: bw, h: bh, zoom: 1.02 + lt * .015, grade: 'duo', tint: 'red', tintAmt: .35 });
    scanBeam(ctx, bx, by, bw, bh, prog(t, T('L002', 'quiet'), T('L002', 'quiet') + 1.4));
    brackets(ctx, bx - 20, by - 20, bw + 40, bh + 40, prog(t, T('L002', 'quiet'), T('L002', 'quiet') + .4));
    kicker(ctx, 'FBI DESCRIPTION · UNSUB', 880, 200, t, T('L002', 'quiet'));
    const rows = [['SEX', 'MALE', 'quiet'], ['AGE', 'MID-40s', 'man'], ['HEIGHT', '6 FT 1 IN', 'in'], ['CLOTHING', 'DARK SUIT, WHITE SHIRT', 'dark'], ['TIE', 'BLACK CLIP-ON', 'black']];
    rows.forEach(([l, v, w], i) => dataRow(ctx, l, v, 900, 280 + i * 120, t, T('L002', w)));
    if (IMG.tie && t > T('L002', 'tie') - .1) { const p = prog(t, T('L002', 'tie') - .1, T('L002', 'tie') + .3);
      ctx.save(); ctx.globalAlpha = p; card(ctx, 'tie', { cx: 1560, cy: 760, maxW: 420, maxH: 340, rot: .05, scale: lerp(1.2, 1, E.out(p)), filter: GRADES.color }); ctx.restore();
      hand(ctx, 'the actual tie', 1420, 990, prog(t, T('L002', 'tie'), T('L002', 'tie') + .6), { color: '#FF6B5B' }); }
    sourceTag(ctx, 'FBI composite sketch A, Nov 1971 · tie: FBI evidence photo');
  }, { name: 'dossier' });
  cue(T('L002', 'quiet') - .1, 'whoosh'); cue(T('L002', 'quiet') + .1, 'riser', .5); cue(T('L002', 'tie') - .1, 'shutter');
  photoShot(['L002', 'Northwest'], 'plane', { z0: 1.15, z1: 1.3, fx0: .55, fx1: .62, fy0: .55, grade: 'warm', leak: .25, tag: ['NORTHWEST ORIENT · FLIGHT 305', 'PORTLAND → SEATTLE · BOEING 727'], sfx: 'shutter' });
  // the real ticket
  { const tk = (ctx, t, lt, kf) => { gridBG(ctx, t, '#101418', 'rgba(255,255,255,.05)', 60, 3); return imgCam(ctx, 'ticket', camAt(kf, lt), { grade: 'warm' }); };
    shot(['L003', 'pays'], (ctx, t, lt) => {
      const mp = tk(ctx, t, lt, [[0, 1200, 680, .9], [3, 1200, 700, 1.0]]);
      const [a, b] = mp(487, 1005), [c, d] = mp(622, 1050);
      penEllipse(ctx, (a + c) / 2, (b + d) / 2, (c - a) / 2 + 30, (d - b) / 2 + 26, prog(t, T('L003', 'cash'), T('L003', 'cash') + .4), { seed: 4 });
      hand(ctx, '$20.00 — paid in cash', c + 30, d + 20, prog(t, T('L003', 'cash') + .1, T('L003', 'cash') + .8), { color: '#E8402F', size: 70 });
      rainBills(ctx, t, T('L003', 'cash'), 14, { size: 260, spread: .6, alpha: .95 });
      sourceTag(ctx, 'Dan Cooper\'s actual ticket · FBI photo, public domain');
    }, { name: 'ticket-cash' });
    cue(T('L003', 'pays') - .1, 'paper'); cue(T('L003', 'cash'), 'cash'); cue(T('L003', 'cash') + .05, 'scribble', .7);
    shot(['L003', 'one'], (ctx, t, lt) => {
      const mp = tk(ctx, t, lt, [[0, 900, 720, 1.25], [1.5, 520, 770, 1.9]]);
      const [x, y] = mp(368, 818); penEllipse(ctx, x, y, 200, 70, prog(t, T('L003', 'Seattle') - .1, T('L003', 'Seattle') + .4), { seed: 6 });
      const [x2, y2] = mp(350, 690); penEllipse(ctx, x2, y2, 170, 60, prog(t, T('L003', 'one'), T('L003', 'one') + .4), { seed: 7, color: PAL.gold });
      kicker(ctx, 'ONE-WAY · PORTLAND → SEATTLE', 120, 160, t, T('L003', 'one'));
    }, { name: 'ticket-route' });
    cue(T('L003', 'Seattle') - .05, 'scribble', .7);
    shot(['L003', 'name'], (ctx, t, lt) => {
      const mp = tk(ctx, t, lt, [[0, 470, 420, 2.2], [2, 450, 412, 2.6]]);
      const [x, y] = mp(450, 412); penEllipse(ctx, x, y, 470, 120, prog(t, T('L003', 'Dan'), T('L003', 'Cooper', 'e') + .2), { seed: 9, lw: 9 });
      bigTitle(ctx, 'DAN COOPER', W / 2, H - 140, t, T('L003', 'Dan'), { align: 'center', size: 130 });
      flash(ctx, t, T('L003', 'name') - .05, .1);
    }, { name: 'ticket-name' });
    cue(T('L003', 'name') - .1, 'impact', .5); cue(T('L003', 'Dan'), 'scribble'); }
  shot(['L003', 'thirty'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 2)); const pr = drawGeo(ctx, GEO_PNW, { lon: lerp(-122.9, -122.55, u), lat: lerp(46.2, 46.5, u), k: lerp(300, 360, u), theme: 'night' }, [['WASHINGTON', -120.9, 47.5], ['OREGON', -121.2, 45.0]]);
    const pdx = pinMap(ctx, pr, 'PDX', t, T('L003', 'thirty') - .05, 'PORTLAND', { left: true }); const sea = pr(...PLACES.SEA);
    route(ctx, pdx, sea, prog(t, T('L003', 'thirty'), T('L003', 'hop', 'e') + .1), { plane: true, ctrl: [pdx[0] + 140, (pdx[1] + sea[1]) / 2] });
    pinMap(ctx, pr, 'SEA', t, T('L003', 'hop', 'e'), 'SEATTLE');
    const mp = E.out(prog(t, T('L003', 'thirty'), T('L003', 'thirty') + .4));
    ctx.save(); ctx.globalAlpha = mp; ctx.fillStyle = 'rgba(178,36,28,.92)'; ctx.fillRect(1300, 800, 500, 150);
    text(ctx, '30', 1330, 925, { font: F.bebas, size: 140, color: '#fff' }); text(ctx, 'MINUTE FLIGHT', 1460, 905, { font: F.osw, size: 50, color: '#fff', weight: 600 }); ctx.restore();
    sourceTag(ctx, 'Map: Natural Earth');
  }, { name: 'map-hop' });
  cue(T('L003', 'thirty') - .1, 'whoosh', .6);
  // seat 18E — blueprint cabin
  shot(['L004', 'takes'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0B2340', 'rgba(140,190,255,.14)', 56, 5);
    kicker(ctx, 'BOEING 727 · CABIN LAYOUT (SIMPLIFIED)', 110, 140, t, T('L004', 'takes'), { color: '#8CC4FF' });
    const x0 = 230, y0 = 400, rows = 18, cw = 74;
    ctx.save(); ctx.strokeStyle = 'rgba(200,225,255,.9)'; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(120,170,230,.08)';
    ctx.beginPath(); ctx.moveTo(x0 - 160, y0 + 160); ctx.quadraticCurveTo(x0 - 160, y0 - 10, x0 - 20, y0 - 30); ctx.lineTo(x0 + rows * cw + 120, y0 - 30);
    ctx.quadraticCurveTo(x0 + rows * cw + 260, y0 + 160, x0 + rows * cw + 120, y0 + 350); ctx.lineTo(x0 - 20, y0 + 350); ctx.quadraticCurveTo(x0 - 160, y0 + 330, x0 - 160, y0 + 160); ctx.fill(); ctx.stroke(); ctx.restore();
    let sx = 0, sy = 0;
    for (let r = 0; r < rows; r++) { const ap = prog(t, T('L004', 'takes') + r * .02, T('L004', 'takes') + r * .02 + .2);
      for (let s = 0; s < 6; s++) { const x = x0 + r * cw, y = y0 + s * 50 + (s > 2 ? 40 : 0), hl = r === rows - 1 && s === 4;
        if (hl) { sx = x + 26; sy = y + 22; } if (ap <= 0) continue;
        ctx.globalAlpha = ap; ctx.strokeStyle = 'rgba(200,225,255,.7)'; ctx.lineWidth = 2; ctx.strokeRect(x + 8, y + 4, cw - 22, 36);
        if (hl && t > T('L004', '18E')) { ctx.shadowColor = '#FF4A3A'; ctx.shadowBlur = 30; ctx.fillStyle = '#FF4A3A'; ctx.fillRect(x + 8, y + 4, cw - 22, 36); ctx.shadowBlur = 0; } } }
    ctx.globalAlpha = 1;
    blueprintLabel(ctx, 'ROW 1', x0 + 6, y0 - 50); blueprintLabel(ctx, 'ROW 18', x0 + 17 * cw - 10, y0 - 50, { color: '#FF8A7A' });
    blueprintLabel(ctx, 'AFT AIRSTAIR ▸', x0 + rows * cw + 30, y0 + 175);
    penEllipse(ctx, sx, sy, 70, 56, prog(t, T('L004', '18E'), T('L004', 'last', 'e')), { seed: 11, color: '#FF6B5B' });
    hand(ctx, 'seat 18E — last row', sx - 380, sy + 210, prog(t, T('L004', 'very'), T('L004', 'row', 'e')), { color: '#FF8A7A' });
    if (t > T('L004', 'bourbon') - .15) { const p = prog(t, T('L004', 'bourbon') - .15, T('L004', 'bourbon') + .25);
      if (IMG.bourbon) { ctx.save(); ctx.globalAlpha = p; card(ctx, 'bourbon', { cx: 1500, cy: 280, maxW: 360, maxH: 260, rot: .06, scale: lerp(1.3, 1, E.out(p)), filter: GRADES.warm }); ctx.restore(); }
      hand(ctx, '+ bourbon & soda. priorities.', IMG.bourbon ? 1180 : 260, IMG.bourbon ? 490 : 900, prog(t, T('L004', 'bourbon'), T('L004', 'soda', 'e') + .3), { color: '#FFD23F', size: 58 }); }
  }, { name: 'seat' });
  cue(T('L004', 'takes') - .1, 'whoosh', .5); cue(T('L004', '18E'), 'scribble'); cue(T('L004', 'bourbon') - .1, 'shutter', .7);
  shot(['L005', 'Just'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A1410', '#050405', 'r'); lightLeak(ctx, t, .18, 4);
    const m = Math.min(4, lt * 3); clockFace(ctx, 330, 330, 190, 3, m); text(ctx, '3:0' + Math.floor(m) + ' PM', 180, 620, { font: F.bebas, size: 110, color: PAL.cream });
    const sp = E.out(prog(t, T('L005', 'slips'), T('L005', 'slips') + .5));
    ctx.save(); ctx.translate(lerp(W + 400, 1240, sp), 600); ctx.rotate(lerp(.5, -.06, sp)); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40;
    ctx.fillStyle = PAL.cream; ctx.fillRect(-320, -180, 640, 360); ctx.shadowColor = 'transparent'; ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.moveTo(-320, 0); ctx.lineTo(320, 0); ctx.stroke(); ctx.restore();
    hand(ctx, 'his phone number? ♥', 940, 330, prog(t, T('L005', 'phone'), T('L005', 'number', 'e') + .2), { color: '#FF6B8B', size: 76 });
    kicker(ctx, 'FLIGHT ATTENDANT FLORENCE SCHAFFNER', 900, 900, t, T('L005', 'flight'));
  }, { name: 'note-pass' });
  cue(T('L005', 'Just') - .1, 'tick'); cue(T('L005', 'slips'), 'paper');
  shot(['L006', 'It'], (ctx, t, lt) => {
    bgGrad(ctx, '#2A0806', '#000', 'r');
    const s = 1 + .03 * Math.sin(lt * 40) * Math.exp(-lt * 6); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
    wipeText(ctx, 'IT WAS NOT', W / 2, 500, prog(t, T('L006', 'It'), T('L006', 'not', 'e')), { size: 210, color: PAL.cream, align: 'center', bar: true });
    glowText(ctx, 'HIS PHONE NUMBER.', W / 2, 700, { font: F.bebas, size: 160, color: '#FF4A3A', align: 'center', alpha: prog(t, T('L006', 'his'), T('L006', 'his') + .2) });
    ctx.setTransform(1, 0, 0, 1, 0, 0); glitch(ctx, t, lt < .35 ? 1 : 0); flash(ctx, t, T('L006', 'It') - .08, .1, '#ff3020');
  }, { name: 'not-number' });
  cue(T('L006', 'It') - .05, 'impact');
  shot(['L007', 'Miss'], (ctx, t, lt) => {
    bgGrad(ctx, '#15100C', '#000', 'r');
    const g = ctx.createRadialGradient(W / 2, H / 2 - 40, 50, W / 2, H / 2, 900); g.addColorStop(0, 'rgba(255,220,170,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    noteCard(ctx, ['MISS —', 'I HAVE A BOMB', 'IN MY BRIEFCASE.', 'I WANT YOU TO SIT BY ME.'], t, [T('L007', 'Miss'), T('L007', 'have'), T('L007', 'in'), T('L007', 'want')],
      { y: 520, z: 1 + lt * .03, after: (c) => { const p = prog(t, T('L007', 'bomb'), T('L007', 'bomb') + .3); if (p > 0) { c.save(); c.shadowColor = '#ff2a1a'; c.shadowBlur = 40 * p; penLine(c, -330, -22, 120, -30, p, { lw: 10 }); c.restore(); } } });
    sourceTag(ctx, 'Wording as later recalled by the crew · handwritten recreation');
  }, { name: 'note' });
  cue(T('L007', 'Miss') - .1, 'paper'); cue(T('L007', 'bomb'), 'thud', .8);
  shot(['L008', 'He'], (ctx, t, lt) => {
    if (IMG.briefcase) photo(ctx, 'briefcase', { zoom: 1.1 + lt * .05, grade: 'duo', tint: 'red', tintAmt: .8 }); else bgGrad(ctx, '#3A0A08', '#000', 'r');
    shade(ctx, .45); const pulse = .5 + .5 * Math.sin(t * 9); ctx.fillStyle = `rgba(200,30,20,${.12 * pulse})`; ctx.fillRect(0, 0, W, H);
    kicker(ctx, 'THE BRIEFCASE', 120, 170, t, T('L008', 'cracks'));
    punch(ctx, 'WIRES.', W / 2, 470, t, T('L008', 'Wires'), { font: F.bebas, size: 260, color: PAL.cream });
    punch(ctx, 'RED STICKS.', W / 2, 740, t, T('L008', 'Red'), { font: F.bebas, size: 260, color: '#FF4A3A' });
    glitch(ctx, t, (Math.abs(t - T('L008', 'Wires')) < .15 || Math.abs(t - T('L008', 'Red')) < .15) ? 1 : 0, 3);
    if (IMG.briefcase) sourceTag(ctx, 'Illustrative: a period attaché case');
  }, { name: 'bomb' });
  cue(T('L008', 'Wires'), 'hit', .8); cue(T('L008', 'Red'), 'hit', .9);
  shot(['L009', 'His'], (ctx, t, lt) => {
    photo(ctx, IMG.cashstack ? 'cashstack' : 'seafirst', { zoom: 1.1 + lt * .03, grade: 'warm', blur: 2 }); shade(ctx, .62, '10,8,4');
    lightLeak(ctx, t, .2, 6); rainBills(ctx, t, T('L009', '$200,000'), 34, { size: 300, spread: 1.6 });
    kicker(ctx, 'THE DEMANDS', 120, 160, t, T('L009', 'His'), { color: PAL.gold });
    const cp = E.out(prog(t, T('L009', '$200,000') - .1, T('L009', 'bills', 'e')));
    glowText(ctx, '$' + (Math.round(200000 * cp / 20) * 20).toLocaleString('en-US'), 120, 440, { font: F.bebas, size: 280, color: '#FFD86B', glow: 'rgba(255,190,60,.7)' });
    text(ctx, 'IN $20 BILLS  ·  10,000 NOTES', 130, 520, { font: F.osw, size: 46, color: PAL.cream, weight: 500, ls: 3, alpha: prog(t, T('L009', 'twenty'), T('L009', 'bills', 'e')) });
    const cpT = T('L009', 'four');
    for (let k = 0; k < 4; k++) chuteIcon(ctx, 260 + k * 300, 700 + Math.sin(t * 2 + k) * 8, 1.05, prog(t, cpT + k * .12, cpT + k * .12 + .3), { t });
    if (t > T('L009', 'parachutes')) text(ctx, '× 4 PARACHUTES', 1420, 820, { font: F.bebas, size: 110, color: '#FF4A3A', alpha: prog(t, T('L009', 'parachutes'), T('L009', 'parachutes') + .3) });
  }, { name: 'demands' });
  cue(T('L009', '$200,000') - .1, 'cash'); cue(T('L009', '$200,000'), 'riser', .4); [0, 1, 2, 3].forEach(k => cue(T('L009', 'four') + k * .12, 'thud', .35));
  shot(['L010', 'Five'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 3.5)); const pr = drawGeo(ctx, GEO_PNW, { lon: lerp(-122.3, -122.5, u), lat: lerp(46.9, 46.4, u), k: lerp(250, 330, u), theme: 'night' }, [['WASHINGTON', -120.9, 47.3], ['OREGON', -120.9, 45.3]]);
    rain(ctx, t, .7); lightning(ctx, t, [T('L010', 'black') - .1]);
    text(ctx, '≈ 8:13 PM', 120, 210, { font: F.bebas, size: 150, color: PAL.cream, alpha: E.out(prog(t, T('L010', 'Five'), T('L010', 'later', 'e'))) });
    kicker(ctx, 'SOUTHWEST WASHINGTON · FREEZING RAIN', 120, 280, t, T('L010', 'somewhere'), { color: '#5EA8FF' });
    const sea = pr(...PLACES.SEA), jump = pr(...PLACES.JUMP);
    pinMap(ctx, pr, 'SEA', t, T('L010', 'Five'), 'SEATTLE'); pinMap(ctx, pr, 'PDX', t, T('L010', 'Five') + .2, 'PORTLAND', { left: true, color: '#5EA8FF' });
    route(ctx, sea, jump, prog(t, T('L010', 'somewhere'), T('L010', 'lowers')), { plane: true, ctrl: [sea[0] + 70, (sea[1] + jump[1]) / 2] });
    if (t > T('L010', 'lowers')) { penEllipse(ctx, jump[0], jump[1], 90, 70, prog(t, T('L010', 'lowers'), T('L010', 'stairs', 'e')), { seed: 5, color: '#FF6B5B' });
      hand(ctx, 'jumped here?', jump[0] + 110, jump[1] + 10, prog(t, T('L010', 'stairs'), T('L010', 'stairs') + .5), { color: '#FF8A7A' }); }
  }, { name: 'night-map' });
  cue(T('L010', 'Five') - .1, 'whoosh', .7); cue(T('L010', 'black') - .1, 'impact', .5);
  shot(['L010', 'Boeing'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0B2340', 'rgba(140,190,255,.14)', 56, 8); rain(ctx, t, .35);
    const stair = E.inOut(prog(t, T('L010', 'Boeing') + .2, T('L010', 'steps')));
    b727(ctx, W / 2 + 80, H / 2 - 40, 1.6, { stair, gear: true });
    blueprintLabel(ctx, 'BOEING 727 — AFT AIRSTAIR', 120, 150, { size: 34 });
    if (stair > .3) { penArrow(ctx, 380, 820, W / 2 + 80 - 330 * 1.6 - 60, H / 2 - 40 + 56 * 1.6 + 80, prog(t, T('L010', 'Boeing') + .6, T('L010', 'Boeing') + 1.1), { color: '#FF6B5B' });
      hand(ctx, 'his exit', 260, 880, prog(t, T('L010', 'Boeing') + .8, T('L010', 'Boeing') + 1.3), { color: '#FF8A7A' }); }
    if (t > T('L010', 'steps')) { const p = prog(t, T('L010', 'steps'), T('L010', 'night', 'e') + .4);
      const x0 = W / 2 + 80 - 330 * 1.6 - 150, y0 = H / 2 + 80; chuteIcon(ctx, x0 - p * 120, y0 + p * 380, .5, p * 3, { t, fill: '#FF4A3A' });
      ctx.fillStyle = `rgba(0,0,0,${E.in(prog(t, T('L010', 'night') - .1, T('L010', 'night', 'e') + .35))})`; ctx.fillRect(0, 0, W, H); }
  }, { name: 'blueprint-jump' });
  cue(T('L010', 'Boeing') - .1, 'whoosh', .6); cue(T('L010', 'steps'), 'whoosh', 1.3);
  shot(['L011', 'He'], (ctx, t, lt) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    photo(ctx, 'sketch_color', { x: W / 2 - 420, y: 0, w: 840, h: H, zoom: 1.05 + lt * .05, fy: .4, grade: 'duo', tint: 'navy', tintAmt: .6, alpha: .8 * (1 - prog(t, T('L011', 'again', 'e') + .2, T('L011', 'again', 'e') + 1.2)) });
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); dust(ctx, t, 90, .5);
    glowText(ctx, 'NEVER SEEN AGAIN.', W / 2, 640, { font: F.bebas, size: 190, color: PAL.cream, align: 'center', glow: 'rgba(120,170,255,.6)', alpha: prog(t, T('L011', 'never'), T('L011', 'again', 'e')) });
    fadeIn(ctx, t, T('L011', 'He') - .4, .5);
  }, { name: 'never', lead: .4 });
  cue(T('L011', 'never') - .05, 'impact', .8);
  shot(['L012', 'Fifty'], (ctx, t, lt) => {
    bgGrad(ctx, '#111827', '#05070C'); dust(ctx, t, 40, .3);
    const a = T('L012', 'Fifty'), b = T('L012', 'More'), c = T('L012', '66');
    if (t < b) { timelineBar(ctx, 620, [[1971, 'HIJACKING', a], [1980, 'MONEY FOUND', a + .2], [2016, 'CASE SUSPENDED', a + .4], [2026, 'TODAY', a + .6]], 1968, 2029, t, a);
      glowText(ctx, '55 YEARS', W / 2, 400, { font: F.bebas, size: 220, color: PAL.cream, align: 'center', alpha: prog(t, a, a + .3) }); }
    else if (t < c) { const cols = 40, n = 800, p = E.out(prog(t, b, b + 1.2)); for (let i = 0; i < n; i++) { const x = 420 + (i % cols) * 27, y = 330 + Math.floor(i / cols) * 27;
        ctx.fillStyle = i < n * p ? (i % 37 === 0 ? '#FFD23F' : '#E8402F') : 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); }
      counter(ctx, 800 * p, W / 2, 250, { suffix: '+ SUSPECTS', size: 150, align: 'center' }); }
    else { const p = prog(t, c, c + 1.4); const n = Math.floor(66 * E.out(p));
      for (let i = 0; i < n; i++) { const col = i % 11, row = Math.floor(i / 11); const x = 380 + col * 110, y = 880 - row * 95;
        ctx.fillStyle = ['#C9A86A', '#B8954F', '#D4B579'][i % 3]; ctx.fillRect(x, y, 96, 80); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, y, 96, 10);
        ctx.fillStyle = '#7A1C14'; ctx.fillRect(x + 30, y + 30, 36, 8); }
      counter(ctx, 66 * E.out(p), W / 2, 230, { suffix: ' VOLUMES OF FBI FILES', size: 130, align: 'center' }); }
  }, { name: 'numbers' });
  ['Fifty', 'More', '66'].forEach(w => cue(T('L012', w), 'thud', .8));
  shot(['L013', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#2B2622', '#0D0B0A', 'r'); ctx.globalAlpha = .4; ctx.drawImage(paperTex('#3A332C', 41), 0, 0); ctx.globalAlpha = 1;
    const a = T('L013', 'And'); const z = 1 + lt * .025; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    const P1 = pinned(ctx, 'wanted', 960, 520, 360, 620, -.02, prog(t, a, a + .3));
    const P2 = pinned(ctx, 'ticket', 430, 330, 520, 300, -.06, prog(t, a + .25, a + .55));
    const P3 = pinned(ctx, 'money', 1490, 330, 460, 300, .05, prog(t, a + .45, a + .75));
    const P4 = pinned(ctx, 'tie', 450, 800, 360, 280, .04, prog(t, a + .65, a + .95), { grade: 'color' });
    const P5 = pinned(ctx, 'plane', 1500, 800, 480, 300, -.04, prog(t, a + .85, a + 1.15), { grade: 'color' });
    [P2, P3, P4, P5].forEach((p, i) => redString(ctx, P1, p, prog(t, a + 1 + i * .15, a + 1.5 + i * .15)));
    glowText(ctx, '?', 960, 560, { font: F.bebas, size: 420, color: '#FF4A3A', align: 'center', base: 'middle', alpha: prog(t, T('L013', 'really'), T('L013', 'was', 'e')) });
  }, { name: 'board' });
  cue(T('L013', 'And') - .1, 'paper'); cue(T('L013', 'really'), 'thud', .7);
  shot(['L014', 'Even'], (ctx, t, lt) => {
    bgGrad(ctx, '#151515', '#000', 'r');
    const tn = T('L014', 'name');
    ctx.save(); ctx.translate(W / 2, 470); const z = 1 + lt * .02; ctx.scale(z, z);
    text(ctx, 'D.B. COOPER', 0, 0, { font: F.bebas, size: 300, color: PAL.cream, align: 'center', base: 'middle', alpha: prog(t, tn - .2, tn + .1) });
    const sp = prog(t, T('L014', 'wrong'), T('L014', 'wrong') + .35);
    penLine(ctx, -575, 12, -150, -8, sp, { lw: 14, bow: 0, color: '#FF3B2B' }); penLine(ctx, -575, -40, -150, 40, sp, { lw: 14, bow: 0, color: '#FF3B2B' });
    hand(ctx, 'wrong.', -520, 210, prog(t, T('L014', 'wrong') + .1, T('L014', 'wrong') + .6), { size: 110, color: '#FF3B2B' });
    ctx.restore();
    const tt = T('L014', 'wrong') + 1.0; const tp = E.out(prog(t, tt, tt + .5));
    if (tp > 0) { photo(ctx, 'sketch_color', { zoom: 1.3, fy: .35, grade: 'duo', tint: 'red', alpha: tp * .45 }); ctx.fillStyle = `rgba(8,6,6,${tp * .6})`; ctx.fillRect(0, 0, W, H);
      lightLeak(ctx, t, .3 * tp, 9);
      bigTitle(ctx, 'THE MAN WHO VANISHED', W / 2, 560, t, tt + .2, { align: 'center', size: 180 });
      text(ctx, 'THE UNSOLVED HIJACKING OF FLIGHT 305', W / 2, 650, { font: F.osw, size: 42, color: PAL.gold, align: 'center', weight: 500, ls: 8, alpha: prog(t, tt + .8, tt + 1.3) });
      text(ctx, 'INK AND ANTIQUITY', W / 2, H - 90, { font: F.play, size: 40, color: 'rgba(244,236,220,.7)', align: 'center', weight: 700, ls: 6, alpha: prog(t, tt + 1, tt + 1.6) }); }
    glitch(ctx, t, Math.abs(t - tt) < .2 ? 1 : 0, 7);
  }, { name: 'title' });
  cue(T('L014', 'wrong'), 'scribble', 1.1); cue(T('L014', 'wrong') + .3, 'riser', .7); cue(T('L014', 'wrong') + 1.05, 'impact', .9);

  // ---------------- ACT 1: the name, the hijack
  shot(['L015', 'His'], (ctx, t, lt) => {
    gridBG(ctx, t, '#14100E', 'rgba(255,255,255,.04)', 60, 2);
    imgCam(ctx, 'vault_p5', camAt([[0, 545, 600, 1.0], [5, 545, 380, 1.5]], lt), { grade: 'bw', contain: true });
    shade(ctx, .25); kicker(ctx, 'FBI FILE · PORTLAND, DEC. 1971', 100, 150, t, T('L015', 'His'));
    const a = T('L015', 'reporter'); if (t > a - .2) { const p = E.out(prog(t, a - .2, a + .3));
      ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = 'rgba(12,10,9,.92)'; ctx.fillRect(1080, 330, 740, 420); ctx.strokeStyle = '#E8402F'; ctx.lineWidth = 4; ctx.strokeRect(1080, 330, 740, 420);
      text(ctx, 'ON DEADLINE', 1120, 400, { font: F.osw, size: 32, color: '#E8402F', weight: 600, ls: 6 });
      text(ctx, 'DAN COOPER', 1120, 520, { font: F.type, size: 84, color: 'rgba(244,236,220,.4)' });
      penLine(ctx, 1110, 495, 1600, 490, prog(t, T('L015', 'initials') - .3, T('L015', 'initials')), { lw: 8, bow: 0 });
      typewriter(ctx, 'D.B. COOPER', 1120, 650, t, T('L015', 'initials') - .1, 16, { size: 96, color: PAL.cream }); ctx.restore(); }
    sourceTag(ctx, 'FBI NORJAK file, Part 01 · The Vault (vault.fbi.gov)');
  }, { name: 'name-error' });
  typeCues('D.B. COOPER', T('L015', 'initials') - .1, 16); cue(T('L015', 'His') - .1, 'paper');
  shot(['L016', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#B2241C', '#4A0A07', 'r');
    const fonts = [F.bebas, F.play, F.type, F.osw, F.mono];
    for (let i = 0; i < 9; i++) { const y = 140 + i * 110, dir = i % 2 ? 1 : -1, off = ((lt * 260 * dir) % 1400 + 1400 + i * 300) % 1400;
      ctx.globalAlpha = i === 4 ? 1 : .18; const s = ' D.B. COOPER · D.B. COOPER · D.B. COOPER · D.B. COOPER ·';
      text(ctx, s, off - 1400, y, { font: fonts[i % 5], size: i === 4 ? 120 : 80, color: '#fff' }); text(ctx, s, off + 600, y, { font: fonts[i % 5], size: i === 4 ? 120 : 80, color: '#fff' }); }
    ctx.globalAlpha = 1;
    if (t > T('L016', 'mistake')) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H); bigTitle(ctx, 'A MISTAKE BECAME A LEGEND', W / 2, 580, t, T('L016', 'mistake'), { align: 'center', size: 140 }); }
  }, { name: 'wire' });
  cue(T('L016', 'The') - .1, 'whoosh', .6); cue(T('L016', 'mistake'), 'impact', .6);
  shot(['L017', 'So'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0B2340', 'rgba(140,190,255,.14)', 56, -30); b727(ctx, W / 2, H / 2, 1.5, {}); scanlines(ctx, .25);
    glitch(ctx, t, .6, 2); text(ctx, '◀◀ REWIND', 120, 160, { font: F.mono, size: 50, color: '#FFF', alpha: Math.floor(t * 3) % 2 ? 1 : .3 });
    text(ctx, 'ROW 18', W / 2, 900, { font: F.bebas, size: 120, color: '#FF4A3A', align: 'center', alpha: prog(t, T('L017', 'eighteen') - .2, T('L017', 'eighteen') + .2) });
  }, { name: 'rewind' });
  cue(T('L017', 'So') - .1, 'whoosh', .8);
  photoShot(['L018', 'Schaffner'], IMG.cockpit ? 'cockpit' : 'crew', { grade: IMG.cockpit ? 'color' : 'bw', z0: 1.1, z1: 1.25, shade: .2, draw: (ctx, t) => {
    const r0 = T('L018', 'radios'); if (t > r0) for (let k = 0; k < 4; k++) { const p = ((t - r0) * .9 + k * .25) % 1; ctx.strokeStyle = `rgba(255,90,72,${1 - p})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(1560, 300, 40 + p * 260, -1.2, -.2); ctx.stroke(); }
    kicker(ctx, 'CAPTAIN WILLIAM SCOTT', 110, 170, t, T('L018', 'captain'));
    if (t > T('L018', 'give')) { ctx.fillStyle = 'rgba(10,8,8,.82)'; ctx.fillRect(0, 700, W, 260);
      typewriter(ctx, '"GIVE HIM WHATEVER HE WANTS."', 140, 860, t, T('L018', 'give'), 34, { size: 92, color: '#FFD86B' });
      text(ctx, 'NORTHWEST ORIENT LEADERSHIP · PARAPHRASED', 145, 920, { font: F.mono, size: 26, color: 'rgba(244,236,220,.6)' }); } } });
  typeCues('"GIVE HIM WHATEVER HE WANTS."', T('L018', 'give'), 34, .4);
  photoShot(['L019', 'Another'], 'crew', { grade: 'bw', z0: 1.0, z1: 1.35, fx0: .5, fx1: .53, fy0: .45, fy1: .5, sfx: 'shutter', draw: (ctx, t) => {
    const p = prog(t, T('L019', 'Tina'), T('L019', 'Tina') + .4); brackets(ctx, 820, 240, 420, 640, p, '#FF4A3A');
    if (p > 0) lowerTag(ctx, 'TINA MUCKLOW', 'FLIGHT ATTENDANT · CREW PHOTO, RENO, NOV. 25, 1971', t, T('L019', 'Tina')); } });
  shot(['L020', 'And'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 6)); const pr = drawGeo(ctx, GEO_PNW, { lon: lerp(-122.35, -122.4, u), lat: lerp(47.3, 47.28, u), k: lerp(900, 1100, u), theme: 'paper' }, [['PUGET SOUND', -122.6, 47.55, { size: 30 }]]);
    kicker(ctx, 'CALM. POLITE. LOCAL KNOWLEDGE?', 110, 150, t, T('L020', 'Calm'));
    pinMap(ctx, pr, 'TACOMA', t, T('L020', 'Tacoma'), 'TACOMA', { left: true });
    const mc = pinMap(ctx, pr, 'MCCHORD', t, T('L020', 'McChord'), 'McCHORD AFB', { color: '#1E6FD9' });
    const sea = pinMap(ctx, pr, 'SEA', t, T('L020', 'twenty'), 'SEA-TAC AIRPORT');
    route(ctx, mc, sea, prog(t, T('L020', 'twenty'), T('L020', 'airport', 'e')), { color: '#1E6FD9', ctrl: [(mc[0] + sea[0]) / 2 + 60, (mc[1] + sea[1]) / 2] });
    if (t > T('L020', 'twenty')) { ctx.fillStyle = '#1E6FD9'; ctx.fillRect(1380, 820, 420, 130); text(ctx, '20 MIN', 1410, 920, { font: F.bebas, size: 110, color: '#fff' }); }
    sourceTag(ctx, 'Map: Natural Earth');
  }, { name: 'puget' });
  cue(T('L020', 'Tacoma'), 'thud', .4); cue(T('L020', 'McChord'), 'thud', .4);
  shot(['L021', 'As'], (ctx, t, lt) => {
    const pr = drawGeo(ctx, GEO_PNW, { lon: -122.45, lat: 47.45, k: 520, theme: 'night' }, [['PUGET SOUND', -122.75, 47.75, { size: 30 }]]);
    const c = pr(-122.45, 47.45); ctx.save(); ctx.strokeStyle = 'rgba(255,90,72,.4)'; ctx.setLineDash([12, 10]); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(c[0], c[1], 300, 190, -.2, 0, 7); ctx.stroke(); ctx.restore();
    const a = lt * 1.6, ca = Math.cos(-.2), sa = Math.sin(-.2);
    ctx.save(); ctx.translate(c[0] + Math.cos(a) * 300 * ca - Math.sin(a) * 190 * sa, c[1] + Math.cos(a) * 300 * sa + Math.sin(a) * 190 * ca); ctx.rotate(a + Math.PI / 2 - .2); planeIcon(ctx, 1.2); ctx.restore();
    clockFace(ctx, 260, 280, 150, 3 + Math.min(2, lt * .5), (lt * 60) % 60);
    text(ctx, '≈ 2 HOURS CIRCLING', 120, 520, { font: F.bebas, size: 80, color: PAL.cream });
    if (t > T('L021', 'ground')) bigTitle(ctx, 'MEANWHILE, ON THE GROUND…', W / 2, 980, t, T('L021', 'ground'), { align: 'center', size: 90, color: '#FFD86B' });
  }, { name: 'circling' });
  cue(T('L021', 'As') - .1, 'whoosh', .5);
  shot(['L022', 'Seattle'], (ctx, t, lt) => {
    photo(ctx, 'seafirst', { zoom: 1.08 + lt * .03, grade: 'warm' }); gradeTop(ctx, .6);
    lowerTag(ctx, 'SEATTLE-FIRST NATIONAL BANK', 'INTERIOR, CIRCA 1970', t, T('L022', 'Seattle') + .1);
    const a = T('L022', 'ten'); if (t > a) { shade(ctx, .55 * prog(t, a, a + .3)); rainBills(ctx, t, a, 40, { size: 280, spread: 1.8 });
      counter(ctx, 10000 * E.out(prog(t, a, a + 1.4)), W / 2, 560, { suffix: ' BILLS', size: 230, align: 'center', color: '#FFD86B' }); }
    const m = T('L022', 'photographs'); if (t > m) { const p = prog(t, m, m + .4); ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = '#111'; ctx.fillRect(0, 760, W, 210);
      for (let i = 0; i < 12; i++) { const x = ((i * 220 - (t - m) * 420) % (W + 220) + W + 220) % (W + 220) - 220; ctx.fillStyle = '#2b2b2b'; ctx.fillRect(x, 790, 190, 150);
        ctx.fillStyle = 'rgba(200,220,200,.5)'; ctx.fillRect(x + 14, 812, 162, 106); text(ctx, 'L ' + '•'.repeat(8) + ' A', x + 22, 875, { font: F.mono, size: 22, color: '#163' }); }
      for (let x = 0; x < W; x += 34) { ctx.fillStyle = '#ddd'; ctx.fillRect(x, 770, 16, 10); ctx.fillRect(x, 950, 16, 10); } ctx.restore();
      kicker(ctx, 'EVERY SERIAL NUMBER ON MICROFILM', 110, 720, t, m, { color: PAL.gold }); }
    sourceTag(ctx, cr('seafirst'));
  }, { name: 'bank' });
  cue(T('L022', 'ten'), 'cash'); cue(T('L022', 'photographs'), 'shutter'); cue(T('L022', 'photographs') + .3, 'shutter', .6);
  shot(['L023', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#20242B', '#0A0C10', 'r'); dust(ctx, t, 30, .3);
    pinned(ctx, 'chute', 620, 520, 760, 520, -.04, prog(t, T('L023', 'The'), T('L023', 'The') + .3), { grade: 'color', label: 'ONE OF COOPER\'S PARACHUTES (FBI)' });
    pinned(ctx, 'chute_bag', 1380, 470, 620, 380, .05, prog(t, T('L023', 'skydiving'), T('L023', 'skydiving') + .3), { grade: 'color', label: 'PARACHUTE BAG (FBI)' });
    kicker(ctx, 'LOCAL SKYDIVING SCHOOL', 1080, 860, t, T('L023', 'skydiving'), { color: PAL.gold });
    kicker(ctx, 'NORMAN HAYDEN, STUNT PILOT', 1080, 930, t, T('L023', 'Norman'), { color: PAL.gold });
    sourceTag(ctx, 'FBI evidence photos · public domain');
  }, { name: 'chutes' });
  cue(T('L023', 'The') - .1, 'shutter'); cue(T('L023', 'skydiving'), 'shutter', .7);
  shot(['L024', 'Cooper'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0E1A12', 'rgba(140,255,170,.05)', 60, 3);
    const a = T('L024', 'military'), b = T('L024', 'civilian');
    chuteIcon(ctx, 560, 380, 1.5, prog(t, a - .2, a + .2), { t, fill: '#5B6B3A' }); text(ctx, 'MILITARY', 560, 760, { font: F.bebas, size: 90, color: PAL.cream, align: 'center', alpha: prog(t, a, a + .2) });
    if (t > a + .3) { penLine(ctx, 400, 250, 720, 650, prog(t, a + .3, a + .6), { lw: 14, bow: 0 }); penLine(ctx, 720, 250, 400, 650, prog(t, a + .45, a + .75), { lw: 14, bow: 0 }); }
    chuteIcon(ctx, 1360, 380, 1.5, prog(t, b - .2, b + .2), { t, fill: '#E8402F' }); text(ctx, 'CIVILIAN', 1360, 760, { font: F.bebas, size: 90, color: PAL.cream, align: 'center', alpha: prog(t, b, b + .2) });
    if (t > T('L024', 'ripcords')) { brackets(ctx, 1180, 180, 360, 640, prog(t, T('L024', 'ripcords'), T('L024', 'ripcords') + .3), '#7CFF9B'); text(ctx, 'RIPCORDS HE CAN PULL HIMSELF', 1360, 840, { font: F.osw, size: 32, color: '#7CFF9B', align: 'center', weight: 600, ls: 3 }); }
    if (t > T('L024', 'smart')) hand(ctx, 'smart.', 860, 980, prog(t, T('L024', 'smart'), T('L024', 'smart') + .4), { color: '#FFD23F', size: 90 });
  }, { name: 'chute-choice' });
  cue(T('L024', 'military') + .3, 'scribble'); cue(T('L024', 'civilian'), 'thud', .5);
  photoShot(['L025', 'Just'], IMG.seatac72 ? 'seatac72' : 'plane_pd', { grade: 'night', tint: 'navy', tintAmt: .6, rain: .4, z0: 1.05, z1: 1.2, shade: .1, draw: (ctx, t) => {
    kicker(ctx, 'SEATTLE-TACOMA AIRPORT · JUST BEFORE 6 PM', 110, 150, t, T('L025', 'Just'), { color: '#5EA8FF' });
    const s0 = T('L025', 'window'); if (t > s0) { ctx.fillStyle = 'rgba(8,10,16,.75)'; ctx.fillRect(0, 380, W, 300);
      for (let i = 0; i < 14; i++) { const x = 140 + i * 120, p = prog(t, s0 + i * .05, s0 + i * .05 + .35); ctx.fillStyle = '#FFE2A0'; ctx.beginPath(); ctx.roundRect(x, 450, 70, 110, 30); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.roundRect(x, 450, 70, 110, 30); ctx.clip(); ctx.fillStyle = '#20242B'; ctx.fillRect(x, 450, 70, 110 * p); ctx.restore(); }
      text(ctx, 'EVERY SHADE DOWN', W / 2, 640, { font: F.bebas, size: 60, color: PAL.cream, align: 'center', ls: 6 }); } } });
  cue(T('L025', 'window'), 'paper', .6);
  shot(['L026', 'In'], (ctx, t, lt) => {
    bgGrad(ctx, '#0F1B2D', '#04070C'); const a = T('L026', 'In');
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 3; ctx.strokeRect(300, 300, 560, 600); text(ctx, 'FLIGHT 305', 580, 280, { font: F.osw, size: 32, color: 'rgba(255,255,255,.6)', align: 'center', weight: 600 });
    for (let i = 0; i < 35; i++) { const st = a + .3 + i * .04, p = prog(t, st, st + 1.4); const x = lerp(360 + (i % 7) * 70, 1300 + (i % 7) * 75, E.inOut(p)), y = 380 + Math.floor(i / 7) * 110;
      personIcon(ctx, x, y, 1.1, p >= 1 ? '#7CFF9B' : PAL.cream); }
    counter(ctx, 35 * E.out(prog(t, a + .3, a + 1.8)), 1500, 220, { suffix: ' PASSENGERS FREED', size: 90, align: 'center', color: '#7CFF9B' });
    if (t > T('L026', 'Most')) hand(ctx, 'wait... what hijacking?', 1150, 1000, prog(t, T('L026', 'Most'), T('L026', 'hijacked', 'e')), { color: '#FFD23F', size: 66 });
  }, { name: 'passengers' });
  cue(T('L026', 'In'), 'whoosh', .5);
  shot(['L027', 'Then'], (ctx, t, lt) => {
    if (IMG.cockpit) photo(ctx, 'cockpit', { zoom: 1.2 + lt * .02, grade: 'night', tint: 'navy', tintAmt: .7, blur: 3 }); else bgGrad(ctx, '#0F1B2D', '#04070C');
    shade(ctx, .35); ctx.save(); tilt3d(ctx, W / 2, H / 2, -.12); ctx.fillStyle = '#F1E9D8'; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 50;
    ctx.fillRect(420, 90, 1080, 900); ctx.shadowColor = 'transparent'; ctx.drawImage(paperTex('#F1E9D8', 51, 1080, 900), 420, 90);
    ctx.fillStyle = '#6B4A2A'; ctx.fillRect(840, 60, 240, 70);
    text(ctx, 'FLIGHT PLAN', 480, 220, { font: F.bebas, size: 90, color: PAL.ink }); text(ctx, 'AS DICTATED BY THE HIJACKER', 485, 265, { font: F.mono, size: 26, color: PAL.red });
    const items = [['DESTINATION: MEXICO CITY', 'L028', 'Mexico'], ['SPEED: AS SLOW AS POSSIBLE', 'L028', 'slowest'], ['LANDING GEAR: DOWN', 'L028', 'Landing'], ['FLAPS: 15°', 'L028', 'Wing'], ['ALTITUDE: ≤ 10,000 FT', 'L028', 'higher'], ['CABIN: UNPRESSURIZED', 'L028', 'Cabin'], ['AFT AIRSTAIR: DOWN', 'L029', 'rear']];
    items.forEach(([s, id, w], i) => { const st = T(id, w); if (t < st) return; const p = prog(t, st, st + .25);
      ctx.globalAlpha = p; text(ctx, '✓', 490, 360 + i * 85, { font: F.osw, size: 52, color: i === 6 ? PAL.red2 : '#2E7D32', weight: 700 }); text(ctx, s, 560, 360 + i * 85, { font: F.type, size: 50, color: i === 6 ? PAL.red : PAL.ink }); ctx.globalAlpha = 1; });
    ctx.restore();
  }, { name: 'flight-plan' });
  ['Mexico', 'slowest', 'Landing', 'Wing', 'higher', 'Cabin'].forEach(w => cue(T('L028', w), 'key', 1.2)); cue(T('L029', 'rear'), 'stamp', .8);
  shot(['L029', 'The'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0B2340', 'rgba(140,190,255,.14)', 56, 6);
    b727(ctx, W / 2 + 60, H / 2, 1.5, { stair: 0, gear: true });
    stamp(ctx, 'UNSAFE ON TAKEOFF', W / 2, 260, t, T('L029', 'unsafe'), { size: 100, color: '#FF4A3A' });
    if (t > T('L029', 'lower')) hand(ctx, '"fine. I\'ll lower it myself, in the air."', 220, 900, prog(t, T('L029', 'lower'), T('L029', 'air', 'e')), { color: '#FFD23F', size: 64 });
  }, { name: 'stair-deal' });
  cue(T('L029', 'unsafe'), 'stamp');
  photoShot(['L030', 'Here'], 'airstair', { grade: 'color', z0: 1.05, z1: 1.3, fx0: .5, fx1: .55, fy0: .5, fy1: .62, leak: .2, draw: (ctx, t) => {
    if (t > T('L030', 'staircase')) { penArrow(ctx, 520, 200, 760, 600, prog(t, T('L030', 'staircase'), T('L030', 'staircase') + .5), { color: '#FF4A3A', bow: -60 });
      hand(ctx, 'stairs under the tail', 300, 170, prog(t, T('L030', 'staircase'), T('L030', 'tail', 'e')), { color: '#FF4A3A', size: 70 }); }
    if (t > T('L030', 'flight')) stamp(ctx, 'OPENS IN FLIGHT', 1400, 300, t, T('L030', 'flight'), { size: 90, color: '#FFD23F', rot: .08 });
    if (t > T('L030', 'knew')) glowText(ctx, 'HE KNEW THAT.', W / 2, 980, { font: F.bebas, size: 120, color: PAL.cream, align: 'center', alpha: prog(t, T('L030', 'knew'), T('L030', 'knew') + .3) }); } });
  cue(T('L030', 'flight'), 'stamp', .7); cue(T('L030', 'knew'), 'thud', .6);
  // ---------------- ACT 2: the jump
  shot(['L031', 'At'], (ctx, t, lt) => {
    photo(ctx, 'plane_pd', { zoom: 1.2 + lt * .04, fx: .45, grade: 'night', tint: 'navy', tintAmt: .8 }); shade(ctx, .3, '4,8,16'); rain(ctx, t, 1); lightning(ctx, t, [T('L031', 'rainy') - .05]);
    text(ctx, '7:40 PM', 120, 220, { font: F.bebas, size: 150, color: PAL.cream, alpha: prog(t, T('L031', 'At'), T('L031', 'At') + .3) }); kicker(ctx, 'TAKEOFF FROM SEATTLE', 120, 290, t, T('L031', 'At'), { color: '#5EA8FF' });
    const f = T('L031', 'F-106'); if (t > f - .2) { const p = E.out(prog(t, f - .2, f + .4)); ctx.save(); ctx.globalAlpha = p;
      card(ctx, 'f106', { cx: lerp(W + 400, 1440, p), cy: 640, maxW: 640, maxH: 380, rot: -.04, filter: GRADES.color }); ctx.restore();
      lowerTag(ctx, '2 × F-106 DELTA DART', 'SHADOWING THE JET · PHOTO: USAF, 1970', t, f + .2, { x: 1130, y: 960 }); }
  }, { name: 'takeoff' });
  cue(T('L031', 'rainy') - .05, 'impact', .4); cue(T('L031', 'F-106') - .2, 'whoosh', .8);
  shot(['L032', 'Cooper'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0B1626', 'rgba(140,190,255,.10)', 56, 2);
    ctx.strokeStyle = 'rgba(200,225,255,.8)'; ctx.lineWidth = 4; ctx.strokeRect(200, 300, 1520, 260); blueprintLabel(ctx, 'COCKPIT', 230, 280); blueprintLabel(ctx, 'ROW 18', 1560, 280);
    const p = E.inOut(prog(t, T('L032', 'sends'), T('L032', 'stay'))); personIcon(ctx, lerp(1560, 300, p), 460, 1.4, '#5EA8FF'); personIcon(ctx, 1640, 460, 1.4, '#FF4A3A');
    text(ctx, 'MUCKLOW', lerp(1560, 300, p), 550, { font: F.osw, size: 26, color: '#5EA8FF', align: 'center', weight: 600 }); text(ctx, 'COOPER', 1640, 550, { font: F.osw, size: 26, color: '#FF4A3A', align: 'center', weight: 600 });
    if (p >= 1) { ctx.fillStyle = '#C8E1FF'; ctx.fillRect(420, 300, 10, 260); }
    if (t > T('L032', 'last')) { const q = prog(t, T('L032', 'last'), T('L032', 'last') + .4); ctx.save(); ctx.globalAlpha = q; card(ctx, 'crew', { cx: 1200, cy: 820, maxW: 760, maxH: 300, filter: GRADES.bw }); ctx.restore();
      kicker(ctx, 'THE LAST PERSON TO SEE HIM', 110, 820, t, T('L032', 'last'), { color: '#FF4A3A', size: 44 }); }
  }, { name: 'last-seen' });
  cue(T('L032', 'last'), 'thud', .5);
  shot(['L033', 'Around'], (ctx, t, lt) => {
    bgGrad(ctx, '#0A0A0C', '#000'); const on = t > T('L033', 'warning'), blink = on && Math.floor(t * 4) % 2 === 0;
    ctx.fillStyle = '#1A1A1E'; ctx.fillRect(560, 300, 800, 480); ctx.strokeStyle = '#444'; ctx.lineWidth = 6; ctx.strokeRect(560, 300, 800, 480);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#2A2A2E'; ctx.fillRect(610 + i * 120, 340, 90, 60); }
    ctx.save(); if (blink) { ctx.shadowColor = '#FF2A1A'; ctx.shadowBlur = 80; } ctx.fillStyle = blink ? '#FF3B2B' : '#4A1512'; ctx.fillRect(710, 480, 500, 170); ctx.restore();
    text(ctx, 'AFT STAIR', 960, 590, { font: F.bebas, size: 110, color: blink ? '#fff' : '#7A3A35', align: 'center' });
    text(ctx, '≈ 8:00 PM', 960, 220, { font: F.bebas, size: 120, color: PAL.cream, align: 'center' });
    if (blink) { ctx.fillStyle = 'rgba(255,40,20,.08)'; ctx.fillRect(0, 0, W, H); }
    sourceTag(ctx, 'Illustration');
  }, { name: 'warning' });
  for (let k = 0; k < 6; k++) cue(T('L033', 'warning') + k * .5, 'tick', .9);
  shot(['L034', 'At'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0B2340', 'rgba(140,190,255,.14)', 56, 10); rain(ctx, t, .5);
    const j = T('L034', 'jolt'), sh = t > j ? Math.exp(-(t - j) * 5) * 22 : 0; ctx.translate((hash(Math.floor(t * 30)) - .5) * sh, (hash(Math.floor(t * 30) + 5) - .5) * sh);
    b727(ctx, W / 2 + 60, H / 2, 1.5, { stair: 1, gear: true, pitch: t > T('L034', 'tail') ? .07 * E.out(prog(t, T('L034', 'tail'), T('L034', 'tail') + .4)) : 0 });
    text(ctx, '8:13 PM', 120, 200, { font: F.bebas, size: 160, color: '#FF4A3A' });
    if (t > T('L034', 'nothing') - .3) { ctx.fillStyle = `rgba(0,0,0,${E.in(prog(t, T('L034', 'nothing') - .3, T('L034', 'nothing', 'e')))})`; ctx.fillRect(-50, -50, W + 100, H + 100); }
  }, { name: 'jolt' });
  cue(T('L034', 'jolt'), 'impact', 1.1);
  shot(['L035', 'They'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 4)); const pr = drawGeo(ctx, GEO_PNW, { lon: lerp(-122.3, -121.0, u), lat: lerp(45.9, 42.8, u), k: lerp(240, 120, u), theme: 'night' }, [['WASHINGTON', -120.5, 47.3], ['OREGON', -120.5, 44.0], ['NEVADA', -117.0, 40.0], ['CALIFORNIA', -121.5, 39.0]]);
    const jmp = pr(...PLACES.JUMP), reno = pr(...PLACES.RENO); pinMap(ctx, pr, 'JUMP', t, T('L035', 'They'), '8:13 PM', { left: true });
    route(ctx, jmp, reno, prog(t, T('L035', 'They'), T('L035', 'Reno') + .3), { plane: true, ctrl: [jmp[0] + 40, (jmp[1] + reno[1]) / 2] });
    pinMap(ctx, pr, 'RENO', t, T('L035', 'Reno'), 'RENO · 11:02 PM'); if (t > T('L035', 'stairs')) hand(ctx, 'stairs still down', reno[0] - 420, reno[1] + 100, prog(t, T('L035', 'stairs'), T('L035', 'down', 'e')), { color: '#FF8A7A' });
    sourceTag(ctx, 'Map: Natural Earth');
  }, { name: 'to-reno' });
  cue(T('L035', 'Reno'), 'thud', .5);
  shot(['L036', 'Agents'], (ctx, t, lt) => {
    photo(ctx, 'crew', { zoom: 1.05 + lt * .03, grade: 'bw' }); shade(ctx, .55);
    bigTitle(ctx, 'EMPTY.', W / 2, 330, t, T('L036', 'empty'), { align: 'center', size: 200, color: '#FF4A3A' });
    const inv = [['2 OF 4 PARACHUTES', 'two', 'chute'], ['HIS CLIP-ON TIE', 'tie', 'tie'], ['8 CIGARETTE BUTTS', 'eight', null]];
    inv.forEach(([s, w, k], i) => { const st = T('L036', w); if (t < st) return; const p = E.out(prog(t, st, st + .3)), x = 240 + i * 500;
      ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = 'rgba(12,10,9,.92)'; ctx.fillRect(x, 560, 440, 380); ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3; ctx.strokeRect(x, 560, 440, 380);
      if (k && IMG[k]) photo(ctx, k, { x: x + 10, y: 570, w: 420, h: 290, grade: 'color', alpha: p });
      else { for (let c = 0; c < 8; c++) { ctx.save(); ctx.translate(x + 90 + (c % 4) * 85, 650 + Math.floor(c / 4) * 110); ctx.rotate(hash(c) - .5); ctx.fillStyle = '#E8DCC0'; ctx.fillRect(-30, -7, 60, 14); ctx.fillStyle = '#C8823A'; ctx.fillRect(10, -7, 20, 14); ctx.restore(); } }
      ctx.restore(); text(ctx, s, x + 220, 910, { font: F.bebas, size: 54, color: PAL.cream, align: 'center', alpha: p }); });
    sourceTag(ctx, 'Flight 305 crew, Reno, Nov. 25, 1971 · evidence photos: FBI');
  }, { name: 'empty' });
  cue(T('L036', 'empty'), 'impact', .8); ['two', 'tie', 'eight'].forEach(w => cue(T('L036', w), 'shutter', .6));
  // ---------------- ACT 3: manhunt
  shot(['L037', 'What'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1E24', '#07080A'); const keys = ['vault_p1', 'vault_p3', 'vault_p5', 'vault_p8'];
    keys.forEach((k, i) => { const st = T('L037', 'What') + i * .25, p = E.out(prog(t, st, st + .6)); if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = p; card(ctx, k, { cx: 380 + i * 390, cy: lerp(1300, 560 + (i % 2) * 40, p), maxW: 420, maxH: 560, rot: (i - 1.5) * .06, filter: GRADES.bw }); ctx.restore(); });
    if (t > T('L037', 'Codename')) { shade(ctx, .35); stamp(ctx, 'NORJAK', W / 2, 520, t, T('L037', 'Codename') + .2, { size: 240, color: '#E8402F', rot: -.08 }); }
    if (t > T('L037', 'Northwest')) text(ctx, 'NORTHWEST HIJACKING', W / 2, 720, { font: F.osw, size: 52, color: PAL.cream, align: 'center', weight: 600, ls: 10, alpha: prog(t, T('L037', 'Northwest'), T('L037', 'Northwest') + .3) });
    sourceTag(ctx, 'FBI NORJAK file · The Vault, public domain');
  }, { name: 'norjak' });
  [0, 1, 2, 3].forEach(i => cue(T('L037', 'What') + i * .25, 'paper', .5)); cue(T('L037', 'Codename') + .2, 'stamp');
  shot(['L038', 'Agents'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 5)); const pr = drawGeo(ctx, GEO_PNW, { lon: lerp(-122.5, -122.55, u), lat: lerp(46.1, 45.96, u), k: lerp(500, 1300, u), theme: 'night' });
    if (IMG.forest) { ctx.save(); ctx.globalAlpha = .3 * prog(t, T('L038', 'Thick'), T('L038', 'Thick') + .5); photo(ctx, 'forest', { grade: 'night', tint: 'teal' }); ctx.restore(); }
    rain(ctx, t, prog(t, T('L038', 'freezing'), T('L038', 'freezing') + .5));
    const a = pr(...PLACES.ARIEL); ctx.save(); ctx.strokeStyle = 'rgba(255,74,58,.8)'; ctx.fillStyle = 'rgba(255,74,58,.12)'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.arc(a[0], a[1], 260 * E.out(prog(t, T('L038', 'jump'), T('L038', 'jump') + .6)), 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
    pinMap(ctx, pr, 'ARIEL', t, T('L038', 'Ariel'), 'ARIEL, WA'); pinMap(ctx, pr, 'MERWIN', t, T('L038', 'Merwin'), 'LAKE MERWIN', { left: true, color: '#5EA8FF' });
    kicker(ctx, 'FBI\'S LIKELY JUMP ZONE', 110, 150, t, T('L038', 'jump'));
    ['THICK FOREST', 'STEEP HILLS', 'FREEZING RAIN'].forEach((s, i) => { const w = ['Thick', 'steep', 'freezing'][i]; if (t > T('L038', w)) text(ctx, s, 120, 820 + i * 80, { font: F.bebas, size: 76, color: PAL.cream, alpha: prog(t, T('L038', w), T('L038', w) + .25) }); });
    sourceTag(ctx, 'Map: Natural Earth · positions approximate');
  }, { name: 'jump-zone' });
  shot(['L039', 'Soldiers'], (ctx, t, lt) => {
    const sr = T('L039', 'SR-71');
    if (t < sr - .2) { photo(ctx, IMG.soldiers ? 'soldiers' : (IMG.forest ? 'forest' : 'crew'), { zoom: 1.08 + lt * .04, grade: 'bw', tint: 'teal', tintAmt: .5 }); gradeTop(ctx, .6);
      kicker(ctx, 'FORT LEWIS SOLDIERS · WEEKS OF SEARCHING', 110, 150, t, T('L039', 'Soldiers')); sourceTag(ctx, IMG.soldiers ? 'Illustrative · ' + cr('soldiers') : 'Illustrative'); }
    else { photo(ctx, 'sr71', { zoom: 1.05 + (t - sr) * .04, grade: 'color', fx: .5, fy: .45 }); scanlines(ctx, .12);
      brackets(ctx, 640, 260, 640, 520, prog(t, sr, sr + .3), '#7CFF9B'); text(ctx, 'REC ●', 120, 140, { font: F.mono, size: 40, color: Math.floor(t * 2) % 2 ? '#FF3B2B' : '#7CFF9B' });
      kicker(ctx, 'SR-71 BLACKBIRD · PHOTO RECON OF THE FLIGHT PATH', 110, 960, t, sr, { color: '#7CFF9B' });
      if (t > T('L039', 'nothing')) stamp(ctx, 'NOTHING FOUND', W / 2, 540, t, T('L039', 'nothing'), { size: 150 }); sourceTag(ctx, 'SR-71: NASA, public domain'); }
  }, { name: 'search' });
  cue(T('L039', 'SR-71') - .2, 'whoosh', .8); cue(T('L039', 'nothing'), 'stamp');
  shot(['L040', 'Within'], (ctx, t, lt) => {
    bgGrad(ctx, '#111827', '#05070C'); const a = T('L040', 'Within');
    const cols = 40, p = E.out(prog(t, a, a + 2.2));
    for (let i = 0; i < 800; i++) { const x = 420 + (i % cols) * 27, y = 380 + Math.floor(i / cols) * 27; ctx.fillStyle = i < 800 * p ? '#E8402F' : 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); }
    counter(ctx, 800 * p, W / 2, 250, { suffix: '+ SUSPECTS', size: 150, align: 'center' }); text(ctx, 'IN FIVE YEARS', W / 2, 320, { font: F.osw, size: 36, color: 'rgba(244,236,220,.7)', align: 'center', weight: 500, ls: 8 });
  }, { name: 'suspects-800' });
  shot(['L041', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#3A0A08', '#000', 'r'); const a = T('L041', 'Copycats');
    if (t > a) { for (let i = 0; i < 6; i++) { const p = prog(t, a + i * .07, a + i * .07 + .2); text(ctx, 'COPYCATS', W / 2 + (i - 2.5) * 24, 560 + (i - 2.5) * 24, { font: F.bebas, size: 240, color: i === 5 ? '#fff' : `rgba(255,74,58,${.25 + i * .1})`, align: 'center', alpha: p }); } glitch(ctx, t, lt < 1.2 ? .8 : .2, 4); }
    else kicker(ctx, 'MEANWHILE…', 120, 540, t, T('L041', 'And'), { size: 60 });
  }, { name: 'copycats' });
  cue(T('L041', 'Copycats'), 'hit', .8);
  shot(['L042', 'In'], (ctx, t, lt) => {
    bgGrad(ctx, '#121212', '#050505'); kicker(ctx, '1972 · U.S. AIRSPACE', 120, 150, t, T('L042', 'In'), { color: PAL.gold });
    const a = T('L042', 'thirty'), b = T('L042', 'Fifteen');
    for (let i = 0; i < 31; i++) { const p = E.back(prog(t, a + i * .03, a + i * .03 + .25)); if (p <= 0) continue; ctx.save(); ctx.translate(200 + (i % 16) * 100, 360 + Math.floor(i / 16) * 140); ctx.rotate(-Math.PI / 4); ctx.scale(p, p); planeIcon(ctx, 1.2, i < 15 && t > b ? '#FF4A3A' : PAL.cream); ctx.restore(); }
    text(ctx, '31 HIJACKINGS', 200, 720, { font: F.bebas, size: 120, color: PAL.cream, alpha: prog(t, a, a + .3) });
    if (t > b) { text(ctx, '15 DEMANDED PARACHUTES', 200, 860, { font: F.bebas, size: 120, color: '#FF4A3A', alpha: prog(t, b, b + .3) }); for (let k = 0; k < 3; k++) chuteIcon(ctx, 1450 + k * 140, 700, .55, prog(t, b + .2 + k * .1, b + .5 + k * .1), { t }); }
    hand(ctx, 'everyone wanted a parachute', 1150, 1000, prog(t, b + .6, b + 1.4), { color: '#FFD23F', size: 54 });
  }, { name: '1972' });
  cue(T('L042', 'thirty'), 'riser', .5); cue(T('L042', 'Fifteen'), 'thud', .7);
  shot(['L043', 'Five'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0A1322', 'rgba(255,90,72,.07)', 54, 3); const bx = 220, by = 200, bw = 460, bh = 600;
    if (IMG.mccoy) photo(ctx, 'mccoy', { x: bx, y: by, w: bw, h: bh, zoom: 1.02, grade: 'bw' }); brackets(ctx, bx - 20, by - 20, bw + 40, bh + 40, prog(t, T('L043', 'Richard'), T('L043', 'Richard') + .3));
    kicker(ctx, 'APRIL 1972 · UNITED AIRLINES 727', 820, 230, t, T('L043', 'Five'));
    bigTitle(ctx, 'RICHARD McCOY', 820, 380, t, T('L043', 'Richard'), { size: 130 });
    dataRow(ctx, 'BACKGROUND', 'FORMER ARMY GREEN BERET', 830, 470, t, T('L043', 'Green'));
    if (t > T('L043', 'half')) counter(ctx, 500000 * E.out(prog(t, T('L043', 'half'), T('L043', 'dollars', 'e'))), 830, 700, { prefix: '$', size: 150, color: '#FFD86B' });
    dataRow(ctx, 'BAILED OUT OVER', 'UTAH', 830, 760, t, T('L043', 'Utah'));
    if (t > T('L043', 'arrested')) stamp(ctx, 'ARRESTED 2 DAYS LATER', 1300, 950, t, T('L043', 'arrested'), { size: 80 });
    if (IMG.mccoy) sourceTag(ctx, 'Richard McCoy Jr. · public domain');
  }, { name: 'mccoy' });
  cue(T('L043', 'arrested'), 'stamp');
  shot(['L044', 'So'], (ctx, t, lt) => {
    const v = T('L044', 'Cooper');
    if (t < v - .2) { gridBG(ctx, t, '#0B2340', 'rgba(140,190,255,.14)', 56, 4); const lk = t > T('L044', 'latch');
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.strokeStyle = '#C8E1FF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-500, -40); ctx.lineTo(500, -40); ctx.stroke(); blueprintLabel(ctx, 'FUSELAGE BELLY', -500, -70);
      ctx.save(); ctx.translate(0, -40); ctx.rotate(lk ? -E.out(prog(t, T('L044', 'latch'), T('L044', 'latch') + .4)) * .9 : 0); ctx.strokeStyle = '#FF4A3A'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = 'rgba(200,225,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(-420, 160); ctx.stroke(); blueprintLabel(ctx, 'AIRSTAIR', -470, 210);
      blueprintLabel(ctx, 'AIRFLOW ▸ VANE ROTATES ▸ STAIR LOCKED', -400, 300, { color: '#FF8A7A', size: 30 }); ctx.restore(); sourceTag(ctx, 'Simplified diagram'); }
    else { photo(ctx, 'vane', { zoom: 1.4 + (t - v) * .05, fx: .4, fy: .55, grade: 'color' }); gradeTop(ctx, .5); penEllipse(ctx, W * .42, H * .5, 220, 170, prog(t, v, v + .5), { seed: 2, color: '#FF4A3A' });
      bigTitle(ctx, 'THE COOPER VANE', 120, 980, t, v, { size: 140 }); sourceTag(ctx, 'Cooper vane on a 727 · public domain'); }
  }, { name: 'vane' });
  cue(T('L044', 'Cooper') - .2, 'whoosh', .8);
  shot(['L045', 'And'], (ctx, t, lt) => {
    if (IMG.security) { photo(ctx, 'security', { zoom: 1.05 + lt * .03, grade: 'color' }); gradeTop(ctx, .6); sourceTag(ctx, 'Illustrative · ' + cr('security')); }
    else { bgGrad(ctx, '#0A2A2C', '#020808'); for (let i = 0; i < 5; i++) { const x = ((lt * 300 + i * 420) % (W + 400)) - 300; ctx.fillStyle = 'rgba(120,255,230,.15)'; ctx.fillRect(x, 520, 300, 200); ctx.strokeStyle = 'rgba(120,255,230,.6)'; ctx.strokeRect(x, 520, 300, 200); } }
    kicker(ctx, 'FROM 1973 · EVERY PASSENGER, EVERY BAG', 110, 160, t, T('L045', '1973'));
    if (t > T('L045', 'thank')) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 760, W, 220); hand(ctx, 'thanks, Dan.', 700, 900, prog(t, T('L045', 'thank'), T('L045', 'Cooper', 'e')), { color: '#FFD23F', size: 120 }); }
  }, { name: 'security' });
  cue(T('L045', 'thank'), 'scribble', .9);
  // ---------------- ACT 4: clues
  photoShot(['L046', 'For'], IMG.forest ? 'forest' : 'sketch_color', { grade: 'color', z0: 1.05, z1: 1.18, shade: .25, creditText: IMG.forest ? 'Illustrative · ' + cr('forest') : '', draw: (ctx, t) => {
    bigTitle(ctx, 'THE TRAIL GOES COLD', W / 2, 560, t, T('L046', 'For') + .2, { align: 'center', size: 150 });
    if (t > T('L046', 'forest')) kicker(ctx, '…THEN THE FOREST STARTS GIVING THINGS BACK', 560, 680, t, T('L046', 'forest'), { color: PAL.gold }); } });
  shot(['L047', 'In'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 5)); const pr = drawGeo(ctx, GEO_PNW, { lon: lerp(-122.45, -122.72, u), lat: lerp(46.5, 46.25, u), k: lerp(420, 900, u), theme: 'paper' });
    kicker(ctx, 'NOVEMBER 1978', 110, 150, t, T('L047', 'In'));
    const cr0 = pr(-122.91, 46.275); pin(ctx, cr0[0], cr0[1], t, T('L047', 'Castle'), 'CASTLE ROCK', { left: true, color: '#1E6FD9' });
    const pc = pinMap(ctx, pr, 'CASTLE', t, T('L047', 'placard'), 'PLACARD FOUND');
    if (t > T('L047', 'thirteen')) { penLine(ctx, cr0[0], cr0[1], pc[0], pc[1], prog(t, T('L047', 'thirteen'), T('L047', 'miles', 'e')), { color: '#1E6FD9', bow: 0 }); text(ctx, '13 MI', (cr0[0] + pc[0]) / 2, (cr0[1] + pc[1]) / 2 - 30, { font: F.bebas, size: 60, color: '#1E6FD9', align: 'center' }); }
    if (t > T('L047', 'placard')) { const p = E.out(prog(t, T('L047', 'placard'), T('L047', 'placard') + .4)); ctx.save(); ctx.globalAlpha = p; card(ctx, 'airstair', { cx: 1500, cy: 330, maxW: 520, maxH: 340, rot: .04, filter: GRADES.color }); ctx.restore(); text(ctx, 'A 727 AIRSTAIR (FOR REFERENCE)', 1500, 560, { font: F.osw, size: 28, color: PAL.ink, align: 'center', weight: 600, alpha: p }); }
    if (t > T('L047', 'Right')) hand(ctx, 'right under the flight path', 260, 980, prog(t, T('L047', 'Right'), T('L047', 'path', 'e')), { color: '#B2241C', size: 66 });
    sourceTag(ctx, 'Map: Natural Earth · inset: Northwest 727 airstair, 1975 (CC BY 2.5)');
  }, { name: 'placard' });
  shot(['L048', 'Then'], (ctx, t, lt) => {
    const a = T('L048', 'Then');
    if (t < T('L048', 'eight') - .1) { bgGrad(ctx, '#12161C', '#050608'); timelineBar(ctx, 560, [[1971, 'HIJACKING', a], [1978, 'PLACARD', a + .2], [1980, 'FEB 10', a + .5]], 1969, 1982, t, a);
      glowText(ctx, 'FEBRUARY 10, 1980', W / 2, 360, { font: F.bebas, size: 150, color: PAL.cream, align: 'center', alpha: prog(t, T('L048', 'February'), T('L048', 'February') + .3) }); }
    else { if (IMG.columbia) photo(ctx, 'columbia', { zoom: 1.05 + lt * .03, grade: 'warm' }); else bgGrad(ctx, '#2D4B5A', '#0C1820'); gradeTop(ctx, .55); lightLeak(ctx, t, .25, 11);
      kicker(ctx, 'BRIAN INGRAM · AGE 8', 110, 160, t, T('L048', 'Brian'), { color: PAL.gold, size: 44 });
      if (t > T('L048', 'Tena')) lowerTag(ctx, 'TENA BAR · COLUMBIA RIVER', 'DOWNSTREAM FROM VANCOUVER, WASHINGTON', t, T('L048', 'Tena')); if (IMG.columbia) sourceTag(ctx, 'Columbia River (illustrative) · ' + cr('columbia')); }
  }, { name: 'tena' });
  cue(T('L048', 'February'), 'thud', .6);
  photoShot(['L049', 'Raking'], 'money', { grade: 'color', z0: 1.35, z1: 1.05, fy0: .4, fy1: .5, shade: .1, sfx: 'shutter', creditText: 'Ransom bills found at Tena Bar, 1980 · FBI, public domain', draw: (ctx, t) => {
    if (t > T('L049', 'Five')) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, H - 300, W, 300); counter(ctx, 5800 * E.out(prog(t, T('L049', 'Five'), T('L049', 'dollars', 'e'))), 120, H - 90, { prefix: '$', size: 200, color: '#FFD86B' }); }
    if (t > T('L049', 'three')) kicker(ctx, '3 BUNDLES · ROTTING $20 BILLS', 110, 160, t, T('L049', 'three'), { color: PAL.gold });
    hand(ctx, 'he was building a campfire.', 1000, H - 140, prog(t, T('L049', 'campfire'), T('L049', 'campfire') + .6), { color: '#FFD23F', size: 56 }); } });
  cue(T('L049', 'Five'), 'cash');
  shot(['L050', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E1A12', '#040805'); const a = T('L050', 'matched');
    for (let r = 0; r < 2; r++) { const y = 380 + r * 220, p = E.out(prog(t, T('L050', 'The') + r * .2, T('L050', 'The') + r * .2 + .4)), x = r === 0 ? lerp(-900, 260, p) : lerp(W + 900, 260, p);
      ctx.fillStyle = r ? 'rgba(255,255,255,.06)' : 'rgba(232,64,47,.15)'; ctx.fillRect(x, y - 110, 1400, 150);
      text(ctx, r ? 'FOUND AT TENA BAR' : 'FBI RANSOM LIST', x + 30, y - 60, { font: F.osw, size: 28, color: 'rgba(244,236,220,.7)', weight: 600, ls: 4 });
      for (let k = 0; k < 10; k++) { ctx.fillStyle = r ? '#C8E6C9' : '#FFCDD2'; ctx.fillRect(x + 30 + k * 132, y - 30, 110, 30); } }
    if (t > a) { const p = prog(t, a, a + .4); ctx.fillStyle = `rgba(124,255,155,${.18 * p})`; ctx.fillRect(0, 0, W, H); stamp(ctx, 'MATCH', W / 2, 860, t, a, { size: 180, color: '#3DDC6E', rot: -.05 }); }
    if (t > T('L050', 'Cooper\'s')) bigTitle(ctx, 'COOPER\'S MONEY', W / 2, 200, t, T('L050', 'Cooper\'s'), { align: 'center', size: 120, color: '#FFD86B' });
    sourceTag(ctx, 'Illustration');
  }, { name: 'match' });
  cue(T('L050', 'matched'), 'stamp'); cue(T('L050', 'The') - .1, 'whoosh', .5);
  shot(['L051', 'It'], (ctx, t, lt) => {
    photo(ctx, 'money', { zoom: 1.6 + lt * .05, fx: .3, fy: .45, grade: 'duo', tint: 'gold' }); shade(ctx, .5);
    bigTitle(ctx, 'THE BIGGEST BREAK', W / 2, 480, t, T('L051', 'biggest'), { align: 'center', size: 150 });
    if (t > T('L051', 'confusing') - .2) bigTitle(ctx, 'AND THE MOST CONFUSING', W / 2, 660, t, T('L051', 'confusing') - .2, { align: 'center', size: 120, color: '#FF4A3A' });
  }, { name: 'break' });
  shot(['L052', 'Tena'], (ctx, t, lt) => {
    const pr = drawGeo(ctx, GEO_PNW, { lon: -122.62, lat: 45.84, k: 1500, theme: 'paper' }, [['COLUMBIA RIVER', -122.9, 45.66, { size: 30, color: '#1E5C78' }]]);
    const j = pinMap(ctx, pr, 'JUMP', t, T('L052', 'Tena'), 'LIKELY JUMP ZONE', { color: '#1E6FD9' }); const tb = pinMap(ctx, pr, 'TENA', t, T('L052', 'Tena') + .2, 'TENA BAR', { left: true });
    penLine(ctx, j[0], j[1], tb[0], tb[1], prog(t, T('L052', 'miles'), T('L052', 'jump', 'e')), { color: '#B2241C', bow: 0, lw: 5 });
    const qs = [['WASHED DOWN A RIVER?', 'Washed'], ['MOVED BY DREDGING?', 'Moved'], ['BURIED ON PURPOSE?', 'Buried']];
    qs.forEach(([s, w], i) => { if (t < T('L052', w)) return; const p = E.out(prog(t, T('L052', w), T('L052', w) + .3)); ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = 'rgba(14,12,11,.88)'; ctx.fillRect(1180, 260 + i * 150, 640, 120);
      ctx.fillStyle = PAL.red2; ctx.fillRect(1180, 260 + i * 150, 10, 120); text(ctx, s, 1215, 340 + i * 150, { font: F.bebas, size: 64, color: PAL.cream }); ctx.restore(); });
    if (t > T('L052', 'Nobody')) stamp(ctx, 'NO CONSENSUS', 560, 930, t, T('L052', 'Nobody'), { size: 100 });
    sourceTag(ctx, 'Map: Natural Earth · positions approximate');
  }, { name: 'how' });
  cue(T('L052', 'Nobody'), 'stamp', .8);
  shot(['L053', 'Brian'], (ctx, t, lt) => {
    bgGrad(ctx, '#0F140E', '#030503'); kicker(ctx, '2008 · AUCTION', 120, 160, t, T('L053', '2008'), { color: PAL.gold });
    const p = E.out(prog(t, T('L053', 'fifteen'), T('L053', 'fifteen') + .5)); for (let i = 0; i < 15; i++) { if (i / 15 > p) break; ctx.save(); ctx.translate(320 + (i % 5) * 140, 380 + Math.floor(i / 5) * 120); ctx.rotate((hash(i) - .5) * .3);
      if (IMG.bill20) ctx.drawImage(IMG.bill20, -100, -45, 200, 90); else { ctx.fillStyle = '#A9C7A0'; ctx.fillRect(-100, -45, 200, 90); ctx.strokeStyle = '#3E5E3A'; ctx.lineWidth = 3; ctx.strokeRect(-92, -37, 184, 74); text(ctx, '20', -80, 20, { font: F.bebas, size: 50, color: '#2E4A2A' }); } ctx.restore(); }
    const a = T('L053', 'thirty'); if (t > a) { counter(ctx, 37000 * E.out(prog(t, a, a + 1)), 1100, 520, { prefix: '$', size: 220, color: '#7CFF9B' }); text(ctx, 'FOR 15 BILLS', 1110, 590, { font: F.osw, size: 40, color: PAL.cream, weight: 500, ls: 6 }); }
    if (t > T('L053', 'Not')) { ctx.strokeStyle = '#7CFF9B'; ctx.lineWidth = 8; ctx.beginPath(); const q = prog(t, T('L053', 'Not'), T('L053', 'twenty', 'e')); ctx.moveTo(1100, 900); for (let k = 0; k <= 40 * q; k++) ctx.lineTo(1100 + k * 16, 900 - Math.pow(k / 40, 3) * 220); ctx.stroke();
      hand(ctx, 'not a bad return on a twenty', 1060, 980, q, { color: '#FFD23F', size: 54 }); }
  }, { name: 'auction' });
  cue(T('L053', 'thirty'), 'cash');
  shot(['L054', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#0B0F14', '#000'); photo(ctx, 'tie', { zoom: 1.1 + lt * .03, grade: 'color', alpha: .9 }); shade(ctx, .35);
    const a = T('L054', 'particles'); if (t > a - .4) { const p = E.out(prog(t, a - .4, a)); ctx.save(); ctx.beginPath(); ctx.arc(1300, 520, 330 * p, 0, 7); ctx.clip();
      photo(ctx, 'tie', { zoom: 4, fx: .55, fy: .5, grade: 'color' }); for (let i = 0; i < 70; i++) { const x = 1300 + (hash(i) - .5) * 600, y = 520 + (hash(i + 3) - .5) * 600; ctx.fillStyle = i % 4 ? '#C9D3DD' : '#FFD23F'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x + Math.sin(t * 2 + i) * 3, y, 2 + hash(i + 7) * 5, 0, 7); ctx.fill(); }
      ctx.restore(); ctx.strokeStyle = PAL.cream; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1300, 520, 330 * p, 0, 7); ctx.stroke(); }
    if (t > T('L054', 'titanium')) { text(ctx, 'Ti', 1660, 380, { font: F.bebas, size: 140, color: '#C9D3DD' }); kicker(ctx, 'TITANIUM', 1580, 450, t, T('L054', 'titanium')); }
    if (t > T('L054', 'rare')) kicker(ctx, 'RARE EARTH METALS', 1580, 520, t, T('L054', 'rare'), { color: PAL.gold });
    kicker(ctx, 'COOPER\'S J.C. PENNEY TIE · FBI EVIDENCE', 110, 160, t, T('L054', 'And'));
    sourceTag(ctx, 'Tie: FBI evidence photo · microscope view illustrative');
  }, { name: 'tie' });
  cue(T('L054', 'particles') - .3, 'riser', .6);
  shot(['L055', 'In'], (ctx, t, lt) => {
    photo(ctx, 'plane', { zoom: 1.3 + lt * .03, fx: .6, grade: 'duo', tint: 'blue', tintAmt: .8 }); shade(ctx, .45);
    kicker(ctx, '1971 · WHERE WAS TITANIUM USED?', 110, 160, t, T('L055', 'In'), { color: '#5EA8FF' });
    [['AEROSPACE', 'aerospace'], ['CHEMICAL PLANTS', 'chemical']].forEach(([s, w], i) => { if (t > T('L055', w)) bigTitle(ctx, s, 120, 420 + i * 170, t, T('L055', w), { size: 140 }); });
    if (t > T('L055', 'engineer')) text(ctx, 'ENGINEER?', 1200, 420, { font: F.bebas, size: 110, color: '#FFD23F', alpha: prog(t, T('L055', 'engineer'), T('L055', 'engineer') + .2) });
    if (t > T('L055', 'plant')) text(ctx, 'PLANT WORKER?', 1200, 560, { font: F.bebas, size: 110, color: '#FFD23F', alpha: prog(t, T('L055', 'plant'), T('L055', 'plant') + .2) });
    if (t > T('L055', 'can\'t')) stamp(ctx, 'INCONCLUSIVE', W / 2, 900, t, T('L055', 'can\'t'), { size: 110 });
  }, { name: 'titanium' });
  cue(T('L055', 'can\'t'), 'stamp', .7);
  // ---------------- ACT 5: suspects and today
  shot(['L056', 'So'], (ctx, t, lt) => {
    bgGrad(ctx, '#2B2622', '#0D0B0A', 'r'); ctx.globalAlpha = .4; ctx.drawImage(paperTex('#3A332C', 41), 0, 0); ctx.globalAlpha = 1;
    const a = T('L056', 'names');
    const P0 = pinned(ctx, 'sketch_color', 960, 500, 300, 420, 0, prog(t, T('L056', 'So'), T('L056', 'So') + .3), { label: 'UNSUB' });
    const sus = [['mccoy', 340, 320, 'McCOY'], ['rackstraw', 1580, 320, 'RACKSTRAW'], [null, 400, 800, 'PETERSON'], [null, 1540, 800, '???']];
    sus.forEach(([k, x, y, l], i) => { const p = prog(t, a + i * .2, a + i * .2 + .3); if (p <= 0) return;
      if (k && IMG[k]) { const P = pinned(ctx, k, x, y, 240, 300, (i - 1.5) * .05, p, { grade: 'bw', label: l }); redString(ctx, P0, P, prog(t, a + i * .2 + .2, a + i * .2 + .7)); }
      else { ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = '#E9E2D4'; ctx.fillRect(x - 130, y - 160, 260, 320); ctx.fillStyle = '#2A2622'; ctx.beginPath(); ctx.arc(x, y - 40, 60, 0, 7); ctx.fill(); ctx.fillRect(x - 90, y + 40, 180, 110);
        text(ctx, '?', x, y - 10, { font: F.bebas, size: 90, color: PAL.red2, align: 'center' }); ctx.restore(); text(ctx, l, x, y + 210, { font: F.osw, size: 30, color: PAL.cream, align: 'center', weight: 600, ls: 3, alpha: p }); redString(ctx, P0, [x, y - 160], prog(t, a + i * .2 + .2, a + i * .2 + .7)); } });
  }, { name: 'suspects' });
  cue(T('L056', 'So') - .1, 'paper');
  dossier(['L057', 'Richard'], 'mccoy', 'RICHARD McCOY', [['ROLE', 'THE COPYCAT · APRIL 1972', 'L057', 'copycat'], ['FBI SAYS', 'WRONG AGE · WRONG EYES', 'L057', 'Wrong'], ['FATE', 'KILLED IN SHOOTOUT WITH AGENTS, 1974', 'L057', 'killed']], ['RULED OUT', 'L057', 'ruled']);
  dossier(['L058', 'Robert'], 'rackstraw', 'ROBERT RACKSTRAW', [['BACKGROUND', 'VIETNAM VETERAN · PILOT', 'L058', 'Vietnam'], ['RECORD', 'CRIMINAL RECORD', 'L058', 'criminal'], ['DIED', '2019', 'L058', 'died']], ['CLEARED 1979', 'L058', 'cleared'], { credit: 'Rackstraw military ID, 1970 · public domain' });
  dossier(['L059', 'Sheridan'], null, 'SHERIDAN PETERSON', [['BACKGROUND', 'SMOKEJUMPER', 'L059', 'smokejumper'], ['JOB', 'BOEING TECHNICAL EDITOR', 'L059', 'Boeing'], ['DNA (TIE)', 'DID NOT POINT TO HIM', 'L059', 'DNA']], ['NO MATCH', 'L059', 'not']);
  shot(['L060', 'Then'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A0E0C', '#050303', 'r'); lightLeak(ctx, t, .2, 13);
    const c = T('L060', 'children');
    if (t < c) { glowText(ctx, '2024', W / 2, 460, { font: F.bebas, size: 300, color: PAL.cream, align: 'center', alpha: prog(t, T('L060', 'Then'), T('L060', '2024') + .3) });
      if (t > T('L060', 'twist')) bigTitle(ctx, 'A TWIST', W / 2, 640, t, T('L060', 'twist'), { align: 'center', size: 110, color: '#FF4A3A' }); }
    else { if (IMG.mccoy) pinned(ctx, 'mccoy', 330, 500, 300, 380, -.04, prog(t, c, c + .3), { grade: 'bw', label: 'RICHARD McCOY' });
      kicker(ctx, 'McCOY\'S CHILDREN: "OUR FATHER WAS COOPER"', 620, 220, t, c);
      if (t > T('L060', 'parachute')) { chuteIcon(ctx, 900, 400, 1.1, prog(t, T('L060', 'parachute'), T('L060', 'parachute') + .3), { t, fill: '#6B7A45' }); kicker(ctx, 'OLD PARACHUTE RIG · NORTH CAROLINA', 1060, 450, t, T('L060', 'North'), { color: PAL.gold, size: 30 }); }
      if (t > T('L060', 'family')) kicker(ctx, 'FAMILY: THE FBI TOOK IT', 620, 700, t, T('L060', 'family'), { color: '#5EA8FF' });
      if (t > T('L060', 'never')) stamp(ctx, 'FBI: NO PUBLIC CONFIRMATION', W / 2 + 200, 900, t, T('L060', 'never'), { size: 76 }); }
  }, { name: '2024' });
  cue(T('L060', '2024'), 'impact', .6); cue(T('L060', 'never'), 'stamp');
  shot(['L061', 'Officially'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1E24', '#07080A');
    if (t < T('L061', 'files')) { stamp(ctx, 'ACTIVE INVESTIGATION SUSPENDED', W / 2, 500, t, T('L061', 'suspended'), { size: 100 }); text(ctx, 'JULY 2016', W / 2, 720, { font: F.bebas, size: 120, color: PAL.cream, align: 'center', alpha: prog(t, T('L061', 'July'), T('L061', 'July') + .3) }); }
    else { const keys = ['vault_p1', 'vault_p3', 'vault_p5', 'vault_p8', 'fbidocs']; const a = T('L061', 'files');
      for (let i = 0; i < 18; i++) { const k = keys[i % 5], st = a + i * .12, p = E.out(prog(t, st, st + .7)); if (p <= 0) continue; ctx.save(); ctx.globalAlpha = .9;
        card(ctx, k, { cx: 260 + (i % 6) * 280 + (hash(i) - .5) * 60, cy: lerp(-500, 380 + Math.floor(i / 6) * 220, p), maxW: 300, maxH: 380, rot: (hash(i + 2) - .5) * .4, filter: GRADES.bw, mount: 8 }); ctx.restore(); }
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 820, W, 200); bigTitle(ctx, 'THE FILES KEEP COMING', W / 2, 960, t, a + .5, { align: 'center', size: 110 }); }
    sourceTag(ctx, 'FBI NORJAK file pages · The Vault, public domain');
  }, { name: 'files' });
  cue(T('L061', 'suspended'), 'stamp'); cue(T('L061', 'files'), 'paper');
  shot(['L062', 'Many'], (ctx, t, lt) => {
    if (IMG.forest) photo(ctx, 'forest', { zoom: 1.1 + lt * .03, grade: 'night', tint: 'navy', tintAmt: .7 }); else bgGrad(ctx, '#0B1626', '#000'); shade(ctx, .3, '2,4,10'); rain(ctx, t, 1);
    lightning(ctx, t, [T('L062', 'freezing') - .1]);
    const a = T('L062', 'night'), p = prog(t, a, a + 3.5); chuteIcon(ctx, lerp(900, 1500, p), lerp(-100, 760, p), .7, 1, { t, fill: '#5A1410', line: '#3A3A3A' });
    bigTitle(ctx, 'HE DIDN\'T SURVIVE?', 120, 220, t, T('L062', 'He'), { size: 120 });
    ['NIGHT JUMP', 'BUSINESS SUIT', 'FREEZING RAIN', 'THICK FOREST'].forEach((s, i) => { const w = ['night', 'business', 'freezing', 'thick'][i]; if (t > T('L062', w)) text(ctx, s, 120, 420 + i * 90, { font: F.bebas, size: 80, color: '#9EC9FF', alpha: prog(t, T('L062', w), T('L062', w) + .2) }); });
    if (IMG.forest) sourceTag(ctx, 'Illustrative · ' + cr('forest'));
  }, { name: 'didnt-survive' });
  cue(T('L062', 'freezing') - .1, 'impact', .5);
  shot(['L063', 'But'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E0C0B', '#000'); kicker(ctx, 'IF HE DIED, WHERE IS HE?', 120, 180, t, T('L063', 'where'), { size: 48 });
    [['NO BODY', 'body'], ['NO PARACHUTE', 'parachute'], ['NO BRIEFCASE', 'briefcase']].forEach(([s, w], i) => { if (t < T('L063', w)) return; const y = 400 + i * 170;
      text(ctx, s, 300, y, { font: F.bebas, size: 140, color: PAL.cream, alpha: prog(t, T('L063', w), T('L063', w) + .2) }); penLine(ctx, 160, y - 90, 240, y - 10, prog(t, T('L063', w), T('L063', w) + .2), { bow: 0, lw: 12 }); penLine(ctx, 240, y - 90, 160, y - 10, prog(t, T('L063', w) + .1, T('L063', w) + .3), { bow: 0, lw: 12 }); });
    if (t > T('L063', 'fifty')) { counter(ctx, 55, 1500, 520, { size: 300, color: '#FF4A3A', align: 'center' }); text(ctx, 'YEARS · ZERO TRACE', 1500, 610, { font: F.osw, size: 44, color: PAL.cream, align: 'center', weight: 600, ls: 6 }); }
  }, { name: 'no-trace' });
  ['body', 'parachute', 'briefcase'].forEach(w => cue(T('L063', w), 'thud', .7));
  shot(['L064', 'Maybe'], (ctx, t, lt) => {
    const w = T('L064', 'walked');
    if (t < w) { if (IMG.forest) photo(ctx, 'forest', { zoom: 1.2 + lt * .03, grade: 'night', tint: 'navy' }); else bgGrad(ctx, '#0B1626', '#000'); shade(ctx, .4); rain(ctx, t, .6); text(ctx, 'MAYBE THE TREES.', 120, 900, { font: F.bebas, size: 120, color: '#9EC9FF' }); }
    else { if (IMG.forest) photo(ctx, 'forest', { zoom: 1.25 + lt * .02, grade: 'warm' }); else bgGrad(ctx, '#5A3A1A', '#1A0E05'); lightLeak(ctx, t, .55, 15); dust(ctx, t, 60, .6);
      text(ctx, 'OR MAYBE…', 120, 260, { font: F.bebas, size: 100, color: PAL.cream, alpha: prog(t, w, w + .3) });
      if (t > T('L064', 'home')) hand(ctx, 'home for Thanksgiving.', 300, 820, prog(t, T('L064', 'home'), T('L064', 'Thanksgiving', 'e') + .2), { color: '#FFD23F', size: 120 }); }
  }, { name: 'maybe' });
  cue(T('L064', 'walked'), 'whoosh', .6);
  // ---------------- OUTRO
  const mont = [['plane', 'warm'], ['ticket', 'warm'], ['money', 'color'], ['tie', 'color'], ['airstair', 'color'], ['sketch_color', 'color']];
  shot(['L065', 'The'], (ctx, t, lt, sh) => {
    const segs = mont.length, d = sh.dur / segs, i = Math.min(segs - 1, Math.floor(lt / d)), ll = lt - i * d;
    photo(ctx, mont[i][0], { zoom: 1.1 + ll * .05, grade: mont[i][1] }); gradeTop(ctx, .55); filmBurn(ctx, lt, (i + 1) * d, .5); lightLeak(ctx, t, .2, 17);
    if (t > T('L065', 'history') - .2) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); bigTitle(ctx, 'STRAIGHT INTO HISTORY', W / 2, 560, t, T('L065', 'history') - .2, { align: 'center', size: 160 }); }
  }, { name: 'montage' });
  { const a = T('L065', 'The'), b = T('L066', 'His'); for (let i = 1; i < 6; i++) cue(a + i * (b - a) / 6, 'whoosh', .35); }
  shot(['L066', 'His'], (ctx, t, lt) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); photo(ctx, 'sketch_color', { x: W / 2 - 400, y: 0, w: 800, h: H, zoom: 1.05 + lt * .06, fy: .4, grade: 'color', alpha: .85 });
    const g = ctx.createLinearGradient(W / 2 - 400, 0, W / 2 + 400, 0); g.addColorStop(0, '#000'); g.addColorStop(.25, 'rgba(0,0,0,0)'); g.addColorStop(.75, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glowText(ctx, 'SOMEWHERE.', W / 2, 980, { font: F.bebas, size: 120, color: PAL.cream, align: 'center', alpha: prog(t, T('L066', 'Somewhere'), T('L066', 'Somewhere') + .4) });
  }, { name: 'somewhere' });
  shot(['L067', 'This'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050404', 'r'); lightLeak(ctx, t, .25, 19); dust(ctx, t, 50, .4);
    text(ctx, 'INK AND ANTIQUITY', W / 2, 420, { font: F.play, size: 110, color: PAL.cream, align: 'center', weight: 800, ls: 4, alpha: prog(t, T('L067', 'This'), T('L067', 'This') + .5) });
    const lp = prog(t, T('L067', 'This') + .2, T('L067', 'This') + .8); ctx.fillStyle = PAL.gold; ctx.fillRect(W / 2 - 300 * lp, 460, 600 * lp, 4);
    if (t > T('L067', 'theory')) { const p = E.back(prog(t, T('L067', 'theory'), T('L067', 'theory') + .3)); ctx.save(); ctx.translate(640, 680); ctx.scale(p, p); ctx.fillStyle = '#2A2622'; ctx.beginPath(); ctx.roundRect(-260, -70, 520, 140, 70); ctx.fill();
      text(ctx, 'YOUR THEORY?', 0, 22, { font: F.bebas, size: 64, color: PAL.cream, align: 'center' }); ctx.restore(); }
    if (t > T('L067', 'subscribe')) { const p = E.back(prog(t, T('L067', 'subscribe'), T('L067', 'subscribe') + .3)), cl = t > T('L067', 'subscribe') + .7; ctx.save(); ctx.translate(1280, 680); ctx.scale(p * (cl ? .95 : 1), p * (cl ? .95 : 1));
      ctx.fillStyle = cl ? '#3A3A3A' : '#E62117'; ctx.beginPath(); ctx.roundRect(-260, -70, 520, 140, 70); ctx.fill(); text(ctx, cl ? 'SUBSCRIBED ✓' : 'SUBSCRIBE', 0, 22, { font: F.bebas, size: 72, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .8);
  }, { name: 'end' });
  cue(T('L067', 'subscribe') + .7, 'key', 1.5);
}
