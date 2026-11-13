function scenes() {
  const after = (id, d = .25) => LINE[id].end + d;
  const rows = [
    ['F01', null, 'full', 'p_boring'],
    ['F01', 'twenty', 'num', '20,000', 'flamethrowers'],
    ['F02', null, 'num', '$500', 'each'],
    ['F02', 'four', 'head', 'SOLD OUT', 'in four days', { grey: 1 }],
    ['F03', null, 'full', 'b_fire_f70'],
    ['F03', 'terrible', 'head', 'TERRIBLE IDEA?', '', { bg: 'b_terr_f10' }],
    bite(after('F03'), 'b_terr'),
    ['F04', null, 'capblack'],
    bite(after('F04'), 'b_torch'),
    ['F05', null, 'capboard'],
    bite(after('F05'), 'b_label'),
    ['F06', null, 'num', '20,000', 'sold'],
    ['F06', 'telling', 'head', "DON'T BUY IT", '', { colors: [DX.red] }],
    [after('F06', .5), null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, true) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c === 'bite') cap(ctx, t, BITE_IDS, { y: H * .72, hold: .1 });
    else if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false, y: H * .64 } : { y: H * .64 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'docx', lead: 0 });
  cue(T('F01', 'twenty'), 'cash', .6); cue(T('F06', 'telling'), 'stamp', .6);
}
