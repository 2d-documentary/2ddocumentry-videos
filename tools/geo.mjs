// Coastlines for the motion-graphics maps: Natural Earth land (via world-atlas, 1:50m), clipped to the
// Mediterranean world and written as compact lon/lat rings to assets/geo/med_land.json
import fs from 'fs'; import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const topo = require('world-atlas/land-50m.json'); const { feature } = require('topojson-client');
const land = feature(topo, topo.objects.land);
const B = { x0: -25, x1: 65, y0: 12, y1: 64 };
function clip(ring) {   // Sutherland-Hodgman against the lon/lat box
  const edges = [[(p) => p[0] >= B.x0, (a, b) => [B.x0, a[1] + (b[1] - a[1]) * (B.x0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= B.x1, (a, b) => [B.x1, a[1] + (b[1] - a[1]) * (B.x1 - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= B.y0, (a, b) => [a[0] + (b[0] - a[0]) * (B.y0 - a[1]) / (b[1] - a[1]), B.y0]],
    [(p) => p[1] <= B.y1, (a, b) => [a[0] + (b[0] - a[0]) * (B.y1 - a[1]) / (b[1] - a[1]), B.y1]]];
  let out = ring;
  for (const [inside, cut] of edges) { const inp = out; out = []; if (!inp.length) break;
    for (let i = 0; i < inp.length; i++) { const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b)); } }
  return out;
}
const rings = [];
for (const poly of land.geometry.coordinates) for (const r of poly) { const c = clip(r); if (c.length > 3) rings.push(c.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100])); }
fs.mkdirSync('assets/geo', { recursive: true });
fs.writeFileSync('assets/geo/med_land.json', JSON.stringify({ bbox: B, rings }));
console.log('rings', rings.length, 'points', rings.reduce((a, r) => a + r.length, 0));
