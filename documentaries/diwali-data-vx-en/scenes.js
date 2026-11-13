// Veritrix Short (English subtitles): Diwali night, the missing data
'use strict';
const EP = { brand: 'VERITRIX', images: {}, credit: {}, scenes };
for (let i = 0; i < 72; i++) EP.images['fw2_f' + i] = 'archives/footage/fw2_f' + i + '.jpg';
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
const BG_OPEN = 'fw2', BG_OPEN_CLIP = true, CLIP_N = 72, BG_SMOG = 'smog', BG_END = 'smognight';
// ---------------------------------------------------------------- VERITRIX kit: black investigative style (typewriter text, red keywords, framed footage)
const VX = { bg: '#0A0A0B', white: '#F2EFEA', red: '#E0372B', dim: 'rgba(242,239,234,.62)', cream: '#F1ECE2' };
function vxBG(ctx, t, o = {}) { ctx.fillStyle = VX.bg; ctx.fillRect(0, 0, W, H); if (o.glow !== false) { const g = ctx.createRadialGradient(W / 2, H * .55, 0, W / 2, H * .55, H * .7); g.addColorStop(0, 'rgba(60,60,64,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); } grain(ctx, t, .05); }
function grain(ctx, t, a = .05) { ctx.save(); ctx.globalAlpha = a; const s = Math.floor(t * 12); for (let i = 0; i < 260; i++) { ctx.fillStyle = (i % 2) ? '#fff' : '#000'; ctx.fillRect(hash(i + s * 977) * W, hash(i * 7 + s * 131) * H, 2, 2); } ctx.restore(); }
// full-bleed photo or clip behind text, darkened, fading to black top & bottom
function vxBackdrop(ctx, key, lt, o = {}) { if (o.clip) vxClipDraw(ctx, key, lt, { x: 0, y: 0, w: W, h: H, fps: o.fps, n: o.n, grade: o.grade || 'color', blur: o.blur ?? 2 });
  else camPhoto(ctx, key, lt, { z0: o.z0 ?? 1.06, zs: o.zs ?? .015, fx: o.fx, fy: o.fy, grade: o.grade || 'color', blur: o.blur ?? 2 });
  ctx.fillStyle = `rgba(10,10,11,${o.dark ?? .55})`; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(10,10,11,.97)'); g.addColorStop(o.top ?? .3, 'rgba(10,10,11,.15)'); g.addColorStop(.75, 'rgba(10,10,11,.2)'); g.addColorStop(1, 'rgba(10,10,11,.95)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); grain(ctx, lt, .05); }
// image-sequence "video" from frames <key>_f0.._f(n-1)
function vxClipKey(key, lt, fps = 12, n) { const N = Math.min(n || 999, clipCount(key)); return key + '_f' + (Math.floor(lt * fps) % N); }
function vxClipDraw(ctx, key, lt, o) { const k = vxClipKey(key, lt, o.fps || 12, o.n || 60); photo(ctx, IMG[k] ? k : key + '_f0', { x: o.x, y: o.y, w: o.w, h: o.h, zoom: o.zoom || 1.02, grade: o.grade || 'color', blur: o.blur, fx: o.fx, fy: o.fy }); }
// typewriter block: lines typed word-by-word in sync with narration. red: words (lower-case, no punctuation) to colour red.
function vxType(ctx, t, ids, x, y, o = {}) { const size = o.size || (VERT ? 60 : 64), lh = size * (o.lh || 1.28), maxW = o.w || (W - 2 * x), up = o.upper !== false;
  ctx.save(); ctx.font = `${size}px ${F.type}`; const sp = ctx.measureText(' ').width; let yy = y, cursor = null;
  ids.forEach((spec, li) => { const id = typeof spec === 'string' ? spec : spec.id, red = new Set(((typeof spec === 'object' && spec.red) || o.red || []).map(s => s.toLowerCase()));
    const L = LINE[id]; if (!L || t < L.start - .05) return; let xx = x; const col = (typeof spec === 'object' && spec.color) || o.color || VX.white;
    if (li > 0 && o.gap !== 0) yy += (typeof spec === 'object' && spec.gap !== undefined ? spec.gap : (o.gap ?? size * .45));
    L.words.forEach((wd, wi) => { if (t < wd.s) return; let s = up ? wd.w.toUpperCase() : wd.w; const ww = ctx.measureText(s).width;
      if (xx + ww > x + maxW && xx > x) { xx = x; yy += lh; }
      const p = clamp((t - wd.s) / Math.max(.08, (wd.e - wd.s) * .8)); const shown = s.slice(0, Math.max(1, Math.ceil(s.length * p)));
      const key = wd.w.toLowerCase().replace(/[^a-z0-9]/g, ''); ctx.fillStyle = red.has(key) ? VX.red : col; ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 12;
      ctx.fillText(shown, xx, yy); const sw = ctx.measureText(shown).width; cursor = [xx + sw + 4, yy, p < 1 || wi === L.words.length - 1 && t < L.end + .6]; xx += ww + sp; });
    yy += lh; });
  if (cursor && cursor[2] && (Math.floor(t * 3) % 2 === 0 || true)) { ctx.fillStyle = VX.white; ctx.shadowBlur = 0; ctx.fillRect(cursor[0], cursor[1] - size * .78, size * .45, size * .9); }
  ctx.restore(); return yy; }
// small typed caption (mixed case), e.g. sources/notes under a graphic
function vxNote(ctx, s, x, y, t, t0, o = {}) { if (t < t0) return; const size = o.size || (VERT ? 34 : 34); const n = Math.min(s.length, Math.floor((t - t0) * (o.cps || 40)));
  ctx.save(); ctx.font = `${size}px ${F.type}`; const lines = []; let cur = ''; s.slice(0, n).split(' ').forEach(w => { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > (o.w || W - 2 * x)) { lines.push(cur); cur = w; } else cur = tr; }); lines.push(cur);
  lines.forEach((l, i) => { let xx = x; (o.redParts ? l.split(/(\[[^\]]*\])/) : [l]).forEach(seg => { const red = /^\[.*\]$/.test(seg); const ss = red ? seg.slice(1, -1) : seg; ctx.fillStyle = red ? VX.red : (o.color || VX.white); ctx.fillText(ss, xx, y + i * size * 1.3); xx += ctx.measureText(ss).width; }); });
  if (n < s.length || (t - t0) * (o.cps || 40) < s.length + 12) { const last = lines[lines.length - 1].replace(/[\[\]]/g, ''); ctx.fillStyle = VX.white; ctx.fillRect(x + ctx.measureText(last).width + 4, y + (lines.length - 1) * size * 1.3 - size * .78, size * .45, size * .9); }
  ctx.restore(); }
// framed footage / photo box with red border, red tag on top, credit under
function vxFrame(ctx, key, x, y, w, h, t, t0, lt, o = {}) { if (t < t0) return; const p = E.out(prog(t, t0, t0 + .35)); ctx.save(); ctx.globalAlpha = p;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); if (o.clip) vxClipDraw(ctx, key, lt, { x, y, w, h, fps: o.fps, n: o.n, grade: o.grade || 'color', fx: o.fx, fy: o.fy, zoom: o.zoom });
  else photo(ctx, key, { x, y, w, h, zoom: (o.zoom || 1.05) + lt * .012, fx: o.fx, fy: o.fy, grade: o.grade || 'color' }); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x, y, w, h); ctx.restore();
  ctx.strokeStyle = VX.red; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
  if (o.tag) { ctx.font = `${o.tagSize || 24}px ${F.type}`; const tw = ctx.measureText(o.tag).width; ctx.fillStyle = VX.red; ctx.fillRect(x, y - (o.tagSize || 24) * 1.9, tw + 20, (o.tagSize || 24) * 1.45); ctx.fillStyle = '#fff'; ctx.fillText(o.tag, x + 10, y - (o.tagSize || 24) * .8); }
  const c = o.credit !== undefined ? o.credit : credit(key); if (c) text(ctx, c.toUpperCase(), x + w, y + h + 30, { font: F.osw, size: 19, color: 'rgba(255,255,255,.75)', align: 'right', weight: 600, ls: 1 });
  ctx.restore(); }
// big red number (counts up), label under in typewriter
function vxNum(ctx, t, t0, v, x, y, o = {}) { if (t < t0) return; const p = E.out(prog(t, t0, t0 + (o.dur || .9))); const val = o.fixed ? v : Math.round(lerp(o.from || 0, v, p)).toLocaleString('en-IN');
  ctx.save(); ctx.shadowColor = 'rgba(224,55,43,.55)'; ctx.shadowBlur = 40; text(ctx, (o.pre || '') + val + (o.suf || ''), x, y, { font: F.bebas, size: o.size || 230, color: o.color || VX.red, align: o.align || 'center' }); ctx.restore();
  if (o.label) text(ctx, o.label, x, y + (o.size || 230) * .25, { font: F.type, size: o.lsize || 34, color: VX.white, align: o.align || 'center', alpha: prog(t, t0 + .3, t0 + .6) }); }
// cream data card with numbers (like an official count)
function vxCard(ctx, x, y, w, h, t, t0, title, cells) { if (t < t0) return; const p = E.out(prog(t, t0, t0 + .35)); ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = VX.cream; ctx.fillRect(x, y, w, h);
  text(ctx, title, x + 24, y + 46, { font: F.type, size: 24, color: '#333' }); const cw = w / cells.length;
  cells.forEach(([v, l, red], i) => { const st = t0 + .25 + i * .25; if (t < st) return; text(ctx, v, x + cw * (i + .5), y + h * .62, { font: F.bebas, size: 96, color: red ? VX.red : '#111', align: 'center' }); text(ctx, l, x + cw * (i + .5), y + h * .62 + 40, { font: F.osw, size: 20, color: '#333', align: 'center', weight: 700, ls: 1 }); });
  ctx.restore(); }
// map label like "LAHORE •"
function vxPlace(ctx, s, x, y, o = {}) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 10; text(ctx, s, o.left ? x - 18 : x + 18, y + 12, { font: F.bebas, size: o.size || 52, color: '#fff', align: o.left ? 'right' : 'left' }); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.restore(); }
// end card: red round badge + channel name typed
function vxEnd(ctx, t, t0) { if (t < t0) return; const p = E.back(prog(t, t0, t0 + .45)); const cy = H * .78; ctx.save(); ctx.translate(W / 2, cy); ctx.scale(p, p);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 62, 0, 7); ctx.fill(); ctx.strokeStyle = VX.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); ctx.stroke();
  text(ctx, 'V', 0, 34, { font: F.type, size: 92, color: VX.red, align: 'center' }); ctx.restore();
  const s = 'VERITRIX', n = Math.min(s.length, Math.floor((t - t0 - .3) * 14)); if (n > 0) { ctx.save(); ctx.font = `40px ${F.type}`; const full = ctx.measureText(s).width; ctx.restore(); text(ctx, s.slice(0, n), W / 2 - full / 2, cy + 120, { font: F.type, size: 40, color: VX.white, ls: 2 }); } }
// clip player: uses however many frames actually loaded (<key>_f0 .. _fN)
const _clipN = {};
function clipCount(key, max = 400) { if (_clipN[key] === undefined) { let n = 0; while (n < max && IMG[key + '_f' + n]) n++; _clipN[key] = Math.max(1, n); } return _clipN[key]; }
// iOS liquid-glass button: refracted + blurred backdrop, white tint, inner glow, specular rim. A tap turns it glassy red.
function glassButton(ctx, x, y, t, t0, o = {}) { if (t < t0) return; const app = E.back(prog(t, t0, t0 + .5)); const tap = t0 + (o.tapAfter ?? 1.0);
  const press = t > tap && t < tap + .2 ? .95 : 1, on = clamp((t - tap - .05) / .3), s = (o.scale || 1) * app * press;
  const w = (o.w || 440) * s, h = (o.h || 124) * s, r = Math.min(h / 2, (o.radius ?? h / 2)), x0 = x - w / 2, y0 = y - h / 2; if (w < 4) return;
  const pad = 40, snap = document.createElement('canvas'); snap.width = Math.ceil(w + 2 * pad); snap.height = Math.ceil(h + 2 * pad);
  snap.getContext('2d').drawImage(ctx.canvas, x0 - pad, y0 - pad, snap.width, snap.height, 0, 0, snap.width, snap.height);
  const path = () => { ctx.beginPath(); ctx.roundRect(x0, y0, w, h, r); };
  ctx.save(); ctx.filter = 'blur(22px)'; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.roundRect(x0 + 10, y0 + 22, w - 20, h - 6, r); ctx.fill(); ctx.restore();
  ctx.save(); path(); ctx.clip();
  const lens = (k, blur, bright) => { const dw = snap.width * k, dh = snap.height * k; ctx.filter = `blur(${blur}px) brightness(${bright}) saturate(1.6)`; ctx.drawImage(snap, x - dw / 2, y - dh / 2, dw, dh); };
  lens(1.18, 9, 1.25);
  ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, w, h, r); ctx.roundRect(x0 + 14 * s, y0 + 14 * s, w - 28 * s, h - 28 * s, Math.max(1, r - 14 * s)); ctx.clip('evenodd'); lens(1.45, 3, 1.35); ctx.restore();
  ctx.filter = 'none'; ctx.fillStyle = `rgba(255,255,255,${.12 - .05 * on})`; ctx.fillRect(x0, y0, w, h);
  if (on > 0) { const rg = ctx.createLinearGradient(0, y0, 0, y0 + h); rg.addColorStop(0, `rgba(255,70,60,${.46 * on})`); rg.addColorStop(1, `rgba(200,20,20,${.36 * on})`); ctx.fillStyle = rg; ctx.fillRect(x0, y0, w, h); }
  const sh = ctx.createLinearGradient(0, y0, 0, y0 + h * .55); sh.addColorStop(0, 'rgba(255,255,255,.34)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(x0, y0, w, h * .55);
  ctx.shadowColor = 'rgba(255,255,255,.55)'; ctx.shadowBlur = 18 * s; ctx.lineWidth = 30; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.roundRect(x0 - 15, y0 - 15, w + 30, h + 30, r + 15); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.restore();
  ctx.save(); const rim = ctx.createLinearGradient(x0, y0, x0 + w * .6, y0 + h * 1.4); rim.addColorStop(0, 'rgba(255,255,255,.95)'); rim.addColorStop(.35, 'rgba(255,255,255,.12)'); rim.addColorStop(.7, 'rgba(255,255,255,.08)'); rim.addColorStop(1, 'rgba(255,255,255,.7)');
  ctx.strokeStyle = rim; ctx.lineWidth = 2.2 * Math.max(.6, s); ctx.beginPath(); ctx.roundRect(x0 + 1, y0 + 1, w - 2, h - 2, r); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x0 - .5, y0 - .5, w + 1, h + 1, r); ctx.stroke(); ctx.restore();
  const lab = on > .5 ? (o.after || o.label) : o.label, fs = (o.fs || 52) * s; ctx.save(); ctx.font = `700 ${fs}px "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 6; ctx.fillStyle = '#fff'; const tw = ctx.measureText(lab).width, chk = on > .5 && o.check !== false;
  ctx.fillText(lab, x + (chk ? 22 * s : 0), y + 2 * s);
  if (chk) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 6.5 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const cx = x - tw / 2 - 12 * s; ctx.beginPath(); ctx.moveTo(cx - 20 * s, y + 2 * s); ctx.lineTo(cx - 8 * s, y + 14 * s); ctx.lineTo(cx + 12 * s, y - 12 * s); ctx.stroke(); }
  ctx.restore();
  if (t > tap - .4 && t < tap + .7) { const k = clamp((t - tap + .4) / 1.1), tx = x + w * .22, ty = y + h * .12; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * k) * .9;
    const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, 46 * s); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,.15)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tx, ty, 40 * s * (t > tap ? 1 + (t - tap) * .8 : 1), 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); } }
// Instagram: Follow -> Following.  YouTube: Subscribe -> Subscribed.
function glassFollow(ctx, x, y, t, t0, o = {}) { glassButton(ctx, x, y, t, t0, Object.assign({ label: 'Follow', after: 'Following', w: 420, h: 118, fs: 54 }, o)); }
function glassSubscribe(ctx, x, y, t, t0, o = {}) { glassButton(ctx, x, y, t, t0, Object.assign({ label: 'Subscribe', after: 'Subscribed', w: 480, h: 118, fs: 54 }, o)); }

function cred(ctx, key, extra) { const c = credit(key, extra); if (c) sourceTag(ctx, c); }

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


// ---------------------------------------------------------------- episode props (drawn, labelled where illustrative)
function aqiMeter(ctx, x, y, w, h, t, val, blank) { ctx.save(); ctx.fillStyle = '#111214'; ctx.strokeStyle = '#3A3B40'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
  text(ctx, 'PM2.5  ·  UG/M3', x + 34, y + 62, { font: F.type, size: 34, color: VX.dim }); text(ctx, 'LIVE', x + w - 34, y + 62, { font: F.type, size: 30, color: blank ? '#555' : VX.red, align: 'right', alpha: blank ? 1 : (Math.sin(t * 6) > 0 ? 1 : .3) });
  ctx.fillStyle = '#060607'; ctx.fillRect(x + 30, y + 92, w - 60, h - 122);
  if (blank) { text(ctx, '- - -', x + w / 2, y + h * .72, { font: F.bebas, size: 200, color: '#3A3B40', align: 'center' }); text(ctx, 'NO DATA', x + w / 2, y + h - 52, { font: F.type, size: 36, color: VX.red, align: 'center', alpha: Math.sin(t * 5) > -.3 ? 1 : .2 }); }
  else { ctx.save(); ctx.shadowColor = 'rgba(224,55,43,.6)'; ctx.shadowBlur = 30; text(ctx, Math.round(val).toLocaleString('en-IN'), x + w / 2, y + h * .72, { font: F.bebas, size: 220, color: VX.red, align: 'center' }); ctx.restore(); }
  ctx.restore(); }
const DEAD = new Set([0,2,3,5,6,9,11,12,14,15,17,19,20,22,24,25,27,28,30,31,33,34,36,37,38]);
function stationGrid(ctx, x, y, t, t0) { const cols = 8, gap = 112; for (let i = 0; i < 39; i++) { const cx = x + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap; const dead = DEAD.has(i);
  const off = dead && t > t0 + hash(i) * .8; ctx.fillStyle = off ? '#1A1B1E' : '#E9E4DA'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fill();
  if (off) { ctx.strokeStyle = VX.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 14); ctx.lineTo(cx + 14, cy + 14); ctx.moveTo(cx + 14, cy - 14); ctx.lineTo(cx - 14, cy + 14); ctx.stroke(); } } }
function rangeGauge(ctx, cx, cy, r, p, t, out) { ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = '#2A2B30'; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI); ctx.stroke();
  const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0); g.addColorStop(0, '#E9E4DA'); g.addColorStop(1, VX.red); ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * clamp(p)); ctx.stroke();
  [['0', Math.PI], ['500', Math.PI * 1.5], ['999', Math.PI * 2]].forEach(([s, a]) => text(ctx, s, cx + Math.cos(a) * (r + 70), cy + Math.sin(a) * (r + 70) + 14, { font: F.type, size: 36, color: VX.dim, align: 'center' }));
  const a = Math.PI + Math.PI * Math.min(1.04, p) + (p >= 1 ? Math.sin(t * 40) * .015 : 0); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 30), cy + Math.sin(a) * (r - 30)); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.fill(); ctx.restore(); }
function barPair(ctx, x, y, w, t, t0) { const p = E.out(prog(t, t0, t0 + 1.2)); text(ctx, 'NATIONAL STANDARD (24H)', x, y, { font: F.type, size: 32, color: VX.dim }); ctx.fillStyle = '#E9E4DA'; ctx.fillRect(x, y + 24, Math.max(6, w * 60 / 3744), 70); text(ctx, '60', x + 40, y + 80, { font: F.bebas, size: 64, color: '#fff' });
  text(ctx, 'MUNDKA, 2 AM', x, y + 190, { font: F.type, size: 32, color: VX.dim }); ctx.save(); ctx.shadowColor = 'rgba(224,55,43,.6)'; ctx.shadowBlur = 30; ctx.fillStyle = VX.red; ctx.fillRect(x, y + 214, w * p, 70); ctx.restore();
  text(ctx, Math.round(3744 * p).toLocaleString('en-IN'), x + w * p - 10, y + 270, { font: F.bebas, size: 64, color: '#fff', align: 'right' }); }
function dualChart(ctx, x, y, w, h, t, t0) { const p = prog(t, t0, t0 + 1.6); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + h * i / 4); ctx.lineTo(x + w, y + h * i / 4); ctx.stroke(); }
  const cap = y + h - h * 1000 / 3800; ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(x, cap); ctx.lineTo(x + w, cap); ctx.stroke(); ctx.setLineDash([]); text(ctx, '999 CUT-OFF', x + w, cap - 14, { font: F.type, size: 26, color: VX.dim, align: 'right' });
  const pts = [[0, 180], [.15, 300], [.3, 700], [.42, 1500], [.52, 3744], [.62, 3000], [.75, 2100], [.88, 1100], [1, 600]].map(([u, v]) => [x + u * w, y + h - h * v / 3800]);
  const draw = (col, rec) => { ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.beginPath(); let pen = false; pts.forEach((q, i) => { if (i / (pts.length - 1) > p) return; const v = 3800 * (y + h - q[1]) / h; if (rec && v > 999) { pen = false; return; } pen ? ctx.lineTo(...q) : ctx.moveTo(...q); pen = true; }); ctx.stroke(); };
  ctx.shadowColor = VX.red; ctx.shadowBlur = 20; draw(VX.red, false); ctx.shadowBlur = 0; draw('#fff', true);
  text(ctx, 'REAL AIR', x, y + h + 56, { font: F.type, size: 32, color: VX.red }); text(ctx, 'ON RECORD', x + w, y + h + 56, { font: F.type, size: 32, color: '#fff', align: 'right' });
  text(ctx, 'ILLUSTRATIVE', x + w, y + h + 100, { font: F.osw, size: 20, color: VX.dim, align: 'right', weight: 600, ls: 2 }); ctx.restore(); }
function wordKeys(id, g = .16) { const L = LINE[id]; if (!L) return; L.words.forEach((w, i) => cue(w.s, 'key', g)); }

function scenes() {
  const X = 64, TY = 320, TS = 62, TW = 950;
  // 1. date + poison air, over Diwali footage/photo
  shot(['V01'], (ctx, t, lt) => { vxBackdrop(ctx, BG_OPEN, lt, { clip: BG_OPEN_CLIP, fps: 12, n: CLIP_N, dark: .5 });
    vxType(ctx, t, [{ id: 'V01', color: VX.red }, { id: 'V02', red: ['poison'] }], X, TY, { size: TS, w: TW });
    vxFrame(ctx, 'station', X, 860, TW, 600, t, T('V02', 'poison'), lt, { tag: 'DELHI · SMOG · ARCHIVE PHOTO', fy: .45 });
    if (t < T('V02', 'poison')) sourceTag(ctx, credit('fw2', 'Archive footage: firecrackers, Bengaluru 2024')); fadeIn(ctx, t, 0, .4); }, { lead: .3, name: 'open' });
  // 2. meters go silent
  shot(['V03'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V03', red: ['silent'] }], X, TY, { size: TS, w: TW });
    const off = T('V03', 'silent'); aqiMeter(ctx, 140, 820, 800, 520, t, lerp(420, 980, clamp((t - LINE.V03.start) / Math.max(.5, off - LINE.V03.start))), t > off); }, { name: 'meter' });
  cue(T('V03', 'silent'), 'hit', .7);
  // 3. 25 stations blank
  shot(['V04'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V04', red: ['25', 'vanished'] }], X, TY, { size: TS, w: TW });
    stationGrid(ctx, 150, 860, t, T('V04', 'vanished')); vxNote(ctx, '[25] of 39 stations: no PM2.5 between 2 and 3 AM, 8-9 Nov (CPCB data)', X, 1520, t, T('V04', 'vanished') + .3, { size: 32, w: TW, redParts: true }); }, { name: 'grid' });
  cue(T('V04', 'vanished'), 'hit', .6);
  // 4. DPCC released it
  shot(['V05'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V05', red: ['dpcc'] }], X, TY, { size: TS, w: TW });
    vxCard(ctx, X, 900, TW, 380, t, T('V05', 'DPCC'), 'DPCC · DELAYED HOURLY DATA · 9 NOV, ~8 PM', [['125', 'STATION-HOURS MISSING ON CPCB', true], ['1,000+', 'EVERY ONE OF THEM', false]]);
    vxNote(ctx, 'Provisional data, not yet quality-assured.', X, 1360, t, T('V05', 'released'), { size: 30, w: TW, color: VX.dim }); }, { name: 'dpcc' });
  cue(T('V05', 'DPCC'), 'paper', .6);
  // 5. Mundka 3,744
  shot(['V06'], (ctx, t, lt) => { vxBackdrop(ctx, BG_SMOG, lt, { dark: .65 }); vxType(ctx, t, [{ id: 'V06', red: ['3744'] }], X, TY, { size: TS, w: TW });
    vxNum(ctx, t, T('V06', '3,744'), 3744, W / 2, 1060, { size: 300, label: 'MUNDKA · 2 AM · PM2.5 (UG/M3)', lsize: 36, dur: 1.1 }); cred(ctx, BG_SMOG); }, { name: 'mundka' });
  cue(T('V06', '3,744'), 'impact', .8);
  // 6. 60x
  shot(['V07'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V07', red: ['60', 'times'] }], X, TY, { size: TS, w: TW }); barPair(ctx, X, 900, TW, t, T('V07', 'India'));
    vxNum(ctx, t, T('V07', '60'), 60, W / 2, 1520, { size: 200, suf: 'X', fixed: true }); }, { name: 'bars' });
  cue(T('V07', '60'), 'stamp', .7);
  // 7. other stations
  shot(['V08'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V08', red: ['3023', '3008', '2000'] }], X, TY, { size: TS, w: TW });
    vxCard(ctx, X, 940, TW, 380, t, T('V08', 'JNU'), 'DPCC · PM2.5 (UG/M3) · 9 NOV', [['3,023', 'JNU · 4 AM', true], ['3,008', 'NSUT WEST · 5 AM', true], ['11', 'STATIONS > 2,000', false]]); }, { name: 'stations' });
  cue(T('V08', 'JNU'), 'tick', .5); cue(T('V08', 'NSUT'), 'tick', .5); cue(T('V08', '11'), 'tick', .5);
  // 8. question
  shot(['V09'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V09', red: ['where'] }], X, 760, { size: 92, w: TW }); }, { name: 'q' });
  // 9-10. CPCB answer: 999 cut-off
  shot(['V10'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V10', red: ['2015', '999'] }], X, TY, { size: TS, w: TW });
    rangeGauge(ctx, W / 2, 1300, 340, E.inOut(prog(t, T('V10', '999'), T('V10', '999') + 1.2)), t, false);
    vxNote(ctx, 'CPCB: National AQI (2015) was built for a 0-1,000 range.', X, 1560, t, T('V10', 'system'), { size: 32, w: TW, color: VX.dim }); }, { name: 'gauge' });
  cue(T('V10', '999'), 'riser', .5);
  shot(['V11'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V11', red: ['out', 'of', 'range'] }], X, TY, { size: TS, w: TW }); rangeGauge(ctx, W / 2, 1100, 340, 1, t, true);
    if (t > T('V11', 'range')) stamp(ctx, 'OUT OF RANGE', W / 2, 1320, t, T('V11', 'range'), { size: 120, color: VX.red, rot: -.08 });
    if (t > T('V11', 'drops')) vxNote(ctx, '3,744  ->  [NO DATA]', X + 120, 1600, t, T('V11', 'drops'), { size: 54, w: 900, redParts: true }); }, { name: 'oor' });
  cue(T('V11', 'range'), 'stamp', .9);
  // 11. the irony
  shot(['V12'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V12', red: ['toxic', 'vanishes'] }], X, TY, { size: TS, w: TW }); dualChart(ctx, X, 860, TW, 520, t, LINE.V12.start); }, { name: 'chart' });
  // 12. 49%
  shot(['V13'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V13', red: ['49', 'percent'] }], X, TY, { size: TS, w: TW });
    vxNum(ctx, t, T('V13', '49'), 49, W / 2, 1180, { size: 330, pre: '+', suf: '%', label: 'CREA ANALYSIS · ESTIMATE', lsize: 36 }); }, { name: '49' });
  cue(T('V13', '49'), 'impact', .7); cue(LINE.V15.start + 1.6, 'tick', .8);
  // 13. closing question over smog
  shot(['V14'], (ctx, t, lt) => { vxBackdrop(ctx, BG_END, lt, { dark: .55 }); vxType(ctx, t, [{ id: 'V14', red: ['breathing', 'breathe'] }], X, TY, { size: 62, w: TW }); cred(ctx, BG_END); }, { name: 'close' });
  // 14. badge
  shot(['V15'], (ctx, t, lt) => { vxBackdrop(ctx, BG_END, lt + 6, { dark: .75 }); vxType(ctx, t, [{ id: 'V15', red: ['veritrix'] }], X, TY, { size: TS, w: TW }); vxEnd(ctx, t, LINE.V15.start + .2); glassFollow(ctx, W / 2, 1200, t, LINE.V15.start + .5, { tapAfter: 1.2 }); fadeOut(ctx, t, TL.duration, .8); }, { name: 'end' });
  ['V01', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07', 'V08', 'V09', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15'].forEach(id => wordKeys(id));
}
