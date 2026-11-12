// Street life in 3D: market stalls with produce, carts, amphorae, crates and sacks, fountains, statues,
// potted plants, awnings, banners, lamps, haystacks. All batched, so dense scenes stay fast.
import * as THREE from 'three';
import { scene, pbr, flat, water } from './engine.js';
import { Batch, M4, MAT, column, gableRoof } from './arch.js';

const FABC = ['#9b2226', '#c9a227', '#2f5a7a', '#5e7a4a', '#e8dcc0', '#8a3a6a'], FRUITC = [0xc83a2a, 0xe0a030, 0x6a8a2a, 0x6a2a5a, 0xd8c050, 0x8a5a2a];
let _fab, _fruit;
const FAB = new Proxy([], { get: (t, k) => (_fab ||= FABC.map((c) => pbr('plaster', { size: 1.2, tint: parseInt(c.slice(1), 16), rough: 1.4, env: 0.4, key: 'fab' + c })))[k] });
const FRUIT = new Proxy([], { get: (t, k) => (_fruit ||= FRUITC.map((c) => flat(c, 0.55)))[k] });
// footprints of props, so crowds never stand inside a stall or a cart: [x, z, r]
export const BLOCK = [];
export const blocked = (x, z, pad = 0.35) => BLOCK.some(([bx, bz, r]) => (x - bx) ** 2 + (z - bz) ** 2 < (r + pad) ** 2);
const T = (b, m, x, y, z, ry, local) => new THREE.Matrix4().multiplyMatrices(M4(x, y, z, ry), local);

export function stall(b, x, z, ry = 0, s = 0, y = 0) { BLOCK.push([x, z, 2.0]);
  const fab = FAB[s % 6], fab2 = FAB[(s + 4) % 6];
  const add = (g, m, l) => b.add(g, m, T(b, m, x, y, z, ry, l));
  for (const [px, pz] of [[-1.5, -0.9], [1.5, -0.9], [-1.5, 0.9], [1.5, 0.9]]) add(new THREE.CylinderGeometry(0.06, 0.07, 2.4, 6), MAT.wood, M4(px, 1.2, pz));
  add(new THREE.BoxGeometry(3.2, 0.1, 1.4), MAT.wood, M4(0, 0.9, 0.2)); add(new THREE.BoxGeometry(3.2, 0.85, 0.08), MAT.wood, M4(0, 0.45, 0.88));
  // striped awning with a slight sag
  for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(3.4 / 6, 0.03, 2.2), i % 2 ? fab : fab2, M4(-1.7 + 3.4 / 6 * (i + 0.5), 2.45, 0.1, 0, 1, 1, 1, -0.18, 0));
  // baskets of produce, jars, cloth bolts
  for (let i = 0; i < 4; i++) {
    const bx = -1.15 + i * 0.77;
    add(new THREE.CylinderGeometry(0.3, 0.24, 0.2, 14), MAT.wood, M4(bx, 1.05, 0.3));
    const fm = FRUIT[(s + i) % 6];
    for (let k = 0; k < 7; k++) add(new THREE.SphereGeometry(0.065, 8, 6), fm, M4(bx + Math.cos(k * 2.3) * 0.16, 1.18 + (k % 2) * 0.05, 0.3 + Math.sin(k * 2.3) * 0.16));
  }
  for (let i = 0; i < 3; i++) amphora(b, x + Math.cos(ry) * (-1.2 + i * 0.5) + Math.sin(ry) * -0.7, y, z - Math.sin(ry) * (-1.2 + i * 0.5) + Math.cos(ry) * -0.7, 0.75);
}
export function amphora(b, x, y, z, s = 1, ry = 0, lean = 0) { BLOCK.push([x, z, 0.3 * s]);
  const pts = [[0.02, 0], [0.09, 0.08], [0.2, 0.28], [0.24, 0.5], [0.2, 0.72], [0.09, 0.84], [0.07, 1.0], [0.09, 1.04]].map(([r, h]) => new THREE.Vector2(r * s, h * s));
  b.add(new THREE.LatheGeometry(pts, 14), MAT.terracotta, M4(x, y, z, ry, 1, 1, 1, lean, 0));
  for (const sz of [-1, 1]) b.add(new THREE.TorusGeometry(0.07 * s, 0.015 * s, 5, 10, Math.PI), MAT.terracotta, M4(x + sz * 0.12 * s, y + 0.86 * s, z, ry, 1, 1, 1, 0, sz * -Math.PI / 2));
}
export function cart(b, x, z, ry = 0, y = 0, load = 'jars') { BLOCK.push([x, z, 2.2], [x + Math.cos(ry) * 2.2, z - Math.sin(ry) * 2.2, 0.8]);
  const add = (g, m, l) => b.add(g, m, T(b, m, x, y, z, ry, l));
  add(new THREE.BoxGeometry(2.4, 0.1, 1.4), MAT.wood, M4(0, 0.85, 0));
  for (const sz of [-1, 1]) add(new THREE.BoxGeometry(2.4, 0.4, 0.06), MAT.wood, M4(0, 1.08, sz * 0.68));
  add(new THREE.BoxGeometry(0.06, 0.4, 1.4), MAT.wood, M4(-1.2, 1.08, 0));
  for (const sz of [-1, 1]) { add(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 20), MAT.wood, M4(0, 0.62, sz * 0.82, 0, 1, 1, 1, Math.PI / 2, 0)); add(new THREE.TorusGeometry(0.6, 0.04, 6, 20), MAT.bronze, M4(0, 0.62, sz * 0.88)); }
  add(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), MAT.wood, M4(2.2, 0.75, 0.3, 0, 1, 1, 1, 0, Math.PI / 2)); add(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), MAT.wood, M4(2.2, 0.75, -0.3, 0, 1, 1, 1, 0, Math.PI / 2));
  if (load === 'jars') for (let i = 0; i < 6; i++) amphora(b, x + Math.cos(ry) * (-0.8 + (i % 3) * 0.6) + Math.sin(ry) * ((i < 3 ? 0.3 : -0.3)), y + 0.9, z - Math.sin(ry) * (-0.8 + (i % 3) * 0.6) + Math.cos(ry) * (i < 3 ? 0.3 : -0.3), 0.7, 0, 0.3);
  else for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.35, 10, 8), MAT.sack, M4(-0.7 + (i % 3) * 0.6, 1.2 + Math.floor(i / 3) * 0.3, (i % 2) * 0.3 - 0.15, 0, 1.2, 0.8, 1));
}
export function crates(b, x, z, y = 0, n = 5, seed = 1) { BLOCK.push([x + 0.4, z + 0.3, 1.6]);
  for (let i = 0; i < n; i++) { const r = Math.sin(seed * 31 + i * 7.1) * 0.5 + 0.5; b.add(new THREE.BoxGeometry(0.7, 0.55, 0.6), MAT.wood, M4(x + (i % 3) * 0.75, y + 0.28 + Math.floor(i / 3) * 0.56, z + r * 0.2, r)); }
  for (let i = 0; i < n; i++) b.add(new THREE.SphereGeometry(0.32, 10, 8), MAT.sack, M4(x - 0.9 - (i % 2) * 0.55, y + 0.26, z + (i >> 1) * 0.5, 0, 1.1, 0.8, 1));
}
export function fountain(b, x, z, y = 0, r = 3) { BLOCK.push([x, z, r + 0.3]);
  b.add(new THREE.CylinderGeometry(r, r + 0.2, 0.7, 40, 1, true), MAT.marbleW, M4(x, y + 0.35, z));
  b.add(new THREE.TorusGeometry(r, 0.18, 8, 40), MAT.marbleW, M4(x, y + 0.7, z, 0, 1, 1, 1, Math.PI / 2, 0));
  b.add(new THREE.CylinderGeometry(0.3, 0.45, 2.2, 16), MAT.marbleW, M4(x, y + 1.1, z)); b.add(new THREE.CylinderGeometry(1.0, 0.3, 0.35, 24), MAT.marbleW, M4(x, y + 2.2, z));
  const w = water([r * 2 - 0.2, r * 2 - 0.2], { color: 0x3a6a70, pos: [x, y + 0.55, z], ripple: 0.4 }); w.geometry = new THREE.CircleGeometry(r - 0.1, 40).rotateX(-Math.PI / 2);
}
// togate statue on a pedestal (draped body, head, raised arm), marble or bronze
export function statue(b, x, z, y = 0, ry = 0, mat = MAT.marbleW, h = 2.4) { BLOCK.push([x, z, 1.1]);
  const add = (g, l) => b.add(g, mat, T(b, mat, x, y, z, ry, l));
  b.add(new THREE.BoxGeometry(1.3, 1.6, 1.3), MAT.trav, M4(x, y + 0.8, z, ry)); b.add(new THREE.BoxGeometry(1.5, 0.2, 1.5), MAT.trav, M4(x, y + 1.6, z, ry));
  const s = h / 2.4, base = 1.7;
  add(new THREE.LatheGeometry([[0.0, 0], [0.42, 0], [0.4, 0.4], [0.34, 1.0], [0.3, 1.45], [0.34, 1.65], [0.2, 1.8], [0, 1.82]].map(([r, hh]) => new THREE.Vector2(r * s, hh * s)), 20), M4(0, base, 0));
  add(new THREE.BoxGeometry(0.75 * s, 1.2 * s, 0.1 * s), M4(-0.05 * s, base + 1.0 * s, 0.28 * s, 0, 1, 1, 1, 0, 0.35));   // toga fold
  add(new THREE.SphereGeometry(0.17 * s, 16, 12), M4(0, base + 2.0 * s, 0));
  add(new THREE.CylinderGeometry(0.07 * s, 0.08 * s, 0.75 * s, 8), M4(0.35 * s, base + 1.85 * s, 0.1 * s, 0, 1, 1, 1, 0.4, -0.9));
}
export function planter(b, x, z, y = 0, s = 1) { BLOCK.push([x, z, 0.5 * s]);
  b.add(new THREE.CylinderGeometry(0.45 * s, 0.32 * s, 0.6 * s, 16), MAT.terracotta, M4(x, y + 0.3 * s, z));
  for (let i = 0; i < 7; i++) b.add(new THREE.IcosahedronGeometry(0.28 * s, 1), MAT.leaf, M4(x + Math.cos(i) * 0.2 * s, y + (0.75 + (i % 3) * 0.2) * s, z + Math.sin(i) * 0.2 * s));
}
export function lampPost(b, x, z, y = 0) { BLOCK.push([x, z, 0.2]);
  b.add(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 8), MAT.bronze, M4(x, y + 1.3, z)); b.add(new THREE.CylinderGeometry(0.22, 0.08, 0.2, 10), MAT.bronze, M4(x, y + 2.65, z));
}
export function banner(b, x, y, z, ry = 0, col = 0) { b.add(new THREE.BoxGeometry(1.2, 3.2, 0.04), FAB[col % 6], M4(x, y, z, ry)); b.add(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), MAT.wood, M4(x, y + 1.65, z, ry, 1, 1, 1, 0, Math.PI / 2)); }
export function haystack(b, x, z, y = 0, s = 1) { BLOCK.push([x, z, 1.5 * s]); b.add(new THREE.ConeGeometry(1.4 * s, 2.2 * s, 16), MAT.thatch, M4(x, y + 1.1 * s, z)); b.add(new THREE.CylinderGeometry(1.4 * s, 1.4 * s, 0.6 * s, 16), MAT.thatch, M4(x, y + 0.3 * s, z)); }
export function woodpile(b, x, z, y = 0, ry = 0) { BLOCK.push([x + 0.4, z, 1.0]); for (let i = 0; i < 14; i++) b.add(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 6), MAT.wood, M4(x + (i % 5) * 0.21, y + 0.1 + Math.floor(i / 5) * 0.19, z, ry, 1, 1, 1, Math.PI / 2, 0)); }
export function awnings(b, x, y, z, w, ry, n, s = 0) {   // over shop arches of an insula front
  for (let i = 0; i < n; i++) { const off = -w / 2 + w / n * (i + 0.5); b.add(new THREE.BoxGeometry(w / n * 0.8, 0.04, 1.4), FAB[(s + i) % 6], new THREE.Matrix4().multiplyMatrices(M4(x, y, z, ry), M4(off, 0, 0.6, 0, 1, 1, 1, 0.25, 0))); }
}
// cooking fire: ring of stones, logs, glowing embers, a pot on a tripod
export function firepit(b, x, z, y = 0) { BLOCK.push([x, z, 1.1]);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; b.add(new THREE.IcosahedronGeometry(0.22, 0), pbr('rock', { size: 1 }), M4(x + Math.cos(a) * 0.8, y + 0.1, z + Math.sin(a) * 0.8, a, 1, 0.7, 1)); }
  for (let i = 0; i < 4; i++) b.add(new THREE.CylinderGeometry(0.07, 0.08, 1.1, 6), MAT.wood, M4(x, y + 0.15, z, i * 0.8, 1, 1, 1, Math.PI / 2 - 0.15, 0));
  b.add(new THREE.SphereGeometry(0.45, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), MAT.ember, M4(x, y, z, 0, 1, 0.35, 1));
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; b.add(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 5), MAT.wood, M4(x + Math.cos(a) * 0.45, y + 0.85, z + Math.sin(a) * 0.45, 0, 1, 1, 1, Math.sin(a) * 0.25, -Math.cos(a) * 0.25)); }
  b.add(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, Math.PI / 3, Math.PI), MAT.dark, M4(x, y + 1.0, z));
}
// broken column drums and blocks lying in the grass (ruins)
export function rubble(b, x, z, y = 0, n = 6, seed = 1) {
  for (let i = 0; i < n; i++) { const r = Math.sin(seed * 13.1 + i * 3.7) * 0.5 + 0.5, a = i * 2.4 + seed;
    if (i % 2) b.add(new THREE.CylinderGeometry(0.6, 0.6, 1.2 + r, 18), MAT.marbleW, M4(x + Math.cos(a) * (1 + i), y + 0.6, z + Math.sin(a) * (1 + i), a, 1, 1, 1, Math.PI / 2, 0));
    else b.add(new THREE.BoxGeometry(1.4 + r, 0.7, 0.9), MAT.trav, M4(x + Math.cos(a) * (1 + i), y + 0.35, z + Math.sin(a) * (1 + i), a)); }
}
// the bronze Colossus beside the Colosseum (about 30 m)
export function colossus(b, x, z, ry = 0) { BLOCK.push([x, z, 7.5]); statue(b, x, z, 0, ry, MAT.bronze, 2.4); const s = 12;
  const T = (l) => new THREE.Matrix4().multiplyMatrices(M4(x, 0, z, ry), l);
  b.add(new THREE.BoxGeometry(14, 6, 14), MAT.trav, T(M4(0, 3, 0)));
  b.add(new THREE.LatheGeometry([[0, 0], [0.42, 0], [0.4, 0.4], [0.34, 1.0], [0.3, 1.45], [0.34, 1.65], [0.2, 1.8], [0, 1.82]].map(([r, h]) => new THREE.Vector2(r * s, h * s)), 24), MAT.bronze, T(M4(0, 6, 0)));
  b.add(new THREE.SphereGeometry(0.17 * s, 16, 12), MAT.bronze, T(M4(0, 6 + 2.0 * s, 0)));
  for (let i = 0; i < 7; i++) b.add(new THREE.ConeGeometry(0.06 * s, 0.35 * s, 6), MAT.gold, T(M4(Math.cos(i * 0.6 - 1.8) * 0.17 * s, 6 + 2.2 * s, Math.sin(i * 0.6 - 1.8) * 0.17 * s, 0, 1, 1, 1, Math.sin(i * 0.6 - 1.8) * 0.6, -Math.cos(i * 0.6 - 1.8) * 0.6)));
  b.add(new THREE.CylinderGeometry(0.07 * s, 0.08 * s, 0.9 * s, 8), MAT.bronze, T(M4(0.35 * s, 6 + 1.85 * s, 0.1 * s, 0, 1, 1, 1, 0.4, -0.9)));
}
// vineyard rows on posts
export function vineyard(b, x, z, w, d, ry = 0, y = (x, z) => 0) {
  for (let i = 0; i * 2.2 < d; i++) for (let j = 0; j * 1.6 < w; j++) {
    const lx = -w / 2 + j * 1.6, lz = -d / 2 + i * 2.2, c = Math.cos(ry), s = Math.sin(ry), px = x + lx * c + lz * s, pz = z - lx * s + lz * c, py = y(px, pz);
    b.add(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 5), MAT.wood, M4(px, py + 0.75, pz));
    b.add(new THREE.IcosahedronGeometry(0.5, 1), MAT.leaf, M4(px, py + 1.15, pz, j, 1.4, 0.7, 0.6));
  }
}
// farmhouse (villa rustica): plastered walls round a yard, tiled roofs
export function farmhouse(b, x, z, y = 0, ry = 0) { BLOCK.push([x, z, 11]);
  const T = (l) => new THREE.Matrix4().multiplyMatrices(M4(x, y, z, ry), l);
  b.add(new THREE.BoxGeometry(18, 1, 14), MAT.blocks, T(M4(0, -0.3, 0)));
  for (const [lx, lz, w, d] of [[0, -5, 18, 4], [-7, 1, 4, 10], [7, 1, 4, 10]]) { b.add(new THREE.BoxGeometry(w, 4, d), MAT.plaster, T(M4(lx, 2, lz)));
    const p = new THREE.Vector3(lx, 4, lz).applyMatrix4(M4(x, y, z, ry)); gableRoof(b, MAT.roof, p.x, p.y, p.z, Math.min(w, d) / 2, Math.max(w, d), 0.35, ry + (w > d ? Math.PI / 2 : 0), 0.4); }
  for (let i = 0; i < 4; i++) b.add(new THREE.BoxGeometry(1.0, 1.6, 0.1), MAT.dark, T(M4(-5 + i * 3.3, 0.8, -2.95)));
}
