// node film/stills.mjs <outDir> <w> <h> spec1 spec2 ...   spec = "name:place=forum&cam=wide&era=republic"
import http from 'http'; import fs from 'fs'; import path from 'path'; import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const [out, W, H, ...specs] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const root = path.resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }).listen(0);
const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const spec of specs) {
  const [name, qs] = spec.split(':');
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(`[${name}]`, m.text().slice(0, 300)); });
  const t0 = Date.now();
  await p.goto(`http://localhost:${port}/film/index.html?${qs}&w=${W}&h=${H}`);
  await p.waitForFunction('window.__done === true', null, { timeout: 600000 });
  const err = await p.evaluate('window.__err'); const info = await p.evaluate('window.__info');
  if (err) console.log(`[${name}] ERROR`, err);
  await p.locator('canvas').screenshot({ path: `${out}/${name}.png` });
  console.log(name, ((Date.now() - t0) / 1000).toFixed(1) + 's', JSON.stringify(info));
  await p.close();
}
await b.close(); srv.close();
