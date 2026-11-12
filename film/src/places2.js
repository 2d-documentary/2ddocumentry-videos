// More locations: Italian countryside with a Roman road and camp, shipyard, sea battle, the Alps, Gaul,
// the Rubicon, an imperial palace hall, Constantinople, Ravenna, and the historical map table.
import * as THREE from 'three';
import { scene, sky, sun, hemi, water, terrain, fbm, pbr, flat, point, renderer } from './engine.js';
import { Batch, M4, MAT, temple, basilica, curia, insula, hut, fence, column, cornice, arcadeGeo, archRing, stairs, dome, entablature, gableRoof, pediment } from './arch.js';
import { trees, rocks, bushes, galley } from './nature.js';

const R = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
async function light(mood = 'day') {
  const L = {
    day: ['day', 1.0, 0xc8d8e8, 0.0008, [0.55, 0.62, 0.35], 0xfff0dc, 3.4],
    golden: ['golden', 0.9, 0xd8b48a, 0.0010, [-0.8, 0.28, 0.4], 0xffc68a, 3.0],
    dusk: ['dusk', 0.6, 0x8a7a8a, 0.0014, [-0.9, 0.14, 0.3], 0xff9a5a, 2.2],
    overcast: ['overcast', 1.0, 0xb8bcc0, 0.0016, [0.3, 0.9, 0.2], 0xe8ecf0, 1.3],
  }[mood];
  await sky(L[0], { envIntensity: L[1], fog: L[2], fogDensity: L[3] });
  sun({ dir: L[4], color: L[5], intensity: L[6], size: 170 }); hemi(0xbcd4ee, 0x7a6a58, mood === 'overcast' ? 0.5 : 0.32);
}
const spots = (r, n, x0, x1, z0, z1, s0, s1, avoid) => { const o = []; let k = 0; while (o.length < n && k++ < n * 20) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); if (avoid && avoid(x, z)) continue; o.push([x, z, s0 + r() * (s1 - s0)]); } return o; };

// ------------------------------------------------------------------ Italy: hills, a paved Roman road, a legion's camp
export async function countryside({ mood = 'day' } = {}) {
  await light(mood); const r = R(31);
  const ground = (x, z) => { let h = fbm(x / 260, z / 260, 5, 4) * 60 + fbm(x / 60, z / 60, 3, 8) * 4 - 18; const road = Math.abs(x - 10 * Math.sin(z / 200)); return h * THREE.MathUtils.smoothstep(road, 10, 90) + 0.0; };
  terrain({ size: 3000, seg: 260, height: ground, mat: pbr('grass', { size: 7, tint: 0xd8d4a8 }) });
  // via: paved strip following the valley floor (straight, as Roman roads were)
  const rg = new THREE.PlaneGeometry(6, 2400, 1, 200).rotateX(-Math.PI / 2); const p = rg.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setX(i, p.getX(i) + 10 * Math.sin(z / 200)); p.setY(i, 0.12); }
  const road = new THREE.Mesh(rg, MAT.paving); road.receiveShadow = true; scene.add(road);
  const b = new Batch();
  for (let z = -1100; z < 1100; z += 22) b.add(new THREE.BoxGeometry(0.4, 1.4, 0.4), MAT.trav, M4(10 * Math.sin(z / 200) + 4.2, 0.7, z));   // milestones / kerb posts
  // castra: square earth rampart + palisade, rows of leather tents, headquarters tent
  const cx = 160, cz = -120, S = 120;
  for (const [x0, z0, x1, z1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) {
    const L = Math.hypot((x1 - x0) * S, (z1 - z0) * S) / 2, ang = Math.atan2(x1 - x0, z1 - z0);
    b.add(new THREE.BoxGeometry(3, 2.2, L * 2), MAT.mud, M4(cx + (x0 + x1) * S / 4, 1.1, cz + (z0 + z1) * S / 4, ang));
    fence(b, cx + x0 * S / 2, cz + z0 * S / 2, cx + x1 * S / 2, cz + z1 * S / 2, 3.2);
  }
  const tent = (x, z, s = 1, col = MAT.mud) => { gableRoof(b, pbr('wood', { size: 1.5, tint: 0xa88a62, key: 'leather' }), x, 0.2, z, 1.6 * s, 3.2 * s, 1.0, 0, 0.1); };
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) if (Math.abs(i) > 1 || Math.abs(j) > 1) tent(cx + i * 9, cz + j * 9);
  b.add(new THREE.BoxGeometry(12, 4, 9), pbr('wood', { size: 1.5, tint: 0x9a3a2a, key: 'redtent' }), M4(cx, 2, cz)); gableRoof(b, pbr('wood', { size: 1.5, tint: 0x9a3a2a, key: 'redtent' }), cx, 4, cz, 4.5, 12, 0.5, Math.PI / 2);
  // a fortified hill town in the distance
  for (let i = 0; i < 40; i++) { const x = -420 + r() * 120, z = 380 + r() * 100, y = ground(x, z); b.add(new THREE.BoxGeometry(8, 6, 7), MAT.plaster, M4(x, y + 2.5, z)); gableRoof(b, MAT.roof, x, y + 5.5, z, 3.5, 8, 0.3, 0, 0.3); }
  b.build();
  trees('cypress', Array.from({ length: 40 }, (_, i) => [10 * Math.sin((i * 50 - 1000) / 200) + (i % 2 ? 9 : -9), i * 50 - 1000, 1]), ground);
  trees('pine', spots(r, 70, -800, 800, -800, 800, 0.9, 1.4, (x, z) => Math.abs(x) < 30 || Math.hypot(x - cx, z - cz) < 90), ground);
  trees('oak', spots(r, 140, -1200, 1200, -1200, 1200, 0.9, 1.5, (x, z) => Math.abs(x) < 30 || Math.hypot(x - cx, z - cz) < 90), ground);
  rocks(spots(r, 40, -400, 400, -400, 400, 0.6, 2.2, (x, z) => Math.abs(x) < 20), ground);
  return { ground, cams: { wide: { pos: [-120, 60, 260], look: [60, 0, -60], fov: 40 }, road: { pos: [-3, 1.7, 40], look: [6, 1.6, -40], fov: 44 }, camp: { pos: [60, 30, 40], look: [160, 0, -120], fov: 42 } } };
}

// ------------------------------------------------------------------ Roman shipyard: hulls on slipways, ribs, scaffolding
export async function shipyard({ mood = 'day' } = {}) {
  await light(mood); const r = R(41);
  const ground = (x, z) => (z < 40 ? 1.2 + fbm(x / 200, z / 200, 3, 2) * 4 * THREE.MathUtils.smoothstep(-z, 60, 300) : 1.2 - (z - 40) * 0.12);
  terrain({ size: 2400, seg: 200, height: ground, mat: pbr('sand', { size: 5, tint: 0xd8c8a8 }) });
  water([3000, 3000], { color: 0x23606a, pos: [0, -0.3, 0], ripple: 0.8 });
  const b = new Batch();
  for (let k = 0; k < 4; k++) {
    const x = -60 + k * 40, done = k / 3;
    b.add(new THREE.BoxGeometry(8, 0.6, 70), MAT.wood, M4(x, 0.6, 30, 0, 1, 1, 1, -0.06, 0));
    for (let i = 0; i < 22; i++) {               // ribs (frames) of the hull
      const z = 2 + i * 2.6, s = Math.sin(Math.PI * i / 21) ** 0.5;
      const rib = new THREE.TorusGeometry(2.6 * s + 0.4, 0.12, 6, 14, Math.PI);
      b.add(rib, MAT.wood, M4(x, 3.4, z, 0, 1, 1.1, 1, 0, Math.PI));
    }
    b.add(new THREE.BoxGeometry(0.4, 0.5, 60), MAT.wood, M4(x, 0.9, 30));
    if (done > 0.3) for (let i = 0; i < Math.round(done * 6); i++) b.add(new THREE.BoxGeometry(5.6 - i * 0.2, 0.18, 54), MAT.wood, M4(x, 1.0 + i * 0.55, 30));
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { b.add(new THREE.CylinderGeometry(0.1, 0.1, 7, 6), MAT.wood, M4(x + sx * 4.5, 3.5, 6 + i * 10)); b.add(new THREE.BoxGeometry(0.3, 0.12, 9), MAT.wood, M4(x + sx * 4.5, 5.5, 6 + i * 10)); }
  }
  // sheds and timber stacks
  for (let i = 0; i < 6; i++) { b.add(new THREE.BoxGeometry(14, 6, 10), MAT.wood, M4(-90 + i * 30, 3 + 1.2, -40)); gableRoof(b, MAT.roof, -90 + i * 30, 7.2, -40, 5, 14, 0.4, Math.PI / 2); }
  for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) b.add(new THREE.CylinderGeometry(0.35, 0.35, 12, 8), MAT.wood, M4(110 + i * 0.75, 1.6 + j * 0.65, -10, 0, 1, 1, 1, Math.PI / 2, 0));
  b.build();
  galley({ x: 120, y: -0.2, z: 120, ry: 0.4 }); galley({ x: 40, y: -0.2, z: 180, ry: 1.0, sail: 0xe8dcc0, sailStripe: 0x9b2226 });
  trees('pine', spots(r, 50, -500, 500, -500, -80, 1, 1.4), ground);
  return { ground, cams: { wide: { pos: [-140, 40, 160], look: [0, 2, 20], fov: 42 }, ribs: { pos: [-10, 3.2, 70], look: [-20, 3, 20], fov: 46 } } };
}

// ------------------------------------------------------------------ naval battle on the open sea
export async function seaBattle({ mood = 'overcast' } = {}) {
  await light(mood); const r = R(51);
  water([6000, 6000], { color: 0x1d4a5a, pos: [0, 0, 0], ripple: 1.4 });
  for (let i = 0; i < 14; i++) { const roman = i < 7; galley({ x: (roman ? -1 : 1) * (60 + r() * 140), y: -0.2, z: -200 + i % 7 * 70 + r() * 30, ry: roman ? Math.PI * 0.05 + r() * 0.3 : Math.PI + r() * 0.3, hullCol: roman ? 0x3a2a22 : 0x2a2a3a, sailStripe: roman ? 0x9b2226 : 0x5a2a6a, sailUp: r() < 0.6 }); }
  const smoke = new THREE.MeshBasicMaterial({ color: 0x6a6a6a, transparent: true, opacity: 0.25, depthWrite: false });
  for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(4 + r() * 6, 10, 8), smoke); m.position.set((r() - 0.5) * 120, 4 + r() * 20, (r() - 0.5) * 300); scene.add(m); }
  return { ground: () => 0, cams: { wide: { pos: [-260, 40, 220], look: [0, 0, -40], fov: 40 }, sea: { pos: [-40, 2.2, 80], look: [60, 4, -40], fov: 44 } } };
}

// ------------------------------------------------------------------ the Alps in snow, a pass and a narrow track
export async function alps({ mood = 'overcast' } = {}) {
  await light(mood); scene.fog.color.set(0xd0d6de); scene.fog.density = 0.0011; const r = R(61);
  const ground = (x, z) => { const ridge = Math.abs(fbm(x / 420, z / 420, 6, 3) - 0.5) * 2; let h = (1 - ridge) * 520 + fbm(x / 90, z / 90, 4, 6) * 40; const track = Math.abs(x - 30 * Math.sin(z / 90)); h = h * THREE.MathUtils.smoothstep(track, 18, 260) + 60 * (1 - THREE.MathUtils.smoothstep(track, 18, 260)); return h - 60; };
  const snowMat = pbr('rock', { size: 12, tint: 0xd8dde4 });
  const t = terrain({ size: 5000, seg: 300, height: ground, mat: snowMat });
  // snow on gentle slopes: vertex colour by slope
  const g = t.geometry, n = g.attributes.normal, c = new Float32Array(n.count * 3);
  for (let i = 0; i < n.count; i++) { const s = THREE.MathUtils.smoothstep(n.getY(i), 0.6, 0.85); const k = 0.55 + 0.6 * s; c[i * 3] = k; c[i * 3 + 1] = k; c[i * 3 + 2] = k * 1.03; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); snowMat.vertexColors = true;
  rocks(spots(r, 60, -200, 200, -400, 400, 1, 4), ground);
  trees('cypress', spots(r, 80, -900, 900, 300, 1200, 1, 1.6), ground);
  return { ground, cams: { wide: { pos: [-260, 160, 520], look: [0, 40, 0], fov: 40 }, track: { pos: [24, ground(24, 120) + 1.8, 120], look: [10, ground(10, 40) + 2, 40], fov: 46 } } };
}

// ------------------------------------------------------------------ Gaul: forest clearing with a Roman camp; and the Rubicon
export async function gaul({ mood = 'golden' } = {}) {
  const res = await countryside({ mood });
  const r = R(71); trees('oak', spots(r, 200, -600, 600, -600, 600, 1.1, 1.8, (x, z) => Math.abs(x) < 40 || Math.hypot(x - 160, z + 120) < 100), res.ground);
  return res;
}
export async function rubicon({ mood = 'dusk' } = {}) {
  await light(mood); const r = R(81);
  const rx = (z) => 25 * Math.sin(z / 80);
  const ground = (x, z) => { const d = Math.abs(x - rx(z)); return fbm(x / 160, z / 160, 4, 5) * 16 * THREE.MathUtils.smoothstep(d, 12, 120) - 2.2 * (1 - THREE.MathUtils.smoothstep(d, 6, 14)); };
  terrain({ size: 2400, seg: 260, height: ground, mat: pbr('grass', { size: 6, tint: 0xc8c8a0 }) });
  water([2400, 2400], { color: 0x2a4a48, pos: [0, -0.9, 0], ripple: 0.7 });
  rocks(spots(r, 60, -60, 60, -300, 300, 0.4, 1.4, (x, z) => Math.abs(x - rx(z)) < 8), ground);
  bushes(spots(r, 200, -200, 200, -400, 400, 0.6, 1.6, (x, z) => Math.abs(x - rx(z)) < 9), ground);
  trees('oak', spots(r, 80, -500, 500, -600, 600, 0.9, 1.5, (x, z) => Math.abs(x - rx(z)) < 20), ground);
  return { ground, cams: { bank: { pos: [rx(0) - 18, ground(rx(0) - 18, 0) + 1.7, 6], look: [rx(0) + 30, 1, -4], fov: 44 }, wide: { pos: [-120, 30, 120], look: [0, 0, 0], fov: 40 } } };
}

// ------------------------------------------------------------------ imperial palace banquet hall (marble, columns, couches, garden)
export async function palace({ mood = 'golden' } = {}) {
  await light(mood); scene.fog = null; scene.environmentIntensity = 0.45;
  const b = new Batch(), W = 26, L = 44, H = 16;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, L).rotateX(-Math.PI / 2), MAT.floor); fl.receiveShadow = true; scene.add(fl);
  for (const sx of [-1, 1]) {
    b.add(new THREE.BoxGeometry(0.6, H, L), MAT.plasterRed, M4(sx * (W / 2 + 0.3), H / 2, 0));
    for (let i = 0; i < 8; i++) column(b, MAT.marble, sx * (W / 2 - 2.2), 0, -L / 2 + 3 + i * 5.4, 11, 0.45, 'corinthian', MAT.gold);
    b.add(new THREE.BoxGeometry(1.2, 1.4, L - 2), MAT.marbleW, M4(sx * (W / 2 - 2.2), 11.7, 0));
  }
  b.add(new THREE.BoxGeometry(W, H, 0.6), MAT.plasterRed, M4(0, H / 2, -L / 2));
  b.add(arcadeGeo(W, H, 0.6, 3, { archW: 6, spring: 8 }), MAT.marbleW, M4(-W / 2, 0, L / 2 - 0.6));
  b.add(new THREE.BoxGeometry(W, 0.8, L), MAT.travDark, M4(0, H + 0.4, 0));
  for (let i = 0; i < 6; i++) for (let j = 0; j < 10; j++) b.add(new THREE.BoxGeometry(3.2, 0.5, 3.2), MAT.gold, M4(-W / 2 + 2.2 + i * 4.3, H - 0.25, -L / 2 + 2.2 + j * 4.4));
  // couches around low tables, laden with fruit and vessels
  for (let k = 0; k < 3; k++) {
    const z = -14 + k * 11;
    for (const [dx, ang] of [[-4.5, 0], [4.5, 0], [0, Math.PI / 2]]) { b.add(new THREE.BoxGeometry(ang ? 6 : 2.2, 0.7, ang ? 2.2 : 6), MAT.wood, M4(dx, 0.35, z + (ang ? -3.6 : 0))); b.add(new THREE.BoxGeometry(ang ? 6 : 2.2, 0.35, ang ? 2.2 : 6), pbr('plaster', { size: 1, tint: 0x8a2a4a, key: 'cushion' }), M4(dx, 0.85, z + (ang ? -3.6 : 0))); }
    b.add(new THREE.CylinderGeometry(1.6, 1.6, 0.12, 24), MAT.marbleW, M4(0, 0.75, z)); b.add(new THREE.CylinderGeometry(0.3, 0.5, 0.7, 12), MAT.bronze, M4(0, 0.35, z));
    for (let i = 0; i < 8; i++) b.add(new THREE.SphereGeometry(0.16, 10, 8), flat([0x7a2a6a, 0xd8a03a, 0x4a7a2a, 0xc83a2a][i % 4], 0.5), M4(Math.cos(i) * 0.7, 0.95, z + Math.sin(i) * 0.7));
    b.add(new THREE.CylinderGeometry(0.15, 0.25, 0.6, 12), MAT.gold, M4(0.9, 1.1, z - 0.3));
  }
  // statues on plinths at the far wall
  for (const sx of [-1, 0, 1]) { b.add(new THREE.BoxGeometry(2, 2, 2), MAT.marble, M4(sx * 7, 1, -L / 2 + 2)); b.add(new THREE.CapsuleGeometry(0.55, 2.4, 6, 12), MAT.marbleW, M4(sx * 7, 3.9, -L / 2 + 2)); b.add(new THREE.SphereGeometry(0.42, 14, 10), MAT.marbleW, M4(sx * 7, 5.6, -L / 2 + 2)); }
  b.build();
  point([0, 9, -6], 0xffd8a0, 300, 40); point([0, 6, 12], 0xffe0b0, 160, 30);
  scene.children.filter((o) => o.isDirectionalLight).forEach((l) => { l.position.set(40, 60, 120); l.target.position.set(0, 0, 0); l.shadow.camera.left = -40; l.shadow.camera.right = 40; l.shadow.camera.top = 40; l.shadow.camera.bottom = -40; l.shadow.camera.updateProjectionMatrix(); });
  trees('cypress', Array.from({ length: 6 }, (_, i) => [-15 + i * 6, L / 2 + 12, 0.7]), () => 0);
  return { ground: () => 0, cams: { hall: { pos: [0, 2.0, 18], look: [0, 3, -16], fov: 48 }, table: { pos: [-6, 1.6, -2], look: [2, 1.4, -14], fov: 44 } } };
}

// ------------------------------------------------------------------ Constantinople: land walls, harbour, domes, hippodrome
export async function constantinople({ mood = 'golden', late = false } = {}) {
  await light(mood); const r = R(91);
  const ground = (x, z) => (z > 260 ? -3 : 2 + fbm(x / 220, z / 220, 4, 3) * 26 * THREE.MathUtils.smoothstep(260 - z, 0, 200));
  terrain({ size: 3600, seg: 240, height: ground, mat: pbr('grass', { size: 7, tint: 0xd0c8a0 }) });
  water([5000, 5000], { color: 0x1d5a6a, pos: [0, -0.3, 0], ripple: 1.0 });
  const b = new Batch();
  // the land walls: towers every 60 m, a lower outer wall and moat (Theodosian walls when late)
  for (let i = 0; i < 26; i++) {
    const x = -720, z = -640 + i * 38;
    b.add(new THREE.BoxGeometry(6, 16, 38), MAT.blocks, M4(x, 8, z));
    if (late) b.add(new THREE.BoxGeometry(4, 9, 38), MAT.blocks, M4(x - 22, 4.5, z));
    if (i % 2 === 0) { b.add(new THREE.BoxGeometry(12, 24, 12), MAT.blocks, M4(x, 12, z)); for (let k = 0; k < 4; k++) b.add(new THREE.BoxGeometry(2.2, 2, 2.2), MAT.blocks, M4(x - 4.5 + k * 3, 25, z - 5)); }
  }
  // Hippodrome with spina and the imperial box
  b.add(new THREE.BoxGeometry(120, 14, 8), MAT.brick, M4(-200, 7, -60)); b.add(new THREE.BoxGeometry(120, 14, 8), MAT.brick, M4(-200, 7, 20));
  b.add(new THREE.BoxGeometry(80, 2, 4), MAT.marbleW, M4(-200, 1, -20)); b.add(new THREE.CylinderGeometry(1.2, 1.6, 22, 4), MAT.marbleW, M4(-200, 11, -20));
  // churches and palaces with domes
  dome(b, MAT.travDark, 0, 26, -120, late ? 30 : 16, { oculus: 0 }); b.add(new THREE.BoxGeometry(late ? 76 : 44, 26, late ? 70 : 40), MAT.brick, M4(0, 13, -120));
  for (const [x, z, s] of [[120, -40, 10], [-80, -220, 12], [200, -200, 9]]) { b.add(new THREE.BoxGeometry(s * 2.6, s * 1.6, s * 2.6), MAT.brick, M4(x, s * 0.8, z)); dome(b, MAT.travDark, x, s * 1.6, z, s); }
  b.add(arcadeGeo(200, 14, 6, 20, { archW: 6, spring: 8 }), MAT.marbleW, M4(-100, 0, 160));
  for (let i = 0; i < 300; i++) { const x = (r() - 0.5) * 1300, z = -600 + r() * 820; if (Math.hypot(x, z + 120) < 70 || x < -690) continue; const y = ground(x, z); if (y < 0) continue; insula(b, { x, z, ry: r() < 0.5 ? 0 : Math.PI / 2, w: 14 + r() * 10, d: 10 + r() * 6, floors: 2 + Math.round(r() * 2), mat: MAT.brick, plaster: r() < 0.5 ? MAT.plaster : null, rnd: r }); }
  b.build();
  for (let i = 0; i < 6; i++) galley({ x: -300 + i * 120, y: -0.2, z: 320 + (i % 2) * 40, ry: 0.3 + i, sailUp: i % 2 === 0 });
  trees('cypress', spots(r, 80, -700, 700, -600, 200, 1, 1.5), ground);
  return { ground, cams: { aerial: { pos: [400, 260, 700], look: [-100, 0, -120], fov: 40 }, walls: { pos: [-900, 12, -100], look: [-720, 14, -220], fov: 44 }, harbour: { pos: [100, 4, 420], look: [0, 30, -100], fov: 42 } } };
}

// ------------------------------------------------------------------ Ravenna, 476: palace hall of the western court
export async function ravenna({ mood = 'overcast' } = {}) {
  const res = await palace({ mood });
  scene.children.filter((o) => o.isPointLight).forEach((l) => (l.intensity *= 0.5));
  // purple imperial banners on the far wall (the shot can remove one)
  const banners = [];
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 8), new THREE.MeshStandardMaterial({ color: 0x5b2a6e, roughness: 0.9, side: THREE.DoubleSide })); m.position.set(sx * 4, 8, -21.6); scene.add(m); banners.push(m); }
  return { ...res, banners };
}

// ------------------------------------------------------------------ the map table: parchment Mediterranean with animated territory
export async function mapTable({ stage = '117', mood = 'golden' } = {}) {
  await light(mood); scene.fog = null;
  const img = await new Promise((res) => new THREE.TextureLoader().load('maps/med_' + stage + '.png', res, undefined, () => res(null)));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(160, 90).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: img, roughness: 0.95 }));
  if (img) img.colorSpace = THREE.SRGBColorSpace; m.receiveShadow = true; scene.add(m);
  const tbl = new THREE.Mesh(new THREE.BoxGeometry(176, 4, 106), MAT.wood); tbl.position.y = -2.05; tbl.receiveShadow = true; scene.add(tbl);
  return { ground: () => 0, map: m, cams: { top: { pos: [0, 140, 30], look: [0, 0, 0], fov: 40 }, low: { pos: [-40, 30, 70], look: [10, 0, 0], fov: 42 } } };
}
