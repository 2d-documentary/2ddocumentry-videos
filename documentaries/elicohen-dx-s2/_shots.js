function scenes() {
  const GREY = { grey: 1 }, RED = { colors: [DX.red] };
  const rows = [
    ['H078', null, 'clipx', 'vmorse'],
    ['H078', 'Damascus', 'full', 'dpan2'],
    ['H078', 'Israel', 'clipx', 'vmorse', { off: 3 }],
    ['H079', null, 'head', 'SABSE BADI GALTI', '', RED],
    ['H080', null, 'capboard'],
    ['H080', 'zyada', 'head', 'ZYADA MAT BHEJO', 'roz ek hi time pe bhi nahi', GREY],
    ['H081', null, 'clipx', 'vmorse', { off: 4.5 }],
    ['H082', null, 'full', 'coup', { z0: 1.2, z1: 1.3 }],
    ['H082', 'tracking', 'head', 'SOVIET TRACKING', ''],
    ['H083', null, 'capblack'],
    ['H083', 'band.', 'head', 'RADIO BAND', '', GREY],
    ['H084', null, 'full', 'dpan', { dark: .45 }],
    ['H084', 'kanooni', 'head', 'GAIR KANOONI', '', RED],
    ['H085', null, 'head', 'EK SIGNAL', 'Kamel ka'],
    ['H086', null, 'full', 'jalaa', { dark: .3 }],
    ['H086', 'Security', 'head', 'JANUARY 1965', ''],
    ['H086', 'transmit', 'clipx', 'vmorse', { off: 2 }],
    ['H087', null, 'pol', 'eli'],
    ['H087', 'khatam.', 'head', 'KHATAM', '', RED],
    [LINE.H087.end + .4, null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, true) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false, y: H * .64 } : { y: H * .64 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'docx', lead: 0 });
  cue(T('H085', 'signal'), 'tick', .6); cue(T('H087', 'khatam.'), 'thud', .6);
}
