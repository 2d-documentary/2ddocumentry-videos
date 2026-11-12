// egypt_sets.js — Ancient Egypt backgrounds built from real architecture (2-point perspective) + real map data
'use strict';
const LIME = '#D8BE8C', LIME2 = '#CBA874', SANDST = '#D9B27A', MUD = '#B88E62', PLAST = '#E3CDA4';

// ---------- 2D sprites ----------
function sphinxSprite(ctx, x, y, k, o = {}) { // the Great Sphinx in profile (head to the left), units = metres: 73 m long, 20 m high
  const T = (px, py) => [x + px * k, y + py * k];
  const path = (g, pts) => { pts.forEach((p, i) => { if (p.length === 2) { const q = T(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } else { const c = T(p[0], p[1]), q = T(p[2], p[3]); g.quadraticCurveTo(c[0], c[1], q[0], q[1]); } }); };
  const body = '#C99D66', lw = Math.max(4.2, .26 * k), k_ = k;
  const strata = (g, x0, x1, y0, y1, dark) => { for (let s2 = y0; s2 < y1; s2 += 1.15) { const a2 = T(x0, s2); g.fillStyle = `rgba(110,72,38,${dark ? .28 : .16})`; g.fillRect(a2[0], a2[1], (x1 - x0) * k, .42 * k); } };
  // body: neck/chest, shoulder bulge, dipping spine, raised rump; the silhouette steps with the strata on the curved ends
  const stair = (pts, step = 1.5) => { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [x0, y0] = out[out.length - 1], [x1, y1] = pts[i]; const k0 = Math.floor(y0 / step), k1 = Math.floor(y1 / step); if (Math.abs(y1 - y0) > .4 && k0 !== k1) { const ym = Math.max(k0, k1) * step; out.push([x0, ym], [x1, ym]); } out.push([x1, y1]); } return out; };
  // recumbent lion: chest/shoulder block behind the head, back dipping, a raised haunch, rounded rump
  const top = spline([[-2.4, -13.6], [1.5, -15.2], [6.5, -15.6], [11, -14.6], [18, -12.6], [26, -12.2], [33, -12.8], [39, -14.4], [44, -15], [49.5, -14], [53.8, -11.4], [56.4, -8], [57.4, -4.4]], false, 4);
  const outline = [[-4.6, 0], ...stair([[-4.8, -3], [-5.4, -6.5], [-6.2, -9.6], [-5.2, -12], [-2.4, -13.6]]), ...top, [57.4, -2], [56, 0]];
  blob(ctx, g => path(g, outline), body, { lw, shade: g => {
    for (const off of [3.2, 6.4]) { g.strokeStyle = 'rgba(90,48,20,.28)'; g.lineWidth = .45 * k_; g.beginPath(); top.forEach((q, i) => { const m = T(q[0] - (q[0] > 50 ? off * .6 : 0), q[1] + off); i ? g.lineTo(m[0], m[1]) : g.moveTo(m[0], m[1]); }); g.stroke(); }   // two weathered strata following the back
    g.fillStyle = 'rgba(110,62,30,.38)'; g.beginPath(); path(g, [[-5, -4.6], [20, -5.4], [40, -5], [58, -4.4], [58, 1], [-5, 1]]); g.fill();   // darker belly band
    g.fillStyle = 'rgba(255,240,205,.26)'; g.beginPath(); path(g, spline([[-1, -13.4], [4, -15.2], [10, -14.4], [9, -9], [3, -6], [-1, -8]], true, 3)); g.fill();   // lit shoulder/chest mass
    g.fillStyle = 'rgba(255,235,195,.2)'; g.beginPath(); path(g, spline([[40, -2], [40.5, -8], [44.5, -12.6], [50.5, -12.4], [54, -8.4], [53.6, -3], [48, -1.4]], true, 3)); g.fill();   // lit rounded haunch
    g.fillStyle = 'rgba(110,62,30,.28)'; g.beginPath(); path(g, spline([[12, -13.6], [24, -11.8], [34, -12.2], [36, -7], [24, -6.5], [12, -8]], true, 3)); g.fill(); } });   // shadowed belly between shoulder and haunch
  inkLine(ctx, [T(1, -12.8), T(5, -10.5), T(6.2, -7), T(5, -3.4)], lw * .7);                                         // shoulder blade
  inkLine(ctx, spline([[39.6, -1.2], [40, -6], [42.6, -10.4]], false, 4).map(q => T(...q)), lw * .7);   // front edge of the haunch
  inkLine(ctx, spline([[11, -14.2], [10.5, -9], [8, -5.2]], false, 4).map(q => T(...q)), lw * .7);   // back of the shoulder
  blob(ctx, g => path(g, spline([[33.5, 0], [33.8, -1.5], [40, -1.9], [46, -1.2], [46.5, 0]], true, 3)), shade(body, 1.02), { lw: lw * .8 });   // hind paw
  for (let t2 = 0; t2 < 3; t2++) inkLine(ctx, [T(34.2 + t2 * .9, -.1), T(34.5 + t2 * .9, -1.3)], Math.max(1, .09 * k));
  inkLine(ctx, [T(56.4, -1.4), T(53, -.9), T(47, -2.2), T(41, -3.2), T(38, -4.4), T(37.6, -6.2)], Math.max(1.8, .16 * k));   // tail
  // forelegs: the far leg (higher, behind), the Dream Stela between them, then the near leg
  const leg = (dx, dy, sh) => { const LEG = [[3 + dx, -6.5 + dy], [-2 + dx, -7.6 + dy, -8 + dx, -5 + dy], [-16 + dx, -4.6 + dy], [-20.5 + dx, -4.4 + dy, -21.5 + dx, -2.2 + dy], [-21.6 + dx, -.2 + dy], [-10 + dx, dy], [3 + dx, dy]];
    blob(ctx, g => path(g, LEG), shade(body, sh), { lw, shade: g => { for (let s2 = -7; s2 < 0; s2 += 1.3) { const a2 = T(-22 + dx, s2 + dy); g.fillStyle = 'rgba(110,72,38,.22)'; g.fillRect(a2[0], a2[1], 26 * k, .35 * k); } g.fillStyle = 'rgba(110,65,32,.32)'; g.beginPath(); path(g, [[-22 + dx, -2 + dy], [4 + dx, -2.6 + dy], [4 + dx, 1 + dy], [-22 + dx, 1 + dy]]); g.fill(); } });
    for (let t2 = 0; t2 < 4; t2++) inkLine(ctx, [T(-21.3 + dx + t2 * .9, -.1 + dy), T(-21 + dx + t2 * .9, -1.6 + dy)], Math.max(1, .09 * k));
    inkLine(ctx, [T(-6 + dx, -5 + dy), T(-3 + dx, -3 + dy), T(-2.6 + dx, dy)], lw * .6); };
  leg(2.4, -1.9, .78);
  blob(ctx, g => path(g, [[-8.6, -2], [-8.6, -7.6], [-7.6, -8.6, -6.6, -7.6], [-6.6, -2]]), '#C9B79A', { lw: lw * .8, shade: g => { g.fillStyle = 'rgba(90,60,30,.35)'; for (let i = 0; i < 4; i++) { const a2 = T(-8.3, -7 + i * 1.1); g.fillRect(a2[0], a2[1], 1.4 * k, .18 * k); } } });   // Dream Stela of Thutmose IV
  leg(0, 0, 1);
  // chest plate under the head, nemes lappets, head
  blob(ctx, g => path(g, [[-7.4, -12], [-1.6, -12], [-1, -6.5], [-4.6, -5.2], [-7, -6.8]]), shade(body, .96), { lw: lw * .9, shade: g => strata(g, -8, 0, -12, -5, true) });
  const stripes = (g, x0, x1, y0, y1, bulge) => { g.strokeStyle = 'rgba(100,66,34,.55)'; g.lineWidth = .42 * k; for (let s2 = y0; s2 < y1; s2 += .95) { g.beginPath(); g.moveTo(...T(x0, s2 + bulge)); g.quadraticCurveTo(...T((x0 + x1) / 2, s2 - bulge), ...T(x1, s2 + bulge)); g.stroke(); } };
  for (const L of [[[-9.2, -15.6], [-10.2, -9.4], [-7.9, -8.7], [-7.2, -14]], [[-1, -15.6], [-.1, -9.6], [-2.2, -9], [-2.8, -14]]]) blob(ctx, g => path(g, L), '#C49A62', { lw: lw * .8, shade: g => stripes(g, -11, 1, -16, -8.6, .2) });
  const NEM = [[-7.6, -13], [-10.6, -16.4], [-9, -20.8, -4.8, -21], [-.6, -20.8, 1.2, -16.4], [-1.6, -13], [-3.4, -12.2]];
  blob(ctx, g => path(g, NEM), '#CBA06A', { lw, shade: g => { stripes(g, -11, 1.4, -21, -12.4, .55); g.fillStyle = 'rgba(80,50,25,.25)'; g.beginPath(); path(g, [[-2.6, -21], [1.4, -21], [1.4, -12], [-2.2, -12]]); g.fill(); } });
  const FACE = spline([[-8.2, -18.9], [-6, -19.2], [-3.8, -18.9], [-3.4, -16.8], [-3.7, -14.7], [-4.6, -13.6], [-6, -13.1], [-7.4, -13.6], [-8.3, -14.8], [-8.6, -16.8]], true, 4);
  blob(ctx, g => { path(g, FACE); g.closePath(); for (const ex of [-8.9, -3.2]) { const e = T(ex, -16.6); g.moveTo(e[0] + .45 * k, e[1]); g.ellipse(e[0], e[1], .45 * k, .9 * k, 0, 0, 7); } }, '#D8B67F', { lw: lw * .85, shade: g => { g.fillStyle = 'rgba(120,80,40,.3)'; g.beginPath(); path(g, [[-4.8, -19.2], [-3, -19.2], [-3, -13], [-4.8, -13.4]]); g.fill(); } });   // face + ears
  inkLine(ctx, [T(-8, -18), T(-6.9, -18.35), T(-6.2, -18.1)], lw * .7); inkLine(ctx, [T(-5.6, -18.1), T(-4.9, -18.35), T(-4, -18)], lw * .7);   // brow ridge
  for (const ex of [-7, -4.8]) { const e = T(ex, -17.2); ctx.fillStyle = '#3A2A1E'; ctx.beginPath(); ctx.moveTo(e[0] - .6 * k, e[1]); ctx.quadraticCurveTo(e[0], e[1] - .42 * k, e[0] + .6 * k, e[1]); ctx.quadraticCurveTo(e[0], e[1] + .28 * k, e[0] - .6 * k, e[1]); ctx.fill(); inkLine(ctx, [[e[0] - .7 * k, e[1] - .05 * k], [e[0], e[1] - .5 * k], [e[0] + .7 * k, e[1] - .05 * k]], Math.max(1.4, .1 * k)); }   // almond eyes with lids
  { const N = spline([[-6.4, -17], [-5.5, -16.9], [-5.1, -15.9], [-5.5, -15.3], [-6.5, -15.3], [-6.8, -16]], true, 4).map(q => T(...q)); poly(ctx, N, '#E2C48E'); inkLine(ctx, N.map(q => [q[0], q[1]]), Math.max(1.2, .08 * k), { closed: true, col: '#7A5634' }); const n1 = T(-6.1, -15.7); ctx.fillStyle = 'rgba(120,80,40,.4)'; ctx.beginPath(); ctx.ellipse(n1[0], n1[1], .35 * k, .2 * k, 0, 0, 7); ctx.fill(); }   // the eroded nose: a lighter patch
  const m0 = T(-6.9, -14.6), m1 = T(-4.9, -14.6); ctx.fillStyle = '#B98C5A'; ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.quadraticCurveTo((m0[0] + m1[0]) / 2, m0[1] - .45 * k, m1[0], m1[1]); ctx.quadraticCurveTo((m0[0] + m1[0]) / 2, m0[1] + .5 * k, m0[0], m0[1]); ctx.fill(); inkLine(ctx, [m0, [(m0[0] + m1[0]) / 2, m0[1] + .05 * k], m1].map(q => [q[0], q[1]]), Math.max(1.3, .1 * k));   // full lips
}
function feluccaSprite(ctx, x, y, k, o = {}) { // felucca: curved planked hull, short mast, long lateen yard, bellied sail with seams
  const T = (px, py) => [x + px * k, y + py * k]; const W = Math.max(1.6, .1 * k);
  const pathT = (g, pts) => pts.forEach((p, i) => { const q = T(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
  const curve = (p0, c, p1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]]; });
  // wake + reflection first
  if (o.wake !== false) { ctx.strokeStyle = 'rgba(255,235,210,.55)'; ctx.lineWidth = Math.max(1.5, .08 * k); for (let i = 1; i < 5; i++) { const a = T(-5 - i * 2.2, .5 + i * .35), b = T(-5 - i * 2.2 - 2, .6 + i * .35); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); const c = T(-5 - i * 2.2, .5 - i * .05), d = T(-5 - i * 2.2 - 2, .45 - i * .05); ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke(); } }
  const deck = curve([-5.4, -1.6], [0, -.7], [6.4, -2.3]), keel = curve([5.6, -.6], [.5, 1.1], [-4.8, -.2]);
  const hull = [...deck, ...keel];
  blob(ctx, g => pathT(g, hull), '#7A4E2E', { lw: W, shade: g => { g.strokeStyle = 'rgba(40,22,10,.55)'; g.lineWidth = Math.max(1, .05 * k); for (const dv of [.45, .9]) { g.beginPath(); pathT(g, curve([-5.3, -1.6 + dv], [0, -.7 + dv * 1.1], [6.1, -2.2 + dv * .9])); g.stroke(); } g.fillStyle = '#B8463A'; g.beginPath(); pathT(g, [...curve([-5.4, -1.6], [0, -.7], [6.4, -2.3]), ...curve([6.3, -2.0], [0, -.4], [-5.35, -1.3])]); g.fill(); } });
  inkLine(ctx, [T(.2, -1.1), T(-.3, -8.6)], Math.max(1.6, .14 * k));   // mast
  const yardA = [-6.2, -2.6], yardB = [8.6, -14.2], boomA = [-5.2, -2.1], boomB = [3.6, -1.9];
  const sail = [...curve(yardA, [1.2, -7.6], yardB, 16), ...curve([8.4, -13.8], [8.2, -6], boomB, 12), ...curve(boomB, [-1, -2.6], boomA, 6)];
  blob(ctx, g => pathT(g, sail), '#F4EAD4', { lw: W, shade: g => { // shadowed belly + seams
    g.fillStyle = '#D9CBB0'; g.beginPath(); pathT(g, [...curve([.5, -3], [5, -7], [8.4, -13.8], 10), ...curve([8.2, -13.6], [8.1, -6], boomB, 8)]); g.fill();
    g.strokeStyle = 'rgba(120,96,70,.55)'; g.lineWidth = Math.max(1, .04 * k); for (let i = 1; i < 8; i++) { const t = i / 8; const a = [yardA[0] + (yardB[0] - yardA[0]) * t, yardA[1] + (yardB[1] - yardA[1]) * t - Math.sin(t * Math.PI) * 1.6], b = [boomA[0] + (8.3 - boomA[0]) * t, -2 + (-13.8 + 2) * t * t]; g.beginPath(); pathT(g, [a, [(a[0] + b[0]) / 2 + .6, (a[1] + b[1]) / 2], b]); g.stroke(); } } });
  inkLine(ctx, [T(...yardA), T(...yardB)], Math.max(1.6, .13 * k)); inkLine(ctx, [T(...boomA), T(...boomB)], Math.max(1.4, .1 * k));
  if (o.crew !== false && k > 14) { egPerson(ctx, ...T(-3.6, -1.5), 1.75 * k, { seed: 3, pose: 'stand' }); }
}
function jarSprite(ctx, x, y, k, col = '#B5653A', type = 0) { // 0 storage jar, 1 amphora with handles, 2 squat bowl-jar, 3 tall beer jar with stand
  const T = (px, py) => [x + px * k, y + py * k]; const shapes = [
    [[-.12, 0], [-.3, -.35], [-.32, -.6], [-.14, -.82], [-.11, -.95], [.11, -.95], [.14, -.82], [.32, -.6], [.3, -.35], [.12, 0]],
    [[-.04, 0], [-.2, -.25], [-.27, -.55], [-.2, -.78], [-.09, -.86], [-.09, -1], [.09, -1], [.09, -.86], [.2, -.78], [.27, -.55], [.2, -.25], [.04, 0]],
    [[-.2, 0], [-.4, -.12], [-.42, -.32], [-.26, -.46], [-.24, -.52], [.24, -.52], [.26, -.46], [.42, -.32], [.4, -.12], [.2, 0]],
    [[-.1, -.18], [-.2, -.45], [-.2, -.9], [-.13, -1.2], [-.15, -1.26], [.15, -1.26], [.13, -1.2], [.2, -.9], [.2, -.45], [.1, -.18]]][type % 4];
  ctx.save(); ctx.fillStyle = 'rgba(60,30,14,.38)'; ctx.beginPath(); ctx.ellipse(x + .08 * k, y, .42 * k, .08 * k, 0, 0, 7); ctx.fill(); ctx.restore();   // contact shadow
  if (type % 4 === 3) { poly(ctx, [T(-.16, 0), T(.16, 0), T(.11, -.2), T(-.11, -.2)], '#7A5634', true, Math.max(1.4, .035 * k)); }
  blob(ctx, g => shapes.forEach((p, i) => { const q = T(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }), col, { lw: Math.max(1.6, .04 * k), shade: g => { g.fillStyle = shade(col, .74); g.beginPath(); g.ellipse(x + .22 * k, y - .5 * k, .2 * k, .7 * k, 0, 0, 7); g.fill(); g.fillStyle = shade(col, 1.18); g.beginPath(); g.ellipse(x - .14 * k, y - .62 * k, .05 * k, .16 * k, 0, 0, 7); g.fill();
    g.strokeStyle = shade(col, .6); g.lineWidth = Math.max(1, .015 * k); const a = T(-.35, -.5), b = T(.35, -.5); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(x, a[1] + .06 * k, b[0], b[1]); g.stroke(); if (type % 4 === 2) { g.strokeStyle = '#2F5FA8'; g.lineWidth = .05 * k; g.beginPath(); g.moveTo(...T(-.38, -.3)); g.quadraticCurveTo(x, y - .24 * k, ...T(.38, -.3)); g.stroke(); } } });
  if (type % 4 === 1) for (const sx of [-1, 1]) inkLine(ctx, [T(sx * .09, -.84), T(sx * .26, -.86), T(sx * .25, -.66)], Math.max(1.6, .035 * k));
}
function sledgeSprite(ctx, x, y, k) { // limestone block on a wooden sledge, ropes forward
  const T = (px, py) => [x + px * k, y + py * k];
  const run = [[-1.4, 0], [1.6, 0], [1.9, -.25], [-1.4, -.25]]; ctx.beginPath(); run.forEach((p, i) => { const q = T(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = '#7A5532'; ctx.fill(); inkLine(ctx, run.map(p => T(...p)), Math.max(1.4, .05 * k), { closed: true });
  const fr = [[-1.2, -.25], [1.2, -.25], [1.2, -1.45], [-1.2, -1.45]]; ctx.beginPath(); fr.forEach((p, i) => { const q = T(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = LIME; ctx.fill();
  const top = [[-1.2, -1.45], [1.2, -1.45], [1.6, -1.75], [-.8, -1.75]], side = [[1.2, -.25], [1.6, -.55], [1.6, -1.75], [1.2, -1.45]];
  for (const [pp, c] of [[top, shade(LIME, 1.1)], [side, shade(LIME, .78)]]) { ctx.beginPath(); pp.forEach((p, i) => { const q = T(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); inkLine(ctx, pp.map(p => T(...p)), Math.max(1.3, .05 * k), { closed: true }); }
  inkLine(ctx, fr.map(p => T(...p)), Math.max(1.4, .06 * k), { closed: true });
  for (const dy of [-.5, -1.1]) { const a = T(-1.2, dy), b = T(-8.6, -1.05); ctx.strokeStyle = '#4A3420'; ctx.lineWidth = Math.max(3.2, .07 * k) + 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.strokeStyle = '#B08A52'; ctx.lineWidth = Math.max(3, .07 * k); ctx.stroke(); }
}
function obeliskAt(S, x, y, h, col = '#C98C6A', z = 0) { // red-granite obelisk with gilded pyramidion
  const b = h * .09, t = h * .062; h += z; const bot = [[x - b / 2, y - b / 2, z], [x + b / 2, y - b / 2, z], [x + b / 2, y + b / 2, z], [x - b / 2, y + b / 2, z]], top = bot.map(p => [x + (p[0] - x) * t / b, y + (p[1] - y) * t / b, h]);
  for (let i = 0; i < 4; i++) S.quad(bot[i], bot[(i + 1) % 4], top[(i + 1) % 4], top[i], col, { granite: true, paint: (c, St, f, cc) => { glyphColumns(c, St, f, cc, .3, .7, .06, .94, 3 + i); const a = St.uv(f, .03, 0), b2 = St.uv(f, .03, 1); c.strokeStyle = 'rgba(255,225,205,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.stroke(); } });
  const apex = [x, y, h + t * 1.1]; for (let i = 0; i < 4; i++) S.face([top[i], top[(i + 1) % 4], apex, apex], '#D9B24E', {});
  S.castShadow([...bot, apex]);
}

// ---------- shared helpers ----------
const OCHRE = '#B48A58', WASH = '#E8DCC4', RED = '#A8442E', GRANITE = '#C98F7A', SKIN_EG = '#9A6440';
function poly(c, P, fill, ink, w = 2) { c.beginPath(); P.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (ink) inkLine(c, P.map(q => [q[0], q[1]]), w, { closed: true, col: ink === true ? BG_INK : ink }); }
function uvRect(St, f, u0, v0, u1, v1) { return [St.uv(f, u0, v0), St.uv(f, u1, v0), St.uv(f, u1, v1), St.uv(f, u0, v1)]; }
function fdim(f) { const [A, B, , D] = f.pts; return [Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), Math.hypot(D[0] - A[0], D[1] - A[1], D[2] - A[2])]; }
function inkW(St, f, k = .05) { const d = Math.min(...f.pts.map(p => St.toCam(p)[1])); return clamp(St.cam.f / d * k, 1.2, 3.2); }
// doorway with jambs + lintel (metres; uc = centre along the face)
function doorM(c, St, f, col, uc, wm, hm, frame) { const [W, Hh] = fdim(f); const du = wm / W / 2, v1 = hm / Hh, fu = .26 / W, fv = .3 / Hh; const w = inkW(St, f);
  poly(c, uvRect(St, f, uc - du - fu, 0, uc + du + fu, v1 + fv), frame || shade(col, .86), true, w);
  poly(c, uvRect(St, f, uc - du, 0, uc + du, v1), '#2B1F19', true, w);
  poly(c, uvRect(St, f, uc - du, 0, uc - du + (du * 2) * .28, v1), '#1E1612');   // inner reveal in shadow
  poly(c, uvRect(St, f, uc - du - fu * 1.8, v1 + fv, uc + du + fu * 1.8, v1 + fv * 2.3), shade(frame || col, 1.06), true, w); }
function grilleM(c, St, f, col, uc, vm, wm, hm) { const [W, Hh] = fdim(f); const du = wm / W / 2, v0 = vm / Hh, v1 = (vm + hm) / Hh; const w = inkW(St, f);
  poly(c, uvRect(St, f, uc - du - .15 / W, v0 - .12 / Hh, uc + du + .15 / W, v1 + .12 / Hh), shade(col, .84), true, w * .8);
  poly(c, uvRect(St, f, uc - du, v0, uc + du, v1), '#2B1F19');
  for (let i = 1; i < 4; i++) { const u = uc - du + du * 2 * i / 4; poly(c, uvRect(St, f, u - .05 / W, v0, u + .05 / W, v1), col); }
  inkLine(c, uvRect(St, f, uc - du, v0, uc + du, v1).map(q => [q[0], q[1]]), w * .8, { closed: true }); }
function torusM(c, St, f, col, vm) { const [W, Hh] = fdim(f); const v0 = vm / Hh, v1 = (vm + .45) / Hh; const P = uvRect(St, f, 0, v0, 1, v1); poly(c, P, shade(col, 1.08)); const w = inkW(St, f, .035);
  inkLine(c, [P[0], P[1]].map(q => [q[0], q[1]]), w); inkLine(c, [P[3], P[2]].map(q => [q[0], q[1]]), w);
  for (let u = 0; u < 1; u += .9 / W) { const a = St.uv(f, u, v0), b = St.uv(f, u + .45 / W, v1); c.strokeStyle = shade(col, .7); c.lineWidth = w * .6; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } }
// flared cavetto cornice on top of a rectangle (x,y,sx,sy) at height z
function cornice(S, x, y, sx, sy, z, out, ch, col, o = {}) {
  const C = [[x, y], [x + sx, y], [x + sx, y + sy], [x, y + sy]], O = [[x - out, y - out], [x + sx + out, y - out], [x + sx + out, y + sy + out], [x - out, y + sy + out]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; S.quad([...C[i], z], [...C[j], z], [...O[j], z + ch], [...O[i], z + ch], col, { inkK: .08, paint: (c, St, f, cc) => { const [W] = fdim(f); for (let u = 0; u < 1; u += .7 / W) { const a = St.uv(f, u, .05), b = St.uv(f, u, .95); c.strokeStyle = shade(cc, .78); c.lineWidth = clamp(inkW(St, f, .025), .8, 2); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } } }); }
  S.quad([...O[0], z + ch], [...O[1], z + ch], [...O[2], z + ch], [...O[3], z + ch], shade(col, 1.05), {});
  S.box(O[0][0], O[0][1], z + ch, sx + out * 2, sy + out * 2, o.slab || .35, shade(col, 1.04), { shadow: false, inkK: .08 });
}
function palmAt(S, x, y, hm, seed, o = {}) { const lean = o.lean ?? (rng(seed)() - .5) * .25;
  S.sprite([x, y, 0], (c, px, py, k) => datePalm(c, px, py, hm * k, seed, { ...o, lean }));
  const tx = x + Math.sin(lean) * hm, ct = hm * .93, r = rng(seed + 9); const star = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = hm * (i % 2 ? .3 : .42 + r() * .08); star.push([tx + Math.cos(a) * rr, y + Math.sin(a) * rr * .8, ct - (i % 2 ? 0 : hm * .12)]); }
  S.castShadow(star, { poly: true }); const w = Math.max(.3, hm * .035), L = S.L, ln = Math.hypot(L[0], L[1]) || 1, px = -L[1] / ln * w, py = L[0] / ln * w; S.castShadow([[x - px, y - py, 0], [x + px, y + py, 0], [tx + px * .7, y + py * .7, ct], [tx - px * .7, y - py * .7, ct]], { poly: true }); }
function driftPaint(c, St, f, col) { // opaque sand drift with a soft irregular edge, one lee-shadow stroke, two or three gentle ripples
  const r = rng(Math.round(f.pts[0][0] * 13 + f.pts[0][1] * 7)); const P = f.pts.map(p => St.P(p)); const cx = P.reduce((a, q) => a + q[0], 0) / P.length, cy = P.reduce((a, q) => a + q[1], 0) / P.length;
  const E = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = Math.max(3, Math.round(L / 18)); const ph = r() * 6; for (let j = 0; j < m; j++) { const t = j / m, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, bump = (Math.abs(Math.sin(t * Math.PI * m * .5 + ph + .9 * Math.sin(t * 11.3 + ph * 2))) * 1.4 - .4) * Math.min(12, L * .06) * (.5 + .9 * (Math.sin(t * 23.7 + ph * 5) * .5 + .5)); E.push([a[0] + (b[0] - a[0]) * t + nx * bump, a[1] + (b[1] - a[1]) * t + ny * bump]); } }
  const sm = spline(E, true, 3); c.restore(); c.save();
  c.globalAlpha = .62; c.fillStyle = '#E2C796'; c.beginPath(); sm.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fill(); c.globalAlpha = .5; c.fillStyle = '#E8D0A2'; c.beginPath(); sm.forEach((q, i) => { const x = cx + (q[0] - cx) * .72, y = cy + (q[1] - cy) * .62 - 3; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill();
  c.globalAlpha = 1; c.save(); c.clip(); c.strokeStyle = 'rgba(156,116,72,.35)'; c.lineWidth = 3; c.beginPath(); sm.filter(q => q[1] > cy).forEach((q, i) => i ? c.lineTo(q[0], q[1] - 2) : c.moveTo(q[0], q[1] - 2)); c.stroke();
  const ys = sm.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys), xs = sm.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  c.strokeStyle = 'rgba(160,120,72,.4)'; c.lineWidth = 1.6; for (let i = 1; i <= 2; i++) { const yy = y0 + (y1 - y0) * i / 3; c.beginPath(); c.moveTo(x0 + (x1 - x0) * .15, yy + 3); c.quadraticCurveTo((x0 + x1) / 2, yy - 4, x1 - (x1 - x0) * .15, yy + 2); c.stroke(); } c.restore(); }
function egHut(S, x, y, w, d, h, col, seed) { // mud-brick house: door with frame, grille, parapet, palm-rib awning on posts
  S.box(x, y, 0, w, d, h, col, { tex: 'mudbrick', top: shade(col, .82), seed, paint: (c, St, f, cc) => { const n = St.normal(f.pts); if (n[1] < -.9) { doorM(c, St, f, cc, .35, .9, 1.75, RED); grilleM(c, St, f, cc, .75, h - 1.1, .7, .45); } else if (Math.abs(n[0]) > .9) grilleM(c, St, f, cc, .5, h - 1.1, .6, .4); } });
  const t = .28; S.box(x, y, h, w, t, .5, col, { shadow: false }); S.box(x, y + d - t, h, w, t, .5, col, { shadow: false }); S.box(x, y + t, h, t, d - 2 * t, .5, col, { shadow: false }); S.box(x + w - t, y + t, h, t, d - 2 * t, .5, col, { shadow: false });
  for (const px of [x + w * .55, x + w - .2]) S.box(px, y - 2, 0, .14, .14, 2.3, '#7A5634', { shadow: false });
  for (let i = 0; i < Math.floor(w / .6); i++) S.sprite([x + .3 + i * .6, y - .05, h + .45], (c, px, py, k) => { c.fillStyle = '#7A5634'; c.beginPath(); c.ellipse(px, py, .09 * k, .08 * k, 0, 0, 7); c.fill(); });   // palm-rib roof ends
  S.sprite([x + w * .15, y - .6, 0], (c, px, py, k) => { jarSprite(c, px, py, .8 * k, '#A9603A', (seed | 0) % 4); poly(c, [[px + .5 * k, py], [px + 1.3 * k, py], [px + 1.2 * k, py - .35 * k], [px + .6 * k, py - .35 * k]], '#C9A05A', true, 1.6); c.strokeStyle = '#8A6A3A'; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(px + (.5 + i * .2) * k, py); c.lineTo(px + (.6 + i * .17) * k, py - .35 * k); c.stroke(); } poly(c, [[px - 1.2 * k, py], [px - .4 * k, py], [px - .5 * k, py - .25 * k], [px - 1.1 * k, py - .25 * k]], '#9C8C78', true, 1.6); });   // jar, basket, quern stone
  S.quad([x + w * .5, y - 2.3, 2.3], [x + w + .2, y - 2.3, 2.3], [x + w + .2, y, 2.5], [x + w * .5, y, 2.5], '#B89A5A', { twoSided: true, paint: (c, St, f) => { for (let k = 0; k < 14; k++) { const a = St.uv(f, k / 14, 0), b = St.uv(f, k / 14, 1); c.strokeStyle = '#7A6436'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } } });
}
function lyingDrum(ctx, cx, cy, rx, col) { // a column drum lying on its side: cylindrical shading, end face, contact shadow
  const ry = rx * .38; ctx.save(); ctx.fillStyle = 'rgba(60,30,14,.32)'; ctx.beginPath(); ctx.ellipse(cx + rx * .35, cy + ry * .7, rx * 1.35, ry * .5, 0, 0, 7); ctx.fill(); ctx.restore();
  blob(ctx, g => { g.moveTo(cx - rx, cy - ry * 2); g.lineTo(cx + rx * .6, cy - ry * 2); g.ellipse(cx + rx * .6, cy - ry, ry * .5, ry, 0, -Math.PI / 2, Math.PI / 2); g.lineTo(cx - rx, cy); g.closePath(); }, col, { lw: 4, shade: g => { g.fillStyle = shade(col, 1.12); g.fillRect(cx - rx, cy - ry * 2, rx * 1.7, ry * .55); g.fillStyle = shade(col, .78); g.fillRect(cx - rx, cy - ry * .55, rx * 1.7, ry * .55); g.strokeStyle = shade(col, .66); g.lineWidth = 2; for (const k of [.3, .55]) { g.beginPath(); g.moveTo(cx - rx, cy - ry * 2 * (1 - k)); g.lineTo(cx + rx * .6, cy - ry * 2 * (1 - k)); g.stroke(); } } });
  blob(ctx, g => g.ellipse(cx - rx, cy - ry, ry * .5, ry, 0, 0, 7), shade(col, .95), { lw: 4, shade: g => { g.strokeStyle = shade(col, .7); g.lineWidth = 2; g.beginPath(); g.ellipse(cx - rx, cy - ry, ry * .3, ry * .62, 0, 0, 7); g.stroke(); } }); }
function drumFragment(ctx, cx, cy, rx, col) { // broken column drum lying on its side, jagged break on top
  ctx.save(); ctx.fillStyle = 'rgba(60,30,14,.3)'; ctx.beginPath(); ctx.ellipse(cx + rx * .3, cy + 6, rx * 1.3, rx * .22, 0, 0, 7); ctx.fill(); ctx.restore();
  blob(ctx, g => { g.moveTo(cx - rx, cy); g.lineTo(cx - rx, cy - rx * .55); g.lineTo(cx - rx * .4, cy - rx * .75); g.lineTo(cx - rx * .1, cy - rx * .5); g.lineTo(cx + rx * .35, cy - rx * .8); g.lineTo(cx + rx * .7, cy - rx * .45); g.lineTo(cx + rx, cy - rx * .6); g.lineTo(cx + rx, cy); g.closePath(); }, col, { lw: 4, shade: g => { g.fillStyle = shade(col, .8); g.fillRect(cx - rx, cy - rx * .25, rx * 2, rx * .25); g.strokeStyle = shade(col, .65); g.lineWidth = 2; for (const u of [-.5, 0, .5]) { g.beginPath(); g.moveTo(cx + u * rx, cy - rx * .6); g.lineTo(cx + u * rx, cy); g.stroke(); } } }); }
function wovenBasket(ctx, x, y, r, fruit) { ctx.save(); ctx.fillStyle = 'rgba(60,30,14,.3)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 3, r * 1.2, r * .25, 0, 0, 7); ctx.fill(); ctx.restore();
  for (let i = 0; i < 6; i++) { ctx.fillStyle = fruit[i % fruit.length]; ctx.beginPath(); ctx.arc(x - r * .6 + i * r * .24, y - r * .82 - (i % 2) * r * .12, r * .2, 0, 7); ctx.fill(); }
  blob(ctx, g => { g.moveTo(x - r, y - r * .8); g.lineTo(x + r, y - r * .8); g.lineTo(x + r * .75, y); g.lineTo(x - r * .75, y); g.closePath(); }, '#C29A52', { lw: 3.2, shade: g => { g.strokeStyle = '#8A6A32'; g.lineWidth = 2; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - r, y - r * .8 + k * r * .2); g.lineTo(x + r, y - r * .8 + k * r * .2); g.stroke(); } } });
  ctx.fillStyle = '#A88040'; ctx.beginPath(); ctx.ellipse(x, y - r * .8, r, r * .16, 0, 0, 7); ctx.fill(); inkLine(ctx, Array.from({ length: 17 }, (_, j) => [x + Math.cos(j / 16 * 6.283) * r, y - r * .8 + Math.sin(j / 16 * 6.283) * r * .16]), 2.4, { closed: true }); }
function rubble(ctx, x0, x1, y0, y1, seed, n) { const r = rng(seed); const C = [0, 1, 2].map(() => [x0 + r() * (x1 - x0), y0 + (.3 + r() * .7) * (y1 - y0)]); const P = [];
  for (let i = 0; i < Math.ceil(n / 2); i++) { const c = C[i % 3]; const y = clamp(c[1] + (r() - .5) * 60, y0, y1), x = c[0] + (r() - .5) * 220, sz = (6 + (y - y0) / (y1 - y0) * 22) * (.5 + r() * 1.1); P.push([x, y, sz, r(), r() * 6.28, 4 + Math.floor(r() * 4)]); } P.sort((a, b) => a[1] - b[1]);
  for (const [x, y, sz, t, rot, nv] of P) { ctx.save(); ctx.fillStyle = 'rgba(60,30,14,.26)'; ctx.beginPath(); ctx.ellipse(x + sz * (.2 + t * .4), y + 2, sz * (.8 + t * .6), sz * .25, 0, 0, 7); ctx.fill(); ctx.restore();
    const col = ['#C9A874', '#B8956A', '#D2B688', '#AE8A60'][Math.floor(t * 4)]; const pts = []; for (let k = 0; k < nv; k++) { const a = rot + k / nv * Math.PI * 2, rr = sz * (.6 + rng(Math.round(x * 7 + k))() * .55); pts.push([x + Math.cos(a) * rr, Math.min(y, y - sz * .45 + Math.sin(a) * rr * .55)]); }
    poly(ctx, pts, shade(col, .88)); const topPts = pts.filter(q => q[1] < y - sz * .4); if (topPts.length > 2) poly(ctx, topPts, shade(col, 1.1)); inkLine(ctx, pts, clamp(sz * .13, 1.8, 3.4), { closed: true }); } }
function stoneBlock(ctx, x, y, w, h, d, col, seed, mark = false) { // screen-space foreground block: lit top, front with chisel striations, shaded side, quarry mark
  const top = [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 + d * .6, y - h - d * .45], [x - w / 2 + d * .6, y - h - d * .45]], front = [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]], side = [[x + w / 2, y], [x + w / 2 + d * .6, y - d * .45], [x + w / 2 + d * .6, y - h - d * .45], [x + w / 2, y - h]];
  ctx.save(); ctx.fillStyle = 'rgba(60,30,14,.32)'; ctx.beginPath(); ctx.ellipse(x + w * .15, y + 4, w * .7, 16, 0, 0, 7); ctx.fill(); ctx.restore();
  poly(ctx, side, shade(col, .72)); poly(ctx, front, shade(col, .9)); poly(ctx, top, shade(col, 1.1));
  const r = rng(seed); ctx.strokeStyle = shade(col, .7); ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { const u = .2 + i * .28 + r() * .05; ctx.beginPath(); ctx.moveTo(x - w / 2 + w * u, y - h + 8); ctx.lineTo(x - w / 2 + w * (u + .06), y - 8); ctx.stroke(); }
  ctx.fillStyle = shade(col, .78); ctx.beginPath(); ctx.moveTo(x + w * .2, y - h); ctx.lineTo(x + w * .35, y - h); ctx.lineTo(x + w * .3, y - h + 12); ctx.fill();
  if (mark) { ctx.strokeStyle = '#A8442E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - w * .25, y - h * .65); ctx.lineTo(x - w * .25, y - h * .3); ctx.moveTo(x - w * .32, y - h * .48); ctx.lineTo(x - w * .12, y - h * .48); ctx.stroke(); }
  inkLine(ctx, [front[0], front[1], side[1], side[2], top[3], front[3]], 3, { closed: true });
}
// Egyptian figure for crowds: skin, white kilt, black hair; poses
function egPerson(ctx, x, y, h, o = {}) { const r = rng(o.seed || 1); const s = h / 100; ctx.save(); ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1); ctx.scale(s, s);
  const lw = Math.max(1.2, 3.2 / Math.max(.4, s)); const skin = o.skin || [SKIN_EG, '#8A5636', '#B07A50'][(o.seed || 1) % 3], kilt = o.kilt || ['#F1EADB', '#E3D6B8', '#D9C9A0', '#F1EADB'][(o.seed || 1) % 4];
  const pull = o.pose === 'pull', lean = pull ? -12 - r() * 14 : (r() - .5) * 6;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const st2 = r() * 10; const legs = pull ? [[-6, -46, -16 - st2, 0], [6, -46, 6 + st2, 0]] : [[-5, -46, -7, 0], [5, -46, 7, 0]];
  for (const [x0, y0, x1, y1] of legs) { ctx.strokeStyle = BG_INK; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(x0 + lean * .3, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = skin; ctx.lineWidth = 15 - lw * 2; ctx.stroke(); }
  ctx.save(); ctx.translate(0, -46); ctx.rotate(lean * Math.PI / 180 * .8);
  poly(ctx, [[-11, 0], [-9, -40], [9, -40], [11, 0]], skin, BG_INK, lw);   // torso
  poly(ctx, [[-14, 6], [-12, -6], [12, -6], [15, 6]], kilt, BG_INK, lw);    // kilt
  const ah = r() * 14; const arm = pull ? [[0, -34], [24, -26 - ah * .5], [40, -30 - ah]] : (o.pose === 'carry' ? [[0, -34], [-12, -50], [-4, -62]] : [[0, -34], [6, -16], [8, -4]]);
  ctx.strokeStyle = BG_INK; ctx.lineWidth = 11; ctx.beginPath(); arm.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); ctx.strokeStyle = skin; ctx.lineWidth = 11 - lw * 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(1, -50, 10, 12, 0, 0, 7); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = BG_INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-1, -54, 10.5, 9, 0, Math.PI * .95, Math.PI * 2.05); ctx.fillStyle = '#1E1A1C'; ctx.fill();
  if (o.pose === 'carry') { poly(ctx, [[-16, -64], [10, -64], [8, -76], [-14, -76]], '#B5653A', BG_INK, lw); }
  ctx.restore(); ctx.restore(); }
// sunk-relief drawing on a face: shapes given in local [0..1]^2 (y up) inside the face box (u0,v0)-(u1,v1)
function spline(P, closed = true, n = 6) { const out = [], L = P.length; const at = i => closed ? P[(i + L) % L] : P[clamp(i, 0, L - 1)]; const m = closed ? L : L - 1;
  for (let i = 0; i < m; i++) { const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2); for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } } if (!closed) out.push(P[L - 1]); return out; }
// sunk relief on a face: shapes in local [0..1]^2 (y up) inside box (u0,v0)-(u1,v1); light edge on one side, dark on the other, optional paint traces
function reliefOn(c, St, f, col, box, shapes) { const [u0, v0, u1, v1] = box; const M = ([x, y]) => St.uv(f, u0 + (u1 - u0) * x, v0 + (v1 - v0) * y); const w = clamp(inkW(St, f, .07) * 1.2, 1.6, 3);
  const edge = (P, closed) => { inkLine(c, P.map(q => [q[0] + 2, q[1] + 2]), 2, { closed, col: shade(col, 1.2), wob: .3 }); inkLine(c, P.map(q => [q[0], q[1]]), w, { closed, col: shade(col, .42), wob: .3 }); };
  for (const sh of shapes) {
    if (sh.circle) { const [cx, cy, rr] = sh.circle; const P = Array.from({ length: 36 }, (_, i) => M([cx + Math.cos(i / 36 * 6.283) * rr * (sh.ax || .55), cy + Math.sin(i / 36 * 6.283) * rr])); if (sh.fill !== false) poly(c, P, sh.fill || shade(col, .84)); edge(P, true); continue; }
    let L = sh.smooth ? spline(sh.pts, !sh.line) : sh.pts; const P = L.map(M);
    if (sh.line) { edge(P, false); continue; }
    poly(c, P, shade(col, .84)); if (sh.paint) { c.save(); c.globalAlpha = .5; poly(c, P, sh.paint); c.restore(); } edge(P, true); } }
const HORSE = [[.18, .62], [.3, .66], [.45, .66], [.58, .7], [.66, .8], [.72, .9], [.78, .97], [.79, 1.03], [.81, .97], [.86, .93], [.93, .82], [.92, .77], [.87, .79], [.8, .81], [.74, .75], [.71, .65], [.73, .56], [.8, .52], [.87, .44], [.85, .37], [.81, .38], [.8, .43], [.73, .47], [.7, .44], [.72, .28], [.73, .15], [.69, .14], [.67, .28], [.63, .43], [.5, .44], [.38, .44], [.33, .4], [.36, .26], [.34, .1], [.36, .02], [.3, .02], [.28, .12], [.29, .26], [.24, .38], [.22, .36], [.24, .22], [.21, .06], [.23, 0], [.18, 0], [.16, .1], [.17, .3], [.16, .48], [.14, .56], [.09, .5], [.05, .38], [.08, .37], [.13, .54]];
function kadeshScene(S) { return (c, St, f, col) => { // Ramesses II in his chariot at Kadesh: two horses at the gallop, a six-spoked wheel, the king drawing his bow, Hittites tumbling
  const sc = (pts, dx, dy, k) => pts.map(([x, y]) => [dx + x * k, dy + y * k]);
  reliefOn(c, St, f, col, [.04, .1, .96, .9], [
    { pts: sc(HORSE, .36, .22, .56), smooth: true }, { pts: sc(HORSE, .43, .26, .56), smooth: true },
    { pts: [[.87, .78], [.89, .9], [.93, .8]], smooth: true, paint: '#B8463A' },                                   // plume
    { pts: [[.2, .44], [.47, .46], [.46, .58], [.22, .58]], paint: '#9A4A2E' },                                    // chariot box
    { circle: [.3, .32, .14], ax: .62 }, ...[0, 1, 2].map(i => ({ pts: [[.3 + Math.cos(i * 1.047) * .085, .32 + Math.sin(i * 1.047) * .14], [.3 - Math.cos(i * 1.047) * .085, .32 - Math.sin(i * 1.047) * .14]], line: true })),
    { circle: [.3, .32, .025], ax: .62 },
    { pts: [[.25, .58], [.33, .58], [.34, .7], [.32, .8], [.26, .8], [.24, .7]], smooth: true },                 // the king's body
    { pts: [[.255, .8], [.335, .8], [.34, .88], [.3, .95], [.26, .9]], smooth: true, paint: '#3E6EB0' },           // blue crown
    { circle: [.3, .79, .028] },
    { pts: [[.33, .76], [.44, .78], [.52, .79]], line: true }, { pts: [[.32, .74], [.36, .77]], line: true },      // arms drawing the bow
    { pts: [[.5, .94], [.56, .79], [.5, .62]], line: true, smooth: true }, { pts: [[.5, .94], [.38, .78], [.5, .62]], line: true },   // bow + string
    { pts: [[.2, .6], [.17, .78], [.21, .8], [.23, .62]], paint: '#B8463A' },                                      // quiver
    { pts: [[.3, .64], [.6, .62], [.86, .74]], line: true }, { pts: [[.3, .63], [.62, .66], [.92, .78]], line: true },   // reins tied round the king's waist
    { pts: [[.6, .08], [.66, .2], [.72, .16], [.66, .04]], smooth: true }, { pts: [[.82, .1], [.88, .25], [.93, .2], [.86, .06]], smooth: true }, { pts: [[.7, .3], [.78, .26], [.8, .34], [.72, .37]], smooth: true },
    { circle: [.62, .2, .025] }, { circle: [.91, .27, .025] } ]); }; }
function glyphColumns(c, St, f, col, u0, u1, v0, v1, seed) { const r = rng(seed); const n = Math.max(2, Math.round((u1 - u0) / .05)); const w = (u1 - u0) / n;
  for (let i = 0; i <= n; i++) { const a = St.uv(f, u0 + i * w, v0), b = St.uv(f, u0 + i * w, v1); c.strokeStyle = shade(col, .5); c.lineWidth = 1.8; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  for (let i = 0; i < n; i++) { const q0 = St.uv(f, u0 + i * w, v1), q1 = St.uv(f, u0 + (i + 1) * w, v0); const x = q0[0], top = q0[1], cw = q1[0] - q0[0], H = q1[1] - q0[1]; const cells = Math.max(2, Math.round(H / Math.abs(cw))); for (let k = 0; k < cells; k++) quadrat(c, r, x + cw * .06, top + k * H / cells, cw * .88, H / cells, col); } }
function smiteScene(c, St, f, col) { // the king (2x the captives) raises a pear-headed mace and grips the captives by the hair. Canon: profile head, frontal shoulders, narrow waist, striding legs
  reliefOn(c, St, f, col, [.02, .08, .98, .96], [
    { pts: [[.5, 0], [.56, 0], [.58, .2], [.6, .4], [.66, .4], [.7, .2], [.78, 0], [.84, 0], [.74, .24], [.72, .44], [.54, .44], [.54, .22]], smooth: true },   // striding legs (rear leg left, front leg right)
    { pts: [[.52, .4], [.74, .4], [.78, .5], [.7, .54], [.56, .54]], smooth: true, paint: '#E3D6B6' }, { pts: [[.6, .5], [.66, .5], [.64, .36], [.61, .36]], paint: '#D9B24E' },   // kilt + apron
    { pts: [[.57, .54], [.69, .54], [.72, .62], [.82, .72], [.8, .76], [.46, .76], [.46, .72], [.55, .62]], smooth: true },   // narrow waist, frontal shoulders
    { pts: [[.58, .76], [.66, .76], [.68, .8], [.71, .82], [.68, .84], [.69, .88], [.64, .9], [.58, .88]], smooth: true },   // head in profile, facing right
    { pts: [[.57, .87], [.66, .87], [.67, .94], [.63, 1.0], [.59, .95]], smooth: true, paint: '#E9DFC8' },   // white crown
    { pts: [[.47, .74], [.4, .86], [.42, .97]], line: true }, { pts: [[.41, .96], [.38, 1.02], [.42, 1.06], [.46, 1.0], [.43, .96]], smooth: true, paint: '#8A6A4A' },   // raised arm (behind) with a pear-headed mace
    { pts: [[.81, .74], [.88, .64], [.9, .6]], line: true },   // forward arm gripping the captives' hair
    ...[[.9, .58], [.94, .54], [.87, .53]].map(([x, yy]) => ({ circle: [x, yy, .035], ax: .9 })),
    { pts: [[.82, 0], [.86, .2], [.9, .36], [.96, .44], [.99, .3], [.98, 0]], smooth: true },   // kneeling captives, half the king's height
    { pts: [[.86, .2], [.8, .32]], line: true } ]); }

function smallSphinx(ctx, x, y, k) { // human-headed avenue sphinx facing left, ~5 m long; origin = front of the paws on the plinth top
  const T = (px, py) => [x + px * k, y - py * k]; const P = pts => pts.map(p => T(...p)); const st = '#CDA672', lw = Math.max(1.6, .14 * k);
  const path = (g, pts) => pts.forEach((p, i) => { const q = T(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
  blob(ctx, g => { path(g, spline([[0, 0], [0, .35], [1.3, .45], [1.6, 1.1], [2.2, 1.55], [3.4, 1.45], [4.4, 1.5], [5, 1.1], [5.1, .3], [4.9, 0]], true, 4)); }, st, { lw, shade: g => { for (let v = .3; v < 1.6; v += .32) { const a = T(0, v); g.fillStyle = 'rgba(100,60,28,.3)'; g.fillRect(a[0], a[1], 5.2 * k, .08 * k); } g.fillStyle = 'rgba(110,65,32,.3)'; g.beginPath(); path(g, [[0, .55], [5.2, .5], [5.2, 0], [0, 0]]); g.fill(); } });
  inkLine(ctx, spline([[2.2, 1.3], [2.5, .9], [2.4, .35]], false, 4).map(q => T(...q)), lw * .6);   // haunch + shoulder
  inkLine(ctx, P([[0, .2], [1.6, .22]]), lw * .5); for (const tx of [.08, .22, .36]) inkLine(ctx, P([[tx, 0], [tx + .02, .14]]), lw * .45);   // two parallel forelegs + toes
  blob(ctx, g => path(g, [[1.15, .85], [.95, 1.85], [1.2, 2.45], [1.85, 2.5], [2.25, 2.05], [2.35, .85], [1.95, .8], [1.85, 1.45], [1.45, 1.35], [1.5, .85]]), '#C9A06A', { lw, shade: g => { for (let v = .9; v < 2.5; v += .2) { const a = T(.9, v); g.fillStyle = 'rgba(46,80,140,.55)'; g.fillRect(a[0], a[1], 1.6 * k, .09 * k); } } });   // nemes
  blob(ctx, g => path(g, spline([[.92, 2.05], [.9, 1.55], [1.15, 1.25], [1.6, 1.3], [1.7, 1.75], [1.6, 2.15], [1.2, 2.2]], true, 3)), '#E0BE86', { lw: lw * .7 }); { const e = T(1.12, 1.84); ctx.fillStyle = '#2A1E16'; ctx.beginPath(); ctx.ellipse(e[0], e[1], .09 * k, .05 * k, 0, 0, 7); ctx.fill(); }   // face in profile
  inkLine(ctx, P([[1.12, 1.82], [1.3, 1.84]]), lw * .55); inkLine(ctx, P([[1.0, 1.62], [.92, 1.55], [1.02, 1.5]]), lw * .45); inkLine(ctx, P([[1.08, 1.42], [1.22, 1.43]]), lw * .45);
}
// ---------- sets ----------
const SETS = {};

SETS.giza = (ctx, o = {}) => { // Giza from the Sphinx Temple court: the Sphinx in its enclosure with Khafre's pyramid behind, Khufu right, Menkaure left; Khafre's red-granite valley temple
  const H = 470;
  skyGradient(ctx, H + 30, '#7FAFD2', '#CFE1E2', '#F4E1B8');
  clouds(ctx, [[1480, 130, 70, 41], [260, 90, 120, 29], [880, 60, 45, 17], [760, 300, 230, 11, 'streak'], [1650, 380, 170, 5, 'streak'], [1150, 230, 200, 8, 'streak']]);
  ridge(ctx, H + 6, 14, '#E3CFA6', 4, { ink: 2, inkCol: '#B89A6C' });
  const S = new Stage({ x: 0, y: -120, z: 3, yaw: 0, f: 1100, hy: H, cx: 960 }, [-.6, .45, .62]); S.gz = .45;
  S.pyramid(-480, 620, 102, 65, '#D6B888');                                       // Menkaure
  for (const [x, y] of [[-450, 520], [-422, 520], [-394, 520]]) S.pyramid(x, y, 28, 18, '#D2B282');
  S.pyramid(-21, 260, 215, 136, '#D7B684', { casing: .15 });                      // Khafre
  S.pyramid(330, 420, 230, 139, '#D0AE7C');                                       // Khufu
  for (const [x, y] of [[205, 290], [226, 322], [247, 354]]) S.pyramid(x, y, 46, 30, '#CDAA77');
  for (let i = 0; i < 6; i++) S.battered(140 + (i % 3) * 22, 150 + Math.floor(i / 3) * 30, 0, 16, 9, 5, .9, '#D2B07C', { tex: 'blocks', course: .9, blockW: 2 });
  S.box(-50, 30, 0, 6, 200, 1.4, '#CBA674', { tex: 'blocks', course: .7, blockW: 2.4, shadow: false });   // causeway up to Khafre
  S.box(-38, 26, 0, 92, 6, 8, '#C49E6A', { tex: 'blocks', course: 1.5, blockW: 7, seed: 3 });           // enclosure walls cut in the bedrock
  S.box(50, -16, 0, 6, 42, 8, '#C49E6A', { tex: 'blocks', course: 1.5, blockW: 7, seed: 4 });
  S.sprite([-28.4, 0, 0], (c, x, y, k) => { c.save(); c.fillStyle = 'rgba(90,48,22,.32)'; c.beginPath(); c.moveTo(x - 20 * k, y); c.lineTo(x + 57 * k, y); c.lineTo(x + 70 * k, y + 2.6 * k); c.lineTo(x - 8 * k, y + 2.6 * k); c.closePath(); c.fill(); c.restore(); sphinxSprite(c, x, y, k); const a = [x - 22 * k, y], b = [x + 57 * k, y]; c.fillStyle = 'rgba(70,35,15,.45)'; c.fillRect(a[0], a[1] - .9 * k, b[0] - a[0], .9 * k); });
  S.castShadow([[-21, 0], [-6, 12], [5, 14.5], [40, 12], [56, 4], [57, 0]].map(([u, h]) => [-28.4 + u, 1, h]).concat([[-6, 1, 0]]), { poly: true });
  // Khafre's valley temple: massive red-granite-cased walls (left) and the ruined Sphinx Temple (right front)
  S.box(-96, -40, 0, 40, 46, 9, '#B58C66', { tex: 'blocks', course: 3, blockW: 6.5, seed: 81, granite: true, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] < -.9) { const [W] = fdim(f); poly(c, uvRect(St, f, .62, 0, .62 + 4 / W, .62), '#2B1F19', true, 2.4); poly(c, uvRect(St, f, .62 + 1.5 / W, 0, .62 + 2.5 / W, .62), '#A8665A', true, 2); } } });   // red-granite casing, square-pillar doorway
  S.box(40, -60, 0, 30, 22, 3.4, '#C9A470', { tex: 'blocks', course: 1.15, blockW: 2.6, seed: 82 }); S.box(-30, -66, 0, 14, 5, 1.8, '#C9A470', { tex: 'blocks', course: .9, blockW: 2, seed: 83 });
  // the paved court the viewer stands in, sand drifting over its slabs
  S.box(-40, -119.5, 0, 80, 30, .45, '#D4B382', { floor: true, layer: 0, topTex: 'paving', slab: .7, top: '#D8BA88', shadow: false });
  const drift = (pts, layer = 3) => S.face(pts.map(([x, y]) => [x, y, .46]), '#E2C896', { ground: true, layer, noInk: true, paint: driftPaint, noFill: true });
  drift([[-9, -104], [-5, -103], [-6, -100], [-10, -100.5]]); drift([[6, -110], [9, -108], [8, -105], [5, -106.5]]); drift([[-12, -108], [-8, -109], [-7, -106], [-11, -104.6], [-14, -105.5]]); drift([[9, -104], [14, -105], [16, -101], [11, -100.5]]); drift([[-2, -98], [3, -99], [6, -96], [0, -94.5], [-4, -95.5]]); drift([[-5, -111.5], [-1, -112.2], [4, -111], [5.5, -108], [2, -106], [-3, -105.4], [-5.5, -107.5]]);
  // court props: fallen relief block, broken statue base, column drums, offering table with faience, potsherds
  S.box(-9.6, -110.5, .45, 3.4, 1.4, 1.25, '#CFAE7C', { tex: 'reliefs', registers: 1, seed: 61 }); S.box(-6.6, -109, .45, 1.1, .9, .55, '#C9A470', { tex: 'blocks', course: .3, blockW: .6 });
  S.box(-3.8, -102, .45, 1.6, 1.2, .9, '#CDB08A', { tex: 'blocks', course: .3, blockW: .5, seed: 63 }); S.sprite([-3, -101.6, 1.35], (c, px, py, k) => { poly(c, [[px - .5 * k, py], [px - .45 * k, py - .45 * k], [px - .1 * k, py - .5 * k], [px + .05 * k, py - .2 * k], [px + .4 * k, py - .25 * k], [px + .5 * k, py]], '#CDB08A', true, 2); });   // statue base with broken feet
  for (const [x, y, r] of [[6.4, -109.5, .55], [7.8, -107.8, .45], [5.4, -106.4, .38]]) S.cylinder(x, y, .45, r, r * 1.1, '#CDAA76', { segs: 16, top: '#D9BC8C' });
  S.box(3, -103.8, .45, 1.4, .7, .6, '#D9C6A0', { tex: 'blocks', course: .6, blockW: 1.4, seed: 62 });
  S.sprite([3.7, -103.45, 1.05], (c, px, py, k) => { jarSprite(c, px - .35 * k, py, .42 * k, '#2F7FA8', 2); jarSprite(c, px + .1 * k, py, .36 * k, '#3FA39A', 1); for (const dx of [.42, .54]) { inkLine(c, [[px + dx * k, py], [px + (dx + .04) * k, py - .45 * k]], 2, { col: '#4E7A34' }); poly(c, [[px + (dx + .04) * k, py - .45 * k], [px + (dx - .05) * k, py - .62 * k], [px + (dx + .04) * k, py - .56 * k], [px + (dx + .13) * k, py - .62 * k]], '#E9E2F2', true, 1.6); } });
  S.sprite([0, -113, .45], (c, px, py, k) => { const r = rng(3); for (let i = 0; i < 4; i++) { const x = px + (r() - .5) * 8 * k, y = py + (r() - .5) * 2 * k, sz = (.16 + r() * .12) * k, a0 = r() * .6; const col = r() > .5 ? '#A8735A' : '#966A50'; c.fillStyle = 'rgba(226,200,150,.8)'; c.beginPath(); c.ellipse(x, y + sz * .2, sz * 1.2, sz * .35, 0, 0, 7); c.fill(); const P = []; P.push([x - sz, y], [x - sz * .5, y - sz * .45], [x + sz * .6, y - sz * .5], [x + sz, y - sz * .1], [x + sz * .7, y + sz * .12], [x - sz * .6, y + sz * .12]); poly(c, P, col, true, 1.6); inkLine(c, [P[0], P[1], P[2]].map(q => [q[0], q[1] + 2]), 1.4, { col: shade(col, 1.25) }); } });   // potsherds
  palmAt(S, -31, -88, 10, 7); palmAt(S, 31, -86, 11, 2); palmAt(S, 34.5, -82, 8.5, 5, { lean: .15 });
  ctx.fillStyle = vgrad(ctx, H, 1080, '#E4CA98', '#D0AF79'); ctx.fillRect(0, H, 1920, 1080 - H);
  S.groundDetail(ctx, { col: '#DCC08C', seed: 7, count: 700, far: 700, avoid: p => p[1] < -89.5 });
  S.render(ctx);
  ctx.save(); ctx.fillStyle = 'rgba(100,55,25,.22)'; ctx.beginPath(); ctx.moveTo(1920, 700); ctx.lineTo(1560, 700); ctx.lineTo(1000, 1080); ctx.lineTo(1920, 1080); ctx.closePath(); ctx.fill(); ctx.restore();   // shadow from an off-screen pylon
  rubble(ctx, 380, 1500, 880, 1075, 41, 9); stoneBlock(ctx, 230, 1070, 300, 110, 70, '#C9A874', 8); jarSprite(ctx, 1800, 1090, 150, '#B5653A', 0);
  { const cx = 640, cy = 1040; ctx.save(); ctx.fillStyle = 'rgba(60,30,14,.3)'; ctx.beginPath(); ctx.ellipse(cx + 40, cy + 6, 170, 26, 0, 0, 7); ctx.fill(); ctx.restore(); blob(ctx, g => { g.ellipse(cx, cy - 50, 140, 50, 0, 0, 7); g.rect(cx - 140, cy - 50, 280, 50); g.moveTo(cx + 140, cy); g.ellipse(cx, cy, 140, 50, 0, 0, Math.PI); }, '#CFAE7C', { lw: 3.5, shade: g => { g.fillStyle = '#DCC08E'; g.beginPath(); g.ellipse(cx, cy - 50, 140, 50, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(110,75,40,.5)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy - 50, 90, 32, 0, 0, 7); g.stroke(); } }); }   // a fallen column drum
  brushTexture(ctx, .2); warmGrade(ctx);
};

SETS.construction = (ctx, o = {}) => { // Khufu's pyramid rising: smooth casing below, stepped core above, a mud-brick ramp with timber tracks, hauling crews, quarry + huts
  const H = 380;
  skyGradient(ctx, H + 30, '#86B4D3', '#D6E2DA', '#F2DDB0'); clouds(ctx, [[1650, 110, 110, 61], [380, 120, 55, 47], [900, 300, 200, 9, 'streak'], [520, 250, 180, 19, 'streak']]);
  ridge(ctx, H + 10, 22, '#DECAA0', 6, { ink: 2, inkCol: '#B89A6C' });
  const S = new Stage({ x: 70, y: -260, z: 9, yaw: -.41, f: 1100, hy: H, cx: 960 }, [-.55, -.45, .65]);
  // lower casing (battered, smooth white limestone), then a stepped core of block courses
  const hb = 26, base = 230, slope = 139 / 115; const inset = hb / slope;
  S.battered(-115, -115, 0, base, base, hb, inset, '#C9B288', { tex: 'blocks', course: 1.1, blockW: 3.4, top: '#D8C49A' });
  let lv = hb, half = 115 - inset; while (lv < 58) { const st = 1.5; S.box(-half, -half, lv, half * 2, half * 2, st, LIME, { tex: 'blocks', course: .75, blockW: 1.7, top: '#D9BF8E', shadow: false, inkK: .07, seed: Math.round(lv * 3) }); lv += st; half -= st / slope + .9; }
  // the ramp: mud-brick courses, timber cross-tracks on top, rising to the working level
  const rx = 0, rw = 16, y0 = -222, y1 = -115 + inset, z1 = hb;
  S.quad([rx, y0, 0], [rx + rw, y0, 0], [rx + rw, y1, z1], [rx, y1, z1], '#C29A6A', { flatLit: true, paint: (c, St, f) => { for (let i = 1; i < 40; i++) { const v = i / 40; const a = St.uv(f, .08, v), b = St.uv(f, .92, v); c.strokeStyle = '#6E4A2C'; c.lineWidth = clamp(inkW(St, f, .03), 1, 3); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } for (const u of [.3, .7]) { const a = St.uv(f, u, 0), b = St.uv(f, u, 1); c.strokeStyle = '#8A6038'; c.lineWidth = 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } } });
  S.quad([rx + rw, y0, 0], [rx + rw, y1, 0], [rx + rw, y1, z1], [rx + rw, y1, z1], '#A27A50', { paint: (c, St, f, col) => { const P = [St.P([rx + rw, y0, 0]), St.P([rx + rw, y1, 0]), St.P([rx + rw, y1, z1])]; const r = rng(5); for (let j = 0; j < 40; j++) { const t = j / 40, t2 = (j + 1) / 40; const a = [P[0][0] + (P[2][0] - P[0][0]) * t, P[0][1] + (P[2][1] - P[0][1]) * t], b = [P[1][0], P[1][1] + (P[2][1] - P[1][1]) * t]; c.strokeStyle = shade(col, .66); c.lineWidth = 1.3; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
    const b2 = [P[1][0], P[1][1] + (P[2][1] - P[1][1]) * t2]; const n = 6 + Math.floor(r() * 4); for (let i = 1; i < 40; i++) { const u = (i + (j % 2) * .5) / 40; if (u > 1) continue; const q0 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], q1 = [q0[0], q0[1] + (b2[1] - b[1])]; c.lineWidth = .8; c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]); c.stroke(); if (r() < .04) { c.fillStyle = shade(col, 1.15); c.fillRect(q0[0], q0[1], 6, 3); } } } } });
  for (let i = 0; i < 4; i++) { const u = .18 + i * .2, p = [rx + rw / 2, y0 + (y1 - y0) * u, z1 * u + .2]; S.sprite(p, (c, x, y, k) => { sledgeSprite(c, x, y, k * 1.1); for (let m = 0; m < 7; m++) egPerson(c, x - (2.4 + m * .95) * k * 1.1, y + m * .05 * k, 1.75 * k, { pose: 'pull', seed: m + i * 7 }); egPerson(c, x + 1.6 * k, y, 1.75 * k, { pose: 'stand', seed: i + 40 }); }); S.props[S.props.length - 1].bias = -6; }
  // quarry: stepped cut faces at the left, with blocks still attached
  for (let j = 0; j < 4; j++) S.box(-60 - j * 6, -150 + j * 7, 0, 30, 8, 8 - j * 1.8, '#C4A574', { tex: 'blocks', course: 1, blockW: 2, seed: 20 + j, shadow: j === 0 });
  // workers' huts with palm-rib awnings
  for (const [x, y, w] of [[48, -228, 7], [58, -222, 6], [50, -212, 7]]) egHut(S, x, y, w, 5, 2.8, x === 58 ? WASH : OCHRE, x);
  // foreground work yard: blocks waiting on rollers, a crew dragging a sledge across, rope coils
  for (const [x, y, sz] of [[38, -246, 1.4], [40.6, -247, 1.2], [39, -244.4, 1.1], [58, -250, 1.5]]) S.box(x, y, 0, sz * 1.5, sz, sz, '#CDB286', { tex: 'blocks', course: sz / 2, blockW: sz * .75, seed: Math.round(x * 3) });
  S.sprite([30, -244, 0], (c, x, y, k) => { for (let i = 0; i < 3; i++) { c.strokeStyle = '#4A3420'; c.lineWidth = .16 * k + 2; c.beginPath(); c.ellipse(x + i * .9 * k, y - .12 * k, .45 * k, .16 * k, 0, 0, 7); c.stroke(); c.strokeStyle = '#B08A52'; c.lineWidth = .16 * k; c.stroke(); } });   // rope coils
  S.sprite([40, -230, 0], (c, x, y, k) => { poly(c, [[x - .5 * k, y - .45 * k], [x + .5 * k, y - .45 * k], [x + .55 * k, y], [x - .55 * k, y]], '#E3D6B6', true, 2); egPerson(c, x, y - .2 * k, 1.2 * k, { seed: 30, pose: 'stand' }); poly(c, [[x + .1 * k, y - 1.0 * k], [x + .6 * k, y - 1.05 * k], [x + .62 * k, y - .9 * k], [x + .12 * k, y - .85 * k]], '#F1EADB', true, 1.5); });   // a scribe tallying blocks
  S.sprite([34, -228, 0], (c, x, y, k) => { egPerson(c, x, y, 1.8 * k, { seed: 9, pose: 'stand' }); inkLine(c, [[x + .35 * k, y], [x + .45 * k, y - 2.1 * k]], 3, { col: '#6E4A2C' }); });   // overseer with his staff
  S.sprite([22, -248, 0], (c, x, y, k) => { sledgeSprite(c, x, y, k); egPerson(c, x + 2.3 * k, y, 1.7 * k, { seed: 14, pose: 'carry', flip: true }); c.strokeStyle = 'rgba(120,170,210,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 1.9 * k, y - 1.1 * k); c.quadraticCurveTo(x + 1.6 * k, y - .5 * k, x + 1.7 * k, y); c.stroke(); });   // pouring water in front of a sledge
  S.sprite([46, -236, 0], (c, x, y, k) => { inkLine(c, [[x - 1.6 * k, y - .2 * k], [x + 1.8 * k, y - 1.2 * k]], 5, { col: '#7A5634' }); poly(c, [[x - .3 * k, y], [x + .3 * k, y], [x, y - .5 * k]], '#C9B08A', true, 2); egPerson(c, x + 1.9 * k, y, 1.7 * k, { seed: 21, pose: 'pull', flip: true }); });   // a lever over a fulcrum
  S.sprite([55, -244, 0], (c, x, y, k) => { sledgeSprite(c, x, y, k * 1.1); for (let m = 0; m < 6; m++) egPerson(c, x - (2.6 + m * .95) * k * 1.1, y + m * .04 * k, 1.75 * k, { pose: 'pull', seed: m + 70 }); egPerson(c, x + 1.9 * k, y, 1.75 * k, { pose: 'carry', seed: 77, flip: true }); });
  for (const [x, y] of [[26, -236], [28.6, -233], [24, -229], [30, -240], [21, -238]]) S.box(x, y, 0, 2.2, 1.4, 1.3, LIME, { tex: 'blocks', course: 1.3, blockW: 2.2 });
  palmAt(S, 64, -232, 11, 4); palmAt(S, 68, -222, 9, 8); for (const [m, dx, dy, pose, hh] of [[0, 0, 0, 'stand', 1.78], [1, 2.6, 1.6, 'carry', 1.7], [2, 4.4, -.6, 'pull', 1.68], [3, 7.8, 2.4, 'stand', 1.6]]) S.sprite([30 + dx, -232 + dy, 0], (c, x, y, k) => egPerson(c, x, y, hh * k, { pose, seed: m * 5 + 11, flip: m % 2, kilt: m === 3 ? '#C9B07A' : undefined }));
  ctx.fillStyle = vgrad(ctx, H, 1080, '#E2C896', '#CCAA74'); ctx.fillRect(0, H, 1920, 1080 - H); S.groundDetail(ctx, { col: '#D9BA86', seed: 3, count: 900, far: 500 });
  S.render(ctx);
  jarSprite(ctx, 110, 1088, 170, '#A9603A', 3); jarSprite(ctx, 215, 1086, 120, '#C99A6A', 2);
  stoneBlock(ctx, 980, 1050, 260, 120, 70, '#C9AC7E', 5, true); stoneBlock(ctx, 1230, 1065, 150, 80, 45, '#BFA070', 6); stoneBlock(ctx, 1160, 975, 120, 70, 40, '#C9AC7E', 7, true);
  jarSprite(ctx, 1640, 1088, 150, '#9E5A34', 1); rubble(ctx, 700, 1900, 840, 1075, 61, 7);
  { for (let i = 0; i < 3; i++) { const x = 1430 + i * 60, y = 1040; ctx.strokeStyle = '#4A3420'; ctx.lineWidth = 12; ctx.beginPath(); ctx.ellipse(x, y, 48, 16, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = '#B08A52'; ctx.lineWidth = 8; ctx.stroke(); } }   // rope coils
  brushTexture(ctx, .2); warmGrade(ctx);
};

SETS.luxor = (ctx, o = {}) => { // Luxor Temple: the first pylon (Kadesh reliefs), flagpole niches, seated colossi, the surviving obelisk on its pedestal, the sphinx avenue
  const H = 470;
  skyGradient(ctx, H + 30, '#78ABD2', '#CFE1E1', '#F5E2BB'); clouds(ctx, [[200, 130, 60, 52], [1760, 120, 95, 33], [960, 50, 260, 12, 'streak'], [1500, 300, 200, 14, 'streak']]);
  const S = new Stage({ x: -5, y: -48, z: 1.8, yaw: 0, f: 1050, hy: H, cx: 960 }, [-.7, .2, .62]); S.gz = .25;
  const Wd = 65, D = 15, Hp = 24;
  const tower = (x0, seed, scene) => { const t = S.battered(x0, 0, 0, Wd / 2 - 4, D, Hp, 2.2, SANDST, { tex: 'plaster', seed, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] > -.9) return;
      const [W] = fdim(f); for (const uc of seed === 2 ? [.45, .6] : [.4, .55]) { poly(c, uvRect(St, f, uc - 1.1 / W, 0, uc + 1.1 / W, .97), shade(col, .74), true, inkW(St, f)); poly(c, uvRect(St, f, uc - 1.1 / W, 0, uc - .5 / W, .97), shade(col, .62)); }
      scene(c, St, f, col); if (seed === 2) glyphColumns(c, St, f, col, .66, .98, .1, .86, 3); else glyphColumns(c, St, f, col, .02, .34, .1, .86, 4); torusM(c, St, f, col, Hp - .8); } }); cornice(S, t[0][0], t[0][1], t[1][0] - t[0][0], t[2][1] - t[0][1], Hp, .9, 1.8, '#DDB880'); return t; };
  tower(-Wd / 2, 2, (c, St, f, col) => { const sc = kadeshScene(S); const [u0, v0, u1, v1] = [.0, .1, .42, .8]; const f2 = { ...f }; sc(c, { uv: (ff, u, v) => St.uv(f, u0 + (u1 - u0) * u, v0 + (v1 - v0) * v), toCam: p => St.toCam(p), cam: St.cam }, f, col); });
  tower(4, 5, (c, St, f, col) => smiteScene(c, { uv: (ff, u, v) => St.uv(f, .6 + .38 * u, .12 + .7 * v), toCam: p => St.toCam(p), cam: St.cam }, f, col));
  S.box(-4, 2, 0, 8, D - 4, 18, SANDST, { tex: 'blocks', course: 2.2, blockW: 3.2, paint: (c, St, f, col) => { const n = St.normal(f.pts); if (n[1] < -.9) { doorM(c, St, f, col, .5, 3.6, 11, shade(col, .92)); torusM(c, St, f, col, 17.2);
    for (const [ua, ub] of [[.05, .24], [.76, .95]]) for (let j = 0; j < 3; j++) { const vb = .08 + j * .2; reliefOn(c, St, f, col, [ua, vb, ub, vb + .17], [{ pts: [[.04, .04], [.96, .04], [.96, .96], [.04, .96]], line: true }, { pts: [[.3, .08], [.42, .52], [.36, .7], [.44, .86], [.56, .86], [.6, .7], [.54, .5], [.66, .08]], smooth: true, paint: j === 1 ? '#3E6EB0' : null }, { circle: [.5, .9, .07], ax: .9 }, { pts: [[.62, .66], [.86, .6]], line: true }]); } } } });
  cornice(S, -4, 2, 8, D - 4, 18, .6, 1.4, '#DDB880');
  S.sprite([0, 1.2, 18.6], (c, px, py, k) => { for (const sx of [-1, 1]) { const W = [[0, 0], [sx * 3.6, -.5], [sx * 3.4, .25], [0, .6]].map(([a, b]) => [px + a * k, py + b * k]); poly(c, W, '#3E6EB0', true, 2); for (let i = 1; i < 4; i++) inkLine(c, [[px + sx * .5 * k, py + (i * .15) * k], [px + sx * 3.4 * k, py + (-.4 + i * .2) * k]], 1.6, { col: '#D9B24E' }); }
    c.beginPath(); c.arc(px, py + .1 * k, .55 * k, 0, 7); c.fillStyle = '#C0453A'; c.fill(); inkLine(c, Array.from({ length: 25 }, (_, i) => [px + Math.cos(i / 24 * 6.283) * .55 * k, py + .1 * k + Math.sin(i / 24 * 6.283) * .55 * k]), 2.4, { closed: true }); });
  for (const x of [-20, -15.7, 15.1, 19.4]) { S.cylinder(x + .3, -.7, 0, .35, 31, '#7A5634', { segs: 8, top: '#6A4A2C' }); S.sprite([x + .3, -.7, 31], (c, px, py, k) => { const r = rng(x * 3); const col = { '-20': '#C0453A', '-15.7': '#3E6EB0', '15.1': '#3F8A5A', '19.4': '#E3C25A' }[String(x)]; const pts = [[px, py], [px + 5 * k, py + .6 * k + r() * k], [px + 9 * k, py + 1.6 * k], [px + 4.6 * k, py + 1.9 * k], [px, py + 1.4 * k]]; poly(c, pts, col, true, 2); }); }
  
  for (const x of [-11, 8]) { S.box(x - 3.2, -9, .25, 6.4, 7.4, 1.6, '#C8A06C', { tex: 'blocks', course: .8, blockW: 1.6 }); S.sprite([x, -6, 1.85], (c, px, py, k) => colossusSprite(c, px, py, k)); S.castShadow([[x - 2.8, -5, 1.85], [x + 2.8, -5, 1.85], [x + 2.8, -5, 11.6], [x + 1.1, -5, 15.6], [x - 1.1, -5, 15.6], [x - 2.8, -5, 11.6]], { poly: true }); }
  for (let i = 0; i < 2; i++) for (const s2 of [-1, 1]) { const y = -24 - i * 8, x = s2 * 8.5 - 4; S.box(x - 1.3, y - 2.8, .25, 2.6, 5.6, 1.2, '#C9A36F', { tex: 'blocks', course: .6, blockW: 1.3 }); S.sprite([x, y - 1.6, 1.45], (c, px, py, k) => { c.save(); if (s2 > 0) { c.translate(px, 0); c.scale(-1, 1); c.translate(-px, 0); } smallSphinx(c, px - 2.5 * k, py, k); c.restore(); }); S.castShadow([[x - .8, y - 2.5, 1.45], [x + .8, y - 2.5, 1.45], [x + .8, y + 2.5, 1.45], [x - .8, y + 2.5, 1.45], [x, y - 1.2, 3.8], [x, y + 2.3, 3]]); }
  palmAt(S, 24, -26, 13, 3); palmAt(S, 28, -21, 10, 9, { lean: .2 }); palmAt(S, -30, -32, 12, 6);
  S.box(-30, -47.5, 0, 54, 47, .25, '#D2B484', { floor: true, layer: 0, topTex: 'paving', slab: .7, top: '#D6BA8A', seed: 51, shadow: false });
  const drift = pts => S.face(pts.map(([x, y]) => [x, y, .26]), '#E0C594', { ground: true, layer: 3, noInk: true, paint: driftPaint, noFill: true });
  drift([[-30, -40], [-18, -37], [-20, -30], [-30, -26]]); drift([[24, -40], [13, -36], [15, -28], [24, -25]]); drift([[-10, -46], [-8, -45], [-9, -43], [-11, -44]]); drift([[-1, -30], [2, -31.5], [4, -29.5], [1, -28]]);
  // foreground pieces: fallen relief block, column drums, a broken offering table
  S.box(-11, -41.5, .25, 3, 1.4, 1.25, '#CFAE7C', { tex: 'reliefs', registers: 1, seed: 72 }); S.box(-8.4, -40, .25, 1.1, .8, .5, '#C9A470', { tex: 'blocks', course: .25, blockW: .5 });
  for (const [x, y, r] of [[-.5, -41, .55], [1.2, -39.6, .48], [.2, -38, .4]]) S.cylinder(x, y, .25, r, r * 1.05, '#CDAA76', { segs: 16, top: '#D9BC8C' });
  S.box(5.5, -42, .25, 1.8, 1.1, .9, '#CFAE7C', { tex: 'blocks', course: .45, blockW: .9, seed: 77 }); S.box(7.6, -43.4, .25, 1.1, .8, .6, '#C9A470', { tex: 'blocks', course: .3, blockW: .55, seed: 78 });
  S.sprite([-6.6, -40.5, .25], (c, px, py, k) => { jarSprite(c, px, py, .7 * k, '#9E5A34', 3); jarSprite(c, px + .5 * k, py, .5 * k, '#C0453A', 1); });
  ctx.fillStyle = vgrad(ctx, H, 1080, '#E0C594', '#C9A773'); ctx.fillRect(0, H, 1920, 1080 - H);
  S.groundDetail(ctx, { col: '#D8BC8B', seed: 6, count: 600, far: 300, avoid: p => p[0] > -30 && p[0] < 24 && p[1] > -47.5 && p[1] < 0 });
  S.render(ctx);
  ctx.save(); ctx.fillStyle = 'rgba(110,60,30,.24)'; ctx.beginPath(); ctx.moveTo(0, 820); ctx.lineTo(260, 820); ctx.lineTo(900, 1080); ctx.lineTo(0, 1080); ctx.closePath(); ctx.fill(); ctx.restore();   // shadow of an off-screen column
  rubble(ctx, 300, 1600, 820, 1075, 52, 10); lyingDrum(ctx, 1460, 1040, 120, '#CFAE7C'); rubble(ctx, 60, 900, 900, 1075, 57, 7);
  reeds(ctx, 1700, 1940, 1090, 230, 7, '#5E7A3A');
  brushTexture(ctx, .2); warmGrade(ctx);
};
function colossusSprite(ctx, x, y, k) { // seated Ramesses II on his throne, front view (metres, 15.6 m with crown). Knees project, hands flat on the knees, shins ~35% of the height
  const T = (px, py) => [x + px * k, y - py * k]; const st = '#C9A47C', lw = Math.max(2, .13 * k);
  const path = (g, pts) => pts.forEach((p, i) => { const q = T(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
  const B = (pts, col, sh, w = 1) => blob(ctx, g => path(g, pts), col, { lw: lw * w, shade: sh });
  const S = (pts, n = 3) => spline(pts, true, n);
  B([[-3.2, 0], [3.2, 0], [3.2, 7.2], [2.6, 7.2], [2.6, 11.0], [-2.6, 11.0], [-2.6, 7.2], [-3.2, 7.2]], shade(st, .8), g => { g.fillStyle = shade(st, .64); g.beginPath(); path(g, [[2.4, 0], [3.2, 0], [3.2, 7.2], [2.4, 7.2]]); g.fill(); g.strokeStyle = shade(st, .5); g.lineWidth = .07 * k; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(...T(sx * 2.8, .8)); g.lineTo(...T(sx * 2.8, 6.4)); g.moveTo(...T(sx * 2.3, 3.6)); g.lineTo(...T(sx * 3.1, 3.6)); g.moveTo(...T(sx * 2.45, 2.6)); g.quadraticCurveTo(...T(sx * 2.8, 3.2), ...T(sx * 3.05, 2.6)); g.stroke(); } });   // throne: back slab to the shoulders, wide side blocks with sema-tawy
  for (const sx of [-1, 1]) B(S([[sx * .3, .5], [sx * 1.45, .5], [sx * 1.5, 3], [sx * 1.4, 5.2], [sx * .35, 5.2], [sx * .25, 3]]), shade(st, sx > 0 ? .86 : 1), g => { g.fillStyle = shade(st, .76); g.beginPath(); path(g, [[sx * 1.05, .5], [sx * 1.6, .5], [sx * 1.6, 5.3], [sx * 1.05, 5.3]]); g.fill(); });   // shins
  for (const sx of [-1, 1]) B(S([[sx * .2, 0], [sx * 1.6, 0], [sx * 1.6, .45], [sx * .9, .7], [sx * .2, .5]], 2), shade(st, .95));   // feet
  B(S([[-2.1, 5.3], [2.1, 5.3], [2.3, 6.3], [1.9, 7.6], [-1.9, 7.6], [-2.3, 6.3]], 3), shade(st, 1.12), g => { g.fillStyle = shade(st, .88); g.beginPath(); path(g, [[-2.3, 5.2], [2.3, 5.2], [2.3, 5.8], [-2.3, 5.8]]); g.fill(); g.strokeStyle = shade(st, .62); g.lineWidth = .07 * k; g.beginPath(); g.moveTo(...T(0, 5.6)); g.lineTo(...T(0, 7.5)); g.stroke(); });   // thighs: a lit, foreshortened lap plane
  for (const sx of [-1, 1]) B(S([[sx * .2, 5.1], [sx * 1.05, 4.75], [sx * 2.05, 5.1], [sx * 2.1, 5.9], [sx * 1.1, 6.15], [sx * .25, 5.85]]), shade(st, 1.06));   // knees projecting toward us
  B([[-1.6, 7.4], [1.6, 7.4], [1.5, 8.3], [-1.5, 8.3]], shade(st, .96), g => { g.strokeStyle = shade(st, .66); g.lineWidth = .05 * k; for (let i = -7; i <= 7; i++) { g.beginPath(); g.moveTo(...T(i * .2, 7.42)); g.lineTo(...T(i * .19, 8.28)); g.stroke(); } });   // pleated shendyt
  B(S([[-1.5, 8.3], [1.5, 8.3], [2.35, 11.5], [1.2, 11.8], [-1.2, 11.8], [-2.35, 11.5]], 2), st, g => { g.fillStyle = shade(st, .82); g.beginPath(); path(g, [[.9, 8.3], [1.6, 8.3], [2.4, 11.6], [1.3, 11.6]]); g.fill(); g.strokeStyle = shade(st, .6); g.lineWidth = .06 * k; g.beginPath(); g.moveTo(...T(-1.2, 10.4)); g.quadraticCurveTo(...T(0, 10.1), ...T(1.2, 10.4)); g.stroke(); });   // torso
  for (const sx of [-1, 1]) { B(S([[sx * 2.35, 11.4], [sx * 1.75, 11.3], [sx * 1.7, 8.8], [sx * 2.1, 8.2], [sx * 2.45, 8.9]], 2), shade(st, sx > 0 ? .82 : .98));   // upper arms
    B(S([[sx * 2.4, 8.6], [sx * 1.8, 8.3], [sx * 1.6, 6.4], [sx * 2.2, 6.2]], 2), shade(st, sx > 0 ? .84 : 1));   // forearms down onto the knees
    B(S([[sx * 2.2, 6.4], [sx * 1.15, 6.25], [sx * 1.05, 5.75], [sx * 2.15, 5.7]], 2), shade(st, 1.1), g => { g.strokeStyle = shade(st, .6); g.lineWidth = .05 * k; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(...T(sx * (1.15 + i * .24), 6.25)); g.lineTo(...T(sx * (1.1 + i * .24), 5.75)); g.stroke(); } }); }   // hands flat on the knees
  B([[-2.35, 11.5], [-1.35, 14.3], [1.35, 14.3], [2.35, 11.5], [1.25, 10.3], [.85, 12.3], [-.85, 12.3], [-1.25, 10.3]], '#D2B486', g => { g.strokeStyle = 'rgba(110,80,45,.5)'; g.lineWidth = .14 * k; for (let v = 10.6; v < 14.2; v += .38) { g.beginPath(); g.moveTo(...T(-2.4, v - .1)); g.quadraticCurveTo(...T(0, v + .25), ...T(2.4, v - .1)); g.stroke(); } });   // nemes + lappets
  B(S([[-.78, 12.3], [0, 12.15], [.78, 12.3], [.84, 13.4], [.5, 14], [-.5, 14], [-.84, 13.4]], 3), shade(st, 1.08));   // face
  const L = (pts, w = .8) => inkLine(ctx, pts.map(p => T(...p)), lw * w);
  L([[-.5, 13.25], [-.18, 13.32]]); L([[.18, 13.32], [.5, 13.25]]); L([[-.08, 13.1], [-.04, 12.75], [.1, 12.72]], .5); L([[-.24, 12.55], [0, 12.5], [.24, 12.55]], .6);
  B([[-.17, 12.3], [.17, 12.3], [.13, 11.45], [-.13, 11.45]], shade(st, .8));   // false beard
  B([[-1.05, 14.05], [1.05, 14.05], [1.0, 15.1], [.6, 15.1], [.62, 16.4], [.35, 16.4], [.35, 15.1], [-1.0, 15.1]], '#B8604E', g => { g.fillStyle = 'rgba(90,30,20,.25)'; g.beginPath(); path(g, [[.3, 14], [1.1, 14], [1.1, 16.5], [.3, 16.5]]); g.fill(); });   // red crown
  B(S([[-.55, 15.05], [.3, 15.05], [.24, 16.1], [-.1, 16.75], [-.45, 16.2]], 3), '#E9DFC8');   // white crown inside it
  inkLine(ctx, [T(.62, 15.6), T(.95, 15.9), T(.9, 16.2), T(.72, 16.1)], lw * .6);
  // the queen beside his leg, reaching his knee: tripartite wig, sheath dress, arms at her sides
  B(S([[-2.95, 0], [-2.05, 0], [-2.1, 2.6], [-2.2, 3.9], [-2.75, 3.9], [-2.85, 2.6]], 3), shade(st, 1.04), g => { g.strokeStyle = shade(st, .62); g.lineWidth = .05 * k; for (const sx of [-2.8, -2.15]) { g.beginPath(); g.moveTo(...T(sx, 3.8)); g.lineTo(...T(sx + (sx < -2.5 ? .05 : -.05), 2.3)); g.stroke(); } }, .7);
  B(S([[-2.95, 3.85], [-2.05, 3.85], [-2.15, 4.9], [-2.5, 5.15], [-2.85, 4.9]], 3), '#8A6A4A', null, .7);   // wig
  B(S([[-2.68, 4.1], [-2.32, 4.1], [-2.3, 4.7], [-2.5, 4.85], [-2.7, 4.7]], 3), shade(st, 1.12), null, .5);   // face
}

SETS.village = (ctx, o = {}) => { // Deir el-Medina: a narrow street of whitewashed and ochre mud-brick houses, red door frames, roof canopies, stairs, laundry
  const H = 440;
  skyGradient(ctx, H + 40, '#82B2D4', '#D8E4DA', '#F5E3BC'); clouds(ctx, [[1500, 110, 90, 6], [500, 160, 200, 3, 'streak']]);
  ridge(ctx, H - 10, 230, '#C99A68', 12, { cliffs: true, ink: 2.5 });   // the Theban cliffs
  const S = new Stage({ x: .6, y: -9, z: 1.6, yaw: .06, f: 1000, hy: H, cx: 960 }, [-.6, -.35, .7]);
  S.flat([[-2.6, -12, 0], [2.6, -12, 0], [2.6, 80, 0], [-2.6, 80, 0]], '#C2A076', { layer: 1 });
  const cols = [WASH, OCHRE, '#E1CFAA', '#C99E68'];
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const y = -6 + i * 9.5, h = 3.4 + ((i * 5 + (s > 0 ? 2 : 0)) % 3) * .7, x = s < 0 ? -10.1 : 2.6, sx = 7.5, sy = 9; const col = cols[(i + (s > 0 ? 1 : 0)) % 4];
    S.box(x, y, 0, sx, sy, h, col, { tex: 'mudbrick', seed: i * 2 + (s > 0), top: shade(col, .82), paint: (c, St, f, cc) => { const n = St.normal(f.pts); if (Math.abs(n[0]) < .9 || n[0] * s > 0) return;
      doorM(c, St, f, cc, .32, 1.0, 1.95, i % 2 ? RED : '#3E6E8E'); grilleM(c, St, f, cc, .74, h - 1.2, .8, .5); if (h > 4) grilleM(c, St, f, cc, .52, h - 1.1, .5, .45);
      const [W, Hh] = fdim(f); const a0 = St.uv(f, .5, 1), a1 = St.uv(f, .5, 1 - .5 / Hh); const g0 = c.createLinearGradient(a0[0], a0[1], a1[0], a1[1]); g0.addColorStop(0, 'rgba(80,40,20,.5)'); g0.addColorStop(1, 'rgba(80,40,20,0)'); c.fillStyle = g0; c.fillRect(-50, -50, 2100, 1200);   // roofline shadow
      const r2 = rng(i * 7 + (s > 0)); for (let m = 0; m < 3; m++) { const u = .1 + r2() * .8, v = .1 + r2() * .6; const P = spline(Array.from({ length: 11 }, (_, j) => { const a = j / 11 * 6.283; return St.uv(f, u + Math.cos(a) * (.03 + r2() * .04), v + Math.sin(a) * (.05 + r2() * .06)); }), true, 3); c.save(); c.globalAlpha = .35; poly(c, P, m % 2 ? shade(cc, 1.08) : shade(cc, .9)); c.restore(); }   // faint plaster stains
      } });
    if (i % 2 === 0 && i < 4) S.sprite([s < 0 ? x + sx + .1 : x - .1, y + 4, h - .9], (c, px, py, kk) => { const w = .33 * kk, hh = .3 * kk; c.strokeStyle = '#4A3424'; c.lineWidth = 3; c.beginPath(); c.moveTo(px - w * .7, py); c.lineTo(px, py - 1.1 * kk); c.lineTo(px + w * .7, py); c.stroke(); poly(c, [[px - w, py], [px + w, py], [px + w * .8, py + hh], [px - w * .8, py + hh]], '#C29A52', true, 2.2); for (let f2 = 0; f2 < 5; f2++) { c.fillStyle = ['#C0453A', '#E3C25A', '#3F8A5A'][f2 % 3]; c.beginPath(); c.arc(px - w * .6 + f2 * w * .3, py - w * .12, w * .17, 0, 7); c.fill(); } c.fillStyle = '#A88040'; c.beginPath(); c.ellipse(px, py, w, w * .2, 0, 0, 7); c.fill(); inkLine(c, Array.from({ length: 17 }, (_, j) => [px + Math.cos(j / 16 * 6.283) * w, py + Math.sin(j / 16 * 6.283) * w * .2]), 2, { closed: true }); c.strokeStyle = '#8A6A32'; c.lineWidth = 1.4; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(px - w * (1 - k * .05), py + hh * k / 4); c.lineTo(px + w * (1 - k * .05), py + hh * k / 4); c.stroke(); } for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(px + k * w * .35, py); c.lineTo(px + k * w * .3, py + hh); c.stroke(); } });   // woven basket hung from a beam
    // parapet + palm-rib canopy on some roofs
    const t = .3, ph = .55; S.box(x, y, h, sx, t, ph, col, { shadow: false, bias: -1 }); S.box(s < 0 ? x + sx - t : x, y + t, h, t, sy - t, ph, col, { shadow: false, bias: -1 });
    if ((i + (s > 0)) % 2 === 0) { const cx0 = s < 0 ? x + sx - 3.6 : x + .4; for (const [px, py] of [[cx0, y + 1], [cx0 + 3, y + 1], [cx0, y + 5], [cx0 + 3, y + 5]]) S.box(px, py, h, .16, .16, 1.9, '#7A5634', { shadow: false });
      S.quad([cx0 - .3, y + .7, h + 1.9], [cx0 + 3.5, y + .7, h + 1.9], [cx0 + 3.5, y + 5.5, h + 1.9], [cx0 - .3, y + 5.5, h + 1.9], '#B89A5A', { twoSided: true, paint: (c, St, f) => { for (let k = 0; k < 18; k++) { const a = St.uv(f, k / 18, 0), b = St.uv(f, k / 18, 1); c.strokeStyle = '#7A6436'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } } }); }
    // outside stair up to the roof on alternate houses
    if (i % 3 === 1) for (let k = 0; k < 6; k++) S.box(s < 0 ? x + sx : x - .9, y + sy - 1 - k * .55, 0, .9, .55, h * (k + 1) / 6.5, shade(col, .95), { shadow: false, inkK: .07 });
    if (i % 3 === 0) S.sprite([s * 2.1, y + 2, 0], (c, px, py, kk) => { const ty = (i + (s > 0 ? 1 : 0) * 2) % 4; jarSprite(c, px, py, (.75 + (ty % 2) * .3) * kk, ['#A35E36', '#B86C40', '#8E6A50', '#C9A06A'][ty], ty); });
  }
  // laundry lines strung across the street
  for (const y of [6, 23]) S.sprite([0, y, 4.2], (c, px, py, k) => { const a = S.P([-2.6, y, 4.3]), b = S.P([2.6, y, 4.3]); c.strokeStyle = '#4A3A2A'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + .5 * k, b[0], b[1]); c.stroke(); const r = rng(y); for (let i = 1; i < 6; i++) { const t = i / 6, qx = a[0] + (b[0] - a[0]) * t, qy = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * .45 * k; poly(c, [[qx - .3 * k, qy], [qx + .3 * k, qy], [qx + .28 * k, qy + (.6 + r() * .5) * k], [qx - .3 * k, qy + (.6 + r() * .5) * k]], ['#F1EADB', '#C0453A', '#3E6E8E', '#E3C25A'][i % 4], true, 1.5); } });
  for (const [x, y, sd, pose] of [[-1, 12, 3, 'carry'], [1.2, 20, 5, 'stand'], [-.6, 30, 8, 'stand']]) S.sprite([x, y, 0], (c, px, py, k) => egPerson(c, px, py, 1.7 * k, { seed: sd, pose, flip: x > 0 }));
  S.groundDetail(ctx, { col: '#C2A076', seed: 9, count: 150, far: 60, tufts: false });
  S.render(ctx);
  jarSprite(ctx, 95, 1092, 190, '#B06238', 1); ctx.save(); ctx.fillStyle = 'rgba(70,35,15,.22)'; ctx.beginPath(); ctx.moveTo(1545, 330); ctx.lineTo(1920, 230); ctx.lineTo(1920, 430); ctx.lineTo(1545, 480); ctx.closePath(); ctx.fill(); ctx.restore();   // awning shadow on the right wall
  stoneBlock(ctx, 1770, 1080, 240, 90, 50, '#B9956A', 11); wovenBasket(ctx, 1640, 1060, 70, ['#C0453A', '#E3C25A', '#3F8A5A']);
  brushTexture(ctx, .22); warmGrade(ctx);
};

SETS.nile = (ctx, o = {}) => { // the Nile at Thebes at dusk: flat posterised sky bands, inked far bank, cel-banded water with inked ripples
  const H = 520;
  const bands = [[0, '#40528A'], [.3, '#6E6290'], [.52, '#B07C8E'], [.72, '#E2A07E'], [.88, '#F6C48C']]; const r0 = rng(12);
  for (const [t, c] of bands) { const y = t * H; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H + 10); ctx.lineTo(0, y); for (let x = 0; x <= 1920; x += 160) ctx.quadraticCurveTo(x + 80, y + (r0() - .5) * 18, x + 160, y + (r0() - .5) * 8); ctx.lineTo(1920, H + 10); ctx.closePath(); ctx.fill(); }
  const sx = 1240, sy = H - 120;
  for (const [rr, c] of [[170, 'rgba(255,214,160,.35)'], [110, 'rgba(255,226,180,.45)']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(sx, sy, 62, 0, 7); ctx.fillStyle = '#FFE9B8'; ctx.fill(); inkLine(ctx, Array.from({ length: 33 }, (_, i) => [sx + Math.cos(i / 32 * 6.283) * 62, sy + Math.sin(i / 32 * 6.283) * 62]), 3, { closed: true, col: '#E79A5E' });
  clouds(ctx, [[400, 220, 100, 3], [1000, 160, 80, 8], [1500, 300, 220, 4, 'streak'], [700, 360, 260, 6, 'streak']], '#F6C9A6', '#C98A86');
  ridge(ctx, H - 10, 150, '#7E5A6A', 3, { cliffs: true, ink: 3, inkCol: '#3A2A36' });
  ridge(ctx, H, 26, '#5E4A52', 8, { ink: 3, inkCol: '#2E2230' });
  for (let x = -20; x < 1940; x += 55 + (x * 7 % 50)) datePalm(ctx, x, H + 6, 80 + (x % 70), x % 13, { leaf: '#6A6474', dates: false, ink: '#2E2230', trunk: ['#7A6670', '#5A4A56'], lw: 3 });
  for (let i = 0; i < 7; i++) { const x = 340 + i * 26; poly(ctx, [[x, H + 6], [x + 14, H + 6], [x + 14, H - 70], [x, H - 70]], i % 2 ? '#9C6E62' : '#B07C68', '#2E2230', 3); poly(ctx, [[x - 6, H - 70], [x + 20, H - 70], [x + 16, H - 82], [x - 2, H - 82]], '#9C6E62', '#2E2230', 3); }
  poly(ctx, [[326, H - 82], [530, H - 82], [530, H - 92], [326, H - 92]], '#8E6258', '#2E2230', 3);
  // water: flat cel bands, a stylised reflection column under the sun, inked ripple strokes
  const wb = [[0, '#C8907E'], [.12, '#9A7088'], [.32, '#6E6488'], [.6, '#4A5480'], [.85, '#384872']]; const r = rng(4);
  for (const [t, c] of wb) { const y = H + t * (1080 - H); ctx.fillStyle = c; ctx.fillRect(0, y, 1920, 1080 - y); }
  ctx.fillStyle = 'rgba(60,40,60,.35)'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(1920, H); ctx.lineTo(1920, H + 40); for (let x = 1920; x >= 0; x -= 60) ctx.lineTo(x, H + 30 + Math.sin(x * .05) * 10); ctx.closePath(); ctx.fill();   // flat reflection of the bank
  for (let i = 0; i < 24; i++) { const y = H + 22 + i * 18 + i * i * .55 + (r() - .5) * 8, span = 50 + i * 10, pieces = 1 + Math.floor(r() * 3); ctx.globalAlpha = clamp(1 - i / 30, .25, 1); for (let k = 0; k < pieces; k++) { const w = span * (.2 + r() * .45) * (1 - i / 40), x = sx - span / 2 + r() * span; ctx.fillStyle = r() > .4 ? '#FBD9A0' : '#FFE9B8'; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w, Math.max(2, 5 - i * .12), 3); ctx.fill(); } } ctx.globalAlpha = 1;   // sun glitter, broken and tapering
  for (let i = 0; i < 46; i++) { const y = H + 30 + Math.pow(r(), 1.3) * 540, x = r() * 1920, l = 26 + (y - H) * .14; inkLine(ctx, [[x, y], [x + l / 2, y - 3 - (y - H) * .006], [x + l, y]], 1.6 + (y - H) / 280, { col: '#2A2848' }); }
  inkLine(ctx, [[0, H + 5], [1920, H + 5]], 3, { col: '#2E2230' });
  feluccaSprite(ctx, 1450, 640, 12, { crew: false }); feluccaSprite(ctx, 700, 760, 30);
  reeds(ctx, -10, 560, 1085, 260, 3, '#4E6234'); datePalm(ctx, 1770, 1090, 760, 9, { leaf: '#4E5440', lean: -.12, trunk: ['#8A6A5A', '#4A3640'], ink: '#221A22', dateCol: ['#8A4A32', '#6E3A2A'] }); reeds(ctx, 1450, 1930, 1085, 200, 7, '#4E6234');
  brushTexture(ctx, .2); warmGrade(ctx, .6);
};

// ---------- map: Egypt from Natural Earth (no modern lakes/dams/canals), reference map style ----------
let EGEO = null; async function loadEgypt() { if (!EGEO) EGEO = await (await fetch('../data/egypt.json')).json(); return EGEO; }
const EMAP = { lon0: 21.04, lat1: 32.8, kx: 108 * Math.cos(27 * Math.PI / 180), ky: 108 };
function exy(lon, lat) { return [(lon - EMAP.lon0) * EMAP.kx, (EMAP.lat1 - lat) * EMAP.ky]; }
const onBox = p => p[0] <= 21.001 || p[0] >= 40.999 || p[1] <= 18.001 || p[1] >= 35.499;
function coastPath(g, rings) { for (const ring of rings) { if (ring.length < 15) continue; let pen = false; for (let i = 0; i < ring.length; i++) { const p = ring[i], q = exy(p[0], p[1]); const prev = ring[i - 1]; if (!pen || (prev && onBox(prev) && onBox(p))) { g.moveTo(q[0], q[1]); pen = true; } else g.lineTo(q[0], q[1]); } } }
function offsetRibbon(pts, wFn) { const L = [], R = []; for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = wFn(pts[i], i); L.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); R.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); } return [...L, ...R.reverse()]; }
function smoothPts(P, n = 2) { for (let k = 0; k < n; k++) P = P.map((p, i) => i === 0 || i === P.length - 1 ? p : [(P[i - 1][0] + 2 * p[0] + P[i + 1][0]) / 4, (P[i - 1][1] + 2 * p[1] + P[i + 1][1]) / 4]); return P; }
SETS.map = (ctx, o = {}) => {
  const G = EGEO;
  ctx.fillStyle = '#5E9DCF'; ctx.fillRect(0, 0, 1920, 1080);
  const r = rng(3); for (let i = 0; i < 120; i++) { const x = r() * 1920, y = r() * 1080; ctx.strokeStyle = 'rgba(230,245,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 9, y - 5, x + 18, y); ctx.quadraticCurveTo(x + 27, y + 5, x + 36, y); ctx.stroke(); }
  const land = g => { for (const ring of G.land) { ring.forEach((p, i) => { const q = exy(p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); } };
  ctx.save(); ctx.beginPath(); coastPath(ctx, G.land); ctx.lineWidth = 46; ctx.strokeStyle = 'rgba(190,225,245,.7)'; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); land(ctx); ctx.fillStyle = '#EAD59F'; ctx.fill(); ctx.clip();
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .35; ctx.drawImage(paperTexture(), 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(150,112,55,.32)'; for (let y = 0; y < 1080; y += 12) for (let x = (y / 12 % 2) * 6; x < 1920; x += 12) { ctx.beginPath(); ctx.arc(x, y, 2.3, 0, 7); ctx.fill(); }
  ctx.beginPath(); coastPath(ctx, G.land); ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(150,110,60,.45)'; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  const main = smoothPts(G.nile[1].map(p => exy(p[0], p[1])));   // Aswan → apex of the Delta
  const south = smoothPts(G.nile[0].map(p => exy(p[0], p[1])));
  const ros = smoothPts(G.rivers[0].map(p => exy(p[0], p[1]))), dam = smoothPts(G.rivers[4].map(p => exy(p[0], p[1])));
  const apex = exy(31.24, 30.1);
  // the Delta fan: apex → Rosetta mouth → along the real coast → Damietta mouth
  const coast = G.land[0].filter(p => p[1] > 30.9 && p[0] > 30.25 && p[0] < 31.95).sort((a, b) => a[0] - b[0]).map(p => exy(p[0], p[1]));
  const deltaPoly = [apex, ...coast, apex];
  const mottle = (clipFn, col) => { ctx.save(); ctx.beginPath(); clipFn(); ctx.clip(); const rr = rng(17); for (let i = 0; i < 70; i++) { const x = rr() * 1920, y = rr() * 1080, R = 20 + rr() * 70; const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, rr() > .5 ? 'rgba(255,250,230,.22)' : 'rgba(90,60,20,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2); } ctx.restore(); };
  if (o.regions !== false) {
    const lower = wobble([exy(29.4, 31.55), ...coast.filter((_, i) => i % 3 === 0), exy(32.5, 31.3), exy(32.2, 30.4), exy(31.5, 29.55), exy(30.9, 29.55), exy(29.8, 30.4)], 4, 9);
    const region = (pts, col) => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = shade(col, .55); ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = '#FFF8EA'; ctx.stroke(); ctx.globalAlpha = .9; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
      mottle(() => { pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); }, col); };
    region(lower, o.lowerCol || '#6FA95A');
    // Upper Egypt: the valley from Memphis to Aswan as a round-joined buffer (no self-crossing), tapered at the south end
    const up = smoothPts(main.filter(q => { const lat = EMAP.lat1 - q[1] / EMAP.ky; return lat < 29.55 && lat > 24.0; }), 4); const col = o.upperCol || '#D9A542';
    const strokeUp = (wAdd, c2, taper) => { ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = c2; for (let i = 0; i < up.length - 1; i++) { const t = i / (up.length - 1); const w = (44 + 14 * Math.sin(i * .17) * (t < .75 ? 1 : .4) - (t > .7 ? 14 * (t - .7) / .3 : 0) + wAdd) * (t > .93 ? 1 - (t - .93) * 9 : 1) * (t < .03 ? .5 + t * 16 : 1); ctx.lineWidth = Math.max(6, w); ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(...up[i]); ctx.lineTo(...up[i + 1]); ctx.stroke(); } };
    strokeUp(14, shade(col, .55)); strokeUp(7, '#FFF8EA'); strokeUp(0, col);
    { const t0 = rng(9); ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.restore(); }
  }
  // green cultivation: variable-width valley strip + Faiyum + Delta
  ctx.fillStyle = '#86AE5A'; ctx.beginPath(); offsetRibbon(main, (q, i) => 9 + 6 * Math.abs(Math.sin(i * .13)) + (i > main.length * .8 ? 4 : 0)).forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); inkLine(ctx, offsetRibbon(main, (q, i) => 9 + 6 * Math.abs(Math.sin(i * .13)) + (i > main.length * .8 ? 4 : 0)), 1.6, { closed: true, col: '#4E7A34' });
  const fay = [[30.55, 29.5], [30.75, 29.55], [31.0, 29.45], [31.05, 29.3], [30.95, 29.15], [30.8, 29.1], [30.62, 29.2], [30.5, 29.35]].map(p => exy(...p)); blob(ctx, g => { g.moveTo(...fay[0]); spline(fay).forEach(q => g.lineTo(...q)); }, '#86AE5A', { lw: 2.2, ink: '#4E7A34' });
  const qar = [[30.42, 29.47], [30.55, 29.52], [30.72, 29.5], [30.85, 29.47], [30.72, 29.44], [30.55, 29.44]].map(p => exy(...p)); poly(ctx, spline(qar), '#6FAAD8', '#2E5E8E', 2);   // Birket Qarun
  poly(ctx, deltaPoly, '#86AE5A', '#4E7A34', 2);
  ctx.save(); ctx.beginPath(); deltaPoly.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.clip(); ctx.strokeStyle = 'rgba(70,110,50,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(apex[0], apex[1]); ctx.quadraticCurveTo(apex[0] - 60 + i * 20, apex[1] - 60, apex[0] - 100 + i * 28, apex[1] - 160); ctx.stroke(); } ctx.restore();
  for (const [L, w] of [[main, 7], [south, 7], [ros, 5], [dam, 5]]) { inkLine(ctx, L, w + 3, { col: '#2E5E8E' }); ctx.beginPath(); L.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.lineWidth = w - 1; ctx.strokeStyle = '#6FAAD8'; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); coastPath(ctx, G.land); ctx.lineWidth = 5.5; ctx.strokeStyle = '#5E4426'; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  for (const ring of G.land) if (ring.length < 15) { ctx.beginPath(); ring.forEach((p, i) => { const q = exy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.lineWidth = 2; ctx.stroke(); }
  brushTexture(ctx, .18);
};
function mapLabelE(ctx, text, lon, lat, size = 34, col = '#FFF8EA', dx = 0, dy = 0) { const [x, y] = exy(lon, lat); ctx.save(); ctx.font = `700 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * .28; ctx.strokeStyle = '#2A1E14'; ctx.strokeText(text, x + dx, y + dy); ctx.fillStyle = col; ctx.fillText(text, x + dx, y + dy); ctx.restore(); }
function cityDot(ctx, lon, lat) { const [x, y] = exy(lon, lat); ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fillStyle = '#FFF8EA'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2A1E14'; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fillStyle = '#2A1E14'; ctx.fill(); }
function pyramidIcon(ctx, x, y, s = 120) { // three Giza pyramids with courses, lit left face + shaded right face
  for (const [dx, sc] of [[-s * .8, .55], [-s * .36, .8], [s * .2, 1]]) { const h = s * sc, b = h * .78, X = x + dx;
    poly(ctx, [[X - b, y], [X, y - h], [X + b * .25, y]], '#EBCF96'); poly(ctx, [[X + b * .25, y], [X, y - h], [X + b, y]], '#B88E58');
    ctx.strokeStyle = 'rgba(90,60,30,.5)'; ctx.lineWidth = 1.5; for (let i = 1; i < 7; i++) { const t = i / 7, yy = y - h * t; ctx.beginPath(); ctx.moveTo(X - b * (1 - t), yy); ctx.lineTo(X + b * .25 * (1 - t), yy); ctx.lineTo(X + b * (1 - t), yy); ctx.stroke(); }
    inkLine(ctx, [[X - b, y], [X, y - h], [X + b, y]], 5.5, { closed: true }); inkLine(ctx, [[X, y - h], [X + b * .25, y]], 3.5); }
}
SETS.mapLabelled = (ctx, o = {}) => {
  SETS.map(ctx, o);
  const g = exy(31.13, 29.98); pyramidIcon(ctx, g[0] - 120, g[1] + 20, 84);
  for (const [n, lo, la, dx, dy] of [['Memphis', 31.25, 29.85, 125, 30], ['Thebes', 32.65, 25.7, 105, 0], ['Alexandria', 29.9, 31.2, -40, -42], ['Amarna', 30.9, 27.65, -125, 0], ['Aswan', 32.9, 24.09, 100, 0]]) { cityDot(ctx, lo, la); mapLabelE(ctx, n, lo, la, 30, '#FFF8EA', dx, dy); }
  mapLabelE(ctx, 'MEDITERRANEAN SEA', 27.5, 32.4, 40, '#E8F4FB'); mapLabelE(ctx, 'RED SEA', 36.2, 25.2, 40, '#E8F4FB');
  mapLabelE(ctx, 'LOWER EGYPT', 31.0, 30.95, 30); mapLabelE(ctx, 'UPPER EGYPT', 34.2, 26.6, 32);
};

// ---------- characters placed in sets (shadow along the set's sun) ----------
function charInSet(ctx, ch, o, sun = [.6, -.25]) {
  const H = o.s * 7.3; const lift = ctx.createRadialGradient(o.x, o.y - H * .5, H * .2, o.x, o.y - H * .5, H * 1.2); lift.addColorStop(0, 'rgba(245,232,208,.28)'); lift.addColorStop(1, 'rgba(245,232,208,0)'); ctx.fillStyle = lift; ctx.fillRect(o.x - H * 1.3, o.y - H * 1.8, H * 2.6, H * 2);
  const c = tmpCanvas(1920, 1080), g = c.getContext('2d'); g.clearRect(0, 0, 1920, 1080); drawCharacter(g, ch, { ...o, shadow: false });
  g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(110,60,30)'; g.fillRect(0, 0, 1920, 1080);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .36; ctx.translate(o.x, o.y); ctx.transform(1, 0, -sun[0], -sun[1], 0, 0); ctx.translate(-o.x, -o.y); ctx.drawImage(c, 0, 0); ctx.restore(); freeCanvas(c);
  ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#4A2A18'; ctx.beginPath(); ctx.ellipse(o.x, o.y + o.s * .05, o.s * 1.3, o.s * .36, 0, 0, 7); ctx.fill(); ctx.restore();
  drawCharacter(ctx, ch, { ...o, shadow: false });
}
window.EXTRA = {
  gizachars: ctx => { charInSet(ctx, CAST.KHUFU, { x: 1260, y: 1010, s: 62, eyes: 'proud', mouth: 'smile', armR: 'point', armL: 'hip', t: 0 }, [.75, .2]); charInSet(ctx, CAST.WORKER_EG, { x: 620, y: 1030, s: 58, flip: true, eyes: 'worried', mouth: 'open', armL: 'palmUp', armR: 'down', sweat: true, t: 0 }, [.75, .2]); },
  luxorchars: ctx => { charInSet(ctx, CAST.RAMESSES, { x: 760, y: 1020, s: 64, eyes: 'proud', mouth: 'smile', armR: 'raise', armL: 'hip', t: 0 }, [.9, -.25]); charInSet(ctx, CAST.SOLDIER, { x: 1330, y: 1030, s: 58, flip: true, eyes: 'neutral', mouth: 'flat', armL: 'hold', armR: 'down', t: 0 }, [.9, -.25]); },
};
