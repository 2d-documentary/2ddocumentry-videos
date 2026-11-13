function scenes() {
  // No SFX on cuts (transitions are silent). Sound only where the story needs it: explosions, cash, stamp, beeps.
  const tag = (ctx, k, extra) => { const c = credit(k, extra); if (c) sourceTag(ctx, c.length > 70 ? c.slice(0, 68) + '…' : c); };
  const ILL = 'Illustrative · Starship test footage, NASA';
  const ILL2 = 'Illustrative · SpaceX launch 2024, CC BY 3.0';
  const jump = (lt, at = .55) => lt > at ? 1.1 : 1;
  const wall1 = ['p_2006', 'p_2008', 'p_2008b', 'p_2008c', 'f1_omelek', 'p_roadster08', 'p_griffin', 'p_tesla07', 'f1_2009', 'lehman', 'modelS', 'p_obama'];
  const beep = (id, w) => cue(T(id, w) - .02, 'beep', 1, T(id, w, 'e') - T(id, w) + .06);
  const hand = (ctx, t, s0, o = {}) => { // the "garbage" hand: 7 of clubs + 2 of diamonds
    playingCard(ctx, CX - 150, 980 + (o.dy || 0), 300, '7', 'c', -.12, clamp(prog(t, s0 + .1, s0 + .4))); playingCard(ctx, CX + 150, 1000 + (o.dy || 0), 300, '2', 'd', .1, clamp(prog(t, s0 + .3, s0 + .6)));
  };
  const chipsCenter = (ctx, t, s0, n = 7) => { for (let i = 0; i < n; i++) { const p = E.inOut(prog(t, s0 + i * .06, s0 + .45 + i * .06)); const a = i / n * 6.28; const x = lerp(i % 2 ? 1200 : -120, CX + Math.cos(a) * 150, p), y = lerp(1900, 1250 + Math.sin(a) * 70, p); chipStack(ctx, x, y, 115, 7 + (i % 4), ['#C8322A', '#1F4FA8', '#111', '#E8B12E'][i % 4]); } };

  // ---- P01 hook: poker
  shot(['P01', 'In'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008', lt, { z0: 1.25 * jump(lt, .8), grade: 'ink', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_2008'); kIn(ctx, lt, 'black', .3); }, { lead: .35 });
  shot(['P01', 'craziest'], (ctx, t, lt, sh) => { feltTable(ctx, t); chipsCenter(ctx, t, sh.start - .3); kGrade(ctx, t); kIn(ctx, lt, 'zoom'); }, { capY: .3 });
  shot(['P01', 'business'], (ctx, t, lt) => { photoWall(ctx, t, wall1, { pan: 1.5 }); kGrade(ctx, t, { bloom: .35 }); kIn(ctx, lt, 'flash'); });
  // ---- P02 garbage hand
  shot(['P02', 'And'], (ctx, t, lt, sh) => { feltTable(ctx, t); hand(ctx, t, sh.start); kGrade(ctx, t); kIn(ctx, lt, 'blur'); }, { capY: .3 });
  // ---- P03 three failures
  shot(['P03', 'SpaceX'], (ctx, t, lt) => { kPhoto(ctx, 'f1_omelek', lt, { z0: 1.15 * jump(lt, .7), grade: 'cine' }); kGrade(ctx, t); tag(ctx, 'f1_omelek'); kIn(ctx, lt, 'zoom'); });
  shot(['P03', 'three'], (ctx, t, lt, sh) => { bgGrad(ctx, '#0B0E16', '#000', 'r'); hudRockets(ctx, t, sh.start + .05, CX - 150, 1180); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { capY: .32, capMode: 'caps' });
  shot(['P03', 'All'], (ctx, t, lt) => { clipFrame(ctx, 'ign', 35, lt, { from: 14, z0: 2.3, fx: .5, fy: .66, grade: 'fire', shake: 24 }); boom(ctx, CX, 1100, t, T('P03', 'failed') - .05, 1100); kGrade(ctx, t, { bloom: .5 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'flash', .16); });
  cue(T('P03', 'failed'), 'impact', .8);
  shot(['P03', 'One'], (ctx, t, lt) => { const k = (hash(Math.floor(t * 30)) - .5) * 20; ctx.save(); ctx.translate(k, k * .5); kPhoto(ctx, 'f1_2009', lt, { z0: 1.25, grade: 'ink', shade: .3 }); ctx.restore(); boom(ctx, CX, 820, t, T('P03', 'last') - .1, 1000); kGrade(ctx, t, { bloom: .45 }); tag(ctx, 'f1_2009'); kIn(ctx, lt, 'glitch'); });
  // ---- P04 Tesla on fire
  shot(['P04', 'Tesla'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.15 * jump(lt), grade: 'mood' }); kGrade(ctx, t); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'zoom'); });
  shot(['P04', 'cash'], (ctx, t, lt, sh) => { bgGrad(ctx, '#3A0806', '#000', 'r'); moneyRain(ctx, t, sh.start, 'bill100', EP.billCrop, 46, { spread: .8 }); shade(ctx, .25, '60,0,0'); kGrade(ctx, t); kIn(ctx, lt, 'flash'); });
  cue(T('P04', 'cash'), 'cash', .7);
  shot(['P04', 'basically'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.35, grade: 'warm', shade: .2 }); embers(ctx, t, 1); boom(ctx, CX, 1300, t, T('P04', 'fire') - .1, 900); kGrade(ctx, t, { bloom: .5 }); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'blur'); }, { capMode: 'stack' });
  // ---- P05 economy / Mars / rent
  shot(['P05', 'whole'], (ctx, t, lt) => { kPhoto(ctx, 'lehman', lt, { z0: 1.2, zs: .1, grade: 'ink' }); kGrade(ctx, t); tag(ctx, 'lehman'); kIn(ctx, lt, 'pix'); });
  shot(['P05', 'collapsing'], (ctx, t, lt) => { headline(ctx, lt, ['SEPTEMBER 15, 2008', 'Lehman Brothers', 'files for', 'bankruptcy'], { kicker: true, hl: [3, 'bankruptcy'], y: .3, size: 100, x: 70 }); kIn(ctx, lt, 'flash'); }, { capDark: true, capY: .8 });
  shot(['P05', 'guy'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008c', lt, { z0: 1.2 * jump(lt, .8), grade: 'mood', fy: .35 }); kGrade(ctx, t); tag(ctx, 'p_2008c'); kIn(ctx, lt, 'zoom'); });
  shot(['P05', 'Mars'], (ctx, t, lt) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(ctx, t, 140, 3); photo(ctx, 'mars', { x: W * .08, y: H * .3, w: W * .84, h: W * .84, zoom: 1 + lt * .04, grade: 'cine' }); kGrade(ctx, t, { bloom: .45 }); tag(ctx, 'mars'); kIn(ctx, lt, 'flash'); }, { capY: .72 });
  shot(['P05', 'borrowing'], (ctx, t, lt, sh) => {
    desk(ctx, t); const s0 = sh.start;
    polaroid(ctx, 'p_2008', 300, 560, 420, -.1, prog(t, s0, s0 + .25), { label: 'Elon, 2008' });
    polaroid(ctx, 'p_2008b', 800, 760, 380, .12, prog(t, s0 + .2, s0 + .45));
    cashStack(ctx, 760, 1400, .9, 2); sticky(ctx, 'RENT\nDUE', 300, 1300, -.08, prog(t, s0 + .45, s0 + .7));
    yString(ctx, [300, 400], [800, 600], prog(t, s0 + .3, s0 + .7)); yString(ctx, [800, 600], [300, 1170], prog(t, s0 + .6, s0 + 1));
    kGrade(ctx, t); kIn(ctx, lt, 'zoom');
  }, { capY: .5, capMode: 'box' });
  // ---- P06 folds
  shot(['P06', 'Any'], (ctx, t, lt, sh) => { feltTable(ctx, t); const p = E.in(prog(t, T('P06', 'folds'), T('P06', 'folds') + .4)); hand(ctx, t, sh.start - 1, { dy: -p * 1400 }); kGrade(ctx, t); kIn(ctx, lt, 'blur'); }, { capY: .3, capMode: 'caps' });
  // ---- P07 all in (bleeped)
  shot(['P07', 'Elon'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008b', lt, { z0: 1.3 * jump(lt, .6), grade: 'mood', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_2008b'); kIn(ctx, lt, 'zoom'); }, { capMode: 'stack' });
  beep('P07', 'fuck');
  shot(['P07', 'pushed'], (ctx, t, lt, sh) => { feltTable(ctx, t); chipsCenter(ctx, t, sh.start, 9); kGrade(ctx, t, { bloom: .35 }); kIn(ctx, lt, 'flash'); }, { capY: .3 });
  cue(T('P07', 'pushed') + .3, 'cash', .5);
  // ---- P08 one more launch
  shot(['P08', 'Enough'], (ctx, t, lt) => { desk(ctx, t, { a: '#1C1610' }); const n = Math.max(1, 6 - Math.floor(lt * 5)); cashStack(ctx, CX, 1100, 1.6, n); kGrade(ctx, t); kIn(ctx, lt, 'pix'); }, { capY: .35 });
  shot(['P08', 'That\'s'], (ctx, t, lt) => { bigWord(ctx, 'that\'s it.', lt, { italic: true, size: 170 }); kIn(ctx, lt, 'bar'); }, { cap: false });
  // ---- P09 Sept 28
  shot(['P09', 'September'], (ctx, t, lt) => { calendarPage(ctx, lt, 'SEPTEMBER', 28, { year: '2008', start: 1, len: 30 }); kIn(ctx, lt, 'zoom'); }, { capY: .88 });
  shot(['P09', 'Falcon'], (ctx, t, lt) => { const s = (hash(Math.floor(t * 30)) - .5) * 14; ctx.save(); ctx.translate(s, s * .6); kPhoto(ctx, 'f1_flight4', lt, { z0: 1.12, zs: .12, grade: 'cine', fy: .55 }); ctx.restore(); embers(ctx, t, .5); kGrade(ctx, t, { bloom: .5 }); tag(ctx, 'f1_flight4'); kIn(ctx, lt, 'flash'); });
  shot(['P09', 'lifts'], (ctx, t, lt) => { clipFrame(ctx, 'rise', 38, lt, { z0: 1.6, fx: .42, fy: .55, grade: 'cine', speed: 1.2 }); kGrade(ctx, t, { bloom: .5 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'blur'); });
  // ---- P10 holy (bleep) orbit
  shot(['P10', 'And'], (ctx, t, lt) => { clipFrame(ctx, 'rise', 38, lt + .3, { z0: 1.6, fx: .42, fy: .55, grade: 'cine' }); kGrade(ctx, t, { bloom: .55 }); sourceTag(ctx, ILL2); kIn(ctx, lt, 'zoom'); }, { capMode: 'stack' });
  beep('P10', 'shit');
  shot(['P10', 'It'], (ctx, t, lt) => { orbitRing(ctx, t, lt); kGrade(ctx, t, { bloom: .4 }); kIn(ctx, lt, 'bar'); }, { capY: .42 });
  // ---- P11 NASA
  shot(['P11', 'Three'], (ctx, t, lt) => { calendarPage(ctx, lt, 'DECEMBER', 23, { year: '2008', start: 1 }); kIn(ctx, lt, 'flash'); }, { capY: .88 });
  shot(['P11', 'NASA'], (ctx, t, lt) => { // group photo: pan across the room, then spotlight Musk
    const o = { zoom: 1.5, fx: lerp(.12, .92, E.inOut(prog(lt, 0, .75))), fy: .05, grade: 'mood' }; photo(ctx, 'p_griffin', o);
    const [x, y] = photoPt('p_griffin', o, .89, .15); spotlight(ctx, x, y, 240, 290, prog(lt, .7, 1.1), { name: 'Elon Musk' });
    kGrade(ctx, t); tag(ctx, 'p_griffin'); kIn(ctx, lt, 'zoom'); }, { capY: .78 });
  shot(['P11', 'billion'], (ctx, t, lt) => { glowNum(ctx, 0, 1600000000, lt, { pre: '$', y: .42, dur: 1.2 }); kIn(ctx, lt, 'bar'); }, { capY: .6 });
  // ---- P12 Christmas Eve
  shot(['P12', 'next'], (ctx, t, lt) => { calendarPage(ctx, lt, 'DECEMBER', 24, { year: '2008', start: 1 }); snow(ctx, t, 90); kIn(ctx, lt, 'zoom'); }, { capY: .88 });
  shot(['P12', 'Tesla'], (ctx, t, lt) => { headline(ctx, lt, ['DECEMBER 24, 2008', 'Tesla closes', 'a $40 million', 'funding round'], { kicker: true, hl: [2, '$40 million'], y: .3, size: 100, x: 70 }); kIn(ctx, lt, 'flash'); }, { capDark: true, capY: .8 });
  shot(['P12', 'days'], (ctx, t, lt) => { kPhoto(ctx, 'p_roadster08', lt, { z0: 1.3, grade: 'ink', shade: .45 }); stamp(ctx, 'BANKRUPT', CX, 700, t, T('P12', 'bankrupt') - .05, { size: 130, color: '#D7261E' }); bigX(ctx, CX, 700, 300, prog(t, T('P12', 'bankrupt') + .35, T('P12', 'bankrupt') + .8)); kGrade(ctx, t); tag(ctx, 'p_roadster08'); kIn(ctx, lt, 'blur'); }, { capY: .55 });
  cue(T('P12', 'bankrupt'), 'stamp', .8);
  // ---- P13 Merry Christmas
  shot(['P13', 'Merry'], (ctx, t, lt) => { kPhoto(ctx, 'p_2008b', lt, { z0: 1.15, grade: 'warm', fy: .35 }); lightLeak(ctx, t, .35); snow(ctx, t, 110); kGrade(ctx, t, { bloom: .4 }); tag(ctx, 'p_2008b'); kIn(ctx, lt, 'flash'); }, { capY: .7, capMode: 'line' });
  // ---- P14 most people lose
  shot(['P14', 'Most'], (ctx, t, lt, sh) => { feltTable(ctx, t); ctx.save(); ctx.globalAlpha = 1 - prog(t, T('P14', 'lose'), T('P14', 'lose') + .5); chipsCenter(ctx, sh.start - 2, 0, 7); ctx.restore(); shade(ctx, .35); kGrade(ctx, t); kIn(ctx, lt, 'blur'); }, { capY: .3 });
  // ---- P15 trillionaire
  shot(['P15', 'Elon'], (ctx, t, lt) => { kPhoto(ctx, 'p_royal', lt, { z0: 1.2 * jump(lt, .7), grade: 'cine', fy: .3 }); kGrade(ctx, t); tag(ctx, 'p_royal'); kIn(ctx, lt, 'zoom'); });
  shot(['P15', 'became'], (ctx, t, lt, sh) => { glowNum(ctx, 0, 1e12, lt, { pre: '$', y: .4, dur: 1.4 }); moneyRain(ctx, t, sh.start + .5, 'bill100', EP.billCrop, 34, { spread: 1.2 }); kIn(ctx, lt, 'flash'); }, { capY: .62 });
  cue(T('P15', 'became') + .5, 'cash', .6);
  // ---- end card (Reel): no subscribe, just the pointer to YouTube
  shot(LINE['P15'].end + .5, (ctx, t, lt) => {
    bgGrad(ctx, '#0A0C14', '#000', 'r'); stars(ctx, t, 120, 2, .5);
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, 0, .5)); glowText(ctx, 'Full documentary', CX, 860, { font: F.play, size: 96, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.8)', blur: 50 }); ctx.restore();
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, .35, .85)); text(ctx, 'on my YouTube channel', CX, 960, { font: F.playI, size: 64, color: 'rgba(255,255,255,.9)', align: 'center', shadow: 20 }); ctx.restore();
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, .7, 1.1)); text(ctx, 'DAGAR UNFILTERED', CX, 1090, { font: F.osw, size: 52, color: '#E6F23C', align: 'center', weight: 600, ls: 8 }); ctx.restore();
    kIn(ctx, lt, 'blur'); fadeOut(ctx, t, TL.duration, .5);
  }, { cap: false });
  kfinish();
}
