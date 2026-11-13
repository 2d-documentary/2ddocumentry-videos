function scenes() {
  const b = .5;                       // one beat at 120 BPM: every cut lands on the grid
  const RED = [DX.red], m = () => MN();
  // big word over a darkened photo, slammed in on the beat
  BEAT_KINDS.word = { cap: 0, draw: (ctx, t, lt, t0, a, o) => { if (a[1]) { if (CLIPN[a[1]]) BEAT_KINDS.clipx.draw(ctx, t, lt, t0, [a[1]], { dark: .5 }); else full(ctx, a[1], lt, { z0: 1.25, z1: 1.08, dur: .6, dark: o.dark ?? .5 }); } else black(ctx);
    const s = 1 + .35 * Math.max(0, 1 - lt / .12); ctx.save(); ctx.translate(W / 2, H * .47); ctx.scale(s, s); ctx.translate(-W / 2, -H * .47);
    headline(ctx, a[0], W / 2, H * .47, t, t0, { size: m() * (o.size || .2), colors: o.colors, sub: o.sub, stagger: 0 }); ctx.restore(); } };
  // world map: pins thrown one per beat
  BEAT_KINDS.world = { cap: 0, draw: (ctx, t, lt, t0, a, o) => { const pr = monoMap(ctx, viewAt([[t0, { lon: -80, lat: 20, k: 5.6 }], [t0 + (a[0].length - 1) * b, { lon: 100, lat: 32, k: 5.6 }]], t));
    a[0].forEach(([lon, lat, lab, left], i) => { const [x, y] = pr(lon, lat); dartPin(ctx, x, y, t, t0 + i * b, lab, { left }); }); vignetteK(ctx, .5);
    headline(ctx, 'EVERY COUNTRY', W / 2, H * .2, t, t0, { size: m() * .13 }); } };
  // comment bubbles popping on the beat
  BEAT_KINDS.cmts = { cap: 0, draw: (ctx, t, lt, t0, a) => { black(ctx); headline(ctx, 'COMMENT YOUR TOPIC', W / 2, H * .2, t, t0, { size: m() * .088, colors: ['#fff', '#fff', DX.red] });
    a[0].forEach((s, i) => { const ts = t0 + (i + 1) * b; if (t < ts) return; const p = E.back(clamp((t - ts) / .25)), w = m() * .78, h = m() * .15, x = W / 2 - w / 2 + (i % 2 ? m() * .05 : -m() * .05), y = H * .3 + i * h * 1.22;
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(p, p); ctx.translate(-(x + w / 2), -(y + h / 2)); ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, h * .3); ctx.fill();
      ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(x + h * .5, y + h / 2, h * .28, 0, 7); ctx.fill(); ctx.fillStyle = '#777'; ctx.font = `600 ${h * .2}px ${F.inter}`; ctx.fillText('viewer', x + h, y + h * .38);
      ctx.fillStyle = '#111'; ctx.font = `700 ${h * .32}px ${F.inter}`; ctx.fillText(s, x + h, y + h * .75); ctx.restore(); }); } };
  // case file: folder + stamp
  BEAT_KINDS.casefile = { cap: 0, draw: (ctx, t, lt, t0) => { black(ctx); const w = m() * .8, h = w * .72, x = W / 2 - w / 2, y = H * .42 - h / 2, p = E.out(clamp(lt / .3));
    ctx.save(); ctx.translate(0, (1 - p) * 120); ctx.fillStyle = '#C9A86A'; ctx.beginPath(); ctx.roundRect(x, y - h * .08, w * .38, h * .12, 12); ctx.fill(); ctx.fillStyle = '#D8BC80'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#3a2c12'; ctx.font = `700 ${w * .07}px ${F.cond}`; ctx.fillText('CASE FILE', x + w * .07, y + h * .2); ctx.font = `400 ${w * .045}px ${F.mono}`; ctx.fillText('SUBJECT: YOUR TOPIC', x + w * .07, y + h * .33); ctx.fillText('STATUS: OPEN', x + w * .07, y + h * .43); ctx.restore();
    stamp(ctx, 'UNFILTERED', W / 2, H * .42 + h * .2, t, t0 + b, { size: w * .12, color: DX.red });
    headline(ctx, "WE'LL OPEN THE FILE", W / 2, H * .72, t, t0 + 2 * b, { size: m() * .1 }); } };
  BEAT_KINDS.brand = { cap: 0, draw: (ctx, t, lt, t0) => { black(ctx);
    headline(ctx, 'DAGAR', W / 2, H * .4, t, t0, { size: m() * .24 }); headline(ctx, 'UNFILTERED', W / 2, H * .4 + m() * .21, t, t0 + b, { size: m() * .17, colors: [DX.red] });
    const p = E.out(clamp((lt - 2 * b) / .4)); ctx.fillStyle = DX.red; ctx.fillRect(W / 2 - m() * .32 * p, H * .4 + m() * .32, m() * .64 * p, 6);
    headline(ctx, 'FOLLOW FOR THE NEXT FILE', W / 2, H * .4 + m() * .45, t, t0 + 3 * b, { size: m() * .075 }); fadeOut(ctx, t, TL.duration, .6); } };
  const at = n => n * b;   // beat number -> seconds
  const topics = [['SPACE', 'flag'], ['SCIENCE', 'dsky'], ['HISTORY', 'ipn_oct20'], ['WAR', 'golani67'], ['SPIES', 'eli'], ['MONEY', 'notes_fan'], ['CRIME', 'wanted'], ['TECH', 'server'], ['MYSTERY', 'forest'], ['POWER', 'hafpar'], ['ROCKETS', 'v_launch'], ['INTERNET', 'seized']];
  const rows = [
    // HOOK (0-4 s): fast photo burst + the promise
    [0, null, 'burst', ['flag', 'wanted', 'eli', 'p_laugh', 'iln_suspect', 'armstrong', 'dock', 'ross'], { rate: 6, cap: 0 }],
    [at(1), null, 'word', 'EVERY STORY', null, { size: .16, tr: 'punch' }],
    [at(3), null, 'word', 'HAS A FILE', 'fbidocs', { size: .16, tr: 'cut' }],
    [at(5), null, 'word', "THEY DIDN'T", null, { size: .16, colors: RED, tr: 'invert' }],
    [at(6), null, 'word', 'SHOW YOU', null, { size: .16, colors: RED, tr: 'cut' }],
    [at(7), null, 'word', 'WE DO', 'v_desc1', { size: .2, tr: 'rgb' }],
    // TOPICS (one per beat)
    ...topics.map(([w, k], i) => [at(8 + i), null, 'word', w, k, { tr: i % 3 === 0 ? 'punch' : 'cut' }]),
    // EVERY COUNTRY: pins on the beat
    [at(20), null, 'world', [[-98, 39, 'USA'], [-64, -34, 'ARGENTINA'], [-1.5, 52.5, 'UK'], [30.8, 26.8, 'EGYPT'], [38.5, 35, 'SYRIA'], [90, 60, 'RUSSIA'], [78.96, 22.6, 'INDIA']], { tr: 'invert' }],
    // EVERY PLACE / EVERY PERSON
    [at(28), null, 'word', 'EVERY PLACE', 'dpan', { size: .14, tr: 'punch' }],
    [at(29), null, 'word', 'EVERY PLACE', 'bse_tower', { size: .14, tr: 'cut' }],
    [at(30), null, 'word', 'EVERY PLACE', 'glenpark', { size: .14, tr: 'cut' }],
    [at(31), null, 'word', 'EVERY PLACE', 'eagle2', { size: .14, tr: 'cut' }],
    [at(32), null, 'word', 'EVERY PERSON', 'armstrong', { size: .14, tr: 'punch' }],
    [at(33), null, 'word', 'EVERY PERSON', 'p_royal', { size: .14, tr: 'cut' }],
    [at(34), null, 'word', 'EVERY PERSON', 'sketch_a', { size: .14, tr: 'cut' }],
    [at(35), null, 'word', 'EVERY PERSON', 'eli', { size: .14, tr: 'cut' }],
    // PROMISE
    [at(36), null, 'word', 'BOTH SIDES', 'mars', { size: .17, tr: 'invert' }],
    [at(38), null, 'word', 'NO FILTERS', null, { size: .2, colors: ['#fff', DX.red], tr: 'punch' }],
    // CALL TO ACTION
    [at(40), null, 'cmts', ['The Titanic?', 'Area 51', 'Black holes', 'Harshad Mehta', 'The Pyramids'], { tr: 'tiles' }],
    [at(47), null, 'casefile', { tr: 'invert' }],
    [at(52), null, 'brand', { tr: 'punch' }],
  ];
  const B = buildBeats(rows);
  shot(0, (ctx, t) => { dseq(ctx, t, B); filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'trailer', lead: 0 });
  // trailer hits on the strongest beats (preview only; on Instagram the trending audio replaces this track)
  [1, 3, 5, 7, 20, 36, 38, 40, 47, 52].forEach(n => cue(at(n), n === 52 ? 'impact' : 'hit', .6));
  for (let i = 0; i < 12; i++) cue(at(8 + i), 'tick', .5);
  for (let i = 0; i < 7; i++) cue(at(20 + i) + .42, 'thud', .4);
  for (let i = 0; i < 5; i++) cue(at(41 + i), 'tick', .6);
  cue(at(48), 'stamp', .7);
}
