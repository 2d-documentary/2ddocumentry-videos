// chars.js — long-form house puppet (v2): oval grey head, ~1:2.6 proportions,
// layered clothing with folds and soft + cel shading, five-finger hands.
// Units: origin at feet centre, y negative = up. Head centre at y = -6.15.
'use strict';
const SKIN = '#D6D5DC', SKIN_SH = '#A4A3B0', SKIN_HI = '#F2F1F5';
const HY = -6.15;              // head centre
const SH_Y = -4.78;            // shoulder joint height
const L1 = 1.38, L2 = 1.22;    // upper arm, forearm

function headPath(c) {
  c.moveTo(0, HY - 1.02);
  c.bezierCurveTo(.62, HY - 1.04, .92, HY - .62, .9, HY - .05);
  c.bezierCurveTo(.88, HY + .5, .62, HY + .98, 0, HY + 1.0);
  c.bezierCurveTo(-.62, HY + .98, -.88, HY + .5, -.9, HY - .05);
  c.bezierCurveTo(-.92, HY - .62, -.62, HY - 1.04, 0, HY - 1.02); c.closePath();
}
function robePath(c, ch) {
  const sw = ch.build === 'stout' ? 1.3 : 1.1, hw = ch.build === 'stout' ? 1.6 : 1.28, ww = ch.build === 'stout' ? 1.28 : .9;
  c.moveTo(-.38, -5.12);
  c.quadraticCurveTo(-sw * .8, -5.12, -sw, -4.72);
  c.bezierCurveTo(-sw * 1.12, -4.2, -ww * 1.05, -3.6, -ww, -3.15);
  c.bezierCurveTo(-ww * 1.05, -2.2, -hw * .95, -1.0, -hw, -.08);
  for (let i = 1; i <= 6; i++) { const x = -hw + 2 * hw * i / 6; c.quadraticCurveTo(x - hw / 6, (i % 2 ? .1 : -.02), x, -.06); }
  c.bezierCurveTo(hw * .95, -1.0, ww * 1.05, -2.2, ww, -3.15);
  c.bezierCurveTo(ww * 1.05, -3.6, sw * 1.12, -4.2, sw, -4.72);
  c.quadraticCurveTo(sw * .8, -5.12, .38, -5.12); c.closePath();
}

// soft + cel shading inside a path: gradient (light from upper-left), hard cel shadow on the right
function paint(ctx, pathFn, base, lw, o = {}) {
  ctx.save(); ctx.beginPath(); pathFn(ctx); ctx.clip();
  const b = o.bounds || [-2, -8, 2, 0.3];
  const g = ctx.createLinearGradient(b[0], b[1], b[2], b[3]); g.addColorStop(0, shade(base, 1.1)); g.addColorStop(.55, base); g.addColorStop(1, shade(base, .86));
  ctx.fillStyle = g; ctx.fillRect(b[0] - 2, b[1] - 2, b[2] - b[0] + 4, b[3] - b[1] + 4);
  if (o.cel !== false) { ctx.translate(o.dx ?? .38, o.dy ?? .12); ctx.beginPath(); ctx.rect(-50, -50, 100, 100); pathFn(ctx); ctx.fillStyle = shade(base, .7); ctx.globalAlpha = .9; ctx.fill('evenodd'); }
  ctx.restore();
  if (lw > 0) { ctx.beginPath(); pathFn(ctx); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function folds(ctx, lines, col, lw) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; for (const l of lines) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.quadraticCurveTo(l[2], l[3], l[4], l[5]); ctx.stroke(); } ctx.restore(); }

// ---------- hands (five fingers) ----------
function drawHand(ctx, type, lw, mir) {
  ctx.save(); if (mir) ctx.scale(1, -1);
  const cap = (x1, y1, x2, y2, w) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineCap = 'round'; ctx.lineWidth = w + lw * 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = SKIN; ctx.stroke(); };
  const palm = () => { ctx.beginPath(); ctx.roundRect(-.02, -.24, .44, .46, .14); ctx.fillStyle = SKIN; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = SKIN_SH; ctx.globalAlpha = .7; ctx.fillRect(-.1, .08, .7, .3); ctx.restore(); };
  if (type === 'open') {
    for (let i = 0; i < 4; i++) { const y = -.17 + i * .115, len = [.3, .36, .34, .27][i]; cap(.38, y, .38 + len, y + (i - 1.5) * .03, .1); }
    cap(.12, -.2, .3, -.42, .11); palm();
    ctx.lineWidth = lw * .5; ctx.strokeStyle = SKIN_SH; ctx.beginPath(); ctx.moveTo(.08, .0); ctx.quadraticCurveTo(.2, .08, .3, -.05); ctx.stroke();
  } else {
    palm();
    if (type === 'point') cap(.4, -.17, .82, -.19, .1);
    if (type === 'thumb') cap(.18, -.2, .2, -.56, .11);
    for (let i = 0; i < (type === 'point' ? 3 : 4); i++) { const y = (type === 'point' ? -.06 : -.17) + i * .115; ctx.beginPath(); ctx.ellipse(.43, y, .09, .062, 0, 0, 7); ctx.fillStyle = SKIN; ctx.fill(); ctx.lineWidth = lw * .8; ctx.strokeStyle = INK; ctx.stroke(); }
    if (type !== 'thumb') { ctx.beginPath(); ctx.ellipse(.28, -.2, .12, .07, -.3, 0, 7); ctx.fillStyle = SKIN; ctx.fill(); ctx.lineWidth = lw * .8; ctx.stroke(); }
  }
  ctx.restore();
}

// ---------- arms ----------
const ARMS = { // a1: shoulder angle from straight-down (outward +); a2: elbow bend added
  down: { a1: 7, a2: -3, hand: 'open', handRot: 10 }, hip: { a1: 40, a2: -112, hand: 'fist', k2: .62 }, point: { a1: 92, a2: 4, hand: 'point' },
  pointUp: { a1: 150, a2: 18, hand: 'point' }, raise: { a1: 145, a2: 25, hand: 'open' }, palmUp: { a1: 28, a2: 52, hand: 'open', handRot: -55, k2: .85 },
  thumb: { a1: 25, a2: 112, hand: 'thumb' }, hold: { a1: -6, a2: -82, hand: 'fist', k2: .8 }, chin: { a1: -4, a2: -150, hand: 'fist', k2: .9 },
  wave: { a1: 120, a2: 40, hand: 'open' }, tool: { a1: 14, a2: 48, hand: 'fist', k2: .85, prop: 'mallet' },
};
let ch_sw = .9;
function armGeom(side, A, t) {
  const sx = side, wob = A.wob ? Math.sin(t * A.wob) * 8 : 0;
  const d = Math.PI / 180, a1 = (A.a1 + wob) * d, a2 = (A.a1 + A.a2 + wob * 1.5) * d;
  const s = [(ch_sw || .9) * sx, SH_Y + .18];
  const e = [s[0] + Math.sin(a1) * L1 * sx, s[1] + Math.cos(a1) * L1];
  const L2k = L2 * (A.k2 || 1); const w = [e[0] + Math.sin(a2) * L2k * sx, e[1] + Math.cos(a2) * L2k];
  return { s, e, w, dir: Math.atan2(w[1] - e[1], w[0] - e[0]) };
}
function drawArm(ctx, ch, side, pose, lw, t) {
  const A = typeof pose === 'string' ? ARMS[pose] : pose; ch_sw = ch.build === 'stout' ? 1.05 : .88; const g = armGeom(side, A, t);
  const sleeve = ch.bareArms ? SKIN : (ch.sleeve || ch.robe);
  const seg = (p, q, w1, w2, col) => {
    const ang = Math.atan2(q[1] - p[1], q[0] - p[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
    const path = c => { c.moveTo(p[0] + nx * w1, p[1] + ny * w1); c.lineTo(q[0] + nx * w2, q[1] + ny * w2); c.arc(q[0], q[1], w2, ang + Math.PI / 2, ang - Math.PI / 2, true); c.lineTo(p[0] - nx * w1, p[1] - ny * w1); c.arc(p[0], p[1], w1, ang - Math.PI / 2, ang + Math.PI / 2, true); c.closePath(); };
    paint(ctx, path, col, lw, { bounds: [p[0] - 1, p[1] - 1, q[0] + 1, q[1] + 1], dx: .1 * side, dy: .1 });
  };
  seg(g.s, g.e, .34, .29, sleeve);
  folds(ctx, [[lerp(g.s[0], g.e[0], .55) - .12, lerp(g.s[1], g.e[1], .55), lerp(g.s[0], g.e[0], .6), lerp(g.s[1], g.e[1], .6) + .05, lerp(g.s[0], g.e[0], .65) + .12, lerp(g.s[1], g.e[1], .65)]], shade(sleeve, .6), lw * .45);
  if (ch.rolled) { seg(g.e, g.w, .26, .21, SKIN); ctx.save(); ctx.translate(g.e[0], g.e[1]); ctx.rotate(g.dir); inkFill(ctx, c => c.roundRect(-.16, -.4, .32, .8, .12), shade(sleeve, .92), lw); ctx.restore(); }
  else { seg(g.e, g.w, .32, .36, sleeve); ctx.save(); ctx.translate(g.w[0], g.w[1]); ctx.rotate(g.dir); inkFill(ctx, c => c.roundRect(-.14, -.33, .2, .66, .08), ch.cuff || shade(sleeve, .8), lw); ctx.restore(); }
  if (A.prop === 'spear' || ch.prop === 'spear' && side > 0 && A.hand === 'fist') { ctx.save(); ctx.translate(g.w[0], g.w[1]); inkFill(ctx, c => c.roundRect(-.06, -3.4, .12, 5.0, .05), '#8A6440', lw * .8); inkFill(ctx, c => { c.moveTo(0, -3.95); c.lineTo(.17, -3.35); c.lineTo(-.17, -3.35); c.closePath(); }, '#B8B8C0', lw * .8); ctx.restore(); }
  if (ch.prop === 'crook' && side < 0 && A.hand === 'fist') { ctx.save(); ctx.translate(g.w[0], g.w[1]); ctx.rotate(-.35); for (let i = 0; i < 6; i++) inkFill(ctx, c => c.rect(-.07, -1.0 + i * .3, .14, .3), i % 2 ? '#2F5FA8' : '#D9B24E', lw * .5); ctx.lineWidth = .14; ctx.strokeStyle = '#D9B24E'; ctx.beginPath(); ctx.arc(.25, -1.0, .25, Math.PI, Math.PI * 2.2); ctx.stroke(); ctx.lineWidth = lw * .7; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  if (A.prop === 'mallet') { ctx.save(); ctx.translate(g.w[0], g.w[1]); ctx.rotate(g.dir); inkFill(ctx, c => c.roundRect(.15, -.07, .14, 1.3, .05), '#8A5A33', lw); inkFill(ctx, c => c.roundRect(-.05, -.75, .55, .5, .08), '#9C8F80', lw); ctx.restore(); }
  if (A.hand !== 'none') { ctx.save(); ctx.translate(g.w[0], g.w[1]); ctx.rotate(g.dir + (A.handRot || 0) * Math.PI / 180 * side); ctx.scale(.95, .95); drawHand(ctx, A.hand, lw / .95, side < 0); ctx.restore(); }
  return g;
}

// ---------- face ----------
let CUR_KOHL = false;
function drawEyes(ctx, kind, lw, t, blink) {
  if (CUR_KOHL && kind !== 'shock' && kind !== 'closed') { ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = .05; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * .2, HY - .1); ctx.quadraticCurveTo(s * .45, HY - .2, s * .58, HY - .16); ctx.stroke(); } ctx.restore(); }
  const ex = .34, ey = HY - .08; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.fillStyle = INK;
  if (blink && kind !== 'shock') kind = 'closed';
  const lens = (x, y, sy = 1, lid = 0) => { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, .1, .14 * sy, 0, 0, 7); ctx.clip(); ctx.fillStyle = INK; ctx.fillRect(x - .2, y - .2 + lid * .28, .4, .5); ctx.restore(); if (!lid) { ctx.beginPath(); ctx.ellipse(x + .03, y - .05, .028, .035, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); } };
  const lidLine = (x, y, w = .17) => { ctx.beginPath(); ctx.moveTo(x - w, y + .02); ctx.quadraticCurveTo(x, y - .07, x + w, y + .0); ctx.lineWidth = .055; ctx.strokeStyle = INK; ctx.stroke(); };
  const brow = (x1, y1, x2, y2, w = .085) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - .04, x2, y2); ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); };
  for (const s of [-1, 1]) {
    const x = s * ex;
    switch (kind) {
      case 'closed': ctx.beginPath(); ctx.arc(x, ey + .05, .12, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = .06; ctx.strokeStyle = INK; ctx.stroke(); brow(x - .16, ey - .3, x + .16, ey - .3, .07); break;
      case 'smug': lens(x, ey, .9, .55); lidLine(x, ey - .02); brow(x - .17, ey - .3, x + .17, ey - .36, .07); break;
      case 'angry': lens(x, ey + .02); brow(s * (ex + .22), ey - .36, s * (ex - .14), ey - .18, .1); break;
      case 'worried': lens(x, ey + .02); brow(s * (ex + .2), ey - .22, s * (ex - .12), ey - .4, .075); break;
      case 'squint': if (s < 0) { ctx.beginPath(); ctx.moveTo(x - .14, ey); ctx.lineTo(x + .14, ey - .02); ctx.lineWidth = .065; ctx.strokeStyle = INK; ctx.stroke(); brow(x - .18, ey - .2, x + .16, ey - .16, .08); } else { lens(x, ey); brow(x - .18, ey - .4, x + .2, ey - .46, .08); } break;
      case 'shock': ctx.beginPath(); ctx.ellipse(x, ey, .16, .19, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = .05; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x, ey, .04, 0, 7); ctx.fill(); brow(x - .18, ey - .38, x + .18, ey - .42, .07); break;
      case 'proud': ctx.beginPath(); ctx.arc(x, ey + .1, .13, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = .06; ctx.strokeStyle = INK; ctx.stroke(); brow(s * (ex + .18), ey - .26, s * (ex - .14), ey - .34, .075); break;
      default: lens(x, ey); lidLine(x, ey - .1, .14); brow(x - .16, ey - .32, x + .16, ey - .34, .075);
    }
  }
  ctx.beginPath(); ctx.moveTo(.04, HY + .02); ctx.quadraticCurveTo(.16, HY + .22, .02, HY + .26); ctx.lineWidth = .045; ctx.strokeStyle = shade(SKIN_SH, .6); ctx.stroke();
}
let CUR_LIPS = null;
function drawMouth(ctx, kind, talk, t, onBeard) {
  const my = HY + .5; if (CUR_LIPS && !talk && (kind === 'neutral' || kind === 'smile' || kind === 'smirk')) { ctx.save(); ctx.fillStyle = CUR_LIPS; ctx.beginPath(); ctx.ellipse(kind === 'smirk' ? .03 : 0, my + .03, .13, .055, 0, 0, 7); ctx.fill(); ctx.restore(); } if (talk) { const f = Math.floor(t * 10.5) % 3; kind = f === 0 ? 'neutral' : f === 1 ? 'open' : 'openS'; }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = .05;
  const lip = onBeard ? '#C9C5CE' : INK;
  switch (kind) {
    case 'open': case 'openS': { const w = kind === 'open' ? .2 : .15, h = kind === 'open' ? .24 : .14;
      ctx.beginPath(); ctx.moveTo(-w, my - .04); ctx.quadraticCurveTo(0, my - .08, w, my - .04); ctx.quadraticCurveTo(w, my + h, 0, my + h); ctx.quadraticCurveTo(-w, my + h, -w, my - .04); ctx.closePath();
      ctx.fillStyle = '#3A1E24'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#F4F2F2'; ctx.fillRect(-w, my - .08, 2 * w, .07); ctx.fillStyle = '#C0505E'; ctx.beginPath(); ctx.ellipse(0, my + h, w * .7, h * .4, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.strokeStyle = onBeard ? lip : INK; ctx.stroke(); break; }
    case 'smile': ctx.beginPath(); ctx.moveTo(-.18, my - .03); ctx.quadraticCurveTo(0, my + .1, .18, my - .03); ctx.strokeStyle = lip; ctx.stroke(); break;
    case 'smirk': ctx.beginPath(); ctx.moveTo(-.14, my + .02); ctx.quadraticCurveTo(.05, my + .06, .18, my - .06); ctx.strokeStyle = lip; ctx.stroke(); break;
    case 'grin': ctx.beginPath(); ctx.moveTo(-.25, my - .05); ctx.quadraticCurveTo(0, my, .25, my - .05); ctx.quadraticCurveTo(.2, my + .22, 0, my + .22); ctx.quadraticCurveTo(-.2, my + .22, -.25, my - .05); ctx.closePath(); ctx.fillStyle = '#F4F2F2'; ctx.fill(); ctx.strokeStyle = onBeard ? lip : INK; ctx.stroke(); break;
    case 'wobbly': ctx.beginPath(); ctx.moveTo(-.2, my + .03); for (let i = 1; i <= 6; i++) ctx.lineTo(-.2 + i * .067, my + (i % 2 ? -.03 : .03)); ctx.strokeStyle = lip; ctx.stroke(); break;
    case 'flat': ctx.beginPath(); ctx.moveTo(-.13, my + .02); ctx.lineTo(.13, my + .01); ctx.strokeStyle = lip; ctx.stroke(); break;
    default: ctx.beginPath(); ctx.moveTo(-.1, my + .02); ctx.quadraticCurveTo(0, my + .05, .1, my + .02); ctx.strokeStyle = lip; ctx.stroke();
  }
}

// ---------- hair / beards / hats ----------
function drawBeard(ctx, ch, lw) {
  const c = ch.beardColor || '#2E2420';
  if (ch.beard === 'full' || ch.beard === 'short') {
    const len = ch.beard === 'full' ? .55 : .25;
    const path = k => { k.moveTo(-.9, HY + .02); k.quadraticCurveTo(-.55, HY + .3, -.28, HY + .32); k.quadraticCurveTo(0, HY + .2, .28, HY + .32); k.quadraticCurveTo(.55, HY + .3, .9, HY + .02);
      k.bezierCurveTo(.92, HY + .7, .6, HY + 1.1 + len * .6, .2, HY + 1.05 + len); k.lineTo(0, HY + 1.12 + len); k.lineTo(-.2, HY + 1.05 + len); k.bezierCurveTo(-.6, HY + 1.1 + len * .6, -.92, HY + .7, -.9, HY + .02); k.closePath(); };
    paint(ctx, path, c, lw, { bounds: [-1, HY, 1, HY + 1.6], dx: .15, dy: .05 });
    ctx.save(); ctx.strokeStyle = shade(c, 1.6); ctx.lineWidth = lw * .45; for (const [x, y] of [[-.55, .55], [-.25, .75], [.3, .7], [.58, .5], [0, .95]]) { ctx.beginPath(); ctx.moveTo(x, HY + y); ctx.quadraticCurveTo(x + .04, HY + y + .14, x - .02, HY + y + .26); ctx.stroke(); } ctx.restore();
  }
  if (ch.beard === 'mustache' || ch.beard === 'goatee') {
    ctx.fillStyle = c; ctx.strokeStyle = INK; ctx.lineWidth = lw * .8;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, HY + .36); ctx.quadraticCurveTo(s * .32, HY + .24, s * .5, HY + .44); ctx.quadraticCurveTo(s * .6, HY + .56, s * .48, HY + .55); ctx.quadraticCurveTo(s * .3, HY + .46, 0, HY + .48); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (ch.beard === 'goatee') inkFill(ctx, k => { k.moveTo(-.16, HY + .72); k.quadraticCurveTo(0, HY + .66, .16, HY + .72); k.lineTo(0, HY + 1.12); k.closePath(); }, c, lw * .8);
  }
}
function drawHairBack(ctx, ch, lw) {
  if (!ch.hair) return; const c = ch.hairColor;
  const path = k => { k.moveTo(-.98, HY + .55); k.bezierCurveTo(-1.18, HY - .4, -.75, HY - 1.25, 0, HY - 1.18); k.bezierCurveTo(.75, HY - 1.25, 1.18, HY - .4, .98, HY + .55);
    for (let i = 0; i <= 5; i++) k.quadraticCurveTo(.98 - i * .39 + .2, HY + .75, .98 - (i + .5) * .39, HY + .5); k.closePath(); };
  paint(ctx, path, c, lw, { bounds: [-1.2, HY - 1.3, 1.2, HY + .8], dx: .2, dy: .1 });
}
function drawHairFront(ctx, ch, lw) {
  if (!ch.hair) return; const c = ch.hairColor;
  ctx.save(); ctx.beginPath(); headPath(ctx); ctx.clip();
  const path = k => { k.moveTo(-1.1, HY - 1.4); k.lineTo(1.1, HY - 1.4); k.lineTo(1.0, HY - .3); for (let i = 0; i < 7; i++) { const x = .95 - i * .3; k.quadraticCurveTo(x - .05, HY - .52 + (i % 2) * .08, x - .3, HY - .38 - (i % 3) * .05); } k.lineTo(-1.1, HY - .2); k.closePath(); };
  paint(ctx, path, c, lw, { bounds: [-1, HY - 1.3, 1, HY], dx: .15, dy: .05 });
  ctx.strokeStyle = shade(c, 1.5); ctx.lineWidth = lw * .45; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-.55 + i * .37, HY - .7, .13, .2, Math.PI - .2); ctx.stroke(); }
  ctx.restore(); ctx.beginPath(); headPath(ctx); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
}
function wigLongBack(ctx, ch, lw) {
  if (ch.wigLong) { paint(ctx, k => { k.moveTo(-.92, HY - .3); k.bezierCurveTo(-1.12, HY - 1.4, 1.12, HY - 1.4, .92, HY - .3); k.lineTo(1.12, HY + 1.35); k.lineTo(-1.12, HY + 1.35); k.closePath(); }, ch.hairColor || '#1E1A22', lw, { bounds: [-1.2, HY - 1.4, 1.2, HY + 1.4], dx: .14, dy: .05 });
  }
}
function egyptHeadwear(ctx, ch, lw) {
  if (ch.wigLong) for (const sd of [-1, 1]) { inkFill(ctx, k => k.arc(sd * .84, HY + .34, .08, 0, 7), '#E2B547', lw * .5); inkFill(ctx, k => k.ellipse(sd * .84, HY + .52, .06, .11, 0, 0, 7), '#2F5FA8', lw * .5); }
  const c = ch.hatColor || '#D9B24E', c2 = ch.hatColor2 || '#2F5FA8';
  const uraeus = (y) => { inkFill(ctx, k => { k.moveTo(0, y + .05); k.quadraticCurveTo(-.16, y - .2, 0, y - .38); k.quadraticCurveTo(.16, y - .2, 0, y + .05); k.closePath(); }, '#E2B547', lw * .7); inkFill(ctx, k => k.ellipse(0, y - .36, .08, .06, 0, 0, 7), '#E2B547', lw * .6); };
  if (ch.hat === 'nemes') { // striped royal headcloth: crown cap, side lappets, front lappets on the chest
    const stripes = (pathFn, b) => { ctx.save(); ctx.beginPath(); pathFn(ctx); ctx.clip(); for (let y = b[1]; y < b[3]; y += .2) { ctx.fillStyle = (Math.round((y - b[1]) / .2) % 2) ? c2 : c; ctx.fillRect(b[0], y, b[2] - b[0], .2); } ctx.fillStyle = 'rgba(40,20,10,.18)'; ctx.fillRect(.25, b[1], 3, b[3] - b[1]); ctx.restore(); ctx.beginPath(); pathFn(ctx); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); };
    for (const sd of [-1, 1]) stripes(k => { k.moveTo(sd * .78, HY - .35); k.lineTo(sd * 1.28, HY + .75); k.lineTo(sd * 1.05, HY + .95); k.lineTo(sd * .74, -4.55); k.lineTo(sd * .5, -4.6); k.lineTo(sd * .62, HY + .7); k.closePath(); }, [-1.4, HY - .5, 1.4, -4.4]);
    stripes(k => { k.moveTo(-.98, HY - .2); k.bezierCurveTo(-1.08, HY - 1.4, 1.08, HY - 1.4, .98, HY - .2); k.lineTo(.86, HY - .45); k.quadraticCurveTo(0, HY - .6, -.86, HY - .45); k.closePath(); }, [-1.1, HY - 1.4, 1.1, HY - .2]);
    inkFill(ctx, k => { k.moveTo(-.88, HY - .52); k.quadraticCurveTo(0, HY - .68, .88, HY - .52); k.lineTo(.86, HY - .4); k.quadraticCurveTo(0, HY - .56, -.86, HY - .4); k.closePath(); }, '#E2B547', lw * .7);
    uraeus(HY - .6);
  }
  if (ch.hat === 'khepresh') { // the blue war crown, dotted with gold discs
    paint(ctx, k => { k.moveTo(-.95, HY - .35); k.bezierCurveTo(-1.15, HY - 1.6, -.6, HY - 2.5, .2, HY - 2.6); k.bezierCurveTo(1.05, HY - 2.6, 1.25, HY - 1.6, .95, HY - .35); k.quadraticCurveTo(0, HY - .55, -.95, HY - .35); k.closePath(); }, '#2D57A0', lw, { bounds: [-1.2, HY - 2.6, 1.2, HY - .3], dx: .2, dy: .1 });
    ctx.save(); ctx.beginPath(); ctx.moveTo(-.95, HY - .35); ctx.bezierCurveTo(-1.15, HY - 1.6, -.6, HY - 2.5, .2, HY - 2.6); ctx.bezierCurveTo(1.05, HY - 2.6, 1.25, HY - 1.6, .95, HY - .35); ctx.closePath(); ctx.clip(); ctx.fillStyle = '#E2B547'; let rr = 0; for (let y = HY - 2.4; y < HY - .6; y += .3, rr++) for (let x = -1.0; x < 1.0; x += .3) { ctx.beginPath(); ctx.arc(x + (rr % 2) * .15, y, .055, 0, 7); ctx.fill(); } ctx.restore();
    inkFill(ctx, k => { k.moveTo(-.95, HY - .5); k.quadraticCurveTo(0, HY - .72, .95, HY - .5); k.lineTo(.95, HY - .35); k.quadraticCurveTo(0, HY - .55, -.95, HY - .35); k.closePath(); }, '#E2B547', lw * .7); uraeus(HY - .62);
  }
  if (ch.hat === 'double') { // pschent: white crown inside the red crown
    paint(ctx, k => { k.moveTo(-.55, HY - .55); k.bezierCurveTo(-.6, HY - 1.8, -.25, HY - 2.9, 0, HY - 3.0); k.bezierCurveTo(.25, HY - 2.9, .6, HY - 1.8, .55, HY - .55); k.closePath(); }, '#F1ECDF', lw, { bounds: [-.6, HY - 3, .6, HY - .5], dx: .14, dy: 0 });
    paint(ctx, k => { k.moveTo(-.98, HY - .35); k.lineTo(-1.0, HY - 1.35); k.lineTo(-.55, HY - 1.35); k.lineTo(-.45, HY - .9); k.lineTo(.45, HY - .9); k.lineTo(.62, HY - 1.35); k.lineTo(.62, HY - 2.3); k.lineTo(1.0, HY - 2.3); k.lineTo(1.0, HY - .35); k.quadraticCurveTo(0, HY - .55, -.98, HY - .35); k.closePath(); }, '#B83A30', lw, { bounds: [-1, HY - 2.3, 1, HY - .3], dx: .16, dy: .06 });
    ctx.lineWidth = .1; ctx.strokeStyle = '#D9B24E'; ctx.beginPath(); ctx.moveTo(-.45, HY - 1.0); ctx.quadraticCurveTo(-.95, HY - 1.7, -.6, HY - 1.95); ctx.arc(-.42, HY - 1.82, .18, Math.PI, Math.PI * 2.5); ctx.stroke(); uraeus(HY - .55);
  }
  if (ch.hat === 'wig' || ch.hat === 'wigDiadem') { // black bob wig with a straight fringe
    paint(ctx, k => { k.moveTo(-.86, HY - .42); k.quadraticCurveTo(0, HY - .62, .86, HY - .42); k.lineTo(.92, HY - .2); k.bezierCurveTo(1.0, HY - 1.35, -1.0, HY - 1.35, -.92, HY - .2); k.closePath(); }, ch.hairColor || '#1E1A22', lw, { bounds: [-1, HY - 1.3, 1, HY - .2], dx: .12, dy: .05 });
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = .04; for (let x = -.7; x <= .7; x += .14) { ctx.beginPath(); ctx.moveTo(x * .9, HY - 1.15); ctx.lineTo(x, HY - .5); ctx.stroke(); } ctx.restore();
    if (ch.hat === 'wigDiadem') { inkFill(ctx, k => { k.moveTo(-.9, HY - .62); k.quadraticCurveTo(0, HY - .85, .9, HY - .62); k.lineTo(.9, HY - .5); k.quadraticCurveTo(0, HY - .72, -.9, HY - .5); k.closePath(); }, '#E2B547', lw * .7); uraeus(HY - .78); }
  }
  if (ch.hat === 'khat') { // simple linen headcloth for workers
    paint(ctx, k => { k.moveTo(-.95, HY - .35); k.bezierCurveTo(-1.05, HY - 1.4, 1.05, HY - 1.4, .95, HY - .35); k.lineTo(1.1, HY + .3); k.quadraticCurveTo(1.25, HY + .5, 1.0, HY + .55); k.lineTo(.86, HY - .25); k.quadraticCurveTo(0, HY - .5, -.86, HY - .25); k.lineTo(-1.0, HY + .55); k.quadraticCurveTo(-1.25, HY + .5, -1.1, HY + .3); k.closePath(); }, c, lw, { bounds: [-1.2, HY - 1.4, 1.2, HY + .6], dx: .14, dy: .06 });
    ctx.save(); ctx.strokeStyle = shade(c, .7); ctx.lineWidth = lw * .45; ctx.beginPath(); ctx.moveTo(-.6, HY - .9); ctx.quadraticCurveTo(0, HY - 1.05, .6, HY - .9); ctx.stroke(); ctx.restore();
  }
  if (ch.hat === 'laurel') { ctx.save(); for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) { const a = Math.PI * (sd < 0 ? 1.05 + i * .1 : 1.95 - i * .1); inkFill(ctx, k => k.ellipse(Math.cos(a) * .95, HY - .25 + Math.sin(a) * .95, .16, .07, a + Math.PI / 2, 0, 7), '#6E8C3E', lw * .5); } ctx.restore(); }
  if (ch.beard === 'false') { // the pharaoh's plaited false beard
    inkFill(ctx, k => { k.moveTo(-.13, HY + .92); k.lineTo(.13, HY + .92); k.lineTo(.15, HY + 1.65); k.quadraticCurveTo(.2, HY + 1.8, 0, HY + 1.78); k.quadraticCurveTo(-.2, HY + 1.8, -.15, HY + 1.65); k.closePath(); }, ch.beardColor || '#3A2A1E', lw * .8);
    ctx.save(); ctx.strokeStyle = 'rgba(255,230,180,.35)'; ctx.lineWidth = .03; for (let y = HY + 1.02; y < HY + 1.7; y += .1) { ctx.beginPath(); ctx.moveTo(-.12, y); ctx.lineTo(.12, y + .03); ctx.stroke(); } ctx.restore();
  }
}
function drawHat(ctx, ch, lw, t) {
  egyptHeadwear(ctx, ch, lw);
  const c = ch.hatColor;
  if (ch.hat === 'chaperon') { // padded roll (mazzocchio) + cloth crown + draped tail (becchetto)
    paint(ctx, k => { k.moveTo(.55, HY - .7); k.bezierCurveTo(1.35, HY - .3, 1.45, HY + .6, 1.3, HY + 1.6); k.quadraticCurveTo(1.3, HY + 2.0, 1.0, HY + 2.1); k.bezierCurveTo(1.1, HY + 1.2, .95, HY + .1, .35, HY - .55); k.closePath(); }, shade(c, .92), lw, { bounds: [.3, HY - .8, 1.5, HY + 2.1], dx: -.12, dy: 0 });
    paint(ctx, k => { k.moveTo(-.85, HY - .95); k.bezierCurveTo(-.95, HY - 1.75, .1, HY - 2.0, .5, HY - 1.65); k.bezierCurveTo(1.0, HY - 1.8, 1.05, HY - 1.1, .85, HY - .95); k.closePath(); }, shade(c, 1.04), lw, { bounds: [-1, HY - 2, 1, HY - .9], dx: .18, dy: .1 });
    paint(ctx, k => { k.ellipse(0, HY - .82, 1.08, .36, 0, 0, 7); }, c, lw, { bounds: [-1.1, HY - 1.2, 1.1, HY - .4], dx: .15, dy: .12 });
    folds(ctx, [[-.7, HY - 1.05, -.62, HY - .82, -.7, HY - .55], [-.25, HY - 1.15, -.2, HY - .82, -.25, HY - .48], [.25, HY - 1.15, .3, HY - .82, .25, HY - .48], [.7, HY - 1.05, .78, HY - .82, .7, HY - .55]], shade(c, .62), lw * .5);
    folds(ctx, [[-.4, HY - 1.6, -.2, HY - 1.3, -.3, HY - 1.05], [.35, HY - 1.6, .45, HY - 1.3, .3, HY - 1.05]], shade(c, .7), lw * .45);
  }
  if (ch.hat === 'felt') {
    paint(ctx, k => { k.moveTo(-.98, HY - .45); k.bezierCurveTo(-1.02, HY - 1.4, 1.02, HY - 1.4, .98, HY - .45); k.quadraticCurveTo(0, HY - .62, -.98, HY - .45); k.closePath(); }, c, lw, { bounds: [-1, HY - 1.4, 1, HY - .4], dx: .14, dy: .05 });
    paint(ctx, k => k.roundRect(-1.06, HY - .64, 2.12, .25, .12), shade(c, .82), lw, { bounds: [-1, HY - .7, 1, HY - .3], cel: false });
  }
  if (ch.hat === 'scarf') {
    paint(ctx, k => { k.moveTo(-1.0, HY - .1); k.bezierCurveTo(-1.08, HY - 1.35, 1.08, HY - 1.35, 1.0, HY - .1); k.quadraticCurveTo(.6, HY - .55, 0, HY - .58); k.quadraticCurveTo(-.6, HY - .55, -1.0, HY - .1); k.closePath(); }, c, lw, { bounds: [-1, HY - 1.3, 1, HY], dx: .14, dy: .06 });
    folds(ctx, [[-.7, HY - .9, -.3, HY - 1.0, .1, HY - 1.15], [-.6, HY - .55, -.1, HY - .8, .5, HY - .85]], shade(c, .7), lw * .5);
  }
}

// ---------- costume details ----------
function costume(ctx, ch, lw) {
  const R = k => robePath(k, ch);
  const fc = shade(ch.robe, .62);
  if (!ch.kilt) folds(ctx, [[-.75, -2.9, -.95, -1.5, -.9, -.15], [-.15, -3.0, -.25, -1.6, -.3, -.1], [.45, -3.0, .55, -1.6, .65, -.1], [1.0, -2.7, 1.1, -1.4, 1.2, -.15]], fc, lw * .5);
  if (!ch.kilt) folds(ctx, [[-.9, -4.4, -.6, -4.2, -.35, -4.0], [.95, -4.4, .6, -4.15, .4, -4.0]], fc, lw * .45);
  if (ch.trim) { ctx.save(); ctx.beginPath(); R(ctx); ctx.clip(); paint(ctx, k => k.rect(-.16, -5.2, .32, 5.4), ch.trim, lw * .6, { bounds: [-.2, -5, .2, 0], cel: false }); ctx.restore(); }
  if (ch.belt) { ctx.save(); ctx.beginPath(); R(ctx); ctx.clip(); paint(ctx, k => { k.moveTo(-2, -3.3); k.quadraticCurveTo(0, -3.0, 2, -3.3); k.lineTo(2, -3.0); k.quadraticCurveTo(0, -2.7, -2, -3.0); k.closePath(); }, ch.belt, lw * .7, { bounds: [-2, -3.3, 2, -2.7], cel: false }); ctx.restore(); inkFill(ctx, k => k.roundRect(-.16, -3.22, .32, .3, .05), '#C9A24A', lw * .6); }
  if (ch.apron) {
    const ap = k => { k.moveTo(-.62, -4.55); k.lineTo(.62, -4.55); k.quadraticCurveTo(.72, -3.6, .95, -3.05); k.quadraticCurveTo(1.15, -1.4, 1.05, -.35); k.quadraticCurveTo(0, -.15, -1.05, -.35); k.quadraticCurveTo(-1.15, -1.4, -.95, -3.05); k.quadraticCurveTo(-.72, -3.6, -.62, -4.55); k.closePath(); };
    paint(ctx, ap, ch.apron, lw, { bounds: [-1, -4.6, 1, 0], dx: .25, dy: .1 });
    ctx.save(); ctx.globalAlpha = .25; ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = lw * .4; const r = rng(4); for (let i = 0; i < 14; i++) { const x = (r() - .5) * 1.6, y = -4 + r() * 3.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .2, y + .05); ctx.stroke(); } ctx.restore();
    inkFill(ctx, k => k.roundRect(-.45, -2.4, .9, .62, .08), shade(ch.apron, .85), lw * .7);
    inkFill(ctx, k => k.roundRect(.12, -2.75, .1, .5, .03), '#9AA0A8', lw * .5); inkFill(ctx, k => k.roundRect(-.25, -2.62, .14, .4, .04), '#8A5A33', lw * .5);
    ctx.strokeStyle = INK; ctx.lineWidth = lw * .6; ctx.beginPath(); ctx.moveTo(-.55, -4.55); ctx.lineTo(-.3, -5.1); ctx.moveTo(.55, -4.55); ctx.lineTo(.3, -5.1); ctx.stroke();
  }
  if (ch.chain) { const n = 13; for (let i = 0; i < n; i++) { const u = i / (n - 1), x = lerp(-.95, .95, u), y = -4.55 + Math.sin(u * Math.PI) * .95; inkFill(ctx, k => k.ellipse(x, y, .09, .07, u * 3, 0, 7), '#F0C24E', lw * .5); }
    inkFill(ctx, k => k.arc(0, -3.42, .24, 0, 7), '#F0C24E', lw * .7); inkFill(ctx, k => k.arc(0, -3.42, .1, 0, 7), '#C8202B', lw * .4); }
}
function furCollar(ctx, fur, lw) {
  const fp = k => { k.moveTo(-1.35, -4.8); k.bezierCurveTo(-1.0, -5.35, 1.0, -5.35, 1.35, -4.8); for (let i = 0; i <= 9; i++) { const x = 1.35 - i * .3; k.quadraticCurveTo(x - .05, -4.25 + (i % 2) * .12, x - .15, -4.4); } k.closePath(); };
  paint(ctx, fp, fur, lw, { bounds: [-1.4, -5.3, 1.4, -4.2], dx: .2, dy: .1 });
  ctx.save(); ctx.strokeStyle = shade(fur, .7); ctx.lineWidth = lw * .4; const r = rng(9); for (let i = 0; i < 26; i++) { const x = -1.2 + r() * 2.4, y = -5.0 + r() * .6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .05, y + .12); ctx.stroke(); } ctx.restore();
}

/** draw a character. ch = cast sheet; o = {x, y, s (px per unit), flip, eyes, mouth, talk, armL, armR, sweat, lean, t, bob, blink, lw} */
function drawCharacter(ctx, ch, o) {
  const t = o.t || 0, s = o.s || 100; const lw = (o.lw || Math.max(2.5, Math.min(8, s * .075))) / s;
  ctx.save(); ctx.translate(o.x, o.y + (o.bob ? Math.sin(t * Math.PI * 2 / 2.4) * o.bob : 0));
  ctx.scale((o.flip ? -1 : 1) * s, s); ctx.rotate(o.lean || 0);
  if (o.shadow !== false) { ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#1a1424'; ctx.filter = `blur(${Math.max(1, s * .08)}px)`; ctx.beginPath(); ctx.ellipse(.5, .05, 2.0, .3, 0, 0, 7); ctx.fill(); ctx.restore(); }
  const br = 1 + Math.sin(t * Math.PI * 2 / 2.6) * .006; ctx.scale(1, br);
  for (const sx of [-.55, .55]) inkFill(ctx, k => k.ellipse(sx, -.02, .42, .2, 0, 0, 7), ch.shoes || '#3b2a20', lw);
  const armL = o.armL || 'down', armR = o.armR || 'down';
  if (o.armLback) drawArm(ctx, ch, -1, armL, lw, t);
  drawHairBack(ctx, ch, lw);
  wigLongBack(ctx, ch, lw);
  CUR_KOHL = !!ch.kohl; CUR_LIPS = ch.lips || null;
  if (ch.kilt) { // bare legs, bare torso, pleated linen kilt (shendyt)
    for (const sx of [-.42, .42]) paint(ctx, k => { k.moveTo(sx - .28, -1.7); k.lineTo(sx + .28, -1.7); k.lineTo(sx + .2, -.1); k.lineTo(sx - .2, -.1); k.closePath(); }, SKIN, lw, { bounds: [sx - .3, -1.7, sx + .3, 0], dx: .08, dy: 0 });
    ctx.save(); ctx.beginPath(); ctx.rect(-5, -9, 10, 7.3); ctx.clip(); paint(ctx, k => robePath(k, ch), ch.torso || SKIN, lw, { bounds: [-1.8, -5.2, 1.8, 0], dx: .4, dy: .1 }); ctx.restore();
    const kc = ch.kiltColor || '#F2EDE0';
    paint(ctx, k => { k.moveTo(-1.08, -3.3); k.lineTo(1.08, -3.3); k.lineTo(1.3, -1.45); k.quadraticCurveTo(0, -1.3, -1.3, -1.45); k.closePath(); }, kc, lw, { bounds: [-1.3, -3.3, 1.3, -1.3], dx: .3, dy: .05 });
    folds(ctx, [[-.7, -3.1, -.8, -2.3, -.9, -1.5], [-.2, -3.1, -.22, -2.3, -.25, -1.42], [.3, -3.1, .34, -2.3, .38, -1.42], [.8, -3.1, .9, -2.3, 1.0, -1.5]], shade(kc, .72), lw * .4);
    if (ch.kiltPanel) { paint(ctx, k => { k.moveTo(-.3, -3.2); k.lineTo(.3, -3.2); k.lineTo(.42, -1.45); k.lineTo(-.42, -1.45); k.closePath(); }, ch.kiltPanel, lw * .7, { bounds: [-.4, -3.2, .4, -1.4], cel: false }); ctx.save(); ctx.strokeStyle = '#2F5FA8'; ctx.lineWidth = .06; for (let y = -3.0; y < -1.5; y += .2) { ctx.beginPath(); ctx.moveTo(-.3, y); ctx.lineTo(.3, y); ctx.stroke(); } ctx.restore(); }
    paint(ctx, k => { k.moveTo(-1.1, -3.45); k.quadraticCurveTo(0, -3.3, 1.1, -3.45); k.lineTo(1.1, -3.2); k.quadraticCurveTo(0, -3.05, -1.1, -3.2); k.closePath(); }, ch.belt || '#D9B24E', lw * .7, { bounds: [-1.1, -3.5, 1.1, -3.1], cel: false });
  } else paint(ctx, k => robePath(k, ch), ch.robe, lw, { bounds: [-1.8, -5.2, 1.8, 0], dx: .4, dy: .1 });
  costume(ctx, ch.kilt ? { ...ch, belt: null, trim: null, robe: ch.torso || SKIN, kilt: true } : ch, lw);
  paint(ctx, k => k.roundRect(-.3, -5.4, .6, .45, .15), SKIN, lw, { bounds: [-.3, -5.4, .3, -5], dx: .12, dy: 0 });
  if (ch.fur) furCollar(ctx, ch.fur, lw);
  if (ch.collar) { // usekh broad collar: concentric bands of faience and gold beads
    const bands = ch.collar; for (let i = bands.length - 1; i >= 0; i--) { const r1 = .45 + (i + 1) * .2; paint(ctx, k => { k.moveTo(-r1 * 1.25, -5.0); k.bezierCurveTo(-r1 * 1.2, -5.0 + r1 * 1.0, r1 * 1.2, -5.0 + r1 * 1.0, r1 * 1.25, -5.0); k.lineTo(.4, -5.0); k.bezierCurveTo(.4, -4.7, -.4, -4.7, -.4, -5.0); k.closePath(); }, bands[i], lw * .7, { bounds: [-1.4, -5.1, 1.4, -3.9], cel: i === bands.length - 1, dx: .2, dy: .05 }); }
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let a = .15; a < 3.0; a += .22) { ctx.beginPath(); ctx.arc(Math.cos(a) * 1.05, -5.0 + Math.sin(a) * .72, .04, 0, 7); ctx.fill(); } ctx.restore();
  }
  // head: soft light + cel crescent on the lower right
  paint(ctx, headPath, SKIN, 0, { bounds: [-1, HY - 1, 1, HY + 1], cel: false });
  ctx.save(); ctx.beginPath(); headPath(ctx); ctx.clip(); ctx.beginPath(); ctx.rect(-5, -12, 10, 14); ctx.translate(-.24, -.16); headPath(ctx); ctx.fillStyle = SKIN_SH; ctx.globalAlpha = .75; ctx.fill('evenodd'); ctx.restore();
  ctx.beginPath(); headPath(ctx); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  drawHairFront(ctx, ch, lw);
  drawBeard(ctx, ch, lw);
  const blink = o.blink !== false && ((t + (o.blinkPhase || 0)) % 3.7) < .1;
  drawEyes(ctx, o.eyes || 'neutral', lw, t, blink);
  drawMouth(ctx, o.mouth || 'neutral', o.talk, t, ch.beard === 'full' || ch.beard === 'short');
  drawHat(ctx, ch, lw, t);
  if (!o.armLback) drawArm(ctx, ch, -1, armL, lw, t);
  drawArm(ctx, ch, 1, armR, lw, t);
  if (o.sweat) { ctx.save(); const k = (t * 1.2) % 1; ctx.translate(1.0, HY - .5 + k * .6); inkFill(ctx, c => { c.moveTo(0, -.3); c.quadraticCurveTo(.22, .02, 0, .14); c.quadraticCurveTo(-.22, .02, 0, -.3); }, '#8FD3F4', lw * .8); ctx.restore(); }
  ctx.restore();
}
function handAt(ctx, x, y, type, rot, s, flip, lwPx = 7) { ctx.save(); ctx.translate(x, y); ctx.scale(s * 1.15, s * 1.15); ctx.rotate(rot); drawHand(ctx, type, lwPx / (s * 1.15), flip); ctx.restore(); }

// ---------- cast sheet (fixed for the series) ----------
const EG = { linen: '#F1ECDF', gold: '#D9B24E', lapis: '#2F5FA8', carnelian: '#B8463A', turq: '#3FA39A' };
const CAST = {
  KHUFU: { name: 'Khufu', build: 'stout', kilt: true, bareArms: true, kiltPanel: '#D9B24E', hat: 'nemes', hatColor: '#D9B24E', hatColor2: '#2F5FA8', beard: 'false', beardColor: '#3A2A1E', kohl: true, collar: ['#D9B24E', '#2F5FA8', '#B8463A', '#D9B24E'], belt: '#D9B24E', shoes: '#C9A060' },
  NARMER: { name: 'Narmer', build: 'normal', kilt: true, bareArms: true, hat: 'double', beard: 'false', kohl: true, collar: ['#D9B24E', '#B8463A'], belt: '#B8463A', shoes: '#C9A060', prop: 'crook' },
  HATSHEPSUT: { name: 'Hatshepsut', build: 'normal', kilt: true, bareArms: true, kiltPanel: '#D9B24E', hat: 'nemes', hatColor: '#E8DFC9', hatColor2: '#2F5FA8', beard: 'false', beardColor: '#3A2A1E', kohl: true, collar: ['#D9B24E', '#3FA39A', '#D9B24E'], belt: '#D9B24E', shoes: '#C9A060' },
  AKHENATEN: { name: 'Akhenaten', build: 'stout', robe: '#F1ECDF', sleeve: '#F1ECDF', bareArms: true, hat: 'khepresh', kohl: true, collar: ['#D9B24E', '#3FA39A', '#D9B24E'], belt: '#D9B24E', shoes: '#C9A060' },
  TUT: { name: 'Tutankhamun', build: 'normal', kilt: true, bareArms: true, kiltPanel: '#D9B24E', hat: 'nemes', hatColor: '#D9B24E', hatColor2: '#2F5FA8', kohl: true, collar: ['#D9B24E', '#2F5FA8', '#3FA39A', '#D9B24E'], belt: '#D9B24E', shoes: '#C9A060', prop: 'crook' },
  RAMESSES: { name: 'Ramesses II', build: 'stout', kilt: true, bareArms: true, kiltPanel: '#D9B24E', hat: 'khepresh', beard: 'false', kohl: true, collar: ['#D9B24E', '#B8463A', '#2F5FA8', '#D9B24E'], belt: '#D9B24E', shoes: '#C9A060' },
  CLEOPATRA: { name: 'Cleopatra', build: 'normal', robe: '#F1ECDF', sleeve: '#F1ECDF', bareArms: true, hat: 'wigDiadem', wigLong: true, lips: '#B8464E', hairColor: '#1C1820', kohl: true, collar: ['#D9B24E', '#2F5FA8', '#B8463A', '#D9B24E'], belt: '#D9B24E', shoes: '#C9A060' },
  VIZIER: { name: 'Royal Advisor (vizier)', build: 'normal', robe: '#EDE6D2', sleeve: '#EDE6D2', bareArms: true, hat: 'wig', hairColor: '#24202A', kohl: true, collar: ['#3FA39A', '#D9B24E'], trim: '#3FA39A', shoes: '#8A6440' },
  SOLDIER: { name: 'Soldier', build: 'normal', kilt: true, bareArms: true, hat: 'khat', hatColor: '#C9B080', collar: ['#8A6440'], belt: '#8A6440', shoes: '#7A5634', prop: 'spear' },
  WORKER_EG: { name: 'Worker', build: 'normal', kilt: true, bareArms: true, hat: 'khat', hatColor: '#E8DFC9', beard: 'short', beardColor: '#2E2620', belt: '#B8A27A', shoes: '#7A5634' },
  CAESAR: { name: 'Julius Caesar', build: 'normal', robe: '#EDE8DA', sleeve: '#EDE8DA', trim: '#7A2A55', hat: 'laurel', hair: 'short', hairColor: '#6E655E', shoes: '#6A4A33' },
  ANTONY: { name: 'Mark Antony', build: 'stout', robe: '#9A2A2A', sleeve: '#9A2A2A', trim: '#D9B24E', hair: 'curly', hairColor: '#3A2A20', beard: 'short', beardColor: '#3A2A20', shoes: '#6A4A33' },
  OCTAVIAN: { name: 'Octavian', build: 'normal', robe: '#EDE8DA', sleeve: '#EDE8DA', trim: '#7A2A55', hair: 'short', hairColor: '#8A6A44', shoes: '#6A4A33' },
  RANIERI: { name: 'Consul Ranieri', build: 'stout', robe: '#7E1F33', sleeve: '#7E1F33', cuff: '#D8C6A4', trim: '#D9AE4E', hat: 'chaperon', hatColor: '#B8323F', hair: 'short', hairColor: '#8F8A86', beard: 'goatee', beardColor: '#5F5752', fur: '#D9C8A8', chain: true, shoes: '#2d2020' },
  GHERARDO: { name: 'Mastro Gherardo', build: 'normal', robe: '#A57A47', sleeve: '#93693B', rolled: true, hat: 'felt', hatColor: '#4E3B2E', hair: 'curly', hairColor: '#4A3324', beard: 'full', beardColor: '#33251C', apron: '#6E4A2F', belt: '#3E2C20', shoes: '#3b2a20' },
  WORKER: { name: 'Worker', build: 'normal', robe: '#5E7A55', sleeve: '#53704B', rolled: true, hat: 'scarf', hatColor: '#C9B48E', hair: 'short', hairColor: '#2E2622', beard: null, belt: '#3E2C20', shoes: '#3b2a20' },
};
