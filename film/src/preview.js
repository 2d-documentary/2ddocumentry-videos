// Still previews of locations: ?place=forum&cam=wide&era=republic&mood=day&w=1920&h=1080&cast=citizen,senator
import * as THREE from 'three';
import { init, newScene, scene, camera, renderer, ticks } from './engine.js';
import * as P from './places.js';
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
    // wait for textures
    await new Promise((r) => setTimeout(r, +(q.get('wait') || 2500)));
    ticks(3.0); renderer.render(scene, camera);
    await new Promise((r) => setTimeout(r, 300)); renderer.render(scene, camera);
    window.__info = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
    window.__done = true;
  } catch (e) { window.__err = e.stack || String(e); window.__done = true; }
})();
