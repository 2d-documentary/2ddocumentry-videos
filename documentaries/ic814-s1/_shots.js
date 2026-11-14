function scenes() {
  const GREY = { grey: 1 }, RED = { colors: [DX.red] };
  const after = (id, d = .25) => LINE[id].end + d;
  const KTM = [85.36, 27.70], KDH = [65.85, 31.51], ATQ = [74.80, 31.71], LHE = [74.40, 31.52], DXB = [55.37, 25.03];
  const rows = [
    ['S01', null, 'clipx', 'c_wing', { off: .5 }],
    ['S01', 'December', 'head', '24 DEC 1999', 'IC 814', { bg: 'a300_b', size: MN() * .12 }],
    ['S01', 'Indian', 'full', 'a300_a'],
    ['S01', 'hijack', 'head', 'HIJACK', '', { colors: [DX.red], tr: 'punch', size: MN() * .16, bg: 'a300_d', dark: .6 }],
    ['S02', null, 'num', '7 DIN', '', { bg: 'kdh_term', size: MN() * .2 }],
    mapRow('S02', 'India', { views: [[T('S02', 'India') - .2, { lon: 71, lat: 29, k: 7 }]], routes: [[KTM, ATQ, T('S02', 'India'), .4], [ATQ, LHE, T('S02', 'India') + .35, .25], [LHE, DXB, T('S02', 'India') + .55, .4], [DXB, KDH, T('S02', 'India') + .9, .4]],
      pins: [[...KDH, 'KANDAHAR', T('S02', 'India') + 1.2]] }),
    ['S02', 'teen', 'num', '3', 'aatanki · azaad', { color: DX.red, bg: 'kdh_term', size: MN() * .32 }],
    ['S03', null, 'full', 'kdh_term', { dark: .35, z0: 1.2, z1: 1.35 }],
    ['S03', 'khatam', 'head', 'KHATAM NAHI', '', RED],
    ['S04', null, 'head', '#1', 'Masood Azhar', { size: MN() * .2, colors: [DX.red], bg: 'tal_herat', dark: .7 }],
    ['S04', 'Jaish', 'head', 'JAISH E MOHAMMED', '2000', { size: MN() * .08 }],
    ['S05', null, 'full', 'parl_a'],
    ['S05', 'Pathankot', 'head', 'PATHANKOT', '2016', GREY],
    ['S05', 'Pulwama', 'head', 'PULWAMA', '2019', { colors: [DX.red], bg: 'parl_b' }],
    ['S06', null, 'head', '#2', 'Omar Sheikh', { size: MN() * .2, colors: [DX.red], bg: 'kdh_road', dark: .7 }],
    ['S06', 'Daniel', 'dof', 'pearl', 'Daniel Pearl', { fx: .5, fy: .4, cx: .5, cy: .42, r: .35 }],
    ['S07', null, 'head', 'ACQUITTED', '2021', { colors: [DX.red], size: MN() * .12, bg: 'kdh_road', dark: .7 }],
    ['S08', null, 'head', '#3', 'Mushtaq Zargar', { size: MN() * .2, colors: [DX.red], bg: 'tal_arms', dark: .7 }],
    ['S08', 'terrorist', 'head', 'TERRORIST', 'declared · 2022', GREY],
    ['S09', null, 'num', '100+', 'zindagiyan bachi', { bg: 'a300_c', size: MN() * .22 }],
    ['S09', 'Doosri', 'board', 'TEEN NAAM', '', ['tal_herat', 'parl_a', 'pearl']],
    ['D01', null, 'full', 'a300_b', { dark: .5 }],
    [after('D01', .3), null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, true) };
  const B = buildBeats(rows), ALL = TL.lines.filter(l => l.speaker !== 'DAGU').map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false, y: H * .64 } : { y: H * .64 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); daguLayer(ctx, t); }, { name: 'docx', lead: 0 });
  cue(T('S01', 'hijack'), 'impact', .7); cue(T('S07', 'bari'), 'stamp', .6); cue(T('S08', 'terrorist'), 'stamp', .5);
}
