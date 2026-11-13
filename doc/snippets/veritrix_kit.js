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
