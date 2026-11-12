// Jack the Ripper: The Autumn of Terror — Unfiled Films (16:9). No mortuary or crime-scene imagery.
'use strict';
const EP = { images: {}, credit: {}, scenes };
// lon, lat (approximate historic sites on the modern street grid)
const PLACES = { NICHOLS: [-0.0608, 51.51995], CHAPMAN: [-0.07256, 51.52038], STRIDE: [-0.0656, 51.5137], EDDOWES: [-0.07856, 51.51371],
  KELLY: [-0.0750, 51.5188], GOULSTON: [-0.0737, 51.5157], BISHOPSGATE: [-0.0805, 51.5170] };
const MAPV = { lon: -0.0702, lat: 51.5172, k: 82000, theme: 'night' };
const AMBER = '#FFB866', BLOODR = '#C8322A';
// portrait crops [x, y, w, h] in source pixels
const FACES = { annie: ['annie_wedding', [120, 160, 200, 230]], eddowes: ['eddowes_sketch', [820, 780, 1460, 1700]], kelly: ['kelly_sketch', [150, 60, 350, 420]], stride: ['ipn_stride_eddowes', [520, 175, 360, 420]] };
const VICTIMS = [
  { name: 'Mary Ann Nichols', years: '1845 – 31 AUG 1888', line: '"Polly". Mother of five.', place: 'NICHOLS', face: null },
  { name: 'Annie Chapman', years: 'c.1840 – 8 SEP 1888', line: 'Wife, mother of three.', place: 'CHAPMAN', face: 'annie' },
  { name: 'Elizabeth Stride', years: '1843 – 30 SEP 1888', line: 'Born in Sweden.', place: 'STRIDE', face: 'stride' },
  { name: 'Catherine Eddowes', years: '1842 – 30 SEP 1888', line: '"Kate".', place: 'EDDOWES', face: 'eddowes' },
  { name: 'Mary Jane Kelly', years: 'c.1863 – 9 NOV 1888', line: 'The youngest, about 25.', place: 'KELLY', face: 'kelly' },
];
const vcard = (ctx, i, cx, cy, p, o = {}) => { const v = VICTIMS[i], f = v.face && FACES[v.face]; memorialCard(ctx, cx, cy, { name: v.name, years: v.years, line: o.line === false ? '' : v.line, key: f && f[0], crop: f && f[1], w: o.w, h: o.h, nameSize: o.nameSize, source: f ? (v.face === 'annie' ? 'photograph, 1869' : 'press sketch, 1888') : 'no known portrait' }, p); };
function night(ctx, t, key, o = {}) {
  if (key && IMG[key]) photo(ctx, key, { zoom: o.zoom ?? 1.12, fx: o.fx ?? .5, fy: o.fy ?? .5, grade: 'duo', tint: o.tint || 'navy', tintAmt: o.tintAmt ?? .75, blur: o.blur });
  else bgGrad(ctx, '#121826', '#030406', 'r');
  shade(ctx, o.shade ?? .3, '4,6,12'); if (o.gas !== false) gasGlow(ctx, o.gx ?? W * .78, o.gy ?? H * .22, t, 420, .35); fog(ctx, t, o.fog ?? .6); dust(ctx, t, 40, .35);
}
function streetMap(ctx, t, lt, o = {}) {
  const v = { ...MAPV, ...(o.v || {}) }; const pr = drawStreets(ctx, GEO_WC, v, { reveal: o.reveal });
  fog(ctx, t, .35, '255,190,120'); return pr;
}
function vPin(ctx, pr, key, t, t0, label, o) { const [x, y] = pr(...PLACES[key]); pin(ctx, x, y, t, t0, label, { color: o?.color || BLOODR, ...o }); return [x, y]; }
function letterShot(from, key, kfs, o = {}) {
  shot(from, (ctx, t, lt) => {
    bgGrad(ctx, '#1A120C', '#030202', 'r'); gasGlow(ctx, W * .5, H * .3, t, 700, .25);
    const mp = imgCam(ctx, key, camAt(kfs, lt), { grade: 'warm' });
    const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (o.draw) o.draw(ctx, t, lt, mp);
    sourceTag(ctx, o.credit || 'Metropolitan Police files · public domain');
  }, { name: o.name || key });
  cue(T(...from) - .1, o.sfx || 'paper', .7);
}

function scenes() {
  // ---------------- COLD OPEN
  shot(['L001', 'London'], (ctx, t, lt) => {
    night(ctx, t, 'dorset', { zoom: 1.15 + lt * .02, tint: 'navy', tintAmt: .85, shade: .35 });
    glowText(ctx, 'LONDON', W / 2, 470, { font: F.bebas, size: 220, color: PAL.cream, align: 'center', glow: 'rgba(255,180,90,.5)', alpha: prog(t, T('L001', 'London'), T('L001', 'London') + .5) });
    glowText(ctx, 'AUTUMN · 1888', W / 2, 590, { font: F.osw, size: 60, color: AMBER, align: 'center', weight: 500, ls: 18, glow: 'rgba(255,160,60,.7)', alpha: prog(t, T('L001', 'autumn'), T('L001', 'autumn') + .5) });
    fadeIn(ctx, t, 0, .9); sourceTag(ctx, 'Dorset Street, Spitalfields, 1902 · public domain');
  }, { lead: .7, name: 'open' });
  cue(T('L001', 'autumn'), 'impact', .5);
  shot(['L002', 'In'], (ctx, t, lt) => {
    const pr = streetMap(ctx, t, lt, { reveal: E.out(prog(t, T('L002', 'In'), T('L002', 'In') + 1.6)), v: { k: lerp(70000, 82000, E.inOut(clamp(lt / 6))) } });
    kicker(ctx, 'WHITECHAPEL & SPITALFIELDS · EAST LONDON', 90, 120, t, T('L002', 'In'), { color: AMBER });
    const w0 = T('L002', 'five');
    VICTIMS.forEach((v, i) => vPin(ctx, pr, v.place, t, w0 + i * .22, null));
    if (t > T('L002', 'ten')) { counter(ctx, Math.min(10, 10 * E.out(prog(t, T('L002', 'ten'), T('L002', 'weeks', 'e') + .3))), 120, 980, { suffix: ' WEEKS', size: 130, color: AMBER }); }
    if (t > w0) text(ctx, '5 WOMEN', W - 120, 980, { font: F.bebas, size: 130, color: BLOODR, align: 'right', alpha: prog(t, w0, w0 + .3) });
    sourceTag(ctx, 'Streets: © OpenStreetMap contributors (modern layout)');
  }, { name: 'map-intro' });
  [0, 1, 2, 3, 4].forEach(i => cue(T('L002', 'five') + i * .22, 'thud', .35));
  shot(['L003', 'The'], (ctx, t, lt) => {
    night(ctx, t, 'iln_suspect', { zoom: 1.25 + lt * .05, fx: .3, fy: .45, tint: 'red', tintAmt: .55, shade: .2, gx: W * .3, gy: H * .1 });
    vignette(ctx, .6); bigTitle(ctx, 'HE STRIKES IN THE DARK', 120, 940, t, T('L003', 'strikes'), { size: 110 });
    sourceTag(ctx, 'Illustrated London News, 13 Oct 1888 · public domain');
  }, { name: 'shadow' });
  cue(T('L003', 'The') - .1, 'whoosh', .6);
  letterShot(['L004', 'Then'], 'dearboss1', [[0, 344, 300, 1.25], [4, 344, 470, 1.45]], { draw: (ctx, t, lt, mp) => {
    kicker(ctx, 'A LETTER TO THE PRESS · 1888', 90, 120, t, T('L004', 'writes'), { color: AMBER }); } });
  shot(['L005', 'Jack'], (ctx, t, lt) => {
    bgGrad(ctx, '#160606', '#000', 'r');
    const mp = imgCam(ctx, 'dearboss2', camAt([[0, 445, 330, 2.6], [2, 445, 338, 3.0]], lt), { grade: 'warm', alpha: .75 });
    shade(ctx, .35); fog(ctx, t, .4, '255,80,60');
    glowText(ctx, 'JACK THE RIPPER', W / 2, 640, { font: F.bebas, size: 230, color: '#F2E6D6', align: 'center', glow: 'rgba(220,30,20,.9)', blur: 60, alpha: prog(t, T('L005', 'Jack'), T('L005', 'Jack') + .25) });
    glitch(ctx, t, lt < .3 ? 1 : 0, 5);
  }, { name: 'name' });
  cue(T('L005', 'Jack') - .05, 'impact', 1);
  shot(['L006', 'More'], (ctx, t, lt) => {
    bgGrad(ctx, '#10141C', '#030405'); fog(ctx, t, .4);
    const a = T('L006', 'More'); timelineBar(ctx, 620, [[1888, 'THE MURDERS', a], [2014, 'DNA CLAIM', a + .4], [2026, 'TODAY', a + .7]], 1880, 2034, t, a);
    if (t > T('L006', 'don\'t')) glowText(ctx, 'STILL UNKNOWN', W / 2, 380, { font: F.bebas, size: 170, color: PAL.cream, align: 'center', alpha: prog(t, T('L006', 'don\'t'), T('L006', 'don\'t') + .3) });
  }, { name: 'years' });
  shot(['L007', 'Hundreds'], (ctx, t, lt) => {
    const seg = [['L007', 'Hundreds'], ['L007', 'police'], ['L007', 'Half'], ['L007', 'DNA']]; let k = 0; seg.forEach((s, i) => { if (t >= T(...s)) k = i; });
    if (k === 0) { bgGrad(ctx, '#151515', '#050505'); ['druitt', 'ostrog', 'tumblety', 'klosowski', 'sickert', 'maybrick'].forEach((key, i) => { const p = prog(t, T('L007', 'Hundreds') + i * .08, T('L007', 'Hundreds') + i * .08 + .25);
        if (p > 0) { ctx.save(); ctx.globalAlpha = p; card(ctx, key, { cx: 250 + i * 285, cy: 520 + (i % 2) * 60, maxW: 240, maxH: 320, rot: (i - 2.5) * .04, filter: GRADES.bw, mount: 10 }); ctx.restore(); } });
      bigTitle(ctx, 'HUNDREDS OF SUSPECTS', W / 2, 950, t, T('L007', 'Hundreds'), { align: 'center', size: 110 }); }
    if (k === 1) { photo(ctx, 'blindman', { zoom: 1.1 + lt * .02, fy: .45, grade: 'sepia' }); gradeTop(ctx, .6); bigTitle(ctx, 'A POLICE FORCE IN CHAOS', W / 2, 980, t, T('L007', 'police'), { align: 'center', size: 100 }); sourceTag(ctx, 'Punch, 22 Sep 1888 · "Blind-man\'s buff" · CC0'); }
    if (k === 2) { photo(ctx, 'vig_box', { zoom: 1.15, fx: .35, fy: .3, grade: 'sepia' }); gradeTop(ctx, .6); bigTitle(ctx, 'HALF A KIDNEY IN A BOX', W / 2, 980, t, T('L007', 'Half'), { align: 'center', size: 100, color: '#FF6B5B' }); sourceTag(ctx, 'Illustrated Police News, 27 Oct 1888 · public domain'); }
    if (k === 3) { bgGrad(ctx, '#06141A', '#000'); dnaHelix(ctx, W / 2, H / 2 - 40, t, 1); bigTitle(ctx, 'A DNA TEST', W / 2, 980, t, T('L007', 'DNA'), { align: 'center', size: 110, color: '#7CE0FF' }); }
  }, { name: 'teaser' });
  ['police', 'Half', 'DNA'].forEach(w => cue(T('L007', w) - .05, 'hit', .6)); cue(T('L007', 'Hundreds') - .05, 'hit', .6);
  shot(['L008', 'But'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, W / 2, 80, t, 900, .25); fog(ctx, t, .3);
    VICTIMS.forEach((v, i) => vcard(ctx, i, 230 + i * 365, 560, prog(t, T('L008', 'five') + i * .18, T('L008', 'five') + i * .18 + .4), { w: 320, h: 500 }));
    if (t > T('L008', 'names')) kicker(ctx, 'THEIR NAMES DESERVE TO BE REMEMBERED', 560, 120, t, T('L008', 'names'), { color: AMBER });
  }, { name: 'five-women' });
  [0, 1, 2, 3, 4].forEach(i => cue(T('L008', 'five') + i * .18, 'paper', .35));
  shot(['L009', 'This'], (ctx, t, lt) => {
    night(ctx, t, 'iln_suspect', { zoom: 1.4 + lt * .03, fx: .28, fy: .4, tint: 'red', tintAmt: .6, shade: .5, gx: W * .2, gy: H * .15 });
    bigTitle(ctx, 'JACK THE RIPPER', W / 2, 560, t, T('L009', 'Jack'), { align: 'center', size: 200 });
    text(ctx, 'THE AUTUMN OF TERROR', W / 2, 650, { font: F.osw, size: 46, color: AMBER, align: 'center', weight: 500, ls: 14, alpha: prog(t, T('L009', 'Ripper', 'e'), T('L009', 'Ripper', 'e') + .5) });
    text(ctx, 'UNFILED FILMS', W / 2, H - 80, { font: F.play, size: 36, color: 'rgba(244,236,220,.7)', align: 'center', weight: 700, ls: 6, alpha: prog(t, T('L009', 'Ripper', 'e') + .3, T('L009', 'Ripper', 'e') + .9) });
    lightLeak(ctx, t, .2, 3);
  }, { name: 'title' });
  cue(T('L009', 'Jack') - .1, 'impact', .9); cue(T('L009', 'This') - .3, 'riser', .6);
  // ---------------- ACT 1: Whitechapel
  photoShot(['L010', 'To'], 'dorset', { grade: 'sepia', z0: 1.05, z1: 1.2, fy0: .5, fy1: .55, leak: .15, creditText: 'Dorset Street, Spitalfields, 1902 · public domain', draw: (ctx, t) => { fog(ctx, t, .4); kicker(ctx, 'WHITECHAPEL', 90, 120, t, T('L010', 'Whitechapel'), { color: AMBER, size: 44 }); } });
  shot(['L011', 'By'], (ctx, t, lt) => {
    photo(ctx, 'slum1868', { zoom: 1.1 + lt * .02, grade: 'sepia' }); shade(ctx, .55); fog(ctx, t, .35);
    counter(ctx, 80000 * E.out(prog(t, T('L011', 'eighty'), T('L011', 'thousand', 'e') + .5)), W / 2, 560, { size: 260, align: 'center', color: AMBER });
    text(ctx, 'PEOPLE IN ONE DISTRICT', W / 2, 640, { font: F.osw, size: 50, color: PAL.cream, align: 'center', weight: 500, ls: 8, alpha: prog(t, T('L011', 'packed'), T('L011', 'packed') + .3) });
    sourceTag(ctx, 'London street poverty, 1868 · public domain');
  }, { name: 'population' });
  shot(['L012', 'Every'], (ctx, t, lt) => {
    bgGrad(ctx, '#17120D', '#050403'); const a = T('L012', 'two');
    for (let i = 0; i < 233; i++) { const p = prog(t, a + i * .004, a + i * .004 + .2); if (p <= 0) continue; const x = 140 + (i % 26) * 64, y = 300 + Math.floor(i / 26) * 62;
      ctx.globalAlpha = p; ctx.fillStyle = '#6B5338'; ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.lineTo(x + 22, y); ctx.lineTo(x + 44, y + 14); ctx.fill(); ctx.fillStyle = '#A9875A'; ctx.fillRect(x + 6, y + 14, 32, 30); ctx.fillStyle = 'rgba(255,200,110,.9)'; ctx.fillRect(x + 18, y + 26, 8, 10); }
    ctx.globalAlpha = 1; counter(ctx, 8500 * E.out(prog(t, T('L012', 'eighty'), T('L012', 'them', 'e'))), 140, 200, { suffix: ' PEOPLE A NIGHT', size: 110, color: PAL.cream });
    text(ctx, '233 COMMON LODGING HOUSES', 1780, 200, { font: F.bebas, size: 80, color: AMBER, align: 'right', alpha: prog(t, a, a + .4) });
  }, { name: 'lodging' });
  shot(['L013', 'Fourpence'], (ctx, t, lt) => {
    bgGrad(ctx, '#17120D', '#050403'); gasGlow(ctx, W * .5, 60, t, 700, .3);
    const a = T('L013', 'Fourpence'), b = T('L013', 'twopence');
    ctx.save(); ctx.globalAlpha = E.out(prog(t, a, a + .4)); ctx.fillStyle = '#5A4632'; ctx.fillRect(160, 430, 620, 190); ctx.strokeStyle = '#2A2016'; ctx.lineWidth = 8; ctx.strokeRect(160, 430, 620, 190);
    ctx.fillStyle = '#CDBB98'; ctx.fillRect(190, 460, 560, 90); text(ctx, '4d', 470, 770, { font: F.play, size: 170, color: AMBER, align: 'center', weight: 700 }); text(ctx, 'A "COFFIN" BED', 470, 830, { font: F.osw, size: 42, color: PAL.cream, align: 'center', weight: 500, ls: 6 }); ctx.restore();
    if (t > b) { const p = E.out(prog(t, b, b + .4)); ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = '#B79A6A'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(1000, 470); ctx.lineTo(1800, 470); ctx.stroke();
      for (let i = 0; i < 6; i++) { const x = 1060 + i * 130, sway = Math.sin(t * 1.5 + i) * 4; ctx.save(); ctx.translate(x, 470); ctx.rotate(.15 + sway * .01); ctx.fillStyle = '#E8DCC4'; ctx.beginPath(); ctx.arc(0, 30, 18, 0, 7); ctx.fill(); ctx.fillRect(-20, 50, 40, 110); ctx.restore(); }
      text(ctx, '2d', 1400, 770, { font: F.play, size: 170, color: AMBER, align: 'center', weight: 700 }); text(ctx, 'SLEEP SITTING UP, ON A ROPE', 1400, 830, { font: F.osw, size: 42, color: PAL.cream, align: 'center', weight: 500, ls: 4 }); ctx.restore(); }
    sourceTag(ctx, 'Illustration');
  }, { name: 'beds' });
  cue(T('L013', 'Fourpence'), 'cash', .6); cue(T('L013', 'twopence'), 'cash', .5);
  shot(['L014', 'More'], (ctx, t, lt) => {
    bgGrad(ctx, '#12100E', '#040303'); const a = T('L014', 'half');
    for (let i = 0; i < 100; i++) { const x = 560 + (i % 20) * 44, y = 360 + Math.floor(i / 20) * 90, red = i < 55 && t > a + .2 + i * .012;
      personIcon(ctx, x, y + 40, .8, red ? BLOODR : 'rgba(244,236,220,.55)'); }
    counter(ctx, 55 * E.out(prog(t, a, a + 1.2)), 330, 600, { suffix: '%', size: 220, align: 'center', color: BLOODR });
    text(ctx, 'OF CHILDREN DIED BEFORE AGE 5', W / 2, 920, { font: F.osw, size: 52, color: PAL.cream, align: 'center', weight: 500, ls: 6, alpha: prog(t, T('L014', 'died'), T('L014', 'died') + .3) });
  }, { name: 'children' });
  photoShot(['L015', 'The'], 'homeless', { grade: 'sepia', z0: 1.05, z1: 1.2, fy0: .45, creditText: 'Illustrated London News, 13 Oct 1888 · public domain', draw: (ctx, t) => { fog(ctx, t, .45); ctx.fillStyle = 'rgba(8,10,20,.35)'; ctx.fillRect(0, 0, W, H);
    if (t > T('L015', 'night')) bigTitle(ctx, 'THE NIGHT WAS DANGEROUS', W / 2, 980, t, T('L015', 'night'), { align: 'center', size: 110 }); } });
  // ---------------- ACT 2: the murders begin
  shot(['L016', 'Friday'], (ctx, t, lt) => {
    const pr = streetMap(ctx, t, lt, { v: { lon: lerp(-0.0702, -0.0640, E.inOut(clamp(lt / 3))), lat: 51.518, k: lerp(82000, 150000, E.inOut(clamp(lt / 3))) } });
    timeStamp(ctx, 'FRI 31 AUG · 3:40 AM', 90, 160, t, T('L016', 'Friday'), { color: AMBER });
    vPin(ctx, pr, 'NICHOLS', t, T('L016', 'Buck\'s'), 'BUCK\'S ROW', { left: true });
    if (IMG.bucks_row && t > T('L016', 'Buck\'s') + .3) { const p = E.out(prog(t, T('L016', 'Buck\'s') + .3, T('L016', 'Buck\'s') + .8)); ctx.save(); ctx.globalAlpha = p; card(ctx, 'bucks_row', { cx: 1500, cy: 560, maxW: 460, maxH: 600, rot: .03, filter: GRADES.sepia }); ctx.restore(); text(ctx, 'BUCK\'S ROW (NOW DURWARD ST)', 1500, 900, { font: F.osw, size: 28, color: PAL.cream, align: 'center', weight: 600, alpha: p }); }
    sourceTag(ctx, 'Streets: © OpenStreetMap contributors · sites approximate');
  }, { name: 'nichols-map' });
  cue(T('L016', 'Friday') - .1, 'tick', .8); cue(T('L016', 'Buck\'s'), 'thud', .5);
  shot(['L017', 'Her'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, 600, 200, t, 600, .3); fog(ctx, t, .3);
    vcard(ctx, 0, 600, 560, prog(t, T('L017', 'Her'), T('L017', 'Her') + .4), { w: 380, h: 580, nameSize: 38 });
    dataRow(ctx, 'KNOWN AS', '"POLLY"', 1000, 330, t, T('L017', 'Polly'), { color: AMBER });
    dataRow(ctx, 'AGE', '43', 1000, 480, t, T('L017', 'forty'));
    dataRow(ctx, 'CHILDREN', 'FIVE', 1000, 630, t, T('L017', 'five'));
  }, { name: 'nichols' });
  shot(['L017B', 'Hours'], (ctx, t, lt) => {
    night(ctx, t, 'slum_child', { zoom: 1.1 + lt * .03, tint: 'navy', tintAmt: .5, shade: .25 });
    if (t > T('L017B', 'fourpence')) { glowText(ctx, '4d', 1480, 520, { font: F.play, weight: 700, size: 240, color: AMBER, align: 'center', glow: 'rgba(255,170,70,.8)' }); text(ctx, 'FOR A BED', 1480, 600, { font: F.osw, size: 44, color: PAL.cream, align: 'center', weight: 600, ls: 6 }); }
    if (t > T('L017B', 'back')) hand(ctx, '"I\'ll soon have my doss money"', 160, 960, prog(t, T('L017B', 'back'), T('L017B', 'money', 'e')), { color: '#FFD9A0', size: 60 });
    sourceTag(ctx, 'East End, c.1890 · public domain · quote as reported at the inquest');
  }, { name: 'doss' });
  shot(['L018', 'Eight'], (ctx, t, lt) => {
    const pr = streetMap(ctx, t, lt, { v: { lon: lerp(-0.0640, -0.0715, E.inOut(clamp(lt / 3))), lat: 51.519, k: 130000 } });
    timeStamp(ctx, 'SAT 8 SEP · 6:00 AM', 90, 160, t, T('L018', 'Saturday'), { color: AMBER });
    vPin(ctx, pr, 'NICHOLS', t, 0, null, { color: 'rgba(200,50,42,.5)' }); vPin(ctx, pr, 'CHAPMAN', t, T('L018', 'backyard'), '29 HANBURY ST');
    if (IMG.hanbury1888 && t > T('L018', '29')) { const p = E.out(prog(t, T('L018', '29'), T('L018', '29') + .5)); ctx.save(); ctx.globalAlpha = p; card(ctx, 'hanbury1888', { cx: 1500, cy: 560, maxW: 420, maxH: 620, rot: -.03, filter: GRADES.sepia }); ctx.restore(); }
    sourceTag(ctx, 'Streets: © OpenStreetMap contributors · Hanbury Street photo: public domain');
  }, { name: 'chapman-map' });
  cue(T('L018', 'Eight') - .1, 'tick', .8); cue(T('L018', 'backyard'), 'thud', .5);
  shot(['L019', 'Annie'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, 600, 200, t, 600, .3); fog(ctx, t, .3);
    vcard(ctx, 1, 600, 560, prog(t, T('L019', 'Annie'), T('L019', 'Annie') + .4), { w: 380, h: 580, nameSize: 38 });
    dataRow(ctx, 'AGE', '47', 1000, 330, t, T('L019', 'Forty'));
    dataRow(ctx, 'MARRIED', 'A COACHMAN, 1869', 1000, 480, t, T('L019', 'coachman\'s'));
    dataRow(ctx, 'THEN', 'HER DAUGHTER DIED · MARRIAGE ENDED', 1000, 630, t, T('L019', 'death'));
  }, { name: 'chapman' });
  shot(['L020', 'This'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r');
    const mp = imgCam(ctx, 'annie_wedding', camAt([[0, 336, 392, .95], [3, 230, 330, 1.35]], lt), { grade: 'warm', contain: true });
    const [x1, y1] = mp(110, 150), [x2, y2] = mp(330, 420); brackets(ctx, x1, y1, x2 - x1, y2 - y1, prog(t, T('L020', 'real'), T('L020', 'real') + .3), AMBER);
    kicker(ctx, 'A REAL PHOTOGRAPH · ANNIE & JOHN CHAPMAN · 1869', 90, 120, t, T('L020', 'real'), { color: AMBER });
    sourceTag(ctx, 'Wedding portrait, 1869 · public domain');
  }, { name: 'annie-photo' });
  cue(T('L020', 'real'), 'shutter', .8);
  shot(['L021', 'Panic'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050403');
    const mp = imgCam(ctx, 'ipn_chapman', camAt([[0, 280, 45, 2.7], [3, 280, 52, 2.9]], lt), { grade: 'sepia', contain: true }); shade(ctx, .25);
    if (t > T('L021', 'Leather')) stamp(ctx, '"LEATHER APRON"', W / 2, 520, t, T('L021', 'Leather'), { size: 130, rot: -.06 });
    if (t > T('L021', 'cleared')) { ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(0, 760, W, 220); dataRow(ctx, 'ARRESTED', 'JOHN PIZER, BOOTMAKER', 140, 840, t, T('L021', 'John')); stamp(ctx, 'CLEARED', 1520, 880, t, T('L021', 'cleared'), { size: 110, color: '#3DDC6E' }); }
    sourceTag(ctx, 'Illustrated Police News, 15 Sep 1888 · public domain');
  }, { name: 'leather-apron' });
  cue(T('L021', 'Leather'), 'stamp'); cue(T('L021', 'cleared'), 'stamp', .8);
  dossier(['L022', 'Scotland'], 'abberline', 'FREDERICK ABBERLINE', [['RANK', 'DETECTIVE INSPECTOR', 'L022', 'Inspector'], ['FROM', 'SCOTLAND YARD CENTRAL OFFICE', 'L022', 'Scotland'], ['EDGE', 'KNEW THESE STREETS WELL', 'L022', 'knows']], null, { credit: 'Abberline portrait, Toby, Jan 1888 · public domain' });
  photoShot(['L023', 'Local'], 'vigilance', { grade: 'sepia', z0: 1.05, z1: 1.18, fx0: .45, fx1: .55, creditText: 'Illustrated London News, 13 Oct 1888 · public domain', draw: (ctx, t) => { fog(ctx, t, .3); kicker(ctx, 'WHITECHAPEL VIGILANCE COMMITTEE', 90, 980, t, T('L023', 'Whitechapel'), { color: AMBER, size: 44 }); } });
  // ---------------- ACT 3: the letters, the double event
  letterShot(['L024', 'Then'], 'dearboss1', [[0, 344, 470, .9], [2, 344, 300, 1.2], [5, 110, 95, 2.4]], { draw: (ctx, t, lt, mp) => {
    timeStamp(ctx, '27 SEPTEMBER 1888', 90, 160, t, T('L024', 'September'), { color: AMBER, size: 70 }); kicker(ctx, 'CENTRAL NEWS AGENCY', 90, 230, t, T('L024', 'Central'), { color: AMBER });
    if (t > T('L024', 'red')) text(ctx, 'RED INK', 1500, 980, { font: F.bebas, size: 110, color: '#FF5A48', alpha: prog(t, T('L024', 'red'), T('L024', 'red') + .3) });
    if (t > T('L024', 'Dear')) { const [x, y] = mp(95, 92); penEllipse(ctx, x, y, 230, 90, prog(t, T('L024', 'Dear'), T('L024', 'Boss', 'e') + .2), { seed: 3, color: '#E8C76A', lw: 8 }); } } });
  cue(T('L024', 'Dear'), 'scribble', .8);
  letterShot(['L025', 'The'], 'dearboss2', [[0, 354, 200, 1.1], [3, 445, 335, 2.2]], { draw: (ctx, t, lt, mp) => {
    if (t > T('L025', 'signed')) { const [x, y] = mp(445, 338); penEllipse(ctx, x, y, 330, 80, prog(t, T('L025', 'signed'), T('L025', 'Ripper', 'e') + .2), { seed: 8, color: '#E8C76A', lw: 9 }); }
    if (t > T('L025', 'first')) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 860, W, 160); text(ctx, 'THE FIRST TIME THE NAME APPEARS', W / 2, 965, { font: F.bebas, size: 90, color: PAL.cream, align: 'center' }); } } });
  cue(T('L025', 'signed'), 'scribble', .9);
  shot(['L026', 'Three'], (ctx, t, lt) => {
    night(ctx, t, 'dutfield', { zoom: 1.2 + lt * .04, tint: 'red', tintAmt: .6, shade: .45, gx: W * .2, gy: H * .2 }); lightning(ctx, t, [T('L026', 'terrifying') - .05]);
    bigTitle(ctx, 'THE MOST TERRIFYING NIGHT', W / 2, 560, t, T('L026', 'terrifying'), { align: 'center', size: 140 });
  }, { name: 'double-intro' });
  cue(T('L026', 'terrifying') - .05, 'impact', .8);
  shot(['L027', 'Around'], (ctx, t, lt) => {
    const pr = streetMap(ctx, t, lt, { v: { lon: lerp(-0.0702, -0.0680, E.inOut(clamp(lt / 3))), lat: lerp(51.517, 51.5150, E.inOut(clamp(lt / 3))), k: lerp(82000, 120000, E.inOut(clamp(lt / 3))) } });
    timeStamp(ctx, 'SUN 30 SEP · 1:00 AM', 90, 160, t, T('L027', 'Around'), { color: AMBER });
    vPin(ctx, pr, 'STRIDE', t, T('L027', 'Dutfield\'s'), 'DUTFIELD\'S YARD, BERNER ST');
    if (t > T('L027', 'She')) vcard(ctx, 2, 1580, 560, prog(t, T('L027', 'She'), T('L027', 'She') + .4), { w: 320, h: 500 });
    sourceTag(ctx, 'Streets: © OpenStreetMap contributors · portrait: Illustrated Police News, 6 Oct 1888');
  }, { name: 'stride' });
  cue(T('L027', 'Around') - .1, 'tick', .8); cue(T('L027', 'Dutfield\'s'), 'thud', .5);
  photoShot(['L027B', 'The'], 'berner', { grade: 'sepia', z0: 1.05, z1: 1.2, creditText: 'Berner Street & Dutfield\'s Yard, 1909 · public domain', draw: (ctx, t) => { fog(ctx, t, .4); ctx.fillStyle = 'rgba(8,10,20,.3)'; ctx.fillRect(0, 0, W, H);
    if (t > T('L027B', 'interrupted')) hand(ctx, 'interrupted?', 1200, 900, prog(t, T('L027B', 'interrupted'), T('L027B', 'killer', 'e')), { color: '#FF8A7A', size: 90 }); } });
  shot(['L028', 'Less'], (ctx, t, lt) => {
    const pr = streetMap(ctx, t, lt, { v: { lon: -0.0721, lat: 51.5145, k: 140000 } });
    const s = vPin(ctx, pr, 'STRIDE', t, 0, 'STRIDE', { color: 'rgba(200,50,42,.7)' });
    const e = pr(...PLACES.EDDOWES); route(ctx, s, e, prog(t, T('L028', 'Less'), T('L028', 'Catherine')), { color: AMBER, ctrl: [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2 - 120] });
    vPin(ctx, pr, 'EDDOWES', t, T('L028', 'Mitre'), 'MITRE SQUARE', { left: true });
    timeStamp(ctx, '< 1 HOUR · < 1 MILE', 90, 160, t, T('L028', 'Less'), { color: AMBER });
    if (t > T('L028', 'City')) kicker(ctx, 'CITY OF LONDON: A DIFFERENT POLICE FORCE', 90, 980, t, T('L028', 'City'), { color: '#5EA8FF' });
    if (t > T('L028', 'She')) vcard(ctx, 3, 1580, 560, prog(t, T('L028', 'She'), T('L028', 'She') + .4), { w: 320, h: 500 });
    sourceTag(ctx, 'Streets: © OpenStreetMap contributors · sites approximate');
  }, { name: 'eddowes' });
  cue(T('L028', 'Mitre'), 'thud', .5);
  shot(['L028B', 'Incredibly'], (ctx, t, lt) => {
    const pr = streetMap(ctx, t, lt, { v: { lon: -0.0790, lat: 51.5155, k: 160000 } });
    const b = vPin(ctx, pr, 'BISHOPSGATE', t, T('L028B', 'police'), 'BISHOPSGATE POLICE STATION', { color: '#5EA8FF' });
    const e = vPin(ctx, pr, 'EDDOWES', t, 0, 'MITRE SQUARE', { left: true });
    route(ctx, b, e, prog(t, T('L028B', 'Bishopsgate'), T('L028B', 'drunk', 'e')), { color: '#5EA8FF', ctrl: [(b[0] + e[0]) / 2 + 60, (b[1] + e[1]) / 2] });
    timeStamp(ctx, 'RELEASED ≈ 1:00 AM', 90, 160, t, T('L028B', 'one'), { color: '#9EC9FF' });
    if (t > T('L028B', 'drunk')) hand(ctx, 'held for being drunk', 220, 950, prog(t, T('L028B', 'drunk'), T('L028B', 'drunk', 'e') + .4), { color: '#9EC9FF', size: 66 });
  }, { name: 'bishopsgate' });
  shot(['L029', 'Two'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050403');
    imgCam(ctx, 'ipn_stride_eddowes', camAt([[0, 721, 200, 1.7], [3, 721, 330, 2.3]], lt), { grade: 'sepia', contain: true }); shade(ctx, .3);
    if (t > T('L029', 'double')) stamp(ctx, 'THE DOUBLE EVENT', W / 2, 900, t, T('L029', 'double'), { size: 140 });
    sourceTag(ctx, 'Illustrated Police News, 6 Oct 1888 · public domain');
  }, { name: 'double-event' });
  cue(T('L029', 'double'), 'stamp');
  dossier(['L029B', 'Near'], 'lawende', 'THE WITNESS', [['SAW', 'A WOMAN, POSSIBLY CATHERINE', 'L029B', 'woman'], ['WITH', 'A MAN OF ABOUT 30', 'L029B', 'thirty'], ['DETAIL', 'FAIR MOUSTACHE', 'L029B', 'fair']], ['LED NOWHERE', 'L029B', 'nowhere'], { credit: 'Joseph Lawende (later photo, 1899) · public domain' });
  shot(['L030', 'At'], (ctx, t, lt) => {
    const pr = streetMap(ctx, t, lt, { v: { lon: -0.0760, lat: 51.5150, k: 150000 } });
    vPin(ctx, pr, 'EDDOWES', t, 0, 'MITRE SQ', { left: true, color: 'rgba(200,50,42,.6)' }); const g = vPin(ctx, pr, 'GOULSTON', t, T('L030', 'Goulston'), 'GOULSTON STREET', { color: AMBER });
    timeStamp(ctx, '2:55 AM', 90, 160, t, T('L030', 'At'), { color: AMBER });
    if (t > T('L030', 'apron')) kicker(ctx, 'A PIECE OF HER APRON', 90, 240, t, T('L030', 'apron'), { color: AMBER });
    if (t > T('L030', 'chalk')) { ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 760, W, 260); hand(ctx, 'a message in chalk...', 160, 900, prog(t, T('L030', 'chalk'), T('L030', 'chalk') + .6), { color: '#F2EEE6', size: 90 }); }
  }, { name: 'goulston' });
  cue(T('L030', 'At') - .1, 'tick', .8);
  shot(['L031', 'In'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E0C0B', '#000'); const wipe = prog(t, T('L031', 'washed'), T('L031', 'dawn', 'e') + .3);
    ctx.save(); ctx.globalAlpha = 1 - E.in(wipe); imgCam(ctx, 'graffito', camAt([[0, 150, 150, .9], [4, 150, 150, 1.0]], lt), { grade: 'bw', contain: true }); ctx.restore();
    if (wipe > 0) { ctx.fillStyle = 'rgba(200,200,190,.12)'; for (let i = 0; i < 12; i++) ctx.fillRect(W * .2 + i * 100 * wipe, H * .2, 80, H * .6); }
    kicker(ctx, 'POLICE COPY OF THE CHALK MESSAGE', 90, 120, t, T('L031', 'In'));
    if (t > T('L031', 'Warren')) { const p = E.out(prog(t, T('L031', 'Warren'), T('L031', 'Warren') + .4)); ctx.save(); ctx.globalAlpha = p; card(ctx, 'warren_wall', { cx: 1580, cy: 560, maxW: 420, maxH: 560, rot: .04, filter: GRADES.sepia }); ctx.restore(); text(ctx, 'SIR CHARLES WARREN AT THE WALL (PRESS SKETCH)', 1580, 900, { font: F.osw, size: 22, color: PAL.cream, align: 'center', weight: 600, alpha: p }); }
    if (t > T('L031', 'washed')) stamp(ctx, 'WASHED AWAY', W / 2 - 200, 900, t, T('L031', 'washed'), { size: 120 });
    sourceTag(ctx, 'Metropolitan Police copy, 1888 · Illustrated Police News, 20 Oct 1888 · public domain');
  }, { name: 'graffito' });
  cue(T('L031', 'washed'), 'stamp');
  shot(['L032', 'A'], (ctx, t, lt) => {
    bgGrad(ctx, '#0E0C0B', '#000'); fog(ctx, t, .4);
    glowText(ctx, 'A POSSIBLE CLUE.', W / 2, 470, { font: F.bebas, size: 160, color: PAL.cream, align: 'center', alpha: prog(t, T('L032', 'A'), T('L032', 'A') + .3) });
    glowText(ctx, 'ERASED BY THE POLICE.', W / 2, 650, { font: F.bebas, size: 160, color: BLOODR, align: 'center', glow: 'rgba(200,40,30,.8)', alpha: prog(t, T('L032', 'erased'), T('L032', 'erased') + .3) });
  }, { name: 'erased' });
  cue(T('L032', 'erased'), 'hit', .7);
  letterShot(['L033', 'The'], 'saucy_front', [[0, 436, 264, 1.0], [3, 436, 264, 1.15]], { credit: '"Saucy Jacky" postcard, 1 Oct 1888 · public domain', draw: (ctx, t) => {
    if (IMG.saucy_back && t > T('L033', 'mentions')) { const p = E.out(prog(t, T('L033', 'mentions'), T('L033', 'mentions') + .4)); ctx.save(); ctx.globalAlpha = p; card(ctx, 'saucy_back', { cx: 1500, cy: 560, maxW: 480, maxH: 660, rot: .05, filter: GRADES.warm }); ctx.restore(); }
    if (t > T('L033', 'double')) kicker(ctx, '"DOUBLE EVENT"', 90, 980, t, T('L033', 'double'), { color: AMBER, size: 48 });
    if (t > T('L033', 'same')) kicker(ctx, 'SAME HANDWRITING?', 90, 1040, t, T('L033', 'same'), { color: '#FF8A7A', size: 40 }); } });
  shot(['L034', 'And'], (ctx, t, lt) => {
    const k = t < T('L034', 'receives');
    if (k) { bgGrad(ctx, '#151210', '#050403'); if (IMG.lusk) { photo(ctx, 'lusk', { x: 200, y: 140, w: 560, h: 760, grade: 'sepia', zoom: 1.02 + lt * .02 }); brackets(ctx, 180, 120, 600, 800, prog(t, T('L034', 'George'), T('L034', 'George') + .3), AMBER); }
      dataRow(ctx, 'NAME', 'GEORGE LUSK', 900, 400, t, T('L034', 'George')); dataRow(ctx, 'ROLE', 'HEAD OF THE VIGILANCE COMMITTEE', 900, 550, t, T('L034', 'head')); timeStamp(ctx, '16 OCTOBER 1888', 900, 260, t, T('L034', 'October'), { color: AMBER, size: 70 }); }
    else { photo(ctx, 'vig_box', { zoom: 1.1 + (t - T('L034', 'receives')) * .03, fx: .4, fy: .35, grade: 'sepia' }); shade(ctx, .3); gradeTop(ctx, .6);
      if (t > T('L034', 'kidney')) { stamp(ctx, 'HALF A HUMAN KIDNEY', W / 2, 960, t, T('L034', 'kidney'), { size: 100 }); } }
    sourceTag(ctx, k ? 'George Lusk, c.1885 · public domain' : 'Illustrated Police News, 27 Oct 1888 · public domain');
  }, { name: 'lusk' });
  cue(T('L034', 'receives'), 'paper'); cue(T('L034', 'kidney'), 'impact', .8);
  letterShot(['L035', 'The'], 'fromhell', [[0, 339, 486, .9], [2.5, 400, 70, 2.4]], { credit: '"From Hell" letter, Oct 1888 (police photograph) · public domain', draw: (ctx, t, lt, mp) => {
    if (t > T('L035', 'From')) { const [x, y] = mp(410, 58); penEllipse(ctx, x, y, 330, 110, prog(t, T('L035', 'From'), T('L035', 'Hell', 'e') + .3), { seed: 12, color: '#E8C76A', lw: 9 }); glowText(ctx, 'FROM HELL', W / 2, 980, { font: F.bebas, size: 150, color: '#F2E6D6', align: 'center', glow: 'rgba(220,30,20,.9)', alpha: prog(t, T('L035', 'From'), T('L035', 'Hell', 'e')) }); } } });
  cue(T('L035', 'From'), 'impact', .7);
  shot(['L036', 'Police'], (ctx, t, lt) => {
    bgGrad(ctx, '#1A1410', '#050403'); const keys = ['dearboss1', 'dearboss2', 'fromhell', 'saucy_front', 'saucy_back', 'police_notice'];
    for (let i = 0; i < 24; i++) { const st = T('L036', 'Police') + i * .09, p = E.out(prog(t, st, st + .6)); if (p <= 0) continue; ctx.save(); ctx.globalAlpha = .9;
      card(ctx, keys[i % keys.length], { cx: 160 + (i % 8) * 230 + (hash(i) - .5) * 60, cy: lerp(-400, 260 + Math.floor(i / 8) * 260, p), maxW: 230, maxH: 300, rot: (hash(i + 3) - .5) * .5, filter: GRADES.warm, mount: 6 }); ctx.restore(); }
    if (t > T('L036', 'hoaxes')) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H); stamp(ctx, 'MOSTLY HOAXES', W / 2, 460, t, T('L036', 'hoaxes'), { size: 140 }); }
    if (t > T('L036', 'journalist')) { typewriter(ctx, 'AUTHOR: A JOURNALIST?', 420, 760, t, T('L036', 'journalist'), 20, { size: 80, color: AMBER }); }
    sourceTag(ctx, 'Ripper letters · public domain');
  }, { name: 'letters' });
  typeCues('AUTHOR: A JOURNALIST?', T('L036', 'journalist'), 20, .6); cue(T('L036', 'hoaxes'), 'stamp');
  shot(['L037', 'If'], (ctx, t, lt) => {
    photo(ctx, 'ipn_oct20', { zoom: 1.6 + lt * .03, fy: .08, grade: 'sepia' }); shade(ctx, .55); fog(ctx, t, .3);
    bigTitle(ctx, 'INVENTED TO SELL NEWSPAPERS?', W / 2, 620, t, T('L037', 'invented'), { align: 'center', size: 120 });
    sourceTag(ctx, 'Illustrated Police News, 20 Oct 1888 · public domain');
  }, { name: 'press' });
  // ---------------- ACT 4: Miller's Court, the end
  shot(['L038', 'Friday'], (ctx, t, lt) => {
    const k = t < T('L038', 'Inside');
    if (k) { night(ctx, t, 'dorset', { zoom: 1.15 + lt * .03, fy: .5, tint: 'navy', tintAmt: .6 }); timeStamp(ctx, 'FRI 9 NOV · MORNING', 90, 160, t, T('L038', 'Friday'), { color: AMBER });
      if (IMG.millers_court && t > T('L038', 'Miller\'s')) { const p = E.out(prog(t, T('L038', 'Miller\'s'), T('L038', 'Miller\'s') + .4)); ctx.save(); ctx.globalAlpha = p; card(ctx, 'millers_court', { cx: 1520, cy: 560, maxW: 380, maxH: 600, rot: .03, filter: GRADES.sepia }); ctx.restore(); text(ctx, '13 MILLER\'S COURT (EXTERIOR)', 1520, 900, { font: F.osw, size: 26, color: PAL.cream, align: 'center', weight: 600, alpha: p }); }
      sourceTag(ctx, 'Dorset Street 1902 · Miller\'s Court c.1900 · public domain'); }
    else { bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, 600, 200, t, 600, .3); fog(ctx, t, .3);
      vcard(ctx, 4, 600, 560, prog(t, T('L038', 'Inside'), T('L038', 'Inside') + .4), { w: 380, h: 580, nameSize: 38 });
      dataRow(ctx, 'AGE', 'ABOUT 25', 1000, 330, t, T('L038', 'twenty'));
      dataRow(ctx, 'THE YOUNGEST', 'OF THE FIVE', 1000, 480, t, T('L038', 'youngest'));
      dataRow(ctx, 'THE ONLY ONE', 'KILLED INDOORS', 1000, 630, t, T('L038', 'indoors')); }
  }, { name: 'kelly' });
  shot(['L039', 'It'], (ctx, t, lt) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3); const g = ctx.createRadialGradient(W / 2, H / 2 + 120, 0, W / 2, H / 2 + 120, 420 * fl); g.addColorStop(0, 'rgba(255,190,110,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#EDE3CF'; ctx.fillRect(W / 2 - 14, H / 2 + 130, 28, 120); ctx.fillStyle = `rgba(255,200,110,${fl})`; ctx.beginPath(); ctx.ellipse(W / 2, H / 2 + 108, 10, 24 * fl, 0, 0, 7); ctx.fill();
    if (t > T('L039', 'won\'t')) text(ctx, 'WE WON\'T SHOW IT.', W / 2, 380, { font: F.bebas, size: 120, color: PAL.cream, align: 'center', alpha: prog(t, T('L039', 'won\'t'), T('L039', 'won\'t') + .4) });
  }, { name: 'respect' });
  dossier(['L040', 'The'], null, 'SIR CHARLES WARREN', [['ROLE', 'COMMISSIONER, METROPOLITAN POLICE', 'L040', 'Charles'], ['RESIGNED', '8 NOVEMBER 1888', 'L040', 'resigned']], ['RESIGNED', 'L040', 'resigned'], {});
  shot(['L041', 'And'], (ctx, t, lt) => {
    bgGrad(ctx, '#10141C', '#030405'); fog(ctx, t, .35); const a = T('L041', 'And');
    timelineBar(ctx, 560, [[0, 'NICHOLS', a], [8, 'CHAPMAN', a + .15], [30, 'STRIDE & EDDOWES', a + .3], [70, 'KELLY', a + .45]], -6, 100, t, a, { dot: BLOODR, fmt: d => ({ 0: '31 AUG', 8: '8 SEP', 30: '30 SEP', 70: '9 NOV' })[d] });
    if (t > T('L041', 'stopped')) { ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(1500, 520, 260, 80); glowText(ctx, 'THEN... SILENCE.', W / 2, 330, { font: F.bebas, size: 150, color: PAL.cream, align: 'center', alpha: prog(t, T('L041', 'stopped'), T('L041', 'stopped') + .3) }); }
  }, { name: 'stopped' });
  shot(['L042', 'Other'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050403'); ctx.save(); tilt3d(ctx, W / 2, H / 2, -.08); ctx.fillStyle = '#E9DFC9'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillRect(560, 70, 800, 940); ctx.shadowColor = 'transparent'; ctx.drawImage(paperTex('#E9DFC9', 81, 800, 940), 560, 70);
    text(ctx, 'THE WHITECHAPEL MURDERS', 620, 170, { font: F.type, size: 46, color: PAL.ink }); text(ctx, 'METROPOLITAN POLICE FILE · APR 1888 – FEB 1891', 620, 215, { font: F.mono, size: 22, color: PAL.red });
    const names = ['EMMA SMITH', 'MARTHA TABRAM', 'MARY ANN NICHOLS', 'ANNIE CHAPMAN', 'ELIZABETH STRIDE', 'CATHERINE EDDOWES', 'MARY JANE KELLY', 'ROSE MYLETT', 'ALICE McKENZIE', 'PINCHIN STREET TORSO', 'FRANCES COLES'];
    names.forEach((n, i) => { const st = T('L042', 'file') + i * .1; if (t < st) return; const canon = i >= 2 && i <= 6; text(ctx, `${String(i + 1).padStart(2, '0')}  ${n}`, 640, 300 + i * 62, { font: F.type, size: 38, color: PAL.ink });
      if (canon && t > T('L042', 'five')) highlighter(ctx, 630, 300 + i * 62 - 38, 620, 50, prog(t, T('L042', 'five') + (i - 2) * .1, T('L042', 'five') + (i - 2) * .1 + .3)); });
    ctx.restore(); kicker(ctx, '11 NAMES · 5 LINKED TO THE RIPPER', 90, 1000, t, T('L042', 'five'), { color: AMBER });
    sourceTag(ctx, 'Typographic recreation of the file\'s victim list');
  }, { name: 'file' });
  for (let i = 0; i < 11; i++) cue(T('L042', 'file') + i * .1, 'key', .9);
  // ---------------- ACT 5: suspects
  letterShot(['L043', 'So'], 'macnaghten', [[0, 227, 300, 1.0], [5, 227, 560, 1.4]], { credit: 'Macnaghten memorandum, 1894 · public domain', draw: (ctx, t) => {
    timeStamp(ctx, '23 FEBRUARY 1894', 90, 160, t, T('L043', '1894'), { color: AMBER, size: 70 }); kicker(ctx, 'THE MACNAGHTEN MEMORANDUM · 3 SUSPECTS', 90, 230, t, T('L043', 'memo'), { color: AMBER }); } });
  dossier(['L044', 'Montague'], 'druitt', 'MONTAGUE JOHN DRUITT', [['JOB', 'BARRISTER & TEACHER, AGE 31', 'L044', 'barrister'], ['FATE', 'FOUND DROWNED IN THE THAMES, DEC 1888', 'L044', 'drowned'], ['BUT', 'PLAYING CRICKET IN DORSET NEXT DAY', 'L044', 'cricket']], ['DOUBTFUL', 'L044', 'Dorset'], { credit: 'Druitt, c.1875 · public domain' });
  dossier(['L045', 'Michael'], 'ostrog', 'MICHAEL OSTROG', [['KNOWN FOR', 'CON MAN · DOZENS OF ALIASES', 'L045', 'con'], ['ALIBI', 'IN A FRENCH PRISON AT THE TIME', 'L045', 'French']], ['RULED OUT', 'L045', 'prison'], { credit: 'Ostrog, police photograph · public domain' });
  shot(['L046', 'And'], (ctx, t, lt) => {
    const k = t < T('L046', 'Two');
    gridBG(ctx, t, '#0A1322', 'rgba(255,90,72,.07)', 54, 3);
    if (k) { const bx = 200, by = 180, bw = 480, bh = 640; ctx.fillStyle = '#141C2A'; ctx.fillRect(bx, by, bw, bh); personIcon(ctx, bx + bw / 2, by + bh / 2 + 40, 5, '#2A3A55'); text(ctx, 'NO PHOTO EXISTS', bx + bw / 2, by + bh - 40, { font: F.mono, size: 26, color: 'rgba(200,220,255,.6)', align: 'center' });
      brackets(ctx, bx - 20, by - 20, bw + 40, bh + 40, prog(t, T('L046', 'Aaron'), T('L046', 'Aaron') + .3)); kicker(ctx, 'SUSPECT FILE', 800, 220, t, T('L046', 'Aaron')); bigTitle(ctx, 'AARON KOSMINSKI', 800, 360, t, T('L046', 'Aaron'), { size: 130 });
      dataRow(ctx, 'JOB', 'BARBER, WHITECHAPEL', 810, 460, t, T('L046', 'barber')); dataRow(ctx, 'FROM 1891', 'ASYLUM, UNTIL HIS DEATH IN 1919', 810, 575, t, T('L046', 'asylum')); }
    else { photo(ctx, 'colney', { zoom: 1.08 + lt * .02, grade: 'bw', tint: 'navy', tintAmt: .5 }); shade(ctx, .45);
      bigTitle(ctx, 'ANDERSON & SWANSON: "IT WAS HIM"', W / 2, 560, t, T('L046', 'Two'), { align: 'center', size: 100 }); text(ctx, 'COLNEY HATCH ASYLUM (MODERN PHOTO)', W / 2, 1000, { font: F.osw, size: 28, color: PAL.cream, align: 'center', weight: 600, ls: 4 }); sourceTag(ctx, cr('colney')); }
  }, { name: 'kosminski' });
  cue(T('L046', 'Aaron') - .1, 'whoosh', .6);
  shot(['L047', 'Others'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050403'); const a = T('L047', 'Francis'), b = T('L047', 'George');
    [['tumblety', 'FRANCIS TUMBLETY', 'AMERICAN QUACK DOCTOR · FLED 1888', a, 520], ['klosowski', 'GEORGE CHAPMAN', 'BARBER · LATER POISONED 3 WOMEN', b, 1400]].forEach(([k, n, d, st, cx]) => {
      const p = E.out(prog(t, st, st + .4)); if (p <= 0) return; ctx.save(); ctx.globalAlpha = p; card(ctx, k, { cx, cy: 470, maxW: 420, maxH: 560, rot: 0, filter: GRADES.sepia }); ctx.restore();
      text(ctx, n, cx, 860, { font: F.bebas, size: 80, color: PAL.cream, align: 'center', alpha: p }); text(ctx, d, cx, 910, { font: F.osw, size: 30, color: AMBER, align: 'center', weight: 500, ls: 2, alpha: p }); });
    if (t > T('L047', 'favourite')) stamp(ctx, 'ABBERLINE\'S PICK?', 1400, 220, t, T('L047', 'favourite'), { size: 70, color: '#E8C76A' });
    sourceTag(ctx, 'Press sketch (Tumblety, 1903) · George Chapman photograph · public domain');
  }, { name: 'tumblety-chapman' });
  shot(['L048', 'Even'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050403'); const a = T('L048', 'Walter'), b = T('L048', 'diary');
    [['sickert', 'WALTER SICKERT', 'PAINTER · LIKELY IN FRANCE', a, 520], ['maybrick', 'JAMES MAYBRICK', 'THE "DIARY": WIDELY SEEN AS A FORGERY', b, 1400]].forEach(([k, n, d, st, cx]) => {
      const p = E.out(prog(t, st, st + .4)); if (p <= 0) return; ctx.save(); ctx.globalAlpha = p; card(ctx, k, { cx, cy: 470, maxW: 420, maxH: 560, filter: GRADES.sepia }); ctx.restore();
      text(ctx, n, cx, 860, { font: F.bebas, size: 80, color: PAL.cream, align: 'center', alpha: p }); text(ctx, d, cx, 910, { font: F.osw, size: 30, color: AMBER, align: 'center', weight: 500, ls: 2, alpha: p }); });
    if (t > T('L048', 'forgery')) stamp(ctx, 'FORGERY?', 1400, 220, t, T('L048', 'forgery'), { size: 90 });
    sourceTag(ctx, 'Sickert, 1911 · Maybrick, The Graphic, 1889 · public domain');
  }, { name: 'sickert-maybrick' });
  cue(T('L048', 'forgery'), 'stamp', .7);
  // ---------------- ACT 6: DNA, today
  shot(['L049', 'Then'], (ctx, t, lt) => {
    bgGrad(ctx, '#06141A', '#000'); dnaHelix(ctx, 560, H / 2, t, 1.1);
    glowText(ctx, '2014', 1300, 380, { font: F.bebas, size: 220, color: '#7CE0FF', align: 'center', glow: 'rgba(80,200,255,.6)', alpha: prog(t, T('L049', '2014'), T('L049', '2014') + .3) });
    dataRow(ctx, 'CLAIM BY', 'AUTHOR RUSSELL EDWARDS', 1050, 520, t, T('L049', 'author'), { labelColor: 'rgba(124,224,255,.8)' });
    dataRow(ctx, 'SOURCE', 'A SHAWL "FROM MITRE SQUARE"', 1050, 650, t, T('L049', 'shawl'), { labelColor: 'rgba(124,224,255,.8)' });
    dataRow(ctx, 'POINTED TO', 'KOSMINSKI', 1050, 780, t, T('L049', 'Kosminski'), { labelColor: 'rgba(124,224,255,.8)', color: '#FF6B5B' });
    sourceTag(ctx, 'Illustration');
  }, { name: 'dna' });
  shot(['L050', 'Case'], (ctx, t, lt) => {
    bgGrad(ctx, '#06141A', '#000');
    text(ctx, 'CASE CLOSED?', W / 2, 220, { font: F.bebas, size: 150, color: PAL.cream, align: 'center', alpha: prog(t, T('L050', 'Case'), T('L050', 'Case') + .3) });
    [['NO SOLID PROOF THE SHAWL WAS AT MITRE SQUARE', 'proof'], ['THIS TYPE OF DNA CAN BE SHARED BY MANY PEOPLE', 'type'], ['2024: JOURNAL ISSUES "EXPRESSION OF CONCERN"', 'journal']].forEach(([s, w], i) => { const st = T('L050', w); if (t < st) return; const y = 420 + i * 150;
      penLine(ctx, 150, y - 50, 220, y + 10, prog(t, st, st + .2), { bow: 0, lw: 12 }); penLine(ctx, 220, y - 50, 150, y + 10, prog(t, st + .1, st + .3), { bow: 0, lw: 12 });
      text(ctx, s, 280, y, { font: F.bebas, size: 70, color: PAL.cream, alpha: prog(t, st, st + .2) }); });
    if (t > T('L050', 'concern')) stamp(ctx, 'DISPUTED', 1500, 960, t, T('L050', 'concern'), { size: 120 });
  }, { name: 'dna-doubts' });
  ['proof', 'type', 'journal'].forEach(w => cue(T('L050', w), 'thud', .6)); cue(T('L050', 'concern'), 'stamp');
  shot(['L051', 'Even'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, W / 2, 100, t, 700, .25);
    vcard(ctx, 3, 520, 560, prog(t, T('L051', 'Even'), T('L051', 'Even') + .4), { w: 360, h: 540 });
    timeStamp(ctx, '2025', 1000, 330, t, T('L051', '2025'), { color: AMBER, size: 110 });
    dataRow(ctx, 'WHO', 'A DESCENDANT OF CATHERINE EDDOWES', 1000, 470, t, T('L051', 'descendant'));
    dataRow(ctx, 'ASKS FOR', 'A NEW INQUEST · NAME THE KILLER IN COURT', 1000, 610, t, T('L051', 'inquest'));
  }, { name: 'inquest' });
  // ---------------- OUTRO
  shot(['L052', 'So'], (ctx, t, lt) => {
    night(ctx, t, 'iln_suspect', { zoom: 1.3 + lt * .03, fx: .3, fy: .45, tint: 'navy', tintAmt: .7, shade: .45, fog: .9 });
    [['FIVE WOMEN', 'Five'], ['TEN WEEKS', 'Ten'], ['A NAME FROM THE PRESS?', 'name'], ['A KILLER LOST IN THE FOG', 'killer']].forEach(([s, w], i) => { if (t > T('L052', w)) text(ctx, s, 120, 300 + i * 150, { font: F.bebas, size: 110, color: i === 3 ? AMBER : PAL.cream, alpha: prog(t, T('L052', w), T('L052', w) + .3) }); });
    sourceTag(ctx, 'Illustrated London News, 13 Oct 1888 · public domain');
  }, { name: 'summary' });
  shot(['L053', 'Their'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, W / 2, 80, t, 900, .3); fog(ctx, t, .25);
    const ws = ['Mary', 'Annie', 'Elizabeth', 'Catherine', 'Mary'];
    let k = 0; const starts = []; LINE.L053.words.forEach((w) => { if (w.w.replace(/[^A-Za-z]/g, '') === ws[k] && k < 5) { starts.push(w.s); k++; } });
    VICTIMS.forEach((v, i) => vcard(ctx, i, 230 + i * 365, 540, prog(t, (starts[i] ?? T('L053', 'Their')) - .1, (starts[i] ?? T('L053', 'Their')) + .4), { w: 320, h: 500 }));
  }, { name: 'names' });
  shot(['L054', 'Remember'], (ctx, t, lt) => {
    bgGrad(ctx, '#1B1612', '#060504', 'r'); gasGlow(ctx, W / 2, 80, t, 900, .3);
    VICTIMS.forEach((v, i) => vcard(ctx, i, 230 + i * 365, 470, 1, { w: 280, h: 440, line: false }));
    glowText(ctx, 'REMEMBER THEM.', W / 2, 860, { font: F.bebas, size: 130, color: PAL.cream, align: 'center', alpha: prog(t, T('L054', 'Remember'), T('L054', 'them', 'e')) });
    text(ctx, 'NOT HIM.', W / 2, 990, { font: F.bebas, size: 110, color: BLOODR, align: 'center', alpha: prog(t, T('L054', 'Not'), T('L054', 'him', 'e')) });
  }, { name: 'remember' });
  shot(['L055', 'This'], (ctx, t, lt) => {
    bgGrad(ctx, '#151210', '#050404', 'r'); lightLeak(ctx, t, .2, 19); fog(ctx, t, .4); dust(ctx, t, 50, .4);
    text(ctx, 'UNFILED FILMS', W / 2, 420, { font: F.play, size: 110, color: PAL.cream, align: 'center', weight: 800, ls: 4, alpha: prog(t, T('L055', 'This'), T('L055', 'This') + .5) });
    const lp = prog(t, T('L055', 'This') + .2, T('L055', 'This') + .8); ctx.fillStyle = PAL.gold; ctx.fillRect(W / 2 - 300 * lp, 460, 600 * lp, 4);
    if (t > T('L055', 'Who')) { const p = Math.max(0, E.back(prog(t, T('L055', 'Who'), T('L055', 'Who') + .3))); ctx.save(); ctx.translate(640, 680); ctx.scale(p, p); ctx.fillStyle = '#2A2622'; ctx.beginPath(); ctx.roundRect(-260, -70, 520, 140, 70); ctx.fill(); text(ctx, 'YOUR THEORY?', 0, 22, { font: F.bebas, size: 64, color: PAL.cream, align: 'center' }); ctx.restore(); }
    if (t > T('L055', 'subscribe')) { const p = Math.max(0, E.back(prog(t, T('L055', 'subscribe'), T('L055', 'subscribe') + .3))), cl = t > T('L055', 'subscribe') + .7; ctx.save(); ctx.translate(1280, 680); ctx.scale(p * (cl ? .95 : 1), p * (cl ? .95 : 1));
      ctx.fillStyle = cl ? '#3A3A3A' : '#E62117'; ctx.beginPath(); ctx.roundRect(-260, -70, 520, 140, 70); ctx.fill(); text(ctx, cl ? 'SUBSCRIBED ✓' : 'SUBSCRIBE', 0, 22, { font: F.bebas, size: 72, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .8);
  }, { name: 'end' });
  cue(T('L055', 'subscribe') + .7, 'key', 1.5);
}

// DNA double helix (drawn), rotating
function dnaHelix(ctx, cx, cy, t, s = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  for (let i = -18; i <= 18; i++) { const y = i * 22, a = i * .38 + t * 1.6, x1 = Math.sin(a) * 120, x2 = Math.sin(a + Math.PI) * 120, z = Math.cos(a);
    ctx.strokeStyle = `rgba(124,224,255,${.25 + .25 * (z + 1)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    ctx.fillStyle = z > 0 ? '#7CE0FF' : '#2F7FA0'; ctx.beginPath(); ctx.arc(x1, y, 8 + 3 * z, 0, 7); ctx.fill(); ctx.fillStyle = z < 0 ? '#FF6B5B' : '#9A3A32'; ctx.beginPath(); ctx.arc(x2, y, 8 - 3 * z, 0, 7); ctx.fill(); }
  ctx.restore();
}
