// Film renderer: one shot per page. film.html?shot=s04_09&w=1920&h=1080
// Builds the place, cast, animals and effects for the shot, then window.frame(t) renders the frame at shot-local
// time t (seconds) and returns it as a JPEG data URL (3D + 2D motion-graphics overlay).
import * as THREE from 'three';
import { init, newScene, scene, camera, renderer, ticks, ready } from './engine.js';
import * as P1 from './places.js';
import * as P2 from './places2.js';
import { Actor, setSpriteMeta, preloadSprites } from './nature.js';
import { elephant, animal, WALKERS } from './animals.js';
import { blocked, BLOCK } from './props.js';
import { loadMap, drawMap } from './mg.js';
import { Overlay } from './overlay.js';

const PLACES = { ...P1, ...P2 };
const q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = +(q.get('h') || 1080), FPS = 24;
const MOODS = ['day', 'golden', 'dusk', 'overcast'];
const CIT = ['citizen', 'citizen2', 'citizenF'];
window.__err = null; window.addEventListener('error', (e) => { window.__err = String(e.message); });

const rng = (seed) => { let s = seed % 2147483647 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const easeIO = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : -(Math.cos(Math.PI * x) - 1) / 2);

let shot, place, overlay, fctx, glCanvas, actors = [], beasts = [], smokes = [], birds = null, sunL = null, isMap = false, scenesFirst = false;

// background extras: where can people stand in each place (besides avoiding props)
const BG = {
  forum: (x, z, o) => o.era !== 'ruins' && x > -74 && x < (o.era === 'kings' ? 46 : o.era === 'republic' ? 104 : 78) && z > -27 && z < 29 && !(x < -48 && Math.abs(z - 2) < 7),
  imperialRome: (x, z) => x > -60 && x < 140 && z > 86 && z < 150 && (x / 100) ** 2 + (z / 84) ** 2 > 1,
  tiber: (x, z, o, pl) => Math.hypot(x - 22, z + 8) < 40 && pl.village.every(([vx, vz]) => Math.hypot(vx - x, vz - z) > 4.2),
  shipyard: (x, z) => z > -34 && z < -3 && x > -95 && x < 95,
};

function parsePlace(p) {
  const [name, ...mods] = p.split(':'), o = {};
  for (const m of mods) { if (MOODS.includes(m)) o.mood = m; else if (m === 'late') o.late = true; else o.era = m; }
  return { name, o };
}
const R = (p) => (p ? new THREE.Vector3(p[0], Array.isArray(p[1]) ? place.ground(p[0], p[2]) + p[1][1] : p[1], p[2]) : null);
const isG = (p) => p && Array.isArray(p[1]);

function camKeys() {
  const c = shot.cam;
  let p0, l0, p1, l1, f0, f1;
  if (c.named) { const a = place.cams[c.named[0]], b = place.cams[c.named[1]]; p0 = new THREE.Vector3(...a.pos); l0 = new THREE.Vector3(...a.look); p1 = new THREE.Vector3(...b.pos); l1 = new THREE.Vector3(...b.look); f0 = c.fov[0] ?? a.fov; f1 = c.fov[1] ?? c.fov[0] ?? b.fov; }
  else { const [k0, k1] = c.keys; p0 = R(k0.pos); l0 = R(k0.look); p1 = R(k1.pos); l1 = R(k1.look); f0 = k0.fov; f1 = k1.fov; }
  if (p0.distanceTo(p1) < 1e-3 && l0.distanceTo(l1) < 1e-3) p1 = p0.clone().lerp(l0, Math.min(0.05, 0.6 / Math.max(1, p0.distanceTo(l0))));   // never a frozen frame: slow push-in
  return { p0, l0, p1, l1, f0, f1, ease: c.ease || 'inout', shake: c.shake || 0 };
}
let CK;
function setCamera(u, t) {
  const k = CK.ease === 'linear' ? u : easeIO(u);
  const p = CK.p0.clone().lerp(CK.p1, k), l = CK.l0.clone().lerp(CK.l1, k);
  // handheld breathing: a few centimetres of slow drift so close shots feel filmed
  const d = p.distanceTo(l), amp = Math.min(0.03, d * 0.004) + CK.shake;
  p.x += Math.sin(t * 0.7) * amp; p.y += Math.sin(t * 0.9 + 1) * amp * 0.6; l.x += Math.sin(t * 0.5 + 2) * amp * 0.5;
  camera.fov = lerp(CK.f0, CK.f1, k); camera.aspect = W / H; camera.near = d < 8 ? 0.05 : 0.2; camera.updateProjectionMatrix();
  camera.position.copy(p); camera.lookAt(l);
}

// sun shadows focused on what the camera looks at (crisp character shadows in close shots)
function focusSun() {
  sunL = scene.children.find((o) => o.isDirectionalLight && o.castShadow); if (!sunL || ['senate', 'palace', 'ravenna'].includes(parsePlace(shot.place).name)) return;
  const pm = CK.p0.clone().lerp(CK.p1, 0.5), lm = CK.l0.clone().lerp(CK.l1, 0.5), dist = pm.distanceTo(lm);
  const f = dist < 70 ? lm : pm.clone().add(lm.clone().sub(pm).normalize().multiplyScalar(60));
  const size = THREE.MathUtils.clamp(dist * 0.9 + Math.max(CK.p0.distanceTo(CK.p1), CK.l0.distanceTo(CK.l1)) * 0.6 + 14, 22, 260);
  const dir = sunL.position.clone().sub(sunL.target.position).normalize();
  sunL.target.position.copy(f); sunL.position.copy(f).addScaledVector(dir, 500);
  const c = sunL.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 50; c.far = 1100; c.updateProjectionMatrix();
  sunL.shadow.mapSize.set(2048, 2048); sunL.shadow.map?.dispose(); sunL.shadow.map = null;
  sunL.shadow.bias = -0.0002 - size * 0.000002; sunL.shadow.normalBias = 0.02 + size * 0.0003;
}

// smoke columns (burning city, campfires): soft billboard puffs drifting upward
function smokeTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function addSmoke(n, near, far, dark, at = null) {
  const tex = smokeTex(), r = rng(n * 977 + 13), fwd = CK.l0.clone().sub(CK.p0); fwd.y = 0; fwd.normalize(); const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  for (let c = 0; c < n; c++) {
    let base, scale;
    if (at) { base = new THREE.Vector3(...at[c]); scale = 0.12; }
    else { base = CK.p0.clone().addScaledVector(fwd, lerp(near, far, r())).addScaledVector(right, (r() - 0.5) * far * 0.9); base.y = place.ground(base.x, base.z); scale = lerp(near, far, 0.5) / 40; }
    for (let i = 0; i < 18; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, color: dark ? 0x3a3530 : 0xb8b2aa, transparent: true, depthWrite: false, opacity: 0.6, fog: true });
      const s = new THREE.Sprite(m); scene.add(s); smokes.push({ s, base, i, ph: r(), scale: scale * (0.8 + r() * 0.6), drift: r() * 0.6 + 0.2 });
    }
  }
}
function tickSmoke(t) {
  for (const p of smokes) {
    const life = ((t * 0.08 + p.ph + p.i / 18) % 1), h = life * 60 * p.scale;
    p.s.position.set(p.base.x + Math.sin(life * 3 + p.ph * 9) * 4 * p.scale + life * 18 * p.drift * p.scale, p.base.y + 2 + h, p.base.z + Math.cos(life * 2 + p.ph * 5) * 3 * p.scale);
    const sz = (4 + life * 22) * p.scale; p.s.scale.set(sz, sz, 1); p.s.material.opacity = 0.55 * Math.sin(Math.PI * Math.min(1, life * 1.15));
  }
}

// a loose flock of birds crossing the sky
function addBirds() {
  const g = new THREE.BufferGeometry(); const N = 14, pos = new Float32Array(N * 6 * 3); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide, fog: true })); m.frustumCulled = false; scene.add(m);
  const r = rng(77), fwd = CK.l0.clone().sub(CK.p0).normalize(), right = new THREE.Vector3(-fwd.z, 0, fwd.x).normalize(), d = Math.max(60, CK.p0.distanceTo(CK.l0) * 1.2);
  const c0 = CK.p0.clone().addScaledVector(fwd, d).addScaledVector(right, -d * 0.6); c0.y = CK.p0.y + d * 0.35 + 10;
  birds = { g, N, c0, right, d, off: Array.from({ length: N }, () => [r() * 14 - 7, r() * 5, r() * 10 - 5, r() * 6]) };
}
function tickBirds(t) {
  if (!birds) return; const { g, N, c0, right, d, off } = birds, p = g.attributes.position.array, s = d / 55;
  for (let i = 0; i < N; i++) {
    const [ox, oy, oz, ph] = off[i], c = c0.clone().addScaledVector(right, t * 9 + ox * s * 3).add(new THREE.Vector3(0, oy * s * 3 + Math.sin(t + ph) * s, oz * s * 3));
    const flap = Math.sin(t * 9 + ph * 3) * 0.7 * s, w = 0.9 * s, b = 0.25 * s, k = i * 18;
    const v = [[c.x, c.y, c.z], [c.x - right.x * b, c.y, c.z - right.z * b], [c.x - right.z * w, c.y + flap, c.z + right.x * w], [c.x, c.y, c.z], [c.x - right.x * b, c.y, c.z - right.z * b], [c.x + right.z * w, c.y + flap, c.z - right.x * w]];
    v.forEach((q, j) => { p[k + j * 3] = q[0]; p[k + j * 3 + 1] = q[1]; p[k + j * 3 + 2] = q[2]; });
  }
  g.attributes.position.needsUpdate = true;
}

function spawnExtras(name, o) {
  const ok = BG[name]; if (!ok || shot.actors.length >= 14) return;
  const r = rng(shot.start * 1000 + 7), fwd = CK.l0.clone().sub(CK.p0); fwd.y = 0; fwd.normalize(); const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const fovH = Math.atan(Math.tan(THREE.MathUtils.degToRad(CK.f0) / 2) * W / H), n = 22, ids = name === 'imperialRome' ? [...CIT, ...CIT, 'legionary'] : name === 'forum' && o.era !== 'kings' ? [...CIT, ...CIT, 'senator'] : CIT;
  let tries = 0, made = 0;
  while (made < n && tries++ < 600) {
    const dist = lerp(7, 48, Math.pow(r(), 0.8)), ang = (r() - 0.5) * 2 * fovH * 1.1, dir = fwd.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
    const p = CK.p0.clone().addScaledVector(dir, dist); if (!ok(p.x, p.z, o, place) || blocked(p.x, p.z, 0.6)) continue;
    if (actors.some((a) => a.root.position.distanceTo(new THREE.Vector3(p.x, a.root.position.y, p.z)) < 2.4)) continue;
    const a = new Actor(ids[Math.floor(r() * ids.length)], { x: p.x, y: place.ground(p.x, p.z), z: p.z, scale: 0.93 + r() * 0.12, view: ['q', 'f', 's', 'q'][Math.floor(r() * 4)], flip: r() < 0.5, expr: ['neutral', 'happy', 'bored', 'neutral', 'confused'][Math.floor(r() * 5)] });
    a.spec = { crowd: true }; a.seed = r() * 100; a.basePos = a.root.position.clone(); a.chat = r() < 0.6; actors.push(a); made++;
    BLOCK.push([p.x, p.z, 0.5]);
  }
}

async function setup() {
  const tl = await (await fetch('timeline.json')).json();
  shot = tl.shots.find((s) => s.id === q.get('shot'));
  const idx = tl.shots.indexOf(shot), prev = tl.shots[idx - 1]; scenesFirst = !prev || prev.scene !== shot.scene;
  window.__shot = { id: shot.id, start: shot.start, dur: shot.dur };
  glCanvas = document.getElementById('c'); const fc = document.getElementById('f'); fc.width = W; fc.height = H; fctx = fc.getContext('2d');
  overlay = new Overlay(W, H);
  await loadMap();
  const { name, o } = parsePlace(shot.place);
  if (name === 'map') { isMap = true; return; }
  init(glCanvas, { width: W, height: H }); newScene();
  try { setSpriteMeta(await (await fetch('sprites/meta.json')).json()); } catch (e) {}
  place = await PLACES[name === 'map' ? 'mapTable' : name]({ ...o });
  CK = camKeys(); setCamera(0, 0);
  // cast
  for (const a of shot.actors) {
    let p = R(a.pos);
    if (a.crowd && blocked(p.x, p.z, 0.5)) { const r = rng(Math.round(p.x * 100 + p.z)); for (let k = 0; k < 40; k++) { const c = p.clone().add(new THREE.Vector3((r() - 0.5) * 2 * (1 + k * 0.2), 0, (r() - 0.5) * 2 * (1 + k * 0.2))); if (!blocked(c.x, c.z, 0.5)) { p = c; if (isG(a.pos)) p.y = place.ground(p.x, p.z) + a.pos[1][1]; break; } } }
    const act = new Actor(a.id, { x: p.x, y: p.y, z: p.z, scale: a.scale || 1, expr: a.expr, view: a.view, flip: a.flip });
    act.spec = a; act.basePos = p.clone(); act.seed = actors.length * 7.3 + 1; act.chat = !!a.crowd; actors.push(act);
    if (a.walk) { act.from = a.walk.from ? R(a.walk.from) : p.clone(); act.to = a.walk.to ? R(a.walk.to) : p.clone(); }
  }
  spawnExtras(name, o);
  // animals that belong to the shot
  for (const b of shot.fx.beasts || []) {
    const p = R(b.pos); let ry = b.ry || 0, to = null;
    if (b.walk) { to = R(b.walk.to); ry = Math.atan2(-(to.z - p.z), to.x - p.x); }
    const A = b.kind === 'elephant' ? elephant({ x: p.x, y: p.y, z: p.z, ry, saddle: b.saddle !== false, moving: !!b.walk }) : animal(b.kind, { x: p.x, y: p.y, z: p.z, ry, moving: !!b.walk });
    beasts.push({ A, p, to, walk: b.walk, g: isG(b.pos) });
  }
  if (shot.fx.smoke) addSmoke(4, 90, 260, true);
  if (place.smoke) addSmoke(place.smoke.length, 0, 0, false, place.smoke);
  const outdoor = !['senate', 'palace', 'ravenna'].includes(name);
  if (outdoor && (o.mood || 'day') !== 'overcast' && !shot.fx.smoke) addBirds();
  focusSun();
  const need = new Set(); for (const a of actors) { const ex = new Set([a.spec.expr || a.expr, ...Object.values(a.spec.exprs || {})]); for (const e of ex) for (const m of [0, 1, 2]) need.add(a.path({ expr: e, mouth: m })); }
  await preloadSprites([...need]);
  await ready(); await new Promise((r) => setTimeout(r, 400));
}

function mouthAt(a, t) {
  for (const k of shot.talks) if (k.id === a.spec.id && !a.spec.crowd && a === actors.find((x) => x.spec.id === k.id && !x.spec.crowd) && t >= k.t0 && t < k.t1) { const f = Math.floor((t - k.t0) * FPS); return +(k.mouth[f] || 0); }
  if (a.chat) { const s = a.seed; if (Math.sin(t * 0.9 + s * 7) > 0.35) return (Math.floor(t * 7 + s) % 3) ? 1 : 0; }
  return 0;
}

window.frame = async (t) => {
  const u = Math.min(1, Math.max(0, t / shot.dur)), gt = shot.start + t, frameNo = Math.round(gt * FPS);
  if (isMap) {
    const [a, b] = shot.fx.map; drawMap(fctx, W, H, a, b, u, t);
  } else {
    setCamera(u, t);
    for (const a of actors) {
      let p = a.basePos.clone(), walking = false;
      if (a.spec.walk) { const w = a.spec.walk, k = smooth((u - w.t0) / Math.max(0.01, w.t1 - w.t0)); p = a.from.clone().lerp(a.to, k); walking = k > 0 && k < 1; if (isG(a.spec.pos)) p.y = place.ground(p.x, p.z) + a.spec.pos[1][1]; }
      const mouth = mouthAt(a, t);
      if (walking) p.y += Math.abs(Math.sin(t * 9 + a.seed)) * 0.05;
      else if (mouth) p.y += 0.006 * mouth;
      a.root.position.copy(p); a.mesh.rotation.z = walking ? Math.sin(t * 9 + a.seed) * 0.025 : Math.sin(t * 0.8 + a.seed) * 0.006;
      let expr = a.spec.expr || a.expr; const ex = a.spec.exprs || {}; for (const k of Object.keys(ex).map(Number).sort((x, y) => x - y)) if (u >= k) expr = ex[k];
      a.set({ mouth, expr });
    }
    for (const b of beasts) {
      if (b.walk) { const k = Math.min(1, Math.max(0, (u - b.walk.t0) / Math.max(0.01, b.walk.t1 - b.walk.t0))), p = b.p.clone().lerp(b.to, k); if (b.g) p.y = place.ground(p.x, p.z);
        b.A.root.position.copy(p); const dist = b.p.distanceTo(b.to) * k; b.A.pose(dist / (b.A.size * 0.62) * Math.PI * 2 + t * 0.0001, 0.26); }
      else b.A.idle(gt);
    }
    for (const w of WALKERS) if (!beasts.some((b) => b.A === w) && w.root.position.distanceTo(camera.position) < 140) w.idle(gt);
    if (place.banners && shot.fx.banner) { const bn = place.banners[0], k = smooth((u - 0.35) / 0.4); bn.position.y = 8 - k * 7.6; bn.rotation.x = -k * 1.3; bn.rotation.z = k * 0.3; }
    tickSmoke(gt); tickBirds(t); ticks(gt);
    const moving = beasts.some((b) => b.walk) || actors.some((a) => a.spec.walk);
    renderer.shadowMap.autoUpdate = false; if (moving || frameNo % 4 === 0 || !window.__shadowed) { renderer.shadowMap.needsUpdate = true; window.__shadowed = true; }
    const T0 = performance.now(); renderer.render(scene, camera); renderer.getContext().finish(); const T1 = performance.now();
    fctx.drawImage(glCanvas, 0, 0, W, H); window.__tm = [Math.round(T1 - T0), Math.round(performance.now() - T1)];
  }
  overlay.post(fctx, frameNo);
  if (shot.title && !shot.fx.endcard) overlay.title(fctx, shot.title, t, shot.dur);
  (shot.names || []).forEach((n, i) => overlay.name(fctx, n, (shot.title ? 5.2 : 0.7) + i * 4.4, t, shot.dur));
  if (shot.fx.endcard) overlay.endcard(fctx, shot.title, t, shot.dur);
  if (shot.fx.fadeTo === 'dark' || shot.fx.endcard) overlay.black(fctx, smooth((t - (shot.dur - 1.3)) / 1.3));
  if (scenesFirst) overlay.black(fctx, 1 - smooth(t / (shot.scene === 1 ? 1.6 : 0.4)));
  return document.getElementById('f').toDataURL('image/jpeg', 0.93);
};

setup().then(() => { window.__ready = true; }).catch((e) => { window.__err = e.stack || String(e); window.__ready = true; });
