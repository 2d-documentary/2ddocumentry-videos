function scenes() {
  const ALL = TL.lines.map(l => l.id);
  const at = (id, w) => (w ? T(id, w) : LINE[id].start) - .04;
  const black = ctx => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); };
  const DSKYS = ['dsky', 'dsky2', 'dsky3', 'agc', 'dsky4', 'verbnoun'];
  const WALL = ['aldrin', 'crew', 'mcc1', 'eagle', 'dsky2', 'touchdown', 'flag', 'mcc2', 'armstrong', 'window', 'celeb', 'aldrinlm', 'traj', 'duke', 'eagle2', 'mcc3', 'nixon', 'lmshadow', 'tindall', 'surface'];
  const B = [
    // A01 This is one of the most famous photos of all time.
    { t0: 0, cap: 1, draw: (ctx, t, lt) => blurCard(ctx, 'aldrin', lt, t, { w: W * .44, fy: .4 }) },
    { t0: at('A01', 'famous'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => blurCard(ctx, 'aldrin', lt + 1, t, { w: W * .5, fy: .35, z: 1.3 }) },
    { t0: at('A01', 'all'), tr: 'tiles', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'aldrin', lt, { z0: 1.5, z1: 1.62, fy: .3 }); headline(ctx, 'OF ALL TIME', W / 2, H * .45, t, at('A01', 'all') + .05); } },
    // A02 But it almost never happened.
    { t0: at('A02'), tr: 'invert', cap: 'dark', draw: (ctx, t) => greyBoard(ctx, t) },
    { t0: at('A02', 'never'), tr: 'cut', cap: 0, draw: (ctx, t, lt) => { greyBoard(ctx, t); headline(ctx, 'ALMOST NEVER', W / 2, H * .44, t, at('A02', 'never'), { color: '#111', shadow: false, colors: ['#111', DX.red], sub: 'happened', subColor: '#111' }); } },
    // A03 July 20th, 1969.
    { t0: at('A03'), tr: 'punch', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'eagle2', lt, { z0: 1.08, z1: 1.2 }); headline(ctx, 'JULY 20, 1969', W / 2, H * .44, t, at('A03') + .05, { size: H * .13 }); } },
    // A04 Two men are dropping toward the Moon in a fragile little lander called Eagle.
    { t0: at('A04'), tr: 'rgb', cap: 1, draw: (ctx, t, lt) => { dofFocus(ctx, 'crew', lt, { fx: .22, fy: .45, cx: .5, cy: .42, r: .26, z0: 1.55, z1: 1.65 }); serifName(ctx, 'Armstrong', W / 2, H * .2, t, at('A04') + .1); } },
    { t0: at('A04', 'men'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => { dofFocus(ctx, 'crew', lt, { fx: .78, fy: .45, cx: .5, cy: .42, r: .26, z0: 1.55, z1: 1.65 }); serifName(ctx, 'Aldrin', W / 2, H * .2, t, at('A04', 'men') + .05); } },
    { t0: at('A04', 'dropping'), tr: 'leak', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_desc3', lt) },
    { t0: at('A04', 'Moon'), tr: 'cut', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_lmorbit', lt) },
    { t0: at('A04', 'fragile'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => blurCard(ctx, 'eagle', lt, t, { w: W * .42 }) },
    { t0: at('A04', 'Eagle.'), tr: 'punch', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'eagle', lt, { z0: 1.25, z1: 1.35, fy: .45 }); serifName(ctx, 'Eagle', W / 2, H * .5, t, at('A04', 'Eagle.') + .03, { size: H * .14 }); } },
    // A05 Then the computer throws an alarm.
    { t0: at('A05'), tr: 'whip', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_timer', lt, { z0: 1.5, z1: 1.58, fy: .28 }) },
    { t0: at('A05', 'computer'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => full(ctx, 'dsky2', lt, { z0: 1.05, z1: 1.2 }) },
    { t0: at('A05', 'alarm.'), tr: 'rgb', cap: 1, draw: (ctx, t, lt) => full(ctx, 'dsky3', lt, { z0: 1.35, z1: 1.55, fx: .45, fy: .6 }) },
    // A06 1202.
    { t0: at('A06'), tr: 'invert', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'dsky', lt, { z0: 1.6, z1: 1.7, dark: .55, fx: .3, fy: .7 }); bigNum(ctx, '1202', W / 2, H * .5, t, at('A06') + .02); } },
    // A07 Nobody in the cockpit knows what it means.
    { t0: at('A07'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => full(ctx, 'aldrinlm', lt, { z0: 1.1, z1: 1.25, fy: .45 }) },
    { t0: at('A07', 'knows'), tr: 'cut', cap: 1, draw: (ctx, t, lt) => blurCard(ctx, 'armbw', lt, t, { w: W * .3 }) },
    // A08 Down in Houston, the call falls on a 26-year-old named Steve Bales.
    { t0: at('A08'), tr: 'leak', cap: 0, draw: (ctx, t, lt) => { fullClip(ctx, 'v_ctrl', lt); headline(ctx, 'HOUSTON', W / 2, H * .45, t, at('A08', 'Houston,')); } },
    { t0: at('A08', 'call'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_mccmen', lt) },
    { t0: at('A08', '26-year-old'), tr: 'tiles', cap: 0, draw: (ctx, t, lt) => { greyBoard(ctx, t); collage(ctx, t, [{ k: 'bales', x: W * .78, y: H * .45, w: W * .2, t0: at('A08', '26-year-old'), from: 'r', rot: .02, border: 10 }, { k: 'mcc2', x: W * .16, y: H * .22, w: W * .22, t0: at('A08', '26-year-old') + .1, from: 'l', rot: -.02 }, { k: 'traj', x: W * .2, y: H * .8, w: W * .24, t0: at('A08', '26-year-old') + .2, from: 'b', rot: .01 }]);
        headline(ctx, 'STEVE BALES', W * .47, H * .47, t, at('A08', 'Steve'), { color: '#111', shadow: false, sub: '26 years old', subColor: '#111' }); } },
    // A09 Abort, or keep going?
    { t0: at('A09'), tr: 'invert', cap: 0, draw: (ctx, t) => { black(ctx); headline(ctx, 'ABORT?', W / 2, H * .42, t, at('A09'), { color: DX.red, size: H * .16 }); headline(ctx, 'OR KEEP GOING?', W / 2, H * .6, t, at('A09', 'keep'), { size: H * .08 }); } },
    // A10 Next to him sits a 24-year-old engineer, Jack Garman, with a handwritten list of every alarm the computer can throw.
    { t0: at('A10'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => full(ctx, 'ctrl', lt, { z0: 1.1, z1: 1.22 }) },
    { t0: at('A10', 'Jack'), tr: 'tiles', cap: 0, draw: (ctx, t, lt) => { greyBoard(ctx, t); headline(ctx, 'JACK GARMAN', W / 2, H * .46, t, at('A10', 'Jack'), { color: '#111', shadow: false, sub: '24 years old  ·  computer engineer', subColor: '#111' }); } },
    { t0: at('A10', 'handwritten'), tr: 'cut', cap: 1, draw: (ctx, t, lt) => { black(ctx); polaroid(ctx, 'tindall', W / 2, H * .47, W * .42, t, at('A10', 'handwritten'), { rot: -.015 }); } },
    { t0: at('A10', 'every'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => burst(ctx, DSKYS, lt, { rate: 4 }) },
    // A11 His answer? It's an overload. If it doesn't keep happening, we're fine.
    { t0: at('A11'), tr: 'rgb', cap: 1, draw: (ctx, t, lt) => full(ctx, 'tindall', lt, { z0: 1.3, z1: 1.45, fx: .7, fy: .4 }) },
    { t0: at('A11', 'overload.'), tr: 'cut', cap: 0, draw: (ctx, t) => terminal3D(ctx, 'executive overflow', t, at('A11', 'overload.')) },
    { t0: at('A11', 'If'), tr: 'leak', cap: 'kara', draw: (ctx, t, lt) => full(ctx, 'touchdown', lt, { z0: 1.05, z1: 1.18, fy: .4 }) },
    // A12 Go.
    { t0: at('A12'), tr: 'punch', cap: 0, draw: (ctx, t) => { black(ctx); headline(ctx, 'GO.', W / 2, H * .5, t, at('A12'), { size: H * .3 }); } },
    // A13 Then it happens again. / A14 And again. / A15 Five alarms in total.
    { t0: at('A13'), tr: 'whip', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_desc1', lt) },
    { t0: at('A13', 'again.'), tr: 'invert', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'dsky3', lt, { z0: 1.7, z1: 1.8, fx: .5, fy: .55, dark: .5 }); bigNum(ctx, '1202', W / 2, H * .5, t, at('A13', 'again.')); } },
    { t0: at('A14'), tr: 'rgb', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'dsky2', lt, { z0: 1.6, z1: 1.7, dark: .5 }); bigNum(ctx, '1201', W / 2, H * .5, t, at('A14', 'again.'), { color: DX.red }); } },
    { t0: at('A15'), tr: 'tiles', cap: 0, draw: (ctx, t, lt) => { greyBoard(ctx, t); headline(ctx, '5 ALARMS', W / 2, H * .45, t, at('A15'), { color: '#111', shadow: false, colors: [DX.red, '#111'], size: H * .16, sub: 'four 1202s  ·  one 1201', subColor: '#111' }); } },
    // A16 Meanwhile Armstrong looks out the window and sees the computer is flying them straight into a field of boulders.
    { t0: at('A16'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => { dofFocus(ctx, 'armstrong', lt, { fx: .5, fy: .4, cx: .5, cy: .42, r: .3, z0: 1.1, z1: 1.2, blur: 4 }); serifName(ctx, 'Armstrong', W / 2, H * .18, t, at('A16', 'Armstrong')); } },
    { t0: at('A16', 'window'), tr: 'leak', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_window', lt) },
    { t0: at('A16', 'computer'), tr: 'cut', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_desc2', lt) },
    { t0: at('A16', 'straight'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => full(ctx, 'window', lt, { z0: 1.05, z1: 1.3, fx: .6 }) },
    { t0: at('A16', 'boulders.'), tr: 'cut', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'window', lt + 1, { z0: 1.45, z1: 1.55, fx: .6, fy: .6 }); headline(ctx, 'BOULDERS', W / 2, H * .45, t, at('A16', 'boulders.')); } },
    // A17 So he takes over.
    { t0: at('A17'), tr: 'invert', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'armbw', lt, { z0: 1.3, z1: 1.45, fy: .3 }); headline(ctx, 'MANUAL CONTROL', W / 2, H * .82, t, at('A17', 'takes'), { size: H * .085 }); } },
    // A18 Houston starts calling out the fuel.
    { t0: at('A18'), tr: 'leak', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_ctrl', lt, { off: 2 }) },
    { t0: at('A18', 'fuel.'), tr: 'punch', cap: 1, draw: (ctx, t, lt) => { dofFocus(ctx, 'duke', lt, { fx: .3, fy: .35, cx: .5, cy: .4, r: .22, z0: 1.5, z1: 1.6 }); serifName(ctx, 'Charlie Duke', W / 2, H * .17, t, at('A18', 'fuel.')); } },
    // A19 Sixty seconds. / A20 Thirty seconds.
    { t0: at('A19'), tr: 'invert', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'lmshadow', lt, { dark: .55, z0: 1.1, z1: 1.2 }); bigNum(ctx, '60', W / 2, H * .45, t, at('A19')); headline(ctx, 'SECONDS OF FUEL', W / 2, H * .7, t, at('A19', 'seconds.'), { size: H * .05 }); } },
    { t0: at('A20'), tr: 'rgb', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'lmshadow', lt + 1, { dark: .55, z0: 1.3, z1: 1.4 }); bigNum(ctx, '30', W / 2, H * .45, t, at('A20'), { color: DX.red }); headline(ctx, 'SECONDS OF FUEL', W / 2, H * .7, t, at('A20', 'seconds.'), { size: H * .05 }); } },
    // A21 Then, contact light.
    { t0: at('A21'), tr: 'flash', cap: 1, draw: (ctx, t, lt) => fullClip(ctx, 'v_dust', lt) },
    // A22 The Eagle has landed.
    { t0: at('A22'), tr: 'leak', cap: 0, draw: (ctx, t, lt) => { full(ctx, 'flag', lt, { z0: 1.05, z1: 1.15, fy: .45 }); serifName(ctx, 'The Eagle has landed.', W / 2, H * .5, t, at('A22'), { size: H * .1 }); } },
    { t0: at('A22', 'landed.') + .4, tr: 'punch', cap: 0, draw: (ctx, t, lt) => fullClip(ctx, 'v_crater', lt) },
    { t0: at('A22', 'landed.') + 1.1, tr: 'punch', cap: 0, draw: (ctx, t, lt) => full(ctx, 'celeb', lt, { z0: 1.05, z1: 1.2 }) },
    // A23 The most famous moment of the century came down to a young engineer and a list he wrote by hand.
    { t0: at('A23'), tr: 'zoom', cap: 1, draw: (ctx, t, lt) => mosaic(ctx, WALL, lt, { cols: 5, rows: 4, z0: 2.2, z1: 1, dur: 2.2 }) },
    { t0: at('A23', 'young'), tr: 'tiles', cap: 'dark', draw: (ctx, t, lt) => { greyBoard(ctx, t); collage(ctx, t, [{ k: 'bales', x: W * .2, y: H * .5, w: W * .17, t0: at('A23', 'young'), from: 'l', rot: -.03, border: 10 }, { k: 'tindall', x: W * .8, y: H * .5, w: W * .28, t0: at('A23', 'young') + .12, from: 'r', rot: .02 }]); } },
    { t0: at('A23', 'list'), tr: 'invert', cap: 0, draw: (ctx, t, lt) => { greyBoard(ctx, t, true); headline(ctx, 'A LIST', W / 2, H * .45, t, at('A23', 'list'), { sub: 'he wrote by hand' }); } },
    // end card (silent)
    { t0: LINE.A23.end + .5, tr: 'invert', cap: 0, draw: (ctx, t, lt) => { black(ctx); headline(ctx, 'DAGAR UNFILTERED', W / 2, H * .5, t, LINE.A23.end + .6, { size: H * .1, colors: ['#fff', DX.red] }); fadeOut(ctx, t, TL.duration, 1); } },
  ];
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t, lt) => {
    dseq(ctx, t, B); const c = capStyle(t);
    if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false } : c === 'kara' ? { mode: 'kara' } : {});
    filmFinish(ctx, t, { grain: .1, vig: .4 });
  }, { name: 'docx', lead: 0 });
  // SFX only on story beats (no whooshes on transitions)
  cue(at('A06') + .04, 'hit', .7); cue(at('A12') + .04, 'impact', .8); cue(at('A13', 'again.'), 'hit', .6); cue(at('A14', 'again.'), 'hit', .6);
  cue(at('A19'), 'tick', .6); cue(at('A20'), 'tick', .7); cue(at('A22'), 'impact', .6);
  // credits for every photo/clip used go in the description
}
