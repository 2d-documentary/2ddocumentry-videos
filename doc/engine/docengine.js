// docengine.js — INK AND ANTIQUITY archival documentary engine (canvas 2D, deterministic per frame)
// Archival photos + editorial motion graphics: Ken Burns, paper, typewriter, red-pen annotations, maps, counters.
'use strict';
const W = 1920, H = 1080;
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
function cue(t, type, gain = 1) { CUES.push({ t: +t.toFixed(3), type, gain }); }

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
function photo(ctx, key, o = {}) {
  const im = IMG[key]; if (!im) { placeholder(ctx, key, o); return; }
  const bx = o.x ?? 0, by = o.y ?? 0, bw = o.w ?? W, bh = o.h ?? H;
  const z = o.zoom ?? 1, fx = o.fx ?? .5, fy = o.fy ?? .5; // focus point in image (0..1)
  const s = Math.max(bw / im.width, bh / im.height) * z;
  const dw = im.width * s, dh = im.height * s;
  let dx = bx + bw / 2 - fx * dw, dy = by + bh / 2 - fy * dh;
  dx = clamp(dx, bx + bw - dw, bx); dy = clamp(dy, by + bh - dh, by);
  ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  ctx.filter = o.filter || 'grayscale(1) sepia(.35) contrast(1.12) brightness(.95)';
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.drawImage(im, dx, dy, dw, dh); ctx.restore();
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
