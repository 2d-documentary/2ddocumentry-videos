// paint.js — shared painting toolkit for backgrounds (ink, blobs with one outer line, skies, foliage, grading)
'use strict';
const BG_INK = '#1C1614';
const POOL = [];
function tmpCanvas(w = 1920, h = 1080) { let c = POOL.pop(); if (!c) c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function freeCanvas(c) { POOL.push(c); }

// ---------- full-frame paper/brush texture (no tiling seams) ----------
let PAPER = null;
function paperTexture() {
  if (PAPER) return PAPER; const c = document.createElement('canvas'); c.width = 2048; c.height = 1280; const g = c.getContext('2d'); const r = rng(77);
  g.fillStyle = '#808080'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 900; i++) { const x = r() * 2048, y = r() * 1280, rad = 10 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, rad); const v = r() > .5 ? 175 : 85; gr.addColorStop(0, `rgba(${v},${v},${v},${.12 + r() * .12})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  // dry-brush streaks
  g.globalAlpha = .06; for (let i = 0; i < 500; i++) { g.strokeStyle = r() > .5 ? '#fff' : '#000'; g.lineWidth = 1 + r() * 3; const x = r() * 2048, y = r() * 1280, a = (r() - .5) * .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (30 + r() * 120), y + Math.sin(a) * (30 + r() * 120)); g.stroke(); }
  g.globalAlpha = 1; const id = g.getImageData(0, 0, 2048, 1280); for (let i = 0; i < id.data.length; i += 4) { const n = (r() - .5) * 26; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; } g.putImageData(id, 0, 0);
  PAPER = c; return c;
}
function brushTexture(ctx, alpha = .22) { ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(paperTexture(), -40, -40); ctx.restore(); }
function warmGrade(ctx, k = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,214,150,${.22 * k})`; ctx.fillRect(0, 0, 1920, 1080);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(250,238,215,${.35 * k})`; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
}

// ---------- ink lines: slightly wobbly, tapered ribbons ----------
function inkLine(ctx, pts, w = 3, o = {}) {
  const r = rng(o.seed || (pts.length * 31 + Math.round(pts[0][0]))); const P = [];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const n = Math.max(1, Math.round(L / 14)); for (let k = 0; k < n; k++) { const u = k / n; P.push([a[0] + (b[0] - a[0]) * u + (r() - .5) * (o.wob ?? .9), a[1] + (b[1] - a[1]) * u + (r() - .5) * (o.wob ?? .9)]); } }
  if (o.closed) P.push([...P[0]]); else P.push(pts[pts.length - 1]);
  const n = P.length; if (n < 2) return; const L = [], R = []; const total = n - 1;
  for (let i = 0; i < n; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const e = o.closed ? 1 : Math.min(1, Math.min(i, total - i) / Math.min(6, total / 2)); const ww = w * (.4 + .6 * e) * (.85 + .3 * r()) / 2; L.push([P[i][0] - dy * ww, P[i][1] + dx * ww]); R.push([P[i][0] + dy * ww, P[i][1] - dx * ww]); }
  ctx.beginPath(); L.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); ctx.fillStyle = o.col || BG_INK; ctx.fill();
}

// ---------- blob layer: any union of shapes, filled, shaded, with ONE outer ink line ----------
// shapeFn(g) must add sub-paths to g (no beginPath needed). shadeFn(g) paints shading (called with source-atop).
function blob(ctx, shapeFn, fill, o = {}) {
  const M = ctx.getTransform(); const c = tmpCanvas(), g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080); g.setTransform(M);
  g.fillStyle = fill; g.beginPath(); let started = false;
  const P = new Proxy(g, { get(t, k) { if (k === 'moveTo') return (x, y) => { if (started) { t.fill(); t.beginPath(); } started = true; t.moveTo(x, y); }; const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; }, set(t, k, v) { t[k] = v; return true; } });
  shapeFn(P); g.fill();
  if (o.shade) { g.save(); g.globalCompositeOperation = 'source-atop'; o.shade(g); g.restore(); }
  g.setTransform(1, 0, 0, 1, 0, 0); const lwScale = Math.sqrt(Math.abs(M.a * M.d - M.b * M.c)) || 1;
  const lw = (o.lw ?? 3) * lwScale;
  if (lw > 0) { const c2 = tmpCanvas(), g2 = c2.getContext('2d'); g2.clearRect(0, 0, 1920, 1080); g2.drawImage(c, 0, 0); g2.globalCompositeOperation = 'source-in'; g2.fillStyle = o.ink || BG_INK; g2.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (o.alpha != null) ctx.globalAlpha = o.alpha; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ctx.drawImage(c2, Math.cos(a) * lw * .6, Math.sin(a) * lw * .6); } ctx.restore(); freeCanvas(c2); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (o.alpha != null) ctx.globalAlpha = o.alpha; ctx.drawImage(c, 0, 0); ctx.restore(); freeCanvas(c);
}

// ---------- skies ----------
function skyGradient(ctx, horizon, top = '#8DB9D6', mid = '#C9DFE2', bot = '#F3E6C8') {
  const g = ctx.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, top); g.addColorStop(.6, mid); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, horizon + 4); const hz = ctx.createLinearGradient(0, horizon - 140, 0, horizon + 4); hz.addColorStop(0, 'rgba(250,228,190,0)'); hz.addColorStop(1, 'rgba(250,228,190,.45)'); ctx.fillStyle = hz; ctx.fillRect(0, horizon - 140, 1920, 144);
}
function cloudLobes(cx, cy, s, seed) { const r = rng(seed); const lobes = []; const n = 4 + Math.floor(r() * 3), wide = 1.2 + r() * .7, tall = .3 + r() * .3;
  for (let i = 0; i < n; i++) { const u = n === 1 ? .5 : i / (n - 1); lobes.push([cx + (u - .5) * s * wide, cy - Math.pow(Math.sin((.15 + u * .7) * Math.PI), .8) * s * tall * (.7 + r() * .6), s * (.34 + Math.sin((.15 + u * .7) * Math.PI) * (.24 + r() * .22))]); }
  if (r() > .4) lobes.push([cx + (r() - .5) * s * .6, cy - s * (tall + .2), s * (.32 + r() * .15)]);
  const bw = s * wide * .5 + s * .25, bh = s * (.2 + r() * .08); return { lobes, bw, bh }; }
function cloudShape(cx, cy, s, seed) { const { lobes, bw, bh } = cloudLobes(cx, cy, s, seed); return g => { for (const [x, y, rr] of lobes) { g.moveTo(x + rr, y); g.arc(x, y, rr, 0, Math.PI * 2); } g.moveTo(cx + bw, cy); g.ellipse(cx, cy, bw, bh, 0, 0, Math.PI * 2); }; }
function clouds(ctx, list, tint = '#FFFBF2', shadow = '#EFE6DC') {
  for (const [cx, cy, s, seed, type] of list) {
    const r = rng(seed);
    if (type === 'streak') { ctx.save(); for (let i = 0; i < 3; i++) { const x = cx + (r() - .5) * s * 1.2, y = cy + (i - 1) * s * .09 + (r() - .5) * s * .05, w = s * (1 + r() * 1.1), h = s * (.035 + r() * .03); ctx.globalAlpha = .38 + r() * .2; ctx.fillStyle = i === 1 ? tint : mix(tint, shadow, .4);
        ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * .3, y - h * 2.2, x + w * .2, y - h); ctx.quadraticCurveTo(x + w * .7, y - h * .4, x + w, y + h * .2); ctx.quadraticCurveTo(x + w * .2, y + h * 1.4, x - w * .4, y + h); ctx.quadraticCurveTo(x - w * .8, y + h * .6, x - w, y); ctx.fill(); } ctx.restore(); continue; }
    const { lobes, bw, bh } = cloudLobes(cx, cy, s, seed);
    blob(ctx, cloudShape(cx, cy, s, seed), tint, { lw: 0, alpha: .95, shade: g => {
      g.fillStyle = shadow; g.beginPath(); g.ellipse(cx + bw * .05, cy + bh * .5, bw * 1.05, bh * 1.2, 0, 0, 7); g.fill();               // underside
      for (const [x, y, rr] of lobes) { g.beginPath(); g.arc(x + rr * .22, y + rr * .5, rr * .92, 0, 7); g.fill(); }                    // each lobe's own shaded belly
      g.fillStyle = tint; for (const [x, y, rr] of lobes) { g.beginPath(); g.arc(x - rr * .12, y - rr * .12, rr * .82, 0, 7); g.fill(); } // lit tops cut the shadow into lobe-shaped crescents
     } });
  }
}
// ---------- terrain layers with atmospheric fade ----------
function ridge(ctx, y, amp, col, seed, o = {}) {
  const r = rng(seed); const pts = [[-50, 1100], [-50, y]]; let x = -50; while (x < 1980) { x += 40 + r() * 90; pts.push([x, y - amp * (.3 + .7 * Math.abs(Math.sin(x * .004 + seed))) * (.7 + r() * .3)]); } pts.push([1980, 1100]);
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  if (o.cliffs) { ctx.save(); ctx.clip(); // limestone strata + gullies, lit from the left
    for (let k = 0; k < 7; k++) { ctx.strokeStyle = `rgba(80,50,40,${.12 + k * .02})`; ctx.lineWidth = 2 + k * .4; ctx.beginPath(); for (let x = -50; x < 1980; x += 30) { const yy = y - amp * .85 + k * amp * .16 + Math.sin(x * .01 + k) * 6; x === -50 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
    for (let i = 2; i < pts.length - 1; i++) { const [px, py] = pts[i]; const gx = px + (r() - .5) * 30; ctx.fillStyle = 'rgba(70,40,40,.18)'; ctx.beginPath(); ctx.moveTo(gx, py + 4); ctx.quadraticCurveTo(gx + 14, py + amp * .5, gx + 4, y + 10); ctx.lineTo(gx + 30, y + 10); ctx.quadraticCurveTo(gx + 26, py + amp * .4, gx + 6, py + 2); ctx.fill(); }
    ctx.restore(); }
  if (o.ink) inkLine(ctx, pts.slice(1, -1), o.ink, { col: o.inkCol || shade(col, .55) });
}
function sandGround(ctx, y0, base = '#DDBE86', seed = 3) {
  const g = ctx.createLinearGradient(0, y0, 0, 1080); g.addColorStop(0, shade(base, 1.04)); g.addColorStop(1, shade(base, .9)); ctx.fillStyle = g; ctx.fillRect(0, y0, 1920, 1080 - y0);
  const r = rng(seed); ctx.save(); ctx.globalAlpha = .5;
  for (let i = 0; i < 70; i++) { const y = y0 + Math.pow(r(), 1.4) * (1080 - y0), x = r() * 1920, k = (y - y0) / (1080 - y0), w = 40 + k * 260; ctx.strokeStyle = r() > .5 ? shade(base, 1.12) : shade(base, .84); ctx.lineWidth = 1 + k * 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y - 4 - k * 8, x + w, y); ctx.stroke(); }
  ctx.restore();
  for (let i = 0; i < 90; i++) { const y = y0 + Math.pow(r(), 1.2) * (1080 - y0), x = r() * 1920, k = (y - y0) / (1080 - y0), s = 2 + k * 10; ctx.fillStyle = shade(base, .7 + r() * .2); ctx.beginPath(); ctx.ellipse(x, y, s, s * .55, 0, 0, 7); ctx.fill(); if (s > 6) inkLine(ctx, [[x - s, y], [x - s * .4, y - s * .6], [x + s * .5, y - s * .5], [x + s, y]], 1.6, { col: shade(base, .45) }); }
}

// ---------- foliage ----------
function datePalm(ctx, x, y, h, seed = 1, o = {}) {
  const r = rng(seed); const lean = (o.lean ?? (r() - .5) * .25); const tx = x + Math.sin(lean) * h, ty = y - Math.cos(lean) * h;
  // trunk with diamond leaf-base pattern
  const tw = h * .045; const tp = t => [x + (tx - x) * t + Math.sin(t * 3 + seed) * h * .02, y + (ty - y) * t];
  ctx.save(); ctx.beginPath(); for (let i = 0; i <= 20; i++) { const [px, py] = tp(i / 20); const w = tw * (1 - i / 20 * .35); i ? ctx.lineTo(px - w, py) : ctx.moveTo(px - w, py); } for (let i = 20; i >= 0; i--) { const [px, py] = tp(i / 20); const w = tw * (1 - i / 20 * .35); ctx.lineTo(px + w, py); } ctx.closePath();
  const gr = ctx.createLinearGradient(x - tw, 0, x + tw, 0); gr.addColorStop(0, (o.trunk || ['#9A7A52'])[0]); gr.addColorStop(1, (o.trunk || [0, '#5E4630'])[1]); ctx.fillStyle = gr; ctx.fill(); ctx.clip();
  ctx.strokeStyle = 'rgba(50,34,20,.6)'; ctx.lineWidth = Math.max(1, h * .006); for (let i = 1; i < 26; i++) { const [px, py] = tp(i / 26); ctx.beginPath(); ctx.moveTo(px - tw, py + tw * .3); ctx.lineTo(px, py - tw * .2); ctx.lineTo(px + tw, py + tw * .3); ctx.stroke(); } ctx.restore();
  inkLine(ctx, Array.from({ length: 11 }, (_, i) => { const [px, py] = tp(i / 10); return [px - tw * (1 - i / 10 * .35), py]; }), Math.max(1.6, h * .008));
  inkLine(ctx, Array.from({ length: 11 }, (_, i) => { const [px, py] = tp(i / 10); return [px + tw * (1 - i / 10 * .35), py]; }), Math.max(2, h * .011));
  // fronds: curved rachis with tapered pointed leaflet blades on both sides; one outer ink line, darker underside blades
  const fronds = []; const n = 11 + Math.floor(r() * 7); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / (n - 1) - .5) * Math.PI * 1.6 + (r() - .5) * .18, len = h * (.44 + r() * .16), droop = .5 + r() * .4; fronds.push([a, len, droop]); }
  const fr = fronds.map(([a, len, droop]) => { const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .55 + len * droop * .6, cx = tx + Math.cos(a) * len * .55, cy = ty + Math.sin(a) * len * .55 - len * .16;
    const B = u => [(1 - u) * (1 - u) * tx + 2 * (1 - u) * u * cx + u * u * ex, (1 - u) * (1 - u) * ty + 2 * (1 - u) * u * cy + u * u * ey]; const blades = [];
    const m = 15; for (let k = 1; k <= m; k++) { const u = .1 + .88 * k / m, p = B(u), q = B(Math.min(1, u + .02)); let dx = q[0] - p[0], dy = q[1] - p[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      for (const sd of [-1, 1]) { const ang = Math.atan2(dy, dx) + sd * (.62 + r() * .15), Lb = len * (.2 - u * .1) * (.85 + r() * .3), bw = len * .022 * (1 - u * .5); const dirx = Math.cos(ang), diry = Math.sin(ang) * .9 + .35 * (1 - Math.abs(Math.sin(ang)));
        const nx = -diry, ny = dirx; const tip = [p[0] + dirx * Lb, p[1] + diry * Lb + Lb * .18 * u]; blades.push({ under: (ny * sd) < 0 !== (sd > 0), pts: [[p[0] + nx * bw, p[1] + ny * bw], [p[0] + dirx * Lb * .55 + nx * bw * .8, p[1] + diry * Lb * .55 + ny * bw * .8 + Lb * .05 * u], tip, [p[0] + dirx * Lb * .55 - nx * bw * .8, p[1] + diry * Lb * .55 - ny * bw * .8 + Lb * .05 * u], [p[0] - nx * bw, p[1] - ny * bw]] }); } }
    return { B, blades, len }; });
  const shape = g => { for (const f of fr) { const w = f.len * .018; for (let i = 0; i <= 12; i++) { const p = f.B(i / 12); i ? g.lineTo(p[0], p[1] - w) : g.moveTo(p[0], p[1] - w); } for (let i = 12; i >= 0; i--) { const p = f.B(i / 12); g.lineTo(p[0], p[1] + w); } for (const b of f.blades) { b.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); } } };
  const leaf = o.leaf || '#5F7F3A';
  blob(ctx, shape, leaf, { lw: Math.max(2, h * .008), ink: o.ink, shade: g => { g.fillStyle = shade(leaf, .74); for (const f of fr) for (const b of f.blades) if (b.under) { g.beginPath(); b.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.fill(); } g.fillStyle = shade(leaf, 1.16); for (const f of fr) for (const b of f.blades.slice(0, 6)) if (!b.under) { g.beginPath(); b.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.fill(); } } });
  for (const f of fr) inkLine(ctx, Array.from({ length: 9 }, (_, i) => f.B(i / 8 * .96)), Math.max(1.2, h * .005), { col: shade(leaf, .45) });
  // hanging date clusters: many small drooping ovals under the crown
  if (o.dates !== false && h > 60) for (const sd of [-1, 1, .3]) { const cx = tx + sd * h * .06, cy = ty + h * .05; inkLine(ctx, [[tx, ty], [cx, cy]], Math.max(1, h * .004), { col: '#8A5A2A' });
    for (let i = 0; i < 26; i++) { const a = r() * Math.PI, rr = r() * h * .045; const px = cx + Math.cos(a) * rr * .8, py = cy + Math.sin(a) * rr * 1.4; ctx.fillStyle = r() > .5 ? (o.dateCol || ['#9A5A34'])[0] : (o.dateCol || [0, '#7A4228'])[1]; ctx.beginPath(); ctx.ellipse(px, py, h * .008, h * .012, 0, 0, 7); ctx.fill(); } }
}
function reeds(ctx, x0, x1, y, h, seed = 2, col = '#6E8A3C') {
  const r = rng(seed); for (let x = x0; x < x1; x += 4 + r() * 8) { const hh = h * (.5 + r() * .6), a = (r() - .5) * .35; ctx.strokeStyle = shade(col, .8 + r() * .4); ctx.lineWidth = 2 + r() * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + a * hh * .5, y - hh * .6, x + a * hh, y - hh); ctx.stroke();
    if (r() < .25) { ctx.fillStyle = '#7A6A3A'; ctx.beginPath(); ctx.ellipse(x + a * hh, y - hh, 5, 9, a, 0, 7); ctx.fill(); }
    if (r() < .12) { // papyrus umbel
      ctx.strokeStyle = '#7E9C46'; ctx.lineWidth = 1.5; for (let k = -5; k <= 5; k++) { ctx.beginPath(); ctx.moveTo(x + a * hh, y - hh); ctx.lineTo(x + a * hh + k * 4, y - hh - 16 + Math.abs(k) * 1.5); ctx.stroke(); } } }
}
function bush(ctx, x, y, s, seed = 1, col = '#6C7A3A') { // jagged leaf-cluster mass: 3 values (light top, mid, dark under), a few inked inner cluster contours
  const r = rng(seed); const cl = []; const n = 7 + Math.floor(r() * 5);
  for (let i = 0; i < n; i++) { const a = Math.PI + (i + .5) / n * Math.PI, d = .45 + r() * .5; cl.push([x + Math.cos(a) * s * .85 * d, y - s * .15 + Math.sin(a) * s * .8 * d, s * (.26 + r() * .16), r() * 6]); }
  cl.push([x, y - s * .55, s * .38, r() * 6]);
  const jag = ([cx, cy, rr, ph], g, k = 1) => { const m = 13; for (let i = 0; i <= m; i++) { const a = i / m * Math.PI * 2 + ph, R = rr * k * (i % 2 ? .78 : 1.06 + ((i * 7 + seed) % 3) * .05); const q = [cx + Math.cos(a) * R, cy + Math.sin(a) * R * .85]; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } };
  blob(ctx, g => { for (const c of cl) jag(c, g); const m = 10; g.moveTo(x - s, y); for (let i = 0; i <= m; i++) g.lineTo(x - s + 2 * s * i / m, y - s * .12 * (i % 2 ? 1.3 : .8)); g.lineTo(x + s, y); }, col, { lw: 3, shade: g => {
    g.fillStyle = shade(col, .66); for (const [cx, cy, rr, ph] of cl) { g.beginPath(); jag([cx + rr * .25, cy + rr * .45, rr * .9, ph + .3], g); g.fill(); }
    g.fillStyle = col; for (const [cx, cy, rr, ph] of cl) { g.beginPath(); jag([cx - rr * .1, cy - rr * .15, rr * .72, ph], g); g.fill(); }
    g.fillStyle = shade(col, 1.2); for (const [cx, cy, rr, ph] of cl) if (cy < y - s * .35) { g.beginPath(); jag([cx - rr * .3, cy - rr * .35, rr * .38, ph + 1], g); g.fill(); } } });
  for (const [cx, cy, rr, ph] of cl.slice(0, 4)) { const P = []; for (let i = 3; i <= 8; i++) { const a = i / 13 * Math.PI * 2 + ph; P.push([cx - rr * .1 + Math.cos(a) * rr * .72, cy - rr * .15 + Math.sin(a) * rr * .72 * .85]); } inkLine(ctx, P, 1.6, { col: shade(col, .42) }); }
}
// figure-scale silhouettes for distant crowds
function tinyPerson(ctx, x, y, h, col = '#EDE3CF', seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(h / 100, h / 100);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-11, -55); ctx.quadraticCurveTo(0, -64, 11, -55); ctx.lineTo(14, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C9C6CC'; ctx.beginPath(); ctx.ellipse(0, -76, 13, 15, 0, 0, 7); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = BG_INK; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-11, -55); ctx.quadraticCurveTo(0, -64, 11, -55); ctx.lineTo(14, 0); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -76, 13, 15, 0, 0, 7); ctx.stroke();
  ctx.restore();
}
function vgrad(ctx, y0, y1, c0, c1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
