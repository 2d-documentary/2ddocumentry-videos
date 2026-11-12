// Roman architecture kit: true round arches, columns with base/shaft/capital, entablatures, pediments,
// tiled roofs, domes, stairs. Geometry is batched per material and merged, so a whole city stays light.
import * as THREE from 'three';
import { pbr, flat, uvWorld, scene } from './engine.js';

// ------------------------------------------------------------------ batching
export class Batch {
  constructor() { this.parts = new Map(); }
  add(geo, mat, m4) {
    const g = (geo.index ? geo.toNonIndexed() : geo.clone());
    if (m4) g.applyMatrix4(m4);
    uvWorld(g, 1);
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(g);
    return this;
  }
  build(parent = scene, { cast = true, receive = true } = {}) {
    const out = [];
    for (const [mat, list] of this.parts) {
      const g = merge(list);
      const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = receive; parent.add(m); out.push(m);
    }
    this.parts.clear(); return out;
  }
}
function merge(list) {
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
  for (const g of list) {
    const c = g.attributes.position.count;
    P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); U.set(g.attributes.uv.array, o * 2); o += c; g.dispose();
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.BufferAttribute(P, 3)); r.setAttribute('normal', new THREE.BufferAttribute(N, 3)); r.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  r.computeBoundingSphere(); return r;
}
export const M4 = (x = 0, y = 0, z = 0, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));

// ------------------------------------------------------------------ materials (shared)
const FLAT = {};
export const MAT = {
  get marble() { return pbr('marble', { size: 3 }); },
  get marbleW() { return pbr('marble', { size: 3, tint: 0xf4efe6 }); },
  get trav() { return pbr('travertine', { size: 2.5, tint: 0xf1e6d2 }); },
  get travDark() { return pbr('travertine', { size: 2.5, tint: 0xb8a990 }); },
  get blocks() { return pbr('stoneblocks', { size: 3, tint: 0xe8dcc8 }); },
  get brick() { return pbr('romanbrick', { size: 2.2, tint: 0xf0c8a8 }); },
  get plaster() { return pbr('plaster', { size: 3, tint: 0xf3e2c4 }); },
  get plasterOchre() { return pbr('plaster', { size: 3, tint: 0xe8b77a }); },
  get plasterRed() { return pbr('plaster', { size: 3, tint: 0xc8705a }); },
  get roof() { return pbr('rooftiles', { size: 2.2, tint: 0xf0b090 }); },
  get paving() { return pbr('paving', { size: 3.2, tint: 0xd8d0c4 }); },
  get floor() { return pbr('marblefloor', { size: 4 }); },
  get wood() { return pbr('wood', { size: 2 }); },
  get thatch() { return pbr('thatch', { size: 2.5 }); },
  get mud() { return pbr('mud', { size: 3, tint: 0xd0b090 }); },
  get bronze() { return FLAT.bronze ||= flat(0x8a6a3a, 0.35, 0.85); },
  get gold() { return FLAT.gold ||= flat(0xd4a84a, 0.3, 1.0); },
  get dark() { return FLAT.dark ||= flat(0x1a1410, 0.9); },
  get terracotta() { return pbr('plaster', { size: 0.8, tint: 0xc8784a, rough: 1.2, key: 'terracotta' }); },
  get sack() { return pbr('plaster', { size: 0.6, tint: 0xd8c098, rough: 1.4, key: 'sack' }); },
  get leaf() { return FLAT.leaf ||= flat(0x4a6a2e, 0.85); },
  get ember() { return FLAT.ember ||= flat(0x2a0a00, 0.9, 0, { emissive: 0xff6a20, emissiveIntensity: 2.2 }); },
};

// ------------------------------------------------------------------ shapes
function archShape(x, y0, w, h) {          // round-headed opening: rectangle + semicircle (h = springing height)
  const s = new THREE.Path(); const r = w / 2;
  s.moveTo(x - r, y0); s.lineTo(x + r, y0); s.lineTo(x + r, y0 + h);
  s.absarc(x, y0 + h, r, 0, Math.PI, false); s.lineTo(x - r, y0); return s;
}
// wall with n round arches, lying in the XY plane, extruded along +Z by depth; origin at bottom-left-front
export function arcadeGeo(len, h, depth, n, { archW = null, spring = null, sill = 0, rectWin = false } = {}) {
  const bay = len / n, aw = archW ?? bay * 0.62, sp = spring ?? Math.min(h - aw / 2 - 0.4, h * 0.55);
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(len, 0); s.lineTo(len, h); s.lineTo(0, h); s.lineTo(0, 0);
  for (let i = 0; i < n; i++) {
    const cx = bay * (i + 0.5);
    if (rectWin) { const p = new THREE.Path(); p.moveTo(cx - aw / 2, sill); p.lineTo(cx + aw / 2, sill); p.lineTo(cx + aw / 2, sill + sp); p.lineTo(cx - aw / 2, sill + sp); p.lineTo(cx - aw / 2, sill); s.holes.push(p); }
    else s.holes.push(archShape(cx, sill, aw, sp - sill));
  }
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 18 });
}
// voussoir ring that frames each arch (gives the arch real depth)
export function archRing(b, mat, x, y, z, w, spring, depth, ry = 0, thick = 0.35) {
  const r = w / 2, s = new THREE.Shape();
  s.absarc(0, 0, r + thick, 0, Math.PI, false); s.lineTo(-r, 0); s.absarc(0, 0, r, Math.PI, 0, true); s.lineTo(r + thick, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: depth + 0.12, bevelEnabled: false, curveSegments: 18 });
  b.add(g, mat, M4(x, y + spring, z - 0.06, ry));
}

// column: base (plinth + torus), tapered shaft with entasis, capital by order; returns nothing, adds to batch
export function column(b, mat, x, y, z, h, r, order = 'tuscan', capMat = null) {
  const pts = [];
  const base = r * 0.55, capH = order === 'corinthian' ? r * 2.3 : order === 'ionic' ? r * 0.9 : r * 0.75;
  const shaftH = h - base - capH;
  pts.push(new THREE.Vector2(0, 0), new THREE.Vector2(r * 1.42, 0), new THREE.Vector2(r * 1.42, base * 0.32));
  for (let i = 0; i <= 6; i++) { const a = Math.PI * i / 6; pts.push(new THREE.Vector2(r * 1.2 + Math.sin(a) * r * 0.16, base * 0.32 + (1 - Math.cos(a)) * base * 0.22)); }
  pts.push(new THREE.Vector2(r * 1.06, base * 0.8), new THREE.Vector2(r * 1.02, base));
  for (let i = 0; i <= 10; i++) { const t = i / 10, ent = 1 - 0.14 * t * t + 0.025 * Math.sin(Math.PI * t); pts.push(new THREE.Vector2(r * ent, base + shaftH * t)); }
  const top = base + shaftH;
  pts.push(new THREE.Vector2(r * 0.95, top + r * 0.06), new THREE.Vector2(r * 0.98, top + r * 0.12));
  if (order === 'corinthian') {
    for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new THREE.Vector2(r * (0.9 + 0.32 * t * t), top + capH * 0.82 * t)); }
  } else {
    for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 * i / 6; pts.push(new THREE.Vector2(r * 0.9 + Math.sin(a) * r * 0.4, top + capH * 0.15 + (1 - Math.cos(a)) * capH * 0.4)); }
  }
  pts.push(new THREE.Vector2(0, top + capH * 0.82));
  const lathe = new THREE.LatheGeometry(pts, 20);
  b.add(lathe, mat, M4(x, y, z));
  // square abacus (and plinth)
  const ab = r * (order === 'corinthian' ? 2.8 : 2.7);
  b.add(new THREE.BoxGeometry(ab, capH * 0.18, ab), capMat || mat, M4(x, y + top + capH * 0.91, z));
  b.add(new THREE.BoxGeometry(r * 2.9, base * 0.3, r * 2.9), mat, M4(x, y + base * 0.15, z));
  if (order === 'ionic') for (const sx of [-1, 1]) b.add(new THREE.TorusGeometry(r * 0.32, r * 0.13, 6, 14), capMat || mat, M4(x + sx * r * 1.1, y + top + capH * 0.45, z, Math.PI / 2));
  if (order === 'corinthian') for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2;
    b.add(new THREE.ConeGeometry(r * 0.28, capH * 0.55, 4), capMat || mat, M4(x + Math.cos(a) * r * 1.0, y + top + capH * 0.35, z + Math.sin(a) * r * 1.0, -a, 1, 1, 0.5, 0.25 * Math.cos(a), -0.25 * Math.sin(a)));
  }
}

// molded cornice along X (length len), projecting toward +Z; profile is a real cyma + fascia
export function cornice(b, mat, x, y, z, len, h = 0.8, proj = 0.7, ry = 0) {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(0, h); s.lineTo(proj, h); s.lineTo(proj, h * 0.82);
  s.quadraticCurveTo(proj * 0.55, h * 0.8, proj * 0.5, h * 0.55); s.lineTo(proj * 0.35, h * 0.5); s.lineTo(proj * 0.35, h * 0.3);
  s.quadraticCurveTo(proj * 0.1, h * 0.28, proj * 0.08, 0); s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 6 });
  g.rotateY(-Math.PI / 2); g.translate(len, 0, 0);
  b.add(g, mat, M4(x, y, z, ry));
  // dentils
  const n = Math.floor(len / 0.32);
  for (let i = 0; i < n; i += 1) b.add(new THREE.BoxGeometry(0.14, h * 0.16, 0.16), mat, new THREE.Matrix4().multiplyMatrices(M4(x, y, z, ry), M4(0.16 + i * 0.32, h * 0.38, proj * 0.3)));
}
// entablature: architrave + frieze + cornice, along X at height y, front face at z
export function entablature(b, mat, x, y, z, len, depth, h = 2.2, ry = 0) {
  const T = M4(x, y, z, ry);
  const add = (geo, m4) => b.add(geo, mat, new THREE.Matrix4().multiplyMatrices(T, m4));
  add(new THREE.BoxGeometry(len, h * 0.38, depth), M4(len / 2, h * 0.19, -depth / 2));
  add(new THREE.BoxGeometry(len + 0.1, h * 0.06, depth + 0.1), M4(len / 2, h * 0.39, -depth / 2));
  add(new THREE.BoxGeometry(len, h * 0.3, depth - 0.1), M4(len / 2, h * 0.57, -depth / 2));
  const c = new THREE.Matrix4().multiplyMatrices(T, M4(0, h * 0.72, 0)); const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); c.decompose(p, q, s);
  cornice(b, mat, p.x, p.y, p.z, len, h * 0.28, 0.7, ry);
}
// triangular pediment with raking cornice, spanning width w along X, front face at z (centre x)
export function pediment(b, mat, x, y, z, w, depth, pitch = 0.24, ry = 0) {
  const h = w / 2 * pitch, s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
  const T = M4(x, y, z, ry);
  b.add(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }), mat, new THREE.Matrix4().multiplyMatrices(T, M4(0, 0, -depth)));
  const L = Math.hypot(w / 2, h), a = Math.atan2(h, w / 2);
  for (const sx of [-1, 1]) b.add(new THREE.BoxGeometry(L + 0.3, 0.32, 0.5), mat, new THREE.Matrix4().multiplyMatrices(T, M4(sx * w / 4, h / 2 + 0.1, 0.2, 0, 1, 1, 1, 0, sx * -a)));
  return h;
}
// gable roof along Z (ridge parallel to Z), centre x, eaves at y, half-width hw, length l
export function gableRoof(b, mat, x, y, z, hw, l, pitch = 0.26, ry = 0, over = 0.4) {
  const h = hw * pitch, L = Math.hypot(hw + over, h + over * pitch), a = Math.atan2(h, hw);
  const T = M4(x, y, z, ry);
  for (const sx of [-1, 1]) b.add(new THREE.BoxGeometry(L, 0.22, l + over * 2), mat, new THREE.Matrix4().multiplyMatrices(T, M4(sx * (hw - over) / 2, h / 2 - 0.05, 0, 0, 1, 1, 1, 0, -sx * a)));
  return h;
}
export function stairs(b, mat, x, y, z, w, n, rise, run, ry = 0) {   // steps go up toward -Z
  const T = M4(x, y, z, ry);
  for (let i = 0; i < n; i++) b.add(new THREE.BoxGeometry(w, rise * (i + 1), run), mat, new THREE.Matrix4().multiplyMatrices(T, M4(0, rise * (i + 1) / 2, -run * (i + 0.5))));
}
export function dome(b, mat, x, y, z, r, { oculus = 0, segs = 40 } = {}) {
  const g = new THREE.SphereGeometry(r, segs, 16, 0, Math.PI * 2, oculus, Math.PI / 2 - oculus);
  b.add(g, mat, M4(x, y, z));
  // stepped rings at the base (like the Pantheon)
  for (let i = 0; i < 3; i++) b.add(new THREE.CylinderGeometry(r * (1.0 - i * 0.04) + 0.3, r * (1.0 - i * 0.04) + 0.3, r * 0.06, segs, 1, true), mat, M4(x, y + r * 0.06 * i + r * 0.03, z));
}

// ------------------------------------------------------------------ building types
// Temple: podium, front stairs, columns all round (peripteral) or front only (prostyle), cella, entablature, pediments, tiled roof
export function temple(b, { x = 0, z = 0, ry = 0, w = 16, l = 28, podium = 3.5, colH = 12, cols = 6, order = 'corinthian', peripteral = false, mat = MAT.marbleW, podMat = MAT.trav, ruin = 0, rnd = Math.random } = {}) {
  const T = M4(x, 0, z, ry), add = (g, m, m4) => b.add(g, m, new THREE.Matrix4().multiplyMatrices(T, m4));
  add(new THREE.BoxGeometry(w + 1.2, podium, l + 1.2), podMat, M4(0, podium / 2, 0));
  add(new THREE.BoxGeometry(w + 1.6, 0.4, l + 1.6), podMat, M4(0, podium - 0.2, 0));
  add(new THREE.BoxGeometry(w + 1.6, 0.5, l + 1.6), podMat, M4(0, 0.25, 0));
  const nSteps = Math.round(podium / 0.32);
  { const sT = new THREE.Matrix4().multiplyMatrices(T, M4(0, 0, l / 2 + 0.6 + nSteps * 0.4)); for (let i = 0; i < nSteps; i++) b.add(new THREE.BoxGeometry(w * 0.8, 0.32 * (i + 1), 0.4), podMat, new THREE.Matrix4().multiplyMatrices(sT, M4(0, 0.16 * (i + 1), -0.4 * (i + 0.5)))); }
  const r = colH / 20, gap = (w - 2 * r * 1.4) / (cols - 1);
  const cellaFront = peripteral ? l / 2 - gap * 1.6 : l / 2 - gap * 2.2;
  add(new THREE.BoxGeometry(w - 2 * gap * (peripteral ? 1 : 0.15), colH, cellaFront + l / 2 - (peripteral ? gap : 0.3)), mat, M4(0, podium + colH / 2, (cellaFront - l / 2 + (peripteral ? gap : 0.3)) / 2));
  const place = (cx, cz) => { const wp = new THREE.Vector3(cx, podium, cz).applyMatrix4(T);
    if (ruin && rnd() < ruin) { if (rnd() < 0.5) column(b, mat, wp.x, wp.y, wp.z, colH * (0.15 + rnd() * 0.3), r, 'tuscan'); return false; }
    column(b, mat, wp.x, wp.y, wp.z, colH, r, order); return true; };
  const xs = Array.from({ length: cols }, (_, i) => -w / 2 + r * 1.4 + gap * i);
  for (const cx of xs) place(cx, l / 2 - r * 1.4);
  for (const cx of xs) if (!peripteral) { if (cx === xs[0] || cx === xs[cols - 1]) place(cx, l / 2 - r * 1.4 - gap); }
  if (peripteral) { const nz = Math.round((l - 2 * r * 1.4) / gap); for (let k = 1; k <= nz; k++) for (const cx of [xs[0], xs[cols - 1]]) place(cx, l / 2 - r * 1.4 - gap * k); for (let k = 1; k < cols - 1; k++) place(xs[k], -l / 2 + r * 1.4); }
  if (ruin > 0.5) return;
  const eTop = podium + colH;
  const eT = (m4) => new THREE.Matrix4().multiplyMatrices(T, m4);
  const dec = (m) => { const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s); return p; };
  const pf = dec(eT(M4(-w / 2, eTop, l / 2)));
  entablature(b, mat, pf.x, pf.y, pf.z, w, l, 2.4, ry);
  const pp = dec(eT(M4(0, eTop + 2.4, l / 2 + 0.2)));
  pediment(b, mat, pp.x, pp.y, pp.z, w + 0.6, 1.2, 0.24, ry);
  const pr = dec(eT(M4(0, eTop + 2.4, 0)));
  gableRoof(b, MAT.roof, pr.x, pr.y, pr.z, w / 2 + 0.3, l, 0.24, ry);
  const pb = dec(eT(M4(0, eTop + 2.4, -l / 2 + 1.0)));
  pediment(b, mat, pb.x, pb.y, pb.z, w + 0.6, 1.0, 0.24, ry);
}

// Two-storey arcaded hall (basilica) along X; front face at z
export function basilica(b, { x = 0, z = 0, ry = 0, len = 80, depth = 30, h1 = 9, h2 = 8, n = 12, mat = MAT.trav, roofMat = MAT.roof, ruin = 0 } = {}) {
  const T = M4(x, 0, z, ry), add = (g, m, m4) => b.add(g, m, new THREE.Matrix4().multiplyMatrices(T, m4));
  stairs(b, mat, ...new THREE.Vector3(len / 2, 0, 3).applyMatrix4(T).toArray(), len, 4, 0.3, 0.5, ry);
  for (const [y0, hh, k] of [[1.2, h1, 0], [1.2 + h1 + 1.4, h2, 1]]) {
    if (ruin && k === 1) continue;
    const g = arcadeGeo(len, hh, 1.6, n, { archW: len / n * 0.58 });
    add(g, mat, M4(0, y0, -1.6));
    const bay = len / n;
    for (let i = 0; i <= n; i++) {
      const cx = i * bay;
      const p = new THREE.Vector3(cx, y0, 0.25).applyMatrix4(T);
      column(b, mat, p.x, p.y, p.z, hh, 0.42, k ? 'ionic' : 'tuscan');
    }
    const p = new THREE.Vector3(0, y0 + hh, 0.7).applyMatrix4(T); cornice(b, mat, p.x, p.y, p.z, len, 1.0, 0.8, ry);
    for (let i = 0; i < n; i++) archRing(b, mat, ...new THREE.Vector3(bay * (i + 0.5), y0, 0).applyMatrix4(T).toArray(), bay * 0.58, Math.min(hh - bay * 0.29 - 0.4, hh * 0.55), 1.6, ry, 0.3);
  }
  if (ruin) return;
  add(new THREE.BoxGeometry(len, h1 + h2 + 2.6, depth - 3), MAT.plaster, M4(len / 2, (h1 + h2 + 2.6) / 2, -depth / 2 - 1.6));
  const pr = new THREE.Vector3(len / 2, h1 + h2 + 2.6, -depth / 2).applyMatrix4(T);
  gableRoof(b, roofMat, pr.x, pr.y, pr.z, depth / 2, len, 0.22, ry + Math.PI / 2);
}

// Curia (Senate house): tall brick hall, plastered lower front, bronze doors, pediment
export function curia(b, { x = 0, z = 0, ry = 0, w = 18, l = 27, h = 21, mat = MAT.brick, ruin = 0 } = {}) {
  const T = M4(x, 0, z, ry), add = (g, m, m4) => b.add(g, m, new THREE.Matrix4().multiplyMatrices(T, m4));
  add(new THREE.BoxGeometry(w, h, l), mat, M4(0, h / 2 + 1.2, 0));
  add(new THREE.BoxGeometry(w + 0.6, 1.2, l + 0.6), MAT.trav, M4(0, 0.6, 0));
  stairs(b, MAT.marbleW, ...new THREE.Vector3(0, 0, l / 2 + 3.2).applyMatrix4(T).toArray(), w * 0.6, 6, 0.2, 0.55, ry);
  add(new THREE.BoxGeometry(w + 0.2, h * 0.38, 0.3), MAT.plaster, M4(0, 1.2 + h * 0.19, l / 2 + 0.05));
  add(new THREE.BoxGeometry(4.2, 7.5, 0.3), MAT.bronze, M4(0, 1.2 + 3.75, l / 2 + 0.25));
  add(new THREE.BoxGeometry(5.4, 0.6, 0.6), MAT.trav, M4(0, 1.2 + 7.8, l / 2 + 0.3));
  for (const sx of [-1, 0, 1]) { add(new THREE.BoxGeometry(2.6, 5.2, 0.4), MAT.dark, M4(sx * 5.2, 1.2 + h * 0.68, l / 2 + 0.05)); add(new THREE.BoxGeometry(3.2, 0.4, 0.7), MAT.trav, M4(sx * 5.2, 1.2 + h * 0.68 - 2.8, l / 2 + 0.2)); }
  if (ruin) return;
  const p = new THREE.Vector3(-w / 2, h + 1.2, l / 2).applyMatrix4(T); cornice(b, MAT.trav, p.x, p.y, p.z, w, 0.9, 0.8, ry);
  const pp = new THREE.Vector3(0, h + 2.1, l / 2 + 0.2).applyMatrix4(T); pediment(b, mat, pp.x, pp.y, pp.z, w + 0.4, 1.2, 0.3, ry);
  const pr = new THREE.Vector3(0, h + 2.1, 0).applyMatrix4(T); gableRoof(b, MAT.roof, pr.x, pr.y, pr.z, w / 2 + 0.2, l, 0.3, ry);
}

// Insula (apartment block): arched shops on the ground floor, windows above, wooden balconies, tiled roof
export function insula(b, { x = 0, z = 0, ry = 0, w = 20, d = 14, floors = 4, fh = 3.4, mat = MAT.brick, plaster = null, ruin = 0, rnd = Math.random } = {}) {
  const T = M4(x, 0, z, ry), add = (g, m, m4) => b.add(g, m, new THREE.Matrix4().multiplyMatrices(T, m4));
  const H = floors * fh;
  const nb = Math.max(2, Math.round(w / 4));
  add(arcadeGeo(w, fh, 0.6, nb, { archW: w / nb * 0.6, spring: fh * 0.62 }), mat, M4(-w / 2, 0, d / 2 - 0.6));
  add(new THREE.BoxGeometry(w - 0.4, fh, d - 1.2), MAT.dark, M4(0, fh / 2, -0.3));
  const upper = plaster || mat;
  for (let f = 1; f < floors; f++) {
    if (ruin && f > 1 && rnd() < ruin) break;
    add(arcadeGeo(w, fh, 0.5, nb + 1, { archW: 1.0, spring: 1.4, sill: 1.0, rectWin: f > 1 }), upper, M4(-w / 2, f * fh, d / 2 - 0.5));
    add(new THREE.BoxGeometry(w - 0.4, fh, d - 1.0), MAT.dark, M4(0, f * fh + fh / 2, -0.25));
    for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.5, fh, d), upper, M4(sz * (w / 2 - 0.25), f * fh + fh / 2, 0));
    add(new THREE.BoxGeometry(w, fh, 0.5), upper, M4(0, f * fh + fh / 2, -d / 2 + 0.25));
  }
  for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.6, fh, d), mat, M4(sz * (w / 2 - 0.3), fh / 2, 0));
  add(new THREE.BoxGeometry(w, fh, 0.6), mat, M4(0, fh / 2, -d / 2 + 0.3));
  if (!ruin) {
    add(new THREE.BoxGeometry(w * 0.7, 0.18, 1.2), MAT.wood, M4(0, fh * 1.0 + 0.1, d / 2 + 0.6));
    for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.1, 1.0, 0.1), MAT.wood, M4(-w * 0.35 + i * w * 0.14, fh + 0.6, d / 2 + 1.15));
    add(new THREE.BoxGeometry(w * 0.7, 0.1, 0.1), MAT.wood, M4(0, fh + 1.1, d / 2 + 1.15));
    const pr = new THREE.Vector3(0, H, 0).applyMatrix4(T); gableRoof(b, MAT.roof, pr.x, pr.y, pr.z, d / 2, w, 0.3, ry + Math.PI / 2, 0.6);
  }
}

// Round hut of the Iron Age Palatine: wattle-and-daub wall, conical thatch, door
export function hut(b, { x = 0, z = 0, r = 2.6, h = 2.0, ry = 0 } = {}) {
  b.add(new THREE.CylinderGeometry(r, r * 1.04, h, 22, 1, true), MAT.mud, M4(x, h / 2, z, ry));
  b.add(new THREE.ConeGeometry(r * 1.35, r * 1.4, 22, 1, true), MAT.thatch, M4(x, h + r * 0.62, z, ry));
  b.add(new THREE.BoxGeometry(1.0, 1.6, 0.2), MAT.dark, M4(x + Math.sin(ry) * r, 0.8, z + Math.cos(ry) * r, ry));
  for (let k = 0; k < 2; k++) b.add(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6), MAT.wood, M4(x + Math.sin(ry) * (r + 0.2) + Math.cos(ry) * (k ? 0.6 : -0.6), 0.8, z + Math.cos(ry) * (r + 0.2) - Math.sin(ry) * (k ? 0.6 : -0.6)));
}
export function fence(b, x0, z0, x1, z1, h = 1.2) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 1.6)), a = Math.atan2(x1 - x0, z1 - z0);
  for (let i = 0; i <= n; i++) b.add(new THREE.CylinderGeometry(0.06, 0.08, h, 6), MAT.wood, M4(x0 + (x1 - x0) * i / n, h / 2, z0 + (z1 - z0) * i / n));
  for (const y of [h * 0.4, h * 0.8]) b.add(new THREE.BoxGeometry(0.06, 0.08, L), MAT.wood, M4((x0 + x1) / 2, y, (z0 + z1) / 2, a));
}

// Colosseum (Flavian Amphitheatre): 80 bays, three arcaded tiers (Tuscan, Ionic, Corinthian) and a windowed attic
export function colosseum(b, { x = 0, z = 0, a = 94, c = 78, ruin = false } = {}) {
  const tiers = [[0, 10.5, 'tuscan'], [10.5, 11.8, 'ionic'], [22.3, 11.6, 'corinthian']];
  const n = 80, mat = MAT.trav;
  const ell = (t, k = 1) => new THREE.Vector3(x + Math.cos(t) * a * k, 0, z + Math.sin(t) * c * k);
  for (let i = 0; i < n; i++) {
    const t0 = i / n * Math.PI * 2, t1 = (i + 1) / n * Math.PI * 2, tm = (t0 + t1) / 2;
    const p0 = ell(t0), p1 = ell(t1), pm = ell(tm), bay = p0.distanceTo(p1);
    const ang = Math.atan2(p1.x - p0.x, p1.z - p0.z) - Math.PI / 2;
    const broken = ruin && (Math.sin(tm * 1.0 + 0.6) > 0.35);
    for (const [y0, hh, order] of tiers) {
      if (broken && y0 > 10) continue;
      const T = M4(pm.x, y0, pm.z, ang);
      b.add(arcadeGeo(bay, hh, 2.2, 1, { archW: bay * 0.62, spring: hh * 0.6 }), mat, new THREE.Matrix4().multiplyMatrices(T, M4(-bay / 2, 0, -1.1)));
      const cp = new THREE.Vector3(-bay / 2, y0, 1.3).applyMatrix4(M4(pm.x, 0, pm.z, ang));
      column(b, mat, cp.x, y0, cp.z, hh - 1.2, 0.5, order);
      cornice(b, mat, ...new THREE.Vector3(-bay / 2, y0 + hh - 1.2, 1.1).applyMatrix4(M4(pm.x, 0, pm.z, ang)).toArray(), bay, 1.2, 0.7, ang);
    }
    if (!broken) {
      const T = M4(pm.x, 33.9, pm.z, ang);
      b.add(arcadeGeo(bay, 14, 2.2, 1, { archW: 1.4, spring: 1.6, sill: 5.5, rectWin: true }), mat, new THREE.Matrix4().multiplyMatrices(T, M4(-bay / 2, 0, -1.1)));
    }
    // inner rings and seating
    const ip = ell(tm, 0.86), ip2 = ell(tm, 0.62);
    b.add(new THREE.BoxGeometry(bay * 0.86, broken ? 18 : 30, 2.2), MAT.brick, M4(ip.x, broken ? 9 : 15, ip.z, ang));
    for (let s = 0; s < 6; s++) {
      const k = 0.84 - s * 0.04, sp = ell(tm, k), w2 = p0.distanceTo(p1) * k;
      b.add(new THREE.BoxGeometry(w2 + 0.05, 1.0, (a * 0.04)), MAT.marbleW, M4(sp.x, 4 + (5 - s) * 3.4 + (broken ? -4 : 0), sp.z, ang));
    }
    b.add(new THREE.BoxGeometry(bay * 0.62, 4.5, 1.5), MAT.trav, M4(ip2.x, 2.25, ip2.z, ang));
  }
}

// Aqueduct: two tiers of arches carrying a water channel, from p0 to p1
export function aqueduct(b, x0, z0, x1, z1, { h = 24, mat = MAT.trav } = {}) {
  const L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(x1 - x0, z1 - z0) - Math.PI / 2, n = Math.round(L / 9);
  const T = M4(x0, 0, z0, ang);
  b.add(arcadeGeo(L, h * 0.55, 3.0, n, { archW: L / n * 0.66, spring: h * 0.4 }), mat, new THREE.Matrix4().multiplyMatrices(T, M4(0, 0, -1.5)));
  b.add(arcadeGeo(L, h * 0.38, 2.6, n, { archW: L / n * 0.6, spring: h * 0.22 }), mat, new THREE.Matrix4().multiplyMatrices(T, M4(0, h * 0.55, -1.3)));
  b.add(new THREE.BoxGeometry(L, h * 0.09, 2.6), mat, new THREE.Matrix4().multiplyMatrices(T, M4(L / 2, h * 0.97, 0)));
}
