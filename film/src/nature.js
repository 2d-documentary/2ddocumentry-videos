// Trees, rocks, ships, animals' stand-ins and the 2D character billboards that live in the 3D world.
import * as THREE from 'three';
import { scene, camera, fbm, pbr, flat } from './engine.js';
import { Batch, M4, MAT } from './arch.js';

const leafMat = (col) => new THREE.MeshStandardMaterial({ color: col, roughness: 0.85, flatShading: false, vertexColors: true });
function lumpy(geo, amt, seed) {
  const p = geo.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i), n = fbm(v.x * 1.7 + seed, v.y * 1.7 + v.z * 1.3, 4, seed);
    v.multiplyScalar(1 + (n - 0.5) * amt); p.setXYZ(i, v.x, v.y, v.z);
    const k = 0.75 + n * 0.45 + (v.y > 0 ? 0.1 : -0.12); col[i * 3] = k; col[i * 3 + 1] = k; col[i * 3 + 2] = k;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); return geo;
}
function instanced(geo, mat, mats, { cast = true } = {}) {
  const im = new THREE.InstancedMesh(geo, mat, mats.length);
  mats.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = cast; im.receiveShadow = true; scene.add(im); return im;
}

// Mediterranean trees: stone pine (umbrella), cypress, holm oak. spots: [[x, z, scale], ...]
export function trees(kind, spots, groundY = () => 0) {
  const r = (i) => (Math.sin(i * 91.7) * 0.5 + 0.5);
  const T = [], C = [];
  spots.forEach(([x, z, s = 1], i) => {
    const y = groundY(x, z), rot = r(i) * 6.28;
    T.push(M4(x, y, z, rot, s, s * (0.9 + r(i + 3) * 0.3), s)); C.push(M4(x, y, z, rot, s, s, s));
  });
  if (kind === 'pine') {
    const trunk = new THREE.CylinderGeometry(0.22, 0.38, 9, 8); trunk.translate(0, 4.5, 0); trunk.rotateZ(0.06);
    instanced(trunk, pbr('wood', { size: 1.5, tint: 0x8a6a50 }), T);
    const can = lumpy(new THREE.SphereGeometry(4.2, 18, 10), 0.45, 3); can.scale(1, 0.38, 1); can.translate(0.5, 9.6, 0);
    instanced(can, leafMat(0x3c5a2a), C);
  } else if (kind === 'cypress') {
    const can = lumpy(new THREE.CylinderGeometry(0.15, 1.2, 11, 12, 6), 0.25, 5); can.translate(0, 6.3, 0);
    const p = can.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = Math.sin(Math.min(1, (y - 0.8) / 11) * Math.PI * 0.95 + 0.15); p.setX(i, p.getX(i) * k * 1.3); p.setZ(i, p.getZ(i) * k * 1.3); }
    can.computeVertexNormals();
    instanced(can, leafMat(0x2a4220), C);
    const tr = new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6); tr.translate(0, 0.6, 0); instanced(tr, pbr('wood', { size: 1, tint: 0x6a5040 }), T);
  } else {
    const trunk = new THREE.CylinderGeometry(0.25, 0.42, 4, 8); trunk.translate(0, 2, 0); instanced(trunk, pbr('wood', { size: 1.5, tint: 0x7a6a58 }), T);
    const can = lumpy(new THREE.IcosahedronGeometry(3.4, 3), 0.55, 9); can.scale(1, 0.75, 1); can.translate(0, 5.6, 0);
    instanced(can, leafMat(0x4a5e30), C);
  }
}
export function rocks(spots, groundY = () => 0) {
  const g = lumpy(new THREE.IcosahedronGeometry(1, 2), 0.6, 2); g.deleteAttribute('color');
  instanced(g, pbr('rock', { size: 2 }), spots.map(([x, z, s], i) => M4(x, groundY(x, z) - s * 0.2, z, i, s, s * 0.6, s * 0.9)));
}
export function bushes(spots, groundY = () => 0, col = 0x56693a) {
  const g = lumpy(new THREE.IcosahedronGeometry(1, 2), 0.5, 4);
  instanced(g, leafMat(col), spots.map(([x, z, s], i) => M4(x, groundY(x, z) + s * 0.3, z, i, s, s * 0.7, s)), { cast: false });
}

// Ancient galley (trireme / quinquereme style): curved hull, bronze ram, oars, mast and square sail
export function galley({ x = 0, y = 0, z = 0, ry = 0, L = 36, B = 5, hullCol = 0x2a2420, sail = 0xe8dcc0, sailStripe = 0x9b2226, oars = true, sailUp = true, eye = true } = {}) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; scene.add(grp);
  const nU = 40, nV = 12, pos = [], idx = [];
  for (let i = 0; i <= nU; i++) {
    const u = i / nU, xx = (u - 0.5) * L;
    const w = B / 2 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 0.55);
    const deck = 1.6 + 1.6 * Math.pow(Math.abs(u - 0.45) * 2, 3), keel = -1.4 * Math.pow(Math.sin(Math.PI * u), 0.4);
    for (let j = 0; j <= nV; j++) { const a = Math.PI * j / nV; pos.push(xx, deck - (deck - keel) * Math.pow(Math.sin(a), 0.6), -Math.cos(a) * w); }
  }
  for (let i = 0; i < nU; i++) for (let j = 0; j < nV; j++) { const a = i * (nV + 1) + j, b = a + nV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i); p.setY(i, yy - 1.4); }
  g.computeVertexNormals();
  const hullMat = pbr('wood', { size: 1.4, tint: hullCol, side: THREE.DoubleSide, key: 'hull' + hullCol });
  const hull = new THREE.Mesh(g, hullMat); hull.castShadow = true; hull.receiveShadow = true; grp.add(hull);
  const b = new Batch();
  b.add(new THREE.BoxGeometry(L * 0.86, 0.15, B * 0.8), MAT.wood, M4(0, 0.25, 0));
  b.add(new THREE.ConeGeometry(0.5, 2.6, 4), MAT.bronze, M4(L / 2 + 0.6, -0.8, 0, 0, 1, 1, 1, 0, -Math.PI / 2));
  b.add(new THREE.TorusGeometry(1.4, 0.18, 8, 16, Math.PI * 1.2), MAT.wood, M4(-L / 2 + 0.6, 2.2, 0, 0, 1, 1, 1, 0, 0.6));
  if (oars) for (let k = 0; k < 2; k++) for (let i = 0; i < 18; i++) b.add(new THREE.BoxGeometry(0.1, 0.1, 7.5), MAT.wood, M4(-L * 0.32 + i * L * 0.034, -0.6, (k ? 1 : -1) * (B / 2 + 2.6), 0, 1, 1, 1, (k ? 1 : -1) * 0.38, 0));
  b.add(new THREE.CylinderGeometry(0.16, 0.2, 13, 8), MAT.wood, M4(-1, 6.5, 0));
  b.add(new THREE.CylinderGeometry(0.1, 0.1, 10, 6), MAT.wood, M4(-1, 11.5, 0, 0, 1, 1, 1, Math.PI / 2, 0));
  b.build(grp);
  if (sailUp) {
    const sg = new THREE.PlaneGeometry(9.5, 7, 12, 8); const sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { const u = sp.getX(i) / 4.75, v = sp.getY(i) / 3.5; sp.setZ(i, (1 - u * u) * (1 - v * v * 0.6) * 1.1); }
    sg.computeVertexNormals();
    const cvs = document.createElement('canvas'); cvs.width = 256; cvs.height = 256; const cx = cvs.getContext('2d');
    cx.fillStyle = '#' + sail.toString(16).padStart(6, '0'); cx.fillRect(0, 0, 256, 256);
    cx.fillStyle = '#' + sailStripe.toString(16).padStart(6, '0'); cx.fillRect(0, 96, 256, 40);
    for (let i = 0; i < 2000; i++) { cx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; cx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    const st = new THREE.CanvasTexture(cvs); st.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: st, roughness: 0.9, side: THREE.DoubleSide }));
    s.position.set(-0.6, 7.3, 0); s.rotation.y = Math.PI / 2; s.castShadow = true; grp.add(s);
  }
  if (eye) for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.CircleGeometry(0.35, 16), flat(0xf0e8d8)); e.position.set(L / 2 - 2.5, 0.2, sz * (B * 0.33)); e.rotation.y = sz > 0 ? 0 : Math.PI; grp.add(e); }
  return grp;
}

// ------------------------------------------------------------------ 2D character billboards
const SPR = {}; const texL = new THREE.TextureLoader();
let META = { viewBox: [-170, -360, 340, 380], unitsPerMetre: 233 / 1.65 };
export function setSpriteMeta(m) { META = m; }
function sprite(path) {
  if (!SPR[path]) { const t = texL.load(path); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; SPR[path] = t; }
  return SPR[path];
}
export class Actor {
  constructor(id, { x = 0, y = 0, z = 0, scale = 1, expr = 'neutral', view = 'f', flip = false, dir = 'sprites/' } = {}) {
    this.id = id; this.dir = dir; this.expr = expr; this.view = view; this.mouth = 0; this.flip = flip;
    const [vx, vy, vw, vh] = (META.special && META.special[id] && META.special[id].viewBox) || META.viewBox, k = 1 / META.unitsPerMetre * scale;
    this.w = vw * k; this.h = vh * k;
    const g = new THREE.PlaneGeometry(this.w, this.h); g.translate((vx + vw / 2) * k, -(vy + vh / 2) * k, 0);
    this.mat = new THREE.MeshStandardMaterial({ map: sprite(this.path()), alphaTest: 0.5, transparent: false, roughness: 1, metalness: 0, side: THREE.DoubleSide });
    this.mat.emissive = new THREE.Color(0xffffff); this.mat.emissiveMap = this.mat.map; this.mat.emissiveIntensity = 0.45;
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.castShadow = true; this.mesh.receiveShadow = false;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.mat.map, alphaTest: 0.5 });
    this.root = new THREE.Group(); this.root.add(this.mesh); this.root.position.set(x, y, z); scene.add(this.root);
    const blob = new THREE.Mesh(new THREE.CircleGeometry(0.42 * scale, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.02; blob.scale.set(1.3, 0.8, 1); this.root.add(blob);
    this.mesh.onBeforeRender = () => this.face();
  }
  path() { return `${this.dir}${this.id}_${this.expr}_${this.view}_${this.mouth}.png`; }
  set(o) {
    Object.assign(this, o);
    const t = sprite(this.path()); if (this.mat.map !== t) { this.mat.map = t; this.mat.emissiveMap = t; this.mesh.customDepthMaterial.map = t; this.mat.needsUpdate = true; }
  }
  face() {  // turn toward the camera around Y only, so the character stays upright on the ground
    const c = camera.position, p = this.root.position;
    this.mesh.rotation.y = Math.atan2(c.x - p.x, c.z - p.z);
    this.mesh.scale.x = this.flip ? -1 : 1;
  }
}
