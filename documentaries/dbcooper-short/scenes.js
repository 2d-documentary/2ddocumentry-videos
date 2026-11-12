// D.B. Cooper in 60 seconds — vertical 1080x1920 Short / Reel. Uses the dbcooper asset set.
'use strict';
const EP = {
  images: { vault_p1: 'archives/documents/vault1_p1.jpg', vault_p3: 'archives/documents/vault1_p3.jpg', vault_p5: 'archives/documents/vault1_p5.jpg' },
  credit: {}, captions: true, captionY: 1520, captionSize: 104,
  scenes,
};
const PLACES = { PDX: [-122.597, 45.589], SEA: [-122.309, 47.449], JUMP: [-122.56, 45.95], RENO: [-119.768, 39.499], TENA: [-122.77, 45.72] };
const CX = 540; // centre x

function topTag(ctx, s, t, t0, color) { kicker(ctx, s, 70, 210, t, t0, { color: color || PAL.red2, size: 40 }); }
function brand(ctx) { text(ctx, 'UNFILED FILMS', CX, 110, { font: F.play, size: 34, color: 'rgba(244,236,220,.75)', align: 'center', weight: 700, ls: 5 }); }

function scenes() {
  // S01 — date, the man, the plane, the note
  shot(['S01', 'In'], (ctx, t, lt) => {
    photo(ctx, 'plane_pd', { zoom: 1.1 + lt * .03, blur: 5, grade: 'duo', tint: 'navy', tintAmt: .9 }); shade(ctx, .4, '6,10,20'); lightLeak(ctx, t, .3, 2); dust(ctx, t, 40, .4);
    glowText(ctx, '1971', CX, 760, { font: F.bebas, size: 360, color: PAL.cream, align: 'center', alpha: prog(t, T('S01', 'In'), T('S01', 'In') + .3) });
    kicker(ctx, 'PORTLAND, OREGON · NOV 24', 200, 860, t, T('S01', 'In') + .2, { color: PAL.gold, size: 40 });
    fadeIn(ctx, t, 0, .4);
  }, { lead: .35, name: 's-date' });
  cue(T('S01', 'In'), 'impact', .6);
  shot(['S01', 'man'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0A1322', 'rgba(255,90,72,.08)', 54, 4);
    photo(ctx, 'sketch_a', { x: 140, y: 260, w: 800, h: 1000, zoom: 1.02 + lt * .02, grade: 'duo', tint: 'red', tintAmt: .35 });
    scanBeam(ctx, 140, 260, 800, 1000, prog(t, T('S01', 'man'), T('S01', 'man') + 1.2)); brackets(ctx, 120, 240, 840, 1040, prog(t, T('S01', 'man'), T('S01', 'man') + .3));
    topTag(ctx, 'FBI SKETCH · UNSUB', t, T('S01', 'man'));
    if (t > T('S01', 'hijacked')) { const p = E.out(prog(t, T('S01', 'hijacked'), T('S01', 'hijacked') + .35)); ctx.save(); ctx.globalAlpha = p; card(ctx, 'plane', { cx: CX, cy: lerp(1500, 1180, p), maxW: 900, maxH: 420, rot: -.03, filter: GRADES.warm }); ctx.restore();
      stamp(ctx, 'HIJACKED', CX, 1000, t, T('S01', 'hijacked') + .1, { size: 120 }); }
    sourceTag(ctx, 'FBI composite sketch · public domain');
  }, { name: 's-man' });
  cue(T('S01', 'man') - .1, 'whoosh'); cue(T('S01', 'hijacked') + .1, 'stamp');
  shot(['S01', 'briefcase'], (ctx, t, lt) => {
    bgGrad(ctx, '#15100C', '#000', 'r');
    punch(ctx, 'A BRIEFCASE.', CX, 600, t, T('S01', 'briefcase'), { font: F.bebas, size: 170, color: PAL.cream });
    punch(ctx, 'A NOTE.', CX, 800, t, T('S01', 'note'), { font: F.bebas, size: 170, color: '#FF4A3A' });
  }, { name: 's-items' });
  cue(T('S01', 'briefcase'), 'hit', .6); cue(T('S01', 'note'), 'hit', .7);
  // S02 — the note
  shot(['S02', 'Miss'], (ctx, t, lt) => {
    bgGrad(ctx, '#15100C', '#000', 'r');
    ctx.save(); ctx.translate(CX, 800); ctx.rotate(-.04); const z = 1 + lt * .04; ctx.scale(z, z);
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; ctx.fillStyle = PAL.cream; ctx.fillRect(-460, -300, 920, 600); ctx.shadowColor = 'transparent'; ctx.drawImage(paperTex(PAL.cream, 21, 920, 600), -460, -300);
    hand(ctx, 'MISS —', -400, -140, prog(t, T('S02', 'Miss') - .05, T('S02', 'Miss') + .3), { color: PAL.ink, size: 110, rot: 0 });
    hand(ctx, 'I HAVE A BOMB.', -400, 40, prog(t, T('S02', 'I'), T('S02', 'bomb', 'e')), { color: PAL.ink, size: 120, rot: 0 });
    const bp = prog(t, T('S02', 'bomb'), T('S02', 'bomb') + .3); if (bp > 0) { ctx.shadowColor = '#ff2a1a'; ctx.shadowBlur = 40; penLine(ctx, -110, 70, 340, 62, bp, { lw: 12 }); }
    ctx.restore(); glitch(ctx, t, Math.abs(t - T('S02', 'bomb')) < .15 ? 1 : 0);
    sourceTag(ctx, 'Wording as recalled by the crew · recreation');
  }, { name: 's-note' });
  cue(T('S02', 'Miss') - .1, 'paper'); cue(T('S02', 'bomb'), 'impact', .8);
  // S03 — demands
  shot(['S03', 'He'], (ctx, t, lt) => {
    photo(ctx, 'seafirst', { zoom: 1.1 + lt * .03, grade: 'warm', blur: 2 }); shade(ctx, .6, '10,8,4'); lightLeak(ctx, t, .2, 6);
    if (IMG.bill20c) moneyRain(ctx, t, T('S03', '$200,000'), 'bill20c', [8, 155, 298, 126], 30, { size: 260, spread: 1.2 });
    const cp = E.out(prog(t, T('S03', '$200,000') - .1, T('S03', '$200,000', 'e') + .4));
    glowText(ctx, '$' + (Math.round(200000 * cp / 20) * 20).toLocaleString('en-US'), CX, 620, { font: F.bebas, size: 230, color: '#FFD86B', align: 'center', glow: 'rgba(255,190,60,.7)' });
    for (let k = 0; k < 4; k++) chuteIcon(ctx, 170 + k * 245, 900, .95, prog(t, T('S03', 'four') + k * .1, T('S03', 'four') + k * .1 + .3), { t });
    if (t > T('S03', 'got')) stamp(ctx, 'HE GOT THEM', CX, 1250, t, T('S03', 'got'), { size: 120, color: '#3DDC6E' });
  }, { name: 's-demands' });
  cue(T('S03', '$200,000') - .1, 'cash'); cue(T('S03', 'got'), 'stamp');
  // S04 — passengers
  shot(['S04', 'Most'], (ctx, t, lt) => {
    bgGrad(ctx, '#0F1B2D', '#04070C'); const a = T('S04', 'Most');
    for (let i = 0; i < 35; i++) { const p = prog(t, a + i * .03, a + i * .03 + .4); const x = 150 + (i % 7) * 130, y = 420 + Math.floor(i / 7) * 150;
      personIcon(ctx, x, y + (1 - E.back(p)) * 40, 1.5 * Math.max(0, p), PAL.cream); }
    text(ctx, '35 PASSENGERS', CX, 330, { font: F.bebas, size: 120, color: PAL.cream, align: 'center' });
    hand(ctx, 'wait... what hijacking?', 160, 1260, prog(t, T('S04', 'never'), T('S04', 'hijacked', 'e')), { color: '#FFD23F', size: 80 });
  }, { name: 's-pax' });
  // S05 — the jump
  shot(['S05', 'Then'], (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / 3)); const pr = drawGeo(ctx, GEO_PNW, { lon: -122.4, lat: lerp(46.9, 46.5, u), k: lerp(330, 400, u), theme: 'night' }, [['WASHINGTON', -121.0, 47.4]]);
    rain(ctx, t, .8); lightning(ctx, t, [T('S05', 'forests')]);
    const sea = pr(...PLACES.SEA), jump = pr(...PLACES.JUMP); pinMap(ctx, pr, 'SEA', t, T('S05', 'Then'), 'SEATTLE');
    route(ctx, sea, jump, prog(t, T('S05', 'Then'), T('S05', 'lowered')), { plane: true, ctrl: [sea[0] + 60, (sea[1] + jump[1]) / 2] });
    text(ctx, '8:13 PM', CX, 300, { font: F.bebas, size: 200, color: PAL.cream, align: 'center' });
    if (t > T('S05', 'lowered')) penEllipse(ctx, jump[0], jump[1], 90, 70, prog(t, T('S05', 'lowered'), T('S05', 'stairs', 'e')), { seed: 5, color: '#FF6B5B' });
  }, { name: 's-map' });
  cue(T('S05', 'forests'), 'impact', .5);
  shot(['S05', 'Boeing'], (ctx, t, lt) => {
    gridBG(ctx, t, '#0B2340', 'rgba(140,190,255,.14)', 56, 8); rain(ctx, t, .35);
    const stair = E.inOut(prog(t, T('S05', 'Boeing'), T('S05', 'jumped')));
    b727(ctx, CX + 70, 760, .62, { stair, gear: true });
    text(ctx, 'AFT AIRSTAIR', CX, 330, { font: F.bebas, size: 120, color: '#FF4A3A', align: 'center' });
    if (t > T('S05', 'jumped')) { const p = prog(t, T('S05', 'jumped'), T('S05', 'night', 'e') + .3); chuteIcon(ctx, CX - 190 - p * 80, 830 + p * 420, .55, p * 3, { t, fill: '#FF4A3A' });
      ctx.fillStyle = `rgba(0,0,0,${E.in(prog(t, T('S05', 'night') - .1, T('S05', 'night', 'e') + .3))})`; ctx.fillRect(0, 0, W, H); }
  }, { name: 's-stair' });
  cue(T('S05', 'jumped'), 'whoosh', 1.3);
  // S06 — the hunt
  shot(['S06', 'The'], (ctx, t, lt) => {
    const sp = T('S06', 'Spy'), so = T('S06', 'Soldiers'), mo = T('S06', 'More');
    if (t < sp) { bgGrad(ctx, '#1B1E24', '#07080A'); ['vault_p1', 'vault_p3', 'vault_p5'].forEach((k, i) => { const p = E.out(prog(t, T('S06', 'The') + i * .2, T('S06', 'The') + i * .2 + .5)); if (p <= 0) return; ctx.save(); ctx.globalAlpha = p;
        card(ctx, k, { cx: 300 + i * 240, cy: lerp(2200, 900, p), maxW: 420, maxH: 560, rot: (i - 1) * .08, filter: GRADES.bw }); ctx.restore(); });
      text(ctx, '45 YEARS', CX, 380, { font: F.bebas, size: 220, color: PAL.cream, align: 'center', alpha: prog(t, T('S06', 'forty'), T('S06', 'forty') + .3) }); }
    else if (t < so) { photo(ctx, 'sr71', { zoom: 1.1 + (t - sp) * .05, grade: 'color' }); scanlines(ctx, .12); text(ctx, 'SPY PLANES', CX, 380, { font: F.bebas, size: 170, color: '#7CFF9B', align: 'center' }); }
    else if (t < mo) { photo(ctx, 'forest', { zoom: 1.2 + (t - so) * .05, grade: 'night', tint: 'teal', tintAmt: .6 }); rain(ctx, t, .6); text(ctx, 'SOLDIERS IN THE WOODS', CX, 380, { font: F.bebas, size: 120, color: PAL.cream, align: 'center' }); }
    else { bgGrad(ctx, '#111827', '#05070C'); const p = E.out(prog(t, mo, mo + 1.2)); for (let i = 0; i < 800; i++) { const x = 105 + (i % 25) * 36, y = 520 + Math.floor(i / 25) * 26; ctx.fillStyle = i < 800 * p ? '#E8402F' : 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); }
      counter(ctx, 800 * p, CX, 420, { suffix: '+ SUSPECTS', size: 140, align: 'center' }); }
  }, { name: 's-hunt' });
  ['Spy', 'Soldiers', 'More'].forEach(w => cue(T('S06', w), 'whoosh', .6));
  // S07 — money found
  shot(['S07', 'In'], (ctx, t, lt) => {
    photo(ctx, 'money', { zoom: 1.2 + lt * .04, grade: 'color' }); gradeTop(ctx, .55);
    text(ctx, '1980', CX, 330, { font: F.bebas, size: 200, color: PAL.cream, align: 'center' });
    kicker(ctx, 'AN 8-YEAR-OLD BOY · TENA BAR', 120, 450, t, T('S07', 'eight'), { color: PAL.gold, size: 40 });
    if (t > T('S07', 'money')) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 980, W, 260); counter(ctx, 5800 * E.out(prog(t, T('S07', 'money'), T('S07', 'river', 'e'))), CX, 1180, { prefix: '$', size: 200, align: 'center', color: '#FFD86B' }); }
    sourceTag(ctx, 'Ransom bills found 1980 · FBI, public domain');
  }, { name: 's-money' });
  cue(T('S07', 'money'), 'cash');
  // S08 — never found
  shot(['S08', 'But'], (ctx, t, lt) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    photo(ctx, 'sketch_color', { x: 0, y: 200, w: W, h: 1250, zoom: 1.05 + lt * .05, fy: .4, grade: 'duo', tint: 'navy', tintAmt: .5, alpha: .85 });
    const g = ctx.createLinearGradient(0, 200, 0, 1450); g.addColorStop(0, '#000'); g.addColorStop(.2, 'rgba(0,0,0,0)'); g.addColorStop(.8, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); ctx.fillStyle = g; ctx.fillRect(0, 200, W, 1250);
    if (t > T('S08', 'Never')) stamp(ctx, 'NEVER FOUND', CX, 360, t, T('S08', 'Never'), { size: 140 });
    dust(ctx, t, 60, .5);
  }, { name: 's-never' });
  cue(T('S08', 'Never'), 'stamp');
  // S09 — the name is a mistake
  shot(['S09', 'Because'], (ctx, t, lt) => {
    bgGrad(ctx, '#151515', '#000', 'r');
    ctx.save(); ctx.translate(CX, 620); text(ctx, 'D.B.', 0, -110, { font: F.bebas, size: 300, color: PAL.cream, align: 'center', base: 'middle' }); text(ctx, 'COOPER', 0, 160, { font: F.bebas, size: 260, color: PAL.cream, align: 'center', base: 'middle' });
    const sp = prog(t, T('S09', 'mistake'), T('S09', 'mistake') + .35); penLine(ctx, -230, -100, 230, -130, sp, { lw: 16, bow: 0, color: '#FF3B2B' }); penLine(ctx, -230, -170, 230, -50, sp, { lw: 16, bow: 0, color: '#FF3B2B' });
    hand(ctx, 'a reporter\'s mistake', -330, 400, prog(t, T('S09', 'reporter\'s'), T('S09', 'mistake', 'e')), { color: '#FF3B2B', size: 80 }); ctx.restore();
  }, { name: 's-name' });
  cue(T('S09', 'mistake'), 'scribble', 1.1);
  // S10 — CTA
  shot(['S10', 'So'], (ctx, t, lt) => {
    photo(ctx, 'sketch_color', { zoom: 1.4, fy: .35, grade: 'duo', tint: 'red', alpha: .4 }); shade(ctx, .55, '8,6,6'); lightLeak(ctx, t, .3, 9);
    glowText(ctx, '?', CX, 520, { font: F.bebas, size: 420, color: '#FF4A3A', align: 'center', base: 'middle', alpha: prog(t, T('S10', 'So'), T('S10', 'survive', 'e')) });
    if (t > T('S10', 'full')) { bigTitle(ctx, 'THE MAN WHO', CX, 850, t, T('S10', 'full'), { align: 'center', size: 140 }); bigTitle(ctx, 'VANISHED', CX, 990, t, T('S10', 'full') + .2, { align: 'center', size: 160 });
      text(ctx, 'FULL DOCUMENTARY ON THE CHANNEL', CX, 1080, { font: F.osw, size: 40, color: PAL.gold, align: 'center', weight: 600, ls: 4, alpha: prog(t, T('S10', 'story'), T('S10', 'story') + .3) }); }
    if (t > T('S10', 'Unfiled')) { const p = E.back(prog(t, T('S10', 'Unfiled'), T('S10', 'Unfiled') + .3)); ctx.save(); ctx.translate(CX, 1280); ctx.scale(Math.max(0, p), Math.max(0, p)); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-280, -70, 560, 140, 70); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 25, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .5);
  }, { name: 's-cta' });
  cue(T('S10', 'full'), 'impact', .8);
  // constant brand bug
  const _draw = SHOTS.map(s => s.draw); SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _draw[i](ctx, t, lt, sh); brand(ctx); }; });
}
