'use strict';
const EP = { brand: 'DAGAR UNFILTERED', images: {}, credit: {}, scenes };
const C = {};
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
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

// ============================================================================
// KINETIC KIT: "After Effects in canvas" for cinematic 2.5D documentary edits
// (3D cards/paper with perspective + curl, camera moves, whip/zoom/flash/glitch
//  transitions with motion blur, grunge titles, pill tags, floating serif words,
//  word-chunk captions, procedural sets: wood desk, newspaper, wall + spotlight,
//  chalkboard, clipboard, starfield). Paste into _header.js after the EP lines.
// Fonts (doc/engine/doc.html): Anton, ArchivoBlack, Montserrat, Inter, Silkscreen,
//  DMSerif, DMSerifI + the old ones (Bebas, Playfair, SpecialElite, Caveat, Oswald, CourierPrime).
// ============================================================================
Object.assign(F, { anton: 'Anton', archivo: 'ArchivoBlack', mont: 'Montserrat', inter: 'Inter', pixel: 'Silkscreen', serif: 'DMSerif', serifI: 'DMSerifI' });
const KC = { red: '#E3262F', red2: '#B5121B', white: '#F4F1EA', yellow: '#F6C445', ink: '#111', blue: '#2346B8', green: '#2F7D4F' };

// ---------- offscreen canvases + texture cache
const _TEX = {};
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(key, w, h, fn) { if (!_TEX[key]) { const c = mkCanvas(w, h); fn(c.getContext('2d'), w, h); _TEX[key] = c; } return _TEX[key]; }
function srcOf(s) { return typeof s === 'string' ? (IMG[s] || null) : s; }
function rnd(i) { return hash(i * 12.9898 + 78.233); }

// ---------- 3D camera + projection (y down, z into screen)
function cam(o = {}) { return { x: 0, y: 0, z: -1600, rx: 0, ry: 0, rz: 0, f: 1600, ...o }; }
function rot3(p, rx, ry, rz) { let [x, y, z] = p;
  if (ry) { const c = Math.cos(ry), s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c]; }
  if (rx) { const c = Math.cos(rx), s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c]; }
  if (rz) { const c = Math.cos(rz), s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c]; }
  return [x, y, z]; }
function proj(p, C) { let q = [p[0] - C.x, p[1] - C.y, p[2] - C.z]; q = rot3(q, -C.rx, -C.ry, -C.rz);
  const z = Math.max(q[2], 1), s = C.f / z; return [W / 2 + q[0] * s, H / 2 + q[1] * s, q[2]]; }

// affine-textured triangle (classic canvas trick); e = seam expansion in px
function _tri(ctx, img, p0, p1, p2, u0, v0, u1, v1, u2, v2) {
  const cx = (p0[0] + p1[0] + p2[0]) / 3, cy = (p0[1] + p1[1] + p2[1]) / 3, ex = p => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * .7, p[1] + dy / l * .7]; };
  const a0 = ex(p0), a1 = ex(p1), a2 = ex(p2);
  ctx.save(); ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.closePath(); ctx.clip();
  const [x0, y0] = p0, [x1, y1] = p1, [x2, y2] = p2, d = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1); if (!d) { ctx.restore(); return; }
  const a = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / d, b = (x0 * (u2 - u1) + x1 * (u0 - u2) + x2 * (u1 - u0)) / d, c = (x0 * (u1 * v2 - u2 * v1) + x1 * (u2 * v0 - u0 * v2) + x2 * (u0 * v1 - u1 * v0)) / d;
  const dd = (y0 * (v1 - v2) + y1 * (v2 - v0) + y2 * (v0 - v1)) / d, e = (y0 * (u2 - u1) + y1 * (u0 - u2) + y2 * (u1 - u0)) / d, f = (y0 * (u1 * v2 - u2 * v1) + y1 * (u2 * v0 - u0 * v2) + y2 * (u0 * v1 - u1 * v0)) / d;
  ctx.transform(a, dd, b, e, c, f); ctx.drawImage(img, 0, 0); ctx.restore(); }

// card3d: a textured rectangle in 3D. o: {pos:[x,y,z], w, h, rx, ry, rz, curl (0..1 page curl along x), bend (cylindrical bend amount), shade, n:[nu,nv], shadow, alpha}
function card3d(ctx, src, C, o) { const img = srcOf(src); if (!img) return;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, [nu, nv] = o.n || ((o.curl || o.bend) ? [14, 10] : [6, 6]);
  const w = o.w, h = o.h ?? o.w * ih / iw, pos = o.pos || [0, 0, 0];
  const P = (u, v) => { let x = (u - .5) * w, y = (v - .5) * h, z = 0;
    if (o.bend) z += Math.sin(u * Math.PI) * -o.bend * w * .08 + Math.sin(v * Math.PI) * -o.bend * h * .03;
    if (o.curl) { const R = w * .18, x0 = w * (.5 - o.curl * 1.1); if (x > x0) { const a = (x - x0) / R; x = x0 + Math.sin(Math.min(a, Math.PI)) * R - (a > Math.PI ? (a - Math.PI) * R : 0); z -= (1 - Math.cos(Math.min(a, Math.PI))) * R + 0; } }
    if (o.wave) z += Math.sin(u * 6 + (o.wavePh || 0)) * o.wave;
    const r = rot3([x, y, z], o.rx || 0, o.ry || 0, o.rz || 0); return [r[0] + pos[0], r[1] + pos[1], r[2] + pos[2]]; };
  const G = []; for (let j = 0; j <= nv; j++) { const row = []; for (let i = 0; i <= nu; i++) { const p3 = P(i / nu, j / nv); row.push({ p: proj(p3, C), w: p3 }); } G.push(row); }
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
  if (o.shadow) { ctx.save(); ctx.filter = `blur(${o.shadow * .5}px)`; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); const c4 = [G[0][0], G[0][nu], G[nv][nu], G[nv][0]].map(g => g.p);
    c4.forEach((q, i) => i ? ctx.lineTo(q[0] + o.shadow * .4, q[1] + o.shadow) : ctx.moveTo(q[0] + o.shadow * .4, q[1] + o.shadow)); ctx.fill(); ctx.restore(); }
  const cells = []; for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) cells.push([i, j, (G[j][i].p[2] + G[j + 1][i + 1].p[2]) / 2]);
  cells.sort((a, b) => b[2] - a[2]);
  for (const [i, j] of cells) { const A = G[j][i], B = G[j][i + 1], Cc = G[j + 1][i + 1], D = G[j + 1][i];
    const u0 = i / nu * iw, u1 = (i + 1) / nu * iw, v0 = j / nv * ih, v1 = (j + 1) / nv * ih;
    _tri(ctx, img, A.p, B.p, Cc.p, u0, v0, u1, v0, u1, v1); _tri(ctx, img, A.p, Cc.p, D.p, u0, v0, u1, v1, u0, v1);
    if (o.shade !== false && (o.curl || o.bend || o.wave)) { const n = _nrm(A.w, B.w, D.w), lit = clamp(.55 + .45 * (-n[2]) + .25 * n[0]);
      if (lit < .98) { ctx.save(); ctx.globalAlpha = (o.alpha ?? 1) * (1 - lit) * .9; ctx.fillStyle = '#000'; ctx.beginPath(); [A, B, Cc, D].forEach((g, k) => k ? ctx.lineTo(g.p[0], g.p[1]) : ctx.moveTo(g.p[0], g.p[1])); ctx.fill(); ctx.restore(); } } }
  ctx.restore(); return G; }
function _nrm(a, b, c) { const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...n) || 1; return n.map(q => q / l); }

// flat image cover-fit with slow push (2D, cheap); o: {z0, z1, dur, fx, fy, rot, blur, grade:'bw'|'warm'|'cold', dark}
function plate(ctx, key, lt, o = {}) { const img = srcOf(key); if (!img) return; const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const p = clamp(lt / (o.dur || 6)), z = lerp(o.z0 ?? 1.04, o.z1 ?? 1.16, E.inOut(p)), s = Math.max(W / iw, H / ih) * z;
  const fx = o.fx ?? .5, fy = o.fy ?? .5, x = W / 2 - iw * s * fx + (o.px || 0) * p, y = H / 2 - ih * s * fy + (o.py || 0) * p;
  ctx.save(); const flt = [o.blur ? `blur(${o.blur}px)` : '', o.grade === 'bw' ? 'grayscale(1) contrast(1.15)' : '', o.grade === 'warm' ? 'sepia(.35) saturate(1.2)' : '', o.grade === 'cold' ? 'saturate(.7) hue-rotate(-10deg)' : '', o.bright ? `brightness(${o.bright})` : ''].filter(Boolean).join(' ');
  if (flt) ctx.filter = flt; if (o.rot) { ctx.translate(W / 2, H / 2); ctx.rotate(o.rot * p); ctx.translate(-W / 2, -H / 2); }
  ctx.drawImage(img, x, y, iw * s, ih * s); ctx.restore(); if (o.dark) { ctx.fillStyle = `rgba(0,0,0,${o.dark})`; ctx.fillRect(0, 0, W, H); } }

// ---------- procedural sets
function woodTex() { return tex('wood', 1400, 2200, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#5A2C14'); g.addColorStop(.5, '#7A3E1C'); g.addColorStop(1, '#552811'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { const x = rnd(i) * w, a = .04 + rnd(i + 3) * .08; c.strokeStyle = rnd(i + 7) > .5 ? `rgba(30,12,4,${a})` : `rgba(190,110,60,${a * .6})`; c.lineWidth = .6 + rnd(i + 9) * 2.4; c.beginPath(); c.moveTo(x, 0);
    for (let y = 0; y <= h; y += 40) c.lineTo(x + Math.sin(y * .004 + i) * 14 + Math.sin(y * .013 + i * 2) * 4, y); c.stroke(); }
  for (let k = 0; k < 5; k++) { const x = rnd(k + 50) * w, y = rnd(k + 60) * h; for (let r = 4; r < 60; r += 5) { c.strokeStyle = 'rgba(35,14,5,.18)'; c.beginPath(); c.ellipse(x, y, r * .6, r * 1.8, 0, 0, 7); c.stroke(); } }
  for (let x = 0; x < w; x += 233) { c.fillStyle = 'rgba(20,8,2,.35)'; c.fillRect(x, 0, 3, h); } }); }
function paperTex(key, w, h, draw) { return tex(key, w, h, (c, W2, H2) => { c.fillStyle = '#EDE6D6'; c.fillRect(0, 0, W2, H2);
  for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(90,70,40,${rnd(i) * .05})`; c.fillRect(rnd(i + 1) * W2, rnd(i + 2) * H2, 2, 2); }
  const g = c.createRadialGradient(W2 / 2, H2 / 2, W2 * .3, W2 / 2, H2 / 2, W2 * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(110,80,40,.25)'); c.fillStyle = g; c.fillRect(0, 0, W2, H2); draw && draw(c, W2, H2); }); }
// newspaper recreation (label it on screen as a recreation). o: {masthead, date, headline, sub, photo, caption}
function newspaperTex(key, o) { return paperTex(key, 1000, 1350, (c, w, h) => { c.fillStyle = '#151515'; c.textAlign = 'center';
  c.font = `86px ${F.play}`; c.fillText(o.masthead || 'THE EVENING RECORD', w / 2, 110); c.fillRect(40, 132, w - 80, 4); c.fillRect(40, 140, w - 80, 1.5);
  c.font = `22px ${F.mono}`; c.fillText(o.date || '', w / 2, 168); c.fillRect(40, 182, w - 80, 1.5);
  c.font = `900 66px ${F.play}`; const words = (o.headline || '').split(' '); let line = '', y = 260; words.forEach(wd => { const t2 = line ? line + ' ' + wd : wd; if (c.measureText(t2).width > w - 100) { c.fillText(line, w / 2, y); line = wd; y += 74; } else line = t2; }); c.fillText(line, w / 2, y);
  c.font = `italic 30px ${F.playI}`; c.fillText(o.sub || '', w / 2, y + 52); y += 90;
  const ph = srcOf(o.photo); if (ph) { const pw = w - 380, phh = 420; c.save(); c.filter = 'grayscale(1) contrast(1.2)'; const iw = ph.naturalWidth || ph.width, ih = ph.naturalHeight || ph.height, s = Math.max(pw / iw, phh / ih); c.beginPath(); c.rect(40, y, pw, phh); c.clip(); c.drawImage(ph, 40 + pw / 2 - iw * s / 2, y + phh / 2 - ih * s / 2, iw * s, ih * s); c.restore();
    c.font = `italic 20px ${F.playI}`; c.textAlign = 'left'; c.fillText(o.caption || '', 40, y + phh + 30); }
  c.fillStyle = 'rgba(20,20,20,.55)'; for (let col = 0; col < 2; col++) for (let k = 0; k < 17; k++) { const x0 = col ? w - 320 : 40, yy = y + k * 26 + (col ? 0 : 470); if (!col && yy > h - 40) continue; if (col && yy > h - 40) continue; c.fillRect(x0, yy, (col ? 280 : w - 420) * (k % 6 === 5 ? .6 : 1), 9); }
  for (let k = 0; k < 9; k++) c.fillRect(w - 320, y + 470 + k * 26, 280 * (k % 4 === 3 ? .5 : 1), 9); }); }
function wallTex(col = '#5B3A28') { return tex('wall' + col, 1200, 2000, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 6; [[80, 160, w - 160, 900], [80, 1140, w - 160, 700]].forEach(r => { c.strokeRect(...r); c.strokeStyle = 'rgba(255,220,180,.08)'; c.strokeRect(r[0] + 8, r[1] + 8, r[2] - 16, r[3] - 16); c.strokeStyle = 'rgba(0,0,0,.25)'; });
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i) * .05})`; c.fillRect(rnd(i + 4) * w, rnd(i + 5) * h, 3, 3); } }); }
function spotlight(ctx, x, y, r, a = .85) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; const g = ctx.createRadialGradient(x, y, r * .1, x, y + r * .4, r * 1.25); g.addColorStop(0, 'rgba(255,240,215,1)'); g.addColorStop(.55, 'rgba(160,120,90,1)'); g.addColorStop(1, `rgba(20,14,10,1)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; const g2 = ctx.createRadialGradient(x, y, 0, x, y, r * .7); g2.addColorStop(0, `rgba(255,214,160,${.45 * a})`); g2.addColorStop(1, 'rgba(255,214,160,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function lampFixture(ctx, x, y, w = 220) { ctx.save(); ctx.fillStyle = '#1A1714'; ctx.fillRect(x - w / 2, y, w, 14); ctx.fillStyle = '#FFE7BF'; ctx.shadowColor = '#FFD9A0'; ctx.shadowBlur = 30; ctx.fillRect(x - w / 2 + 10, y + 12, w - 20, 5); ctx.restore(); }
function chalkTex(key, lines) { return tex(key, 1100, 760, (c, w, h) => { c.fillStyle = '#7A4A26'; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2B2E2C'); g.addColorStop(1, '#1E2120'); c.fillStyle = g; c.fillRect(34, 34, w - 68, h - 68);
  for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(255,255,255,${.015 + rnd(i) * .03})`; c.lineWidth = 20 + rnd(i + 1) * 60; c.beginPath(); c.moveTo(rnd(i + 2) * w, rnd(i + 3) * h); c.lineTo(rnd(i + 4) * w, rnd(i + 5) * h); c.stroke(); }
  c.textAlign = 'center'; c.fillStyle = '#F2F0EA'; (lines || []).forEach(([s, size, col], k) => { c.font = `${size}px ${F.archivo}`; c.fillStyle = col || '#F2F0EA'; c.fillText(s, w / 2, 250 + k * (size * 1.05)); }); }); }
function starfield(ctx, t, n = 260, drift = 8) { ctx.fillStyle = '#05060A'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < n; i++) { const x = (rnd(i) * W + t * drift * (rnd(i + 1) + .2)) % W, y = rnd(i + 2) * H, r = rnd(i + 3) * 1.8 + .3; ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(t * (1 + rnd(i + 4) * 2) + i)); ctx.fillStyle = '#fff'; ctx.fillRect(x, y, r, r); } ctx.globalAlpha = 1; }
function smoke(ctx, t, a = .25) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 7; i++) { const x = (rnd(i) * W + t * 20 * (i % 2 ? 1 : -1)) % (W + 600) - 300, y = H * (.2 + rnd(i + 9) * .7), r = 300 + rnd(i + 3) * 400; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(200,200,210,${a * .35})`); g.addColorStop(1, 'rgba(200,200,210,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); } ctx.restore(); }

// ---------- finishing
function vignetteK(ctx, a = .55) { const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function bloom(ctx, a = .35, r = 24) { const c = ctx.canvas; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.filter = `blur(${r}px) brightness(1.4) contrast(1.6)`; ctx.drawImage(c, 0, 0); ctx.restore(); }
function lightSweep(ctx, p, a = .35) { if (p <= 0 || p >= 1) return; const x = lerp(-W * .6, W * 1.6, p); ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(x - 260, 0, x + 260, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,246,230,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.transform(1, 0, -.35, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(x - 600, 0, 1200, H); ctx.restore(); }
function flashK(ctx, t, t0, d = .35, col = '255,255,255') { const p = (t - t0) / d; if (p < 0 || p > 1) return; ctx.save(); ctx.fillStyle = `rgba(${col},${(1 - p) ** 2})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// ---------- sequencing + transitions (motion-blurred, After-Effects style)
const _BUF = {}; function buf(k) { return _BUF[k] || (_BUF[k] = mkCanvas(W, H)); }
function _paint(k, fn, t, lt) { const c = buf(k), x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.save(); fn(x, t, lt); x.restore(); return c; }
// scenes: [{t0, draw(ctx,t,lt), tr:'whip'|'zoom'|'flash'|'glitch'|'blur'|'slide'|'spin'|'cut', trd}], transition plays at the START of each scene (centred on t0)
function seq(ctx, t, scenes) { let i = scenes.length - 1; while (i > 0 && t < scenes[i].t0) i--; const S = scenes[i], N = scenes[i + 1];
  const trd = s => s.trd ?? .45;
  if (N && N.tr !== 'cut' && t > N.t0 - trd(N) / 2) return _trans(ctx, t, S, N, (t - (N.t0 - trd(N) / 2)) / trd(N));
  if (i > 0 && S.tr !== 'cut' && t < S.t0 + trd(S) / 2) return _trans(ctx, t, scenes[i - 1], S, (t - (S.t0 - trd(S) / 2)) / trd(S));
  S.draw(ctx, t, t - S.t0); }
function _trans(ctx, t, A, B, p) { p = clamp(p); const ty = B.tr || 'whip';
  const a = _paint('A', A.draw, t, t - A.t0), b = _paint('B', B.draw, t, Math.max(0, t - B.t0));
  const mb = (img, n, fnT) => { for (let k = 0; k < n; k++) { ctx.save(); ctx.globalAlpha = k ? 1 / (k + 1) : 1; fnT(k / Math.max(1, n - 1)); ctx.drawImage(img, 0, 0); ctx.restore(); } };
  if (ty === 'whip' || ty === 'spin') { const dir = B.dir || 1, e = E.inOut(p), img = p < .5 ? a : b, ang = (p < .5 ? e : e - 1) * (ty === 'spin' ? Math.PI : .5) * dir, sc = 1 + Math.sin(p * Math.PI) * .35, off = (p < .5 ? e : e - 1) * W * .9 * dir * (ty === 'whip' ? 1 : 0);
    mb(img, 6, q => { const k = 1 - q * .06 * Math.sin(p * Math.PI); ctx.translate(W / 2 + off * k, H / 2); ctx.rotate(ang * k); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2); }); }
  else if (ty === 'zoom') { const img = p < .5 ? a : b, z = p < .5 ? lerp(1, 3.2, E.in(p * 2)) : lerp(2.4, 1, E.out(p * 2 - 1)); mb(img, 7, q => { const zz = z * (1 + q * .12 * Math.sin(p * Math.PI)); ctx.translate(W / 2, H / 2); ctx.scale(zz, zz); ctx.translate(-W / 2, -H / 2); }); }
  else if (ty === 'slide') { const e = E.inOut(p), d = B.dir || 1; mb(a, 5, q => ctx.translate(0, -e * H * d * (1 - q * .05))); mb(b, 5, q => ctx.translate(0, (1 - e) * H * d * (1 + q * .05))); }
  else if (ty === 'glitch') { const img = p < .5 ? a : b; ctx.drawImage(img, 0, 0); const k = Math.sin(p * Math.PI);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .8 * k; ctx.filter = 'sepia(1) saturate(8) hue-rotate(-50deg)'; ctx.drawImage(img, 26 * k, 0); ctx.restore();
    for (let s = 0; s < 9; s++) { const y = rnd(s + Math.floor(t * 24)) * H, hh = 20 + rnd(s + 3) * 90; ctx.drawImage(img, 0, y, W, hh, (rnd(s + 7) - .5) * 160 * k, y, W, hh); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,40,40,${.38 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  else if (ty === 'blur') { ctx.save(); ctx.filter = `blur(${Math.sin(p * Math.PI) * 30}px)`; ctx.drawImage(a, 0, 0); ctx.globalAlpha = E.inOut(p); ctx.drawImage(b, 0, 0); ctx.restore(); }
  else { ctx.drawImage(p < .5 ? a : b, 0, 0); }
  if (ty === 'flash' || B.flash) { ctx.drawImage(p < .5 ? a : b, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,250,240,${Math.sin(p * Math.PI) ** 1.5})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
// add whoosh/impact cues for every transition of a seq
function seqCues(scenes, gain = .7) { scenes.forEach((s, i) => { if (!i || s.tr === 'cut') return; cue(s.t0 - .2, s.tr === 'flash' ? 'impact' : s.tr === 'glitch' ? 'hit' : 'whoosh', gain); }); }

// ---------- typography
let _NOISE = null; function noiseTex() { return _NOISE || (_NOISE = tex('noise', 512, 512, (c, w, h) => { for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(0,0,0,${.3 + rnd(i) * .7})`; const s = rnd(i + 1) * 4 + .5; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, s, s * (.5 + rnd(i + 4))); } })); }
// grunge stacked title: lines [{s, color, size}] ; pops word by word from t0; o: {font, gap, extrude, rot, align}
function grungeTitle(ctx, lines, x, y, t, t0, o = {}) { if (t < t0) return; const font = o.font || F.anton, gap = o.gap ?? .12; let k = 0, yy = y;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.translate(-x, -y);
  lines.forEach(L => { const size = L.size || 140; yy += size * .92; ctx.font = `${size}px ${font}`; const words = L.s.split(' '), sp = size * .22, wsz = words.map(w => ctx.measureText(w).width), tot = wsz.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let xx = o.align === 'left' ? x : x - tot / 2;
    words.forEach((wd, i) => { const st = t0 + (k++) * gap, p = clamp((t - st) / .28); if (p <= 0) { xx += wsz[i] + sp; return; }
      const e = E.back(p), sc = lerp(1.6, 1, e), cx = xx + wsz[i] / 2, cy = yy - size * .35;
      const c2 = mkTextCanvas(wd, size, font, L.color || KC.white, o.extrude ?? Math.round(size * .05));
      ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(cx, cy); ctx.scale(sc, sc); if (p < 1) ctx.filter = `blur(${(1 - p) * 8}px)`; ctx.drawImage(c2, -c2.width / 2, -c2.height / 2 - size * .02); ctx.restore(); xx += wsz[i] + sp; }); });
  ctx.restore(); }
const _TXC = {}; function mkTextCanvas(s, size, font, color, ext) { const key = [s, size, font, color, ext].join('|'); if (_TXC[key]) return _TXC[key];
  const m = mkCanvas(10, 10).getContext('2d'); m.font = `${size}px ${font}`; const w = Math.ceil(m.measureText(s).width) + size * .4 + ext, h = Math.ceil(size * 1.35) + ext;
  const c = mkCanvas(w, h), x = c.getContext('2d'); x.font = `${size}px ${font}`; x.textBaseline = 'middle'; x.textAlign = 'center';
  for (let e = ext; e > 0; e--) { x.fillStyle = color === KC.white ? '#6E6A64' : '#5C0A0E'; x.fillText(s, w / 2 - ext / 2 + e * .5, h / 2 + e); }
  x.fillStyle = color; x.fillText(s, w / 2 - ext / 2, h / 2); x.globalCompositeOperation = 'destination-out'; const n = noiseTex(); for (let yy = 0; yy < h; yy += 512) for (let xx = 0; xx < w; xx += 512) { x.globalAlpha = .55; x.drawImage(n, xx - (s.length * 37) % 300, yy); }
  x.globalCompositeOperation = 'source-atop'; x.globalAlpha = .12; x.fillStyle = '#000'; x.fillRect(0, h * .55, w, h * .45); return (_TXC[key] = c); }
// red rounded pill tag ("1950s"); slides up with a wipe
function pillTag(ctx, s, x, y, t, t0, o = {}) { if (t < t0) return; const p = E.back(clamp((t - t0) / .35)), size = o.size || 64; ctx.save(); ctx.font = `800 ${size}px ${F.mont}`; const w = ctx.measureText(s).width + size * .9, h = size * 1.35;
  ctx.translate(x, y + (1 - p) * 40); ctx.rotate(o.rot ?? -.03); ctx.scale(lerp(.6, 1, p), lerp(.6, 1, p)); ctx.globalAlpha = clamp(p * 1.5);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fillStyle = o.bg || KC.red; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * .22); ctx.fill(); ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = o.color || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * .04); ctx.restore(); }
// sticker block (yellow/red rectangle behind bold word)
function blockWord(ctx, s, x, y, t, t0, o = {}) { if (t < t0) return; const p = E.back(clamp((t - t0) / .3)), size = o.size || 90; ctx.save(); ctx.font = `${size}px ${o.font || F.anton}`; const w = ctx.measureText(s).width + size * .5, h = size * 1.2;
  ctx.translate(x, y); ctx.rotate(o.rot ?? -.02); ctx.scale(p, p); ctx.fillStyle = o.bg || KC.yellow; ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 18; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  ctx.fillStyle = o.color || KC.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * .05); ctx.restore(); }
// words floating in 3D (serif italic), depth-of-field blur by distance from focus plane
function floatWords3D(ctx, C, words, t, o = {}) { const focus = o.focus ?? 0; words.slice().sort((a, b) => b.pos[2] - a.pos[2]).forEach(wd => { if (t < wd.t0) return; const p = clamp((t - wd.t0) / .5);
  const q = proj(wd.pos, C), s = C.f / Math.max(q[2], 1), size = (wd.size || 90) * s, blur = Math.min(14, Math.abs(wd.pos[2] - focus) * (o.dof ?? .01));
  ctx.save(); ctx.globalAlpha = p * (wd.alpha ?? 1); if (blur > .6) ctx.filter = `blur(${blur}px)`; ctx.font = `${size}px ${wd.font || F.serifI}`; ctx.fillStyle = wd.color || '#EDE8DE'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.translate(q[0], q[1] + (1 - E.out(p)) * 30 * s); ctx.rotate(wd.rot || 0); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 20; ctx.fillText(wd.s, 0, 0); ctx.restore(); }); }
// word-chunk captions from the timeline (bottom, small white sans), groups of up to n words
function kCaption(ctx, t, ids, o = {}) { const n = o.n || 3, y = o.y ?? H * .8; for (const id of ids) { const L = LINE[id]; if (!L || t < L.start || t > L.end + .05) continue; const ws = L.words; let k = ws.findIndex(w => w.s > t); if (k < 0) k = ws.length; const cur = Math.max(0, k - 1), g0 = Math.floor(cur / n) * n;
  const s = ws.slice(g0, Math.min(ws.length, g0 + n)).filter(w => w.s <= t + .02).map(w => w.w).join(' '); if (!s) continue;
  ctx.save(); ctx.font = `600 ${o.size || 46}px ${F.inter}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.95)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2; ctx.fillText(s, W / 2, y); ctx.restore(); } }
// pixel/blocky number count (retro)
function pixelNum(ctx, v, x, y, t, t0, o = {}) { if (t < t0) return; const p = clamp((t - t0) / (o.dur || .9)), val = Math.round((o.from || 0) + (v - (o.from || 0)) * E.out(p)); const s = (o.pre || '') + val + (o.suf || '');
  ctx.save(); ctx.font = `${o.size || 220}px ${F.pixel}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = (o.size || 220) * .12; ctx.strokeStyle = '#fff'; ctx.strokeText(s, x, y); ctx.fillStyle = o.color || KC.red; ctx.fillText(s, x, y); ctx.restore(); }
// handwriting reveal (Caveat) with left-to-right wipe
function handWrite(ctx, s, x, y, t, t0, o = {}) { if (t < t0) return; const size = o.size || 110; ctx.save(); ctx.font = `600 ${size}px ${F.hand}`; const w = ctx.measureText(s).width, p = clamp((t - t0) / (o.dur || s.length * .07));
  ctx.beginPath(); ctx.rect(x - (o.align === 'center' ? w / 2 : 0) - 10, y - size, (w + 20) * p, size * 1.5); ctx.clip(); ctx.fillStyle = o.color || '#1D2A55'; ctx.textAlign = o.align || 'left'; ctx.fillText(s, x, y); ctx.restore(); }
// end card: brand + glass follow (needs veritrix_kit glassFollow if available)
function brandEnd(ctx, t, t0, name, o = {}) { if (t < t0) return; const p = E.back(clamp((t - t0) / .45)); ctx.save(); ctx.translate(W / 2, o.y ?? H * .42); ctx.scale(p, p);
  ctx.font = `${o.size || 120}px ${F.anton}`; ctx.textAlign = 'center'; ctx.fillStyle = KC.white; const parts = name.split(' '); parts.forEach((s, i) => { ctx.fillStyle = i ? KC.red : KC.white; ctx.fillText(s.toUpperCase(), 0, i * (o.size || 120) * 1.0); }); ctx.restore(); }
