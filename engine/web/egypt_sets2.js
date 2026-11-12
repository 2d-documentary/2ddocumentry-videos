// egypt_sets2.js — the remaining Egypt sets for the full episode (same engine: Stage + paint + egypt_sets helpers)
'use strict';

// ---------- sprites ----------
function chariotSprite(ctx, x, y, k, o = {}) { // Egyptian war chariot with two horses, facing right; units ≈ metres
  const T = (px, py) => [x + px * k, y - py * k]; const lw = Math.max(1.6, .1 * k), dir = o.flip ? -1 : 1;
  ctx.save(); if (o.flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
  const horse = (dx, col) => { const H = HORSE.map(([u, v]) => [dx + u * 2.6, v * 2.1]); blob(ctx, g => { const P = spline(H, true, 3).map(q => T(...q)); P.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); }, col, { lw, shade: g => { g.fillStyle = 'rgba(40,20,10,.25)'; const a = T(dx, .9); g.fillRect(a[0], a[1], 3 * k, 1.4 * k); } }); poly(ctx, [T(dx + 2.25, 2.1), T(dx + 2.35, 2.5), T(dx + 2.45, 2.1)], o.plume || '#C0453A', true, lw * .7); };
  horse(.55, '#6E4A32'); horse(.15, '#8A5E3C');
  inkLine(ctx, [T(-1.1, .9), T(.6, 1.15)], lw * 1.3, { col: '#4A3420' });   // pole
  poly(ctx, [T(-2.1, .85), T(-.9, .85), T(-.95, 1.9), T(-2.05, 1.8)], o.box || '#B8463A', true, lw);   // chariot box
  const c = T(-1.5, .55); ctx.beginPath(); ctx.arc(c[0], c[1], .55 * k, 0, 7); ctx.fillStyle = '#8A5E3C'; ctx.fill(); inkLine(ctx, Array.from({ length: 17 }, (_, i) => [c[0] + Math.cos(i / 16 * 6.283) * .55 * k, c[1] + Math.sin(i / 16 * 6.283) * .55 * k]), lw, { closed: true });
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI; inkLine(ctx, [[c[0] + Math.cos(a) * .5 * k, c[1] + Math.sin(a) * .5 * k], [c[0] - Math.cos(a) * .5 * k, c[1] - Math.sin(a) * .5 * k]], lw * .6); }
  if (o.crew !== false) egPerson(ctx, ...T(-1.5, 1.85), 1.6 * k, { seed: o.seed || 3, pose: 'stand' });
  ctx.restore();
}
function galleySprite(ctx, x, y, k, o = {}) { // ancient war galley: long hull, ram, oars, square sail
  const T = (px, py) => [x + px * k, y - py * k]; const lw = Math.max(1.6, .1 * k);
  const hull = spline([[-9, 1.6], [-6, .4], [6, .3], [9.6, .9], [10.8, .2], [9.4, -.2], [-7, -.3], [-9.6, .6], [-10.2, 2.2]], true, 3).map(q => T(...q));
  for (let i = 0; i < 14; i++) { const ox = -6 + i * .95; inkLine(ctx, [T(ox, .3), T(ox - .8, -1.2 - Math.sin(i + (o.t || 0) * 3) * .2)], Math.max(1.2, .06 * k), { col: '#4A3420' }); }
  blob(ctx, g => hull.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])), o.hull || '#6E4A2C', { lw, shade: g => { g.fillStyle = o.band || '#B8463A'; const a = T(-9, .9); g.fillRect(a[0], a[1], 20 * k, .35 * k); g.fillStyle = 'rgba(0,0,0,.25)'; const b = T(-9, .2); g.fillRect(b[0], b[1], 20 * k, .6 * k); } });
  inkLine(ctx, [T(0, .6), T(0, 7.6)], lw * 1.1, { col: '#4A3420' }); inkLine(ctx, [T(-3.2, 7.2), T(3.2, 7.2)], lw, { col: '#4A3420' });
  blob(ctx, g => { const P = [T(-3, 7.1), T(3, 7.1), T(3.3, 2.4), T(-3.3, 2.4)]; g.moveTo(...P[0]); g.quadraticCurveTo(...T(3.6, 4.8), ...P[2]); g.lineTo(...P[3]); g.quadraticCurveTo(...T(-3.6, 4.8), ...P[0]); }, o.sail || '#EDE3CF', { lw, shade: g => { g.fillStyle = o.sailBand || 'rgba(160,60,40,.6)'; for (const v of [3.6, 5.4]) { const a = T(-3.5, v + .3); g.fillRect(a[0], a[1], 7 * k, .5 * k); } } });
  if (o.smoke) { for (let i = 0; i < 6; i++) { const p = T(-1 + Math.sin(i) * 2, 8 + i * 1.6); ctx.fillStyle = `rgba(70,60,60,${.35 - i * .05})`; ctx.beginPath(); ctx.arc(p[0], p[1], (1.2 + i * .5) * k, 0, 7); ctx.fill(); } }
}
function columnPapyrus(S, x, y, h, r, col, o = {}) { // closed-bud papyrus column with painted bands and an abacus block
  S.cylinder(x, y, 0, r, h * .86, col, { segs: 16, r2: r * .82, tex: 'colBands', top: shade(col, .9) });
  S.cylinder(x, y, h * .86, r * .82, h * .1, shade(col, 1.04), { segs: 16, r2: r * 1.15, top: shade(col, .9), shadow: false });
  S.box(x - r * .9, y - r * .9, h * .96, r * 1.8, r * 1.8, h * .05, shade(col, .95), { shadow: false, inkK: .08 });
}
function sunAten(ctx, cx, cy, R, t = 0) { // the Aten: a sun disc with long rays ending in small hands
  ctx.save(); const g = ctx.createRadialGradient(cx, cy, R * .4, cx, cy, R * 4); g.addColorStop(0, 'rgba(255,236,170,.65)'); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(cx - R * 4, cy - R * 4, R * 8, R * 8); ctx.restore();
  for (let i = 0; i < 11; i++) { const a = Math.PI * (.18 + .64 * i / 10), L = R * (3.2 + (i % 3) * .5); const x1 = cx + Math.cos(a) * R * 1.05, y1 = cy + Math.sin(a) * R * 1.05, x2 = cx + Math.cos(a) * L, y2 = cy + Math.sin(a) * L;
    inkLine(ctx, [[x1, y1], [x2, y2]], 3.2, { col: '#C98A2E' }); ctx.fillStyle = '#E9B94A'; ctx.beginPath(); ctx.ellipse(x2, y2, 9, 6, a, 0, 7); ctx.fill(); inkLine(ctx, [[x2 - 9, y2], [x2, y2 - 6], [x2 + 9, y2], [x2, y2 + 6]], 1.6, { closed: true, col: '#7A4A1A' }); }
  blob(ctx, g => g.arc(cx, cy, R, 0, 7), '#F2C14E', { lw: 3.5, shade: g => { g.fillStyle = 'rgba(255,250,220,.6)'; g.beginPath(); g.arc(cx - R * .3, cy - R * .3, R * .5, 0, 7); g.fill(); g.fillStyle = 'rgba(200,110,30,.35)'; g.beginPath(); g.arc(cx + R * .25, cy + R * .3, R * .7, 0, 7); g.fill(); } });
  blob(ctx, g => { g.moveTo(cx - R * .2, cy - R * .95); g.quadraticCurveTo(cx, cy - R * 1.5, cx + R * .2, cy - R * .95); g.closePath(); }, '#C0453A', { lw: 2.4 });   // uraeus
}

// ---------- sets ----------
SETS.title = (ctx, o = {}) => { // parchment title card with a hieroglyph border and the Giza silhouette
  ctx.fillStyle = '#E8D3A2'; ctx.fillRect(0, 0, 1920, 1080); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .5; ctx.drawImage(paperTexture(), 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createRadialGradient(960, 540, 300, 960, 540, 1100); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(1, 'rgba(120,70,30,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
  const r = rng(11); for (const [x0, y0, w, h, n, vert] of [[60, 40, 1800, 70, 34, false], [60, 970, 1800, 70, 34, false], [40, 120, 70, 840, 12, true], [1810, 120, 70, 840, 12, true]]) { inkLine(ctx, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], 3, { closed: true, col: '#7A4A22' }); for (let i = 0; i < n; i++) vert ? quadrat(ctx, r, x0 + 6, y0 + i * h / n + 4, w - 12, h / n - 8, '#C79A5C') : quadrat(ctx, r, x0 + i * w / n + 4, y0 + 6, w / n - 8, h - 12, '#C79A5C'); }
  // Giza silhouette band
  ctx.fillStyle = '#C99A5E'; for (const [x, b, h] of [[700, 260, 190], [980, 300, 230], [1230, 200, 140]]) { ctx.beginPath(); ctx.moveTo(x - b, 900); ctx.lineTo(x, 900 - h); ctx.lineTo(x + b, 900); ctx.fill(); ctx.fillStyle = shade('#C99A5E', .85); ctx.beginPath(); ctx.moveTo(x, 900 - h); ctx.lineTo(x + b, 900); ctx.lineTo(x + b * .25, 900); ctx.fill(); ctx.fillStyle = '#C99A5E'; inkLine(ctx, [[x - b, 900], [x, 900 - h], [x + b, 900]], 3, { col: '#7A4A22' }); }
  ctx.fillStyle = '#B8874E'; ctx.fillRect(120, 900, 1680, 60); inkLine(ctx, [[120, 900], [1800, 900]], 3, { col: '#7A4A22' });
  brushTexture(ctx, .2);
};

SETS.throne = (ctx, o = {}) => { // palace audience hall: painted papyrus columns, a dais with the gilded throne, frieze, clerestory light
  const S = new Stage({ x: 0, y: -26, z: 1.7, yaw: 0, f: 1050, hy: 470, cx: 960 }, [.3, .6, .75]);
  ctx.fillStyle = '#5A3A26'; ctx.fillRect(0, 0, 1920, 1080);
  S.box(-24, 18, 0, 48, 1, 11, '#E6D3A8', { tex: 'plaster', seed: 31, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] > -.9) return; // back wall: dado, figure frieze, star ceiling band
    poly(c, uvRect(St, f, 0, 0, 1, .12), '#8A5A3A'); poly(c, uvRect(St, f, 0, .12, 1, .15), '#3E6E8E'); poly(c, uvRect(St, f, 0, .15, 1, .17), '#C0453A');
    for (let i = 0; i < 9; i++) { const u0 = .04 + i * .107; reliefOn(c, St, f, col, [u0, .22, u0 + .08, .62], [{ pts: [[.3, 0], [.38, .45], [.34, .62], [.42, .84], [.56, .84], [.6, .62], [.52, .44], [.68, 0]], smooth: true, paint: ['#3E6E8E', '#C0453A', '#3F8A5A'][i % 3] }, { circle: [.5, .9, .08], ax: .9, fill: '#3A2A20' }, { pts: [[.6, .7], [.9, .62]], line: true }]); }
    glyphColumns(c, St, f, col, .02, .98, .66, .86, 7); poly(c, uvRect(St, f, 0, .88, 1, 1), '#2E4E7A'); const r = rng(4); for (let i = 0; i < 70; i++) { const q = St.uv(f, r(), .9 + r() * .09); c.fillStyle = '#E3C25A'; c.beginPath(); c.arc(q[0], q[1], 2.5, 0, 7); c.fill(); } } });
  for (const sx of [-1, 1]) S.box(sx > 0 ? 24 : -25, -26, 0, 1, 44, 11, '#DCC79C', { tex: 'plaster', seed: 33 + sx });
  S.box(-30, -24, 0, 60, 43, .2, '#B8956A', { floor: true, topTex: 'paving', slab: 1.5, top: '#C9A678', shadow: false });
  // dais + throne
  for (let i = 0; i < 3; i++) S.box(-6 + i, 10 + i * .8, i * .35, 12 - 2 * i, 7, .35, '#D9C49A', { shadow: false });
  S.sprite([0, 14.6, 1.05], (c, px, py, k) => { poly(c, [[px - .9 * k, py], [px + .9 * k, py], [px + .9 * k, py - 1 * k], [px - .9 * k, py - 1 * k]], '#D9B24E', true, 2.5); poly(c, [[px - .8 * k, py - 1 * k], [px + .8 * k, py - 1 * k], [px + .7 * k, py - 2.6 * k], [px - .7 * k, py - 2.6 * k]], '#D9B24E', true, 2.5); poly(c, [[px - .55 * k, py - 1.2 * k], [px + .55 * k, py - 1.2 * k], [px + .5 * k, py - 2.4 * k], [px - .5 * k, py - 2.4 * k]], '#3E6EB0', true, 2); for (const sx of [-1, 1]) { poly(c, [[px + sx * .95 * k, py], [px + sx * 1.1 * k, py], [px + sx * 1.1 * k, py - 1.35 * k], [px + sx * .9 * k, py - 1.45 * k]], '#C0453A', true, 2); } });
  for (const x of [-15, -9, 9, 15]) for (const y of [-8, 6]) columnPapyrus(S, x, y, 10.5, .85, '#E8D9B4');
  // clerestory light shafts
  ctx.save(); S.render(ctx); ctx.globalCompositeOperation = 'screen'; for (const x0 of [420, 980, 1500]) { const g = ctx.createLinearGradient(x0, 0, x0 + 200, 1080); g.addColorStop(0, 'rgba(255,220,150,.35)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + 120, 0); ctx.lineTo(x0 + 420, 1080); ctx.lineTo(x0 + 200, 1080); ctx.closePath(); ctx.fill(); } ctx.restore();
  jarSprite(ctx, 120, 1092, 170, '#2F7FA8', 1); bush(ctx, 1830, 1095, 120, 9, '#5E8A44');
  brushTexture(ctx, .2); warmGrade(ctx);
};

SETS.deirelbahari = (ctx, o = {}) => { // Hatshepsut's temple: three colonnaded terraces and a central ramp against the Theban cliffs
  const H = 520;
  skyGradient(ctx, H + 30, '#7FAFD2', '#CFE1E2', '#F4E1B8'); clouds(ctx, [[1600, 110, 80, 71], [300, 140, 60, 73]]);
  ridge(ctx, H - 40, 360, '#CC9A64', 21, { cliffs: true, ink: 3 });
  const S = new Stage({ x: 0, y: -75, z: 3, yaw: 0, f: 1150, hy: H, cx: 960 }, [-.6, -.55, .6]);
  const terrace = (y, z, w, d, h, n, col) => { S.box(-w / 2, y, z, w, d, h, col, { tex: 'blocks', course: .8, blockW: 2.4, top: '#D8BC8C' }); S.box(-w / 2 + 1, y + 1.2, z + h, w - 2, 3.4, 6.5, '#5A4030', { shadow: false, noInk: true });
    for (let i = 0; i < n; i++) { const x = -w / 2 + 1.2 + i * (w - 2.4) / (n - 1); if (Math.abs(x) < 6) continue; S.box(x - .65, y + .6, z + h, 1.3, 1.3, 6, '#E3CDA0', { tex: 'blocks', course: 1, blockW: 1.3, seed: i }); }
    S.box(-w / 2 + .4, y + .3, z + h + 6, w - .8, 3.6, .9, '#DCC598', { shadow: false }); };
  terrace(0, 0, 120, 30, 2, 22, '#D6BE90'); terrace(30, 8.9, 100, 26, 2, 18, '#D2B98A'); terrace(56, 17.8, 70, 22, 2, 12, '#CDB282');
  for (const [y0, z0, y1, z1] of [[-25, 0, 0, 2], [8, 8.9, 30, 10.9], [34, 17.8, 56, 19.8]]) { S.quad([-5, y0, z0], [5, y0, z0], [5, y1, z1], [-5, y1, z1], '#D8C094', { paint: (c, St, f) => { for (let i = 1; i < 12; i++) { const a = St.uv(f, 0, i / 12), b = St.uv(f, 1, i / 12); c.strokeStyle = 'rgba(120,80,40,.4)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } } }); S.quad([5, y0, z0], [5, y1, z0], [5, y1, z1], [5, y1, z1], '#BFA376', {}); }
  for (const x of [-34, -27, 27, 34]) palmAt(S, x, -30, 10, Math.abs(x) + 3);
  for (const x of [-10, 10]) S.sprite([x, -26, 0], (c, px, py, k) => { c.save(); if (x > 0) { c.translate(px, 0); c.scale(-1, 1); c.translate(-px, 0); } smallSphinx(c, px - 2.5 * k, py, k); c.restore(); });
  ctx.fillStyle = vgrad(ctx, H, 1080, '#E2C896', '#CFAE78'); ctx.fillRect(0, H, 1920, 1080 - H); S.groundDetail(ctx, { col: '#D9BA86', seed: 13, count: 700, far: 300 });
  S.render(ctx);
  bush(ctx, 110, 1095, 150, 12, '#6E8A40'); jarSprite(ctx, 1800, 1090, 140, '#A9603A', 3);
  brushTexture(ctx, .2); warmGrade(ctx);
};

SETS.amarna = (ctx, o = {}) => { // Akhetaten: the open-air Great Aten Temple, rows of offering altars under the sun disc
  const H = 560;
  skyGradient(ctx, H + 30, '#9CC4DE', '#E6EDDC', '#FAEAC2');
  sunAten(ctx, 1240, 210, 95);
  ridge(ctx, H - 10, 70, '#E2C495', 31, { cliffs: true, ink: 2 });
  const S = new Stage({ x: 0, y: -38, z: 5, yaw: .05, f: 1100, hy: H, cx: 960 }, [.1, .3, .95]);
  S.box(-50, 60, 0, 100, 4, 7, '#EDE3CA', { tex: 'plaster', seed: 41 }); S.battered(-14, 58, 0, 10, 6, 14, 1.2, '#EFE6CF', { tex: 'plaster', seed: 42 }); S.battered(4, 58, 0, 10, 6, 14, 1.2, '#EFE6CF', { tex: 'plaster', seed: 43 });
  for (const x of [-12, -7, 7, 12]) { S.cylinder(x, 57.5, 0, .25, 19, '#7A5634', { segs: 6 }); S.sprite([x, 57.5, 19], (c, px, py, k) => poly(c, [[px, py], [px + 3 * k, py + .5 * k], [px, py + 1 * k]], x < 0 ? '#C0453A' : '#3E6EB0', true, 2)); }
  for (let j = 0; j < 7; j++) for (let i = -6; i <= 6; i++) { if (i === 0) continue; const x = i * 4.2, y = 8 + j * 7; S.box(x - .8, y - .6, 0, 1.6, 1.2, 1.1, '#F1EAD6', { tex: 'plaster', seed: i * 9 + j, shadow: true }); S.sprite([x, y, 1.1], (c, px, py, k) => { const r = rng(i * 13 + j); for (let m = 0; m < 3; m++) { const q = [px + (r() - .5) * .9 * k, py - .1 * k]; c.fillStyle = ['#D9B24E', '#C0453A', '#3F8A5A', '#E9DFC8'][Math.floor(r() * 4)]; c.beginPath(); c.ellipse(q[0], q[1] - .15 * k, .2 * k, .18 * k, 0, 0, 7); c.fill(); } }); }
  S.box(-24, -16, 0, 48, 8, 2.2, '#EAE0C6', { tex: 'plaster', seed: 44 }); S.box(-3, -16.1, 0, 6, .3, 2.2, '#3B2C24', { shadow: false });
  for (const x of [-30, 30, 36]) palmAt(S, x, -6, 10, x + 50);
  ctx.fillStyle = vgrad(ctx, H, 1080, '#F0E2C0', '#DCC59A'); ctx.fillRect(0, H, 1920, 1080 - H); S.groundDetail(ctx, { col: '#E6D2AA', seed: 17, count: 500, far: 200 });
  S.render(ctx, { shadowCol: 'rgba(130,80,40,.25)' });
  bush(ctx, 1830, 1095, 130, 15, '#6E8A40');
  brushTexture(ctx, .18); warmGrade(ctx, .7);
};

SETS.tomb = (ctx, o = {}) => { // KV62-style burial chamber: yellow painted walls, the gilded shrine, the stone sarcophagus, torchlight
  const S = new Stage({ x: 0, y: -12, z: 1.7, yaw: 0, f: 1000, hy: 520, cx: 960 }, [.4, -.6, .7]);
  ctx.fillStyle = '#2A1A12'; ctx.fillRect(0, 0, 1920, 1080);
  S.box(-8, 8, 0, 16, 1, 5.2, '#E3B85C', { tex: 'plaster', seed: 51, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] > -.9) return;
    poly(c, uvRect(St, f, 0, 0, 1, .1), '#8A5A3A');
    for (let i = 0; i < 6; i++) { const u0 = .05 + i * .155; reliefOn(c, St, f, col, [u0, .14, u0 + .12, .8], [{ pts: [[.3, 0], [.38, .45], [.34, .62], [.42, .84], [.56, .84], [.6, .62], [.52, .44], [.68, 0]], smooth: true, paint: ['#F1EADB', '#3E6E8E', '#3F8A5A'][i % 3] }, { circle: [.5, .9, .08], ax: .9, fill: '#2A1E14' }, { pts: [[.6, .7], [.9, .6]], line: true }]); }
    glyphColumns(c, St, f, col, .02, .98, .84, .98, 9); } });
  for (const sx of [-1, 1]) S.box(sx > 0 ? 8 : -9, -12, 0, 1, 21, 5.2, '#D9AE52', { tex: 'plaster', seed: 52 + sx, paint: (c, St, f, col) => { for (let i = 0; i < 12; i++) { const r = rng(i + sx * 9); const q = St.uv(f, .1 + i * .07, .55); c.fillStyle = '#5A3A26'; c.beginPath(); c.ellipse(q[0], q[1], 10, 16, 0, 0, 7); c.fill(); } } });   // baboons
  S.box(-10, -14, 0, 20, 24, .1, '#8E6A46', { floor: true, shadow: false });
  if (o.workshop) { // embalming table, canopic jars, natron heap, linen
    S.box(-2.6, 0, 0, 5.2, 1.6, .9, '#C9A47C', { tex: 'blocks', course: .9, blockW: 5.2 }); S.sprite([0, .8, .9], (c, px, py, k) => { blob(c, g => g.ellipse(px, py - .25 * k, 2.2 * k, .32 * k, 0, 0, 7), '#E9DFC8', { lw: 2.4, shade: g => { g.strokeStyle = 'rgba(150,130,100,.6)'; g.lineWidth = 2; for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(px + i * .3 * k, py - .5 * k); g.lineTo(px + i * .3 * k + .15 * k, py); g.stroke(); } } }); });
    S.sprite([-5, -2, 0], (c, px, py, k) => { for (let i = 0; i < 4; i++) { jarSprite(c, px + i * .55 * k, py, .7 * k, '#E3D6B6', 1); const hx = px + i * .55 * k, hy = py - .72 * k; c.fillStyle = ['#D9B24E', '#8A6A4A', '#3E6E8E', '#C0453A'][i]; c.beginPath(); c.arc(hx, hy, .14 * k, 0, 7); c.fill(); inkLine(c, Array.from({ length: 13 }, (_, j) => [hx + Math.cos(j / 12 * 6.283) * .14 * k, hy + Math.sin(j / 12 * 6.283) * .14 * k]), 1.8, { closed: true }); } });   // four canopic jars
    S.sprite([4.4, -2.5, 0], (c, px, py, k) => { blob(c, g => { g.moveTo(px - 1.1 * k, py); g.quadraticCurveTo(px, py - 1.3 * k, px + 1.1 * k, py); g.closePath(); }, '#EFE8DA', { lw: 2.4, shade: g => { const r = rng(5); g.fillStyle = 'rgba(160,150,140,.4)'; for (let i = 0; i < 40; i++) g.fillRect(px + (r() - .5) * 2 * k, py - r() * .8 * k, 3, 3); } }); });   // natron heap
  } else {
    S.box(-3.2, 2, 0, 6.4, 4, 3.4, '#D9B24E', { paint: (c, St, f, col) => { const n = St.normal(f.pts); if (Math.abs(n[2]) > .5) return; for (const [u0, u1] of [[.08, .46], [.54, .92]]) { poly(c, uvRect(St, f, u0, .12, u1, .85), '#2F5FA8', true, 2); const r = rng(Math.round(u0 * 100)); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const q = St.uv(f, u0 + .04 + i * (u1 - u0 - .08) / 5, .2 + j * .18); c.fillStyle = '#D9B24E'; c.beginPath(); c.arc(q[0], q[1], 3, 0, 7); c.fill(); } } } });   // gilded shrine with faience panels
    S.box(-3.5, 1.7, 3.4, 7, 4.6, .5, '#E3C25A', { shadow: false });
    S.box(-1.4, -3, 0, 2.8, 1.4, 1.3, '#C9876A', { tex: 'blocks', course: 1.3, blockW: 2.8, granite: true });   // quartzite sarcophagus
    S.sprite([5.2, -3.5, 0], (c, px, py, k) => { poly(c, [[px - .8 * k, py], [px + .8 * k, py], [px + .7 * k, py - 1 * k], [px - .7 * k, py - 1 * k]], '#D9B24E', true, 2); jarSprite(c, px - 1.4 * k, py, .9 * k, '#E3D6B6', 3); });
  }
  S.render(ctx);
  // torchlight: warm glow pools, dark corners
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; const g = ctx.createRadialGradient(960, 560, 200, 960, 560, 1150); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(40,20,10,1)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (const [x, y] of [[230, 380], [1690, 380]]) { const h = ctx.createRadialGradient(x, y, 10, x, y, 420); h.addColorStop(0, 'rgba(255,190,90,.6)'); h.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = h; ctx.fillRect(x - 420, y - 420, 840, 840); } ctx.restore();
  for (const x of [230, 1690]) { poly(ctx, [[x - 14, 420], [x + 14, 420], [x + 8, 520], [x - 8, 520]], '#6E4A2C', true, 2.5); blob(ctx, g2 => { g2.moveTo(x - 22, 420); g2.quadraticCurveTo(x - 26, 380, x, 335); g2.quadraticCurveTo(x + 26, 380, x + 22, 420); g2.closePath(); }, '#F2A33A', { lw: 2.5, shade: g2 => { g2.fillStyle = '#FFE08A'; g2.beginPath(); g2.ellipse(x, 400, 10, 20, 0, 0, 7); g2.fill(); } }); }
  brushTexture(ctx, .2); warmGrade(ctx);
};
SETS.workshop = (ctx, o = {}) => SETS.tomb(ctx, { workshop: true });

SETS.kadesh = (ctx, o = {}) => { // the plain before Kadesh on the Orontes: the fortified city on its mound, the river, chariot squadrons and dust
  const H = 480;
  skyGradient(ctx, H + 30, '#86AFCF', '#D9DDCC', '#EBD7A8'); clouds(ctx, [[400, 120, 90, 81], [1500, 160, 110, 83], [960, 330, 240, 85, 'streak']]);
  ridge(ctx, H - 10, 90, '#B9A27E', 33, { ink: 2, inkCol: '#8A7458' }); ridge(ctx, H + 10, 40, '#C9B080', 35, { ink: 2, inkCol: '#8A7458' });
  const S = new Stage({ x: 0, y: -105, z: 6, yaw: 0, f: 1100, hy: H, cx: 960 }, [-.5, -.4, .75]);
  // the tell + city walls with towers
  S.battered(-70, 140, 0, 110, 70, 9, 6, '#B8A07A', { top: '#C9B08A' });
  S.box(-58, 150, 9, 86, 3, 8, '#C9B48E', { tex: 'mudbrick', seed: 61, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] < -.9) { const [W] = fdim(f); for (let u = 0; u < 1; u += 2 / W) poly(c, uvRect(St, f, u, .92, u + 1 / W, 1), '#2A1E16'); } } });
  for (let i = 0; i < 6; i++) S.box(-60 + i * 17, 148.5, 9, 5, 6, 12, '#CDB892', { tex: 'mudbrick', seed: 62 + i });
  S.box(-14, 147, 9, 10, 4, 14, '#D2BC94', { tex: 'mudbrick', seed: 69, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] < -.9) doorM(c, St, f, col, .5, 3, 6, '#7A5634'); } });
  // the Orontes winding across the plain
  const riv = []; for (let i = 0; i <= 34; i++) { const y = 125 - i * 6; riv.push([-30 + Math.sin(i * .35) * 28 + i * 1.5, y]); }
  const L = riv.map(([x, y]) => [x - 4, y, 0]), R = riv.map(([x, y]) => [x + 4, y, 0]).reverse();
  S.face([...L, ...R], '#6FA0C0', { ground: true, layer: 1, noInk: true, paint: (c, St, f) => { const r = rng(3); for (let i = 0; i < 60; i++) { const q = St.uv(f, r(), r()); c.strokeStyle = 'rgba(230,245,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(q[0] - 8, q[1]); c.lineTo(q[0] + 8, q[1]); c.stroke(); } } });
  for (const [x, y, sd] of [[-40, 60, 1], [-20, 40, 2], [30, 50, 3], [45, 30, 4], [-35, -40, 5], [22, -55, 6], [60, 70, 7], [-8, -70, 8], [10, -20, 9], [-22, -10, 10]]) S.sprite([x, y, 0], (c, px, py, k) => { const t = c.globalAlpha; c.fillStyle = 'rgba(210,190,150,.5)'; c.beginPath(); c.ellipse(px - 3 * k, py - .6 * k, 4 * k, 1.2 * k, 0, 0, 7); c.fill(); chariotSprite(c, px, py, k, { flip: sd % 2 === 0, seed: sd, box: sd % 2 ? '#B8463A' : '#5E6E8A', plume: sd % 2 ? '#C0453A' : '#E3C25A' }); });
  palmAt(S, -30, -90, 10, 3); palmAt(S, 36, -94, 11, 5);
  ctx.fillStyle = vgrad(ctx, H, 1080, '#D9C08E', '#C4A472'); ctx.fillRect(0, H, 1920, 1080 - H); S.groundDetail(ctx, { col: '#D2B886', seed: 19, count: 700, far: 400 });
  S.render(ctx);
  bush(ctx, 120, 1095, 150, 22, '#6E7A40'); bush(ctx, 1820, 1095, 130, 23, '#6E7A40');
  brushTexture(ctx, .2); warmGrade(ctx);
};

SETS.abusimbel = (ctx, o = {}) => { // the Great Temple of Abu Simbel: four seated colossi cut into the cliff, baboon frieze, doorway, drift sand
  const H = 560;
  skyGradient(ctx, H + 30, '#78ABD2', '#CFE1E1', '#F5E2BB'); clouds(ctx, [[260, 110, 80, 91], [1700, 140, 70, 93]]);
  const S = new Stage({ x: 0, y: -62, z: 2, yaw: 0, f: 980, hy: H, cx: 960 }, [-.45, -.7, .55]);
  S.battered(-60, 0, 0, 120, 30, 34, 6, '#D49A62', { tex: 'blocks', course: 2.2, blockW: 8, seed: 95, top: '#C98E58' });   // the cliff
  S.box(-21, -.6, 0, 42, .6, 31, '#DAA36C', { tex: 'plaster', seed: 96, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] > -.9) return; doorM(c, St, f, col, .5, 3.6, 7.5, shade(col, .92)); glyphColumns(c, St, f, col, .44, .56, .3, .62, 5); torusM(c, St, f, col, 29.5);
    for (let i = 0; i < 18; i++) { const q = St.uv(f, .03 + i * .055, .96); c.fillStyle = shade(col, .82); c.beginPath(); c.ellipse(q[0], q[1] - 6, 8, 12, 0, 0, 7); c.fill(); inkLine(c, Array.from({ length: 13 }, (_, j) => [q[0] + Math.cos(j / 12 * 6.283) * 8, q[1] - 6 + Math.sin(j / 12 * 6.283) * 12]), 1.6, { closed: true, col: shade(col, .45) }); } } });   // facade with door, cartouche column, baboon frieze
  for (const x of [-15, -6.5, 6.5, 15]) S.sprite([x, -1.2, 0], (c, px, py, k) => colossusSprite(c, px, py, k * 1.28));
  S.sprite([0, -1, 21], (c, px, py, k) => { blob(c, g => { g.moveTo(px - 1 * k, py); g.lineTo(px - .9 * k, py - 3.4 * k); g.quadraticCurveTo(px, py - 4.2 * k, px + .9 * k, py - 3.4 * k); g.lineTo(px + 1 * k, py); g.closePath(); }, '#DAA36C', { lw: 2.4 }); c.beginPath(); c.arc(px, py - 4.5 * k, .6 * k, 0, 7); c.fillStyle = '#C0453A'; c.fill(); inkLine(c, Array.from({ length: 13 }, (_, j) => [px + Math.cos(j / 12 * 6.283) * .6 * k, py - 4.5 * k + Math.sin(j / 12 * 6.283) * .6 * k]), 2, { closed: true }); });   // Ra-Horakhty in the niche
  S.face([[22, -8, 0], [60, -8, 0], [60, 0, 26], [36, 0, 14]], '#E6CB96', { twoSided: true, inkK: .06 });   // the dune spilling down the cliff
  ctx.fillStyle = vgrad(ctx, H, 1080, '#E6CC98', '#D2B07A'); ctx.fillRect(0, H, 1920, 1080 - H); S.groundDetail(ctx, { col: '#DCC08C', seed: 23, count: 500, far: 200 });
  S.render(ctx);
  bush(ctx, 110, 1095, 140, 25, '#6E8A40'); jarSprite(ctx, 1800, 1092, 140, '#B5653A', 2);
  brushTexture(ctx, .2); warmGrade(ctx);
};

SETS.alexandria = (ctx, o = {}) => { // Alexandria's harbour: Greek colonnades on the quay, galleys, and the Pharos lighthouse on its island
  const H = 560;
  skyGradient(ctx, H + 30, '#6FA8D6', '#CDE3EE', '#F5E6C4'); clouds(ctx, [[300, 120, 85, 101], [1500, 90, 100, 103], [900, 280, 220, 105, 'streak']]);
  const S = new Stage({ x: 0, y: -28, z: 4, yaw: 0, f: 1050, hy: H, cx: 960 }, [-.5, -.5, .7]);
  // the Pharos: square base, octagonal middle, round top with fire
  S.box(170, 420, 0, 50, 50, 60, '#EFE7D6', { tex: 'blocks', course: 2.5, blockW: 6, seed: 111 });
  S.cylinder(195, 445, 60, 18, 30, '#EAE1CC', { segs: 8, top: '#DDD3BC' });
  S.cylinder(195, 445, 90, 9, 14, '#E6DCC6', { segs: 16, top: '#D9CFB8' });
  S.sprite([195, 445, 104], (c, px, py, k) => { blob(c, g => { g.moveTo(px - 8 * k, py); g.quadraticCurveTo(px - 10 * k, py - 14 * k, px, py - 22 * k); g.quadraticCurveTo(px + 10 * k, py - 14 * k, px + 8 * k, py); g.closePath(); }, '#F2A33A', { lw: 2.5, shade: g => { g.fillStyle = '#FFE08A'; g.beginPath(); g.ellipse(px, py - 6 * k, 3 * k, 6 * k, 0, 0, 7); g.fill(); } }); const gl = c.createRadialGradient(px, py - 10 * k, 2, px, py - 10 * k, 60 * k); gl.addColorStop(0, 'rgba(255,220,140,.5)'); gl.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = gl; c.fillRect(px - 60 * k, py - 70 * k, 120 * k, 120 * k); });
  S.box(150, 400, 0, 90, 90, 2, '#C9B48E', { shadow: false });
  // quay buildings: stoa colonnades and a temple front
  const stoa = (x, y, w, h, n, col) => { S.box(x, y + 2, 0, w, 6, h, shade(col, .9), { tex: 'plaster', seed: x }); for (let i = 0; i < n; i++) S.cylinder(x + .8 + i * (w - 1.6) / (n - 1), y + .6, 0, .4, h - 1, col, { segs: 10 }); S.box(x - .3, y, h - 1, w + .6, 2.6, 1.1, shade(col, 1.03), { shadow: false, inkK: .08 }); };
  stoa(-62, 30, 34, 9, 11, '#F0E9DA'); stoa(30, 34, 30, 8, 9, '#EFE6D2');
  S.box(-20, 30, 0, 22, 14, 2, '#E9E1CE', { shadow: false }); for (let i = 0; i < 6; i++) S.cylinder(-18.5 + i * 3.8, 31.5, 2, .55, 10, '#F3EEE2', { segs: 12 });
  S.box(-20, 30, 12, 22, 14, 1.2, '#EAE2CF', { shadow: false }); S.face([[-20, 30, 13.2], [2, 30, 13.2], [-9, 30, 17]], '#E3DAC4', { twoSided: true, paint: (c, St, f, col) => { const P = f.pts.map(p => St.P(p)); const cx = (P[0][0] + P[1][0]) / 2; poly(c, [[cx - 30, P[0][1] - 6], [cx + 30, P[0][1] - 6], [cx, P[2][1] + 14]], shade(col, .9)); } });
  S.box(-90, 14, 0, 180, 30, 1.6, '#C9B48E', { shadow: false, tex: 'blocks', course: .8, blockW: 2.6 });   // the quay
  ctx.fillStyle = vgrad(ctx, H, 1080, '#5E9BC8', '#2E5E8E'); ctx.fillRect(0, H, 1920, 1080 - H);
  const r = rng(7); for (let i = 0; i < 160; i++) { const y = H + 6 + Math.pow(r(), 1.6) * 520, x = r() * 1920, l = 10 + (y - H) * .1; ctx.strokeStyle = r() > .5 ? 'rgba(230,245,255,.45)' : 'rgba(20,40,70,.3)'; ctx.lineWidth = 1.5 + (y - H) / 260; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - 3, x + l, y); ctx.stroke(); }
  for (const [x, y, sd] of [[-12, 4, 1], [22, -6, 2], [60, 160, 3]]) S.sprite([x, y, 0], (c, px, py, k) => galleySprite(c, px, py, k * .9, { sail: sd === 2 ? '#F1E2C2' : '#EDE3CF' }));
  S.render(ctx);
  brushTexture(ctx, .18); warmGrade(ctx, .7);
};

SETS.sea = (ctx, o = {}) => { // open-sea battle (Actium / the Sea Peoples): galleys, smoke, a heavy sky
  const H = 520;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4E5E78'); g.addColorStop(.6, '#9AA0A4'); g.addColorStop(1, '#D9C9A8'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, H + 10);
  clouds(ctx, [[300, 120, 120, 121], [1100, 80, 140, 123], [1700, 170, 100, 125], [700, 330, 280, 127, 'streak']], '#E3DED8', '#8E8A92');
  ctx.fillStyle = vgrad(ctx, H, 1080, '#5A7A92', '#243E58'); ctx.fillRect(0, H, 1920, 1080 - H);
  const r = rng(9); for (let i = 0; i < 220; i++) { const y = H + 4 + Math.pow(r(), 1.5) * 560, x = r() * 1920, l = 14 + (y - H) * .14; ctx.strokeStyle = r() > .5 ? 'rgba(235,245,255,.5)' : 'rgba(10,25,45,.35)'; ctx.lineWidth = 1.5 + (y - H) / 220; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - 4, x + l, y); ctx.stroke(); }
  inkLine(ctx, [[0, H + 2], [1920, H + 2]], 2, { col: '#3A4A5A' });
  for (const [x, y, k, sd, sm] of [[260, 600, 9, 1, false], [1600, 610, 11, 2, true], [520, 700, 18, 3, false], [1230, 760, 24, 4, true], [1760, 900, 34, 5, false]]) galleySprite(ctx, x, y, k, { smoke: sm, t: sd, sail: sd % 2 ? '#EDE3CF' : '#E3B8A0', hull: sd % 2 ? '#6E4A2C' : '#5A4A40' });
  brushTexture(ctx, .18); warmGrade(ctx, .5);
};
