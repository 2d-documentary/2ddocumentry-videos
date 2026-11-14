brollCuts(['gren', 'gren2', 'tanker']);
function scenes() {
  brollKinds();
  const GREY = { grey: 1 }, RED = { colors: [DX.red] };
  const after = (id, d = .25) => LINE[id].end + d;
  const chap = (id, n, title) => [LINE[id].start - 1.6, null, 'chap', n, title, { tr: 'invert', cap: 0 }];
  // geo (lon, lat)
  const KTM = [85.36, 27.70], DEL = [77.10, 28.56], ATQ = [74.80, 31.71], LHE = [74.40, 31.52], DXB = [55.37, 25.03], KDH = [65.85, 31.51],
    BWP = [71.68, 29.39], KHI = [67.01, 24.86], LON = [-0.12, 51.5];
  const REGION = { lon: 72, lat: 29, k: 9 }, WORLD = { lon: 60, lat: 20, k: 4.2 };
  // split screen: both sides of the story
  BEAT_KINDS.vs = { cap: 1, draw: (ctx, t, lt, t0, a, o) => {
    black(ctx); [[0, a[0], a[1]], [1, a[2], a[3]]].forEach(([s, k, tag]) => {
      ctx.save(); ctx.beginPath(); ctx.rect(s * W / 2, 0, W / 2, H); ctx.clip(); ctx.translate((s ? 1 : -1) * W / 4, 0);
      full(ctx, k, lt, { dark: .45, z0: 1.05, z1: 1.12 }); ctx.restore();
      headline(ctx, tag, W / 4 + s * W / 2, H * .2, t, t0 + .05 + s * .35, { size: MN() * .06, colors: s ? [DX.red] : undefined }); });
    ctx.fillStyle = DX.red; ctx.fillRect(W / 2 - 3, 0, 6, H * clamp((t - t0) / .4)); } };
  const rows = [
    // ---------------- cold open
    ['L001', null, 'clipx', 'c_wing', { off: .5 }],
    ['L001', 'December', 'head', '24 DECEMBER 1999', 'Kathmandu → Delhi', { bg: 'a300_b' }],
    ['L001', 'Kathmandu', 'full', 'ktm_a'],
    ['L001', 'normal', 'pol', 'a300_d'],
    ['L002', null, 'num', '176', 'passengers', { bg: 'cabin' }],
    ['L002', '15', 'num', '15', 'crew', { bg: 'cockpit' }],
    ['L002', 'paanch', 'num', '5', 'hijackers', { color: DX.red, bg: 'cabin2' }],
    ['L002', 'hathiyaar', 'fall', 'cabin', 'gren2', { text: 'HATHIYAAR', sub: 'ticket nahi', x: .72, y: .6, s: .5 }],
    ['L003', null, 'head', '7 DIN', '4 desh', { bg: 'a300_e' }],
    mapRow('L003', 'chaar', { views: [[T('L003', 'chaar') - .2, REGION]], routes: [[KTM, ATQ, T('L003', 'chaar'), .5], [ATQ, LHE, T('L003', 'chaar') + .45, .3], [LHE, DXB, T('L003', 'chaar') + .7, .5], [DXB, KDH, T('L003', 'chaar') + 1.1, .5]],
      pins: [[...KTM, 'KATHMANDU', T('L003', 'chaar')], [...ATQ, 'AMRITSAR', T('L003', 'chaar') + .45], [...LHE, 'LAHORE', T('L003', 'chaar') + .7], [...DXB, 'DUBAI', T('L003', 'chaar') + 1.1], [...KDH, 'KANDAHAR', T('L003', 'chaar') + 1.5]] }),
    ['L004', null, 'full', 'parl_bld', { dark: .2 }],
    ['L004', 'koi', 'head', 'JO KOI DESH', 'kabhi nahi karna chahta', { bg: 'parl_bld2' }],
    ['L005', null, 'num', '3', 'aatanki · azaad', { color: DX.red, bg: 'tal_herat' }],
    ['L005', 'plane', 'full', 'kdh_term', { dark: .25 }],
    ['L006', null, 'board', 'TEEN NAAM', 'ek ko poori duniya ne suna', ['tal_herat', 'kdh_road', 'pearl']],
    ['L006', 'End', 'head', 'END TAK RUKNA', '', { bg: 'kdh_term' }],
    ['D01', null, 'full', 'a300_a', { dark: .45, z0: 1.3, z1: 1.38, fy: .62 }],
    // ---------------- 1. the flight
    chap('L007', 1, 'FLIGHT IC 814'),
    mapRow('L007', null, { views: [[LINE.L007.start - .2, WORLD], [LINE.L007.start + 1.2, { lon: 82, lat: 28, k: 16 }]],
      pins: [[...KTM, 'KATHMANDU, NEPAL', T('L007', 'Kathmandu') + .3]], routes: [[KTM, DEL, T('L007', 'udti'), 1.2]] }),
    ['L007', 'Indian', 'clipx', 'c_take', { off: 4 }],
    ['L008', null, 'full', 'a300_f'],
    ['L008', 'Christmas', 'head', 'CHRISTMAS EVE', '', { bg: 'ktm_b' }],
    ['L008', 'log', 'full', 'cabin', { z0: 1.1, z1: 1.2 }],
    ['L009', null, 'head', 'HONEYMOON', 'couples', { bg: 'cabin2' }],
    ['L009', 'Sab', 'full', 'cabin', { z0: 1.3, z1: 1.4, fy: .6 }],
    ['L010', null, 'clipx', 'c_wing', { off: 2 }],
    ['L010', 'chaalis', 'num', '40 MIN', 'takeoff ke baad', { bg: 'cabin' }],
    ['L010', 'naqaabposh', 'head', 'NAQAABPOSH', '', { bg: 'cabin2', colors: [DX.red], dark: .75 }],
    ['L011', null, 'fall', 'cabin', 'gren2', { text: 'GRENADE', dark: .5, x: .72, y: .6, s: .5 }],
    ['L011', 'chaar', 'head', '+ 4 AUR', '', { bg: 'cabin', dark: .6 }],
    ['L012', null, 'full', 'cockpit', { z0: 1.05, z1: 1.2 }],
    ['L012', 'Lahore', 'head', 'LAHORE LE CHALO', '', { bg: 'cockpit2', colors: [DX.red] }],
    mapRow('L013', null, { views: [[LINE.L013.start - .2, { lon: 76, lat: 30.5, k: 30 }]], pins: [[...LHE, 'LAHORE: NO', T('L013', 'Lahore') + .2]] }),
    ['L013', 'fuel', 'alarm', 'gauges', 'FUEL LOW', ''],
    ['L014', null, 'full', 'cockpit', { dark: .2, fx: .3 }],
    mapRow('L014', 'Amritsar', { views: [[T('L014', 'Amritsar') - .2, { lon: 75.5, lat: 31, k: 40 }]], pins: [[...ATQ, 'AMRITSAR, INDIA', T('L014', 'Amritsar') + .3]] }),
    ['L015', null, 'head', 'SABSE BADA', 'mauka', { bg: 'atr_term' }],
    // ---------------- 2. amritsar
    chap('L016', 2, '45 MINUTES IN AMRITSAR'),
    ['L016', null, 'clipx', 'c_land', { off: 0 }],
    ['L016', 'saat', 'head', '7:01 PM', 'Amritsar', { bg: 'atr_term' }],
    ['L017', null, 'full', 'atr_b'],
    ['L017', 'rokna', 'head', 'BAS ROKNA THA', '', { bg: 'a300_e' }],
    ['L018', null, 'full', 'vajpayee2', { fy: .35 }],
    ['L018', 'Crisis', 'head', 'CRISIS MANAGEMENT', 'group', { bg: 'parl_bld' }],
    ['L018', 'faisla', 'head', 'FAISLA?', '', { colors: [DX.red], bg: 'parl_bld2', dark: .6 }],
    ['L019', null, 'full', 'nsg', { z0: 1.1, z1: 1.25 }],
    ['L019', 'commandos', 'head', 'NSG', 'commandos', { bg: 'nsg2' }],
    ['L019', 'der', 'clipx', 'c_del_land', { off: 0 }],
    ['L020', null, 'num', '00:45', 'ghadi chal rahi thi', { color: DX.red, bg: 'atr_term' }],
    ['L021', null, 'full', 'refuel'],
    ['L021', 'tanker', 'drive', 'atr_b', 'tanker', { text: 'FUEL TANKER', sub: 'plane ke aage', from: 'l', s: .3, y: .66 }],
    ['L022', null, 'full', 'refuel2', { z0: 1.2, z1: 1.35 }],
    ['L022', 'shak', 'head', 'SHAK', '', { colors: [DX.red], bg: 'refuel' }],
    ['L023', null, 'head', 'DHAMKI', '', { colors: [DX.red], bg: 'cabin', dark: .65 }],
    ['L023', 'Passengers', 'full', 'cabin', { dark: .5, z0: 1.3, z1: 1.45 }],
    ['L024', null, 'clipx', 'c_take', { off: 1.5 }],
    ['L024', 'Kareeb', 'num', '~45 MIN', 'aur plane gaya', { color: DX.red, bg: 'atr_air' }],
    ['L025', null, 'vs', 'vajpayee', 'SARKAAR', 'atr_term', 'CRITICS'],
    ['L026', null, 'head', 'SABSE BADI GALTI?', 'critics ke mutabik', { bg: 'atr_air' }],
    ['D02', null, 'full', 'atr_term', { dark: .5, z0: 1.2, z1: 1.3 }],
    // ---------------- 3. lahore, dubai
    chap('L027', 3, 'LAHORE, DUBAI'),
    mapRow('L027', null, { views: [[LINE.L027.start - .2, { lon: 75, lat: 31.4, k: 40 }]], routes: [[ATQ, LHE, LINE.L027.start, .8]], pins: [[...ATQ, 'AMRITSAR', -1], [...LHE, 'LAHORE, PAKISTAN', LINE.L027.start + .6]] }),
    ['L027', 'runway', 'full', 'lhr_a', { dark: .5 }],
    ['L028', null, 'alarm', 'gauges', 'FUEL ~0', ''],
    ['L028', 'Pakistan', 'full', 'lhr_b'],
    ['L028', 'fuel', 'full', 'refuel', { z0: 1.1, z1: 1.2 }],
    mapRow('L029', null, { views: [[LINE.L029.start - .2, { lon: 70, lat: 29, k: 10 }], [LINE.L029.start + 1.4, { lon: 60, lat: 27, k: 12 }]],
      routes: [[LHE, DXB, LINE.L029.start + .2, 1.4]], pins: [[...LHE, 'LAHORE', -1], [...DXB, 'AL MINHAD AIRBASE, UAE', T('L029', 'military') + .2]] }),
    ['L030', null, 'num', '27', 'passengers chhode gaye', { bg: 'cabin' }],
    ['L030', 'auratein', 'head', 'AURATEIN', 'aur bachche', { bg: 'cabin2' }],
    ['L031', null, 'head', 'RUPIN KATYAL', '', { dark: .85, bg: 'a300_e' }],
    ['L032', null, 'head', 'RUPIN KATYAL', 'honeymoon se laut rahe the', { dark: .85, bg: 'a300_e' }],
    // ---------------- 4. kandahar
    chap('L033', 4, 'KANDAHAR'),
    mapRow('L033', null, { views: [[LINE.L033.start - .2, { lon: 58, lat: 27, k: 12 }], [LINE.L033.start + 1.6, { lon: 65.5, lat: 31.3, k: 30 }]],
      routes: [[DXB, KDH, LINE.L033.start + .2, 1.4]], pins: [[...DXB, 'DUBAI', -1], [...KDH, 'KANDAHAR, AFGHANISTAN', T('L033', 'Kandahar') + .2]] }),
    ['L033', 'Kandahar', 'full', 'kdh_term', { tr: 'cut' }],
    ['L034', null, 'full', 'afg_map'],
    ['L034', 'Taliban', 'full', 'tal_herat'],
    ['L034', 'embassy', 'head', 'NO EMBASSY', '', { colors: [DX.red], bg: 'kdh_road' }],
    ['L035', null, 'full', 'tal_arms'],
    ['L035', 'Commando', 'head', 'COMMANDO OPERATION', 'khatam', { bg: 'nsg', dark: .65 }],
    ['L036', null, 'head', 'DEMANDS', '', { bg: 'kdh_term' }],
    ['L036', '36', 'num', '36', 'aatankiyon ki rihaai', { color: DX.red, bg: 'tal_herat' }],
    ['L036', '200', 'num', '$200 MILLION', 'cash', { color: DX.red, bg: 'cash' }],
    ['L037', null, 'head', '+ EK BODY', 'mare hue aatanki ki', { bg: 'kdh_road', dark: .65 }],
    ['L038', null, 'full', 'cabin', { dark: .55, z0: 1.3, z1: 1.45 }],
    ['L038', 'AC', 'head', 'AC BAND', 'toilets bhar chuke', { bg: 'cabin2' }],
    ['L039', null, 'head', 'CODE NAMES', '', { bg: 'cabin', dark: .7 }],
    ['L039', 'Chief,', 'board', 'CHIEF · DOCTOR · BURGER', 'Bhola · Shankar', ['cabin', 'cockpit', 'a300_d', 'kdh_term']],
    ['D03', null, 'head', 'BURGER', 'code name', { size: MN() * .16, bg: 'cabin2', dark: .6 }],
    ['L040', null, 'full', 'candle', { z0: 1.1, z1: 1.25 }],
    ['L040', 'pressure', 'head', 'PRESSURE', 'ghar walon ka', { bg: 'candle', colors: [DX.red], dark: .45, z0: 1.3 }],
    ['L041', null, 'head', '27 DECEMBER', 'team Kandahar pahunchti hai', { bg: 'kdh_term' }],
    ['L041', 'Ajit', 'dof', 'doval', 'Ajit Doval', { fx: .5, fy: .35, cx: .5, cy: .4, r: .3 }],
    // ---------------- 5. the deal
    chap('L042', 5, 'THE DEAL'),
    ['L042', null, 'full', 'kdh_term', { dark: .3 }],
    ['L043', null, 'num', '$200M', 'demand gayi', { bg: 'cash2', dark: .6 }],
    ['L043', 'Body', 'head', 'BODY', 'demand gayi', { bg: 'kdh_road', dark: .6 }],
    ['L043', '36', 'num', '36 → 3', '', { color: DX.red, bg: 'tal_herat' }],
    ['L044', null, 'head', 'MASOOD AZHAR', '#1', { size: MN() * .1, colors: [DX.red], bg: 'tal_herat', dark: .7 }],
    ['L045', null, 'head', 'OMAR SAEED SHEIKH', '#2', { size: MN() * .09, bg: 'kdh_road', dark: .7 }],
    mapRow('L045', 'London', { views: [[T('L045', 'London') - .2, { lon: 10, lat: 45, k: 6 }]], pins: [[...LON, 'LONDON, UK', T('L045', 'London') + .2]] }),
    ['L046', null, 'head', 'MUSHTAQ ZARGAR', '#3', { size: MN() * .1, bg: 'tal_arms', dark: .7 }],
    ['L047', null, 'head', '31 DECEMBER 1999', 'saal ka aakhri din', { bg: 'kdh_term' }],
    ['L048', null, 'dof', 'jaswant', 'Jaswant Singh', { fx: .5, fy: .35, cx: .5, cy: .4, r: .3 }],
    ['L048', 'teeno', 'full', 'a300_a', { z0: 1.3, z1: 1.38, fy: .62 }],
    ['L049', null, 'full', 'kdh_term', { z0: 1.3, z1: 1.45 }],
    ['L049', 'Hijackers', 'full', 'kdh_road'],
    ['L050', null, 'num', '7 DIN', 'baad', { bg: 'a300_c' }],
    ['L050', 'ghar', 'clipx', 'c_del_land', { off: 3 }],
    ['L050', 'Nayi', 'head', 'NEW YEAR\'S EVE', '1999 → 2000', { bg: 'fw2000' }],
    ['L051', null, 'vs', 'jaswant', 'SARKAAR', 'parl_b', 'CRITICS'],
    ['L052', null, 'head', 'KEEMAT', 'bahut bhaari', { colors: [DX.red], bg: 'parl_bld' }],
    ['D04', null, 'full', 'kdh_road', { dark: .5 }],
    // ---------------- 6. the price
    chap('L053', 6, 'THE PRICE'),
    ['L053', null, 'head', 'KEEMAT', '', { colors: [DX.red], bg: 'kdh_term' }],
    ['L054', null, 'head', 'JAISH E MOHAMMED', 'founded 2000', { size: MN() * .09, bg: 'tal_herat', dark: .65 }],
    ['L055', null, 'full', 'parl_bld'],
    ['L055', '2001', 'head', 'PARLIAMENT ATTACK', '13 December 2001', { bg: 'parl_a' }],
    ['L056', null, 'head', 'PATHANKOT', '2016', { bg: 'nsg2', dark: .6 }],
    ['L056', 'Pulwama,', 'head', 'PULWAMA', '2019', { colors: [DX.red], bg: 'candle' }],
    ['L057', null, 'full', 'unsc'],
    ['L057', 'global', 'head', 'GLOBAL TERRORIST', 'UN list · 2019', { colors: [DX.red], bg: 'unsc' }],
    ['L058', null, 'head', 'OMAR SHEIKH', '', { bg: 'kdh_road', dark: .65 }],
    ['L058', 'Daniel', 'dof', 'pearl', 'Daniel Pearl', { fx: .5, fy: .4, cx: .5, cy: .42, r: .3 }],
    ['L059', null, 'pol', 'pearl'],
    ['L060', null, 'full', 'pk_sc'],
    ['L060', 'bari', 'head', 'ACQUITTED', 'Pakistan Supreme Court · 2021', { colors: [DX.red], bg: 'pk_sc2' }],
    // ---------------- 7. the file is still open
    chap('L061', 7, 'THE FILE IS STILL OPEN'),
    ['L061', null, 'head', 'HIJACKERS?', '', { bg: 'kdh_road', dark: .6 }],
    mapRow('L062', null, { views: [[LINE.L062.start - .2, { lon: 67, lat: 26, k: 18 }]], pins: [[...KHI, 'KARACHI, PAKISTAN', T('L062', 'Karachi') + .2]] }),
    ['L062', 'Zahid', 'head', 'ZAHID AKHUND', 'March 2022', { bg: 'karachi' }],
    ['L063', null, 'head', 'ZAHOOR MISTRY', 'IC 814 hijacker (Indian officials)', { colors: [DX.red], bg: 'karachi', dark: .7 }],
    ['L064', null, 'head', 'NETFLIX SERIES', 'IC 814: The Kandahar Hijack · 2024', { bg: 'cabin2' }],
    ['L064', 'bawaal', 'head', 'BAWAAL', 'sarkaar ne Netflix ko bulaya', { bg: 'parl_bld2' }],
    ['L065', null, 'head', '7 MAY 2025', 'Operation Sindoor', { colors: [DX.red], bg: 'sindoor' }],
    ['L065', 'Indian', 'clipx', 'c_missile', { off: 0, z0: 1.35, z1: 1.4, fx: .6, fy: .65 }],
    mapRow('L065', 'Bahawalpur', { views: [[T('L065', 'Bahawalpur') - .3, { lon: 72, lat: 29.5, k: 24 }]], pins: [[...BWP, 'BAHAWALPUR, PAKISTAN', T('L065', 'Bahawalpur') + .2]] }),
    ['L065', 'girti', 'clipx', 'c_missile2', { off: 0 }],
    ['L066', null, 'full', 'sindoor2'],
    ['L066', 'Yusuf', 'head', 'YUSUF AZHAR', 'killed, according to Indian officials', { bg: 'bwp', dark: .65 }],
    ['L067', null, 'num', '26 SAAL', 'file abhi bhi open', { color: DX.red, bg: 'a300_b' }],
    ['L068', null, 'clipx', 'c_land2', { off: 0 }],
    ['L069', null, 'board', 'TEEN AADMI', 'saalon tak headlines', ['tal_herat', 'parl_a', 'pearl']],
    ['L070', null, 'head', 'SAHI KIYA?', '', { colors: [DX.red], bg: 'a300_b' }],
    ['D05', null, 'wall', ['a300_a', 'ktm_a', 'cockpit', 'atr_term', 'cabin', 'lhr_a', 'kdh_term', 'tal_herat', 'jaswant', 'vajpayee', 'doval', 'parl_a', 'nsg', 'kdh_road', 'refuel', 'a300_c', 'tal_arms', 'cash', 'pearl', 'unsc']],
    [after('D05', .4), null, 'end', { tr: 'invert', cap: 0 }],
  ];
  BEAT_KINDS.end = { cap: 0, draw: (ctx, t, lt, t0) => endCard(ctx, t, t0, false) };
  const CH = ['L007', 'L016', 'L027', 'L033', 'L042', 'L053', 'L061'];
  const YEARS = [['L007', 1999], ['L054', 2000], ['L055', 2001], ['L058', 2002], ['L060', 2021], ['L062', 2022], ['L064', 2024], ['L065', 2025], ['L067', 2026]]
    .map(([id, y]) => [LINE[id].start - (CH.includes(id) ? 1.6 : 0), y]);
  const tapeFrom = LINE.L007.start - 1.6, tapeTo = LINE.D05.end + .4;
  const B = buildBeats(rows);
  const ALL = TL.lines.filter(l => l.speaker !== 'DAGU').map(l => l.id).concat(BITE_IDS);
  const capStyle = t => { let i = B.length - 1; while (i > 0 && t < B[i].t0) i--; return B[i].cap; };
  shot(0, (ctx, t) => {
    dseq(ctx, t, B); const c = capStyle(t);
    if (c === 'bite') cap(ctx, t, BITE_IDS, { y: H * .82, size: MN() * .036, hold: .1 });
    else if (c) cap(ctx, t, ALL, c === 'dark' ? { color: '#111', shadow: false } : {});
    filmFinish(ctx, t, { grain: .1, vig: .4 });
    daguLayer(ctx, t);
    if (t > tapeFrom && t < tapeTo) yearTape(ctx, yearAt(YEARS, t), clamp((t - tapeFrom) / .4) * clamp((tapeTo - t) / .3));
  }, { name: 'docx', lead: 0 });
  CH.forEach(id => cue(LINE[id].start - 1.55, 'thud', .35));
  cue(T('L011', 'grenade'), 'impact', .7); cue(T('L036', '200'), 'cash', .6); cue(T('L043', '36'), 'stamp', .6);
  cue(T('L055', 'Parliament'), 'hit', .5); cue(T('L060', 'bari'), 'stamp', .6); cue(T('L065', 'Sindoor'), 'impact', .7);
}
