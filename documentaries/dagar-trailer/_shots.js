function scenes() {
  const GREY = { grey: 1 }, RED = { colors: [DX.red] };
  const dam = [36.29, 33.51];
  const t10m = T('T10', 'Maps,') - .04;
  const rows = [
    ['T01', null, 'burst', ['flag', 'wanted', 'eli', 'p_laugh', 'iln_suspect', 'dock', 'aldrin', 'sketch_a'], { rate: 5 }],
    ['T01', 'official', 'head', 'THE OFFICIAL VERSION', '', { grey: 1, size: MN() * .085 }],
    ['T02', null, 'board', 'WE OPEN', 'the files', ['fbidocs', 'paper65', 'dearboss1', 'dock']],
    ['T02', 'files.', 'term', 'OPENING FILE... >_'],
    mapRow('T03', null, { views: [[LINE.T03.start, { lon: 30, lat: 32, k: 7 }], [LINE.T03.start + 1.2, { lon: 36, lat: 33.4, k: 32 }]], pins: [[...dam, 'DAMASCUS · 1965', T('T03', 'spy') + .2]] }),
    ['T03', 'almost', 'dof', 'eli', 'Eli Cohen', { fx: .5, fy: .4, cx: .5, cy: .4, r: .3 }],
    ['T03', 'Syria.', 'head', 'PRESIDENT?', 'Syria', { bg: 'eli_home' }],
    ['T04', null, 'head', 'OR WAS HE?', '', { colors: ['#fff', '#fff', DX.red] }],
    ['T05', null, 'full', 'wanted', { z0: 1.05, z1: 1.2 }],
    ['T05', 'jumped', 'full', 'n467us'],
    ['T05', 'two', 'num', '$200,000', 'ransom · 1971'],
    ['T06', null, 'full', 'forest'],
    ['T06', 'never', 'head', 'NEVER FOUND', '', { bg: 'forest', colors: [DX.red] }],
    ['T07', null, 'clipx', 'v_desc1'],
    ['T07', 'computer', 'full', 'dsky', { z0: 1.2, z1: 1.35 }],
    ['T07', 'abort.', 'head', '1202', 'program alarm', { bg: 'mcc1', colors: [DX.red] }],
    ['T08', null, 'full', 'f1_flight4'],
    ['T08', 'one', 'pol', 'p_2008'],
    ['T08', 'broke.', 'clipx', 'c_tower', { fps: 15 }],
    ['T09', null, 'full', 'iln_suspect'],
    ['T09', 'London', 'full', 'fromhell'],
    ['T09', 'caught.', 'head', 'NEVER CAUGHT', 'London · 1888', { bg: 'ipn_oct20' }],
    ['T10', null, 'clipx', 'vmorse'],
    ['T10', 'footage.', 'clipx', 'f_land99', { off: 12 }],
    mapRow('T10', 'Maps,', { views: [[t10m, { lon: -45, lat: 30, k: 5.4 }]], pins: [[-122.3, 47.6, 'SEATTLE', t10m + .05], [-0.13, 51.5, 'LONDON', t10m + .35], [...dam, 'DAMASCUS', t10m + .6], [-95.4, 29.8, 'HOUSTON', t10m + .85, 1]] }),
    ['T10', 'timelines,', 'tape', { cap: 1 }],
    ['T10', 'receipts.', 'post', 'Am considering taking Tesla private at $420. Funding secured.', '7 Aug 2018', { avatar: 'p_laugh' }],
    ['T11', null, 'head', 'BOTH SIDES', 'of the story'],
    ['T11', 'No', 'head', 'NO FILTERS', '', RED],
    ['T12', null, 'brand', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.tape = { cap: 1, draw: (ctx, t, lt) => { black(ctx); ctx.save(); ctx.translate(W / 2, H * .5); ctx.scale(1.9, 1.9); ctx.translate(-W / 2, -H * .935); yearTape(ctx, lerp(1888, 2026, E.inOut(clamp(lt / 1.4)))); ctx.restore(); } };
  BEAT_KINDS.brand = { cap: 0, draw: (ctx, t, lt, t0) => { black(ctx); const m = MN();
    headline(ctx, 'DAGAR', W / 2, H * .44, t, t0 + .05, { size: m * .22 }); headline(ctx, 'UNFILTERED', W / 2, H * .44 + m * .2, t, t0 + .25, { size: m * .16, colors: [DX.red] });
    const p = E.out(clamp((lt - .5) / .5)); ctx.fillStyle = DX.red; ctx.fillRect(W / 2 - m * .3 * p, H * .44 + m * .3, m * .6 * p, 5);
    ctx.save(); ctx.globalAlpha = clamp((lt - .8) / .4); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = `400 ${m * .04}px ${F.cap}`; ctx.letterSpacing = m * .008 + 'px';
    ctx.fillText('ARCHIVES  ·  MAPS  ·  RECEIPTS', W / 2, H * .44 + m * .4); ctx.restore(); fadeOut(ctx, t, TL.duration, .8); } };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false, y: H * .66 } : { y: H * .66 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'docx', lead: 0 });
  cue(T('T04', 'he?'), 'hit', .6); cue(T('T06', 'never'), 'thud', .5); cue(T('T07', 'abort.'), 'impact', .6);
  cue(T('T09', 'caught.'), 'hit', .5); cue(T('T11', 'No'), 'stamp', .6); cue(LINE.T12.start, 'impact', .7);
}
