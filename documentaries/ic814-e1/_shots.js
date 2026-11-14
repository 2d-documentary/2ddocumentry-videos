EP.images.sat_region = 'archives/user/sat_region.jpg'; EP.images.sat_world = 'archives/user/sat_w4k.jpg'; EP.sat = { world: 'sat_world', region: ['sat_region', 40, 45, 95, 15] };
brollCuts(['gren2', 'jaswant', 'vajpayee', 'tanker']);
npage('p1', { mast: 'The Daily File', dateline: 'NEW DELHI, SATURDAY, DECEMBER 25, 1999', head: 'Indian Jet Hijacked', sub: 'Flight IC 814 seized in the air after leaving Kathmandu', photo: 'a300_b', caption: 'An Indian Airlines Airbus A300 of the type that was hijacked.', side: ['190 on board', 'Fuel running low'] });
npage('p2', { mast: 'The Daily File', dateline: 'NEW DELHI, SUNDAY, DECEMBER 26, 1999', head: 'Five Armed Men Hold the Cabin', sub: 'Passengers told to keep their heads down', photo: 'cabin', caption: 'Inside an airliner cabin (representative picture).', side: ['Weapons, not tickets', 'Families wait'] });
npage('p3', { mast: 'The Daily File', dateline: 'NEW DELHI, SATURDAY, JANUARY 1, 2000', head: 'Hostages Home', sub: 'Three militants freed in Kandahar after seven days', photo: 'a300_c', caption: 'The week-long hijack ended on New Year\'s Eve.', side: ['The price of a deal', 'Questions for Delhi'] });
npage('p4', { mast: 'The Daily File', dateline: '26 YEARS LATER', head: 'Was It Worth It?', sub: 'A week that India is still paying for', photo: 'parl_bld', caption: 'Parliament House, New Delhi.', side: ['Lives saved', 'The file stays open'] });
const KTM = [85.36, 27.70], DEL = [77.10, 28.56], ATQ = [74.80, 31.71], LHE = [74.40, 31.52], DXB = [55.37, 25.03], KDH = [65.85, 31.51], BWP = [71.68, 29.39], PUL = [74.9, 33.87];
// VIDEO 1: newspaper fly-over intro (ref clip 1) + history-timeline cards + highlighted articles (clip 2) + maps (clips 4, 5)
function scenes() {
  brollKinds(); brollPerson(); brollExtras(); refKit();
  const after = (id, d = .25) => LINE[id].end + d, S = id => LINE[id].start;
  const rows = [
    ['E01', null, 'npage', 'p1', { tr: 'cut' }],
    ['E01', 'Kathmandu', 'nphoto', 'a300_b', { tr: 'leak', fx: .45 }],
    ['E02', null, 'npage', 'p2', { tr: 'leak', seed: 4, cam: [[0, { x: .3, y: .16, s: 2.6, r: .08 }], [1.4, { x: .5, y: .2, s: 1.3, r: .02 }], [2.8, { x: .36, y: .5, s: 2.0, r: -.04 }]] }],
    ['E02', 'five', 'nphoto', 'cabin', { tr: 'leak' }],
    ['E03', null, 'tcard', 'cockpit', '1999', 'FORTY MINUTES IN', 'Indian airspace, 5 pm', { bgs: ['cabin', 'a300_d'], tr: 'leak' }],
    ['E03', 'grenade.', 'fall', 'cabin', 'gren2', { text: 'HIJACKED', dark: .5, x: .72, y: .6, s: .5, tr: 'punch' }],
    ['E04', null, 'tcard', 'atr_term', '7:01 PM', 'AMRITSAR', 'The plane lands for fuel', { side: 'r', bgs: ['atr_b', 'refuel'], tr: 'leak' }],
    ['E04', 'forty-five', 'clock', '7:45', 'the window closes', { bg: 'atr_air', ampm: 'PM', tr: 'cut' }],
    ['E04', "doesn't.", 'nphoto', 'atr_air', { tr: 'leak' }],
    refMap('E05', null, { style: 'paper', tilt: 1, tr: 'leak', rhumb: [[60, 20]],
      views: [[S('E05') - .2, { lon: 74.5, lat: 35, k: 52 }], [T('E05', 'Dubai.'), { lon: 63, lat: 33, k: 32 }], [LINE.E05.end, { lon: 63, lat: 35, k: 38 }]],
      routes: [{ pts: [ATQ, LHE, DXB, KDH], at: S('E05'), d: LINE.E05.end - S('E05') - .6, plane: 1, keep: 1, clouds: 1, w: 14, color: '#E0A800', ease: false }],
      labels: [[...ATQ, 'Amritsar', -1], [...LHE, 'Lahore', -1], [...DXB, 'Dubai', -1], [...KDH, 'Kandahar', -1], [...DEL, 'Delhi', -1], [67, 24.9, 'Karachi', -1], [69.2, 34.5, 'Kabul', -1], [51.4, 35.7, 'Tehran', -1], [58.4, 23.6, 'Muscat', -1], [72.8, 19, 'Bombay', -1], [80, 23, 'India', -1], [57, 20, 'Arabian Sea', -1]] }),
    ['E06', null, 'article', 'Hijackers demand the release of 36 jailed militants and $200 million', { tag: 'DEC 27, 1999', cut: 'kdh_term', ch: .46, source: 'Recreated headline', body: 'The demands were passed to Indian negotiators at Kandahar airport, where Taliban fighters had surrounded the aircraft.', tr: 'cut' }],
    ['E06', 'After', 'quote', ['after seven days', 'India agrees to *three.*'], { tr: 'cut' }],
    refMap('E07', null, { style: 'sat', tr: 'cut', views: [[S('E07') - .2, { lon: 80, lat: 22, k: 26 }]], fill: [{ c: 'India', at: S('E07') }], faces: [{ key: 'jaswant', c: 'India', at: S('E07') + .5, h: .5, dy: 2 }], labels: [[79, 13.5, 'INDIA', S('E07') + 1.0, 'country']] }),
    refMap('E07', 'Kandahar', { style: 'sat', tr: 'cut', views: [[T('E07', 'Kandahar') - .2, { lon: 71, lat: 30, k: 60 }]], glow: [{ c: 'Afghanistan', at: T('E07', 'Kandahar') }], routes: [{ pts: [DEL, KDH], at: T('E07', 'Kandahar'), d: 1.6, plane: 1, keep: 1 }], labels: [[...DEL, 'Delhi', 0], [...KDH, 'Kandahar', T('E07', 'Kandahar') + 1.2]] }),
    ['E07', 'hostages', 'npage', 'p3', { tr: 'leak', seed: 2 }],
    ['E08', null, 'article', 'Freed militant Masood Azhar founds Jaish-e-Mohammed within weeks', { hl: 'red', tag: 'EARLY 2000', source: 'Recreated headline', cut: 'bwp', ch: .46, tr: 'cut' }],
    refMap('E08', 'Jaish-e-Mohammed.', { style: 'sat', tr: 'cut', views: [[T('E08', 'Jaish-e-Mohammed.') - .2, { lon: 70, lat: 30, k: 40 }]], glow: [{ c: 'Pakistan', at: T('E08', 'Jaish-e-Mohammed.'), color: '#FF3B30' }], pulses: [[...BWP, T('E08', 'Jaish-e-Mohammed.') + .3]], labels: [[...BWP, 'Bahawalpur', T('E08', 'Jaish-e-Mohammed.') + .4]] }),
    ['E09', null, 'tcard', 'parl_bld', '2001', 'PARLIAMENT ATTACK', '13 December 2001, New Delhi', { bgs: ['parl_a', 'nsg'], tr: 'leak' }],
    ['E09', 'Pulwama', 'tcard', 'candle', '2019', 'PULWAMA', '14 February 2019', { side: 'r', bgs: ['parl_b', 'nsg2'], tr: 'leak' }],
    ['E10', null, 'npage', 'p4', { tr: 'leak', seed: 7, cam: [[0, { x: .5, y: .2, s: 1.15, r: -.03 }], [5, { x: .5, y: .19, s: 1.7, r: .02 }]] }],
    ['E11', null, 'nphoto', 'a300_c', { tr: 'leak' }],
    [after('E11', .35), null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, false) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t);
    if (c) cap(ctx, t, ALL, c === 'dark' ? { y: H * .86, color: '#fff', box: 1 } : { y: H * .86 });
    filmFinish(ctx, t, { grain: .12, vig: .3 }); }, { name: 'docx', lead: 0 });
  cue(T('E03', 'grenade.'), 'impact', .7); cue(T('E06', 'After'), 'stamp', .5); cue(T('E09', 'Parliament'), 'hit', .5);
}
