function scenes() {
  const GREY = { grey: 1 };
  const rows = [
    ['R01', null, 'dof', 'p_2008', 'Elon Musk', { fx: .5, fy: .4, cx: .5, cy: .42, r: .3 }],
    ['R01', 'borrowing', 'head', 'BORROWING', 'to pay his rent', GREY],
    ['R02', null, 'clipx', 'f_crs7', { off: 1 }],
    ['R02', 'car', 'full', 'p_roadster08'],
    ['R02', 'marriage', 'full', 'p_2008c', { dark: .2 }],
    ['R03', null, 'capblack'],
    ['R03', 'one', 'head', 'ONE LAST', 'launch'],
    ['R04', null, 'full', 'f1_flight4', { z0: 1.3, z1: 1.4 }],
    ['R04', 'Falcon', 'head', 'FLIGHT FOUR', '28 September 2008', { bg: 'f1_flight4' }],
    ['R05', null, 'full', 'f1_flight4', { z0: 1.05, z1: 1.25 }],
    ['R05', 'orbit.', 'head', 'ORBIT', '', { bg: 'f1_flight4', tr: 'punch' }],
    ['R06', null, 'full', 'p_griffin'],
    ['R06', '1.6', 'num', '$1.6B', 'NASA contract'],
    ['R06', 'Christmas', 'full', 'p_roadster08'],
    ['R06', 'saved.', 'head', 'SAVED', 'Christmas Eve 2008'],
    ['R07', null, 'head', 'JUNE 2026', 'eighteen years later'],
    ['R08', null, 'full', 'nasdaq26'],
    ['R08', 'biggest', 'full', 'nasdaq'],
    ['R09', null, 'card', 'p_laugh'],
    ['R09', 'first', 'num', '$1.1T', 'first trillionaire'],
    ['R09', 'Ever.', 'head', 'EVER.', ''],
    ['R10', null, 'clipx', 'f_land99', { off: 12 }],
    ['R10', 'September', 'head', '28 SEPTEMBER', ''],
    ['R10', 'eighteen', 'full', 'f1_flight4'],
    ['R10', 'Starship', 'clipx', 'f_ift3'],
    ['R10', 'orbit.', 'clipx', 'f_ift3b'],
    ['R11', null, 'dof', 'p_royal', 'Elon Musk', { fx: .5, fy: .35, cx: .5, cy: .4, r: .3 }],
    ['R11', 'different', 'clipx', 'f_ift5c'],
    [LINE.R11.end + .5, null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, true) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false, y: H * .64 } : { y: H * .64 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'docx', lead: 0 });
  const s = T('R05', 'shit'), e = T('R05', 'shit', 'e'); cue(s - .02, 'beep', 1, e - s + .06);
  cue(T('R05', 'orbit.'), 'impact', .8); cue(T('R09', 'first'), 'cash', .7);
}
