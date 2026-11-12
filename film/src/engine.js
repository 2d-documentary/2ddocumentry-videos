// Rendering core: renderer, PBR materials from Poly Haven textures, real sky photos, sun + shadows, fog, water.
import * as THREE from 'three';

export const W = 1920, H = 1080;
export let renderer, scene, camera;
const loader = new THREE.TextureLoader();
const TEX = {};
const ASSETS = '../assets/ph/';

export function init(canvas, { width = W, height = H } = {}) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 6000);
  return renderer;
}

export function newScene() { scene = new THREE.Scene(); return scene; }

function tex(path, srgb) {
  const key = path + (srgb ? ':s' : '');
  if (!TEX[key]) {
    const t = loader.load(ASSETS + path);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    TEX[key] = t;
  }
  return TEX[key];
}

// PBR material; texture repeats are in world metres via geometry UVs (see uvWorld), `size` = metres per tile
const MATS = {};
export function pbr(name, { size = 2, tint = 0xffffff, rough = 1, normal = 1, metal = 0, side = THREE.FrontSide, key } = {}) {
  const k = key || `${name}|${size}|${tint}|${rough}|${normal}|${metal}|${side}`;
  if (MATS[k]) return MATS[k];
  const rep = 1 / size;
  const map = tex(`${name}_diff.jpg`, true).clone(); map.repeat.set(rep, rep); map.needsUpdate = true;
  const nor = tex(`${name}_nor.jpg`, false).clone(); nor.repeat.set(rep, rep); nor.needsUpdate = true;
  const rgh = tex(`${name}_rough.jpg`, false).clone(); rgh.repeat.set(rep, rep); rgh.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ map, normalMap: nor, roughnessMap: rgh, roughness: rough, metalness: metal, color: tint, side });
  m.normalScale.set(normal, normal);
  MATS[k] = m; return m;
}
export const flat = (color, rough = 0.8, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

// Box-projected world UVs so every surface tiles at real scale (no stretched textures)
export function uvWorld(geo, scale = 1) {
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = x; v = z; } else if (ax >= az) { u = z; v = y; } else { u = x; v = y; }
    uv[i * 2] = u * scale; uv[i * 2 + 1] = v * scale;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}
export function worldUVMesh(geo, mat, parent, { cast = true, receive = true } = {}) {
  // bake the object's transform into UVs by computing them after applying the matrix
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive;
  if (parent) parent.add(m);
  return m;
}

// ---------------------------------------------------------------- sky & light
export async function sky(name, { rot = 0, intensity = 1, envIntensity = 1, fog = null, fogDensity = 0.0012 } = {}) {
  const t = await new Promise((res) => loader.load(ASSETS + `sky_${name}.jpg`, res));
  t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(t).texture;
  scene.environment = env;
  scene.background = t;
  scene.backgroundRotation = new THREE.Euler(0, rot, 0);
  scene.environmentRotation = new THREE.Euler(0, rot, 0);
  scene.backgroundIntensity = intensity;
  scene.environmentIntensity = envIntensity;
  if (fog !== null) scene.fog = new THREE.FogExp2(fog, fogDensity);
  return t;
}

export function sun({ dir = [0.5, 0.8, 0.3], color = 0xfff1dc, intensity = 3.0, size = 120, target = [0, 0, 0], res = 2048 } = {}) {
  const l = new THREE.DirectionalLight(color, intensity);
  const d = new THREE.Vector3(...dir).normalize();
  l.position.set(target[0] + d.x * 400, target[1] + d.y * 400, target[2] + d.z * 400);
  l.target.position.set(...target); scene.add(l.target);
  l.castShadow = true;
  l.shadow.mapSize.set(res, res);
  const c = l.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 10; c.far = 900;
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.04; l.shadow.radius = 3;
  scene.add(l);
  return l;
}
export function hemi(sky = 0xbfd4ee, ground = 0x8a7660, i = 0.35) { const h = new THREE.HemisphereLight(sky, ground, i); scene.add(h); return h; }
export function point(pos, color = 0xffb060, intensity = 30, dist = 12, shadow = false) {
  const l = new THREE.PointLight(color, intensity, dist, 2); l.position.set(...pos); l.castShadow = shadow; scene.add(l); return l;
}

// ---------------------------------------------------------------- water (sky reflection + fresnel + moving ripples)
export function water(size = [400, 400], { color = 0x1d4a52, pos = [0, 0, 0], ripple = 1, opacity = 1, foam = 0 } = {}) {
  const g = new THREE.PlaneGeometry(size[0], size[1], 1, 1); g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.06, metalness: 0.0, transparent: opacity < 1, opacity });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = { value: 0 }; sh.uniforms.uRip = { value: ripple };
    m.userData.shader = sh;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWPos; uniform float uTime; uniform float uRip;
      vec2 wave(vec2 p, vec2 d, float f, float s, float a){ float ph = dot(p,d)*f + uTime*s; return d * cos(ph) * a * f; }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      {
        vec2 p = vWPos.xz; vec2 g = vec2(0.0);
        g += wave(p, normalize(vec2( 1.0, 0.3)), 0.35, 1.1, 0.10);
        g += wave(p, normalize(vec2(-0.4, 1.0)), 0.62, 1.5, 0.06);
        g += wave(p, normalize(vec2( 0.7,-0.8)), 1.30, 2.2, 0.035);
        g += wave(p, normalize(vec2(-1.0,-0.2)), 2.70, 3.1, 0.018);
        g += wave(p, normalize(vec2( 0.2, 1.0)), 5.10, 4.3, 0.010);
        float dist = length(vViewPosition);
        g *= uRip * clamp(60.0 / (dist + 20.0), 0.15, 1.0);
        vec3 nW = normalize(vec3(-g.x, 1.0, -g.y));
        normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
      }`)
      .replace('#include <opaque_fragment>', `
        float fres = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 4.0);
        outgoingLight = mix(outgoingLight, outgoingLight * 1.6 + vec3(0.02), fres * 0.6);
        #include <opaque_fragment>`);
  };
  const w = new THREE.Mesh(g, m); w.position.set(...pos); w.receiveShadow = true; scene.add(w);
  w.userData.tick = (t) => { if (m.userData.shader) m.userData.shader.uniforms.uTime.value = t; };
  return w;
}

// ---------------------------------------------------------------- terrain
export function fbm(x, y, oct = 5, seed = 1) {
  let a = 0, amp = 1, f = 1, tot = 0;
  for (let i = 0; i < oct; i++) { a += amp * vnoise(x * f + seed * 17.1, y * f + seed * 31.7); tot += amp; amp *= 0.5; f *= 2.03; }
  return a / tot;
}
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function terrain({ size = 800, seg = 200, height = (x, z) => 0, mat, pos = [0, 0, 0], uvScale = 1 }) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i) + pos[0], p.getZ(i) + pos[2]));
  uvWorld(g, uvScale);
  const m = new THREE.Mesh(g, mat); m.position.set(...pos); m.receiveShadow = true; m.castShadow = false; scene.add(m);
  return m;
}

export function ticks(t) { scene.traverse((o) => o.userData.tick && o.userData.tick(t)); }
