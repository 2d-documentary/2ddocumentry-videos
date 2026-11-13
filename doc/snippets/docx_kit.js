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
function dxPost(ctx, t, t0, o) { if (t < t0) return; const p = E.out(clamp((t - t0) / .35)), w = Math.min(W * .62, 1100), h = w * .42, x = W / 2 - w / 2, y = H / 2 - h / 2 + (1 - p) * 40;
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
  post: { cap: 0, draw: (ctx, t, lt, t0, a, o) => { greyBoard(ctx, t, true); dxPost(ctx, t, t0 + .05, { avatar: o.avatar, text: a[0], date: a[1] }); } },
};
