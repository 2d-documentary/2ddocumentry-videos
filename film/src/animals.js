// 3D animals sculpted as one continuous organic surface: a signed-distance body (smooth union of ellipsoids and
// round cones) meshed with surface nets, coloured per body part, wrinkled with a real normal map and skinned to a
// tiny rig (legs, head, trunk) so they can walk, graze and sway. No 2D cut-outs.
import * as THREE from 'three';
import { scene, pbr, flat, uvWorld } from './engine.js';
import { BLOCK } from './props.js';

// ------------------------------------------------------------------ SDF primitives
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ell = (c, r, part, col) => ({ t: 'e', c: V(...c), r: V(...r), part, col });
const cone = (a, b, ra, rb, part, col) => ({ t: 'c', a: V(...a), b: V(...b), ra, rb, part, col });
function dPrim(p, q) {
  if (q.t === 'e') {   // approximate ellipsoid distance (Inigo Quilez)
    const x = (p.x - q.c.x) / q.r.x, y = (p.y - q.c.y) / q.r.y, z = (p.z - q.c.z) / q.r.z;
    const k0 = Math.sqrt(x * x + y * y + z * z), x1 = x / q.r.x, y1 = y / q.r.y, z1 = z / q.r.z, k1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
    return k1 < 1e-9 ? -Math.min(q.r.x, q.r.y, q.r.z) : k0 * (k0 - 1) / k1;
  }
  // round cone between a (radius ra) and b (radius rb)
  const bax = q.b.x - q.a.x, bay = q.b.y - q.a.y, baz = q.b.z - q.a.z, pax = p.x - q.a.x, pay = p.y - q.a.y, paz = p.z - q.a.z;
  const L2 = bax * bax + bay * bay + baz * baz; let h = (pax * bax + pay * bay + paz * baz) / L2; h = Math.max(0, Math.min(1, h));
  const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (q.ra + (q.rb - q.ra) * h);
}
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };

// ------------------------------------------------------------------ surface nets mesher
export function mesh(prims, h, k, displace) {
  const FL = [1, 1, 1];
  const lo = V(1e9, 1e9, 1e9), hi = V(-1e9, -1e9, -1e9);
  for (const q of prims) {
    if (q.t === 'e') { lo.min(q.c.clone().sub(q.r)); hi.max(q.c.clone().add(q.r)); }
    else { const r = Math.max(q.ra, q.rb); lo.min(q.a.clone().subScalar(r)); lo.min(q.b.clone().subScalar(r)); hi.max(q.a.clone().addScalar(r)); hi.max(q.b.clone().addScalar(r)); }
  }
  lo.subScalar(h * 3); hi.addScalar(h * 3);
  const nx = Math.ceil((hi.x - lo.x) / h) + 1, ny = Math.ceil((hi.y - lo.y) / h) + 1, nz = Math.ceil((hi.z - lo.z) / h) + 1;
  const F = new Float32Array(nx * ny * nz), p = V(0, 0, 0), I = (i, j, l) => i + nx * (j + ny * l);
  const sdf = (p) => { let d = 1e9; for (const q of prims) d = smin(d, dPrim(p, q), q.k ?? k); return displace ? d - displace(p) : d; };
  for (let l = 0; l < nz; l++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { p.set(lo.x + i * h, lo.y + j * h, lo.z + l * h); F[I(i, j, l)] = sdf(p); }
  const cell = new Int32Array(nx * ny * nz).fill(-1), pos = [], idx = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const v = new Float32Array(8);
  for (let l = 0; l < nz - 1; l++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let m = 0; for (let c = 0; c < 8; c++) { v[c] = F[I(i + C[c][0], j + C[c][1], l + C[c][2])]; if (v[c] < 0) m |= 1 << c; }
    if (m === 0 || m === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of E) { if ((v[a] < 0) === (v[b] < 0)) continue; const t = v[a] / (v[a] - v[b]); sx += C[a][0] + (C[b][0] - C[a][0]) * t; sy += C[a][1] + (C[b][1] - C[a][1]) * t; sz += C[a][2] + (C[b][2] - C[a][2]) * t; n++; }
    cell[I(i, j, l)] = pos.length / 3; pos.push(lo.x + (i + sx / n) * h, lo.y + (j + sy / n) * h, lo.z + (l + sz / n) * h);
  }
  const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) idx.push(a, d, c, a, c, b); else idx.push(a, b, c, a, c, d); };
  for (let l = 1; l < nz - 1; l++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const f0 = F[I(i, j, l)] < 0;
    if (f0 !== (F[I(i + 1, j, l)] < 0)) quad(cell[I(i, j - 1, l - 1)], cell[I(i, j, l - 1)], cell[I(i, j, l)], cell[I(i, j - 1, l)], FL[0] ? !f0 : f0);
    if (f0 !== (F[I(i, j + 1, l)] < 0)) quad(cell[I(i - 1, j, l - 1)], cell[I(i - 1, j, l)], cell[I(i, j, l)], cell[I(i, j, l - 1)], FL[1] ? !f0 : f0);
    if (f0 !== (F[I(i, j, l + 1)] < 0)) quad(cell[I(i - 1, j - 1, l)], cell[I(i, j - 1, l)], cell[I(i, j, l)], cell[I(i - 1, j, l)], FL[2] ? !f0 : f0);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// ------------------------------------------------------------------ rig: soft weights per part, CPU linear-blend skinning
function rig(geo, prims, parts, colours) {
  const p = geo.attributes.position, n = p.count, P = parts.length, W = new Float32Array(n * P), col = new Float32Array(n * 3), v = V(0, 0, 0);
  const tau = 0.07, d = new Float32Array(P);
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(p, i); d.fill(1e9); let best = null, bd = 1e9;
    for (const q of prims) { const dd = dPrim(v, q); const pi = parts.indexOf(q.part); if (dd < d[pi]) d[pi] = dd; if (dd < bd) { bd = dd; best = q; } }
    let dm = 1e9; for (let k = 0; k < P; k++) dm = Math.min(dm, d[k]);
    let s = 0; for (let k = 0; k < P; k++) { const w = Math.exp(-(d[k] - dm) / tau); W[i * P + k] = w; s += w; } for (let k = 0; k < P; k++) W[i * P + k] /= s;
    const c = new THREE.Color(typeof best.col === 'function' ? best.col(v) : (best.col ?? colours.base)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return W;
}

const MATS = {};
function skinMat(rep, ns, src = 'rock') {
  const key = src + rep + ns; if (MATS[key]) return MATS[key];
  const n = pbr(src, { size: 1 }).normalMap.clone(); n.repeat.set(rep, rep); n.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, normalMap: n, normalScale: new THREE.Vector2(ns, ns) }); m.envMapIntensity = 0.55;
  return (MATS[key] = m);
}

export const WALKERS = [];
const CACHE = {};
class Beast {
  constructor(def) {
    this.def = def; this.kind = def.kind; this.size = def.size; this.seed = WALKERS.length * 1.37 + 0.3; WALKERS.push(this);
    if (!CACHE[def.key]) {
      const g = mesh(def.prims, def.cell, def.k, def.displace); const W = rig(g, def.prims, def.parts, def.colours); uvWorld(g, 1); g.computeVertexNormals();
      CACHE[def.key] = { g, W };
    }
    const { g, W } = CACHE[def.key];
    this.geo = g.clone(); this.base = g.attributes.position.array.slice(); this.W = W; this.P = def.parts.length;
    this.root = new THREE.Group(); scene.add(this.root);
    this.mesh = new THREE.Mesh(this.geo, def.mat); this.mesh.castShadow = true; this.mesh.receiveShadow = true; this.root.add(this.mesh);
    this.headG = new THREE.Group(); this.headG.matrixAutoUpdate = false; this.root.add(this.headG);
    this.bodyG = new THREE.Group(); this.bodyG.matrixAutoUpdate = false; this.root.add(this.bodyG);
    this.M = def.parts.map(() => new THREE.Matrix4());
    this.state = null;
  }
  place(x, y, z, ry = 0) { this.root.position.set(x, y, z); this.root.rotation.y = ry; if (!this.moving) BLOCK.push([x, z, this.size * 0.6]); return this; }
  // joint angles -> part matrices -> deformed vertices
  apply({ legs = [0, 0, 0, 0], lift = [0, 0, 0, 0], nod = 0, turn = 0, trunk = 0, bob = 0, ear = 0 }) {
    const key = [legs, lift, nod, turn, trunk, bob, ear].flat().map((a) => a.toFixed(3)).join(); if (key === this.state) return; this.state = key;
    const d = this.def, piv = (p, R, extra) => new THREE.Matrix4().makeTranslation(p.x, p.y, p.z).multiply(R).multiply(new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z)).premultiply(extra || new THREE.Matrix4());
    const body = new THREE.Matrix4().makeTranslation(0, bob, 0);
    const head = piv(d.neck, new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, turn, nod)), body);
    d.parts.forEach((name, k) => {
      if (name === 'body') this.M[k].copy(body);
      else if (name === 'head') this.M[k].copy(head);
      else if (name === 'trunk') this.M[k].copy(head).multiply(piv(d.trunkBase, new THREE.Matrix4().makeRotationZ(trunk)));
      else { const li = +name.slice(3); this.M[k].copy(piv(d.hips[li], new THREE.Matrix4().makeRotationZ(legs[li]), body)).premultiply(new THREE.Matrix4().makeTranslation(0, lift[li], 0)); }
    });
    this.headG.matrix.copy(head); this.bodyG.matrix.copy(body); this.headG.matrixWorldNeedsUpdate = true; this.bodyG.matrixWorldNeedsUpdate = true;
    if (this.ears) this.ears.forEach((e, i) => (e.rotation.y = e.userData.ry + (i ? -1 : 1) * ear));
    const pos = this.geo.attributes.position.array, B = this.base, W = this.W, P = this.P, e = this.M.map((m) => m.elements);
    for (let i = 0, n = B.length / 3; i < n; i++) {
      const x = B[i * 3], y = B[i * 3 + 1], z = B[i * 3 + 2]; let ox = 0, oy = 0, oz = 0;
      for (let k = 0; k < P; k++) { const w = W[i * P + k]; if (w < 0.002) continue; const m = e[k]; ox += w * (m[0] * x + m[4] * y + m[8] * z + m[12]); oy += w * (m[1] * x + m[5] * y + m[9] * z + m[13]); oz += w * (m[2] * x + m[6] * y + m[10] * z + m[14]); }
      pos[i * 3] = ox; pos[i * 3 + 1] = oy; pos[i * 3 + 2] = oz;
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.computeVertexNormals(); this.geo.computeBoundingSphere();
  }
  // walking gait: legs swing in the def's phase order, feet lift while swinging forward
  pose(phase, stride = 0.3) {
    const off = this.def.gait, legs = [], lift = [];
    for (let i = 0; i < 4; i++) { const a = phase + off[i] * Math.PI * 2; legs.push(Math.sin(a) * stride); lift.push(Math.max(0, Math.cos(a)) * stride * 0.25 * this.size / 3); }
    this.apply({ legs, lift, nod: Math.sin(phase * 2) * 0.03, trunk: Math.sin(phase) * 0.15, bob: Math.abs(Math.sin(phase)) * 0.03 * this.size / 3, ear: Math.sin(phase * 2) * 0.08 });
  }
  // standing still: grazing (head down, up), ear flaps, trunk swinging, weight shifts
  idle(t) {
    const s = this.seed, c = (Math.sin(t * 0.35 + s * 2.1) + Math.sin(t * 0.13 + s)) * 0.5;
    const graze = this.kind === 'elephant' ? 0 : -0.65 * THREE.MathUtils.smoothstep(c, -0.1, 0.4);
    this.apply({ legs: [0, 1, 2, 3].map((i) => Math.sin(t * 0.4 + s + i) * 0.01), nod: graze + Math.sin(t * 0.8 + s) * 0.03, turn: Math.sin(t * 0.21 + s * 3) * 0.12,
      trunk: Math.sin(t * 0.9 + s) * 0.18, ear: Math.max(0, Math.sin(t * 1.7 + s * 5)) ** 4 * 0.35 });
  }
}

// ------------------------------------------------------------------ African forest war elephant (~2.8 m at the shoulder)
function elephantDef(tint) {
  const base = new THREE.Color(tint), dust = base.clone().lerp(new THREE.Color(0x8a6a50), 0.35).multiplyScalar(0.85);
  const legCol = (v) => base.clone().lerp(dust, THREE.MathUtils.smoothstep(1.1 - v.y, 0, 1));
  const B = 'body', H = 'head', T = 'trunk';
  const prims = [
    ell([0, 2.2, 0], [1.75, 1.0, 0.92], B), ell([0.85, 2.38, 0], [1.05, 1.05, 0.9], B), ell([-1.1, 2.18, 0], [0.95, 0.98, 0.86], B),
    ell([0.05, 1.72, 0], [1.4, 0.72, 0.86], B), ell([0.6, 3.0, 0], [0.7, 0.35, 0.55], B),
    cone([1.35, 2.55, 0], [1.95, 2.62, 0], 0.72, 0.62, B),
    ell([2.2, 2.65, 0], [0.7, 0.8, 0.62], H), ell([2.12, 3.15, 0], [0.55, 0.42, 0.52], H), ell([2.62, 2.35, 0], [0.38, 0.48, 0.42], H),
    cone([2.75, 2.45, 0], [2.95, 1.75, 0], 0.3, 0.24, T), cone([2.95, 1.75, 0], [2.98, 1.05, 0], 0.24, 0.17, T),
    cone([2.98, 1.05, 0], [2.92, 0.45, 0], 0.17, 0.12, T), cone([2.92, 0.45, 0], [3.12, 0.18, 0], 0.12, 0.1, T), cone([3.12, 0.18, 0], [3.32, 0.3, 0], 0.1, 0.085, T),
  ];
  prims.slice(9, 14).forEach((q) => (q.k = 0.12));
  const hips = [V(-1.2, 2.0, 0.5), V(0.95, 2.05, 0.55), V(-1.2, 2.0, -0.5), V(0.95, 2.05, -0.55)];   // LH, LF, RH, RF
  hips.forEach((hp, i) => {
    const hind = i % 2 === 0, x = hp.x, z = hp.z, part = 'leg' + i;
    prims.push(cone([x, 2.05, z], [x + (hind ? 0.08 : 0.04), 1.0, z], hind ? 0.52 : 0.46, 0.38, part, legCol));
    prims.push(cone([x + (hind ? 0.08 : 0.04), 1.0, z], [x, 0.16, z], 0.38, 0.36, part, legCol));
    prims.push(Object.assign(ell([x + 0.05, 0.12, z], [0.42, 0.14, 0.4], part, () => dust.clone().multiplyScalar(0.9)), { k: 0.12 }));
  });
  const wrinkle = (p) => 0.012 * Math.sin(p.y * 38 + Math.sin(p.x * 7) * 2) * THREE.MathUtils.smoothstep(2.5 - p.y, 0, 2) + (p.x > 2.6 ? 0.006 * Math.sin(p.y * 70) : 0);
  return { key: 'elephant' + tint, kind: 'elephant', size: 3, cell: 0.055, k: 0.38, prims, displace: wrinkle, parts: [B, H, T, 'leg0', 'leg1', 'leg2', 'leg3'], colours: { base: tint }, hips,
    neck: V(1.6, 2.6, 0), trunkBase: V(2.75, 2.45, 0), gait: [0, 0.25, 0.5, 0.75], mat: skinMat(0.7, 1.1) };
}

export function elephant({ x = 0, y = 0, z = 0, ry = 0, tint = 0x5f5a55, saddle = true, moving = false } = {}) {
  const A = new Beast(elephantDef(tint)); A.moving = moving;
  const earMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(tint).multiplyScalar(0.9), roughness: 0.95, side: THREE.DoubleSide, normalMap: A.def.mat.normalMap, normalScale: new THREE.Vector2(1.3, 1.3) });
  A.ears = [];
  for (const sz of [1, -1]) {   // big ear flaps lying back along the neck, cupped, with a lower lobe
    const g = new THREE.SphereGeometry(1, 28, 18); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const px = p.getX(i), yy = p.getY(i), pz = p.getZ(i); const w = 0.62 - 0.22 * Math.max(0, -yy) + 0.08 * Math.max(0, yy);
      p.setXYZ(i, -0.58 - px * w, yy * 0.92 - (yy < -0.3 ? (yy + 0.3) * 0.35 : 0), pz * 0.05 + 0.1 * (1 - px * px)); }
    g.computeVertexNormals();
    const piv = new THREE.Group(); piv.position.set(1.98, 2.78, sz * 0.5); piv.userData.ry = sz * 0.35; piv.rotation.y = piv.userData.ry; A.headG.add(piv);
    const m = new THREE.Mesh(g, earMat); m.castShadow = true; m.scale.z = sz; piv.add(m); A.ears.push(piv);
  }
  const ivory = flat(0xe8dcc0, 0.4);
  for (const sz of [-1, 1]) {
    const c = new THREE.CatmullRomCurve3([V(2.62, 2.05, sz * 0.26), V(2.95, 1.7, sz * 0.3), V(3.35, 1.62, sz * 0.36), V(3.6, 1.82, sz * 0.42)]);
    const t = new THREE.TubeGeometry(c, 16, 0.075, 10, false); const p = t.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = Math.floor(i / 11) / 16; const cc = c.getPointAt(Math.min(1, u)); const v = V(p.getX(i), p.getY(i), p.getZ(i)).sub(cc).multiplyScalar(1 - 0.75 * u).add(cc); p.setXYZ(i, v.x, v.y, v.z); }
    t.computeVertexNormals(); const m = new THREE.Mesh(t, ivory); m.castShadow = true; A.headG.add(m);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), flat(0x140e0a, 0.2)); eye.position.set(2.5, 2.88, sz * 0.5); A.headG.add(eye);
  }
  const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-2.0, 2.55, 0), V(-2.18, 2.0, 0), V(-2.2, 1.35, 0.04)]), 10, 0.045, 6), flat(new THREE.Color(tint).multiplyScalar(0.8).getHex(), 0.9));
  tail.castShadow = true; A.bodyG.add(tail);
  if (saddle) {   // war-elephant saddle cloth with gold trim and a small fighting tower
    const cg = new THREE.CylinderGeometry(1.0, 1.0, 1.8, 40, 1, true, Math.PI / 2 - Math.PI * 0.4, Math.PI * 0.8); cg.rotateZ(Math.PI / 2); cg.scale(1, 1.12, 1.02); cg.translate(0.25, 2.3, 0);
    const cloth = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: 0x8a1f24, roughness: 0.9, side: THREE.DoubleSide })); cloth.castShadow = true; A.bodyG.add(cloth);
    const tg = new THREE.TorusGeometry(1.0, 0.035, 6, 40, Math.PI * 0.8); tg.rotateZ(Math.PI / 2 - Math.PI * 0.4); tg.rotateY(Math.PI / 2); tg.scale(1, 1.12, 1.02);
    for (const dx of [-0.65, 1.15]) { const t = new THREE.Mesh(tg, flat(0xc9a227, 0.4, 0.6)); t.position.set(dx, 2.3, 0); A.bodyG.add(t); }
    const wood = pbr('wood', { size: 1 });
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.1), wood); tower.position.set(0.25, 3.5, 0); tower.castShadow = true; A.bodyG.add(tower);
    for (const [a, b] of [[0.82, 0.52], [0.82, -0.52], [-0.32, 0.52], [-0.32, -0.52]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 6), wood); p.position.set(a, 4.15, b); A.bodyG.add(p); }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.1), wood); rail.position.set(0.25, 4.55, 0); A.bodyG.add(rail);
  }
  A.place(x, y, z, ry); A.idle(0); return A;
}

// ------------------------------------------------------------------ cattle, horses, sheep, goats (same method)
const KINDS = {
  cow: { L: 1.25, H: 1.35, girth: 0.42, neck: 0.32, head: 0.22, legR: 0.075, col: 0x7a5a40, horns: 0.18, cell: 0.03, patches: true },
  ox: { L: 1.4, H: 1.5, girth: 0.48, neck: 0.36, head: 0.24, legR: 0.085, col: 0xb8a690, horns: 0.35, cell: 0.032 },
  horse: { L: 1.2, H: 1.55, girth: 0.36, neck: 0.62, head: 0.2, legR: 0.055, col: 0x5a3a24, mane: true, cell: 0.028 },
  sheep: { L: 0.62, H: 0.72, girth: 0.3, neck: 0.16, head: 0.12, legR: 0.03, col: 0xe8e0d0, wool: true, cell: 0.02 },
  goat: { L: 0.6, H: 0.75, girth: 0.22, neck: 0.22, head: 0.11, legR: 0.028, col: 0x6a5a4a, horns: 0.16, beard: true, cell: 0.018 },
};
function quadDef(kind, tint) {
  const k = KINDS[kind], c = new THREE.Color(tint ?? k.col), hoof = 0x1e1a16;
  const body = k.patches && tint === undefined ? (v) => (Math.sin(v.x * 7.1 + v.z * 5) + Math.sin(v.y * 9.3 - v.x * 3) > 0.9 ? 0xeee8dc : c) : c;
  const sh = k.H - k.girth * 0.9, legTop = sh, B = 'body', Hd = 'head', leg = kind === 'sheep' ? 0x2a2420 : c;
  const prims = [
    ell([0, sh, 0], [k.L * 0.62, k.girth, k.girth * 0.9], B, body), ell([k.L * 0.32, sh + k.girth * 0.12, 0], [k.L * 0.36, k.girth * 1.0, k.girth * 0.85], B, body),
    ell([-k.L * 0.35, sh + k.girth * 0.05, 0], [k.L * 0.32, k.girth * 0.95, k.girth * 0.88], B, body),
  ];
  const nb = V(k.L * 0.5, sh + k.girth * 0.35, 0), nt = V(k.L * 0.5 + k.neck * 0.55, sh + k.girth * 0.3 + k.neck * 0.85, 0);
  prims.push(cone(nb.toArray(), nt.toArray(), k.girth * 0.62, k.head * 0.75, B, body));
  const hc = nt.clone().add(V(k.head * 0.9, -k.head * 0.35, 0)), face = kind === 'sheep' ? 0x2a2420 : c;
  prims.push(ell(hc.toArray(), [k.head * 1.3, k.head * 0.85, k.head * 0.72], Hd, face));
  prims.push(cone(hc.toArray(), hc.clone().add(V(k.head * 1.25, -k.head * 0.55, 0)).toArray(), k.head * 0.6, k.head * 0.42, Hd, kind === 'sheep' ? 0x2a2420 : kind === 'horse' ? c : c.clone().lerp(new THREE.Color(0xc89a8a), 0.4)));
  if (k.mane) for (let i = 0; i < 6; i++) { const u = i / 5; const p = nb.clone().lerp(nt, u).add(V(-0.06, k.girth * 0.55 * (1 - u) + 0.1, 0)); prims.push(Object.assign(ell(p.toArray(), [0.12, 0.08, 0.035], Hd, 0x1a120c), { k: 0.05 })); }
  if (k.beard) prims.push(Object.assign(cone(hc.clone().add(V(k.head * 0.8, -k.head * 0.6, 0)).toArray(), hc.clone().add(V(k.head * 0.6, -k.head * 1.6, 0)).toArray(), 0.03, 0.012, Hd, 0x2a2018), { k: 0.03 }));
  const hips = [V(-k.L * 0.45, legTop, k.girth * 0.5), V(k.L * 0.42, legTop, k.girth * 0.5), V(-k.L * 0.45, legTop, -k.girth * 0.5), V(k.L * 0.42, legTop, -k.girth * 0.5)];
  hips.forEach((hp, i) => {
    const hind = i % 2 === 0, part = 'leg' + i, kn = hind ? V(hp.x - k.legR * 2.5, legTop * 0.45, hp.z) : V(hp.x + k.legR * 0.5, legTop * 0.48, hp.z);
    prims.push(cone(hp.clone().setY(legTop + k.girth * 0.2).toArray(), kn.toArray(), k.legR * (hind ? 2.6 : 2.0), k.legR, part, leg));
    prims.push(Object.assign(cone(kn.toArray(), [hp.x, k.legR * 1.5, hp.z], k.legR, k.legR * 0.85, part, leg), { k: 0.04 }));
    prims.push(Object.assign(cone([hp.x, k.legR * 1.5, hp.z], [hp.x + k.legR * 0.4, k.legR * 0.6, hp.z], k.legR * 0.95, k.legR * 1.05, part, hoof), { k: 0.02 }));
  });
  const wool = k.wool ? (p) => 0.022 * (Math.sin(p.x * 31) * Math.sin(p.y * 27) * Math.sin(p.z * 29) + 0.7) * THREE.MathUtils.smoothstep(p.y, k.H * 0.35, k.H * 0.5) * THREE.MathUtils.smoothstep(k.L * 0.52 - p.x, 0, 0.1) : null;
  return { key: kind + (tint ?? ''), kind, size: k.L * 2, cell: k.cell, k: k.girth * 0.55, prims, displace: wool, parts: [B, Hd, 'leg0', 'leg1', 'leg2', 'leg3'], colours: { base: c.getHex() }, hips, neck: nb, hc,
    gait: kind === 'horse' ? [0, 0.25, 0.5, 0.75] : [0, 0.5, 0.5, 0], mat: k.wool ? skinMat(5, 1.6) : skinMat(1.2, 0.3, 'plaster') };
}
export function animal(kind, { x = 0, y = 0, z = 0, ry = 0, tint, moving = false } = {}) {
  const A = new Beast(quadDef(kind, tint)); A.kind = kind; A.moving = moving;
  const k = KINDS[kind], h = A.def.hc;
  if (k.horns) for (const sz of [-1, 1]) {
    const c = new THREE.CatmullRomCurve3([V(h.x - k.head * 0.2, h.y + k.head * 0.6, sz * k.head * 0.45), V(h.x - k.head * 0.25, h.y + k.head * 0.6 + k.horns * 0.5, sz * (k.head * 0.5 + k.horns * 0.6)), V(h.x - k.head * 0.6, h.y + k.head * 0.6 + k.horns, sz * (k.head * 0.45 + k.horns * 0.75))]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, 8, k.head * 0.08, 6), flat(0xd8ccb0, 0.5)); m.castShadow = true; A.headG.add(m);
  }
  for (const sz of [-1, 1]) {   // ears and eyes
    const e = new THREE.Mesh(new THREE.SphereGeometry(k.head * 0.3, 10, 8), flat(kind === 'sheep' ? 0x2a2420 : new THREE.Color(tint ?? k.col).getHex(), 0.9)); e.scale.set(1, 0.35, 0.6); e.position.set(h.x - k.head * 0.5, h.y + k.head * 0.45, sz * k.head * 0.8); e.rotation.x = sz * 0.6; A.headG.add(e);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(k.head * 0.11, 8, 6), flat(0x0e0c0a, 0.2)); eye.position.set(h.x + k.head * 0.35, h.y + k.head * 0.25, sz * k.head * 0.62); A.headG.add(eye);
  }
  const tl = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-k.L * 0.62, k.H - k.girth * 0.5, 0), V(-k.L * 0.68, k.H * 0.55, 0), V(-k.L * 0.66, k.H * 0.3, 0.02)]), 8, kind === 'horse' ? 0.07 : 0.025, 6), flat(kind === 'horse' ? 0x1a120c : new THREE.Color(tint ?? k.col).multiplyScalar(0.7).getHex(), 0.9));
  A.bodyG.add(tl);
  A.place(x, y, z, ry); A.idle(0); return A;
}

// a group of grazing animals: spots [[x, z, ry?], ...], ground(x, z)
export function herd(kind, spots, ground = () => 0, opt = {}) {
  const { tints, ...o } = opt;
  return spots.map(([x, z, ry], i) => animal(kind, { x, y: ground(x, z), z, ry: ry ?? (Math.sin(i * 12.9 + x) * Math.PI), ...o, tint: tints ? tints[i % tints.length] : o.tint }));
}
export function resetWalkers() { WALKERS.length = 0; }
