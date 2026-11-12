// Jack the Ripper in 60 seconds — vertical Short (1080x1920), uses the ripper asset set.
'use strict';
const EP = { images: {}, credit: {}, captions: true, captionY: 1540, captionSize: 100, scenes };
const PLACES = { NICHOLS: [-0.0608, 51.51995], CHAPMAN: [-0.07256, 51.52038], STRIDE: [-0.0656, 51.5137], EDDOWES: [-0.07856, 51.51371], KELLY: [-0.0750, 51.5188], GOULSTON: [-0.0737, 51.5157] };
const CX = 540, AMBER = '#FFB866', BLOODR = '#C8322A';
const FACES = { annie: ['annie_wedding', [120, 160, 200, 230]], eddowes: ['eddowes_sketch', [820, 780, 1460, 1700]], kelly: ['kelly_sketch', [150, 60, 350, 420]], stride: ['ipn_stride_eddowes', [520, 175, 360, 420]] };
const VICTIMS = [['Mary Ann Nichols', '31 AUG 1888', null], ['Annie Chapman', '8 SEP 1888', 'annie'], ['Elizabeth Stride', '30 SEP 1888', 'stride'], ['Catherine Eddowes', '30 SEP 1888', 'eddowes'], ['Mary Jane Kelly', '9 NOV 1888', 'kelly']];
function brand(ctx) { text(ctx, 'UNFILED FILMS', CX, 110, { font: F.play, size: 34, color: 'rgba(244,236,220,.75)', align: 'center', weight: 700, ls: 5 }); }
function nightPhoto(ctx, t, key, o = {}) { photo(ctx, key, { zoom: o.zoom ?? 1.1, fx: o.fx ?? .5, fy: o.fy ?? .5, grade: 'duo', tint: o.tint || 'navy', tintAmt: o.tintAmt ?? .7 }); shade(ctx, o.shade ?? .3, '4,6,12'); gasGlow(ctx, W * .7, H * .15, t, 500, .3); fog(ctx, t, .6); }

function scenes() {
  shot(['S01', 'London'], (ctx, t, lt) => {
    nightPhoto(ctx, t, 'dorset', { zoom: 1.2 + lt * .03 });
    glowText(ctx, 'LONDON', CX, 640, { font: F.bebas, size: 230, color: PAL.cream, align: 'center', glow: 'rgba(255,180,90,.5)' });
    text(ctx, '1888', CX, 780, { font: F.bebas, size: 150, color: AMBER, align: 'center', alpha: prog(t, T('S01', '1888'), T('S01', '1888') + .3) });
    fadeIn(ctx, t, 0, .4);
  }, { lead: .35, name: 's-open' });
  shot(['S01', 'five'], (ctx, t, lt) => {
    const pr = drawStreets(ctx, GEO_WC, { lon: -0.0702, lat: 51.5170, k: 95000, theme: 'night' }, { reveal: E.out(prog(t, T('S01', 'five') - .3, T('S01', 'five') + 1)) }); fog(ctx, t, .3, '255,190,120');
    ['NICHOLS', 'CHAPMAN', 'STRIDE', 'EDDOWES', 'KELLY'].forEach((k, i) => { const [x, y] = pr(...PLACES[k]); pin(ctx, x, y, t, T('S01', 'five') + i * .15, null, { color: BLOODR }); });
    text(ctx, '5 WOMEN · 10 WEEKS', CX, 330, { font: F.bebas, size: 120, color: AMBER, align: 'center' });
    sourceTag(ctx, '© OpenStreetMap contributors');
  }, { name: 's-map' });
  [0, 1, 2, 3, 4].forEach(i => cue(T('S01', 'five') + i * .15, 'thud', .35));
  shot(['S02', 'Then'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A120C', '#030202', 'r');
    imgCam(ctx, 'dearboss2', camAt([[0, 354, 220, 1.1], [3, 445, 335, 2.2]], lt), { grade: 'warm' }); shade(ctx, .2);
    if (t > T('S02', 'Jack')) glowText(ctx, 'JACK THE RIPPER', CX, 1180, { font: F.bebas, size: 150, color: '#F2E6D6', align: 'center', glow: 'rgba(220,30,20,.9)', alpha: prog(t, T('S02', 'Jack'), T('S02', 'Jack') + .25) });
    if (t > T('S02', 'red')) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 230, W, 140); } text(ctx, 'RED INK', CX, 340, { font: F.bebas, size: 120, color: '#FF5A48', align: 'center', alpha: prog(t, T('S02', 'red'), T('S02', 'red') + .3) });
    sourceTag(ctx, '"Dear Boss" letter, 1888 · public domain');
  }, { name: 's-letter' });
  cue(T('S02', 'Jack'), 'impact', .8);
  shot(['S03', 'In'], (ctx, t, lt) => {
    const k = t < T('S03', 'Police');
    if (k) { nightPhoto(ctx, t, 'dutfield', { tint: 'red', tintAmt: .6, zoom: 1.2 + lt * .04 }); text(ctx, 'TWO IN ONE NIGHT', CX, 360, { font: F.bebas, size: 140, color: PAL.cream, align: 'center' }); }
    else { bgGrad(ctx, '#0E0C0B', '#000'); const wipe = prog(t, T('S03', 'wash'), T('S03', 'dawn', 'e'));
      ctx.save(); ctx.globalAlpha = 1 - E.in(wipe); photo(ctx, 'graffito', { zoom: 1.0 + (t - T('S03', 'Police')) * .03, grade: 'bw' }); shade(ctx, .25); ctx.restore();
      text(ctx, 'CHALK MESSAGE', CX, 360, { font: F.bebas, size: 130, color: PAL.cream, align: 'center' }); if (t > T('S03', 'wash')) stamp(ctx, 'WASHED AWAY', CX, 1180, t, T('S03', 'wash'), { size: 150 }); }
  }, { name: 's-double' });
  cue(T('S03', 'wash'), 'stamp');
  shot(['S04', 'A'], (ctx, t, lt) => {
    const k = t < T('S04', 'From');
    if (k) { photo(ctx, 'vig_box', { zoom: 1.2 + lt * .03, fx: .4, fy: .35, grade: 'sepia' }); shade(ctx, .3); text(ctx, 'A PARCEL', CX, 360, { font: F.bebas, size: 150, color: PAL.cream, align: 'center' }); }
    else { bgGrad(ctx, '#1A120C', '#030202', 'r'); photo(ctx, 'fromhell', { zoom: 1.5 - (t - T('S04', 'From')) * .08, fx: .3, fy: .3, grade: 'warm' }); shade(ctx, .15);
      if (t > T('S04', 'kidney')) stamp(ctx, 'HALF A KIDNEY', CX, 1180, t, T('S04', 'kidney'), { size: 140 }); }
    sourceTag(ctx, k ? 'Illustrated Police News, 1888 · public domain' : '"From Hell" letter, 1888 · public domain');
  }, { name: 's-hell' });
  cue(T('S04', 'From'), 'impact', .7); cue(T('S04', 'kidney'), 'stamp');
  shot(['S05', 'Hundreds'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050403');
    const items = [['klosowski', 'A BARBER', 'barber'], ['druitt', 'A LAWYER', 'lawyer'], ['sickert', 'A PAINTER', 'painter']];
    items.forEach(([k, l, w], i) => { const st = T('S05', w); if (t < st) return; const p = E.out(prog(t, st, st + .35)); ctx.save(); ctx.globalAlpha = p;
      card(ctx, k, { cx: CX, cy: lerp(1300, 700, p), maxW: 600, maxH: 700, rot: (i - 1) * .06, filter: GRADES.sepia }); ctx.restore();
      if (t < (items[i + 1] ? T('S05', items[i + 1][2]) : 1e9)) text(ctx, l, CX, 1270, { font: F.bebas, size: 130, color: AMBER, align: 'center', alpha: p }); });
    if (t < T('S05', 'barber')) text(ctx, 'HUNDREDS OF SUSPECTS', CX, 760, { font: F.bebas, size: 120, color: PAL.cream, align: 'center' });
  }, { name: 's-suspects' });
  ['barber', 'lawyer', 'painter'].forEach(w => cue(T('S05', w), 'shutter', .7));
  shot(['S06', 'In'], (ctx, t, lt) => {
    bgGrad(ctx, '#06141A', '#000'); dnaHelixS(ctx, CX, 900, t, 1.0);
    glowText(ctx, '2014', CX, 340, { font: F.bebas, size: 200, color: '#7CE0FF', align: 'center', glow: 'rgba(80,200,255,.6)' });
    if (t > T('S06', 'argue')) stamp(ctx, 'DISPUTED', CX, 1250, t, T('S06', 'argue'), { size: 140 });
  }, { name: 's-dna' });
  cue(T('S06', 'argue'), 'stamp');
  shot(['S07', 'More'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, CX, 100, t, 700, .3); fog(ctx, t, .3);
    const k = t < T('S07', 'But');
    if (k) { glowText(ctx, 'NEVER', CX, 640, { font: F.bebas, size: 240, color: PAL.cream, align: 'center' }); glowText(ctx, 'IDENTIFIED', CX, 840, { font: F.bebas, size: 200, color: BLOODR, align: 'center', glow: 'rgba(200,40,30,.8)' }); }
    else VICTIMS.forEach(([n, d, f], i) => { const ff = f && FACES[f]; memorialCard(ctx, i < 3 ? 200 + i * 340 : 370 + (i - 3) * 340, i < 3 ? 520 : 1000, { name: n, years: d, key: ff && ff[0], crop: ff && ff[1], w: 300, h: 450 }, prog(t, T('S07', 'But') + i * .15, T('S07', 'But') + i * .15 + .4)); });
  }, { name: 's-names' });
  shot(['S08', 'Their'], (ctx, t, lt) => {
    photo(ctx, 'iln_suspect', { zoom: 1.4, fx: .3, fy: .4, grade: 'duo', tint: 'red', tintAmt: .6, alpha: .5 }); shade(ctx, .55); lightLeak(ctx, t, .25, 9); fog(ctx, t, .5);
    bigTitle(ctx, 'JACK THE', CX, 760, t, T('S08', 'Their') - .1, { align: 'center', size: 170 }); bigTitle(ctx, 'RIPPER', CX, 930, t, T('S08', 'Their') + .1, { align: 'center', size: 200 });
    text(ctx, 'FULL DOCUMENTARY ON THE CHANNEL', CX, 1030, { font: F.osw, size: 40, color: AMBER, align: 'center', weight: 600, ls: 4, alpha: prog(t, T('S08', 'story'), T('S08', 'story') + .3) });
    if (t > T('S08', 'Unfiled')) { const p = Math.max(0, E.back(prog(t, T('S08', 'Unfiled'), T('S08', 'Unfiled') + .3))); ctx.save(); ctx.translate(CX, 1280); ctx.scale(p, p); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-280, -70, 560, 140, 70); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 25, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .5);
  }, { name: 's-cta' });
  cue(T('S08', 'Their') - .1, 'impact', .8);
  const _d = SHOTS.map(s => s.draw); SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _d[i](ctx, t, lt, sh); brand(ctx); }; });
}
function dnaHelixS(ctx, cx, cy, t, s = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  for (let i = -18; i <= 18; i++) { const y = i * 22, a = i * .38 + t * 1.6, x1 = Math.sin(a) * 120, x2 = Math.sin(a + Math.PI) * 120, z = Math.cos(a);
    ctx.strokeStyle = `rgba(124,224,255,${.25 + .25 * (z + 1)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    ctx.fillStyle = z > 0 ? '#7CE0FF' : '#2F7FA0'; ctx.beginPath(); ctx.arc(x1, y, 8 + 3 * z, 0, 7); ctx.fill(); ctx.fillStyle = z < 0 ? '#FF6B5B' : '#9A3A32'; ctx.beginPath(); ctx.arc(x2, y, 8 - 3 * z, 0, 7); ctx.fill(); }
  ctx.restore();
}
