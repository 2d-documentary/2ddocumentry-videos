'use strict';
const EP = { brand: 'DAGAR UNFILTERED', images: {}, credit: {}, scenes, bleep: ['shit', 'fuck'], capScale: .046 };
const C = {};
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
// clips: image sequences (12 fps; soundbites 24 fps)
const CLIPN = {"b_fire": 94, "f_drag": 144, "f_land99": 288, "f_crs7": 120, "u_rdemo": 295, "b_terr": 168, "f_first": 132, "u_tra": 156, "f_ift5": 144, "f_cotsb": 96, "b_label": 126, "f_night": 168, "f_cots": 108, "b_torch": 152, "f_ift3": 144, "f_pad": 54, "u_trb": 48, "f_fhland": 114, "u_sink": 112, "f_ift3b": 216, "u_trd": 168, "f_ift5c": 192, "f_f926": 132, "f_lift": 84, "u_trc": 96};
for (const k in CLIPN) for (let i = 0; i < CLIPN[k]; i++) EP.images[k + '_f' + i] = 'archives/user/' + k + '_f' + i + '.jpg';
const CLIPV = {"c_tower": ["catch_vid_tower", 45], "i_boom2": ["ift1_vid_boom2", 33], "i_boom": ["ift1_vid_boom", 33], "i_up": ["ift1_vid_up", 36], "c_rise": ["catch_vid_rise", 39], "c_ign": ["catch_vid_ign", 36]};
for (const k in CLIPV) for (let i = 0; i < CLIPV[k][1]; i++) EP.images[k + '_f' + i] = 'archives/footage/' + CLIPV[k][0] + '_' + i + '.jpg';
// Joe Rogan Experience #1169 soundbites: offset/duration in rogan.m4a + word timings relative to bite start
const BITES = {"b_fire": {"off": 11.45, "d": 3.9, "words": [["And", 0.09, 0.19], ["thanks", 0.19, 0.31], ["for", 0.31, 0.41], ["not", 0.41, 0.51], ["lighting", 0.51, 0.69], ["this", 0.69, 0.83], ["place", 0.83, 0.97], ["on", 0.97, 1.15], ["fire.", 1.15, 1.43], ["You're", 1.75, 1.95], ["welcome.", 1.95, 2.15], ["That's", 3.07, 3.45], ["coming", 3.45, 3.51], ["later.", 3.51, 3.75]]}, "b_terr": {"off": 130.95, "d": 7.0, "words": [["Yeah,", 0.05, 0.53], ["it's", 0.61, 0.67], ["a", 0.67, 0.75], ["terrible", 0.75, 0.93], ["idea.", 0.93, 1.19], ["Terrible.", 1.91, 2.39], ["You", 2.63, 2.93], ["shouldn't", 2.93, 2.97], ["buy", 2.97, 3.17], ["one.", 3.17, 3.37], ["I", 4.03, 4.51], ["said", 4.51, 4.75], ["don't", 4.75, 5.09], ["buy", 5.09, 5.33], ["this", 5.33, 5.59], ["flamethrower.", 5.59, 6.15], ["Don't", 6.25, 6.55], ["buy", 6.55, 6.73], ["it.", 6.73, 6.95]]}, "b_torch": {"off": 215.5, "d": 6.35, "words": [["It's", 0.06, 0.68], ["actually", 0.68, 1.06], ["just", 1.06, 1.24], ["a", 1.24, 1.38], ["roofing", 1.38, 1.8], ["torch", 1.8, 2.06], ["with", 2.06, 2.28], ["an", 2.28, 2.4], ["air", 2.4, 2.66], ["rifle", 2.66, 2.9], ["cover", 2.9, 3.2], ["It's", 4.74, 5.14], ["not", 5.14, 5.32], ["a", 5.32, 5.46], ["real", 5.46, 5.66], ["flamethrower", 5.66, 6.26]]}, "b_label": {"off": 236.7, "d": 5.25, "words": [["To", 0.06, 0.5], ["solve", 0.5, 0.76], ["this", 0.76, 0.9], ["problem", 0.9, 1.3], ["for", 1.3, 2.34], ["all", 2.34, 2.56], ["the", 2.56, 2.68], ["customs", 2.68, 3.0], ["agencies.", 3.0, 3.4], ["We", 3.4, 3.66], ["labeled", 3.66, 4.14], ["it", 4.14, 4.26], ["not", 4.26, 4.46], ["a", 4.46, 4.6], ["flamethrower", 4.6, 5.08]]}};
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
// CINEMA3D KIT: "After Effects in canvas" for cinematic 2.5D documentary edits
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
  x.fillStyle = color; x.fillText(s, w / 2 - ext / 2, h / 2); x.globalCompositeOperation = 'destination-out'; const n = noiseTex(); for (let yy = 0; yy < h; yy += 512) for (let xx = 0; xx < w; xx += 512) { x.globalAlpha = .32; x.drawImage(n, xx - (s.length * 37) % 300, yy); }
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

// ============================================================================
// DOCX KIT: fast-cut "explainer documentary" edit (B&W archival, word-by-word captions,
// condensed headlines, serif name labels with depth-of-field, blurred-backdrop cards,
// grey collage boards, polaroids on black, cut-outs on swapped backgrounds, mosaic walls,
// tile/invert/RGB/punch/leak transitions, 3-4 photos per second bursts).
// Needs cinema3d_kit.js (cam, card3d, mkCanvas, tex, buf) pasted BEFORE this file.
// Fonts: RobotoCond (headlines), Arimo (captions), Tinos (serif names), InterTight.
// ============================================================================
Object.assign(F, { cond: 'RobotoCond', cap: 'Arimo', tinos: 'Tinos', tight: 'InterTight' });
const MN = () => Math.min(W, H);
const DX = { grey0: '#ECECEC', grey1: '#B9B9B9', red: '#E0262B', cream: '#F3F1EC' };

// ---------- image drawing (cover fit into a rect, push-in, filters)
function imgOf(k) { return typeof k === 'string' ? IMG[k] : k; }
function cover(ctx, k, x, y, w, h, o = {}) { const im = imgOf(k); if (!im) { ctx.fillStyle = '#222'; ctx.fillRect(x, y, w, h); return; }
  const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, z = o.z ?? 1, s = Math.max(w / iw, h / ih) * z, fx = o.fx ?? .5, fy = o.fy ?? .5;
  const dw = iw * s, dh = ih * s, dx = x + w / 2 - dw * fx + (o.ox || 0), dy = y + h / 2 - dh * fy + (o.oy || 0);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); const f = filt(o); if (f) ctx.filter = f;
  ctx.drawImage(im, dx, dy, dw, dh); ctx.restore(); }
function filt(o) { const a = []; if (o.bw ?? true) a.push('grayscale(1)'); if (o.contrast) a.push(`contrast(${o.contrast})`); else if (o.bw ?? true) a.push('contrast(1.12)');
  if (o.bright) a.push(`brightness(${o.bright})`); if (o.blur) a.push(`blur(${o.blur}px)`); if (o.sat) a.push(`saturate(${o.sat})`); if (o.invert) a.push('invert(1)'); return a.join(' '); }
// full-frame photo with a push-in (z0 -> z1 over dur), focus point fx/fy drifting to fx1/fy1
function full(ctx, k, lt, o = {}) { const p = E.inOut(clamp(lt / (o.dur || 3))); cover(ctx, k, 0, 0, W, H, { ...o, z: lerp(o.z0 ?? 1.04, o.z1 ?? 1.14, p), fx: lerp(o.fx ?? .5, o.fx1 ?? o.fx ?? .5, p), fy: lerp(o.fy ?? .5, o.fy1 ?? o.fy ?? .5, p) });
  if (o.dark) { ctx.fillStyle = `rgba(0,0,0,${o.dark})`; ctx.fillRect(0, 0, W, H); } }
// footage clip (image sequence <key>_f0..N at 12 fps) as a full frame or into a rect
function clipImg(key, lt, fps = 12) { const n = clipCount ? clipCount(key) : 0; if (!n) return IMG[key] ? key : null; return key + '_f' + (Math.floor(lt * fps) % n); }
function fullClip(ctx, key, lt, o = {}) { const k = clipImg(key, lt + (o.off || 0)); if (k) full(ctx, k, lt, { z0: 1.02, z1: 1.08, ...o }); }

// ---------- card over its own blurred copy (signature look)
function blurCard(ctx, k, lt, t, o = {}) { cover(ctx, k, 0, 0, W, H, { ...o, z: 1.35 + lt * .02, blur: o.bgBlur ?? 22, bright: .55 });
  const p = E.out(clamp(lt / .5)), w = (o.w ?? W * .52) * lerp(.92, 1, p) * (1 + lt * .012), im = imgOf(k), ar = im ? (im.naturalHeight || im.height) / (im.naturalWidth || im.width) : .66, h = o.h ?? w * ar;
  ctx.save(); ctx.translate(W / 2 + (o.dx || 0), H / 2 + (o.dy || 0)); ctx.rotate(o.rot ?? 0); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 50; ctx.fillStyle = '#000'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  cover(ctx, k, -w / 2, -h / 2, w, h, { ...o, z: 1.02 + lt * .015 }); ctx.restore(); }

// ---------- depth-of-field focus on one face in a group photo + serif name with glow
function dofFocus(ctx, k, lt, o = {}) { const z = lerp(o.z0 ?? 1.6, o.z1 ?? 1.75, clamp(lt / 2.5)), fx = o.fx ?? .5, fy = o.fy ?? .5;
  cover(ctx, k, 0, 0, W, H, { ...o, z, fx, fy, blur: o.blur ?? 7, bright: .72 });
  const b = buf('dof'), x = b.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.filter = 'none'; cover(x, k, 0, 0, W, H, { ...o, z, fx, fy });
  x.globalCompositeOperation = 'destination-in'; const r = (o.r ?? .2) * H, cx = W * (o.cx ?? .5), cy = H * (o.cy ?? .5); const g = x.createRadialGradient(cx, cy, r * .55, cx, cy, r * 1.25); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
  ctx.drawImage(b, 0, 0); }
function serifName(ctx, s, x, y, t, t0, o = {}) { if (t < t0) return; const p = clamp((t - t0) / .35), size = o.size || MN() * .075; ctx.save(); ctx.globalAlpha = p; ctx.font = `700 ${size}px ${F.tinos}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,.85)'; ctx.shadowBlur = size * .45; ctx.fillStyle = '#fff'; if (p < 1) ctx.filter = `blur(${(1 - p) * 6}px)`; ctx.fillText(s, x, y + (1 - E.out(p)) * 10); ctx.shadowBlur = size * .12; ctx.fillText(s, x, y + (1 - E.out(p)) * 10); ctx.restore(); }

// ---------- condensed bold headline (+ small regular sub-line), pops in per word
function headline(ctx, s, x, y, t, t0, o = {}) { if (t < t0) return; const size = o.size || MN() * .11, words = s.split(' '); ctx.save(); ctx.font = `700 ${size}px ${F.cond}`; ctx.letterSpacing = (o.ls ?? -size * .02) + 'px';
  const ws = words.map(w => ctx.measureText(w).width), sp = size * .2, tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1); let xx = (o.align === 'left' ? x : x - tot / 2);
  words.forEach((w, i) => { const st = t0 + i * (o.stagger ?? .09), p = clamp((t - st) / .22); if (p <= 0) { xx += ws[i] + sp; return; }
    ctx.save(); ctx.globalAlpha = p; ctx.translate(xx + ws[i] / 2, y); const sc = lerp(1.25, 1, E.out(p)); ctx.scale(sc, sc); if (p < 1) ctx.filter = `blur(${(1 - p) * 10}px)`;
    if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = size * .25; } ctx.fillStyle = (o.colors && o.colors[i]) || o.color || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(w, 0, 0); ctx.restore(); xx += ws[i] + sp; });
  if (o.sub) { const ss = o.subSize || size * .32; ctx.font = `400 ${ss}px ${F.cap}`; ctx.letterSpacing = '0px'; ctx.textAlign = o.align === 'left' ? 'left' : 'center'; ctx.fillStyle = o.subColor || o.color || '#fff'; ctx.globalAlpha = clamp((t - t0 - (o.subDelay ?? .3)) / .25);
    const sw = o.sub.split(' '); let acc = ''; sw.forEach((w, i) => { if (t >= t0 + (o.subDelay ?? .3) + i * (o.subStagger ?? .12)) acc += (i ? '   ' : '') + w; }); ctx.fillText(acc, o.align === 'left' ? x : x, y + size * .62); }
  ctx.restore(); }
function bigNum(ctx, s, x, y, t, t0, o = {}) { headline(ctx, s, x, y, t, t0, { size: o.size || MN() * .3, ...o }); }

// ---------- captions (word by word, Arimo, wide word gaps)
// modes: 'acc' (phrase accumulates), 'one' (single word), 'type' (accumulate + _ cursor), 'kara' (full phrase grey, spoken words white), 'block' (next word shown as a black bar first)
function cap(ctx, t, ids, o = {}) { const mode = o.mode || 'acc', n = o.n || 5, y = o.y ?? H * .55, size = o.size || MN() * (EP.capScale || .03), col = o.color || '#fff';
  for (const id of [].concat(ids)) { const L = LINE[id]; if (!L || t < L.start - .05 || t > L.end + (o.hold ?? .25)) continue; const ws = L.words; let k = ws.findIndex(w => w.s > t + .02); if (k < 0) k = ws.length;
    const cur = Math.max(0, k - 1), brk = phraseBreaks(ws, n), g0 = brk.filter(b => b <= cur).pop() || 0, g1 = brk.find(b => b > cur) ?? ws.length;
    const grp = ws.slice(g0, g1), shown = grp.filter(w => w.s <= t + .02);
    ctx.save(); ctx.font = `${o.weight || 400} ${size}px ${o.font || F.cap}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const gap = size * (o.gap ?? 1.05);
    const list = mode === 'one' ? shown.slice(-1) : (mode === 'kara' || mode === 'block') ? grp : shown;
    const wd = list.map(w => ctx.measureText(cleanW(w.w)).width), tot = wd.reduce((a, b) => a + b, 0) + gap * Math.max(0, list.length - 1); let x = W / 2 - tot / 2;
    if (o.shadow !== false) { ctx.shadowColor = o.shadowColor || 'rgba(0,0,0,.85)'; ctx.shadowBlur = size * .35; }
    list.forEach((w, i) => { const said = w.s <= t + .02, emph = o.emph && o.emph.includes(cleanW(w.w).toLowerCase());
      if (mode === 'block' && !said) { ctx.save(); ctx.shadowColor = 'transparent'; ctx.fillStyle = o.blockColor || '#000'; ctx.fillRect(x, y - size * .42, wd[i], size * .84); ctx.restore(); }
      else { ctx.fillStyle = mode === 'kara' && !said ? (o.dim || 'rgba(255,255,255,.35)') : (emph ? (o.emphColor || DX.red) : col); ctx.globalAlpha = said ? clamp((t - w.s) / .08 + .2) : 1; ctx.fillText(cleanW(w.w), x, y); ctx.globalAlpha = 1; }
      x += wd[i] + gap; });
    if (mode === 'type' && Math.floor(t * 2.5) % 2 === 0) ctx.fillText('_', x - gap + size * .15, y);
    ctx.restore(); } }
function cleanW(w) { w = w.replace(/[“”"]/g, ''); const core = w.replace(/[^A-Za-z']/g, '').toLowerCase(); if ((EP.bleep || []).includes(core)) { const m = w.match(/^([^A-Za-z]*)([A-Za-z])[A-Za-z']*(.*)$/); if (m) return m[1] + m[2] + '***' + m[3]; } return w; }
function phraseBreaks(ws, n) { const b = [0]; let c = 0; ws.forEach((w, i) => { c++; if (i + 1 < ws.length && (c >= n || /[,.;:?!]$/.test(w.w))) { b.push(i + 1); c = 0; } }); return b; }

// ---------- boards and layouts
function greyBoard(ctx, t, inv = false) { const g = ctx.createRadialGradient(W / 2, H / 2, H * .1, W / 2, H / 2, W * .75); g.addColorStop(0, inv ? '#2A2A2A' : DX.grey0); g.addColorStop(1, inv ? '#050505' : DX.grey1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
// photos sliding in from the edges onto a grey board (items: {k, x, y, w, rot, t0, from:'l'|'r'|'t'|'b'})
function collage(ctx, t, items, o = {}) { items.forEach(it => { if (t < it.t0) return; const p = E.out(clamp((t - it.t0) / (o.dur ?? .35))), im = imgOf(it.k); const w = it.w * (o.scale || 1), ar = im ? (im.naturalHeight || im.height) / (im.naturalWidth || im.width) : .7, h = it.h ?? w * ar;
  const off = { l: [-W * .5, 0], r: [W * .5, 0], t: [0, -H * .6], b: [0, H * .6] }[it.from || 'r'], x = it.x + off[0] * (1 - p), y = it.y + off[1] * (1 - p);
  ctx.save(); ctx.translate(x, y); ctx.rotate(it.rot || 0); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; ctx.fillStyle = '#fff'; const b = it.border ?? 0; ctx.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b); ctx.shadowColor = 'transparent';
  cover(ctx, it.k, -w / 2, -h / 2, w, h, { bw: it.bw ?? true }); ctx.restore(); }); }
function polaroid(ctx, k, x, y, w, t, t0, o = {}) { if (t < t0) return; const p = E.out(clamp((t - t0) / .4)), im = imgOf(k), ar = o.ar ?? (im ? (im.naturalHeight || im.height) / (im.naturalWidth || im.width) : .75), h = w * ar, b = w * .045;
  ctx.save(); ctx.translate(x + (o.fromX ?? 0) * (1 - p), y + (o.fromY ?? H * .25) * (1 - p)); ctx.rotate((o.rot ?? 0) * p + (1 - p) * .12); ctx.globalAlpha = clamp(p * 1.5);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#F4F2EE'; ctx.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b + (o.bottom ?? b * 2.5)); ctx.shadowColor = 'transparent';
  cover(ctx, k, -w / 2, -h / 2, w, h, { bw: o.bw ?? true, z: 1.03 + (t - t0) * .02 }); ctx.restore(); }
// grid wall of many images, zooming out (or in) over time; focus tile can be highlighted
function mosaic(ctx, keys, lt, o = {}) { const cols = o.cols || 5, rows = o.rows || 4, gap = o.gap ?? 8, z = lerp(o.z0 ?? 1.5, o.z1 ?? 1.0, E.out(clamp(lt / (o.dur || 1.6)))), tw = (W - gap * (cols + 1)) / cols, th = (H - gap * (rows + 1)) / rows;
  ctx.save(); ctx.fillStyle = o.bg || '#0B0B0B'; ctx.fillRect(0, 0, W, H); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, k = keys[i % keys.length], x = gap + c * (tw + gap), y = gap + r * (th + gap), d = clamp((lt - hash(i) * .5) / .3);
    ctx.globalAlpha = d; cover(ctx, k, x, y, tw, th, { bw: o.bw ?? true, z: 1.05 }); } ctx.restore(); }
// burst montage: cycles keys at `rate` per second (3-4 photos a second), each with its own punch zoom
function burst(ctx, keys, lt, o = {}) { const rate = o.rate || 4, i = Math.floor(lt * rate), k = keys[i % keys.length], ll = lt - i / rate; full(ctx, k, ll, { z0: o.z0 ?? 1.18, z1: o.z1 ?? 1.04, dur: 1 / rate, fx: .5 + (hash(i) - .5) * .15, fy: .5 + (hash(i + 3) - .5) * .15, bw: o.bw ?? true });
  if (ll < .04) { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(0, 0, W, H); } }
// cut-out subject on a swapped background, optional text BEHIND the subject
function cutoutOn(ctx, bg, cutKey, lt, t, o = {}) { full(ctx, bg, lt, { bw: o.bgBw ?? false, z0: 1.05, z1: 1.12, dur: 4, sat: o.sat ?? .85 });
  if (o.behind) headline(ctx, o.behind, W / 2, o.behindY ?? H * .44, t, o.behindT ?? -1, { size: o.behindSize || H * .16, color: o.behindColor || '#fff' });
  const im = imgOf(cutKey); if (!im) return; const h = H * (o.h ?? .95), w = h * (im.naturalWidth || im.width) / (im.naturalHeight || im.height), x = W * (o.x ?? .5) - w / 2 + lt * (o.drift ?? 6), y = H - h + (o.dy ?? 0);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.filter = o.cutBw ? 'grayscale(1) contrast(1.1)' : 'none'; ctx.drawImage(im, x, y, w, h); ctx.restore(); }
// terminal text in 3D perspective on a grid (glowing yellow/green)
function terminal3D(ctx, s, t, t0, o = {}) { ctx.fillStyle = '#060504'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2, H / 2); ctx.transform(1, -.12, .25, .85, 0, 0); ctx.rotate(-.12);
  ctx.strokeStyle = 'rgba(255,200,80,.12)'; ctx.lineWidth = 2; for (let gx = -W; gx < W; gx += 70) { ctx.beginPath(); ctx.moveTo(gx, -H); ctx.lineTo(gx, H); ctx.stroke(); } for (let gy = -H; gy < H; gy += 70) { ctx.beginPath(); ctx.moveTo(-W, gy); ctx.lineTo(W, gy); ctx.stroke(); }
  const n = Math.floor(clamp((t - t0) * (o.cps || 18), 0, s.length)), size = o.size || MN() * .09; ctx.font = `${size}px ${F.mono}`; ctx.fillStyle = o.color || '#F5D06A'; ctx.shadowColor = o.color || '#F5D06A'; ctx.shadowBlur = 25; ctx.textAlign = 'center';
  ctx.fillText(s.slice(0, n) + (Math.floor(t * 3) % 2 ? '|' : ' '), 0, 0); ctx.restore(); }

// ---------- finishing: film look for B&W archive edits
let _GRN = null; function grainTex() { return _GRN || (_GRN = tex('grainD', 512, 512, (c, w, h) => { const d = c.createImageData(w, h); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); })); }
function filmFinish(ctx, t, o = {}) { const g = grainTex(), f = Math.floor(t * 24); ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain ?? .12; ctx.fillStyle = ctx.createPattern(g, 'repeat'); ctx.translate((hash(f) * 512) | 0, (hash(f + 1) * 512) | 0); ctx.fillRect(-512, -512, W + 1024, H + 1024); ctx.restore();
  vignetteK(ctx, o.vig ?? .45); if (o.flicker !== false) { ctx.fillStyle = `rgba(0,0,0,${.03 * hash(f + 9)})`; ctx.fillRect(0, 0, W, H); }
  if (o.dust !== false && hash(f + 17) > .8) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; const x = hash(f + 3) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 6, H); ctx.stroke(); ctx.restore(); } }

// ---------- sequencing with the DOCX transition set
// beats: [{t0, draw(ctx,t,lt), tr: 'cut'|'punch'|'tiles'|'invert'|'rgb'|'leak'|'whip'|'zoom'|'blur'|'flash'|'slide'|'glitch', trd}]
function dseq(ctx, t, beats) { let i = beats.length - 1; while (i > 0 && t < beats[i].t0) i--; const S = beats[i], N = beats[i + 1], trd = b => b.trd ?? ({ punch: .3, tiles: .4, invert: .12, rgb: .3, leak: .6, cut: 0 }[b.tr] ?? .4);
  if (N && N.tr && N.tr !== 'cut' && t > N.t0 - trd(N) / 2) return dtrans(ctx, t, S, N, (t - (N.t0 - trd(N) / 2)) / trd(N));
  if (i > 0 && S.tr && S.tr !== 'cut' && t < S.t0 + trd(S) / 2) return dtrans(ctx, t, beats[i - 1], S, (t - (S.t0 - trd(S) / 2)) / trd(S));
  S.draw(ctx, t, t - S.t0); }
function dtrans(ctx, t, A, B, p) { p = clamp(p); const ty = B.tr; if (['whip', 'zoom', 'blur', 'flash', 'slide', 'glitch', 'spin'].includes(ty)) return _trans(ctx, t, A, B, p);
  const a = _paint('A', A.draw, t, t - A.t0), b = _paint('B', B.draw, t, Math.max(0, t - B.t0)), img = p < .5 ? a : b, k = Math.sin(p * Math.PI);
  if (ty === 'punch') { const z = p < .5 ? lerp(1, 1.5, E.in(p * 2)) : lerp(1.35, 1, E.out(p * 2 - 1)); for (let s = 0; s < 6; s++) { ctx.save(); ctx.globalAlpha = s ? .5 / s : 1; const zz = z * (1 + s * .025 * k); ctx.translate(W / 2, H / 2); ctx.scale(zz, zz); ctx.translate(-W / 2, -H / 2); ctx.drawImage(img, 0, 0); ctx.restore(); } }
  else if (ty === 'tiles') { ctx.drawImage(img, 0, 0); const cols = 4, rows = 3, tw = W / cols, th = H / rows; ctx.save(); ctx.fillStyle = '#F2F2F2';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const q = clamp((k * 1.6) - hash(r * 7 + c) * .6); if (q <= 0) continue; const dir = hash(r + c * 3) > .5 ? 1 : -1; ctx.fillRect(c * tw + (1 - q) * tw * dir * .5, r * th, tw * q + 1, th + 1); } ctx.restore(); }
  else if (ty === 'invert') { ctx.save(); ctx.filter = 'invert(1) grayscale(.3)'; ctx.drawImage(img, 0, 0); ctx.restore(); }
  else if (ty === 'rgb') { ctx.drawImage(img, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .55 * k; ctx.filter = 'sepia(1) saturate(9) hue-rotate(-60deg)'; ctx.drawImage(img, 22 * k, 0); ctx.filter = 'sepia(1) saturate(9) hue-rotate(160deg)'; ctx.drawImage(img, -22 * k, 0); ctx.restore(); }
  else if (ty === 'leak') { ctx.drawImage(a, 0, 0); ctx.save(); ctx.globalAlpha = E.inOut(p); ctx.drawImage(b, 0, 0); ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(W * (.2 + p * .6), H * .4, 0, W * (.2 + p * .6), H * .4, W * .7); g.addColorStop(0, `rgba(255,190,120,${.9 * k})`); g.addColorStop(.5, `rgba(255,90,40,${.4 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  else ctx.drawImage(img, 0, 0); }

// recreated post card (label it RECREATION): name, handle, text, date
function postCard(ctx, t, t0, o) { if (t < t0) return; const p = E.out(clamp((t - t0) / .35)), w = Math.min(W * .62, 1100), h = w * .42, x = W / 2 - w / 2, y = H / 2 - h / 2 + (1 - p) * 40;
  ctx.save(); ctx.globalAlpha = p; ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 50; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.fill(); ctx.shadowColor = 'transparent';
  const a = imgOf(o.avatar); ctx.save(); ctx.beginPath(); ctx.arc(x + 70, y + 72, 38, 0, 7); ctx.clip(); if (a) cover(ctx, o.avatar, x + 32, y + 34, 76, 76, { bw: false }); else { ctx.fillStyle = '#ccc'; ctx.fill(); } ctx.restore();
  ctx.fillStyle = '#111'; ctx.font = `700 ${w * .034}px ${F.inter}`; ctx.fillText(o.name || 'Elon Musk', x + 124, y + 66); ctx.fillStyle = '#666'; ctx.font = `400 ${w * .028}px ${F.inter}`; ctx.fillText(o.handle || '@elonmusk', x + 124, y + 102);
  ctx.fillStyle = '#111'; ctx.font = `400 ${w * .045}px ${F.inter}`; wrapLines(ctx, o.text, w - 80).forEach((l, i) => ctx.fillText(l, x + 40, y + 180 + i * w * .058));
  ctx.fillStyle = '#888'; ctx.font = `400 ${w * .024}px ${F.inter}`; ctx.fillText((o.date || '') + '   ·   RECREATION', x + 40, y + h - 30); ctx.restore(); }
function wrapLines(ctx, s, w) { const out = []; let line = ''; s.split(' ').forEach(wd => { const tr = line ? line + ' ' + wd : wd; if (ctx.measureText(tr).width > w) { out.push(line); line = wd; } else line = tr; }); out.push(line); return out; }
// compact beat builder: rows [id, word|null, kind, ...args]; returns dseq beats. kinds documented in the skill.
function buildBeats(rows, opts = {}) { const trs = opts.trs || ['punch', 'cut', 'punch', 'tiles', 'cut', 'rgb', 'punch', 'invert', 'cut', 'leak'];
  return rows.map((r, i) => { const [id, w, kind, ...a] = r; const t0 = i === 0 ? 0 : (typeof id === 'number' ? id : (w ? T(id, w) : LINE[id].start) - .04);
    const tr = (a.length && typeof a[a.length - 1] === 'object' && a[a.length - 1].tr) || trs[i % trs.length], o = (a.length && typeof a[a.length - 1] === 'object') ? a[a.length - 1] : {};
    const D = BEAT_KINDS[kind]; if (!D) throw new Error('unknown beat kind ' + kind);
    return { t0, tr: i ? tr : undefined, cap: o.cap ?? D.cap, draw: (ctx, t, lt) => D.draw(ctx, t, lt, t0, a, o) }; }); }
const black = ctx => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); };
const BEAT_KINDS = {
  full: { cap: 1, draw: (ctx, t, lt, t0, a, o) => full(ctx, a[0], lt, o) },
  clip: { cap: 1, draw: (ctx, t, lt, t0, a, o) => fullClip(ctx, a[0], lt, o) },
  card: { cap: 1, draw: (ctx, t, lt, t0, a, o) => blurCard(ctx, a[0], lt, t, o) },
  dof: { cap: 1, draw: (ctx, t, lt, t0, a, o) => { dofFocus(ctx, a[0], lt, o); if (a[1]) serifName(ctx, a[1], W / 2, H * (o.ny ?? .2), t, t0 + .05); } },
  head: { cap: 0, draw: (ctx, t, lt, t0, a, o) => { if (o.bg) { if (o.clip) fullClip(ctx, o.bg, lt, { dark: o.dark ?? .5 }); else full(ctx, o.bg, lt, { dark: o.dark ?? .5, z0: o.z0 ?? 1.1, z1: o.z1 ?? 1.2, bw: o.bw }); } else if (o.grey) greyBoard(ctx, t); else black(ctx);
      headline(ctx, a[0], W / 2, H * (o.y ?? .46), t, t0 + .03, { sub: a[1], color: o.grey ? '#111' : '#fff', subColor: o.grey ? '#111' : '#fff', shadow: !o.grey, colors: o.colors, size: o.size }); } },
  num: { cap: 0, draw: (ctx, t, lt, t0, a, o) => { if (o.bg) full(ctx, o.bg, lt, { dark: o.dark ?? .55, z0: 1.15, z1: 1.25 }); else black(ctx); bigNum(ctx, a[0], W / 2, H * .46, t, t0 + .02, { color: o.color, size: o.size }); if (a[1]) headline(ctx, a[1], W / 2, H * .46 + MN() * .2, t, t0 + .25, { size: MN() * .05 }); } },
  board: { cap: 0, draw: (ctx, t, lt, t0, a, o) => { greyBoard(ctx, t); const ks = a[2] || [], pos = [[.16, .24, 'l'], [.84, .3, 'r'], [.2, .78, 'b'], [.82, .78, 'b']];
      collage(ctx, t, ks.map((k, i) => ({ k, x: W * pos[i][0], y: H * pos[i][1], w: Math.min(W, H) * (o.pw ?? .34), t0: t0 + i * .1, from: pos[i][2], rot: (i % 2 ? .02 : -.02), border: 8 })));
      headline(ctx, a[0], W / 2, H * .47, t, t0 + .05, { color: '#111', shadow: false, sub: a[1], subColor: '#111', colors: o.colors, size: o.size }); } },
  capboard: { cap: 'dark', draw: (ctx, t) => greyBoard(ctx, t) },
  capblack: { cap: 1, draw: ctx => black(ctx) },
  pol: { cap: 1, draw: (ctx, t, lt, t0, a, o) => { black(ctx); polaroid(ctx, a[0], W / 2, H * .46, Math.min(W, H) * (o.pw ?? .75), t, t0, { rot: o.rot ?? -.015, bw: o.bw }); } },
  wall: { cap: 1, draw: (ctx, t, lt, t0, a, o) => mosaic(ctx, a[0], lt, { cols: W > H ? 5 : 3, rows: W > H ? 4 : 6, z0: 2, z1: 1, dur: 2, ...o }) },
  burst: { cap: 1, draw: (ctx, t, lt, t0, a, o) => burst(ctx, a[0], lt, { rate: o.rate || 4 }) },
  term: { cap: 0, draw: (ctx, t, lt, t0, a) => terminal3D(ctx, a[0], t, t0) },
  post: { cap: 0, draw: (ctx, t, lt, t0, a, o) => { greyBoard(ctx, t, true); postCard(ctx, t, t0 + .05, { avatar: o.avatar, text: a[0], date: a[1] }); } },
};


// ---------- musk-doc extras: soundbites (real audio + 24 fps picture + subtitles), clip fps option
const AUDIO_DIR = 'documentaries/' + 'musk-doc' + '/assets/archives/user/';
function biteDraw(ctx, key, lt) { const n = CLIPN[key] || 1, i = Math.min(n - 1, Math.floor(lt * 24)); full(ctx, key + '_f' + i, lt, { z0: 1.0, z1: 1.04, dur: 6, bw: true }); }
const BITE_IDS = [];
function bite(t0, key) { const b = BITES[key], id = 'B_' + key; LINE[id] = { id, start: t0, end: t0 + b.d, words: b.words.map(w => ({ w: w[0], s: t0 + w[1], e: t0 + w[2] })) }; BITE_IDS.push(id);
  cue(t0, 'audio', 1, { src: AUDIO_DIR + 'rogan.m4a', off: b.off, d: b.d }); return [t0, null, 'bite', key, { tr: 'cut' }]; }
BEAT_KINDS.bite = { cap: 'bite', draw: (ctx, t, lt, t0, a) => biteDraw(ctx, a[0], lt) };
BEAT_KINDS.clipx = { cap: 1, draw: (ctx, t, lt, t0, a, o) => { const n = CLIPN[a[0]] || clipCount(a[0]), i = Math.min(n - 1, Math.floor((lt + (o.off || 0)) * (o.fps || 12))); full(ctx, a[0] + '_f' + i, lt, { z0: o.z0 ?? 1.02, z1: o.z1 ?? 1.08, bw: o.bw, dark: o.dark }); } };
const wi = (id, i) => LINE[id].words[i].s - .04;
function endCard(ctx, t, t0, vert) { black(ctx); if (vert) { headline(ctx, 'FULL DOCUMENTARY', W / 2, H * .4, t, t0, { size: MN() * .1, sub: 'on my YouTube channel' }); headline(ctx, 'DAGAR UNFILTERED', W / 2, H * .6, t, t0 + .5, { size: MN() * .11, colors: ['#fff', DX.red] }); }
  else headline(ctx, 'DAGAR UNFILTERED', W / 2, H * .5, t, t0 + .1, { size: H * .1, colors: ['#fff', DX.red] }); fadeOut(ctx, t, TL.duration, 1); }

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


function scenes() {
  const after = (id, d = .25) => LINE[id].end + d;
  const rows = [
    ['F01', null, 'full', 'p_boring'],
    ['F01', 'twenty', 'num', '20,000', 'flamethrowers'],
    ['F02', null, 'num', '$500', 'each'],
    ['F02', 'four', 'head', 'SOLD OUT', 'in four days', { grey: 1 }],
    ['F03', null, 'full', 'b_fire_f70'],
    ['F03', 'terrible', 'head', 'TERRIBLE IDEA?', '', { bg: 'b_terr_f10' }],
    bite(after('F03'), 'b_terr'),
    ['F04', null, 'capblack'],
    bite(after('F04'), 'b_torch'),
    ['F05', null, 'capboard'],
    bite(after('F05'), 'b_label'),
    ['F06', null, 'num', '20,000', 'sold'],
    ['F06', 'telling', 'head', "DON'T BUY IT", '', { colors: [DX.red] }],
    [after('F06', .5), null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, true) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c === 'bite') cap(ctx, t, BITE_IDS, { y: H * .72, hold: .1 });
    else if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false, y: H * .64 } : { y: H * .64 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'docx', lead: 0 });
  cue(T('F01', 'twenty'), 'cash', .6); cue(T('F06', 'telling'), 'stamp', .6);
}
