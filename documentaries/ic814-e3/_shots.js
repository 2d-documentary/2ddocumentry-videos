EP.images.sat_region = 'archives/user/sat_region.jpg'; EP.images.sat_world = 'archives/user/sat_w4k.jpg'; EP.sat = { world: 'sat_world', region: ['sat_region', 40, 45, 95, 15] };
brollCuts(['gren2', 'jaswant', 'vajpayee', 'tanker']);
npage('p1', { mast: 'The Daily File', dateline: 'NEW DELHI, SATURDAY, DECEMBER 25, 1999', head: 'Indian Jet Hijacked', sub: 'Flight IC 814 seized in the air after leaving Kathmandu', photo: 'a300_b', caption: 'An Indian Airlines Airbus A300 of the type that was hijacked.', side: ['190 on board', 'Fuel running low'] });
npage('p2', { mast: 'The Daily File', dateline: 'NEW DELHI, SUNDAY, DECEMBER 26, 1999', head: 'Five Armed Men Hold the Cabin', sub: 'Passengers told to keep their heads down', photo: 'cabin', caption: 'Inside an airliner cabin (representative picture).', side: ['Weapons, not tickets', 'Families wait'] });
npage('p3', { mast: 'The Daily File', dateline: 'NEW DELHI, SATURDAY, JANUARY 1, 2000', head: 'Hostages Home', sub: 'Three militants freed in Kandahar after seven days', photo: 'a300_c', caption: 'The week-long hijack ended on New Year\'s Eve.', side: ['The price of a deal', 'Questions for Delhi'] });
npage('p4', { mast: 'The Daily File', dateline: '26 YEARS LATER', head: 'Was It Worth It?', sub: 'A week that India is still paying for', photo: 'parl_bld', caption: 'Parliament House, New Delhi.', side: ['Lives saved', 'The file stays open'] });
const KTM = [85.36, 27.70], DEL = [77.10, 28.56], ATQ = [74.80, 31.71], LHE = [74.40, 31.52], DXB = [55.37, 25.03], KDH = [65.85, 31.51], BWP = [71.68, 29.39], PUL = [74.9, 33.87];
// VIDEO 3: the Dagar DOCX style mixed with all five references
function scenes() {
  brollKinds(); brollPerson(); brollExtras(); refKit();
  const after = (id, d = .25) => LINE[id].end + d, S = id => LINE[id].start, RED = { colors: [DX.red] };
  const rows = [
    ['E01', null, 'clipx', 'c_wing', { off: .5 }],
    ['E01', '24,', 'head', '24 DECEMBER 1999', 'Kathmandu → Delhi', { bg: 'a300_b', tr: 'punch' }],
    refMap('E01', 'Kathmandu', { style: 'cloud', tr: 'cut', clouds: t => clamp(1 - (t - T('E01', 'Kathmandu')) / .9) * .9, views: [[T('E01', 'Kathmandu') - .1, { lon: 75, lat: 27, k: 12 }], [T('E01', 'Kathmandu') + 1.2, { lon: 81.5, lat: 28, k: 90 }]],
      glow: [{ c: 'Nepal', at: T('E01', 'Kathmandu') + .5 }], labels: [[...KTM, 'Kathmandu', T('E01', 'Kathmandu') + .9], [...DEL, 'Delhi', T('E01', 'Kathmandu') + 1.5]], routes: [{ pts: [KTM, DEL], at: T('E01', 'Kathmandu') + 1.1, d: 1.5, plane: 1, keep: 1, glow: 1 }] }),
    ['E02', null, 'num', '190', 'people on board', { bg: 'cabin', tr: 'punch' }],
    ['E02', 'five', 'num', '5', 'hijackers', { color: DX.red, bg: 'cabin2', tr: 'cut' }],
    ['E02', 'weapons,', 'fall', 'cabin', 'gren2', { text: 'WEAPONS', sub: 'not tickets', x: .72, y: .6, s: .5, tr: 'cut' }],
    ['E03', null, 'full', 'cockpit', { z0: 1.05, z1: 1.2, tr: 'rgb' }],
    ['E03', 'masked', 'head', 'A MASKED MAN', '', { bg: 'cabin2', dark: .7, colors: [DX.red], tr: 'cut' }],
    ['E03', 'The', 'npage', 'p1', { tr: 'leak', cam: [[0, { x: .42, y: .2, s: 2.4, r: -.09 }], [1.2, { x: .5, y: .22, s: 1.3, r: -.02 }], [2.6, { x: .36, y: .5, s: 1.9, r: .04 }]] }],
    refMap('E04', null, { style: 'sat', tr: 'cut', views: [[S('E04') - .2, { lon: 80, lat: 22, k: 26 }], [S('E04') + 1.6, { lon: 77, lat: 29, k: 60 }]], fill: [{ c: 'India', at: S('E04') }], labels: [[79, 13.5, 'INDIA', S('E04') + .3, 'country'], [...ATQ, 'Amritsar', S('E04') + .9]], pulses: [[...ATQ, S('E04') + .9, '255,210,26']] }),
    ['E04', 'forty-five', 'clock', '7:45', '45 minutes to stop it', { bg: 'atr_term', ampm: 'PM', tr: 'punch' }],
    ['E04', "doesn't.", 'full', 'a300_e', { z0: 1.1, z1: 1.3, tr: 'cut' }],
    refMap('E05', null, { style: 'paper', tilt: 1, tr: 'leak', rhumb: [[60, 20]],
      views: [[S('E05') - .2, { lon: 74.5, lat: 35, k: 52 }], [T('E05', 'Dubai.'), { lon: 63, lat: 33, k: 32 }], [LINE.E05.end, { lon: 63, lat: 35, k: 38 }]],
      routes: [{ pts: [ATQ, LHE, DXB, KDH], at: S('E05'), d: LINE.E05.end - S('E05') - .6, plane: 1, keep: 1, clouds: 1, w: 14, color: '#E0A800', ease: false }],
      labels: [[...ATQ, 'Amritsar', -1], [...LHE, 'Lahore', -1], [...DXB, 'Dubai', -1], [...KDH, 'Kandahar', -1], [...DEL, 'Delhi', -1], [67, 24.9, 'Karachi', -1], [69.2, 34.5, 'Kabul', -1], [51.4, 35.7, 'Tehran', -1], [58.4, 23.6, 'Muscat', -1], [72.8, 19, 'Bombay', -1], [80, 23, 'India', -1], [57, 20, 'Arabian Sea', -1]] }),
    ['E06', null, 'article', 'Hijackers demand the release of 36 jailed militants and $200 million', { tag: 'DEC 27, 1999', source: 'Recreated headline', cut: 'kdh_term', ch: .46, tr: 'cut' }],
    ['E06', 'After', 'num', '36 → 3', 'after seven days', { color: DX.red, bg: 'tal_herat', tr: 'punch' }],
    ['E07', null, 'person', 'jaswant', 'Jaswant Singh', { tr: 'cut' }],
    ['E07', 'Kandahar', 'scard', 'kdh_term', 'a300_e', 'kandahar airport', { tr: 'punch', corner: 1 }],
    ['E07', 'hostages', 'tcard', 'a300_c', '31 DEC 1999', 'HOME', "New Year's Eve", { bgs: ['fw2000', 'atr_term'], tr: 'leak' }],
    ['E08', null, 'article', 'Freed militant Masood Azhar founds Jaish-e-Mohammed within weeks', { hl: 'red', tag: 'EARLY 2000', source: 'Recreated headline', cut: 'bwp', ch: .46, tr: 'cut' }],
    refMap('E08', 'Jaish-e-Mohammed.', { style: 'grey', tr: 'cut', views: [[T('E08', 'Jaish-e-Mohammed.') - .2, { lon: 70, lat: 30.5, k: 52 }]], glow: [{ c: 'Pakistan', at: T('E08', 'Jaish-e-Mohammed.'), color: '#FF3B30', tint: 'rgba(255,40,40,.12)' }], pulses: [[...BWP, T('E08', 'Jaish-e-Mohammed.') + .3]], labels: [[...BWP, 'Bahawalpur', T('E08', 'Jaish-e-Mohammed.') + .4]] }),
    ['E09', null, 'head', 'PARLIAMENT ATTACK', '13 December 2001', { bg: 'parl_a', tr: 'punch' }],
    ['E09', 'Pulwama', 'tcard', 'candle', '2019', 'PULWAMA', '14 February 2019', { side: 'r', bgs: ['parl_b', 'nsg2'], tr: 'leak' }],
    ['E10', null, 'head', "HERE'S THE QUESTION", '', { bg: 'parl_bld', tr: 'cut' }],
    ['E10', 'Did', 'quote', ['did India *save lives?*', 'or *pay* for 26 years?'], { tr: 'cut' }],
    ['E11', null, 'wall', ['a300_a', 'ktm_a', 'cockpit', 'atr_term', 'cabin', 'lhr_a', 'kdh_term', 'tal_herat', 'jaswant', 'vajpayee', 'parl_a', 'nsg', 'kdh_road', 'refuel', 'a300_c', 'tal_arms'], { tr: 'tiles' }],
    [after('E11', .35), null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, false) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id), DW = dateWindows(ALL, { y0: 1999 });
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  const WIPES = [S('E04') - .02, T('E07', 'Kandahar') - .04];
  shot(0, (ctx, t) => { dseq(ctx, t, B); cloudWipe(ctx, t, WIPES); const c = capStyle(t); if (c) cap(ctx, t, ALL, { y: H * .82 });
    filmFinish(ctx, t, { grain: .1, vig: .4 }); if (t < after('E11', .3)) dateTape(ctx, t, DW); }, { name: 'docx', lead: 0 });
  cue(T('E02', 'weapons,'), 'impact', .7); cue(T('E06', 'After'), 'stamp', .6); cue(T('E09', 'Parliament'), 'hit', .5);
}
