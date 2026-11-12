// stage3d.js — tiny 2-point-perspective renderer for real architecture
// World: x right, y away from camera, z up (metres). Verticals stay vertical (no pitch) → classic 2-point perspective.
'use strict';
class Stage {
  constructor(cam, light) {
    this.cam = Object.assign({ x: 0, y: -60, z: 1.7, yaw: 0, f: 1100, hy: 470, cx: 960 }, cam);
    const L = light || [-.55, .45, .7]; const n = Math.hypot(...L); this.L = L.map(v => v / n);   // direction TOWARD the sun
    this.faces = []; this.props = []; this.shadows = [];
  }
  toCam(p) { const c = this.cam, dx = p[0] - c.x, dy = p[1] - c.y, cs = Math.cos(c.yaw), sn = Math.sin(c.yaw); return [dx * cs - dy * sn, dx * sn + dy * cs, p[2] - c.z]; }
  P(p) { const q = this.toCam(p), d = Math.max(.05, q[1]); return [this.cam.cx + this.cam.f * q[0] / d, this.cam.hy - this.cam.f * q[2] / d, d]; }
  scaleAt(p) { return this.cam.f / Math.max(.05, this.toCam(p)[1]); }   // px per metre at p
  // ---- primitives ----
  face(pts, col, o = {}) { this.faces.push({ pts, col, o }); }
  quad(a, b, c, d, col, o) { this.face([a, b, c, d], col, o); }
  box(x, y, z, sx, sy, sz, col, o = {}) { // axis-aligned box, faces outward; o.tex applies to sides
    const A = [x, y, z], B = [x + sx, y, z], C = [x + sx, y + sy, z], D = [x, y + sy, z];
    const up = p => [p[0], p[1], p[2] + sz]; const t = o.top || col;
    this.quad(A, B, up(B), up(A), col, o); this.quad(B, C, up(C), up(B), col, o); this.quad(C, D, up(D), up(C), col, o); this.quad(D, A, up(A), up(D), col, o);
    this.quad(up(A), up(B), up(C), up(D), t, { ...o, tex: o.topTex || null, paint: o.topPaint || null, ...(o.floor ? { ground: true, layer: o.layer || 0, noInk: true } : {}) });
    if (o.shadow !== false) this.castShadow([A, B, C, D, up(A), up(B), up(C), up(D)]);
  }
  battered(x, y, z, sx, sy, sz, batter, col, o = {}) { // pylon/mastaba: walls lean inward by `batter` m on each side
    const b = batter; const bot = [[x, y, z], [x + sx, y, z], [x + sx, y + sy, z], [x, y + sy, z]], top = [[x + b, y + b * .3, z + sz], [x + sx - b, y + b * .3, z + sz], [x + sx - b, y + sy - b * .3, z + sz], [x + b, y + sy - b * .3, z + sz]];
    for (let i = 0; i < 4; i++) this.quad(bot[i], bot[(i + 1) % 4], top[(i + 1) % 4], top[i], col, o);
    this.quad(top[0], top[1], top[2], top[3], o.top || col, { ...o, tex: null });
    if (o.shadow !== false) this.castShadow([...bot, ...top]);
    return top;
  }
  pyramid(cx, cy, base, h, col, o = {}) {
    const s = base / 2, A = [cx - s, cy - s, 0], B = [cx + s, cy - s, 0], C = [cx + s, cy + s, 0], D = [cx - s, cy + s, 0], T = [cx, cy, h];
    for (const [p, q] of [[A, B], [B, C], [C, D], [D, A]]) this.face([p, q, T, T], col, { ...o, pyr: true, h });
    if (o.shadow !== false) this.castShadow([A, B, C, D, T]);
  }
  cylinder(cx, cy, z, r, h, col, o = {}) {
    const n = o.segs || 18; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2; const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r, z], p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, z]; const r2 = o.r2 ?? r; const q0 = [cx + Math.cos(a0) * r2, cy + Math.sin(a0) * r2, z + h], q1 = [cx + Math.cos(a1) * r2, cy + Math.sin(a1) * r2, z + h]; this.face([p0, p1, q1, q0], col, { ...o, cyl: true, noInk: true }); }
    if (o.cap !== false) { const cap = []; const r2 = o.r2 ?? r; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; cap.push([cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, z + h]); } this.face(cap, o.top || col, { noInk: true }); }
    this.props.push({ kind: 'cylInk', cx, cy, z, r, r2: o.r2 ?? r, h });
    if (o.shadow !== false) { const ring = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ring.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], [cx + Math.cos(a) * (o.r2 ?? r), cy + Math.sin(a) * (o.r2 ?? r), z + h]); } this.castShadow(ring); }
  }
  flat(pts, col, o = {}) { this.face(pts, col, { ...o, ground: true, noInk: o.noInk ?? true }); }
  sprite(at, fn) { this.props.push({ kind: 'sprite', at, fn }); }   // 2D drawing placed at a 3D point, depth-sorted
  castShadow(pts, o = {}) { const L = this.L, gz = this.gz || 0; const sh = pts.map(p => { const h = p[2] - gz; return [p[0] - L[0] * h / L[2], p[1] - L[1] * h / L[2], gz + .01]; }); sh.poly = !!o.poly; this.shadows.push(sh); }
  groundDetail(ctx, o = {}) {
    const r = rng(o.seed || 5), base = o.col || '#DCC08C', c = this.cam, n = o.count || 900;
    const pts = []; for (let i = 0; i < n; i++) { const d = 4 + Math.pow(r(), 1.6) * (o.far || 500), a = (r() - .5) * 1.5; const p = [c.x + Math.sin(c.yaw + a) * d, c.y + Math.cos(c.yaw + a) * d, 0]; const q = this.P(p); if (q[1] < this.cam.hy + 3 || q[0] < -80 || q[0] > 2000 || q[1] > 1090) continue; if (o.avoid && o.avoid(p)) continue; pts.push([q, this.scaleAt(p), r()]); }
    for (const [q, k, t] of pts) if (t < .7) { const w = (2 + t * 5) * k, h = .12 * k; ctx.strokeStyle = t > .35 ? shade(base, 1.12) : shade(base, .84); ctx.lineWidth = clamp(.05 * k, .7, 3); ctx.beginPath(); ctx.moveTo(q[0] - w / 2, q[1]); ctx.bezierCurveTo(q[0] - w / 4, q[1] - h, q[0], q[1] + h * .6, q[0] + w / 4, q[1] - h * .4); ctx.quadraticCurveTo(q[0] + w * .4, q[1] - h * .8, q[0] + w / 2, q[1]); ctx.stroke(); }
    for (const [q, k, t] of pts) { if (t >= .7 && t < .86) { const s = clamp((.04 + (t - .7) * .5) * k, 2, 9); ctx.fillStyle = shade(base, .66); ctx.beginPath(); ctx.ellipse(q[0], q[1] - s * .35, s, s * .6, 0, 0, 7); ctx.fill(); ctx.fillStyle = shade(base, 1.08); ctx.beginPath(); ctx.ellipse(q[0] - s * .25, q[1] - s * .55, s * .5, s * .28, 0, 0, 7); ctx.fill(); if (s > 4) inkLine(ctx, [[q[0] - s, q[1] - s * .35], [q[0] - s * .4, q[1] - s * .9], [q[0] + s * .5, q[1] - s * .85], [q[0] + s, q[1] - s * .35]], clamp(s * .16, 1, 2.2), { col: shade(base, .38) }); }
      else if (t >= .86 && o.tufts !== false) { const h = clamp((.25 + (t - .86) * 2) * k, 0, 40); if (h < 4) continue; ctx.strokeStyle = t > .93 ? '#8C8A4A' : '#9E9656'; ctx.lineWidth = clamp(.035 * k, .7, 2.2); for (let m = -3; m <= 3; m++) { ctx.beginPath(); ctx.moveTo(q[0] + m * h * .05, q[1]); ctx.quadraticCurveTo(q[0] + m * h * .12, q[1] - h * .6, q[0] + m * h * .25, q[1] - h); ctx.stroke(); } } }
  }
  dunes(ctx, list, base = '#E2C795') { // mid-ground rolling dune silhouettes with crisp shaded crests
    for (const [d, a0, a1, hgt] of list) { const pts = []; for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * i / 24; const p = [this.cam.x + Math.sin(this.cam.yaw + a) * d, this.cam.y + Math.cos(this.cam.yaw + a) * d, hgt * Math.pow(Math.sin(i / 24 * Math.PI), 1.3) * (.8 + .2 * Math.sin(i * 1.7))]; pts.push(this.P(p)); }
      const g = pts.map(q => [q[0], q[1]]); const by = Math.max(...g.map(q => q[1])) + 30; ctx.beginPath(); ctx.moveTo(g[0][0], by); g.forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(g[g.length - 1][0], by); ctx.closePath(); ctx.fillStyle = base; ctx.fill();
      ctx.save(); ctx.clip(); const crest = g.reduce((m, q) => q[1] < m[1] ? q : m, g[0]); ctx.fillStyle = shade(base, .84); ctx.beginPath(); ctx.moveTo(crest[0], crest[1]); g.filter(q => q[0] > crest[0]).forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(g[g.length - 1][0], by); ctx.lineTo(crest[0] + 40, by); ctx.closePath(); ctx.fill(); ctx.restore();
      inkLine(ctx, g, 2.2, { col: shade(base, .5) }); }
  }
  // ---- lighting ----
  normal(pts) { const a = pts[0], b = pts[1], c = pts[2][0] === pts[1][0] && pts[2][1] === pts[1][1] && pts[2][2] === pts[1][2] ? pts[3] : pts[2]; const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...n) || 1; return n.map(x => x / l); }
  litColor(col, n, o) {
    const d = n[0] * this.L[0] + n[1] * this.L[1] + n[2] * this.L[2];
    if (o.ground || o.flatLit) return col;
    if (o.cyl) { const k = d > .45 ? 1.0 : d > .1 ? .88 : d > -.25 ? .76 : .68; return mix(shade(col, k), '#7E4A2A', k < .8 ? .12 : 0); }
    const k = d > .35 ? 1.0 : d > -.05 ? .84 : .67; return mix(shade(col, k), '#9A5A30', k < .8 ? .22 : k < 1 ? .08 : 0);
  }
  // ---- render ----
  render(ctx, o = {}) {
    this._shadowsDrawn = false;
    const drawShadows = () => { if (this._shadowsDrawn) return; this._shadowsDrawn = true; ctx.save(); ctx.fillStyle = o.shadowCol || 'rgba(110,60,30,.30)';
      for (const sh of this.shadows) { let pts = sh.map(p => this.P(p)).filter(q => q[2] > .5).map(q => [q[0], q[1]]); if (!sh.poly) pts = hull(pts); if (pts.length < 3) continue; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); }
      ctx.restore(); };
    const cp = [this.cam.x, this.cam.y, this.cam.z];
    const items = [];
    for (const f of this.faces) {
      const n = this.normal(f.pts); const c = f.pts.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map(v => v / f.pts.length);
      if (!f.o.ground && !f.o.twoSided && (n[0] * (cp[0] - c[0]) + n[1] * (cp[1] - c[1]) + n[2] * (cp[2] - c[2])) <= 0) continue;
      const depth = f.o.ground ? 1e6 - (f.o.layer || 0) : Math.max(...f.pts.map(p => this.toCam(p)[1])) * .35 + this.toCam(c)[1] * .65;
      items.push({ kind: 'face', f, n, depth: depth + (f.o.bias || 0) });
    }
    for (const p of this.props) if (p.kind === 'sprite') items.push({ kind: 'sprite', p, depth: this.toCam(p.at)[1] + (p.bias || 0) });
    for (const p of this.props) if (p.kind === 'cylInk') items.push({ kind: 'cylInk', p, depth: this.toCam([p.cx, p.cy, p.z])[1] - p.r * .5 });
    items.sort((a, b) => b.depth - a.depth);
    for (const it of items) {
      if (!(it.kind === 'face' && it.f.o.ground)) drawShadows();
      if (it.kind === 'sprite') { const q = this.P(it.p.at); it.p.fn(ctx, q[0], q[1], this.scaleAt(it.p.at), q[2]); continue; }
      if (it.kind === 'cylInk') { this.inkCylinder(ctx, it.p); continue; }
      const f = it.f; let pts = f.pts.map(p => this.P(p)); if (pts.some(q => q[2] <= .06)) continue;
      if (f.o.pyr) pts = this.stepped(pts, f);
      const dd = this.toCam(f.pts[0])[1], haze = f.o.ground ? 0 : clamp((dd - 60) / 600, 0, .35); const col = mix(this.litColor(f.col, it.n, f.o), o.haze || '#EADCC2', haze);
      ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); if (!f.o.noFill) { ctx.fillStyle = col; ctx.fill(); }
      if (f.o.tex || f.o.pyr) { ctx.save(); ctx.clip(); TEX[f.o.pyr ? 'courses' : f.o.tex](ctx, this, f, col); ctx.restore(); }
      if (f.o.paint) { ctx.save(); ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.clip(); f.o.paint(ctx, this, f, col); ctx.restore(); }
      if (!f.o.ground && Math.abs(it.n[2]) < .3 && Math.min(...f.pts.map(p => p[2])) <= (this.gz || 0) + .3) { // contact band where the wall meets the ground
        ctx.save(); ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.clip(); const zmin = Math.min(...f.pts.map(p => p[2])); const bot = f.pts.map((p, i) => [p, pts[i]]).filter(([p]) => p[2] <= zmin + .01).map(([, q]) => q);
        if (bot.length >= 2) { ctx.strokeStyle = 'rgba(70,35,15,.38)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(bot[0][0], bot[0][1]); ctx.lineTo(bot[1][0], bot[1][1]); ctx.stroke(); } ctx.restore(); }
      if (!f.o.noInk) { const d = Math.min(...pts.map(q => q[2] || 1e9)); const w = (f.o.pyr ? 4.6 : clamp(this.cam.f / d * (f.o.inkK || .12) * 1.4, f.o.inkMin || 3.6, 5.2)) * (1 - haze * .5); inkLine(ctx, pts.map(q => [q[0], q[1]]), w, { closed: true, wob: f.o.pyr ? .3 : undefined, col: haze > .05 ? mix(BG_INK, '#8A7460', haze * 2) : undefined }); }
    }
    drawShadows();
  }
  stepped(pts, f) { // stair-stepped silhouette for pyramid faces: base, then steps up one edge and down the other
    const [a, b, t] = pts; const n = Math.round(f.o.h / (f.o.course || 1.4)); const out = [a, b]; const stairs = (p, q, up) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]); const m = Math.max(1, Math.min(n, Math.floor(L / 8))); const r = rng(Math.round(p[0] * 7 + q[1] * 3)); const ts = [0]; let acc = 0; const ws = Array.from({ length: m }, () => .5 + r()); const tot = ws.reduce((a, b) => a + b, 0); for (const w of ws) { acc += w / tot; ts.push(acc); }
      for (let i = 0; i < m; i++) { const p0 = [p[0] + (q[0] - p[0]) * ts[i], p[1] + (q[1] - p[1]) * ts[i]], p1 = [p[0] + (q[0] - p[0]) * ts[i + 1], p[1] + (q[1] - p[1]) * ts[i + 1]]; const c = up ? [p0[0], p1[1]] : [p1[0], p0[1]];
        if (r() < .12 && Math.abs(p1[1] - p0[1]) > 4) { const dx = (p1[0] - p0[0]) * .5, nb = up ? [c[0] - dx * .0, c[1] + (p0[1] - p1[1]) * .45] : [c[0], c[1]]; out.push([c[0], c[1] + (up ? (p0[1] - p1[1]) * .5 : 0), 1], [c[0] + dx * .9, c[1] + (up ? (p0[1] - p1[1]) * .5 : 0), 1], [c[0] + dx * .9, c[1], 1]); }
        out.push([c[0], c[1], 1], [p1[0], p1[1], 1]); } }; stairs(b, t, true); stairs(t, a, false); return out;
  }
  inkCylinder(ctx, p) { // silhouette edges only, like an inked column
    const c = this.toCam([p.cx, p.cy, p.z]); const side = [c[1], -c[0]]; const sl = Math.hypot(...side) || 1; // perpendicular in plan
    const cs = Math.cos(-this.cam.yaw), sn = Math.sin(-this.cam.yaw); const px = (side[0] / sl), py = (side[1] / sl);
    const wx = px * cs - py * sn, wy = px * sn + py * cs;   // world-space perpendicular to the view ray
    for (const s of [-1, 1]) { const a = this.P([p.cx + wx * p.r * s, p.cy + wy * p.r * s, p.z]), b = this.P([p.cx + wx * p.r2 * s, p.cy + wy * p.r2 * s, p.z + p.h]); if (a[2] > .1) inkLine(ctx, [[a[0], a[1]], [b[0], b[1]]], clamp(this.cam.f / a[2] * .09, 1.2, 4)); }
  }
  // map a face (u,v ∈ [0,1]) to screen, perspective-correct via 3D interpolation
  uv(f, u, v) { const [A, B, C, D] = f.pts; const p = [0, 1, 2].map(i => (A[i] * (1 - u) + B[i] * u) * (1 - v) + (D[i] * (1 - u) + C[i] * u) * v); return this.P(p); }
}
function hull(pts) { if (pts.length < 3) return pts; const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } up.pop(); lo.pop(); return lo.concat(up); }

// ---------- hieroglyphs: hand-drawn Gardiner signs (unit box, y down) ----------
const GLYPH = {
  owl: { t: 'tall', p: [[[.32, .08], [.58, .04], [.72, .18], [.74, .5], [.7, .82], [.6, 1], [.34, 1], [.3, .84], [.4, .6], [.26, .46], [.24, .22], [.32, .08]], [[.36, .2], [.44, .24]], [[.5, .2], [.58, .24]], [[.34, 1], [.3, 1.0]], [[.62, .55], [.5, .72], [.62, .9]]] },
  reed: { t: 'tall', p: [[[.46, 1], [.5, .55], [.52, .14]], [[.52, .14], [.72, .02], [.62, .3], [.52, .36]], [[.5, .5], [.3, .34], [.36, .58], [.49, .62]]] },
  chick: { t: 'tall', p: [[[.3, .2], [.42, .1], [.52, .18], [.5, .32], [.7, .4], [.78, .58], [.62, .74], [.38, .74], [.3, .6], [.36, .38], [.3, .2]], [[.46, .74], [.44, 1]], [[.58, .74], [.6, 1]], [[.3, .2], [.18, .24]]] },
  ankh: { t: 'tall', p: [[[.5, .34], [.34, .2], [.38, .04], [.5, 0], [.62, .04], [.66, .2], [.5, .34]], [[.22, .4], [.78, .4]], [[.5, .34], [.5, 1]]] },
  seated: { t: 'tall', p: [[[.42, .02], [.56, .02], [.6, .16], [.52, .24], [.42, .2], [.42, .02]], [[.48, .24], [.38, .6], [.36, .74], [.74, .74], [.78, .98], [.3, .98], [.28, .74]], [[.44, .4], [.68, .5]]] },
  viper: { t: 'flat', p: [[[.02, .8], [.2, .55], [.42, .82], [.62, .55], [.8, .78], [.9, .6], [.98, .62], [.92, .72], [.84, .74]], [[.88, .58], [.9, .45]]] },
  water: { t: 'flat', p: [[[0, .6], [.08, .3], [.16, .6], [.25, .3], [.33, .6], [.42, .3], [.5, .6], [.58, .3], [.67, .6], [.75, .3], [.83, .6], [.92, .3], [1, .6]]] },
  bread: { t: 'flat', p: [[[.1, .85], [.2, .3], [.5, .15], [.8, .3], [.9, .85], [.1, .85]]] },
  arm: { t: 'flat', p: [[[0, .7], [.7, .55], [.82, .35], [.98, .4], [.86, .6], [.92, .72], [.72, .8], [0, .85], [0, .7]]] },
  sun: { t: 'sq', c: [.5, .5, .4], d: [.5, .5, .08] },
  eye: { t: 'flat', p: [[[.05, .5], [.3, .2], [.65, .18], [.95, .45], [.62, .8], [.3, .78], [.05, .5]], [[.4, .62], [.3, 1]]], d: [.5, .48, .12] },
  basket: { t: 'flat', p: [[[.05, .25], [.95, .25], [.8, .85], [.2, .85], [.05, .25]]] },
};
const GTALL = ['owl', 'reed', 'chick', 'ankh', 'seated'], GFLAT = ['viper', 'water', 'bread', 'arm', 'eye', 'basket'];
function drawGlyph(ctx, kind, x, y, w, h, col) { const g = GLYPH[kind]; const M = ([u, v]) => [x + u * w, y + v * h]; const lw = clamp(Math.min(w, h) * .07, .9, 2.4);
  const strokeAll = (dx, dy, c2, lw2) => { ctx.strokeStyle = c2; ctx.lineWidth = lw2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); for (const pl of (g.p || [])) pl.forEach((q, i) => { const m = M(q); i ? ctx.lineTo(m[0] + dx, m[1] + dy) : ctx.moveTo(m[0] + dx, m[1] + dy); }); if (g.c) { const [cx, cy, rr] = g.c; ctx.moveTo(x + (cx + rr) * w + dx, y + cy * h + dy); ctx.ellipse(x + cx * w + dx, y + cy * h + dy, Math.abs(rr * w), Math.abs(rr * h), 0, 0, 7); } ctx.stroke(); };
  strokeAll(lw * .7, lw * .7, shade(col, 1.18), lw * .8); strokeAll(0, 0, shade(col, .45), lw);
  if (g.d) { ctx.fillStyle = shade(col, .45); ctx.beginPath(); ctx.ellipse(x + g.d[0] * w, y + g.d[1] * h, Math.abs(g.d[2] * w), Math.abs(g.d[2] * h), 0, 0, 7); ctx.fill(); } }
// one quadrat cell: a tall sign, or two flat signs stacked, or a flat sign over two small tall ones
function quadrat(ctx, r, x, y, w, h, col) { const t = r();
  if (t < .4) drawGlyph(ctx, GTALL[Math.floor(r() * GTALL.length)], x + w * .12, y + h * .05, w * .76, h * .9, col);
  else if (t < .75) { drawGlyph(ctx, GFLAT[Math.floor(r() * GFLAT.length)], x + w * .05, y + h * .06, w * .9, h * .4, col); drawGlyph(ctx, GFLAT[Math.floor(r() * GFLAT.length)], x + w * .05, y + h * .54, w * .9, h * .4, col); }
  else { drawGlyph(ctx, GFLAT[Math.floor(r() * GFLAT.length)], x + w * .05, y + h * .04, w * .9, h * .36, col); drawGlyph(ctx, GTALL[Math.floor(r() * GTALL.length)], x + w * .04, y + h * .46, w * .44, h * .52, col); drawGlyph(ctx, GTALL[Math.floor(r() * GTALL.length)], x + w * .52, y + h * .46, w * .44, h * .52, col); } }
// ---------- face textures ----------
const TEX = {};
// dressed-stone courses: blocks with jittered value, light top edge, dark bottom edge, inked joints
TEX.blocks = (ctx, S, f, col) => {
  const [A, B, C, D] = f.pts; const W = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), Hh = Math.hypot(D[0] - A[0], D[1] - A[1], D[2] - A[2]);
  const bh = f.o.course || 1.0, bw = f.o.blockW || 1.8; const rows = Math.max(1, Math.round(Hh / bh)); const r = rng(f.o.seed || Math.round(A[0] * 7 + A[1] * 13));
  for (let j = 0; j < rows; j++) { const v0 = j / rows, v1 = (j + 1) / rows; let u = -(j % 2) * (bw / W) * .5;
    const h0 = S.uv(f, 0, v0), h1 = S.uv(f, 0, v1); if (Math.abs(h1[1] - h0[1]) < 2.2) { /* too small: just a course line */ const a = S.uv(f, 0, v0), b = S.uv(f, 1, v0); ctx.strokeStyle = shade(col, .78); ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); continue; }
    while (u < 1) { const w = (bw / W) * (.7 + r() * .6), u0 = Math.max(0, u), u1 = Math.min(1, u + w);
      const p = [S.uv(f, u0, v0), S.uv(f, u1, v0), S.uv(f, u1, v1), S.uv(f, u0, v1)];
      ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = shade(col, .9 + r() * .17); ctx.fill();
      const hpx = Math.abs(p[3][1] - p[0][1]);
      if (hpx > 5) { ctx.lineWidth = Math.min(2.5, hpx * .12); ctx.strokeStyle = shade(col, 1.14); ctx.beginPath(); ctx.moveTo(p[3][0], p[3][1] - ctx.lineWidth / 2); ctx.lineTo(p[2][0], p[2][1] - ctx.lineWidth / 2); ctx.stroke(); ctx.strokeStyle = shade(col, .7); ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1] + ctx.lineWidth / 2); ctx.lineTo(p[1][0], p[1][1] + ctx.lineWidth / 2); ctx.stroke(); }
      ctx.strokeStyle = shade(col, .5); ctx.lineWidth = clamp(hpx * .06, .6, 1.5); ctx.beginPath(); ctx.moveTo(p[1][0], p[1][1]); ctx.lineTo(p[2][0], p[2][1]); ctx.stroke();
      if (hpx > 60) { ctx.strokeStyle = shade(col, .8); ctx.lineWidth = 1.4; for (let m = 0; m < 3; m++) { const t = .2 + m * .28; const a0 = [p[0][0] + (p[1][0] - p[0][0]) * t, p[0][1] + (p[1][1] - p[0][1]) * t], b0 = [p[3][0] + (p[2][0] - p[3][0]) * (t + .12), p[3][1] + (p[2][1] - p[3][1]) * (t + .12)]; ctx.beginPath(); ctx.moveTo(a0[0], a0[1] - 3); ctx.lineTo(b0[0], b0[1] + 3); ctx.stroke(); } ctx.fillStyle = shade(col, .74); ctx.beginPath(); ctx.moveTo(p[3][0] + (p[2][0] - p[3][0]) * .6, p[3][1]); ctx.lineTo(p[3][0] + (p[2][0] - p[3][0]) * .75, p[3][1]); ctx.lineTo(p[3][0] + (p[2][0] - p[3][0]) * .7, p[3][1] + hpx * .08); ctx.fill(); }
      if (hpx > 14) { const cx = (p[0][0] + p[2][0]) / 2, cy = (p[0][1] + p[2][1]) / 2; ctx.strokeStyle = shade(col, .78); ctx.lineWidth = 1; for (let m = 0; m < 3; m++) { const ox = (r() - .5) * hpx, oy = (r() - .5) * hpx * .5; ctx.beginPath(); ctx.moveTo(cx + ox, cy + oy); ctx.lineTo(cx + ox + hpx * .12, cy + oy - hpx * .08); ctx.stroke(); } if (r() < (hpx > 60 ? .6 : .05)) { ctx.strokeStyle = '#A8442E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - hpx * .15, cy - hpx * .15); ctx.lineTo(cx - hpx * .15, cy + hpx * .15); ctx.moveTo(cx - hpx * .15, cy); ctx.lineTo(cx + hpx * .1, cy); ctx.arc(cx + hpx * .1, cy - hpx * .06, hpx * .06, 0, 6.28); ctx.stroke(); } }
      if (hpx > 10 && r() < .18) { ctx.fillStyle = shade(col, .78); ctx.beginPath(); ctx.moveTo(p[1][0], p[1][1]); ctx.lineTo(p[1][0] - hpx * .25, p[1][1]); ctx.lineTo(p[1][0], p[1][1] + hpx * .3); ctx.fill(); } // chipped corner
      u = u1; }
    const a = S.uv(f, 0, v0), b = S.uv(f, 1, v0); ctx.strokeStyle = shade(col, .5); ctx.lineWidth = clamp(Math.abs(h1[1] - h0[1]) * .06, .6, 1.5); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  if (f.o.granite) { const rr = rng(7); for (let i = 0; i < 260; i++) { const q = S.uv(f, rr(), rr()); ctx.fillStyle = rr() > .3 ? 'rgba(50,25,20,.45)' : 'rgba(255,230,220,.35)'; ctx.fillRect(q[0], q[1], 1.6 + rr() * 1.6, 1.6 + rr() * 1.6); } for (let i = 0; i < 5; i++) { const a = S.uv(f, rr(), .3 + rr() * .6); ctx.strokeStyle = 'rgba(255,235,225,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + 18, a[1] - 10); ctx.stroke(); } }
  // grime at the base
  const a = S.uv(f, 0, 0), b = S.uv(f, 1, 0), c2 = S.uv(f, 0, .25); const g = ctx.createLinearGradient(0, a[1], 0, c2[1]); g.addColorStop(0, 'rgba(60,40,25,.22)'); g.addColorStop(1, 'rgba(60,40,25,0)'); ctx.fillStyle = g; ctx.fillRect(Math.min(a[0], b[0]) - 50, Math.min(c2[1], a[1]) - 50, Math.abs(b[0] - a[0]) + 100, Math.abs(a[1] - c2[1]) + 100);
};
// pyramid courses: horizontal step lines across a triangle face, block joints, weathering
TEX.courses = (ctx, S, f, col) => {
  const [A, B, , T] = f.pts; const n = Math.round(f.o.h / (f.o.course || 1.4)); const r = rng(Math.round(A[0] * 3 + A[1] * 5));
  const at = (u, v) => S.P([A[0] + (B[0] - A[0]) * u + (T[0] - (A[0] + (B[0] - A[0]) * u)) * v, A[1] + (B[1] - A[1]) * u + (T[1] - (A[1] + (B[1] - A[1]) * u)) * v, A[2] + (T[2] - A[2]) * v]);
  const g0 = Math.abs(at(.5, 0)[1] - at(.5, 1 / n)[1]); const stride = Math.max(1, Math.ceil(4.5 / Math.max(.01, g0)));
  for (let j = stride; j < n; j += stride) { const v = j / n; const a = at(0, v), b = at(1, v); const gap = Math.abs(at(.5, v)[1] - at(.5, (j - stride) / n)[1]); if (gap < 3) continue;
    ctx.strokeStyle = shade(col, .62); ctx.lineWidth = clamp(gap * .24, .7, 2.4); ctx.beginPath(); { let u = 0; while (u < 1) { const l = .08 + r() * .3, g2 = r() < .5 ? .01 + r() * .03 : 0; const p0 = at(u, v), p1 = at(Math.min(1, u + l), v); ctx.moveTo(p0[0], p0[1] + (r() - .5) * .8); ctx.lineTo(p1[0], p1[1] + (r() - .5) * .8); u += l + g2; } } ctx.stroke();
    if (gap > 4 && r() < .5) { const u = .1 + r() * .8, w2 = .02 + r() * .04; const p0 = at(u, v), p1 = at(u + w2, v), p2 = at(u + w2, (j - stride) / n), p3 = at(u, (j - stride) / n); ctx.fillStyle = shade(col, .7); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = shade(col, 1.12); ctx.lineWidth = clamp(gap * .12, .4, 1.2); ctx.beginPath(); ctx.moveTo(a[0], a[1] - gap * .3); ctx.lineTo(b[0], b[1] - gap * .3); ctx.stroke();
    if (gap > 7) { const m = Math.max(3, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (gap * 2.2))); for (let k = 0; k < m; k++) { const u = (k + (j % 2) * .5 + r() * .3) / m; if (u > 1) continue; const p = at(u * (1 - v) + v * .5 * 0, v), q = at(u, v - 1 / n); ctx.strokeStyle = shade(col, .7); ctx.lineWidth = .8; ctx.beginPath(); const pu = at(u, v); const pd = at(u, (j - stride) / n); ctx.moveTo(pu[0], pu[1]); ctx.lineTo(pd[0], pd[1]); ctx.stroke(); } } }
  { const b0 = at(.5, 0), b1 = at(.5, .25); const g = ctx.createLinearGradient(0, b0[1], 0, b1[1]); g.addColorStop(0, 'rgba(90,55,30,.16)'); g.addColorStop(1, 'rgba(90,55,30,0)'); ctx.fillStyle = g; ctx.fillRect(-100, Math.min(b1[1], b0[1]) - 2, 2200, Math.abs(b0[1] - b1[1]) + 6); }
  // smooth casing near the apex (Khafre) — lighter cap
  if (f.o.casing) { const c0 = at(0, 1 - f.o.casing), c1 = at(1, 1 - f.o.casing), tp = at(.5, 1); ctx.fillStyle = shade(col, 1.12); ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.lineTo(tp[0], tp[1]); ctx.closePath(); ctx.fill(); inkLine(ctx, [[c0[0], c0[1]], [c1[0], c1[1]]], 1.4, { col: shade(col, .6) }); }
  // erosion streaks
  ctx.globalAlpha = .12; for (let i = 0; i < 18; i++) { const u = r(), v = r() * .8; const p = at(u, v); ctx.fillStyle = r() > .5 ? '#6E5638' : '#FFF4D8'; ctx.fillRect(p[0], p[1], 2 + r() * 4, 10 + r() * 40); } ctx.globalAlpha = 1;
};
// carved relief registers with hieroglyph columns (pylons, temple walls)
TEX.reliefs = (ctx, S, f, col) => {
  TEX.plaster(ctx, S, f, col);
  const r = rng(f.o.seed || 9); const regs = f.o.registers || 3;
  for (let k = 0; k < regs; k++) { const v0 = .12 + k * (.7 / regs), v1 = v0 + .7 / regs - .03;
    const a = S.uv(f, .06, v0), b = S.uv(f, .94, v0); ctx.strokeStyle = shade(col, .6); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    // a figure-and-glyph frieze: offering figures as simple carved silhouettes + glyph columns
    for (let u = .08; u < .92; u += .055) { const g0 = S.uv(f, u, v0 + .02), g1 = S.uv(f, u + .045, v1 - .02); const hpx = Math.abs(g1[1] - g0[1]), wpx = Math.abs(g1[0] - g0[0]); if (hpx < 8 || wpx < 4) continue;
      ctx.strokeStyle = shade(col, .55); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(g1[0] + wpx * .1, g0[1]); ctx.lineTo(g1[0] + wpx * .1, g1[1]); ctx.stroke();
      const cells = Math.max(1, Math.round(hpx / Math.max(6, wpx))); for (let q = 0; q < cells; q++) quadrat(ctx, r, Math.min(g0[0], g1[0]), Math.min(g0[1], g1[1]) + q * hpx / cells, wpx, hpx / cells, col); } }
};
// plastered / painted wall with brush texture and weathering
TEX.plaster = (ctx, S, f, col) => { // hard-edged cel grime: drips under ledges, a darker base band, a few cracks
  const r = rng(f.o.seed || 4);
  const band = (v0, v1, k) => { const p = [S.uv(f, 0, v0), S.uv(f, 1, v0), S.uv(f, 1, v1), S.uv(f, 0, v1)]; ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = shade(col, k); ctx.fill(); };
  { const a = S.uv(f, .5, 1), b = S.uv(f, .5, 0); const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, 'rgba(255,245,225,.10)'); g.addColorStop(.5, 'rgba(255,245,225,0)'); g.addColorStop(1, 'rgba(90,50,25,.08)'); ctx.fillStyle = g; ctx.fillRect(-100, -100, 2200, 1400); }
  for (let i = 0; i < 4; i++) { const c = S.uv(f, r(), r()); const rr = 40 + r() * 140; const g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], rr); const lt = r() > .5; g.addColorStop(0, lt ? 'rgba(255,240,215,.09)' : 'rgba(100,60,30,.07)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(c[0] - rr, c[1] - rr, rr * 2, rr * 2); }
  band(0, .07 + r() * .05, .86); band(.955, 1, .84);
  for (let i = 0; i < 46; i++) { const q = S.uv(f, r(), .08 + r() * .85), L = 30 + r() * 140; ctx.strokeStyle = r() > .5 ? 'rgba(255,245,225,.10)' : 'rgba(90,50,25,.09)'; ctx.lineWidth = 3 + r() * 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(q[0] + L / 2, q[1] + (r() - .5) * 8, q[0] + L, q[1] + (r() - .5) * 6); ctx.stroke(); }   // brushy plaster   // ground-contact band + shadow under the top ledge
  for (let i = 0; i < 7; i++) { const u = r() * .95, w = .02 + r() * .05, len = .1 + r() * .3; const p = [S.uv(f, u, .98), S.uv(f, u + w, .98), S.uv(f, u + w * .6, .98 - len), S.uv(f, u + w * .3, .98 - len * .7)]; ctx.beginPath(); p.forEach((q, i2) => i2 ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = shade(col, .92); ctx.fill(); }   // drips from the top edge
  for (let i = 0; i < 5; i++) { const a = S.uv(f, r(), .2 + r() * .7); if (r() < .6) inkLine(ctx, [[a[0], a[1]], [a[0] + 6 + r() * 12, a[1] + 8 + r() * 12], [a[0] + 2 + r() * 16, a[1] + 22 + r() * 16]], 1.2, { col: shade(col, .55) }); }
};
// mud-brick: small courses of plastered brick showing through
TEX.mudbrick = (ctx, S, f, col) => {
  TEX.plaster(ctx, S, f, col); const r = rng(f.o.seed || 2);
  for (let n = 0; n < 1; n++) { const u0 = .1 + r() * .6, v0 = .12 + r() * .4, du = .08 + r() * .08, dv = .1 + r() * .1;
    const outline = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; outline.push([u0 + du / 2 + Math.cos(a) * du / 2 * (.75 + r() * .35), v0 + dv / 2 + Math.sin(a) * dv / 2 * (.75 + r() * .35)]); }
    const P = outline.map(([u, v]) => S.uv(f, u, v)); ctx.save(); ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = '#9C6E46'; ctx.fill(); ctx.clip();
    for (let j = 0; j < 9; j++) for (let k = -1; k < 8; k++) { const uu = u0 + (k + (j % 2) * .5) * du / 6, vv = v0 + j * dv / 7; const q = [S.uv(f, uu, vv), S.uv(f, uu + du / 6, vv), S.uv(f, uu + du / 6, vv + dv / 7), S.uv(f, uu, vv + dv / 7)]; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = shade('#A8774C', .88 + r() * .2); ctx.fill(); ctx.strokeStyle = '#5E3E26'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore(); inkLine(ctx, P.map(q => [q[0], q[1]]), 2, { closed: true, col: shade(col, .45) }); }
};
// paved floor seen from above: large slabs, dark joints, a few cracked/missing slabs
TEX.paving = (ctx, S, f, col) => { const r = rng(f.o.seed || 12); const [A, B, , D] = f.pts; const W = Math.hypot(B[0] - A[0], B[1] - A[1]), Dd = Math.hypot(D[0] - A[0], D[1] - A[1]); const sw = f.o.slab || 1.6;
  const nu = Math.max(1, Math.round(W / sw)), nv = Math.max(1, Math.round(Dd / sw));
  for (let j = 0; j < nv; j++) { const off = (j % 2) * .5; for (let i = -1; i < nu; i++) { const u0 = Math.max(0, (i + off) / nu), u1 = Math.min(1, (i + 1 + off) / nu), v0 = j / nv, v1 = (j + 1) / nv; if (u1 <= u0) continue; const p = [S.uv(f, u0, v0), S.uv(f, u1, v0), S.uv(f, u1, v1), S.uv(f, u0, v1)];
    ctx.beginPath(); p.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); const t = r(); ctx.fillStyle = t < .08 ? shade(col, .84) : shade(col, .93 + r() * .12); ctx.fill(); ctx.strokeStyle = shade(col, .66); ctx.lineWidth = clamp(Math.abs(p[3][1] - p[0][1]) * (.04 + r() * .05), .5, 2); ctx.stroke();
    if (t < .08) { ctx.strokeStyle = shade(col, 1.15); ctx.lineWidth = clamp(Math.abs(p[3][1] - p[0][1]) * .1, 1, 3); ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[1][0], p[1][1]); ctx.stroke(); }
    if (t > .9) { const a = S.uv(f, u0 + (u1 - u0) * .2, v0 + (v1 - v0) * .3), b = S.uv(f, u0 + (u1 - u0) * .6, v0 + (v1 - v0) * .5), c = S.uv(f, u0 + (u1 - u0) * .8, v0 + (v1 - v0) * .9); inkLine(ctx, [[a[0], a[1]], [b[0], b[1]], [c[0], c[1]]], 1.3, { col: shade(col, .5) }); } } } };
// fluted/painted column bands
TEX.colBands = (ctx, S, f, col) => { for (const [v, c] of [[.06, '#3E6E8E'], [.1, '#B8463A'], [.88, '#3E6E8E'], [.92, '#C9A24A']]) { const a = S.uv(f, 0, v), b = S.uv(f, 1, v), a2 = S.uv(f, 0, v + .025), b2 = S.uv(f, 1, v + .025); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(a2[0], a2[1]); ctx.fill(); } };
