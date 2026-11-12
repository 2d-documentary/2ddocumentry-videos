// D.B. Cooper — INK AND ANTIQUITY. Scenes are keyed to narration words (wt(line, word)).
'use strict';
const EP = {
  // image key -> path inside the assets branch (filled from the manifest)
  images: {},
  credit: {},
  mapPts: null,
  scenes,
};

// lon, lat of key places
const PLACES = { PDX: [-122.597, 45.589], SEA: [-122.309, 47.449], JUMP: [-122.56, 45.95], RENO: [-119.768, 39.499], TENA: [-122.77, 45.72] };

// ---------- reusable pieces for this episode
function paperBG(ctx, tone, seed) { ctx.drawImage(paperTex(tone || PAL.paper, seed || 3), 0, 0); }
function darkBG(ctx, a = 1) { ctx.fillStyle = PAL.night; ctx.globalAlpha = a; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
function pin(ctx, x, y, t, t0, label, o = {}) {
  const p = E.back(prog(t, t0, t0 + .35)); if (p <= 0) return;
  const pulse = (t - t0) % 1.2 / 1.2;
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = PAL.red2; ctx.lineWidth = 4; ctx.globalAlpha = 1 - pulse;
  ctx.beginPath(); ctx.arc(0, 0, 14 + 46 * pulse, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.arc(0, 0, 13 * p, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PAL.cream; ctx.beginPath(); ctx.arc(0, 0, 5 * p, 0, Math.PI * 2); ctx.fill();
  if (label) {
    const lp = prog(t, t0 + .15, t0 + .5);
    ctx.globalAlpha = lp; ctx.fillStyle = 'rgba(16,14,12,.85)';
    ctx.font = `${o.size || 44}px ${F.bebas}`; ctx.letterSpacing = '3px'; const w = ctx.measureText(label).width;
    const lx = o.left ? -w - 60 : 30; ctx.fillRect(lx - 14, -30, w + 28, 54);
    ctx.fillStyle = PAL.cream; ctx.fillText(label, lx, 12);
  }
  ctx.restore();
}
// dashed route line drawn along a quadratic curve
function route(ctx, a, b, p, o = {}) {
  if (p <= 0) return; const c = o.ctrl || [(a[0] + b[0]) / 2 + 80, (a[1] + b[1]) / 2];
  ctx.save(); ctx.strokeStyle = o.color || PAL.red2; ctx.lineWidth = o.lw || 6; ctx.setLineDash(o.dash || [18, 12]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(...a); const N = 60, n = Math.floor(N * clamp(p));
  let x = a[0], y = a[1];
  for (let i = 1; i <= n; i++) { const u = i / N; x = (1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0]; y = (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]; ctx.lineTo(x, y); }
  ctx.stroke(); ctx.setLineDash([]);
  if (o.plane && p < 1) { const u = clamp(p), dx = 2 * (1 - u) * (c[0] - a[0]) + 2 * u * (b[0] - c[0]), dy = 2 * (1 - u) * (c[1] - a[1]) + 2 * u * (b[1] - c[1]);
    ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx)); planeIcon(ctx, 1); }
  ctx.restore();
}
function planeIcon(ctx, s = 1, color = PAL.cream) { // simple top-down jet silhouette pointing +x
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = color; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(18, -5); ctx.lineTo(4, -5); ctx.lineTo(-6, -30); ctx.lineTo(-14, -30); ctx.lineTo(-8, -5);
  ctx.lineTo(-24, -5); ctx.lineTo(-32, -15); ctx.lineTo(-37, -15); ctx.lineTo(-33, 0); ctx.lineTo(-37, 15); ctx.lineTo(-32, 15); ctx.lineTo(-24, 5);
  ctx.lineTo(-8, 5); ctx.lineTo(-14, 30); ctx.lineTo(-6, 30); ctx.lineTo(4, 5); ctx.lineTo(18, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function chute(ctx, x, y, s, p) { // parachute icon
  if (p <= 0) return; const sc = s * E.back(clamp(p));
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.fillStyle = PAL.cream;
  ctx.beginPath(); ctx.arc(0, 0, 70, Math.PI, 0); ctx.quadraticCurveTo(52, 14, 35, 0); ctx.quadraticCurveTo(17, 14, 0, 0); ctx.quadraticCurveTo(-17, 14, -35, 0); ctx.quadraticCurveTo(-52, 14, -70, 0); ctx.fill(); ctx.stroke();
  ctx.beginPath(); [-70, -35, 0, 35, 70].forEach(xx => { ctx.moveTo(xx, 4); ctx.lineTo(0, 110); }); ctx.stroke();
  ctx.fillStyle = PAL.ink; ctx.fillRect(-12, 105, 24, 30); ctx.restore();
}
function cabinMap(ctx, t, t0, hiP) { // 727 cabin, last row highlighted
  const x0 = 260, y0 = 380, rows = 18, cw = 74;
  ctx.save();
  // fuselage
  ctx.fillStyle = PAL.cream; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x0 - 160, y0 + 160); ctx.quadraticCurveTo(x0 - 160, y0 - 10, x0 - 20, y0 - 30); ctx.lineTo(x0 + rows * cw + 120, y0 - 30);
  ctx.quadraticCurveTo(x0 + rows * cw + 260, y0 + 160, x0 + rows * cw + 120, y0 + 350); ctx.lineTo(x0 - 20, y0 + 350); ctx.quadraticCurveTo(x0 - 160, y0 + 330, x0 - 160, y0 + 160); ctx.fill(); ctx.stroke();
  for (let r = 0; r < rows; r++) {
    const ap = prog(t, t0 + r * .025, t0 + r * .025 + .25); if (ap <= 0) continue;
    for (let s = 0; s < 6; s++) {
      const x = x0 + r * cw, y = y0 + s * 50 + (s > 2 ? 40 : 0);
      const hl = r === rows - 1 && s === 4; // 18E
      ctx.globalAlpha = ap; ctx.fillStyle = hl && hiP > 0 ? PAL.red : '#B9AE98'; ctx.fillRect(x + 8, y + 4, cw - 22, 36);
    }
  }
  ctx.globalAlpha = 1;
  text(ctx, 'ROW 1', x0 + 4, y0 - 50, { font: F.osw, size: 30, color: PAL.charcoal, weight: 500 });
  text(ctx, 'ROW 18', x0 + (rows - 1) * cw - 10, y0 - 50, { font: F.osw, size: 30, color: PAL.red, weight: 500 });
  text(ctx, 'AFT STAIRS →', x0 + rows * cw + 40, y0 + 175, { font: F.osw, size: 30, color: PAL.charcoal, weight: 500 });
  ctx.restore();
  return [x0 + (rows - 1) * cw + 26, y0 + 4 * 50 + 40 + 22];
}

// ---------- the scenes
function scenes() {
  // S1 — date on paper
  {
    const date = 'NOVEMBER 24, 1971', t0 = wt('L001', 'November') - .05;
    typeCues(date, t0, 26); cue(t0 + date.length / 26 + .05, 'ding');
    shot(['L001', 'November'], (ctx, t, lt) => {
      paperBG(ctx, PAL.paper, 4);
      const z = 1 + lt * .02; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      typewriter(ctx, date, 330, 520, t, t0, 26, { size: 120 });
      const p = prog(t, wt('L001', 'day'), wt('L001', 'day') + .5);
      text(ctx, 'THE DAY BEFORE THANKSGIVING', 336, 610, { font: F.osw, size: 44, color: PAL.red, weight: 500, ls: 6, alpha: p });
      fadeIn(ctx, t, 0, .6);
    }, { lead: .7, name: 'date' });
    cue(wt('L001', 'day') - .05, 'paper', .7);
  }
  // S2 — the man: sketch, red circle on the tie
  shot(['L002', 'quiet'], (ctx, t, lt) => {
    darkBG(ctx);
    photo(ctx, 'sketch', { x: 560, y: 0, w: 800, h: H, zoom: 1.05 + lt * .03, fy: .45 });
    const tp = prog(t, wt('L002', 'black'), wt('L002', 'tie', 'e') + .2);
    penEllipse(ctx, 960, 960, 120, 95, tp, { seed: 3 });
    hand(ctx, 'clip-on!', 1120, 900, prog(t, wt('L002', 'tie'), wt('L002', 'tie') + .5));
    flash(ctx, t, wt('L002', 'quiet') - .1, .15);
    sourceTag(ctx, 'FBI composite sketch, 1971');
  }, { name: 'sketch' });
  cue(wt('L002', 'black'), 'scribble'); cue(wt('L002', 'quiet') - .15, 'whoosh');
  // S3 — the plane
  shot(['L002', 'Northwest'], (ctx, t, lt) => {
    photo(ctx, 'plane', { zoom: 1.12 + lt * .05, fx: .55 - lt * .01 });
    lowerTag(ctx, 'NORTHWEST ORIENT · FLIGHT 305', 'PORTLAND, OREGON  →  SEATTLE, WASHINGTON', t, wt('L002', 'Northwest') + .15);
    sourceTag(ctx, IMG.plane ? EP.credit.plane : '');
  }, { name: 'plane' });
  cue(wt('L002', 'Northwest') - .1, 'shutter');
  // S4 — cash, one-way: kinetic stamps on paper + the name
  shot(['L003', 'pays'], (ctx, t, lt) => {
    paperBG(ctx, PAL.cream, 6);
    stamp(ctx, 'CASH', 640, 520, t, wt('L003', 'cash'), { rot: -.1, size: 190 });
    stamp(ctx, 'ONE-WAY', 1290, 600, t, wt('L003', 'one'), { rot: .07, size: 190 });
  }, { name: 'stamps' });
  cue(wt('L003', 'cash'), 'stamp'); cue(wt('L003', 'one'), 'stamp'); cue(wt('L003', 'thirty') - .1, 'whoosh', .6);
  // map: Portland -> Seattle, 30 minutes
  shot(['L003', 'thirty'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 2.2));
    const v = { lon: lerp(-122.9, -122.6, u), lat: lerp(46.2, 46.45, u), k: lerp(300, 340, u), theme: 'paper' };
    const pr = drawGeo(ctx, GEO_PNW, v, [['WASHINGTON', -120.9, 47.4], ['OREGON', -121.3, 44.9], ['PACIFIC OCEAN', -125.0, 46.5, { size: 30 }]]);
    const pdx = pr(...PLACES.PDX), sea = pr(...PLACES.SEA);
    pin(ctx, ...pdx, t, wt('L003', 'thirty') - .05, 'PORTLAND', { left: true });
    route(ctx, pdx, sea, prog(t, wt('L003', 'thirty') + .1, wt('L003', 'hop', 'e') + .2), { plane: true, ctrl: [pdx[0] + 120, (pdx[1] + sea[1]) / 2] });
    pin(ctx, ...sea, t, wt('L003', 'hop', 'e') + .1, 'SEATTLE');
    const mp = E.out(prog(t, wt('L003', 'thirty'), wt('L003', 'thirty') + .4));
    ctx.save(); ctx.globalAlpha = mp; ctx.fillStyle = 'rgba(23,20,15,.88)'; ctx.fillRect(1290, 820, 520, 150);
    text(ctx, '30', 1320, 945, { font: F.bebas, size: 140, color: PAL.cream }); text(ctx, 'MINUTE FLIGHT', 1450, 925, { font: F.osw, size: 52, color: PAL.cream, weight: 600 }); ctx.restore();
    sourceTag(ctx, 'Map data: Natural Earth');
  }, { name: 'map-route' });
  {
    const nm = 'DAN COOPER', t0 = wt('L003', 'Dan') - .02;
    typeCues(nm, t0, 18, .9);
    shot(['L003', 'name'], (ctx, t, lt) => {
      paperBG(ctx, PAL.paper2, 8);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-.03); ctx.scale(1 + lt * .04, 1 + lt * .04);
      ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
      ctx.fillStyle = PAL.cream; ctx.fillRect(-620, -230, 1240, 460); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(168,50,42,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-620, -120); ctx.lineTo(620, -120); ctx.stroke();
      for (let k = 0; k < 4; k++) { ctx.strokeStyle = 'rgba(60,90,140,.25)'; ctx.beginPath(); ctx.moveTo(-620, -40 + k * 70); ctx.lineTo(620, -40 + k * 70); ctx.stroke(); }
      text(ctx, 'PASSENGER NAME', -560, -150, { font: F.mono, size: 34, color: PAL.charcoal });
      typewriter(ctx, nm, -560, 60, t, t0, 18, { size: 150 });
      penLine(ctx, -570, 100, 470, 92, prog(t, t0 + nm.length / 18 + .1, t0 + nm.length / 18 + .5));
      ctx.restore();
      text(ctx, 'Typographic recreation', W - 380, H - 40, { font: F.mono, size: 22, color: 'rgba(23,20,15,.55)' });
    }, { name: 'name' });
    cue(t0 + nm.length / 18 + .1, 'scribble', .8);
  }
  // S5 — seat 18E
  shot(['L004', 'takes'], (ctx, t, lt) => {
    paperBG(ctx, PAL.paper, 9);
    text(ctx, 'BOEING 727 · CABIN (SIMPLIFIED)', 110, 150, { font: F.osw, size: 40, color: PAL.charcoal, weight: 500, ls: 4 });
    const [sx, sy] = cabinMap(ctx, t, wt('L004', 'takes'), prog(t, wt('L004', '18E'), wt('L004', '18E') + .1));
    penEllipse(ctx, sx, sy, 70, 58, prog(t, wt('L004', '18E'), wt('L004', 'last', 'e')), { seed: 11 });
    hand(ctx, 'seat 18E — last row', sx - 330, sy + 190, prog(t, wt('L004', 'very'), wt('L004', 'row', 'e')));
    hand(ctx, '+ one bourbon & soda', 260, 900, prog(t, wt('L004', 'bourbon'), wt('L004', 'soda', 'e') + .2), { color: PAL.ink, size: 58 });
  }, { name: 'seat' });
  cue(wt('L004', 'takes') - .1, 'paper'); cue(wt('L004', '18E'), 'scribble'); cue(wt('L004', 'bourbon'), 'scribble', .6);
  // S6 — 3 p.m., the note
  shot(['L005', 'Just'], (ctx, t, lt) => {
    darkBG(ctx); paperBG(ctx, PAL.charcoal, 12);
    ctx.globalAlpha = .9; text(ctx, '3:0' + (lt < .6 ? Math.floor(lt * 15) % 10 : 0) + ' PM', 120, 220, { font: F.bebas, size: 160, color: PAL.cream }); ctx.globalAlpha = 1;
    const sp = E.out(prog(t, wt('L005', 'slips'), wt('L005', 'slips') + .5));
    ctx.save(); ctx.translate(lerp(W + 400, 1150, sp), 600); ctx.rotate(lerp(.5, -.06, sp));
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.fillStyle = PAL.cream; ctx.fillRect(-300, -170, 600, 340); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(-300, 0); ctx.lineTo(300, 0); ctx.stroke(); ctx.restore();
    hand(ctx, 'his phone number?', 900, 330, prog(t, wt('L005', 'phone'), wt('L005', 'number', 'e')), { color: PAL.red2, size: 70 });
    const hp = prog(t, wt('L005', 'phone') + .1, wt('L005', 'number', 'e') + .1);
    if (hp > 0) { ctx.save(); ctx.globalAlpha = hp; ctx.fillStyle = PAL.red2; ctx.font = `70px ${F.hand}`; ctx.fillText('♥', 1440, 330); ctx.restore(); }
  }, { name: 'note-pass' });
  cue(wt('L005', 'slips'), 'paper'); cue(wt('L005', 'Just') - .1, 'tick', .8);
  // S7 — "It is not his phone number." hard cut + impact
  shot(['L006', 'It'], (ctx, t, lt) => {
    darkBG(ctx);
    const s = 1 + .02 * Math.sin(lt * 40) * Math.exp(-lt * 6);
    ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
    wipeText(ctx, 'IT WAS NOT', W / 2, 500, prog(t, wt('L006', 'It'), wt('L006', 'not', 'e')), { size: 200, color: PAL.cream, align: 'center', bar: true });
    wipeText(ctx, 'HIS PHONE NUMBER.', W / 2, 700, prog(t, wt('L006', 'his'), wt('L006', 'number', 'e')), { size: 150, color: PAL.red2, align: 'center' });
    flash(ctx, t, wt('L006', 'It') - .08, .1);
  }, { name: 'not-number' });
  cue(wt('L006', 'It') - .05, 'impact');
  // S8 — the note text
  shot(['L007', 'Miss'], (ctx, t, lt) => {
    paperBG(ctx, PAL.charcoal, 14);
    ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-.025); const z = 1 + lt * .035; ctx.scale(z, z);
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.fillStyle = PAL.cream; ctx.fillRect(-720, -300, 1440, 600); ctx.shadowColor = 'transparent';
    ctx.drawImage(paperTex(PAL.cream, 21, 1440, 600), -720, -300);
    const L = [['MISS —', 'L007', 'Miss'], ['I HAVE A BOMB', 'L007', 'have'], ['IN MY BRIEFCASE.', 'L007', 'in'], ['I WANT YOU TO SIT BY ME.', 'L007', 'want']];
    L.forEach(([s, id, w], i) => { const p = prog(t, wt(id, w) - .05, wt(id, w) + .45); hand(ctx, s, -640, -170 + i * 125, p, { color: PAL.ink, size: 96, rot: 0 }); });
    penLine(ctx, -330, -18, 90, -26, prog(t, wt('L007', 'bomb'), wt('L007', 'bomb') + .35), { lw: 9 });
    ctx.restore();
    sourceTag(ctx, 'Wording as later recalled by the crew · handwritten recreation');
  }, { name: 'note' });
  cue(wt('L007', 'Miss') - .1, 'paper', .8); cue(wt('L007', 'bomb'), 'scribble'); cue(wt('L007', 'bomb') + .05, 'thud', .7);
  // S9 — wires, red sticks
  shot(['L008', 'He'], (ctx, t, lt) => {
    darkBG(ctx);
    const r = prog(t, wt('L008', 'cracks'), wt('L008', 'case', 'e'));
    ctx.fillStyle = `rgba(150,30,25,${.25 * r})`; ctx.fillRect(0, 0, W, H);
    text(ctx, 'THE BRIEFCASE', W / 2, 260, { font: F.osw, size: 46, color: 'rgba(244,236,220,.6)', align: 'center', weight: 500, ls: 10, alpha: r });
    punch(ctx, 'WIRES.', W / 2, 500, t, wt('L008', 'Wires'), { font: F.bebas, size: 230, color: PAL.cream });
    punch(ctx, 'RED STICKS.', W / 2, 760, t, wt('L008', 'Red'), { font: F.bebas, size: 230, color: PAL.red2 });
  }, { name: 'bomb' });
  cue(wt('L008', 'Wires'), 'hit', .8); cue(wt('L008', 'Red'), 'hit', .9);
  // S10 — demands: counter + 4 chutes
  shot(['L009', 'His'], (ctx, t, lt) => {
    paperBG(ctx, PAL.paper, 15);
    if (IMG.money) photo(ctx, 'money', { x: 0, y: 0, w: W, h: H, zoom: 1.1 + lt * .03, alpha: .22 });
    text(ctx, 'THE DEMANDS', 120, 170, { font: F.osw, size: 44, color: PAL.red, weight: 600, ls: 8 });
    const cp = E.out(prog(t, wt('L009', '$200,000') - .1, wt('L009', 'bills', 'e')));
    const v = Math.round(200000 * cp / 20) * 20;
    text(ctx, '$' + v.toLocaleString('en-US'), 120, 430, { font: F.bebas, size: 260, color: PAL.ink });
    text(ctx, 'IN UNMARKED $20 BILLS  ·  10,000 NOTES', 130, 510, { font: F.osw, size: 44, color: PAL.charcoal, weight: 500, alpha: prog(t, wt('L009', 'twenty'), wt('L009', 'bills', 'e')) });
    for (let k = 0; k < 4; k++) chute(ctx, 300 + k * 330, 720, 1.1, prog(t, wt('L009', 'four') + k * .12, wt('L009', 'four') + k * .12 + .3));
    text(ctx, '× 4 PARACHUTES', 1460, 830, { font: F.bebas, size: 110, color: PAL.red, alpha: prog(t, wt('L009', 'parachutes'), wt('L009', 'parachutes', 'e')) });
  }, { name: 'demands' });
  cue(wt('L009', '$200,000') - .1, 'cash'); [0, 1, 2, 3].forEach(k => cue(wt('L009', 'four') + k * .12, 'thud', .35));
  // S11 — the jump: night map, route, airstair
  shot(['L010', 'Five'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 3));
    const pr = drawGeo(ctx, GEO_PNW, { lon: lerp(-122.4, -122.5, u), lat: lerp(46.9, 46.5, u), k: lerp(260, 320, u), theme: 'night' }, [['WASHINGTON', -120.9, 47.3], ['OREGON', -120.9, 45.3]]);
    ctx.fillStyle = 'rgba(4,6,12,.25)'; ctx.fillRect(0, 0, W, H);
    const tp = E.out(prog(t, wt('L010', 'Five'), wt('L010', 'later', 'e')));
    text(ctx, '≈ 8:13 PM', 120, 200, { font: F.bebas, size: 150, color: PAL.cream, alpha: tp });
    text(ctx, 'SOMEWHERE OVER SOUTHWEST WASHINGTON', 126, 260, { font: F.osw, size: 38, color: 'rgba(244,236,220,.75)', weight: 500, ls: 4, alpha: prog(t, wt('L010', 'somewhere'), wt('L010', 'Washington', 'e')) });
    const P = { sea: pr(...PLACES.SEA), jump: pr(...PLACES.JUMP), pdx: pr(...PLACES.PDX) };
    pin(ctx, ...P.pdx, t, wt('L010', 'Five'), 'PORTLAND', { left: true });
    route(ctx, P.sea, P.jump, prog(t, wt('L010', 'somewhere'), wt('L010', 'lowers')), { plane: true, ctrl: [P.sea[0] + 60, (P.sea[1] + P.jump[1]) / 2] });
    pin(ctx, ...P.sea, t, wt('L010', 'somewhere'), 'SEATTLE');
    if (t > wt('L010', 'lowers')) { penEllipse(ctx, P.jump[0], P.jump[1], 90, 70, prog(t, wt('L010', 'lowers'), wt('L010', 'stairs', 'e')), { seed: 5 }); hand(ctx, 'jumped here?', P.jump[0] + 110, P.jump[1] + 10, prog(t, wt('L010', 'stairs'), wt('L010', 'stairs') + .5), { color: PAL.red2 }); }
  }, { name: 'night-map' });
  cue(wt('L010', 'Five') - .1, 'whoosh', .7); cue(wt('L010', 'lowers'), 'scribble', .7);
  shot(['L010', 'Boeing'], (ctx, t, lt) => {
    photo(ctx, 'airstair', { zoom: 1.08 + lt * .06, fx: .6, fy: .55, filter: 'grayscale(1) contrast(1.15) brightness(.8)' });
    ctx.fillStyle = 'rgba(8,12,22,.35)'; ctx.fillRect(0, 0, W, H);
    lowerTag(ctx, 'THE AFT AIRSTAIR', 'BOEING 727 — STAIRS THAT OPEN UNDER THE TAIL', t, wt('L010', 'Boeing') + .1);
    sourceTag(ctx, IMG.airstair ? EP.credit.airstair : '');
    const sp = prog(t, wt('L010', 'steps'), wt('L010', 'night', 'e') + .3);
    if (sp > 0) { ctx.fillStyle = `rgba(0,0,0,${E.in(sp)})`; ctx.fillRect(0, 0, W, H); }
  }, { name: 'airstair' });
  cue(wt('L010', 'Boeing') - .1, 'shutter'); cue(wt('L010', 'steps'), 'whoosh', 1.2);
  // S12 — never seen again
  shot(['L011', 'He'], (ctx, t, lt) => {
    darkBG(ctx);
    photo(ctx, 'sketch', { x: 0, y: 0, w: W, h: H, zoom: 1.4 + lt * .12, fy: .38, alpha: .55, filter: 'grayscale(1) contrast(1.3) brightness(.7)' });
    wipeText(ctx, 'NEVER SEEN AGAIN.', W / 2, 620, prog(t, wt('L011', 'never'), wt('L011', 'again', 'e')), { size: 190, color: PAL.cream, align: 'center', bar: true });
    fadeIn(ctx, t, wt('L011', 'He') - .4, .5);
  }, { name: 'never', lead: .4 });
  cue(wt('L011', 'never') - .05, 'impact', .8);
  // S13 — the numbers over a pile of FBI files
  shot(['L012', 'Fifty'], (ctx, t, lt) => {
    paperBG(ctx, PAL.charcoal, 17);
    const docs = ['file1', 'file2', 'file3'];
    docs.forEach((k, i) => { const p = E.out(prog(t, wt('L012', 'Fifty') + i * .15, wt('L012', 'Fifty') + i * .15 + .5));
      if (IMG[k]) card(ctx, k, { cx: 420 + i * 520, cy: lerp(1300, 560, p), maxW: 600, maxH: 760, rot: (i - 1) * .07, alpha: .55 }); });
    ctx.fillStyle = 'rgba(14,12,10,.55)'; ctx.fillRect(0, 0, W, H);
    const items = [['55', 'YEARS', 'Fifty'], ['800+', 'SUSPECTS', 'More'], ['66', 'VOLUMES OF FBI FILES', '66']];
    items.forEach(([n, l, w], i) => { const t0 = wt('L012', w); if (t < t0) return; const p = E.out(prog(t, t0, t0 + .3));
      text(ctx, n, 200 + i * 560, 600, { font: F.bebas, size: lerp(320, 260, p), color: i === 1 ? PAL.red2 : PAL.cream, alpha: p });
      text(ctx, l, 206 + i * 560, 680, { font: F.osw, size: 40, color: PAL.cream, weight: 500, ls: 4, alpha: p }); });
    if (IMG.file1) sourceTag(ctx, 'FBI case file NORJAK · The Vault, vault.fbi.gov');
  }, { name: 'numbers' });
  ['Fifty', 'More', '66'].forEach(w => cue(wt('L012', w), 'thud', .8));
  // S14 — nobody knows: wanted poster
  shot(['L013', 'And'], (ctx, t, lt) => {
    paperBG(ctx, PAL.paper2, 19);
    if (IMG.wanted) card(ctx, 'wanted', { cx: 960, cy: 560, maxW: 1100, maxH: 900, rot: -.02, scale: 1 + lt * .03, tape: true });
    else photo(ctx, 'sketch', { x: 560, y: 60, w: 800, h: 960 });
    const q = prog(t, wt('L013', 'really'), wt('L013', 'was', 'e'));
    text(ctx, '?', 1550, 640, { font: F.bebas, size: 520, color: PAL.red2, alpha: q, align: 'center', base: 'middle' });
    if (IMG.wanted) sourceTag(ctx, 'FBI wanted poster · public domain');
  }, { name: 'wanted' });
  cue(wt('L013', 'And') - .1, 'paper'); cue(wt('L013', 'really'), 'thud', .6);
  // S15 — the name is wrong → title card
  shot(['L014', 'Even'], (ctx, t, lt) => {
    paperBG(ctx, PAL.cream, 23);
    const tn = wt('L014', 'name');
    ctx.save(); ctx.translate(W / 2, 470); const z = 1 + lt * .02; ctx.scale(z, z);
    text(ctx, 'D.B. COOPER', 0, 0, { font: F.bebas, size: 300, color: PAL.ink, align: 'center', base: 'middle', alpha: prog(t, tn - .2, tn + .1) });
    const sp = prog(t, wt('L014', 'wrong'), wt('L014', 'wrong') + .35);
    penLine(ctx, -575, 12, -150, -8, sp, { lw: 14, bow: 0 }); penLine(ctx, -575, -40, -150, 40, sp, { lw: 14, bow: 0 });
    hand(ctx, 'wrong.', -520, 210, prog(t, wt('L014', 'wrong') + .1, wt('L014', 'wrong') + .6), { size: 110 });
    ctx.restore();
    const tt = wt('L014', 'wrong') + 1.2; const tp = E.out(prog(t, tt, tt + .6));
    if (tp > 0) {
      ctx.fillStyle = `rgba(14,12,10,${tp})`; ctx.fillRect(0, 0, W, H);
      wipeText(ctx, 'THE MAN WHO VANISHED', W / 2, 560, prog(t, tt + .2, tt + 1), { size: 170, color: PAL.cream, align: 'center', bar: true });
      text(ctx, 'THE UNSOLVED HIJACKING OF FLIGHT 305', W / 2, 650, { font: F.osw, size: 42, color: PAL.gold, align: 'center', weight: 500, ls: 8, alpha: prog(t, tt + .9, tt + 1.4) });
      text(ctx, 'INK AND ANTIQUITY', W / 2, H - 90, { font: F.play, size: 40, color: 'rgba(244,236,220,.7)', align: 'center', weight: 700, ls: 6, alpha: prog(t, tt + 1.2, tt + 1.8) });
    }
    fadeOut(ctx, t, TL.duration, .6);
  }, { name: 'title' });
  cue(wt('L014', 'wrong'), 'scribble', 1.1); cue(wt('L014', 'wrong') + 1.25, 'impact', .9); cue(wt('L014', 'wrong') + .4, 'riser', .7);
}
