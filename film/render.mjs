// Renders a range of global frames of the film to an H.264 file.
// node film/render.mjs <out.mp4> <frameFrom> <frameTo> [w] [h]
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process'; import { createRequire } from 'module';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const [out, F0s, F1s, Ws = '1920', Hs = '1080'] = process.argv.slice(2), F0 = +F0s, F1 = +F1s, W = +Ws, H = +Hs, FPS = 24;
const root = path.resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf' };
const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { if (!q.url.includes('favicon')) console.log('404', q.url); r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }).listen(0);
const port = srv.address().port;
const tl = JSON.parse(fs.readFileSync('film/timeline.json'));
const shotAt = (t) => { for (const s of tl.shots) if (t < s.start + s.dur) return s; return tl.shots[tl.shots.length - 1]; };
const groups = []; for (let g = F0; g < F1; g++) { const t = g / FPS, s = shotAt(t); const last = groups[groups.length - 1]; if (last && last.s === s) last.frames.push(g); else groups.push({ s, frames: [g] }); }
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const write = (buf) => new Promise((res) => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-watchdog'] });
let lastFrame = null;
for (const { s, frames } of groups) {
  const t0 = Date.now(); const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', (m) => { if (m.type() === 'error') console.log(`[${s.id}]`, m.text().slice(0, 200)); });
  await page.goto(`http://localhost:${port}/film/film.html?shot=${s.id}&w=${W}&h=${H}`);
  await page.waitForFunction('window.__ready === true', null, { timeout: 900000 });
  const err = await page.evaluate('window.__err'); if (err) console.log(`[${s.id}] ERROR`, err);
  const tb = Date.now();
  for (const g of frames) {
    let url; try { url = await page.evaluate((t) => window.frame(t), g / FPS - s.start); } catch (e) { console.log(`[${s.id}] frame ${g} failed`, String(e).slice(0, 200)); url = null; }
    if (process.env.TIMING) console.log(g, await page.evaluate('JSON.stringify(window.__tm)'));
    const buf = url ? Buffer.from(url.slice(url.indexOf(',') + 1), 'base64') : lastFrame; if (buf) { await write(buf); lastFrame = buf; }
  }
  console.log(`${s.id} ${s.place} frames ${frames.length} build ${((tb - t0) / 1000).toFixed(1)}s render ${((Date.now() - tb) / frames.length / 1000).toFixed(2)}s/f`);
  await page.close();
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await browser.close(); srv.close();
console.log('done', out);
