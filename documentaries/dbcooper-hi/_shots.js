function scenes() {
  // Hindi (Hinglish) version of dbcooper-k, narrated with Chintu's cloned voice. Same visuals + object transitions.
  const tag = (ctx, k, pre) => { const c = credit(k); if (c) sourceTag(ctx, (pre ? pre + ' · ' : '') + (c.length > 64 ? c.slice(0, 62) + '…' : c)); };
  const ph = (key, o = {}) => (ctx, t, lt) => { kPhoto(ctx, key, lt, { z0: o.z0 ?? 1.15 * (lt > .8 ? 1.08 : 1), grade: o.grade || 'mood', fx: o.fx, fy: o.fy, shade: o.shade, pull: o.pull }); if (o.rain) rain(ctx, t, .6); if (o.fog) fog(ctx, t, .35); kGrade(ctx, t); tag(ctx, key); kIn(ctx, lt, o.tr || 'zoom'); };
  const S = (id, w, fn, o) => shot([id, w], fn, o);

  S('H01', '24', (ctx, t, lt) => { calendarPage(ctx, lt, 'NOVEMBER', 24, { year: '1971', start: 1, len: 30 }); kIn(ctx, lt, 'black', .3); }, { capY: .88, lead: .35 });
  S('H01', 'Ek', ph('sketch_a', { grade: 'ink', fy: .35 }));
  S('H01', 'cash', ph('ticket', { grade: 'color', z0: 1.25, tr: 'flash' }), { capY: .3 });
  S('H02', 'Naam', ph('ticket', { grade: 'color', z0: 2.1, fx: .35, fy: .45 }), { capY: .3, capMode: 'box' });
  S('H03', 'Plane', ph('bourbon', { grade: 'warm' }));
  S('H03', 'cigarette', (ctx, t, lt) => { bgGrad(ctx, '#1A140E', '#000', 'r'); fog(ctx, t, .5); embers(ctx, t, .3); kGrade(ctx, t); kIn(ctx, lt, 'blur'); }, { capMode: 'stack' });
  S('H03', 'air', ph('plane_pd', { grade: 'cine' }));
  S('H04', 'Chit', (ctx, t, lt) => { desk(ctx, t); ctx.save(); ctx.translate(CX, 940); ctx.rotate(-.04); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#F4F0E6'; ctx.fillRect(-380, -300, 760, 600); ctx.restore();
    aeText(ctx, 'Miss,', CX - 200, 800, lt - .5, { font: F.hand, size: 90, color: '#1B2A55', stagger: .05, rise: 20, squash: 1, spin: 0, glowBlur: 0 });
    aeText(ctx, 'I have a bomb.', CX, 940, lt - .85, { font: F.hand, size: 90, color: '#1B2A55', stagger: .05, rise: 20, squash: 1, spin: 0, glowBlur: 0 });
    text(ctx, 'reconstruction', CX + 300, 1210, { font: F.mono, size: 24, color: 'rgba(0,0,0,.45)', align: 'right' }); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { capY: .2 });
  S('H05', 'Bhai', ph('bourbon', { grade: 'warm', z0: 1.5 }), { capMode: 'box' });
  S('H06', 'Uski', ph('bill20c', { grade: 'warm', z0: 1.3 }));
  S('H06', 'Do', (ctx, t, lt, sh) => { bgGrad(ctx, '#0E1A10', '#000', 'r'); moneyRain(ctx, t, sh.start, 'bill20c', [8, 155, 298, 126], 42, { spread: 1 }); glowNum(ctx, 0, 200000, lt, { pre: '$', y: .42, keepBG: true }); kGrade(ctx, t); kIn(ctx, lt, 'bar'); }, { capY: .62 });
  cue(T('H06', 'Do') + .3, 'cash', .6);
  S('H06', 'chaar', ph('chute', { grade: 'color' }), { capY: .3 });
  S('H07', 'Seattle', ph('seatac72', { grade: 'cine' }));
  S('H07', 'saare', ph('crew', { grade: 'ink', tr: 'pix' }));
  S('H08', 'Plane', ph('plane', { grade: 'cine' }));
  const stairO = { zoom: 1.08, fx: .57, fy: .62, grade: 'cine' };
  S('H08', 'Washington', (ctx, t, lt) => { photo(ctx, 'airstair', { ...stairO, zoom: stairO.zoom + lt * .03 }); kGrade(ctx, t); tag(ctx, 'airstair'); kIn(ctx, lt, 'zoom'); });
  S('H09', 'aur', (ctx, t, lt) => {
    const [x0, y0] = photoPt('airstair', stairO, .5, .5), [x1, y1] = photoPt('airstair', stairO, .65, .8);
    portal(ctx, lt, .9, (g) => { photo(g, 'airstair', { ...stairO, zoom: stairO.zoom + .05 }); },
      (g, l) => { photo(g, 'forest', { zoom: 1.2 + l * .04, grade: 'night' }); shade(g, .35); rain(g, t, .9); fog(g, t, .3); }, [x0 / W, y0 / H, x1 / W, y1 / H]);
    kGrade(ctx, t); if (lt > .9) tag(ctx, 'forest');
  }, { capMode: 'stack', capY: .45 });
  S('H10', 'FBI', (ctx, t, lt) => { unfold(ctx, 'wanted', lt, { grade: 'color', h: .62 }); kGrade(ctx, t, { bloom: .2 }); tag(ctx, 'wanted'); }, { capY: .9 });
  cue(T('H10', 'FBI') + .15, 'paper', .7);
  S('H10', '800', (ctx, t, lt) => { filmStrip(ctx, t, lt, ['sketch_a', 'sketch_color', 'mccoy', 'rackstraw', 'sketches_fbi'], { labels: ['SKETCH A', '1973 SKETCH', 'R. McCOY', 'R. RACKSTRAW', 'CLOSED 2016'], grade: 'ink', dur: 1.6, pan: 150 }); kGrade(ctx, t); }, { capY: .9, capMode: 'caps' });
  S('H10', 'Ek', (ctx, t, lt) => { bigWord(ctx, 'zero.', lt, { italic: true }); kIn(ctx, lt, 'flash', .1); }, { capY: .7 });
  S('H11', 'Fir', (ctx, t, lt) => { calendarPage(ctx, lt, 'FEBRUARY', 10, { year: '1980', start: 5, len: 29 }); kIn(ctx, lt, 'zoom'); }, { capY: .88 });
  const riverO = { zoom: 1.1, fx: .5, fy: .7, grade: 'cine' };
  S('H11', 'nadi', (ctx, t, lt) => { photo(ctx, 'columbia', { ...riverO, zoom: riverO.zoom + lt * .03 }); kGrade(ctx, t); tag(ctx, 'columbia'); kIn(ctx, lt, 'blur'); }, { capY: .35 });
  S('H11', 'mile', (ctx, t, lt) => {
    portal(ctx, lt, .9, (g) => { photo(g, 'columbia', { ...riverO, zoom: riverO.zoom + .05 }); }, (g, l) => { photo(g, 'money', { zoom: 1.25 + l * .04, fx: .45, fy: .4, grade: 'color' }); }, [.38, .74, .62, .86], { round: true });
    kGrade(ctx, t); if (lt > .9) tag(ctx, 'money');
  }, { capY: .3 });
  S('H11', 'Wahi', ph('money', { grade: 'ink', z0: 1.7, fx: .4, fy: .35 }), { capY: .3 });
  S('H12', 'Baaki', (ctx, t, lt) => { photo(ctx, 'forest', { zoom: 1.1 + lt * .04, grade: 'ink' }); fog(ctx, t, .5); kGrade(ctx, t); tag(ctx, 'forest'); kIn(ctx, lt, 'blur'); });
  S('H12', 'Cooper', (ctx, t, lt) => { bigWord(ctx, 'gone.', lt, { italic: true }); kIn(ctx, lt, 'bar'); }, { capY: .7 });
  S('H13', 'Aur', ph('sketch_color', { grade: 'ink', fy: .35 }));
  S('H13', 'D.B.', (ctx, t, lt) => { headline(ctx, lt, ['HOW HE GOT THE NAME', 'A reporter misheard', '"Dan Cooper" as', '"D.B. Cooper"'], { kicker: true, hl: [3, '"D.B. Cooper"'], y: .3, size: 96, x: 70 }); kIn(ctx, lt, 'flash'); }, { capDark: true, capY: .82 });
  S('H14', 'Toh', ph('forest', { grade: 'night', fog: true, rain: true }));
  S('H14', 'perfect', (ctx, t, lt) => { const o = { zoom: 1.4 + lt * .05, fx: .5, fy: .38, grade: 'ink' }; photo(ctx, 'sketch_a', o); const [x, y] = photoPt('sketch_a', o, .5, .4); spotlight(ctx, x, y, 300, 160, prog(lt, .3, .8), { frame: true }); kGrade(ctx, t); tag(ctx, 'sketch_a'); kIn(ctx, lt, 'zoom'); }, { capY: .72 });
  shot(LINE['H14'].end + .6, (ctx, t, lt) => {
    bgGrad(ctx, '#0A0C14', '#000', 'r'); stars(ctx, t, 120, 2, .5);
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, 0, .5)); glowText(ctx, 'Full documentary', CX, 860, { font: F.play, size: 96, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.8)', blur: 50 }); ctx.restore();
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, .35, .85)); text(ctx, 'on my YouTube channel', CX, 960, { font: F.playI, size: 64, color: 'rgba(255,255,255,.9)', align: 'center', shadow: 20 }); ctx.restore();
    ctx.save(); ctx.globalAlpha = E.out(prog(lt, .7, 1.1)); text(ctx, 'DAGAR UNFILTERED', CX, 1090, { font: F.osw, size: 52, color: '#E6F23C', align: 'center', weight: 600, ls: 8 }); ctx.restore();
    kIn(ctx, lt, 'blur'); fadeOut(ctx, t, TL.duration, .5);
  }, { cap: false });
  kfinish();
}
