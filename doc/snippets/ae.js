// AE-STYLE toolkit (After-Effects-like motion on the canvas engine). Use with kinetic.js: build with
// assemble_scenes.py <ep> --short --kinetic --ae. Cut-outs come from manifest "cutout": true (rembg on GitHub):
// map them in the header as EP.images[id + '_cut'] = 'archives/cutouts/' + id + '.png'.
const _OFF = {};
function offCanvas(name) { if (!_OFF[name]) { const c = document.createElement('canvas'); c.width = W; c.height = H; _OFF[name] = c; } return _OFF[name]; }
function shake(ctx, t, amt = 12) { const f = Math.floor(t * 30); ctx.translate((hash(f) - .5) * amt, (hash(f + 7) - .5) * amt); }

// 2.5D parallax: blurred, darkened plate behind; the cut-out subject sits closer and moves faster
function parallax(ctx, key, lt, o = {}) {
  const cut = IMG[key + '_cut'] ? key + '_cut' : null;
  const z = (o.z0 ?? 1.12) + lt * (o.zs ?? .035), dx = (o.dx ?? .05) * lt;
  photo(ctx, key, { zoom: z, fx: (o.fx ?? .5) - dx, fy: o.fy ?? .5, grade: o.grade || 'cine', blur: cut ? (o.bgBlur ?? 9) : 0 });
  if (!cut) return;
  shade(ctx, o.bgShade ?? .42);
  const fz = z * (1 + (o.pop ?? .07) + lt * (o.fs ?? .035));
  ctx.save(); ctx.shadowColor = o.rim || 'rgba(0,0,0,.75)'; ctx.shadowBlur = 50;
  photo(ctx, cut, { zoom: fz, fx: (o.fx ?? .5) + dx * .6, fy: o.fy ?? .5, grade: o.grade || 'cine' }); ctx.restore();
}

// 3D camera flying through floating photo cards. cards: [{key, x, y, z, w, h?, rot?}] in world px; camera moves +z.
function space3D(ctx, t, lt, cards, o = {}) {
  if (!o.keepBG) { bgGrad(ctx, '#05070D', '#000', 'r'); stars(ctx, t, 160, 4, .8); }
  const camZ = (o.z0 ?? 0) + (o.speed ?? 900) * (o.ease ? E.inOut(prog(lt, 0, o.ease)) * o.ease : lt), Fz = 900, camX = o.camX ?? 0, camY = o.camY ?? 0;
  cards.map(c => ({ ...c, d: c.z - camZ })).filter(c => c.d > 30).sort((a, b) => b.d - a.d).forEach(c => {
    const s = Fz / c.d, x = W / 2 + (c.x - camX) * s, y = H / 2 + (c.y - camY) * s, w = c.w * s, h = (c.h || c.w * .66) * s;
    const a = clamp((3600 - c.d) / 1600) * clamp((c.d - 30) / 160); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate((c.rot || 0) + lt * (c.spin || 0));
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = Math.min(60, 30 * s); ctx.fillStyle = '#F2EFE8'; ctx.fillRect(-w / 2 - 6 * s, -h / 2 - 6 * s, w + 12 * s, h + 12 * s); ctx.shadowColor = 'transparent';
    photo(ctx, c.key, { x: -w / 2, y: -h / 2, w, h, zoom: 1.02, grade: c.grade || 'cine' }); ctx.restore();
  });
}

// per-letter text animator (rise + squash + spin + blur-in), optional 3D extrusion and gradient face
function aeText(ctx, s, x, y, lt, o = {}) {
  const size = o.size || 120, st = o.stagger ?? .04, d0 = o.delay || 0;
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || ''} ${size}px ${o.font || F.play}`.trim(); ctx.textBaseline = 'alphabetic';
  const chars = [...s], ls = o.ls || 0, ws = chars.map(c => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0) + ls * (chars.length - 1);
  let cx = o.align === 'left' ? x : x - tot / 2;
  chars.forEach((c, i) => {
    const p = E.out(prog(lt, d0 + i * st, d0 + i * st + (o.dur || .45)));
    if (p > 0 && c !== ' ') {
      ctx.save(); ctx.translate(cx + ws[i] / 2, y + (1 - p) * (o.rise ?? 90)); ctx.rotate((1 - p) * (o.spin ?? .35) * (i % 2 ? 1 : -1)); ctx.scale(1, lerp(o.squash ?? 1.7, 1, p));
      ctx.globalAlpha = p; ctx.textAlign = 'center'; if (p < .98) ctx.filter = `blur(${(1 - p) * 10}px)`;
      if (o.extrude) for (let k = o.extrude; k > 0; k--) { ctx.fillStyle = k === o.extrude ? 'rgba(0,0,0,.5)' : (o.side || '#7A5A1E'); ctx.fillText(c, k * .55, k * .85); }
      ctx.shadowColor = o.glow || 'rgba(255,255,255,.55)'; ctx.shadowBlur = o.glowBlur ?? 22;
      if (o.grad) { const g = ctx.createLinearGradient(0, -size * .8, 0, size * .1); g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); ctx.fillStyle = g; } else ctx.fillStyle = o.color || '#fff';
      ctx.fillText(c, 0, 0); ctx.restore();
    }
    cx += ws[i] + ls;
  });
  if (o.shine) { const sx = lerp(x - tot, x + tot, prog(lt, o.shine, o.shine + .7)); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - tot, y - size, tot * 2, size * 1.3); }
  ctx.restore();
}

// track matte: a photo seen only through giant letters
function textMatte(ctx, s, key, lt, o = {}) {
  const c = offCanvas('matte'), g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  photo(g, key, { zoom: (o.z0 ?? 1.35) - lt * .06, fx: o.fx ?? .5, fy: o.fy ?? .5, filter: o.filter || 'saturate(1.25) contrast(1.1) brightness(1.35)' });
  g.globalCompositeOperation = 'destination-in'; let size = o.size || (VERT ? 430 : 560); g.font = `${size}px ${o.font || F.bebas}`;
  const w = g.measureText(s).width; if (w > W * .92) { size *= W * .92 / w; g.font = `${size}px ${o.font || F.bebas}`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(W / 2, H * (o.y ?? .5)); const sc = lerp(1.3, 1, E.out(prog(lt, 0, .6)) ) + lt * .02; g.scale(sc, sc); g.fillText(s, 0, 0); g.restore();
  g.globalCompositeOperation = 'source-over';
  if (!o.keepBG) { bgGrad(ctx, '#0B0D14', '#000', 'r'); }
  ctx.save(); ctx.shadowColor = o.glow || 'rgba(255,255,255,.35)'; ctx.shadowBlur = 50; ctx.drawImage(c, 0, 0); ctx.restore();
  ctx.save(); ctx.font = g.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.translate(W / 2, H * (o.y ?? .5)); const sc2 = lerp(1.3, 1, E.out(prog(lt, 0, .6))) + lt * .02; ctx.scale(sc2, sc2);
  ctx.strokeStyle = o.outline || 'rgba(255,255,255,.85)'; ctx.lineWidth = 4 / sc2; ctx.shadowColor = 'rgba(255,255,255,.6)'; ctx.shadowBlur = 18; ctx.strokeText(s, 0, 0); ctx.restore();
}

// motion-blur transitions (call at the end of a shot)
function zoomBlur(ctx, lt, d = .32, dir = 1) { const p = prog(lt, 0, d); if (p >= 1) return; const a = 1 - E.out(p); ctx.save();
  for (let k = 1; k <= 6; k++) { const z = 1 + k * .05 * a * dir; ctx.globalAlpha = .2 * a; ctx.drawImage(ctx.canvas, W / 2 - W * z / 2, H / 2 - H * z / 2, W * z, H * z); } ctx.restore(); }
function whipSmear(ctx, lt, d = .28, dir = 1) { const p = prog(lt, 0, d); if (p >= 1) return; const a = 1 - E.out(p); ctx.save();
  for (let k = 1; k <= 7; k++) { ctx.globalAlpha = .18 * a; ctx.drawImage(ctx.canvas, dir * k * 40 * a, 0); } ctx.restore(); }

// shape layer: rotating 3D block (e.g. a concrete test mass)
function cube3D(ctx, x, y, s, ry, rx = .45, col = [150, 150, 145]) {
  const V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([a, b, c]) => {
    let X = a * Math.cos(ry) + c * Math.sin(ry), Z = -a * Math.sin(ry) + c * Math.cos(ry), Y = b * Math.cos(rx) - Z * Math.sin(rx); Z = b * Math.sin(rx) + Z * Math.cos(rx);
    const k = 4 / (4 + Z); return [x + X * s * k, y + Y * s * k, Z]; });
  const Fc = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]];
  Fc.map(f => ({ f, z: f.reduce((a, i) => a + V[i][2], 0) / 4 })).sort((a, b) => b.z - a.z).forEach(({ f, z }, n) => {
    const l = .55 + .45 * (n / 5); ctx.fillStyle = `rgb(${col.map(c => Math.round(c * l)).join(',')})`; ctx.beginPath(); f.forEach((i, j) => j ? ctx.lineTo(V[i][0], V[i][1]) : ctx.moveTo(V[i][0], V[i][1])); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; ctx.stroke(); });
}
function ocean(ctx, t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8FA9C4'); g.addColorStop(.42, '#C9D6E2'); g.addColorStop(.43, '#1B3B5A'); g.addColorStop(1, '#06121F'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .25; ctx.strokeStyle = '#fff'; for (let i = 0; i < 40; i++) { const y = H * .45 + hash(i) * H * .55, x = (hash(i * 3) * W + t * 30 * (1 + hash(i))) % W; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60 + hash(i) * 80, y); ctx.stroke(); } ctx.restore(); }
function splash(ctx, x, y, t, t0) { const p = prog(t, t0, t0 + 1.2); if (p <= 0) return; ctx.save(); for (let i = 0; i < 70; i++) { const a = -Math.PI / 2 + (hash(i) - .5) * 1.6, v = 500 + hash(i * 3) * 900, tt = p * 1.2;
  const px = x + Math.cos(a) * v * tt, py = y + Math.sin(a) * v * tt + 900 * tt * tt; ctx.globalAlpha = (1 - p) * .9; ctx.fillStyle = '#EAF4FF'; ctx.beginPath(); ctx.arc(px, py, 4 + hash(i * 5) * 9, 0, 7); ctx.fill(); } ctx.restore(); boom(ctx, x, y, t, t0, 500); }

// ---------------------------------------------------------------- "object" transitions (use sparingly: chapter changes, hooks)
// portal: dive INTO a region of the outgoing picture (a door, a window, a bill) and the next scene opens from inside it.
// fromFn(g, lt) / toFn(g, lt) draw full frames on the context they get; rect = [u0, v0, u1, v1] in screen fractions.
function portal(ctx, lt, d, fromFn, toFn, rect, o = {}) {
  const p = E.inOut(clamp(lt / d));
  if (p >= 1) { toFn(ctx, lt); return; }
  const A = offCanvas('portalA'), B = offCanvas('portalB'), ga = A.getContext('2d'), gb = B.getContext('2d');
  [ga, gb].forEach(g => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, W, H); });
  fromFn(ga, lt + (o.fromLt || 0)); toFn(gb, lt);
  const rx = rect[0] * W, ry = rect[1] * H, rw = (rect[2] - rect[0]) * W, rh = (rect[3] - rect[1]) * H, s = lerp(1, Math.max(W / rw, H / rh), p);
  const cx = lerp(rx + rw / 2, W / 2, p), cy = lerp(ry + rh / 2, H / 2, p);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-(rx + rw / 2), -(ry + rh / 2));
  if (p > .02) ctx.filter = `blur(${Math.sin(p * Math.PI) * 5}px)`; ctx.drawImage(A, 0, 0); ctx.filter = 'none';
  ctx.beginPath(); if (o.round) ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, 7); else ctx.rect(rx, ry, rw, rh); ctx.clip();
  const k = Math.max(rw / W, rh / H); ctx.drawImage(B, rx + rw / 2 - W * k / 2, ry + rh / 2 - H * k / 2, W * k, H * k);
  ctx.restore();
  if (p < .35) { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${(.35 - p) * 2})`; ctx.lineWidth = 3; ctx.shadowColor = '#fff'; ctx.shadowBlur = 18; ctx.strokeRect(rx, ry, rw, rh); ctx.restore(); }
}
// film strip unrolling from a roll, frames slide past with labels (timelines, suspects, years)
function filmStrip(ctx, t, lt, keys, o = {}) {
  if (!o.keepBG) { bgGrad(ctx, '#15110C', '#000', 'r'); }
  const fw = VERT ? W * .62 : H * .62, fh = fw * .74, gap = fw * .06, sx = W / 2, n = keys.length;
  const unroll = E.out(clamp(lt / (o.dur || 1.4))), pan = lt * (o.pan ?? 160);
  const total = n * (fh + gap), shown = total * unroll;
  ctx.save(); ctx.translate(sx, (VERT ? H * .18 : H * .12) - pan + (o.y0 || 0));
  ctx.fillStyle = '#0B0B0B'; ctx.fillRect(-fw / 2 - fw * .14, 0, fw * 1.28, shown);
  for (let y = 10; y < shown; y += fw * .07) { ctx.fillStyle = '#E8E1D0'; ctx.fillRect(-fw / 2 - fw * .1, y, fw * .05, fw * .035); ctx.fillRect(fw / 2 + fw * .05, y, fw * .05, fw * .035); }
  keys.forEach((k, i) => { const y = i * (fh + gap) + gap; if (y + fh > shown) return; photo(ctx, k, { x: -fw / 2, y, w: fw, h: fh, zoom: 1.04, grade: o.grade || 'mood' });
    if (o.labels && o.labels[i]) text(ctx, o.labels[i], fw / 2 - 16, y + fh - 18, { font: F.osw, size: fw * .07, color: '#FFE36B', align: 'right', weight: 600, shadow: 12 }); });
  // the roll at the moving end
  const ry = shown; const g = ctx.createLinearGradient(-fw * .7, 0, fw * .7, 0); g.addColorStop(0, '#111'); g.addColorStop(.5, '#3A3A3A'); g.addColorStop(1, '#111');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-fw * .68, ry - fw * .1, fw * 1.36, fw * .2, fw * .1); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 9; i++) ctx.fillRect(-fw * .64 + i * fw * .16, ry - fw * .1, 3, fw * .2);
  ctx.restore();
}
// paper unfolding: a tri-fold document (letter, map, poster) opens panel by panel
function unfold(ctx, key, lt, o = {}) {
  if (!o.keepBG) desk(ctx, lt);
  const im = IMG[key]; const maxW = W * (o.w || .78), maxH = H * (o.h || .7); const r = im ? im.width / im.height : .7;
  let w = maxW, h = w / r; if (h > maxH) { h = maxH; w = h * r; }
  const x0 = W / 2 - w / 2, y0 = H / 2 - h / 2, ph = h / 3, z = 1 + lt * .03;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(-.02); ctx.translate(-W / 2, -H / 2);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40;
  for (let i = 0; i < 3; i++) {
    const p = i === 1 ? 1 : E.out(clamp((lt - (i === 0 ? .1 : .45)) / .5)); const sy = Math.max(.02, p);
    const py = i === 0 ? y0 + ph * (1 - sy) : i === 1 ? y0 + ph : y0 + 2 * ph;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, py, w, ph * sy); ctx.clip(); ctx.translate(0, py); ctx.scale(1, sy); ctx.translate(0, -(y0 + ph * i));
    ctx.fillStyle = '#F2EEE4'; ctx.fillRect(x0, y0 + ph * i, w, ph); photo(ctx, key, { x: x0, y: y0, w, h, zoom: 1, grade: o.grade || 'color' });
    ctx.restore(); if (p < 1) { ctx.fillStyle = `rgba(0,0,0,${.45 * (1 - p)})`; ctx.fillRect(x0, py, w, ph * sy); }
    ctx.shadowColor = 'transparent';
  }
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2; [1, 2].forEach(i => { ctx.beginPath(); ctx.moveTo(x0, y0 + ph * i); ctx.lineTo(x0 + w, y0 + ph * i); ctx.stroke(); });
  ctx.restore();
}
