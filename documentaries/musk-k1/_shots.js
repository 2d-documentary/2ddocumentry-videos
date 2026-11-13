function scenes() {
  const tag = (ctx, k, extra) => { const c = credit(k, extra); if (c) sourceTag(ctx, c.length > 70 ? c.slice(0, 68) + '…' : c); };
  const ILL = 'Illustrative · Starship test footage, NASA';
  const ILL2 = 'Illustrative · SpaceX launch 2024, CC BY 3.0';
  const jump = (lt, at = .55) => lt > at ? 1.1 : 1;                 // cut-in punch inside a shot
  const W0 = (id, i) => LINE[id].words[i].s;
  const wall1 = ['p_2006', 'p_2008', 'p_2008b', 'p_2008c', 'f1_omelek', 'p_roadster08', 'p_griffin', 'p_tesla07', 'f1_2009', 'lehman', 'modelS', 'p_obama'];
  const wall2 = ['starship_ift5', 'falconheavy', 'p_model3', 'nasdaq26', 'p_twitter', 'p_starship', 'f9_arc', 'dragon_iss', 'p_ted', 'p_laugh', 'p_bolden', 'p_2015'];

  // ---- K01 hook
  shot(['K01', 'Elon'], (ctx, t, lt) => { kPhoto(ctx, 'p_2006', lt, { z0: 1.2 * jump(lt, .7), grade: 'ink', fy: .35 }); kGrade(ctx, t); tag(ctx, 'p_2006'); kIn(ctx, lt, 'black', .35); }, { lead: .4 });
  shot(['K01', 'about'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008', lt, { z0: 1.3, zs: .08, grade: 'mood', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_2008'); kIn(ctx, lt, 'blur'); });
  shot(['K01', 'everything'], (ctx, t, lt) => { photoWall(ctx, t, wall1, { pan: 1.5 }); kGrade(ctx, t, { bloom: .35 }); kIn(ctx, lt, 'flash'); });
  // ---- K02 2008
  shot(['K02', 'It\'s'], (ctx, t, lt) => { bigWord(ctx, '2008', lt); kIn(ctx, lt, 'bar'); }, { cap: false });
  // ---- K03
  shot(['K03', 'His'], (ctx, t, lt) => { kPhoto(ctx, 'f1_omelek', lt, { z0: 1.15 * jump(lt, .8), grade: 'cine' }); kGrade(ctx, t); tag(ctx, 'f1_omelek'); kIn(ctx, lt, 'pix'); });
  shot(['K03', 'reach'], (ctx, t, lt) => { clipFrame(ctx, 'up', 35, lt, { z0: 1.2, grade: 'cine' }); kGrade(ctx, t, { bloom: .4 }); sourceTag(ctx, ILL); kIn(ctx, lt, 'blur'); });
  shot(['K03', 'three'], (ctx, t, lt, sh) => { bgGrad(ctx, '#0B0E16', '#000', 'r'); hudRockets(ctx, t, sh.start + .05, CX - 150, 1180); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { capY: .32 });
  // ---- K04 Boom x3
  [['boom', 0], ['boom2', 0], ['boom', 14]].forEach(([c, f], i) => {
    shot(W0('K04', i) - .06, (ctx, t, lt) => { clipFrame(ctx, c, 32, lt, { from: f, z0: 1.25 + i * .1, grade: 'cine', shake: 26 }); kGrade(ctx, t, { bloom: .5 }); sourceTag(ctx, ILL); kIn(ctx, lt, i === 1 ? 'glitch' : 'flash', .16); }, { capY: .5 });
    cue(W0('K04', i), 'impact', .9);
  });
  // ---- K05 Tesla / economy
  shot(['K05', 'Tesla'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.15 * jump(lt), grade: 'mood' }); kGrade(ctx, t); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'bar'); });
  shot(['K05', 'bleeding'], (ctx, t, lt, sh) => { bgGrad(ctx, '#3A0806', '#000', 'r'); moneyRain(ctx, t, sh.start, 'bill100', EP.billCrop, 46, { spread: .8 }); shade(ctx, .25, '60,0,0'); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { capY: .5 });
  cue(T('K05', 'bleeding'), 'cash', .8);
  shot(['K05', 'economy'], (ctx, t, lt) => { kPhoto(ctx, 'lehman', lt, { z0: 1.2, zs: .1, grade: 'ink' }); kGrade(ctx, t); tag(ctx, 'lehman'); kIn(ctx, lt, 'pix'); });
  shot(['K05', 'collapsing'], (ctx, t, lt) => { headline(ctx, lt, ['SEPTEMBER 15, 2008', 'Lehman Brothers', 'files for', 'bankruptcy'], { kicker: true, hl: [3, 'bankruptcy'], y: .3, size: 100, x: 70 }); kIn(ctx, lt, 'flash'); }, { capDark: true, capY: .8 });
  cue(T('K05', 'collapsing'), 'paper', .7);
  // ---- K06 Mars / rent
  shot(['K06', 'man'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008c', lt, { z0: 1.2 * jump(lt, .9), grade: 'mood', fy: .35 }); kGrade(ctx, t); tag(ctx, 'p_2008c'); kIn(ctx, lt, 'blur'); });
  shot(['K06', 'Mars'], (ctx, t, lt) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(ctx, t, 140, 3); photo(ctx, 'mars', { x: W * .08, y: H * .3, w: W * .84, h: W * .84, zoom: 1 + lt * .04, grade: 'cine' }); kGrade(ctx, t, { bloom: .45 }); tag(ctx, 'mars'); kIn(ctx, lt, 'flash'); }, { capY: .72 });
  shot(['K06', 'borrowing'], (ctx, t, lt, sh) => {
    desk(ctx, t); const s0 = sh.start;
    polaroid(ctx, 'p_2008', 300, 560, 420, -.1, prog(t, s0, s0 + .25), { label: 'Elon, 2008' });
    polaroid(ctx, 'p_2008b', 800, 760, 380, .12, prog(t, s0 + .2, s0 + .45));
    cashStack(ctx, 760, 1400, .9, 2);
    sticky(ctx, 'RENT\nDUE', 300, 1300, -.08, prog(t, s0 + .45, s0 + .7));
    yString(ctx, [300, 400], [800, 600], prog(t, s0 + .3, s0 + .7)); yString(ctx, [800, 600], [300, 1170], prog(t, s0 + .6, s0 + 1));
    kGrade(ctx, t); kIn(ctx, lt, 'bar');
  }, { capY: .5 });
  shot(['K06', 'pay'], (ctx, t, lt) => { bigWord(ctx, 'rent.', lt, { italic: true }); kIn(ctx, lt, 'flash', .1); }, { cap: false });
  cue(T('K06', 'rent'), 'thud', .8);
  // ---- K07 one more launch
  shot(['K07', 'He'], (ctx, t, lt, sh) => { desk(ctx, t, { a: '#1C1610' }); const n = Math.max(1, 6 - Math.floor(lt * 5)); cashStack(ctx, CX, 1100, 1.6, n); kGrade(ctx, t); kIn(ctx, lt, 'pix'); }, { capY: .35 });
  cue(T('K07', 'money'), 'cash', .6);
  shot(['K07', 'launch'], (ctx, t, lt) => { kPhoto(ctx, 'f1_flight4', lt, { z0: 1.35, zs: .06, grade: 'mood', shade: .25 }); kGrade(ctx, t); tag(ctx, 'f1_flight4'); kIn(ctx, lt, 'blur'); });
  shot(['K07', 'Just'], (ctx, t, lt) => { bigWord(ctx, 'one.', lt, { italic: true }); kIn(ctx, lt, 'bar'); }, { cap: false });
  cue(T('K07', 'Just'), 'impact', .8);
  // ---- K08 Sept 28
  shot(['K08', 'September'], (ctx, t, lt) => { calendarPage(ctx, lt, 'SEPTEMBER', 28, { year: '2008', start: 1, len: 30 }); kIn(ctx, lt, 'flash'); }, { capY: .88 });
  cue(T('K08', 'September') + .35, 'scribble', .6);
  shot(['K08', 'Falcon'], (ctx, t, lt) => { const s = (hash(Math.floor(t * 30)) - .5) * 14; ctx.save(); ctx.translate(s, s * .6); kPhoto(ctx, 'f1_flight4', lt, { z0: 1.12, zs: .12, grade: 'cine', fy: .55 }); ctx.restore(); embers(ctx, t, .5); kGrade(ctx, t, { bloom: .5 }); tag(ctx, 'f1_flight4'); kIn(ctx, lt, 'flash'); });
  cue(T('K08', 'Falcon'), 'riser', .8);
  shot(['K08', 'lifts'], (ctx, t, lt) => { clipFrame(ctx, 'rise', 38, lt, { z0: 1.6, fx: .42, fy: .55, grade: 'cine', speed: 1.2 }); kGrade(ctx, t, { bloom: .5 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'blur'); });
  // ---- K09 orbit
  shot(['K09', 'this'], (ctx, t, lt) => { orbitRing(ctx, t, lt); kGrade(ctx, t, { bloom: .4 }); kIn(ctx, lt, 'bar'); }, { capY: .42 });
  cue(T('K09', 'orbit'), 'ding', .8);
  // ---- K10 NASA
  shot(['K10', 'Three'], (ctx, t, lt) => { calendarPage(ctx, lt, 'DECEMBER', 23, { year: '2008', start: 1 }); kIn(ctx, lt, 'flash'); }, { capY: .88 });
  shot(['K10', 'NASA'], (ctx, t, lt) => { kPhoto(ctx, 'p_griffin', lt, { z0: 1.2 * jump(lt, .6), grade: 'mood' }); kGrade(ctx, t); tag(ctx, 'p_griffin'); kIn(ctx, lt, 'pix'); });
  cue(T('K10', 'NASA'), 'ding', .5);
  shot(['K10', 'A'], (ctx, t, lt) => { glowNum(ctx, 0, 1600000000, lt, { pre: '$', y: .42, dur: 1.2 }); kIn(ctx, lt, 'bar'); }, { capY: .6 });
  cue(T('K10', 'A') + .1, 'riser', .5);
  // ---- K11 Christmas Eve
  shot(['K11', 'next'], (ctx, t, lt) => { calendarPage(ctx, lt, 'DECEMBER', 24, { year: '2008', start: 1 }); snow(ctx, t, 90); kIn(ctx, lt, 'flash'); }, { capY: .88 });
  shot(['K11', 'Tesla'], (ctx, t, lt) => { headline(ctx, lt, ['DECEMBER 24, 2008', 'Tesla closes', 'a $40 million', 'funding round'], { kicker: true, hl: [2, '$40 million'], y: .3, size: 100, x: 70 }); kIn(ctx, lt, 'flash'); }, { capDark: true, capY: .8 });
  cue(T('K11', 'Tesla'), 'paper', .7);
  shot(['K11', 'days'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.3, grade: 'ink', shade: .45 }); stamp(ctx, 'BANKRUPT', CX, 700, t, T('K11', 'bankrupt') - .05, { size: 130, color: '#D7261E' }); bigX(ctx, CX, 700, 300, prog(t, T('K11', 'bankrupt') + .35, T('K11', 'bankrupt') + .8)); kGrade(ctx, t); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'blur'); }, { capY: .55 });
  cue(T('K11', 'bankrupt'), 'stamp', .9);
  // ---- K12 Merry Christmas
  shot(['K12', 'Merry'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008b', lt, { z0: 1.15, grade: 'warm', fy: .35 }); lightLeak(ctx, t, .35); snow(ctx, t, 110); kGrade(ctx, t, { bloom: .4 }); tag(ctx, 'p_2008b'); kIn(ctx, lt, 'flash'); }, { capY: .7 });
  cue(T('K12', 'Merry'), 'ding', .6);
  // ---- K13 trillionaire
  shot(['K13', 'Today'], (ctx, t, lt) => { kPhoto(ctx, 'p_royal', lt, { z0: 1.2 * jump(lt, .7), grade: 'cine', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_royal'); kIn(ctx, lt, 'bar'); });
  shot(['K13', 'almost'], (ctx, t, lt) => { photoWall(ctx, t, wall2, { pan: -1.6 }); kGrade(ctx, t, { bloom: .35 }); kIn(ctx, lt, 'flash'); });
  shot(['K13', 'first'], (ctx, t, lt, sh) => { glowNum(ctx, 0, 1e12, lt, { pre: '$', y: .4, dur: 1.3 }); moneyRain(ctx, t, sh.start + .5, 'bill100', EP.billCrop, 34, { spread: 1.2 }); kIn(ctx, lt, 'pix'); }, { capY: .62 });
  cue(T('K13', 'first') + .5, 'cash', .7);
  // ---- K14 one last rocket
  shot(['K14', 'All'], (ctx, t, lt) => { kPhoto(ctx, 'f1_flight4', lt, { z0: 1.05, zs: .06, grade: 'cine' }); lightLeak(ctx, t, .3); kGrade(ctx, t); tag(ctx, 'f1_flight4'); kIn(ctx, lt, 'blur'); });
  shot(['K14', 'rocket'], (ctx, t, lt) => { clipFrame(ctx, 'ign', 35, lt, { z0: 1.7, fx: .48, fy: .6, grade: 'cine' }); kGrade(ctx, t, { bloom: .55 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'flash'); });
  cue(T('K14', 'rocket'), 'impact', .7);
  // ---- K15 CTA
  shot(['K15', 'The'], (ctx, t, lt) => {
    bgGrad(ctx, '#0A0C14', '#000', 'r'); stars(ctx, t, 120, 2, .5);
    const p = E.out(prog(lt, 0, .4));
    text(ctx, 'the full story', CX, 820, { font: F.playI, size: 64, color: '#fff', align: 'center', alpha: p, shadow: 20 });
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, .35, .8)); glowText(ctx, 'Unfiled Films', CX, 960, { font: F.play, size: 128, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.8)', blur: 50 }); ctx.restore();
    const tw = T('K15', 'Films'); if (t > tw - .1) { const q = Math.max(0, E.back(prog(t, tw - .1, tw + .2))); ctx.save(); ctx.translate(CX, 1180); ctx.scale(q, q); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-250, -62, 500, 124, 62); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 26, { font: F.osw, size: 64, color: '#fff', align: 'center', weight: 600, ls: 4 }); ctx.restore(); }
    kIn(ctx, lt, 'bar'); fadeOut(ctx, t, TL.duration, .5);
  }, { cap: false });
  cue(T('K15', 'Films'), 'impact', .6);
  // whoosh on most cuts
  SHOTS.forEach(s => { if (typeof s.from !== 'number') cue(Math.max(0, wt(...s.from) - .12), 'whoosh', .35); });
  kfinish();
}
