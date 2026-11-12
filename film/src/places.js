// Locations. Each returns { ground(x,z), cams: {name: {pos, look, fov}} } and keeps a fixed layout,
// so a place looks the same every time it returns (only era, light and weather change).
import * as THREE from 'three';
import { scene, sky, sun, hemi, water, terrain, fbm, pbr, flat, point } from './engine.js';
import { Batch, M4, MAT, temple, basilica, curia, insula, hut, fence, colosseum, aqueduct, column, cornice, arcadeGeo, archRing, stairs, dome, entablature, gableRoof, pediment } from './arch.js';
import { trees, rocks, bushes, galley } from './nature.js';

const rnd = (() => { let s = 12345; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const lightFor = async (mood) => {
  if (mood === 'golden') { await sky('golden', { envIntensity: 0.9, fog: 0xd8b48a, fogDensity: 0.0011 }); sun({ dir: [-0.8, 0.28, 0.4], color: 0xffc68a, intensity: 3.2, size: 160 }); hemi(0xd8c0a0, 0x6a5a48, 0.3); }
  else if (mood === 'dusk') { await sky('dusk', { envIntensity: 0.6, fog: 0x8a7a8a, fogDensity: 0.0016 }); sun({ dir: [-0.9, 0.12, 0.3], color: 0xff9a5a, intensity: 2.2, size: 160 }); hemi(0x8a90b0, 0x3a3030, 0.3); }
  else if (mood === 'overcast') { await sky('overcast', { envIntensity: 1.0, fog: 0xb8bcc0, fogDensity: 0.0018 }); sun({ dir: [0.3, 0.9, 0.2], color: 0xe8ecf0, intensity: 1.2, size: 160 }); hemi(0xc8d0d8, 0x6a6460, 0.5); }
  else { await sky('day', { envIntensity: 1.0, fog: 0xc8d8e8, fogDensity: 0.0009 }); sun({ dir: [0.55, 0.62, 0.35], color: 0xfff0dc, intensity: 3.4, size: 160 }); hemi(0xbcd4ee, 0x8a7660, 0.35); }
};

// ======================================================================= 753 BC: huts on the Palatine above the Tiber
export async function tiber({ mood = 'day' } = {}) {
  await lightFor(mood);
  const riverX = (z) => -95 + 22 * Math.sin(z / 70);
  const ground = (x, z) => {
    const d = Math.abs(x - riverX(z));
    let h = fbm(x / 140, z / 140, 5, 2) * 28 + fbm(x / 30, z / 30, 3, 7) * 2.5;
    const pal = Math.exp(-((x - 20) ** 2 + (z + 10) ** 2) / (2 * 55 ** 2)) * 14;
    h += pal;
    const bank = THREE.MathUtils.smoothstep(d, 14, 60);
    return h * bank + (-2.5) * (1 - bank);
  };
  terrain({ size: 1400, seg: 260, height: ground, mat: pbr('grass', { size: 6, tint: 0xd8dcb8 }) });
  water([1400, 1400], { color: 0x3a5a4a, pos: [0, -0.8, 0], ripple: 0.8 });
  const b = new Batch();
  const village = [];
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, r = 8 + rnd() * 34, x = 22 + Math.cos(a) * r, z = -8 + Math.sin(a) * r * 0.8;
    if (village.some(([vx, vz]) => Math.hypot(vx - x, vz - z) < 7)) continue;
    village.push([x, z]); const y = ground(x, z);
    const T = M4(0, y, 0); hut(b, { x, z, r: 2.3 + rnd() * 0.9, h: 1.9 + rnd() * 0.4, ry: rnd() * 6.28 });
  }
  // huts sit on the ground: lift each batch part by terrain height (re-add with offsets)
  const huts = b.build(); huts.forEach((m) => { const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + groundAtHut(x, z)); } p.needsUpdate = true; m.geometry.computeBoundingSphere(); });
  function groundAtHut(x, z) { let best = null, bd = 1e9; for (const [vx, vz] of village) { const d = Math.hypot(vx - x, vz - z); if (d < bd) { bd = d; best = [vx, vz]; } } return ground(best[0], best[1]) - 0.15; }
  const f = new Batch();
  for (let k = 0; k < 6; k++) { const a0 = k / 6 * Math.PI * 2, a1 = (k + 0.8) / 6 * Math.PI * 2; fence(f, 22 + Math.cos(a0) * 48, -8 + Math.sin(a0) * 40, 22 + Math.cos(a1) * 48, -8 + Math.sin(a1) * 40, 1.4); }
  for (const [x0, z0, x1, z1] of [[60, 40, 100, 40], [60, 40, 60, 80], [100, 40, 100, 80]]) fence(f, x0, z0, x1, z1);
  const fm = f.build(); fm.forEach((m) => { const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + ground(p.getX(i), p.getZ(i))); p.needsUpdate = true; });
  // ploughed field
  const field = new THREE.Mesh(new THREE.PlaneGeometry(40, 40, 30, 30).rotateX(-Math.PI / 2), pbr('mud', { size: 3 }));
  { const p = field.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, ground(p.getX(i) + 80, p.getZ(i) + 60) + 0.12); field.position.set(80, 0, 60); field.receiveShadow = true; scene.add(field); }
  const sp = (n, x0, x1, z0, z1, s0, s1, avoid) => { const o = []; while (o.length < n) { const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0); if (avoid && avoid(x, z)) continue; o.push([x, z, s0 + rnd() * (s1 - s0)]); } return o; };
  const notVillage = (x, z) => Math.hypot(x - 22, z + 8) < 50 || Math.abs(x - riverX(z)) < 16;
  trees('pine', sp(40, -300, 300, -300, 200, 0.8, 1.3, notVillage), ground);
  trees('cypress', sp(30, -200, 260, -260, 160, 0.8, 1.2, notVillage), ground);
  trees('oak', sp(90, -500, 500, -500, 300, 0.8, 1.4, notVillage), ground);
  bushes(sp(160, -200, 200, -150, 150, 0.6, 1.4, (x, z) => Math.hypot(x - 22, z + 8) < 40), ground);
  rocks(sp(30, -150, 150, -120, 120, 0.4, 1.2, notVillage), ground);
  // smoke from a few huts
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0xd8d4cc, transparent: true, opacity: 0.18, depthWrite: false });
  village.slice(0, 5).forEach(([x, z], i) => { for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.8 + k * 0.5, 10, 8), smokeMat); s.position.set(x + k * 0.6, ground(x, z) + 5 + k * 1.6, z + k * 0.3); scene.add(s); } });
  return {
    ground, village,
    cams: {
      aerial: { pos: [-160, 120, 220], look: [20, 10, -10], fov: 38 },
      low: { pos: [4, ground(4, 30) + 1.7, 30], look: [24, ground(24, -6) + 2, -6], fov: 42 },
      river: { pos: [-70, 4, 60], look: [20, 12, -10], fov: 40 },
    },
  };
}

// ======================================================================= Forum Romanum (fixed layout; era changes details)
export async function forum({ era = 'republic', mood = 'day' } = {}) {
  await lightFor(mood);
  const ruins = era === 'ruins', ground = (x, z) => 0;
  const hill = (cx, cz, r, h) => (x, z) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));
  const cap = hill(-190, 0, 60, 34), pal = hill(40, 150, 80, 30);
  terrain({ size: 1600, seg: 220, height: (x, z) => Math.max(0, cap(x, z) + pal(x, z) + fbm(x / 200, z / 200, 4, 3) * 10 * THREE.MathUtils.smoothstep(Math.hypot(x, z), 160, 400)) - 0.05, mat: pbr('grass', { size: 6, tint: ruins ? 0xc8c8a0 : 0xd0c8a8 }) });
  const pave = new THREE.Mesh(new THREE.PlaneGeometry(200, 70).rotateX(-Math.PI / 2), MAT.paving); pave.position.set(-10, 0.02, 0); pave.receiveShadow = true; scene.add(pave);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(260, 10).rotateX(-Math.PI / 2), MAT.paving); road.position.set(0, 0.03, 40); road.receiveShadow = true; scene.add(road);
  const b = new Batch(), R = ruins ? 0.7 : 0;
  const r2 = (() => { let s = 99; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  // west end: Temple of Saturn (Ionic, high podium) and Temple of Concord, Tabularium on the Capitoline slope
  temple(b, { x: -92, z: 22, ry: Math.PI / 2, w: 22, l: 40, podium: 8, colH: 12, cols: 6, order: 'ionic', mat: MAT.marbleW, podMat: MAT.trav, ruin: ruins ? 0.35 : 0, rnd: r2 });
  temple(b, { x: -98, z: -18, ry: Math.PI / 2, w: 24, l: 30, podium: 4, colH: 13, cols: 6, order: 'corinthian', ruin: ruins ? 0.9 : 0, rnd: r2 });
  b.add(arcadeGeo(80, 14, 3, 10, { archW: 4.6, spring: 9 }), MAT.blocks, M4(-150, 22, 40, Math.PI / 2));
  b.add(new THREE.BoxGeometry(18, 22, 80), MAT.blocks, M4(-162, 11 + 0, 0));
  temple(b, { x: -195, z: 0, ry: Math.PI / 2, w: 40, l: 56, podium: 6, colH: 16, cols: 6, order: era === 'republic' ? 'tuscan' : 'corinthian', ruin: ruins ? 1 : 0, rnd: r2 });
  // north side: Curia and Basilica Aemilia
  curia(b, { x: -60, z: -48, ry: 0, ruin: 0 });
  basilica(b, { x: -40, z: -36, ry: 0, len: 96, depth: 28, n: 16, ruin: ruins ? 1 : 0 });
  // south side: Basilica Julia (from 54 BC) facing the square
  if (era !== 'early') basilica(b, { x: 60, z: 36, ry: Math.PI, len: 100, depth: 46, n: 18, ruin: ruins ? 1 : 0 });
  // east: Temple of Castor and Pollux, and (after 29 BC) Temple of Divus Julius
  temple(b, { x: 78, z: 46, ry: Math.PI, w: 26, l: 40, podium: 7, colH: 14.8, cols: 8, order: 'corinthian', peripteral: true, ruin: ruins ? 0.88 : 0, rnd: r2 });
  if (era !== 'republic') temple(b, { x: 92, z: -6, ry: -Math.PI / 2, w: 18, l: 26, podium: 5, colH: 11, cols: 6, order: 'corinthian', ruin: ruins ? 1 : 0, rnd: r2 });
  // Rostra (speakers' platform) and honorific columns
  b.add(new THREE.BoxGeometry(24, 3.2, 10), MAT.trav, M4(-62, 1.6, 2));
  for (let i = 0; i < 6; i++) b.add(new THREE.ConeGeometry(0.5, 2.2, 4), MAT.bronze, M4(-72 + i * 4, 1.6, 7.3, 0, 1, 1, 1, Math.PI / 2, 0));
  if (!ruins) for (const x of [-20, 0, 20, 40]) column(b, MAT.marbleW, x, 0, -14, 9, 0.45, 'corinthian');
  // residential blocks beyond the public buildings
  for (let i = 0; i < 26; i++) {
    const a = r2() * Math.PI * 2, d = 160 + r2() * 220, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.8;
    if (Math.hypot(x + 190, z) < 80 || Math.hypot(x - 40, z - 150) < 90) continue;
    insula(b, { x, z, ry: Math.round(a / (Math.PI / 2)) * Math.PI / 2 + Math.PI, w: 16 + r2() * 10, d: 12 + r2() * 6, floors: era === 'republic' ? 2 + Math.round(r2() * 2) : 3 + Math.round(r2() * 2), mat: MAT.brick, plaster: r2() < 0.5 ? MAT.plasterOchre : MAT.plaster, ruin: ruins ? 0.8 : 0, rnd: r2 });
  }
  // Palatine: houses of the elite (republic) or the imperial palace (imperial)
  if (era === 'imperial' || era === 'ruins') {
    b.add(arcadeGeo(140, 26, 6, 14, { archW: 6, spring: 16 }), MAT.brick, M4(-30, 0, 104));
    b.add(new THREE.BoxGeometry(140, 18, 70), MAT.brick, M4(40, 35, 150));
    for (let i = 0; i < 10; i++) column(b, MAT.marbleW, -20 + i * 14, 44, 116, 12, 0.6, 'corinthian');
  } else for (let i = 0; i < 8; i++) insula(b, { x: -10 + i * 22, z: 130 + (i % 2) * 18, ry: Math.PI, w: 18, d: 14, floors: 2, mat: MAT.plaster, plaster: MAT.plasterOchre, rnd: r2 });
  b.build();
  const sp = (n, f) => Array.from({ length: n }, f);
  trees('cypress', sp(18, (_, i) => [-150 + (i % 9) * 30, i < 9 ? -90 : 110, 0.9 + r2() * 0.3]), () => 0);
  trees('pine', sp(14, (_, i) => [30 + (r2() - 0.5) * 200, 160 + r2() * 60, 1 + r2() * 0.3]), (x, z) => pal(x, z));
  if (ruins) bushes(sp(120, () => [-110 + r2() * 200, -40 + r2() * 80, 0.4 + r2() * 0.8]), () => 0, 0x6a7a3a);
  return {
    ground,
    cams: {
      wide: { pos: [120, 26, 30], look: [-60, 8, 0], fov: 42 },
      street: { pos: [40, 1.7, 8], look: [-60, 6, -10], fov: 44 },
      curia: { pos: [-40, 1.7, 0], look: [-60, 9, -48], fov: 45 },
      aerial: { pos: [200, 140, 200], look: [-20, 0, 0], fov: 40 },
    },
  };
}

// ======================================================================= Senate chamber (Curia interior), same arrangement every time
export async function senate({ mood = 'day' } = {}) {
  await lightFor(mood); scene.fog = null; scene.environmentIntensity = 0.35;
  const W = 18, L = 27, H = 21, b = new Batch();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, L).rotateX(-Math.PI / 2), MAT.floor); fl.receiveShadow = true; scene.add(fl);
  for (const sx of [-1, 1]) {
    for (let s = 0; s < 3; s++) b.add(new THREE.BoxGeometry(1.6, 0.36 * (s + 1), L - 6), MAT.marbleW, M4(sx * (W / 2 - 0.8 - s * 1.6), 0.18 * (s + 1), 1));
    // wall: marble dado, plaster above, arched niches with statues' plinths
    b.add(new THREE.BoxGeometry(0.4, H, L), MAT.plaster, M4(sx * (W / 2 + 0.2), H / 2, 0, 0));
    b.add(new THREE.BoxGeometry(0.2, 3.2, L), MAT.marble, M4(sx * (W / 2 - 0.05), 1.6, 0));
    for (let k = 0; k < 4; k++) { const z = -L / 2 + 4.5 + k * 6; b.add(arcadeGeo(3, 5.5, 0.4, 1, { archW: 2.0, spring: 4.0 }), MAT.marbleW, M4(sx * (W / 2 - 0.2), 5.5, z - 1.5 * sx, sx > 0 ? -Math.PI / 2 : Math.PI / 2)); b.add(new THREE.BoxGeometry(0.5, 4.8, 1.9), MAT.dark, M4(sx * (W / 2 + 0.05), 7.9, z)); }
    for (let k = 0; k < 3; k++) { const z = -L / 2 + 6 + k * 7.5; b.add(new THREE.BoxGeometry(0.6, 4.2, 2.4), MAT.dark, M4(sx * (W / 2 + 0.05), 15.5, z)); }
  }
  b.add(new THREE.BoxGeometry(W, H, 0.4), MAT.plaster, M4(0, H / 2, -L / 2 - 0.2));
  b.add(new THREE.BoxGeometry(W, H, 0.4), MAT.plaster, M4(0, H / 2, L / 2 + 0.2));
  b.add(new THREE.BoxGeometry(4.2, 7.5, 0.3), MAT.bronze, M4(0, 3.75, L / 2 - 0.05));
  // tribunal at the far end with the altar and statue of Victory
  b.add(new THREE.BoxGeometry(8, 0.9, 4), MAT.marbleW, M4(0, 0.45, -L / 2 + 2));
  b.add(new THREE.BoxGeometry(1.6, 1.4, 1.2), MAT.marble, M4(0, 1.6, -L / 2 + 4.6));
  b.add(new THREE.CylinderGeometry(0.6, 0.8, 2.4, 16), MAT.marbleW, M4(0, 2.1, -L / 2 + 1.6));
  b.add(new THREE.CapsuleGeometry(0.42, 1.4, 6, 12), MAT.gold, M4(0, 4.4, -L / 2 + 1.6));
  b.add(new THREE.SphereGeometry(0.3, 12, 10), MAT.gold, M4(0, 5.6, -L / 2 + 1.6));
  for (const sx of [-1, 1]) b.add(new THREE.BoxGeometry(1.8, 0.12, 0.9), MAT.gold, M4(sx * 0.9, 5.0, -L / 2 + 1.5, 0, 1, 1, 1, 0, sx * -0.6));
  for (const [x, z] of [[-W / 2 + 1.2, -L / 2 + 1.2], [W / 2 - 1.2, -L / 2 + 1.2], [-W / 2 + 1.2, L / 2 - 1.2], [W / 2 - 1.2, L / 2 - 1.2]]) column(b, MAT.marble, x, 0, z, 12, 0.5, 'corinthian');
  for (const z of [-L / 2 + 0.4]) b.add(arcadeGeo(W, 6, 0.4, 3, { archW: 3.4, spring: 3.5 }), MAT.dark, M4(-W / 2, 13, z));
  // coffered ceiling
  b.add(new THREE.BoxGeometry(W, 0.6, L), MAT.travDark, M4(0, H + 0.3, 0));
  for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) b.add(new THREE.BoxGeometry(2.2, 0.5, 2.2), MAT.trav, M4(-W / 2 + 1.5 + i * 3, H - 0.25, -L / 2 + 1.5 + j * 3));
  b.build();
  // light: sun through the high windows + warm fill; dust beams as soft additive planes
  scene.children.filter((o) => o.isDirectionalLight).forEach((l) => { l.position.set(-60, 120, -80); l.intensity = 2.5; l.shadow.camera.left = -30; l.shadow.camera.right = 30; l.shadow.camera.top = 30; l.shadow.camera.bottom = -30; l.shadow.camera.updateProjectionMatrix(); });
  point([0, 12, 0], 0xffe0b0, 260, 40); point([0, 6, -10], 0xffd8a0, 120, 22);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  for (const z of [-L / 2 + 6, -L / 2 + 13.5, -L / 2 + 21]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 18), beamMat); m.position.set(-3, 9, z); m.rotation.set(0, Math.PI / 2, 0.55); scene.add(m); }
  return {
    ground: () => 0,
    cams: {
      entrance: { pos: [0, 2.0, 12], look: [0, 4.5, -12], fov: 50 },
      side: { pos: [-6.5, 2.4, 6], look: [4, 2.0, -6], fov: 45 },
      tribunal: { pos: [0, 1.4, -4], look: [0, 3.5, -13], fov: 40 },
    },
  };
}

// ======================================================================= Imperial Rome, 117 AD (Colosseum valley)
export async function imperialRome({ mood = 'day' } = {}) {
  await lightFor(mood);
  const hill = (cx, cz, r, h) => (x, z) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));
  const pal = hill(-260, -40, 110, 34), esq = hill(200, -260, 160, 26), cae = hill(60, 300, 140, 30);
  const ground = (x, z) => Math.max(0, pal(x, z) + esq(x, z) + cae(x, z) + fbm(x / 300, z / 300, 4, 5) * 14 * THREE.MathUtils.smoothstep(Math.hypot(x, z), 250, 900));
  terrain({ size: 3000, seg: 240, height: ground, mat: pbr('grass', { size: 8, tint: 0xd0c8a8 }) });
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(320, 280).rotateX(-Math.PI / 2), MAT.paving); plaza.position.set(0, 0.05, 0); plaza.receiveShadow = true; scene.add(plaza);
  const b = new Batch();
  colosseum(b, { x: 0, z: 0 });
  // Temple of Venus and Rome on its platform to the west, Arch of Titus, Meta Sudans fountain
  b.add(new THREE.BoxGeometry(150, 6, 100), MAT.trav, M4(-180, 3, 10));
  temple(b, { x: -180, z: 10, ry: Math.PI / 2, w: 50, l: 110, podium: 6, colH: 18, cols: 10, order: 'corinthian', peripteral: true });
  b.add(new THREE.CylinderGeometry(4, 6, 16, 20), MAT.trav, M4(-80, 8, 40)); b.add(new THREE.ConeGeometry(4, 4, 20), MAT.trav, M4(-80, 18, 40));
  b.add(arcadeGeo(14, 15, 5, 1, { archW: 5.4, spring: 8.5 }), MAT.marbleW, M4(-150, 6, 80));
  // Aqua Claudia arches coming down from the Caelian
  aqueduct(b, 420, 420, 90, 150, { h: 26 });
  // Baths of Trajan to the north-east: domed halls, apses
  b.add(new THREE.BoxGeometry(160, 22, 120), MAT.brick, M4(220, 11 + 6, -260));
  dome(b, MAT.travDark, 220, 34, -260, 22, { oculus: 0.12 });
  for (const dx of [-60, 60]) dome(b, MAT.travDark, 220 + dx, 28, -260, 12);
  b.add(arcadeGeo(160, 16, 3, 12, { archW: 7, spring: 10 }), MAT.brick, M4(140, 6, -198));
  // Palatine palace (Domus Augustana) with arched substructures
  b.add(arcadeGeo(220, 30, 6, 16, { archW: 8, spring: 20 }), MAT.brick, M4(-370, 0, 60, Math.PI / 2 + 0.3));
  b.add(new THREE.BoxGeometry(160, 26, 160), MAT.brick, M4(-280, 40, -50));
  for (let i = 0; i < 12; i++) column(b, MAT.marbleW, -350 + i * 13, 53, 32, 14, 0.7, 'corinthian');
  b.add(new THREE.BoxGeometry(160, 3, 6), MAT.marbleW, M4(-280, 68, 32));
  // neighbourhoods of insulae on a street grid
  const r2 = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (let gx = -12; gx <= 12; gx++) for (let gz = -12; gz <= 12; gz++) {
    const x = gx * 42 + (r2() - 0.5) * 6, z = gz * 38 + (r2() - 0.5) * 6;
    if (Math.hypot(x / 1.2, z) < 170 || (x < -100 && x > -460 && z > -180 && z < 120) || (x > 120 && x < 320 && z < -180 && z > -340) || Math.hypot(x, z) > 560) continue;
    const y = ground(x, z); if (y > 1.2) continue;
    insula(b, { x, z, ry: (gx + gz) % 2 ? 0 : Math.PI, w: 28 + r2() * 8, d: 22 + r2() * 6, floors: 3 + Math.round(r2() * 2), mat: MAT.brick, plaster: r2() < 0.35 ? MAT.plasterOchre : r2() < 0.5 ? MAT.plaster : null, rnd: r2 });
  }
  b.build();
  // raise insulae on hills: shift whole buildings would need per-building groups; small hills under the grid are flattened instead
  const sp = (n, f) => Array.from({ length: n }, f);
  trees('pine', sp(60, () => { let x, z; do { x = (r2() - 0.5) * 1400; z = (r2() - 0.5) * 1400; } while (Math.hypot(x, z) < 560); return [x, z, 1 + r2() * 0.5]; }), ground);
  trees('cypress', sp(40, () => [(r2() - 0.5) * 900, 380 + r2() * 200, 1 + r2() * 0.3]), ground);
  return {
    ground,
    cams: {
      aerial: { pos: [420, 260, 380], look: [0, 10, 0], fov: 38 },
      street: { pos: [120, 1.7, 160], look: [0, 22, 0], fov: 46 },
      aqueduct: { pos: [260, 4, 330], look: [120, 20, 190], fov: 44 },
    },
  };
}

// ======================================================================= Carthage harbour (circular naval harbour + commercial port)
export async function carthage({ mood = 'golden' } = {}) {
  await lightFor(mood);
  const ground = (x, z) => {
    const r = Math.hypot(x, z);
    if (r < 115) return -3;                              // naval harbour basin
    if (x > -60 && x < 60 && z > 110 && z < 330) return -3; // rectangular commercial harbour
    if (z > 400) return -3;                              // open sea to the south
    return 1.5 + Math.max(0, (-z - 120) * 0.12) + fbm(x / 120, z / 120, 4, 9) * 6;   // city rises north to the Byrsa hill
  };
  terrain({ size: 2400, seg: 260, height: ground, mat: pbr('sand', { size: 5, tint: 0xe8d8b8 }) });
  water([3000, 3000], { color: 0x1a5a68, pos: [0, -0.4, 0], ripple: 0.9 });
  const b = new Batch();
  // quay walls
  b.add(new THREE.CylinderGeometry(116, 116, 4, 96, 1, true), MAT.blocks, M4(0, 0.5, 0));
  // central island with the admiral's round pavilion
  b.add(new THREE.CylinderGeometry(42, 42, 4, 64), MAT.blocks, M4(0, 0.5, 0));
  b.add(new THREE.CylinderGeometry(12, 12, 10, 32), MAT.plaster, M4(0, 7.5, 0)); dome(b, MAT.travDark, 0, 12.5, 0, 12);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; column(b, MAT.trav, Math.cos(a) * 15, 2.5, Math.sin(a) * 15, 8, 0.45, 'ionic'); }
  // ship sheds: on the island and around the harbour ring, each with Ionic columns in front (as Appian describes)
  const shed = (ang, rIn, len) => {
    const cx = Math.cos(ang), cz = Math.sin(ang), mid = rIn + len / 2;
    gableRoof(b, MAT.roof, cx * mid, 7, cz * mid, 3.2, len, 0.35, -ang + Math.PI / 2, 0.2);
    b.add(new THREE.BoxGeometry(0.6, 7, len), MAT.plaster, M4(cx * mid + Math.sin(ang) * 3.2, 3.5, cz * mid - Math.cos(ang) * 3.2, -ang + Math.PI / 2));
    column(b, MAT.trav, cx * rIn + Math.sin(ang) * 3.2, 1, cz * rIn - Math.cos(ang) * 3.2, 6, 0.32, 'ionic');
  };
  for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; if (Math.abs(a - Math.PI / 2) < 0.3) continue; shed(a, 118, 34); }
  for (let i = 0; i < 26; i++) shed(i / 26 * Math.PI * 2, 18, 22);
  // city: whitewashed flat-roofed houses climbing to the Byrsa, a temple on top
  const r2 = (() => { let s = 21; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 260; i++) {
    const x = (r2() - 0.5) * 900, z = -170 - r2() * 520;
    const y = ground(x, z), w = 10 + r2() * 12, d = 10 + r2() * 12, h = 6 + r2() * 10;
    b.add(new THREE.BoxGeometry(w, h + 6, d), r2() < 0.7 ? MAT.plaster : MAT.plasterOchre, M4(x, y + h / 2 - 3, z, r2() * 0.2));
    b.add(new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), MAT.trav, M4(x, y + h, z));
  }
  temple(b, { x: 0, z: -700, ry: 0, w: 30, l: 44, podium: 6, colH: 13, cols: 6, order: 'ionic' });
  b.add(new THREE.BoxGeometry(900, 10, 14), MAT.blocks, M4(0, 4, -160));
  for (let i = 0; i < 18; i++) b.add(new THREE.BoxGeometry(10, 18, 12), MAT.blocks, M4(-440 + i * 52, 8, -160));
  b.build();
  galley({ x: 60, y: -0.2, z: 40, ry: 0.6, oars: false, sailUp: false });
  galley({ x: -50, y: -0.2, z: -60, ry: 2.4, oars: false, sailUp: false, hullCol: 0x3a2a20 });
  galley({ x: 0, y: -0.2, z: 260, ry: Math.PI / 2, sail: 0xe8d8b8, sailStripe: 0x5a2a6a });
  galley({ x: 120, y: -0.2, z: 520, ry: 1.2, sail: 0xe0d0b0, sailStripe: 0x5a2a6a });
  trees('pine', Array.from({ length: 40 }, () => [(r2() - 0.5) * 900, -200 - r2() * 500, 1 + r2() * 0.4]), ground);
  return {
    ground,
    cams: {
      wide: { pos: [260, 120, 420], look: [0, 0, 0], fov: 40 },
      sea: { pos: [90, 2.5, 330], look: [0, 6, 100], fov: 42 },
      quay: { pos: [-20, 4, 140], look: [20, 8, 0], fov: 44 },
    },
  };
}
