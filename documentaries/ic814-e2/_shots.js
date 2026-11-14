EP.images.sat_region = 'archives/user/sat_region.jpg'; EP.images.sat_world = 'archives/user/sat_w4k.jpg'; EP.sat = { world: 'sat_world', region: ['sat_region', 40, 45, 95, 15] };
brollCuts(['gren2', 'jaswant', 'vajpayee', 'tanker']);
npage('p1', { mast: 'The Daily File', dateline: 'NEW DELHI, SATURDAY, DECEMBER 25, 1999', head: 'Indian Jet Hijacked', sub: 'Flight IC 814 seized in the air after leaving Kathmandu', photo: 'a300_b', caption: 'An Indian Airlines Airbus A300 of the type that was hijacked.', side: ['190 on board', 'Fuel running low'] });
npage('p2', { mast: 'The Daily File', dateline: 'NEW DELHI, SUNDAY, DECEMBER 26, 1999', head: 'Five Armed Men Hold the Cabin', sub: 'Passengers told to keep their heads down', photo: 'cabin', caption: 'Inside an airliner cabin (representative picture).', side: ['Weapons, not tickets', 'Families wait'] });
npage('p3', { mast: 'The Daily File', dateline: 'NEW DELHI, SATURDAY, JANUARY 1, 2000', head: 'Hostages Home', sub: 'Three militants freed in Kandahar after seven days', photo: 'a300_c', caption: 'The week-long hijack ended on New Year\'s Eve.', side: ['The price of a deal', 'Questions for Delhi'] });
npage('p4', { mast: 'The Daily File', dateline: '26 YEARS LATER', head: 'Was It Worth It?', sub: 'A week that India is still paying for', photo: 'parl_bld', caption: 'Parliament House, New Delhi.', side: ['Lives saved', 'The file stays open'] });
const KTM = [85.36, 27.70], DEL = [77.10, 28.56], ATQ = [74.80, 31.71], LHE = [74.40, 31.52], DXB = [55.37, 25.03], KDH = [65.85, 31.51], BWP = [71.68, 29.39], PUL = [74.9, 33.87];
// VIDEO 2: cloud map + typewriter date + glowing border + aerial zoom + photo card intro (ref clip 3), then articles (clip 2) and maps
function scenes() {
  brollKinds(); brollPerson(); brollExtras(); refKit();
  const after = (id, d = .25) => LINE[id].end + d, S = id => LINE[id].start;
  const zin = S('E01') + 2.7, AR = [[KTM, ATQ, .25], [ATQ, LHE, -.9], [LHE, DXB, .22], [DXB, KDH, -.25]];
  const rows = [
    refMap('E01', null, { style: 'cloud', tr: 'cut', date: { text: '24. 12. 1999', at: .25, out: zin + .2 }, clouds: t => clamp(1 - (t - zin) / 1.2) * .95,
      views: [[0, { lon: 62, lat: 27, k: 6 }], [zin, { lon: 66, lat: 27, k: 7.5 }], [zin + 1.5, { lon: 84, lat: 28, k: 110 }]], glow: [{ c: 'Nepal', at: zin + .3 }] }),
    refMap('E01', 'Kathmandu', { style: 'grey', tr: 'cut', views: [[T('E01', 'Kathmandu') - .1, { lon: 84, lat: 28, k: 110 }], [LINE.E01.end, { lon: 81, lat: 28.2, k: 84 }]], glow: [{ c: 'Nepal', at: 0, tint: 'rgba(255,210,26,.12)' }],
      labels: [[84, 28.5, 'Nepal', 0, 'name'], [...KTM, 'Kathmandu', T('E01', 'Kathmandu')], [...DEL, 'Delhi', T('E01', 'Kathmandu') + .9]], routes: [{ pts: [KTM, DEL], at: T('E01', 'Kathmandu') + .5, d: 1.8, plane: 1, keep: 1, glow: 1 }] }),
    ['E02', null, 'scard', 'ktm_a', 'a300_b', 'flight ic 814', { corner: 1, tr: 'punch', fy: .6 }],
    ['E02', 'five', 'scard', 'cabin', 'cabin2', '5 armed men', { tr: 'cut', target: [.5, .62], targetAt: .5, cx: .27, z0: 1.2, z1: 1.5 }],
    ['E03', null, 'scard', 'cockpit', 'gauges', '40 minutes in', { tr: 'cut', corner: 1 }],
    ['E03', 'grenade.', 'fall', 'cabin', 'gren2', { text: 'HIJACKED', dark: .5, x: .72, y: .6, s: .5, tr: 'punch' }],
    ['E04', null, 'scard', 'atr_air', 'atr_term', 'amritsar, 7:01 pm', { tr: 'cut', corner: 1, path: [[1.05, .15], [.7, .32], [.42, .56], [.3, .62]], plane: 1, pathAt: .3, pathD: 2.2, z0: 1.15, z1: 1.3 }],
    ['E04', 'forty-five', 'clock', '7:45', 'the window closes', { bg: 'refuel', ampm: 'PM', tr: 'cut' }],
    ['E04', "doesn't.", 'full', 'a300_e', { z0: 1.1, z1: 1.3, tr: 'cut' }],
    refMap('E05', null, { style: 'grey', tr: 'punch', views: [[S('E05') - .2, { lon: 76, lat: 30, k: 70 }], [T('E05', 'Dubai.'), { lon: 67, lat: 28.5, k: 44 }], [T('E05', 'Kandahar,') + .8, { lon: 66, lat: 30, k: 56 }]],
      routes: [{ pts: [KTM, ATQ], arc: .25, at: 0, d: .1, dash: false, glow: 1, color: '#FF6A1A', w: 4 }, { pts: [ATQ, LHE], arc: -.9, at: T('E05', 'Lahore.') - .5, d: .6, dash: false, glow: 1, color: '#FF6A1A', w: 4, dot: 1 },
        { pts: [LHE, DXB], arc: .22, at: T('E05', 'Dubai.') - .7, d: 1.0, dash: false, glow: 1, color: '#FF6A1A', w: 4, dot: 1 }, { pts: [DXB, KDH], arc: -.25, at: T('E05', 'Kandahar,') - .9, d: 1.1, dash: false, glow: 1, color: '#FF6A1A', w: 4, plane: 1, keep: 1 }],
      glow: [{ c: 'Afghanistan', at: T('E05', 'Kandahar,'), tint: 'rgba(255,210,26,.1)' }], pulses: [[...KDH, T('E05', 'Kandahar,') + .2]],
      labels: [[...ATQ, 'Amritsar', 0], [...LHE, 'Lahore', T('E05', 'Lahore.')], [...DXB, 'Dubai', T('E05', 'Dubai.')], [...KDH, 'Kandahar', T('E05', 'Kandahar,')], [66, 34, 'Afghanistan', T('E05', 'Kandahar,') + .5, 'name']] }),
    ['E06', null, 'scard', 'kdh_term', 'tal_arms', 'kandahar airport', { tr: 'punch', corner: 1, target: [.62, .5], targetAt: 1.6, cardBw: true }],
    ['E06', 'After', 'article', 'India agrees to free three militants in exchange for the hostages', { hl: 'red', tag: 'DEC 31, 1999', source: 'Recreated headline', cut: 'tal_arms', ch: .46, tr: 'cut' }],
    ['E07', null, 'article', 'Foreign Minister Jaswant Singh flies the three men to Kandahar himself', { tag: 'DEC 31, 1999', source: 'Recreated headline', cut: 'jaswant', cutAt: .8, tr: 'cut' }],
    ['E07', 'hostages', 'scard', 'fw2000', 'a300_c', "home on new year's eve", { tr: 'cut' }],
    ['E08', null, 'quote', ['one of the three', '*Masood Azhar*'], { tr: 'cut' }],
    refMap('E08', 'starts', { style: 'grey', tr: 'cut', views: [[T('E08', 'starts') - .2, { lon: 70, lat: 30.5, k: 52 }]], glow: [{ c: 'Pakistan', at: T('E08', 'starts'), color: '#FF3B30', tint: 'rgba(255,40,40,.12)' }], pulses: [[...BWP, T('E08', 'starts') + .4]],
      labels: [[...BWP, 'Bahawalpur', T('E08', 'starts') + .5], [68.5, 27, 'Jaish-e-Mohammed', T('E08', 'Jaish-e-Mohammed.'), 'name']] }),
    refMap('E09', null, { style: 'grey', tr: 'cut', views: [[S('E09') - .2, { lon: 75, lat: 30.5, k: 62 }]], glow: [{ c: 'India', at: 0, tint: 'rgba(255,210,26,.08)' }],
      routes: [{ pts: [BWP, DEL], arc: -.3, at: T('E09', 'Parliament') - .6, d: .9, dash: false, glow: 1, color: '#FF3B30', w: 4, dot: 1 }, { pts: [BWP, PUL], arc: .3, at: T('E09', 'Pulwama') - .6, d: .9, dash: false, glow: 1, color: '#FF3B30', w: 4, dot: 1 }],
      pulses: [[...DEL, T('E09', 'Parliament') + .3], [...PUL, T('E09', 'Pulwama') + .3]], labels: [[...BWP, 'Bahawalpur', 0], [...DEL, 'Parliament attack, 2001', T('E09', 'Parliament') + .3], [...PUL, 'Pulwama, 2019', T('E09', 'Pulwama') + .3]] }),
    ['E10', null, 'quote', ['did India *save lives?*', 'or *pay* for 26 years?'], { tr: 'cut' }],
    ['E11', null, 'scard', 'kdh_term', 'a300_e', 'ic 814', { tr: 'cut', z0: 1.1, z1: 1.4 }],
    [after('E11', .35), null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, false) };
  const B = buildBeats(rows), ALL = TL.lines.map(l => l.id);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => { dseq(ctx, t, B); const c = capStyle(t); if (c) cap(ctx, t, ALL, { y: H * .86 });
    filmFinish(ctx, t, { grain: .1, vig: .35 }); }, { name: 'docx', lead: 0 });
  cue(T('E03', 'grenade.'), 'impact', .7); cue(T('E05', 'Kandahar,'), 'thud', .5); cue(T('E06', 'After'), 'stamp', .5); cue(T('E09', 'Parliament'), 'hit', .5); cue(T('E09', 'Pulwama'), 'hit', .5);
}
