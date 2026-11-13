// docengine.js — UNFILED FILMS archival documentary engine (canvas 2D, deterministic per frame)
// Archival photos + editorial motion graphics: Ken Burns, paper, typewriter, red-pen annotations, maps, counters.
'use strict';
const _Q = new URLSearchParams(location.search);
const W = +(_Q.get('w') || 1920), H = +(_Q.get('h') || 1080);
const VERT = H > W;
const PAL = { paper: '#E9DFC9', paper2: '#D9CBAE', cream: '#F4ECDC', ink: '#17140F', charcoal: '#2A2622',
  red: '#A8322A', red2: '#C2413A', gold: '#B8913F', night: '#0E1116' };
const F = { bebas: 'Bebas', play: 'Playfair', playI: 'PlayfairI', type: 'SpecialElite', hand: 'Caveat', osw: 'Oswald', mono: 'CourierPrime' };

// ---------- math / easing
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: t => t, out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t,
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  expo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- timeline
let TL = null; const LINE = {};
function setTimeline(tl) { TL = tl; tl.lines.forEach(l => LINE[l.id] = l); }
// time of a word in a line: wt('L003', 'Dan') or wt('L003', 0) (word index) or wt('L003') (line start); 'end' for line end
function wt(id, w, which = 's') {
  const l = LINE[id]; if (!l) throw new Error('no line ' + id);
  if (w === undefined) return l.start;
  if (w === 'end') return l.end;
  if (typeof w === 'number') return l.words[Math.min(w, l.words.length - 1)][which];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9$]/g, '');
  const k = l.words.find(x => norm(x.w) === norm(w)) || l.words.find(x => norm(x.w).startsWith(norm(w)));
  if (!k) throw new Error(`word "${w}" not in ${id}`);
  return k[which];
}

// ---------- assets
const IMG = {};
function loadImages(map) {
  return Promise.all(Object.entries(map).map(([k, src]) => new Promise(res => {
    const im = new Image(); im.onload = () => { IMG[k] = im; res(); };
    im.onerror = () => { console.warn('missing image ' + src); res(); }; im.src = src;
  })));
}

// ---------- SFX cues collected while scenes are declared
const CUES = [];
function cue(t, type, gain = 1, d) { const c = { t: +t.toFixed(3), type, gain }; if (d && typeof d === 'object') Object.assign(c, d); else if (d) c.d = +d.toFixed(3); CUES.push(c); } // d: duration (beep)

// ---------- offscreen caches
const CACHE = {};
function offscreen(key, w, h, draw) {
  if (CACHE[key]) return CACHE[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return (CACHE[key] = c);
}
function paperTex(tone = PAL.paper, seed = 3, w = W, h = H) {
  return offscreen(`paper${tone}${seed}${w}x${h}`, w, h, (g) => {
    g.fillStyle = tone; g.fillRect(0, 0, w, h);
    const r = rng(seed);
    // mottled fibres + stains
    for (let i = 0; i < 90; i++) {
      const x = r() * w, y = r() * h, rad = 60 + r() * 380;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const a = .025 + r() * .05; gr.addColorStop(0, `rgba(110,80,40,${a})`); gr.addColorStop(1, 'rgba(110,80,40,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    const id = g.getImageData(0, 0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n * .9; }
    g.putImageData(id, 0, 0);
    // edge burn
    const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75);
    vg.addColorStop(0, 'rgba(60,35,10,0)'); vg.addColorStop(1, 'rgba(60,35,10,.35)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  });
}
function grainTiles() {
  return offscreen('grain', 512, 512 * 4, (g) => {
    for (let k = 0; k < 4; k++) {
      const id = g.createImageData(512, 512), d = id.data, r = rng(91 + k);
      for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      g.putImageData(id, 0, 512 * k);
    }
  });
}

// ---------- post: grain, vignette, flicker
function grain(ctx, t, amt = .06) {
  const g = grainTiles(), k = Math.floor(t * 24) % 4, ox = Math.floor(hash(Math.floor(t * 24)) * 512);
  ctx.save(); ctx.globalAlpha = amt; ctx.globalCompositeOperation = 'overlay';
  for (let x = -ox; x < W; x += 512) for (let y = 0; y < H; y += 512) ctx.drawImage(g, 0, 512 * k, 512, 512, x, y, 512, 512);
  ctx.restore();
}
function vignette(ctx, a = .45) {
  const v = offscreen('vig' + a, W, H, (g) => {
    const gr = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
  ctx.drawImage(v, 0, 0);
}

// ---------- images: Ken Burns with grade
// cover-fit image into box, with camera zoom z and pan (px,py in -1..1 of available slack)
const GRADES = {
  bw: 'grayscale(1) contrast(1.15) brightness(.95)',
  sepia: 'grayscale(1) sepia(.35) contrast(1.12) brightness(.95)',
  color: 'saturate(1.08) contrast(1.08) brightness(.98)',
  warm: 'saturate(1.15) contrast(1.1) sepia(.18) brightness(1)',
  night: 'grayscale(.6) brightness(.55) contrast(1.25)',
  duo: 'grayscale(1) contrast(1.35) brightness(1.02)',
};
const TINTS = { red: '#B2241C', blue: '#0F3D6E', teal: '#0E5A60', gold: '#B8862F', navy: '#0B1A33' };
function photo(ctx, key, o = {}) {
  const im = IMG[key]; if (!im) { placeholder(ctx, key, o); return; }
  const bx = o.x ?? 0, by = o.y ?? 0, bw = o.w ?? W, bh = o.h ?? H;
  const z = o.zoom ?? 1, fx = o.fx ?? .5, fy = o.fy ?? .5;
  const s = Math.max(bw / im.width, bh / im.height) * z;
  const dw = im.width * s, dh = im.height * s;
  let dx = bx + bw / 2 - fx * dw, dy = by + bh / 2 - fy * dh;
  dx = clamp(dx, bx + bw - dw, bx); dy = clamp(dy, by + bh - dh, by);
  ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  ctx.filter = o.filter || GRADES[o.grade || 'sepia'];
  ctx.globalAlpha = o.alpha ?? 1;
  if (o.blur) ctx.filter += ` blur(${o.blur}px)`;
  ctx.drawImage(im, dx, dy, dw, dh); ctx.filter = 'none';
  if (o.tint) { // duotone: colourise luminance, then lift the shadows with a dark tone
    ctx.globalCompositeOperation = 'color'; ctx.fillStyle = TINTS[o.tint] || o.tint; ctx.globalAlpha = (o.alpha ?? 1) * (o.tintAmt ?? 1); ctx.fillRect(bx, by, bw, bh);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}
// "contain" an image (documents, sketches) inside a box with optional paper mount + shadow + rotation
function card(ctx, key, o = {}) {
  const im = IMG[key];
  const cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, maxW = o.maxW ?? 900, maxH = o.maxH ?? 800, rot = o.rot ?? 0, sc = o.scale ?? 1;
  const iw = im ? im.width : 4, ih = im ? im.height : 3; const s = Math.min(maxW / iw, maxH / ih);
  const w = iw * s, h = ih * s, m = o.mount ?? 18;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = o.alpha ?? 1;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.fillStyle = o.mountColor || PAL.cream; ctx.fillRect(-w / 2 - m, -h / 2 - m, w + 2 * m, h + 2 * m);
  ctx.shadowColor = 'transparent';
  if (im) { ctx.filter = o.filter || 'grayscale(1) sepia(.25) contrast(1.08)'; ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.filter = 'none'; }
  else placeholder(ctx, key, { x: -w / 2, y: -h / 2, w, h });
  if (o.tape) tape(ctx, -w / 2 + 30, -h / 2 - m - 8, -.12), tape(ctx, w / 2 - 110, -h / 2 - m - 8, .1);
  ctx.restore();
  return { w: w * sc, h: h * sc };
}
function tape(ctx, x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.fillStyle = 'rgba(235,225,190,.75)'; ctx.fillRect(0, 0, 90, 30); ctx.restore();
}
function placeholder(ctx, key, o) {
  ctx.save(); ctx.fillStyle = '#333'; ctx.fillRect(o.x ?? 0, o.y ?? 0, o.w ?? W, o.h ?? H);
  ctx.fillStyle = '#aaa'; ctx.font = `40px ${F.mono}`; ctx.fillText('[' + key + ']', (o.x ?? 0) + 30, (o.y ?? 0) + 60); ctx.restore();
}

// ---------- typography
function text(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.weight || ''} ${o.size || 80}px ${o.font || F.bebas}`.trim();
  ctx.fillStyle = o.color || PAL.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  if (o.ls) ctx.letterSpacing = o.ls + 'px';
  ctx.globalAlpha = o.alpha ?? 1;
  if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = o.shadow; }
  ctx.fillText(s, x, y); const w = ctx.measureText(s).width; ctx.restore(); return w;
}
// typewriter: reveals chars from t0 at cps; registers key cues once (call from scene builder via typeCues)
function typewriter(ctx, s, x, y, t, t0, cps = 22, o = {}) {
  const n = Math.floor(clamp((t - t0) * cps, 0, s.length));
  const shown = s.slice(0, n);
  const w = text(ctx, shown, x, y, { font: F.type, size: 56, color: PAL.ink, ...o });
  if (n < s.length && Math.floor(t * 3) % 2 === 0) text(ctx, '_', x + w, y, { font: F.type, size: o.size || 56, color: o.color || PAL.ink });
  return n;
}
function typeCues(s, t0, cps = 22, gain = .6) { for (let i = 0; i < s.length; i++) if (s[i] !== ' ') cue(t0 + i / cps, 'key', gain); }
// mask-wipe headline (left to right)
function wipeText(ctx, s, x, y, p, o = {}) {
  ctx.save(); ctx.font = `${o.size || 120}px ${o.font || F.bebas}`; if (o.ls) ctx.letterSpacing = o.ls + 'px';
  const w = ctx.measureText(s).width; const ax = o.align === 'center' ? x - w / 2 : x;
  ctx.beginPath(); ctx.rect(ax - 10, y - (o.size || 120) * 1.1, (w + 20) * E.out(p), (o.size || 120) * 1.5); ctx.clip();
  ctx.fillStyle = o.color || PAL.ink; ctx.textAlign = 'left'; ctx.fillText(s, ax, y);
  if (o.bar && p < 1) { ctx.fillStyle = o.barColor || PAL.red; ctx.fillRect(ax + (w + 20) * E.out(p) - 14, y - (o.size || 120) * .85, 14, (o.size || 120) * .95); }
  ctx.restore(); return w;
}
// kinetic punch-in word (scale from big to 1 with fade)
function punch(ctx, s, x, y, t, t0, o = {}) {
  const p = prog(t, t0, t0 + (o.dur || .22)); if (t < t0) return;
  const sc = lerp(o.from || 1.8, 1, E.out(p));
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  text(ctx, s, 0, 0, { align: 'center', base: 'middle', alpha: p, ...o }); ctx.restore();
}

// ---------- red pen annotations
function penEllipse(ctx, cx, cy, rx, ry, p, o = {}) {
  if (p <= 0) return; const r = rng(o.seed || 7);
  ctx.save(); ctx.strokeStyle = o.color || PAL.red2; ctx.lineWidth = o.lw || 7; ctx.lineCap = 'round'; ctx.globalAlpha = .92;
  const turns = 1.12, N = 90, stop = Math.floor(N * E.inOut(p));
  ctx.beginPath();
  for (let i = 0; i <= stop; i++) {
    const a = -Math.PI * .6 + (i / N) * Math.PI * 2 * turns;
    const wob = 1 + (r() - .5) * .025 + (i / N) * .06;
    const x = cx + Math.cos(a) * rx * wob, y = cy + Math.sin(a) * ry * wob;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.restore();
}
function penLine(ctx, x0, y0, x1, y1, p, o = {}) {
  if (p <= 0) return; const q = E.out(p);
  ctx.save(); ctx.strokeStyle = o.color || PAL.red2; ctx.lineWidth = o.lw || 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + (o.bow ?? 6), lerp(x0, x1, q), lerp(y0, y1, q)); ctx.stroke();
  ctx.restore();
}
function penArrow(ctx, x0, y0, x1, y1, p, o = {}) {
  penLine(ctx, x0, y0, x1, y1, p, { bow: o.bow ?? -40, ...o });
  if (p >= .95) { const a = Math.atan2(y1 - y0, x1 - x0); ctx.save(); ctx.strokeStyle = o.color || PAL.red2; ctx.lineWidth = o.lw || 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1 - 34 * Math.cos(a - .5), y1 - 34 * Math.sin(a - .5)); ctx.lineTo(x1, y1); ctx.lineTo(x1 - 34 * Math.cos(a + .5), y1 - 34 * Math.sin(a + .5)); ctx.stroke(); ctx.restore(); }
}
// handwritten note revealed by a left-to-right clip
function hand(ctx, s, x, y, p, o = {}) {
  ctx.save(); ctx.font = `${o.weight || 600} ${o.size || 64}px ${F.hand}`; const w = ctx.measureText(s).width;
  ctx.translate(x, y); ctx.rotate(o.rot ?? -.03);
  ctx.beginPath(); ctx.rect(-10, -(o.size || 64), (w + 20) * clamp(p), (o.size || 64) * 1.6); ctx.clip();
  ctx.fillStyle = o.color || PAL.red2; ctx.fillText(s, 0, 0); ctx.restore();
}
function stamp(ctx, s, cx, cy, t, t0, o = {}) {
  if (t < t0) return; const p = prog(t, t0, t0 + .18); const sc = lerp(1.6, 1, E.out(p));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot ?? -.12); ctx.scale(sc, sc); ctx.globalAlpha = .85 * p;
  ctx.font = `${o.size || 120}px ${F.bebas}`; ctx.letterSpacing = '8px'; const w = ctx.measureText(s).width;
  ctx.strokeStyle = o.color || PAL.red; ctx.lineWidth = 9; ctx.strokeRect(-w / 2 - 30, -(o.size || 120) * .62, w + 60, (o.size || 120) * 1.16);
  ctx.fillStyle = o.color || PAL.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 4);
  ctx.restore();
}

// ---------- labels / chrome
function lowerTag(ctx, s, sub, t, t0, o = {}) {
  const p = E.out(prog(t, t0, t0 + .35)); if (p <= 0) return;
  const x = o.x ?? 90, y = o.y ?? H - 120;
  ctx.save(); ctx.globalAlpha = p;
  ctx.fillStyle = PAL.red; ctx.fillRect(x, y - 52, 10 + 520 * p, 6);
  text(ctx, s, x, y, { font: F.bebas, size: 64, color: o.color || PAL.cream, ls: 3 });
  if (sub) text(ctx, sub, x, y + 42, { font: F.mono, size: 28, color: o.subColor || 'rgba(244,236,220,.8)' });
  ctx.restore();
}
function sourceTag(ctx, s, o = {}) { // small credit/authenticity label, bottom-right
  ctx.save(); ctx.font = `22px ${F.mono}`; const w = ctx.measureText(s).width;
  const x = W - w - 46, y = H - 40; ctx.fillStyle = 'rgba(10,9,8,.55)'; ctx.fillRect(x - 14, y - 26, w + 28, 36);
  ctx.fillStyle = o.color || 'rgba(244,236,220,.85)'; ctx.fillText(s, x, y); ctx.restore();
}

// ---------- transitions (return true while active)
function flash(ctx, t, t0, d = .12, color = '#fff') { const p = prog(t, t0, t0 + d); if (p > 0 && p < 1) { ctx.save(); ctx.globalAlpha = 1 - p; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
function fadeIn(ctx, t, t0, d = .4, color = '#000') { const p = prog(t, t0, t0 + d); if (p < 1) { ctx.save(); ctx.globalAlpha = 1 - E.inOut(p); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
function fadeOut(ctx, t, t1, d = .4, color = '#000') { const p = prog(t, t1 - d, t1); if (p > 0) { ctx.save(); ctx.globalAlpha = E.inOut(p); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
// jagged paper-tear mask: draws `drawB` revealed along a torn vertical edge sweeping across
function tearPath(ctx, xEdge, seed = 5) {
  const r = rng(seed); ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(xEdge, -50);
  for (let y = 0; y <= H + 50; y += 26) ctx.lineTo(xEdge + (r() - .5) * 60 + Math.sin(y * .01) * 30, y);
  ctx.lineTo(-50, H + 50); ctx.closePath();
}

// ---------- shots runtime
let SHOTS = [];
function shot(from, draw, o = {}) { SHOTS.push({ from, draw, ...o }); }
function buildShots() {
  SHOTS.forEach(s => s.start = (typeof s.from === 'number' ? s.from : wt(...s.from)) - (s.lead ?? .1));
  SHOTS.sort((a, b) => a.start - b.start); SHOTS[0].start = 0;
  SHOTS.forEach((s, i) => { s.end = i + 1 < SHOTS.length ? SHOTS[i + 1].start : TL.duration; s.dur = s.end - s.start; });
}
function renderAt(ctx, t) {
  const i = SHOTS.findIndex(s => t >= s.start && t < s.end); const sh = SHOTS[i < 0 ? SHOTS.length - 1 : i];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); sh.draw(ctx, t, t - sh.start, sh); ctx.restore();
  if (typeof EP !== 'undefined' && EP.captions) captions(ctx, t);
  // camera shake on demand handled inside shots; global finish
  grain(ctx, t, .07); vignette(ctx, .5);
  // gentle flicker
  ctx.save(); ctx.globalAlpha = .025 + .02 * hash(Math.floor(t * 12)); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ---------- maps (Natural Earth geometry in GEO_* globals; equirectangular, lat-corrected)
// view: {lon, lat, k (px per degree of latitude), theme: 'paper'|'night'}
function geoProj(v) { const c = Math.cos(v.lat * Math.PI / 180); return (lon, lat) => [W / 2 + (lon - v.lon) * v.k * c, H / 2 - (lat - v.lat) * v.k]; }
function geoPath(ctx, pts, pr, close) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = pr(p[0], p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (close) ctx.closePath(); }
const MAPTHEME = {
  paper: { water: '#9FA9A6', land: '#E6DAC0', state: 'rgba(40,34,28,.55)', river: '#5E7E8C', label: 'rgba(40,34,28,.55)', grid: 'rgba(40,34,28,.12)', coast: 'rgba(40,34,28,.55)' },
  night: { water: '#0A0F18', land: '#1C222B', state: 'rgba(200,190,170,.35)', river: '#3D5B70', label: 'rgba(220,210,190,.45)', grid: 'rgba(200,190,170,.06)', coast: 'rgba(200,190,170,.35)' },
};
function drawGeo(ctx, G, v, labels = []) {
  const th = MAPTHEME[v.theme || 'paper'], pr = geoProj(v);
  ctx.save(); ctx.fillStyle = th.water; ctx.fillRect(0, 0, W, H);
  // water texture
  if (v.theme !== 'night') { ctx.globalAlpha = .35; ctx.drawImage(paperTex('#8E9A98', 31), 0, 0); ctx.globalAlpha = 1; }
  ctx.fillStyle = th.land; G.land.forEach(r => { geoPath(ctx, r, pr, true); ctx.fill(); });
  if (v.theme !== 'night') { ctx.save(); G.land.forEach(r => geoPath(ctx, r, pr, true)); ctx.beginPath(); G.land.forEach(r => { r.forEach((p, i) => { const [x, y] = pr(p[0], p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); });
    ctx.clip(); ctx.globalAlpha = .55; ctx.drawImage(paperTex(PAL.paper, 33), 0, 0); ctx.restore(); }
  ctx.strokeStyle = th.coast; ctx.lineWidth = 2; G.land.forEach(r => { geoPath(ctx, r, pr, true); ctx.stroke(); });
  ctx.fillStyle = th.water; G.lakes.forEach(l => { geoPath(ctx, l.pts, pr, true); ctx.fill(); });
  ctx.strokeStyle = th.river; G.rivers.forEach(r => { ctx.lineWidth = r.name === 'Columbia' ? 4 : 2; geoPath(ctx, r.pts, pr); ctx.stroke(); });
  ctx.strokeStyle = th.state; ctx.lineWidth = 2.5; ctx.setLineDash([14, 8]); G.lines.forEach(r => { geoPath(ctx, r, pr); ctx.stroke(); }); ctx.setLineDash([]);
  // graticule
  ctx.strokeStyle = th.grid; ctx.lineWidth = 1.5;
  for (let lo = -130; lo <= -110; lo++) { const [x0, y0] = pr(lo, 30), [x1, y1] = pr(lo, 55); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  for (let la = 30; la <= 55; la++) { const [x0, y0] = pr(-135, la), [x1, y1] = pr(-105, la); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  labels.forEach(([s, lon, lat, o = {}]) => { const [x, y] = pr(lon, lat);
    text(ctx, s, x, y, { font: o.font || F.osw, size: o.size || 34, color: o.color || th.label, align: 'center', weight: 500, ls: o.ls ?? 12 }); });
  ctx.restore(); return pr;
}


// =====================================================================
// v2 motion-graphics kit
// =====================================================================
// light leak: warm blobs drifting, screen blend
function lightLeak(ctx, t, amt = .5, seed = 1, hue = 'warm') {
  const cols = hue === 'cool' ? ['80,140,255', '40,200,220'] : ['255,120,40', '255,60,40'];
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 2; i++) {
    const ph = t * (.11 + i * .07) + seed * 3.1 + i * 2;
    const x = W * (.5 + .55 * Math.sin(ph)), y = H * (.5 + .45 * Math.cos(ph * 1.3)), r = Math.max(W, H) * (.45 + .1 * Math.sin(ph * 2));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${cols[i]},${amt * (.55 + .45 * Math.sin(ph * 3))})`); g.addColorStop(1, `rgba(${cols[i]},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
// film burn transition peak at t0
function filmBurn(ctx, t, t0, d = .5) {
  const p = prog(t, t0 - d / 2, t0 + d / 2); if (p <= 0 || p >= 1) return;
  const a = Math.sin(p * Math.PI);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(W * .8, H * .3, 0, W * .8, H * .3, W * 1.1 * a + 10);
  g.addColorStop(0, `rgba(255,240,200,${a})`); g.addColorStop(.35, `rgba(255,130,40,${a * .9})`); g.addColorStop(1, 'rgba(120,20,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// dust specks
function dust(ctx, t, n = 60, alpha = .5) {
  ctx.save(); ctx.fillStyle = '#fff';
  for (let i = 0; i < n; i++) {
    const x = (hash(i) * W + t * (8 + hash(i + 9) * 25)) % W, y = (hash(i + 3) * H + Math.sin(t * .7 + i) * 20 + t * (hash(i + 5) * 12)) % H;
    ctx.globalAlpha = alpha * (.3 + .7 * hash(i + 7)) * (.5 + .5 * Math.sin(t * 2 + i));
    ctx.beginPath(); ctx.arc(x, y, .8 + 2.2 * hash(i + 11), 0, 7); ctx.fill();
  }
  ctx.restore();
}
// rain streaks
function rain(ctx, t, amt = 1, angle = .18) {
  ctx.save(); ctx.strokeStyle = 'rgba(190,210,230,.35)'; ctx.lineWidth = 1.6;
  const n = Math.floor(260 * amt);
  for (let i = 0; i < n; i++) {
    const sp = 1400 + hash(i) * 900, len = 30 + hash(i + 1) * 50;
    const y = ((hash(i + 2) * (H + 200) + t * sp) % (H + 200)) - 100, x = (hash(i + 3) * (W + 300) - 150) + y * angle;
    ctx.globalAlpha = .3 + .7 * hash(i + 4); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * angle, y + len); ctx.stroke();
  }
  ctx.restore();
}
function lightning(ctx, t, times) {
  for (const t0 of times) { const d = t - t0; if (d < 0 || d > .45) continue;
    const a = (d < .06 ? 1 : d < .12 ? .25 : d < .18 ? .8 : Math.max(0, .5 - d)) ;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(200,215,255,${a * .55})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
// horizontal slice glitch + RGB offset (cheap)
function glitch(ctx, t, amt = 1, seed = 0) {
  if (amt <= 0) return; const c = ctx.canvas, f = Math.floor(t * 30) + seed;
  ctx.save();
  for (let i = 0; i < 7; i++) { if (hash(f * 13 + i) > .55 * amt + .2) continue;
    const y = hash(f * 7 + i) * H, h = 8 + hash(f * 3 + i) * 70 * amt, dx = (hash(f * 5 + i) - .5) * 140 * amt;
    ctx.drawImage(c, 0, y, W, h, dx, y, W, h); }
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .35 * amt;
  ctx.filter = 'hue-rotate(-60deg)'; ctx.drawImage(c, 8 * amt, 0); ctx.filter = 'hue-rotate(120deg)'; ctx.drawImage(c, -8 * amt, 0);
  ctx.restore();
}
function halftone(ctx, alpha = .25, size = 7) {
  const pat = offscreen('ht' + size, size * 2, size * 2, (g) => { g.fillStyle = '#000'; g.beginPath(); g.arc(size / 2, size / 2, size * .32, 0, 7); g.arc(size * 1.5, size * 1.5, size * .32, 0, 7); g.fill(); });
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(pat, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function scanlines(ctx, alpha = .12) {
  const pat = offscreen('scan', 4, 4, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 4, 2); });
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = ctx.createPattern(pat, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
// gradient backgrounds
function bgGrad(ctx, a, b, angle = 'v') {
  const g = angle === 'r' ? ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .75) : ctx.createLinearGradient(0, 0, angle === 'h' ? W : 0, angle === 'h' ? 0 : H);
  g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function gridBG(ctx, t, base = '#0A1F3A', line = 'rgba(140,190,255,.14)', step = 60, drift = 6) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
  const o = (t * drift) % step;
  ctx.save(); ctx.strokeStyle = line; ctx.lineWidth = 1;
  for (let x = -step + o; x < W + step; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = -step + o; y < H + step; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.strokeStyle = line.replace(/[\d.]+\)$/, '.32)'); ctx.lineWidth = 1.5;
  for (let x = -step * 5 + o; x < W + step * 5; x += step * 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = -step * 5 + o; y < H + step * 5; y += step * 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .2, W / 2, H / 2, Math.max(W, H) * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
// corner brackets (HUD)
function brackets(ctx, x, y, w, h, p = 1, color = PAL.red2, len = 40, lw = 5) {
  if (p <= 0) return; const L = len * E.out(clamp(p));
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'square';
  [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(cx + sx * L, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * L); ctx.stroke(); });
  ctx.restore();
}
function scanBeam(ctx, x, y, w, h, p, color = 'rgba(255,70,60,') {
  if (p <= 0 || p >= 1) return; const yy = y + h * p;
  ctx.save(); const g = ctx.createLinearGradient(0, yy - 60, 0, yy + 4); g.addColorStop(0, color + '0)'); g.addColorStop(1, color + '.45)');
  ctx.fillStyle = g; ctx.fillRect(x, yy - 60, w, 64); ctx.fillStyle = color + '.95)'; ctx.fillRect(x, yy, w, 3); ctx.restore();
}
// labelled data row that types in
function dataRow(ctx, label, value, x, y, t, t0, o = {}) {
  if (t < t0) return; const p = prog(t, t0, t0 + .25);
  ctx.save(); ctx.globalAlpha = p;
  text(ctx, label, x, y, { font: F.mono, size: o.ls || 26, color: o.labelColor || 'rgba(160,190,220,.8)' });
  const n = Math.floor(clamp((t - t0 - .1) * 40, 0, value.length));
  text(ctx, value.slice(0, n), x, y + (o.gap || 46), { font: F.osw, size: o.size || 44, color: o.color || PAL.cream, weight: 600 });
  ctx.restore();
}
// "3D" tilt for a drawn block: rotateY approximation (scaleX by cos + skewY)
function tilt3d(ctx, cx, cy, ry, rx = 0) {
  ctx.translate(cx, cy); ctx.transform(Math.cos(ry), Math.sin(ry) * .18, -Math.sin(rx) * .18, Math.cos(rx), 0, 0); ctx.translate(-cx, -cy);
}
// yellow highlighter sweep over a rect
function highlighter(ctx, x, y, w, h, p) {
  if (p <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,214,0,.75)';
  ctx.fillRect(x, y, w * E.out(clamp(p)), h); ctx.restore();
}
function redact(ctx, x, y, w, h, p) { if (p <= 0) return; ctx.fillStyle = '#0B0B0B'; ctx.fillRect(x, y, w * E.out(clamp(p)), h); }
// pinned photo on a board with a push pin; returns pin position
function pinned(ctx, key, cx, cy, maxW, maxH, rot, p, o = {}) {
  if (p <= 0) return [cx, cy]; const sc = lerp(1.25, 1, E.out(clamp(p)));
  ctx.save(); ctx.globalAlpha = clamp(p * 3);
  card(ctx, key, { cx, cy, maxW, maxH, rot, scale: sc, mount: 12, filter: o.filter || GRADES[o.grade || 'sepia'] });
  ctx.restore();
  const px = cx + Math.sin(rot) * 0, py = cy - (maxH / 2) * sc + 4;
  ctx.save(); ctx.fillStyle = '#C0392B'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(px, py, 11, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(px - 3, py - 3, 3.5, 0, 7); ctx.fill(); ctx.restore();
  if (o.label) text(ctx, o.label, cx, cy + maxH / 2 * sc + 50, { font: F.osw, size: 30, color: PAL.cream, align: 'center', weight: 600, ls: 3, alpha: clamp(p * 2 - .5) });
  return [px, py];
}
function redString(ctx, a, b, p, sag = 60) {
  if (p <= 0) return; const q = E.inOut(clamp(p));
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag; ctx.save(); ctx.strokeStyle = '#C62828'; ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]);
  for (let i = 1; i <= 40 * q; i++) { const u = i / 40; ctx.lineTo((1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]); }
  ctx.stroke(); ctx.restore();
}
// falling bills (sprite cut from an image region) with 3D flutter
function moneyRain(ctx, t, t0, key, crop, n = 40, o = {}) {
  const im = IMG[key]; if (!im || t < t0) return; const [sx, sy, sw, sh] = crop;
  for (let i = 0; i < n; i++) {
    const st = t0 + hash(i * 3) * (o.spread ?? 1.4); if (t < st) continue; const lt = t - st;
    const depth = .45 + hash(i * 7) * .75, wB = (o.size ?? 300) * depth, hB = wB * sh / sw;
    const x = hash(i * 11) * (W + 200) - 100 + Math.sin(lt * 1.7 + i) * 60 * depth, y = -200 + lt * (260 + 240 * depth);
    if (y > H + 200) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(lt * 1.3 + i) * .9 + i); ctx.scale(1, Math.cos(lt * (2 + hash(i) * 3) + i));
    ctx.globalAlpha = o.alpha ?? 1; ctx.filter = depth < .7 ? `blur(${(0.7 - depth) * 6}px) brightness(.8)` : (o.filter || 'none');
    ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 14 * depth; ctx.drawImage(im, sx, sy, sw, sh, -wB / 2, -hB / 2, wB, hB); ctx.restore();
  }
}
// big rolling counter
function counter(ctx, val, x, y, o = {}) {
  text(ctx, (o.prefix || '') + Math.round(val).toLocaleString('en-US') + (o.suffix || ''), x, y, { font: F.bebas, size: o.size || 260, color: o.color || PAL.cream, align: o.align || 'left', shadow: o.shadow, base: o.base });
}
// glow text
function glowText(ctx, s, x, y, o = {}) {
  ctx.save(); ctx.shadowColor = o.glow || 'rgba(255,80,60,.9)'; ctx.shadowBlur = o.blur || 40;
  text(ctx, s, x, y, o); ctx.restore(); text(ctx, s, x, y, o);
}
// horizontal timeline with year ticks
function timelineBar(ctx, y, years, from, to, t, t0, o = {}) {
  const x0 = o.x0 ?? 160, x1 = o.x1 ?? W - 160, p = E.out(prog(t, t0, t0 + .6));
  ctx.save(); ctx.strokeStyle = o.color || 'rgba(244,236,220,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, p), y); ctx.stroke();
  years.forEach(([yr, label, ty], i) => { const x = lerp(x0, x1, (yr - from) / (to - from)); if (t < (ty ?? t0 + .2 + i * .15)) return;
    const q = E.back(prog(t, ty ?? t0 + .2 + i * .15, (ty ?? t0 + .2 + i * .15) + .3));
    ctx.fillStyle = o.dot || PAL.red2; ctx.beginPath(); ctx.arc(x, y, 12 * Math.max(0, q), 0, 7); ctx.fill();
    text(ctx, o.fmt ? o.fmt(yr) : String(yr), x, y - 34, { font: F.bebas, size: 54, color: PAL.cream, align: 'center', alpha: q });
    if (label) text(ctx, label, x, y + 56, { font: F.osw, size: 26, color: 'rgba(244,236,220,.75)', align: 'center', weight: 500, alpha: q }); });
  ctx.restore();
}
// whip-pan blur transition between two draw fns (dir 1 = left)
function whip(ctx, t, t0, d, drawA, drawB) {
  const p = prog(t, t0, t0 + d);
  if (p <= 0) { drawA(); return; } if (p >= 1) { drawB(); return; }
  ctx.save(); const off = E.inOut(p) * W;
  ctx.translate(-off, 0); drawA(); ctx.translate(W, 0); drawB(); ctx.restore();
  ctx.save(); ctx.globalAlpha = .5 * Math.sin(p * Math.PI); ctx.filter = 'blur(18px)'; ctx.drawImage(ctx.canvas, 0, 0); ctx.restore();
}

// word-by-word captions (Shorts): groups of up to 3 words, current word highlighted
let _CAP = null;
function captionGroups() {
  if (_CAP) return _CAP; _CAP = [];
  TL.lines.forEach(l => { for (let i = 0; i < l.words.length; i += 3) { const g = l.words.slice(i, i + 3); _CAP.push({ s: g[0].s, e: i + 3 < l.words.length ? l.words[i + 3].s : l.end + .25, words: g }); } });
  return _CAP;
}
function captions(ctx, t) {
  const g = captionGroups().find(c => t >= c.s && t < c.e); if (!g) return;
  const y = EP.captionY || H * .72, size = EP.captionSize || 92;
  ctx.save(); ctx.font = `${size}px ${F.bebas}`; ctx.letterSpacing = '2px';
  const parts = g.words.map(w => w.w.toUpperCase()); const sp = size * .28;
  const widths = parts.map(s => ctx.measureText(s).width); const total = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = W / 2 - total / 2; const pop = E.back(prog(t, g.s, g.s + .12));
  ctx.translate(W / 2, y); ctx.scale(lerp(.85, 1, pop), lerp(.85, 1, pop)); ctx.translate(-W / 2, -y);
  parts.forEach((s, i) => { const w = g.words[i], on = t >= w.s;
    ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y);
    ctx.fillStyle = on && t < (g.words[i + 1]?.s ?? g.e) ? '#FFD23F' : (on ? '#FFFFFF' : 'rgba(255,255,255,.55)'); ctx.fillText(s, x, y); x += widths[i] + sp; });
  ctx.restore();
}

// ---------- Victorian atmosphere: drifting fog, gaslight glow
function fog(ctx, t, amt = .5, tint = '210,200,180') {
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 7; i++) {
    const sp = 18 + hash(i) * 30, r = Math.max(W, H) * (.35 + hash(i + 4) * .35);
    const x = ((hash(i + 1) * W + t * sp) % (W + 2 * r)) - r, y = H * (.25 + hash(i + 2) * .7) + Math.sin(t * .2 + i) * 40;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${tint},${amt * .22})`); g.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  ctx.restore();
}
function gasGlow(ctx, x, y, t, r = 260, a = .55) {
  const fl = .9 + .1 * Math.sin(t * 13 + x) * Math.sin(t * 7.3 + y);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * fl); g.addColorStop(0, `rgba(255,200,120,${a * fl})`); g.addColorStop(.25, `rgba(255,160,70,${a * .45 * fl})`); g.addColorStop(1, 'rgba(255,140,50,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r * 1.1, y - r * 1.1, r * 2.2, r * 2.2); ctx.restore();
}
// streets from OSM-derived data: G = {ways: [[lon,lat],...], rail: [...]} ; theme night|paper
function drawStreets(ctx, G, v, o = {}) {
  const pr = geoProj(v), night = (v.theme || 'night') === 'night';
  ctx.save(); ctx.fillStyle = night ? '#0B0D12' : '#E6DAC0'; ctx.fillRect(0, 0, W, H);
  if (!night) { ctx.globalAlpha = .6; ctx.drawImage(paperTex(PAL.paper, 61), 0, 0); ctx.globalAlpha = 1; }
  const prog_ = o.reveal ?? 1;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  (G.rail || []).forEach(w => { ctx.strokeStyle = night ? 'rgba(120,120,140,.35)' : 'rgba(60,50,40,.35)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); geoPath(ctx, w, pr); ctx.stroke(); });
  ctx.setLineDash([]);
  G.ways.forEach((w, i) => { if (hash(i * 1.37) > prog_) return; const major = w.length > 2 && w.r < 3;
    ctx.strokeStyle = night ? (major ? 'rgba(255,190,120,.55)' : 'rgba(210,190,160,.3)') : (major ? 'rgba(40,32,24,.75)' : 'rgba(40,32,24,.4)');
    ctx.lineWidth = (major ? 6 : 2.6) * Math.sqrt(v.k / 50000); geoPath(ctx, w.p || w, pr); ctx.stroke(); });
  ctx.restore(); return pr;
}
