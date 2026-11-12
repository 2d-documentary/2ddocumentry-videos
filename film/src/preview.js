// Still previews of locations: ?place=forum&cam=wide&era=republic&mood=day&w=1920&h=1080&cast=citizen,senator
import * as THREE from 'three';
import { init, newScene, scene, camera, renderer, ticks, ready } from './engine.js';
import * as P1 from './places.js';
import * as P2 from './places2.js';
import { elephant, animal } from './animals.js';
const P = { ...P1, ...P2 };
import { Actor, setSpriteMeta } from './nature.js';
const q = new URLSearchParams(location.search);
const w = +(q.get('w') || 1920), h = +(q.get('h') || 1080);
init(document.getElementById('c'), { width: w, height: h });
newScene();
window.__err = null; window.addEventListener('error', (e) => { window.__err = String(e.message); });
(async () => {
  try {
    try { setSpriteMeta(await (await fetch('sprites/meta.json')).json()); } catch (e) {}
    const place = await P[q.get('place') || 'forum']({ era: q.get('era') || 'republic', mood: q.get('mood') || undefined });
    const c = place.cams[q.get('cam') || Object.keys(place.cams)[0]];
    camera.fov = c.fov; camera.aspect = w / h; camera.updateProjectionMatrix();
    camera.position.set(...c.pos); camera.lookAt(...c.look);
    const cast = (q.get('cast') || '').split(',').filter(Boolean);
    if (cast.length) {
      const fwd = new THREE.Vector3(...c.look).sub(new THREE.Vector3(...c.pos)); fwd.y = 0; fwd.normalize();
      const right = new THREE.Vector3(-fwd.z, 0, fwd.x), d = +(q.get('dist') || 6);
      cast.forEach((id, i) => {
        const off = (i - (cast.length - 1) / 2) * 1.6, p = new THREE.Vector3(...c.pos).addScaledVector(fwd, d + (i % 2) * 0.8).addScaledVector(right, off);
        new Actor(id, { x: p.x, y: place.ground(p.x, p.z), z: p.z, expr: i === 0 ? 'confused' : 'smug', view: 'q', flip: off > 0, dir: 'sprites/' });
      });
    }
    for (const [i, k] of (q.get('beasts') || '').split(',').filter(Boolean).entries()) {
      const fwd = new THREE.Vector3(...c.look).sub(new THREE.Vector3(...c.pos)); fwd.y = 0; fwd.normalize();
      const p = new THREE.Vector3(...c.pos).addScaledVector(fwd, +(q.get('bdist') || 12) + i * 4).addScaledVector(new THREE.Vector3(-fwd.z, 0, fwd.x), (i - 0.5) * 5);
      const ry = Math.atan2(fwd.x, fwd.z) + (i % 2 ? 2.2 : 1.0);
      (k === 'elephant' ? elephant : (o) => animal(k, o))({ x: p.x, y: place.ground(p.x, p.z), z: p.z, ry });
    }
    await ready(); await new Promise((r) => setTimeout(r, 800));
    ticks(3.0); renderer.render(scene, camera);
    await new Promise((r) => setTimeout(r, 300)); renderer.render(scene, camera);
    const t0 = performance.now(); for (let i = 0; i < 3; i++) { camera.position.x += 0.01; renderer.render(scene, camera); renderer.getContext().finish(); }
    window.__info = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, msPerFrame: Math.round((performance.now() - t0) / 3) };
    window.__done = true;
  } catch (e) { window.__err = e.stack || String(e); window.__done = true; }
})();
