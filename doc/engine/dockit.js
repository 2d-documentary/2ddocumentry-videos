// dockit.js — UNFILED FILMS shared shot helpers (cards, pins, routes, blueprints, dossiers).
// Episode files define PLACES (lon/lat) and EP (credits) before calling these.
'use strict';
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
// $20 note cropped from the Commons sheet of US banknotes (public domain)
function rainBills(ctx, t, t0, n, o) { if (IMG.bill20c) moneyRain(ctx, t, t0, 'bill20c', [8, 155, 298, 126], n, o); }


// memorial card: portrait (optionally cropped region of an image) or silhouette, name, years, one line
function memorialCard(ctx, cx, cy, o, p) {
  if (p <= 0) return; const w = o.w || 300, h = o.h || 470, sc = lerp(.9, 1, E.out(clamp(p)));
  ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(cx, cy); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.fillStyle = '#EFE6D2'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  ctx.drawImage(paperTex('#EFE6D2', 71, w, h), -w / 2, -h / 2);
  const pw = w - 40, ph = pw * 1.15, px = -pw / 2, py = -h / 2 + 20;
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, py + ph / 2, pw / 2, ph / 2, 0, 0, 7); ctx.clip(); ctx.fillStyle = '#2A2622'; ctx.fillRect(px, py, pw, ph);
  const im = o.key && IMG[o.key];
  if (im) { const c = o.crop || [0, 0, im.width, im.height]; const s = Math.max(pw / c[2], ph / c[3]); ctx.filter = 'grayscale(1) sepia(.45) contrast(1.05)';
    ctx.drawImage(im, c[0], c[1], c[2], c[3], -c[2] * s / 2, py + ph / 2 - c[3] * s / 2, c[2] * s, c[3] * s); ctx.filter = 'none'; }
  else { ctx.fillStyle = '#4A433C'; ctx.beginPath(); ctx.arc(0, py + ph * .42, pw * .2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, py + ph * .95, pw * .38, ph * .32, 0, Math.PI, 0); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = '#8A6A3A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, py + ph / 2, pw / 2, ph / 2, 0, 0, 7); ctx.stroke();
  let ns = o.nameSize || 34; ctx.font = `700 ${ns}px ${F.play}`; while (ctx.measureText(o.name).width > w - 24 && ns > 16) { ns -= 1; ctx.font = `700 ${ns}px ${F.play}`; }
  text(ctx, o.name, 0, h / 2 - 95, { font: F.play, size: ns, color: PAL.ink, align: 'center', weight: 700 });
  text(ctx, o.years || '', 0, h / 2 - 58, { font: F.osw, size: 24, color: PAL.red, align: 'center', weight: 600, ls: 3 });
  if (o.line) text(ctx, o.line, 0, h / 2 - 26, { font: F.playI, size: 22, color: 'rgba(23,20,15,.75)', align: 'center' });
  if (o.source !== undefined) text(ctx, o.source, 0, h / 2 - 6, { font: F.mono, size: 13, color: 'rgba(23,20,15,.5)', align: 'center' });
  ctx.restore();
}
// clock-time stamp (e.g. "3:40 AM") in a boxed label
function timeStamp(ctx, s, x, y, t, t0, o = {}) {
  const p = E.out(prog(t, t0, t0 + .3)); if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p; ctx.font = `${o.size || 90}px ${F.bebas}`; const w = ctx.measureText(s).width;
  ctx.fillStyle = o.bg || 'rgba(10,8,8,.82)'; ctx.fillRect(x - 24, y - (o.size || 90) * .85, w + 48, (o.size || 90) * 1.05);
  ctx.fillStyle = o.color || PAL.cream; ctx.fillText(s, x, y); ctx.restore();
}
