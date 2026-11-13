function scenes() {
  const GREY = { grey: 1 }, RED = { colors: [DX.red] }, dam = [36.29, 33.51], golan = [35.78, 33.0];
  const rows = [
    mapRow('H049', null, { views: [[0, { lon: 36, lat: 33.3, k: 40 }], [1.4, { lon: 35.95, lat: 33.15, k: 110 }]], pins: [[...dam, 'DAMASCUS', .2], [...golan, 'GOLAN HEIGHTS', T('H049', 'Heights.') + .1, 1]] }),
    ['H049', 'neeche', 'full', 'golan73'],
    ['H050', null, 'full', 'bunker'],
    ['H050', 'mana', 'head', 'MILITARY ZONE', 'entry mana', RED],
    ['H051', null, 'dof', 'eli', 'Kamel Amin Thabet', { fx: .5, fy: .4, cx: .5, cy: .4, r: .3 }],
    ['H051', 'officer', 'full', 'eli_golan'],
    ['H052', null, 'full', 'bunker', { z0: 1.3, z1: 1.4 }],
    ['H052', 'guns,', 'full', 'mines'],
    ['H052', 'trenches.', 'full', 'trees'],
    ['H054', null, 'full', 'golan67b'],
    ['H054', 'bechare', 'full', 'golan73', { dark: .2 }],
    ['H055', null, 'capboard'],
    ['H055', 'eucalyptus', 'head', 'EUCALYPTUS', 'har post ke paas', GREY],
    ['H056', null, 'full', 'trees'],
    ['H056', 'nishaana.', 'head', 'NISHAANA', '', { bg: 'trees', colors: [DX.red] }],
    ['H057', null, 'head', 'SABSE MEHENGI', 'chhaanv'],
    ['H058', null, 'clipx', 'vnews67'],
    ['H058', 'Israel', 'full', 'golani67'],
    ['H058', 'do', 'num', '2 DIN', 'Golan · 1967'],
    ['H059', null, 'full', 'golan67'],
    ['H059', 'credit', 'dof', 'eli', 'Eli Cohen', { fx: .5, fy: .4, cx: .5, cy: .4, r: .3 }],
    [LINE.H059.end + .4, null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, true) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false, y: H * .64 } : { y: H * .64 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'docx', lead: 0 });
  cue(T('H056', 'nishaana.'), 'impact', .6);
}
